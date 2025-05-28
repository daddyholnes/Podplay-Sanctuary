// filepath: /home/woody/Desktop/podplay-build-beta/frontend/src/App.tsx
import React, { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import './App.css'; // Keep general app styles
import './components/Layout.css'; // Import the new layout styles
import ErrorBoundary from './components/ErrorBoundary';
// Import new panel components (assuming they are in frontend/src/components/)
import ChatPanel from './components/ChatPanel';
import FileExplorerPanel from './components/FileExplorerPanel';
import CodeEditorPanel from './components/CodeEditorPanel';
import LivePreviewPanel from './components/LivePreviewPanel';
import TerminalPanel from './components/TerminalPanel';
import AgentTimelinePanel from './components/AgentTimelinePanel';

// BackendConnectionManager can be kept if needed for backend status indication
// For now, we'll remove it to simplify the layout implementation.
// import { API_BASE_URL } from './config/api';
// import { notify } from './services/notificationService';

const App: React.FC = () => {
  // State for panel visibility
  const [isFileExplorerVisible, setIsFileExplorerVisible] = useState(true);
  const [isAgentTimelineVisible, setIsAgentTimelineVisible] = useState(true);
  const [isChatPanelVisible, setIsChatPanelVisible] = useState(true);
  const [isTerminalPanelVisible, setIsTerminalPanelVisible] = useState(true);
  const [isLivePreviewVisible, setIsLivePreviewVisible] = useState(true);

  // The old states like briefing, activeView, isLoading, sidebarCollapsed, backendOnline, currentScoutProjectId
  // are removed as they are related to the old view-switching logic.
  // The BackendConnectionManager and its related logic are also removed for simplicity in this step.
  // If backend status is still needed, it can be re-integrated later.

  // The fetchBriefing and renderActiveView methods are removed as they belong to the old layout.

  // Basic loading state, can be expanded later
  const [appLoading, setAppLoading] = useState(true);
  useEffect(() => {
    // Simulate app loading
    setTimeout(() => setAppLoading(false), 500); 
  }, []);

  if (appLoading) {
    return (
      <div className="loading-sanctuary">
        <div className="loading-content">
          <h1>🐻 Mama Bear IDE is initializing...</h1>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="app-ide-layout">
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        
        <header className="ide-header">
          <h1>Mama Bear IDE 🐻</h1>
          {/* Add global controls or status indicators here later */}
          <div className="panel-toggles">
            <button onClick={() => setIsFileExplorerVisible(!isFileExplorerVisible)}>
              {isFileExplorerVisible ? 'Hide' : 'Show'} Files
            </button>
            <button onClick={() => setIsAgentTimelineVisible(!isAgentTimelineVisible)}>
              {isAgentTimelineVisible ? 'Hide' : 'Show'} Timeline
            </button>
            <button onClick={() => setIsLivePreviewVisible(!isLivePreviewVisible)}>
              {isLivePreviewVisible ? 'Hide' : 'Show'} Preview
            </button>
            <button onClick={() => setIsTerminalPanelVisible(!isTerminalPanelVisible)}>
              {isTerminalPanelVisible ? 'Hide' : 'Show'} Terminal
            </button>
            <button onClick={() => setIsChatPanelVisible(!isChatPanelVisible)}>
              {isChatPanelVisible ? 'Hide' : 'Show'} Chat
            </button>
          </div>
        </header>

        <div className="main-content-area">
          <div className={`left-sidebar-area ${(!isFileExplorerVisible && !isAgentTimelineVisible) ? 'hidden' : ''}`}>
            {isFileExplorerVisible && <FileExplorerPanel />}
            {isAgentTimelineVisible && <AgentTimelinePanel />}
          </div>

          <div className="center-area">
            <div className="editor-preview-area">
              <CodeEditorPanel />
              {isLivePreviewVisible && <LivePreviewPanel />}
            </div>
            <div className={`terminal-panel-container ${!isTerminalPanelVisible ? 'hidden' : ''}`}>
              {isTerminalPanelVisible && <TerminalPanel />}
            </div>
          </div>

          <div className={`chat-panel-container ${!isChatPanelVisible ? 'hidden' : ''}`}>
            {isChatPanelVisible && <ChatPanel />}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;