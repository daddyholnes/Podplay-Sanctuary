import React, { useState, useEffect, useCallback, useRef } from 'react';
import { buildApiUrl } from '../config/api';
import EnhancedChatBar, { ChatAttachment } from './EnhancedChatBar';
import './MamaBearControlCenter.css';

// ==================== INTERFACES ====================

interface CodeServerInstance {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'starting' | 'error';
  url: string;
  port: number;
  workspace_path: string;
  created_at: string;
  last_accessed: string;
  auto_shutdown: boolean;
  shutdown_timeout: number;
  cpu_usage?: number;
  memory_usage?: number;
  user: string;
  extensions: string[];
  settings: Record<string, any>;
  custom_theme?: 'mama-bear' | 'sanctuary' | 'code-dark';
  iframe_window?: boolean;
}

interface WorkspaceTemplate {
  id: string;
  name: string;
  description: string;
  base_image: string;
  pre_installed_tools: string[];
  environment_variables: Record<string, string>;
  startup_commands: string[];
  icon: string;
  custom_vs_code_config?: Record<string, any>;
  mama_bear_integration?: boolean;
  theme_integration?: boolean;
}

interface AgentCommand {
  id: string;
  command: string;
  description: string;
  target_instance?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
  timestamp: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachments?: ChatAttachment[];
}

interface IframeWindow {
  id: string;
  instance_id: string;
  url: string;
  title: string;
  is_minimized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  z_index: number;
}

// ==================== MAIN COMPONENT ====================

const MamaBearControlCenter: React.FC = () => {
  const [instances, setInstances] = useState<CodeServerInstance[]>([]);
  const [templates, setTemplates] = useState<WorkspaceTemplate[]>([]);
  const [commands, setCommands] = useState<AgentCommand[]>([]);  const [activeTab, setActiveTab] = useState<'dashboard' | 'instances' | 'templates' | 'automation' | 'monitoring' | 'chat'>('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Enhanced iframe window management
  const [iframeWindows, setIframeWindows] = useState<IframeWindow[]>([]);
  const [activeIframe, setActiveIframe] = useState<string | null>(null);
  
  // Enhanced chat state for Mama Bear AI integration
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatAttachments, setChatAttachments] = useState<ChatAttachment[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showChat, setShowChat] = useState(true);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [newInstanceConfig, setNewInstanceConfig] = useState({
    name: '',
    template: '',
    workspace_path: '',
    auto_shutdown: true,
    shutdown_timeout: 30,
    custom_theme: 'mama-bear' as const,
    iframe_window: true,
    mama_bear_integration: true
  });

  // ==================== IFRAME WINDOW MANAGEMENT ====================

  const openIframeWindow = (instance: CodeServerInstance) => {
    const newWindow: IframeWindow = {
      id: `iframe-${instance.id}`,
      instance_id: instance.id,
      url: instance.url,
      title: `${instance.name} - VS Code`,
      is_minimized: false,
      position: { x: 100 + (iframeWindows.length * 50), y: 100 + (iframeWindows.length * 50) },
      size: { width: 1200, height: 800 },
      z_index: 1000 + iframeWindows.length
    };

    setIframeWindows(prev => [...prev, newWindow]);
    setActiveIframe(newWindow.id);
  };

  const closeIframeWindow = (windowId: string) => {
    setIframeWindows(prev => prev.filter(w => w.id !== windowId));
    if (activeIframe === windowId) {
      setActiveIframe(null);
    }
  };

  const minimizeIframeWindow = (windowId: string) => {
    setIframeWindows(prev => 
      prev.map(w => 
        w.id === windowId ? { ...w, is_minimized: !w.is_minimized } : w
      )
    );
  };

  const bringToFront = (windowId: string) => {
    const maxZ = Math.max(...iframeWindows.map(w => w.z_index));
    setIframeWindows(prev => 
      prev.map(w => 
        w.id === windowId ? { ...w, z_index: maxZ + 1 } : w
      )
    );
    setActiveIframe(windowId);
  };

  // ==================== CHAT FUNCTIONALITY ====================

  const sendChatMessage = async (message: string, attachments: ChatAttachment[] = []) => {
    if (!message.trim() && attachments.length === 0) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      attachments
    };

    setChatMessages(prev => [...prev, userMessage]);
    setIsChatLoading(true);
    setChatInput('');
    setChatAttachments([]);

    try {
      const response = await fetch(buildApiUrl('/api/chat/mama-bear'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          attachments,
          context: {
            active_instances: instances.filter(i => i.status === 'running'),
            active_tab: activeTab,
            current_commands: commands.filter(c => c.status === 'running')
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString()
        };

        setChatMessages(prev => [...prev, assistantMessage]);

        // Handle any commands Mama Bear wants to execute
        if (data.commands && data.commands.length > 0) {
          for (const command of data.commands) {
            await executeAgentCommand(command.action, command.target);
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Initialize chat with welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'assistant',
      content: `🐻 **Hello! I'm Mama Bear, your AI assistant for code-server management!**

I can help you:
- 🚀 Create and manage VS Code instances
- 🎨 Customize themes and extensions
- 📊 Monitor system performance
- 🤖 Automate workspace tasks
- 🔧 Debug and optimize your setup

Try asking me to "create a new React workspace" or "show me system health"!`,
      timestamp: new Date().toISOString()
    };

    setChatMessages([welcomeMessage]);
  }, []);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // ==================== API FUNCTIONS ====================

  const fetchInstances = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(buildApiUrl('/api/mama-bear/code-server/instances'));
      const data = await response.json();
      if (data.success) {
        setInstances(data.instances);
      }
    } catch (error) {
      console.error('Failed to fetch instances:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await fetch(buildApiUrl('/api/mama-bear/code-server/templates'));
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  }, []);

  const fetchCommands = useCallback(async () => {
    try {
      const response = await fetch(buildApiUrl('/api/mama-bear/agent/commands'));
      const data = await response.json();
      if (data.success) {
        setCommands(data.commands);
      }
    } catch (error) {
      console.error('Failed to fetch commands:', error);
    }
  }, []);

  const createInstance = async (config: typeof newInstanceConfig) => {
    try {
      setIsLoading(true);
      const response = await fetch(buildApiUrl('/api/mama-bear/code-server/create'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await response.json();
      if (data.success) {
        await fetchInstances();
        setShowCreateModal(false);
        setNewInstanceConfig({
          name: '',
          template: '',
          workspace_path: '',
          auto_shutdown: true,
          shutdown_timeout: 30,
          custom_theme: 'mama-bear',
          iframe_window: true,
          mama_bear_integration: true
        });

        // Auto-open the new instance if requested
        if (config.iframe_window && data.instance) {
          setTimeout(() => {
            const newInstance = data.instance;
            if (newInstance.status === 'running') {
              openIframeWindow(newInstance);
            }
          }, 2000);
        }
      } else {
        alert('Failed to create instance: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to create instance:', error);
      alert('Failed to create instance');
    } finally {
      setIsLoading(false);
    }
  };

  const controlInstance = async (instanceId: string, action: 'start' | 'stop' | 'restart' | 'delete') => {
    try {
      const response = await fetch(buildApiUrl(`/api/mama-bear/code-server/control/${instanceId}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await response.json();
      if (data.success) {
        await fetchInstances();
        
        // Close iframe window if stopping/deleting instance
        if (action === 'stop' || action === 'delete') {
          const windowToClose = iframeWindows.find(w => w.instance_id === instanceId);
          if (windowToClose) {
            closeIframeWindow(windowToClose.id);
          }
        }
      } else {
        alert(`Failed to ${action} instance: ` + data.error);
      }
    } catch (error) {
      console.error(`Failed to ${action} instance:`, error);
    }
  };

  const executeAgentCommand = async (command: string, targetInstance?: string) => {
    try {
      const response = await fetch(buildApiUrl('/api/mama-bear/agent/execute'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, target_instance: targetInstance })
      });
      const data = await response.json();
      if (data.success) {
        await fetchCommands();
      }
    } catch (error) {
      console.error('Failed to execute command:', error);
    }
  };

  // ==================== LIFECYCLE ====================

  useEffect(() => {
    fetchInstances();
    fetchTemplates();
    fetchCommands();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchInstances();
      fetchCommands();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchInstances, fetchTemplates, fetchCommands]);

  // ==================== ENHANCED RENDER FUNCTIONS ====================

  const renderChatPanel = () => (
    <div className={`mama-bear-chat-panel ${showChat ? 'visible' : 'hidden'}`}>
      <div className="chat-header">
        <div className="chat-title">
          <span className="chat-icon">🐻</span>
          <h3>Mama Bear Assistant</h3>
        </div>
        <button 
          className="chat-toggle"
          onClick={() => setShowChat(!showChat)}
          title={showChat ? 'Minimize Chat' : 'Show Chat'}
        >
          {showChat ? '🔽' : '🔼'}
        </button>
      </div>

      {showChat && (
        <>
          <div className="chat-messages" ref={chatContainerRef}>
            {chatMessages.map(message => (
              <div key={message.id} className={`chat-message ${message.type}`}>
                <div className="message-header">
                  <span className="message-sender">
                    {message.type === 'user' ? '👤 You' : '🐻 Mama Bear'}
                  </span>
                  <span className="message-time">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="message-content">
                  {message.content}
                </div>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="message-attachments">
                    {message.attachments.map((attachment, index) => (
                      <div key={index} className="attachment-preview">
                        📎 {attachment.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isChatLoading && (
              <div className="chat-message assistant loading">
                <div className="message-header">
                  <span className="message-sender">🐻 Mama Bear</span>
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="chat-input-container">
            <EnhancedChatBar
              value={chatInput}
              onChange={setChatInput}
              onSend={(message, attachments) => sendChatMessage(message, attachments)}
              onAttachmentsChange={setChatAttachments}
              attachments={chatAttachments}
              placeholder="🐻 Ask Mama Bear to help with your workspace..."
              disabled={isChatLoading}
              theme="sanctuary"
              allowFileUpload={true}
              allowImageUpload={true}
              allowAudioRecording={true}
              allowVideoRecording={false}
              allowScreenCapture={true}
              className="mama-bear-chat-input"
            />
          </div>
        </>
      )}
    </div>
  );

  const renderIframeWindows = () => (
    <div className="iframe-windows-container">
      {iframeWindows.map(window => (
        <div
          key={window.id}
          className={`iframe-window ${window.is_minimized ? 'minimized' : ''} ${activeIframe === window.id ? 'active' : ''}`}
          style={{
            position: 'fixed',
            left: window.position.x,
            top: window.position.y,
            width: window.size.width,
            height: window.size.height,
            zIndex: window.z_index,
            display: window.is_minimized ? 'none' : 'block'
          }}
          onClick={() => bringToFront(window.id)}
        >
          <div className="iframe-titlebar">
            <div className="iframe-title">
              <span className="iframe-icon">💻</span>
              {window.title}
            </div>
            <div className="iframe-controls">
              <button 
                className="iframe-control minimize"
                onClick={() => minimizeIframeWindow(window.id)}
                title="Minimize"
              >
                ➖
              </button>
              <button 
                className="iframe-control close"
                onClick={() => closeIframeWindow(window.id)}
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>
          <iframe
            src={`${window.url}?theme=mama-bear&layout=minimal`}
            className="code-server-iframe"
            title={window.title}
            frameBorder="0"
            allow="clipboard-read; clipboard-write"
            sandbox="allow-same-origin allow-scripts allow-forms allow-modals"
          />
        </div>
      ))}

      {/* Minimized windows dock */}
      {iframeWindows.some(w => w.is_minimized) && (
        <div className="minimized-windows-dock">
          {iframeWindows
            .filter(w => w.is_minimized)
            .map(window => (
              <button
                key={window.id}
                className="minimized-window-btn"
                onClick={() => minimizeIframeWindow(window.id)}
                title={window.title}
              >
                💻 {window.title}
              </button>
            ))}
        </div>
      )}
    </div>
  );

  const renderEnhancedInstances = () => (
    <div className="instances-container enhanced">
      <div className="instances-header">
        <h2>🖥️ Code Server Instances</h2>
        <div className="instances-controls">
          <button 
            className="create-btn mama-bear-style"
            onClick={() => setShowCreateModal(true)}
          >
            ✨ Create Magical Workspace
          </button>
        </div>
      </div>

      <div className="instances-grid">
        {instances.map(instance => (
          <div key={instance.id} className={`instance-card enhanced ${instance.status}`}>
            <div className="instance-header">
              <div className="instance-title">
                <h3>{instance.name}</h3>
                <div className={`status-badge ${instance.status}`}>
                  {instance.status === 'running' ? '🟢' : 
                   instance.status === 'stopped' ? '🔴' : 
                   instance.status === 'starting' ? '🟡' : '⚠️'}
                  {instance.status}
                </div>
              </div>
              {instance.custom_theme && (
                <div className="theme-badge">
                  🎨 {instance.custom_theme}
                </div>
              )}
            </div>

            <div className="instance-preview">
              {instance.status === 'running' && (
                <div className="instance-thumbnail">
                  <iframe
                    src={`${instance.url}?embedded=true&minimal=true`}
                    className="instance-preview-frame"
                    title={`${instance.name} preview`}
                    frameBorder="0"
                  />
                  <div className="preview-overlay">
                    <button
                      className="open-fullscreen-btn"
                      onClick={() => openIframeWindow(instance)}
                    >
                      🖼️ Open in Window
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="instance-details">
              <div className="detail-item">
                <span className="detail-label">🌐 URL:</span>
                <span className="detail-value">
                  {instance.status === 'running' ? (
                    <a href={instance.url} target="_blank" rel="noopener noreferrer">
                      {instance.url}
                    </a>
                  ) : (
                    <span className="inactive-url">{instance.url}</span>
                  )}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">📁 Workspace:</span>
                <span className="detail-value">{instance.workspace_path}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">👤 User:</span>
                <span className="detail-value">{instance.user}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">🕒 Last accessed:</span>
                <span className="detail-value">{new Date(instance.last_accessed).toLocaleString()}</span>
              </div>
            </div>

            {instance.status === 'running' && (
              <div className="instance-metrics">
                <div className="metric">
                  <span className="metric-icon">⚡</span>
                  <span className="metric-label">CPU:</span>
                  <div className="metric-bar">
                    <div 
                      className="metric-fill" 
                      style={{ width: `${instance.cpu_usage || 0}%` }}
                    ></div>
                  </div>
                  <span className="metric-value">{instance.cpu_usage?.toFixed(1) || 0}%</span>
                </div>
                <div className="metric">
                  <span className="metric-icon">🧠</span>
                  <span className="metric-label">Memory:</span>
                  <div className="metric-bar">
                    <div 
                      className="metric-fill" 
                      style={{ width: `${instance.memory_usage || 0}%` }}
                    ></div>
                  </div>
                  <span className="metric-value">{instance.memory_usage?.toFixed(1) || 0}%</span>
                </div>
              </div>
            )}

            <div className="instance-actions">
              {instance.status === 'stopped' && (
                <button 
                  className="action-btn start mama-bear-style"
                  onClick={() => controlInstance(instance.id, 'start')}
                >
                  ▶️ Start
                </button>
              )}
              {instance.status === 'running' && (
                <>
                  <button 
                    className="action-btn open-window mama-bear-style"
                    onClick={() => openIframeWindow(instance)}
                  >
                    🖼️ Open Window
                  </button>
                  <button 
                    className="action-btn stop"
                    onClick={() => controlInstance(instance.id, 'stop')}
                  >
                    ⏹️ Stop
                  </button>
                  <button 
                    className="action-btn restart"
                    onClick={() => controlInstance(instance.id, 'restart')}
                  >
                    🔄 Restart
                  </button>
                </>
              )}
              <button 
                className="action-btn delete"
                onClick={() => {
                  if (confirm(`Delete instance "${instance.name}"? This cannot be undone.`)) {
                    controlInstance(instance.id, 'delete');
                  }
                }}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEnhancedCreateModal = () => (
    showCreateModal && (
      <div className="modal-overlay mama-bear-theme">
        <div className="modal-content enhanced">
          <div className="modal-header">
            <h2>✨ Create Magical Workspace</h2>
            <button 
              className="modal-close"
              onClick={() => setShowCreateModal(false)}
            >
              ✕
            </button>
          </div>

          <div className="modal-body">
            <div className="form-section">
              <h3>🏷️ Basic Configuration</h3>
              
              <div className="form-group">
                <label>✨ Workspace Name</label>
                <input
                  type="text"
                  value={newInstanceConfig.name}
                  onChange={(e) => setNewInstanceConfig(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., My Magical Dev Environment"
                  className="mama-bear-input"
                />
              </div>

              <div className="form-group">
                <label>📦 Template</label>
                <select
                  value={newInstanceConfig.template}
                  onChange={(e) => setNewInstanceConfig(prev => ({ ...prev, template: e.target.value }))}
                  className="mama-bear-select"
                >
                  <option value="">🔮 Choose your adventure...</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.icon} {template.name}
                      {template.mama_bear_integration && ' ✨ (Mama Bear Enhanced)'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>📁 Workspace Path</label>
                <input
                  type="text"
                  value={newInstanceConfig.workspace_path}
                  onChange={(e) => setNewInstanceConfig(prev => ({ ...prev, workspace_path: e.target.value }))}
                  placeholder="/workspace"
                  className="mama-bear-input"
                />
              </div>
            </div>

            <div className="form-section">
              <h3>🎨 Mama Bear Enhancements</h3>
              
              <div className="form-group">
                <label>🌈 Custom Theme</label>
                <select
                  value={newInstanceConfig.custom_theme}
                  onChange={(e) => setNewInstanceConfig(prev => ({ ...prev, custom_theme: e.target.value as any }))}
                  className="mama-bear-select"
                >
                  <option value="mama-bear">🐻 Mama Bear Theme (Warm & Cozy)</option>
                  <option value="sanctuary">🏠 Sanctuary Theme (Calm & Focused)</option>
                  <option value="code-dark">🌙 Dark Theme (Classic)</option>
                </select>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newInstanceConfig.iframe_window}
                    onChange={(e) => setNewInstanceConfig(prev => ({ ...prev, iframe_window: e.target.checked }))}
                  />
                  <span className="checkmark"></span>
                  🖼️ Open in integrated window
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newInstanceConfig.mama_bear_integration}
                    onChange={(e) => setNewInstanceConfig(prev => ({ ...prev, mama_bear_integration: e.target.checked }))}
                  />
                  <span className="checkmark"></span>
                  🤖 Enable Mama Bear AI assistance
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newInstanceConfig.auto_shutdown}
                    onChange={(e) => setNewInstanceConfig(prev => ({ ...prev, auto_shutdown: e.target.checked }))}
                  />
                  <span className="checkmark"></span>
                  ⏰ Auto-shutdown when idle
                </label>
              </div>

              {newInstanceConfig.auto_shutdown && (
                <div className="form-group">
                  <label>⏱️ Shutdown timeout (minutes)</label>
                  <input
                    type="number"
                    value={newInstanceConfig.shutdown_timeout}
                    onChange={(e) => setNewInstanceConfig(prev => ({ ...prev, shutdown_timeout: parseInt(e.target.value) }))}
                    min="5"
                    max="480"
                    className="mama-bear-input"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button 
              className="cancel-btn"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </button>
            <button 
              className="create-btn mama-bear-style"
              onClick={() => createInstance(newInstanceConfig)}
              disabled={!newInstanceConfig.name || !newInstanceConfig.template}
            >
              ✨ Create Magical Workspace
            </button>
          </div>
        </div>
      </div>
    )
  );

  // ==================== MAIN RENDER ====================

  return (
    <div className="mama-bear-control-center enhanced">
      <div className="control-center-header">
        <h1>🐻‍❄️ Mama Bear Control Center</h1>
        <p>AI-Powered Code Server & Workspace Management with Magical Enhancements</p>
      </div>

      <div className="control-center-layout">
        <div className="control-center-main">
          <div className="control-center-tabs">
            <button 
              className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Dashboard
            </button>
            <button 
              className={`tab ${activeTab === 'instances' ? 'active' : ''}`}
              onClick={() => setActiveTab('instances')}
            >
              🖥️ Instances ({instances.length})
            </button>
            <button 
              className={`tab ${activeTab === 'templates' ? 'active' : ''}`}
              onClick={() => setActiveTab('templates')}
            >
              📦 Templates ({templates.length})
            </button>
            <button 
              className={`tab ${activeTab === 'automation' ? 'active' : ''}`}
              onClick={() => setActiveTab('automation')}
            >
              🤖 Automation
            </button>
            <button 
              className={`tab ${activeTab === 'monitoring' ? 'active' : ''}`}
              onClick={() => setActiveTab('monitoring')}
            >
              📊 Monitoring
            </button>
          </div>

          <div className="control-center-content">
            {isLoading && (
              <div className="loading-overlay">
                <div className="loading-spinner">🐻 Mama Bear is working her magic...</div>
              </div>
            )}

            {activeTab === 'instances' && renderEnhancedInstances()}
            {/* Other tabs would go here - keeping existing logic */}
          </div>
        </div>

        {/* Enhanced Chat Panel */}
        {renderChatPanel()}
      </div>

      {/* Iframe Windows */}
      {renderIframeWindows()}

      {/* Enhanced Create Modal */}
      {renderEnhancedCreateModal()}
    </div>
  );
};

export default MamaBearControlCenter;
