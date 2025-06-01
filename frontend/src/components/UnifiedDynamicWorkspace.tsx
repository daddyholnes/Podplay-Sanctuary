// Unified Dynamic Workspace - The Heart of Nathan's Vision
// Transforms from separate disjointed pages into a single, dynamic, cohesive experience
// Inspired by scout.new aesthetic with persistent chat and seamless transitions

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDesignSystem } from '../contexts/DesignSystemContext';

// Import existing components to unify them
import CentralizedChatInterface from './shared/CentralizedChatInterface';
import ScoutDynamicWorkspace from './scout_agent/ScoutDynamicWorkspace';
import ScoutIntegratedWorkflow from './scout/ScoutIntegratedWorkflow';
import MamaBearControlCenter from './MamaBearControlCenter';
import UnifiedDevelopmentHub from './UnifiedDevelopmentHub';
import MiniAppLauncher from './MiniAppLauncher';

import './UnifiedDynamicWorkspace.css';

// ==================== WORKSPACE VIEW INTERFACES ====================

interface WorkspaceView {
  id: string;
  name: string;
  icon: string;
  component: React.ComponentType;
  description: string;
  category: 'primary' | 'secondary' | 'utility';
  gradient: string;
  accentColor: string;
}

interface WorkspaceTransition {
  isActive: boolean;
  fromView: string;
  toView: string;
  progress: number;
  duration: number;
}

interface AgentActivity {
  id: string;
  type: 'code' | 'chat' | 'deploy' | 'search' | 'create';
  description: string;
  timestamp: Date;
  status: 'active' | 'completed' | 'failed';
  details?: any;
}

// ==================== UNIFIED DYNAMIC WORKSPACE ====================

const UnifiedDynamicWorkspace: React.FC = () => {
  const { theme, workspaceState, setActiveView, startTransition, endTransition } = useDesignSystem();
  
  // ==================== LOCAL STATE ====================
  
  const [currentView, setCurrentView] = useState<string>('scout-new');
  const [transition, setTransition] = useState<WorkspaceTransition>({
    isActive: false,
    fromView: '',
    toView: '',
    progress: 0,
    duration: 600
  });
  
  const [agentActivities, setAgentActivities] = useState<AgentActivity[]>([]);
  const [chatExpanded, setChatExpanded] = useState<boolean>(false);
  const [workspaceMode, setWorkspaceMode] = useState<'unified' | 'split' | 'immersive'>('unified');

  // ==================== WORKSPACE VIEWS CONFIGURATION ====================
    const workspaceViews: WorkspaceView[] = useMemo(() => [
    {
      id: 'hub',
      name: 'Development Hub',
      icon: '🏗️',
      component: UnifiedDevelopmentHub,
      description: 'Unified development environments and project management',
      category: 'primary',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      accentColor: '#667eea'
    },
    {
      id: 'scout-new',
      name: 'Scout Workflow',
      icon: '✨',
      component: ScoutIntegratedWorkflow,
      description: 'Scout.new inspired autonomous development workflow',
      category: 'primary',
      gradient: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)',
      accentColor: '#a78bfa'
    },
    {
      id: 'scout',
      name: 'Scout Workspace',
      icon: '🚀',
      component: ScoutDynamicWorkspace,
      description: 'Dynamic agent workspace with rocket-launch experience',
      category: 'primary',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      accentColor: '#f093fb'
    },
    {
      id: 'mama-bear',
      name: 'Mama Bear Center',
      icon: '🐻',
      component: MamaBearControlCenter,
      description: 'AI development partner and control center',
      category: 'primary',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      accentColor: '#4facfe'
    },
    {
      id: 'tools',
      name: 'Mini Apps',
      icon: '⚡',
      component: MiniAppLauncher,
      description: 'Professional tool suite and utilities',
      category: 'utility',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      accentColor: '#43e97b'
    }
  ], []);

  // ==================== TRANSITION MANAGEMENT ====================
  
  const handleViewTransition = useCallback(async (toViewId: string) => {
    if (transition.isActive || currentView === toViewId) return;
    
    const fromView = currentView;
    setTransition({
      isActive: true,
      fromView,
      toView: toViewId,
      progress: 0,
      duration: 600
    });
    
    startTransition(600);
    
    // Animate transition progress
    const startTime = Date.now();
    const animateTransition = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / 600, 1);
      
      setTransition(prev => ({ ...prev, progress }));
      
      if (progress < 1) {
        requestAnimationFrame(animateTransition);
      } else {
        setCurrentView(toViewId);
        setTransition(prev => ({ ...prev, isActive: false }));
        endTransition();
        setActiveView(toViewId);
      }
    };
    
    requestAnimationFrame(animateTransition);
  }, [currentView, transition.isActive, startTransition, endTransition, setActiveView]);

  // ==================== AGENT ACTIVITY TRACKING ====================
  
  useEffect(() => {
    // Simulate agent activity updates (connect to scout_logger.py in the future)
    const simulateActivity = () => {
      const activities: AgentActivity[] = [
        {
          id: '1',
          type: 'chat',
          description: 'Processing user query about deployment...',
          timestamp: new Date(),
          status: 'active'
        },
        {
          id: '2', 
          type: 'code',
          description: 'Analyzing TypeScript compilation errors',
          timestamp: new Date(Date.now() - 30000),
          status: 'completed'
        },
        {
          id: '3',
          type: 'deploy',
          description: 'Preparing Azure deployment configuration',
          timestamp: new Date(Date.now() - 60000),
          status: 'active'
        }
      ];
      setAgentActivities(activities);
    };
    
    simulateActivity();
    const interval = setInterval(simulateActivity, 5000);
    return () => clearInterval(interval);
  }, []);

  // ==================== VIEW RENDERING ====================
  
  const renderActiveView = useCallback(() => {
    const view = workspaceViews.find(v => v.id === currentView);
    if (!view) return null;
    
    const Component = view.component;
    return (
      <div 
        className={`workspace-view-container ${transition.isActive ? 'transitioning' : ''}`}
        style={{
          '--view-accent': view.accentColor,
          '--view-gradient': view.gradient,
          transform: transition.isActive ? 
            `translateX(${(transition.progress - 1) * 100}%)` : 
            'translateX(0)',
          opacity: transition.isActive ? 
            1 - Math.abs(transition.progress - 0.5) * 2 : 
            1
        } as React.CSSProperties}
      >
        <Component />
      </div>
    );
  }, [currentView, workspaceViews, transition]);

  // ==================== WORKSPACE MODE HANDLERS ====================
  
  const toggleWorkspaceMode = useCallback(() => {
    const modes: ('unified' | 'split' | 'immersive')[] = ['unified', 'split', 'immersive'];
    const currentIndex = modes.indexOf(workspaceMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setWorkspaceMode(nextMode);
  }, [workspaceMode]);

  const toggleChatExpansion = useCallback(() => {
    setChatExpanded(prev => !prev);
  }, []);

  // ==================== RENDER ====================
  
  return (
    <div 
      className={`unified-dynamic-workspace ${workspaceMode} ${workspaceState.currentTheme}`}
      style={{
        '--theme-primary': theme.colors.sanctuaryPrimary,
        '--theme-secondary': theme.colors.sanctuarySecondary,
        '--theme-accent': theme.colors.sanctuaryAccent,
        '--theme-background': theme.colors.sanctuaryBackground,
        '--theme-text': theme.colors.sanctuaryText,
        '--theme-border': theme.colors.sanctuaryBorder,
        '--theme-surface': theme.colors.sanctuarySurface,
        '--backdrop-blur': theme.effects.backdropBlur,
        '--transition': theme.effects.transitions
      } as React.CSSProperties}
    >
      {/* Dynamic Background */}
      {workspaceState.dynamicBackground && (
        <div className="dynamic-background">
          <div className="bg-layer layer-1"></div>
          <div className="bg-layer layer-2"></div>
          <div className="bg-layer layer-3"></div>
        </div>
      )}

      {/* Workspace Header */}
      <header className="workspace-header">
        <div className="header-left">
          <div className="sanctuary-brand">
            <span className="brand-icon">🏰</span>
            <span className="brand-text">Podplay Sanctuary</span>
          </div>
          
          <nav className="view-navigation">
            {workspaceViews.map((view) => (
              <button
                key={view.id}
                className={`nav-view-btn ${currentView === view.id ? 'active' : ''}`}
                onClick={() => handleViewTransition(view.id)}
                style={{
                  '--view-gradient': view.gradient,
                  '--view-accent': view.accentColor
                } as React.CSSProperties}
                title={view.description}
              >
                <span className="view-icon">{view.icon}</span>
                <span className="view-name">{view.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="header-right">
          {/* Agent Activity Timeline */}
          <div className="agent-activity-timeline">
            <span className="activity-label">🤖 Agent Activity</span>
            <div className="activity-indicators">
              {agentActivities.slice(0, 3).map((activity) => (
                <div 
                  key={activity.id}
                  className={`activity-indicator ${activity.status}`}
                  title={activity.description}
                >
                  <span className="activity-type">
                    {activity.type === 'code' ? '⚡' : 
                     activity.type === 'chat' ? '💬' : 
                     activity.type === 'deploy' ? '🚀' : 
                     activity.type === 'search' ? '🔍' : '✨'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Workspace Controls */}
          <div className="workspace-controls">
            <button 
              className="workspace-mode-btn"
              onClick={toggleWorkspaceMode}
              title={`Mode: ${workspaceMode}`}
            >
              {workspaceMode === 'unified' ? '📱' : 
               workspaceMode === 'split' ? '📺' : '🖥️'}
            </button>
            
            <button 
              className={`chat-toggle-btn ${chatExpanded ? 'expanded' : ''}`}
              onClick={toggleChatExpansion}
              title="Toggle chat panel"
            >
              💬
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="workspace-main">
        {/* Primary Content */}
        <div className={`workspace-content ${chatExpanded ? 'chat-expanded' : ''}`}>
          <div className="view-transition-container">
            {renderActiveView()}
            
            {/* Transition Overlay */}
            {transition.isActive && (
              <div 
                className="transition-overlay"
                style={{
                  opacity: Math.sin(transition.progress * Math.PI) * 0.3
                }}
              >
                <div className="transition-progress">
                  <div 
                    className="progress-bar"
                    style={{
                      width: `${transition.progress * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>        {/* Centralized Chat Interface */}
        <CentralizedChatInterface
          isVisible={true}
          isExpanded={chatExpanded}
          onToggleExpanded={toggleChatExpansion}
          contextInfo={{
            currentView: workspaceViews.find(v => v.id === currentView)?.name,
            activeProject: 'Podplay Sanctuary',
            currentFile: undefined
          }}
        />
      </main>

      {/* Workspace Status Bar */}
      <footer className="workspace-status-bar">
        <div className="status-left">
          <span className="current-view-indicator">
            {workspaceViews.find(v => v.id === currentView)?.icon} {workspaceViews.find(v => v.id === currentView)?.name}
          </span>
          <span className="workspace-mode-indicator">
            Mode: {workspaceMode}
          </span>
        </div>
        
        <div className="status-center">
          {transition.isActive && (
            <div className="transition-status">
              <span>Transitioning to {workspaceViews.find(v => v.id === transition.toView)?.name}...</span>
              <div className="mini-progress">
                <div 
                  className="mini-progress-fill"
                  style={{ width: `${transition.progress * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        
        <div className="status-right">
          <span className="agent-status">
            🤖 {agentActivities.filter(a => a.status === 'active').length} active tasks
          </span>
          <span className="theme-indicator">
            🎨 {workspaceState.currentTheme}
          </span>
        </div>
      </footer>
    </div>
  );
};

export default UnifiedDynamicWorkspace;
