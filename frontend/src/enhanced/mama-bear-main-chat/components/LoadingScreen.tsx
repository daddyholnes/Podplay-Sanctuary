import React from 'react';

/**
 * LoadingScreen component - displays while chat data is loading
 */
const LoadingScreen: React.FC = () => {
  return (
    <div className="loading-screen">
      <div className="loading-icon"></div>
      <div className="loading-text">Loading your sanctuary...</div>
    </div>
  );
};

export default LoadingScreen;