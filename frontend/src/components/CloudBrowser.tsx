import React, { useState, useRef } from 'react';
import './CloudBrowser.css';

// ==================== INTERFACES ====================

interface CloudEnvironment {
  id: string;
  name: string;
  status: 'starting' | 'running' | 'stopped' | 'error';
  url: string;
  type: 'web' | 'ide' | 'jupyter' | 'custom';
  framework?: string;
  port?: number;
  lastAccessed?: Date;
}

interface CloudBrowserProps {
  mode: 'modal' | 'inline' | 'popup';
  environment?: CloudEnvironment;
  onClose?: () => void;
  onEnvironmentChange?: (env: CloudEnvironment) => void;
  initialUrl?: string;
  className?: string;
}

// ==================== CLOUD BROWSER COMPONENT ====================

export const CloudBrowser: React.FC<CloudBrowserProps> = ({
  mode = 'inline',
  environment,
  onClose,
  onEnvironmentChange,
  initialUrl,
  className = ''
}) => {
  const [currentUrl, setCurrentUrl] = useState(initialUrl || environment?.url || 'about:blank');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [browserHistory, setBrowserHistory] = useState<string[]>([currentUrl]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ==================== ENVIRONMENT MANAGEMENT ====================

  const createCloudEnvironment = async (type: string, framework?: string): Promise<CloudEnvironment> => {
    try {
      const response = await fetch('/api/dev-sandbox/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, framework })
      });
      
      if (!response.ok) throw new Error('Failed to create environment');
      
      const env = await response.json();
      return {
        id: env.id,
        name: env.name,
        status: 'starting',
        url: env.url,
        type: type as any,
        framework,
        port: env.port,
        lastAccessed: new Date()
      };
    } catch (err) {
      throw new Error(`Failed to create environment: ${err}`);
    }
  };

  const startEnvironment = async (envId: string): Promise<string> => {
    try {
      const response = await fetch(`/api/dev-sandbox/${envId}/start`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to start environment');
      
      const result = await response.json();
      return result.url;
    } catch (err) {
      throw new Error(`Failed to start environment: ${err}`);
    }
  };

  // ==================== NAVIGATION CONTROLS ====================

  const navigateToUrl = (url: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentUrl(url);
    
    // Update browser history
    const newHistory = [...browserHistory.slice(0, historyIndex + 1), url];
    setBrowserHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(browserHistory[newIndex]);
    }
  };

  const goForward = () => {
    if (historyIndex < browserHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(browserHistory[newIndex]);
    }
  };

  const refresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
      setIsLoading(true);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (containerRef.current) {
      if (!isFullscreen) {
        containerRef.current.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    }
  };

  // ==================== IFRAME EVENT HANDLERS ====================

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError('Failed to load the environment. The service might be starting up.');
  };

  // ==================== QUICK LAUNCH ENVIRONMENTS ====================

  const quickLaunchEnvironments = [
    { name: 'React App', type: 'web', framework: 'react', icon: '⚛️' },
    { name: 'Vue.js App', type: 'web', framework: 'vue', icon: '💚' },
    { name: 'Node.js API', type: 'web', framework: 'node', icon: '🟢' },
    { name: 'Python Flask', type: 'web', framework: 'flask', icon: '🐍' },
    { name: 'Jupyter Notebook', type: 'jupyter', framework: 'python', icon: '📊' },
    { name: 'VS Code Browser', type: 'ide', framework: 'vscode', icon: '💻' }
  ];

  const launchQuickEnvironment = async (envType: string, framework: string) => {
    try {
      setIsLoading(true);
      const env = await createCloudEnvironment(envType, framework);
      const url = await startEnvironment(env.id);
      
      onEnvironmentChange?.(env);
      navigateToUrl(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== RENDER METHODS ====================

  const renderBrowserControls = () => (
    <div className="cloud-browser-controls">
      <div className="nav-controls">
        <button 
          onClick={goBack} 
          disabled={historyIndex <= 0}
          className="nav-btn"
          title="Go Back"
        >
          ◀️
        </button>
        <button 
          onClick={goForward} 
          disabled={historyIndex >= browserHistory.length - 1}
          className="nav-btn"
          title="Go Forward"
        >
          ▶️
        </button>
        <button 
          onClick={refresh}
          className="nav-btn"
          title="Refresh"
        >
          🔄
        </button>
      </div>

      <div className="url-bar">
        <input
          type="text"
          value={currentUrl}
          onChange={(e) => setCurrentUrl(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && navigateToUrl(currentUrl)}
          placeholder="Enter URL or start a new environment..."
          className="url-input"
        />
        <button 
          onClick={() => navigateToUrl(currentUrl)}
          className="go-btn"
        >
          Go
        </button>
      </div>

      <div className="browser-actions">
        <button 
          onClick={toggleFullscreen}
          className="action-btn"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? '🪟' : '⛶'}
        </button>
        {mode === 'modal' && (
          <button 
            onClick={onClose}
            className="action-btn close-btn"
            title="Close Browser"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );

  const renderQuickLaunch = () => (
    <div className="quick-launch">
      <h4>🚀 Quick Launch Environments</h4>
      <div className="quick-launch-grid">
        {quickLaunchEnvironments.map((env) => (
          <button
            key={env.name}
            onClick={() => launchQuickEnvironment(env.type, env.framework)}
            className="quick-launch-btn"
            disabled={isLoading}
          >
            <span className="env-icon">{env.icon}</span>
            <span className="env-name">{env.name}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderBrowserContent = () => {
    if (error) {
      return (
        <div className="browser-error">
          <div className="error-content">
            <h3>🚫 Environment Error</h3>
            <p>{error}</p>
            <button onClick={refresh} className="retry-btn">
              🔄 Retry
            </button>
            {renderQuickLaunch()}
          </div>
        </div>
      );
    }

    if (!currentUrl || currentUrl === 'about:blank') {
      return (
        <div className="browser-welcome">
          <div className="welcome-content">
            <h2>🌟 Cloud Development Browser</h2>
            <p>Launch development environments in the cloud and access them right here!</p>
            {renderQuickLaunch()}
          </div>
        </div>
      );
    }

    return (
      <div className="browser-iframe-container">
        {isLoading && (
          <div className="browser-loading">
            <div className="loading-spinner"></div>
            <p>Loading environment...</p>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={currentUrl}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          className="cloud-browser-iframe"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
          title="Cloud Development Environment"
        />
      </div>
    );
  };

  // ==================== MAIN RENDER ====================

  const containerClass = `cloud-browser ${mode} ${className} ${isFullscreen ? 'fullscreen' : ''}`;

  return (
    <div ref={containerRef} className={containerClass}>
      {mode === 'modal' && <div className="modal-backdrop" onClick={onClose} />}
      
      <div className="cloud-browser-window">
        {renderBrowserControls()}
        {renderBrowserContent()}
        
        {environment && (
          <div className="environment-status">
            <span className={`status-indicator ${environment.status}`}>
              {environment.status === 'running' ? '🟢' : 
               environment.status === 'starting' ? '🟡' : 
               environment.status === 'error' ? '🔴' : '⚫'}
            </span>
            <span className="env-name">{environment.name}</span>
            <span className="env-type">{environment.framework}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CloudBrowser;
