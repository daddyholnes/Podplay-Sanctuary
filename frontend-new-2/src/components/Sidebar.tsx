
import React from 'react';
import { NAVIGATION_ITEMS, APP_TITLE, BeakerIcon } from '../constants';
import { NavItem, ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  return (
    <div className="w-64 bg-slate-800/50 backdrop-blur-md p-4 flex flex-col space-y-2 border-r border-slate-700/50">
      <div className="flex items-center space-x-2 p-2 mb-4">
        <BeakerIcon className="w-8 h-8 text-purple-400" />
        <h1 className="text-xl font-semibold text-gray-200">{APP_TITLE}</h1>
      </div>
      {NAVIGATION_ITEMS.map((item: NavItem) => (
        <button
          key={item.id}
          onClick={() => setCurrentView(item.id)}
          className={`flex items-center space-x-3 p-3 rounded-lg w-full text-left transition-all duration-200 ease-in-out
            ${currentView === item.id 
              ? 'bg-purple-600 text-white shadow-lg' 
              : 'text-gray-400 hover:bg-slate-700/70 hover:text-gray-100'
            }`}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
      <div className="mt-auto p-2 text-center">
        <span className="text-xs text-gray-500">Version 0.1.0 (Alpha)</span>
      </div>
    </div>
  );
};

export default Sidebar;
