# Podplay Sanctuary Model Routing Integration Plan

## Core Implementation Strategy

I'll implement the intelligent model routing system to power all four MamaBear agents while integrating with our window management system. This approach will:

1. Use available Gemini models based on cost-performance needs
2. Distribute workloads across multiple billing accounts
3. Implement automatic fallbacks when rate limits are reached
4. Integrate with the draggable window system for a unified UI

## Implementation Steps

### 1. Model Router Implementation (1-2 days)

```python
# Enhanced model router implementation
class ModelRouter:
    def __init__(self, config):
        # Initialize with models in priority order
        self.models = self._load_models_from_config(config)
        self.usage_tracking = UsageTracker()
        self.current_quotas = {}
        self.update_quotas()
        
    async def select_model_for_request(self, request_type, complexity, urgency):
        """Select the most appropriate model based on multiple factors"""
        available_models = self._get_available_models()
        
        if not available_models:
            raise NoModelsAvailableError("All models have reached quota limits")
            
        # Score models based on request characteristics
        scored_models = self._score_models_for_request(
            available_models, request_type, complexity, urgency
        )
        
        # Select highest scoring model
        selected_model = scored_models[0]["model"]
        self.usage_tracking.record_selection(selected_model.name)
        
        return selected_model
```

### 2. Agent Integration with Window System (2-3 days)

```typescript
// src/enhanced/agent-integration/AgentWindowManager.tsx
import React, { useEffect } from 'react';
import { useWindow, WindowType } from '../window-management/WindowContext';
import { useSocket } from '../../contexts/SocketContext';

export const AgentWindowManager: React.FC = () => {
  const { createWindow, windows, focusWindow } = useWindow();
  const { socket } = useSocket();
  
  // Listen for agent window creation requests
  useEffect(() => {
    if (!socket) return;
    
    socket.on('agent:window_request', (data) => {
      const { agentType, windowProps } = data;
      
      // Create appropriate window based on agent type
      switch (agentType) {
        case 'main_chat':
          createMainChatWindow(windowProps);
          break;
        case 'scout':
          createScoutWindow(windowProps);
          break;
        case 'dev_workspace':
          createDevWorkspaceWindow(windowProps);
          break;
        case 'mcp':
          createMCPWindow(windowProps);
          break;
      }
    });
    
    return () => {
      socket.off('agent:window_request');
    };
  }, [socket, createWindow]);
  
  // Implementation of window creation functions
  const createMainChatWindow = (props = {}) => {
    return createWindow({
      title: 'Mama Bear Chat',
      type: WindowType.CHAT,
      position: { x: 50, y: 50 },
      size: { width: 800, height: 600 },
      content: 'MamaBearMainChat',
      ...props
    });
  };
  
  // Other window creation functions...
  
  return null; // This is a non-visual component
};
```

### 3. Socket Integration for Real-time Updates (1-2 days)

```typescript
// src/enhanced/agent-integration/AgentSocketManager.tsx
import React, { useEffect, useContext } from 'react';
import { SocketContext } from '../../contexts/SocketContext';
import { useAgentState } from '../../contexts/AgentContext';

export const AgentSocketManager: React.FC = () => {
  const { socket, isConnected } = useContext(SocketContext);
  const { updateAgentState, agentStates } = useAgentState();
  
  // Set up socket listeners for agent updates
  useEffect(() => {
    if (!socket || !isConnected) return;
    
    // Agent state updates
    socket.on('agent:state_update', (data) => {
      const { agentType, state } = data;
      updateAgentState(agentType, state);
    });
    
    // Model usage updates
    socket.on('model_usage_update', (data) => {
      console.log('Model usage update:', data);
      // Update UI or context as needed
    });
    
    // Scout workflow updates
    socket.on('scout_workflow_progress', (data) => {
      console.log('Scout progress:', data);
      updateAgentState('scout', { workflowStage: data.stage });
    });
    
    return () => {
      socket.off('agent:state_update');
      socket.off('model_usage_update');
      socket.off('scout_workflow_progress');
    };
  }, [socket, isConnected, updateAgentState]);
  
  return null; // Non-visual component
};
```

### 4. React Context for Agent State Management (1 day)

```typescript
// src/contexts/AgentContext.tsx
import React, { createContext, useContext, useState } from 'react';

type AgentType = 'main_chat' | 'scout' | 'dev_workspace' | 'mcp';

interface AgentState {
  active: boolean;
  busy: boolean;
  currentTask?: string;
  modelInUse?: string;
  workflowStage?: string;
  [key: string]: any; // Additional agent-specific state
}

interface AgentContextType {
  agentStates: Record<AgentType, AgentState>;
  updateAgentState: (agentType: AgentType, update: Partial<AgentState>) => void;
  resetAgentState: (agentType: AgentType) => void;
}

const defaultState: Record<AgentType, AgentState> = {
  main_chat: { active: true, busy: false },
  scout: { active: false, busy: false },
  dev_workspace: { active: false, busy: false },
  mcp: { active: false, busy: false }
};

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agentStates, setAgentStates] = useState(defaultState);
  
  const updateAgentState = (agentType: AgentType, update: Partial<AgentState>) => {
    setAgentStates(prev => ({
      ...prev,
      [agentType]: {
        ...prev[agentType],
        ...update
      }
    }));
  };
  
  const resetAgentState = (agentType: AgentType) => {
    setAgentStates(prev => ({
      ...prev,
      [agentType]: defaultState[agentType]
    }));
  };
  
  return (
    <AgentContext.Provider value={{ agentStates, updateAgentState, resetAgentState }}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgentState = () => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgentState must be used within an AgentProvider');
  }
  return context;
};
```

## Frontend Components Integration

### 1. Main MamaBear Chat Component (1-2 days)

```typescript
// src/enhanced/mama-bear-agents/MamaBearMainChat.tsx
import React, { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useAgentState } from '../../contexts/AgentContext';
import './MamaBearMainChat.css';

export const MamaBearMainChat: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const { socket } = useSocket();
  const { agentStates, updateAgentState } = useAgentState();
  
  const sendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message to UI
    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Send to backend
    socket.emit('agent:message', {
      agentType: 'main_chat',
      content: input,
      timestamp: new Date().toISOString()
    });
    
    // Update agent state
    updateAgentState('main_chat', { busy: true });
    
    // Clear input
    setInput('');
  };
  
  // Listen for agent responses
  useEffect(() => {
    if (!socket) return;
    
    socket.on('agent:response', (data) => {
      if (data.agentType === 'main_chat') {
        setMessages(prev => [...prev, {
          id: data.id || Date.now().toString(),
          sender: 'assistant',
          content: data.content,
          timestamp: new Date(data.timestamp || Date.now())
        }]);
        
        updateAgentState('main_chat', { busy: false });
      }
    });
    
    return () => {
      socket.off('agent:response');
    };
  }, [socket, updateAgentState]);
  
  return (
    <div className="mamabear-chat-container">
      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.sender}`}>
            <div className="message-content">{msg.content}</div>
            <div className="message-timestamp">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        
        {agentStates.main_chat.busy && (
          <div className="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        )}
      </div>
      
      <div className="chat-input-container">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Mama Bear anything..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button onClick={sendMessage} disabled={agentStates.main_chat.busy}>
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
};
```

### 2. Scout Agent Integration with TaskBoard (1-2 days)

Already implemented with our TaskBoard component, we just need to connect it to the agent system:

```typescript
// src/enhanced/scout-workflow-engine/ScoutAgentIntegration.tsx
import React, { useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useAgentState } from '../../contexts/AgentContext';
import { useWindow } from '../window-management/WindowContext';

export const ScoutAgentIntegration: React.FC = () => {
  const { socket } = useSocket();
  const { updateAgentState } = useAgentState();
  const { windows, updateWindowContent } = useWindow();
  
  useEffect(() => {
    if (!socket) return;
    
    // Listen for Scout workflow stage updates
    socket.on('scout_workflow_progress', (data) => {
      updateAgentState('scout', {
        workflowStage: data.stage,
        currentTask: data.currentTask
      });
      
      // Find Scout TaskBoard window and update its content
      const taskBoardWindow = windows.find(w => w.content === 'TaskBoard');
      if (taskBoardWindow) {
        // Update window content with new task data
        updateWindowContent(taskBoardWindow.id, {
          ...taskBoardWindow.content,
          stageData: data.stages,
          currentStage: data.stage
        });
      }
    });
    
    return () => {
      socket.off('scout_workflow_progress');
    };
  }, [socket, updateAgentState, windows, updateWindowContent]);
  
  return null; // Non-visual component
};
```

## Backend Model Integration

### 1. Model-Agent Dispatcher (1-2 days)

```python
# services/enhanced_agent_dispatcher.py
class ModelAgentDispatcher:
    """Dispatch requests to appropriate model based on agent type and request"""
    
    def __init__(self, model_router, enhanced_mama, marketplace_manager):
        self.model_router = model_router
        self.enhanced_mama = enhanced_mama
        self.marketplace_manager = marketplace_manager
        self.agent_models = {
            'main_chat': {
                'default': 'gemini-2-flash-lite',
                'fallbacks': ['gemini-2-flash', 'gemini-2.5-flash', 'claude-instant']
            },
            'scout': {
                'default': 'gemini-2-flash',
                'fallbacks': ['gemini-2.5-flash', 'gemini-2.5-pro', 'claude-instant']
            },
            'dev_workspace': {
                'default': 'gemini-2.5-flash',
                'fallbacks': ['gemini-2.5-pro', 'claude-instant']
            },
            'mcp': {
                'default': 'gemini-2-flash',
                'fallbacks': ['gemini-2-flash-lite', 'gemini-2.5-flash']
            }
        }
        
    async def dispatch_request(self, agent_type, request_data):
        """Route the request to the appropriate model based on agent type"""
        try:
            # Determine request characteristics
            complexity = self._assess_complexity(request_data)
            urgency = request_data.get('urgency', 'normal')
            
            # Select model based on agent type and request characteristics
            model_config = self.agent_models.get(agent_type)
            if not model_config:
                raise ValueError(f"Unknown agent type: {agent_type}")
                
            try:
                # Try to get the model
                model = await self.model_router.select_model_for_request(
                    agent_type, complexity, urgency
                )
                
                # Process the request with the selected model
                response = await self._process_with_model(model, agent_type, request_data)
                return response
                
            except Exception as e:
                logger.error(f"Error processing with primary model: {e}")
                # Try fallback models in order
                for fallback in model_config['fallbacks']:
                    try:
                        fallback_model = self.model_router.get_model_by_name(fallback)
                        response = await self._process_with_model(
                            fallback_model, agent_type, request_data
                        )
                        return response
                    except Exception as fallback_error:
                        logger.error(f"Fallback {fallback} failed: {fallback_error}")
                
                # All models failed
                raise AllModelsFailedError("All models failed to process the request")
                
        except Exception as e:
            logger.error(f"Request dispatch failed: {e}")
            raise
```

## Integration Testing Plan

1. **Unit Tests**: Test each component in isolation with mock data
2. **Integration Tests**: Test socket events, window creation, and agent communication
3. **End-to-End Tests**: Test the complete flow from user input to agent response with window creation

## Deployment Timeline

1. **Phase 1 (1 week)**: Implement model router and agent backend
2. **Phase 2 (1 week)**: Integrate with frontend window management
3. **Phase 3 (1 week)**: Complete UI components for all four agents
4. **Phase 4 (1 week)**: Testing, optimization, and deployment

## Future Enhancements

1. **Advanced Quota Management**: Predictive quota usage to optimize model selection
2. **Smart Caching**: Cache similar requests to reduce API usage
3. **Agent Coordination**: Enhanced collaboration between agents
4. **Custom Tool Extensions**: Allow creation of custom MCP tools