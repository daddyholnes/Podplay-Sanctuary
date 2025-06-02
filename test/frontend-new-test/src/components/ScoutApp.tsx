/**
 * Unified Scout Interface - Main Application Component
 * Consolidates all Scout functionality into one cohesive interface
 * Replaces fragmented pages with unified workflow
 */

import React, { useState, useEffect } from 'react';
import './styles/scout-design-system.css';

// Environment Types
type EnvironmentType = 'codespaces' | 'replit' | 'racknerd' | 'greencloud' | 'oracle';
type ProjectType = 'react' | 'next' | 'node' | 'python' | 'general';
type DeploymentStage = 'planning' | 'environment' | 'development' | 'deployment' | 'production';

interface ProjectPlan {
  id: string;
  name: string;
  type: ProjectType;
  description: string;
  complexity: 'simple' | 'moderate' | 'complex';
  database: boolean;
  docker: boolean;
  production: boolean;
  expectedUsers: number;
  budget: number;
  environment?: EnvironmentType;
  status: DeploymentStage;
}

interface EnvironmentOption {
  type: EnvironmentType;
  name: string;
  tier: 'free' | 'vps' | 'full_vm';
  cost: number;
  cpu: number;
  memory: number;
  storage: number;
  setupTime: number;
  apiKeyRequired: boolean;
  alwaysFree: boolean;
  bestFor: string[];
  limitations: string[];
}

const ScoutApp: React.FC = () => {
  const [currentStage, setCurrentStage] = useState<DeploymentStage>('planning');
  const [currentProject, setCurrentProject] = useState<ProjectPlan | null>(null);
  const [projects, setProjects] = useState<ProjectPlan[]>([]);
  const [environments, setEnvironments] = useState<EnvironmentOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Scout
  useEffect(() => {
    loadProjects();
    loadEnvironments();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/scout/projects');
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadEnvironments = async () => {
    try {
      const response = await fetch('/api/scout/environments');
      const data = await response.json();
      setEnvironments(data.environments || []);
    } catch (error) {
      console.error('Failed to load environments:', error);
    }
  };

  const createProject = async (projectData: Partial<ProjectPlan>) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/scout/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      const data = await response.json();
      
      if (data.success) {
        const newProject = data.project;
        setProjects(prev => [...prev, newProject]);
        setCurrentProject(newProject);
        setCurrentStage('environment');
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectEnvironment = async (environmentType: EnvironmentType) => {
    if (!currentProject) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/scout/projects/${currentProject.id}/environment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ environment: environmentType })
      });
      const data = await response.json();
      
      if (data.success) {
        setCurrentProject(prev => prev ? { ...prev, environment: environmentType } : null);
        setCurrentStage('development');
      }
    } catch (error) {
      console.error('Failed to select environment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deployProject = async () => {
    if (!currentProject) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/scout/projects/${currentProject.id}/deploy`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        setCurrentProject(prev => prev ? { ...prev, status: 'production' } : null);
        setCurrentStage('production');
      }
    } catch (error) {
      console.error('Failed to deploy project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="scout-app">
      {/* Header */}
      <header className="scout-header">
        <div className="scout-container">
          <div className="scout-header-content">
            <div className="scout-logo">
              <div className="scout-logo-icon">S</div>
              Scout Agent
            </div>
            <nav className="scout-nav">
              <a 
                href="#" 
                className={`scout-nav-link ${currentStage === 'planning' ? 'active' : ''}`}
                onClick={() => setCurrentStage('planning')}
              >
                Plan
              </a>
              <a 
                href="#" 
                className={`scout-nav-link ${currentStage === 'environment' ? 'active' : ''}`}
                onClick={() => currentProject && setCurrentStage('environment')}
              >
                Environment
              </a>
              <a 
                href="#" 
                className={`scout-nav-link ${currentStage === 'development' ? 'active' : ''}`}
                onClick={() => currentProject?.environment && setCurrentStage('development')}
              >
                Develop
              </a>
              <a 
                href="#" 
                className={`scout-nav-link ${currentStage === 'deployment' ? 'active' : ''}`}
                onClick={() => currentProject?.environment && setCurrentStage('deployment')}
              >
                Deploy
              </a>
              <a 
                href="#" 
                className={`scout-nav-link ${currentStage === 'production' ? 'active' : ''}`}
                onClick={() => currentProject?.status === 'production' && setCurrentStage('production')}
              >
                Monitor
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="scout-main">
        <div className="scout-container">
          {/* Progress Indicator */}
          <div className="scout-progress">
            <div className="scout-progress-steps">
              {['planning', 'environment', 'development', 'deployment', 'production'].map((stage, index) => (
                <div 
                  key={stage}
                  className={`scout-progress-step ${
                    currentStage === stage ? 'active' : 
                    ['planning', 'environment', 'development', 'deployment', 'production'].indexOf(currentStage) > index ? 'completed' : ''
                  }`}
                >
                  <div className="scout-progress-step-number">{index + 1}</div>
                  <div className="scout-progress-step-label">{stage.charAt(0).toUpperCase() + stage.slice(1)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stage Content */}
          {currentStage === 'planning' && (
            <PlanningStage 
              projects={projects}
              currentProject={currentProject}
              onCreateProject={createProject}
              onSelectProject={setCurrentProject}
              isLoading={isLoading}
            />
          )}

          {currentStage === 'environment' && currentProject && (
            <EnvironmentStage
              project={currentProject}
              environments={environments}
              onSelectEnvironment={selectEnvironment}
              isLoading={isLoading}
            />
          )}

          {currentStage === 'development' && currentProject && (
            <DevelopmentStage
              project={currentProject}
              onContinue={() => setCurrentStage('deployment')}
            />
          )}

          {currentStage === 'deployment' && currentProject && (
            <DeploymentStage
              project={currentProject}
              onDeploy={deployProject}
              isLoading={isLoading}
            />
          )}

          {currentStage === 'production' && currentProject && (
            <ProductionStage
              project={currentProject}
            />
          )}
        </div>
      </main>
    </div>
  );
};

// Planning Stage Component
const PlanningStage: React.FC<{
  projects: ProjectPlan[];
  currentProject: ProjectPlan | null;
  onCreateProject: (data: Partial<ProjectPlan>) => void;
  onSelectProject: (project: ProjectPlan) => void;
  isLoading: boolean;
}> = ({ projects, currentProject, onCreateProject, onSelectProject, isLoading }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'react' as ProjectType,
    description: '',
    complexity: 'simple' as 'simple' | 'moderate' | 'complex',
    database: false,
    docker: false,
    production: false,
    expectedUsers: 10,
    budget: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateProject(formData);
    setShowCreateForm(false);
    setFormData({
      name: '',
      type: 'react',
      description: '',
      complexity: 'simple',
      database: false,
      docker: false,
      production: false,
      expectedUsers: 10,
      budget: 0
    });
  };

  return (
    <div className="scout-stage">
      <div className="scout-stage-header">
        <h1 className="scout-stage-title">Project Planning</h1>
        <p className="scout-stage-description">
          Start by creating a new project or continue with an existing one
        </p>
      </div>

      <div className="scout-stage-content">
        {/* Existing Projects */}
        {projects.length > 0 && (
          <div className="scout-card">
            <div className="scout-card-header">
              <h2>Your Projects</h2>
            </div>
            <div className="scout-card-body">
              <div className="scout-grid scout-grid-2">
                {projects.map(project => (
                  <div 
                    key={project.id}
                    className={`scout-project-card ${currentProject?.id === project.id ? 'selected' : ''}`}
                    onClick={() => onSelectProject(project)}
                  >
                    <div className="scout-project-header">
                      <h3>{project.name}</h3>
                      <span className={`scout-badge scout-badge-${project.status === 'production' ? 'success' : 'info'}`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="scout-project-description">{project.description}</p>
                    <div className="scout-project-meta">
                      <span className="scout-project-type">{project.type}</span>
                      {project.environment && (
                        <span className="scout-project-env">{project.environment}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Create New Project */}
        <div className="scout-card">
          <div className="scout-card-header">
            <h2>Create New Project</h2>
            <button 
              className="scout-btn scout-btn-primary"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? 'Cancel' : 'New Project'}
            </button>
          </div>
          
          {showCreateForm && (
            <div className="scout-card-body">
              <form onSubmit={handleSubmit} className="scout-form">
                <div className="scout-grid scout-grid-2">
                  <div className="scout-form-group">
                    <label className="scout-label">Project Name</label>
                    <input
                      type="text"
                      className="scout-input"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="scout-form-group">
                    <label className="scout-label">Project Type</label>
                    <select
                      className="scout-select"
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ProjectType }))}
                    >
                      <option value="react">React</option>
                      <option value="next">Next.js</option>
                      <option value="node">Node.js</option>
                      <option value="python">Python</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                </div>

                <div className="scout-form-group">
                  <label className="scout-label">Description</label>
                  <textarea
                    className="scout-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your project..."
                  />
                </div>

                <div className="scout-grid scout-grid-3">
                  <div className="scout-form-group">
                    <label className="scout-label">Complexity</label>
                    <select
                      className="scout-select"
                      value={formData.complexity}
                      onChange={(e) => setFormData(prev => ({ ...prev, complexity: e.target.value as any }))}
                    >
                      <option value="simple">Simple</option>
                      <option value="moderate">Moderate</option>
                      <option value="complex">Complex</option>
                    </select>
                  </div>

                  <div className="scout-form-group">
                    <label className="scout-label">Expected Users</label>
                    <input
                      type="number"
                      className="scout-input"
                      value={formData.expectedUsers}
                      onChange={(e) => setFormData(prev => ({ ...prev, expectedUsers: parseInt(e.target.value) }))}
                    />
                  </div>

                  <div className="scout-form-group">
                    <label className="scout-label">Budget ($/month)</label>
                    <input
                      type="number"
                      className="scout-input"
                      value={formData.budget}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="scout-form-checkboxes">
                  <label className="scout-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.database}
                      onChange={(e) => setFormData(prev => ({ ...prev, database: e.target.checked }))}
                    />
                    Requires Database
                  </label>
                  
                  <label className="scout-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.docker}
                      onChange={(e) => setFormData(prev => ({ ...prev, docker: e.target.checked }))}
                    />
                    Uses Docker
                  </label>
                  
                  <label className="scout-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.production}
                      onChange={(e) => setFormData(prev => ({ ...prev, production: e.target.checked }))}
                    />
                    Production Ready
                  </label>
                </div>

                <button 
                  type="submit" 
                  className="scout-btn scout-btn-primary scout-btn-lg"
                  disabled={isLoading}
                >
                  {isLoading ? <div className="scout-loading"></div> : 'Create Project'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Environment Selection Stage
const EnvironmentStage: React.FC<{
  project: ProjectPlan;
  environments: EnvironmentOption[];
  onSelectEnvironment: (env: EnvironmentType) => void;
  isLoading: boolean;
}> = ({ project, environments, onSelectEnvironment, isLoading }) => {
  const [selectedEnv, setSelectedEnv] = useState<EnvironmentType | null>(null);
  const [recommendation, setRecommendation] = useState<any>(null);

  useEffect(() => {
    // Get environment recommendation
    fetch('/api/scout/recommend-environment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    })
    .then(res => res.json())
    .then(data => setRecommendation(data.recommendation))
    .catch(console.error);
  }, [project]);

  const handleContinue = () => {
    if (selectedEnv) {
      onSelectEnvironment(selectedEnv);
    }
  };

  return (
    <div className="scout-stage">
      <div className="scout-stage-header">
        <h1 className="scout-stage-title">Choose Environment</h1>
        <p className="scout-stage-description">
          Select the best development and hosting environment for {project.name}
        </p>
      </div>

      {recommendation && (
        <div className="scout-alert scout-alert-info">
          <strong>Recommendation:</strong> {recommendation.reasoning}
        </div>
      )}

      <div className="scout-env-selector">
        <div className="scout-env-categories">
          {['free', 'vps', 'full_vm'].map(tier => (
            <div key={tier} className="scout-env-category">
              <h3 className="scout-env-category-title">
                {tier === 'free' ? 'Free Tier' : tier === 'vps' ? 'VPS Hosting' : 'Full Virtual Machines'}
              </h3>
              <p className="scout-env-category-desc">
                {tier === 'free' ? 'Perfect for learning and prototyping' :
                 tier === 'vps' ? 'Affordable servers with full control' :
                 'Enterprise-grade cloud infrastructure'}
              </p>
              
              <div className="scout-env-options">
                {environments.filter(env => env.tier === tier).map(env => (
                  <div
                    key={env.type}
                    className={`scout-env-option ${selectedEnv === env.type ? 'selected' : ''}`}
                    onClick={() => setSelectedEnv(env.type)}
                  >
                    <div className="scout-env-option-header">
                      <div className="scout-env-option-name">{env.name}</div>
                      <div className="scout-env-option-cost">
                        {env.cost === 0 ? 'Free' : `$${env.cost}/mo`}
                      </div>
                    </div>
                    
                    <div className="scout-env-specs">
                      <div className="scout-env-spec">
                        <span className="scout-env-spec-value">{env.cpu}</span>
                        <span className="scout-env-spec-label">CPU</span>
                      </div>
                      <div className="scout-env-spec">
                        <span className="scout-env-spec-value">{env.memory}GB</span>
                        <span className="scout-env-spec-label">RAM</span>
                      </div>
                      <div className="scout-env-spec">
                        <span className="scout-env-spec-value">{env.storage}GB</span>
                        <span className="scout-env-spec-label">Storage</span>
                      </div>
                    </div>

                    <div className="scout-env-features">
                      <div className="scout-env-features-title">Best for:</div>
                      <ul className="scout-env-features-list">
                        {env.bestFor.map(feature => (
                          <li key={feature}>{feature}</li>
                        ))}
                      </ul>
                    </div>

                    {env.apiKeyRequired && (
                      <div className="scout-badge scout-badge-warning">
                        API Key Required
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="scout-card-footer">
          <button
            className="scout-btn scout-btn-primary scout-btn-lg"
            onClick={handleContinue}
            disabled={!selectedEnv || isLoading}
          >
            {isLoading ? <div className="scout-loading"></div> : 'Continue with Selected Environment'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Development Stage
const DevelopmentStage: React.FC<{
  project: ProjectPlan;
  onContinue: () => void;
}> = ({ project, onContinue }) => {
  const [status, setStatus] = useState<'setting-up' | 'ready' | 'error'>('setting-up');

  useEffect(() => {
    // Simulate environment setup
    const timer = setTimeout(() => {
      setStatus('ready');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="scout-stage">
      <div className="scout-stage-header">
        <h1 className="scout-stage-title">Development Environment</h1>
        <p className="scout-stage-description">
          Your {project.environment} environment is being prepared for {project.name}
        </p>
      </div>

      <div className="scout-card">
        <div className="scout-card-body">
          {status === 'setting-up' && (
            <div className="scout-flex-center" style={{ padding: '2rem' }}>
              <div className="scout-loading" style={{ width: '40px', height: '40px' }}></div>
              <span style={{ marginLeft: '1rem' }}>Setting up your environment...</span>
            </div>
          )}

          {status === 'ready' && (
            <div>
              <div className="scout-alert scout-alert-success">
                Environment ready! You can now start developing.
              </div>
              
              <div className="scout-dev-info">
                <h3>Environment Details:</h3>
                <ul>
                  <li>Environment: {project.environment}</li>
                  <li>Project Type: {project.type}</li>
                  <li>Access URL: https://your-env.example.com</li>
                  <li>Git Repository: Automatically configured</li>
                </ul>
              </div>

              <button
                className="scout-btn scout-btn-primary scout-btn-lg"
                onClick={onContinue}
                style={{ marginTop: '1rem' }}
              >
                Ready to Deploy
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Deployment Stage
const DeploymentStage: React.FC<{
  project: ProjectPlan;
  onDeploy: () => void;
  isLoading: boolean;
}> = ({ project, onDeploy, isLoading }) => {
  return (
    <div className="scout-stage">
      <div className="scout-stage-header">
        <h1 className="scout-stage-title">Deploy to Production</h1>
        <p className="scout-stage-description">
          Deploy {project.name} to your {project.environment} environment
        </p>
      </div>

      <div className="scout-card">
        <div className="scout-card-body">
          <div className="scout-deployment-checklist">
            <h3>Pre-deployment Checklist:</h3>
            <ul>
              <li>✓ Code is committed to repository</li>
              <li>✓ Environment variables configured</li>
              <li>✓ Dependencies installed</li>
              <li>✓ Tests passing</li>
              <li>✓ Security scan complete</li>
            </ul>
          </div>

          <button
            className="scout-btn scout-btn-success scout-btn-lg"
            onClick={onDeploy}
            disabled={isLoading}
            style={{ marginTop: '2rem' }}
          >
            {isLoading ? <div className="scout-loading"></div> : 'Deploy to Production'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Production Monitoring Stage
const ProductionStage: React.FC<{
  project: ProjectPlan;
}> = ({ project }) => {
  return (
    <div className="scout-stage">
      <div className="scout-stage-header">
        <h1 className="scout-stage-title">Production Monitoring</h1>
        <p className="scout-stage-description">
          {project.name} is live! Monitor performance and manage your deployment.
        </p>
      </div>

      <div className="scout-grid scout-grid-3">
        <div className="scout-card">
          <div className="scout-card-header">
            <h3>Application Status</h3>
          </div>
          <div className="scout-card-body">
            <div className="scout-badge scout-badge-success">Online</div>
            <p>Uptime: 99.9%</p>
            <p>Response Time: 120ms</p>
          </div>
        </div>

        <div className="scout-card">
          <div className="scout-card-header">
            <h3>Resource Usage</h3>
          </div>
          <div className="scout-card-body">
            <p>CPU: 45%</p>
            <p>Memory: 2.1GB / 4GB</p>
            <p>Storage: 15GB / 50GB</p>
          </div>
        </div>

        <div className="scout-card">
          <div className="scout-card-header">
            <h3>Cost Tracking</h3>
          </div>
          <div className="scout-card-body">
            <p>Current Month: ${project.budget > 0 ? (project.budget * 0.8).toFixed(2) : '0.00'}</p>
            <p>Projected: ${project.budget.toFixed(2)}</p>
            <p>Budget: ${project.budget.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoutApp;
