import React, { useState, useEffect, useCallback, useRef } from 'react';
import './MamaBearControlCenter.css';

// Enhanced types for the control center
interface CodeServerInstance {
  id: string;
  name: string;
  url: string;
  status: 'running' | 'stopped' | 'starting' | 'error';
  workspace: string;
  theme: 'mama-bear' | 'sanctuary' | 'code-dark';
  port: number;
  cpu: number;
  memory: number;
  lastActivity: string;
  isMinimized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface WorkspaceTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  language: string;
  framework: string;
  features: string[];
  estimatedSetupTime: string;
}

interface MamaBearCommand {
  id: string;
  name: string;
  description: string;
  category: 'workspace' | 'ai' | 'deployment' | 'monitoring';
  icon: string;
  hotkey?: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'mama-bear' | 'system';
  content: string;
  timestamp: Date;
  attachments?: File[];
}

interface EnhancedChatBarProps {
  onSendMessage: (message: string, attachments?: File[]) => void;
  onVoiceCommand: (audioBlob: Blob) => void;
  onScreenCapture: () => void;
  isListening?: boolean;
  placeholder?: string;
}

// Enhanced Chat Bar Component
const EnhancedChatBar: React.FC<EnhancedChatBarProps> = ({
  onSendMessage,
  onVoiceCommand,
  onScreenCapture,
  isListening = false,
  placeholder = "Chat with Mama Bear... 🐻"
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiBoard, setShowEmojiBoard] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const emojis = ['😊', '👍', '❤️', '🎉', '🔥', '💡', '🚀', '⭐', '🐻', '🏠', '💻', '🎯'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || attachments.length > 0) {
      onSendMessage(message, attachments);
      setMessage('');
      setAttachments([]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...files]);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        onVoiceCommand(audioBlob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const insertEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiBoard(false);
  };

  return (
    <div className="enhanced-chat-bar">
      <form onSubmit={handleSubmit} className="chat-form">
        <div 
          className={`chat-input-container ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Attachments preview */}
          {attachments.length > 0 && (
            <div className="attachments-preview">
              {attachments.map((file, index) => (
                <div key={index} className="attachment-item">
                  <span className="attachment-name">{file.name}</span>
                  <button 
                    type="button" 
                    onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                    className="remove-attachment"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Main input area */}
          <div className="input-row">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={placeholder}
              className="chat-input"
              disabled={isListening}
            />
            
            {/* Action buttons */}
            <div className="chat-actions">
              <button
                type="button"
                onClick={() => setShowEmojiBoard(!showEmojiBoard)}
                className="action-btn emoji-btn"
                title="Add emoji"
              >
                😊
              </button>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="action-btn file-btn"
                title="Attach file"
              >
                📎
              </button>
              
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`action-btn voice-btn ${isRecording ? 'recording' : ''}`}
                title={isRecording ? "Stop recording" : "Voice message"}
              >
                🎤
              </button>
              
              <button
                type="button"
                onClick={onScreenCapture}
                className="action-btn screen-btn"
                title="Screen capture"
              >
                📸
              </button>
              
              <button
                type="submit"
                className="action-btn send-btn"
                disabled={!message.trim() && attachments.length === 0}
                title="Send message"
              >
                ➤
              </button>
            </div>
          </div>

          {/* Emoji board */}
          {showEmojiBoard && (
            <div className="emoji-board">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  className="emoji-btn"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </form>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
};

// Main Mama Bear Control Center Component
const MamaBearControlCenter: React.FC = () => {
  // State management
  const [instances, setInstances] = useState<CodeServerInstance[]>([]);
  const [templates, setTemplates] = useState<WorkspaceTemplate[]>([]);
  const [commands, setCommands] = useState<MamaBearCommand[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<'mama-bear' | 'sanctuary' | 'code-dark'>('sanctuary');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [minimizedInstances, setMinimizedInstances] = useState<string[]>([]);
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 0,
    memory: 0,
    disk: 0,
    activeInstances: 0
  });

  // Default templates
  const defaultTemplates: WorkspaceTemplate[] = [
    {
      id: 'react-typescript',
      name: 'React + TypeScript',
      description: 'Modern React development with TypeScript, Vite, and Mama Bear integration',
      icon: '⚛️',
      language: 'TypeScript',
      framework: 'React',
      features: ['Hot Reload', 'ESLint', 'Prettier', 'Mama Bear AI'],
      estimatedSetupTime: '2 minutes'
    },
    {
      id: 'python-fastapi',
      name: 'Python FastAPI',
      description: 'Fast Python API development with automatic docs and Mama Bear monitoring',
      icon: '🐍',
      language: 'Python',
      framework: 'FastAPI',
      features: ['Auto Docs', 'Hot Reload', 'Poetry', 'Mama Bear Analytics'],
      estimatedSetupTime: '3 minutes'
    },
    {
      id: 'node-express',
      name: 'Node.js + Express',
      description: 'Backend API development with Express, TypeScript, and Mama Bear insights',
      icon: '🟢',
      language: 'JavaScript',
      framework: 'Express',
      features: ['TypeScript', 'Nodemon', 'Morgan', 'Mama Bear Logging'],
      estimatedSetupTime: '2 minutes'
    },
    {
      id: 'sanctuary-extension',
      name: 'Sanctuary Extension',
      description: 'VS Code extension development with Sanctuary theme integration',
      icon: '🏠',
      language: 'TypeScript',
      framework: 'VS Code Extension',
      features: ['Extension API', 'Webview', 'Commands', 'Mama Bear Support'],
      estimatedSetupTime: '4 minutes'
    }
  ];

  // Default commands
  const defaultCommands: MamaBearCommand[] = [
    {
      id: 'create-workspace',
      name: 'Create Workspace',
      description: 'Set up a new development workspace with Mama Bear assistance',
      category: 'workspace',
      icon: '🏗️',
      hotkey: 'Ctrl+Shift+N'
    },
    {
      id: 'ai-code-review',
      name: 'AI Code Review',
      description: 'Get intelligent code suggestions and reviews from Mama Bear',
      category: 'ai',
      icon: '🔍',
      hotkey: 'Ctrl+Shift+R'
    },
    {
      id: 'deploy-app',
      name: 'Deploy Application',
      description: 'Deploy your application with Mama Bear deployment pipeline',
      category: 'deployment',
      icon: '🚀',
      hotkey: 'Ctrl+Shift+D'
    },
    {
      id: 'system-health',
      name: 'System Health Check',
      description: 'Monitor system performance and workspace health',
      category: 'monitoring',
      icon: '💊',
      hotkey: 'Ctrl+Shift+H'
    }
  ];

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setTemplates(defaultTemplates);
        setCommands(defaultCommands);
        
        // Add welcome message
        setChatMessages([{
          id: '1',
          type: 'mama-bear',
          content: '🐻 Welcome to your Sanctuary! I\'m Mama Bear, ready to help you build amazing things. What would you like to create today?',
          timestamp: new Date()
        }]);

        // Update system metrics
        setSystemMetrics({
          cpu: Math.floor(Math.random() * 30) + 10,
          memory: Math.floor(Math.random() * 40) + 20,
          disk: Math.floor(Math.random() * 20) + 15,
          activeInstances: instances.length
        });
        
      } catch (error) {
        console.error('Error initializing control center:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Create new instance
  const createInstance = useCallback(async (template: WorkspaceTemplate) => {
    const newInstance: CodeServerInstance = {
      id: `instance-${Date.now()}`,
      name: `${template.name} - ${new Date().toLocaleTimeString()}`,
      url: `http://localhost:${8080 + instances.length}`,
      status: 'starting',
      workspace: `/workspaces/${template.id}`,
      theme: selectedTheme,
      port: 8080 + instances.length,
      cpu: 0,
      memory: 0,
      lastActivity: new Date().toISOString(),
      isMinimized: false,
      position: { x: 100 + instances.length * 50, y: 100 + instances.length * 50 },
      size: { width: 1200, height: 800 }
    };

    setInstances(prev => [...prev, newInstance]);
    setShowCreateModal(false);

    // Simulate startup process
    setTimeout(() => {
      setInstances(prev => prev.map(inst => 
        inst.id === newInstance.id 
          ? { ...inst, status: 'running' as const }
          : inst
      ));
    }, 3000);

    // Add chat message
    const chatMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'mama-bear',
      content: `🎉 Created new ${template.name} workspace! Setting up your development environment with love and care. It'll be ready in just a moment!`,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, chatMessage]);
  }, [instances.length, selectedTheme]);

  // Control instance
  const controlInstance = useCallback((id: string, action: 'start' | 'stop' | 'restart' | 'delete') => {
    setInstances(prev => prev.map(inst => {
      if (inst.id === id) {
        switch (action) {
          case 'start':
            return { ...inst, status: 'starting' as const };
          case 'stop':
            return { ...inst, status: 'stopped' as const };
          case 'restart':
            return { ...inst, status: 'starting' as const };
          default:
            return inst;
        }
      }
      return inst;
    }));

    if (action === 'delete') {
      setInstances(prev => prev.filter(inst => inst.id !== id));
      setMinimizedInstances(prev => prev.filter(instId => instId !== id));
    }
  }, []);

  // Minimize/restore instance
  const toggleMinimize = useCallback((id: string) => {
    setInstances(prev => prev.map(inst => 
      inst.id === id ? { ...inst, isMinimized: !inst.isMinimized } : inst
    ));
    
    setMinimizedInstances(prev => {
      const instance = instances.find(inst => inst.id === id);
      if (instance?.isMinimized) {
        return prev.filter(instId => instId !== id);
      } else {
        return [...prev, id];
      }
    });
  }, [instances]);

  // Chat handlers
  const handleSendMessage = useCallback((content: string, attachments?: File[]) => {
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date(),
      attachments
    };
    
    setChatMessages(prev => [...prev, userMessage]);

    // Simulate Mama Bear response
    setTimeout(() => {
      const responses = [
        "🐻 I understand! Let me help you with that right away.",
        "🏠 That's a great idea! I'll set that up in your Sanctuary.",
        "💡 Perfect! I have just the solution for you.",
        "🚀 Excellent choice! Let's make this happen together.",
        "⭐ I love your thinking! Here's what I recommend..."
      ];
      
      const mamaBearResponse: ChatMessage = {
        id: `msg-${Date.now()}`,
        type: 'mama-bear',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, mamaBearResponse]);
    }, 1000);
  }, []);

  const handleVoiceCommand = useCallback((audioBlob: Blob) => {
    // Handle voice command processing
    console.log('Processing voice command:', audioBlob);
    
    const voiceMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: '🎤 Voice message received',
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, voiceMessage]);
  }, []);

  const handleScreenCapture = useCallback(() => {
    // Handle screen capture
    console.log('Screen capture requested');
    
    const captureMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'system',
      content: '📸 Screen capture saved to workspace',
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, captureMessage]);
  }, []);

  // Execute command
  const executeCommand = useCallback((command: MamaBearCommand) => {
    console.log('Executing command:', command.name);
    
    switch (command.id) {
      case 'create-workspace':
        setShowCreateModal(true);
        break;
      case 'ai-code-review':
        handleSendMessage('Please review my current code and provide suggestions');
        break;
      case 'deploy-app':
        handleSendMessage('Help me deploy my application');
        break;
      case 'system-health':
        handleSendMessage('Show me the current system health status');
        break;
    }
  }, [handleSendMessage]);

  if (isLoading) {
    return (
      <div className="mama-bear-control-center loading">
        <div className="loading-container">
          <div className="mama-bear-logo">🐻</div>
          <h2>Preparing your Sanctuary...</h2>
          <div className="loading-spinner"></div>
          <p>Mama Bear is setting up your development environment with love and care</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mama-bear-control-center">
      {/* Header */}
      <header className="control-center-header">
        <div className="header-left">
          <div className="mama-bear-logo">🐻</div>
          <div className="header-info">
            <h1>Mama Bear Control Center</h1>
            <p>Your AI-Powered Development Sanctuary</p>
          </div>
        </div>
        
        <div className="header-center">
          <div className="system-metrics">
            <div className="metric">
              <span className="metric-label">CPU</span>
              <span className="metric-value">{systemMetrics.cpu}%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Memory</span>
              <span className="metric-value">{systemMetrics.memory}%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Instances</span>
              <span className="metric-value">{instances.length}</span>
            </div>
          </div>
        </div>
        
        <div className="header-right">
          <select 
            value={selectedTheme} 
            onChange={(e) => setSelectedTheme(e.target.value as any)}
            className="theme-selector"
          >
            <option value="sanctuary">🏠 Sanctuary</option>
            <option value="mama-bear">🐻 Mama Bear</option>
            <option value="code-dark">🌙 Code Dark</option>
          </select>
          
          <button 
            onClick={() => setShowChatPanel(!showChatPanel)}
            className={`chat-toggle ${showChatPanel ? 'active' : ''}`}
          >
            💬
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="control-center-content">
        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            {commands.map(command => (
              <button
                key={command.id}
                onClick={() => executeCommand(command)}
                className={`action-btn ${command.category}`}
                title={command.description}
              >
                <span className="action-icon">{command.icon}</span>
                <span className="action-name">{command.name}</span>
                {command.hotkey && (
                  <span className="action-hotkey">{command.hotkey}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Active Instances */}
        <div className="instances-section">
          <div className="section-header">
            <h3>Active Workspaces ({instances.length})</h3>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="create-btn"
            >
              + New Workspace
            </button>
          </div>
          
          {instances.length === 0 ? (
            <div className="no-instances">
              <div className="empty-state">
                <div className="empty-icon">🏗️</div>
                <h4>No workspaces yet</h4>
                <p>Create your first development workspace to get started!</p>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="primary-btn"
                >
                  Create Workspace
                </button>
              </div>
            </div>
          ) : (
            <div className="instances-grid">
              {instances.filter(inst => !inst.isMinimized).map(instance => (
                <div key={instance.id} className="instance-window">
                  <div className="window-header">
                    <div className="window-title">
                      <span className={`status-indicator ${instance.status}`}></span>
                      {instance.name}
                    </div>
                    <div className="window-controls">
                      <button 
                        onClick={() => toggleMinimize(instance.id)}
                        className="window-btn minimize"
                        title="Minimize"
                      >
                        −
                      </button>
                      <button 
                        onClick={() => controlInstance(instance.id, 'delete')}
                        className="window-btn close"
                        title="Close"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  
                  <div className="window-content">
                    {instance.status === 'running' ? (
                      <iframe
                        src={instance.url}
                        title={instance.name}
                        className="vscode-iframe"
                        style={{
                          width: '100%',
                          height: '600px',
                          border: 'none',
                          borderRadius: '8px'
                        }}
                      />
                    ) : (
                      <div className="instance-placeholder">
                        <div className={`status-display ${instance.status}`}>
                          {instance.status === 'starting' && (
                            <>
                              <div className="loading-spinner"></div>
                              <p>Starting workspace...</p>
                            </>
                          )}
                          {instance.status === 'stopped' && (
                            <>
                              <div className="stopped-icon">⏹️</div>
                              <p>Workspace stopped</p>
                              <button 
                                onClick={() => controlInstance(instance.id, 'start')}
                                className="start-btn"
                              >
                                Start Workspace
                              </button>
                            </>
                          )}
                          {instance.status === 'error' && (
                            <>
                              <div className="error-icon">❌</div>
                              <p>Error starting workspace</p>
                              <button 
                                onClick={() => controlInstance(instance.id, 'restart')}
                                className="restart-btn"
                              >
                                Restart
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="window-footer">
                    <div className="instance-info">
                      <span>Port: {instance.port}</span>
                      <span>Theme: {instance.theme}</span>
                      <span>Last active: {new Date(instance.lastActivity).toLocaleTimeString()}</span>
                    </div>
                    <div className="instance-controls">
                      <button 
                        onClick={() => controlInstance(instance.id, 'restart')}
                        className="control-btn"
                        title="Restart"
                      >
                        🔄
                      </button>
                      <button 
                        onClick={() => window.open(instance.url, '_blank')}
                        className="control-btn"
                        title="Open in new tab"
                      >
                        🔗
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Minimized Instances Dock */}
        {minimizedInstances.length > 0 && (
          <div className="minimized-dock">
            <h4>Minimized Workspaces</h4>
            <div className="dock-items">
              {minimizedInstances.map(instanceId => {
                const instance = instances.find(inst => inst.id === instanceId);
                return instance ? (
                  <button
                    key={instanceId}
                    onClick={() => toggleMinimize(instanceId)}
                    className="dock-item"
                    title={instance.name}
                  >
                    <span className={`status-indicator ${instance.status}`}></span>
                    {instance.name}
                  </button>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>

      {/* Chat Panel */}
      {showChatPanel && (
        <div className="chat-panel">
          <div className="chat-header">
            <h3>🐻 Mama Bear Assistant</h3>
            <button 
              onClick={() => setShowChatPanel(false)}
              className="close-chat"
            >
              ×
            </button>
          </div>
          
          <div className="chat-messages">
            {chatMessages.map(message => (
              <div key={message.id} className={`message ${message.type}`}>
                <div className="message-content">
                  {message.content}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="message-attachments">
                      {message.attachments.map((file, index) => (
                        <span key={index} className="attachment">
                          📎 {file.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
          
          <EnhancedChatBar
            onSendMessage={handleSendMessage}
            onVoiceCommand={handleVoiceCommand}
            onScreenCapture={handleScreenCapture}
            placeholder="Ask Mama Bear anything..."
          />
        </div>
      )}

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>🏗️ Create New Workspace</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="close-modal"
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <p>Choose a template for your new development workspace:</p>
              
              <div className="templates-grid">
                {templates.map(template => (
                  <div key={template.id} className="template-card">
                    <div className="template-header">
                      <span className="template-icon">{template.icon}</span>
                      <h3>{template.name}</h3>
                    </div>
                    
                    <p className="template-description">{template.description}</p>
                    
                    <div className="template-details">
                      <div className="template-meta">
                        <span>Language: {template.language}</span>
                        <span>Framework: {template.framework}</span>
                        <span>Setup: {template.estimatedSetupTime}</span>
                      </div>
                      
                      <div className="template-features">
                        {template.features.map((feature, index) => (
                          <span key={index} className="feature-tag">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => createInstance(template)}
                      className="create-template-btn"
                    >
                      Create Workspace
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MamaBearControlCenter;
