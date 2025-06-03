import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coffee,
  Heart,
  Monitor,
  Plus,
  X,
  Minimize2,
  Maximize2,
  Terminal,
  Folder,
  GitBranch,
  Play,
  Pause,
  Settings,
  Upload,
  Paperclip,
  Mic,
  Video,
  Github,
  CheckCircle,
  AlertCircle,
  Loader2,
  Smile,
  Palette,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useThemeStore, useWorkspaceStore } from '@/stores';
import { Workspace } from '@/types';
import DraggableChat from '@/components/DraggableChat';

interface FloatingWindow {
  id: string;
  title: string;
  type: 'workspace';
  content: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  zIndex: number;
}

const DevWorkspaces: React.FC = () => {
  const { theme } = useThemeStore();
  const { workspaces, setWorkspaces, addWorkspace } = useWorkspaceStore();
  
  const [windows, setWindows] = useState<FloatingWindow[]>([]);
  const [nextZIndex, setNextZIndex] = useState(1000);
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  
  // Mama Bear Chat State
  const [isChatVisible, setIsChatVisible] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const workspaceTemplates = [
    {
      id: 'nixos',
      name: 'NixOS Environment',
      description: 'Reproducible development environment',
      icon: Monitor,
      color: 'blue'
    },
    {
      id: 'docker',
      name: 'Docker Container',
      description: 'Containerized development setup',
      icon: Terminal,
      color: 'green'
    },
    {
      id: 'codespace',
      name: 'GitHub Codespace',
      description: 'Cloud-based development environment',
      icon: Github,
      color: 'purple'
    },
    {
      id: 'oracle',
      name: 'Oracle Cloud',
      description: 'Enterprise cloud infrastructure',
      icon: Settings,
      color: 'orange'
    }
  ];

  useEffect(() => {
    const sampleWorkspaces: Workspace[] = [
      {
        id: '1',
        name: 'PodPlay Sanctuary',
        template_type: 'nixos',
        status: 'running',
        configuration: { memory: '4GB', vcpus: 2 },
        access_url: 'https://sanctuary-workspace.podplay.dev',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'AI Training Lab',
        template_type: 'docker',
        status: 'stopped',
        configuration: { memory: '8GB', vcpus: 4, gpu: true },
        created_at: new Date().toISOString()
      }
    ];
    setWorkspaces(sampleWorkspaces);
  }, [setWorkspaces]);

  const dailyBriefing = {
    mood: "🌱 Sanctuary Vibes: Peaceful and focused",
    tasks: [
      "Code review for MCP marketplace integration",
      "Test NixOS workspace provisioning",
      "Deploy Mama Bear chat enhancements"
    ],
    insights: [
      "Your development velocity has increased 40% this week",
      "Most productive hours: 9-11 AM",
      "Recommendation: Take a 15-minute break every hour"
    ]
  };

  const createWorkspace = async (template: any) => {
    const newWorkspace: Workspace = {
      id: Date.now().toString(),
      name: `${template.name} ${Date.now()}`,
      template_type: template.id as any,
      status: 'creating',
      configuration: { memory: '4GB', vcpus: 2 },
      created_at: new Date().toISOString()
    };

    addWorkspace(newWorkspace);

    // Simulate workspace creation
    setTimeout(() => {
      const updatedWorkspaces = workspaces.map(ws => 
        ws.id === newWorkspace.id 
          ? { ...ws, status: 'running' as const, access_url: `https://${template.id}-${newWorkspace.id}.podplay.dev` }
          : ws
      );
      setWorkspaces(updatedWorkspaces);
    }, 3000);
  };

  const openWorkspace = (workspace: Workspace) => {
    const newWindow: FloatingWindow = {
      id: `workspace-${workspace.id}`,
      title: workspace.name,
      type: 'workspace',
      content: workspace,
      position: { x: 50 + windows.length * 30, y: 50 + windows.length * 30 },
      size: { width: 600, height: 400 },
      isMinimized: false,
      zIndex: nextZIndex
    };

    setWindows(prev => [...prev, newWindow]);
    setNextZIndex(prev => prev + 1);
  };

  const updateWindow = (windowId: string, updates: Partial<FloatingWindow>) => {
    setWindows(prev => prev.map(win => 
      win.id === windowId ? { ...win, ...updates } : win
    ));
  };

  const closeWindow = (windowId: string) => {
    setWindows(prev => prev.filter(win => win.id !== windowId));
  };

  const bringToFront = (windowId: string) => {
    setWindows(prev => prev.map(win => 
      win.id === windowId ? { ...win, zIndex: nextZIndex } : win
    ));
    setNextZIndex(prev => prev + 1);
  };

  const FloatingWorkspaceWindow: React.FC<{ window: FloatingWindow }> = ({ window }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [position, setPosition] = useState(window.position);
    const [size, setSize] = useState(window.size);
    const dragStart = useRef<{ x: number; y: number } | null>(null);
    const resizeStart = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      bringToFront(window.id);
      setIsDragging(true);
      dragStart.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && dragStart.current) {
        const newPosition = {
          x: Math.max(0, e.clientX - dragStart.current.x),
          y: Math.max(0, e.clientY - dragStart.current.y)
        };
        setPosition(newPosition);
        updateWindow(window.id, { position: newPosition });
      }

      if (isResizing && resizeStart.current) {
        const deltaX = e.clientX - resizeStart.current.x;
        const deltaY = e.clientY - resizeStart.current.y;
        
        const newSize = {
          width: Math.max(300, resizeStart.current.width + deltaX),
          height: Math.max(200, resizeStart.current.height + deltaY)
        };
        setSize(newSize);
        updateWindow(window.id, { size: newSize });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      dragStart.current = null;
      resizeStart.current = null;
    };

    const handleResizeMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      resizeStart.current = {
        x: e.clientX,
        y: e.clientY,
        width: size.width,
        height: size.height
      };
    };

    useEffect(() => {
      if (isDragging || isResizing) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }, [isDragging, isResizing]);

    if (window.isMinimized) {
      return (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="fixed bottom-4 left-4"
          style={{ zIndex: window.zIndex }}
        >
          <Button
            onClick={() => updateWindow(window.id, { isMinimized: false })}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg"
          >
            <Monitor className="w-4 h-4 mr-2" />
            {window.title}
          </Button>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className={`fixed rounded-lg shadow-xl overflow-hidden ${
          theme === 'light'
            ? 'bg-white border border-gray-200'
            : 'bg-slate-800 border border-slate-600'
        }`}
        style={{
          left: position.x,
          top: position.y,
          width: size.width,
          height: size.height,
          zIndex: window.zIndex
        }}
      >
        {/* Window Header */}
        <div
          className="p-2 flex items-center justify-between cursor-move bg-gradient-to-r from-blue-600 to-green-600"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center space-x-2">
            <Monitor className="w-4 h-4 text-white" />
            <span className="text-white font-medium text-sm">{window.title}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-white hover:bg-white/20"
              onClick={() => updateWindow(window.id, { isMinimized: true })}
            >
              <Minimize2 className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-white hover:bg-white/20"
              onClick={() => closeWindow(window.id)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Window Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <WorkspaceContent workspace={window.content} />
        </div>

        {/* Resize Handle */}
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-50 hover:opacity-100 transition-opacity"
          onMouseDown={handleResizeMouseDown}
        >
          <div className="w-full h-full bg-gray-400 dark:bg-gray-600" 
               style={{
                 clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)'
               }}
          />
        </div>
      </motion.div>
    );
  };

  const WorkspaceContent: React.FC<{ workspace: Workspace }> = ({ workspace }) => (
    <div className="h-full flex flex-col">
      <div className={`p-3 border-b ${
        theme === 'light' ? 'border-gray-200' : 'border-slate-600'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">{workspace.name}</h3>
          <Badge 
            variant={workspace.status === 'running' ? 'default' : 'secondary'}
            className="capitalize"
          >
            {workspace.status}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {workspace.template_type.toUpperCase()} • {workspace.configuration.memory} RAM • {workspace.configuration.vcpus} vCPUs
        </p>
      </div>
      
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" className="justify-start">
                <Terminal className="w-4 h-4 mr-2" />
                Open Terminal
              </Button>
              <Button size="sm" variant="outline" className="justify-start">
                <Folder className="w-4 h-4 mr-2" />
                File Manager
              </Button>
            </div>
          </div>
          
          {workspace.access_url && (
            <div>
              <h4 className="font-medium mb-2">Access URL</h4>
              <div className="flex items-center space-x-2">
                <Input 
                  value={workspace.access_url} 
                  readOnly 
                  className="text-xs"
                />
                <Button size="sm">Open</Button>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="h-full flex flex-col relative">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`p-4 border-b flex items-center justify-between ${
          theme === 'light'
            ? 'bg-white/50 border-purple-200'
            : theme === 'dark'
            ? 'bg-slate-800/50 border-slate-700'
            : 'bg-purple-900/30 border-purple-600/30'
        } backdrop-blur-md`}
      >
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            theme === 'light' ? 'bg-purple-100' : 'bg-purple-800/30'
          }`}>
            <Coffee className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h1 className={`text-xl font-semibold ${
              theme === 'light' ? 'text-purple-800' : 'text-purple-100'
            }`}>
              Development Workspaces
            </h1>
            <p className={`text-sm ${
              theme === 'light' ? 'text-purple-600' : 'text-purple-300'
            }`}>
              Your sensory-friendly coding sanctuary
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setIsChatVisible(true)}
            variant="outline"
            className="text-purple-600 border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30"
          >
            <Heart className="w-4 h-4 mr-2" />
            Mama Bear
          </Button>
          
          <Button 
            variant="outline"
            className="text-purple-600 border-purple-300"
          >
            <Github className="w-4 h-4 mr-2" />
            {githubConnected ? 'Connected' : 'Connect GitHub'}
          </Button>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Workspace Templates */}
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <h2 className={`text-lg font-semibold mb-4 ${
              theme === 'light' ? 'text-purple-800' : 'text-purple-100'
            }`}>
              Create New Workspace
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {workspaceTemplates.map((template, index) => {
                const IconComponent = template.icon;
                return (
                  <motion.div
                    key={template.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                        theme === 'light'
                          ? 'hover:border-purple-300 border-gray-200'
                          : 'hover:border-purple-600 border-slate-700'
                      }`}
                      onClick={() => createWorkspace(template)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${template.color}-100 dark:bg-${template.color}-900/30`}>
                            <IconComponent className={`w-5 h-5 text-${template.color}-600`} />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">{template.name}</h3>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {template.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* Active Workspaces */}
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h2 className={`text-lg font-semibold mb-4 ${
              theme === 'light' ? 'text-purple-800' : 'text-purple-100'
            }`}>
              Your Workspaces
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workspaces.map((workspace, index) => (
                <motion.div
                  key={workspace.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      workspace.status === 'running' 
                        ? 'border-green-300 bg-green-50 dark:bg-green-900/10' 
                        : workspace.status === 'creating'
                        ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10'
                        : 'border-gray-300'
                    }`}
                    onClick={() => workspace.status === 'running' && openWorkspace(workspace)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">{workspace.name}</h3>
                        <div className="flex items-center space-x-2">
                          {workspace.status === 'creating' && (
                            <Loader2 className="w-4 h-4 animate-spin text-yellow-600" />
                          )}
                          {workspace.status === 'running' && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                          {workspace.status === 'stopped' && (
                            <AlertCircle className="w-4 h-4 text-gray-600" />
                          )}
                          <Badge 
                            variant={workspace.status === 'running' ? 'default' : 'secondary'}
                            className="capitalize text-xs"
                          >
                            {workspace.status}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {workspace.template_type.toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {workspace.configuration.memory} RAM • {workspace.configuration.vcpus} vCPUs
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>
      </div>

      {/* Floating Windows */}
      <AnimatePresence>
        {windows.map((window) => (
          <FloatingWorkspaceWindow key={window.id} window={window} />
        ))}
      </AnimatePresence>

      {/* Mama Bear Chat */}
      <DraggableChat
        id="mama-bear-chat"
        title="Mama Bear Assistant"
        isVisible={isChatVisible}
        onClose={() => setIsChatVisible(false)}
        initialPosition={{ x: window.innerWidth - 450, y: 100 }}
        initialSize={{ width: 400, height: 500 }}
        zIndex={nextZIndex + 100}
      />
    </div>
  );
};

export default DevWorkspaces;