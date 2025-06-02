import React, { useState, useEffect } from 'react';
import { AgentType, AgentState } from '../agent-integration/AgentWindowBridge';
import { agentSocketService } from '../../services/agentSocketService';
import './MamaBearScout.css';

// Workflow stages
export enum ScoutWorkflowStage {
  WELCOME = 'welcome',
  PLANNING = 'planning',
  WORKSPACE = 'workspace',
  PRODUCTION = 'production',
  COMPLETE = 'complete'
}

interface WorkflowTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'complete' | 'error';
  startTime?: Date;
  endTime?: Date;
  output?: any;
}

interface MamaBearScoutProps {
  agentType: AgentType;
  agentState: AgentState;
  updateAgentState: (update: Partial<AgentState>) => void;
  stage?: string;
  message?: string;
  progress?: number;
  data?: any;
}

/**
 * MamaBearScout - Project implementation workflow agent
 * 
 * Handles the 4-stage workflow for autonomous project implementation:
 * 1. Welcome - Initial greeting and project scope definition
 * 2. Planning - Task breakdown and resource identification
 * 3. Workspace - File generation and development environment setup
 * 4. Production - Final compilation, testing, and deployment
 */
export const MamaBearScout: React.FC<MamaBearScoutProps> = ({
  agentType,
  agentState,
  updateAgentState,
  stage = ScoutWorkflowStage.WELCOME,
  message = '',
  progress = 0,
  data = {}
}) => {
  // State
  const [currentStage, setCurrentStage] = useState<ScoutWorkflowStage>(
    (stage as ScoutWorkflowStage) || ScoutWorkflowStage.WELCOME
  );
  const [workflowTasks, setWorkflowTasks] = useState<WorkflowTask[]>([]);
  const [projectName, setProjectName] = useState<string>(data?.projectName || 'New Project');
  const [projectDescription, setProjectDescription] = useState<string>(
    data?.projectDescription || ''
  );
  const [userInput, setUserInput] = useState<string>('');
  const [isInputActive, setIsInputActive] = useState<boolean>(currentStage === ScoutWorkflowStage.WELCOME);
  
  // Update state when props change
  useEffect(() => {
    if (stage) {
      setCurrentStage(stage as ScoutWorkflowStage);
      
      // Activate input on welcome stage
      setIsInputActive(stage === ScoutWorkflowStage.WELCOME);
    }
    
    // Update workflow tasks if provided in data
    if (data?.tasks) {
      setWorkflowTasks(data.tasks);
    }
    
    // Update project info if provided
    if (data?.projectName) {
      setProjectName(data.projectName);
    }
    
    if (data?.projectDescription) {
      setProjectDescription(data.projectDescription);
    }
  }, [stage, data]);
  
  // Send workflow response to server
  const sendWorkflowResponse = () => {
    if (!userInput.trim()) return;
    
    // Different behavior based on current stage
    switch (currentStage) {
      case ScoutWorkflowStage.WELCOME:
        // Send project details
        agentSocketService.sendScoutWorkflowEvent({
          stage: currentStage,
          action: 'submit_project',
          input: userInput,
          data: {
            projectName,
            projectDescription: userInput
          }
        });
        break;
        
      case ScoutWorkflowStage.PLANNING:
        // Send feedback on the plan
        agentSocketService.sendScoutWorkflowEvent({
          stage: currentStage,
          action: 'provide_feedback',
          input: userInput
        });
        break;
        
      case ScoutWorkflowStage.WORKSPACE:
        // Send guidance or feedback on workspace
        agentSocketService.sendScoutWorkflowEvent({
          stage: currentStage,
          action: 'workspace_input',
          input: userInput
        });
        break;
        
      case ScoutWorkflowStage.PRODUCTION:
        // Send production input
        agentSocketService.sendScoutWorkflowEvent({
          stage: currentStage,
          action: 'production_input',
          input: userInput
        });
        break;
        
      default:
        // Generic input
        agentSocketService.sendScoutWorkflowEvent({
          stage: currentStage,
          action: 'user_input',
          input: userInput
        });
    }
    
    // Clear input
    setUserInput('');
    
    // Disable input until agent responds
    setIsInputActive(false);
    
    // Update agent state
    updateAgentState({ busy: true });
  };
  
  // Handle input key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendWorkflowResponse();
    }
  };
  
  // Advance workflow to next stage
  const advanceWorkflow = () => {
    let nextStage: ScoutWorkflowStage;
    
    switch (currentStage) {
      case ScoutWorkflowStage.WELCOME:
        nextStage = ScoutWorkflowStage.PLANNING;
        break;
      case ScoutWorkflowStage.PLANNING:
        nextStage = ScoutWorkflowStage.WORKSPACE;
        break;
      case ScoutWorkflowStage.WORKSPACE:
        nextStage = ScoutWorkflowStage.PRODUCTION;
        break;
      case ScoutWorkflowStage.PRODUCTION:
        nextStage = ScoutWorkflowStage.COMPLETE;
        break;
      default:
        nextStage = currentStage;
    }
    
    agentSocketService.sendScoutWorkflowEvent({
      stage: currentStage,
      action: 'advance_stage',
      nextStage
    });
  };
  
  // Render task list for the current stage
  const renderTaskList = () => {
    const stageTasks = workflowTasks.filter(task => 
      (currentStage === ScoutWorkflowStage.PLANNING && task.id.startsWith('plan-')) ||
      (currentStage === ScoutWorkflowStage.WORKSPACE && task.id.startsWith('workspace-')) ||
      (currentStage === ScoutWorkflowStage.PRODUCTION && task.id.startsWith('production-'))
    );
    
    if (stageTasks.length === 0) {
      return (
        <div className="empty-tasks">
          <p>No tasks defined yet for this stage.</p>
        </div>
      );
    }
    
    return (
      <div className="task-list">
        {stageTasks.map(task => (
          <div key={task.id} className={`task-item ${task.status}`}>
            <div className="task-status-indicator"></div>
            <div className="task-content">
              <h4>{task.title}</h4>
              <p>{task.description}</p>
              {task.output && (
                <div className="task-output">
                  <pre>{typeof task.output === 'string' 
                    ? task.output 
                    : JSON.stringify(task.output, null, 2)}</pre>
                </div>
              )}
            </div>
            <div className="task-time">
              {task.startTime && (
                <span>Started: {new Date(task.startTime).toLocaleTimeString()}</span>
              )}
              {task.endTime && (
                <span>Completed: {new Date(task.endTime).toLocaleTimeString()}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Render different content based on the current stage
  const renderStageContent = () => {
    switch (currentStage) {
      case ScoutWorkflowStage.WELCOME:
        return (
          <div className="welcome-stage">
            <div className="welcome-message">
              <h2>Welcome to Mama Bear Scout</h2>
              <p>I'll help you build and implement your project step by step.</p>
              <p>Let's start by describing what you want to build:</p>
            </div>
            <div className="project-form">
              <div className="form-field">
                <label>Project Name</label>
                <input 
                  type="text" 
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                />
              </div>
              <div className="form-field">
                <label>Project Description</label>
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Describe your project in detail..."
                  rows={6}
                />
              </div>
              <button 
                className="primary-button"
                onClick={sendWorkflowResponse}
                disabled={!userInput.trim() || !projectName.trim()}
              >
                Start Project
              </button>
            </div>
          </div>
        );
        
      case ScoutWorkflowStage.PLANNING:
        return (
          <div className="planning-stage">
            <div className="stage-header">
              <h2>Planning: {projectName}</h2>
              <p>{projectDescription}</p>
              <div className="stage-progress">
                <div 
                  className="progress-bar" 
                  style={{ width: `${progress}%` }}
                ></div>
                <span>{Math.round(progress)}% complete</span>
              </div>
            </div>
            
            <div className="planning-content">
              {renderTaskList()}
              
              <div className="stage-message">
                <h3>Current Progress</h3>
                <p>{message || 'Analyzing project requirements and creating a plan...'}</p>
              </div>
            </div>
          </div>
        );
        
      case ScoutWorkflowStage.WORKSPACE:
        return (
          <div className="workspace-stage">
            <div className="stage-header">
              <h2>Workspace Setup: {projectName}</h2>
              <div className="stage-progress">
                <div 
                  className="progress-bar" 
                  style={{ width: `${progress}%` }}
                ></div>
                <span>{Math.round(progress)}% complete</span>
              </div>
            </div>
            
            <div className="workspace-content">
              <div className="workspace-panels">
                <div className="file-explorer">
                  <h3>Files</h3>
                  {data?.files ? (
                    <div className="file-tree">
                      {renderFileTree(data.files)}
                    </div>
                  ) : (
                    <p>No files generated yet</p>
                  )}
                </div>
                
                <div className="task-panel">
                  <h3>Tasks</h3>
                  {renderTaskList()}
                </div>
              </div>
              
              <div className="stage-message">
                <h3>Current Progress</h3>
                <p>{message || 'Setting up development environment and generating files...'}</p>
              </div>
            </div>
          </div>
        );
        
      case ScoutWorkflowStage.PRODUCTION:
        return (
          <div className="production-stage">
            <div className="stage-header">
              <h2>Production: {projectName}</h2>
              <div className="stage-progress">
                <div 
                  className="progress-bar" 
                  style={{ width: `${progress}%` }}
                ></div>
                <span>{Math.round(progress)}% complete</span>
              </div>
            </div>
            
            <div className="production-content">
              {data?.preview && (
                <div className="preview-panel">
                  <h3>Preview</h3>
                  <div className="preview-frame">
                    <iframe 
                      src={data.preview} 
                      title="Project Preview"
                      sandbox="allow-scripts allow-same-origin"
                    ></iframe>
                  </div>
                </div>
              )}
              
              <div className="task-panel">
                <h3>Deployment Tasks</h3>
                {renderTaskList()}
              </div>
              
              <div className="stage-message">
                <h3>Current Progress</h3>
                <p>{message || 'Finalizing project and preparing for deployment...'}</p>
              </div>
            </div>
          </div>
        );
        
      case ScoutWorkflowStage.COMPLETE:
        return (
          <div className="complete-stage">
            <div className="completion-message">
              <div className="completion-icon">✓</div>
              <h2>Project Complete!</h2>
              <p>{message || `${projectName} has been successfully built and deployed.`}</p>
            </div>
            
            <div className="completion-summary">
              <h3>Project Summary</h3>
              <div className="summary-item">
                <span>Project Name:</span>
                <strong>{projectName}</strong>
              </div>
              <div className="summary-item">
                <span>Description:</span>
                <p>{projectDescription}</p>
              </div>
              
              {data?.deploymentUrl && (
                <div className="summary-item">
                  <span>Deployment URL:</span>
                  <a 
                    href={data.deploymentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {data.deploymentUrl}
                  </a>
                </div>
              )}
              
              {data?.repositoryUrl && (
                <div className="summary-item">
                  <span>Repository URL:</span>
                  <a 
                    href={data.repositoryUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {data.repositoryUrl}
                  </a>
                </div>
              )}
              
              <button 
                className="primary-button"
                onClick={() => {
                  // Reset workflow to start a new project
                  agentSocketService.sendScoutWorkflowEvent({
                    action: 'reset_workflow'
                  });
                }}
              >
                Start New Project
              </button>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="unknown-stage">
            <p>Unknown workflow stage: {currentStage}</p>
          </div>
        );
    }
  };
  
  // Helper to render file tree recursively
  const renderFileTree = (files: any) => {
    if (!files || Object.keys(files).length === 0) {
      return <p>No files available</p>;
    }
    
    return (
      <ul className="file-list">
        {Object.entries(files).map(([name, value]) => {
          const isDirectory = typeof value === 'object' && value !== null;
          
          return (
            <li key={name} className={isDirectory ? 'directory' : 'file'}>
              <div className="file-item">
                <span className="file-icon">
                  {isDirectory ? '📁' : getFileIcon(name)}
                </span>
                <span className="file-name">{name}</span>
              </div>
              
              {isDirectory && (
                <div className="directory-content">
                  {renderFileTree(value)}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };
  
  // Helper to get file icon based on extension
  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'js':
        return '📄 JavaScript';
      case 'ts':
        return '📄 TypeScript';
      case 'jsx':
      case 'tsx':
        return '📄 React';
      case 'css':
      case 'scss':
        return '📄 Style';
      case 'html':
        return '📄 HTML';
      case 'json':
        return '📄 JSON';
      case 'md':
        return '📄 Markdown';
      case 'py':
        return '📄 Python';
      case 'java':
        return '📄 Java';
      case 'c':
      case 'cpp':
      case 'h':
        return '📄 C/C++';
      case 'go':
        return '📄 Go';
      case 'rb':
        return '📄 Ruby';
      case 'php':
        return '📄 PHP';
      case 'sh':
        return '📄 Shell';
      case 'sql':
        return '📄 SQL';
      case 'yaml':
      case 'yml':
        return '📄 YAML';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return '🖼️ Image';
      default:
        return '📄';
    }
  };

  return (
    <div className={`mamabear-scout ${currentStage}`}>
      <div className="workflow-indicator">
        <div className={`workflow-step ${currentStage === ScoutWorkflowStage.WELCOME || currentStage === ScoutWorkflowStage.PLANNING || currentStage === ScoutWorkflowStage.WORKSPACE || currentStage === ScoutWorkflowStage.PRODUCTION || currentStage === ScoutWorkflowStage.COMPLETE ? 'active' : ''}`}>
          <div className="step-icon">1</div>
          <span>Welcome</span>
        </div>
        <div className="step-connector"></div>
        <div className={`workflow-step ${currentStage === ScoutWorkflowStage.PLANNING || currentStage === ScoutWorkflowStage.WORKSPACE || currentStage === ScoutWorkflowStage.PRODUCTION || currentStage === ScoutWorkflowStage.COMPLETE ? 'active' : ''}`}>
          <div className="step-icon">2</div>
          <span>Planning</span>
        </div>
        <div className="step-connector"></div>
        <div className={`workflow-step ${currentStage === ScoutWorkflowStage.WORKSPACE || currentStage === ScoutWorkflowStage.PRODUCTION || currentStage === ScoutWorkflowStage.COMPLETE ? 'active' : ''}`}>
          <div className="step-icon">3</div>
          <span>Workspace</span>
        </div>
        <div className="step-connector"></div>
        <div className={`workflow-step ${currentStage === ScoutWorkflowStage.PRODUCTION || currentStage === ScoutWorkflowStage.COMPLETE ? 'active' : ''}`}>
          <div className="step-icon">4</div>
          <span>Production</span>
        </div>
        <div className="step-connector"></div>
        <div className={`workflow-step ${currentStage === ScoutWorkflowStage.COMPLETE ? 'active' : ''}`}>
          <div className="step-icon">✓</div>
          <span>Complete</span>
        </div>
      </div>
      
      <div className="stage-content">
        {renderStageContent()}
      </div>
      
      {/* Input area for providing feedback, not shown on welcome or complete stages */}
      {currentStage !== ScoutWorkflowStage.WELCOME && currentStage !== ScoutWorkflowStage.COMPLETE && (
        <div className="scout-input-container">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Provide feedback or guidance..."
            disabled={!isInputActive || agentState.busy}
          ></textarea>
          <div className="input-actions">
            <button
              className="send-button"
              onClick={sendWorkflowResponse}
              disabled={!userInput.trim() || !isInputActive || agentState.busy}
            >
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
            
            {/* Only show advance button if not busy */}
            {!agentState.busy && currentStage !== ScoutWorkflowStage.COMPLETE && (
              <button
                className="advance-button"
                onClick={advanceWorkflow}
                title="Advance to next stage"
              >
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M8 5v14l11-7z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MamaBearScout;