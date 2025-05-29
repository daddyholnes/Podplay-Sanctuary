// Socket.IO connection debugger for Podplay Sanctuary
// This script helps diagnose Socket.IO connection issues

document.addEventListener('DOMContentLoaded', () => {
  const debugDiv = document.createElement('div');
  debugDiv.id = 'socket-io-debug';
  debugDiv.style.cssText = `
    position: fixed;
    bottom: 0;
    right: 0;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 10px;
    font-family: monospace;
    font-size: 12px;
    max-height: 200px;
    width: 300px;
    overflow-y: auto;
    z-index: 9999;
    display: none;
  `;
  document.body.appendChild(debugDiv);

  // Toggle debug panel with Ctrl+Alt+D
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && e.key === 'd') {
      debugDiv.style.display = debugDiv.style.display === 'none' ? 'block' : 'none';
    }
  });

  // Log function
  const log = (message, type = 'info') => {
    const msgEl = document.createElement('div');
    msgEl.className = `socket-message ${type}`;
    msgEl.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    debugDiv.appendChild(msgEl);
    
    // Keep only last 50 messages
    while (debugDiv.children.length > 50) {
      debugDiv.removeChild(debugDiv.firstChild);
    }
    
    // Auto-scroll to bottom
    debugDiv.scrollTop = debugDiv.scrollHeight;
    
    console.log(`[Socket.IO Debug] ${message}`);
  };

  // Monitor Socket.IO
  const originalIo = window.io;
  if (originalIo) {
    window.io = function(...args) {
      log(`Socket.IO connection attempt: ${JSON.stringify(args)}`);
      
      const socket = originalIo.apply(this, args);
      
      socket.on('connect', () => {
        log(`Socket connected: ${socket.id}`, 'success');
      });
      
      socket.on('connect_error', (error) => {
        log(`Connection error: ${error.message}`, 'error');
      });
      
      socket.on('disconnect', (reason) => {
        log(`Socket disconnected: ${reason}`, 'info');
      });
      
      socket.on('reconnect_attempt', (attemptNumber) => {
        log(`Reconnection attempt #${attemptNumber}`, 'info');
      });
      
      return socket;
    };
    
    // Copy properties from original io
    Object.keys(originalIo).forEach(key => {
      window.io[key] = originalIo[key];
    });
    
    log('Socket.IO monitoring initialized');
  } else {
    log('Socket.IO not found, will monitor when loaded', 'warning');
    
    // Monitor for Socket.IO loading
    const originalDefineProperty = Object.defineProperty;
    Object.defineProperty = function(obj, prop, descriptor) {
      if (prop === 'io' && obj === window) {
        log('Socket.IO loaded', 'success');
      }
      return originalDefineProperty.call(this, obj, prop, descriptor);
    };
  }
});
