import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import io, { Socket } from 'socket.io-client';

interface WebTerminalComponentProps {
  workspaceId: string;
  baseSocketUrl: string; // This is the base URL like http://localhost:5000
  isOpen: boolean;
  onClose: () => void;
}

const WebTerminalComponent: React.FC<WebTerminalComponentProps> = ({
  workspaceId,
  baseSocketUrl, // e.g., http://localhost:5000
  isOpen,
  onClose,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermInstanceRef = useRef<Terminal | null>(null); // Renamed to avoid conflict
  const socketInstanceRef = useRef<Socket | null>(null); // Renamed
  const fitAddonInstanceRef = useRef<FitAddon | null>(null); // Renamed

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const connectToTerminal = useCallback(() => {
    if (!terminalRef.current || !workspaceId || !baseSocketUrl) {
      console.error("WebTerminalComponent: Missing refs or props for connection.");
      return;
    }

    // Dispose previous instances if any
    if (socketInstanceRef.current) socketInstanceRef.current.disconnect();
    if (xtermInstanceRef.current) xtermInstanceRef.current.dispose();
    
    const fullWebsocketUrl = `${baseSocketUrl.startsWith('http') ? baseSocketUrl.replace(/^http/, 'ws') : baseSocketUrl}/terminal_ws`;
    console.log(`WebTerminalComponent: Initializing for workspace ${workspaceId} at ${fullWebsocketUrl} (base: ${baseSocketUrl})`);

    const term = new Terminal({
      cursorBlink: true,
      convertEol: true,
      fontFamily: 'Menlo, Consolas, "Liberation Mono", monospace',
      fontSize: 14,
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#d4d4d4',
        selectionBackground: '#525252',
      },
      rows: 20, // Default rows
    });
    const fitAddon = new FitAddon();

    xtermInstanceRef.current = term;
    fitAddonInstanceRef.current = fitAddon;
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    
    try {
        fitAddon.fit(); // Initial fit
    } catch (e) {
        console.warn("Initial fitAddon.fit() failed, possibly due to terminal not fully visible yet.", e);
        // It's common for fit() to fail if the element isn't fully rendered and sized.
        // It will be called again on window resize or explicit call.
    }


    // The namespace is /terminal_ws, appended to the baseSocketUrl
    // Ensure baseSocketUrl is correctly formatted (e.g. http://localhost:5000)
    // The io client will handle ws/wss protocol negotiation based on the page's protocol or the URL.
    const socket = io(baseSocketUrl + '/terminal_ws', { // Connect to the specific namespace path
      path: '/socket.io', // Default for Flask-SocketIO
      transports: ['websocket'],
      reconnectionAttempts: 3,
      // Note: 'namespace' option is not needed here as it's part of the URL path.
    });
    socketInstanceRef.current = socket;

    socket.on('connect', () => {
      console.log(`Terminal WebSocket connected: ${socket.id} for workspace ${workspaceId}`);
      setIsConnected(true);
      setError(null);
      term.writeln(`\x1b[1;32mWebSocket connected to ${workspaceId}. Joining terminal session...\x1b[0m`);
      socket.emit('join_workspace_terminal', { workspace_id: workspaceId });
    });

    socket.on('terminal_ready_ack', (data: { message: string }) => {
      console.log('Terminal ack:', data.message);
      term.writeln(`\x1b[1;33m Backend: ${data.message}\x1b[0m`);
    });

    socket.on('terminal_ready', (data: { message: string }) => {
      console.log('Terminal ready from backend:', data.message);
      term.writeln(`\x1b[1;32m${data.message}\x1b[0m`);
      // Resize after ready
      if (fitAddonInstanceRef.current && xtermInstanceRef.current?.element) {
        try {
            fitAddonInstanceRef.current.fit();
            const { cols, rows } = fitAddonInstanceRef.current.proposeDimensions() || { cols: 80, rows: 24 };
            socket.emit('terminal_resize', { cols, rows });
        } catch (e) {
            console.warn("fitAddon.fit() or resize emit failed after terminal_ready.", e);
        }
      }
    });

    socket.on('terminal_out', (data: { output: string }) => {
      term.write(data.output);
    });

    socket.on('terminal_error', (data: { error: string }) => {
      console.error('Terminal WebSocket error from server:', data.error);
      setError(data.error);
      term.writeln(`\x1b[1;31mSERVER ERROR: ${data.error}\x1b[0m`);
    });

    socket.on('terminal_closed', (data: { message: string }) => {
      console.log('Terminal WebSocket closed by server:', data.message);
      setError(data.message || 'Connection closed by server');
      term.writeln(`\x1b[1;31m${data.message || 'Connection closed by server.'}\x1b[0m`);
      setIsConnected(false);
    });

    socket.on('disconnect', (reason: string) => {
      console.log('Terminal WebSocket disconnected:', reason);
      setError(`Disconnected: ${reason}`);
      if (xtermInstanceRef.current) {
        xtermInstanceRef.current.writeln(`\x1b[1;31mWebSocket disconnected: ${reason}. Attempting to reconnect if configured.\x1b[0m`);
      }
      setIsConnected(false);
    });

    socket.on('connect_error', (err: Error) => {
      console.error('Terminal WebSocket connection error:', err);
      setError(`Connection Error: ${err.message}`);
      if (xtermInstanceRef.current) {
        xtermInstanceRef.current.writeln(`\x1b[1;31mWebSocket Connection Error: ${err.message}\x1b[0m`);
      }
      setIsConnected(false);
    });

    term.onData((data) => {
      if (socketInstanceRef.current && socketInstanceRef.current.connected) {
        socketInstanceRef.current.emit('terminal_in', { input: data });
      } else {
        console.warn("Socket not connected, cannot send data:", data);
      }
    });
    
    term.onResize(({ cols, rows }) => {
      if (socketInstanceRef.current && socketInstanceRef.current.connected) {
        socketInstanceRef.current.emit('terminal_resize', { cols, rows });
      }
    });
  }, [workspaceId, baseSocketUrl]); // Dependencies for re-establishing connection if these change

  useEffect(() => {
    if (isOpen) {
      connectToTerminal();
    } else {
      // Cleanup when modal is closed
      if (socketInstanceRef.current) {
        socketInstanceRef.current.disconnect();
        socketInstanceRef.current = null;
      }
      if (xtermInstanceRef.current) {
        xtermInstanceRef.current.dispose();
        xtermInstanceRef.current = null;
      }
      fitAddonInstanceRef.current = null; // Clear addon ref
      setIsConnected(false);
      setError(null);
    }
    // This return is for cleaning up when the component itself unmounts,
    // or when dependencies of connectToTerminal change causing it to re-run.
    return () => {
      if (socketInstanceRef.current) {
        socketInstanceRef.current.disconnect();
      }
      if (xtermInstanceRef.current) {
        xtermInstanceRef.current.dispose();
      }
    };
  }, [isOpen, connectToTerminal]);


  // Fit terminal on window resize
  useEffect(() => {
    const handleResize = () => {
      if (fitAddonInstanceRef.current && xtermInstanceRef.current?.element && isOpen) {
         try {
            fitAddonInstanceRef.current.fit();
         } catch(e) {
            console.warn("fitAddon.fit() on window resize failed.", e);
         }
      }
    };
    if (isOpen) {
        window.addEventListener('resize', handleResize);
        // Also fit once when it becomes open, after a short delay for modal to render
        setTimeout(handleResize, 100); 
    }
    return () => {
        window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);


  if (!isOpen) {
    return null;
  }

  return (
    <div className="web-terminal-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="web-terminal-modal-content" onClick={(e) => e.stopPropagation()} style={{width: '80vw', height: '70vh', backgroundColor: '#1e1e1e', display: 'flex', flexDirection: 'column'}}>
        <div className="web-terminal-header" style={{padding: '5px 10px', backgroundColor: '#333', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '1em' }}>Terminal: {workspaceId}</h3>
          <button onClick={onClose} style={{background: 'none', border: 'none', color: '#fff', fontSize: '1.2em', cursor: 'pointer'}}>&times;</button>
        </div>
        <div className="terminal-status" style={{padding: '3px 10px', fontSize: '0.8em', backgroundColor: isConnected ? '#28a745' : '#dc3545', color: 'white'}}>
          Status: {isConnected ? "Connected" : "Disconnected"}
          {error && <span style={{ marginLeft: '10px' }}>Error: {error}</span>}
        </div>
        <div ref={terminalRef} style={{ flexGrow: 1, padding: '5px', overflow: 'hidden' }} />
      </div>
    </div>
  );
};

export default WebTerminalComponent;
