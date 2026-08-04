const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  openBankStatementFiles: () => ipcRenderer.invoke('dialog:open-bank-statement-files'),
  openOrderDocument: () => ipcRenderer.invoke('dialog:open-order-document'),
});