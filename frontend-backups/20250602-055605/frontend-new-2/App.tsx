
import React, { useState } from 'react';
import Sidebar from './src/components/Sidebar';
import UnifiedDevelopmentHub from './src/components/UnifiedDevelopmentHub';
import { ViewType } from './src/types';
import { APP_TITLE } from './src/constants'; 

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.MamaBearChat);

  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-gray-100 overflow-hidden">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Pass setCurrentView to allow UnifiedDevelopmentHub to change views (e.g., after app launch) */}
        <UnifiedDevelopmentHub currentView={currentView} setCurrentView={setCurrentView} />
      </main>
      <div className="absolute bottom-2 right-4 text-xs text-gray-500 z-50">
        {APP_TITLE} is in early alpha. Learn more <a href="#" className="underline hover:text-purple-400">here</a>.
      </div>
    </div>
  );
};

export default App;
