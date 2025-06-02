import React, { useState } from 'react';
import { RefreshCw, ExternalLink, Settings, Smartphone, Tablet, Monitor } from 'lucide-react';

/**
 * PreviewPanel provides a live preview of the current project
 * with device simulation and refresh controls
 */
const PreviewPanel: React.FC = () => {
  const [previewUrl, setPreviewUrl] = useState('http://localhost:3000');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState('desktop');
  
  // Refresh the preview
  const handleRefresh = () => {
    setIsLoading(true);
    // In a real implementation, this would reload the iframe
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };
  
  // Get device dimensions for preview
  const getDeviceStyle = () => {
    switch (selectedDevice) {
      case 'mobile':
        return {
          width: '375px',
          height: '667px',
          margin: '0 auto'
        };
      case 'tablet':
        return {
          width: '768px',
          height: '1024px',
          margin: '0 auto'
        };
      case 'desktop':
      default:
        return {
          width: '100%',
          height: '100%'
        };
    }
  };
  
  return (
    <div className="preview-panel h-full flex flex-col bg-gray-100 dark:bg-gray-800">
      {/* Preview Controls */}
      <div className="px-3 py-2 border-b border-purple-100 dark:border-purple-900 bg-white dark:bg-gray-900 flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <button 
            className={`p-1.5 rounded ${isLoading ? 'text-purple-500 animate-spin' : 'text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300'}`}
            onClick={handleRefresh}
            disabled={isLoading}
            title="Refresh preview"
          >
            <RefreshCw size={14} />
          </button>
          
          <div className="flex rounded bg-purple-50 dark:bg-purple-900/20 p-0.5">
            <button
              className={`p-1 rounded ${selectedDevice === 'mobile' ? 'bg-white dark:bg-gray-800 text-purple-700 dark:text-purple-300' : 'text-gray-600 dark:text-gray-400'}`}
              onClick={() => setSelectedDevice('mobile')}
              title="Mobile view"
            >
              <Smartphone size={14} />
            </button>
            <button
              className={`p-1 rounded ${selectedDevice === 'tablet' ? 'bg-white dark:bg-gray-800 text-purple-700 dark:text-purple-300' : 'text-gray-600 dark:text-gray-400'}`}
              onClick={() => setSelectedDevice('tablet')}
              title="Tablet view"
            >
              <Tablet size={14} />
            </button>
            <button
              className={`p-1 rounded ${selectedDevice === 'desktop' ? 'bg-white dark:bg-gray-800 text-purple-700 dark:text-purple-300' : 'text-gray-600 dark:text-gray-400'}`}
              onClick={() => setSelectedDevice('desktop')}
              title="Desktop view"
            >
              <Monitor size={14} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 mx-4">
          <div className="w-full max-w-md mx-auto flex items-center h-7 bg-purple-50 dark:bg-gray-800 rounded px-2">
            <input 
              type="text" 
              value={previewUrl} 
              onChange={(e) => setPreviewUrl(e.target.value)}
              className="w-full bg-transparent text-xs text-gray-700 dark:text-gray-300 border-none outline-none"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-1.5">
          <button 
            className="p-1.5 rounded text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300"
            title="Open in new tab"
          >
            <ExternalLink size={14} />
          </button>
          <button 
            className="p-1.5 rounded text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300"
            title="Preview settings"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>
      
      {/* Preview Content */}
      <div className="flex-1 overflow-hidden p-4 flex items-center justify-center">
        <div 
          className="preview-container bg-white dark:bg-black rounded shadow-sanctuary overflow-hidden"
          style={getDeviceStyle()}
        >
          {/* In a real implementation, this would be an iframe */}
          <div className="h-full w-full flex flex-col items-center justify-center">
            {isLoading ? (
              <div className="text-center">
                <div className="w-10 h-10 border-2 border-t-purple-500 border-purple-200 rounded-full animate-spin mb-3"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading preview...</p>
              </div>
            ) : (
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-purple-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Scout Preview</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-xs">
                  Run your project to see a live preview of your application here
                </p>
                <button className="mt-4 py-2 px-4 bg-purple-gradient text-white text-sm rounded-md hover:opacity-90">
                  Run Project
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Preview Status Bar */}
      <div className="h-6 border-t border-purple-100 dark:border-purple-900 bg-white dark:bg-gray-900 px-3 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
        <div>Status: {isLoading ? 'Loading...' : 'Ready'}</div>
        <div>Port: 3000</div>
      </div>
    </div>
  );
};

export default PreviewPanel;
