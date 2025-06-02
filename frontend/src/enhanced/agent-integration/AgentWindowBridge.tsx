import React, { useEffect, useState } from 'react';
import { useWindow, WindowType } from '../window-management/WindowContext';
import { agentSocketService } from '../../services/agentSocketService';
import './AgentWindowBridge.css';

// Dynamic component imports handled by the window management system
// These are registered in the main app component

/**
 * Agent type enumeration
 */
export enum AgentType {
  MAIN_CHAT = 'main_chat',
  SCOUT = 'scout',
  DEV_WORKSPACE = 'dev_workspace',
  MCP = 'mcp'
}

/**
 * Agent state interface
 */
export interface AgentState {
  active: boolean;
  busy: boolean;
  currentTask?: string;
  modelInUse?: string;
  workflowStage?: string;
  error?: boolean;
  errorMessage?: string;
  [key: string]: any;
}

/**
 * AgentWindowBridge - Connects the agent system with window management
 * 
 * This component listens for agent events and creates/manages windows accordingly.
 * It also maintains agent state and provides it to the window components.
 */
export const AgentWindowBridge: React.FC = () => {
  // Window management hooks
  const { 
    createWindow, 
    windows, 
    focusWindow 
    // Additional hooks available but not currently used:
    // closeWindow,
    // updateWindowPosition,
    // updateWindowSize
  } = useWindow();
  
  // Agent state
  const [agentStates, setAgentStates] = useState<Record<AgentType, AgentState>>({
    [AgentType.MAIN_CHAT]: { active: true, busy: false },
    [AgentType.SCOUT]: { active: false, busy: false },
    [AgentType.DEV_WORKSPACE]: { active: false, busy: false },
    [AgentType.MCP]: { active: false, busy: false }
  });

  // Update agent state
  const updateAgentState = (agentType: AgentType, update: Partial<AgentState>) => {
    setAgentStates(prev => ({
      ...prev,
      [agentType]: {
        ...prev[agentType],
        ...update
      }
    }));
  };

  // Listen for agent events
  useEffect(() => {
    // Listen for agent state updates
    const handleAgentStateUpdate = (data: any) => {
      const { agentType, state } = data;
      if (agentType && state) {
        updateAgentState(agentType as AgentType, state);
      }
    };

    // Listen for agent window requests
    const handleAgentWindowRequest = (data: any) => {
      const { agentType, windowProps } = data;
      
      switch (agentType) {
        case AgentType.MAIN_CHAT:
          createMainChatWindow(windowProps);
          break;
        case AgentType.SCOUT:
          createScoutWindow(windowProps);
          break;
        case AgentType.DEV_WORKSPACE:
          createDevWorkspaceWindow(windowProps);
          break;
        case AgentType.MCP:
          createMCPWindow(windowProps);
          break;
      }
    };

    // Listen for agent errors
    const handleAgentError = (data: any) => {
      const { agentType, message } = data;
      if (agentType) {
        updateAgentState(agentType as AgentType, { 
          error: true, 
          errorMessage: message || 'Unknown error occurred'
        });
      }
    };

    // Listen for scout workflow progress
    const handleScoutWorkflowProgress = (data: any) => {
      const { stage, message, progress } = data;
      
      updateAgentState(AgentType.SCOUT, {
        active: true,
        busy: stage !== 'complete',
        workflowStage: stage,
        currentTask: message,
        progress
      });

      // Find and update Scout window if it exists
      const scoutWindow = windows.find(w => 
        w.content.type === 'MamaBearScout' || 
        (typeof w.content === 'string' && w.content === 'MamaBearScout')
      );

      if (scoutWindow) {
        updateWindowContent(scoutWindow.id, {
          type: 'MamaBearScout',
          props: {
            stage,
            message,
            progress,
            data: data.data
          }
        });
      } else {
        // Create a Scout window if one doesn't exist
        createScoutWindow({
          stage,
          message,
          progress,
          data: data.data
        });
      }
    };

    // Register event listeners
    agentSocketService.on('agent_state_update', handleAgentStateUpdate);
    agentSocketService.on('agent_window_request', handleAgentWindowRequest);
    agentSocketService.on('agent_error', handleAgentError);
    agentSocketService.on('scout_workflow_progress', handleScoutWorkflowProgress);

    // Cleanup listeners on unmount
    return () => {
      agentSocketService.removeListener('agent_state_update', handleAgentStateUpdate);
      agentSocketService.removeListener('agent_window_request', handleAgentWindowRequest);
      agentSocketService.removeListener('agent_error', handleAgentError);
      agentSocketService.removeListener('scout_workflow_progress', handleScoutWorkflowProgress);
    };
  }, [createWindow, updateWindowContent, windows]);

  // Create Main Chat Window
  const createMainChatWindow = (props = {}) => {
    // Check if a Main Chat window already exists
    const existingWindow = windows.find(w => 
      w.content.type === 'MamaBearMainChat' || 
      (typeof w.content === 'string' && w.content === 'MamaBearMainChat')
    );

    if (existingWindow) {
      // Focus existing window
      focusWindow(existingWindow.id);
      return existingWindow.id;
    }

    // Create new window
    return createWindow({
      title: 'Mama Bear Chat',
      type: WindowType.CHAT,
      position: { x: 50, y: 50 },
      size: { width: 800, height: 600 },
      content: {
        type: 'MamaBearMainChat',
        props: {
          ...props,
          agentType: AgentType.MAIN_CHAT,
          agentState: agentStates[AgentType.MAIN_CHAT],
          updateAgentState: (update: Partial<AgentState>) => 
            updateAgentState(AgentType.MAIN_CHAT, update)
        }
      }
    });
  };

  // Create Scout Window
  const createScoutWindow = (props: any = {}) => {
    // Check if a Scout window already exists
    const existingWindow = windows.find(w => 
      w.content.type === 'MamaBearScout' || 
      (typeof w.content === 'string' && w.content === 'MamaBearScout')
    );

    if (existingWindow) {
      // Focus existing window
      focusWindow(existingWindow.id);
      return existingWindow.id;
    }

    // Create new window
    return createWindow({
      title: 'Mama Bear Scout',
      type: WindowType.WORKFLOW,
      position: { x: 100, y: 100 },
      size: { width: 900, height: 700 },
      content: {
        type: 'MamaBearScout',
        props: {
          ...props,
          agentType: AgentType.SCOUT,
          agentState: agentStates[AgentType.SCOUT],
          updateAgentState: (update: Partial<AgentState>) => 
            updateAgentState(AgentType.SCOUT, update)
        }
      }
    });
  };

  // Create Dev Workspace Window
  const createDevWorkspaceWindow = (props: any = {}) => {
    // Check if a Dev Workspace window already exists
    const existingWindow = windows.find(w => 
      w.content.type === 'MamaBearDevWorkspace' || 
      (typeof w.content === 'string' && w.content === 'MamaBearDevWorkspace')
    );

    if (existingWindow) {
      // Focus existing window
      focusWindow(existingWindow.id);
      return existingWindow.id;
    }

    // Create new window
    return createWindow({
      title: 'Dev Workspace',
      type: WindowType.CODE,
      position: { x: 150, y: 150 },
      size: { width: 1000, height: 800 },
      content: {
        type: 'MamaBearDevWorkspace',
        props: {
          ...props,
          agentType: AgentType.DEV_WORKSPACE,
          agentState: agentStates[AgentType.DEV_WORKSPACE],
          updateAgentState: (update: Partial<AgentState>) => 
            updateAgentState(AgentType.DEV_WORKSPACE, update)
        }
      }
    });
  };

  // Create MCP Window
  const createMCPWindow = (props = {}) => {
    // Check if an MCP window already exists
    const existingWindow = windows.find(w => 
      w.content.type === 'MamaBearMCP' || 
      (typeof w.content === 'string' && w.content === 'MamaBearMCP')
    );

    if (existingWindow) {
      // Focus existing window
      focusWindow(existingWindow.id);
      return existingWindow.id;
    }
    
    // Create new window
    return createWindow({
      title: 'MCP Marketplace',
      type: WindowType.RESOURCE,
      position: { x: 200, y: 200 },
      size: { width: 800, height: 600 },
      content: {
        type: 'MamaBearMCP',
        props: {
          ...props,
          agentType: AgentType.MCP,
          agentState: agentStates[AgentType.MCP],
          updateAgentState: (update: Partial<AgentState>) => 
            updateAgentState(AgentType.MCP, update)
        }
      }
    });
  };

  // Request model usage data on mount
  useEffect(() => {
    agentSocketService.requestModelUsage();
  }, []);

  // This component doesn't render anything directly
  return null;
};

// Export the AgentContext for use in other components
export const useAgentState = () => {
  // This is a placeholder - we'll implement a proper context in a separate file
  // if needed for broader state sharing
  return {
    agentStates: {},
    updateAgentState: () => {}
  };
};

export default AgentWindowBridge;