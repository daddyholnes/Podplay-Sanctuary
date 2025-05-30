
import React, { useState, useMemo } from 'react';
import { MiniApp } from '../types';
import { DEFAULT_MINI_APPS } from '../utils/constants';
import Card, { CardHeader, CardContent } from '../components/Card';
import Input from '../components/Input';
import Icon from '../components/Icon';
import Button from '../components/Button';
import Modal from '../components/Modal';

const MiniAppsLauncher: React.FC = () => {
  const [apps, setApps] = useState<MiniApp[]>(DEFAULT_MINI_APPS);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeApp, setActiveApp] = useState<MiniApp | null>(null);
  const [iframeKey, setIframeKey] = useState(0); // To force iframe reload
  const [isFullScreen, setIsFullScreen] = useState(false);

  // TODO: Add functionality to add/manage custom apps, favorites, recents

  const filteredApps = useMemo(() => {
    return apps.filter(app => 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [apps, searchTerm]);

  const handleAppClick = (app: MiniApp) => {
    setActiveApp(app);
    setIframeKey(prev => prev + 1); // Force reload if same app is clicked or for fresh state
    setIsFullScreen(false); // Reset fullscreen on new app
  };
  
  const closeActiveApp = () => {
    setActiveApp(null);
    setIsFullScreen(false);
  };

  const toggleFullScreen = () => {
    if (!activeApp) return;
    setIsFullScreen(!isFullScreen);
    // You might need to use browser Fullscreen API for true fullscreen of the iframe
    // For simplicity, this will just expand the modal / iframe container
  };

  const AppCard: React.FC<{ app: MiniApp }> = ({ app }) => (
    <Card 
      className="text-center p-4 hover:shadow-xl transition-all duration-200 ease-in-out transform hover:-translate-y-1"
      onClick={() => handleAppClick(app)}
    >
      <div className="text-4xl mb-2">{app.icon}</div>
      <h3 className="font-display text-md text-text-primary">{app.name}</h3>
      <p className="text-xs text-text-muted capitalize">{app.category}</p>
    </Card>
  );

  return (
    <div className="h-full flex flex-col space-y-4">
      <header className="pb-2 border-b border-border">
        <h1 className="font-display text-2xl text-blue-500 flex items-center">
          <Icon name="miniApps" className="w-8 h-8 mr-2" /> Mini Apps Launcher
        </h1>
        <Input
          type="search"
          placeholder="Search apps by name, category, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon="search"
          className="mt-2"
        />
      </header>

      {/* App Grid */}
      {!activeApp && (
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 py-4 flex-grow overflow-y-auto">
          {filteredApps.length > 0 ? (
            filteredApps.map(app => <AppCard key={app.id} app={app} />)
          ) : (
            <p className="col-span-full text-center text-text-muted py-10">No apps found matching your search.</p>
          )}
        </div>
      )}

      {/* Active App Modal/View */}
      {activeApp && (
        <Modal 
            isOpen={!!activeApp} 
            onClose={closeActiveApp} 
            title={`${activeApp.icon} ${activeApp.name}`} 
            size={isFullScreen ? '5xl' : '3xl'} // Custom full screen size
            footer={
              <div className="w-full flex justify-between items-center">
                <Button variant="secondary" onClick={closeActiveApp}>Close App</Button>
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" onClick={() => setIframeKey(prev => prev + 1)} leftIcon="arrowRight">Refresh</Button>
                    <Button variant="ghost" onClick={toggleFullScreen} leftIcon={isFullScreen ? "arrowRight" : "arrowLeft"}>
                        {isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    </Button>
                </div>
              </div>
            }
        >
            <div className={`relative ${isFullScreen ? 'h-[80vh]' : 'h-[60vh]'}`}>
                <iframe
                    key={iframeKey}
                    src={activeApp.url}
                    title={activeApp.name}
                    className="w-full h-full border-0 rounded-md bg-white" // Added bg-white for sites with transparent backgrounds
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-top-navigation" // Security sandbox
                    onError={() => console.error(`Error loading iframe for ${activeApp.name}`)}
                />
                {/* Consider adding a loading indicator for the iframe */}
            </div>
        </Modal>
      )}
    </div>
  );
};

export default MiniAppsLauncher;
