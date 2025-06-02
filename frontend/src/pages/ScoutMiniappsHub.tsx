import { useState } from 'react';
import type { ReactNode } from 'react';
import { X, Plus, Search, Grid3X3, Settings } from 'lucide-react';

import julesLogo from '../assets/logos/jules.png';
import geminiLogo from '../assets/logos/gemini.png';

interface App {
  id: string;
  name: string;
  icon: string | ReactNode;
  url: string;
  category: string;
}

interface Tab extends App {
  tabId: number;
  isLoading: boolean;
  title: string;
}

const ScoutMiniAppsHub = () => {
  const [currentView, setCurrentView] = useState<'grid' | 'browser'>('grid');
  const [openTabs, setOpenTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const miniApps: App[] = [
    { id: 'chatgpt', name: 'ChatGPT', icon: '🤖', url: 'https://chat.openai.com', category: 'AI Chat' },
    { id: 'gemini', name: 'Gemini', icon: <img src={geminiLogo} alt="Gemini" className="w-6 h-6" />, url: 'https://gemini.google.com', category: 'AI Chat' },
    { id: 'claude', name: 'Claude', icon: '🎭', url: 'https://claude.ai', category: 'AI Chat' },
    { id: 'poe', name: 'Poe', icon: '🐦', url: 'https://poe.com', category: 'AI Chat' },
    { id: 'perplexity', name: 'Perplexity', icon: '🔍', url: 'https://perplexity.ai', category: 'AI Search' },
    { id: 'kimi', name: 'Kimi', icon: '🌙', url: 'https://kimi.moonshot.cn', category: 'AI Chat' },
    { id: 'jules', name: 'Jules', icon: <img src={julesLogo} alt="Jules" className="w-6 h-6" />, url: 'https://jules.google.com', category: 'Google AI' },
    { id: 'deepseek', name: 'DeepSeek', icon: '🏔️', url: 'https://chat.deepseek.com', category: 'AI Chat' },
    { id: 'groq', name: 'Groq', icon: '⚡', url: 'https://groq.com', category: 'AI Inference' },
    { id: 'siliconflow', name: 'SiliconFlow', icon: '🌊', url: 'https://siliconflow.cn', category: 'AI Platform' },
    { id: 'huggingface', name: 'HuggingFace', icon: '🤗', url: 'https://huggingface.co/chat', category: 'AI Models' },
    { id: 'cohere', name: 'Cohere', icon: '🧮', url: 'https://cohere.com', category: 'AI Platform' },
    { id: 'anthropic', name: 'Anthropic', icon: '🎯', url: 'https://console.anthropic.com', category: 'AI Platform' },
    { id: 'replicate', name: 'Replicate', icon: '🔁', url: 'https://replicate.com', category: 'AI Models' },
    { id: 'runway', name: 'Runway', icon: '🎬', url: 'https://runwayml.com', category: 'AI Video' },
    { id: 'midjourney', name: 'Midjourney', icon: '🎨', url: 'https://www.midjourney.com', category: 'AI Art' }
  ];

  const categories: string[] = [...new Set(miniApps.map(app => app.category))];

  const filteredApps: App[] = miniApps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openApp = (app: App) => {
    const existingTab = openTabs.find(tab => tab.id === app.id);
    
    if (existingTab) {
      setActiveTab(existingTab.tabId);
    } else {
      const newTab: Tab = {
        ...app,
        tabId: Date.now(),
        isLoading: true,
        title: app.name
      };
      setOpenTabs(prev => [...prev, newTab]);
      setActiveTab(newTab.tabId);
    }
    
    setCurrentView('browser');
  };

  const closeTab = (tabId: number, e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    // Correctly filter out the tab to be closed before updating activeTab
    const updatedTabs = openTabs.filter(tab => tab.tabId !== tabId);
    setOpenTabs(updatedTabs);
    
    if (activeTab === tabId) {
      if (updatedTabs.length > 0) {
        setActiveTab(updatedTabs[updatedTabs.length - 1].tabId);
      } else {
        setActiveTab(null);
        setCurrentView('grid');
      }
    }
  };

  const handleIframeLoad = (tabId: number) => {
    setOpenTabs(prev => prev.map(tab => 
      tab.tabId === tabId ? { ...tab, isLoading: false } : tab
    ));
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
              onClick={() => openApp(app)}
              className="group cursor-pointer p-4 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-purple-500/20 hover:border-purple-400/40 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                  {app.icon}
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
        <div className="flex overflow-x-auto bg-slate-900/50">
          {openTabs.map((tab) => (
            <div
              key={tab.tabId}
              onClick={() => setActiveTab(tab.tabId)}
              className={`flex items-center gap-2 px-4 py-2 min-w-[200px] max-w-[300px] border-r border-purple-500/20 cursor-pointer transition-colors ${
                activeTab === tab.tabId 
                  ? 'bg-slate-700 text-white' 
                  : 'bg-slate-800 text-purple-300 hover:bg-slate-700/50'
              }`}
            >
              <span className="text-sm">{tab.icon}</span>
              <span className="text-sm truncate flex-1">{tab.title}</span>
              {tab.isLoading && (
                <div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              )}
              <button
                onClick={(e) => closeTab(tab.tabId, e)}
                className="p-1 hover:bg-slate-600 rounded opacity-60 hover:opacity-100 transition-opacity"
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

      {/* Browser Content */}
      <div className="flex-1 relative">
        {openTabs.map((tab) => (
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
              src={tab.url}
              className="w-full h-full border-0"
              onLoad={() => handleIframeLoad(tab.tabId)}
              onError={() => handleIframeLoad(tab.tabId)}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
              title={tab.name}
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
    <div className="font-sans">
      {currentView === 'grid' ? <GridView /> : <BrowserView />}
    </div>
  );
};

export default ScoutMiniAppsHub;