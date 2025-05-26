import React, { useEffect, useRef, useState } from 'react';
// import { Terminal } from 'xterm'; // Will be imported when xterm is installed
// import 'xterm/css/xterm.css'; // CSS for xterm.js

interface WebTerminalComponentProps {
  workspaceId: string;
  websocketUrl: string; // e.g., wss://localhost:5001/ws/workspaces/{workspaceId}/terminal
  isOpen: boolean; // To control connection and visibility
  onClose?: () => void; // Optional: Callback when terminal is programmatically closed or connection fails badly
}

const WebTerminalComponent: React.FC<WebTerminalComponentProps> = ({
  workspaceId,
  websocketUrl,
  isOpen,
  onClose,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  // const [terminal, setTerminal] = useState<Terminal | null>(null); // xterm.js Terminal instance
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && terminalRef.current && !socket) {
      console.log(`WebTerminalComponent (${workspaceId}): Initializing terminal and WebSocket to ${websocketUrl}`);
      
      // Placeholder for xterm.js initialization
      // const term = new Terminal({ cursorBlink: true, rows: 24, cols: 80 });
      // term.open(terminalRef.current);
      // setTerminal(term);
      console.log(`WebTerminalComponent (${workspaceId}): Xterm.js would be initialized here.`);
      terminalRef.current.innerHTML = `<p style="color:lightgray; padding:10px;">xterm.js placeholder for workspace ${workspaceId}.<br/>Target: ${websocketUrl}</p>`;
      terminalRef.current.style.backgroundColor = 'black';
      terminal_current_style_height = '300px'; // Placeholder height


      const ws = new WebSocket(websocketUrl);
      setSocket(ws);

      ws.onopen = () => {
        console.log(`WebTerminalComponent (${workspaceId}): WebSocket connected to ${websocketUrl}`);
        setIsConnected(true);
        setError(null);
        // term?.writeln('WebSocket connection established.');
        // Optionally send an initial message, e.g., auth token or PTY settings
        // ws.send(JSON.stringify({ type: 'auth', token: 'your_jwt_token' })); // Example
        // ws.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }));
      };

      ws.onmessage = (event) => {
        // Assuming backend sends data in a specific structure, e.g., { type: 'terminal_out', output: '...' }
        // For now, let's assume raw data is terminal output
        const data = event.data;
        console.log(`WebTerminalComponent (${workspaceId}): WebSocket message received:`, data.substring(0,100));
        // term?.write(data);
        if (terminalRef.current) { // Simple append for placeholder
            const line = document.createElement('p');
            line.style.color = 'lightgray';
            line.textContent = data;
            terminalRef.current.appendChild(line);
        }
      };

      ws.onerror = (err) => {
        console.error(`WebTerminalComponent (${workspaceId}): WebSocket error:`, err);
        setError('WebSocket connection error. Check console for details.');
        // term?.writeln('\r\nWebSocket connection error.');
        setIsConnected(false);
      };

      ws.onclose = (event) => {
        console.log(`WebTerminalComponent (${workspaceId}): WebSocket disconnected. Code: ${event.code}, Reason: ${event.reason}`);
        setIsConnected(false);
        // term?.writeln('\r\nWebSocket connection closed.');
        if (onClose) {
          onClose();
        }
      };

      // Setup xterm.js onData listener
      // term.onData((data) => {
      //   if (ws && ws.readyState === WebSocket.OPEN) {
      //     ws.send(JSON.stringify({ type: 'terminal_in', input: data }));
      //   }
      // });
      // term.onResize(({ cols, rows }) => {
      //   if (ws && ws.readyState === WebSocket.OPEN) {
      //     ws.send(JSON.stringify({ type: 'resize', cols, rows }));
      //   }
      // });


      return () => { // Cleanup on component unmount or if isOpen/websocketUrl changes
        console.log(`WebTerminalComponent (${workspaceId}): Cleaning up terminal and WebSocket.`);
        if (ws) {
          ws.close();
        }
        // if (term) {
        //   term.dispose();
        // }
        // setTerminal(null);
        setSocket(null);
        setIsConnected(false);
      };
    } else if (!isOpen && socket) {
      // If isOpen becomes false and socket exists, close it.
      console.log(`WebTerminalComponent (${workspaceId}): isOpen is false, closing WebSocket.`);
      socket.close();
      // Terminal disposal is handled by the main return () => {} from useEffect
    }
  }, [isOpen, websocketUrl, workspaceId, socket, onClose]); // Added socket, onClose to dependency array

  if (!isOpen) {
    return null;
  }

  return (
    <div className="webTerminalContainer">
      <h4>Terminal for Workspace: {workspaceId}</h4>
      {error && <p className="errorMessage terminalError">Terminal Error: {error}</p>}
      {!isConnected && !error && <p>Connecting to terminal...</p>}
      <div ref={terminalRef} className="terminalInstance" style={{ height: '300px', backgroundColor: '#1e1e1e', padding: '5px' }}>
        {/* xterm.js will attach here */}
      </div>
    </div>
  );
};

export default WebTerminalComponent;
