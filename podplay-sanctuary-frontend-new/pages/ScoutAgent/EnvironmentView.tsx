
import React, { useState, useEffect, useRef } from 'react';
// Monaco Editor imports (if used, ensure it's properly configured)
// import Editor, { Monaco } from "@monaco-editor/react";
// XTerm imports
// import { Terminal } from 'xterm';
// import { FitAddon } from 'xterm-addon-fit';
// import 'xterm/css/xterm.css';
import Icon from '../../components/Icon';
import { useAppStore } from '../../store/useAppStore'; // For currentScoutTask if needed for context
import { useSocket } from '../../hooks/useSocket'; // For real-time file/terminal updates

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  content?: string; // For files
}

// Mock file structure
const mockFiles: FileNode[] = [
  { id: 'src', name: 'src', type: 'directory', children: [
    { id: 'apptsx', name: 'App.tsx', type: 'file', content: 'console.log("Hello from App.tsx");' },
    { id: 'indextsx', name: 'index.tsx', type: 'file', content: 'console.log("Hello from index.tsx");' },
  ]},
  { id: 'packagejson', name: 'package.json', type: 'file', content: '{ "name": "my-app", "version": "1.0.0" }' },
];


const EnvironmentView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'files' | 'editor' | 'terminal'>('files');
  const [files, setFiles] = useState<FileNode[]>(mockFiles); // State for file structure
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [editorContent, setEditorContent] = useState('');
  // const terminalRef = useRef<HTMLDivElement>(null);
  // const xtermRef = useRef<Terminal | null>(null);
  // const fitAddonRef = useRef<FitAddon | null>(null);

  const currentScoutTask = useAppStore(state => state.currentScoutTask);
  const socket = useSocket();

  useEffect(() => {
    if (socket && currentScoutTask?.id) {
        const fileUpdateEvent = `scout-env-file-update:${currentScoutTask.id}`;
        const terminalOutputEvent = `scout-env-terminal-output:${currentScoutTask.id}`;

        socket.on(fileUpdateEvent, (updatedFileStructure: FileNode[]) => {
            console.log('File structure update received:', updatedFileStructure);
            setFiles(updatedFileStructure);
        });

        // socket.on(terminalOutputEvent, (output: string) => {
        //     console.log('Terminal output received:', output);
        //     xtermRef.current?.write(output);
        // });
        // For now, XTerm and Monaco are complex to setup fully. Mocks will be used.

        return () => {
            socket.off(fileUpdateEvent);
            socket.off(terminalOutputEvent);
        };
    }
  }, [socket, currentScoutTask?.id]);


  // Basic XTerm setup (commented out for simplicity, would require proper init and cleanup)
  /*
  useEffect(() => {
    if (activeTab === 'terminal' && terminalRef.current && !xtermRef.current) {
      const term = new Terminal({ convertEol: true, theme: { background: '#1e293b', foreground: '#f1f5f9' } });
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(terminalRef.current);
      fitAddon.fit();
      term.write('Scout Terminal $ ');
      xtermRef.current = term;
      fitAddonRef.current = fitAddon;

      // Example: Listen for data from terminal (e.g., user input)
      // term.onData(data => {
      //   // Send data to backend via socket if needed
      //   socket?.emit('scout-env-terminal-input', { taskId: currentScoutTask?.id, input: data });
      //   // Echo locally for now
      //   term.write(data);
      // });
    }
    // Add cleanup for terminal instance if component unmounts or tab changes
    // return () => { xtermRef.current?.dispose(); xtermRef.current = null; };
  }, [activeTab]);

  // Monaco Editor setup
  // const handleEditorDidMount = (editor: any, monaco: Monaco) => {
  //   // You can store editor instance if needed
  //   console.log("Monaco editor did mount", editor, monaco);
  // };
  */

  const handleFileClick = (file: FileNode) => {
    if (file.type === 'file') {
      setSelectedFile(file);
      setEditorContent(file.content || '');
      setActiveTab('editor');
    }
    // Could expand/collapse directories here too
  };

  const renderFileTree = (nodes: FileNode[], level = 0) => (
    <ul style={{ paddingLeft: `${level * 1}rem` }}>
      {nodes.map(node => (
        <li key={node.id} className="my-0.5">
          <button 
            onClick={() => handleFileClick(node)}
            className={`flex items-center w-full text-left p-1 rounded hover:bg-tertiary-bg text-sm ${selectedFile?.id === node.id && node.type === 'file' ? 'bg-accent-light text-accent' : ''}`}
          >
            <Icon name={node.type === 'directory' ? 'folder' : 'documentText'} className="w-4 h-4 mr-1.5 flex-shrink-0" />
            {node.name}
          </button>
          {node.type === 'directory' && node.children && renderFileTree(node.children, level + 1)}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="h-full flex flex-col bg-secondary-bg border border-border rounded-lg shadow-sm">
      <div className="flex border-b border-border">
        {['files', 'editor', 'terminal'].map((tabName) => (
          <button
            key={tabName}
            onClick={() => setActiveTab(tabName as any)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2
              ${activeTab === tabName ? 'border-accent text-accent' : 'border-transparent text-text-muted hover:text-text-primary hover:border-gray-300'}`}
          >
            {tabName}
          </button>
        ))}
      </div>
      <div className="flex-grow overflow-auto p-2 custom-scrollbar">
        {activeTab === 'files' && (
          <div>
            <h4 className="font-semibold text-text-primary mb-1">File Explorer</h4>
            {files.length > 0 ? renderFileTree(files) : <p className="text-xs text-text-muted">No files yet. Scout is working...</p>}
          </div>
        )}
        {activeTab === 'editor' && (
          <div>
            <h4 className="font-semibold text-text-primary mb-1">
              Editor: {selectedFile ? selectedFile.name : 'No file selected'}
            </h4>
            {selectedFile ? (
              <textarea
                value={editorContent}
                // onChange={(e) => setEditorContent(e.target.value)} // Read-only for now, or implement saving
                readOnly
                className="w-full h-[calc(100%-2rem)] p-2 font-mono text-sm bg-primary-bg border border-border rounded focus:outline-none focus:ring-1 focus:ring-accent"
                rows={20}
              />
              // <Editor height="calc(100% - 2rem)" defaultLanguage="javascript" value={editorContent} theme={useAppStore.getState().theme === 'dark' ? "vs-dark" : "light"} onMount={handleEditorDidMount} />
            ) : (
              <p className="text-xs text-text-muted">Select a file from the explorer to view its content.</p>
            )}
          </div>
        )}
        {activeTab === 'terminal' && (
          <div>
            <h4 className="font-semibold text-text-primary mb-1">Terminal</h4>
            {/* <div ref={terminalRef} className="h-[calc(100%-2rem)] bg-gray-800 text-white p-2 rounded font-mono text-sm"></div> */}
            <div className="h-[calc(100%-2rem)] bg-primary-bg text-text-primary p-2 rounded font-mono text-sm border border-border">
              <p>&gt; npm install react</p>
              <p className="text-green-500">react installed successfully.</p>
              <p>&gt; npm run dev</p>
              <p>Development server running on http://localhost:3000</p>
              <p className="text-text-muted">(Terminal is a mock, real XTerm.js integration is pending)</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnvironmentView;
