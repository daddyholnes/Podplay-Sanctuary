
import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { useSocket } from './hooks/useSocket';

import Navigation from './components/Navigation';
import GlobalChatBar from './components/GlobalChatBar';
import MamaBearHub from './pages/MamaBearHub';
import VertexGarden from './pages/VertexGarden';
import MiniAppsLauncher from './pages/MiniAppsLauncher';
import DynamicWorkspaceCenter from './pages/DynamicWorkspaceCenter';
import ScoutAgentPage from './pages/ScoutAgent/ScoutAgentPage'; // Changed name to avoid conflict
import { SECTIONS } from './utils/constants';

const App: React.FC = () => {
  const { theme, setCurrentSection, currentSection } = useAppStore();
  const socket = useSocket(); // Initialize socket connection
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  useEffect(() => {
    const currentPath = location.pathname;
    const activeSection = SECTIONS.find(s => s.path === currentPath);
    if (activeSection && activeSection.id !== currentSection) {
      setCurrentSection(activeSection.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, setCurrentSection]); // Removed currentSection to avoid potential loops

  // Example: Join a room based on current section or user ID
  useEffect(() => {
    if (socket && currentSection) {
      socket.emit('join_room', { room: currentSection, userId: 'nathan' });
      console.log(`Socket joining room: ${currentSection}`);
    }
  }, [socket, currentSection]);

  return (
    <div className="app-container flex flex-col min-h-screen bg-primary-bg text-text-primary">
      <Navigation />
      <main className="main-content flex-grow overflow-y-auto pt-4 pb-24 md:pb-28"> {/* Added padding for GlobalChatBar */}
        <div className="container mx-auto px-4">
          <Routes>
            <Route path="/" element={<MamaBearHub />} />
            <Route path="/vertex-garden" element={<VertexGarden />} />
            <Route path="/mini-apps" element={<MiniAppsLauncher />} />
            <Route path="/workspaces" element={<DynamicWorkspaceCenter />} />
            <Route path="/scout" element={<ScoutAgentPage />} />
            {/* Add a fallback route for unknown paths */}
            <Route path="*" element={<div className="text-center py-10"><h2>404 - Page Not Found</h2><p>The page you are looking for does not exist.</p></div>} />
          </Routes>
        </div>
      </main>
      <GlobalChatBar />
    </div>
  );
};

export default App;
