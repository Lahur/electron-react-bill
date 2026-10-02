const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs/promises');
const { existsSync } = require('fs');
const Sentry = require('@sentry/electron/main');
const { autoUpdater } = require('electron-updater');
const { createAuthManager } = require('./auth');

Sentry.init({
  dsn: 'https://3ba4c0f6c910f9af7cb63951262803b0@o4511728439197696.ingest.de.sentry.io/4511987834028112',
  // Uncaught exceptions, unhandled rejections and native crashes (main +
  // renderer) are captured automatically. Handled errors thrown inside IPC
  // handlers are forwarded by the `handle()` wrapper below.
  ignoreErrors: [
    // User closed the Keycloak popup / cancelled sign-in - not a fault.
    'Login window closed before completing sign-in',
  ],
});

// Wrap ipcMain.handle so any error thrown by a handler is reported to Sentry
// before it is rejected back to the renderer (where a catch block may swallow
// it silently).
function handle(channel, listener) {
  ipcMain.handle(channel, async (event, ...args) => {
    try {
      return await listener(event, ...args);
    } catch (error) {
      Sentry.captureException(error, {
        mechanism: { type: 'ipc.handle', handled: true },
        tags: { source: 'ipc', channel },
      });
      throw error;
    }
  });
}

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const isDev = !app.isPackaged;
const apiBaseUrl = process.env.VITE_API_BASE_URL;

// On Linux electron-updater self-updates an AppImage (APPIMAGE is set only when
// launched as one) and, via dpkg/rpm + a pkexec prompt, a deb/rpm install —
// electron-builder drops a `package-type` marker into those packages. A binary
// run straight from an extracted archive (or dev) has neither and can't update.
function linuxUpdaterSupported() {
  if (process.env.APPIMAGE) {
    return true;
  }
  try {
    return existsSync(path.join(process.resourcesPath, 'package-type'));
  } catch {
    return false;
  }
}

const canAutoUpdate =
  !isDev &&
  (process.platform === 'win32' ||
    (process.platform === 'linux' && linuxUpdaterSupported()));

let mainWindow;
let updateDownloaded = false;

function reportUpdaterError(error) {
  Sentry.captureException(error, {
    mechanism: { type: 'auto-updater', handled: true },
    tags: { source: 'auto-updater' },
  });
}

function checkForUpdates() {
  return autoUpdater.checkForUpdates().catch((error) => {
    reportUpdaterError(error);
    return null;
  });
}

function setupAutoUpdater() {
  if (!canAutoUpdate) {
    return;
  }

  autoUpdater.autoDownload = true;
  // If the user dismisses the restart prompt, still apply the update on quit.
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('error', reportUpdaterError);

  autoUpdater.on('update-downloaded', async ({ version }) => {
    updateDownloaded = true;

    if (!mainWindow || mainWindow.isDestroyed()) {
      return;
    }

    const { response } = await dialog.showMessageBox(mainWindow, {
      type: 'info',
      buttons: ['Ponovno pokreni sada', 'Kasnije'],
      defaultId: 0,
      cancelId: 1,
      title: 'Ažuriranje spremno',
      message: `Preuzeta je nova verzija (${version}).`,
      detail: 'Ponovno pokrenite aplikaciju da biste dovršili ažuriranje.',
    });

    if (response === 0) {
      // isForceRunAfter: relaunch once installed (deb/rpm won't otherwise).
      autoUpdater.quitAndInstall(false, true);
    }
  });

  checkForUpdates();
  // This app can stay open for days; re-check periodically so a long-running
  // session still picks up releases.
  setInterval(checkForUpdates, 6 * 60 * 60 * 1000);
}

// Login opens in an in-app BrowserWindow rather than the system browser; the
// redirect to electron-react-bill://callback is intercepted before it ever
// navigates anywhere, so no OS-level protocol registration is needed.
const authManager = createAuthManager({
  getParentWindow: () => mainWindow,
  // A refresh attempt failed and the session is gone — tell the renderer so it
  // can drop back to the login screen instead of firing doomed API requests.
  onSessionExpired: () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('auth:session-expired');
    }
  },
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, '../build/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      // preload.js loads @sentry/electron/preload, which a sandboxed preload
      // cannot require. The app already runs unsandboxed elsewhere
      // (--no-sandbox in the dev script and the Linux build), so make it
      // explicit and consistent here.
      sandbox: false,
    },
  });

  const apiFilter = { urls: [`${apiBaseUrl}/*`] };

  mainWindow.webContents.session.webRequest.onBeforeSendHeaders(apiFilter, (details, callback) => {
    callback({ requestHeaders: { Origin: '*', ...details.requestHeaders } });
  });

  mainWindow.webContents.session.webRequest.onHeadersReceived(apiFilter, (details, callback) => {
    const isPreflight = details.method === 'OPTIONS';

    callback({
      // A CORS preflight must get a 2xx status or Chromium blocks the real
      // request; Spring Security 401s the OPTIONS request itself since it
      // never carries the Authorization header, so fake a 200 for it here.
      statusLine: isPreflight ? 'HTTP/1.1 200 OK' : details.statusLine,
      responseHeaders: {
        'Access-Control-Allow-Origin': ['*'],
        'Access-Control-Allow-Methods': ['GET, POST, PUT, PATCH, DELETE, OPTIONS'],
        // Wildcard here does NOT cover Authorization per the fetch spec, it
        // must be named explicitly or the preflight still fails. X-Tenant-Id is
        // the custom tenant header httpClient.ts adds to every request.
        'Access-Control-Allow-Headers': ['Content-Type, Authorization, X-Tenant-Id'],
        ...details.responseHeaders,
      },
    });
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

handle('auth:login', () => authManager.login());
handle('auth:logout', () => authManager.logout());
handle('auth:get-token', () => authManager.getToken());

// Manual "check for updates" trigger for the renderer. The download (if any)
// runs in the background and surfaces its own restart prompt when ready.
handle('updates:check', async () => {
  const currentVersion = app.getVersion();

  if (!canAutoUpdate) {
    return { supported: false, currentVersion, updateAvailable: false, updateDownloaded };
  }

  const result = await checkForUpdates();

  return {
    supported: true,
    currentVersion,
    updateAvailable: result?.isUpdateAvailable ?? false,
    availableVersion: result?.updateInfo?.version ?? null,
    updateDownloaded,
  };
});

// showOpenDialog is modal to its parent window. If a second dialog is
// requested while one is still open (e.g. two "select file" buttons clicked
// in quick succession), it races the first and can silently fail to appear.
// Queue all dialog requests so only one is ever open at a time.
let dialogQueue = Promise.resolve();

function showExclusiveOpenDialog(options) {
  const run = dialogQueue.then(() => dialog.showOpenDialog(mainWindow, options));
  dialogQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

handle('dialog:open-bank-statement-files', async () => {
  const { canceled, filePaths } = await showExclusiveOpenDialog({
    title: 'Odaberite bankovne izvode',
    filters: [{ name: 'Bankovni izvodi (camt.053)', extensions: ['xml', 'zip'] }],
    properties: ['openFile', 'multiSelections'],
  });

  if (canceled) {
    return [];
  }

  return Promise.all(
    filePaths.map(async (filePath) => ({
      name: path.basename(filePath),
      data: await fs.readFile(filePath),
    })),
  );
});

handle('dialog:open-order-document', async () => {
  const { canceled, filePaths } = await showExclusiveOpenDialog({
    title: 'Odaberite dokument narudžbe',
    properties: ['openFile'],
  });

  if (canceled || filePaths.length === 0) {
    return null;
  }

  const filePath = filePaths[0];
  return {
    name: path.basename(filePath),
    data: await fs.readFile(filePath),
  };
});

handle('dialog:open-pos-transaction-bill', async () => {
  const { canceled, filePaths } = await showExclusiveOpenDialog({
    title: 'Odaberite račun za POS transakciju',
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
    properties: ['openFile'],
  });

  if (canceled || filePaths.length === 0) {
    return null;
  }

  const filePath = filePaths[0];
  return {
    name: path.basename(filePath),
    data: await fs.readFile(filePath),
  };
});

handle('dialog:open-accounts-statement-bill', async () => {
  const { canceled, filePaths } = await showExclusiveOpenDialog({
    title: 'Odaberite račun za blagajnički izvještaj',
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
    properties: ['openFile'],
  });

  if (canceled || filePaths.length === 0) {
    return null;
  }

  const filePath = filePaths[0];
  return {
    name: path.basename(filePath),
    data: await fs.readFile(filePath),
  };
});

app.whenReady().then(() => {
  createWindow();
  setupAutoUpdater();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});