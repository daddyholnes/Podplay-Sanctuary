
import React, { useState, useEffect, useCallback } from 'react';
import { ViewType, ChatMessage, PanelType as PanelTypeEnum, AgentStep, MiniApp } from '../types';
import ChatView from './ChatView';
import GeminiService from '../services/GeminiService';
import { INITIAL_GREETING_TEXT, APP_TITLE } from '../constants'; // Assuming APP_TITLE is for the Scout Alpha badge
import CodeEditorPanel from './panels/CodeEditorPanel';
import FileExplorerPanel from './panels/FileExplorerPanel';
import TerminalPanel from './panels/TerminalPanel';
import PreviewPanel from './panels/PreviewPanel';
import AgentTimelinePanel from './panels/AgentTimelinePanel';
import ControlCenterPanel from './panels/ControlCenterPanel';
import MiniAppLauncher from './MiniAppLauncher'; // Import MiniAppLauncher

interface UnifiedDevelopmentHubProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void; // Allow UDH to change view
}

const UnifiedDevelopmentHub: React.FC<UnifiedDevelopmentHubProps> = ({ currentView, setCurrentView }) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [planAgreed, setPlanAgreed] = useState(false);
  const [activePanels, setActivePanels] = useState<PanelTypeEnum[]>([]);
  const [agentTimeline, setAgentTimeline] = useState<AgentStep[]>([]);
  const [previewTargetUrl, setPreviewTargetUrl] = useState<string>('about:blank'); // For controlling PreviewPanel

  const addMessageToTimeline = useCallback((action: string, details?: string, status: 'running' | 'completed' | 'error' = 'completed', tool?: string) => {
    setAgentTimeline(prev => [...prev, { id: Date.now().toString(), timestamp: new Date(), action, details, status, tool }]);
  }, []);

  useEffect(() => {
    const initialGreetingId = `mama-bear-greeting-${Date.now()}`;
    setChatMessages([
      { id: initialGreetingId, text: INITIAL_GREETING_TEXT, sender: 'agent', timestamp: new Date() },
    ]);
    addMessageToTimeline("Mama Bear Initialized", "Ready to assist Nathan.", "completed", "System");
  }, [addMessageToTimeline]);

  const handleSendMessage = async (text: string) => {
    const newMessage: ChatMessage = {
      id: `user-${Date.now()}`, text, sender: 'user', timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, newMessage]);
    setIsLoading(true);
    addMessageToTimeline(`User asked: "${text.substring(0,50)}..."`, undefined, "running", "User Input");

    try {
      const responseText = await GeminiService.sendMessage(text, chatMessages);
      const agentMessage: ChatMessage = {
        id: `agent-${Date.now()}`, text: responseText, sender: 'agent', timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, agentMessage]);
      addMessageToTimeline(`Mama Bear responded`, responseText.substring(0, 100)+ "...", "completed", "Gemini AI");

      if (responseText.toLowerCase().includes("let's start") || responseText.toLowerCase().includes("creating") || responseText.toLowerCase().includes("generating")) {
        if (!planAgreed) {
            setPlanAgreed(true);
            addMessageToTimeline("Project plan initiated", "Workspace panels are now active.", "completed", "System");
        }
        if (responseText.toLowerCase().includes("code") || responseText.toLowerCase().includes("editor")) {
            setActivePanels(prev => Array.from(new Set([...prev, PanelTypeEnum.Editor, PanelTypeEnum.Timeline])));
        }
        if (responseText.toLowerCase().includes("file") || responseText.toLowerCase().includes("explorer")) {
            setActivePanels(prev => Array.from(new Set([...prev, PanelTypeEnum.Files, PanelTypeEnum.Timeline])));
        }
         if (responseText.toLowerCase().includes("preview")) {
            setActivePanels(prev => Array.from(new Set([...prev, PanelTypeEnum.Preview, PanelTypeEnum.Timeline])));
            setPreviewTargetUrl('https://example.com'); // Default example URL
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`, text: "Sorry, I encountered an issue. Please try again.", sender: 'agent', timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
      addMessageToTimeline("Error processing user request", (error as Error).message, "error", "System");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAgreePlanAndActivateDefaultPanels = () => {
    setPlanAgreed(true);
    setActivePanels([PanelTypeEnum.Editor, PanelTypeEnum.Files, PanelTypeEnum.Preview, PanelTypeEnum.Timeline]);
    setPreviewTargetUrl('https://picsum.photos/seed/default_preview/800/600'); // Set a default preview
    addMessageToTimeline("Plan manually agreed", "Default workspace panels activated.", "completed", "System");
    if (currentView !== ViewType.UnifiedDevelopmentHub) {
        setCurrentView(ViewType.UnifiedDevelopmentHub); // Switch to hub if not already there
    }
  };

  const handleAppLaunchRequest = (app: MiniApp) => {
    addMessageToTimeline(`Launching Mini App: ${app.name}`, `URL: ${app.url}`, "running", "MiniAppLauncher");
    setPreviewTargetUrl(app.url);
    setActivePanels(prev => Array.from(new Set([...prev, PanelTypeEnum.Preview, PanelTypeEnum.Timeline])));
    setPlanAgreed(true); // Ensure workspace is active
    setCurrentView(ViewType.UnifiedDevelopmentHub); // Switch to the main hub to see the preview
    addMessageToTimeline(`Mini App: ${app.name} launched in Preview.`, undefined, "completed", "System");
  };

  const renderWorkspaceContent = () => {
    if (currentView === ViewType.MiniAppsLauncher) {
      return <MiniAppLauncher onAppLaunchRequest={handleAppLaunchRequest} />;
    }

    if (!planAgreed && currentView !== ViewType.MamaBearControlCenter && currentView !== ViewType.ScoutAgentWorkspace) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="bg-slate-800/60 backdrop-blur-md p-8 rounded-xl shadow-2xl max-w-lg">
            <div className="bg-purple-600/80 text-white px-4 py-1 rounded-full text-sm mb-6 inline-block shadow-lg">
              Scout Alpha
            </div>
            <h1 className="text-5xl font-bold text-gray-100 mb-3">Hey Nathan</h1>
            <p className="text-3xl text-purple-300 mt-2 mb-10">Got work? Let's jam!</p>
            <p className="text-gray-300 mb-6">Chat with Mama Bear to get started. Once a plan is underway, additional tools will appear here. Or, simulate a plan start:</p>
            <button 
              onClick={handleAgreePlanAndActivateDefaultPanels}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
            >
              Simulate Plan Start & Show Tools
            </button>
          </div>
        </div>
      );
    }

    let panelComponents: React.ReactNode[] = [];
    // Add panels based on activePanels state or specific view requirements
    if (currentView === ViewType.MamaBearControlCenter) {
       return <div className="flex-1 p-1 overflow-y-auto"><ControlCenterPanel key="control-center" /></div>;
    }
    if (currentView === ViewType.ScoutAgentWorkspace) {
      return <div className="flex-1 p-1 overflow-y-auto"><AgentTimelinePanel key="timeline-main" steps={agentTimeline} /></div>;
    }

    // For UnifiedDevelopmentHub when plan is agreed
    if (currentView === ViewType.UnifiedDevelopmentHub && planAgreed) {
        if (activePanels.includes(PanelTypeEnum.Editor)) {
            panelComponents.push(<CodeEditorPanel key="editor" />);
        }
        if (activePanels.includes(PanelTypeEnum.Files)) {
            panelComponents.push(<FileExplorerPanel key="files" />);
        }
        if (activePanels.includes(PanelTypeEnum.Terminal)) {
            panelComponents.push(<TerminalPanel key="terminal" />);
        }
        if (activePanels.includes(PanelTypeEnum.Preview)) {
            panelComponents.push(<PreviewPanel key="preview" url={previewTargetUrl} />);
        }
        if (activePanels.includes(PanelTypeEnum.Timeline)) {
           panelComponents.push(<AgentTimelinePanel key="timeline" steps={agentTimeline} />);
        }
    }
    
    if (panelComponents.length > 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 p-1 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
          {panelComponents}
        </div>
      );
    }
    
    if (currentView === ViewType.UnifiedDevelopmentHub && planAgreed) {
      return (
          <div className="flex flex-col items-center justify-center h-full p-8">
             <div className="bg-slate-800/60 backdrop-blur-md p-6 rounded-lg shadow-xl text-center max-w-md">
                <h2 className="text-2xl font-semibold mb-4 text-green-400">Workspace Active!</h2>
                <p className="text-gray-300">Mama Bear will populate tools here as needed, or use the Mini App Launcher.</p>
             </div>
          </div>
      );
    }
    return null; // Fallback
  };

  const chatPanelFlex = 
    (currentView === ViewType.MamaBearChat && !planAgreed) || 
    (currentView !== ViewType.MiniAppsLauncher && !planAgreed && currentView === ViewType.UnifiedDevelopmentHub)
    ? 'flex-1' // Chat takes full height initially or when focused without plan
    : 'h-1/3 md:h-2/5 xl:h-1/3'; // Smaller chat when workspace panels are active or in MiniAppLauncher

  const showMainGreeting = currentView === ViewType.MamaBearChat && !planAgreed;
  
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Main Content Area: Panels or MiniAppLauncher or Initial Greeting */}
      <div className={`flex-1 overflow-y-auto ${(currentView === ViewType.MiniAppsLauncher || (currentView === ViewType.UnifiedDevelopmentHub && planAgreed)) ? 'p-0' : ''}`}>
         {renderWorkspaceContent()}
      </div>
      
      {/* Chat View - always present but size/prominence changes */}
      {/* Hide chat if MiniAppsLauncher is the main view and we want full focus on it? For now, keep it. */}
      <div className={`
        ${chatPanelFlex}
        flex flex-col bg-slate-800/80 backdrop-blur-lg 
        border-t-2 border-purple-500/30 shadow-2xl 
        ${(planAgreed || currentView === ViewType.MiniAppsLauncher) ? 'min-h-[280px]' : 'min-h-[300px]'}
        transition-all duration-300 ease-in-out
      `}>
        <ChatView
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default UnifiedDevelopmentHub;
