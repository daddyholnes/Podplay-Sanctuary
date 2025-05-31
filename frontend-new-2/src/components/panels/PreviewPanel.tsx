
import React, { useState, useEffect } from 'react';
import PanelBase from './PanelBase';
import { EyeIcon } from '../../constants';

interface PreviewPanelProps {
  url: string; // Controlled URL for the iframe
  onUrlChange?: (newUrl: string) => void; // Optional: callback if URL is changed internally
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ url: controlledUrl, onUrlChange }) => {
  const [iframeSrc, setIframeSrc] = useState(controlledUrl);
  const [inputUrl, setInputUrl] = useState(controlledUrl);

  useEffect(() => {
    // Update iframe source and input field when the controlled URL prop changes
    if (controlledUrl !== iframeSrc) {
        setIframeSrc(controlledUrl);
    }
    if (controlledUrl !== inputUrl) {
        setInputUrl(controlledUrl);
    }
  }, [controlledUrl]);

  const handleLoadUrl = () => {
    let finalUrl = inputUrl.trim();
    if (!finalUrl) {
        // If input is empty, reset to controlled URL or a default
        finalUrl = controlledUrl || 'about:blank'; 
        setInputUrl(finalUrl);
    }
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://') && finalUrl !== 'about:blank') {
      finalUrl = 'https://' + finalUrl;
    }
    setIframeSrc(finalUrl);
    if (onUrlChange && finalUrl !== controlledUrl) {
      onUrlChange(finalUrl);
    }
  };

  return (
    <PanelBase title="Live Preview" icon={<EyeIcon className="w-5 h-5" />} className="min-h-[300px] flex flex-col">
      <div className="p-2 border-b border-slate-700/50 flex items-center space-x-2 sticky top-0 bg-slate-800/80 z-10">
        <input 
          type="text" 
          value={inputUrl} 
          onChange={(e) => setInputUrl(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleLoadUrl()}
          className="flex-1 bg-slate-700/50 border border-slate-600 rounded px-2 py-1 text-xs text-gray-200 focus:ring-1 focus:ring-purple-500 outline-none"
          placeholder="Enter URL (e.g., https://example.com)"
          aria-label="Preview URL"
        />
        <button 
          onClick={handleLoadUrl}
          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded font-medium transition-colors"
          aria-label="Load URL in Preview"
        >
          Load
        </button>
      </div>
      <iframe
        src={iframeSrc}
        title="Live Preview Content"
        className="w-full flex-1 border-0 rounded-b-md bg-white" // Added bg-white for better contrast if iframe content fails
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
        onError={() => console.warn(`Error loading ${iframeSrc} in iframe.`)}
      >
        <p className="p-4 text-gray-700">Your browser does not support iframes, or the content could not be displayed.</p>
      </iframe>
    </PanelBase>
  );
};

export default PreviewPanel;
