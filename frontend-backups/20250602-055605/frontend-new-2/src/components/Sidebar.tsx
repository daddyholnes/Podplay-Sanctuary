
import React from 'react';
import { NAVIGATION_ITEMS, APP_TITLE, BeakerIcon } from '../constants';
import { NavItem, ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  return (
    <div className="w-64 glass-panel m-2 p-4 flex flex-col space-y-2 animate-fade-in">
      <div className="flex items-center space-x-3 p-3 mb-4 rounded-lg scout-gradient">
        <BeakerIcon className="w-8 h-8 text-white drop-shadow-md" />
        <h1 className="text-xl font-bold text-white text-shadow">{APP_TITLE}</h1>
      </div>
      
      <div className="space-y-1">
        {NAVIGATION_ITEMS.map((item: NavItem, index) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`flex items-center space-x-3 p-3 rounded-lg w-full text-left transition-all duration-200 ease-in-out animate-slide-in
              ${currentView === item.id 
                ? 'bg-purple-600/90 text-white shadow-lg glow-purple backdrop-blur-sm' 
                : 'text-gray-300 hover:bg-slate-700/50 hover:text-gray-100 hover:backdrop-blur-sm'
              }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>
      
      <div className="mt-auto p-3 text-center glass-panel">
        <span className="text-xs text-gray-400 font-medium">Version 0.1.0 (Alpha)</span>
      </div>
    </div>
  );
};

export default Sidebar;
