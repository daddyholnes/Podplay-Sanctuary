
import React from 'react';
import PanelBase from './PanelBase';
import { CogIcon } from '../../constants';

const StatCard: React.FC<{ title: string; value: string; color?: string }> = ({ title, value, color = "text-purple-400" }) => (
    <div className="bg-slate-700/50 p-4 rounded-lg shadow">
        <h4 className="text-sm text-gray-400">{title}</h4>
        <p className={`text-xl font-semibold ${color}`}>{value}</p>
    </div>
);


const ControlCenterPanel: React.FC = () => {
  return (
    <PanelBase title="Mama Bear Control Center" icon={<CogIcon className="w-5 h-5" />} className="min-h-[300px]">
      <div className="text-gray-300 p-4 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-purple-300 mb-3">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard title="Mama Bear AI" value="Online" color="text-green-400" />
            <StatCard title="Gemini API" value="Connected" color="text-green-400" />
            <StatCard title="Active Project" value="Podplay Alpha" />
            <StatCard title="Memory Usage" value="256MB / 1GB" />
            <StatCard title="Background Tasks" value="2 Running" />
            <StatCard title="Sanctuary Mode" value="Calm & Focused" />
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-purple-300 mb-3">Workspace Management</h3>
          <div className="space-y-2">
            <button className="w-full text-left p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-md transition-colors">Clear Current Workspace</button>
            <button className="w-full text-left p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-md transition-colors">Manage API Keys (Admin)</button>
            <button className="w-full text-left p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-md transition-colors">View System Logs</button>
          </div>
        </div>

         <p className="italic text-center text-gray-500 mt-6">Control Center placeholder...</p>
      </div>
    </PanelBase>
  );
};

export default ControlCenterPanel;
