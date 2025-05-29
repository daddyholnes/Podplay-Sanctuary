/**
 * Socket.IO Advanced Debug and Connection Fixer for Podplay Sanctuary
 * This script helps diagnose and fix Socket.IO connection issues
 */

document.addEventListener('DOMContentLoaded', () => {
  // Create debug panel with controls
  const debugWrapper = document.createElement('div');
  debugWrapper.id = 'socket-io-debug-wrapper';
  debugWrapper.style.cssText = `
    position: fixed;
    bottom: 0;
    right: 0;
    background: rgba(0,0,0,0.85);
    color: white;
    font-family: monospace;
    font-size: 12px;
    z-index: 9999;
    display: none;
    border-top-left-radius: 8px;
    box-shadow: -2px -2px 10px rgba(0,0,0,0.3);
    width: 400px;
  `;
  
  // Create header with controls
  const headerDiv = document.createElement('div');
  headerDiv.style.cssText = `
    padding: 8px;
    background: #333;
    border-top-left-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;
  
  const title = document.createElement('span');
  title.textContent = '🔌 Socket.IO Debug';
  title.style.fontWeight = 'bold';
  
  const buttonContainer = document.createElement('div');
  
  // Fix & Reconnect button
  const fixButton = document.createElement('button');
  fixButton.textContent = 'Fix & Reconnect';
  fixButton.style.cssText = buttonStyle();
  fixButton.onclick = applySocketIOFix;
  
  // Clear log button
  const clearButton = document.createElement('button');
  clearButton.textContent = 'Clear';
  clearButton.style.cssText = buttonStyle();
  clearButton.onclick = () => {
    const debugDiv = document.getElementById('socket-io-debug');
    if (debugDiv) debugDiv.innerHTML = '';
  };
  
  // Close button
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.style.cssText = buttonStyle();
  closeButton.onclick = () => {
    debugWrapper.style.display = 'none';
  };
  
  // Add buttons to container
  buttonContainer.appendChild(fixButton);
  buttonContainer.appendChild(clearButton);
  buttonContainer.appendChild(closeButton);
  
  // Add elements to header
  headerDiv.appendChild(title);
  headerDiv.appendChild(buttonContainer);
  
  // Create debug content area
  const debugDiv = document.createElement('div');
  debugDiv.id = 'socket-io-debug';
  debugDiv.style.cssText = `
    max-height: 300px;
    overflow-y: auto;
    padding: 10px;
  `;
  
  // Add header and content to wrapper
  debugWrapper.appendChild(headerDiv);
  debugWrapper.appendChild(debugDiv);
  document.body.appendChild(debugWrapper);

  // Toggle debug panel with Ctrl+Shift+D (changed from Ctrl+Alt+D)
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      debugWrapper.style.display = debugWrapper.style.display === 'none' ? 'block' : 'none';
    }
  });
  
  // Helper function for consistent button styling
  function buttonStyle() {
    return `
      background: #444;
      border: none;
      color: white;
      padding: 3px 8px;
      border-radius: 3px;
      margin-left: 5px;
      cursor: pointer;
    `;
  }
  // Enhanced log function with severity-based styling
  const log = (message, type = 'info') => {
    const debugDiv = document.getElementById('socket-io-debug');
    if (!debugDiv) return;
    
    const msgEl = document.createElement('div');
    msgEl.className = `socket-message ${type}`;
    msgEl.innerHTML = `[${new Date().toLocaleTimeString()}] ${formatLogMessage(message, type)}`;
    
    // Style based on message type
    switch(type) {
      case 'error':
        msgEl.style.borderLeft = '3px solid #ff5252';
        break;
      case 'success':
        msgEl.style.borderLeft = '3px solid #4caf50';
        break;
      case 'warning':
        msgEl.style.borderLeft = '3px solid #ff9800';
        break;
      default:
        msgEl.style.borderLeft = '3px solid #2196f3';
    }
    
    msgEl.style.paddingLeft = '8px';
    msgEl.style.marginBottom = '3px';
    
    debugDiv.appendChild(msgEl);
    
    // Keep only last 100 messages (increased from 50)
    while (debugDiv.children.length > 100) {
      debugDiv.removeChild(debugDiv.firstChild);
    }
    
    // Auto-scroll to bottom
    debugDiv.scrollTop = debugDiv.scrollHeight;
    
    // Log to console with appropriate styling
    const consoleMethod = type === 'error' ? console.error : 
                          type === 'warning' ? console.warn : console.log;
    consoleMethod(`[Socket.IO Debug] ${message}`);
  };
  
  // Format log message with syntax highlighting
  function formatLogMessage(message, type) {
    if (typeof message === 'object') {
      try {
        return `<span style="color: #a5d6ff;">${JSON.stringify(message, null, 2)}</span>`;
      } catch (e) {
        return `${message}`;
      }
    }
    
    // Highlight URLs
    message = String(message).replace(
      /(https?:\/\/[^\s]+)/g, 
      '<span style="color: #58a6ff; text-decoration: underline;">$1</span>'
    );
    
    // Highlight socket IDs
    message = message.replace(
      /\b([A-Za-z0-9_-]{20,})\b/g, 
      '<span style="color: #79c0ff;">$1</span>'
    );
    
    // Highlight connection states
    message = message.replace(
      /\b(connected|disconnected|error|timeout|reconnect|reconnecting|reconnect_attempt)\b/gi,
      '<span style="color: #d2a8ff; font-weight: bold;">$1</span>'
    );
    
    return message;
  };
  // Apply Socket.IO connection fix
  function applySocketIOFix() {
    if (!window.io) {
      log('Socket.IO not found, cannot apply fix', 'error');
      return false;
    }
    
    log('Applying Socket.IO connection fix...', 'info');
    
    // Store any existing sockets
    window.io._sockets = window.io._sockets || [];
    
    // Override Socket.IO connect with better defaults
    const originalIoConnect = window.io;
    window.io = function(...args) {
      // Extract URL and options
      let url = args[0] || 'http://localhost:5000';
      let options = args[1] || {};
      
      // Log connection attempt
      log(`Socket.IO connection attempt to: ${url}`, 'info');
      log(`Connection options: ${JSON.stringify(options, null, 2)}`, 'info');
      
      // Add improved default options
      const enhancedOptions = {
        transports: ['websocket', 'polling'],  // Try WebSocket first
        path: '/socket.io',                   // Remove trailing slash
        reconnectionAttempts: 5,              // Number of reconnection attempts
        reconnectionDelay: 1000,              // Delay between attempts
        timeout: 20000,                       // Connection timeout
        forceNew: true,                       // Force new connection
        ...options                            // Original options override defaults
      };
      
      log(`Using enhanced options: ${JSON.stringify(enhancedOptions)}`, 'info');
      
      // Create socket with enhanced options
      const socket = originalIoConnect.call(this, url, enhancedOptions);
      window.io._sockets.push(socket);
      
      // Monitor all socket events
      monitorSocket(socket);
      
      return socket;
    };
    
    // Copy all properties from original io
    Object.keys(originalIoConnect).forEach(key => {
      window.io[key] = originalIoConnect[key];
    });
    
    log('Socket.IO connection fix applied successfully!', 'success');
    log('Try reconnecting to see if the issue is resolved', 'info');
    
    // Force reconnect existing sockets if they exist
    if (window.io._sockets && window.io._sockets.length) {
      window.io._sockets.forEach(socket => {
        if (socket && socket.disconnected && typeof socket.connect === 'function') {
          log(`Attempting to reconnect socket: ${socket.id || 'unknown'}`, 'info');
          socket.connect();
        }
      });
    }
    
    return true;
  }
  
  // Monitor all Socket.IO events
  function monitorSocket(socket) {
    if (!socket || socket._monitored) return;
    
    // Mark socket as monitored
    socket._monitored = true;
    
    // Basic connection events
    socket.on('connect', () => {
      log(`Socket connected: ${socket.id}`, 'success');
      
      // Log socket details
      const transport = socket.io?.engine?.transport?.name || 'unknown';
      const protocol = socket.io?.engine?.protocol || 'unknown';
      log(`Socket details: ID=${socket.id}, Transport=${transport}, Protocol=${protocol}`, 'info');
    });
    
    socket.on('connect_error', (error) => {
      log(`Connection error: ${error.message}`, 'error');
      
      // Add transport info if available
      if (socket.io?.engine?.transport) {
        log(`Failed transport: ${socket.io.engine.transport.name}`, 'error');
      }
      
      // Suggest possible fixes
      suggestionBasedOnError(error);
    });
    
    socket.on('disconnect', (reason) => {
      log(`Socket disconnected: ${reason}`, 'warning');
    });
    
    // Connection recovery events
    socket.on('reconnect', (attemptNumber) => {
      log(`Socket reconnected after ${attemptNumber} attempts!`, 'success');
    });
    
    socket.on('reconnect_attempt', (attemptNumber) => {
      log(`Reconnection attempt #${attemptNumber}...`, 'info');
    });
    
    socket.on('reconnect_error', (error) => {
      log(`Reconnection error: ${error.message}`, 'error');
    });
    
    socket.on('reconnect_failed', () => {
      log('Failed to reconnect after all attempts', 'error');
    });
    
    // Special Socket.IO events
    socket.on('ping', () => {
      log('Ping sent to server', 'info');
    });
    
    socket.on('pong', (latency) => {
      log(`Pong received from server (latency: ${latency}ms)`, 'info');
    });
    
    // Add event listener for all events
    const originalOn = socket.on;
    socket.on = function(event, handler) {
      // Don't intercept system events again
      if (!['connect', 'disconnect', 'connect_error', 'reconnect', 
           'reconnect_attempt', 'reconnect_error', 'reconnect_failed',
           'ping', 'pong'].includes(event)) {
        // Add our event logger
        return originalOn.call(this, event, function(...args) {
          log(`Received event '${event}': ${JSON.stringify(args)}`, 'info');
          handler.apply(this, args);
        });
      }
      return originalOn.call(this, event, handler);
    };
    
    // Intercept emit to log outgoing events
    const originalEmit = socket.emit;
    socket.emit = function(event, ...args) {
      if (!event.startsWith('socket.io')) { // Don't log internal Socket.IO events
        log(`Emitting event '${event}': ${JSON.stringify(args)}`, 'info');
      }
      return originalEmit.apply(this, [event, ...args]);
    };
  }
  
  // Provide suggestions based on error types
  function suggestionBasedOnError(error) {
    const errorMsg = error.message.toLowerCase();
    
    if (errorMsg.includes('404') || errorMsg.includes('not found')) {
      log('Suggestion: The Socket.IO server endpoint might not be available or path is wrong', 'warning');
      log('Try checking that the server is running and the path (/socket.io) is correct', 'warning');
    } else if (errorMsg.includes('cors') || errorMsg.includes('origin')) {
      log('Suggestion: This appears to be a CORS issue. The server may need to allow your origin', 'warning');
    } else if (errorMsg.includes('timeout')) {
      log('Suggestion: Connection timed out. Server might be too slow to respond or unreachable', 'warning');
    } else if (errorMsg.includes('transport')) {
      log('Suggestion: Transport error. Try using only polling if websocket is failing', 'warning');
      log('You can try reconnecting with transports: ["polling"] only', 'warning');
    }
  }

  // Monitor for Socket.IO library
  const originalIo = window.io;
  if (originalIo) {
    log('Socket.IO library detected, initializing monitoring', 'info');
    applySocketIOFix();
  } else {
    log('Socket.IO not found, will monitor when loaded', 'warning');
    
    // Monitor for Socket.IO loading
    const originalDefineProperty = Object.defineProperty;
    Object.defineProperty = function(obj, prop, descriptor) {
      if (prop === 'io' && obj === window) {
        log('Socket.IO library loaded!', 'success');
        // Apply fix after a short delay to ensure library is fully initialized
        setTimeout(applySocketIOFix, 100);
      }
      return originalDefineProperty.call(this, obj, prop, descriptor);
    };
  }
  
  // Auto-show debug panel on connection errors in development
  setInterval(() => {
    if (window.io && window.io._sockets) {
      const hasError = window.io._sockets.some(s => 
        s && s._callbacks && s._callbacks['$connect_error']
      );
      
      if (hasError && window.location.hostname === 'localhost') {
        document.getElementById('socket-io-debug-wrapper').style.display = 'block';
      }
    }
  }, 5000);
});
