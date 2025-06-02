import React, { useState, useEffect } from 'react';
import './UnifiedDevelopmentHub.css';

// Import existing workspace components
import WorkspacesView from './workspaces/WorkspacesView';
import DevSandbox from '../DevSandbox';
import EnhancedChatInterface from '../EnhancedChatInterface';

// Types for development environment management
interface EnvironmentType {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  status: 'available' | 'creating' | 'running' | 'stopped';
}

interface ActiveEnvironment {
  id: string;
  name: string;
  type: string;
  status: string;
  created: string;
  url?: string;
}

const UnifiedDevelopmentHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'nixos' | 'docker' | 'codespaces' | 'cloud'>('overview');
  const [environments, setEnvironments] = useState<ActiveEnvironment[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);

  // Environment type definitions
  const environmentTypes: EnvironmentType[] = [
    {
      id: 'nixos',
      name: 'NixOS Workspaces',
      description: 'Reproducible development environments with declarative configuration',
      icon: '❄️',
      color: '#5277C3',
      status: 'available'
    },
    {
      id: 'docker',
      name: 'Docker Containers',
      description: 'Lightweight, portable development containers',
      icon: '🐳',
      color: '#2496ED',
      status: 'available'
    },
    {
      id: 'codespaces',
      name: 'GitHub Codespaces',
      description: 'Cloud development environments powered by GitHub',
      icon: '🚀',
      color: '#24292e',
      status: 'available'
    },
    {
      id: 'cloud',
      name: 'Cloud Providers',
      description: 'Deploy to AWS, GCP, Azure, and other cloud platforms',
      icon: '☁️',
      color: '#FF9900',
      status: 'available'
    }
  ];

  useEffect(() => {
    // Load existing environments
    loadEnvironments();
  }, []);

  const loadEnvironments = async () => {
    try {
      const response = await fetch('/api/environments');
      if (response.ok) {
        const data = await response.json();
        setEnvironments(data.environments || []);
      }
    } catch (error) {
      console.error('Failed to load environments:', error);
    }
  };

  const createEnvironment = async (type: string, config: any) => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/environments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, config })
      });
      
      if (response.ok) {
        const newEnv = await response.json();
        setEnvironments(prev => [...prev, newEnv]);
      }
    } catch (error) {
      console.error('Failed to create environment:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const renderOverview = () => (
    <div className="hub-overview">
      <div className="overview-header">
        <h2>🏗️ Development Environment Hub</h2>
        <p>Create, manage, and access all your development environments from one place</p>
      </div>

      <div className="environment-types-grid">
        {environmentTypes.map(type => (
          <div key={type.id} className="environment-type-card" style={{ borderColor: type.color }}>
            <div className="type-header">
              <span className="type-icon" style={{ fontSize: '2rem' }}>{type.icon}</span>
              <h3 style={{ color: type.color }}>{type.name}</h3>
            </div>
            <p className="type-description">{type.description}</p>            <div className="type-actions">
              <button 
                className="create-btn"
                style={{ backgroundColor: type.color }}
                onClick={() => {
                  // Create environment with basic config
                  const config = {
                    name: `${type.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
                    type: type.id,
                    template: 'basic'
                  };
                  createEnvironment(type.id, config);
                  setActiveTab(type.id as any);
                }}
              >
                Create {type.name}
              </button>
              <span className={`status-badge ${type.status}`}>
                {type.status === 'available' ? '✅ Ready' : '🔄 Loading'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="active-environments">
        <h3>🚀 Active Environments</h3>
        {environments.length === 0 ? (
          <div className="no-environments">
            <p>No active environments. Create your first environment above!</p>
          </div>
        ) : (
          <div className="environments-list">
            {environments.map(env => (
              <div key={env.id} className="environment-item">
                <div className="env-info">
                  <h4>{env.name}</h4>
                  <span className="env-type">{env.type}</span>
                  <span className={`env-status ${env.status}`}>{env.status}</span>
                </div>
                <div className="env-actions">
                  {env.url && (
                    <button className="access-btn" onClick={() => window.open(env.url)}>
                      🌐 Access
                    </button>
                  )}
                  <button className="manage-btn">⚙️ Manage</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'nixos':
        return <WorkspacesView />;
      case 'docker':
      case 'codespaces':
      case 'cloud':
        return <DevSandbox />;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="unified-development-hub">
      {/* Header with integrated chat toggle */}
      <div className="hub-header">
        <div className="header-content">
          <h1>🏗️ Unified Development Hub</h1>
          <p>All your development environments in one place</p>
        </div>
        <div className="header-actions">
          <button 
            className={`chat-toggle ${showChatPanel ? 'active' : ''}`}
            onClick={() => setShowChatPanel(!showChatPanel)}
            title="Toggle Mama Bear Chat"
          >
            🐻 Chat with Mama Bear
          </button>
        </div>
      </div>

      <div className="hub-content">
        {/* Tab Navigation */}
        <div className="hub-tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            🏠 Overview
          </button>
          <button 
            className={`tab ${activeTab === 'nixos' ? 'active' : ''}`}
            onClick={() => setActiveTab('nixos')}
          >
            ❄️ NixOS Workspaces
          </button>
          <button 
            className={`tab ${activeTab === 'docker' ? 'active' : ''}`}
            onClick={() => setActiveTab('docker')}
          >
            🐳 Docker & Cloud
          </button>
          <button 
            className={`tab ${activeTab === 'codespaces' ? 'active' : ''}`}
            onClick={() => setActiveTab('codespaces')}
          >
            🚀 GitHub Codespaces
          </button>
          <button 
            className={`tab ${activeTab === 'cloud' ? 'active' : ''}`}
            onClick={() => setActiveTab('cloud')}
          >
            ☁️ Cloud Deploy
          </button>
        </div>

        {/* Main Content Area */}
        <div className="hub-main">
          <div className={`content-area ${showChatPanel ? 'with-chat' : ''}`}>
            {renderTabContent()}
          </div>

          {/* Resizable Chat Panel */}
          {showChatPanel && (
            <div className="chat-panel">
              <div className="chat-header">
                <h3>🐻 Mama Bear Assistant</h3>
                <button 
                  className="close-chat"
                  onClick={() => setShowChatPanel(false)}
                >
                  ×
                </button>
              </div>
              <div className="chat-content">
                <EnhancedChatInterface />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Creation Status Overlay */}
      {isCreating && (
        <div className="creation-overlay">
          <div className="creation-status">
            <div className="spinner"></div>
            <h3>🐻 Mama Bear is creating your environment...</h3>
            <p>This may take a few minutes</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedDevelopmentHub;
