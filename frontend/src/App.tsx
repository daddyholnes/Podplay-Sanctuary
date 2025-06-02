import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import AppLayout from '@/components/layout/AppLayout';

// Enhanced modules
import MamaBearMainChat from '@/enhanced/mama-bear-main-chat/MamaBearMainChat';
import ScoutMultiModalChat from '@/enhanced/scout-multimodal-chat/ScoutMultiModalChat';
import ScoutDevWorkspaces from '@/enhanced/scout-dev-workspaces/ScoutDevWorkspaces';
import ScoutMcpMarketplace from '@/enhanced/scout-mcp-marketplace/ScoutMcpMarketplace';
import ScoutMiniAppsHub from '@/enhanced/scout-miniapps-hub/ScoutMiniAppsHub';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking authentication and loading essential data
    const initializeApp = async () => {
      try {
        // Add any initialization logic here
        setTimeout(() => setIsLoading(false), 800); // Simulated loading time
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-sanctuary-light dark:bg-sanctuary-dark">
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-purple-400 border-t-purple-600"></div>
          </div>
          <h2 className="text-xl font-semibold text-purple-700 dark:text-purple-300">
            Loading your sanctuary...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/mama-bear" replace />} />
            <Route path="/mama-bear" element={<MamaBearMainChat />} />
            <Route path="/scout-chat" element={<ScoutMultiModalChat />} />
            <Route path="/workspaces" element={<ScoutDevWorkspaces />} />
            <Route path="/mcp-marketplace" element={<ScoutMcpMarketplace />} />
            <Route path="/mini-apps" element={<ScoutMiniAppsHub />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
