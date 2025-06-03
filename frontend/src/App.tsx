import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useThemeStore } from '@/stores';
import Layout from '@/components/Layout';
import MainChat from '@/pages/MainChat';
import ScoutAgent from '@/pages/ScoutAgent';
import MultiModalChat from '@/pages/MultiModalChat';
import DevWorkspaces from '@/pages/DevWorkspaces';
import MCPMarketplace from '@/pages/MCPMarketplace';
import MiniApps from '@/pages/MiniApps';

// Create a query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const { theme, sensoryMode } = useThemeStore();

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('light', 'dark', 'purple-neon');
    
    // Add current theme class
    root.classList.add(theme);
    
    // Apply sensory mode
    if (sensoryMode) {
      root.classList.add('sensory-mode');
    } else {
      root.classList.remove('sensory-mode');
    }
  }, [theme, sensoryMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className={`min-h-screen transition-colors duration-300 ${
          theme === 'light' 
            ? 'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50' 
            : theme === 'dark'
            ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
            : 'bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900'
        }`}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/chat" replace />} />
              <Route path="chat" element={<MainChat />} />
              <Route path="scout" element={<ScoutAgent />} />
              <Route path="multi-chat" element={<MultiModalChat />} />
              <Route path="workspaces" element={<DevWorkspaces />} />
              <Route path="marketplace" element={<MCPMarketplace />} />
              <Route path="mini-apps" element={<MiniApps />} />
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;