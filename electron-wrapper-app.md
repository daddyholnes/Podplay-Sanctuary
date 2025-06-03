# Podplay Sanctuary Electron Wrapper

This Electron application serves as a beautiful frame for your existing UI components, preserving all your purple-themed elements while providing seamless integration with the backend.

## Core Structure

```
podplay-electron/
├── package.json
├── main.js               # Electron main process
├── preload.js            # Preload script for security
├── renderer/
│   ├── index.html        # Main HTML container
│   ├── app.tsx           # App container with sidebar navigation
│   ├── styles.css        # Global styles including purple theme
│   └── components/       # Import wrappers for your beautiful UI files
└── ui-components/        # Your beautiful UI components from ui-foundation
```

## Installation

```bash
npm install electron electron-builder react react-dom @emotion/react @emotion/styled
npm install typescript @types/react @types/react-dom --save-dev
```

## Key Files

### package.json

```json
{
  "name": "podplay-sanctuary",
  "version": "1.0.0",
  "description": "Your Creative AI Sanctuary",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder"
  },
  "dependencies": {
    "electron-store": "^8.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@emotion/react": "^11.10.6",
    "@emotion/styled": "^11.10.6",
    "socket.io-client": "^4.6.1"
  },
  "devDependencies": {
    "electron": "^25.0.0",
    "electron-builder": "^24.0.0",
    "typescript": "^5.0.4",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  },
  "build": {
    "appId": "com.podplay.sanctuary",
    "productName": "Podplay Sanctuary",
    "directories": {
      "output": "dist"
    },
    "mac": {
      "category": "public.app-category.developer-tools"
    },
    "linux": {
      "target": ["AppImage", "deb"]
    }
  }
}
```

### main.js (Electron Main Process)

```javascript
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');

// Initialize settings store
const store = new Store();

// Create main window
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#1e1e2e', // Dark purple background
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    // On Linux/Windows, use frame: false for a borderless window
    // On macOS, use titleBarStyle: 'hidden' for a frameless window with traffic lights
    ...(process.platform === 'darwin' 
      ? { titleBarStyle: 'hidden' } 
      : { frame: false })
  });

  // Load app
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

// App ready
app.whenReady().then(() => {
  createWindow();

  // Handle backend communications
  ipcMain.handle('start-backend', async () => {
    // Start Flask backend if not running
    // This can spawn a child process to run your backend
    try {
      // Example of starting backend
      const { spawn } = require('child_process');
      const backendProcess = spawn('python', ['backend/app.py']);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Handle file system operations for the workspace
  ipcMain.handle('read-file', async (event, filePath) => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return { success: true, content };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit app when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
```

### preload.js (Security Bridge)

```javascript
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  startBackend: () => ipcRenderer.invoke('start-backend'),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
  
  // System operations
  platform: process.platform,
  
  // Backend communication API
  api: {
    // These will communicate with your backend service
    get: (url) => fetch(`http://localhost:5000${url}`).then(res => res.json()),
    post: (url, data) => fetch(`http://localhost:5000${url}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    }).then(res => res.json()),
    // Add other methods as needed
  }
});
```

### renderer/index.html (Main Container)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; connect-src http://localhost:5000 ws://localhost:5000; script-src 'self'">
  <title>Podplay Sanctuary</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="app"></div>
  <script src="./app.bundle.js"></script>
</body>
</html>
```

### renderer/app.tsx (Main App Component - Frame Only)

```tsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
  MessageCircle, 
  Code, 
  Store, 
  Mic, 
  Grid3X3, 
  Settings, 
  Layout,
  Heart,
  Menu,
  X
} from 'lucide-react';

// Import your beautiful UI components here
import MamaBearMainChat from '../ui-components/mama-bear-main-chat';
import ScoutDevWorkspaces from '../ui-components/scout-dev-workspaces';
import ScoutMcpMarketplace from '../ui-components/scout-mcp-marketplace';
import ScoutMultiModalChat from '../ui-components/scout-multimodal-chat';
import ScoutMiniAppsHub from '../ui-components/scout-miniapps-hub';
import IntegrationWorkbench from '../ui-components/integration_workbench_frontend';
import WorkspaceLayout from '../ui-components/scout-workspace-layout';

// App Container - This just provides the frame, your beautiful UI components are loaded intact
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);

  // Check backend connection on load
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await window.electron.api.get('/status');
        setBackendConnected(response.status === 'ok');
      } catch (error) {
        setBackendConnected(false);
        console.error('Backend connection error:', error);
      }
    };

    // Start backend if not running
    window.electron.startBackend()
      .then(() => checkConnection())
      .catch(console.error);
    
    // Check connection every 30 seconds
    const connectionInterval = setInterval(checkConnection, 30000);
    return () => clearInterval(connectionInterval);
  }, []);

  // Navigation items
  const navigationItems = [
    { id: 'chat', label: 'Mama Bear Chat', icon: MessageCircle, component: MamaBearMainChat },
    { id: 'workspaces', label: 'Dev Workspaces', icon: Code, component: ScoutDevWorkspaces },
    { id: 'marketplace', label: 'MCP Marketplace', icon: Store, component: ScoutMcpMarketplace },
    { id: 'multimodal', label: 'Multimodal Chat', icon: Mic, component: ScoutMultiModalChat },
    { id: 'miniapps', label: 'Mini Apps Hub', icon: Grid3X3, component: ScoutMiniAppsHub },
    { id: 'integration', label: 'Integration Workbench', icon: Settings, component: IntegrationWorkbench },
    { id: 'layout', label: 'Workspace Layout', icon: Layout, component: WorkspaceLayout },
  ];

  // Find the active component
  const ActiveComponent = navigationItems.find(item => item.id === activeTab)?.component || MamaBearMainChat;

  return (
    <div className="app-container">
      {/* Custom title bar for dragging (on Windows and Linux) */}
      {window.electron.platform !== 'darwin' && (
        <div className="title-bar">
          <div className="title-bar-drag-area">Podplay Sanctuary</div>
          <div className="window-controls">
            {/* Window control buttons would go here */}
          </div>
        </div>
      )}

      <div className="main-container">
        {/* Sidebar */}
        <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          {/* Header */}
          <div className="sidebar-header">
            <div className="sidebar-header-content">
              {!sidebarCollapsed && (
                <div className="app-branding">
                  <Heart className="app-logo" />
                  <div className="app-title">
                    <h1>Podplay Build</h1>
                    <p>Your Creative Sanctuary</p>
                  </div>
                </div>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="sidebar-toggle"
              >
                {sidebarCollapsed ? <Menu /> : <X />}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="sidebar-nav">
            <ul>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                    >
                      <Icon className="nav-icon" />
                      {!sidebarCollapsed && (
                        <span className="nav-label">{item.label}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          {!sidebarCollapsed && (
            <div className="sidebar-footer">
              <p className="version">Powered by Mama Bear AI</p>
              <p className="build">v1.0.0</p>
            </div>
          )}
        </div>

        {/* Content Area - This is where your beautiful UI components will be rendered */}
        <div className="content-area">
          {/* Top Bar with status */}
          <div className="top-bar">
            <div className="page-title">
              <h2>{navigationItems.find(item => item.id === activeTab)?.label}</h2>
              <p>Welcome to your creative sanctuary</p>
            </div>
            <div className="connection-status">
              <div className={`status-indicator ${backendConnected ? 'connected' : 'disconnected'}`}></div>
              <span>{backendConnected ? 'Backend Connected' : 'Backend Disconnected'}</span>
            </div>
          </div>

          {/* Active Component - Your beautiful UI is loaded here */}
          <div className="component-container">
            <ActiveComponent />
          </div>
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('app'));
```

### renderer/styles.css (Preserves Your Purple Theme)

```css
/* Base styles */
:root {
  --purple-light: #c9a2ff;
  --purple-main: #9a56ff;
  --purple-dark: #7638dc;
  --purple-darkest: #1e1e2e;
  --purple-gradient: linear-gradient(135deg, var(--purple-light) 0%, var(--purple-dark) 100%);
  --bg-light: #f8f9fa;
  --bg-dark: #1e1e2e;
  --text-light: #f8f9fa;
  --text-dark: #333;
  --border-light: rgba(201, 162, 255, 0.2);
  --border-dark: rgba(118, 56, 220, 0.2);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  color: var(--text-dark);
  background: var(--bg-light);
  height: 100vh;
  overflow: hidden;
}

/* App Container */
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* Custom Title Bar for Windows/Linux */
.title-bar {
  height: 32px;
  background: var(--purple-darkest);
  display: flex;
  align-items: center;
  justify-content: space-between;
  -webkit-app-region: drag;
  user-select: none;
}

.title-bar-drag-area {
  flex: 1;
  color: var(--text-light);
  padding: 0 12px;
  font-size: 12px;
  display: flex;
  align-items: center;
}

.window-controls {
  -webkit-app-region: no-drag;
  display: flex;
}

/* Main Container */
.main-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  width: 260px;
  background: var(--purple-gradient);
  color: var(--text-light);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.app-branding {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-logo {
  width: 32px;
  height: 32px;
}

.app-title h1 {
  font-size: 16px;
  font-weight: bold;
}

.app-title p {
  font-size: 12px;
  opacity: 0.8;
}

.sidebar-toggle {
  background: transparent;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
}

.sidebar-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.sidebar-nav ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  background: transparent;
  border: none;
  color: var(--text-light);
  width: 100%;
  text-align: left;
  transition: background-color 0.2s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.2);
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.nav-label {
  font-weight: 500;
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.version {
  font-size: 12px;
  opacity: 0.8;
}

.build {
  font-size: 10px;
  opacity: 0.6;
}

/* Content Area */
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Top Bar */
.top-bar {
  height: 64px;
  background: white;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.page-title h2 {
  font-size: 18px;
  font-weight: 600;
}

.page-title p {
  font-size: 14px;
  color: #666;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-indicator.connected {
  background: #10b981;
}

.status-indicator.disconnected {
  background: #ef4444;
}

/* Component Container - Where your beautiful UI will be displayed */
.component-container {
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  body {
    background: var(--bg-dark);
    color: var(--text-light);
  }
  
  .top-bar {
    background: #222;
    border-color: var(--border-dark);
  }
  
  .page-title p {
    color: #ccc;
  }
  
  .connection-status {
    color: #ccc;
  }
}
```

## How to Use This as a Wrapper

1. Copy all your beautiful UI files from `ui-foundation` into the `ui-components` folder.
2. This Electron app serves as a **frame only** - it just handles navigation and basic backend connectivity.
3. Your beautiful UI components are loaded directly without modification.
4. All your purple gradients and styling will remain intact.

## Backend Connection

The Electron app automatically:

1. Starts your Flask backend when the app launches
2. Provides an API bridge to connect your UI components to the backend
3. Shows connection status in the top-right corner

## Building and Distribution

```bash
# Development
npm start

# Build for distribution
npm run build
```

This will generate installers in the `dist` folder.

## Next Steps

1. Copy your existing UI files from `ui-foundation` folder
2. Integrate with your backend
3. Customize the frame as needed
