import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import DevSandbox from './components/DevSandbox';
import MamaBearChat from './components/MamaBearChat'; 
import VertexGarden from './components/VertexGarden';
import MCPDiscovery from './components/MCPDiscovery';
import WorkspacesView from './components/workspaces/WorkspacesView'; // New Import
import ScoutProjectView from './components/scout_agent/ScoutProjectView'; // New Import
import api from './config/api'; // For health check

// Define the possible views the app can show
type ActiveView = 
  | 'MamaBearChat' 
  | 'DevSandbox' 
  | 'VertexGarden' 
  | 'MCPDiscovery'
  | 'Workspaces' // New View
  | 'ScoutAgentProject'; // New View for a specific project

function App() {
  const [activeView, setActiveView] = useState<ActiveView>('MamaBearChat'); // Default view
  const [backendStatus, setBackendStatus] = useState<string>('Checking...');
  const [backendSystems, setBackendSystems] = useState<any>(null);

  const checkBackendStatus = useCallback(async () => {
    console.log("App: Checking backend status...");
    try {
      const response = await api.get('/'); // Root health check endpoint
      if (response.data && response.data.success) {
        setBackendStatus(`Operational: ${response.data.status} (Agent: ${response.data.agent})`);
        setBackendSystems(response.data.systems || {});
      } else {
        setBackendStatus('Error: Could not connect or backend unhealthy.');
        setBackendSystems(null);
      }
    } catch (error) {
      console.error("App: Error checking backend status:", error);
      setBackendStatus('Error: Failed to connect to backend. Is it running?');
      setBackendSystems(null);
    }
  }, []);

  useEffect(() => {
    checkBackendStatus();
    // Optional: poll status periodically
    // const intervalId = setInterval(checkBackendStatus, 30000); // every 30 seconds
    // return () => clearInterval(intervalId);
  }, [checkBackendStatus]);

  const renderActiveView = () => {
    switch (activeView) {
      case 'MamaBearChat':
        return <MamaBearChat />;
      case 'DevSandbox':
        // DevSandbox might need specific props if its behavior changes based on backend capabilities
        return <DevSandbox 
                  isMamaBearAvailable={backendSystems?.mama_bear ?? false} 
                  isAgenticDevAvailable={backendSystems?.agentic_dev ?? false}
               />;
      case 'VertexGarden':
        return <VertexGarden />;
      case 'MCPDiscovery':
        return <MCPDiscovery />;
      case 'Workspaces': // New Case
        return <WorkspacesView />;
      case 'ScoutAgentProject': // New Case
        // For now, hardcode a project ID for testing.
        // In a real app, this would come from a project list/selection mechanism.
        return <ScoutProjectView projectId="test-project-alpha" />;
      default:
        return <p>Welcome to PodPlay Build! Select a feature from the sidebar.</p>;
    }
  };

  // Simple helper to render system status indicators
  const renderSystemStatus = (systemName: string, isAvailable: boolean | undefined) => {
    const statusText = isAvailable === undefined ? 'checking...' : (isAvailable ? '✅ Online' : '❌ Offline');
    const statusClass = isAvailable === undefined ? 'status-checking' : (isAvailable ? 'status-online' : 'status-offline');
    return <small>{systemName}: <span className={statusClass}>{statusText}</span></small>;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🐻 PodPlay Build - Mama Bear's Sanctuary 🏠</h1>
        <div className="backendStatus">
          Backend: {backendStatus}
          {backendSystems && (
            <div className="systemDetails">
              {renderSystemStatus('MamaBear (Vertex)', backendSystems.mama_bear)}
              {renderSystemStatus('Mem0 Chat', backendSystems.mem0_chat)}
              {renderSystemStatus('DevSandbox', backendSystems.dev_sandbox)}
              {renderSystemStatus('AgenticDev', backendSystems.agentic_dev)}
            </div>
          )}
        </div>
      </header>
      <div className="App-container">
        <nav className="App-sidebar">
          <h3>Navigation</h3>
          <button onClick={() => setActiveView('MamaBearChat')} className={activeView === 'MamaBearChat' ? 'active' : ''}>Mama Bear Chat</button>
          <button onClick={() => setActiveView('VertexGarden')} className={activeView === 'VertexGarden' ? 'active' : ''}>Vertex Garden</button>
          <button onClick={() => setActiveView('DevSandbox')} className={activeView === 'DevSandbox' ? 'active' : ''}>Dev Sandbox</button>
          <button onClick={() => setActiveView('MCPDiscovery')} className={activeView === 'MCPDiscovery' ? 'active' : ''}>MCP Discovery</button>
          <button onClick={() => setActiveView('Workspaces')} className={activeView === 'Workspaces' ? 'active' : ''}>Workspaces</button>
          <button onClick={() => setActiveView('ScoutAgentProject')} className={activeView === 'ScoutAgentProject' ? 'active' : ''}>Scout Agent (Test Project)</button>
          {/* Add more navigation buttons here as features grow */}
          <button onClick={checkBackendStatus} style={{marginTop: '20px'}}>Refresh Backend Status</button>
        </nav>
        <main className="App-mainContent">
          {renderActiveView()}
        </main>
      </div>
      <footer className="App-footer">
        <p>&copy; {new Date().getFullYear()} PodPlay Build - Your Sanctuary for Calm, Empowered Creation.</p>
      </footer>
    </div>
  );
}

export default App;
