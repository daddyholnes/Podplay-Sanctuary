import React, { useEffect } from 'react';
import { useWindow, WindowType } from '../window-management/WindowContext';
import TaskBoard from './components/TaskBoard';
import ResourcePanel from './components/ResourcePanel';
import Window from '../window-management/Window';
import './ScoutWorkflowWindows.css';

/**
 * ScoutWorkflowWindows
 * 
 * Integration component that connects the Scout Workflow Engine with the Window Management system.
 * This component demonstrates how TaskBoard and ResourcePanel components can be displayed within
 * draggable, resizable windows in the Podplay Sanctuary environment.
 */
const ScoutWorkflowWindows: React.FC = () => {
  const { 
    windows, 
    createWindow,
    focusWindow
  } = useWindow();

  // Initialize default workflow windows on component mount
  useEffect(() => {
    // Only create initial windows if none exist yet
    if (windows.length === 0) {
      // Create TaskBoard window
      const taskBoardWindowId = createWindow({
        title: 'Scout Workflow Tasks',
        type: WindowType.WORKFLOW,
        position: { x: 50, y: 70 },
        size: { width: 800, height: 600 },
        content: 'TaskBoard'
      });

      // Create ResourcePanel window
      const resourcePanelWindowId = createWindow({
        title: 'Task Resources',
        type: WindowType.RESOURCE,
        position: { x: 200, y: 120 },
        size: { width: 500, height: 500 },
        content: 'ResourcePanel'
      });

      // Focus the TaskBoard window
      setTimeout(() => {
        focusWindow(taskBoardWindowId);
      }, 100);
    }
  }, []);

  // Sample task data (normally would come from a context or service)
  const sampleTaskData = {
    stages: [
      {
        id: 'backlog',
        title: 'Backlog',
        tasks: [
          {
            id: 'task1',
            title: 'Research API options',
            description: 'Evaluate different API options for model integration',
            status: 'not_started',
            resources: [
              { id: 'res1', type: 'link', title: 'API Documentation', url: 'https://api.example.com/docs' },
              { id: 'res2', type: 'note', title: 'API Requirements', content: 'Must support streaming and have low latency' }
            ]
          },
          {
            id: 'task2',
            title: 'Design database schema',
            description: 'Create database schema for user preferences',
            status: 'not_started',
            resources: []
          }
        ]
      },
      {
        id: 'in_progress',
        title: 'In Progress',
        tasks: [
          {
            id: 'task3',
            title: 'Implement window management',
            description: 'Create draggable, resizable windows for the workspace',
            status: 'in_progress',
            resources: [
              { id: 'res3', type: 'code', title: 'Window Component', language: 'typescript', content: 'const Window = () => { /* ... */ }' },
              { id: 'res4', type: 'file', title: 'Design Mockup', filename: 'window-design.png', path: '/designs/window-design.png' }
            ]
          }
        ]
      },
      {
        id: 'done',
        title: 'Completed',
        tasks: [
          {
            id: 'task4',
            title: 'Set up project structure',
            description: 'Initialize repository and configure development environment',
            status: 'completed',
            resources: []
          }
        ]
      }
    ]
  };

  // Sample resource data (normally would come from a context or props)
  const sampleResourceData = {
    taskId: 'task3',
    resources: [
      { id: 'res3', type: 'code', title: 'Window Component', language: 'typescript', content: 'const Window = () => { /* ... */ }' },
      { id: 'res4', type: 'file', title: 'Design Mockup', filename: 'window-design.png', path: '/designs/window-design.png' }
    ]
  };

  // Handlers (would normally interact with context or services)
  const handleTaskStatusChange = (taskId: string, newStatus: string) => {
    console.log(`Task ${taskId} status changed to ${newStatus}`);
  };

  const handleTaskMove = (taskId: string, sourceStageId: string, targetStageId: string) => {
    console.log(`Task ${taskId} moved from ${sourceStageId} to ${targetStageId}`);
  };

  const handleResourceEdit = (resourceId: string, newData: any) => {
    console.log(`Resource ${resourceId} edited:`, newData);
  };

  return (
    <div className="scout-workflow-windows">
      {/* Render TaskBoard inside a Window */}
      {windows.map(window => {
        if (window.content === 'TaskBoard') {
          return (
            <Window key={window.id} window={window}>
              <TaskBoard 
                stages={sampleTaskData.stages}
                onTaskStatusChange={handleTaskStatusChange}
                onTaskMove={handleTaskMove}
                onCreateWorkspace={() => console.log('Create workspace')}
              />
            </Window>
          );
        }
        
        if (window.content === 'ResourcePanel') {
          return (
            <Window key={window.id} window={window}>
              <ResourcePanel 
                taskId={sampleResourceData.taskId}
                resources={sampleResourceData.resources}
                onResourceEdit={handleResourceEdit}
                onResourceAdd={(resource) => console.log('Resource added:', resource)}
                onResourceDelete={(resourceId) => console.log('Resource deleted:', resourceId)}
              />
            </Window>
          );
        }
        
        return null;
      })}
    </div>
  );
};

export default ScoutWorkflowWindows;