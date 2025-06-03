import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Grid3X3,
  Plus,
  X,
  Search,
  Star,
  Globe,
  Maximize2,
  Minimize2,
  ArrowLeft,
  ExternalLink,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useThemeStore, useMiniAppStore } from '@/stores';
import { MiniApp } from '@/types';

const MiniApps: React.FC = () => {
  const { theme } = useThemeStore();
  const { 
    apps, 
    activeTabs, 
    currentTab,
    setApps,
    setActiveTabs,
    addTab,
    removeTab,
    setCurrentTab
  } = useMiniAppStore();

  const [view, setView] = useState<'grid' | 'browser'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Complete mini apps collection based on Nathan's uploaded logos
  const sampleApps: MiniApp[] = [
    // AI Chat Assistants
    {
      id: 'chatgpt',
      name: 'ChatGPT',
      description: 'OpenAI\'s powerful conversational AI assistant',
      url: 'https://chat.openai.com',
      icon: '/logos/ChatGPT-Logo.png',
      category: 'AI Chat'
    },
    {
      id: 'claude',
      name: 'Claude',
      description: 'Anthropic\'s helpful, harmless AI assistant',
      url: 'https://claude.ai',
      icon: '/logos/claude-ai9117.logowik.com.webp',
      category: 'AI Chat'
    },
    {
      id: 'gemini',
      name: 'Gemini',
      description: 'Google\'s most advanced AI model',
      url: 'https://gemini.google.com',
      icon: '/logos/gemini.png',
      category: 'AI Chat'
    },
    {
      id: 'perplexity',
      name: 'Perplexity',
      description: 'AI-powered search and research tool',
      url: 'https://perplexity.ai',
      icon: '/logos/perplexity.webp',
      category: 'AI Search'
    },
    {
      id: 'huggingchat',
      name: 'HuggingChat',
      description: 'Open-source conversational AI by Hugging Face',
      url: 'https://huggingface.co/chat',
      icon: '/logos/huggingchat.svg',
      category: 'AI Chat'
    },
    {
      id: 'poe',
      name: 'Poe',
      description: 'Multiple AI models in one platform',
      url: 'https://poe.com',
      icon: '/logos/poe.webp',
      category: 'AI Chat'
    },
    {
      id: 'grok',
      name: 'Grok',
      description: 'xAI\'s rebellious AI assistant',
      url: 'https://grok.x.ai',
      icon: '/logos/grok-x.png',
      category: 'AI Chat'
    },
    {
      id: 'lechat',
      name: 'LeChat',
      description: 'Mistral\'s conversational AI',
      url: 'https://chat.mistral.ai',
      icon: '/logos/lechat.png',
      category: 'AI Chat'
    },
    {
      id: 'qwenlm',
      name: 'Qwen',
      description: 'Alibaba\'s large language model',
      url: 'https://qwen.alibaba.com',
      icon: '/logos/qwenlm.webp',
      category: 'AI Chat'
    },
    {
      id: 'sparkdesk',
      name: 'SparkDesk',
      description: 'iFlytek\'s AI assistant',
      url: 'https://xinghuo.xfyun.cn',
      icon: '/logos/sparkdesk.webp',
      category: 'AI Chat'
    },

    // Development & Productivity Tools
    {
      id: 'github-copilot',
      name: 'GitHub Copilot',
      description: 'AI pair programmer for code assistance',
      url: 'https://github.com/features/copilot',
      icon: '/logos/github-copilot.webp',
      category: 'Development'
    },
    {
      id: 'ai-studio',
      name: 'AI Studio',
      description: 'Google\'s AI development platform',
      url: 'https://aistudio.google.com',
      icon: '/logos/aistudio.svg',
      category: 'Development'
    },
    {
      id: 'dify',
      name: 'Dify',
      description: 'Open-source LLM application development platform',
      url: 'https://dify.ai',
      icon: '/logos/dify.svg',
      category: 'Development'
    },
    {
      id: 'n8n',
      name: 'n8n',
      description: 'Fair-code workflow automation platform',
      url: 'https://n8n.io',
      icon: '/logos/n8n.svg',
      category: 'Automation'
    },

    // Google Ecosystem
    {
      id: 'jules',
      name: 'Jules',
      description: 'Google\'s experimental AI assistant',
      url: 'https://jules.google.com',
      icon: '/logos/jules.png',
      category: 'AI Chat'
    },
    {
      id: 'notebooklm',
      name: 'NotebookLM',
      description: 'AI-powered note-taking and research tool',
      url: 'https://notebooklm.google.com',
      icon: '/logos/notebooklm.svg',
      category: 'Productivity'
    },
    {
      id: 'google-search',
      name: 'Google Search',
      description: 'World\'s most popular search engine',
      url: 'https://google.com',
      icon: '/logos/google.svg',
      category: 'Search'
    },
    {
      id: 'genspark',
      name: 'GenSpark',
      description: 'AI-powered search and discovery',
      url: 'https://genspark.ai',
      icon: '/logos/genspark.jpg',
      category: 'AI Search'
    },

    // Search & Discovery
    {
      id: 'duckduckgo',
      name: 'DuckDuckGo',
      description: 'Privacy-focused search engine',
      url: 'https://duckduckgo.com',
      icon: '/logos/duckduckgo.webp',
      category: 'Search'
    },

    // Specialized Tools
    {
      id: 'abacus',
      name: 'Abacus',
      description: 'Advanced calculation and analysis tool',
      url: 'https://abacus.ai',
      icon: '/logos/abacus.webp',
      category: 'Productivity'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Apps', count: sampleApps.length },
    { id: 'AI Chat', name: 'AI Chat', count: sampleApps.filter(app => app.category === 'AI Chat').length },
    { id: 'Development', name: 'Development', count: sampleApps.filter(app => app.category === 'Development').length },
    { id: 'AI Search', name: 'AI Search', count: sampleApps.filter(app => app.category === 'AI Search').length },
    { id: 'Productivity', name: 'Productivity', count: sampleApps.filter(app => app.category === 'Productivity').length },
    { id: 'Search', name: 'Search', count: sampleApps.filter(app => app.category === 'Search').length },
    { id: 'Automation', name: 'Automation', count: sampleApps.filter(app => app.category === 'Automation').length }
  ];

  useEffect(() => {
    setApps(sampleApps);
  }, [setApps]);

  const filteredApps = apps.filter(app => {
    const matchesSearch = !searchQuery || 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const openApp = (app: MiniApp) => {
    addTab(app);
    setView('browser');
  };

  const closeTab = (appId: string) => {
    removeTab(appId);
    if (activeTabs.length === 1) {
      setView('grid');
    }
  };

  const goBackToGrid = () => {
    setView('grid');
  };

  const AppIcon: React.FC<{ app: MiniApp; size?: 'sm' | 'md' | 'lg' }> = ({ 
    app, 
    size = 'md' 
  }) => {
    const sizeClasses = {
      sm: 'w-6 h-6',
      md: 'w-12 h-12',
      lg: 'w-16 h-16'
    };

    return (
      <div className={`${sizeClasses[size]} rounded-xl bg-white shadow-sm flex items-center justify-center overflow-hidden`}>
        <img 
          src={app.icon} 
          alt={app.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to first letter if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.parentElement!.innerHTML = `<span class="text-purple-600 font-bold">${app.name[0]}</span>`;
          }}
        />
      </div>
    );
  };

  if (view === 'browser') {
    return (
      <div className="h-full flex flex-col">
        {/* Browser Header with Tabs */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`border-b ${
            theme === 'light'
              ? 'bg-white/50 border-purple-200'
              : 'bg-slate-800/50 border-slate-700'
          } backdrop-blur-md`}
        >
          {/* Tab Bar */}
          <div className="flex items-center px-4 py-2 space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={goBackToGrid}
              className="text-purple-600 hover:text-purple-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Apps
            </Button>
            
            <div className="flex-1 flex items-center space-x-1 overflow-x-auto">
              {activeTabs.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all min-w-0 max-w-48 ${
                    currentTab?.id === app.id
                      ? theme === 'light'
                        ? 'bg-purple-100 border-purple-300 text-purple-800'
                        : 'bg-purple-800/30 border-purple-600 text-purple-100'
                      : theme === 'light'
                      ? 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      : 'bg-slate-700/50 border-slate-600 hover:bg-slate-600/50'
                  }`}
                  onClick={() => setCurrentTab(app)}
                >
                  <AppIcon app={app} size="sm" />
                  <span className="font-medium truncate text-sm">{app.name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 w-5 p-0 hover:bg-red-100 hover:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(app.id);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </motion.div>
              ))}
              
              <Button
                size="sm"
                variant="ghost"
                onClick={goBackToGrid}
                className="text-purple-600 hover:text-purple-700 flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* App Content */}
        <div className="flex-1 relative">
          {currentTab ? (
            <motion.iframe
              key={currentTab.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={currentTab.url}
              className="w-full h-full border-none"
              title={currentTab.name}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Grid3X3 className={`w-16 h-16 mx-auto mb-4 ${
                  theme === 'light' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <p className={`text-lg font-medium ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  No app selected
                </p>
                <Button
                  onClick={goBackToGrid}
                  className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Browse Apps
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="h-full flex">
      {/* Categories Sidebar */}
      <motion.div
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`w-64 border-r p-4 ${
          theme === 'light'
            ? 'bg-white/30 border-purple-200'
            : 'bg-slate-800/30 border-slate-700'
        } backdrop-blur-sm`}
      >
        <h3 className={`font-semibold mb-3 ${
          theme === 'light' ? 'text-purple-800' : 'text-purple-100'
        }`}>
          Categories
        </h3>
        
        <div className="space-y-2">
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                selectedCategory === category.id
                  ? theme === 'light'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-purple-800/30 text-purple-100'
                  : theme === 'light'
                  ? 'hover:bg-gray-50 text-gray-700'
                  : 'hover:bg-slate-700/50 text-gray-300'
              }`}
            >
              <span className="font-medium">{category.name}</span>
              <Badge variant="secondary" className="text-xs">
                {category.count}
              </Badge>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`p-6 border-b ${
            theme === 'light'
              ? 'bg-white/50 border-purple-200'
              : 'bg-slate-800/50 border-slate-700'
          } backdrop-blur-md`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`text-2xl font-bold ${
                theme === 'light' ? 'text-purple-800' : 'text-purple-100'
              }`}>
                Mini Apps
              </h1>
              <p className={`${
                theme === 'light' ? 'text-purple-600' : 'text-purple-300'
              }`}>
                Access your favorite AI tools and applications
              </p>
            </div>
            
            {activeTabs.length > 0 && (
              <Button
                onClick={() => setView('browser')}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Open Apps ({activeTabs.length})
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        {/* Apps Grid */}
        <ScrollArea className="flex-1 p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredApps.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card 
                  className="cursor-pointer transition-all duration-200 hover:shadow-lg group"
                  onClick={() => openApp(app)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="mb-3 flex justify-center">
                      <AppIcon app={app} size="lg" />
                    </div>
                    
                    <h3 className={`font-semibold text-sm mb-1 truncate ${
                      theme === 'light' ? 'text-gray-900' : 'text-gray-100'
                    }`}>
                      {app.name}
                    </h3>
                    
                    <p className={`text-xs mb-2 line-clamp-2 ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {app.description}
                    </p>
                    
                    <Badge variant="outline" className="text-xs">
                      {app.category}
                    </Badge>
                    
                    {app.isActive && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          {filteredApps.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <Search className={`w-16 h-16 mb-4 ${
                theme === 'light' ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <p className={`text-lg font-medium ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                No apps found
              </p>
              <p className={`text-sm ${
                theme === 'light' ? 'text-gray-500' : 'text-gray-500'
              }`}>
                Try adjusting your search or category filter
              </p>
            </motion.div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default MiniApps;