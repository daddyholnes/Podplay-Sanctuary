
import React from 'react';
import { MiniApp } from '../types';

interface AppCardProps {
  app: MiniApp;
  onLaunch: (app: MiniApp) => void;
}

const AppCard: React.FC<AppCardProps> = ({ app, onLaunch }) => {
  return (
    <button
      onClick={() => onLaunch(app)}
      className="bg-slate-800/70 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 hover:bg-slate-700/90 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 text-left flex flex-col items-start space-y-3 shadow-lg hover:shadow-xl h-full"
      aria-label={`Launch ${app.name}`}
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 flex items-center justify-center text-purple-400">
          {app.icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-100">{app.name}</h3>
      </div>
      <p className="text-sm text-gray-400 flex-grow line-clamp-3">{app.description}</p>
      <div className="mt-auto pt-2">
        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full capitalize">
          {app.category}
        </span>
        {app.featured && (
          <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">
            Featured
          </span>
        )}
      </div>
    </button>
  );
};

export default AppCard;
