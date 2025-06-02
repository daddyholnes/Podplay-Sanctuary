// filepath: /home/woody/Desktop/podplay-build-beta/frontend/src/App.tsx
import React, { useState } from 'react';
import './App.css';
import './EnhancedChat.css'; // For enhanced chat features

import MamaBearMainChat from './enhanced/mamabearmainchat';
import McpMarketplace from './enhanced/scout-mcp-marketplace';
import ScoutMultiModalChat from './enhanced/scout-multimodal-chat';
import WorkspaceLayout from './enhanced/scout-workspace-layout';
import DevWorkspaces from './enhanced/scoutdevworkspaces';

const RightPanelTabs = () => {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'multimodal' | 'dev'>('marketplace');
  return (
    <div className="flex flex-col h-full w-[420px] bg-slate-900/90 border-l border-purple-700/30">
      <div className="flex border-b border-purple-700/30">
        <button onClick={() => setActiveTab('marketplace')} className={`flex-1 py-2 ${activeTab==='marketplace' ? 'bg-purple-800/60 text-white' : 'bg-transparent text-purple-300'}`}>Marketplace</button>
        <button onClick={() => setActiveTab('multimodal')} className={`flex-1 py-2 ${activeTab==='multimodal' ? 'bg-purple-800/60 text-white' : 'bg-transparent text-purple-300'}`}>Multimodal Chat</button>
        <button onClick={() => setActiveTab('dev')} className={`flex-1 py-2 ${activeTab==='dev' ? 'bg-purple-800/60 text-white' : 'bg-transparent text-purple-300'}`}>Dev Workspaces</button>
      </div>
      <div className="flex-1 overflow-auto">
        {activeTab==='marketplace' && <McpMarketplace />}
        {activeTab==='multimodal' && <ScoutMultiModalChat />}
        {activeTab==='dev' && <DevWorkspaces />}
      </div>
    </div>
  );
};

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
    console.log('Checking backend connection at:', `${url}/api/test-connection`);
    try {
      const response = await fetch(`${url}/api/test-connection`, { 
        method: 'GET',
        timeout: 5000 
      } as any);
      
      console.log('Backend connection response:', response);
      if (response.ok) {
        const data = await response.json();
        console.log('Backend connection data:', data);
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
    // Try direct backend connection first, then fallback to proxy paths
    const urls = [
      'http://localhost:5000', // Direct backend connection
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

// ==================== MAIN APP COMPONENT ====================

const App: React.FC = () => {  
  const [isLoading, setIsLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(false);
  const [useLegacyMode, setUseLegacyMode] = useState(false);

  // Legacy navigation state for fallback mode
  const [activeView, setActiveView] = useState<'MamaBearControlCenter' | 'UnifiedDevelopmentHub' | 'ScoutDynamicWorkspace' | 'MiniAppLauncher'>('MamaBearControlCenter');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleBackendStatus = useCallback((isRunning: boolean) => {
    setBackendOnline(isRunning);
    setIsLoading(false);
  }, []);
  
  useEffect(() => {
    setIsLoading(false);
  }, [backendOnline]);

  // Legacy view renderer for fallback mode
  const renderLegacyView = () => {
    switch (activeView) {
      case 'MamaBearControlCenter':
        return <MamaBearControlCenter />;
      case 'UnifiedDevelopmentHub':
        return <UnifiedDevelopmentHub />;
      case 'ScoutDynamicWorkspace':
        return <ScoutDynamicWorkspace />;
      case 'MiniAppLauncher':
        return <MiniAppLauncher />;
      default:
        return <MamaBearControlCenter />;
    }
  };

  if (isLoading && backendOnline) {
    return (
      <div className="loading-sanctuary">
        <div className="loading-content">
          <h1>🐻 Mama Bear is preparing your sanctuary...</h1>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  // Use new unified workspace by default, with legacy fallback
  if (useLegacyMode) {
    return (
      <div className="app sanctuary-theme">
        <div className="legacy-mode-indicator">
          <button onClick={() => setUseLegacyMode(false)}>
            🚀 Switch to Unified Workspace
          </button>
        </div>
        
        {/* Legacy Sidebar */}
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
              className={`nav-tab ${activeView === 'MamaBearControlCenter' ? 'active' : ''}`}
              onClick={() => setActiveView('MamaBearControlCenter')}
              title="Mama Bear Control Center - Your AI Development Partner"
            >
              <span className="nav-icon">🐻</span>
              {!sidebarCollapsed && <span className="nav-label">Mama Bear Control Center</span>}
            </button>

            <button
              className={`nav-tab ${activeView === 'UnifiedDevelopmentHub' ? 'active' : ''}`}
              onClick={() => setActiveView('UnifiedDevelopmentHub')}
              title="Unified Development Hub - All Environment Types"
            >
              <span className="nav-icon">🏗️</span>
              {!sidebarCollapsed && <span className="nav-label">Unified Development Hub</span>}
            </button>

            <button
              className={`nav-tab ${activeView === 'ScoutDynamicWorkspace' ? 'active' : ''}`}
              onClick={() => setActiveView('ScoutDynamicWorkspace')}
              title="Scout Agent Workspace - Rocket Launch Experience"
            >
              <span className="nav-icon">🚀</span>
              {!sidebarCollapsed && <span className="nav-label">Scout Agent Workspace</span>}
            </button>

            <button
              className={`nav-tab ${activeView === 'MiniAppLauncher' ? 'active' : ''}`}
              onClick={() => setActiveView('MiniAppLauncher')}
              title="Mini Apps Launcher - Professional Tool Suite"
            >
              <span className="nav-icon">⚡</span>
              {!sidebarCollapsed && <span className="nav-label">Mini Apps Launcher</span>}
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

        <main className={`sanctuary-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          {renderLegacyView()}
        </main>
      </div>
    );
  }

  // Always render the new Unified Workspace Experience
  return (
    <DesignSystemProvider>
      <div className="flex h-screen w-screen bg-gradient-to-br from-purple-900 via-slate-900 to-blue-900">
        {/* Left: MamaBear persistent chat */}
        <div className="w-[360px] h-full border-r border-purple-700/30 bg-slate-900/80">
          <MamaBearMainChat />
        </div>
        {/* Center: Main Workspace */}
        <div className="flex-1 h-full overflow-auto">
          <WorkspaceLayout />
        </div>
        {/* Right: Tabs for Marketplace, Multimodal Chat, Dev Workspaces */}
        <RightPanelTabs />
      </div>
    </DesignSystemProvider>
        <button onClick={() => setActiveTab('marketplace')} className={`flex-1 py-2 ${activeTab==='marketplace' ? 'bg-purple-800/60 text-white' : 'bg-transparent text-purple-300'}`}>Marketplace</button>
        <button onClick={() => setActiveTab('multimodal')} className={`flex-1 py-2 ${activeTab==='multimodal' ? 'bg-purple-800/60 text-white' : 'bg-transparent text-purple-300'}`}>Multimodal Chat</button>
        <button onClick={() => setActiveTab('dev')} className={`flex-1 py-2 ${activeTab==='dev' ? 'bg-purple-800/60 text-white' : 'bg-transparent text-purple-300'}`}>Dev Workspaces</button>
      </div>
      <div className="flex-1 overflow-auto">
        {activeTab==='marketplace' && <McpMarketplace />}
        {activeTab==='multimodal' && <ScoutMultiModalChat />}
        {activeTab==='dev' && <DevWorkspaces />}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-purple-900 via-slate-900 to-blue-900">
      {/* Left: MamaBear persistent chat */}
      <div className="w-[360px] h-full border-r border-purple-700/30 bg-slate-900/80">
        <MamaBearMainChat />
      </div>
      {/* Center: Main Workspace */}
      <div className="flex-1 h-full overflow-auto">
        <WorkspaceLayout />
      </div>
      {/* Right: Tabs for Marketplace, Multimodal Chat, Dev Workspaces */}
      <RightPanelTabs />
    </div>
  );
}