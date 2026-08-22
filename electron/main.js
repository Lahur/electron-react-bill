const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs/promises');
const { createAuthManager } = require('./auth');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const isDev = !app.isPackaged;
const apiBaseUrl = process.env.VITE_API_BASE_URL;

let mainWindow;

// Login opens in an in-app BrowserWindow rather than the system browser; the
// redirect to electron-react-bill://callback is intercepted before it ever
// navigates anywhere, so no OS-level protocol registration is needed.
const authManager = createAuthManager({ getParentWindow: () => mainWindow });

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, '../build/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
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
        // must be named explicitly or the preflight still fails.
        'Access-Control-Allow-Headers': ['Content-Type, Authorization'],
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

ipcMain.handle('auth:login', () => authManager.login());
ipcMain.handle('auth:logout', () => authManager.logout());
ipcMain.handle('auth:get-token', () => authManager.getToken());

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

ipcMain.handle('dialog:open-bank-statement-files', async () => {
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

ipcMain.handle('dialog:open-order-document', async () => {
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

ipcMain.handle('dialog:open-pos-transaction-bill', async () => {
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

ipcMain.handle('dialog:open-accounts-statement-bill', async () => {
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

app.whenReady().then(createWindow);

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