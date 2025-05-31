import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Search, 
  Grid, 
  List, 
  Star, 
  ExternalLink, 
  X, 
  Maximize2, 
  Minimize2,
  RefreshCw,
  Shield,
  Globe,
  Code,
  Brain,
  Zap,
  Sparkles
} from 'lucide-react';

// ==================== INTERFACES ====================

interface MiniApp {
  id: string;
  name: string;
  url: string;
  category: 'ai' | 'coding' | 'productivity' | 'utilities' | 'research' | 'design';
  description: string;
  featured?: boolean;
  requiresAuth?: boolean;
  isInternal?: boolean;
  logoUrl?: string;
  fallbackIcon?: string;
  color?: string;
  tags?: string[];
}

interface AppLogo {
  src: string;
  fallback: string;
  loaded: boolean;
  error: boolean;
}

// ==================== LOGO COMPONENT ====================

const AppLogo: React.FC<{
  app: MiniApp;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}> = ({ app, size = 'medium', className = '' }) => {
  const [logoState, setLogoState] = useState<AppLogo>({
    src: app.logoUrl || '',
    fallback: app.fallbackIcon || app.name.charAt(0).toUpperCase(),
    loaded: false,
    error: false
  });

  const sizeClasses = {
    small: 'w-8 h-8 text-sm',
    medium: 'w-12 h-12 text-lg',
    large: 'w-16 h-16 text-xl'
  };

  const handleImageLoad = () => {
    setLogoState(prev => ({ ...prev, loaded: true, error: false }));
  };

  const handleImageError = () => {
    setLogoState(prev => ({ ...prev, loaded: false, error: true }));
  };

  if (logoState.src && !logoState.error) {
    return (
      <div className={`${sizeClasses[size]} ${className} relative overflow-hidden rounded-xl`}>
        <img
          src={logoState.src}
          alt={`${app.name} logo`}
          className="w-full h-full object-cover"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        {!logoState.loaded && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl" />
        )}
      </div>
    );
  }

  // Fallback icon with app color
  return (
    <div 
      className={`${sizeClasses[size]} ${className} rounded-xl flex items-center justify-center font-bold text-white shadow-lg`}
      style={{ 
        background: app.color || `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` 
      }}
    >
      {logoState.fallback}
    </div>
  );
};

// ==================== ENHANCED CURATED MINI APPS ====================

const ENHANCED_MINI_APPS: MiniApp[] = [
  // ✨ AI & Research Tools
  {
    id: 'claude',
    name: 'Claude',
    url: 'https://claude.ai',
    category: 'ai',
    description: 'Anthropic Claude AI assistant for complex reasoning and analysis',
    featured: true,
    logoUrl: 'https://claude.ai/favicon.ico',
    fallbackIcon: '🤖',
    color: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
    tags: ['ai', 'assistant', 'reasoning']
  },
  {
    id: 'jules',
    name: 'Jules AI',
    url: 'https://jules.google.com',
    category: 'ai',
    description: 'Google Jules AI for advanced problem solving and research',
    featured: true,
    logoUrl: 'https://www.google.com/favicon.ico',
    fallbackIcon: 'J',
    color: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
    tags: ['google', 'ai', 'research']
  },
  {
    id: 'perplexity',
    name: 'Perplexity AI',
    url: 'https://www.perplexity.ai',
    category: 'ai',
    description: 'AI-powered research engine with real-time information',
    featured: true,
    logoUrl: 'https://www.perplexity.ai/favicon.svg',
    fallbackIcon: '🔍',
    color: 'linear-gradient(135deg, #00D4AA 0%, #00A693 100%)',
    tags: ['search', 'research', 'real-time']
  },
  {
    id: 'notebooklm',
    name: 'NotebookLM',
    url: 'https://notebooklm.google.com',
    category: 'ai',
    description: 'Google AI notebook for personalized research assistance',
    featured: true,
    logoUrl: 'https://notebooklm.google.com/favicon.ico',
    fallbackIcon: '📔',
    color: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)',
    tags: ['notebook', 'research', 'google']
  },
  {
    id: 'gemini',
    name: 'Gemini',
    url: 'https://gemini.google.com/app',
    category: 'ai',
    description: 'Google Gemini advanced AI for multimodal tasks',
    logoUrl: 'https://gemini.google.com/favicon.ico',
    fallbackIcon: '💎',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    tags: ['multimodal', 'google', 'advanced']
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    url: 'https://chat.openai.com',
    category: 'ai',
    description: 'OpenAI ChatGPT conversational AI assistant',
    logoUrl: 'https://chat.openai.com/favicon.ico',
    fallbackIcon: '💬',
    color: 'linear-gradient(135deg, #10A37F 0%, #1A7F64 100%)',
    tags: ['openai', 'conversation', 'gpt']
  },

  // 💻 Coding & Development
  {
    id: 'vscode-web',
    name: 'VS Code Web',
    url: 'https://vscode.dev',
    category: 'coding',
    description: 'Visual Studio Code in your browser with full editing capabilities',
    featured: true,
    logoUrl: 'https://vscode.dev/favicon.ico',
    fallbackIcon: '⚡',
    color: 'linear-gradient(135deg, #007ACC 0%, #0066B3 100%)',
    tags: ['editor', 'microsoft', 'web']
  },
  {
    id: 'copilot',
    name: 'GitHub Copilot',
    url: 'https://copilot.microsoft.com',
    category: 'coding',
    description: 'AI-powered coding assistant for enhanced productivity',
    featured: true,
    logoUrl: 'https://github.com/favicon.ico',
    fallbackIcon: '🤖',
    color: 'linear-gradient(135deg, #333 0%, #24292e 100%)',
    tags: ['ai', 'coding', 'github']
  },
  {
    id: 'replit',
    name: 'Replit',
    url: 'https://replit.com',
    category: 'coding',
    description: 'Collaborative online IDE for rapid development',
    logoUrl: 'https://replit.com/favicon.ico',
    fallbackIcon: '🔧',
    color: 'linear-gradient(135deg, #F26207 0%, #E94E1B 100%)',
    tags: ['ide', 'collaborative', 'rapid']
  },
  {
    id: 'codesandbox',
    name: 'CodeSandbox',
    url: 'https://codesandbox.io',
    category: 'coding',
    description: 'Online code editor for modern web development',
    logoUrl: 'https://codesandbox.io/favicon.ico',
    fallbackIcon: '📦',
    color: 'linear-gradient(135deg, #040404 0%, #151515 100%)',
    tags: ['web', 'frontend', 'sandbox']
  },
  {
    id: 'stackblitz',
    name: 'StackBlitz',
    url: 'https://stackblitz.com',
    category: 'coding',
    description: 'Instant development environments powered by WebContainers',
    logoUrl: 'https://stackblitz.com/favicon.ico',
    fallbackIcon: '⚡',
    color: 'linear-gradient(135deg, #1389FD 0%, #0F7BD6 100%)',
    tags: ['instant', 'webcontainers', 'fast']
  },
  {
    id: 'github',
    name: 'GitHub',
    url: 'https://github.com',
    category: 'coding',
    description: 'World\'s leading platform for version control and collaboration',
    logoUrl: 'https://github.com/favicon.ico',
    fallbackIcon: '🐙',
    color: 'linear-gradient(135deg, #333 0%, #24292e 100%)',
    tags: ['git', 'collaboration', 'opensource']
  },

  // 🎨 Design & Productivity
  {
    id: 'figma',
    name: 'Figma',
    url: 'https://figma.com',
    category: 'design',
    description: 'Collaborative design tool for teams',
    featured: true,
    logoUrl: 'https://figma.com/favicon.ico',
    fallbackIcon: '🎨',
    color: 'linear-gradient(135deg, #F24E1E 0%, #FF7262 100%)',
    tags: ['design', 'collaborative', 'ui']
  },
  {
    id: 'notion',
    name: 'Notion',
    url: 'https://notion.so',
    category: 'productivity',
    description: 'All-in-one workspace for notes, docs, and projects',
    logoUrl: 'https://notion.so/favicon.ico',
    fallbackIcon: '📝',
    color: 'linear-gradient(135deg, #000 0%, #333 100%)',
    tags: ['workspace', 'notes', 'productivity']
  },
  {
    id: 'linear',
    name: 'Linear',
    url: 'https://linear.app',
    category: 'productivity',
    description: 'Purpose-built tool for modern software development',
    logoUrl: 'https://linear.app/favicon.ico',
    fallbackIcon: '📈',
    color: 'linear-gradient(135deg, #5E6AD2 0%, #4B5DB5 100%)',
    tags: ['project', 'software', 'linear']
  },
  {
    id: 'miro',
    name: 'Miro',
    url: 'https://miro.com',
    category: 'productivity',
    description: 'Online collaborative whiteboard platform',
    logoUrl: 'https://miro.com/favicon.ico',
    fallbackIcon: '🖼️',
    color: 'linear-gradient(135deg, #FFD02F 0%, #FF9D00 100%)',
    tags: ['whiteboard', 'collaborative', 'visual']
  },

  // 🛠️ Utilities
  {
    id: 'excalidraw',
    name: 'Excalidraw',
    url: 'https://excalidraw.com',
    category: 'utilities',
    description: 'Virtual collaborative whiteboard for sketching hand-drawn diagrams',
    logoUrl: 'https://excalidraw.com/favicon.ico',
    fallbackIcon: '✏️',
    color: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
    tags: ['drawing', 'diagrams', 'sketching']
  },
  {
    id: 'regex101',
    name: 'Regex101',
    url: 'https://regex101.com',
    category: 'utilities',
    description: 'Online regex tester and debugger with explanations',
    logoUrl: 'https://regex101.com/favicon.ico',
    fallbackIcon: '🔍',
    color: 'linear-gradient(135deg, #48B984 0%, #38A169 100%)',
    tags: ['regex', 'testing', 'debugging']
  },
  {
    id: 'json-formatter',
    name: 'JSON Hero',
    url: 'https://jsonhero.io',
    category: 'utilities',
    description: 'Beautiful JSON viewer with tree visualization',
    logoUrl: 'https://jsonhero.io/favicon.ico',
    fallbackIcon: '📋',
    color: 'linear-gradient(135deg, #4ADE80 0%, #22C55E 100%)',
    tags: ['json', 'viewer', 'formatter']
  },
  {
    id: 'coolors',
    name: 'Coolors',
    url: 'https://coolors.co',
    category: 'design',
    description: 'Super fast color palette generator',
    logoUrl: 'https://coolors.co/favicon.ico',
    fallbackIcon: '🎨',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    tags: ['colors', 'palette', 'design']
  }
];

// ==================== ENHANCED MINI APP LAUNCHER ====================

const EnhancedMiniAppLauncher: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeApp, setActiveApp] = useState<MiniApp | null>(null);
  const [isGridView, setIsGridView] = useState(true);
  const [favorites, setFavorites] = useState<string[]>(['claude', 'vscode-web', 'perplexity']);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // ==================== CATEGORIES WITH ICONS ====================

  const categories = [
    { id: 'all', name: 'All Apps', icon: Grid, count: ENHANCED_MINI_APPS.length },
    { id: 'ai', name: 'AI & Research', icon: Brain, count: ENHANCED_MINI_APPS.filter(app => app.category === 'ai').length },
    { id: 'coding', name: 'Development', icon: Code, count: ENHANCED_MINI_APPS.filter(app => app.category === 'coding').length },
    { id: 'design', name: 'Design', icon: Sparkles, count: ENHANCED_MINI_APPS.filter(app => app.category === 'design').length },
    { id: 'productivity', name: 'Productivity', icon: Zap, count: ENHANCED_MINI_APPS.filter(app => app.category === 'productivity').length },
    { id: 'utilities', name: 'Utilities', icon: Globe, count: ENHANCED_MINI_APPS.filter(app => app.category === 'utilities').length }
  ];

  // ==================== FILTERING & SEARCH ====================

  const filteredApps = ENHANCED_MINI_APPS.filter(app => {
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    const matchesSearch = 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredApps = filteredApps.filter(app => app.featured);
  const favoriteApps = filteredApps.filter(app => favorites.includes(app.id));

  // ==================== APP MANAGEMENT ====================

  const handleAppLaunch = useCallback((app: MiniApp) => {
    setIsLoading(true);
    setActiveApp(app);
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const toggleFavorite = useCallback((appId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(appId) 
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    );
  }, []);

  const closeApp = useCallback(() => {
    setActiveApp(null);
    setIsFullscreen(false);
    setIsLoading(false);
  }, []);

  const refreshApp = useCallback(() => {
    if (iframeRef.current && activeApp) {
      setIsLoading(true);
      iframeRef.current.src = activeApp.url;
      setTimeout(() => setIsLoading(false), 1000);
    }
  }, [activeApp]);

  // ==================== RENDER FUNCTIONS ====================

  const renderAppCard = (app: MiniApp, size: 'normal' | 'featured' = 'normal') => {
    const isFavorite = favorites.includes(app.id);
    
    return (
      <div 
        key={app.id} 
        className={`group relative bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 
                   hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-xl transition-all duration-300 
                   cursor-pointer transform hover:-translate-y-1 ${size === 'featured' ? 'lg:col-span-2' : ''}`}
        onClick={() => handleAppLaunch(app)}
      >
        {/* App Icon */}
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            <AppLogo app={app} size={size === 'featured' ? 'large' : 'medium'} />
            {app.requiresAuth && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                <Shield className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => toggleFavorite(app.id, e)}
              className={`p-2 rounded-lg transition-colors ${
                isFavorite 
                  ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(app.url, '_blank');
              }}
              className="p-2 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 
                       rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{app.name}</h3>
            {app.featured && (
              <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full">
                Featured
              </span>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            {app.description}
          </p>
          
          {/* Tags */}
          {app.tags && (
            <div className="flex flex-wrap gap-1 mt-3">
              {app.tags.slice(0, 3).map(tag => (
                <span 
                  key={tag} 
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 
                           text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 
                       opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    );
  };

  const renderCategoryButton = (category: typeof categories[0]) => {
    const Icon = category.icon;
    const isActive = selectedCategory === category.id;
    
    return (
      <button
        key={category.id}
        onClick={() => setSelectedCategory(category.id)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
          isActive 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
        }`}
      >
        <Icon className="w-5 h-5" />
        <span>{category.name}</span>
        <span className={`text-xs px-2 py-1 rounded-full ${
          isActive 
            ? 'bg-white/20 text-white' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
        }`}>
          {category.count}
        </span>
      </button>
    );
  };

  // ==================== MAIN RENDER ====================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mini App Launcher</h1>
              <p className="text-gray-600 dark:text-gray-400">Cherry Studio inspired productivity suite</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setIsGridView(true)}
                  className={`p-2 rounded-md transition-colors ${
                    isGridView 
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsGridView(false)}
                  className={`p-2 rounded-md transition-colors ${
                    !isGridView 
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Categories */}
        <div className="mb-8 space-y-6">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                       rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-3">
            {categories.map(renderCategoryButton)}
          </div>
        </div>

        {/* Favorites Section */}
        {favoriteApps.length > 0 && selectedCategory === 'all' && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              Your Favorites
            </h2>
            <div className={`grid gap-6 ${
              isGridView 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {favoriteApps.map(app => renderAppCard(app))}
            </div>
          </div>
        )}

        {/* Featured Apps */}
        {featuredApps.length > 0 && selectedCategory === 'all' && searchQuery === '' && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Featured Apps
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredApps.map(app => renderAppCard(app, 'featured'))}
            </div>
          </div>
        )}

        {/* All Apps */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            {selectedCategory === 'all' ? 'All Apps' : categories.find(c => c.id === selectedCategory)?.name}
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              ({filteredApps.length} apps)
            </span>
          </h2>
          
          {filteredApps.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">No apps found matching your search.</p>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              isGridView 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {filteredApps.map(app => renderAppCard(app))}
            </div>
          )}
        </div>
      </div>

      {/* App Modal */}
      {activeApp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className={`bg-white dark:bg-gray-900 h-full flex flex-col transition-all duration-300 ${
            isFullscreen ? '' : 'm-4 rounded-2xl shadow-2xl'
          }`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <AppLogo app={activeApp} size="small" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{activeApp.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{activeApp.url}</p>
                </div>
                {isLoading && (
                  <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={refreshApp}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 
                           hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 
                           hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => window.open(activeApp.url, '_blank')}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 
                           hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  onClick={closeApp}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 
                           hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Loading {activeApp.name}...</p>
                </div>
              </div>
            )}

            {/* Iframe */}
            <iframe
              ref={iframeRef}
              src={activeApp.url}
              className="flex-1 w-full border-0"
              title={activeApp.name}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads allow-modals"
              allow="camera; microphone; geolocation; clipboard-read; clipboard-write"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedMiniAppLauncher;