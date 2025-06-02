import React, { useState } from 'react';
import './ActionPanel.css';

export type ActionType = 'system' | 'user' | 'agent' | 'workflow';

export interface Action {
  id: string;
  type: ActionType;
  title: string;
  description: string;
  icon?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  timestamp: Date;
  duration?: number; // in milliseconds
  result?: {
    success: boolean;
    message?: string;
    data?: any;
  };
}

interface ActionPanelProps {
  actions: Action[];
  onActionSelect?: (actionId: string) => void;
  onActionRetry?: (actionId: string) => void;
  onActionCancel?: (actionId: string) => void;
  onClearCompleted?: () => void;
}

/**
 * ActionPanel Component
 * 
 * Displays a list of system and user-triggered actions with their status, 
 * progress, and results. Part of the Scout Workflow Engine.
 */
const ActionPanel: React.FC<ActionPanelProps> = ({
  actions,
  onActionSelect,
  onActionRetry,
  onActionCancel,
  onClearCompleted
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<string[]>([]);
  
  // Toggle action details expansion
  const toggleExpand = (actionId: string) => {
    setExpanded(prev => 
      prev.includes(actionId) 
        ? prev.filter(id => id !== actionId) 
        : [...prev, actionId]
    );
  };
  
  // Filter actions based on current filter
  const filteredActions = actions.filter(action => {
    if (filter === 'all') return true;
    if (filter === 'completed') return action.status === 'completed';
    if (filter === 'in_progress') return action.status === 'in_progress' || action.status === 'pending';
    if (filter === 'failed') return action.status === 'failed';
    return action.type === filter;
  });
  
  // Format duration for display
  const formatDuration = (duration: number) => {
    if (duration < 1000) return `${duration}ms`;
    if (duration < 60000) return `${(duration / 1000).toFixed(1)}s`;
    return `${Math.floor(duration / 60000)}m ${Math.floor((duration % 60000) / 1000)}s`;
  };
  
  // Format timestamp for display
  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  
  // Get icon based on action type and status
  const getActionIcon = (action: Action) => {
    // Default icons based on type
    const typeIcons = {
      system: '🔧',
      user: '👤',
      agent: '🤖',
      workflow: '📋'
    };
    
    // Status-specific icons override type icons
    if (action.status === 'completed') return '✅';
    if (action.status === 'failed') return '❌';
    if (action.status === 'in_progress') return '⏳';
    
    // Use icon specified in action, or fall back to type icon
    return action.icon || typeIcons[action.type] || '▶️';
  };

  return (
    <div className="action-panel-container">
      <div className="action-panel-header">
        <h3>Action Log</h3>
        <div className="action-panel-controls">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="action-filter"
          >
            <option value="all">All Actions</option>
            <option value="system">System</option>
            <option value="user">User</option>
            <option value="agent">Agent</option>
            <option value="workflow">Workflow</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="failed">Failed</option>
          </select>
          
          <button 
            className="clear-completed-btn"
            onClick={onClearCompleted}
            title="Clear completed actions"
          >
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
            </svg>
            Clear
          </button>
        </div>
      </div>
      
      <div className="action-list">
        {filteredActions.length > 0 ? (
          filteredActions.map(action => (
            <div 
              key={action.id} 
              className={`action-item ${action.status} ${expanded.includes(action.id) ? 'expanded' : ''}`}
              onClick={() => {
                toggleExpand(action.id);
                if (onActionSelect) onActionSelect(action.id);
              }}
            >
              <div className="action-item-header">
                <div className="action-icon" title={action.type}>
                  {getActionIcon(action)}
                </div>
                <div className="action-title">
                  <span className="action-title-text">{action.title}</span>
                  <span className="action-status-badge">{action.status.replace('_', ' ')}</span>
                </div>
                <div className="action-timestamp" title={`Duration: ${action.duration ? formatDuration(action.duration) : 'ongoing'}`}>
                  {formatTime(action.timestamp)}
                </div>
              </div>
              
              {expanded.includes(action.id) && (
                <div className="action-details">
                  <p className="action-description">{action.description}</p>
                  
                  {action.duration && (
                    <div className="action-duration">
                      Duration: {formatDuration(action.duration)}
                    </div>
                  )}
                  
                  {action.result && (
                    <div className={`action-result ${action.result.success ? 'success' : 'error'}`}>
                      {action.result.message && (
                        <div className="result-message">{action.result.message}</div>
                      )}
                      {action.result.data && typeof action.result.data === 'object' && (
                        <pre className="result-data">{JSON.stringify(action.result.data, null, 2)}</pre>
                      )}
                    </div>
                  )}
                  
                  <div className="action-controls">
                    {action.status === 'failed' && onActionRetry && (
                      <button 
                        className="action-retry-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onActionRetry(action.id);
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16">
                          <path fill="currentColor" d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                        </svg>
                        Retry
                      </button>
                    )}
                    
                    {(action.status === 'pending' || action.status === 'in_progress') && onActionCancel && (
                      <button 
                        className="action-cancel-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onActionCancel(action.id);
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16">
                          <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                        </svg>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-actions">
            <p>No actions matching current filter</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionPanel;