import React, { useState, useRef, useEffect } from 'react';
import {
  Globe, Database, Zap, Bot, Settings, Plus, Search, Play, Pause,
  FileText, Code, Link, Upload, Download, RefreshCw, MessageCircle,
  ChevronRight, ExternalLink, Check, Clock, AlertCircle, Star,
  GitBranch, Send, Mail, Video, Twitter, Github, Slack,
  Sun, Moon, X, Minimize2, Maximize2, Users, Target, Brain,
  CheckCircle, ArrowRight, Copy, ThumbsUp, ThumbsDown, Sparkles
} from 'lucide-react';
import { AgentProps } from '../agent-integration/AgentWindowBridge';
import './MamaBearIntegrationWorkbench.css';

const MamaBearIntegrationWorkbench: React.FC<AgentProps> = ({ 
  agentType, 
  agentState,
  updateAgentState 
}) => {
  // Main state
  const [activeTab, setActiveTab] = useState('scraper');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMamaBear, setShowMamaBear] = useState(true);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<Array<{
    role: string;
    content: string;
    timestamp: string;
  }>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Scraper state
  const [scrapingUrl, setScrapingUrl] = useState('');
  const [scrapingStatus, setScrapingStatus] = useState<{
    isActive: boolean;
    progress: number;
    message: string;
    error?: string;
  }>({
    isActive: false,
    progress: 0,
    message: 'Ready to scrape',
  });
  
  // Workflow state
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('auto');
  const [workflowResult, setWorkflowResult] = useState<any>(null);
  
  // Platforms state
  const [platforms, setPlatforms] = useState<Array<{
    id: string;
    name: string;
    icon: string;
    status: string;
    description: string;
    doc_url: string;
  }>>([]);
  
  // Knowledge sources
  const [knowledgeSources, setKnowledgeSources] = useState<Array<{
    domain: string;
    url: string;
    chunks: number;
    last_updated: string;
    status: string;
  }>>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize with sample data
  useEffect(() => {
    // Fetch platforms
    fetchPlatforms();
    
    // Fetch knowledge sources
    fetchKnowledgeSources();
    
    // Add welcome message
    setChatMessages([
      {
        role: 'assistant',
        content: 'Welcome to the Integration Workbench! I can help you create automations, integrate with external platforms, and more. What would you like to do today?',
        timestamp: new Date().toISOString()
      }
    ]);
    
    // Apply theme from system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);
  
  // Fetch available platforms
  const fetchPlatforms = async () => {
    try {
      const response = await fetch('/api/integration/platforms');
      const data = await response.json();
      
      if (data.platforms) {
        setPlatforms(data.platforms);
      }
    } catch (error) {
      console.error('Error fetching platforms:', error);
      setPlatforms([
        {
          id: 'zapier',
          name: 'Zapier',
          icon: 'zap',
          status: 'needs_setup',
          description: 'Connect with 5,000+ apps',
          doc_url: 'https://docs.zapier.com'
        },
        {
          id: 'eden_ai',
          name: 'Eden AI',
          icon: 'brain',
          status: 'needs_setup',
          description: 'Unified AI API provider',
          doc_url: 'https://docs.edenai.co'
        },
        {
          id: 'n8n',
          name: 'n8n',
          icon: 'database',
          status: 'needs_setup',
          description: 'Open source workflow automation',
          doc_url: 'https://docs.n8n.io'
        }
      ]);
    }
  };
  
  // Fetch knowledge sources
  const fetchKnowledgeSources = async () => {
    try {
      const response = await fetch('/api/integration/knowledge-sources');
      const data = await response.json();
      
      if (data.sources) {
        setKnowledgeSources(data.sources);
      }
    } catch (error) {
      console.error('Error fetching knowledge sources:', error);
      setKnowledgeSources([]);
    }
  };
  
  // Handle scraping a URL
  const handleScrapeUrl = async () => {
    if (!scrapingUrl) return;
    
    setScrapingStatus({
      isActive: true,
      progress: 10,
      message: 'Starting scrape...'
    });
    
    // Add user message
    addChatMessage('user', `Please scrape documentation from: ${scrapingUrl}`);
    
    try {
      const response = await fetch('/api/integration/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: scrapingUrl })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setScrapingStatus({
          isActive: false,
          progress: 100,
          message: 'Scrape completed successfully!'
        });
        
        // Add assistant message
        addChatMessage('assistant', `I've successfully scraped ${scrapingUrl}! I've stored ${data.chunks_stored} chunks of knowledge about ${data.domain}. I can now help you create automations with this platform.`);
        
        // Refresh knowledge sources
        fetchKnowledgeSources();
      } else {
        setScrapingStatus({
          isActive: false,
          progress: 0,
          message: 'Scrape failed',
          error: data.error
        });
        
        // Add assistant message
        addChatMessage('assistant', `I couldn't scrape ${scrapingUrl}. Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error scraping URL:', error);
      setScrapingStatus({
        isActive: false,
        progress: 0,
        message: 'Scrape failed',
        error: 'Network error'
      });
      
      // Add assistant message
      addChatMessage('assistant', `I couldn't scrape ${scrapingUrl} due to a network error. Please try again later.`);
    }
  };
  
  // Handle creating a workflow
  const handleCreateWorkflow = async () => {
    if (!workflowDescription) return;
    
    // Add user message
    addChatMessage('user', workflowDescription);
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      const response = await fetch('/api/integration/create-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: workflowDescription,
          platform: selectedPlatform
        })
      });
      
      const data = await response.json();
      
      setIsTyping(false);
      
      if (response.ok) {
        setWorkflowResult(data.workflow);
        
        // Add assistant message
        addChatMessage('assistant', `I've created your workflow: "${workflowDescription}"! I'm using ${data.workflow.platform} to execute this automation. Your workflow has been configured and is ready to use.`);
      } else {
        // Add assistant message
        addChatMessage('assistant', `I couldn't create your workflow. Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
      setIsTyping(false);
      
      // Add assistant message
      addChatMessage('assistant', `I couldn't create your workflow due to a network error. Please try again later.`);
    }
  };
  
  // Add a message to the chat
  const addChatMessage = (role: string, content: string) => {
    setChatMessages(prev => [...prev, {
      role,
      content,
      timestamp: new Date().toISOString()
    }]);
  };
  
  // Handle sending a chat message
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // Add user message
    addChatMessage('user', newMessage);
    
    // Clear input
    setNewMessage('');
    
    // Show typing indicator
    setIsTyping(true);
    
    // In a real app, this would send the message to the server
    // For demo, we'll just simulate a response after a delay
    setTimeout(() => {
      setIsTyping(false);
      addChatMessage('assistant', `I'll help you with "${newMessage}". What platform would you like to use for this?`);
    }, 2000);
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
    document.body.classList.toggle('dark-mode', !isDarkMode);
  };
  
  // Get appropriate icon component
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'zap': return <Zap />;
      case 'brain': return <Brain />;
      case 'database': return <Database />;
      case 'github': return <Github />;
      case 'twitter': return <Twitter />;
      case 'slack': return <Slack />;
      default: return <Globe />;
    }
  };

  return (
    <div className={`integration-workbench ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="workbench-header">
        <div className="workbench-title">
          <h1>Integration Workbench</h1>
          <p>Universal Automation Hub</p>
        </div>
        <div className="workbench-actions">
          <button onClick={toggleDarkMode} className="icon-button">
            {isDarkMode ? <Sun /> : <Moon />}
          </button>
          <button onClick={() => setShowMamaBear(prev => !prev)} className="icon-button">
            {showMamaBear ? <Minimize2 /> : <Maximize2 />}
          </button>
        </div>
      </div>
      
      <div className="workbench-container">
        <div className="workbench-sidebar">
          <div className="sidebar-nav">
            <button 
              className={activeTab === 'scraper' ? 'active' : ''} 
              onClick={() => setActiveTab('scraper')}
            >
              <Globe /> Knowledge Scraper
            </button>
            <button 
              className={activeTab === 'workflow' ? 'active' : ''} 
              onClick={() => setActiveTab('workflow')}
            >
              <Zap /> Workflow Creator
            </button>
            <button 
              className={activeTab === 'platforms' ? 'active' : ''} 
              onClick={() => setActiveTab('platforms')}
            >
              <Database /> Platform Integrations
            </button>
            <button 
              className={activeTab === 'knowledge' ? 'active' : ''} 
              onClick={() => setActiveTab('knowledge')}
            >
              <Brain /> Knowledge Base
            </button>
          </div>
          
          <div className="sidebar-platforms">
            <h3>Connected Platforms</h3>
            <div className="platform-list">
              {platforms.map(platform => (
                <div 
                  key={platform.id} 
                  className={`platform-item ${platform.status}`}
                  onClick={() => setActiveTab('platforms')}
                >
                  {getIcon(platform.icon)}
                  <span>{platform.name}</span>
                  {platform.status === 'active' && <CheckCircle className="status-icon" />}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="workbench-content">
          {activeTab === 'scraper' && (
            <div className="tab-content scraper-tab">
              <h2>Knowledge Scraper</h2>
              <p>Teach Mama Bear new platforms by scraping documentation websites.</p>
              
              <div className="scraper-input">
                <input
                  type="text"
                  value={scrapingUrl}
                  onChange={e => setScrapingUrl(e.target.value)}
                  placeholder="Enter documentation URL (e.g., https://docs.zapier.com)"
                />
                <button 
                  onClick={handleScrapeUrl}
                  disabled={scrapingStatus.isActive || !scrapingUrl}
                >
                  {scrapingStatus.isActive ? <RefreshCw className="spin" /> : <Search />}
                  {scrapingStatus.isActive ? 'Scraping...' : 'Scrape Knowledge'}
                </button>
              </div>
              
              {scrapingStatus.message && (
                <div className={`scraper-status ${scrapingStatus.error ? 'error' : ''}`}>
                  <p>
                    {scrapingStatus.error ? <AlertCircle /> : 
                     scrapingStatus.isActive ? <RefreshCw className="spin" /> : 
                     scrapingStatus.progress === 100 ? <CheckCircle /> : <Clock />}
                    {scrapingStatus.message}
                    {scrapingStatus.error && `: ${scrapingStatus.error}`}
                  </p>
                  {scrapingStatus.isActive && (
                    <div className="progress-bar">
                      <div 
                        className="progress" 
                        style={{ width: `${scrapingStatus.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="knowledge-sources">
                <h3>Recently Scraped Sources</h3>
                {knowledgeSources.length > 0 ? (
                  <div className="sources-list">
                    {knowledgeSources.map((source, index) => (
                      <div key={index} className="source-item">
                        <div className="source-icon">
                          <Globe />
                        </div>
                        <div className="source-info">
                          <h4>{source.domain}</h4>
                          <p>{source.chunks} knowledge chunks</p>
                          <a href={source.url} target="_blank" rel="noopener noreferrer">
                            View Source <ExternalLink size={14} />
                          </a>
                        </div>
                        <div className="source-status">
                          <span className={`status ${source.status}`}>
                            {source.status === 'complete' ? (
                              <><CheckCircle size={14} /> Complete</>
                            ) : (
                              <><RefreshCw size={14} className="spin" /> Processing</>
                            )}
                          </span>
                          <p className="timestamp">
                            Updated: {new Date(source.last_updated).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>No knowledge sources scraped yet. Enter a URL above to get started!</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'workflow' && (
            <div className="tab-content workflow-tab">
              <h2>Workflow Creator</h2>
              <p>Create automations using natural language. Mama Bear will build it for you!</p>
              
              <div className="workflow-input">
                <textarea
                  value={workflowDescription}
                  onChange={e => setWorkflowDescription(e.target.value)}
                  placeholder="Describe what you want to automate (e.g., 'When I get emails with attachments, save them to Google Drive and notify me on Slack')"
                  rows={3}
                />
                
                <div className="workflow-options">
                  <div className="platform-selector">
                    <label>Preferred Platform:</label>
                    <select 
                      value={selectedPlatform}
                      onChange={e => setSelectedPlatform(e.target.value)}
                    >
                      <option value="auto">Auto-select best platform</option>
                      {platforms.map(platform => (
                        <option 
                          key={platform.id} 
                          value={platform.id}
                          disabled={platform.status !== 'active'}
                        >
                          {platform.name} {platform.status !== 'active' ? '(setup required)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <button 
                    onClick={handleCreateWorkflow}
                    disabled={!workflowDescription}
                    className="create-workflow-btn"
                  >
                    <Zap /> Create Workflow
                  </button>
                </div>
              </div>
              
              {workflowResult && (
                <div className="workflow-result">
                  <h3>Workflow Created!</h3>
                  <div className="workflow-card">
                    <div className="workflow-header">
                      <div className="workflow-platform">
                        {getIcon(workflowResult.platform_icon || 'zap')}
                        <span>{workflowResult.platform || 'Zapier'}</span>
                      </div>
                      <div className="workflow-status">
                        <span className="status active">
                          <CheckCircle size={14} /> Active
                        </span>
                      </div>
                    </div>
                    
                    <div className="workflow-body">
                      <h4>{workflowResult.name || 'My Workflow'}</h4>
                      <p>{workflowResult.description || workflowDescription}</p>
                      
                      <div className="workflow-steps">
                        {(workflowResult.steps || [
                          { type: 'trigger', name: 'New Email', icon: 'mail' },
                          { type: 'action', name: 'Process with AI', icon: 'brain' },
                          { type: 'action', name: 'Send to Slack', icon: 'slack' }
                        ]).map((step, index, steps) => (
                          <React.Fragment key={index}>
                            <div className="workflow-step">
                              <div className="step-icon">
                                {getIcon(step.icon || 'globe')}
                              </div>
                              <div className="step-info">
                                <span className="step-type">{step.type}</span>
                                <span className="step-name">{step.name}</span>
                              </div>
                            </div>
                            {index < steps.length - 1 && (
                              <div className="step-connector">
                                <ArrowRight />
                              </div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                    
                    <div className="workflow-footer">
                      <button className="workflow-action">
                        <Play size={14} /> Run Now
                      </button>
                      <button className="workflow-action">
                        <Edit size={14} /> Edit
                      </button>
                      <button className="workflow-action">
                        <Copy size={14} /> Duplicate
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'platforms' && (
            <div className="tab-content platforms-tab">
              <h2>Platform Integrations</h2>
              <p>Connect Mama Bear to external automation platforms and services.</p>
              
              <div className="platforms-grid">
                {platforms.map(platform => (
                  <div key={platform.id} className="platform-card">
                    <div className="platform-icon">
                      {getIcon(platform.icon)}
                    </div>
                    <h3>{platform.name}</h3>
                    <p>{platform.description}</p>
                    
                    <div className="platform-status">
                      {platform.status === 'active' ? (
                        <span className="status active">
                          <CheckCircle size={14} /> Connected
                        </span>
                      ) : (
                        <span className="status needs-setup">
                          <Clock size={14} /> Setup Required
                        </span>
                      )}
                    </div>
                    
                    <div className="platform-actions">
                      {platform.status === 'active' ? (
                        <button className="platform-action">
                          <Settings size={14} /> Configure
                        </button>
                      ) : (
                        <button className="platform-action primary">
                          <Link size={14} /> Connect
                        </button>
                      )}
                      <a 
                        href={platform.doc_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="platform-action"
                      >
                        <FileText size={14} /> Docs
                      </a>
                    </div>
                  </div>
                ))}
                
                <div className="platform-card add-platform">
                  <div className="platform-icon">
                    <Plus />
                  </div>
                  <h3>Add New Platform</h3>
                  <p>Connect another service to your Integration Workbench</p>
                  
                  <button className="platform-action primary">
                    <Plus size={14} /> Add Platform
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'knowledge' && (
            <div className="tab-content knowledge-tab">
              <h2>Knowledge Base</h2>
              <p>View all the knowledge Mama Bear has acquired from external platforms.</p>
              
              <div className="knowledge-stats">
                <div className="stat-card">
                  <h3>Total Platforms</h3>
                  <div className="stat-value">
                    <Database />
                    <span>{platforms.length}</span>
                  </div>
                </div>
                <div className="stat-card">
                  <h3>Knowledge Chunks</h3>
                  <div className="stat-value">
                    <FileText />
                    <span>{knowledgeSources.reduce((acc, source) => acc + source.chunks, 0)}</span>
                  </div>
                </div>
                <div className="stat-card">
                  <h3>Last Updated</h3>
                  <div className="stat-value">
                    <Clock />
                    <span>
                      {knowledgeSources.length > 0
                        ? new Date(Math.max(...knowledgeSources.map(s => new Date(s.last_updated).getTime()))).toLocaleDateString()
                        : 'Never'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="knowledge-sources">
                <h3>Knowledge Sources</h3>
                {knowledgeSources.length > 0 ? (
                  <div className="sources-list">
                    {knowledgeSources.map((source, index) => (
                      <div key={index} className="source-item">
                        <div className="source-icon">
                          <Globe />
                        </div>
                        <div className="source-info">
                          <h4>{source.domain}</h4>
                          <p>{source.chunks} knowledge chunks</p>
                          <a href={source.url} target="_blank" rel="noopener noreferrer">
                            View Source <ExternalLink size={14} />
                          </a>
                        </div>
                        <div className="source-status">
                          <span className={`status ${source.status}`}>
                            {source.status === 'complete' ? (
                              <><CheckCircle size={14} /> Complete</>
                            ) : (
                              <><RefreshCw size={14} className="spin" /> Processing</>
                            )}
                          </span>
                          <p className="timestamp">
                            Updated: {new Date(source.last_updated).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>No knowledge sources available. Use the Knowledge Scraper to teach Mama Bear about new platforms!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {showMamaBear && (
          <div className="mamabear-chat">
            <div className="chat-header">
              <h3><Bot /> Mama Bear Assistant</h3>
              <button onClick={() => setShowMamaBear(false)} className="close-button">
                <X />
              </button>
            </div>
            
            <div className="chat-messages">
              {chatMessages.map((message, index) => (
                <div key={index} className={`chat-message ${message.role}`}>
                  <div className="message-avatar">
                    {message.role === 'assistant' ? <Bot /> : <Users />}
                  </div>
                  <div className="message-content">
                    <p>{message.content}</p>
                    <span className="message-time">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {message.role === 'assistant' && (
                    <div className="message-actions">
                      <button className="message-action">
                        <ThumbsUp size={12} />
                      </button>
                      <button className="message-action">
                        <ThumbsDown size={12} />
                      </button>
                      <button className="message-action">
                        <Copy size={12} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="chat-message assistant typing">
                  <div className="message-avatar">
                    <Bot />
                  </div>
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>
            
            <div className="chat-input">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Ask Mama Bear about automations..."
                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
              />
              <button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                <Send />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MamaBearIntegrationWorkbench;
