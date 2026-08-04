const crypto = require('crypto');
const { BrowserWindow } = require('electron');
const axios = require('axios');

const REDIRECT_URI = 'electron-react-bill://callback';
const SCOPE = 'openid profile email';

function base64url(buffer) {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeIdToken(idToken) {
  const payload = idToken.split('.')[1];
  const json = Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
  return JSON.parse(json);
}

function createAuthManager({ getParentWindow }) {
  const domain = process.env.VITE_AUTH0_DOMAIN;
  const clientId = process.env.VITE_AUTH0_CLIENT_ID;
  const audience = process.env.VITE_AUTH0_AUDIENCE;

  // Tokens are kept in memory only and are gone on quit — every launch requires a fresh login.
  let session = null;

  function login() {
    return new Promise((resolve, reject) => {
      const codeVerifier = base64url(crypto.randomBytes(32));
      const codeChallenge = base64url(crypto.createHash('sha256').update(codeVerifier).digest());
      const state = base64url(crypto.randomBytes(16));

      const authorizeUrl = new URL(`https://${domain}/authorize`);
      authorizeUrl.searchParams.set('response_type', 'code');
      authorizeUrl.searchParams.set('client_id', clientId);
      authorizeUrl.searchParams.set('redirect_uri', REDIRECT_URI);
      authorizeUrl.searchParams.set('scope', SCOPE);
      authorizeUrl.searchParams.set('audience', audience);
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

          const response = await axios.post(`https://${domain}/oauth/token`, {
            grant_type: 'authorization_code',
            client_id: clientId,
            code_verifier: codeVerifier,
            code,
            redirect_uri: REDIRECT_URI,
          });

          const { access_token: accessToken, id_token: idToken, expires_in: expiresIn } = response.data;
          const claims = decodeIdToken(idToken);

          session = {
            accessToken,
            expiresAt: Date.now() + expiresIn * 1000,
            user: { name: claims.name, email: claims.email, picture: claims.picture },
          };

          settle(session.user);
        } catch (error) {
          session = null;
          settle(null, error instanceof Error ? error : new Error('Login failed'));
        }
      }

      function onRedirect(event, url) {
        if (url.startsWith(REDIRECT_URI)) {
          event.preventDefault();
          handleCallbackUrl(url);
        }
      }

      authWindow.webContents.on('will-redirect', onRedirect);
      authWindow.webContents.on('will-navigate', onRedirect);
      authWindow.on('closed', onClosed);

      authWindow.loadURL(authorizeUrl.toString());
    });
  }

  async function getToken() {
    if (!session || Date.now() >= session.expiresAt) {
      throw new Error('Not authenticated');
    }
    return session.accessToken;
  }

  function logout() {
    session = null;
  }

  return { login, logout, getToken };
}

module.exports = { createAuthManager };