import React from 'react';
import { 
  Workflow, 
  WorkflowTask, 
  TaskStatus, 
  WorkflowStage 
} from '../ScoutWorkflowContext';
import './StageTimeline.css';

interface StageTimelineProps {
  workflow: Workflow;
  onTaskExpand: (taskId: string) => void;
  expandedTaskId: string | null;
  onTaskStatusChange: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  filterTasks: (tasks: WorkflowTask[]) => WorkflowTask[];
}

/**
 * StageTimeline - Displays workflow stages and tasks in a timeline view
 */
const StageTimeline: React.FC<StageTimelineProps> = ({
  workflow,
  onTaskExpand,
  expandedTaskId,
  onTaskStatusChange,
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

  // Get status icon based on task status
  const getStatusIcon = (status: TaskStatus): JSX.Element => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return (
          <svg className="status-icon completed" viewBox="0 0 24 24" width="18" height="18">
            <path 
              fill="currentColor" 
              d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
            />
          </svg>
        );
      case TaskStatus.IN_PROGRESS:
        return (
          <svg className="status-icon in-progress" viewBox="0 0 24 24" width="18" height="18">
            <path 
              fill="currentColor" 
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            />
            <path 
              fill="currentColor" 
              d="M12 5v7l5.17 3.1.83-1.39-4.5-2.71V5H12z"
            />
          </svg>
        );
      case TaskStatus.FAILED:
        return (
          <svg className="status-icon failed" viewBox="0 0 24 24" width="18" height="18">
            <path 
              fill="currentColor" 
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            />
            <path 
              fill="currentColor" 
              d="M13 7h-2v6h2V7zm0 8h-2v2h2v-2z"
            />
          </svg>
        );
      default: // PENDING
        return (
          <svg className="status-icon pending" viewBox="0 0 24 24" width="18" height="18">
            <path 
              fill="currentColor" 
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            />
          </svg>
        );
    }
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

  return (
    <div className="stage-timeline">
      <div className="timeline-header">
        <div className="timeline-stage-markers">
          {workflow.stages.map((stage, index) => (
            <div 
              key={stage.id}
              className={`timeline-stage-marker ${stage.id === workflow.currentStage ? 'current' : ''}`}
            >
              <div className="marker-indicator"></div>
              <div className="marker-label">{stage.title}</div>
              {index < workflow.stages.length - 1 && (
                <div className={`stage-connector ${
                  index < workflow.stages.findIndex(s => s.id === workflow.currentStage) ? 'completed' : ''
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="timeline-content">
        {workflow.stages.map((stage) => {
          const filteredTasks = filterTasks(stage.tasks);
          
          if (filteredTasks.length === 0) return null;
          
          return (
            <div key={stage.id} className="timeline-stage">
              <div className="timeline-stage-header">
                <h3>{stage.title}</h3>
                <div className="stage-task-count">
                  {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              <div className="timeline-tasks">
                {filteredTasks.map((task) => (
                  <div 
                    key={task.id}
                    className={`timeline-task ${task.status.toLowerCase()} ${
                      expandedTaskId === task.id ? 'expanded' : ''
                    }`}
                  >
                    <div 
                      className="timeline-task-header"
                      onClick={() => onTaskExpand(task.id)}
                    >
                      <div 
                        className="task-status-toggle"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusToggle(task);
                        }}
                      >
                        {getStatusIcon(task.status)}
                      </div>
                      
                      <div className="task-info">
                        <h4 className="task-title">{task.title}</h4>
                        <div className="task-meta">
                          <span className="task-date">Created: {formatDate(task.createdAt)}</span>
                          {task.resources && task.resources.length > 0 && (
                            <span className="task-resources">
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
                              {task.resources.length} resource{task.resources.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="task-expand-toggle">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                          <path 
                            fill="currentColor"
                            d={expandedTaskId === task.id 
                              ? "M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"
                              : "M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"
                            }
                          />
                        </svg>
                      </div>
                    </div>
                    
                    {expandedTaskId === task.id && (
                      <div className="timeline-task-details">
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
                            className={`status-button ${task.status.toLowerCase()}`}
                            onClick={() => handleStatusToggle(task)}
                          >
                            {task.status === TaskStatus.PENDING && 'Start Task'}
                            {task.status === TaskStatus.IN_PROGRESS && 'Complete Task'}
                            {task.status === TaskStatus.COMPLETED && 'Reopen Task'}
                            {task.status === TaskStatus.FAILED && 'Retry Task'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StageTimeline;