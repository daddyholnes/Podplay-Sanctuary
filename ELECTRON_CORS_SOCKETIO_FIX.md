# Podplay Sanctuary - CORS and Socket.IO Integration Fixes

This document outlines the changes made to resolve CORS and Socket.IO connectivity issues in the Podplay Sanctuary application.

## Issues Resolved

1. **CORS Configuration**
   - Added proper CORS headers to Electron app's webRequest handlers
   - Configured the Electron session to handle CORS preflight requests
   - Set appropriate Access-Control-Allow headers for all requests

2. **Socket.IO Connection Issues**
   - Added Socket.IO connection fix to handle 404 errors
   - Set proper transport options (websocket and polling)
   - Configured reconnection parameters for better stability
   - Added debugging tools for Socket.IO connection tracking

3. **Desktop Integration**
   - Enhanced desktop launcher with automatic backend detection
   - Added debug mode option to launcher
   - Created Windows desktop shortcuts for both normal and debug modes
   - Added robust error handling and dependency checking

## Implementation Details

### CORS Fixes

The main CORS fixes were implemented in Electron's main process:

```javascript
// Configure session to handle CORS and Socket.IO issues
const ses = mainWindow.webContents.session;
ses.webRequest.onBeforeSendHeaders((details, callback) => {
  const { requestHeaders } = details;
  
  // Add CORS headers for all requests
  requestHeaders['Origin'] = 'http://localhost:5173';
  
  callback({ requestHeaders });
});

// Handle backend API and Socket.IO connections
ses.webRequest.onHeadersReceived((details, callback) => {
  const { responseHeaders } = details;
  
  // Add CORS headers for all responses
  responseHeaders['Access-Control-Allow-Origin'] = ['*'];
  responseHeaders['Access-Control-Allow-Methods'] = ['GET, PUT, POST, DELETE, HEAD, OPTIONS, PATCH'];
  responseHeaders['Access-Control-Allow-Headers'] = ['Content-Type, Authorization, X-Requested-With, Accept, Origin'];
  
  callback({ responseHeaders });
});
```

### Socket.IO Fixes

Socket.IO connection issues were resolved by:

1. Injecting a connection fix script:
```javascript
window.socketIOConnectionFix = function() {
  if (window.io) {
    console.log('Applying Socket.IO connection fix');
    window.io.connect = function(url, options) {
      const defaultOptions = { 
        transports: ['websocket', 'polling'],
        path: '/socket.io',
        reconnectionAttempts: 5,
        timeout: 20000,
        reconnectionDelay: 1000,
        reconnection: true
      };
      return window.io.Manager(url, Object.assign({}, defaultOptions, options)).socket('/');
    };
  }
};
```

2. Adding a debugging tool that can be toggled with Ctrl+Alt+D to monitor Socket.IO connections in real-time.

## Desktop Integration Improvements

1. Enhanced launcher script that automatically checks for backend server and starts it if necessary
2. Added debug mode option for troubleshooting
3. Created proper Windows desktop shortcuts with appropriate icons
4. Added dependency checking to prevent startup failures

## How to Use

### Normal Mode
- Double-click "Podplay Sanctuary" shortcut on desktop
- Or run `Launch-Podplay-Sanctuary.bat` directly

### Debug Mode
- Double-click "Podplay Sanctuary (Debug Mode)" shortcut
- Or run `Launch-Podplay-Sanctuary.bat --debug`
- Press Ctrl+Alt+D within the app to toggle Socket.IO debug panel

## Future Improvements

1. Add an auto-reconnect feature for lost Socket.IO connections
2. Enhance the debug panel with more detailed connection metrics
3. Add backend status monitoring in the Electron app's system tray
4. Improve error reporting with automatic log capture
