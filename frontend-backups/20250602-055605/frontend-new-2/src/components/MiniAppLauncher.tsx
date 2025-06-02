
import React, { useState } from 'react';
import { MiniApp, MiniAppCategory } from '../types';
import { MINI_APPS_DATA, MagnifyingGlassIcon } from '../constants';
import AppCard from './AppCard';

interface MiniAppLauncherProps {
  onAppLaunchRequest: (app: MiniApp) => void;
}

const CATEGORIES: { id: MiniAppCategory | 'all' | 'featured'; name: string }[] = [
  { id: 'all', name: 'All Apps' },
  { id: 'featured', name: 'Featured' },
  { id: 'ai', name: 'AI' },
  { id: 'coding', name: 'Coding' },
  { id: 'productivity', name: 'Productivity' },
  { id: 'utilities', name: 'Utilities' },
  { id: 'google', name: 'Google Tools' },
  { id: 'research', name: 'Research' },
];


const MiniAppLauncher: React.FC<MiniAppLauncherProps> = ({ onAppLaunchRequest }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MiniAppCategory | 'all' | 'featured'>('all');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filteredApps = MINI_APPS_DATA.filter(app => {
    let matchesCategory = false;
    if (selectedCategory === 'all') {
      matchesCategory = true;
    } else if (selectedCategory === 'featured') {
      matchesCategory = !!app.featured;
    } else {
      // At this point, selectedCategory is of type MiniAppCategory
      matchesCategory = app.category === selectedCategory;
    }
    
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery) ||
      app.description.toLowerCase().includes(searchQuery);
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full p-4 md:p-6 bg-slate-900/50 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
      <header className="mb-6">
        <h2 className="text-3xl font-bold text-purple-300 mb-2">Mini App Launcher</h2>
        <p className="text-gray-400">Launch powerful tools and utilities directly within your Sanctuary.</p>
      </header>

      <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-grow">
          <input
            type="search"
            placeholder="Search apps (e.g., VS Code, Perplexity)..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full p-3 pl-10 bg-slate-800 border border-slate-700 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            aria-label="Search mini applications"
          />
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
        <div className="flex-shrink-0">
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value as MiniAppCategory | 'all' | 'featured')}
            className="p-3 bg-slate-800 border border-slate-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            aria-label="Filter apps by category"
          >
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredApps.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredApps.map(app => (
            <AppCard key={app.id} app={app} onLaunch={onAppLaunchRequest} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-xl text-gray-500">No applications match your criteria.</p>
          <p className="text-gray-400 mt-2">Try adjusting your search or filter.</p>
        </div>
      )}
    </div>
  );
};

export default MiniAppLauncher;
