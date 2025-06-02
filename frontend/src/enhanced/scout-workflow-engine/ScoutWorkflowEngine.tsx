import React, { useState, useEffect } from 'react';
import { 
  useWorkflow, 
  WorkflowStage, 
  TaskStatus, 
  WorkflowTask 
} from './ScoutWorkflowContext';
import './ScoutWorkflowEngine.css';
import StageTimeline from './components/StageTimeline';
import TaskBoard from './components/TaskBoard';
import ResourcePanel from './components/ResourcePanel';
import ActionPanel from './components/ActionPanel';

/**
 * ScoutWorkflowEngine - Main component for the Scout Agent's 4-stage workflow
 * Provides a visual interface for research, planning, execution, and review stages
 */
const ScoutWorkflowEngine: React.FC = () => {
  const {
    activeWorkflow,
    isLoading,
    error,
    createWorkflow,
    loadWorkflows,
    selectWorkflow,
    workflows,
    addTask,
    updateTask,
    deleteTask,
    advanceToNextStage,
    setWorkflowStage,
    createWorkspace
  } = useWorkflow();

  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'board' | 'timeline'>('board');
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [newTaskStage, setNewTaskStage] = useState<WorkflowStage>(WorkflowStage.RESEARCH);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  
  // Calculate progress statistics
  const calculateProgress = () => {
    if (!activeWorkflow) return { total: 0, completed: 0, percentage: 0 };
    
    let totalTasks = 0;
    let completedTasks = 0;
    
    activeWorkflow.stages.forEach(stage => {
      totalTasks += stage.tasks.length;
      completedTasks += stage.tasks.filter(
        task => task.status === TaskStatus.COMPLETED
      ).length;
    });
    
    const percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    
    return { total: totalTasks, completed: completedTasks, percentage };
  };
  
  const progress = calculateProgress();
  
  // Handle task expansion toggle
  const handleTaskExpand = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };
  
  // Handle task status change
  const handleTaskStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };
  
  // Handle creating a new task
  const handleCreateTask = async (task: Omit<WorkflowTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addTask(task);
      setIsCreateTaskModalOpen(false);
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };
  
  // Handle advancing to next stage
  const handleAdvanceStage = async () => {
    try {
      await advanceToNextStage();
    } catch (err) {
      console.error('Failed to advance stage:', err);
    }
  };
  
  // Handle creating a workspace for a task
  const handleCreateWorkspace = async (taskId: string) => {
    if (!activeWorkflow) return;
    
    // Find the task
    let task: WorkflowTask | null = null;
    
    for (const stage of activeWorkflow.stages) {
      const foundTask = stage.tasks.find(t => t.id === taskId);
      if (foundTask) {
        task = foundTask;
        break;
      }
    }
    
    if (!task) return;
    
    try {
      const { id } = await createWorkspace(task.title, [taskId]);
      console.log(`Created workspace ${id} for task ${taskId}`);
      
      // Update task with workspace reference
      await updateTask(taskId, {
        metadata: {
          ...(task.metadata || {}),
          workspaceId: id
        }
      });
    } catch (err) {
      console.error('Failed to create workspace:', err);
    }
  };
  
  // Filter tasks based on search term
  const filterTasks = (tasks: WorkflowTask[]): WorkflowTask[] => {
    if (!searchTerm.trim()) return tasks;
    
    const term = searchTerm.toLowerCase();
    return tasks.filter(
      task => 
        task.title.toLowerCase().includes(term) || 
        task.description.toLowerCase().includes(term)
    );
  };
  
  // Create a new workflow if none exists
  useEffect(() => {
    if (!isLoading && workflows.length === 0) {
      createWorkflow('New Scout Workflow', 'Scout Agent workflow for research and development');
    }
  }, [isLoading, workflows, createWorkflow]);

  // Show loading state
  if (isLoading && !activeWorkflow) {
    return (
      <div className="scout-workflow-loading">
        <div className="loading-spinner"></div>
        <p>Loading Scout workflow engine...</p>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="scout-workflow-error">
        <h3>Error loading workflow</h3>
        <p>{error.message}</p>
        <button onClick={() => loadWorkflows()}>Retry</button>
      </div>
    );
  }
  
  // Show empty state if no workflow is active
  if (!activeWorkflow) {
    return (
      <div className="scout-workflow-empty">
        <h3>No active workflow</h3>
        <p>Select a workflow or create a new one to begin</p>
        <div className="workflow-actions">
          {workflows.length > 0 && (
            <div className="workflow-list">
              <h4>Select a workflow:</h4>
              {workflows.map(workflow => (
                <button 
                  key={workflow.id}
                  onClick={() => selectWorkflow(workflow.id)}
                  className="workflow-select-button"
                >
                  {workflow.name}
                </button>
              ))}
            </div>
          )}
          <button 
            onClick={() => createWorkflow('New Scout Workflow', 'Scout Agent workflow for research and development')}
            className="create-workflow-button"
          >
            Create New Workflow
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="scout-workflow-engine">
      <div className="scout-workflow-header">
        <div className="workflow-title-section">
          <h2 className="workflow-title">{activeWorkflow.name}</h2>
          <p className="workflow-description">{activeWorkflow.description}</p>
        </div>
        
        <div className="workflow-progress">
          <div className="progress-stats">
            <span>{progress.completed}/{progress.total} tasks completed</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="workflow-stage-indicator">
            <span>Current Stage:</span>
            <strong>
              {activeWorkflow.stages.find(stage => stage.id === activeWorkflow.currentStage)?.title}
            </strong>
          </div>
        </div>
        
        <div className="workflow-actions">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="search-button">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>
          
          <div className="view-toggle">
            <button 
              className={`view-toggle-button ${viewMode === 'board' ? 'active' : ''}`}
              onClick={() => setViewMode('board')}
              aria-label="Board view"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              Board
            </button>
            <button 
              className={`view-toggle-button ${viewMode === 'timeline' ? 'active' : ''}`}
              onClick={() => setViewMode('timeline')}
              aria-label="Timeline view"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="20" x2="12" y2="10"></line>
                <line x1="18" y1="20" x2="18" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="16"></line>
              </svg>
              Timeline
            </button>
          </div>
          
          <button 
            className="add-task-button"
            onClick={() => {
              setNewTaskStage(activeWorkflow.currentStage);
              setIsCreateTaskModalOpen(true);
            }}
            aria-label="Add task"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Task
          </button>
          
          <button 
            className="next-stage-button"
            onClick={handleAdvanceStage}
            disabled={activeWorkflow.currentStage === WorkflowStage.REVIEW}
          >
            Advance to Next Stage
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="scout-workflow-content">
        <div className={`scout-workflow-main ${isPanelExpanded ? 'panel-expanded' : ''}`}>
          {viewMode === 'board' ? (
            <TaskBoard
              stages={activeWorkflow.stages}
              currentStage={activeWorkflow.currentStage}
              onTaskExpand={handleTaskExpand}
              expandedTaskId={expandedTaskId}
              onTaskStatusChange={handleTaskStatusChange}
              onTaskDelete={deleteTask}
              onSetStage={setWorkflowStage}
              onCreateWorkspace={handleCreateWorkspace}
              filterTasks={filterTasks}
            />
          ) : (
            <StageTimeline
              workflow={activeWorkflow}
              onTaskExpand={handleTaskExpand}
              expandedTaskId={expandedTaskId}
              onTaskStatusChange={handleTaskStatusChange}
              filterTasks={filterTasks}
            />
          )}
        </div>
        
        <div className={`scout-workflow-panel ${isPanelExpanded ? 'expanded' : 'collapsed'}`}>
          <div 
            className="panel-toggle"
            onClick={() => setIsPanelExpanded(!isPanelExpanded)}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              {isPanelExpanded ? (
                <>
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </>
              ) : (
                <>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </>
              )}
            </svg>
          </div>
          
          {expandedTaskId ? (
            <ResourcePanel
              taskId={expandedTaskId}
              onClose={() => setExpandedTaskId(null)}
            />
          ) : (
            <ActionPanel
              currentStage={activeWorkflow.currentStage}
              onCreateTask={() => {
                setNewTaskStage(activeWorkflow.currentStage);
                setIsCreateTaskModalOpen(true);
              }}
              onAdvanceStage={handleAdvanceStage}
            />
          )}
        </div>
      </div>
      
      {isCreateTaskModalOpen && (
        <div className="create-task-modal">
          <div className="modal-content">
            <h3>Create New Task</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleCreateTask({
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                status: TaskStatus.PENDING,
                stageId: newTaskStage
              });
            }}>
              <div className="form-group">
                <label htmlFor="task-title">Title</label>
                <input 
                  type="text" 
                  id="task-title"
                  name="title"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="task-description">Description</label>
                <textarea 
                  id="task-description"
                  name="description"
                  rows={4}
                  required
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="task-stage">Stage</label>
                <select 
                  id="task-stage"
                  value={newTaskStage}
                  onChange={(e) => setNewTaskStage(e.target.value as WorkflowStage)}
                >
                  {activeWorkflow.stages.map(stage => (
                    <option key={stage.id} value={stage.id}>
                      {stage.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setIsCreateTaskModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoutWorkflowEngine;