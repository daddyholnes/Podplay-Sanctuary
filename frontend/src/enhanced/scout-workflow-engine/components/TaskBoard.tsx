import React from 'react';
import { 
  WorkflowStageData, 
  WorkflowTask, 
  TaskStatus, 
  WorkflowStage 
} from '../ScoutWorkflowContext';
import './TaskBoard.css';

interface TaskBoardProps {
  stages: WorkflowStageData[];
  currentStage: WorkflowStage;
  onTaskExpand: (taskId: string) => void;
  expandedTaskId: string | null;
  onTaskStatusChange: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  onTaskDelete: (taskId: string) => Promise<void>;
  onSetStage: (stageId: WorkflowStage) => Promise<void>;
  onCreateWorkspace: (taskId: string) => Promise<void>;
  filterTasks: (tasks: WorkflowTask[]) => WorkflowTask[];
}

/**
 * TaskBoard - Displays workflow stages and tasks in a Kanban-style board
 */
const TaskBoard: React.FC<TaskBoardProps> = ({
  stages,
  currentStage,
  onTaskExpand,
  expandedTaskId,
  onTaskStatusChange,
  onTaskDelete,
  onSetStage,
  onCreateWorkspace,
  filterTasks
}) => {
  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  // Handle task status toggle
  const handleStatusToggle = async (task: WorkflowTask) => {
    let newStatus: TaskStatus;
    
    switch (task.status) {
      case TaskStatus.PENDING:
        newStatus = TaskStatus.IN_PROGRESS;
        break;
      case TaskStatus.IN_PROGRESS:
        newStatus = TaskStatus.COMPLETED;
        break;
      case TaskStatus.COMPLETED:
        newStatus = TaskStatus.PENDING;
        break;
      default:
        newStatus = TaskStatus.PENDING;
    }
    
    await onTaskStatusChange(task.id, newStatus);
  };

  // Handle moving a task to a different stage
  const handleMoveTask = async (task: WorkflowTask, targetStageId: WorkflowStage) => {
    if (task.stageId === targetStageId) return;
    
    try {
      await onTaskStatusChange(task.id, task.status);
      // This is a placeholder for the actual implementation
      // In a real implementation, we'd update the task's stage ID
      console.log(`Moving task ${task.id} from ${task.stageId} to ${targetStageId}`);
    } catch (err) {
      console.error('Failed to move task:', err);
    }
  };

  return (
    <div className="task-board">
      {stages.map((stage) => {
        const filteredTasks = filterTasks(stage.tasks);
        const isCurrentStage = stage.id === currentStage;
        
        return (
          <div 
            key={stage.id}
            className={`stage-column ${isCurrentStage ? 'current-stage' : ''}`}
          >
            <div className="stage-header">
              <h3>{stage.title}</h3>
              <div className="stage-task-count">
                {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
              </div>
              
              {!isCurrentStage && (
                <button 
                  className="set-active-stage-button"
                  onClick={() => onSetStage(stage.id)}
                  aria-label={`Set ${stage.title} as active stage`}
                >
                  Set Active
                </button>
              )}
            </div>
            
            <div className="stage-tasks">
              {filteredTasks.length === 0 ? (
                <div className="empty-stage">
                  <p>No tasks in this stage</p>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div 
                    key={task.id}
                    className={`task-card ${task.status.toLowerCase()} ${
                      expandedTaskId === task.id ? 'expanded' : ''
                    }`}
                  >
                    <div 
                      className="task-card-header"
                      onClick={() => onTaskExpand(task.id)}
                    >
                      <div className="task-status-badge">{task.status}</div>
                      <h4 className="task-title">{task.title}</h4>
                      <div className="task-meta">
                        <span className="task-date">
                          {formatDate(task.createdAt)}
                        </span>
                        {task.resources && task.resources.length > 0 && (
                          <span className="task-resources-count">
                            <svg viewBox="0 0 24 24" width="14" height="14">
                              <path 
                                fill="currentColor" 
                                d="M19 3H5c-1.11 0-2 .89-2 2v14c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 16H5V5h14v14z"
                              />
                              <path 
                                fill="currentColor" 
                                d="M7 7h10v2H7zm0 4h10v2H7zm0 4h7v2H7z"
                              />
                            </svg>
                            {task.resources.length}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {expandedTaskId === task.id && (
                      <div className="task-card-details">
                        <p className="task-description">{task.description}</p>
                        
                        {task.resources && task.resources.length > 0 && (
                          <div className="task-resources-list">
                            <h5>Resources</h5>
                            <ul>
                              {task.resources.map((resource, index) => (
                                <li key={index} className={`resource-item ${resource.type}`}>
                                  {resource.type === 'file' && (
                                    <svg viewBox="0 0 24 24" width="16" height="16">
                                      <path 
                                        fill="currentColor" 
                                        d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"
                                      />
                                    </svg>
                                  )}
                                  {resource.type === 'link' && (
                                    <svg viewBox="0 0 24 24" width="16" height="16">
                                      <path 
                                        fill="currentColor" 
                                        d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"
                                      />
                                    </svg>
                                  )}
                                  {resource.type === 'note' && (
                                    <svg viewBox="0 0 24 24" width="16" height="16">
                                      <path 
                                        fill="currentColor" 
                                        d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"
                                      />
                                    </svg>
                                  )}
                                  {resource.type === 'code' && (
                                    <svg viewBox="0 0 24 24" width="16" height="16">
                                      <path 
                                        fill="currentColor" 
                                        d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"
                                      />
                                    </svg>
                                  )}
                                  <span>{resource.name}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="task-actions">
                          <button 
                            className="create-workspace-button"
                            onClick={() => onCreateWorkspace(task.id)}
                          >
                            <svg viewBox="0 0 24 24" width="16" height="16">
                              <path 
                                fill="currentColor" 
                                d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"
                              />
                              <path 
                                fill="currentColor" 
                                d="M7 12h10v2H7zm2-5h6v2H9z"
                              />
                            </svg>
                            Create Workspace
                          </button>
                          
                          <button 
                            className={`status-button ${task.status.toLowerCase()}`}
                            onClick={() => handleStatusToggle(task)}
                          >
                            {task.status === TaskStatus.PENDING && 'Start Task'}
                            {task.status === TaskStatus.IN_PROGRESS && 'Complete Task'}
                            {task.status === TaskStatus.COMPLETED && 'Reopen Task'}
                            {task.status === TaskStatus.FAILED && 'Retry Task'}
                          </button>
                          
                          <button 
                            className="delete-task-button"
                            onClick={() => onTaskDelete(task.id)}
                          >
                            <svg viewBox="0 0 24 24" width="16" height="16">
                              <path 
                                fill="currentColor" 
                                d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                              />
                            </svg>
                            Delete
                          </button>
                        </div>
                        
                        <div className="move-task-options">
                          <span>Move to: </span>
                          <div className="stage-options">
                            {stages.map((targetStage) => {
                              if (targetStage.id === stage.id) return null;
                              
                              return (
                                <button 
                                  key={targetStage.id}
                                  className="move-to-stage-button"
                                  onClick={() => handleMoveTask(task, targetStage.id)}
                                >
                                  {targetStage.title}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskBoard;