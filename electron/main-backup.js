const { app, BrowserWindow, Menu, Tray, ipcMain, shell, dialog, nativeImage } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const http = require('http');
const Store = require('electron-store');

// Initialize electron store for settings
const store = new Store();

// Simple HTTP request helper
function httpRequest(url) {
    return new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        ok: res.statusCode >= 200 && res.statusCode < 300,
                        status: res.statusCode,
                        json: () => Promise.resolve(JSON.parse(data))
                    });
                } catch (err) {
                    resolve({
                        ok: res.statusCode >= 200 && res.statusCode < 300,
                        status: res.statusCode,
                        json: () => Promise.reject(err)
                    });
                }
            });
        });
        req.on('error', reject);
        req.setTimeout(5000, () => reject(new Error('Request timeout')));
    });
}

class PodplaySanctuaryApp {
    constructor() {
        this.mainWindow = null;
        this.tray = null;
        this.backendProcess = null;
        this.isBackendRunning = false;
        this.isDev = process.env.NODE_ENV === 'development';
        this.backendPort = 8000;
        this.frontendPort = this.isDev ? 5173 : null;
        
        this.init();
    }

    init() {
        // Set app properties
        app.setName('Podplay Build Sanctuary');
        
        // Handle app events
        app.whenReady().then(() => this.createApp());
        app.on('window-all-closed', () => this.handleWindowsClosed());
        app.on('activate', () => this.handleActivate());
        app.on('before-quit', () => this.cleanup());
        
        // Handle IPC events
        this.setupIPC();
    }

    async createApp() {
        try {
            console.log('🚀 Starting Podplay Build Sanctuary...');
            
            // Start backend first
            await this.startBackend();
            
            // Create main window
            this.createMainWindow();
            
            // Create system tray
            this.createTray();
            
            // Setup menu
            this.createMenu();
            
            console.log('✅ Podplay Sanctuary fully loaded!');
            
        } catch (error) {
            console.error('❌ Failed to start Podplay Sanctuary:', error);
            this.showErrorDialog('Startup Error', 'Failed to start the application. Please check the console for details.');
        }
    }

    createMainWindow() {
        // Create the browser window
        this.mainWindow = new BrowserWindow({
            width: 1400,
            height: 900,
            minWidth: 1000,
            minHeight: 600,
            icon: this.getAppIcon(),
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js'),
                webSecurity: true
            },
            titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
            show: false // Don't show until ready
        });

        // Load the frontend
        const frontendUrl = this.isDev 
            ? `http://localhost:${this.frontendPort}`
            : `http://localhost:${this.backendPort}`;  // Backend serves frontend in production
            
        this.mainWindow.loadURL(frontendUrl);

        // Show window when ready
        this.mainWindow.once('ready-to-show', () => {
            this.mainWindow.show();
            
            // Open DevTools in development
            if (this.isDev) {
                this.mainWindow.webContents.openDevTools();
            }
        });

        // Handle window events
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });

        this.mainWindow.on('minimize', () => {
            if (store.get('minimizeToTray', true)) {
                this.mainWindow.hide();
            }
        });

        // Handle external links
        this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
            shell.openExternal(url);
            return { action: 'deny' };
        });
    }

    createTray() {
        const trayIcon = this.getAppIcon();
        this.tray = new Tray(trayIcon);
        
        const contextMenu = Menu.buildFromTemplate([
            {
                label: '🐻 Podplay Sanctuary',
                type: 'normal',
                enabled: false
            },
            { type: 'separator' },
            {
                label: 'Show Window',
                click: () => this.showWindow()
            },
            {
                label: 'Hide Window',
                click: () => this.hideWindow()
            },
            { type: 'separator' },
            {
                label: `Backend Status: ${this.isBackendRunning ? '✅ Running' : '❌ Stopped'}`,
                enabled: false
            },
            {
                label: 'Restart Backend',
                click: () => this.restartBackend()
            },
            { type: 'separator' },
            {
                label: 'Settings',
                click: () => this.showSettings()
            },
            {
                label: 'About',
                click: () => this.showAbout()
            },
            { type: 'separator' },
            {
                label: 'Quit',
                click: () => app.quit()
            }
        ]);

        this.tray.setContextMenu(contextMenu);
        this.tray.setToolTip('Podplay Build Sanctuary - Your AI Development Partner');
        
        this.tray.on('click', () => {
            this.toggleWindow();
        });
    }

    createMenu() {
        const template = [
            {
                label: 'File',
                submenu: [
                    {
                        label: 'New Chat',
                        accelerator: 'CmdOrCtrl+N',
                        click: () => this.sendToRenderer('new-chat')
                    },
                    {
                        label: 'Open File',
                        accelerator: 'CmdOrCtrl+O',
                        click: () => this.openFile()
                    },
                    { type: 'separator' },
                    {
                        label: 'Settings',
                        accelerator: 'CmdOrCtrl+,',
                        click: () => this.showSettings()
                    },
                    { type: 'separator' },
                    {
                        label: 'Quit',
                        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                        click: () => app.quit()
                    }
                ]
            },
            {
                label: 'Backend',
                submenu: [
                    {
                        label: 'Backend Status',
                        click: () => this.checkBackendStatus()
                    },
                    {
                        label: 'Restart Backend',
                        click: () => this.restartBackend()
                    },
                    {
                        label: 'Run Tests',
                        click: () => this.runBackendTests()
                    },
                    { type: 'separator' },
                    {
                        label: 'Open Backend Logs',
                        click: () => this.openBackendLogs()
                    }
                ]
            },
            {
                label: 'View',
                submenu: [
                    { role: 'reload' },
                    { role: 'forceReload' },
                    { role: 'toggleDevTools' },
                    { type: 'separator' },
                    { role: 'resetZoom' },
                    { role: 'zoomIn' },
                    { role: 'zoomOut' },
                    { type: 'separator' },
                    { role: 'togglefullscreen' }
                ]
            },
            {
                label: 'Window',
                submenu: [
                    { role: 'minimize' },
                    { role: 'close' },
                    { type: 'separator' },
                    {
                        label: 'Always on Top',
                        type: 'checkbox',
                        checked: store.get('alwaysOnTop', false),
                        click: (menuItem) => {
                            const alwaysOnTop = menuItem.checked;
                            store.set('alwaysOnTop', alwaysOnTop);
                            if (this.mainWindow) {
                                this.mainWindow.setAlwaysOnTop(alwaysOnTop);
                            }
                        }
                    }
                ]
            },
            {
                label: 'Help',
                submenu: [
                    {
                        label: 'About Podplay Sanctuary',
                        click: () => this.showAbout()
                    },
                    {
                        label: 'Documentation',
                        click: () => shell.openExternal('https://github.com/yourusername/podplay-build-sanctuary')
                    },
                    {
                        label: 'Report Issue',
                        click: () => shell.openExternal('https://github.com/yourusername/podplay-build-sanctuary/issues')
                    }
                ]
            }
        ];

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    }

    async startBackend() {
        return new Promise((resolve, reject) => {
            console.log('🔄 Starting Python backend...');
            
            const backendPath = path.join(__dirname, '..', 'backend');
            const pythonPath = path.join(backendPath, 'venv', 'bin', 'python');
            const appPath = path.join(backendPath, 'app.py');
            
            // Check if virtual environment exists
            if (!fs.existsSync(pythonPath)) {
                console.log('⚠️ Virtual environment not found, using system Python');
                this.backendProcess = spawn('python3', [appPath], {
                    cwd: backendPath,
                    stdio: ['pipe', 'pipe', 'pipe']
                });
            } else {
                this.backendProcess = spawn(pythonPath, [appPath], {
                    cwd: backendPath,
                    stdio: ['pipe', 'pipe', 'pipe']
                });
            }

            this.backendProcess.stdout.on('data', (data) => {
                console.log(`Backend: ${data.toString()}`);
            });

            this.backendProcess.stderr.on('data', (data) => {
                console.error(`Backend Error: ${data.toString()}`);
            });

            this.backendProcess.on('close', (code) => {
                console.log(`Backend process exited with code ${code}`);
                this.isBackendRunning = false;
                this.updateTrayMenu();
            });

            this.backendProcess.on('error', (error) => {
                console.error('Failed to start backend:', error);
                reject(error);
            });

            // Wait for backend to be ready
            this.waitForBackend().then(() => {
                this.isBackendRunning = true;
                this.updateTrayMenu();
                resolve();
            }).catch(reject);
        });
    }

    async waitForBackend(maxAttempts = 30) {
        for (let i = 0; i < maxAttempts; i++) {
            try {
                if (!fetch) {
                    const fetchModule = await import('node-fetch');
                    fetch = fetchModule.default;
                }
                const response = await fetch(`http://localhost:${this.backendPort}/`);
                if (response.ok) {
                    console.log('✅ Backend is ready!');
                    return true;
                }
            } catch (error) {
                // Backend not ready yet
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        throw new Error('Backend failed to start within timeout');
    }

    async restartBackend() {
        console.log('🔄 Restarting backend...');
        
        if (this.backendProcess) {
            this.backendProcess.kill();
            this.isBackendRunning = false;
        }
        
        try {
            await this.startBackend();
            this.showNotification('Backend Restarted', 'The Python backend has been successfully restarted.');
        } catch (error) {
            this.showErrorDialog('Backend Error', 'Failed to restart the backend. Please check the console for details.');
        }
    }

    async checkBackendStatus() {
        try {
            if (!fetch) {
                const fetchModule = await import('node-fetch');
                fetch = fetchModule.default;
            }
            const response = await fetch(`http://localhost:${this.backendPort}/`);
            if (response.ok) {
                const data = await response.json();
                this.showInfoDialog('Backend Status', `✅ Backend is running\n🐻 Agent: ${data.agent}\n📡 Status: ${data.status}`);
            }
        } catch (error) {
            this.showErrorDialog('Backend Status', '❌ Backend is not responding');
        }
    }

    runBackendTests() {
        const backendPath = path.join(__dirname, '..', 'backend');
        const testScript = path.join(__dirname, '..', 'backend_master_test.py');
        
        exec(`python3 ${testScript}`, { cwd: backendPath }, (error, stdout, stderr) => {
            if (error) {
                this.showErrorDialog('Test Error', `Failed to run tests: ${error.message}`);
                return;
            }
            
            // Show test results in a new window
            this.showTestResults(stdout);
        });
    }

    setupIPC() {
        ipcMain.handle('get-app-info', () => ({
            version: app.getVersion(),
            name: app.getName(),
            isBackendRunning: this.isBackendRunning,
            backendUrl: `http://localhost:${this.backendPort}`
        }));

        ipcMain.handle('restart-backend', () => this.restartBackend());
        ipcMain.handle('check-backend-status', () => this.checkBackendStatus());
        ipcMain.handle('open-external', (event, url) => shell.openExternal(url));
        
        ipcMain.handle('get-setting', (event, key, defaultValue) => {
            return store.get(key, defaultValue);
        });
        
        ipcMain.handle('set-setting', (event, key, value) => {
            store.set(key, value);
        });
    }

    // Utility methods
    getAppIcon() {
        const iconName = process.platform === 'win32' ? 'icon.ico' : 
                        process.platform === 'darwin' ? 'icon.icns' : 'icon.png';
        return path.join(__dirname, 'assets', iconName);
    }

    showWindow() {
        if (this.mainWindow) {
            this.mainWindow.show();
            this.mainWindow.focus();
        }
    }

    hideWindow() {
        if (this.mainWindow) {
            this.mainWindow.hide();
        }
    }

    toggleWindow() {
        if (this.mainWindow) {
            if (this.mainWindow.isVisible()) {
                this.hideWindow();
            } else {
                this.showWindow();
            }
        }
    }

    updateTrayMenu() {
        if (this.tray) {
            this.createTray(); // Recreate tray menu with updated status
        }
    }

    sendToRenderer(channel, data) {
        if (this.mainWindow && this.mainWindow.webContents) {
            this.mainWindow.webContents.send(channel, data);
        }
    }

    showNotification(title, body) {
        // Implementation for notifications
        if (this.mainWindow) {
            this.mainWindow.webContents.send('show-notification', { title, body });
        }
    }

    showErrorDialog(title, content) {
        dialog.showErrorBox(title, content);
    }

    showInfoDialog(title, content) {
        dialog.showMessageBox(this.mainWindow, {
            type: 'info',
            title: title,
            message: content,
            buttons: ['OK']
        });
    }

    showAbout() {
        dialog.showMessageBox(this.mainWindow, {
            type: 'info',
            title: 'About Podplay Build Sanctuary',
            message: 'Podplay Build Sanctuary',
            detail: `Version: ${app.getVersion()}\n\n🐻 Your AI Development Partner\n\nBuilt with Electron, React, and Python\nPowered by Vertex AI and Mama Bear Gem`,
            buttons: ['OK']
        });
    }

    showSettings() {
        // Send message to renderer to show settings
        this.sendToRenderer('show-settings');
    }

    async openFile() {
        const result = await dialog.showOpenDialog(this.mainWindow, {
            properties: ['openFile'],
            filters: [
                { name: 'All Files', extensions: ['*'] },
                { name: 'Text Files', extensions: ['txt', 'md', 'json', 'js', 'ts', 'py'] },
                { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] }
            ]
        });

        if (!result.canceled && result.filePaths.length > 0) {
            this.sendToRenderer('file-selected', result.filePaths[0]);
        }
    }

    openBackendLogs() {
        const logPath = path.join(__dirname, '..', 'backend', 'mama_bear.log');
        shell.openPath(logPath);
    }

    showTestResults(results) {
        dialog.showMessageBox(this.mainWindow, {
            type: 'info',
            title: 'Backend Test Results',
            message: 'Test Results',
            detail: results,
            buttons: ['OK']
        });
    }

    handleWindowsClosed() {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    }

    handleActivate() {
        if (BrowserWindow.getAllWindows().length === 0) {
            this.createMainWindow();
        }
    }

    cleanup() {
        console.log('🧹 Cleaning up...');
        
        if (this.backendProcess) {
            this.backendProcess.kill();
        }
        
        if (this.tray) {
            this.tray.destroy();
        }
    }
}

// Create the app instance
new PodplaySanctuaryApp();
