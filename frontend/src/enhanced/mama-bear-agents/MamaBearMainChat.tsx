import React, { useState, useEffect, useRef } from 'react';
import { agentSocketService } from '../../services/agentSocketService';
import { AgentType, AgentState } from '../agent-integration/AgentWindowBridge';
import './MamaBearMainChat.css';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant' | 'system';
  timestamp: Date;
  metadata?: any;
}

interface MamaBearMainChatProps {
  agentType: AgentType;
  agentState: AgentState;
  updateAgentState: (update: Partial<AgentState>) => void;
}

/**
 * MamaBearMainChat - Main chat interface with MamaBear
 * 
 * Primary communication interface with the Main MamaBear agent.
 * Designed to be neurodivergent-friendly with clear structure and calm animations.
 */
export const MamaBearMainChat: React.FC<MamaBearMainChatProps> = ({
  agentType,
  agentState,
  updateAgentState
}) => {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const [modelInfo, setModelInfo] = useState<{name: string, cost: number} | null>(null);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  // Listen for agent responses
  useEffect(() => {
    const handleAgentResponse = (data: any) => {
      if (data.agentType === AgentType.MAIN_CHAT) {
        const newMessage: Message = {
          id: data.id || `msg-${Date.now()}`,
          content: data.content,
          sender: 'assistant',
          timestamp: new Date(data.timestamp || Date.now()),
          metadata: data.metadata
        };
        
        setMessages(prev => [...prev, newMessage]);
        
        // Update model info if available
        if (data.metadata?.model) {
          setModelInfo({
            name: data.metadata.model,
            cost: data.metadata.cost || 0
          });
        }
      }
    };
    
    const handleAgentError = (data: any) => {
      if (data.agentType === AgentType.MAIN_CHAT) {
        // Add error message
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          content: `Error: ${data.message || 'Unknown error occurred'}`,
          sender: 'system',
          timestamp: new Date(),
          metadata: { isError: true }
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    };
    
    agentSocketService.on('agent_response', handleAgentResponse);
    agentSocketService.on('agent_error', handleAgentError);
    
    // Add welcome message if no messages exist
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        content: "Hello, Nathan! I'm your Mama Bear. How can I help you today? 💜",
        sender: 'assistant',
        timestamp: new Date()
      }]);
    }
    
    return () => {
      agentSocketService.removeListener('agent_response', handleAgentResponse);
      agentSocketService.removeListener('agent_error', handleAgentError);
    };
  }, []);
  
  // Send a message to the agent
  const sendMessage = () => {
    if (!input.trim()) return;
    
    // Create new message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    // Add to messages
    setMessages(prev => [...prev, userMessage]);
    
    // Update agent state
    updateAgentState({ busy: true });
    
    // Send to service
    agentSocketService.sendAgentMessage(AgentType.MAIN_CHAT, input);
    
    // Clear input
    setInput('');
    setIsInputExpanded(false);
    
    // Focus input
    inputRef.current?.focus();
  };
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-expand input when typing
    if (e.target.value.length > 0 && !isInputExpanded) {
      setIsInputExpanded(true);
    } else if (e.target.value.length === 0 && isInputExpanded) {
      setIsInputExpanded(false);
    }
  };
  
  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Format message content with markdown-like syntax
  const formatContent = (content: string) => {
    // This is a simplified formatter - in a real app you would use a proper markdown parser
    // Replace code blocks
    let formatted = content.replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>');
    
    // Replace bold
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Replace italic
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Replace links
    formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Replace line breaks
    formatted = formatted.replace(/\n/g, '<br />');
    
    return formatted;
  };

  return (
    <div className="mamabear-main-chat">
      <div className="chat-header">
        <div className="agent-info">
          <div className={`agent-state-indicator ${agentState.busy ? 'busy' : 'active'}`}>
            {agentState.busy ? 'Thinking...' : 'Ready'}
          </div>
          <h3>Mama Bear</h3>
        </div>
        
        {modelInfo && (
          <div className="model-info">
            <span className="model-name">{modelInfo.name}</span>
            <span className="model-cost">${modelInfo.cost.toFixed(4)}</span>
          </div>
        )}
      </div>
      
      <div className="chat-messages">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`message ${message.sender} ${message.metadata?.isError ? 'error' : ''}`}
          >
            {message.sender === 'assistant' && (
              <div className="avatar">
                <img src="/assets/mama-bear-avatar.png" alt="Mama Bear" />
              </div>
            )}
            
            <div className="message-content">
              <div 
                className="content" 
                dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
              />
              
              <div className="timestamp">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {agentState.busy && (
          <div className="message assistant typing">
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
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className={`chat-input-container ${isInputExpanded ? 'expanded' : ''}`}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask Mama Bear anything..."
          rows={isInputExpanded ? 3 : 1}
          disabled={agentState.busy}
        />
        
        <div className="input-actions">
          <button 
            className="attach-button"
            title="Attach files"
            onClick={() => alert('File upload not implemented yet')}
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5a2.5 2.5 0 0 0 5 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z" />
            </svg>
          </button>
          
          <button 
            className="send-button"
            onClick={sendMessage}
            disabled={!input.trim() || agentState.busy}
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MamaBearMainChat;