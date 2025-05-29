# Podplay Sanctuary Desktop App

A cross-platform desktop application built with Electron that provides a seamless interface to the Podplay Sanctuary podcast management system.

## Features

- **Integrated Docker Management**: Automatically starts and manages Docker containers for backend and frontend services
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Persistent Window State**: Remembers window size, position, and maximized state
- **Loading Screen**: Beautiful loading interface while Docker services start up
- **Menu Integration**: Native application menus with keyboard shortcuts
- **Secure Communication**: Uses Electron's context isolation for secure IPC

## Prerequisites

Before running the desktop app, ensure you have:

1. **Docker** installed and running
2. **Node.js** (version 16 or higher)
3. **npm** package manager

## Installation

1. Navigate to the project root directory
2. Install Electron dependencies:
   ```bash
   cd electron
   npm install
   ```

## Running the App

### Option 1: Using the Launcher Script (Recommended)
From the project root directory:
```bash
./start-desktop.sh
```

### Option 2: Manual Start
```bash
cd electron
npm start
```

### Development Mode
To run with developer tools enabled:
```bash
cd electron
npm run dev
```

## How It Works

1. **Startup Process**: The app first checks if Docker services are running
2. **Loading Screen**: If services aren't ready, shows a loading screen while starting Docker containers
3. **Service Detection**: Waits for both frontend (port 5173) and backend (port 5000) to be ready
4. **App Launch**: Once services are ready, loads the main application interface
5. **Cleanup**: Automatically stops Docker services when the app is closed

## Architecture

```
┌─────────────────────┐
│   Electron Main     │  ← Manages Docker services and application lifecycle
│     Process         │
└─────────────────────┘
           │
┌─────────────────────┐
│   BrowserWindow     │  ← Loads frontend at http://localhost:5173
│  (Frontend UI)      │
└─────────────────────┘
           │
┌─────────────────────┐
│   Docker Services   │  ← Backend (port 5000) + Frontend (port 5173)
│                     │
└─────────────────────┘
```

## Configuration

The app stores user preferences and window state in:
- **Windows**: `%APPDATA%/podplay-sanctuary/config.json`
- **macOS**: `~/Library/Preferences/podplay-sanctuary/config.json`
- **Linux**: `~/.config/podplay-sanctuary/config.json`

## Building for Distribution

To build standalone executables:

```bash
cd electron
npm run build    # Build for current platform
npm run dist     # Build and package for distribution
npm run pack     # Build without packaging
```

Built applications will be in the `electron/dist` directory.

### Platform-Specific Builds

The app can be built for multiple platforms:
- **Windows**: Creates an NSIS installer
- **macOS**: Creates a DMG file
- **Linux**: Creates an AppImage

## Development

The Electron app consists of three main files:

- **`main.js`**: Main process that manages the application lifecycle, Docker services, and window creation
- **`preload.js`**: Secure communication bridge between the main process and renderer
- **`loading.html`**: Loading screen displayed while Docker services start

### Key Features

1. **Docker Integration**: Automatically manages Docker Compose services
2. **Window Management**: Handles window state persistence and restoration
3. **Menu System**: Native application menus with keyboard shortcuts
4. **Error Handling**: Graceful error handling with user-friendly dialogs
5. **Security**: Follows Electron security best practices with context isolation

## Troubleshooting

### App Won't Start
- Ensure Docker is installed and running
- Check that ports 5000 and 5173 are available
- Verify Node.js and npm are installed

### Docker Services Won't Start
- Make sure you're in the correct project directory
- Check if `docker-compose.dev.yml` exists
- Ensure Docker has sufficient resources

### Performance Issues
- Increase Docker memory allocation
- Close other resource-intensive applications
- Check Docker container logs for errors

## Security

The desktop app follows Electron security best practices:
- Context isolation enabled
- Node integration disabled in renderer
- Remote module disabled
- Preload script for secure IPC
- Content Security Policy for web content

## License

This project is licensed under the MIT License - see the LICENSE file for details.
