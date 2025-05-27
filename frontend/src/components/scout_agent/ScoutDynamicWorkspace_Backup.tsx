// Scout Dynamic Workspace - www.scout.new Inspired Interface
// The "Transforming Canvas" - Dynamic, Unified, Proactive Agentic Workspace

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './ScoutDynamicWorkspace.css';
import './WorkspaceAnimations.css';
import WorkspaceLaunchAnimation from './WorkspaceLaunchAnimation';

// ==================== INTERFACES ====================

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system' | 'agent_action';
  content: string;
  timestamp: string;
  metadata?: any;
}

interface AgentAction {
  id: string;
  type: 'thinking' | 'tool_call' | 'code_execution' | 'file_operation' | 'vm_operation';
  name: string;
  description: string;
  status: 'running' | 'completed' | 'failed' | 'waiting';
  progress?: number;
  output?: any;
  timestamp: string;
}

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  content?: string;
  language?: string;
  children?: FileNode[];
  isExpanded?: boolean;
  modified?: boolean;
}

interface LivePreview {
  type: 'web' | 'terminal' | 'documentation' | 'plan';
  url?: string;
  content?: string;
  title: string;
  isLoading?: boolean;
}

interface WorkspaceState {
  mode: 'chat' | 'hybrid' | 'full_workspace';
  activeView: 'chat' | 'editor' | 'preview' | 'terminal' | 'files';
  isTransitioning: boolean;
  splitLayout: 'single' | 'vertical' | 'horizontal' | 'quad';
}

interface ProjectContext {
  id: string;
  name: string;
  goal: string;
  status: 'initializing' | 'planning' | 'executing' | 'reviewing' | 'completed';
  workspaceId?: string;
  vmId?: string;
}

// ==================== MAIN COMPONENT ====================

const ScoutDynamicWorkspace: React.FC = () => {
  // ==================== STATE MANAGEMENT ====================
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Workspace State
  const [workspaceState, setWorkspaceState] = useState<WorkspaceState>({
    mode: 'chat',
    activeView: 'chat',
    isTransitioning: false,
    splitLayout: 'single'
  });

  // Project & Agent State
  const [projectContext, setProjectContext] = useState<ProjectContext | null>(null);
  const [agentActions, setAgentActions] = useState<AgentAction[]>([]);
  const [currentAction, setCurrentAction] = useState<AgentAction | null>(null);

  // File System & Editor
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  const [editorContent, setEditorContent] = useState('');

  // Live Preview
  const [livePreview, setLivePreview] = useState<LivePreview | null>(null);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);

  // UI State
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLaunchAnimation, setShowLaunchAnimation] = useState(false);

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);

  // ==================== INITIALIZATION ====================
  
  useEffect(() => {
    // Initialize with an engaging Mama Bear welcome that emphasizes the chat experience
    const welcomeMessage: ChatMessage = {
      id: '1',
      type: 'assistant',
      content: "🐻 **Hey Nathan! Mama Bear here!** \n\nI'm your AI development conductor, ready to build ANYTHING you can imagine. This chat interface is your direct line to me - think of it as your command center for creating amazing projects.\n\n✨ **Just tell me what you want to build** and watch this interface transform into a complete development workspace in real-time!\n\nI can create apps, websites, APIs, data tools, games - you name it. The chat bar below is your magic wand. Try it!",
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ==================== ANIMATION HANDLERS ====================

  const handleLaunchComplete = async () => {
    setShowLaunchAnimation(false);
    
    // Get the last user message for the project goal
    const lastUserMessage = messages.filter(m => m.type === 'user').pop()?.content || 'Amazing Project';
    
    // Now do the actual workspace transition
    await transitionToWorkspace(lastUserMessage);
  };

  // ==================== AGENT ORCHESTRATION ====================

  const transitionToWorkspace = useCallback(async (projectGoal: string) => {
    setWorkspaceState(prev => ({ ...prev, isTransitioning: true }));
    
    try {
      // 1. Create project context
      const projectId = `project-${Date.now()}`;
      const newProject: ProjectContext = {
        id: projectId,
        name: `AI Project: ${projectGoal.slice(0, 30)}...`,
        goal: projectGoal,
        status: 'initializing'
      };
      setProjectContext(newProject);

      // 2. Start Mama Bear orchestration (mock mode)
      addAgentAction({
        type: 'thinking',
        name: 'Project Analysis',
        description: 'Mama Bear is analyzing your request and creating a development plan...',
        status: 'running'
      });

      // 3. Simulate orchestration process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock orchestration data for demo
      const orchestrationData = {
        workspace_created: true,
        workspace_id: `ws-${Date.now()}`,
        vm_id: `vm-${Date.now()}`,
        preview_url: null, // Will show plan initially
        project_type: inferProjectType(projectGoal)
      };

      // 4. Update project with workspace details
      setProjectContext(prev => prev ? {
        ...prev,
        workspaceId: orchestrationData.workspace_id,
        vmId: orchestrationData.vm_id,
        status: 'planning'
      } : null);

      // 5. Update first action as completed
      setAgentActions(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            status: 'completed',
            progress: 100
          };
        }
        return updated;
      });

      // 6. Transition UI to hybrid mode
      setWorkspaceState({
        mode: 'hybrid',
        activeView: 'preview',
        isTransitioning: false,
        splitLayout: 'vertical'
      });

      // 7. Initialize workspace components (mock mode)
      await initializeWorkspaceComponents(orchestrationData);

      // 8. Add completion message
      addMessage('system', '🚀 Workspace activated! Mama Bear has set up your development environment. You can see the live workspace while we continue chatting.');

      // 9. Start some initial activity
      await simulateInitialWorkspaceSetup(orchestrationData);

    } catch (error) {
      console.error('Workspace transition error:', error);
      addMessage('system', '⚠️ There was an issue setting up the workspace. Continuing in chat mode for now.');
      setWorkspaceState(prev => ({ ...prev, isTransitioning: false }));
    }
  }, [projectContext]);

  const addAgentAction = (action: Partial<AgentAction>) => {
    const newAction: AgentAction = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      status: 'running',
      ...action
    } as AgentAction;
    
    setAgentActions(prev => [...prev, newAction]);
    setCurrentAction(newAction);
    return newAction.id;
  };

  const updateAgentAction = (id: string, updates: Partial<AgentAction>) => {
    setAgentActions(prev => 
      prev.map(action => 
        action.id === id ? { ...action, ...updates } : action
      )
    );
    
    if (currentAction?.id === id) {
      setCurrentAction(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  // ==================== WORKSPACE INITIALIZATION ====================

  const initializeWorkspaceComponents = async (orchestrationData: any) => {
    try {
      // Initialize file tree (mock mode)
      const mockFileTree: FileNode[] = [
        {
          id: '1',
          name: 'src',
          type: 'folder',
          path: '/src',
          isExpanded: true,
          children: [
            {
              id: '2',
              name: 'main.py',
              type: 'file',
              path: '/src/main.py',
              content: '# Generated by Mama Bear\n# Project: ' + (projectContext?.goal || 'New Project') + '\n\nprint("Hello from Mama Bear!")\n\n# TODO: Implement your amazing idea here!',
              language: 'python',
              modified: false
            },
            {
              id: '3',
              name: 'requirements.txt',
              type: 'file',
              path: '/src/requirements.txt',
              content: '# Dependencies for your project\n# Mama Bear will add these as needed\n',
              language: 'text'
            }
          ]
        },
        {
          id: '4',
          name: 'README.md',
          type: 'file',
          path: '/README.md',
          content: `# ${projectContext?.name || 'AI Project'}\n\n🐻 **Built with Mama Bear**\n\n## Goal\n${projectContext?.goal || 'Amazing new project'}\n\n## Status\n- ✅ Workspace created\n- 🔄 In development\n\n*Mama Bear is actively working on this project...*`,
          language: 'markdown'
        }
      ];
      
      setFileTree(mockFileTree);

      // Set initial preview (project plan)
      setLivePreview({
        type: 'plan',
        title: 'Project Plan',
        content: `# 🐻 Mama Bear Development Plan\n\n## Project: ${projectContext?.goal}\n\n### Phase 1: Setup ✅\n- Workspace created\n- Initial file structure\n- Development environment ready\n\n### Phase 2: Development 🔄\n- Core functionality implementation\n- Testing and debugging\n- Feature enhancement\n\n### Phase 3: Deployment 📋\n- Build optimization\n- Deployment configuration\n- Go live!\n\n*Mama Bear is actively monitoring and developing...*`
      });

      // Start terminal session
      initializeTerminal(orchestrationData.workspace_id);

    } catch (error) {
      console.error('Failed to initialize workspace components:', error);
    }
  };

  // Terminal initialization (called during workspace setup)
  const initializeTerminal = (workspaceId: string) => {
    // Terminal WebSocket connection would be initialized here
    // This connects to the existing WebSocket infrastructure
    setTerminalOutput([
      '🐻 Mama Bear Terminal Session Started',
      `Workspace: ${workspaceId}`,
      'Ready for commands...',
      '',
      '$ echo "Workspace ready for development!"',
      'Workspace ready for development!',
      '$'
    ]);
  };

  // ==================== MESSAGE HANDLING ====================

  const addMessage = (type: ChatMessage['type'], content: string, metadata?: any) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date().toISOString(),
      metadata
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    addMessage('user', userMessage);
    setInputValue('');
    setIsLoading(true);

    try {
      // Check if this looks like a project request (demo mode - no backend needed)
      const isProjectRequest = userMessage.toLowerCase().includes('build') || 
                              userMessage.toLowerCase().includes('create') || 
                              userMessage.toLowerCase().includes('make') ||
                              userMessage.toLowerCase().includes('develop') ||
                              userMessage.toLowerCase().includes('app') ||
                              userMessage.toLowerCase().includes('website') ||
                              userMessage.toLowerCase().includes('project');

      // Simulate Mama Bear processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (isProjectRequest && workspaceState.mode === 'chat') {
        // Trigger workspace transformation with ROCKET LAUNCH ANIMATION! 🚀
        addMessage('assistant', `🐻 Perfect! I'll help you build that. Get ready for some development magic! 🚀✨`);
        
        // Add small delay for dramatic effect, then LAUNCH THE ROCKET!
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('🚀 LAUNCHING ROCKET ANIMATION!');
        setShowLaunchAnimation(true);
      } else {
        // Handle as regular chat message
        let response = '';
        
        if (workspaceState.mode !== 'chat') {
          response = `🐻 Great! I'm working on that in the background. You can see the progress in the workspace panels. Need me to focus on any specific part?`;
          
          // Simulate some file/workspace updates
          await simulateWorkspaceActivity(userMessage);
        } else {
          response = `🐻 I hear you! That sounds like an interesting project. Want me to set up a full development workspace for this? Just say "build" or "create" something and I'll transform this interface into a complete IDE!`;
        }
        
        addMessage('assistant', response);
      }

    } catch (error) {
      console.error('Error processing message:', error);
      addMessage('assistant', '🐻 Oops! Something went wrong, but I\'m still here to help. Try asking me to build something!');
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== AGENT ACTION EXECUTION ====================

  const executeAgentAction = async (action: any) => {
    const actionId = addAgentAction({
      type: action.type || 'tool_call',
      name: action.name || 'Agent Action',
      description: action.description || 'Executing action...',
      status: 'running'
    });

    try {
      // Simulate or execute real actions based on type
      switch (action.type) {
        case 'create_file':
          await simulateFileCreation(action, actionId);
          break;
        case 'run_command':
          await simulateCommandExecution(action, actionId);
          break;
        case 'code_generation':
          await simulateCodeGeneration(action, actionId);
          break;
        default:
          // Generic action simulation
          await simulateGenericAction(action, actionId);
      }

      updateAgentAction(actionId, { 
        status: 'completed', 
        progress: 100 
      });

    } catch (error: any) {
      updateAgentAction(actionId, { 
        status: 'failed', 
        output: { error: error?.message || 'Unknown error' } 
      });
    }
  };

  const simulateFileCreation = async (action: any, actionId: string) => {
    updateAgentAction(actionId, { progress: 25 });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    updateAgentAction(actionId, { progress: 75 });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Add file to tree
    const newFile: FileNode = {
      id: Date.now().toString(),
      name: action.filename || 'new_file.py',
      type: 'file',
      path: action.path || '/',
      content: action.content || '# Generated by Mama Bear\nprint("Hello, World!")',
      language: action.language || 'python',
      modified: true
    };
    
    setFileTree(prev => [...prev, newFile]);
    updateAgentAction(actionId, { 
      output: { file_created: newFile.name, path: newFile.path } 
    });
  };

  const simulateCommandExecution = async (action: any, actionId: string) => {
    updateAgentAction(actionId, { progress: 30 });
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const output = action.expected_output || `Command '${action.command}' executed successfully`;
    setTerminalOutput(prev => [...prev, `$ ${action.command}`, output]);
    
    updateAgentAction(actionId, { 
      progress: 100,
      output: { command: action.command, result: output } 
    });
  };

  const simulateCodeGeneration = async (action: any, actionId: string) => {
    for (let progress = 0; progress <= 100; progress += 20) {
      updateAgentAction(actionId, { progress });
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    const generatedCode = action.code || `# Generated code for: ${action.description}\n\ndef example_function():\n    return "Generated by Mama Bear AI"`;
    setEditorContent(generatedCode);
    
    if (workspaceState.activeView === 'chat') {
      setWorkspaceState(prev => ({ ...prev, activeView: 'editor' }));
    }
  };

  const simulateGenericAction = async (_action: any, actionId: string) => {
    for (let progress = 0; progress <= 100; progress += 25) {
      updateAgentAction(actionId, { progress });
      await new Promise(resolve => setTimeout(resolve, 400));
    }
  };

  // ==================== WORKSPACE ACTIVITY SIMULATION ====================

  const simulateWorkspaceActivity = async (userMessage: string) => {
    // Simulate file updates based on user request
    if (userMessage.toLowerCase().includes('file') || userMessage.toLowerCase().includes('code')) {
      executeAgentAction({
        type: 'create_file',
        name: 'File Creation',
        description: 'Creating new file based on your request...',
        filename: 'new_feature.py',
        content: `# ${userMessage}\n# Generated by Mama Bear\n\ndef handle_request():\n    return "Processing your request..."`
      });
    }

    if (userMessage.toLowerCase().includes('run') || userMessage.toLowerCase().includes('test')) {
      executeAgentAction({
        type: 'run_command',
        name: 'Command Execution',
        description: 'Running tests and commands...',
        command: 'python test.py',
        expected_output: 'All tests passed! ✅'
      });
    }
  };

  const simulateInitialWorkspaceSetup = async (orchestrationData: any) => {
    // Simulate initial development activity
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    executeAgentAction({
      type: 'code_generation',
      name: 'Initial Code Generation',
      description: 'Generating starter code for your project...',
      code: `# ${projectContext?.goal}\n# Generated by Mama Bear AI\n\nimport os\nimport sys\n\ndef main():\n    print("🐻 Mama Bear says: Your project is ready!")\n    print("Goal: ${projectContext?.goal}")\n    \nif __name__ == "__main__":\n    main()`
    });
  };

  const switchView = (view: WorkspaceState['activeView']) => {
    setWorkspaceState(prev => ({ ...prev, activeView: view }));
  };

  const toggleFullWorkspace = () => {
    setWorkspaceState(prev => ({
      ...prev,
      mode: prev.mode === 'full_workspace' ? 'hybrid' : 'full_workspace',
      splitLayout: prev.mode === 'full_workspace' ? 'vertical' : 'quad'
    }));
  };

  // ==================== RENDER METHODS ====================

  const renderChatMode = () => (
    <div className="scout-chat-mode">
      <div className="scout-hero">
        <div className="scout-logo">
          <span className="scout-icon">🐻</span>
          <h1>Mama Bear Development Agent</h1>
        </div>
        <p className="scout-tagline">Your AI-powered development conductor</p>
        
        {/* Quick Start Buttons */}
        <div className="scout-quick-start">
          <h3>✨ Quick Start Ideas:</h3>
          <div className="scout-quick-buttons">
            <button 
              className="scout-quick-btn"
              onClick={() => {
                setInputValue("Build a React todo app with modern UI");
                handleSubmit(new Event('submit') as any);
              }}
            >
              📝 Todo App
            </button>
            <button 
              className="scout-quick-btn"
              onClick={() => {
                setInputValue("Create a Python API for weather data");
                handleSubmit(new Event('submit') as any);
              }}
            >
              🌤️ Weather API
            </button>
            <button 
              className="scout-quick-btn"
              onClick={() => {
                setInputValue("Build a data dashboard with charts");
                handleSubmit(new Event('submit') as any);
              }}
            >
              📊 Dashboard
            </button>
            <button 
              className="scout-quick-btn"
              onClick={() => {
                setInputValue("Make a portfolio website");
                handleSubmit(new Event('submit') as any);
              }}
            >
              🎨 Portfolio
            </button>
          </div>
        </div>
      </div>

      <div className="scout-messages">
        {messages.map((message) => (
          <div key={message.id} className={`scout-message scout-message-${message.type}`}>
            <div className="scout-message-content">
              {message.content.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            <div className="scout-message-time">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="scout-message scout-message-assistant">
            <div className="scout-loading-pulse">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="scout-chat-input-section">
        <div className="scout-chat-input-wrapper">
          <div className="scout-quick-start-buttons">
            <button 
              className="scout-quick-btn"
              onClick={() => setInputValue("Build me a beautiful website")}
            >
              🌐 Website
            </button>
            <button 
              className="scout-quick-btn"
              onClick={() => setInputValue("Create a Python API")}
            >
              🐍 API
            </button>
            <button 
              className="scout-quick-btn"
              onClick={() => setInputValue("Build a React app")}
            >
              ⚛️ React App
            </button>
            <button 
              className="scout-quick-btn"
              onClick={() => setInputValue("Make a Discord bot")}
            >
              🤖 Bot
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="scout-chat-form-enhanced">
            <div className="scout-input-container">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="🐻 Tell Mama Bear what amazing thing you want to build..."
                className="scout-chat-input-large"
                rows={3}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <div className="scout-input-actions">
                <button
                  type="button"
                  className="scout-emoji-btn-large"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  😊
                </button>
                <button
                  type="submit"
                  className="scout-send-btn-large"
                  disabled={!inputValue.trim() || isLoading}
                >
                  {isLoading ? '⏳ Mama Bear is thinking...' : '🚀 Build This!'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {renderAgentTimeline()}
    </div>
  );

  const renderHybridMode = () => (
    <div className="scout-hybrid-mode">
      <div className="scout-workspace-header">
        <div className="scout-project-info">
          <h2>🚀 {projectContext?.name}</h2>
          <span className={`scout-status scout-status-${projectContext?.status}`}>
            {projectContext?.status}
          </span>
        </div>
        <div className="scout-view-controls">
          {(['chat', 'editor', 'preview', 'files', 'terminal'] as const).map((view) => (
            <button
              key={view}
              className={`scout-view-btn ${workspaceState.activeView === view ? 'active' : ''}`}
              onClick={() => switchView(view)}
            >
              {getViewIcon(view)} {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
          <button className="scout-layout-btn" onClick={toggleFullWorkspace}>
            📐 Full Workspace
          </button>
        </div>
      </div>

      <div className={`scout-workspace-content layout-${workspaceState.splitLayout}`}>
        <div className="scout-main-panel">
          {renderActiveView()}
        </div>
        {workspaceState.splitLayout !== 'single' && (
          <div className="scout-side-panel">
            {renderSidePanel()}
          </div>
        )}
      </div>
    </div>
  );

  const renderFullWorkspace = () => (
    <div className="scout-full-workspace">
      <div className="scout-workspace-toolbar">
        <div className="scout-project-breadcrumb">
          🐻 {projectContext?.name} • {projectContext?.status}
        </div>
        <div className="scout-workspace-actions">
          <button onClick={() => changeSplitLayout('vertical')}>⏸️ Vertical</button>
          <button onClick={() => changeSplitLayout('horizontal')}>⏸️ Horizontal</button>
          <button onClick={() => changeSplitLayout('quad')}>⏹️ Quad</button>
          <button onClick={toggleFullWorkspace}>💬 Back to Chat</button>
        </div>
      </div>

      <div className={`scout-quad-layout layout-${workspaceState.splitLayout}`}>
        <div className="scout-quad-panel scout-panel-files">
          {renderFileExplorer()}
        </div>
        <div className="scout-quad-panel scout-panel-editor">
          {renderCodeEditor()}
        </div>
        <div className="scout-quad-panel scout-panel-preview">
          {renderLivePreview()}
        </div>
        <div className="scout-quad-panel scout-panel-timeline">
          {renderAgentTimeline()}
        </div>
      </div>
    </div>
  );

  // Render function implementations
  const renderActiveView = () => {
    switch (workspaceState.activeView) {
      case 'editor':
        return renderCodeEditor();
      case 'preview':
        return renderLivePreview();
      case 'files':
        return renderFileExplorer();
      case 'terminal':
        return renderTerminal();
      default:
        return renderChatPanel();
    }
  };

  const renderSidePanel = () => {
    // Show different content in side panel based on main view
    switch (workspaceState.activeView) {
      case 'editor':
        return renderFileExplorer();
      case 'preview':
        return renderAgentTimeline();
      default:
        return renderAgentTimeline();
    }
  };

  const renderLivePreview = () => (
    <div className="scout-live-preview">
      <div className="scout-preview-header">
        <span>👁️ {livePreview?.title || 'Live Preview'}</span>
        {livePreview?.isLoading && <span className="scout-loading-spinner">⏳</span>}
      </div>
      <div className="scout-preview-content">
        {livePreview?.type === 'web' && livePreview.url ? (
          <iframe 
            ref={previewRef}
            src={livePreview.url} 
            className="scout-preview-iframe"
            title="Live Preview"
          />
        ) : (
          <div className="scout-preview-text">
            <pre>{livePreview?.content || 'Preview content will appear here...'}</pre>
          </div>
        )}
      </div>
    </div>
  );

  const renderFileExplorer = () => (
    <div className="scout-file-explorer">
      <div className="scout-explorer-header">
        <span>📁 Files</span>
      </div>
      <div className="scout-file-tree">
        {fileTree.map(file => renderFileNode(file))}
      </div>
    </div>
  );

  const renderFileNode = (file: FileNode): React.ReactNode => (
    <div key={file.id} className={`scout-file-node ${file.type}`}>
      <div 
        className="scout-file-label"
        onClick={() => file.type === 'file' ? handleFileSelect(file) : toggleFileExpanded(file.id)}
      >
        <span className="scout-file-icon">{getFileIcon(file.name)}</span>
        <span className="scout-file-name">{file.name}</span>
        {file.modified && <span className="scout-modified-indicator">●</span>}
      </div>
      {file.type === 'folder' && file.isExpanded && file.children && (
        <div className="scout-file-children">
          {file.children.map(child => renderFileNode(child))}
        </div>
      )}
    </div>
  );

  const renderTerminal = () => (
    <div className="scout-terminal">
      <div className="scout-terminal-header">
        <span>💻 Terminal</span>
      </div>
      <div className="scout-terminal-content">
        {terminalOutput.map((line, index) => (
          <div key={index} className="scout-terminal-line">
            {line}
          </div>
        ))}
      </div>
    </div>
  );

  const renderAgentTimeline = () => (
    <div className="scout-agent-timeline">
      <div className="scout-timeline-header">
        <span>🐻 Agent Activity</span>
      </div>
      <div className="scout-timeline-content">
        {agentActions.slice(-5).map((action) => (
          <div key={action.id} className={`scout-timeline-item ${action.status}`}>
            <div className="scout-timeline-icon">{getActionIcon(action.type)}</div>
            <div className="scout-timeline-details">
              <div className="scout-timeline-name">{action.name}</div>
              <div className="scout-timeline-description">{action.description}</div>
              {action.progress !== undefined && (
                <div className="scout-progress-bar">
                  <div 
                    className="scout-progress-fill" 
                    style={{ width: `${action.progress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
        {agentActions.length === 0 && (
          <div className="scout-timeline-empty">
            No agent activity yet. Try asking Mama Bear to build something!
          </div>
        )}
      </div>
    </div>
  );

  const changeSplitLayout = (layout: WorkspaceState['splitLayout']) => {
    setWorkspaceState(prev => ({ ...prev, splitLayout: layout }));
  };

  const toggleFileExpanded = (fileId: string) => {
    setFileTree(prev => prev.map(file => 
      file.id === fileId ? { ...file, isExpanded: !file.isExpanded } : file
    ));
  };

  const renderChatInput = () => (
    <div className="scout-chat-input-container">
      <form onSubmit={handleSubmit} className="scout-chat-form">
        <div className="scout-input-wrapper">
          <input
            ref={chatInputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Tell Mama Bear what to build..."
            className="scout-chat-input"
            disabled={isLoading}
          />
          <div className="scout-input-controls">
            <button
              type="button"
              className="scout-emoji-btn"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              😊
            </button>
            <button
              type="submit"
              className="scout-send-btn"
              disabled={!inputValue.trim() || isLoading}
            >
              {isLoading ? '⏳' : '🚀'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );

  const renderChatPanel = () => (
    <div className="scout-chat-panel">
      <div className="scout-messages-container">
        {messages.slice(-10).map((message) => (
          <div key={message.id} className={`scout-message scout-message-${message.type}`}>
            <div className="scout-message-content">
              {message.content.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            <div className="scout-message-time">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="scout-message scout-message-assistant">
            <div className="scout-loading-pulse">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      
      <div className="scout-chat-input-section">
        <form onSubmit={handleSubmit} className="scout-chat-form">
          <div className="scout-input-wrapper">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Mama Bear to build something amazing..."
              className="scout-chat-input"
              rows={2}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <div className="scout-input-controls">
              <button
                type="button"
                className="scout-emoji-btn"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                😊
              </button>
              <button
                type="submit"
                className="scout-send-btn"
                disabled={!inputValue.trim() || isLoading}
              >
                {isLoading ? '⏳' : '🚀'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  const renderCodeEditor = () => (
    <div className="scout-code-editor">
      <div className="scout-editor-header">
        <span>📝 {activeFile?.name || 'Editor'}</span>
        {activeFile?.modified && <span className="scout-modified-indicator">●</span>}
      </div>
      <div className="scout-editor-content" ref={editorRef}>
        <textarea
          value={editorContent}
          onChange={(e) => setEditorContent(e.target.value)}
          placeholder="// Code will appear here as Mama Bear generates it..."
          className="scout-code-textarea"
        />
      </div>
    </div>
  );

  // ==================== HELPER FUNCTIONS ====================

  const inferProjectType = (goal: string): string => {
    const lowercaseGoal = goal.toLowerCase();
    if (lowercaseGoal.includes('website') || lowercaseGoal.includes('web')) return 'web_app';
    if (lowercaseGoal.includes('api') || lowercaseGoal.includes('backend')) return 'api';
    if (lowercaseGoal.includes('mobile') || lowercaseGoal.includes('app')) return 'mobile_app';
    if (lowercaseGoal.includes('bot') || lowercaseGoal.includes('ai')) return 'ai_bot';
    if (lowercaseGoal.includes('data') || lowercaseGoal.includes('analysis')) return 'data_science';
    return 'general';
  };

  const simulateWorkspaceActivity = async (userMessage: string) => {
    // Simulate Mama Bear working on the user's request
    const actionId = addAgentAction({
      type: 'code_execution',
      name: 'Processing Request',
      description: `Working on: ${userMessage}`,
      status: 'running'
    });

    // Simulate progress
    updateAgentAction(actionId, { progress: 25 });
    await new Promise(resolve => setTimeout(resolve, 800));
    
    updateAgentAction(actionId, { progress: 75 });
    await new Promise(resolve => setTimeout(resolve, 800));
    
    updateAgentAction(actionId, { 
      progress: 100, 
      status: 'completed',
      output: { result: 'Task completed successfully!' }
    });

    // Maybe add a new file or update terminal
    if (Math.random() > 0.5) {
      setTerminalOutput(prev => [
        ...prev,
        '',
        `$ # Working on: ${userMessage}`,
        '🐻 Making progress...',
        'Task completed!',
        '$'
      ]);
    }
  };

  const simulateInitialWorkspaceSetup = async (_orchestrationData: any) => {
    // Simulate initial setup actions
    const actions = [
      {
        type: 'file_operation' as const,
        name: 'Create Project Structure',
        description: 'Setting up initial files and directories...'
      },
      {
        type: 'vm_operation' as const, 
        name: 'Environment Setup',
        description: 'Configuring development environment...'
      },
      {
        type: 'tool_call' as const,
        name: 'Install Dependencies',
        description: 'Installing required packages...'
      }
    ];

    for (const action of actions) {
      const actionId = addAgentAction({
        ...action,
        status: 'running'
      });

      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 25) {
        updateAgentAction(actionId, { progress });
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      updateAgentAction(actionId, { status: 'completed' });
    }

    // Update project status
    setProjectContext(prev => prev ? { ...prev, status: 'executing' } : null);
  };

  const handleFileSelect = (file: FileNode) => {
    setActiveFile(file);
    if (file.content) {
      setEditorContent(file.content);
    }
    if (workspaceState.mode !== 'chat') {
      setWorkspaceState(prev => ({ ...prev, activeView: 'editor' }));
    }
  };

  const getViewIcon = (view: string): string => {
    const icons: Record<string, string> = {
      chat: '💬',
      editor: '📝',
      preview: '👁️',
      files: '📁',
      terminal: '💻'
    };
    return icons[view] || '📄';
  };

  const getFileIcon = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const icons: Record<string, string> = {
      js: '🟨', ts: '🔷', py: '🐍', html: '🌐', css: '🎨',
      json: '📋', md: '📝', txt: '📄'
    };
    return ext ? (icons[ext] || '📄') : '📄';
  };

  const getActionIcon = (type: string): string => {
    const icons: Record<string, string> = {
      thinking: '🤔',
      tool_call: '🔧',
      code_execution: '⚡',
      file_operation: '📁',
      vm_operation: '💻'
    };
    return icons[type] || '⚙️';
  };

  // ==================== MAIN RENDER ====================

  return (
    <div className="scout-dynamic-workspace">
      {/* ROCKET LAUNCH ANIMATION! 🚀 */}
      <WorkspaceLaunchAnimation
        isVisible={showLaunchAnimation}
        projectGoal={messages.filter(m => m.type === 'user').pop()?.content || 'Amazing Project'}
        onComplete={handleLaunchComplete}
      />

      {workspaceState.isTransitioning && (
        <div className="scout-transition-overlay">
          <div className="scout-transition-content">
            <div className="scout-transition-loader"></div>
            <p>🐻 Mama Bear is finalizing your workspace...</p>
          </div>
        </div>
      )}

      <div className="scout-main-content">
        {workspaceState.mode === 'chat' && renderChatMode()}
        {workspaceState.mode === 'hybrid' && renderHybridMode()}
        {workspaceState.mode === 'full_workspace' && renderFullWorkspace()}
      </div>

      {/* Enhanced Chat Bar for Hybrid/Full Workspace */}
      {workspaceState.mode !== 'chat' && (
        <div className="scout-enhanced-chat">
          <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
            <input
              ref={chatInputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="🐻 Tell Mama Bear what to build next..."
              className="scout-enhanced-input"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="scout-enhanced-send"
              disabled={!inputValue.trim() || isLoading}
            >
              {isLoading ? '⏳' : '🚀'}
            </button>
          </form>
        </div>
      )}

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="scout-emoji-picker">
          {['😊', '👍', '❤️', '🚀', '💡', '🎯', '✨', '🔥'].map((emoji) => (
            <button
              key={emoji}
              className="scout-emoji-item"
              onClick={() => {
                setInputValue(prev => prev + emoji);
                setShowEmojiPicker(false);
                chatInputRef.current?.focus();
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScoutDynamicWorkspace;
