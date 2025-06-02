import { useState, useEffect } from 'react';
import {
  Search, Download, Star, Globe, MessageCircle,
  ExternalLink, RefreshCw,
  Sun, Moon, X, Minimize2, Zap,
  Clock
} from 'lucide-react';

interface McpPackage {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  downloads: number;
  stars: number;
  category: string;
  marketplace: string;
  tags: string[];
  lastUpdated: string;
  status: string;
  capabilities: string[];
  icon: string;
}

interface ChatMessage {
  id: number;
  sender: string;
  text: string;
  timestamp: Date;
  type: string;
}

const McpMarketplace = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMarketplace, setSelectedMarketplace] = useState('github');
  const [showChat, setShowChat] = useState(true);
  const [showBrowser, setShowBrowser] = useState(false);
  const [browserUrl, setBrowserUrl] = useState('https://github.com/topics/mcp');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  // MCP packages state
  const [mcpPackages, setMcpPackages] = useState<McpPackage[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<McpPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<McpPackage | null>(null);
  const [installedPackages, setInstalledPackages] = useState(new Set(['docker-toolkit', 'github-mcp']));
  
  // Auth states
  const [dockerAuth] = useState(true);
  const [githubAuth] = useState(true);
  
  // Chat window positioning
  const [chatPosition, setChatPosition] = useState({ x: 20, y: 20 });
  const [chatSize, setChatSize] = useState({ width: 400, height: 500 });
  const [chatMinimized, setChatMinimized] = useState(false);

  const theme = {
    bg: isDarkMode ? 'bg-slate-900' : 'bg-gray-50',
    cardBg: isDarkMode ? 'bg-slate-800/80' : 'bg-white/80',
    border: isDarkMode ? 'border-slate-700/50' : 'border-gray-200/50',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-slate-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-slate-400' : 'text-gray-500',
    input: isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white' : 'bg-white/50 border-gray-300/50 text-gray-900',
    button: isDarkMode ? 'bg-slate-700/50 hover:bg-slate-600/50' : 'bg-gray-100/50 hover:bg-gray-200/50'
  };

  // Sample MCP packages
  const sampleMcpPackages = [
    {
      id: 'docker-toolkit',
      name: 'Docker MCP Toolkit',
      description: 'Complete Docker container management and orchestration toolkit',
      author: 'Docker Inc.',
      version: '2.1.0',
      downloads: 15420,
      stars: 892,
      category: 'devops',
      marketplace: 'docker',
      tags: ['containers', 'orchestration', 'deployment'],
      lastUpdated: '2024-12-15',
      status: 'installed',
      capabilities: ['container-management', 'image-building', 'network-config'],
      icon: '🐳'
    },
    {
      id: 'github-mcp',
      name: 'GitHub MCP',
      description: 'Full GitHub integration for repository management, issues, and CI/CD',
      author: 'GitHub',
      version: '1.8.3',
      downloads: 23150,
      stars: 1247,
      category: 'development',
      marketplace: 'github',
      tags: ['git', 'version-control', 'ci-cd'],
      lastUpdated: '2024-12-20',
      status: 'installed',
      capabilities: ['repo-management', 'issue-tracking', 'actions'],
      icon: '🐙'
    },
    {
      id: 'database-manager',
      name: 'Database MCP Manager',
      description: 'Universal database management toolkit supporting PostgreSQL, MySQL, MongoDB',
      author: 'DB Tools Team',
      version: '3.2.1',
      downloads: 8930,
      stars: 567,
      category: 'database',
      marketplace: 'github',
      tags: ['database', 'sql', 'nosql', 'migration'],
      lastUpdated: '2024-12-18',
      status: 'available',
      capabilities: ['query-execution', 'schema-management', 'backup'],
      icon: '🗄️'
    },
    {
      id: 'ai-agent-builder',
      name: 'AI Agent Builder MCP',
      description: 'Build and deploy AI agents with advanced reasoning capabilities',
      author: 'AI Research Lab',
      version: '1.5.0',
      downloads: 12340,
      stars: 823,
      category: 'ai',
      marketplace: 'github',
      tags: ['ai', 'agents', 'reasoning', 'automation'],
      lastUpdated: '2024-12-22',
      status: 'available',
      capabilities: ['agent-creation', 'reasoning-engine', 'task-automation'],
      icon: '🤖'
    },
    {
      id: 'web-scraper-pro',
      name: 'Web Scraper Pro MCP',
      description: 'Advanced web scraping with AI-powered content extraction',
      author: 'Scrape Masters',
      version: '2.0.4',
      downloads: 6780,
      stars: 445,
      category: 'data',
      marketplace: 'github',
      tags: ['scraping', 'extraction', 'automation', 'ai'],
      lastUpdated: '2024-12-19',
      status: 'available',
      capabilities: ['content-extraction', 'ai-parsing', 'automation'],
      icon: '🕷️'
    },
    {
      id: 'cloud-deployer',
      name: 'Multi-Cloud Deployer MCP',
      description: 'Deploy applications across AWS, Azure, GCP with unified interface',
      author: 'CloudOps Team',
      version: '1.9.2',
      downloads: 9840,
      stars: 678,
      category: 'cloud',
      marketplace: 'docker',
      tags: ['cloud', 'deployment', 'aws', 'azure', 'gcp'],
      lastUpdated: '2024-12-21',
      status: 'available',
      capabilities: ['multi-cloud', 'deployment', 'scaling'],
      icon: '☁️'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Categories', icon: '📦', count: sampleMcpPackages.length },
    { id: 'development', name: 'Development', icon: '💻', count: 2 },
    { id: 'devops', name: 'DevOps', icon: '⚙️', count: 1 },
    { id: 'database', name: 'Database', icon: '🗄️', count: 1 },
    { id: 'ai', name: 'AI & ML', icon: '🤖', count: 1 },
    { id: 'data', name: 'Data Tools', icon: '📊', count: 1 },
    { id: 'cloud', name: 'Cloud', icon: '☁️', count: 1 }
  ];

  const marketplaces = [
    { id: 'github', name: 'GitHub MCP', icon: '🐙', color: 'from-gray-600 to-gray-800', authenticated: githubAuth },
    { id: 'docker', name: 'Docker Hub', icon: '🐳', color: 'from-blue-600 to-cyan-600', authenticated: dockerAuth },
    { id: 'custom', name: 'Custom Registry', icon: '🌐', color: 'from-green-600 to-emerald-600', authenticated: false }
  ];

  useEffect(() => {
    setMcpPackages(sampleMcpPackages);
    setFilteredPackages(sampleMcpPackages);
    
    // Initialize Mama Bear
    setChatMessages([
      {
        id: 1,
        sender: 'mama-bear',
        text: `Hello Nathan! 💝 Welcome to your MCP marketplace sanctuary. I'm here to help you discover, install, and manage MCP tools. \n\n🔧 **Connected**: Docker Desktop & GitHub\n📦 **Available**: ${sampleMcpPackages.length} MCP packages\n🚀 **Installed**: ${installedPackages.size} tools ready\n\nWhat would you like to explore today?`,
        timestamp: new Date(),
        type: 'greeting'
      }
    ]);
  }, []);

  // Filter packages
  useEffect(() => {
    let filtered = mcpPackages;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(pkg => pkg.category === selectedCategory);
    }

    if (selectedMarketplace !== 'all') {
      filtered = filtered.filter(pkg => pkg.marketplace === selectedMarketplace);
    }

    if (searchQuery) {
      filtered = filtered.filter(pkg => 
        pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredPackages(filtered);
  }, [mcpPackages, selectedCategory, selectedMarketplace, searchQuery]);

  const handleInstallRequest = (pkg: McpPackage) => {
    setChatMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'user',
      text: `Please install "${pkg.name}" for me`,
      timestamp: new Date(),
      type: 'install-request'
    }]);

    // Mama Bear responds
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'mama-bear',
        text: `🎯 I'll install "${pkg.name}" for you right away! \n\n📋 **What I'm doing:**\n• Checking dependencies\n• Downloading v${pkg.version}\n• Configuring capabilities\n• Setting up ${pkg.capabilities.join(', ')}\n\nThis should take about 30 seconds. I'll let you know when it's ready! 💝`,
        timestamp: new Date(),
        type: 'install-response'
      }]);

      // Simulate installation
      setTimeout(() => {
        setInstalledPackages(prev => new Set([...prev, pkg.id]));
        setChatMessages(prev => [...prev, {
          id: Date.now(),
          sender: 'mama-bear',
          text: `✅ Successfully installed "${pkg.name}"! \n\n🎉 **Ready to use:**\n• ${pkg.capabilities.join('\n• ')}\n\nYou can now use this MCP in your development workflow. Would you like me to show you how to get started? 🚀`,
          timestamp: new Date(),
          type: 'install-success'
        }]);
      }, 2000);
    }, 500);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: newMessage,
      timestamp: new Date(),
      type: 'message'
    };

    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    // Mama Bear AI responses
    setTimeout(() => {
      const lowerMessage = newMessage.toLowerCase();
      let response = '';

      if (lowerMessage.includes('search') || lowerMessage.includes('find') || lowerMessage.includes('look for')) {
        response = `🔍 I'll help you search for MCP tools! What specific functionality are you looking for? I can search by:\n\n• **Category** (AI, DevOps, Database, etc.)\n• **Capabilities** (automation, deployment, etc.)\n• **Technology** (Docker, GitHub, cloud, etc.)\n\nJust tell me what you need and I'll find the perfect tools! 💝`;
      } else if (lowerMessage.includes('install') || lowerMessage.includes('add')) {
        response = `🚀 I'd love to help you install MCP tools! You can:\n\n• **Click install** on any package card\n• **Tell me specifically** what you want to install\n• **Describe what you need** and I'll recommend tools\n\nI'll handle all the technical setup for you! What would you like to add to your toolkit? 🛠️`;
      } else if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
        response = `💡 Based on your Podplay Studio project, I recommend:\n\n🤖 **AI Agent Builder MCP** - Perfect for your Scout agent\n🗄️ **Database Manager MCP** - For your user data\n🕷️ **Web Scraper Pro MCP** - For content gathering\n\nWould you like me to install any of these? They'd work beautifully with your current setup! ✨`;
      } else {
        response = `I'm here to help with your MCP marketplace! 💝 You can ask me to:\n\n• Search for specific tools\n• Install packages for you\n• Recommend tools for your projects\n• Explain what any MCP does\n\nWhat would you like to explore? 🚀`;
      }

      setChatMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'mama-bear',
        text: response,
        timestamp: new Date(),
        type: 'response'
      }]);
    }, 800);
  };

  const PackageCard = ({ pkg }: { pkg: McpPackage }) => {
    const isInstalled = installedPackages.has(pkg.id);
    
    return (
      <div 
        className={`${theme.cardBg} backdrop-blur-md rounded-xl p-6 border ${theme.border} transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer`}
        onClick={() => setSelectedPackage(pkg)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">
              {pkg.icon}
            </div>
            <div>
              <h3 className={`font-bold ${theme.text} text-lg`}>{pkg.name}</h3>
              <p className={`text-sm ${theme.textSecondary}`}>by {pkg.author}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isInstalled ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
            }`}>
              {isInstalled ? '✓ Installed' : 'Available'}
            </span>
          </div>
        </div>

        <p className={`${theme.textSecondary} text-sm mb-4 leading-relaxed`}>
          {pkg.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {pkg.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded-lg text-xs">
              {tag}
            </span>
          ))}
          {pkg.tags.length > 3 && (
            <span className="text-xs text-purple-400">+{pkg.tags.length - 3} more</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star size={14} className="text-yellow-400" />
              <span className={theme.textTertiary}>{pkg.stars}</span>
            </div>
            <div className="flex items-center gap-1">
              <Download size={14} className={theme.textTertiary} />
              <span className={theme.textTertiary}>{pkg.downloads.toLocaleString()}</span>
            </div>
            <span className={`text-xs ${theme.textTertiary}`}>v{pkg.version}</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isInstalled) {
                handleInstallRequest(pkg);
              }
            }}
            disabled={isInstalled}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isInstalled 
                ? 'bg-green-500/20 text-green-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105'
            }`}
          >
            {isInstalled ? 'Installed' : 'Install'}
          </button>
        </div>
      </div>
    );
  };

  // Floating Chat Component
  const FloatingChat = () => {
    if (chatMinimized) {
      return (
        <button
          onClick={() => setChatMinimized(false)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-xl flex items-center justify-center text-2xl hover:scale-110 transition-transform z-50"
        >
          💝
        </button>
      );
    }

    return (
      <div
        className={`fixed ${theme.cardBg} backdrop-blur-md rounded-2xl shadow-2xl border ${theme.border} overflow-hidden z-40`}
        style={{
          left: chatPosition.x,
          top: chatPosition.y,
          width: chatSize.width,
          height: chatSize.height
        }}
      >
        {/* Chat Header */}
        <div 
          className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 cursor-move"
          onMouseDown={(e) => {
            const startX = e.clientX - chatPosition.x;
            const startY = e.clientY - chatPosition.y;

            const handleMouseMove = (e: MouseEvent) => {
              setChatPosition({
                x: Math.max(0, Math.min(window.innerWidth - chatSize.width, e.clientX - startX)),
                y: Math.max(0, Math.min(window.innerHeight - chatSize.height, e.clientY - startY))
              });
            };

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">💝</span>
              <span className="font-semibold text-white">Mama Bear</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setChatMinimized(true)}
                className="p-1 hover:bg-white/20 rounded"
              >
                <Minimize2 size={16} className="text-white" />
              </button>
              <button 
                onClick={() => setShowChat(false)}
                className="p-1 hover:bg-white/20 rounded"
              >
                <X size={16} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-auto p-4 space-y-3" style={{ height: chatSize.height - 120 }}>
          {chatMessages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-lg ${
                message.sender === 'user' 
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500'
              }`}>
                {message.sender === 'user' ? '👤' : '💝'}
              </div>
              
              <div className={`flex-1 max-w-xs ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-3 rounded-2xl ${theme.cardBg} backdrop-blur-md border ${theme.border} shadow-lg`}>
                  <div className={`${theme.text} text-sm leading-relaxed whitespace-pre-wrap`}>
                    {message.text}
                  </div>
                  <div className={`text-xs ${theme.textTertiary} mt-2`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-purple-500/20">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ask Mama Bear about MCP tools..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className={`flex-1 px-3 py-2 rounded-xl border ${theme.input} focus:border-purple-400 focus:outline-none transition-colors backdrop-blur-sm`}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white disabled:opacity-50 transition-all hover:scale-105"
            >
              💝
            </button>
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-50 hover:opacity-100"
          onMouseDown={(e) => {
            const startX = e.clientX;
            const startY = e.clientY;
            const startWidth = chatSize.width;
            const startHeight = chatSize.height;

            const handleMouseMove = (e: MouseEvent) => {
              setChatSize({
                width: Math.max(300, startWidth + (e.clientX - startX)),
                height: Math.max(200, startHeight + (e.clientY - startY))
              });
            };

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        >
          <div className="w-full h-full bg-purple-500/30" style={{ clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)' }} />
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${theme.bg} transition-colors duration-300`}>
      {/* Header */}
      <div className={`${theme.cardBg} backdrop-blur-md border-b ${theme.border} p-6`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2`}>
              🔧 MCP Marketplace
            </h1>
            <p className={`${theme.textSecondary}`}>Discover and manage Model Context Protocol tools with Mama Bear</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Marketplace Status */}
            <div className="flex gap-3">
              {marketplaces.map(marketplace => (
                <div key={marketplace.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r ${marketplace.color} bg-opacity-10 border border-current border-opacity-20`}>
                  <span className="text-lg">{marketplace.icon}</span>
                  <span className={`text-sm font-medium ${theme.text}`}>{marketplace.name}</span>
                  <div className={`w-2 h-2 rounded-full ${marketplace.authenticated ? 'bg-green-400' : 'bg-red-400'}`} />
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg ${theme.button} transition-colors`}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              
              {!showChat && (
                <button
                  onClick={() => setShowChat(true)}
                  className={`p-2 rounded-lg ${theme.button} transition-colors`}
                >
                  <MessageCircle size={18} />
                </button>
              )}

              <button
                onClick={() => setShowBrowser(!showBrowser)}
                className={`p-2 rounded-lg ${theme.button} transition-colors ${showBrowser ? 'bg-purple-500/20' : ''}`}
              >
                <Globe size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
            <input
              type="text"
              placeholder="Search MCP packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border ${theme.input} focus:border-purple-400 focus:outline-none transition-colors backdrop-blur-sm`}
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`px-4 py-3 rounded-xl border ${theme.input} focus:border-purple-400 focus:outline-none transition-colors backdrop-blur-sm`}
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name} ({cat.count})
              </option>
            ))}
          </select>

          {/* Marketplace Filter */}
          <select
            value={selectedMarketplace}
            onChange={(e) => setSelectedMarketplace(e.target.value)}
            className={`px-4 py-3 rounded-xl border ${theme.input} focus:border-purple-400 focus:outline-none transition-colors backdrop-blur-sm`}
          >
            <option value="all">All Marketplaces</option>
            {marketplaces.map(mp => (
              <option key={mp.id} value={mp.id}>
                {mp.icon} {mp.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-screen">
        {/* Packages Grid */}
        <div className={`flex-1 overflow-auto p-6 ${showBrowser ? 'w-1/2' : 'w-full'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPackages.map(pkg => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>

          {filteredPackages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className={`text-xl font-semibold ${theme.text} mb-2`}>No packages found</h3>
              <p className={theme.textSecondary}>Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Browser Panel */}
        {showBrowser && (
          <div className={`w-1/2 ${theme.cardBg} backdrop-blur-md border-l ${theme.border} flex flex-col`}>
            <div className="p-4 border-b border-purple-500/20">
              <div className="flex items-center gap-3 mb-3">
                <Globe size={20} className="text-purple-400" />
                <h3 className={`font-semibold ${theme.text}`}>Web Browser</h3>
                <button
                  onClick={() => setShowBrowser(false)}
                  className={`ml-auto p-1 rounded ${theme.button}`}
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="url"
                  value={browserUrl}
                  onChange={(e) => setBrowserUrl(e.target.value)}
                  className={`flex-1 px-3 py-2 rounded-lg border ${theme.input} focus:border-purple-400 focus:outline-none`}
                  placeholder="Enter URL..."
                />
                <button className={`px-3 py-2 rounded-lg ${theme.button} transition-colors`}>
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1">
              <iframe
                src={browserUrl}
                className="w-full h-full border-0"
                title="MCP Browser"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              />
            </div>
          </div>
        )}
      </div>

      {/* Floating Chat */}
      {showChat && <FloatingChat />}

      {/* Package Detail Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className={`${theme.cardBg} backdrop-blur-md rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-auto border ${theme.border}`}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                    {selectedPackage.icon}
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${theme.text}`}>{selectedPackage.name}</h2>
                    <p className={`${theme.textSecondary}`}>by {selectedPackage.author} • v{selectedPackage.version}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPackage(null)}
                  className={`p-2 rounded-lg ${theme.button} transition-colors`}
                >
                  <X size={20} />
                </button>
              </div>

              <p className={`${theme.textSecondary} mb-6 leading-relaxed`}>
                {selectedPackage.description}
              </p>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className={`font-semibold ${theme.text} mb-3`}>Capabilities</h3>
                  <div className="space-y-2">
                    {selectedPackage.capabilities.map(cap => (
                      <div key={cap} className="flex items-center gap-2">
                        <Zap size={14} className="text-purple-400" />
                        <span className={`text-sm ${theme.textSecondary}`}>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className={`font-semibold ${theme.text} mb-3`}>Stats</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Star size={14} className="text-yellow-400" />
                      <span className={`text-sm ${theme.textSecondary}`}>{selectedPackage.stars} stars</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Download size={14} className={theme.textTertiary} />
                      <span className={`text-sm ${theme.textSecondary}`}>{selectedPackage.downloads.toLocaleString()} downloads</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className={theme.textTertiary} />
                      <span className={`text-sm ${theme.textSecondary}`}>Updated {selectedPackage.lastUpdated}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleInstallRequest(selectedPackage);
                    setSelectedPackage(null);
                  }}
                  disabled={installedPackages.has(selectedPackage.id)}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    installedPackages.has(selectedPackage.id)
                      ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105'
                  }`}
                >
                  {installedPackages.has(selectedPackage.id) ? '✓ Installed' : 'Install Package'}
                </button>
                <button
                  onClick={() => window.open(`https://github.com/mcp/${selectedPackage.id}`, '_blank')}
                  className={`px-6 py-3 rounded-xl ${theme.button} transition-colors`}
                >
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default McpMarketplace;