import { useState, useEffect, ComponentType } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { WindowProvider, WindowRegistry } from '@/enhanced/window-management/WindowContext';
import AppLayout from '@/components/layout/AppLayout';

// Agent state types from AgentWindowBridge
interface AgentState {
  messages: Array<{role: string, content: string}>;
  isLoading: boolean;
  error: string | null;
}

// Wrapper for legacy route components to provide agent props
interface LegacyAgentWrapperProps {
  Component: ComponentType<any>;
  agentType: string;
}

// LegacyAgentWrapper bridges between route-based components and agent-window system
const LegacyAgentWrapper = ({ Component, agentType }: LegacyAgentWrapperProps) => {
  const [agentState, setAgentState] = useState<AgentState>({
    messages: [],
    isLoading: false,
    error: null
  });

  const updateAgentState = (update: Partial<AgentState>) => {
    setAgentState(prev => ({ ...prev, ...update }));
  };

  return (
    <Component 
      agentType={agentType}
      agentState={agentState}
      updateAgentState={updateAgentState}
    />
  );
};

// Agent Window Bridge for multi-agent coordination
import AgentWindowBridge from '@/enhanced/agent-integration/AgentWindowBridge';

// MamaBear Agent Components
import {
  MamaBearMainChat,
  MamaBearScout,
  MamaBearDevWorkspace,
  MamaBearMCP,
  MamaBearIntegrationWorkbench
} from '@/enhanced/mama-bear-agents';

// Legacy Scout Components (will be gradually replaced by MamaBear agents)
import ScoutMultiModalChat from '@/enhanced/scout-multimodal-chat/ScoutMultiModalChat';
import ScoutDevWorkspaces from '@/enhanced/scout-dev-workspaces/ScoutDevWorkspaces';
import ScoutMcpMarketplace from '@/enhanced/scout-mcp-marketplace/ScoutMcpMarketplace';
import ScoutMiniAppsHub from '@/enhanced/scout-mini-apps/ScoutMiniAppsHub';

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

  // Register MamaBear components with the window system
  useEffect(() => {
    WindowRegistry.registerComponent('MamaBearMainChat', MamaBearMainChat);
    WindowRegistry.registerComponent('MamaBearScout', MamaBearScout);
    WindowRegistry.registerComponent('MamaBearDevWorkspace', MamaBearDevWorkspace);
    WindowRegistry.registerComponent('MamaBearMCP', MamaBearMCP);
    WindowRegistry.registerComponent('MamaBearIntegrationWorkbench', MamaBearIntegrationWorkbench);
  }, []);

  return (
    <ThemeProvider>
      <SocketProvider>
        <WindowProvider>
          <BrowserRouter>
            {/* Agent Window Bridge provides multi-agent coordination */}
            <AgentWindowBridge />
            
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/mama-bear" replace />} />
                {/* Legacy routes - will eventually use window management exclusively */}
                <Route path="/mama-bear" element={
                  <LegacyAgentWrapper
                    Component={MamaBearMainChat}
                    agentType="MAIN_CHAT"
                  />
                } />
                <Route path="/scout-chat" element={<ScoutMultiModalChat />} />
                <Route path="/workspaces" element={<ScoutDevWorkspaces />} />
                <Route path="/integration" element={
                  <LegacyAgentWrapper
                    Component={MamaBearIntegrationWorkbench}
                    agentType="INTEGRATION_WORKBENCH"
                  />
                } />
                <Route path="/mcp-marketplace" element={<ScoutMcpMarketplace />} />
                <Route path="/mini-apps" element={<ScoutMiniAppsHub />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </WindowProvider>
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;
