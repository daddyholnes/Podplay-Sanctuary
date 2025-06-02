'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Store, 
  Search, 
  Filter, 
  Download, 
  Star, 
  Shield, 
  Zap, 
  Code, 
  Database, 
  Globe, 
  Puzzle,
  Heart,
  TrendingUp,
  Clock,
  User,
  Package,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Info,
  Tag,
  Users,
  Calendar,
  FileCode,
  Terminal,
  Layers
} from 'lucide-react';

interface MCPServer {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: 'ai' | 'data' | 'api' | 'utility' | 'development' | 'integration';
  rating: number;
  downloads: number;
  lastUpdated: Date;
  size: string;
  status: 'not-installed' | 'installed' | 'running' | 'error' | 'updating';
  verified: boolean;
  price: 'free' | 'premium' | 'enterprise';
  tags: string[];
  screenshots?: string[];
  capabilities: string[];
  requirements: string[];
  docs?: string;
  github?: string;
}

interface InstalledMCP {
  id: string;
  serverId: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  port: number;
  memory: number;
  cpu: number;
  uptime: string;
  lastRestart: Date;
  config: Record<string, any>;
}

const mockMCPServers: MCPServer[] = [
  {
    id: 'filesystem-mcp',
    name: 'Filesystem MCP',
    description: 'Secure file system operations with sandboxed access and comprehensive file management capabilities',
    version: '2.1.0',
    author: 'Anthropic',
    category: 'utility',
    rating: 4.8,
    downloads: 15420,
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    size: '2.3 MB',
    status: 'installed',
    verified: true,
    price: 'free',
    tags: ['filesystem', 'files', 'storage', 'security'],
    capabilities: ['Read files', 'Write files', 'Directory operations', 'File permissions'],
    requirements: ['Node.js 18+', 'TypeScript 5.0+'],
    docs: 'https://docs.anthropic.com/mcp/filesystem',
    github: 'https://github.com/anthropic/filesystem-mcp'
  },
  {
    id: 'database-connector',
    name: 'Database Connector MCP',
    description: 'Universal database connector supporting PostgreSQL, MySQL, MongoDB, and more',
    version: '1.5.2',
    author: 'Community',
    category: 'data',
    rating: 4.6,
    downloads: 8932,
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    size: '5.1 MB',
    status: 'running',
    verified: true,
    price: 'free',
    tags: ['database', 'sql', 'nosql', 'connector'],
    capabilities: ['SQL queries', 'NoSQL operations', 'Schema introspection', 'Connection pooling'],
    requirements: ['Python 3.9+', 'Database drivers'],
    docs: 'https://mcp-db.readthedocs.io',
    github: 'https://github.com/mcp-community/database-connector'
  },
  {
    id: 'web-scraper',
    name: 'Web Scraper MCP',
    description: 'Intelligent web scraping with respect for robots.txt and rate limiting',
    version: '3.0.1',
    author: 'ScrapeCorp',
    category: 'integration',
    rating: 4.4,
    downloads: 12156,
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    size: '4.7 MB',
    status: 'not-installed',
    verified: true,
    price: 'premium',
    tags: ['scraping', 'web', 'data', 'extraction'],
    capabilities: ['HTML parsing', 'JavaScript rendering', 'CAPTCHA solving', 'Proxy support'],
    requirements: ['Chrome/Chromium', 'Python 3.10+'],
    docs: 'https://webscraper-mcp.com/docs'
  },
  {
    id: 'ai-model-hub',
    name: 'AI Model Hub MCP',
    description: 'Access to multiple AI models including GPT, Claude, Gemini, and local models',
    version: '4.2.0',
    author: 'AI Collective',
    category: 'ai',
    rating: 4.9,
    downloads: 23471,
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    size: '8.9 MB',
    status: 'installed',
    verified: true,
    price: 'free',
    tags: ['ai', 'models', 'inference', 'multimodal'],
    capabilities: ['Text generation', 'Image analysis', 'Code generation', 'Model switching'],
    requirements: ['API keys', 'Python 3.11+', 'CUDA (optional)'],
    docs: 'https://ai-hub-mcp.org/docs',
    github: 'https://github.com/ai-collective/model-hub-mcp'
  },
  {
    id: 'git-integration',
    name: 'Git Integration MCP',
    description: 'Complete Git workflow integration with GitHub, GitLab, and Bitbucket support',
    version: '2.8.3',
    author: 'DevTools Inc',
    category: 'development',
    rating: 4.7,
    downloads: 18923,
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    size: '3.2 MB',
    status: 'not-installed',
    verified: true,
    price: 'free',
    tags: ['git', 'version-control', 'github', 'collaboration'],
    capabilities: ['Repository operations', 'Branch management', 'PR/MR handling', 'Issue tracking'],
    requirements: ['Git 2.40+', 'SSH keys'],
    docs: 'https://git-mcp.dev/documentation',
    github: 'https://github.com/devtools/git-integration-mcp'
  },
  {
    id: 'api-gateway',
    name: 'API Gateway MCP',
    description: 'Enterprise-grade API gateway with authentication, rate limiting, and monitoring',
    version: '1.0.5',
    author: 'Enterprise Solutions',
    category: 'api',
    rating: 4.3,
    downloads: 5674,
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    size: '12.4 MB',
    status: 'not-installed',
    verified: true,
    price: 'enterprise',
    tags: ['api', 'gateway', 'auth', 'monitoring'],
    capabilities: ['Request routing', 'Authentication', 'Rate limiting', 'Analytics'],
    requirements: ['Redis', 'PostgreSQL', 'Docker'],
    docs: 'https://enterprise-solutions.com/api-gateway-mcp'
  }
];

const mockInstalledMCPs: InstalledMCP[] = [
  {
    id: 'inst-1',
    serverId: 'filesystem-mcp',
    name: 'Filesystem MCP',
    status: 'running',
    port: 3001,
    memory: 45,
    cpu: 12,
    uptime: '2d 14h 23m',
    lastRestart: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    config: { sandboxPath: '/workspace/sandbox', maxFileSize: '100MB' }
  },
  {
    id: 'inst-2',
    serverId: 'database-connector',
    name: 'Database Connector MCP',
    status: 'running',
    port: 3002,
    memory: 78,
    cpu: 8,
    uptime: '1d 6h 45m',
    lastRestart: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    config: { connectionTimeout: 30000, poolSize: 10 }
  },
  {
    id: 'inst-3',
    serverId: 'ai-model-hub',
    name: 'AI Model Hub MCP',
    status: 'stopped',
    port: 3003,
    memory: 0,
    cpu: 0,
    uptime: '0m',
    lastRestart: new Date(Date.now() - 1000 * 60 * 60 * 2),
    config: { defaultModel: 'gpt-4', maxTokens: 4096 }
  }
];

export default function MCPMarketplace() {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'installed' | 'categories'>('marketplace');
  const [mcpServers, setMcpServers] = useState<MCPServer[]>(mockMCPServers);
  const [installedMCPs, setInstalledMCPs] = useState<InstalledMCP[]>(mockInstalledMCPs);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'rating'>('popular');
  const [selectedMCP, setSelectedMCP] = useState<MCPServer | null>(null);

  const categories = [
    { id: 'all', name: 'All Categories', icon: <Package className="w-4 h-4" />, count: mcpServers.length },
    { id: 'ai', name: 'AI & ML', icon: <Zap className="w-4 h-4" />, count: mcpServers.filter(s => s.category === 'ai').length },
    { id: 'data', name: 'Data & Storage', icon: <Database className="w-4 h-4" />, count: mcpServers.filter(s => s.category === 'data').length },
    { id: 'api', name: 'API & Integration', icon: <Globe className="w-4 h-4" />, count: mcpServers.filter(s => s.category === 'api').length },
    { id: 'utility', name: 'Utilities', icon: <Puzzle className="w-4 h-4" />, count: mcpServers.filter(s => s.category === 'utility').length },
    { id: 'development', name: 'Development', icon: <Code className="w-4 h-4" />, count: mcpServers.filter(s => s.category === 'development').length },
    { id: 'integration', name: 'Integration', icon: <Layers className="w-4 h-4" />, count: mcpServers.filter(s => s.category === 'integration').length }
  ];

  const filteredServers = mcpServers.filter(server => {
    const matchesSearch = server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         server.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         server.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || server.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'popular': return b.downloads - a.downloads;
      case 'recent': return b.lastUpdated.getTime() - a.lastUpdated.getTime();
      case 'rating': return b.rating - a.rating;
      default: return 0;
    }
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ai': return 'text-yellow-400 bg-yellow-400/10';
      case 'data': return 'text-blue-400 bg-blue-400/10';
      case 'api': return 'text-green-400 bg-green-400/10';
      case 'utility': return 'text-purple-400 bg-purple-400/10';
      case 'development': return 'text-orange-400 bg-orange-400/10';
      case 'integration': return 'text-pink-400 bg-pink-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-400 bg-green-400/10';
      case 'stopped': return 'text-gray-400 bg-gray-400/10';
      case 'error': return 'text-red-400 bg-red-400/10';
      case 'installed': return 'text-blue-400 bg-blue-400/10';
      case 'updating': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getPriceColor = (price: string) => {
    switch (price) {
      case 'free': return 'text-green-400';
      case 'premium': return 'text-yellow-400';
      case 'enterprise': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const handleInstall = (serverId: string) => {
    setMcpServers(prev => prev.map(server => 
      server.id === serverId ? { ...server, status: 'updating' } : server
    ));

    // Simulate installation
    setTimeout(() => {
      setMcpServers(prev => prev.map(server => 
        server.id === serverId ? { ...server, status: 'installed' } : server
      ));
    }, 2000);
  };

  const handleMCPAction = (mcpId: string, action: 'start' | 'stop' | 'restart' | 'uninstall') => {
    setInstalledMCPs(prev => prev.map(mcp => {
      if (mcp.id === mcpId) {
        switch (action) {
          case 'start':
            return { ...mcp, status: 'running' };
          case 'stop':
            return { ...mcp, status: 'stopped', memory: 0, cpu: 0, uptime: '0m' };
          case 'restart':
            return { ...mcp, lastRestart: new Date() };
          case 'uninstall':
            return mcp; // Will be filtered out
          default:
            return mcp;
        }
      }
      return mcp;
    }).filter(mcp => !(action === 'uninstall' && mcp.id === mcpId)));

    if (action === 'uninstall') {
      const installedMCP = installedMCPs.find(mcp => mcp.id === mcpId);
      if (installedMCP) {
        setMcpServers(prev => prev.map(server => 
          server.id === installedMCP.serverId ? { ...server, status: 'not-installed' } : server
        ));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-purple-500/20 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-600 to-blue-600">
              <Store className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                MCP Marketplace
              </h1>
              <p className="text-gray-400">Discover and manage Model Context Protocol servers</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search MCP servers, capabilities, or tags..."
                className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 placeholder-gray-500"
              />
            </div>
            
            <div className="flex gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="popular">Most Popular</option>
                <option value="recent">Recently Updated</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6">
            {[
              { id: 'marketplace', label: 'Marketplace', icon: <Store className="w-4 h-4" /> },
              { id: 'installed', label: 'Installed', icon: <Package className="w-4 h-4" /> },
              { id: 'categories', label: 'Categories', icon: <Filter className="w-4 h-4" /> }
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
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'marketplace' && (
            <motion.div
              key="marketplace"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {filteredServers.map((server) => (
                <motion.div
                  key={server.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-6 rounded-xl bg-gray-900/50 border border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer group"
                  onClick={() => setSelectedMCP(server)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getCategoryColor(server.category)}`}>
                        {server.category === 'ai' && <Zap className="w-5 h-5" />}
                        {server.category === 'data' && <Database className="w-5 h-5" />}
                        {server.category === 'api' && <Globe className="w-5 h-5" />}
                        {server.category === 'utility' && <Puzzle className="w-5 h-5" />}
                        {server.category === 'development' && <Code className="w-5 h-5" />}
                        {server.category === 'integration' && <Layers className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          {server.name}
                          {server.verified && <Shield className="w-4 h-4 text-blue-400" />}
                        </h3>
                        <p className="text-sm text-gray-400">v{server.version} • {server.author}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(server.status)}`}>
                      {server.status === 'not-installed' ? 'Available' : server.status}
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{server.description}</p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>{server.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <Download className="w-4 h-4" />
                      <span>{server.downloads.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{server.size}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {server.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-800/50 text-gray-300 text-xs rounded-lg"
                      >
                        {tag}
                      </span>
                    ))}
                    {server.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-800/50 text-gray-400 text-xs rounded-lg">
                        +{server.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${getPriceColor(server.price)}`}>
                      {server.price === 'free' ? 'Free' : 
                       server.price === 'premium' ? 'Premium' : 'Enterprise'}
                    </span>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (server.status === 'not-installed') {
                          handleInstall(server.id);
                        }
                      }}
                      disabled={server.status !== 'not-installed'}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                        server.status === 'not-installed'
                          ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                          : server.status === 'updating'
                          ? 'bg-yellow-600/20 text-yellow-400'
                          : 'bg-blue-600/20 text-blue-400'
                      }`}
                    >
                      {server.status === 'not-installed' ? 'Install' :
                       server.status === 'updating' ? 'Installing...' :
                       server.status === 'installed' ? 'Installed' :
                       'Running'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'installed' && (
            <motion.div
              key="installed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {installedMCPs.map((mcp) => (
                <motion.div
                  key={mcp.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-6 rounded-xl bg-gray-900/50 border border-purple-500/20"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        {mcp.name}
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(mcp.status)}`}>
                          {mcp.status}
                        </div>
                      </h3>
                      <p className="text-sm text-gray-400">Port: {mcp.port} • Uptime: {mcp.uptime}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {mcp.status === 'running' ? (
                        <button
                          onClick={() => handleMCPAction(mcp.id, 'stop')}
                          className="p-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-all"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMCPAction(mcp.id, 'start')}
                          className="p-2 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 transition-all"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleMCPAction(mcp.id, 'restart')}
                        className="p-2 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-all"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      
                      <button className="p-2 rounded-lg bg-gray-600/20 text-gray-400 hover:bg-gray-600/30 transition-all">
                        <Settings className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleMCPAction(mcp.id, 'uninstall')}
                        className="p-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Resource Usage */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-400">CPU Usage</span>
                        <span className="text-blue-400">{mcp.cpu}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div
                          className="bg-blue-400 h-2 rounded-full transition-all"
                          style={{ width: `${mcp.cpu}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-400">Memory</span>
                        <span className="text-green-400">{mcp.memory}MB</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div
                          className="bg-green-400 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(mcp.memory / 10, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Configuration */}
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Configuration</h4>
                    <div className="space-y-1 text-xs">
                      {Object.entries(mcp.config).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-400">{key}:</span>
                          <span className="text-gray-300">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}

              {installedMCPs.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">No MCP Servers Installed</h3>
                  <p className="text-gray-500 mb-4">Browse the marketplace to install your first MCP server</p>
                  <button
                    onClick={() => setActiveTab('marketplace')}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all"
                  >
                    Browse Marketplace
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'categories' && (
            <motion.div
              key="categories"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {categories.filter(cat => cat.id !== 'all').map((category) => (
                <motion.div
                  key={category.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setActiveTab('marketplace');
                  }}
                  className="p-6 rounded-xl bg-gray-900/50 border border-purple-500/20 hover:border-purple-500/40 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-lg ${getCategoryColor(category.id)}`}>
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold group-hover:text-purple-400 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-400">{category.count} servers available</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {mcpServers
                      .filter(server => server.category === category.id)
                      .slice(0, 3)
                      .map((server) => (
                        <div key={server.id} className="text-sm text-gray-400 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-purple-400/50" />
                          {server.name}
                        </div>
                      ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
