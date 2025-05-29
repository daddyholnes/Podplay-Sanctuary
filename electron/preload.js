const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');

// Inject custom CSS for Socket.IO and other app components
document.addEventListener('DOMContentLoaded', () => {
  try {
    const cssPath = path.join(__dirname, 'assets', 'custom.css');
    if (fs.existsSync(cssPath)) {
      const css = fs.readFileSync(cssPath, 'utf8');
      const style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);
      console.log('Custom CSS injected');
    }
  } catch (error) {
    console.error('Failed to inject custom CSS:', error);
  }
});

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getVersion: () => process.versions.electron,
  getPlatform: () => process.platform,
  
  // Window controls
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  
  // App controls
  reload: () => ipcRenderer.invoke('app-reload'),
  quit: () => ipcRenderer.invoke('app-quit'),
  
  // Docker controls
  startDocker: () => ipcRenderer.invoke('docker-start'),
  stopDocker: () => ipcRenderer.invoke('docker-stop'),
  getDockerStatus: () => ipcRenderer.invoke('docker-status'),
  
  // Settings
  getSetting: (key) => ipcRenderer.invoke('settings-get', key),
  setSetting: (key, value) => ipcRenderer.invoke('settings-set', key, value),
  
  // File operations
  openFile: () => ipcRenderer.invoke('dialog-open-file'),
  saveFile: (data) => ipcRenderer.invoke('dialog-save-file', data),
  
  // External links
  openExternal: (url) => ipcRenderer.invoke('shell-open-external', url),
  
  // Event listeners
  onAppUpdate: (callback) => ipcRenderer.on('app-update', callback),
  onDockerStatus: (callback) => ipcRenderer.on('docker-status', callback),
    // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // Socket.IO connection helpers
  socketConnect: (url, options) => ipcRenderer.invoke('socket-connect', url, options),
  socketDisconnect: (id) => ipcRenderer.invoke('socket-disconnect', id),
  socketStatus: () => ipcRenderer.invoke('socket-status'),
  onSocketStatus: (callback) => ipcRenderer.on('socket-status-update', callback)
});

// Expose development tools in dev mode
if (process.env.NODE_ENV === 'development') {
  contextBridge.exposeInMainWorld('electronDev', {
    openDevTools: () => ipcRenderer.invoke('dev-tools-open'),
    closeDevTools: () => ipcRenderer.invoke('dev-tools-close'),
    toggleDevTools: () => ipcRenderer.invoke('dev-tools-toggle')
  });
}

// Log that preload script has loaded
console.log('Electron preload script loaded successfully');
