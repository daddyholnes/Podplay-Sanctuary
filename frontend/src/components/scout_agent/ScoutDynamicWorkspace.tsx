// Scout Dynamic Workspace - www.scout.new Inspired Interface
// The "Transforming Canvas" - Dynamic, Unified, Proactive Agentic Workspace

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './ScoutDynamicWorkspace.css';

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

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);

  // ==================== INITIALIZATION ====================
  
  useEffect(() => {
    // Initialize with Mama Bear welcome
    const welcomeMessage: ChatMessage = {
      id: '1',
      type: 'assistant',
      content: "🐻 Hey Nathan! Mama Bear here, ready for some serious development magic. What would you like to build today? I'll create a complete workspace environment as we go.",
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

      // 2. Start Mama Bear orchestration
      addAgentAction({
        type: 'thinking',
        name: 'Project Analysis',
        description: 'Mama Bear is analyzing your request and creating a development plan...',
        status: 'running'
      });

      // 3. Call Mama Bear backend for full orchestration
      const response = await fetch('/api/mama-bear/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_goal: projectGoal,
          request_workspace: true,
          enable_scout_monitoring: true,
          context: { user: 'Nathan', workspace_type: 'dynamic' }
        })
      });

      if (!response.ok) throw new Error('Failed to start orchestration');
      
      const orchestrationData = await response.json();

      // 4. Update project with workspace details
      if (orchestrationData.workspace_created) {
        setProjectContext(prev => prev ? {
          ...prev,
          workspaceId: orchestrationData.workspace_id,
          vmId: orchestrationData.vm_id,
          status: 'planning'
        } : null);
      }

      // 5. Transition UI to hybrid mode
      setWorkspaceState({
        mode: 'hybrid',
        activeView: 'preview',
        isTransitioning: false,
        splitLayout: 'vertical'
      });

      // 6. Initialize file tree and preview
      await initializeWorkspaceComponents(orchestrationData);

      // 7. Add completion message
      addMessage('system', '🚀 Workspace activated! Mama Bear has set up your development environment. You can see the live workspace while we continue chatting.');

    } catch (error) {
      console.error('Workspace transition error:', error);
      addMessage('system', '⚠️ There was an issue setting up the workspace. Continuing in chat mode for now.');
      setWorkspaceState(prev => ({ ...prev, isTransitioning: false }));
    }
  }, []);

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
      // Initialize file tree
      const fileTreeResponse = await fetch(`/api/workspaces/${orchestrationData.workspace_id}/files`);
      if (fileTreeResponse.ok) {
        const fileData = await fileTreeResponse.json();
        setFileTree(fileData.files || []);
      }

      // Set initial preview
      if (orchestrationData.preview_url) {
        setLivePreview({
          type: 'web',
          url: orchestrationData.preview_url,
          title: 'Live Application',
          isLoading: true
        });
      } else {
        setLivePreview({
          type: 'plan',
          title: 'Project Plan',
          content: 'Mama Bear is generating your project plan...'
        });
      }

      // Start terminal session
      if (orchestrationData.workspace_id) {
        initializeTerminal(orchestrationData.workspace_id);
      }

    } catch (error) {
      console.error('Failed to initialize workspace components:', error);
    }
  };

  const initializeTerminal = (workspaceId: string) => {
    // Terminal WebSocket connection would be initialized here
    // This connects to the existing WebSocket infrastructure
    setTerminalOutput([
      '🐻 Mama Bear Terminal Session Started',
      `Workspace: ${workspaceId}`,
      'Ready for commands...'
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
      // Send to Mama Bear with workspace context
      const response = await fetch('/api/mama-bear/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          project_context: projectContext,
          workspace_active: workspaceState.mode !== 'chat',
          enable_actions: true
        })
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      const data = await response.json();
      
      // Add Mama Bear's response
      addMessage('assistant', data.response || 'I received your message!');

      // Handle any agent actions
      if (data.actions && data.actions.length > 0) {
        for (const action of data.actions) {
          await executeAgentAction(action);
        }
      }

      // Check if we should transition to workspace
      if (data.should_create_workspace && workspaceState.mode === 'chat') {
        await transitionToWorkspace(userMessage);
      }

      // Update workspace components if needed
      if (data.file_updates && workspaceState.mode !== 'chat') {
        updateWorkspaceFiles(data.file_updates);
      }

      if (data.preview_update) {
        updateLivePreview(data.preview_update);
      }

    } catch (error) {
      console.error('Error processing message:', error);
      addMessage('system', 'Sorry, there was an error processing your message.');
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

  // ==================== WORKSPACE UPDATES ====================

  const updateWorkspaceFiles = (fileUpdates: any[]) => {
    fileUpdates.forEach(update => {
      if (update.type === 'create') {
        const newFile: FileNode = {
          id: Date.now().toString(),
          name: update.name,
          type: update.file_type || 'file',
          path: update.path,
          content: update.content,
          language: update.language
        };
        setFileTree(prev => [...prev, newFile]);
      }
      // Handle other update types...
    });
  };

  const updateLivePreview = (previewUpdate: any) => {
    setLivePreview({
      type: previewUpdate.type || 'web',
      url: previewUpdate.url,
      title: previewUpdate.title || 'Live Preview',
      content: previewUpdate.content,
      isLoading: false
    });
  };

  // ==================== LAYOUT MANAGEMENT ====================

  const switchView = (view: WorkspaceState['activeView']) => {
    setWorkspaceState(prev => ({ ...prev, activeView: view }));
  };

  const changeSplitLayout = (layout: WorkspaceState['splitLayout']) => {
    setWorkspaceState(prev => ({ ...prev, splitLayout: layout }));
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
        {renderChatInput()}
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

  const renderActiveView = () => {
    switch (workspaceState.activeView) {
      case 'chat':
        return renderChatPanel();
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

  const renderLivePreview = () => (
    <div className="scout-live-preview">
      <div className="scout-preview-header">
        <span>👁️ {livePreview?.title || 'Preview'}</span>
        {livePreview?.isLoading && <span className="scout-loading-dot">●</span>}
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
          <div className="scout-preview-placeholder">
            <div className="scout-preview-text">
              {livePreview?.content || 'Live preview will appear here...'}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderFileExplorer = () => (
    <div className="scout-file-explorer">
      <div className="scout-explorer-header">
        <span>📁 Project Files</span>
        <button className="scout-refresh-btn">🔄</button>
      </div>
      <div className="scout-file-tree">
        {fileTree.map((file) => (
          <div
            key={file.id}
            className={`scout-file-item ${activeFile?.id === file.id ? 'active' : ''}`}
            onClick={() => handleFileSelect(file)}
          >
            <span className="scout-file-icon">
              {file.type === 'folder' ? '📁' : getFileIcon(file.name)}
            </span>
            <span className="scout-file-name">{file.name}</span>
            {file.modified && <span className="scout-file-modified">●</span>}
          </div>
        ))}
        {fileTree.length === 0 && (
          <div className="scout-empty-state">No files yet...</div>
        )}
      </div>
    </div>
  );

  const renderTerminal = () => (
    <div className="scout-terminal">
      <div className="scout-terminal-header">
        <span>💻 Terminal</span>
        <button className="scout-clear-btn">🗑️ Clear</button>
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
        <span>🤖 Agent Activity</span>
        {currentAction && (
          <span className={`scout-current-status scout-status-${currentAction.status}`}>
            {currentAction.status}
          </span>
        )}
      </div>
      <div className="scout-timeline-content">
        {agentActions.map((action) => (
          <div key={action.id} className={`scout-timeline-item scout-action-${action.status}`}>
            <div className="scout-action-icon">{getActionIcon(action.type)}</div>
            <div className="scout-action-details">
              <div className="scout-action-name">{action.name}</div>
              <div className="scout-action-description">{action.description}</div>
              {action.progress !== undefined && action.status === 'running' && (
                <div className="scout-progress-bar">
                  <div 
                    className="scout-progress-fill" 
                    style={{ width: `${action.progress}%` }}
                  />
                </div>
              )}
              {action.output && action.status === 'completed' && (
                <div className="scout-action-output">
                  ✅ {JSON.stringify(action.output, null, 2)}
                </div>
              )}
            </div>
            <div className="scout-action-time">
              {new Date(action.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        {agentActions.length === 0 && (
          <div className="scout-empty-timeline">Waiting for Mama Bear to start working...</div>
        )}
      </div>
    </div>
  );

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

  // ==================== HELPER FUNCTIONS ====================

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
      {workspaceState.isTransitioning && (
        <div className="scout-transition-overlay">
          <div className="scout-transition-content">
            <div className="scout-transition-loader"></div>
            <p>🐻 Mama Bear is setting up your workspace...</p>
          </div>
        </div>
      )}

      <div className="scout-main-content">
        {workspaceState.mode === 'chat' && renderChatMode()}
        {workspaceState.mode === 'hybrid' && renderHybridMode()}
        {workspaceState.mode === 'full_workspace' && renderFullWorkspace()}
      </div>

      {/* Chat input only for hybrid/full workspace modes */}
      {workspaceState.mode !== 'chat' && renderChatInput()}

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
