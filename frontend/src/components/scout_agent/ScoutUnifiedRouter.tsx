// ScoutUnifiedRouter.tsx - Unified Scout Interface Router
// Routes between different Scout agent interfaces with consistent design
// Uses the new unified Scout-Sanctuary theme and EnhancedChatBar

import React, { useState, useEffect } from 'react';
import ScoutAgentEnhanced from './ScoutAgentEnhanced';
import ScoutDynamicWorkspace from './ScoutDynamicWorkspace';
import ScoutProjectView from './ScoutProjectView';
import '../styles/unified-scout-sanctuary.css';
import './ScoutUnifiedRouter.css';

export type ScoutMode = 'chat' | 'workspace' | 'project';
export type ScoutAgent = 'scout' | 'mama-bear';

interface ScoutUnifiedRouterProps {
  initialMode?: ScoutMode;
  initialAgent?: ScoutAgent;
  projectId?: string;
  className?: string;
}

const ScoutUnifiedRouter: React.FC<ScoutUnifiedRouterProps> = ({
  initialMode = 'chat',
  initialAgent = 'scout',
  projectId,
  className = ""
}) => {
  const [currentMode, setCurrentMode] = useState<ScoutMode>(initialMode);
  const [currentAgent, setCurrentAgent] = useState<ScoutAgent>(initialAgent);
  const [activeProjectId, setActiveProjectId] = useState<string | undefined>(projectId);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Handle mode transitions with smooth animations
  const handleModeChange = async (newMode: ScoutMode, newProjectId?: string) => {
    if (newMode === currentMode) return;
    
    setIsTransitioning(true);
    
    // Brief delay for transition animation
    setTimeout(() => {
      setCurrentMode(newMode);
      if (newProjectId) {
        setActiveProjectId(newProjectId);
      }
      setIsTransitioning(false);
    }, 300);
  };

  // Handle agent switching
  const handleAgentChange = (newAgent: ScoutAgent) => {
    setCurrentAgent(newAgent);
  };

  // Handle project creation from chat
  const handleProjectCreated = (projectId: string) => {
    setActiveProjectId(projectId);
    handleModeChange('project', projectId);
  };

  // Handle workspace creation
  const handleWorkspaceCreated = () => {
    handleModeChange('workspace');
  };

  // Render the appropriate Scout interface
  const renderCurrentInterface = () => {
    switch (currentMode) {
      case 'chat':
        return (
          <ScoutAgentEnhanced
            onProjectCreated={handleProjectCreated}
            onWorkspaceRequested={handleWorkspaceCreated}
            agentType={currentAgent}
          />
        );
      
      case 'workspace':
        return (
          <ScoutDynamicWorkspace
            onModeChange={handleModeChange}
            onProjectCreated={handleProjectCreated}
            agentType={currentAgent}
          />
        );
      
      case 'project':
        return activeProjectId ? (
          <ScoutProjectView
            projectId={activeProjectId}
            onBackToChat={() => handleModeChange('chat')}
            onOpenWorkspace={() => handleModeChange('workspace')}
          />
        ) : (
          <div className="scout-error-state">
            <h2>⚠️ Project Not Found</h2>
            <p>No project ID provided for project view.</p>
            <button 
              className="scout-btn primary"
              onClick={() => handleModeChange('chat')}
            >
              🏠 Back to Chat
            </button>
          </div>
        );
      
      default:
        return (
          <ScoutAgentEnhanced
            onProjectCreated={handleProjectCreated}
            onWorkspaceRequested={handleWorkspaceCreated}
            agentType={currentAgent}
          />
        );
    }
  };

  // Navigation breadcrumbs
  const renderBreadcrumbs = () => {
    if (currentMode === 'chat') return null;

    return (
      <div className="scout-breadcrumbs">
        <button 
          className="scout-breadcrumb-item"
          onClick={() => handleModeChange('chat')}
        >
          🏠 Scout Home
        </button>
        
        {currentMode === 'workspace' && (
          <>
            <span className="scout-breadcrumb-separator">›</span>
            <span className="scout-breadcrumb-item active">
              🚀 Dynamic Workspace
            </span>
          </>
        )}
        
        {currentMode === 'project' && activeProjectId && (
          <>
            <span className="scout-breadcrumb-separator">›</span>
            <span className="scout-breadcrumb-item active">
              📊 Project: {activeProjectId}
            </span>
          </>
        )}
      </div>
    );
  };

  // Agent selector (shown in header)
  const renderAgentSelector = () => (
    <div className="scout-agent-selector">
      <button
        className={`scout-agent-btn ${currentAgent === 'scout' ? 'active' : ''}`}
        onClick={() => handleAgentChange('scout')}
        title="Scout Agent - Autonomous plan-to-production"
      >
        🔍 Scout
      </button>
      <button
        className={`scout-agent-btn ${currentAgent === 'mama-bear' ? 'active' : ''}`}
        onClick={() => handleAgentChange('mama-bear')}
        title="Mama Bear - Collaborative research and development"
      >
        🐻 Mama Bear
      </button>
    </div>
  );

  return (
    <div className={`scout-unified-router ${className}`}>
      {/* Header with navigation and agent selector */}
      <div className="scout-unified-header">
        {renderBreadcrumbs()}
        <div className="scout-header-actions">
          {renderAgentSelector()}
        </div>
      </div>

      {/* Main content area with transition overlay */}
      <div className="scout-content-container">
        {isTransitioning && (
          <div className="scout-transition-overlay">
            <div className="scout-transition-spinner"></div>
            <p>🚀 Transitioning to {currentMode} mode...</p>
          </div>
        )}
        
        <div className={`scout-interface-wrapper ${isTransitioning ? 'transitioning' : ''}`}>
          {renderCurrentInterface()}
        </div>
      </div>

      {/* Status bar */}
      <div className="scout-status-bar">
        <div className="scout-status-left">
          <span className="scout-mode-indicator">
            {currentMode === 'chat' && '💬 Chat Mode'}
            {currentMode === 'workspace' && '🚀 Workspace Mode'}
            {currentMode === 'project' && '📊 Project Mode'}
          </span>
        </div>
        
        <div className="scout-status-right">
          <span className="scout-agent-indicator">
            {currentAgent === 'scout' ? '🔍 Scout Agent' : '🐻 Mama Bear'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ScoutUnifiedRouter;
