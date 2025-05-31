
import React, { useState } from 'react';
import './index.css';
import Sidebar from './components/Sidebar';
import UnifiedDevelopmentHub from './components/UnifiedDevelopmentHub';
import { ViewType } from './types';
import { APP_TITLE } from './constants'; 

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.MamaBearChat);

  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-gray-100 overflow-hidden">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Main content area with enhanced styling */}
        <div className="flex-1 relative">
          <UnifiedDevelopmentHub currentView={currentView} setCurrentView={setCurrentView} />
        </div>
        
        {/* Enhanced status bar */}
        <div className="absolute bottom-0 right-0 p-4 z-50">
          <div className="glass-panel px-3 py-2 text-xs text-gray-400">
            <span className="font-medium text-purple-400">{APP_TITLE}</span> 
            <span className="mx-2">•</span>
            <span>Early Alpha</span>
            <span className="mx-2">•</span>
            <a href="#" className="underline hover:text-purple-300 transition-colors">Learn more</a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
