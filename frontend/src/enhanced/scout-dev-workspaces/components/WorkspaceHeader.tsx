import React, { useState } from 'react';
import { ChevronDown, Layout, Maximize, Code, Play } from 'lucide-react';
import { Project } from '@/types/workspace';

interface WorkspaceHeaderProps {
  projects: Project[];
  activeProjectId: string;
  activeWorkspace: string;
  onSelectWorkspace: (projectId: string, workspaceId: string) => void;
  onLayoutChange: (layout: string) => void;
}

/**
 * WorkspaceHeader provides controls for project/workspace selection
 * and layout switching in the Scout Dev Workspaces module
 */
const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  projects,
  activeProjectId,
  activeWorkspace,
  onSelectWorkspace,
  onLayoutChange
}) => {
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  
  // Find active project and workspace
  const activeProject = projects.find(p => p.id === activeProjectId);
  const currentWorkspace = activeProject?.workspaces.find(w => w.id === activeWorkspace);
  
  return (
    <div className="workspace-header h-12 bg-white dark:bg-gray-900 border-b border-purple-100 dark:border-purple-900 flex items-center px-4 justify-between">
      {/* Project & Workspace Selection */}
      <div className="flex items-center">
        {/* Project Selector */}
        <div className="relative">
          <button 
            className="flex items-center space-x-1 py-1 px-2 rounded hover:bg-purple-50 dark:hover:bg-gray-800"
            onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
          >
            <span className="text-sm text-gray-800 dark:text-gray-200">
              {activeProject?.name || 'Select Project'}
            </span>
            <ChevronDown size={14} className="text-gray-500" />
          </button>
          
          {/* Project Dropdown */}
          {isProjectDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-900 border border-purple-100 dark:border-purple-900 rounded-md shadow-sanctuary z-10">
              <div className="p-1">
                {projects.map(project => (
                  <div
                    key={project.id}
                    className={`
                      px-3 py-1.5 text-sm rounded cursor-pointer
                      ${project.id === activeProjectId 
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200' 
                        : 'text-gray-800 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-gray-800'
                      }
                    `}
                    onClick={() => {
                      // Select first workspace of the project
                      if (project.workspaces.length > 0) {
                        onSelectWorkspace(project.id, project.workspaces[0].id);
                      }
                      setIsProjectDropdownOpen(false);
                    }}
                  >
                    {project.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Separator */}
        <div className="mx-2 text-gray-400">/</div>
        
        {/* Workspace Selector */}
        <div className="relative">
          <button 
            className="flex items-center space-x-1 py-1 px-2 rounded hover:bg-purple-50 dark:hover:bg-gray-800"
            onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
          >
            <span className="text-sm text-gray-800 dark:text-gray-200">
              {currentWorkspace?.name || 'Select Workspace'}
            </span>
            <ChevronDown size={14} className="text-gray-500" />
          </button>
          
          {/* Workspace Dropdown */}
          {isWorkspaceDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-900 border border-purple-100 dark:border-purple-900 rounded-md shadow-sanctuary z-10">
              <div className="p-1">
                {activeProject?.workspaces.map(workspace => (
                  <div
                    key={workspace.id}
                    className={`
                      px-3 py-1.5 text-sm rounded cursor-pointer
                      ${workspace.id === activeWorkspace 
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200' 
                        : 'text-gray-800 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-gray-800'
                      }
                    `}
                    onClick={() => {
                      onSelectWorkspace(activeProjectId, workspace.id);
                      setIsWorkspaceDropdownOpen(false);
                    }}
                  >
                    {workspace.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Environment Badge */}
        <div className="ml-3">
          <span className="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs rounded-full">
            Dev
          </span>
        </div>
      </div>
      
      {/* Layout Controls */}
      <div className="flex items-center space-x-2">
        <div className="flex rounded bg-purple-50 dark:bg-purple-900/20 p-0.5">
          {/* Standard Layout */}
          <button 
            className="p-1.5 rounded text-purple-700 dark:text-purple-300 hover:bg-white dark:hover:bg-gray-800"
            onClick={() => onLayoutChange('standard')}
            title="Standard Layout"
          >
            <Layout size={16} />
          </button>
          
          {/* Coding Layout */}
          <button 
            className="p-1.5 rounded text-purple-700 dark:text-purple-300 hover:bg-white dark:hover:bg-gray-800"
            onClick={() => onLayoutChange('coding')}
            title="Coding Layout"
          >
            <Code size={16} />
          </button>
          
          {/* Preview Layout */}
          <button 
            className="p-1.5 rounded text-purple-700 dark:text-purple-300 hover:bg-white dark:hover:bg-gray-800"
            onClick={() => onLayoutChange('preview')}
            title="Preview Layout"
          >
            <Play size={16} />
          </button>
          
          {/* Fullscreen Layout */}
          <button 
            className="p-1.5 rounded text-purple-700 dark:text-purple-300 hover:bg-white dark:hover:bg-gray-800"
            onClick={() => onLayoutChange('fullscreen')}
            title="Fullscreen"
          >
            <Maximize size={16} />
          </button>
        </div>
        
        {/* System Actions */}
        <button className="py-1.5 px-3 text-xs bg-purple-gradient text-white rounded hover:opacity-90">
          Run Project
        </button>
      </div>
    </div>
  );
};

export default WorkspaceHeader;
