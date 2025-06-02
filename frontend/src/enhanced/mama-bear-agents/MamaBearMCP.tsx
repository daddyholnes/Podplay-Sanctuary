import React, { useState, useEffect } from 'react';
import { agentSocketService } from '../../services/agentSocketService';
import { AgentType, AgentState } from '../agent-integration/AgentWindowBridge';
import './MamaBearMCP.css';

interface MCPTool {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  author?: string;
  installed: boolean;
  usage?: {
    count: number;
    lastUsed?: string;
  };
  status: 'available' | 'installing' | 'installed' | 'error';
  error?: string;
  dependencies?: string[];
  tags?: string[];
}

interface ToolCategory {
  id: string;
  name: string;
  description: string;
  count: number;
}

interface MamaBearMCPProps {
  agentType: AgentType;
  agentState: AgentState;
  updateAgentState: (update: Partial<AgentState>) => void;
}

/**
 * MamaBearMCP - Marketplace and Tool Management Agent
 * 
 * Features:
 * - MCP Tool discovery and installation
 * - Tool usage analytics
 * - Dependency management
 * - Tool integration recommendations
 */
export const MamaBearMCP: React.FC<MamaBearMCPProps> = ({
  agentType,
  agentState,
  updateAgentState
}) => {
  // State
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [categories, setCategories] = useState<ToolCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTool, setSelectedTool] = useState<MCPTool | null>(null);
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [loadingTools, setLoadingTools] = useState<boolean>(true);
  const [showOnlyInstalled, setShowOnlyInstalled] = useState<boolean>(false);
  
  // Load tools and categories
  useEffect(() => {
    // Request tool data
    agentSocketService.sendMCPEvent({
      action: 'get_tools'
    });
    
    // Request categories
    agentSocketService.sendMCPEvent({
      action: 'get_categories'
    });
    
    // Handlers
    const handleTools = (data: any) => {
      if (data.tools) {
        setTools(data.tools);
        setLoadingTools(false);
      }
    };
    
    const handleCategories = (data: any) => {
      if (data.categories) {
        setCategories(data.categories);
      }
    };
    
    const handleToolUpdate = (data: any) => {
      if (data.tool) {
        setTools(prev => 
          prev.map(tool => 
            tool.id === data.tool.id ? { ...tool, ...data.tool } : tool
          )
        );
        
        // Update selected tool if it's the one being updated
        if (selectedTool && selectedTool.id === data.tool.id) {
          setSelectedTool({ ...selectedTool, ...data.tool });
        }
      }
    };
    
    const handleChatMessage = (data: any) => {
      if (data.message) {
        setChatHistory(prev => [...prev, data]);
        
        // Update agent state
        if (data.sender === 'assistant') {
          updateAgentState({ busy: false });
        }
      }
    };
    
    // Register event listeners
    agentSocketService.on('mcp_tools', handleTools);
    agentSocketService.on('mcp_categories', handleCategories);
    agentSocketService.on('mcp_tool_update', handleToolUpdate);
    agentSocketService.on('mcp_chat', handleChatMessage);
    
    // Cleanup
    return () => {
      agentSocketService.removeListener('mcp_tools', handleTools);
      agentSocketService.removeListener('mcp_categories', handleCategories);
      agentSocketService.removeListener('mcp_tool_update', handleToolUpdate);
      agentSocketService.removeListener('mcp_chat', handleChatMessage);
    };
  }, [selectedTool, updateAgentState]);
  
  // Filter tools based on search query and active category
  const filteredTools = tools.filter(tool => {
    const matchesSearch = 
      searchQuery === '' || 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tool.tags && tool.tags.some(tag => 
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    
    const matchesCategory = 
      activeCategory === 'all' || 
      tool.category === activeCategory;
    
    const matchesInstalled = 
      !showOnlyInstalled || 
      tool.installed;
    
    return matchesSearch && matchesCategory && matchesInstalled;
  });
  
  // Install tool
  const installTool = (toolId: string) => {
    // Update tool status
    setTools(prev => 
      prev.map(tool => 
        tool.id === toolId 
          ? { ...tool, status: 'installing' } 
          : tool
      )
    );
    
    // Update selected tool if it's the one being installed
    if (selectedTool && selectedTool.id === toolId) {
      setSelectedTool({ ...selectedTool, status: 'installing' });
    }
    
    // Send install request
    agentSocketService.sendMCPEvent({
      action: 'install_tool',
      toolId
    });
    
    // Update agent state
    updateAgentState({ busy: true });
  };
  
  // Uninstall tool
  const uninstallTool = (toolId: string) => {
    if (window.confirm('Are you sure you want to uninstall this tool?')) {
      // Send uninstall request
      agentSocketService.sendMCPEvent({
        action: 'uninstall_tool',
        toolId
      });
      
      // Update agent state
      updateAgentState({ busy: true });
    }
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
    agentSocketService.sendMCPEvent({
      action: 'send_chat',
      message: chatMessage,
      selectedToolId: selectedTool ? selectedTool.id : undefined
    });
    
    // Clear input
    setChatMessage('');
    
    // Update agent state
    updateAgentState({ busy: true });
  };
  
  // Select tool
  const selectTool = (tool: MCPTool) => {
    setSelectedTool(tool);
    
    // Request tool details
    agentSocketService.sendMCPEvent({
      action: 'get_tool_details',
      toolId: tool.id
    });
  };
  
  // Get category badge color
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'ai':
      case 'llm':
      case 'intelligence':
        return 'var(--podplay-purple)';
      case 'data':
      case 'database':
        return '#3f51b5';
      case 'web':
      case 'network':
        return '#2196f3';
      case 'file':
      case 'storage':
        return '#009688';
      case 'system':
      case 'os':
        return '#607d8b';
      case 'utility':
      case 'tool':
        return '#ff9800';
      case 'media':
      case 'multimedia':
        return '#e91e63';
      case 'security':
      case 'auth':
        return '#f44336';
      case 'dev':
      case 'development':
        return '#4caf50';
      default:
        return 'var(--podplay-text-light)';
    }
  };

  return (
    <div className="mamabear-mcp">
      <div className="mcp-header">
        <h2>MCP Tool Marketplace</h2>
        <div className="mcp-search">
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <label className="installed-toggle">
            <input
              type="checkbox"
              checked={showOnlyInstalled}
              onChange={(e) => setShowOnlyInstalled(e.target.checked)}
            />
            <span>Installed only</span>
          </label>
        </div>
      </div>
      
      <div className="mcp-content">
        <div className="mcp-sidebar">
          <div className="category-list">
            <div 
              className={`category-item ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              <span className="category-name">All Tools</span>
              <span className="category-count">{tools.length}</span>
            </div>
            
            {categories.map(category => (
              <div 
                key={category.id}
                className={`category-item ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                <span className="category-name">{category.name}</span>
                <span className="category-count">{category.count}</span>
              </div>
            ))}
          </div>
          
          <div className="usage-stats">
            <h3>Usage Statistics</h3>
            <div className="stat-item">
              <span className="stat-label">Installed Tools</span>
              <span className="stat-value">
                {tools.filter(tool => tool.installed).length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Available Tools</span>
              <span className="stat-value">
                {tools.filter(tool => !tool.installed).length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Most Used</span>
              <span className="stat-value">
                {tools.length > 0 ? 
                  tools.sort((a, b) => 
                    (b.usage?.count || 0) - (a.usage?.count || 0)
                  )[0].name : 'N/A'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="mcp-tools">
          {loadingTools ? (
            <div className="loading-tools">
              <div className="loading-spinner"></div>
              <p>Loading tools...</p>
            </div>
          ) : filteredTools.length > 0 ? (
            <div className="tool-grid">
              {filteredTools.map(tool => (
                <div 
                  key={tool.id}
                  className={`tool-card ${tool.status} ${selectedTool?.id === tool.id ? 'selected' : ''}`}
                  onClick={() => selectTool(tool)}
                >
                  <div className="tool-header">
                    <h3 className="tool-name">{tool.name}</h3>
                    <div 
                      className="category-badge"
                      style={{ backgroundColor: getCategoryColor(tool.category) }}
                    >
                      {tool.category}
                    </div>
                  </div>
                  
                  <p className="tool-description">{tool.description}</p>
                  
                  <div className="tool-footer">
                    <div className="tool-meta">
                      <span className="tool-version">v{tool.version}</span>
                      {tool.usage && (
                        <span className="tool-usage">
                          Used {tool.usage.count} times
                        </span>
                      )}
                    </div>
                    
                    <div className="tool-status">
                      {tool.status === 'installing' && (
                        <span className="status-installing">Installing...</span>
                      )}
                      {tool.status === 'installed' && (
                        <span className="status-installed">Installed</span>
                      )}
                      {tool.status === 'error' && (
                        <span className="status-error">Error</span>
                      )}
                    </div>
                  </div>
                  
                  {tool.tags && tool.tags.length > 0 && (
                    <div className="tool-tags">
                      {tool.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-tools">
              <p>No tools found matching your criteria.</p>
              <button
                className="reset-button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                  setShowOnlyInstalled(false);
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
        
        {selectedTool && (
          <div className="mcp-tool-details">
            <div className="tool-details-header">
              <h3>{selectedTool.name}</h3>
              <button 
                className="close-button"
                onClick={() => setSelectedTool(null)}
              >
                ×
              </button>
            </div>
            
            <div className="tool-details-content">
              <div className="tool-info">
                <div className="tool-info-item">
                  <span className="info-label">Category</span>
                  <div 
                    className="category-badge large"
                    style={{ backgroundColor: getCategoryColor(selectedTool.category) }}
                  >
                    {selectedTool.category}
                  </div>
                </div>
                
                <div className="tool-info-item">
                  <span className="info-label">Version</span>
                  <span className="info-value">{selectedTool.version}</span>
                </div>
                
                {selectedTool.author && (
                  <div className="tool-info-item">
                    <span className="info-label">Author</span>
                    <span className="info-value">{selectedTool.author}</span>
                  </div>
                )}
                
                <div className="tool-info-item">
                  <span className="info-label">Status</span>
                  <span className={`info-value status-${selectedTool.status}`}>
                    {selectedTool.status === 'available' && 'Available'}
                    {selectedTool.status === 'installing' && 'Installing...'}
                    {selectedTool.status === 'installed' && 'Installed'}
                    {selectedTool.status === 'error' && 'Error'}
                  </span>
                </div>
                
                {selectedTool.usage && (
                  <div className="tool-info-item">
                    <span className="info-label">Usage</span>
                    <span className="info-value">
                      {selectedTool.usage.count} times
                      {selectedTool.usage.lastUsed && (
                        <span className="last-used">
                          Last used: {new Date(selectedTool.usage.lastUsed).toLocaleDateString()}
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="tool-description-full">
                <h4>Description</h4>
                <p>{selectedTool.description}</p>
              </div>
              
              {selectedTool.dependencies && selectedTool.dependencies.length > 0 && (
                <div className="tool-dependencies">
                  <h4>Dependencies</h4>
                  <ul>
                    {selectedTool.dependencies.map((dep, index) => {
                      const depTool = tools.find(t => t.name === dep || t.id === dep);
                      return (
                        <li key={index} className={depTool?.installed ? 'installed' : 'missing'}>
                          {dep} {depTool?.installed ? '(Installed)' : '(Not Installed)'}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              
              {selectedTool.error && (
                <div className="tool-error">
                  <h4>Error</h4>
                  <p>{selectedTool.error}</p>
                </div>
              )}
              
              <div className="tool-actions">
                {selectedTool.status === 'available' && (
                  <button 
                    className="install-button"
                    onClick={() => installTool(selectedTool.id)}
                    disabled={agentState.busy}
                  >
                    Install Tool
                  </button>
                )}
                
                {selectedTool.status === 'installed' && (
                  <button 
                    className="uninstall-button"
                    onClick={() => uninstallTool(selectedTool.id)}
                    disabled={agentState.busy}
                  >
                    Uninstall Tool
                  </button>
                )}
                
                {selectedTool.status === 'installing' && (
                  <button 
                    className="installing-button"
                    disabled
                  >
                    Installing...
                  </button>
                )}
              </div>
            </div>
            
            <div className="tool-chat">
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
                    <p>Ask questions about MCP tools and their usage.</p>
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
                  placeholder={`Ask about ${selectedTool.name}...`}
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
        )}
      </div>
    </div>
  );
};

export default MamaBearMCP;