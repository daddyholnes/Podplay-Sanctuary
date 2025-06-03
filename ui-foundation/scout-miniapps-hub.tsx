import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Plus, Search, Grid3X3, X, Maximize, Minimize, RefreshCw, ExternalLink, Moon, Sun } from 'lucide-react';

// Types for our mini apps
interface MiniApp {
  id: string;
  name: string;
  icon: string;
  url: string;
  category: string;
}

interface AppTab extends MiniApp {
  tabId: string;
  title?: string;
  isLoading: boolean;
}

const ScoutMiniAppsHub = () => {
  const [currentView, setCurrentView] = useState('grid'); // 'grid' or 'browser'
  const [openTabs, setOpenTabs] = useState<AppTab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [loadingTabs, setLoadingTabs] = useState<Record<string, boolean>>({});
  const iframeRefs = useRef<Record<string, HTMLIFrameElement>>({});

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Your custom miniapps list with proper logo paths
  const miniApps = [
    { id: 'chatgpt', name: 'ChatGPT', icon: '/ui-foundation/logos/openai-icon-2021x2048-4rpe5x7n.png', url: 'https://chat.openai.com', category: 'AI Chat' },
    { id: 'gemini', name: 'Gemini', icon: '/ui-foundation/logos/gemini.png', url: 'https://gemini.google.com', category: 'AI Chat' },
    { id: 'claude', name: 'Claude', icon: '/ui-foundation/logos/claude-ai9117.logowik.com.webp', url: 'https://claude.ai', category: 'AI Chat' },
    { id: 'poe', name: 'Poe', icon: '/ui-foundation/logos/poe.webp', url: 'https://poe.com', category: 'AI Chat' },
    { id: 'perplexity', name: 'Perplexity', icon: '/ui-foundation/logos/perplexity.webp', url: 'https://perplexity.ai', category: 'AI Search' },
    { id: 'jules', name: 'Jules', icon: '/ui-foundation/logos/jules.png', url: 'https://jules.google.com', category: 'Google AI' },
    { id: 'huggingchat', name: 'Hugging Chat', icon: '/ui-foundation/logos/huggingchat.svg', url: 'https://huggingface.co/chat', category: 'AI Models' },
    { id: 'aistudio', name: 'Google AI Studio', icon: '/ui-foundation/logos/aistudio.svg', url: 'https://aistudio.google.com', category: 'AI Platform' },
    { id: 'grok', name: 'Grok', icon: '/ui-foundation/logos/grok.png', url: 'https://grok.x.ai', category: 'AI Chat' },
    { id: 'notebooklm', name: 'NotebookLM', icon: '/ui-foundation/logos/notebooklm.svg', url: 'https://notebooklm.google', category: 'AI Research' },
    { id: 'qwenlm', name: 'Qwen LM', icon: '/ui-foundation/logos/qwenlm.webp', url: 'https://tongyi.aliyun.com', category: 'AI Chat' },
    { id: 'lambdachat', name: 'Lambda Chat', icon: '/ui-foundation/logos/lambdachat.webp', url: 'https://www.lambdalabs.com/lambda-api', category: 'AI Platform' },
    { id: 'lechat', name: 'Le Chat', icon: '/ui-foundation/logos/lechat.png', url: 'https://chat.mistral.ai/chat', category: 'AI Chat' },
    { id: 'github-copilot', name: 'GitHub Copilot', icon: '/ui-foundation/logos/github-copilot.webp', url: 'https://github.com/features/copilot', category: 'AI Coding' },
    { id: 'dify', name: 'Dify', icon: '/ui-foundation/logos/dify.svg', url: 'https://dify.ai', category: 'AI Platform' },
    { id: 'abacus', name: 'Abacus', icon: '/ui-foundation/logos/abacus.webp', url: 'https://abacus.ai', category: 'AI Platform' },
    { id: 'n8n', name: 'n8n', icon: '/ui-foundation/logos/n8n.svg', url: 'https://n8n.io', category: 'Automation' },
    { id: 'genspark', name: 'GenSpark', icon: '/ui-foundation/logos/genspark.jpg', url: 'https://genspark.ai', category: 'AI Platform' },
    { id: 'duckduckgo', name: 'DuckDuckGo', icon: '/ui-foundation/logos/duckduckgo.webp', url: 'https://duckduckgo.com', category: 'Search' },
    { id: 'google', name: 'Google', icon: '/ui-foundation/logos/google.svg', url: 'https://google.com', category: 'Search' },
    { id: 'runway', name: 'Runway', icon: '🎬', url: 'https://runwayml.com', category: 'AI Video' },
    { id: 'midjourney', name: 'Midjourney', icon: '🎨', url: 'https://www.midjourney.com', category: 'AI Art' }
  ];

  const categories = [...new Set(miniApps.map(app => app.category))];

  const filteredApps = miniApps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to open a new app tab
  const handleOpenApp = (app: MiniApp) => {
    // Generate a unique tab ID
    const tabId = `${app.id}-${Date.now()}`;
    
    // Check if this app is already open
    const existingTabIndex = openTabs.findIndex(tab => tab.id === app.id);
    
    if (existingTabIndex >= 0) {
      // App already open, just switch to it
      setActiveTab(openTabs[existingTabIndex].tabId);
    } else {
      // Create a new tab
      const newTab: AppTab = {
        ...app,
        tabId,
        isLoading: true,
      };
      
      setOpenTabs(prev => [...prev, newTab]);
      setActiveTab(tabId);
      setCurrentView('browser');
    }
  };

  // Close tab
  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenTabs(prev => prev.filter(tab => tab.tabId !== tabId));
    
    if (activeTab === tabId) {
      const remainingTabs = openTabs.filter(tab => tab.tabId !== tabId);
      setActiveTab(remainingTabs.length > 0 ? remainingTabs[remainingTabs.length - 1].tabId : null);
      
      if (remainingTabs.length === 0) {
        setCurrentView('grid');
      }
    }
  };

  // Handle iframe load
  const handleIframeLoad = (tabId: string) => {
    setLoadingTabs(prev => ({ ...prev, [tabId]: false }));
    
    const tabIndex = openTabs.findIndex(tab => tab.tabId === tabId);
    if (tabIndex >= 0) {
      const updatedTabs = [...openTabs];
      updatedTabs[tabIndex] = { ...updatedTabs[tabIndex], isLoading: false };
      setOpenTabs(updatedTabs);
    }
  };

  // Grid View Component
  const GridView = () => (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-purple-500/30 bg-slate-900/90 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                🚀 Scout Mini Apps
              </h1>
              <p className="text-purple-300 mt-2">Your AI-powered workspace hub</p>
            </div>
            <div className="flex gap-3">
              <button className="p-2 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg border border-purple-500/30 transition-colors">
                <Settings size={20} />
              </button>
              <button className="p-2 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg border border-purple-500/30 transition-colors">
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
            <input
              type="text"
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-xl focus:border-purple-400 focus:outline-none text-white placeholder-purple-300"
            />
          </div>
        </div>
      </div>

      {/* Apps Grid */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {filteredApps.map((app, index) => (
            <div
              key={app.id}
              onClick={() => handleOpenApp(app)}
              className="group cursor-pointer p-4 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-purple-500/20 hover:border-purple-400/40 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                  {app.icon.startsWith('/') ? (
                    <img src={app.icon} alt={app.name} className="w-8 h-8 object-contain" />
                  ) : (
                    <span>{app.icon}</span>
                  )}
                </div>
                <h3 className="font-medium text-white text-sm mb-1 truncate w-full">{app.name}</h3>
                <p className="text-xs text-purple-300 truncate w-full">{app.category}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredApps.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-purple-300">No apps found matching "{searchQuery}"</p>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="border-t border-purple-500/30 bg-slate-900/90 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between text-sm text-purple-300">
          <span>{filteredApps.length} apps available</span>
          <span>{categories.length} categories</span>
        </div>
      </div>
    </div>
  );

  // Browser View Component  
  const BrowserView = () => (
    <div className="h-screen bg-slate-900 text-white flex flex-col">
      {/* Browser Header */}
      <div className="bg-slate-800 border-b border-purple-500/30">
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('grid')}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title="Back to Grid"
            >
              <Grid3X3 size={18} />
            </button>
            <div className="w-px h-6 bg-purple-500/30" />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-purple-300">{openTabs.length} tabs open</span>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center px-2 pt-1 gap-1 overflow-x-auto scrollbar-thin overflow-y-hidden bg-purple-900 text-white">
          {openTabs.map(tab => (
            <div 
              key={tab.tabId}
              onClick={() => setActiveTab(tab.tabId)} 
              className={`flex items-center gap-1 px-3 py-2 max-w-[200px] rounded-t-md cursor-pointer ${activeTab === tab.tabId ? 'bg-purple-800' : 'bg-purple-950 hover:bg-purple-900'}`}
            >
              <div className="flex-shrink-0 w-4 h-4">
                <img src={tab.icon} alt="" className="w-4 h-4" />
              </div>
              <div className="flex-grow truncate text-sm font-medium">
                {tab.title || tab.name}
              </div>
              {tab.isLoading && <div className="w-3 h-3 border-2 border-t-transparent border-purple-300 rounded-full animate-spin" />}
              <button 
                onClick={(e) => closeTab(tab.tabId, e)}
                className="flex-shrink-0 rounded-full p-1 hover:bg-purple-700 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <button
            onClick={() => setCurrentView('grid')}
            className="flex items-center justify-center w-10 h-10 hover:bg-slate-700 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between bg-purple-900/50 border-b border-purple-500/30 p-2">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              if (activeTab) {
                const iframe = iframeRefs.current[activeTab];
                if (iframe) iframe.src = iframe.src;
              }
            }}
            className="p-2 hover:bg-purple-800 rounded-lg transition-colors text-purple-200"
            title="Reload"
            disabled={!activeTab}
          >
            <RefreshCw size={16} />
          </button>
          
          <button 
            onClick={() => {
              const tab = openTabs.find(t => t.tabId === activeTab);
              if (tab) window.open(tab.url, '_blank');
            }}
            className="p-2 hover:bg-purple-800 rounded-lg transition-colors text-purple-200"
            title="Open in Browser"
            disabled={!activeTab}
          >
            <ExternalLink size={16} />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleDarkMode}
            className="p-2 hover:bg-purple-800 rounded-lg transition-colors text-purple-200"
            title={isDarkMode ? "Light Mode" : "Dark Mode"}
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          
          <button 
            onClick={toggleFullscreen}
            className="p-2 hover:bg-purple-800 rounded-lg transition-colors text-purple-200"
            title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullScreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
      </div>
      
      {/* Tab content */}
      <div className="flex-grow relative">
        {openTabs.map(tab => (
          <div 
            key={tab.tabId}
            className={`absolute inset-0 ${activeTab === tab.tabId ? 'block' : 'hidden'}`}
          >
            {tab.isLoading && (
              <div className="absolute inset-0 bg-slate-800 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-purple-300">Loading {tab.name}...</p>
                </div>
              </div>
            )}
            <iframe
              ref={el => {
                if (el) iframeRefs.current[tab.tabId] = el;
              }}
              src={tab.url}
              className="w-full h-full border-0"
              onLoad={() => handleIframeLoad(tab.tabId)}
              onError={() => handleIframeLoad(tab.tabId)}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-storage-access-by-user-activation"
              title={tab.name}
              style={{height: isFullScreen ? '100vh' : '100%', width: '100%'}}
            />
          </div>
        ))}

        {openTabs.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to Scout Browser</h2>
              <p className="text-purple-300 mb-6">Open apps from the grid to start browsing</p>
              <button
                onClick={() => setCurrentView('grid')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Browse Apps
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`font-sans ${isDarkMode ? 'dark' : ''}`}>
      {currentView === 'grid' ? <GridView /> : <BrowserView />}
      
      {/* Custom animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .grid > div {
            animation: fadeIn 0.5s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
};

export default ScoutMiniAppsHub;