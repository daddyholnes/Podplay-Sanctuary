const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // App info
    getAppInfo: () => ipcRenderer.invoke('get-app-info'),
    
    // Backend management
    restartBackend: () => ipcRenderer.invoke('restart-backend'),
    checkBackendStatus: () => ipcRenderer.invoke('check-backend-status'),
    
    // External links
    openExternal: (url) => ipcRenderer.invoke('open-external', url),
    
    // Settings
    getSetting: (key, defaultValue) => ipcRenderer.invoke('get-setting', key, defaultValue),
    setSetting: (key, value) => ipcRenderer.invoke('set-setting', key, value),
    
    // File operations
    onFileSelected: (callback) => ipcRenderer.on('file-selected', callback),
    
    // Notifications
    onShowNotification: (callback) => ipcRenderer.on('show-notification', callback),
    
    // Settings
    onShowSettings: (callback) => ipcRenderer.on('show-settings', callback),
    
    // Chat operations
    onNewChat: (callback) => ipcRenderer.on('new-chat', callback),
    
    // Remove listeners
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

// Also expose a simple bridge for checking if we're in Electron
contextBridge.exposeInMainWorld('isElectron', true);
