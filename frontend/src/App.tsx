// filepath: /home/woody/Desktop/podplay-build-beta/frontend/src/App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import './EnhancedChat.css'; // For EnhancedChatInterface if used
// Existing views
import EnhancedChatInterface from './EnhancedChatInterface'; 
import VertexGardenChat from './VertexGardenChat';
import DevSandbox from './DevSandbox'; 
// New Views
import WorkspacesView from './components/workspaces/WorkspacesView';
import ScoutProjectView from './components/scout_agent/ScoutProjectView';
import ScoutDynamicWorkspace from './components/scout_agent/ScoutDynamicWorkspace';
import MiniAppLauncher from './components/MiniAppLauncher';

import { API_BASE_URL, buildApiUrl, API_ENDPOINTS } from './config/api';

// ==================== ELECTRON INTEGRATION ====================

// Type declarations for Electron API
declare global {
  interface Window {
    electronAPI?: {
      getAppInfo: () => Promise<{
        version: string;
        name: string;
        isBackendRunning: boolean;
        backendUrl: string;
      }>;
      restartBackend: () => Promise<void>;
      checkBackendStatus: () => Promise<void>;
      openExternal: (url: string) => Promise<void>;
      getSetting: (key: string, defaultValue: any) => Promise<any>;
      setSetting: (key: string, value: any) => Promise<void>;
      onFileSelected: (callback: (event: any, filePath: string) => void) => void;
      onShowNotification: (callback: (event: any, data: {title: string, body: string}) => void) => void;
      onShowSettings: (callback: (event: any) => void) => void;
      onNewChat: (callback: (event: any) => void) => void;
      removeAllListeners: (channel: string) => void;
    };
    isElectron?: boolean;
  }
}

// ==================== ELECTRON STATUS COMPONENT ====================

const ElectronStatus: React.FC = () => {
  const [electronInfo, setElectronInfo] = useState<{
    version: string;
    name: string;
    isBackendRunning: boolean;
    backendUrl: string;
  } | null>(null);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getAppInfo().then(setElectronInfo);
      
      // Setup Electron event listeners
      window.electronAPI.onShowNotification((_event, data) => {
        // Create desktop notification
        if (Notification.permission === 'granted') {
          new Notification(data.title, { body: data.body });
        }
      });

      return () => {
        window.electronAPI?.removeAllListeners('show-notification');
      };
    }
  }, []);

  if (!window.isElectron) return null;

  return (
    <div className="electron-status">
      <button 
        className="electron-toggle-btn"
        onClick={() => setShowStatus(!showStatus)}
        title="Desktop App Status"
      >
        🖥️ Desktop
      </button>
      
      {showStatus && electronInfo && (
        <div className="electron-status-panel">
          <h4>🐻 {electronInfo.name}</h4>
          <p>Version: {electronInfo.version}</p>
          <p>Backend: {electronInfo.isBackendRunning ? '✅ Running' : '❌ Stopped'}</p>
          <p>URL: {electronInfo.backendUrl}</p>
          
          <div className="electron-actions">
            <button 
              onClick={() => window.electronAPI?.restartBackend()}
              className="restart-backend-btn"
            >
              🔄 Restart Backend
            </button>
            <button 
              onClick={() => window.electronAPI?.checkBackendStatus()}
              className="check-status-btn"
            >
              📡 Check Status
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== BACKEND CONNECTION MANAGER ====================

const BackendConnectionManager: React.FC<{
  onBackendStatus: (isRunning: boolean) => void;
}> = ({ onBackendStatus }) => {
  const [backendUrl, setBackendUrl] = useState(API_BASE_URL);
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [showManualConfig, setShowManualConfig] = useState(false);

  const checkBackendConnection = async (url: string = backendUrl) => {
    setIsChecking(true);
    try {
      const response = await fetch(`${url}/`, { 
        method: 'GET',
        timeout: 5000 
      } as any);
      
      if (response.ok) {
        setIsConnected(true);
        onBackendStatus(true);
        return true;
      }
    } catch (error) {
      console.log('Backend not reachable:', error);
    }
    
    setIsConnected(false);
    onBackendStatus(false);
    setIsChecking(false);
    return false;
  };

  const startLocalBackend = async () => {
    if (window.electronAPI) {
      try {
        await window.electronAPI.restartBackend();
        // Wait a moment then check connection
        setTimeout(() => checkBackendConnection(), 3000);
      } catch (error) {
        console.error('Failed to start backend:', error);
      }
    } else {
      // Show instructions for manual backend start
      alert('Please start the backend manually:\n\ncd backend\nsource venv/bin/activate\npython app.py');
    }
  };

  useEffect(() => {
    // Use relative paths in Codespaces to avoid mixed content issues
    const urls = [
      '', // Empty for relative paths through Vite proxy
      '/api', // API path through proxy
      '/api/', // API path with trailing slash
      '/' // Root path fallback
    ];

    const tryUrls = async () => {
      for (const url of urls) {
        if (await checkBackendConnection(url)) {
          setBackendUrl(url);
          break;
        }
      }
    };

    tryUrls();
  }, []);

  if (isConnected) {
    return (
      <div className="backend-status connected">
        <span>✅ Backend: <span className="url-text">{backendUrl}</span></span>
        <button onClick={() => checkBackendConnection()} className="refresh-btn">
          🔄
        </button>
      </div>
    );
  }

  return (
    <div className="backend-status disconnected">
      <div className="connection-issue">
        <span>❌ Backend Not Connected</span>
        <div className="connection-actions">
          <button 
            onClick={startLocalBackend}
            className="start-backend-btn"
            disabled={isChecking}
          >
            {isChecking ? '🔄 Starting...' : '🚀 Start'}
          </button>
          <button 
            onClick={() => setShowManualConfig(!showManualConfig)}
            className="manual-config-btn"
          >
            ⚙️ Config
          </button>
        </div>
      </div>

      {showManualConfig && (
        <div className="manual-config">
          <label>
            Backend URL:
            <input
              type="url"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              placeholder="http://localhost:5000"
            />
          </label>
          <button onClick={() => checkBackendConnection(backendUrl)}>
            Test Connection
          </button>
        </div>
      )}
    </div>
  );
};

// ==================== COMPONENT INTERFACES ====================

interface MCPServer {
  id: number;
  name: string;
  description: string;
  repository_url: string;
  category: string;
  author: string;
  version: string;
  installation_method: string;
  capabilities: string[];
  dependencies: string[];
  configuration_schema: any;
  popularity_score: number;
  last_updated: string;
  is_official: boolean;
  is_installed: boolean;
  installation_status: string;
  tags: string[];
}

interface DailyBriefing {
  date: string;
  new_mcp_tools: MCPServer[];
  updated_models: Array<{name: string; update: string}>;
  project_priorities: string[];
  recommendations: string[];
  system_status: {
    installed_mcp_servers: number;
    available_mcp_servers: number;
    sanctuary_health: string;
  };
}

// ==================== MAMA BEAR GREETING COMPONENT ====================

const MamaBearGreeting: React.FC<{briefing: DailyBriefing | null}> = ({ briefing }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="mama-bear-greeting">
      <div className="greeting-header">
        <h1>🐻 {getGreeting()}, Nathan</h1>
        <p className="sanctuary-subtitle">Welcome to your sanctuary for calm, empowered creation</p>
      </div>
      
      {briefing && (
        <div className="daily-briefing">
          <div className="briefing-section">
            <h3>☕ Today's Coffee Break Update</h3>
            <div className="briefing-grid">
              <div className="briefing-card">
                <h4>🆕 New MCP Tools</h4>
                <p>{briefing.new_mcp_tools.length} new tools discovered</p>
                {briefing.new_mcp_tools.slice(0, 2).map(tool => (
                  <div key={tool.name} className="tool-preview">
                    <span className="tool-name">{tool.name}</span>
                    <span className="tool-category">{tool.category}</span>
                  </div>
                ))}
              </div>
              
              <div className="briefing-card">
                <h4>🎯 Today's Priorities</h4>
                {briefing.project_priorities.length > 0 ? (
                  briefing.project_priorities.slice(0, 3).map((priority, index) => (
                    <div key={index} className="priority-item">
                      <span className="priority-number">{index + 1}</span>
                      <span className="priority-text">{priority}</span>
                    </div>
                  ))
                ) : (
                  <p className="no-priorities">No active priorities - perfect time to explore!</p>
                )}
              </div>
              
              <div className="briefing-card">
                <h4>💡 Mama Bear's Recommendations</h4>
                {briefing.recommendations.slice(0, 2).map((rec, index) => (
                  <div key={index} className="recommendation">
                    <span className="rec-icon">💡</span>
                    <span className="rec-text">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== MCP MARKETPLACE COMPONENT ====================

const MCPMarketplace: React.FC = () => {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showOfficialOnly, setShowOfficialOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Array<{value: string; label: string}>>([]);

  const searchServers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        query: searchQuery,
        ...(selectedCategory && { category: selectedCategory }),
        official_only: showOfficialOnly.toString()
      });

      const response = await fetch(`${buildApiUrl(API_ENDPOINTS.MCP.SEARCH)}?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setServers(data.servers);
      }
    } catch (error) {
      console.error('Error searching MCP servers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const installServer = async (serverName: string) => {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.MCP.INSTALL), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ server_name: serverName })
      });
      
      const data = await response.json();
      if (data.success) {
        // Update local state
        setServers(servers.map(server => 
          server.name === serverName 
            ? { ...server, is_installed: true, installation_status: 'installed' }
            : server
        ));
        alert(`🐻 Mama Bear: ${data.message}`);
      }
    } catch (error) {
      console.error('Error installing server:', error);
    }
  };

  useEffect(() => {
    // Load categories
    fetch(buildApiUrl(API_ENDPOINTS.MCP.CATEGORIES))
      .then(res => res.json())
      .then(data => {
        if (data.success) setCategories(data.categories);
      });

    // Initial search
    searchServers();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchServers();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, showOfficialOnly]);

  return (
    <div className="mcp-marketplace">
      <div className="marketplace-header">
        <h2>🛠️ MCP Marketplace</h2>
        <p>Discover and install Model Context Protocol servers</p>
      </div>

      <div className="search-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search MCP servers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <label className="official-filter">
            <input
              type="checkbox"
              checked={showOfficialOnly}
              onChange={(e) => setShowOfficialOnly(e.target.checked)}
            />
            Official Only
          </label>
        </div>
      </div>

      <div className="servers-grid">
        {isLoading ? (
          <div className="loading">🐻 Mama Bear is searching...</div>
        ) : (
          servers.map(server => (
            <div key={server.id} className={`server-card ${server.is_installed ? 'installed' : ''}`}>
              <div className="server-header">
                <h3 className="server-name">
                  {server.name}
                  {server.is_official && <span className="official-badge">✨ Official</span>}
                </h3>
                <div className="server-meta">
                  <span className="server-author">by {server.author}</span>
                  <span className="server-version">v{server.version}</span>
                </div>
              </div>

              <p className="server-description">{server.description}</p>

              <div className="server-details">
                <div className="capabilities">
                  <h4>Capabilities</h4>
                  <div className="capability-tags">
                    {server.capabilities.slice(0, 3).map(cap => (
                      <span key={cap} className="capability-tag">{cap}</span>
                    ))}
                    {server.capabilities.length > 3 && (
                      <span className="more-capabilities">+{server.capabilities.length - 3} more</span>
                    )}
                  </div>
                </div>

                <div className="server-tags">
                  {server.tags.map(tag => (
                    <span key={tag} className="server-tag">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="server-actions">
                <div className="server-stats">
                  <span className="popularity">⭐ {server.popularity_score}</span>
                  <span className="category">{server.category.replace('_', ' ')}</span>
                </div>

                {server.is_installed ? (
                  <span className="installed-status">✅ Installed</span>
                ) : (
                  <button
                    onClick={() => installServer(server.name)}
                    className="install-button"
                  >
                    🐻 Install with Mama Bear
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ==================== HYPERBUBBLE DISCOVERY COMPONENT ====================

const HyperbubbleDiscovery: React.FC = () => {
  const [trendingServers, setTrendingServers] = useState<MCPServer[]>([]);
  const [recommendations, setRecommendations] = useState<MCPServer[]>([]);
  const [projectType, setProjectType] = useState('web_development');

  useEffect(() => {
    fetch(`${buildApiUrl(API_ENDPOINTS.MCP.DISCOVER)}?project_type=${projectType}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTrendingServers(data.trending);
          setRecommendations(data.recommendations);
        }
      });
  }, [projectType]);

  return (
    <div className="hyperbubble-discovery">
      <div className="discovery-header">
        <h2>🔮 Discovery Hyperbubbles</h2>
        <p>Trending tools and personalized recommendations</p>
      </div>

      <div className="project-type-selector">
        <label>Project Focus:</label>
        <select
          value={projectType}
          onChange={(e) => setProjectType(e.target.value)}
          className="project-select"
        >
          <option value="web_development">Web Development</option>
          <option value="data_science">Data Science</option>
          <option value="devops">DevOps</option>
          <option value="content_management">Content Management</option>
        </select>
      </div>

      <div className="discovery-sections">
        <div className="discovery-section">
          <h3>🔥 Trending Now</h3>
          <div className="hyperbubbles">
            {trendingServers.slice(0, 6).map(server => (
              <div key={server.name} className="hyperbubble">
                <div className="bubble-content">
                  <h4>{server.name}</h4>
                  <p>{server.description.substring(0, 80)}...</p>
                  <div className="bubble-stats">
                    <span>⭐ {server.popularity_score}</span>
                    <span className={`status ${server.is_installed ? 'installed' : 'available'}`}>
                      {server.is_installed ? '✅' : '📦'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="discovery-section">
          <h3>💡 Mama Bear's Picks for {projectType.replace('_', ' ')}</h3>
          <div className="hyperbubbles">
            {recommendations.map(server => (
              <div key={server.name} className="hyperbubble recommended">
                <div className="bubble-content">
                  <h4>{server.name}</h4>
                  <p>{server.description.substring(0, 80)}...</p>
                  <div className="bubble-stats">
                    <span>⭐ {server.popularity_score}</span>
                    <span className={`status ${server.is_installed ? 'installed' : 'available'}`}>
                      {server.is_installed ? '✅' : '📦'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN APP COMPONENT ====================

// Define the possible views for type safety
type ActiveView = 
  | 'Sanctuary' 
  | 'Marketplace' 
  | 'Discovery' 
  | 'MamaBear' 
  | 'VertexChat' 
  | 'DevSandbox'
  | 'Workspaces' // New View
  | 'ScoutAgentProject' // New View
  | 'ScoutDynamicWorkspace' // Dynamic Workspace
  | 'MiniAppLauncher'; // Cherry Studio inspired mini apps

const App: React.FC = () => {
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('Sanctuary'); 
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);

  // For ScoutAgentProject view, we'll need a project ID.
  // For now, hardcode one for testing. In a real app, this would come from a list/selection.
  const [currentScoutProjectId] = useState<string>("test-project-alpha");

  const handleBackendStatus = useCallback((isRunning: boolean) => {
    setBackendOnline(isRunning);
    // Potentially fetch briefing only if backend is online
    if (isRunning && !briefing) {
      fetchBriefing();
    }
  }, [briefing]); // Dependency on briefing to avoid re-fetching if already loaded

  const fetchBriefing = async () => {
    console.log("Attempting to fetch briefing from:", buildApiUrl(API_ENDPOINTS.MAMA_BEAR.BRIEFING));
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.MAMA_BEAR.BRIEFING));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.briefing) {
        setBriefing(data.briefing);
      } else {
        console.warn("Failed to parse briefing data:", data.error || "Unknown error");
        setBriefing(null); // Set to null or an empty state on failure
      }
    } catch (error) {
      console.error('Error loading briefing:', error);
      setBriefing(null); // Set to null or an empty state on error
    } finally {
      setIsLoading(false); // Initial loading complete even if briefing fails
    }
  };
  
  useEffect(() => {
    // BackendConnectionManager will call handleBackendStatus, which then calls fetchBriefing
    // So, direct call to fetchBriefing here might be redundant if BackendConnectionManager is quick.
    // However, keeping it for initial load if BackendConnectionManager takes time or is bypassed.
    if (backendOnline && !briefing) { // Only fetch if online and no briefing yet
        fetchBriefing();
    } else if (!backendOnline) {
        setIsLoading(false); // If backend is offline, don't hang on loading
    }
  }, [backendOnline, briefing]);

  const renderActiveView = () => {
    switch (activeView) {
            case 'Sanctuary':
        return <MamaBearGreeting briefing={briefing} />;
      case 'Marketplace':
        return <MCPMarketplace />;
      case 'Discovery':
        return <HyperbubbleDiscovery />;
      case 'MamaBear':
        return <EnhancedChatInterface />;
      case 'VertexChat':
        return <VertexGardenChat />;
      case 'DevSandbox':
        return <DevSandbox />;
      case 'Workspaces': // New Case
        return <WorkspacesView />;
      case 'ScoutAgentProject': // New Case
        return <ScoutProjectView projectId={currentScoutProjectId} />;
      case 'ScoutDynamicWorkspace': // Dynamic Workspace
        return <ScoutDynamicWorkspace />;
      case 'MiniAppLauncher': // Cherry Studio inspired mini apps
        return <MiniAppLauncher />;
      default:
        return <MamaBearGreeting briefing={briefing} />; // Fallback view
    }
  };

  if (isLoading && !briefing && backendOnline) { // Refined loading condition
    return (
      <div className="loading-sanctuary">
        <div className="loading-content">
          <h1>🐻 Mama Bear is preparing your sanctuary...</h1>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="app sanctuary-theme">
      {/* Left Sidebar */}
      <div className={`sanctuary-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="nav-brand">
            <h1>🏠 Podplay Build</h1>
            <p>Mama Bear Gem</p>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <button
            className={`nav-tab ${activeView === 'Sanctuary' ? 'active' : ''}`}
            onClick={() => setActiveView('Sanctuary')}
            title="Sanctuary"
          >
            <span className="nav-icon">🏠</span>
            {!sidebarCollapsed && <span className="nav-label">Sanctuary</span>}
          </button>
          <button
            className={`nav-tab ${activeView === 'Marketplace' ? 'active' : ''}`}
            onClick={() => setActiveView('Marketplace')}
            title="Marketplace"
          >
            <span className="nav-icon">🛠️</span>
            {!sidebarCollapsed && <span className="nav-label">Marketplace</span>}
          </button>
          <button
            className={`nav-tab ${activeView === 'Discovery' ? 'active' : ''}`}
            onClick={() => setActiveView('Discovery')}
            title="Discovery"
          >
            <span className="nav-icon">🔮</span>
            {!sidebarCollapsed && <span className="nav-label">Discovery</span>}
          </button>
          <button
            className={`nav-tab ${activeView === 'MamaBear' ? 'active' : ''}`}
            onClick={() => setActiveView('MamaBear')}
            title="Mama Bear Agent"
          >
            <span className="nav-icon">🐻</span>
            {!sidebarCollapsed && <span className="nav-label">Mama Bear</span>}
          </button>
          <button
            className={`nav-tab ${activeView === 'VertexChat' ? 'active' : ''}`}
            onClick={() => setActiveView('VertexChat')}
            title="Multi-Model Chat"
          >
            <span className="nav-icon">🌟</span>
            {!sidebarCollapsed && <span className="nav-label">Multi-Model</span>}
          </button>
          <button
            className={`nav-tab ${activeView === 'DevSandbox' ? 'active' : ''}`}
            onClick={() => setActiveView('DevSandbox')}
            title="Development Environments"
          >
            <span className="nav-icon">🏗️</span>
            {!sidebarCollapsed && <span className="nav-label">Dev Environments</span>}
          </button>
          {/* NEW NAVIGATION BUTTONS */}
          <button
            className={`nav-tab ${activeView === 'Workspaces' ? 'active' : ''}`}
            onClick={() => setActiveView('Workspaces')}
            title="NixOS Workspaces"
          >
            <span className="nav-icon">❄️</span>
            {!sidebarCollapsed && <span className="nav-label">Workspaces</span>}
          </button>
          <button
            className={`nav-tab ${activeView === 'ScoutAgentProject' ? 'active' : ''}`}
            onClick={() => setActiveView('ScoutAgentProject')}
            title="Scout Agent"
          >
            <span className="nav-icon">🤖</span>
            {!sidebarCollapsed && <span className="nav-label">Scout Agent</span>}
          </button>
          <button
            className={`nav-tab ${activeView === 'ScoutDynamicWorkspace' ? 'active' : ''}`}
            onClick={() => setActiveView('ScoutDynamicWorkspace')}
            title="Dynamic Workspace - scout.new inspired"
          >
            <span className="nav-icon">🐻</span>
            {!sidebarCollapsed && <span className="nav-label">Dynamic Workspace</span>}
          </button>
          <button
            className={`nav-tab ${activeView === 'MiniAppLauncher' ? 'active' : ''}`}
            onClick={() => setActiveView('MiniAppLauncher')}
            title="Mini App Launcher - Cherry Studio inspired"
          >
            <span className="nav-icon">🚀</span>
            {!sidebarCollapsed && <span className="nav-label">Mini Apps</span>}
          </button>
        </nav>
        
        {!sidebarCollapsed && (
          <div className="sidebar-footer">
            <ElectronStatus />
            <BackendConnectionManager onBackendStatus={handleBackendStatus} />
            <div className="sidebar-motto">
              <p>🐻 Your creative sanctuary</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <main className={`sanctuary-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {activeView === 'Sanctuary' && (
          <div className="sanctuary-view">
            <MamaBearGreeting briefing={briefing} />
            
            <div className="sanctuary-status">
              <h2>🏠 Sanctuary Status</h2>
              {briefing && (
                <div className="status-grid">
                  <div className="status-card">
                    <h3>🛠️ MCP Tools</h3>
                    <p className="status-number">{briefing.system_status.installed_mcp_servers}</p>
                    <p className="status-label">Active Tools</p>
                  </div>
                  <div className="status-card">
                    <h3>🔍 Available</h3>
                    <p className="status-number">{briefing.system_status.available_mcp_servers}</p>
                    <p className="status-label">Tools to Explore</p>
                  </div>
                  <div className="status-card">
                    <h3>💚 Health</h3>
                    <p className="status-number">{briefing.system_status.sanctuary_health}</p>
                    <p className="status-label">System Status</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Render views using the helper function */}
        {activeView !== 'Sanctuary' && renderActiveView()}
      </main>
    </div>
  );
};

export default App;