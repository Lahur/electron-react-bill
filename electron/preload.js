const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  openBankStatementFiles: () => ipcRenderer.invoke('dialog:open-bank-statement-files'),
  openOrderDocument: () => ipcRenderer.invoke('dialog:open-order-document'),
  auth: {
    login: () => ipcRenderer.invoke('auth:login'),
    logout: () => ipcRenderer.invoke('auth:logout'),
    getToken: () => ipcRenderer.invoke('auth:get-token'),
  },
});