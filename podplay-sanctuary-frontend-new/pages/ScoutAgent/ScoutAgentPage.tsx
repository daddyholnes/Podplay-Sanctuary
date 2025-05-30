
import React, { useState } from 'react';
// import { Resizable } from 're-resizable'; // Hypothetical resizable library for panes - Removed as unused
import Icon from '../../components/Icon';
import ScoutChat from './ScoutChat';
import EnvironmentView from './EnvironmentView';
import ScoutTimeline from './ScoutTimeline';
import { useAppStore } from '../../store/useAppStore';

const ScoutAgentPage: React.FC = () => {
  const { scoutStatus, currentScoutTask } = useAppStore();
  const [activeTimelineTaskId, setActiveTimelineTaskId] = useState<string | null>(null);

  const handleNewTaskFromChat = (taskId: string) => {
    setActiveTimelineTaskId(taskId);
  };
  
  const getStatusIndicator = () => {
    switch(scoutStatus) {
      case 'idle': return <span className="text-gray-500 flex items-center"><Icon name="pauseCircle" className="w-4 h-4 mr-1"/>Idle</span>;
      case 'working': return <span className="text-blue-500 flex items-center"><Icon name="cog" className="w-4 h-4 mr-1 animate-spin"/>Working</span>;
      case 'error': return <span className="text-error flex items-center"><Icon name="xCircle" className="w-4 h-4 mr-1"/>Error</span>;
      default: return null;
    }
  };

  // For a "handful of files" and simplicity, Resizable might be too much.
  // Using fixed-percentage Tailwind classes for layout.
  // For actual resizable panes, 'react-resizable-panels' or similar would be good.
  return (
    <div className="h-full flex flex-col space-y-2">
      <header className="flex items-center justify-between pb-2 border-b border-border">
        <h1 className="font-display text-2xl text-scout flex items-center">
          <Icon name="scoutAgent" className="w-8 h-8 mr-2" /> Scout Agent
        </h1>
        <div className="text-sm font-medium">
          Status: {getStatusIndicator()}
          {currentScoutTask && (
            <span className="ml-2 text-text-secondary">
              | Task: {currentScoutTask.name.substring(0,30)}... ({currentScoutTask.progress || 0}%)
            </span>
          )}
        </div>
      </header>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-2 min-h-0"> {/* min-h-0 for flex children */}
        {/* Scout Chat */}
        <div className="lg:col-span-3 min-h-[300px] lg:min-h-0">
          <ScoutChat onNewTask={handleNewTaskFromChat} />
        </div>
        
        {/* Live Environment View */}
        <div className="lg:col-span-6 min-h-[400px] lg:min-h-0">
          <EnvironmentView />
        </div>

        {/* Live Timeline */}
        <div className="lg:col-span-3 min-h-[300px] lg:min-h-0">
          <ScoutTimeline taskId={activeTimelineTaskId} />
        </div>
      </div>
    </div>
  );
};

export default ScoutAgentPage;
