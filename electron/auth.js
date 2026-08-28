const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { app, BrowserWindow, session: electronSession, safeStorage } = require('electron');
const axios = require('axios');
const Sentry = require('@sentry/electron/main');

const REDIRECT_URI = 'electron-react-bill://callback';
// offline_access asks Keycloak for a long-lived refresh token that survives the
// SSO idle timeout, so a persisted session can be resumed days later.
const SCOPE = 'openid profile email offline_access';

// Encrypted-at-rest store for the refresh token so a session survives an app
// restart. safeStorage keys off the OS keychain / DPAPI, so the file is only
// decryptable by this user on this machine.
const TOKEN_STORE_FILENAME = 'auth-session.bin';

// Refresh the access token this many ms before it actually expires so an
// in-flight request never leaves with a token that dies mid-flight.
const EXPIRY_SKEW_MS = 30_000;

function base64url(buffer) {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeIdToken(idToken) {
  const payload = idToken.split('.')[1];
  const json = Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
  return JSON.parse(json);
}

function createAuthManager({ getParentWindow, onSessionExpired }) {
  const keycloakUrl = process.env.VITE_KEYCLOAK_URL;
  const realm = process.env.VITE_KEYCLOAK_REALM;
  const clientId = process.env.VITE_KEYCLOAK_CLIENT_ID;
  const issuer = `${keycloakUrl}/realms/${realm}/protocol/openid-connect`;

  // Access token + user live in memory; the refresh token is also mirrored to an
  // encrypted file (see persistSession) so a session resumes after a restart.
  let session = null;

  const tokenStorePath = path.join(app.getPath('userData'), TOKEN_STORE_FILENAME);

  function persistSession() {
    try {
      if (!session?.refreshToken || !safeStorage.isEncryptionAvailable()) return;
      const payload = JSON.stringify({
        refreshToken: session.refreshToken,
        user: session.user,
      });
      fs.writeFileSync(tokenStorePath, safeStorage.encryptString(payload));
    } catch (error) {
      Sentry.captureException(error, {
        level: 'warning',
        mechanism: { type: 'auth.persist', handled: true },
      });
    }
  }

  function clearPersistedSession() {
    try {
      fs.rmSync(tokenStorePath, { force: true });
    } catch {
      // best-effort
    }
  }

  function loadPersistedSession() {
    try {
      if (!safeStorage.isEncryptionAvailable() || !fs.existsSync(tokenStorePath)) return null;
      const decrypted = safeStorage.decryptString(fs.readFileSync(tokenStorePath));
      return JSON.parse(decrypted);
    } catch (error) {
      // Corrupt or undecryptable (e.g. OS keychain changed) — drop it.
      clearPersistedSession();
      Sentry.captureException(error, {
        level: 'warning',
        mechanism: { type: 'auth.restore', handled: true },
      });
      return null;
    }
  }

  // Holds the in-flight token refresh so racing callers share it (see
  // refreshAccessTokenOnce).
  let refreshPromise = null;

  function applyTokenResponse(data) {
    const {
      access_token: accessToken,
      id_token: idToken,
      refresh_token: refreshToken,
      expires_in: expiresIn,
      refresh_expires_in: refreshExpiresIn,
    } = data;

    // A refresh response omits id_token; keep the user from the existing session.
    let user = session?.user ?? null;
    if (idToken) {
      const claims = decodeIdToken(idToken);
      user = { name: claims.name, email: claims.email, picture: claims.picture };
    }

    session = {
      accessToken,
      expiresAt: Date.now() + expiresIn * 1000,
      refreshToken: refreshToken ?? session?.refreshToken ?? null,
      // 0 / missing means "no explicit expiry" — treat the refresh token as
      // long-lived and let a failed refresh be the thing that ends the session.
      refreshExpiresAt: refreshExpiresIn ? Date.now() + refreshExpiresIn * 1000 : Infinity,
      user,
    };

    persistSession();

    return session;
  }

  // Wraps refreshAccessToken so callers that race in at the same moment share a
  // single token request instead of each spending the (rotated) refresh token.
  function refreshAccessTokenOnce() {
    refreshPromise =
      refreshPromise ??
      refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    return refreshPromise;
  }

  async function refreshAccessToken() {
    if (!session?.refreshToken || Date.now() >= session.refreshExpiresAt) {
      return null;
    }

    try {
      const response = await axios.post(
        `${issuer}/token`,
        new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: clientId,
          refresh_token: session.refreshToken,
        }),
      );
      return applyTokenResponse(response.data);
    } catch (error) {
      // The refresh token is expired, revoked, or the SSO session is gone —
      // nothing left to do but force a fresh login.
      session = null;
      clearPersistedSession();
      Sentry.captureException(error, {
        level: 'warning',
        mechanism: { type: 'auth.refresh', handled: true },
      });
      return null;
    }
  }

  // Resume a session persisted from a previous run by exchanging the stored
  // refresh token for a fresh access token. Returns the user on success, or
  // null (falling through to interactive login) if there is nothing to resume
  // or the stored token is no longer valid.
  async function restoreSession() {
    const persisted = loadPersistedSession();
    if (!persisted?.refreshToken) return null;

    session = {
      accessToken: null,
      expiresAt: 0,
      refreshToken: persisted.refreshToken,
      refreshExpiresAt: Infinity,
      user: persisted.user ?? null,
    };

    const refreshed = await refreshAccessTokenOnce();
    return refreshed ? refreshed.user : null;
  }

  function interactiveLogin() {
    return new Promise((resolve, reject) => {
      const codeVerifier = base64url(crypto.randomBytes(32));
      const codeChallenge = base64url(crypto.createHash('sha256').update(codeVerifier).digest());
      const state = base64url(crypto.randomBytes(16));

      const authorizeUrl = new URL(`${issuer}/auth`);
      authorizeUrl.searchParams.set('response_type', 'code');
      authorizeUrl.searchParams.set('client_id', clientId);
      authorizeUrl.searchParams.set('redirect_uri', REDIRECT_URI);
      authorizeUrl.searchParams.set('scope', SCOPE);
      authorizeUrl.searchParams.set('code_challenge', codeChallenge);
      authorizeUrl.searchParams.set('code_challenge_method', 'S256');
      authorizeUrl.searchParams.set('state', state);

      const parent = getParentWindow();
      const authWindow = new BrowserWindow({
        width: 480,
        height: 720,
        parent: parent || undefined,
        modal: Boolean(parent),
        autoHideMenuBar: true,
        webPreferences: {
          contextIsolation: true,
          nodeIntegration: false,
        },
      });

      let settled = false;

      function settle(result, error) {
        if (settled) return;
        settled = true;
        authWindow.removeListener('closed', onClosed);
        if (!authWindow.isDestroyed()) {
          authWindow.close();
        }
        if (error) reject(error);
        else resolve(result);
      }

      function onClosed() {
        settle(null, new Error('Login window closed before completing sign-in'));
      }

      async function handleCallbackUrl(url) {
        try {
          const callbackUrl = new URL(url);
          const authError =
            callbackUrl.searchParams.get('error_description') || callbackUrl.searchParams.get('error');
          if (authError) {
            throw new Error(authError);
          }

          const code = callbackUrl.searchParams.get('code');
          const returnedState = callbackUrl.searchParams.get('state');
          if (!code || returnedState !== state) {
            throw new Error('Invalid login callback');
          }

          const response = await axios.post(
            `${issuer}/token`,
            new URLSearchParams({
              grant_type: 'authorization_code',
              client_id: clientId,
              code_verifier: codeVerifier,
              code,
              redirect_uri: REDIRECT_URI,
            }),
          );

          applyTokenResponse(response.data);

          settle(session.user);
        } catch (error) {
          session = null;
          settle(null, error instanceof Error ? error : new Error('Login failed'));
        }
      }

      // Electron can fire both `will-redirect` and `will-navigate` for the same
      // redirect to an unregistered custom scheme like electron-react-bill://,
      // so guard against handling the callback (and exchanging the one-time
      // authorization code) more than once.
      let callbackHandled = false;

      function onRedirect(event, url) {
        if (url.startsWith(REDIRECT_URI)) {
          event.preventDefault();
          if (callbackHandled) return;
          callbackHandled = true;
          handleCallbackUrl(url);
        }
      }

      authWindow.webContents.on('will-redirect', onRedirect);
      authWindow.webContents.on('will-navigate', onRedirect);
      authWindow.on('closed', onClosed);

      authWindow.loadURL(authorizeUrl.toString());
    });
  }

  // Resume a persisted session if possible, otherwise open the Keycloak window.
  async function login() {
    if (session) {
      return session.user;
    }
    const restoredUser = await restoreSession();
    if (restoredUser) {
      return restoredUser;
    }
    return interactiveLogin();
  }

  async function getToken() {
    if (!session) {
      throw new Error('Not authenticated');
    }

    if (Date.now() < session.expiresAt - EXPIRY_SKEW_MS) {
      return session.accessToken;
    }

    // Access token expired (or about to) — refresh, sharing one request across
    // any callers that raced in here at the same time.
    const refreshed = await refreshAccessTokenOnce();

    if (!refreshed) {
      // Session is already cleared by refreshAccessToken on failure.
      onSessionExpired?.();
      throw new Error('Not authenticated');
    }

    return refreshed.accessToken;
  }

  async function logout() {
    const refreshToken = session?.refreshToken;
    session = null;
    clearPersistedSession();

    // End the Keycloak session server-side too, otherwise the refresh token
    // stays valid until it expires on its own.
    if (refreshToken) {
      try {
        await axios.post(
          `${issuer}/logout`,
          new URLSearchParams({ client_id: clientId, refresh_token: refreshToken }),
        );
      } catch (error) {
        Sentry.captureException(error, {
          level: 'warning',
          mechanism: { type: 'auth.logout', handled: true },
        });
      }
    }

    // login() runs in Electron's persistent default session, so Keycloak's SSO
    // cookie survives a plain in-memory logout and silently re-authenticates
    // the next login() call. Remove it so the next login shows the real form.
    try {
      const cookieDomain = new URL(keycloakUrl).hostname;
      const cookies = await electronSession.defaultSession.cookies.get({ domain: cookieDomain });
      await Promise.all(
        cookies.map((cookie) =>
          electronSession.defaultSession.cookies.remove(
            `http${cookie.secure ? 's' : ''}://${cookie.domain.replace(/^\./, '')}${cookie.path}`,
            cookie.name,
          ),
        ),
      );
    } catch (error) {
      // best-effort cookie clear
      Sentry.captureException(error, {
        level: 'warning',
        mechanism: { type: 'auth.logout', handled: true },
      });
    }
  }

  return { login, logout, getToken };
}

module.exports = { createAuthManager };