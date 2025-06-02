import { useState, useEffect, useCallback } from 'react';
import { AgentType } from '../services/agent-communication/types';
import { PlanUpdate, FileUpdate, BaseUpdate } from '../types/workspace';

/**
 * Hook to get and subscribe to agent state updates
 */
export const useAgent = (agentType: AgentType = 'scout') => {
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [status, setStatus] = useState<'idle' | 'thinking' | 'working' | 'error'>('idle');
  
  useEffect(() => {
    // Simulate connection
    setIsConnected(true);
    
    // Simulate status changes
    const interval = setInterval(() => {
      const statuses: ('idle' | 'thinking' | 'working' | 'error')[] = ['idle', 'thinking', 'working'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      setStatus(randomStatus);
      setIsTyping(randomStatus === 'thinking');
    }, 5000);
    
    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [agentType]);

  // Add sendMessage function
  const sendMessage = useCallback((target: string, action: string, payload: any = {}) => {
    console.log(`Sending ${action} message to ${target} agent:`, payload);
    // This would typically call the API
    // For now, just return a mock response
    return Promise.resolve({
      id: Date.now().toString(),
      status: 'sent',
      timestamp: new Date().toISOString()
    });
  }, [agentType]);
  
  return { agentType, isConnected, isTyping, status, sendMessage };
};

/**
 * Hook to get and subscribe to plan updates
 */
export function usePlanUpdates(agentType: AgentType = 'scout'): [PlanUpdate[]] {
  const [planUpdates, setPlanUpdates] = useState<PlanUpdate[]>([]);

  useEffect(() => {
    // Initial demo data
    setPlanUpdates([
      {
        id: '1',
        type: 'plan_update',
        payload: {
          id: '1',
          steps: [{
            id: '1-1',
            title: 'Project Setup',
            description: 'Initialize project structure and dependencies',
            status: 'completed'
          }]
        },
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        type: 'plan_update',
        payload: {
          id: '2',
          steps: [{
            id: '2-1',
            title: 'Component Design',
            description: 'Design and implement key UI components',
            status: 'pending'
          }]
        },
        timestamp: new Date().toISOString()
      },
      {
        id: '3',
        type: 'plan_update',
        payload: {
          id: '3',
          steps: [{
            id: '3-1',
            title: 'API Integration',
            description: 'Connect frontend components to backend APIs',
            status: 'planning'
          }]
        },
        timestamp: new Date().toISOString()
      }
    ]);

    // Simulate updates
    const interval = setInterval(() => {
      setPlanUpdates(prev => {
        const update = { ...prev[1] };
        // Change the status of the step
        const newSteps = [...update.payload.steps];
        newSteps[0] = {
          ...newSteps[0],
          status: newSteps[0].status === 'pending' ? 'completed' : 'pending'
        };
        update.payload = {
          ...update.payload,
          steps: newSteps
        };
        return [prev[0], update, prev[2]];
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [agentType]);

  return [planUpdates];
};

/**
 * Hook to get and subscribe to file updates
 */
export function useFileUpdates(agentType: AgentType = 'scout'): [FileUpdate[]] {
  const [fileUpdates, setFileUpdates] = useState<FileUpdate[]>([]);

  useEffect(() => {
    // Initial demo data
    setFileUpdates([
      {
        id: '1',
        type: 'file_update',
        payload: {
          id: '1',
          name: 'package.json',
          type: 'json',
          status: 'completed'
        },
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        type: 'file_update',
        payload: {
          id: '2',
          name: 'components',
          type: 'folder',
          status: 'completed'
        },
        timestamp: new Date().toISOString()
      },
      {
        id: '3',
        type: 'file_update',
        payload: {
          id: '3',
          name: 'App.tsx',
          type: 'tsx',
          status: 'generating'
        },
        timestamp: new Date().toISOString()
      }
    ]);

    // Simulate file generation completion
    const timeout = setTimeout(() => {
      setFileUpdates(prev => {
        const newUpdates = [...prev];
        const index = newUpdates.findIndex(f => f.id === '3'); // Match string ID
        if (index !== -1) {
          newUpdates[index] = { 
            ...newUpdates[index], 
            payload: {
              ...newUpdates[index].payload,
              status: 'completed' 
            }
          };
        }
        return newUpdates;
      });
    }, 5000);

    return () => clearTimeout(timeout);
  }, [agentType]);

  return [fileUpdates];
};
