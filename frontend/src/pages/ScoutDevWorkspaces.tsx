import React from 'react';
import { Code, Terminal, Settings } from 'lucide-react';

export const ScoutDevWorkspaces: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🏠 Dev Workspaces
          </h1>
          <p className="text-xl text-purple-200">
            Draggable development environments with GitHub integration
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Code className="w-8 h-8 text-purple-400" />
              <h3 className="text-xl font-semibold">NixOS Environment</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Reproducible development environment with Nix package manager
            </p>
            <button className="btn btn-primary w-full">
              Launch NixOS
            </button>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Terminal className="w-8 h-8 text-purple-400" />
              <h3 className="text-xl font-semibold">Docker Container</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Containerized development with custom Docker images
            </p>
            <button className="btn btn-primary w-full">
              Launch Docker
            </button>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-8 h-8 text-purple-400" />
              <h3 className="text-xl font-semibold">CodeSpace</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Cloud-based development environment with VS Code
            </p>
            <button className="btn btn-primary w-full">
              Launch CodeSpace
            </button>
          </div>
        </div>

        <div className="mt-12 card">
          <h3 className="text-2xl font-semibold mb-6">🐻 Mama Bear Assistant</h3>
          <div className="bg-purple-900/30 rounded-lg p-6">
            <p className="text-purple-200 mb-4">
              "I can help you set up and manage your development environments. 
              What would you like to build today?"
            </p>
            <div className="flex gap-3">
              <input 
                type="text" 
                placeholder="Ask Mama Bear about your workspace..."
                className="flex-1 px-4 py-2 rounded-lg bg-purple-800/50 text-white border border-purple-600"
              />
              <button className="btn btn-primary">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoutDevWorkspaces;