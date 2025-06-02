
import React from 'react';

interface PanelBaseProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerControls?: React.ReactNode;
}

const PanelBase: React.FC<PanelBaseProps> = ({ title, icon, children, className, headerControls }) => {
  return (
    <div className={`bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-lg shadow-2xl flex flex-col overflow-hidden ${className}`}>
      <div className="flex items-center justify-between p-3 border-b border-slate-700/50 bg-slate-800/80">
        <div className="flex items-center space-x-2">
          {icon && <span className="text-purple-400">{icon}</span>}
          <h3 className="text-sm font-semibold text-gray-200">{title}</h3>
        </div>
        {headerControls && <div>{headerControls}</div>}
      </div>
      <div className="flex-1 p-3 overflow-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800/50">
        {children}
      </div>
    </div>
  );
};

export default PanelBase;
