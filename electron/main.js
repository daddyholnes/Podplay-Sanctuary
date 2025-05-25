const { app, BrowserWindow, Menu, Tray, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');

let mainWindow;
let tray;
let backendProcess = null;
let isBackendRunning = false;
const isDev = process.env.NODE_ENV === 'development';
const isPackaged = app.isPackaged;
const backendPort = 8000;

// Simple HTTP request helper
function checkBackendHealth() {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:${backendPort}/`, (res) => {
            resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(3000, () => {
            req.destroy();
            resolve(false);
        });
    });
}

// Create main window
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 600,
        icon: getAppIcon(),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: true,
            allowRunningInsecureContent: false,
            experimentalFeatures: false
        },
        show: false
    });

    // Set Content Security Policy
    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [
                    "default-src 'self' http://localhost:* ws://localhost:*; " +
                    "script-src 'self' 'unsafe-inline' http://localhost:*; " +
                    "style-src 'self' 'unsafe-inline' http://localhost:*; " +
                    "img-src 'self' data: http://localhost:*; " +
                    "connect-src 'self' http://localhost:* ws://localhost:*; " +
                    "font-src 'self' data:;"
                ]
            }
        });
    });

    // Load frontend (backend serves it in production)
    mainWindow.loadURL(`http://localhost:${backendPort}`);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        if (isDev) {
            mainWindow.webContents.openDevTools();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
}

// Get app icon based on platform
function getAppIcon() {
    const iconsDir = path.join(__dirname, 'assets', 'icons');
    
    if (process.platform === 'win32') {
        return path.join(__dirname, 'assets', 'icons', 'icon.ico');
    } else if (process.platform === 'darwin') {
        return path.join(__dirname, 'assets', 'icons', 'icon.icns');
    } else {
        return path.join(iconsDir, 'icon-256x256.png');
    }
}

// Start Python backend (only in development or if backend files are available)
function startBackend() {
    return new Promise((resolve, reject) => {
        // If packaged, assume backend is started externally
        if (isPackaged) {
            console.log('Packaged app detected - checking for external backend...');
            // Just check if backend is already running
            setTimeout(async () => {
                try {
                    const isHealthy = await checkBackendHealth();
                    if (isHealthy) {
                        console.log('✅ External backend is running');
                        isBackendRunning = true;
                        resolve();
                    } else {
                        console.log('❌ Backend not found. Please start backend manually first.');
                        reject(new Error('Backend not running. Please start the backend manually first:\ncd backend && source venv/bin/activate && python app.py'));
                    }
                } catch (error) {
                    reject(error);
                }
            }, 1000);
            return;
        }
        
        console.log('Starting Python backend...');
        
        const backendPath = path.join(__dirname, '..', 'backend');
        const pythonPath = path.join(backendPath, 'venv', 'bin', 'python');
        const appPath = path.join(backendPath, 'app.py');
        
        // Use virtual environment if it exists, otherwise use system Python
        const pythonCommand = fs.existsSync(pythonPath) ? pythonPath : 'python3';
        
        backendProcess = spawn(pythonCommand, [appPath], {
            cwd: backendPath,
            stdio: ['pipe', 'pipe', 'pipe']
        });

        backendProcess.stdout.on('data', (data) => {
            console.log(`Backend: ${data.toString().trim()}`);
        });

        backendProcess.stderr.on('data', (data) => {
            console.error(`Backend Error: ${data.toString().trim()}`);
        });

        backendProcess.on('close', (code) => {
            console.log(`Backend process exited with code ${code}`);
            isBackendRunning = false;
        });

        backendProcess.on('error', (error) => {
            console.error('Failed to start backend:', error);
            reject(error);
        });

        // Wait for backend to be ready
        let attempts = 0;
        const maxAttempts = 30;
        
        const checkBackend = async () => {
            try {
                const isReady = await checkBackendHealth();
                if (isReady) {
                    console.log('✅ Backend is ready!');
                    isBackendRunning = true;
                    resolve();
                } else {
                    attempts++;
                    if (attempts < maxAttempts) {
                        setTimeout(checkBackend, 1000);
                    } else {
                        reject(new Error('Backend failed to start within timeout'));
                    }
                }
            } catch (error) {
                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(checkBackend, 1000);
                } else {
                    reject(error);
                }
            }
        };
        
        setTimeout(checkBackend, 2000); // Give backend time to start
    });
}

// Create system tray
function createTray() {
    const trayIcon = getAppIcon();
    tray = new Tray(trayIcon);
    
    const contextMenu = Menu.buildFromTemplate([
        {
            label: '🐻 Podplay Sanctuary',
            enabled: false
        },
        { type: 'separator' },
        {
            label: 'Show Window',
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                    mainWindow.focus();
                }
            }
        },
        {
            label: 'Hide Window',
            click: () => {
                if (mainWindow) {
                    mainWindow.hide();
                }
            }
        },
        { type: 'separator' },
        {
            label: `Backend: ${isBackendRunning ? '✅ Running' : '❌ Stopped'}`,
            enabled: false
        },
        {
            label: 'Restart Backend',
            click: () => restartBackend()
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => app.quit()
        }
    ]);

    tray.setContextMenu(contextMenu);
    tray.setToolTip('Podplay Build Sanctuary');
    
    tray.on('click', () => {
        if (mainWindow) {
            if (mainWindow.isVisible()) {
                mainWindow.hide();
            } else {
                mainWindow.show();
                mainWindow.focus();
            }
        }
    });
}

// Restart backend
async function restartBackend() {
    console.log('Restarting backend...');
    
    if (backendProcess) {
        backendProcess.kill();
        isBackendRunning = false;
    }
    
    try {
        await startBackend();
        console.log('Backend restarted successfully');
        
        // Reload the main window
        if (mainWindow) {
            mainWindow.reload();
        }
    } catch (error) {
        console.error('Failed to restart backend:', error);
        dialog.showErrorBox('Backend Error', 'Failed to restart the backend. Please check the console for details.');
    }
}

// App event handlers
app.whenReady().then(async () => {
    try {
        console.log('🚀 Starting Podplay Build Sanctuary...');
        
        // Start backend first
        await startBackend();
        
        // Create main window
        createWindow();
        
        // Create system tray
        createTray();
        
        console.log('✅ Podplay Sanctuary loaded successfully!');
        
    } catch (error) {
        console.error('❌ Failed to start application:', error);
        dialog.showErrorBox('Startup Error', 'Failed to start the application. Please check the console for details.');
        app.quit();
    }
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

app.on('before-quit', () => {
    console.log('Cleaning up...');
    
    if (backendProcess) {
        backendProcess.kill();
    }
    
    if (tray) {
        tray.destroy();
    }
});

// IPC handlers
ipcMain.handle('get-app-info', () => ({
    version: app.getVersion(),
    name: app.getName(),
    isBackendRunning: isBackendRunning,
    backendUrl: `http://localhost:${backendPort}`
}));

ipcMain.handle('restart-backend', () => restartBackend());

ipcMain.handle('check-backend-status', async () => {
    const isHealthy = await checkBackendHealth();
    return {
        isRunning: isHealthy,
        url: `http://localhost:${backendPort}`
    };
});

ipcMain.handle('open-external', (event, url) => {
    shell.openExternal(url);
});

console.log('Electron main process initialized');
