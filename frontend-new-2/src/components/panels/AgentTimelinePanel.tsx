
import React from 'react';
import PanelBase from './PanelBase';
import { ListBulletIcon } from '../../constants';
import { AgentStep } from '../../types';

interface AgentTimelinePanelProps {
  steps: AgentStep[];
}

const AgentTimelinePanel: React.FC<AgentTimelinePanelProps> = ({ steps }) => {
  const getStatusColor = (status: AgentStep['status']) => {
    if (status === 'completed') return 'text-green-400';
    if (status === 'running') return 'text-yellow-400 animate-pulse';
    if (status === 'error') return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <PanelBase title="Agent Activity Timeline" icon={<ListBulletIcon className="w-5 h-5" />} className="min-h-[300px]">
      {steps.length === 0 ? (
        <p className="text-gray-400 italic p-4 text-center">No agent activity yet.</p>
      ) : (
        <div className="space-y-3 text-sm">
          {steps.slice().reverse().map((step) => ( // Show newest first
            <div key={step.id} className="p-2 bg-slate-700/30 rounded-md border border-slate-600/50">
              <div className="flex justify-between items-center mb-1">
                <span className={`font-semibold ${getStatusColor(step.status)}`}>{step.action}</span>
                <span className="text-xs text-gray-500">{step.timestamp.toLocaleTimeString()}</span>
              </div>
              {step.tool && <p className="text-xs text-purple-400">Tool: {step.tool}</p>}
              {step.details && <p className="text-xs text-gray-400 whitespace-pre-wrap break-words">{step.details}</p>}
            </div>
          ))}
        </div>
      )}
    </PanelBase>
  );
};

export default AgentTimelinePanel;
