const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const Store = require('electron-store');

// Initialize electron store for persistent settings
const store = new Store();

let mainWindow;
let dockerProcess = null;
let isQuitting = false;

// Check if running in development mode
const isDev = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'assets', 'icon.png'), // Add icon later
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: !isDev // Disable web security in dev mode for localhost access
    },
    show: false, // Don't show until ready
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default'
  });

  // Restore window state
  const windowState = store.get('windowState', {
    width: 1400,
    height: 900,
    x: undefined,
    y: undefined,
    maximized: false
  });

  mainWindow.setBounds({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height
  });

  if (windowState.maximized) {
    mainWindow.maximize();
  }

  // Save window state on resize/move
  mainWindow.on('resize', saveWindowState);
  mainWindow.on('move', saveWindowState);
  mainWindow.on('maximize', () => store.set('windowState.maximized', true));
  mainWindow.on('unmaximize', () => store.set('windowState.maximized', false));

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Prevent navigation away from the app
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const appUrl = 'http://localhost:5173';
    if (!url.startsWith(appUrl)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Load the frontend application
  loadApplication();
}

function saveWindowState() {
  if (!mainWindow) return;
  
  const bounds = mainWindow.getBounds();
  store.set('windowState', {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    maximized: mainWindow.isMaximized()
  });
}

async function loadApplication() {
  if (!mainWindow) return;

  try {
    // Check if Docker services are running
    const isDockerRunning = await checkDockerServices();
    
    if (!isDockerRunning) {
      // Show loading screen
      mainWindow.loadFile(path.join(__dirname, 'loading.html'));
      
      // Start Docker services
      await startDockerServices();
      
      // Wait for services to be ready
      await waitForServices();
    }
    
    // Load the main application
    mainWindow.loadURL('http://localhost:5173');
    
  } catch (error) {
    console.error('Failed to start application:', error);
    showErrorDialog('Failed to start Podplay Sanctuary', error.message);
  }
}

function checkDockerServices() {
  return new Promise((resolve) => {
    const checkProcess = spawn('curl', ['-f', 'http://localhost:5173'], {
      stdio: 'ignore'
    });
    
    checkProcess.on('close', (code) => {
      resolve(code === 0);
    });
    
    checkProcess.on('error', () => {
      resolve(false);
    });
  });
}

function startDockerServices() {
  return new Promise((resolve, reject) => {
    console.log('Starting Docker services...');
    
    // Change to the project root directory
    const projectRoot = path.resolve(__dirname, '..');
    
    dockerProcess = spawn('docker', ['compose', '-f', 'docker-compose.dev.yml', 'up', '--build'], {
      cwd: projectRoot,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let serviceStarted = false;
    
    dockerProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('Docker stdout:', output);
      
      // Check if services are ready
      if (output.includes('ready in') && output.includes('5173')) {
        serviceStarted = true;
        resolve();
      }
    });

    dockerProcess.stderr.on('data', (data) => {
      const output = data.toString();
      console.log('Docker stderr:', output);
      
      // Also check stderr for ready indicators
      if (output.includes('ready in') && output.includes('5173')) {
        serviceStarted = true;
        resolve();
      }
    });

    dockerProcess.on('error', (error) => {
      console.error('Docker process error:', error);
      reject(error);
    });

    dockerProcess.on('close', (code) => {
      console.log('Docker process closed with code:', code);
      if (!serviceStarted && code !== 0) {
        reject(new Error(`Docker process exited with code ${code}`));
      }
    });

    // Timeout after 60 seconds
    setTimeout(() => {
      if (!serviceStarted) {
        reject(new Error('Timeout waiting for Docker services to start'));
      }
    }, 60000);
  });
}

function waitForServices() {
  return new Promise((resolve) => {
    const checkInterval = setInterval(async () => {
      try {
        const frontendReady = await checkService('http://localhost:5173');
        const backendReady = await checkService('http://localhost:5000/api/test-connection');
        
        if (frontendReady && backendReady) {
          clearInterval(checkInterval);
          resolve();
        }
      } catch (error) {
        // Continue checking
      }
    }, 2000);
  });
}

function checkService(url) {
  return new Promise((resolve) => {
    const checkProcess = spawn('curl', ['-f', '-s', url], {
      stdio: 'ignore'
    });
    
    checkProcess.on('close', (code) => {
      resolve(code === 0);
    });
    
    checkProcess.on('error', () => {
      resolve(false);
    });
  });
}

function showErrorDialog(title, message) {
  dialog.showErrorBox(title, message);
}

function stopDockerServices() {
  return new Promise((resolve) => {
    if (!dockerProcess) {
      resolve();
      return;
    }

    console.log('Stopping Docker services...');
    
    const projectRoot = path.resolve(__dirname, '..');
    const stopProcess = spawn('docker', ['compose', '-f', 'docker-compose.dev.yml', 'down'], {
      cwd: projectRoot,
      stdio: 'ignore'
    });

    stopProcess.on('close', () => {
      dockerProcess = null;
      resolve();
    });

    stopProcess.on('error', () => {
      resolve(); // Continue even if stop fails
    });

    // Force kill after 10 seconds
    setTimeout(() => {
      if (dockerProcess) {
        dockerProcess.kill('SIGTERM');
        dockerProcess = null;
      }
      resolve();
    }, 10000);
  });
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Reload App',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) {
              mainWindow.reload();
            }
          }
        },
        {
          label: 'Force Reload',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.reloadIgnoringCache();
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools();
            }
          }
        },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Podplay Sanctuary',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Podplay Sanctuary',
              message: 'Podplay Sanctuary',
              detail: 'Desktop application for podcast management\nVersion: 1.0.0'
            });
          }
        }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });

    // Window menu
    template[3].submenu = [
      { role: 'close' },
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' }
    ];
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', async () => {
  isQuitting = true;
  
  // Stop Docker services before quitting
  await stopDockerServices();
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async (event) => {
  if (!isQuitting) {
    event.preventDefault();
    isQuitting = true;
    
    // Stop Docker services
    await stopDockerServices();
    app.quit();
  }
});

// Handle app activation on macOS
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});
