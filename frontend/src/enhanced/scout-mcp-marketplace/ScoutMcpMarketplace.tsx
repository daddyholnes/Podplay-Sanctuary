import React, { useState, useContext, useEffect } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';
import { Search, Grid, List, Filter, Download, Star, Package, ChevronDown, Loader } from 'lucide-react';
import mcpApi from '@/services/mcpApi';

// MCP tool type definition
type McpTool = {
  id: string;
  name: string;
  description: string;
  category: string;
  provider: string;
  version: string;
  rating: number;
  downloads: number;
  tags: string[];
  installed: boolean;
  featured: boolean;
  icon: string;
  permissions?: string[];
  documentation?: string;
  createdAt?: string;
  updatedAt?: string;
};

const ScoutMcpMarketplace: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterInstalled, setFilterInstalled] = useState(false);
  const [tools, setTools] = useState<McpTool[]>([]);
  const [categories, setCategories] = useState<string[]>(['all']);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch tools data on component mount
  useEffect(() => {
    const fetchTools = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch all tools
        const toolsData = await mcpApi.getTools();
        setTools(toolsData);
        
        // Extract unique categories
        const uniqueCategories = ['all', ...Array.from(new Set(toolsData.map(tool => tool.category)))];
        setCategories(uniqueCategories);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching MCP tools:', err);
        setError('Failed to load MCP tools. Please try again later.');
        setIsLoading(false);
      }
    };
    
    fetchTools();
  }, []);
  
  // Install/uninstall handlers
  const handleInstall = async (toolId: string) => {
    try {
      await mcpApi.installTool(toolId);
      // Update local state to reflect the change
      setTools(prev => 
        prev.map(tool => 
          tool.id === toolId ? { ...tool, installed: true } : tool
        )
      );
    } catch (err) {
      console.error(`Error installing tool ${toolId}:`, err);
      // Show error message to user
    }
  };
  
  const handleUninstall = async (toolId: string) => {
    try {
      await mcpApi.uninstallTool(toolId);
      // Update local state to reflect the change
      setTools(prev => 
        prev.map(tool => 
          tool.id === toolId ? { ...tool, installed: false } : tool
        )
      );
    } catch (err) {
      console.error(`Error uninstalling tool ${toolId}:`, err);
      // Show error message to user
    }
  };
  
  // Filter and search logic
  const filteredTools = tools.filter(tool => {
    // Filter by category
    const categoryMatch = selectedCategory === 'all' || tool.category === selectedCategory;
    
    // Filter by installed status
    const installedMatch = !filterInstalled || tool.installed;
    
    // Filter by search query
    const searchMatch = 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return categoryMatch && installedMatch && searchMatch;
  });
  
  // Function to render a tool card
  const renderToolCard = (tool: McpTool) => {
    return (
      <div 
        key={tool.id} 
        className={`${viewMode === 'grid' ? '' : 'mb-4'} bg-white dark:bg-gray-900 border border-purple-100 dark:border-purple-900 rounded-lg overflow-hidden transition-shadow hover:shadow-md`}
      >
        <div className="flex items-center p-4 bg-purple-50 dark:bg-gray-800">
          <div className="text-2xl mr-3">{tool.icon}</div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{tool.name}</h3>
            <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
              <span>{tool.provider}</span>
              <span className="mx-2">•</span>
              <div className="flex items-center">
                <Star size={12} className="text-yellow-500 mr-1" />
                <span>{tool.rating}</span>
              </div>
              <span className="mx-2">•</span>
              <div className="flex items-center">
                <Download size={12} className="mr-1" />
                <span>{tool.downloads.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <button 
            className={`ml-4 px-3 py-1.5 rounded-md text-sm font-medium ${tool.installed ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' : 'bg-purple-gradient text-white'}`}
            onClick={() => tool.installed ? handleUninstall(tool.id) : handleInstall(tool.id)}
          >
            {tool.installed ? 'Uninstall' : 'Install'}
          </button>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            {tool.description}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {tool.tags.map(tag => (
              <span 
                key={tag}
                className="px-2 py-0.5 bg-purple-50 dark:bg-gray-800 text-purple-700 dark:text-purple-300 rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="scout-mcp-marketplace h-full bg-sanctuary-light dark:bg-sanctuary-dark overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-purple-100 dark:border-purple-900 bg-white dark:bg-gray-900">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          MCP Marketplace
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Discover and manage Model Context Protocol (MCP) tools
        </p>
      </div>
      
      {/* Search and Filters */}
      <div className="p-3 border-b border-purple-100 dark:border-purple-900 bg-white dark:bg-gray-900 flex items-center justify-between flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <input 
            type="text" 
            className="w-full pl-9 pr-3 py-2 rounded-md bg-purple-50 dark:bg-gray-800 border-none text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500"
            placeholder="Search MCP tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
        </div>
        
        <div className="relative min-w-[150px]">
          <select 
            className="appearance-none w-full pl-3 pr-8 py-2 rounded-md bg-purple-50 dark:bg-gray-800 border-none text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-3 text-gray-500 pointer-events-none" size={14} />
        </div>
        
        <div className="flex space-x-2">
          <button 
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md ${
              viewMode === 'grid' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'bg-purple-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setViewMode('grid')}
          >
            <Grid size={14} />
            <span className="text-sm">Grid</span>
          </button>
          <button 
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md ${
              viewMode === 'list' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'bg-purple-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setViewMode('list')}
          >
            <List size={14} />
            <span className="text-sm">List</span>
          </button>
          <button 
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md ${
              filterInstalled ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'bg-purple-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setFilterInstalled(!filterInstalled)}
          >
            <Filter size={14} />
            <span className="text-sm">Installed</span>
          </button>
        </div>
      </div>
      
      {/* Tool Cards */}
      <div className={`flex-1 overflow-auto p-4 ${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : ''}`}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-700 dark:text-purple-300 mb-4">
              <Loader size={24} className="animate-spin" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
              Loading MCP Tools
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mt-2">
              Please wait while we fetch available tools...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-700 dark:text-red-300 mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
              Error Loading Tools
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mt-2">
              {error}
            </p>
            <button 
              className="mt-4 px-4 py-2 bg-purple-gradient text-white rounded-md text-sm font-medium"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : filteredTools.length > 0 ? (
          filteredTools.map(tool => renderToolCard(tool))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-700 dark:text-purple-300 mb-4">
              <Package size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
              No tools found
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mt-2">
              Try adjusting your filters or search query to find MCP tools
            </p>
          </div>
        )}
      </div>
      
      {/* Marketplace Footer */}
      <div className="p-3 border-t border-purple-100 dark:border-purple-900 bg-white dark:bg-gray-900 flex items-center justify-between text-xs">
        <div className="text-gray-600 dark:text-gray-400">
          {filteredTools.length} tools found
        </div>
        <div className="text-purple-700 dark:text-purple-300 flex items-center">
          <a href="#" className="hover:underline">Request a tool</a>
          <span className="mx-2">•</span>
          <a href="#" className="hover:underline">Submit MCP tool</a>
        </div>
      </div>
    </div>
  );
};

export default ScoutMcpMarketplace;