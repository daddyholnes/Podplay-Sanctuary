import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { MamaBearMainChat } from './pages/MamaBearMainChat';
import { ScoutMultimodalChat } from './pages/ScoutMultimodalChat';
import { ScoutDevWorkspaces } from './pages/ScoutDevWorkspaces';
import ScoutMiniappsHub from './pages/ScoutMiniappsHub';
import ScoutMcpMarketplace from './pages/ScoutMcpMarketplace';
import ScoutWorkspaceLayout from './pages/ScoutWorkspaceLayout';
import IntegrationWorkbench from './pages/IntegrationWorkbench';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<MamaBearMainChat />} />
            <Route path="/scout-chat" element={<ScoutMultimodalChat />} />
            <Route path="/workspaces" element={<ScoutDevWorkspaces />} />
            <Route path="/miniapps" element={<ScoutMiniappsHub />} />
            <Route path="/marketplace" element={<ScoutMcpMarketplace />} />
            <Route path="/workflow" element={<ScoutWorkspaceLayout />} />
            <Route path="/integration-workbench" element={<IntegrationWorkbench />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
