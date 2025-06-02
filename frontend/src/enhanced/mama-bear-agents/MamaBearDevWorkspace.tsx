import React, { useState, useEffect } from 'react';
import { agentSocketService } from '../../services/agentSocketService';
import { AgentType, AgentState } from '../agent-integration/AgentWindowBridge';
import './MamaBearDevWorkspace.css';

interface DevEnvironment {
  id: string;
  name: string;
  type: 'nix' | 'docker' | 'vm' | 'local';
  status: 'initializing' | 'running' | 'stopped' | 'error';
  resources?: {
    cpu: number;
    memory: number;
    storage: number;
  };
  ipAddress?: string;
  ports?: { [key: string]: number };
  error?: string;
}

interface MamaBearDevWorkspaceProps {
  agentType: AgentType;
  agentState: AgentState;
  updateAgentState: (update: Partial<AgentState>) => void;
}

/**
 * MamaBearDevWorkspace - Collaborative coding environment with advanced features
 * 
 * Provides:
 * - NixOS, Docker, and cloud VM support
 * - Environment management
 * - Advanced debugging tools
 * - Collaborative coding features
 */
export const MamaBearDevWorkspace: React.FC<MamaBearDevWorkspaceProps> = ({
  agentType,
  agentState,
  updateAgentState
}) => {
  // State
  const [environments, setEnvironments] = useState<DevEnvironment[]>([]);
  const [activeEnvironment, setActiveEnvironment] = useState<string | null>(null);
  const [terminalOutput, setTerminalOutput] = useState<string>('');
  const [terminalInput, setTerminalInput] = useState<string>('');
  const [fileExplorer, setFileExplorer] = useState<any>({});
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  
  // Initialize workspace
  useEffect(() => {
    // Load environments
    agentSocketService.sendDevWorkspaceEvent({
      action: 'get_environments'
    });
    
    // Request initial environment data
    agentSocketService.sendDevWorkspaceEvent({
      action: 'get_file_explorer'
    });
    
    // Event listeners
    const handleEnvironments = (data: any) => {
      if (data.environments) {
        setEnvironments(data.environments);
        
        // Set active environment if none is selected
        if (!activeEnvironment && data.environments.length > 0) {
          setActiveEnvironment(data.environments[0].id);
        }
      }
    };
    
    const handleTerminalOutput = (data: any) => {
      if (data.output) {
        setTerminalOutput(prev => prev + data.output);
      }
    };
    
    const handleFileExplorer = (data: any) => {
      if (data.files) {
        setFileExplorer(data.files);
      }
    };
    
    const handleFileContent = (data: any) => {
      if (data.content && data.path) {
        setFileContent(data.content);
        setActiveFile(data.path);
      }
    };
    
    const handleChatMessage = (data: any) => {
      if (data.message) {
        setChatHistory(prev => [...prev, data]);
      }
    };
    
    // Register listeners
    agentSocketService.on('dev_workspace_environments', handleEnvironments);
    agentSocketService.on('dev_workspace_terminal_output', handleTerminalOutput);
    agentSocketService.on('dev_workspace_file_explorer', handleFileExplorer);
    agentSocketService.on('dev_workspace_file_content', handleFileContent);
    agentSocketService.on('dev_workspace_chat', handleChatMessage);
    
    // Cleanup
    return () => {
      agentSocketService.removeListener('dev_workspace_environments', handleEnvironments);
      agentSocketService.removeListener('dev_workspace_terminal_output', handleTerminalOutput);
      agentSocketService.removeListener('dev_workspace_file_explorer', handleFileExplorer);
      agentSocketService.removeListener('dev_workspace_file_content', handleFileContent);
      agentSocketService.removeListener('dev_workspace_chat', handleChatMessage);
    };
  }, [activeEnvironment]);
  
  // Send terminal command
  const sendTerminalCommand = () => {
    if (!terminalInput.trim() || !activeEnvironment) return;
    
    // Add command to terminal output
    setTerminalOutput(prev => `${prev}\n$ ${terminalInput}\n`);
    
    // Send command
    agentSocketService.sendDevWorkspaceEvent({
      action: 'execute_command',
      environmentId: activeEnvironment,
      command: terminalInput
    });
    
    // Clear input
    setTerminalInput('');
  };
  
  // Send chat message
  const sendChatMessage = () => {
    if (!chatMessage.trim()) return;
    
    // Add to chat history
    setChatHistory(prev => [...prev, {
      sender: 'user',
      message: chatMessage,
      timestamp: new Date().toISOString()
    }]);
    
    // Send to agent
    agentSocketService.sendDevWorkspaceEvent({
      action: 'send_chat',
      message: chatMessage
    });
    
    // Clear input
    setChatMessage('');
    
    // Update agent state
    updateAgentState({ busy: true });
  };
  
  // Create new environment
  const createEnvironment = (type: 'nix' | 'docker' | 'vm' | 'local') => {
    // Update agent state
    updateAgentState({ busy: true });
    
    // Send request
    agentSocketService.sendDevWorkspaceEvent({
      action: 'create_environment',
      type
    });
  };
  
  // Start/stop environment
  const toggleEnvironment = (id: string, action: 'start' | 'stop') => {
    // Update agent state
    updateAgentState({ busy: true });
    
    // Send request
    agentSocketService.sendDevWorkspaceEvent({
      action: `${action}_environment`,
      environmentId: id
    });
  };
  
  // Open file
  const openFile = (path: string) => {
    agentSocketService.sendDevWorkspaceEvent({
      action: 'get_file_content',
      path
    });
  };
  
  // Save file
  const saveFile = () => {
    if (!activeFile) return;
    
    agentSocketService.sendDevWorkspaceEvent({
      action: 'save_file',
      path: activeFile,
      content: fileContent
    });
  };
  
  // Render file tree recursively
  const renderFileTree = (files: any, basePath = '') => {
    return (
      <ul className="file-list">
        {Object.entries(files).map(([name, value]) => {
          const path = basePath ? `${basePath}/${name}` : name;
          const isDirectory = typeof value === 'object' && value !== null;
          
          return (
            <li key={path} className={isDirectory ? 'directory' : 'file'}>
              <div 
                className={`file-item ${activeFile === path ? 'active' : ''}`}
                onClick={() => isDirectory ? null : openFile(path)}
              >
                <span className="file-icon">
                  {isDirectory ? '📁' : getFileIcon(name)}
                </span>
                <span className="file-name">{name}</span>
              </div>
              
              {isDirectory && (
                <div className="directory-content">
                  {renderFileTree(value, path)}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };
  
  // Helper to get file icon based on extension
  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'js':
        return '📄';
      case 'ts':
        return '📄';
      case 'jsx':
      case 'tsx':
        return '📄';
      case 'css':
      case 'scss':
        return '📄';
      case 'html':
        return '📄';
      case 'json':
        return '📄';
      case 'md':
        return '📄';
      case 'py':
        return '📄';
      case 'java':
        return '📄';
      case 'c':
      case 'cpp':
      case 'h':
        return '📄';
      case 'go':
        return '📄';
      case 'rb':
        return '📄';
      case 'php':
        return '📄';
      case 'sh':
        return '📄';
      case 'sql':
        return '📄';
      case 'yaml':
      case 'yml':
        return '📄';
      default:
        return '📄';
    }
  };
  
  // Get environment status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'var(--podplay-success)';
      case 'initializing':
        return 'var(--podplay-purple)';
      case 'stopped':
        return 'var(--podplay-text-light)';
      case 'error':
        return 'var(--podplay-error)';
      default:
        return 'var(--podplay-text-light)';
    }
  };
  
  // Get environment type label
  const getEnvironmentTypeLabel = (type: string) => {
    switch (type) {
      case 'nix':
        return 'NixOS';
      case 'docker':
        return 'Docker';
      case 'vm':
        return 'Cloud VM';
      case 'local':
        return 'Local';
      default:
        return type;
    }
  };

  return (
    <div className="mamabear-dev-workspace">
      <div className="workspace-header">
        <h2>Development Workspace</h2>
        <div className="environment-controls">
          <button 
            className="env-button nix"
            onClick={() => createEnvironment('nix')}
            disabled={agentState.busy}
            title="Create NixOS Environment"
          >
            <span className="env-icon">❄️</span>
            <span>New NixOS</span>
          </button>
          <button 
            className="env-button docker"
            onClick={() => createEnvironment('docker')}
            disabled={agentState.busy}
            title="Create Docker Environment"
          >
            <span className="env-icon">🐳</span>
            <span>New Docker</span>
          </button>
          <button 
            className="env-button vm"
            onClick={() => createEnvironment('vm')}
            disabled={agentState.busy}
            title="Create Cloud VM"
          >
            <span className="env-icon">☁️</span>
            <span>New VM</span>
          </button>
          <button 
            className="env-button local"
            onClick={() => createEnvironment('local')}
            disabled={agentState.busy}
            title="Create Local Environment"
          >
            <span className="env-icon">💻</span>
            <span>New Local</span>
          </button>
        </div>
      </div>
      
      <div className="workspace-environments">
        {environments.map(env => (
          <div 
            key={env.id}
            className={`environment-card ${env.status} ${activeEnvironment === env.id ? 'active' : ''}`}
            onClick={() => setActiveEnvironment(env.id)}
          >
            <div className="environment-header">
              <div className="environment-name">
                <div 
                  className="status-indicator"
                  style={{ backgroundColor: getStatusColor(env.status) }}
                ></div>
                <h3>{env.name}</h3>
              </div>
              <div className="environment-type">
                {getEnvironmentTypeLabel(env.type)}
              </div>
            </div>
            
            <div className="environment-details">
              {env.resources && (
                <div className="resource-info">
                  <div className="resource">
                    <span className="resource-label">CPU:</span>
                    <span className="resource-value">{env.resources.cpu} cores</span>
                  </div>
                  <div className="resource">
                    <span className="resource-label">Memory:</span>
                    <span className="resource-value">{env.resources.memory} MB</span>
                  </div>
                  <div className="resource">
                    <span className="resource-label">Storage:</span>
                    <span className="resource-value">{env.resources.storage} GB</span>
                  </div>
                </div>
              )}
              
              {env.ipAddress && (
                <div className="ip-address">
                  <span className="ip-label">IP:</span>
                  <span className="ip-value">{env.ipAddress}</span>
                </div>
              )}
              
              {env.status === 'error' && env.error && (
                <div className="environment-error">
                  <p>{env.error}</p>
                </div>
              )}
            </div>
            
            <div className="environment-actions">
              {env.status === 'running' && (
                <button 
                  className="action-button stop"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleEnvironment(env.id, 'stop');
                  }}
                  disabled={agentState.busy}
                >
                  Stop
                </button>
              )}
              
              {env.status === 'stopped' && (
                <button 
                  className="action-button start"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleEnvironment(env.id, 'start');
                  }}
                  disabled={agentState.busy}
                >
                  Start
                </button>
              )}
              
              <button 
                className="action-button delete"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Delete environment ${env.name}?`)) {
                    agentSocketService.sendDevWorkspaceEvent({
                      action: 'delete_environment',
                      environmentId: env.id
                    });
                  }
                }}
                disabled={agentState.busy || env.status === 'initializing'}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        
        {environments.length === 0 && (
          <div className="no-environments">
            <p>No environments available. Create one to get started.</p>
          </div>
        )}
      </div>
      
      {activeEnvironment && (
        <div className="workspace-panels">
          <div className="panel file-explorer-panel">
            <div className="panel-header">
              <h3>Files</h3>
              <div className="panel-actions">
                <button 
                  className="panel-action"
                  onClick={() => {
                    agentSocketService.sendDevWorkspaceEvent({
                      action: 'get_file_explorer'
                    });
                  }}
                  title="Refresh Files"
                >
                  🔄
                </button>
                <button 
                  className="panel-action"
                  onClick={() => {
                    const fileName = prompt('Enter new file name:');
                    if (fileName) {
                      agentSocketService.sendDevWorkspaceEvent({
                        action: 'create_file',
                        path: fileName
                      });
                    }
                  }}
                  title="New File"
                >
                  📄
                </button>
              </div>
            </div>
            <div className="panel-content">
              {Object.keys(fileExplorer).length > 0 ? (
                renderFileTree(fileExplorer)
              ) : (
                <div className="empty-explorer">
                  <p>No files available.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="panel editor-panel">
            <div className="panel-header">
              <h3>{activeFile || 'No file selected'}</h3>
              {activeFile && (
                <div className="panel-actions">
                  <button 
                    className="panel-action"
                    onClick={saveFile}
                    title="Save File"
                  >
                    💾
                  </button>
                </div>
              )}
            </div>
            <div className="panel-content">
              {activeFile ? (
                <textarea
                  className="code-editor"
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                  spellCheck={false}
                ></textarea>
              ) : (
                <div className="empty-editor">
                  <p>Select a file to edit its contents.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="panel terminal-panel">
            <div className="panel-header">
              <h3>Terminal</h3>
              <div className="panel-actions">
                <button 
                  className="panel-action"
                  onClick={() => setTerminalOutput('')}
                  title="Clear Terminal"
                >
                  🧹
                </button>
              </div>
            </div>
            <div className="panel-content">
              <div className="terminal-output">
                <pre>{terminalOutput}</pre>
              </div>
              <div className="terminal-input-container">
                <span className="prompt">$</span>
                <input
                  type="text"
                  className="terminal-input"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      sendTerminalCommand();
                    }
                  }}
                  disabled={!activeEnvironment || agentState.busy}
                  placeholder={!activeEnvironment ? 'No active environment' : 'Enter command...'}
                />
              </div>
            </div>
          </div>
          
          <div className="panel chat-panel">
            <div className="panel-header">
              <h3>Agent Chat</h3>
            </div>
            <div className="panel-content">
              <div className="chat-messages">
                {chatHistory.length > 0 ? (
                  chatHistory.map((chat, index) => (
                    <div 
                      key={index} 
                      className={`chat-message ${chat.sender}`}
                    >
                      {chat.sender === 'assistant' && (
                        <div className="avatar">
                          <img src="/assets/mama-bear-avatar.png" alt="Mama Bear" />
                        </div>
                      )}
                      <div className="message-content">
                        <p>{chat.message}</p>
                        <div className="timestamp">
                          {new Date(chat.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-chat">
                    <p>No messages yet. Ask for help with your development tasks.</p>
                  </div>
                )}
                
                {agentState.busy && (
                  <div className="chat-message assistant typing">
                    <div className="avatar">
                      <img src="/assets/mama-bear-avatar.png" alt="Mama Bear" />
                    </div>
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="chat-input-container">
                <textarea
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendChatMessage();
                    }
                  }}
                  placeholder="Ask for help with your code..."
                  disabled={agentState.busy}
                ></textarea>
                <button 
                  className="send-button"
                  onClick={sendChatMessage}
                  disabled={!chatMessage.trim() || agentState.busy}
                >
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MamaBearDevWorkspace;