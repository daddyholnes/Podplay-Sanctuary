import { useState, useContext } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';
import WorkspaceLayout from './components/WorkspaceLayout';
import WorkspacePanel from './components/WorkspacePanel';
import FileExplorer from './components/FileExplorer';
import CodeEditor from './components/CodeEditor';
import TerminalPanel from './components/TerminalPanel';
import ResourceMonitor from './components/ResourceMonitor';
import PreviewPanel from './components/PreviewPanel';
import WorkspaceHeader from './components/WorkspaceHeader';

import { Folder, Code, Terminal, Play, BarChart2, GitBranch, Plus } from 'lucide-react';
import { Project, WorkspaceTab } from '@/types/workspace';

const ScoutDevWorkspaces = () => {
  const { theme } = useContext(ThemeContext);
  
  // Sample workspace state
  const [activeWorkspace, setActiveWorkspace] = useState('workspace-1');
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'project-1',
      name: 'Podplay Studio',
      description: 'Main Podplay Studio application',
      workspaces: [
        {
          id: 'workspace-1',
          name: 'Frontend Development',
          tabs: [
            { id: 'tab-1', name: 'App.tsx', type: 'file', content: '// React App Component' },
            { id: 'tab-2', name: 'ThemeContext.tsx', type: 'file', content: '// Theme Context' },
          ],
          activeTab: 'tab-1',
          gitBranch: 'feature/new-ui',
          resources: {
            cpu: 45,
            memory: 60,
            disk: 25
          }
        },
        {
          id: 'workspace-2',
          name: 'Backend API',
          tabs: [
            { id: 'tab-3', name: 'app.py', type: 'file', content: '# Flask API' },
            { id: 'tab-4', name: 'models.py', type: 'file', content: '# Database Models' },
          ],
          activeTab: 'tab-3',
          gitBranch: 'main',
          resources: {
            cpu: 30,
            memory: 50,
            disk: 15
          }
        }
      ]
    },
    {
      id: 'project-2',
      name: 'Scout Mini-Apps',
      description: 'Collection of Scout Mini-Apps',
      workspaces: [
        {
          id: 'workspace-3',
          name: 'Image Processor App',
          tabs: [
            { id: 'tab-5', name: 'index.html', type: 'file', content: '<!-- HTML -->' },
            { id: 'tab-6', name: 'script.js', type: 'file', content: '// JavaScript' },
          ],
          activeTab: 'tab-5',
          gitBranch: 'develop',
          resources: {
            cpu: 20,
            memory: 35,
            disk: 10
          }
        }
      ]
    }
  ]);
  
  const [activeProjectId, setActiveProjectId] = useState('project-1');
  const [activePanelLayout, setActivePanelLayout] = useState('standard'); // standard, coding, preview
  const [selectedFile, setSelectedFile] = useState(null);
  const [terminalOutput, setTerminalOutput] = useState('> Scout Development Environment\n> Ready for commands...\n\n');
  const [activeWorkspaceTabs, setActiveWorkspaceTabs] = useState<WorkspaceTab[]>([]);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  
  // Find active project and workspace
  const activeProject = projects.find(project => project.id === activeProjectId);
  const currentWorkspace = activeProject?.workspaces.find(ws => ws.id === activeWorkspace);
  
  // Handler to select workspace
  const handleSelectWorkspace = (projectId: string, workspaceId: string) => {
    setActiveProjectId(projectId);
    setActiveWorkspace(workspaceId);
    
    // Update active tabs
    const project = projects.find(p => p.id === projectId);
    const workspace = project?.workspaces.find(ws => ws.id === workspaceId);
    setActiveWorkspaceTabs(workspace?.tabs || []);
  };
  
  // Handler to execute command in terminal
  const handleExecuteCommand = (command: string) => {
    // In a real app, this would connect to a backend service
    setTerminalOutput(prev => `${prev}> ${command}\n`);
    
    // Mock responses for demo
    if (command.includes('npm start')) {
      setTerminalOutput(prev => 
        `${prev}Starting development server...\nProject is running at http://localhost:3000\n\n`
      );
    } else if (command.includes('git')) {
      setTerminalOutput(prev => 
        `${prev}Git operation completed successfully\n\n`
      );
    } else {
      setTerminalOutput(prev => 
        `${prev}Command executed\n\n`
      );
    }
  };
  
  // Handle file selection
  const handleFileSelect = (fileName: string, fileContent: string) => {
    setSelectedFile({ name: fileName, content: fileContent });
    
    // In a real app, we would load the file content from backend
  };
  
  // Handle panel layout change
  const handlePanelLayoutChange = (layout: string) => {
    setActivePanelLayout(layout);
  };
  
  return (
    <div className="h-full bg-sanctuary-light dark:bg-sanctuary-dark overflow-hidden">
      {/* Workspace Header with project/workspace selector */}
      <WorkspaceHeader 
        projects={projects}
        activeProjectId={activeProjectId}
        activeWorkspace={activeWorkspace}
        onSelectWorkspace={handleSelectWorkspace}
        onLayoutChange={handlePanelLayoutChange}
      />
      
      {/* Main Workspace Area */}
      <WorkspaceLayout layout={activePanelLayout}>
        {/* File Explorer Panel */}
        <WorkspacePanel 
          title="Explorer"
          icon={<Folder size={16} />}
          initialSize={250}
          minSize={200}
          maxSize={400}
          resizable="right"
          panelId="explorer"
          layout={activePanelLayout}
        >
          <FileExplorer 
            projects={projects}
            activeProjectId={activeProjectId}
            onFileSelect={handleFileSelect}
          />
        </WorkspacePanel>
        
        {/* Code Editor Panel */}
        <WorkspacePanel
          title={selectedFile ? selectedFile.name : "Editor"}
          icon={<Code size={16} />}
          initialSize={0}
          minSize={300}
          panelId="editor"
          layout={activePanelLayout}
          tabs={activeWorkspaceTabs}
        >
          <CodeEditor 
            file={selectedFile}
            theme={theme}
          />
        </WorkspacePanel>
        
        {/* Terminal Panel */}
        <WorkspacePanel
          title="Terminal"
          icon={<Terminal size={16} />}
          initialSize={250}
          minSize={150}
          maxSize={500}
          resizable="top"
          panelId="terminal"
          layout={activePanelLayout}
        >
          <TerminalPanel 
            output={terminalOutput}
            onExecuteCommand={handleExecuteCommand}
          />
        </WorkspacePanel>
        
        {/* Preview Panel - conditionally rendered based on layout */}
        {activePanelLayout === 'preview' && (
          <WorkspacePanel
            title="Preview"
            icon={<Play size={16} />}
            initialSize={0}
            minSize={300}
            panelId="preview"
            layout={activePanelLayout}
          >
            <PreviewPanel />
          </WorkspacePanel>
        )}
        
        {/* Resource Monitor */}
        <WorkspacePanel
          title="Resources"
          icon={<BarChart2 size={16} />}
          initialSize={200}
          minSize={150}
          maxSize={300}
          resizable="left"
          panelId="resources"
          layout={activePanelLayout}
        >
          <ResourceMonitor 
            resources={currentWorkspace?.resources || { cpu: 0, memory: 0, disk: 0 }}
            workspaceName={currentWorkspace?.name || ""}
            gitBranch={currentWorkspace?.gitBranch || ""}
          />
        </WorkspacePanel>
      </WorkspaceLayout>
      
      {/* Floating action button for creating new workspace */}
      <button
        className="fixed right-6 bottom-6 w-12 h-12 rounded-full bg-purple-gradient flex items-center justify-center shadow-sanctuary z-10"
        onClick={() => setIsCreatingWorkspace(true)}
      >
        <Plus size={20} className="text-white" />
      </button>
    </div>
  );
};

export default ScoutDevWorkspaces;
