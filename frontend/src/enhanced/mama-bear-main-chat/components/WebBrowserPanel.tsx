import React, { useState } from 'react';

// Define props interface
interface WebBrowserPanelProps {
  url: string;
  onClose: () => void;
  onUrlChange: (url: string) => void;
}

/**
 * WebBrowserPanel component - provides in-app web browsing capability
 */
const WebBrowserPanel: React.FC<WebBrowserPanelProps> = ({
  url,
  onClose,
  onUrlChange
}) => {
  const [inputUrl, setInputUrl] = useState<string>(url);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Handle URL submission
  const handleSubmitUrl = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add protocol if missing
    let processedUrl = inputUrl;
    if (!/^https?:\/\//i.test(processedUrl)) {
      processedUrl = `https://${processedUrl}`;
    }
    
    setIsLoading(true);
    onUrlChange(processedUrl);
  };
  
  // Handle iframe load complete
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="web-browser-panel">
      <div className="browser-header">
        <form className="browser-url-bar" onSubmit={handleSubmitUrl}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Enter URL..."
            aria-label="URL input"
          />
          <button type="submit" style={{ display: 'none' }}></button>
        </form>
        
        <div className="browser-actions">
          <button
            className="browser-button"
            onClick={() => window.open(url, '_blank')}
            aria-label="Open in new tab"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </button>
          <button
            className="browser-button"
            onClick={onClose}
            aria-label="Close browser"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="browser-content">
        {isLoading && (
          <div className="browser-loading">
            <div className="loading-spinner"></div>
          </div>
        )}
        
        {url && (
          <iframe
            src={url}
            className="browser-iframe"
            title="Web Browser"
            onLoad={handleIframeLoad}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          ></iframe>
        )}
      </div>
    </div>
  );
};

export default WebBrowserPanel;