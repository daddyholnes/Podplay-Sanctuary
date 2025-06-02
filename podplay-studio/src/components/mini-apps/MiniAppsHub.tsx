'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Grid3x3, 
  Plus, 
  Search, 
  Star, 
  Clock, 
  Zap, 
  Calendar, 
  Calculator,
  Camera,
  Music,
  FileText,
  Image,
  Video,
  Map,
  Weather,
  News,
  ShoppingCart,
  Gamepad2,
  BookOpen,
  Mail,
  MessageSquare,
  Phone,
  Settings,
  Maximize,
  Minimize,
  X,
  Pin,
  PinOff,
  MoreHorizontal,
  Download,
  ExternalLink,
  Folder,
  Archive,
  Filter,
  Bookmark,
  Heart,
  Share,
  Trash2,
  Edit,
  PlayCircle
} from 'lucide-react';
import { getLogo, getLogosByCategory } from '@/lib/assets/logos';

interface MiniApp {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'productivity' | 'utilities' | 'entertainment' | 'communication' | 'development' | 'design' | 'ai';
  version: string;
  size: string;
  rating: number;
  downloads: number;
  isInstalled: boolean;
  isPinned: boolean;
  isRunning: boolean;
  lastUsed?: Date;
  url?: string;
  author: string;
  tags: string[];
  color: string;
}

interface RunningApp {
  id: string;
  appId: string;
  title: string;
  url: string;
  icon: React.ReactNode;
  isMinimized: boolean;
  isPinned: boolean;
  lastActive: Date;
}

const mockMiniApps: MiniApp[] = [
  // AI Tools
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    description: 'Advanced AI assistant for conversations, coding, and creative tasks',
    icon: <img src={getLogo('chatgpt').logoPath} alt="ChatGPT" className="w-6 h-6 rounded" />,
    category: 'ai',
    version: '4.0',
    size: '1.2 MB',
    rating: 4.9,
    downloads: 1000000,
    isInstalled: true,
    isPinned: true,
    isRunning: false,
    lastUsed: new Date(),
    author: 'OpenAI',
    tags: ['ai', 'chat', 'assistant'],
    color: 'from-green-500 to-green-600',
    url: 'https://chat.openai.com'
  },
  {
    id: 'claude',
    name: 'Claude',
    description: 'Anthropic\'s AI assistant for analysis, writing, and coding',
    icon: <img src={getLogo('claude').logoPath} alt="Claude" className="w-6 h-6 rounded" />,
    category: 'ai',
    version: '3.5',
    size: '1.1 MB',
    rating: 4.8,
    downloads: 750000,
    isInstalled: true,
    isPinned: true,
    isRunning: false,
    lastUsed: new Date(Date.now() - 1000 * 60 * 30),
    author: 'Anthropic',
    tags: ['ai', 'chat', 'analysis'],
    color: 'from-orange-500 to-red-500',
    url: 'https://claude.ai'
  },
  {
    id: 'gemini',
    name: 'Gemini',
    description: 'Google\'s multimodal AI for text, images, and code generation',
    icon: <img src={getLogo('gemini').logoPath} alt="Gemini" className="w-6 h-6 rounded" />,
    category: 'ai',
    version: '1.5',
    size: '1.3 MB',
    rating: 4.7,
    downloads: 850000,
    isInstalled: true,
    isPinned: true,
    isRunning: false,
    lastUsed: new Date(Date.now() - 1000 * 60 * 60),
    author: 'Google',
    tags: ['ai', 'multimodal', 'google'],
    color: 'from-blue-500 to-blue-600',
    url: 'https://gemini.google.com'
  },
  {
    id: 'jules',
    name: 'Jules',
    description: 'Google\'s creative AI assistant for collaborative projects',
    icon: <img src={getLogo('jules').logoPath} alt="Jules" className="w-6 h-6 rounded" />,
    category: 'ai',
    version: '1.0',
    size: '950 KB',
    rating: 4.6,
    downloads: 125000,
    isInstalled: true,
    isPinned: false,
    isRunning: false,
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 2),
    author: 'Google',
    tags: ['ai', 'creative', 'collaboration'],
    color: 'from-purple-500 to-purple-600',
    url: 'https://jules.google.com'
  },
  {
    id: 'grok',
    name: 'Grok',
    description: 'X.AI\'s witty and rebellious AI assistant',
    icon: <img src={getLogo('grok').logoPath} alt="Grok" className="w-6 h-6 rounded" />,
    category: 'ai',
    version: '2.0',
    size: '1.1 MB',
    rating: 4.5,
    downloads: 320000,
    isInstalled: true,
    isPinned: false,
    isRunning: false,
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 4),
    author: 'X.AI',
    tags: ['ai', 'chat', 'humor'],
    color: 'from-gray-800 to-black',
    url: 'https://grok.x.ai'
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    description: 'AI-powered search engine with real-time information',
    icon: <img src={getLogo('perplexity').logoPath} alt="Perplexity" className="w-6 h-6 rounded" />,
    category: 'ai',
    version: '2.3',
    size: '890 KB',
    rating: 4.7,
    downloads: 450000,
    isInstalled: true,
    isPinned: false,
    isRunning: false,
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 6),
    author: 'Perplexity AI',
    tags: ['ai', 'search', 'research'],
    color: 'from-teal-500 to-cyan-500',
    url: 'https://perplexity.ai'
  },
  {
    id: 'notebooklm',
    name: 'NotebookLM',
    description: 'Google\'s AI-powered research and note-taking assistant',
    icon: <img src={getLogo('notebooklm').logoPath} alt="NotebookLM" className="w-6 h-6 rounded" />,
    category: 'productivity',
    version: '1.2',
    size: '1.4 MB',
    rating: 4.8,
    downloads: 280000,
    isInstalled: true,
    isPinned: true,
    isRunning: false,
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 8),
    author: 'Google',
    tags: ['ai', 'notes', 'research'],
    color: 'from-green-500 to-emerald-500',
    url: 'https://notebooklm.google.com'
  },
  {
    id: 'huggingchat',
    name: 'HuggingChat',
    description: 'Open-source AI chat with various models from Hugging Face',
    icon: <img src={getLogo('huggingchat').logoPath} alt="HuggingChat" className="w-6 h-6 rounded" />,
    category: 'ai',
    version: '1.5',
    size: '780 KB',
    rating: 4.4,
    downloads: 190000,
    isInstalled: true,
    isPinned: false,
    isRunning: false,
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 12),
    author: 'Hugging Face',
    tags: ['ai', 'open-source', 'models'],
    color: 'from-yellow-500 to-orange-500',
    url: 'https://huggingface.co/chat'
  },
  // Development Tools
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    description: 'AI-powered code completion and programming assistant',
    icon: <img src={getLogo('github-copilot').logoPath} alt="GitHub Copilot" className="w-6 h-6 rounded" />,
    category: 'development',
    version: '1.8',
    size: '2.1 MB',
    rating: 4.9,
    downloads: 2000000,
    isInstalled: true,
    isPinned: true,
    isRunning: true,
    lastUsed: new Date(),
    author: 'GitHub',
    tags: ['ai', 'coding', 'development'],
    color: 'from-gray-700 to-gray-900',
    url: 'https://copilot.github.com'
  },
  {
    id: 'n8n',
    name: 'n8n',
    description: 'Workflow automation platform for connecting apps and services',
    icon: <img src={getLogo('n8n').logoPath} alt="n8n" className="w-6 h-6 rounded" />,
    category: 'development',
    version: '1.0',
    size: '1.8 MB',
    rating: 4.6,
    downloads: 150000,
    isInstalled: true,
    isPinned: false,
    isRunning: false,
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24),
    author: 'n8n GmbH',
    tags: ['automation', 'workflow', 'integration'],
    color: 'from-pink-500 to-rose-500',
    url: 'https://n8n.io'
  },
  {
    id: 'dify',
    name: 'Dify',
    description: 'LLM app development platform for building AI applications',
    icon: <img src={getLogo('dify').logoPath} alt="Dify" className="w-6 h-6 rounded" />,
    category: 'development',
    version: '0.6',
    size: '1.5 MB',
    rating: 4.5,
    downloads: 85000,
    isInstalled: true,
    isPinned: false,
    isRunning: false,
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 48),
    author: 'Dify.AI',
    tags: ['ai', 'development', 'llm'],
    color: 'from-blue-500 to-indigo-500',
    url: 'https://dify.ai'
  },
  // Utility Apps
  {
    id: 'calculator',
    name: 'Calculator',
    description: 'Advanced scientific calculator with history and memory functions',
    icon: <Calculator className="w-6 h-6" />,
    category: 'utilities',
    version: '2.1.0',
    size: '156 KB',
    rating: 4.8,
    downloads: 45320,
    isInstalled: true,
    isPinned: true,
    isRunning: false,
    lastUsed: new Date(Date.now() - 1000 * 60 * 30),
    author: 'MathTools Inc',
    tags: ['math', 'calculation', 'scientific'],
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'notes',
    name: 'Quick Notes',
    description: 'Simple note-taking app with markdown support and auto-save',
    icon: <FileText className="w-6 h-6" />,
    category: 'productivity',
    version: '3.2.1',
    size: '245 KB',
    rating: 4.9,
    downloads: 78432,
    isInstalled: true,
    isPinned: true,
    isRunning: true,
    lastUsed: new Date(),
    author: 'ProductivityCorp',
    tags: ['notes', 'markdown', 'productivity'],
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'weather',
    name: 'Weather Widget',
    description: 'Beautiful weather widget with 7-day forecast and radar',
    icon: <Weather className="w-6 h-6" />,
    category: 'utilities',
    version: '1.8.3',
    size: '892 KB',
    rating: 4.6,
    downloads: 32156,
    isInstalled: true,
    isPinned: false,
    isRunning: false,
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 2),
    author: 'WeatherPro',
    tags: ['weather', 'forecast', 'widget'],
    color: 'from-sky-500 to-blue-500'
  },
  {
    id: 'color-picker',
    name: 'Color Picker',
    description: 'Professional color picker with palette generation and export',
    icon: <Image className="w-6 h-6" />,
    category: 'design',
    version: '2.0.5',
    size: '324 KB',
    rating: 4.7,
    downloads: 23891,
    isInstalled: true,
    isPinned: false,
    isRunning: false,
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24),
    author: 'DesignTools',
    tags: ['color', 'design', 'palette'],
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'pomodoro',
    name: 'Pomodoro Timer',
    description: 'Focus timer with customizable intervals and break reminders',
    icon: <Clock className="w-6 h-6" />,
    category: 'productivity',
    version: '1.4.2',
    size: '178 KB',
    rating: 4.5,
    downloads: 19567,
    isInstalled: false,
    isPinned: false,
    isRunning: false,
    author: 'FocusApps',
    tags: ['timer', 'productivity', 'focus'],
    color: 'from-red-500 to-red-600'
  },
  {
    id: 'markdown-editor',
    name: 'Markdown Editor',
    description: 'Real-time markdown editor with live preview and syntax highlighting',
    icon: <Edit className="w-6 h-6" />,
    category: 'development',
    version: '2.3.0',
    size: '567 KB',
    rating: 4.8,
    downloads: 15632,
    isInstalled: false,
    isPinned: false,
    isRunning: false,
    author: 'DevWriters',
    tags: ['markdown', 'editor', 'preview'],
    color: 'from-gray-700 to-gray-800'
  },
  {
    id: 'music-player',
    name: 'Mini Music Player',
    description: 'Compact music player with playlist support and equalizer',
    icon: <Music className="w-6 h-6" />,
    category: 'entertainment',
    version: '3.1.4',
    size: '1.2 MB',
    rating: 4.4,
    downloads: 41234,
    isInstalled: false,
    isPinned: false,
    isRunning: false,
    author: 'AudioFlow',
    tags: ['music', 'player', 'audio'],
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'code-formatter',
    name: 'Code Formatter',
    description: 'Format and beautify code in multiple programming languages',
    icon: <FileText className="w-6 h-6" />,
    category: 'development',
    version: '1.6.8',
    size: '423 KB',
    rating: 4.9,
    downloads: 28901,
    isInstalled: false,
    isPinned: false,
    isRunning: false,
    author: 'CodeBeauty',
    tags: ['code', 'format', 'beautify'],
    color: 'from-indigo-500 to-purple-500'
  }
];

const mockRunningApps: RunningApp[] = [
  {
    id: 'run-1',
    appId: 'notes',
    title: 'Quick Notes - Project Ideas',
    url: '/mini-apps/notes',
    icon: <FileText className="w-4 h-4" />,
    isMinimized: false,
    isPinned: true,
    lastActive: new Date()
  }
];

export default function MiniAppsHub() {
  const [activeTab, setActiveTab] = useState<'installed' | 'store' | 'running'>('installed');
  const [miniApps, setMiniApps] = useState<MiniApp[]>(mockMiniApps);
  const [runningApps, setRunningApps] = useState<RunningApp[]>(mockRunningApps);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<MiniApp | null>(null);

  const categories = [
    { id: 'all', name: 'All Apps', count: miniApps.length },
    { id: 'ai', name: 'AI Tools', count: miniApps.filter(app => app.category === 'ai').length },
    { id: 'productivity', name: 'Productivity', count: miniApps.filter(app => app.category === 'productivity').length },
    { id: 'utilities', name: 'Utilities', count: miniApps.filter(app => app.category === 'utilities').length },
    { id: 'development', name: 'Development', count: miniApps.filter(app => app.category === 'development').length },
    { id: 'design', name: 'Design', count: miniApps.filter(app => app.category === 'design').length },
    { id: 'entertainment', name: 'Entertainment', count: miniApps.filter(app => app.category === 'entertainment').length },
    { id: 'communication', name: 'Communication', count: miniApps.filter(app => app.category === 'communication').length }
  ];

  const installedApps = miniApps.filter(app => app.isInstalled);
  const pinnedApps = installedApps.filter(app => app.isPinned);

  const filteredApps = miniApps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleLaunchApp = (appId: string) => {
    const app = miniApps.find(a => a.id === appId);
    if (!app || !app.isInstalled) return;

    const existingRun = runningApps.find(r => r.appId === appId);
    if (existingRun) {
      // Focus existing app
      setRunningApps(prev => prev.map(r => 
        r.id === existingRun.id 
          ? { ...r, isMinimized: false, lastActive: new Date() }
          : r
      ));
    } else {
      // Launch new instance
      const newRunningApp: RunningApp = {
        id: Date.now().toString(),
        appId: appId,
        title: `${app.name}`,
        url: `/mini-apps/${appId}`,
        icon: app.icon,
        isMinimized: false,
        isPinned: app.isPinned,
        lastActive: new Date()
      };
      setRunningApps(prev => [...prev, newRunningApp]);
    }

    setMiniApps(prev => prev.map(a => 
      a.id === appId 
        ? { ...a, isRunning: true, lastUsed: new Date() }
        : a
    ));
  };

  const handleCloseApp = (runningAppId: string) => {
    const runningApp = runningApps.find(r => r.id === runningAppId);
    if (runningApp) {
      setMiniApps(prev => prev.map(a => 
        a.id === runningApp.appId ? { ...a, isRunning: false } : a
      ));
      setRunningApps(prev => prev.filter(r => r.id !== runningAppId));
    }
  };

  const handleInstallApp = (appId: string) => {
    setMiniApps(prev => prev.map(app => 
      app.id === appId ? { ...app, isInstalled: true } : app
    ));
  };

  const handleTogglePin = (appId: string) => {
    setMiniApps(prev => prev.map(app => 
      app.id === appId ? { ...app, isPinned: !app.isPinned } : app
    ));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'productivity': return <Zap className="w-4 h-4" />;
      case 'utilities': return <Settings className="w-4 h-4" />;
      case 'development': return <FileText className="w-4 h-4" />;
      case 'design': return <Image className="w-4 h-4" />;
      case 'entertainment': return <PlayCircle className="w-4 h-4" />;
      case 'communication': return <MessageSquare className="w-4 h-4" />;
      default: return <Grid3x3 className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-purple-500/20 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600">
              <Grid3x3 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Mini Apps Hub
              </h1>
              <p className="text-gray-400">Chrome-style mini applications for enhanced productivity</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {pinnedApps.slice(0, 6).map((app) => (
                <motion.button
                  key={app.id}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleLaunchApp(app.id)}
                  className={`p-3 rounded-xl bg-gradient-to-r ${app.color} transition-all hover:shadow-lg`}
                  title={app.name}
                >
                  {app.icon}
                </motion.button>
              ))}
              <div className="w-px h-8 bg-gray-600 mx-2" />
              <button className="p-3 rounded-xl bg-gray-800/50 border border-gray-600 hover:border-purple-500/50 transition-all">
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mini apps..."
                className="pl-10 pr-4 py-2 bg-gray-900/50 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 placeholder-gray-500 w-64"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6">
            {[
              { id: 'installed', label: 'My Apps', icon: <Grid3x3 className="w-4 h-4" />, count: installedApps.length },
              { id: 'store', label: 'App Store', icon: <Download className="w-4 h-4" />, count: miniApps.filter(a => !a.isInstalled).length },
              { id: 'running', label: 'Running', icon: <PlayCircle className="w-4 h-4" />, count: runningApps.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count > 0 && (
                  <span className="px-2 py-0.5 bg-gray-600 text-xs rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'installed' && (
            <motion.div
              key="installed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Pinned Apps */}
              {pinnedApps.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Pin className="w-5 h-5 text-purple-400" />
                    Pinned Apps
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                    {pinnedApps.map((app) => (
                      <motion.div
                        key={app.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleLaunchApp(app.id)}
                        className="relative group cursor-pointer"
                      >
                        <div className={`p-4 rounded-2xl bg-gradient-to-r ${app.color} shadow-lg transition-all duration-300 hover:shadow-xl`}>
                          <div className="flex flex-col items-center gap-2">
                            {app.icon}
                            <span className="text-white text-sm font-medium text-center">{app.name}</span>
                          </div>
                          {app.isRunning && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Installed Apps */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Folder className="w-5 h-5 text-blue-400" />
                  All Installed Apps
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {installedApps.map((app) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-6 rounded-xl bg-gray-900/50 border border-purple-500/20 hover:border-purple-500/40 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-xl bg-gradient-to-r ${app.color}`}>
                            {app.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold flex items-center gap-2">
                              {app.name}
                              {app.isRunning && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                            </h3>
                            <p className="text-sm text-gray-400">v{app.version} • {app.size}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTogglePin(app.id);
                            }}
                            className={`p-2 rounded-lg transition-all ${
                              app.isPinned
                                ? 'bg-purple-600/20 text-purple-400'
                                : 'bg-gray-600/20 text-gray-400 hover:bg-purple-600/20 hover:text-purple-400'
                            }`}
                          >
                            {app.isPinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
                          </button>
                          
                          <button className="p-2 rounded-lg bg-gray-600/20 text-gray-400 hover:bg-gray-600/30 transition-all">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{app.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {app.lastUsed ? `Used ${app.lastUsed.toLocaleDateString()}` : 'Never used'}
                        </div>
                        
                        <button
                          onClick={() => handleLaunchApp(app.id)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            app.isRunning
                              ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                              : 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                          }`}
                        >
                          {app.isRunning ? 'Show' : 'Launch'}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {installedApps.length === 0 && (
                <div className="text-center py-12">
                  <Grid3x3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">No Apps Installed</h3>
                  <p className="text-gray-500 mb-4">Browse the app store to install your first mini app</p>
                  <button
                    onClick={() => setActiveTab('store')}
                    className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all"
                  >
                    Browse App Store
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'store' && (
            <motion.div
              key="store"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Categories */}
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      selectedCategory === category.id
                        ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                        : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    {getCategoryIcon(category.id)}
                    {category.name}
                    <span className="px-2 py-0.5 bg-gray-600 text-xs rounded-full">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* App Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredApps.map((app) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    className="p-6 rounded-xl bg-gray-900/50 border border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer group"
                    onClick={() => setSelectedApp(app)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${app.color}`}>
                          {app.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold">{app.name}</h3>
                          <p className="text-sm text-gray-400">{app.author}</p>
                        </div>
                      </div>
                      
                      {app.isInstalled && (
                        <div className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full">
                          Installed
                        </div>
                      )}
                    </div>

                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{app.description}</p>

                    <div className="flex items-center gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>{app.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Download className="w-4 h-4" />
                        <span>{app.downloads.toLocaleString()}</span>
                      </div>
                      <div className="text-gray-400">{app.size}</div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {app.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-800/50 text-gray-300 text-xs rounded-lg"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!app.isInstalled) {
                          handleInstallApp(app.id);
                        } else {
                          handleLaunchApp(app.id);
                        }
                      }}
                      className={`w-full py-2 rounded-lg font-medium transition-all ${
                        app.isInstalled
                          ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                          : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                      }`}
                    >
                      {app.isInstalled ? 'Launch' : 'Install'}
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'running' && (
            <motion.div
              key="running"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {runningApps.map((runningApp) => (
                <motion.div
                  key={runningApp.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-6 rounded-xl bg-gray-900/50 border border-purple-500/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-800/50">
                        {runningApp.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold">{runningApp.title}</h3>
                        <p className="text-sm text-gray-400">
                          Active since {runningApp.lastActive.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setRunningApps(prev => prev.map(r => 
                          r.id === runningApp.id ? { ...r, isMinimized: !r.isMinimized } : r
                        ))}
                        className="p-2 rounded-lg bg-gray-600/20 text-gray-400 hover:bg-gray-600/30 transition-all"
                      >
                        {runningApp.isMinimized ? <Maximize className="w-4 h-4" /> : <Minimize className="w-4 h-4" />}
                      </button>
                      
                      <button className="p-2 rounded-lg bg-gray-600/20 text-gray-400 hover:bg-gray-600/30 transition-all">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleCloseApp(runningApp.id)}
                        className="p-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {!runningApp.isMinimized && (
                    <div className="h-64 bg-gray-800/30 rounded-lg border border-gray-700/50 flex items-center justify-center">
                      <div className="text-center">
                        <PlayCircle className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-500">App content would be displayed here</p>
                        <p className="text-xs text-gray-600 mt-1">{runningApp.url}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {runningApps.length === 0 && (
                <div className="text-center py-12">
                  <PlayCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">No Running Apps</h3>
                  <p className="text-gray-500">Launch an app to see it running here</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
