import React, { useState, useCallback, useRef } from 'react';
import { ChevronRight, File, Folder, Download, RefreshCw, X, Minimize2, Maximize2, MoreVertical } from 'lucide-react';

const WorkspaceLayout = () => {
  const [leftPanelWidth, setLeftPanelWidth] = useState(320);
  const [chatWindow, setChatWindow] = useState({
    x: 20,
    y: 20,
    width: 400,
    height: 500,
    isMinimized: false,
    isDragging: false
  });
  const [selectedFile, setSelectedFile] = useState('env.txt');
  const [expandedFolders, setExpandedFolders] = useState(new Set(['root']));
  
  const dragRef = useRef(null);
  const resizeRef = useRef(null);
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0 });

  // File structure
  const files = [
    { name: 'env.txt', type: 'file', icon: '📄' },
    { name: 'multi-llm-app-architecture.png', type: 'file', icon: '🖼️' },
    { name: 'multi-llm-app-plan.md', type: 'file', icon: '📝' },
    { name: 'multi-llm-app-system-requirements.md', type: 'file', icon: '📋' },
    { name: 'multi-llm-app-tech-stack.png', type: 'file', icon: '🖼️' },
    { name: 'multi-llm-app-timeline.png', type: 'file', icon: '📊' },
    { name: 'multi-llm-app-ui-mockup.png', type: 'file', icon: '🎨' }
  ];

  // Sample file content
  const fileContent = {
    'env.txt': `Yo, my dawg! 🅰️ My bad for the mix-up—thanks for clarifying! I got you. You're not
building a LibreChat config; you're putting together a single, comprehensive \`.env\`
file to hand off to a dev agent, showcasing your full "firepower" (all your API
keys, credentials, and service configs) for building an app. This is about building
provided files (\`creds-backup.txt\`, \`endpj.txt\`, \`example\`, \`low-mode.txt\`,
\`podplay-env.txt\`, \`access-points.txt\`, \`creds.text\`) into one clean \`.env\` file
client_secret_742797357300-kah0gontevicchkmpm18ok5vcmj6qbbb.apps.googleusercontent.
com.json\`, \`cred-alt.txt\` into one clean \`.env\` file, stripping out
LibreChat-specific assumptions, removing duplicates, resolving conflicts, and
organizing everything to clearly display your arsenal of services and credentials.
This will be a straightforward, all-in-one resource for your dev agent to understand
your capabilities and build the app.

### What I'm Doing
- **Merge All Files**: Combining the eight files into a single \`.env\` file,
  including every unique variable and credential.
- **Resolve Bigger**: Selecting the most recent discrepancies (e.g., multiple
  \`GOOGLE_CLIENT_ID\` values) and flagging for your confirmation where needed.
- **Organize Variables**: Grouping variables by service/category (e.g., Azure, Google, AWS,
  Social Auth) for clarity, so your dev agent can easily see your firepower.
- **Including All Services**: Capturing every API key, token, and config, from
  OpenAI to Gemini, Google, to show the full scope of your resources.
- **Formatting for Dev Agent**: Keeping the \`.env\` format clean and parseable, ready
  for your agent to use in app development or to feed into another AI or workflow
  setup.
- **Handling Sensitive Data**: Ensuring all credentials are included as provided,
  but I'll remind you to secure this file since it contains sensitive keys.

### Notes on Conflicts/Discrepancies
- **GOOGLE API**: Found in env.txt \`AI2aSyAei4dqmW1XhtxGGFHd1lQxoS.ZeZfV4\`,
  while others use \`AI2aSy0FG3-6NjqATLufuchReM54YE9zAK8eq\`. I'm using the latter
  (more frequent) but need your confirmation.
- **GOOGLE_CLIENT_ID**: \`access-POINTS.txt\`, \`creds.text\`, and \`cred-2.txt\` use
  \`551524322079-vqgchqsdedqj7dub4k23rfavp14357l.apps.googleusercontent.com\`, but the
  JSON file has \`742797357300-kah0gontevicchkmpm18ok5vcmj6qbbb.apps.googleusercontent.
  com\`. I'm including both as \`GOOGLE_CLIENT_ID\` and \`GOOGLE_CLIENT_ID_ALT\`; please
  confirm which is correct.
- **AZURE OPENAI API VERSION**: \`2025-01-01-preview\` in \`access-POINTS.txt\` and`
  };

  // Handle chat window dragging
  const handleMouseDown = useCallback((e) => {
    if (e.target.closest('.chat-header')) {
      isDragging.current = true;
      startPos.current = {
        x: e.clientX - chatWindow.x,
        y: e.clientY - chatWindow.y
      };
    }
  }, [chatWindow.x, chatWindow.y]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging.current) {
      setChatWindow(prev => ({
        ...prev,
        x: Math.max(0, Math.min(window.innerWidth - prev.width, e.clientX - startPos.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - prev.height, e.clientY - startPos.current.y))
      }));
    }
    if (isResizing.current) {
      setChatWindow(prev => ({
        ...prev,
        width: Math.max(300, Math.min(800, startSize.current.width + (e.clientX - startPos.current.x))),
        height: Math.max(200, Math.min(600, startSize.current.height + (e.clientY - startPos.current.y)))
      }));
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    isResizing.current = false;
  }, []);

  // Handle resize start
  const handleResizeStart = useCallback((e) => {
    e.stopPropagation();
    isResizing.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    startSize.current = { width: chatWindow.width, height: chatWindow.height };
  }, [chatWindow.width, chatWindow.height]);

  // Handle panel resize
  const handlePanelResize = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const newWidth = Math.max(200, Math.min(500, e.clientX - rect.left));
    setLeftPanelWidth(newWidth);
  }, []);

  React.useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Left Panel - File Explorer */}
      <div 
        className="relative border-r border-purple-500/30"
        style={{ width: leftPanelWidth }}
      >
        <div className="h-full flex flex-col bg-slate-900/90 backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-purple-500/30">
            <div className="flex items-center gap-2">
              <span className="text-purple-400 text-sm font-medium">📁</span>
              <span className="text-sm font-medium text-purple-100">Files</span>
            </div>
            <div className="flex gap-1">
              <button className="p-1 text-purple-400 hover:text-purple-300 rounded">
                <MoreVertical size={14} />
              </button>
            </div>
          </div>

          {/* File List */}
          <div className="flex-1 overflow-auto p-2">
            <div className="space-y-1">
              {files.map((file) => (
                <div
                  key={file.name}
                  onClick={() => setSelectedFile(file.name)}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                    selectedFile === file.name 
                      ? 'bg-purple-600/30 text-purple-100' 
                      : 'text-purple-300 hover:bg-purple-800/20 hover:text-purple-200'
                  }`}
                >
                  <span className="text-xs">{file.icon}</span>
                  <span className="text-sm font-mono truncate">{file.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resize Handle */}
        <div 
          className="absolute top-0 right-0 w-1 h-full cursor-ew-resize bg-purple-500/20 hover:bg-purple-500/40 transition-colors"
          onMouseDown={(e) => {
            e.preventDefault();
            const startX = e.clientX;
            const startWidth = leftPanelWidth;
            
            const handleMouseMove = (e) => {
              const newWidth = Math.max(200, Math.min(500, startWidth + (e.clientX - startX)));
              setLeftPanelWidth(newWidth);
            };
            
            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        />
      </div>

      {/* Right Panel - Preview */}
      <div className="flex-1 flex flex-col bg-slate-800/90 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-500/30">
          <div className="flex items-center gap-2">
            <span className="text-purple-400 text-sm">📄</span>
            <span className="text-sm font-medium text-purple-100">{selectedFile}</span>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors">
              <RefreshCw size={14} className="inline mr-1" />
              Refresh
            </button>
            <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors">
              <Download size={14} className="inline mr-1" />
              Download
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="bg-slate-900/50 rounded-lg p-4 font-mono text-sm">
            <pre className="whitespace-pre-wrap text-purple-100 leading-relaxed">
              {fileContent[selectedFile] || 'File content will appear here...'}
            </pre>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-purple-500/30 bg-slate-900/50">
          <div className="flex items-center gap-4 text-xs text-purple-400">
            <span>Lines: {fileContent[selectedFile]?.split('\n').length || 0}</span>
            <span>UTF-8</span>
          </div>
          <div className="flex gap-2">
            <button className="text-purple-400 hover:text-purple-300">
              <span className="text-xs">Send element ⚡</span>
            </button>
            <button className="text-purple-400 hover:text-purple-300">
              <span className="text-xs">Send console errors (0)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Chat Window */}
      {!chatWindow.isMinimized && (
        <div
          ref={dragRef}
          className="fixed bg-slate-900/95 backdrop-blur-md rounded-lg shadow-2xl border border-purple-500/30 overflow-hidden"
          style={{
            left: chatWindow.x,
            top: chatWindow.y,
            width: chatWindow.width,
            height: chatWindow.height,
            zIndex: 1000
          }}
          onMouseDown={handleMouseDown}
        >
          {/* Chat Header */}
          <div className="chat-header bg-gradient-to-r from-purple-600 to-pink-600 p-3 cursor-move">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">💝 Scout Assistant</span>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => setChatWindow(prev => ({ ...prev, isMinimized: true }))}
                  className="p-1 hover:bg-white/20 rounded text-xs"
                >
                  <Minimize2 size={12} />
                </button>
                <button className="p-1 hover:bg-white/20 rounded text-xs">
                  <X size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 p-4 bg-slate-900/90" style={{ height: chatWindow.height - 120 }}>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-3 border border-purple-500/30">
                <p className="text-sm text-purple-100">
                  Hi love! I'm here to help you build something amazing. What shall we create today? 💝💝
                </p>
                <span className="text-xs text-purple-400 mt-2 block">14:15:13</span>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-purple-500/30 bg-slate-800/90">
            <div className="flex gap-2">
              <button className="text-purple-400 hover:text-purple-300">😊</button>
              <button className="text-purple-400 hover:text-purple-300">📎</button>
              <input 
                type="text" 
                placeholder="Type a message..."
                className="flex-1 bg-slate-700/50 border border-purple-500/30 rounded px-3 py-1 text-sm focus:outline-none focus:border-purple-400"
              />
              <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors">
                ▶
              </button>
            </div>
          </div>

          {/* Resize Handle */}
          <div
            ref={resizeRef}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            onMouseDown={handleResizeStart}
          >
            <div className="w-full h-full bg-purple-500/30 hover:bg-purple-500/50" 
                 style={{ clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)' }} />
          </div>
        </div>
      )}

      {/* Minimized Chat Button */}
      {chatWindow.isMinimized && (
        <button
          onClick={() => setChatWindow(prev => ({ ...prev, isMinimized: false }))}
          className="fixed bottom-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
          style={{ zIndex: 1000 }}
        >
          <span className="text-sm">💝</span>
        </button>
      )}
    </div>
  );
};

export default WorkspaceLayout;