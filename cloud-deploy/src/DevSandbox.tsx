// Local Development Sandbox - Agent-Controlled Virtual Dev Environments
// Integrated with Vertex Garden for AI-Powered Development
// Enhanced with Mama Bear Chat Integration

import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import io, { Socket } from 'socket.io-client';
import MultimodalInput from './components/MultimodalInput';
import CloudBrowser from './components/CloudBrowser';
import { buildApiUrl, API_ENDPOINTS } from './config/api';
import './DevSandbox.css';

interface DevEnvironment {
  id: string;
  name: string;
  type: 'web' | 'python' | 'node' | 'react' | 'nextjs' | 'custom';
  status: 'creating' | 'running' | 'stopped' | 'error';
  containerId?: string;
  workspaceId?: string; // For NixOS workspaces
  port: number;
  previewUrl: string;
  workspaceRoot: string;
  installedPackages: string[];
  environmentVariables: Record<string, string>;
  createdAt: string;
  lastAccessed: string;
  deploymentMode?: 'local' | 'cloud' | 'nixos';
}

interface NixOSWorkspace {
  id: string;
  name: string;
  status: 'creating' | 'running' | 'stopped' | 'error';
  memoryMB: number;
  vcpus: number;
  sshHost?: string;
  sshPort?: number;
  createdAt: string;
  lastAccessed: string;
}

// These interfaces are commented out as they are currently unused
// interface ScoutAgentStatus {
//   isActive: boolean;
//   currentPlan?: string;
//   lastActivity: string;
//   projectId?: string;
//   totalActions: number;
//   successfulActions: number;
//   failedActions: number;
// }

// interface ScoutLogEntry {
//   id: string;
//   timestamp: string;
//   level: 'info' | 'warning' | 'error' | 'debug';
//   message: string;
//   projectId?: string;
//   action?: string;
//   metadata?: Record<string, any>;
// }

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  lastModified?: string;
  children?: FileNode[];
  isExpanded?: boolean;
  content?: string;
}

interface TerminalSession {
  id: string;
  environmentId: string;
  isActive: boolean;
  output: string[];
  currentDirectory: string;
  shellType: string;
  pid?: number;
}

interface LivePreview {
  environmentId: string;
  url: string;
  status: 'loading' | 'ready' | 'error';
  lastUpdate: string;
  autoRefresh: boolean;
}

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  environmentContext?: string;
}

const DevSandbox: React.FC = () => {
  // ==================== REFS ====================
  const socketRef = useRef<Socket | null>(null);

  // ==================== ENVIRONMENT STATE ====================
  const [environments, setEnvironments] = useState<DevEnvironment[]>([]);
  const [activeEnvironment, setActiveEnvironment] = useState<DevEnvironment | null>(null);
  const [showEnvironmentCreator, setShowEnvironmentCreator] = useState(false);

  // ==================== NIXOS WORKSPACE STATE ====================
  const [, /* setActiveWorkspace */] = useState<NixOSWorkspace | null>(null);
  const [/* nixosWorkspaces */, /* setNixosWorkspaces */] = useState<NixOSWorkspace[]>([]);

  // ==================== FILE SYSTEM STATE ====================
  const [fileTree, setFileTree] = useState<FileNode | null>(null);
  const [openFiles, setOpenFiles] = useState<{ path: string; content: string; language: string; isDirty: boolean }[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);

  // ==================== EDITOR STATE ====================
  const [currentEditorContent, setCurrentEditorContent] = useState('');
  const [currentEditorLanguage, setCurrentEditorLanguage] = useState('typescript');

  // ==================== TERMINAL STATE ====================
  const [terminalSessions, setTerminalSessions] = useState<TerminalSession[]>([]);
  const [activeTerminal, setActiveTerminal] = useState<TerminalSession | null>(null);
  const [terminalInput, setTerminalInput] = useState('');

  // ==================== PREVIEW STATE ====================
  const [livePreview, setLivePreview] = useState<LivePreview | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // ==================== UI STATE ====================
  const [layout, setLayout] = useState<'editor' | 'split' | 'preview'>('split');
  const [leftPanelWidth, setLeftPanelWidth] = useState(300);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(200);
  const [showChat, setShowChat] = useState(true);
  const [chatPanelWidth, setChatPanelWidth] = useState(400);
  
  // ==================== CLOUD BROWSER STATE ====================
  const [showCloudBrowser, setShowCloudBrowser] = useState(false);
  const [cloudBrowserMode, setCloudBrowserMode] = useState<'inline' | 'modal' | 'popup'>('inline');
  const [cloudEnvironment, setCloudEnvironment] = useState<any>(null);
  
  // ==================== MAMA BEAR CHAT STATE ====================
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // ==================== RESIZE HANDLERS ====================
  const [isResizing, setIsResizing] = useState(false);
  
  const handleLeftPanelResize = (newWidth: number) => {
    setLeftPanelWidth(Math.max(200, Math.min(600, newWidth)));
  };

  const handleBottomPanelResize = (newHeight: number) => {
    setBottomPanelHeight(Math.max(150, Math.min(500, newHeight)));
  };

  const handleChatPanelResize = (newWidth: number) => {
    setChatPanelWidth(Math.max(300, Math.min(600, newWidth)));
  };

  const startVerticalResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startWidth = leftPanelWidth;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX);
      handleLeftPanelResize(newWidth);
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.classList.remove('resizing');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.body.classList.add('resizing');
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const startHorizontalResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    
    const startY = e.clientY;
    const startHeight = bottomPanelHeight;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newHeight = startHeight + (startY - moveEvent.clientY);
      handleBottomPanelResize(newHeight);
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.classList.remove('resizing');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.body.classList.add('resizing');
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const startChatResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startWidth = chatPanelWidth;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (startX - moveEvent.clientX);
      handleChatPanelResize(newWidth);
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.classList.remove('resizing');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.body.classList.add('resizing');
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // ==================== CHAT FUNCTIONS ====================
  
  const sendChatMessage = async (message: string) => {
    if (!message.trim()) return;
    
    setIsChatLoading(true);
    
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      content: message,
      role: 'user',
      timestamp: new Date().toISOString(),
      environmentContext: activeEnvironment?.id
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.MAMA_BEAR.CHAT), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          context: {
            environment: activeEnvironment,
            openFiles: openFiles.map(f => ({ path: f.path, language: f.language })),
            currentFile: activeFile,
            terminalOutput: terminalSessions.find(t => t.isActive)?.output || []
          }
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: `msg_${Date.now()}_assist`,
          content: data.response,
          role: 'assistant',
          timestamp: new Date().toISOString(),
          environmentContext: activeEnvironment?.id
        };
        
        setChatMessages(prev => [...prev, assistantMessage]);
        
        // Execute any environment commands if suggested
        if (data.actions) {
          for (const action of data.actions) {
            await executeEnvironmentAction(action);
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsChatLoading(false);
    }
  };
  
  const handleChatSend = async () => {
    if (chatInput.trim()) {
      await sendChatMessage(chatInput);
    }
  };
  
  const executeEnvironmentAction = async (action: any) => {
    switch (action.type) {
      case 'create_file':
        await createFile(action.path, action.content || '');
        break;
      case 'run_command':
        if (activeTerminal) {
          await executeTerminalCommand(action.command);
        }
        break;
      case 'create_environment':
        await createLocalEnvironment(action.type, action.name, action.template);
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  // ==================== ENVIRONMENT MANAGEMENT ====================
  
  // Helper functions
  const generateEnvironmentId = () => `env_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const getAvailablePort = async () => {
    // For now, return a random port between 3000-9000
    return Math.floor(Math.random() * 6000) + 3000;
  };

  const getLanguageFromPath = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'yml': 'yaml',
      'yaml': 'yaml'
    };
    return langMap[ext || ''] || 'plaintext';
  };

  const shouldRefreshPreview = (filePath: string): boolean => {
    const previewExtensions = ['html', 'css', 'js', 'ts', 'jsx', 'tsx'];
    const ext = filePath.split('.').pop()?.toLowerCase();
    return previewExtensions.includes(ext || '');
  };

  const refreshPreview = () => {
    if (livePreview) {
      setLivePreview(prev => prev ? {
        ...prev,
        lastUpdate: new Date().toISOString(),
        status: 'loading'
      } : null);
      
      // Simulate refresh delay
      setTimeout(() => {
        setLivePreview(prev => prev ? { ...prev, status: 'ready' } : null);
      }, 1000);
    }
  };

  const createLocalEnvironment = async (type: string, name: string, template?: string) => {
    const newEnv: DevEnvironment = {
      id: generateEnvironmentId(),
      name,
      type: type as any,
      status: 'creating',
      port: await getAvailablePort(),
      previewUrl: '',
      workspaceRoot: `/tmp/devenv/${name}`,
      installedPackages: [],
      environmentVariables: {},
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
      deploymentMode: 'local',
    };

    setEnvironments(prev => [...prev, newEnv]);

    try {
      // Try to create via local backend
      const response = await fetch('http://localhost:5000/api/dev-sandbox/create-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          environment: newEnv,
          template
        })
      });

      if (response.ok) {
        const result = await response.json();
        const updatedEnv = {
          ...newEnv,
          status: 'running' as const,
          previewUrl: `http://localhost:${newEnv.port}`,
          workspaceRoot: result.workspaceRoot || newEnv.workspaceRoot
        };
        setEnvironments(prev => prev.map(env => env.id === newEnv.id ? updatedEnv : env));
        setActiveEnvironment(updatedEnv);
        await loadFileTree(updatedEnv.id);
        await createTerminalSession(updatedEnv.id);
        return updatedEnv;
      }
    } catch (error) {
      console.warn('Local backend not available, creating offline environment');
    }

    // Final fallback - create offline/mock environment
    const offlineEnv = createOfflineEnvironment(newEnv, template);
    setEnvironments(prev => prev.map(env => env.id === newEnv.id ? offlineEnv : env));
    setActiveEnvironment(offlineEnv);
    return offlineEnv;
  };

  const createOfflineEnvironment = (env: DevEnvironment, template?: string): DevEnvironment => {
    // Create a mock environment for offline development
    console.log(`Creating offline environment${template ? ` with template: ${template}` : ''}`);
    const mockFileTree: FileNode = {
      name: env.name,
      path: '/',
      type: 'directory',
      children: [
        {
          name: 'README.md',
          path: '/README.md',
          type: 'file',
          content: `# ${env.name}\n\nWelcome to your offline development environment!\n\nThis is a mock environment for development when backend services are unavailable.`
        },
        {
          name: 'src',
          path: '/src',
          type: 'directory',
          children: [
            {
              name: 'main.js',
              path: '/src/main.js',
              type: 'file',
              content: `// ${env.name} - Main Entry Point\nconsole.log('Hello from ${env.name}!');`
            }
          ]
        }
      ]
    };

    setFileTree(mockFileTree);

    // Create mock terminal session
    const mockTerminal: TerminalSession = {
      id: `term_${env.id}`,
      environmentId: env.id,
      isActive: true,
      output: [
        '🔴 Offline Mode - Limited functionality available',
        `Welcome to ${env.name} development environment`,
        'Note: This is a mock environment. Install backend services for full functionality.',
        ''
      ],
      currentDirectory: '/workspace',
      shellType: 'bash'
    };

    setTerminalSessions([mockTerminal]);
    setActiveTerminal(mockTerminal);

    return {
      ...env,
      status: 'running',
      previewUrl: 'about:blank' // Offline preview
    };
  };

  // ==================== NIXOS WORKSPACE OPERATIONS ====================
  
  /* const loadNixosWorkspaces = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/workspaces');
      const result = await response.json();
      
      if (result.success) {
        setNixosWorkspaces(result.workspaces.map((ws: any) => ({
          id: ws.name,
          name: ws.name,
          status: ws.state === 'running' ? 'running' : 
                 ws.state === 'shut off' ? 'stopped' : 'error',
          memoryMB: ws.memory || 1024,
          vcpus: ws.vcpus || 2,
          createdAt: ws.created_at || new Date().toISOString(),
          lastAccessed: ws.last_accessed || new Date().toISOString()
        })));
      }
    } catch (error) {
      console.error('Error loading NixOS workspaces:', error);
    }
  }; */

  // These functions are commented out as they are currently unused
  // const createNixosWorkspace = async (name: string, memoryMB: number = 1024, vcpus: number = 2) => {
  //   try {
  //     const response = await fetch('http://localhost:5000/api/v1/workspaces', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ name, memory_mb: memoryMB, vcpus })
  //     });
  //     
  //     const result = await response.json();
  //     if (result.success) {
  //       await loadNixosWorkspaces();
  //       return result.workspace_id;
  //     } else {
  //       throw new Error(result.error);
  //     }
  //   } catch (error) {
  //     console.error('Error creating NixOS workspace:', error);
  //     throw error;
  //   }
  // };

  // const startNixosWorkspace = async (workspaceId: string) => {
  //   try {
  //     const response = await fetch(`http://localhost:5000/api/v1/workspaces/${workspaceId}/start`, {
  //       method: 'POST'
  //     });
  //     
  //     const result = await response.json();
  //     if (result.success) {
  //       await loadNixosWorkspaces();
  //     } else {
  //       throw new Error(result.error);
  //     }
  //   } catch (error) {
  //     console.error('Error starting NixOS workspace:', error);
  //     throw error;
  //   }
  // };

  // ==================== FILE SYSTEM OPERATIONS ====================

  const stopEnvironment = async (environmentId: string) => {
    try {
      await fetch(`http://localhost:5000/api/dev-sandbox/${environmentId}/stop`, {
        method: 'POST'
      });
      
      setEnvironments(prev => prev.map(env => 
        env.id === environmentId ? { ...env, status: 'stopped' } : env
      ));
    } catch (error) {
      console.error('Error stopping environment:', error);
    }
  };

  const deleteEnvironment = async (environmentId: string) => {
    try {
      await fetch(`http://localhost:5000/api/dev-sandbox/${environmentId}`, {
        method: 'DELETE'
      });
      
      setEnvironments(prev => prev.filter(env => env.id !== environmentId));
      
      if (activeEnvironment?.id === environmentId) {
        setActiveEnvironment(null);
        setFileTree(null);
        setOpenFiles([]);
      }
    } catch (error) {
      console.error('Error deleting environment:', error);
    }
  };

  // ==================== FILE SYSTEM OPERATIONS ====================
  
  const loadFileTree = async (environmentId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/dev-sandbox/${environmentId}/files`);
      const result = await response.json();
      
      if (result.success) {
        setFileTree(result.fileTree);
      }
    } catch (error) {
      console.error('Error loading file tree:', error);
    }
  };

  const openFile = async (filePath: string) => {
    if (openFiles.find(f => f.path === filePath)) {
      setActiveFile(filePath);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/dev-sandbox/${activeEnvironment?.id}/file?path=${encodeURIComponent(filePath)}`
      );
      const result = await response.json();
      
      if (result.success) {
        const language = getLanguageFromPath(filePath);
        const newFile = {
          path: filePath,
          content: result.content,
          language,
          isDirty: false
        };
        
        setOpenFiles(prev => [...prev, newFile]);
        setActiveFile(filePath);
      }
    } catch (error) {
      console.error('Error opening file:', error);
    }
  };

  const saveFile = async (filePath: string, content: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/dev-sandbox/${activeEnvironment?.id}/file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath, content })
      });

      const result = await response.json();
      
      if (result.success) {
        setOpenFiles(prev => prev.map(file => 
          file.path === filePath ? { ...file, content, isDirty: false } : file
        ));
        
        // Refresh live preview if applicable
        if (livePreview && shouldRefreshPreview(filePath)) {
          refreshPreview();
        }
      }
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  const createFile = async (dirPath: string, fileName: string, isDirectory: boolean = false) => {
    try {
      const response = await fetch(`http://localhost:5000/api/dev-sandbox/${activeEnvironment?.id}/file/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          path: `${dirPath}/${fileName}`,
          isDirectory,
          content: isDirectory ? undefined : ''
        })
      });

      if (response.ok) {
        await loadFileTree(activeEnvironment!.id);
      }
    } catch (error) {
      console.error('Error creating file:', error);
    }
  };

  // ==================== TERMINAL OPERATIONS ====================
  
  const createTerminalSession = async (environmentId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/dev-sandbox/${environmentId}/terminal`, {
        method: 'POST'
      });
      const result = await response.json();
      
      if (result.success) {
        const newSession: TerminalSession = {
          id: result.sessionId,
          environmentId,
          isActive: true,
          output: ['Welcome to Local Development Sandbox'],
          currentDirectory: '/workspace',
          shellType: 'bash',
          pid: result.pid
        };
        
        setTerminalSessions(prev => [...prev, newSession]);
        setActiveTerminal(newSession);
        
        // Setup WebSocket for real-time terminal communication
        setupTerminalWebSocket(newSession.id);
      }
    } catch (error) {
      console.error('Error creating terminal session:', error);
    }
  };

  const executeTerminalCommand = async (command: string) => {
    if (!activeTerminal || !activeEnvironment) return;

    try {
      await fetch(`http://localhost:5000/api/dev-sandbox/terminal/${activeTerminal.id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });

      // Output will come through WebSocket
      setTerminalInput('');
    } catch (error) {
      console.error('Error executing terminal command:', error);
    }
  };

  const setupTerminalWebSocket = (_sessionId: string) => {
    // Initialize Socket.IO connection if not already established
    if (!socketRef.current) {
      socketRef.current = io('http://localhost:5000');
      
      socketRef.current.on('connect', () => {
        console.log('Connected to terminal server');
      });
      
      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from terminal server');
      });
      
      // Listen for terminal output events
      socketRef.current.on('terminal_output', (data) => {
        if (data.session_id && data.output) {
          setTerminalSessions(prev => prev.map(session => 
            session.id === data.session_id 
              ? { ...session, output: [...session.output, data.output] }
              : session
          ));
        }
      });
      
      // Listen for directory change events
      socketRef.current.on('terminal_directory_change', (data) => {
        if (data.session_id && data.directory) {
          setTerminalSessions(prev => prev.map(session => 
            session.id === data.session_id 
              ? { ...session, currentDirectory: data.directory }
            : session
          ));
        }
      });
    }
  };

  // ==================== LIVE PREVIEW ====================
  
  const startLivePreview = async () => {
    if (!activeEnvironment) return;

    try {
      const response = await fetch(`http://localhost:5000/api/dev-sandbox/${activeEnvironment.id}/preview/start`, {
        method: 'POST'
      });
      const result = await response.json();
      
      if (result.success) {
        setLivePreview({
          environmentId: activeEnvironment.id,
          url: result.previewUrl,
          status: 'ready',
          lastUpdate: new Date().toISOString(),
          autoRefresh: true
        });
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Error starting live preview:', error);
    }
  };

  // ==================== MONACO EDITOR HANDLERS ====================
  
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && activeFile) {
      setCurrentEditorContent(value);
      setOpenFiles(prev => prev.map(file => 
        file.path === activeFile ? { ...file, content: value, isDirty: true } : file
      ));
      
      // Auto-save after 2 seconds of inactivity
      const timeoutId = setTimeout(() => {
        saveFile(activeFile, value);
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  };

  // ==================== INITIALIZATION EFFECTS ====================
  
  useEffect(() => {
    // Initialize WebSocket connection
    if (!socketRef.current) {
      try {
        socketRef.current = io('http://localhost:5000', {
          timeout: 5000,
          forceNew: true
        });
        
        socketRef.current.on('connect', () => {
          console.log('🔗 Connected to Mama Bear backend');
        });
        
        socketRef.current.on('disconnect', () => {
          console.log('❌ Disconnected from Mama Bear backend');
        });
        
        socketRef.current.on('connect_error', (error) => {
          console.warn('⚠️ Backend connection failed, using fallback mode:', error.message);
        });
        
        // Listen for terminal output events
        socketRef.current.on('terminal_output', (data) => {
          if (data.session_id && data.output) {
            setTerminalSessions(prev => prev.map(session => 
              session.id === data.session_id 
                ? { ...session, output: [...session.output, data.output] }
                : session
            ));
          }
        });
        
        // Listen for directory change events
        socketRef.current.on('terminal_directory_change', (data) => {
          if (data.session_id && data.directory) {
            setTerminalSessions(prev => prev.map(session => 
              session.id === data.session_id 
                ? { ...session, currentDirectory: data.directory }
              : session
            ));
          }
        });
        
        // Listen for environment status updates
        socketRef.current.on('environment_status_update', (data) => {
          if (data.environment_id && data.status) {
            setEnvironments(prev => prev.map(env => 
              env.id === data.environment_id 
                ? { ...env, status: data.status, lastAccessed: new Date().toISOString() }
                : env
            ));
          }
        });
        
      } catch (error) {
        console.warn('Failed to initialize WebSocket, using offline mode:', error);
      }
    }

    // Load existing environments from localStorage
    const savedEnvironments = localStorage.getItem('dev-sandbox-environments');
    if (savedEnvironments) {
      try {
        const parsed = JSON.parse(savedEnvironments);
        setEnvironments(parsed);
      } catch (error) {
        console.warn('Failed to load saved environments:', error);
      }
    }

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Save environments to localStorage whenever they change
  useEffect(() => {
    if (environments.length > 0) {
      localStorage.setItem('dev-sandbox-environments', JSON.stringify(environments));
    }
  }, [environments]);

  // Update editor content when active file changes
  useEffect(() => {
    if (activeFile) {
      const file = openFiles.find(f => f.path === activeFile);
      if (file) {
        setCurrentEditorContent(file.content);
        setCurrentEditorLanguage(file.language);
      }
    }
  }, [activeFile, openFiles]);

  // ==================== RENDER ====================
  
  return (
    <div className="dev-sandbox">
      <div className="sandbox-header">
        <div className="header-left">
          <h2>🏗️ Local Development Sandbox</h2>
          <div className="environment-selector">
            {activeEnvironment ? (
              <span className="active-env">
                <span className={`status-dot ${activeEnvironment.status}`}></span>
                {activeEnvironment.name}
              </span>
            ) : (
              <span className="no-env">No Environment Active</span>
            )}
          </div>
        </div>
        
        <div className="header-actions">
          <div className="environment-status">
            <div className="status-indicators">
              <div className={`status-indicator ${socketRef.current?.connected ? 'connected' : 'disconnected'}`}>
                🔗 Backend: {socketRef.current?.connected ? 'Connected' : 'Disconnected'}
              </div>
              <div className={`status-indicator ${environments.length > 0 ? 'active' : 'inactive'}`}>
                🏗️ Environments: {environments.length}
              </div>
              <div className={`status-indicator ${showChat ? 'active' : 'inactive'}`}>
                🐻 Mama Bear: {showChat ? 'Active' : 'Hidden'}
              </div>
            </div>
          </div>
          
          <button onClick={() => setShowEnvironmentCreator(true)} className="create-env-btn">
            + New Environment
          </button>
          
          <button 
            onClick={() => setShowChat(!showChat)} 
            className={`chat-toggle-btn ${showChat ? 'active' : ''}`}
            title={showChat ? 'Hide Mama Bear Chat' : 'Show Mama Bear Chat'}
          >
            🐻 {showChat ? 'Hide Chat' : 'Show Chat'}
          </button>
          
          <button 
            onClick={() => setShowCloudBrowser(!showCloudBrowser)} 
            className={`cloud-browser-toggle-btn ${showCloudBrowser ? 'active' : ''}`}
            title={showCloudBrowser ? 'Hide Cloud Browser' : 'Show Cloud Browser'}
          >
            ☁️ {showCloudBrowser ? 'Hide Browser' : 'Show Browser'}
          </button>
          
          <div className="layout-controls">
            <button 
              className={layout === 'editor' ? 'active' : ''}
              onClick={() => setLayout('editor')}
            >
              📝 Editor
            </button>
            <button 
              className={layout === 'split' ? 'active' : ''}
              onClick={() => setLayout('split')}
            >
              ⚡ Split
            </button>
            <button 
              className={layout === 'preview' ? 'active' : ''}
              onClick={() => setLayout('preview')}
            >
              👁️ Preview
            </button>
          </div>
        </div>
      </div>

      <div className={`sandbox-content layout-${layout}`}>
        {/* Left Panel - File Explorer */}
        <div className="left-panel" style={{ width: leftPanelWidth }}>
          {/* Environment List */}
          <div className="panel-section">
            <div className="panel-header">
              <h3>🏗️ Environments</h3>
            </div>
            <div className="environment-list">
              {environments.map(env => (
                <div key={env.id} className={`env-item ${env.status}`}>
                  <span className="env-name">{env.name}</span>
                  <div className="env-actions">
                    <button onClick={() => stopEnvironment(env.id)} title="Stop">⏹️</button>
                    <button onClick={() => deleteEnvironment(env.id)} title="Delete">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* File Explorer */}
          <div className="panel-section">
            <div className="panel-header">
              <h3>📁 Files</h3>
              <button onClick={() => createFile('/', 'new-file.js')} className="create-file-btn">
                + File
              </button>
            </div>
            
            <div className="file-tree">
              {fileTree && <FileTreeNode 
                node={fileTree} 
                onFileClick={openFile}
                onCreateFile={createFile}
              />}
            </div>
          </div>
        </div>

        {/* Resize Handle */}
        <div 
          className={`resize-handle vertical ${isResizing ? 'resizing' : ''}`}
          onMouseDown={startVerticalResize}
          title="Drag to resize file explorer"
        />

        {/* Main Content Area */}
        <div className="main-content">
          {/* File Tabs */}
          <div className="file-tabs">
            {openFiles.map(file => (
              <div 
                key={file.path}
                className={`file-tab ${activeFile === file.path ? 'active' : ''} ${file.isDirty ? 'dirty' : ''}`}
                onClick={() => setActiveFile(file.path)}
              >
                <span className="tab-name">{file.path.split('/').pop()}</span>
                <button 
                  className="close-tab"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenFiles(prev => prev.filter(f => f.path !== file.path));
                    if (activeFile === file.path) {
                      const remaining = openFiles.filter(f => f.path !== file.path);
                      setActiveFile(remaining.length > 0 ? remaining[0].path : null);
                    }
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Split View Container */}
          <div className="split-view-container">
            {/* Editor / Preview Area */}
            <div className="editor-preview-container">
              {(layout === 'editor' || layout === 'split') && (
                <div className="editor-container">
                  <Editor
                    height="100%"
                    language={currentEditorLanguage}
                    value={currentEditorContent}
                    onChange={handleEditorChange}
                    theme="vs-dark"
                    options={{
                      automaticLayout: true,
                      minimap: { enabled: true },
                      fontSize: 14,
                      wordWrap: 'on',
                      formatOnPaste: true,
                      formatOnType: true,
                      scrollBeyondLastLine: false,
                      renderWhitespace: 'boundary'
                    }}
                  />
                </div>
              )}
              
              {(layout === 'preview' || layout === 'split') && showPreview && livePreview && (
                <div className="preview-container">
                  <div className="preview-header">
                    <span>🌐 Live Preview</span>
                    <button onClick={refreshPreview}>🔄 Refresh</button>
                    <button onClick={startLivePreview}>🚀 Start Server</button>
                  </div>
                  <iframe 
                    src={livePreview.url}
                    className="preview-iframe"
                    title="Live Preview"
                  />
                </div>
              )}
            </div>

            {/* Mama Bear Chat Panel */}
            {showChat && (
              <>
                {/* Chat Resize Handle */}
                <div 
                  className={`resize-handle vertical ${isResizing ? 'resizing' : ''}`}
                  onMouseDown={startChatResize}
                  title="Drag to resize chat panel"
                />
                <div className="chat-panel" style={{ width: chatPanelWidth }}>
                  <div className="chat-header">
                    <h3>🐻 Mama Bear Assistant</h3>
                    <div className="chat-controls">
                      <button onClick={() => setShowChat(false)} title="Hide Chat">📖</button>
                      <button onClick={() => setChatMessages([])} title="Clear Chat">🗑️</button>
                    </div>
                  </div>
                  
                  <div className="chat-messages">
                    {chatMessages.length === 0 ? (
                      <div className="chat-welcome">
                        <div className="welcome-icon">🐻</div>
                        <h4>Welcome to your Development Sanctuary!</h4>
                        <p>I'm Mama Bear, your AI development assistant. I can help you:</p>
                        <ul>
                          <li>🏗️ Create and manage development environments</li>
                          <li>📝 Write, debug, and optimize code</li>
                          <li>🔧 Run terminal commands and manage projects</li>
                          <li>🚀 Deploy applications and manage infrastructure</li>
                          <li>💡 Provide coding tips and best practices</li>
                        </ul>
                        <p>Just ask me anything about your project!</p>
                      </div>
                    ) : (
                      chatMessages.map(message => (
                        <div key={message.id} className={`chat-message ${message.role}`}>
                          <div className="message-header">
                            <span className="message-role">
                              {message.role === 'user' ? '👤' : '🐻'} {message.role === 'user' ? 'You' : 'Mama Bear'}
                            </span>
                            <span className="message-time">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="message-content">
                            {message.content}
                          </div>
                          {message.environmentContext && (
                            <div className="message-context">
                              📁 Environment: {environments.find(e => e.id === message.environmentContext)?.name || 'Unknown'}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    
                    {isChatLoading && (
                      <div className="chat-message assistant loading">
                        <div className="message-header">
                          <span className="message-role">🐻 Mama Bear</span>
                        </div>
                        <div className="message-content">
                          <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="chat-input-container">
                    <MultimodalInput
                      onSend={handleChatSend}
                      placeholder="Ask Mama Bear about your development environment..."
                      disabled={isChatLoading}
                      value={chatInput}
                      onChange={setChatInput}
                      onAttachmentsChange={() => {}} // Not used in DevSandbox currently
                      attachments={[]} // No attachments in DevSandbox currently
                    />
                  </div>
                </div>
              </>
            )}
            
            {/* Cloud Browser Panel */}
            {showCloudBrowser && (
              <>
                {/* Cloud Browser Resize Handle */}
                <div 
                  className={`resize-handle vertical ${isResizing ? 'resizing' : ''}`}
                  onMouseDown={startChatResize}
                  title="Drag to resize cloud browser panel"
                />
                <div className="cloud-browser-panel" style={{ width: chatPanelWidth }}>
                  <div className="panel-header">
                    <h3>☁️ Cloud Development Browser</h3>
                    <div className="cloud-browser-controls">
                      <button 
                        onClick={() => setCloudBrowserMode('modal')} 
                        title="Open in Modal"
                        className={cloudBrowserMode === 'modal' ? 'active' : ''}
                      >
                        🪟
                      </button>
                      <button 
                        onClick={() => setCloudBrowserMode('popup')} 
                        title="Open in Popup"
                        className={cloudBrowserMode === 'popup' ? 'active' : ''}
                      >
                        ↗️
                      </button>
                      <button onClick={() => setShowCloudBrowser(false)} title="Hide Browser">
                        ✕
                      </button>
                    </div>
                  </div>
                  
                  <CloudBrowser
                    mode={cloudBrowserMode}
                    environment={cloudEnvironment}
                    onClose={() => setShowCloudBrowser(false)}
                    onEnvironmentChange={setCloudEnvironment}
                    className="dev-sandbox-browser"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Resize Handle for Bottom Panel */}
      <div 
        className={`resize-handle horizontal ${isResizing ? 'resizing' : ''}`}
        onMouseDown={startHorizontalResize}
        title="Drag to resize terminal panel"
      />

      {/* Bottom Panel - Terminal */}
      <div className="bottom-panel" style={{ height: bottomPanelHeight }}>
        <div className="panel-header">
          <h3>💻 Terminal</h3>
          <div className="terminal-tabs">
            {terminalSessions.map(session => (
              <button
                key={session.id}
                className={`terminal-tab ${activeTerminal?.id === session.id ? 'active' : ''}`}
                onClick={() => setActiveTerminal(session)}
              >
                Terminal {session.id.slice(-4)}
              </button>
            ))}
            <button onClick={() => activeEnvironment && createTerminalSession(activeEnvironment.id)}>
              + New
            </button>
          </div>
        </div>
        
        <div className="terminal-content">
          {activeTerminal && (
            <>
              <div className="terminal-output">
                {activeTerminal.output.map((line, index) => (
                  <div key={index} className="terminal-line">{line}</div>
                ))}
              </div>
              
              <div className="terminal-input-container">
                <span className="terminal-prompt">
                  {activeTerminal.currentDirectory} $ 
                </span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      executeTerminalCommand(terminalInput);
                    }
                  }}
                  className="terminal-input"
                  placeholder="Enter command..."
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Environment Creator Modal */}
      {showEnvironmentCreator && (
        <EnvironmentCreator
          onClose={() => setShowEnvironmentCreator(false)}
          onCreate={createLocalEnvironment}
        />
      )}
    </div>
  );
};

// ==================== SUB-COMPONENTS ====================

interface FileTreeNodeProps {
  node: FileNode;
  onFileClick: (path: string) => void;
  onCreateFile: (dirPath: string, fileName: string, isDirectory?: boolean) => void;
}

const FileTreeNode: React.FC<FileTreeNodeProps> = ({ node, onFileClick, onCreateFile }) => {
  const [isExpanded, setIsExpanded] = useState(node.isExpanded || false);

  return (
    <div className="file-tree-node">
      <div 
        className={`node-header ${node.type}`}
        onClick={() => {
          if (node.type === 'directory') {
            setIsExpanded(!isExpanded);
          } else {
            onFileClick(node.path);
          }
        }}
      >
        <span className="node-icon">
          {node.type === 'directory' ? (isExpanded ? '📂' : '📁') : '📄'}
        </span>
        <span className="node-name">{node.name}</span>
      </div>
      
      {node.type === 'directory' && isExpanded && node.children && (
        <div className="node-children">
          {node.children.map(child => (
            <FileTreeNode
              key={child.path}
              node={child}
              onFileClick={onFileClick}
              onCreateFile={onCreateFile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface EnvironmentCreatorProps {
  onClose: () => void;
  onCreate: (type: string, name: string, template?: string, deploymentMode?: 'local' | 'cloud' | 'nixos') => void;
}

const EnvironmentCreator: React.FC<EnvironmentCreatorProps> = ({ onClose, onCreate }) => {
  const [envType, setEnvType] = useState('react');
  const [envName, setEnvName] = useState('');
  const [template, setTemplate] = useState('');
  const [deploymentMode, setDeploymentMode] = useState<'local' | 'cloud' | 'nixos'>('local');
  const [isCreating, setIsCreating] = useState(false);

  const templates = {
    'react': ['create-react-app', 'vite-react', 'next.js'],
    'node': ['express', 'fastify', 'nest.js'],
    'python': ['flask', 'django', 'fastapi'],
    'web': ['vanilla-html', 'bootstrap', 'tailwind']
  };

  const deploymentOptions = [
    {
      mode: 'local' as const,
      title: '🏠 Local Development',
      description: 'Run directly on your machine (fastest)',
      pros: ['Fastest performance', 'No Docker required', 'Direct file access'],
      cons: ['Limited isolation', 'Requires local dependencies']
    },
    {
      mode: 'cloud' as const,
      title: '☁️ Cloud Environment',
      description: 'GitHub Codespaces or StackBlitz',
      pros: ['Accessible anywhere', 'Powerful cloud resources', 'No local setup'],
      cons: ['Requires internet', 'May have usage limits']
    },
    {
      mode: 'nixos' as const,
      title: '❄️ NixOS Virtual Machine',
      description: 'Reproducible NixOS VM environment',
      pros: ['Fully reproducible', 'Isolated VM', 'SSH access', 'Persistent workspace'],
      cons: ['Requires NixOS backend', 'VM startup time', 'Resource intensive']
    }
  ];

  const handleCreate = async () => {
    if (envName.trim()) {
      setIsCreating(true);
      try {
        await onCreate(envType, envName.trim(), template, deploymentMode);
        onClose();
      } catch (error) {
        console.error('Failed to create environment:', error);
      } finally {
        setIsCreating(false);
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="environment-creator-modal">
        <div className="modal-header">
          <h3>🏗️ Create New Development Environment</h3>
          <button onClick={onClose} className="close-modal">×</button>
        </div>
        
        <div className="modal-content">
          <div className="form-group">
            <label>Environment Name:</label>
            <input
              type="text"
              value={envName}
              onChange={(e) => setEnvName(e.target.value)}
              placeholder="my-awesome-project"
              disabled={isCreating}
            />
          </div>
          
          <div className="form-group">
            <label>Environment Type:</label>
            <select value={envType} onChange={(e) => setEnvType(e.target.value)} disabled={isCreating}>
              <option value="react">React Application</option>
              <option value="node">Node.js Backend</option>
              <option value="python">Python Application</option>
              <option value="web">Static Website</option>
              <option value="custom">Custom Environment</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Template:</label>
            <select value={template} onChange={(e) => setTemplate(e.target.value)} disabled={isCreating}>
              <option value="">None (Empty)</option>
              {templates[envType as keyof typeof templates]?.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Deployment Mode:</label>
            <div className="deployment-modes">
              {deploymentOptions.map(option => (
                <div 
                  key={option.mode}
                  className={`deployment-option ${deploymentMode === option.mode ? 'selected' : ''}`}
                  onClick={() => !isCreating && setDeploymentMode(option.mode)}
                >
                  <div className="option-header">
                    <h4>{option.title}</h4>
                    <p>{option.description}</p>
                  </div>
                  <div className="option-details">
                    <div className="pros">
                      <strong>✅ Pros:</strong>
                      <ul>
                        {option.pros.map(pro => (
                          <li key={pro}>{pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="cons">
                      <strong>⚠️ Considerations:</strong>
                      <ul>
                        {option.cons.map(con => (
                          <li key={con}>{con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="modal-actions">
          <button onClick={onClose} className="cancel-btn" disabled={isCreating}>Cancel</button>
          <button onClick={handleCreate} className="create-btn" disabled={isCreating || !envName.trim()}>
            {isCreating ? '⏳ Creating...' : '🚀 Create Environment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DevSandbox;
