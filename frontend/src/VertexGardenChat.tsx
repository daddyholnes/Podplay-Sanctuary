// Vertex Garden Multi-Model Chat Interface
// The Ultimate AI Development Environment with Gemini 2.5 as Mama Bear

import React, { useState, useEffect, useRef } from 'react';
import { MODEL_REGISTRY, ModelConfig, ChatSession, ChatMessage, MediaAttachment, getModelById } from './ModelRegistry';
import DevSandbox from './DevSandbox';
import MultimodalInput from './components/MultimodalInput';
import { buildApiUrl, API_ENDPOINTS } from './config/api';
import './VertexGardenChat.css';

interface VertexGardenChatProps {
  initialModelId?: string;
}

interface LocalTerminalSession {
  id: string;
  isActive: boolean;
  workingDirectory: string;
  environmentVariables: Record<string, string>;
  installedPackages: string[];
}

interface CodeExecution {
  id: string;
  code: string;
  language: string;
  status: 'running' | 'completed' | 'error';
  output: string;
  timestamp: string;
}

const VertexGardenChat: React.FC<VertexGardenChatProps> = ({ initialModelId = 'mama-bear-gemini-25' }) => {
  // ==================== CHAT STATE ====================
  const [selectedModel, setSelectedModel] = useState<ModelConfig>(getModelById(initialModelId)!);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [_chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);
  
  // ==================== MODEL SWITCHING STATE ====================
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [modelSessions, setModelSessions] = useState<Record<string, ChatSession>>({});
  
  // ==================== COST TRACKING STATE ====================
  const [sessionCosts, setSessionCosts] = useState<Record<string, number>>({});
  const [_totalCost, setTotalCost] = useState(0);
  
  // ==================== LOCAL TERMINAL STATE ====================
  const [terminalSession, setTerminalSession] = useState<LocalTerminalSession | null>(null);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [showTerminal, setShowTerminal] = useState(false);
  
  // ==================== CODE EXECUTION STATE ====================
  const [_codeExecutions, _setCodeExecutions] = useState<CodeExecution[]>([]);
  const [_showCodeRunner, _setShowCodeRunner] = useState(false);
  
  // ==================== MEMORY & CONTEXT STATE ====================
  const [memoryContext, setMemoryContext] = useState<string[]>([]);
  const [showMemoryPanel, setShowMemoryPanel] = useState(false);
  
  // ==================== DEVSANDBOX STATE ====================
  const [showDevSandbox, setShowDevSandbox] = useState(false);
  
  // ==================== UI REFS ====================
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  
  // ==================== EFFECTS ====================
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    loadChatHistory();
    initializeTerminalSession();
  }, []);
  
  useEffect(() => {
    // Switch to model's last session or create new one
    switchToModelSession(selectedModel.id);
  }, [selectedModel]);
  
  // ==================== UTILITY FUNCTIONS ====================
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // ==================== CHAT FUNCTIONS ====================
  const loadChatHistory = async () => {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.VERTEX_GARDEN.CHAT) + '-history');
      const data = await response.json();
      if (data.success) {
        setChatHistory(data.sessions);
        // Build model sessions map
        const sessionsMap: Record<string, ChatSession> = {};
        data.sessions.forEach((session: ChatSession) => {
          if (!sessionsMap[session.model_id]) {
            sessionsMap[session.model_id] = session;
          }
        });
        setModelSessions(sessionsMap);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };
  
  const switchToModelSession = async (modelId: string) => {
    let session = modelSessions[modelId];
    
    if (!session) {
      // Create new session for this model
      session = {
        id: generateSessionId(),
        model_id: modelId,
        title: `Chat with ${getModelById(modelId)?.name}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        message_count: 0,
        total_tokens: 0,
        cost_estimate: 0,
        is_archived: false,
        tags: []
      };
      
      setModelSessions(prev => ({ ...prev, [modelId]: session! }));
    }
    
    setCurrentSession(session);
    await loadSessionMessages(session.id);
  };
  
  const loadSessionMessages = async (sessionId: string) => {
    try {
      const response = await fetch(`buildDynamicApiUrl(API_ENDPOINTS.VERTEX_GARDEN.SESSION_MESSAGES, {sessionId: ${sessionId}})`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error loading session messages:', error);
      setMessages([]);
    }
  };
   const sendMessage = async () => {
    if (!inputMessage.trim() && attachments.length === 0) return;
    if (!currentSession) return;

    const userMessage: ChatMessage = {
      id: generateMessageId(),
      session_id: currentSession.id,
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
      tokens_used: 0,
      cost: 0,
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setAttachments([]);
    setIsTyping(true);

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.VERTEX_GARDEN.CHAT), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_id: selectedModel.id,
          session_id: currentSession.id,
          message: inputMessage,
          attachments: attachments.map(att => ({
            type: att.type,
            name: att.name,
            size: att.size
          })),
          context: {
            terminal_session: terminalSession,
            memory_context: memoryContext,
            model_config: selectedModel
          }
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: generateMessageId(),
          session_id: currentSession.id,
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString(),
          tokens_used: data.tokens_used || 0,
          cost: data.cost || 0,
          metadata: data.metadata
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Update session costs
        const sessionCost = (sessionCosts[currentSession.id] || 0) + (data.cost || 0);
        setSessionCosts(prev => ({ ...prev, [currentSession.id]: sessionCost }));
        setTotalCost(prev => prev + (data.cost || 0));
        
        // Update memory context if provided
        if (data.memory_context) {
          setMemoryContext(data.memory_context);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
    }

    // Clean up attachment URLs
    attachments.forEach(att => {
      if (att.url) {
        URL.revokeObjectURL(att.url);
      }
    });
  };
  
  // ==================== LOCAL TERMINAL FUNCTIONS ====================
  const initializeTerminalSession = () => {
    const session: LocalTerminalSession = {
      id: generateSessionId(),
      isActive: true,
      workingDirectory: '/home/woody/Desktop/podplay-build-beta',
      environmentVariables: {},
      installedPackages: []
    };
    setTerminalSession(session);
  };
  
  const executeTerminalCommand = async (command: string) => {
    if (!terminalSession) return;
    
    setTerminalOutput(prev => [...prev, `$ ${command}`]);
    
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.VERTEX_GARDEN.TERMINAL), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command,
          session_id: terminalSession.id,
          working_directory: terminalSession.workingDirectory
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTerminalOutput(prev => [...prev, data.output]);
        if (data.working_directory) {
          setTerminalSession(prev => prev ? { ...prev, workingDirectory: data.working_directory } : prev);
        }
      } else {
        setTerminalOutput(prev => [...prev, `Error: ${data.error}`]);
      }
    } catch (error) {
      setTerminalOutput(prev => [...prev, `Error: ${error}`]);
    }
  };
  
  // ==================== CODE EXECUTION FUNCTIONS ====================
  // Code execution (planned feature)
  /*
  const executeCode = async (code: string, language: string) => {
    const execution: CodeExecution = {
      id: generateSessionId(),
      code: code,
      language: language,
      status: 'running',
      output: '',
      timestamp: new Date().toISOString()
    };
    
    setCodeExecutions(prev => [...prev, execution]);
    
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.VERTEX_GARDEN.EXECUTE_CODE), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code, language: language, session_id: terminalSession?.id })
      });
      
      const data = await response.json();
      
      setCodeExecutions(prev => prev.map(exec => 
        exec.id === execution.id 
          ? { 
              ...exec, 
              status: data.success ? 'completed' : 'error',
              output: data.output || data.error 
            }
          : exec
      ));
    } catch (error) {
      setCodeExecutions(prev => prev.map(exec => 
        exec.id === execution.id 
          ? { ...exec, status: 'error', output: `Error: ${error}` }
          : exec
      ));
    }
  };
  */
  
  // ==================== MODEL SELECTOR COMPONENT ====================
  const ModelSelector = () => (
    <div className="model-selector-panel">
      <div className="model-selector-header">
        <h3>🌟 Vertex Garden Models</h3>
        <button onClick={() => setShowModelSelector(false)}>✕</button>
      </div>
      
      <div className="model-grid">
        {MODEL_REGISTRY.map(model => (
          <div 
            key={model.id}
            className={`model-card ${selectedModel.id === model.id ? 'selected' : ''}`}
            onClick={() => {
              setSelectedModel(model);
              setShowModelSelector(false);
            }}
          >
            <div className="model-header">
              <span className="model-icon" style={{ color: model.ui_config.color }}>
                {model.ui_config.icon}
              </span>
              <div className="model-info">
                <h4>{model.name}</h4>
                <p className="model-provider">{model.provider}</p>
              </div>
              <div className="model-tier">
                <span className={`tier-badge ${model.billing_tier}`}>
                  {model.billing_tier}
                </span>
              </div>
            </div>
            
            <p className="model-description">{model.description}</p>
            
            <div className="model-pricing">
              <div className="pricing-row">
                <span>Input:</span>
                <span>${model.pricing.input_tokens}/1M tokens</span>
              </div>
              <div className="pricing-row">
                <span>Output:</span>
                <span>${model.pricing.output_tokens}/1M tokens</span>
              </div>
              <div className="pricing-row">
                <span>Context:</span>
                <span>{(model.pricing.context_window / 1000).toFixed(0)}K tokens</span>
              </div>
            </div>
            
            <div className="model-capabilities">
              {model.capabilities.slice(0, 3).map(cap => (
                <span key={cap} className="capability-tag">{cap}</span>
              ))}
              {model.capabilities.length > 3 && (
                <span className="more-capabilities">+{model.capabilities.length - 3}</span>
              )}
            </div>
            
            {modelSessions[model.id] && (
              <div className="last-chat-info">
                <span>💬 Last chat: {new Date(modelSessions[model.id].updated_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // ==================== MAIN RENDER ====================
  return (
    <div className="vertex-garden-chat">
      {/* Header */}
      <div className="chat-header">
        <div className="current-model" onClick={() => setShowModelSelector(true)}>
          <span className="model-icon" style={{ color: selectedModel.ui_config.color }}>
            {selectedModel.ui_config.icon}
          </span>
          <div className="model-details">
            <h3>{selectedModel.name}</h3>
            <p>{selectedModel.provider}</p>
          </div>
          <div className="model-stats">
            <span className="cost-estimate">
              ${(sessionCosts[currentSession?.id || ''] || 0).toFixed(4)}
            </span>
            <span className="session-info">
              {messages.length} messages
            </span>
          </div>
          <span className="expand-icon">▼</span>
        </div>
        
        <div className="chat-actions">
          <button 
            className={`action-btn ${showTerminal ? 'active' : ''}`}
            onClick={() => setShowTerminal(!showTerminal)}
          >
            💻 Terminal
          </button>
          <button 
            className={`action-btn ${_showCodeRunner ? 'active' : ''}`}
            onClick={() => _setShowCodeRunner(!_showCodeRunner)}
          >
            🚀 Code
          </button>
          <button 
            className={`action-btn ${showDevSandbox ? 'active' : ''}`}
            onClick={() => setShowDevSandbox(!showDevSandbox)}
          >
            🏗️ DevSandbox
          </button>
          <button 
            className={`action-btn ${showMemoryPanel ? 'active' : ''}`}
            onClick={() => setShowMemoryPanel(!showMemoryPanel)}
          >
            🧠 Memory
          </button>
        </div>
      </div>
      
      {/* Model Selector Overlay */}
      {showModelSelector && (
        <div className="modal-overlay">
          <ModelSelector />
        </div>
      )}
      
      {/* Main Chat Area */}
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map(message => (
            <div key={message.id} className={`message ${message.role}`}>
              <div className="message-header">
                <span className="role-icon">
                  {message.role === 'user' ? '👤' : selectedModel.ui_config.icon}
                </span>
                <span className="timestamp">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
                {message.cost > 0 && (
                  <span className="message-cost">${message.cost.toFixed(4)}</span>
                )}
              </div>
              <div className="message-content">
                {message.content}
              </div>
              {message.metadata?.tools_used && (
                <div className="tools-used">
                  <strong>Tools used:</strong> {message.metadata.tools_used.join(', ')}
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="typing-indicator">
              <span className="model-icon" style={{ color: selectedModel.ui_config.color }}>
                {selectedModel.ui_config.icon}
              </span>
              <div className="typing-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Side Panels */}
        <div className="side-panels">
          {showTerminal && (
            <div className="terminal-panel">
              <div className="terminal-header">
                <h4>💻 Local Terminal</h4>
                <span className="terminal-path">{terminalSession?.workingDirectory}</span>
              </div>
              <div className="terminal-output" ref={terminalRef}>
                {terminalOutput.map((line, index) => (
                  <div key={index} className="terminal-line">{line}</div>
                ))}
              </div>
              <div className="terminal-input">
                <span className="prompt">$ </span>
                <input
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      executeTerminalCommand(terminalInput);
                      setTerminalInput('');
                    }
                  }}
                  placeholder="Enter command..."
                />
              </div>
            </div>
          )}
          
          {showMemoryPanel && (
            <div className="memory-panel">
              <div className="memory-header">
                <h4>🧠 Memory Context</h4>
              </div>
              <div className="memory-items">
                {memoryContext.map((item, index) => (
                  <div key={index} className="memory-item">{item}</div>
                ))}
              </div>
            </div>
          )}
          
          {showDevSandbox && (
            <div className="devsandbox-panel">
              <DevSandbox />
            </div>
          )}
        </div>
      </div>
      
      {/* Input Area */}
      <div className="chat-input-area">
        <MultimodalInput
          value={inputMessage}
          onChange={setInputMessage}
          onSend={sendMessage}
          onAttachmentsChange={setAttachments}
          attachments={attachments}
          placeholder={`Chat with ${selectedModel.name}...`}
          disabled={isTyping}
          quickActions={[
            { label: '🛠️ MCP Help', action: () => setInputMessage('Help me with MCP tools') },
            { label: '💻 Code Review', action: () => setInputMessage('Review my code') },
            { label: '📋 Briefing', action: () => setInputMessage('Generate daily briefing') },
            { label: '🎯 Guidance', action: () => setInputMessage('What should I work on?') }
          ]}
        />
      </div>
    </div>
  );
};

export default VertexGardenChat;
