import React, { createContext, useContext, useState, useEffect } from 'react';
import { AgentType } from '../../services/agent-communication/types';
import agentService from '../../services/agent-communication';

// Define the context type
interface AgentContextType {
  agentType: AgentType;
  isConnected: boolean;
  isTyping: boolean;
  status: 'idle' | 'thinking' | 'working' | 'error';
}

// Create the context with default values
const AgentContext = createContext<AgentContextType>({
  agentType: 'mama-bear',
  isConnected: false,
  isTyping: false,
  status: 'idle'
});

// Props for the AgentProvider component
interface AgentProviderProps {
  children: React.ReactNode;
  agentType: AgentType;
}

/**
 * AgentProvider component
 * Provides context for agent-related functionality
 */
export const AgentProvider: React.FC<AgentProviderProps> = ({ 
  children, 
  agentType = 'mama-bear' 
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [status, setStatus] = useState<'idle' | 'thinking' | 'working' | 'error'>('idle');

  // Connect to agent on component mount
  useEffect(() => {
    // Here you would establish a connection to the agent
    // For now, we'll just simulate a successful connection
    setIsConnected(true);
    
    return () => {
      // Cleanup on unmount
      setIsConnected(false);
    };
  }, [agentType]);

  return (
    <AgentContext.Provider 
      value={{ 
        agentType, 
        isConnected, 
        isTyping, 
        status 
      }}
    >
      <div className="agent-provider" data-agent-type={agentType}>
        {children}
      </div>
    </AgentContext.Provider>
  );
};

// Custom hook to use the agent context
export const useAgent = () => useContext(AgentContext);

export default AgentProvider;
