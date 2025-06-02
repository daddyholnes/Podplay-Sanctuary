import React, { useState, useContext, useEffect } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';
import { 
  Search, Grid, Layers, Plus, Star, Clock, Download, 
  MoreVertical, ChevronDown, Image, Music, FileText, 
  Code, Zap, MessageSquare, Database, Settings, Loader
} from 'lucide-react';
import miniAppsApi, { MiniApp } from '@/services/miniAppsApi';

// Category type
interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

/**
 * ScoutMiniAppsHub component displays and manages mini applications 
 * that can be launched within the Podplay environment
 */
const ScoutMiniAppsHub: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [activeView, setActiveView] = useState<'installed' | 'discover'>('installed');
  const [apps, setApps] = useState<MiniApp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Categories with icons
  const categories: Category[] = [
    { id: 'all', name: 'All', icon: <Layers size={16} /> },
    { id: 'productivity', name: 'Productivity', icon: <Zap size={16} /> },
    { id: 'media', name: 'Media', icon: <Image size={16} /> },
    { id: 'development', name: 'Development', icon: <Code size={16} /> },
    { id: 'communication', name: 'Communication', icon: <MessageSquare size={16} /> },
    { id: 'data', name: 'Data', icon: <Database size={16} /> },
  ];
  
  // Fetch apps when component mounts or activeView changes
  useEffect(() => {
    const fetchApps = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch appropriate apps based on active view
        let appsData: MiniApp[];
        if (activeView === 'installed') {
          appsData = await miniAppsApi.getInstalledApps();
        } else {
          appsData = await miniAppsApi.getApps();
        }
        
        setApps(appsData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching mini apps:', err);
        setError('Failed to load mini apps. Please try again later.');
        setIsLoading(false);
      }
    };
    
    fetchApps();
  }, [activeView]);
  
  // App management handlers
  const handleInstall = async (appId: string) => {
    try {
      await miniAppsApi.installApp(appId);
      // Update local state to reflect the change
      setApps(prev => 
        prev.map(app => 
          app.id === appId ? { ...app, installed: true } : app
        )
      );
    } catch (err) {
      console.error(`Error installing app ${appId}:`, err);
      // Show error notification to user
    }
  };
  
  const handleUninstall = async (appId: string) => {
    try {
      await miniAppsApi.uninstallApp(appId);
      
      // Update local state
      if (activeView === 'installed') {
        setApps(prev => prev.filter(app => app.id !== appId));
      } else {
        setApps(prev => 
          prev.map(app => 
            app.id === appId ? { ...app, installed: false } : app
          )
        );
      }
    } catch (err) {
      console.error(`Error uninstalling app ${appId}:`, err);
      // Show error notification to user
    }
  };
  
  const handleLaunch = async (appId: string) => {
    try {
      const { sessionId, url } = await miniAppsApi.launchApp(appId);
      
      // Record usage statistics
      await miniAppsApi.recordUsage(appId);
      
      // Open app in new window/iframe/tab as appropriate
      if (url) {
        // Open in iframe or new window based on app config
        console.log(`App launched with session ${sessionId} at ${url}`);
        // Future: Implement actual app launch logic here
      }
    } catch (err) {
      console.error(`Error launching app ${appId}:`, err);
      // Show error notification to user
    }
  };
  
  // Filter and search logic
  const filteredApps = apps.filter(app => {
    // Filter by category
    const categoryMatch = selectedCategory === 'all' || app.category === selectedCategory;
    
    // Filter by search query
    const searchMatch = 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.tags && app.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    return categoryMatch && searchMatch;
  });
  
  // Sort apps based on selected sort method
  const sortedApps = [...filteredApps].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rating':
        return b.rating - a.rating;
      case 'recent':
        if (!a.lastUsed && !b.lastUsed) return 0;
        if (!a.lastUsed) return 1;
        if (!b.lastUsed) return -1;
        return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
      case 'featured':
      default:
        // Sort by featured first, then by rating
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return b.rating - a.rating;
    }
  });
  
  // Function to get icon component based on category
  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || <Grid size={18} />;
  };
  
  // Function to render an app card
  const renderAppCard = (app: MiniApp) => {
    // Generate a background gradient based on the app's color
    const cardGradient = `linear-gradient(135deg, ${app.color}40, ${app.color}10)`;
    
    // Parse icon if it's a string
    let appIcon = app.icon;
    if (typeof app.icon === 'string') {
      // If icon is a string, we'll use it as text content
      appIcon = <span className="text-xl">{app.icon}</span>;
    }
    
    return (
      <div 
        key={app.id}
        className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-purple-100 dark:border-purple-900 hover:shadow-md transition-shadow"
      >
        <div className="p-4" style={{ background: cardGradient }}>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-md bg-white dark:bg-gray-800 flex items-center justify-center text-purple-700 dark:text-purple-300 mr-3 shadow-sm">
              {appIcon}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">{app.name}</h3>
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                <span>{app.author}</span>
                <span className="mx-2">•</span>
                <div className="flex items-center">
                  <Star size={12} className="text-yellow-500 mr-1" />
                  <span>{app.rating}</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <button className="p-1 text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 rounded">
                <MoreVertical size={16} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
            {app.description}
          </p>
          
          <div className="flex flex-wrap gap-1.5 mb-4">
            {app.tags && app.tags.slice(0, 3).map(tag => (
              <span 
                key={tag}
                className="px-2 py-0.5 bg-purple-50 dark:bg-gray-800 text-purple-700 dark:text-purple-300 rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex space-x-2">
            {app.installed ? (
              <>
                <button
                  onClick={() => handleLaunch(app.id)}
                  className="flex-1 py-1.5 px-3 bg-purple-gradient text-white text-sm rounded-md hover:opacity-90"
                >
                  Launch
                </button>
                <button
                  onClick={() => handleUninstall(app.id)}
                  className="py-1.5 px-3 bg-purple-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-md"
                >
                  Uninstall
                </button>
              </>
            ) : (
              <button
                onClick={() => handleInstall(app.id)}
                className="w-full py-1.5 bg-purple-gradient text-white text-sm rounded-md hover:opacity-90"
              >
                Install
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="scout-mini-apps h-full bg-sanctuary-light dark:bg-sanctuary-dark overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-purple-100 dark:border-purple-900 bg-white dark:bg-gray-900">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Scout Mini Apps
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Discover and manage small applications for your Podplay environment
        </p>
      </div>
      
      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 border-b border-purple-100 dark:border-purple-900 px-4">
        <div className="flex space-x-6">
          <button 
            className={`py-2 px-1 text-sm font-medium border-b-2 ${
              activeView === 'installed' 
                ? 'border-purple-500 text-purple-700 dark:text-purple-300' 
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveView('installed')}
          >
            My Apps
          </button>
          <button 
            className={`py-2 px-1 text-sm font-medium border-b-2 ${
              activeView === 'discover' 
                ? 'border-purple-500 text-purple-700 dark:text-purple-300' 
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveView('discover')}
          >
            Discover
          </button>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="p-3 border-b border-purple-100 dark:border-purple-900 bg-white dark:bg-gray-900 flex items-center justify-between flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <input 
            type="text" 
            className="w-full pl-9 pr-3 py-2 rounded-md bg-purple-50 dark:bg-gray-800 border-none text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500"
            placeholder="Search mini apps..."
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
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-3 text-gray-500 pointer-events-none" size={14} />
        </div>
        
        <div className="relative min-w-[150px]">
          <select 
            className="appearance-none w-full pl-3 pr-8 py-2 rounded-md bg-purple-50 dark:bg-gray-800 border-none text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="name">Name</option>
            <option value="rating">Rating</option>
            <option value="recent">Recently Used</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-3 text-gray-500 pointer-events-none" size={14} />
        </div>
      </div>
      
      {/* App grid */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-700 dark:text-purple-300 mb-4">
              <Loader size={24} className="animate-spin" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
              Loading Mini Apps
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mt-2">
              Please wait while we fetch available apps...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-700 dark:text-red-300 mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
              Error Loading Apps
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
        ) : sortedApps.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedApps.map(app => renderAppCard(app))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-700 dark:text-purple-300 mb-4">
              <Grid size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
              No apps found
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mt-2">
              {activeView === 'installed' 
                ? 'You haven\'t installed any mini apps yet. Explore the Discover tab to find apps.' 
                : 'No apps match your current filters. Try changing your search or category.'}
            </p>
            {activeView === 'installed' && (
              <button
                className="mt-4 px-4 py-2 bg-purple-gradient text-white text-sm rounded-md hover:opacity-90"
                onClick={() => setActiveView('discover')}
              >
                Browse Apps
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Footer with create button */}
      <div className="p-3 border-t border-purple-100 dark:border-purple-900 bg-white dark:bg-gray-900 flex items-center justify-between">
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {sortedApps.length} {sortedApps.length === 1 ? 'app' : 'apps'} found
        </div>
        
        <button className="flex items-center space-x-1 py-1 px-3 rounded bg-purple-gradient text-white text-sm hover:opacity-90">
          <Plus size={14} />
          <span>Create Mini App</span>
        </button>
      </div>
    </div>
  );
};

export default ScoutMiniAppsHub;