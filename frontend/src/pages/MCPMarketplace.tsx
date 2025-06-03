import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search,
  Filter,
  Download,
  Star,
  Heart,
  Package,
  Github,
  Container,
  Globe,
  Zap,
  Check,
  Loader2,
  ArrowRight,
  TrendingUp,
  Shield,
  Database,
  Code,
  Brain,
  Cloud,
  Settings,
  Terminal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useThemeStore, useMCPStore } from '@/stores';
import { MCPPackage } from '@/types';

const MCPMarketplace: React.FC = () => {
  const { theme } = useThemeStore();
  const { 
    packages, 
    installedPackages, 
    isSearching, 
    searchQuery, 
    selectedCategory,
    setPackages,
    setInstalledPackages,
    setSearching,
    setSearchQuery,
    setSelectedCategory,
    addInstalledPackage
  } = useMCPStore();

  const [showBrowser, setShowBrowser] = useState(false);
  const [browserUrl, setBrowserUrl] = useState('https://github.com/search?q=mcp');
  const [showMamaBearChat, setShowMamaBearChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [authStatus, setAuthStatus] = useState({
    github: true,
    docker: false,
    custom: false
  });

  const categories = [
    { id: 'all', name: 'All Packages', icon: Package, count: 245 },
    { id: 'ai-ml', name: 'AI/ML', icon: Brain, count: 67 },
    { id: 'devops', name: 'DevOps', icon: Settings, count: 89 },
    { id: 'database', name: 'Database', icon: Database, count: 43 },
    { id: 'cloud', name: 'Cloud', icon: Cloud, count: 38 },
    { id: 'security', name: 'Security', icon: Shield, count: 29 },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp, count: 34 }
  ];

  const marketplaces = [
    { id: 'github', name: 'GitHub', icon: Github, status: authStatus.github, color: 'gray' },
    { id: 'docker', name: 'Docker Hub', icon: Container, status: authStatus.docker, color: 'blue' },
    { id: 'custom', name: 'Custom Registry', icon: Globe, status: authStatus.custom, color: 'purple' }
  ];

  // Sample MCP packages
  const samplePackages: MCPPackage[] = [
    {
      id: 'mcp-github-tools',
      name: 'GitHub Tools MCP',
      description: 'Complete GitHub integration with repository management, issues, and pull requests',
      marketplace: 'github',
      version: '2.1.0',
      capabilities: ['Git Operations', 'Issue Management', 'Code Review'],
      rating: 4.8,
      downloads: 15420,
      installation_status: 'installed'
    },
    {
      id: 'mcp-docker-manager',
      name: 'Docker Manager',
      description: 'Manage Docker containers, images, and networks through MCP interface',
      marketplace: 'docker',
      version: '1.5.2',
      capabilities: ['Container Management', 'Image Building', 'Network Config'],
      rating: 4.6,
      downloads: 8930
    },
    {
      id: 'mcp-database-toolkit',
      name: 'Database Toolkit',
      description: 'Universal database connector supporting PostgreSQL, MySQL, MongoDB, and more',
      marketplace: 'github',
      version: '3.0.1',
      capabilities: ['SQL Queries', 'Schema Management', 'Data Migration'],
      rating: 4.9,
      downloads: 22150
    },
    {
      id: 'mcp-ai-models',
      name: 'AI Models Hub',
      description: 'Access and manage multiple AI models through unified MCP interface',
      marketplace: 'custom',
      version: '1.8.0',
      capabilities: ['Model Loading', 'Inference API', 'Fine-tuning'],
      rating: 4.7,
      downloads: 12340
    },
    {
      id: 'mcp-cloud-deploy',
      name: 'Cloud Deployment',
      description: 'Deploy applications to AWS, GCP, Azure, and other cloud providers',
      marketplace: 'github',
      version: '2.3.1',
      capabilities: ['Multi-cloud Deploy', 'Infrastructure as Code', 'Monitoring'],
      rating: 4.5,
      downloads: 9876
    },
    {
      id: 'mcp-security-scanner',
      name: 'Security Scanner',
      description: 'Comprehensive security scanning for code, dependencies, and infrastructure',
      marketplace: 'github',
      version: '1.2.0',
      capabilities: ['Vulnerability Scan', 'Code Analysis', 'Compliance Check'],
      rating: 4.4,
      downloads: 6543
    }
  ];

  useEffect(() => {
    setPackages(samplePackages);
    setInstalledPackages(samplePackages.filter(pkg => pkg.installation_status === 'installed'));
  }, [setPackages, setInstalledPackages]);

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = !searchQuery || 
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.capabilities.some(cap => cap.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || selectedCategory === 'all' ||
      (selectedCategory === 'ai-ml' && pkg.capabilities.some(cap => 
        cap.toLowerCase().includes('ai') || cap.toLowerCase().includes('model'))) ||
      (selectedCategory === 'devops' && pkg.capabilities.some(cap => 
        cap.toLowerCase().includes('deploy') || cap.toLowerCase().includes('container'))) ||
      (selectedCategory === 'database' && pkg.capabilities.some(cap => 
        cap.toLowerCase().includes('sql') || cap.toLowerCase().includes('data'))) ||
      (selectedCategory === 'cloud' && pkg.capabilities.some(cap => 
        cap.toLowerCase().includes('cloud') || cap.toLowerCase().includes('aws'))) ||
      (selectedCategory === 'security' && pkg.capabilities.some(cap => 
        cap.toLowerCase().includes('security') || cap.toLowerCase().includes('scan')));

    return matchesSearch && matchesCategory;
  });

  const installPackage = async (packageId: string) => {
    const packageToInstall = packages.find(pkg => pkg.id === packageId);
    if (!packageToInstall) return;

    // Update package status to installing
    setPackages(packages.map(pkg => 
      pkg.id === packageId 
        ? { ...pkg, installation_status: 'installing' }
        : pkg
    ));

    // Simulate installation
    setTimeout(() => {
      const installedPackage = { ...packageToInstall, installation_status: 'installed' as const };
      setPackages(packages.map(pkg => 
        pkg.id === packageId ? installedPackage : pkg
      ));
      addInstalledPackage(installedPackage);
    }, 2000);
  };

  const askMamaBearForHelp = (packageName: string) => {
    setChatMessage(`Can you help me install and configure ${packageName}? What are the best practices for using this MCP tool?`);
    setShowMamaBearChat(true);
  };

  const sendChatMessage = () => {
    if (!chatMessage.trim()) return;
    // Handle chat message
    setChatMessage('');
  };

  const getMarketplaceIcon = (marketplace: string) => {
    switch (marketplace) {
      case 'github': return Github;
      case 'docker': return Container;
      default: return Globe;
    }
  };

  const getMarketplaceColor = (marketplace: string) => {
    switch (marketplace) {
      case 'github': return 'gray';
      case 'docker': return 'blue';
      default: return 'purple';
    }
  };

  return (
    <div className="h-full flex">
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
                MCP Marketplace
              </h1>
              <p className={`${
                theme === 'light' ? 'text-purple-600' : 'text-purple-300'
              }`}>
                Discover and install MCP tools with Mama Bear's assistance
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowMamaBearChat(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <Heart className="w-4 h-4 mr-2" />
                Ask Mama Bear
              </Button>
              
              <Button
                onClick={() => setShowBrowser(!showBrowser)}
                variant="outline"
                className={showBrowser ? 'bg-purple-100 text-purple-700' : ''}
              >
                <Globe className="w-4 h-4 mr-2" />
                Browse Docs
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search MCP packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              {marketplaces.map((marketplace) => {
                const Icon = marketplace.icon;
                return (
                  <Badge
                    key={marketplace.id}
                    variant={marketplace.status ? 'default' : 'outline'}
                    className={`flex items-center space-x-1 cursor-pointer ${
                      marketplace.status 
                        ? `bg-${marketplace.color}-100 text-${marketplace.color}-700 border-${marketplace.color}-300`
                        : ''
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{marketplace.name}</span>
                    {marketplace.status && <Check className="w-3 h-3" />}
                  </Badge>
                );
              })}
            </div>
          </div>
        </motion.div>

        <div className="flex-1 flex">
          {/* Categories Sidebar */}
          <motion.div
            initial={{ x: -200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
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
                  transition={{ delay: 0.1 + index * 0.05 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                    selectedCategory === category.id || (!selectedCategory && category.id === 'all')
                      ? theme === 'light'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-purple-800/30 text-purple-100'
                      : theme === 'light'
                      ? 'hover:bg-gray-50 text-gray-700'
                      : 'hover:bg-slate-700/50 text-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <category.icon className="w-4 h-4" />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Packages Grid */}
          <div className="flex-1">
            <ScrollArea className="h-full p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPackages.map((pkg, index) => {
                  const MarketplaceIcon = getMarketplaceIcon(pkg.marketplace);
                  return (
                    <motion.div
                      key={pkg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="h-full hover:shadow-lg transition-all duration-200">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className={`font-semibold ${
                                  theme === 'light' ? 'text-gray-900' : 'text-gray-100'
                                }`}>
                                  {pkg.name}
                                </h3>
                                {pkg.installation_status === 'installed' && (
                                  <Badge variant="default" className="bg-green-100 text-green-700">
                                    <Check className="w-3 h-3 mr-1" />
                                    Installed
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-3 mb-2">
                                <Badge 
                                  variant="outline" 
                                  className={`text-${getMarketplaceColor(pkg.marketplace)}-600 border-${getMarketplaceColor(pkg.marketplace)}-300`}
                                >
                                  <MarketplaceIcon className="w-3 h-3 mr-1" />
                                  {pkg.marketplace}
                                </Badge>
                                <span className={`text-sm ${
                                  theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                                }`}>
                                  v{pkg.version}
                                </span>
                              </div>
                              
                              <p className={`text-sm ${
                                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                              }`}>
                                {pkg.description}
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="space-y-4">
                            {/* Capabilities */}
                            <div>
                              <p className={`text-xs font-medium mb-2 ${
                                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                              }`}>
                                Capabilities:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {pkg.capabilities.map((capability) => (
                                  <Badge key={capability} variant="outline" className="text-xs">
                                    {capability}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            {/* Stats */}
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4 text-yellow-500" />
                                  <span>{pkg.rating}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Download className="w-4 h-4 text-gray-400" />
                                  <span>{pkg.downloads.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center space-x-2">
                              {pkg.installation_status === 'installed' ? (
                                <Button size="sm" variant="outline" className="flex-1">
                                  <Settings className="w-4 h-4 mr-2" />
                                  Configure
                                </Button>
                              ) : pkg.installation_status === 'installing' ? (
                                <Button size="sm" disabled className="flex-1">
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Installing...
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  onClick={() => installPackage(pkg.id)}
                                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Install
                                </Button>
                              )}
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => askMamaBearForHelp(pkg.name)}
                              >
                                <Heart className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Browser Panel */}
      {showBrowser && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          className={`w-96 border-l flex flex-col ${
            theme === 'light'
              ? 'bg-white/50 border-purple-200'
              : 'bg-slate-800/50 border-slate-700'
          } backdrop-blur-md`}
        >
          <div className="p-3 border-b border-purple-200 dark:border-slate-700">
            <div className="flex items-center space-x-2">
              <Input
                value={browserUrl}
                onChange={(e) => setBrowserUrl(e.target.value)}
                placeholder="Enter URL..."
                className="text-sm"
              />
              <Button size="sm" variant="ghost" onClick={() => setShowBrowser(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1">
            <iframe
              src={browserUrl}
              className="w-full h-full border-none"
              title="Documentation Browser"
            />
          </div>
        </motion.div>
      )}

      {/* Mama Bear Chat */}
      <AnimatePresence>
        {showMamaBearChat && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className={`fixed right-4 top-20 w-80 h-96 rounded-lg shadow-xl overflow-hidden z-50 ${
              theme === 'light'
                ? 'bg-white border border-purple-200'
                : 'bg-slate-800 border border-slate-600'
            }`}
          >
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-white" />
                  <span className="text-white font-medium text-sm">Mama Bear MCP Assistant</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={() => setShowMamaBearChat(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col h-full">
              <ScrollArea className="flex-1 p-3">
                <div className={`p-3 rounded-lg mb-3 ${
                  theme === 'light' 
                    ? 'bg-purple-50 border border-purple-200' 
                    : 'bg-purple-900/20 border border-purple-600/30'
                }`}>
                  <p className="text-sm text-purple-600 dark:text-purple-300">
                    Hi! I'm here to help you discover, install, and configure MCP packages. 
                    What would you like to know about these tools?
                  </p>
                </div>
              </ScrollArea>
              
              <div className="p-3 border-t border-purple-200 dark:border-slate-600">
                <div className="flex items-end space-x-2">
                  <Textarea
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Ask about MCP packages..."
                    className="min-h-[32px] text-sm resize-none"
                    rows={1}
                  />
                  <Button
                    size="sm"
                    onClick={sendChatMessage}
                    disabled={!chatMessage.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const X = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m18 6-12 12" />
    <path d="m6 6 12 12" />
  </svg>
);

export default MCPMarketplace;