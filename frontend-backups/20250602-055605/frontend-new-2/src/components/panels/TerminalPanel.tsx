
import React from 'react';
import PanelBase from './PanelBase';
import { CommandLineIcon } from '../../constants';

const TerminalPanel: React.FC = () => {
  return (
    <PanelBase title="Terminal" icon={<CommandLineIcon className="w-5 h-5" />} className="min-h-[300px]">
      <div className="w-full h-full bg-black/80 rounded-md p-3 font-mono text-sm text-green-400 overflow-y-auto">
        <p>&gt; Podplay Build Sanctuary v0.1</p>
        <p>&gt; xterm.js placeholder...</p>
        <p>&gt; Running command: <span className="text-yellow-400">npm start</span></p>
        <p className="text-gray-400">   Dev server running on http://localhost:3000</p>
        <p>&gt; <span className="animate-pulse">_</span></p>
      </div>
    </PanelBase>
  );
};

export default TerminalPanel;
