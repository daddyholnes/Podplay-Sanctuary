import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSocket } from '../../contexts/SocketContext';

// Define workflow stages
export enum WorkflowStage {
  RESEARCH = 'research',
  PLANNING = 'planning',
  EXECUTION = 'execution',
  REVIEW = 'review'
}

// Define workflow task status
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// Interface for task objects
export interface WorkflowTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  stageId: WorkflowStage;
  dependencies?: string[]; // IDs of tasks that must be completed before this one
  resources?: {
    type: 'file' | 'link' | 'note' | 'code';
    name: string;
    path?: string;
    url?: string;
    content?: string;
  }[];
  metadata?: Record<string, any>;
}

// Interface for workflow stages
export interface WorkflowStageData {
  id: WorkflowStage;
  title: string;
  description: string;
  order: number;
  tasks: WorkflowTask[];
  completionCriteria?: {
    type: 'all_tasks' | 'percentage' | 'manual';
    value?: number; // For percentage
  };
}

// Interface for the entire workflow
export interface Workflow {
  id: string;
  name: string;
  description: string;
  currentStage: WorkflowStage;
  stages: WorkflowStageData[];
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

// Context state interface
interface WorkflowContextState {
  workflows: Workflow[];
  activeWorkflow: Workflow | null;
  isLoading: boolean;
  error: Error | null;
  
  // Workflow operations
  createWorkflow: (name: string, description: string) => Promise<Workflow>;
  loadWorkflows: () => Promise<void>;
  selectWorkflow: (workflowId: string) => Promise<void>;
  deleteWorkflow: (workflowId: string) => Promise<void>;
  
  // Stage operations
  advanceToNextStage: () => Promise<void>;
  setWorkflowStage: (stageId: WorkflowStage) => Promise<void>;
  
  // Task operations
  addTask: (task: Omit<WorkflowTask, 'id' | 'createdAt' | 'updatedAt'>) => Promise<WorkflowTask>;
  updateTask: (taskId: string, updates: Partial<WorkflowTask>) => Promise<WorkflowTask>;
  deleteTask: (taskId: string) => Promise<void>;
  
  // Workspace integration
  createWorkspace: (name: string, relatedTaskIds: string[]) => Promise<{ id: string }>;
  
  // Resource operations
  addResource: (
    taskId: string,
    resource: {
      type: 'file' | 'link' | 'note' | 'code';
      name: string;
      path?: string;
      url?: string;
      content?: string;
    }
  ) => Promise<void>;
}

// Create the context
const WorkflowContext = createContext<WorkflowContextState | undefined>(undefined);

// Default 4-stage workflow template
const createDefaultWorkflow = (id: string, name: string, description: string): Workflow => {
  const now = new Date().toISOString();
  
  return {
    id,
    name,
    description,
    currentStage: WorkflowStage.RESEARCH,
    createdAt: now,
    updatedAt: now,
    stages: [
      {
        id: WorkflowStage.RESEARCH,
        title: 'Research',
        description: 'Gather information and resources relevant to the task',
        order: 1,
        tasks: [],
        completionCriteria: {
          type: 'all_tasks'
        }
      },
      {
        id: WorkflowStage.PLANNING,
        title: 'Planning',
        description: 'Organize findings and create a structured approach',
        order: 2,
        tasks: [],
        completionCriteria: {
          type: 'all_tasks'
        }
      },
      {
        id: WorkflowStage.EXECUTION,
        title: 'Execution',
        description: 'Implement the plan and create necessary artifacts',
        order: 3,
        tasks: [],
        completionCriteria: {
          type: 'all_tasks'
        }
      },
      {
        id: WorkflowStage.REVIEW,
        title: 'Review',
        description: 'Evaluate results and refine as needed',
        order: 4,
        tasks: [],
        completionCriteria: {
          type: 'all_tasks'
        }
      }
    ]
  };
};

// Provider component
export const WorkflowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [activeWorkflow, setActiveWorkflow] = useState<Workflow | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { socket, isConnected } = useSocket();
  
  // Socket event handlers
  useEffect(() => {
    if (!socket || !isConnected) return;
    
    // Listen for workflow updates
    socket.on('workflow:updated', (updatedWorkflow: Workflow) => {
      setWorkflows(prev => 
        prev.map(wf => wf.id === updatedWorkflow.id ? updatedWorkflow : wf)
      );
      
      if (activeWorkflow?.id === updatedWorkflow.id) {
        setActiveWorkflow(updatedWorkflow);
      }
    });
    
    // Listen for new tasks
    socket.on('workflow:task:created', (newTask: WorkflowTask, workflowId: string) => {
      setWorkflows(prev => 
        prev.map(wf => {
          if (wf.id !== workflowId) return wf;
          
          return {
            ...wf,
            stages: wf.stages.map(stage => {
              if (stage.id !== newTask.stageId) return stage;
              
              return {
                ...stage,
                tasks: [...stage.tasks, newTask]
              };
            })
          };
        })
      );
      
      if (activeWorkflow?.id === workflowId) {
        setActiveWorkflow(prev => {
          if (!prev) return null;
          
          return {
            ...prev,
            stages: prev.stages.map(stage => {
              if (stage.id !== newTask.stageId) return stage;
              
              return {
                ...stage,
                tasks: [...stage.tasks, newTask]
              };
            })
          };
        });
      }
    });
    
    // Listen for task updates
    socket.on('workflow:task:updated', (updatedTask: WorkflowTask, workflowId: string) => {
      setWorkflows(prev => 
        prev.map(wf => {
          if (wf.id !== workflowId) return wf;
          
          return {
            ...wf,
            stages: wf.stages.map(stage => {
              if (stage.id !== updatedTask.stageId) return stage;
              
              return {
                ...stage,
                tasks: stage.tasks.map(task => 
                  task.id === updatedTask.id ? updatedTask : task
                )
              };
            })
          };
        })
      );
      
      if (activeWorkflow?.id === workflowId) {
        setActiveWorkflow(prev => {
          if (!prev) return null;
          
          return {
            ...prev,
            stages: prev.stages.map(stage => {
              if (stage.id !== updatedTask.stageId) return stage;
              
              return {
                ...stage,
                tasks: stage.tasks.map(task => 
                  task.id === updatedTask.id ? updatedTask : task
                )
              };
            })
          };
        });
      }
    });
    
    // Listen for task deletions
    socket.on('workflow:task:deleted', (taskId: string, stageId: WorkflowStage, workflowId: string) => {
      setWorkflows(prev => 
        prev.map(wf => {
          if (wf.id !== workflowId) return wf;
          
          return {
            ...wf,
            stages: wf.stages.map(stage => {
              if (stage.id !== stageId) return stage;
              
              return {
                ...stage,
                tasks: stage.tasks.filter(task => task.id !== taskId)
              };
            })
          };
        })
      );
      
      if (activeWorkflow?.id === workflowId) {
        setActiveWorkflow(prev => {
          if (!prev) return null;
          
          return {
            ...prev,
            stages: prev.stages.map(stage => {
              if (stage.id !== stageId) return stage;
              
              return {
                ...stage,
                tasks: stage.tasks.filter(task => task.id !== taskId)
              };
            })
          };
        });
      }
    });
    
    return () => {
      socket.off('workflow:updated');
      socket.off('workflow:task:created');
      socket.off('workflow:task:updated');
      socket.off('workflow:task:deleted');
    };
  }, [socket, isConnected, activeWorkflow]);
  
  // Load workflows from API
  const loadWorkflows = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Replace with actual API call once available
      const mockWorkflows: Workflow[] = [
        createDefaultWorkflow('workflow-1', 'Project Research', 'Initial research for new project'),
        createDefaultWorkflow('workflow-2', 'Feature Implementation', 'Plan and implement new feature')
      ];
      
      // Add some mock tasks
      mockWorkflows[0].stages[0].tasks = [
        {
          id: 'task-1',
          title: 'Gather requirements',
          description: 'Collect all project requirements and constraints',
          status: TaskStatus.COMPLETED,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          stageId: WorkflowStage.RESEARCH
        },
        {
          id: 'task-2',
          title: 'Explore existing solutions',
          description: 'Research similar implementations and best practices',
          status: TaskStatus.IN_PROGRESS,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          stageId: WorkflowStage.RESEARCH
        }
      ];
      
      setWorkflows(mockWorkflows);
    } catch (err) {
      console.error('Failed to load workflows:', err);
      setError(err instanceof Error ? err : new Error('Failed to load workflows'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a new workflow
  const createWorkflow = async (name: string, description: string): Promise<Workflow> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Replace with actual API call once available
      const newId = `workflow-${Date.now()}`;
      const newWorkflow = createDefaultWorkflow(newId, name, description);
      
      setWorkflows(prev => [...prev, newWorkflow]);
      
      // Set as active workflow
      setActiveWorkflow(newWorkflow);
      
      return newWorkflow;
    } catch (err) {
      console.error('Failed to create workflow:', err);
      const error = err instanceof Error ? err : new Error('Failed to create workflow');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Select a workflow
  const selectWorkflow = async (workflowId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const workflow = workflows.find(wf => wf.id === workflowId);
      
      if (!workflow) {
        throw new Error(`Workflow with ID ${workflowId} not found`);
      }
      
      setActiveWorkflow(workflow);
    } catch (err) {
      console.error('Failed to select workflow:', err);
      setError(err instanceof Error ? err : new Error('Failed to select workflow'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete a workflow
  const deleteWorkflow = async (workflowId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Replace with actual API call once available
      setWorkflows(prev => prev.filter(wf => wf.id !== workflowId));
      
      // Clear active workflow if it was deleted
      if (activeWorkflow?.id === workflowId) {
        setActiveWorkflow(null);
      }
    } catch (err) {
      console.error('Failed to delete workflow:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete workflow'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Advance to the next stage
  const advanceToNextStage = async (): Promise<void> => {
    if (!activeWorkflow) {
      throw new Error('No active workflow');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get current stage index
      const currentStageIndex = activeWorkflow.stages.findIndex(
        stage => stage.id === activeWorkflow.currentStage
      );
      
      // Check if there's a next stage
      if (currentStageIndex < activeWorkflow.stages.length - 1) {
        const nextStage = activeWorkflow.stages[currentStageIndex + 1];
        
        // Update current stage
        const updatedWorkflow = {
          ...activeWorkflow,
          currentStage: nextStage.id,
          updatedAt: new Date().toISOString()
        };
        
        setActiveWorkflow(updatedWorkflow);
        
        // Update in workflows list
        setWorkflows(prev => 
          prev.map(wf => wf.id === updatedWorkflow.id ? updatedWorkflow : wf)
        );
        
        // Emit socket event if connected
        if (socket && isConnected) {
          socket.emit('workflow:update', updatedWorkflow);
        }
      } else {
        throw new Error('Already at the final stage');
      }
    } catch (err) {
      console.error('Failed to advance stage:', err);
      setError(err instanceof Error ? err : new Error('Failed to advance stage'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Set workflow to a specific stage
  const setWorkflowStage = async (stageId: WorkflowStage): Promise<void> => {
    if (!activeWorkflow) {
      throw new Error('No active workflow');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if stage exists
      const stageExists = activeWorkflow.stages.some(stage => stage.id === stageId);
      
      if (!stageExists) {
        throw new Error(`Stage ${stageId} does not exist in the workflow`);
      }
      
      // Update current stage
      const updatedWorkflow = {
        ...activeWorkflow,
        currentStage: stageId,
        updatedAt: new Date().toISOString()
      };
      
      setActiveWorkflow(updatedWorkflow);
      
      // Update in workflows list
      setWorkflows(prev => 
        prev.map(wf => wf.id === updatedWorkflow.id ? updatedWorkflow : wf)
      );
      
      // Emit socket event if connected
      if (socket && isConnected) {
        socket.emit('workflow:update', updatedWorkflow);
      }
    } catch (err) {
      console.error('Failed to set workflow stage:', err);
      setError(err instanceof Error ? err : new Error('Failed to set workflow stage'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add a task to the workflow
  const addTask = async (task: Omit<WorkflowTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkflowTask> => {
    if (!activeWorkflow) {
      throw new Error('No active workflow');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const now = new Date().toISOString();
      const newTask: WorkflowTask = {
        ...task,
        id: `task-${Date.now()}`,
        createdAt: now,
        updatedAt: now
      };
      
      // Update active workflow
      setActiveWorkflow(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          updatedAt: now,
          stages: prev.stages.map(stage => {
            if (stage.id !== task.stageId) return stage;
            
            return {
              ...stage,
              tasks: [...stage.tasks, newTask]
            };
          })
        };
      });
      
      // Update in workflows list
      setWorkflows(prev => 
        prev.map(wf => {
          if (wf.id !== activeWorkflow.id) return wf;
          
          return {
            ...wf,
            updatedAt: now,
            stages: wf.stages.map(stage => {
              if (stage.id !== task.stageId) return stage;
              
              return {
                ...stage,
                tasks: [...stage.tasks, newTask]
              };
            })
          };
        })
      );
      
      // Emit socket event if connected
      if (socket && isConnected) {
        socket.emit('workflow:task:create', newTask, activeWorkflow.id);
      }
      
      return newTask;
    } catch (err) {
      console.error('Failed to add task:', err);
      const error = err instanceof Error ? err : new Error('Failed to add task');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update a task
  const updateTask = async (taskId: string, updates: Partial<WorkflowTask>): Promise<WorkflowTask> => {
    if (!activeWorkflow) {
      throw new Error('No active workflow');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Find the task
      let foundTask: WorkflowTask | null = null;
      let stageId: WorkflowStage | null = null;
      
      for (const stage of activeWorkflow.stages) {
        const task = stage.tasks.find(t => t.id === taskId);
        if (task) {
          foundTask = task;
          stageId = stage.id;
          break;
        }
      }
      
      if (!foundTask || !stageId) {
        throw new Error(`Task with ID ${taskId} not found`);
      }
      
      // Create updated task
      const now = new Date().toISOString();
      const updatedTask: WorkflowTask = {
        ...foundTask,
        ...updates,
        updatedAt: now
      };
      
      // Handle stage change if needed
      const targetStageId = updates.stageId || stageId;
      
      // Update active workflow
      setActiveWorkflow(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          updatedAt: now,
          stages: prev.stages.map(stage => {
            // Remove from original stage
            if (stage.id === stageId) {
              return {
                ...stage,
                tasks: stage.tasks.filter(t => t.id !== taskId)
              };
            }
            
            // Add to target stage
            if (stage.id === targetStageId) {
              return {
                ...stage,
                tasks: [...stage.tasks, updatedTask]
              };
            }
            
            return stage;
          })
        };
      });
      
      // Update in workflows list
      setWorkflows(prev => 
        prev.map(wf => {
          if (wf.id !== activeWorkflow.id) return wf;
          
          return {
            ...wf,
            updatedAt: now,
            stages: wf.stages.map(stage => {
              // Remove from original stage
              if (stage.id === stageId) {
                return {
                  ...stage,
                  tasks: stage.tasks.filter(t => t.id !== taskId)
                };
              }
              
              // Add to target stage
              if (stage.id === targetStageId) {
                return {
                  ...stage,
                  tasks: [...stage.tasks, updatedTask]
                };
              }
              
              return stage;
            })
          };
        })
      );
      
      // Emit socket event if connected
      if (socket && isConnected) {
        socket.emit('workflow:task:update', updatedTask, activeWorkflow.id);
      }
      
      return updatedTask;
    } catch (err) {
      console.error('Failed to update task:', err);
      const error = err instanceof Error ? err : new Error('Failed to update task');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete a task
  const deleteTask = async (taskId: string): Promise<void> => {
    if (!activeWorkflow) {
      throw new Error('No active workflow');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Find the task's stage
      let stageId: WorkflowStage | null = null;
      
      for (const stage of activeWorkflow.stages) {
        const taskExists = stage.tasks.some(t => t.id === taskId);
        if (taskExists) {
          stageId = stage.id;
          break;
        }
      }
      
      if (!stageId) {
        throw new Error(`Task with ID ${taskId} not found`);
      }
      
      // Update active workflow
      const now = new Date().toISOString();
      
      setActiveWorkflow(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          updatedAt: now,
          stages: prev.stages.map(stage => {
            if (stage.id !== stageId) return stage;
            
            return {
              ...stage,
              tasks: stage.tasks.filter(t => t.id !== taskId)
            };
          })
        };
      });
      
      // Update in workflows list
      setWorkflows(prev => 
        prev.map(wf => {
          if (wf.id !== activeWorkflow.id) return wf;
          
          return {
            ...wf,
            updatedAt: now,
            stages: wf.stages.map(stage => {
              if (stage.id !== stageId) return stage;
              
              return {
                ...stage,
                tasks: stage.tasks.filter(t => t.id !== taskId)
              };
            })
          };
        })
      );
      
      // Emit socket event if connected
      if (socket && isConnected) {
        socket.emit('workflow:task:delete', taskId, stageId, activeWorkflow.id);
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete task'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a workspace for a set of tasks
  const createWorkspace = async (name: string, relatedTaskIds: string[]): Promise<{ id: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Replace with actual API call once available
      const workspaceId = `workspace-${Date.now()}`;
      
      // This would create a new workspace and link it to the tasks
      console.log(`Created workspace ${workspaceId} for tasks: ${relatedTaskIds.join(', ')}`);
      
      // Emit socket event if connected
      if (socket && isConnected) {
        socket.emit('workspace:create', { id: workspaceId, name, relatedTaskIds });
      }
      
      return { id: workspaceId };
    } catch (err) {
      console.error('Failed to create workspace:', err);
      const error = err instanceof Error ? err : new Error('Failed to create workspace');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add a resource to a task
  const addResource = async (
    taskId: string,
    resource: {
      type: 'file' | 'link' | 'note' | 'code';
      name: string;
      path?: string;
      url?: string;
      content?: string;
    }
  ): Promise<void> => {
    if (!activeWorkflow) {
      throw new Error('No active workflow');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Find the task
      let foundTask: WorkflowTask | null = null;
      let stageId: WorkflowStage | null = null;
      
      for (const stage of activeWorkflow.stages) {
        const task = stage.tasks.find(t => t.id === taskId);
        if (task) {
          foundTask = task;
          stageId = stage.id;
          break;
        }
      }
      
      if (!foundTask || !stageId) {
        throw new Error(`Task with ID ${taskId} not found`);
      }
      
      // Create updated task with new resource
      const now = new Date().toISOString();
      const updatedTask: WorkflowTask = {
        ...foundTask,
        updatedAt: now,
        resources: [...(foundTask.resources || []), resource]
      };
      
      // Update the task
      await updateTask(taskId, updatedTask);
    } catch (err) {
      console.error('Failed to add resource:', err);
      setError(err instanceof Error ? err : new Error('Failed to add resource'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load workflows on mount
  useEffect(() => {
    loadWorkflows();
  }, []);
  
  // Provide context value
  const contextValue: WorkflowContextState = {
    workflows,
    activeWorkflow,
    isLoading,
    error,
    createWorkflow,
    loadWorkflows,
    selectWorkflow,
    deleteWorkflow,
    advanceToNextStage,
    setWorkflowStage,
    addTask,
    updateTask,
    deleteTask,
    createWorkspace,
    addResource
  };
  
  return (
    <WorkflowContext.Provider value={contextValue}>
      {children}
    </WorkflowContext.Provider>
  );
};

// Custom hook for using the workflow context
export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  
  return context;
};