import React, { useState, useEffect } from 'react';
import ScoutMultiModalChat from './ScoutMultiModalChat';
import { getModels } from './services/modelService';
import { Model } from './services/modelService';

/**
 * Test component for the Scout Multimodal Chat
 * Loads available models from the API and renders the chat component
 */
const ScoutChatTest: React.FC = () => {
  const [models, setModels] = useState<Record<string, Model>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoading(true);
        const availableModels = await getModels();
        setModels(availableModels);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load models:', err);
        setError('Failed to load AI models. Please check your connection and try again.');
        setLoading(false);
      }
    };

    loadModels();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-r from-purple-900 to-indigo-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full border-4 border-purple-200 border-t-purple-500 h-12 w-12 mb-4"></div>
          <p className="text-white text-lg">Loading AI models...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-r from-purple-900 to-indigo-900">
        <div className="text-center p-6 bg-purple-800/50 backdrop-blur-sm rounded-xl shadow-lg max-w-md">
          <div className="text-red-400 text-5xl mb-4">⚠️</div>
          <h2 className="text-white text-xl font-semibold mb-2">Connection Error</h2>
          <p className="text-purple-200 mb-4">{error}</p>
          <button 
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-md text-white hover:from-purple-700 hover:to-pink-700 transition-all"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-r from-purple-900 to-indigo-900">
      <header className="p-4 border-b border-purple-700/30">
        <h1 className="text-2xl font-semibold text-white">Scout Multimodal Chat Test</h1>
        <p className="text-purple-200 text-sm">Connected to AI models API on port 5001</p>
      </header>
      
      <div className="flex-1 overflow-hidden">
        <ScoutMultiModalChat />
      </div>
    </div>
  );
};

export default ScoutChatTest;
