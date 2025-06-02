'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  FolderOpen, 
  Code, 
  Terminal, 
  Git, 
  Play, 
  Pause, 
  Stop,
  Settings,
  Monitor,
  Layers,
  FileText,
  Globe,
  Database,
  Box,
  Trash2,
  Download,
  Upload,
  Copy,
  ExternalLink,
  Clock,
  Star,
  Users,
  Lock,
  Unlock,
  Zap,
  Cpu,
  HardDrive,
  Network
} from 'lucide-react';
import { useWorkspaceStore } from '@/lib/stores/workspace';

interface Workspace {
  id: string;
  name: string;
  description: string;
  type: 'frontend' | 'backend' | 'fullstack' | 'data' | 'mobile' | 'ai';
  status: 'active' | 'idle' | 'error' | 'deploying';
  language: string;
  framework: string;
  lastAccessed: Date;
  isPrivate: boolean;
  collaborators: number;
  starred: boolean;
  resourceUsage: {
    cpu: number;
    memory: number;
    storage: number;
  };
  url?: string;
  port?: number;
}

interface WorkspaceTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  type: 'frontend' | 'backend' | 'fullstack' | 'data' | 'mobile' | 'ai';
  tech: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const workspaceTemplates: WorkspaceTemplate[] = [
  {
    id: 'next-ts',
    name: 'Next.js + TypeScript',
    description: 'Modern React framework with TypeScript and Tailwind CSS',
    icon: <Code className="w-6 h-6" />,
    type: 'frontend',
    tech: ['Next.js', 'TypeScript', 'Tailwind CSS'],
    difficulty: 'intermediate'
  },
  {
    id: 'flask-api',
    name: 'Flask API Server',
    description: 'Python Flask API with SQLAlchemy and authentication',
    icon: <Database className="w-6 h-6" />,
    type: 'backend',
    tech: ['Python', 'Flask', 'SQLAlchemy'],
    difficulty: 'intermediate'
  },
  {
    id: 'mern-stack',
    name: 'MERN Stack',
    description: 'Full-stack application with MongoDB, Express, React, Node.js',
    icon: <Layers className="w-6 h-6" />,
    type: 'fullstack',
    tech: ['MongoDB', 'Express', 'React', 'Node.js'],
    difficulty: 'advanced'
  },
  {
    id: 'ai-workspace',
    name: 'AI/ML Workspace',
    description: 'Python environment with Jupyter, TensorFlow, and data tools',
    icon: <Zap className="w-6 h-6" />,
    type: 'ai',
    tech: ['Python', 'Jupyter', 'TensorFlow', 'NumPy'],
    difficulty: 'advanced'
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis',
    description: 'Pandas, NumPy, and visualization tools for data science',
    icon: <Monitor className="w-6 h-6" />,
    type: 'data',
    tech: ['Python', 'Pandas', 'Matplotlib', 'Jupyter'],
    difficulty: 'beginner'
  },
  {
    id: 'docker-compose',
    name: 'Docker Compose',
    description: 'Multi-container application with Docker Compose',
    icon: <Box className="w-6 h-6" />,
    type: 'fullstack',
    tech: ['Docker', 'PostgreSQL', 'Redis', 'Nginx'],
    difficulty: 'advanced'
  }
];

const mockWorkspaces: Workspace[] = [
  {
    id: '1',
    name: 'Podplay Studio Frontend',
    description: 'Next.js frontend for Podplay Studio with modular architecture',
    type: 'frontend',
    status: 'active',
    language: 'TypeScript',
    framework: 'Next.js',
    lastAccessed: new Date(),
    isPrivate: false,
    collaborators: 3,
    starred: true,
    resourceUsage: { cpu: 45, memory: 512, storage: 2048 },
    url: 'http://localhost:3000',
    port: 3000
  },
  {
    id: '2',
    name: 'Backend API Server',
    description: 'Flask backend with SocketIO for real-time communication',
    type: 'backend',
    status: 'active',
    language: 'Python',
    framework: 'Flask',
    lastAccessed: new Date(Date.now() - 1000 * 60 * 30),
    isPrivate: false,
    collaborators: 2,
    starred: true,
    resourceUsage: { cpu: 23, memory: 256, storage: 1024 },
    port: 5000
  },
  {
    id: '3',
    name: 'AI Model Training',
    description: 'TensorFlow workspace for training conversation models',
    type: 'ai',
    status: 'idle',
    language: 'Python',
    framework: 'TensorFlow',
    lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 2),
    isPrivate: true,
    collaborators: 1,
    starred: false,
    resourceUsage: { cpu: 0, memory: 0, storage: 5120 }
  }
];

export default function DevWorkspaces() {
  const [activeTab, setActiveTab] = useState<'workspaces' | 'templates' | 'activity'>('workspaces');
  const [workspaces, setWorkspaces] = useState<Workspace[]>(mockWorkspaces);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkspaceTemplate | null>(null);
  const { currentWorkspace, setCurrentWorkspace } = useWorkspaceStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'idle': return 'text-yellow-400 bg-yellow-400/10';
      case 'error': return 'text-red-400 bg-red-400/10';
      case 'deploying': return 'text-blue-400 bg-blue-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'frontend': return 'text-blue-400 bg-blue-400/10';
      case 'backend': return 'text-green-400 bg-green-400/10';
      case 'fullstack': return 'text-purple-400 bg-purple-400/10';
      case 'data': return 'text-orange-400 bg-orange-400/10';
      case 'mobile': return 'text-pink-400 bg-pink-400/10';
      case 'ai': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-yellow-400';
      case 'advanced': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const handleWorkspaceAction = (workspaceId: string, action: 'start' | 'stop' | 'restart' | 'delete') => {
    setWorkspaces(prev => prev.map(ws => {
      if (ws.id === workspaceId) {
        switch (action) {
          case 'start':
            return { ...ws, status: 'active' as const };
          case 'stop':
            return { ...ws, status: 'idle' as const };
          case 'restart':
            return { ...ws, status: 'deploying' as const };
          case 'delete':
            return ws; // Will be filtered out
          default:
            return ws;
        }
      }
      return ws;
    }).filter(ws => !(action === 'delete' && ws.id === workspaceId)));
  };

  const handleCreateWorkspace = (template: WorkspaceTemplate) => {
    const newWorkspace: Workspace = {
      id: Date.now().toString(),
      name: `New ${template.name}`,
      description: template.description,
      type: template.type,
      status: 'deploying',
      language: template.tech[0] || 'JavaScript',
      framework: template.name,
      lastAccessed: new Date(),
      isPrivate: false,
      collaborators: 1,
      starred: false,
      resourceUsage: { cpu: 0, memory: 0, storage: 0 }
    };

    setWorkspaces(prev => [newWorkspace, ...prev]);
    setShowCreateModal(false);
    setSelectedTemplate(null);

    // Simulate deployment
    setTimeout(() => {
      setWorkspaces(prev => prev.map(ws => 
        ws.id === newWorkspace.id ? { ...ws, status: 'active' as const } : ws
      ));
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-purple-500/20 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600">
                <FolderOpen className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Dev Workspaces
                </h1>
                <p className="text-gray-400">Manage and deploy development environments</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              New Workspace
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-6">
            {[
              { id: 'workspaces', label: 'My Workspaces', icon: <FolderOpen className="w-4 h-4" /> },
              { id: 'templates', label: 'Templates', icon: <Layers className="w-4 h-4" /> },
              { id: 'activity', label: 'Activity', icon: <Clock className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'workspaces' && (
            <motion.div
              key="workspaces"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {workspaces.map((workspace) => (
                  <motion.div
                    key={workspace.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 rounded-xl bg-gray-900/50 border border-purple-500/20 hover:border-purple-500/40 transition-all group"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getTypeColor(workspace.type)}`}>
                          {workspace.type === 'frontend' && <Code className="w-5 h-5" />}
                          {workspace.type === 'backend' && <Database className="w-5 h-5" />}
                          {workspace.type === 'fullstack' && <Layers className="w-5 h-5" />}
                          {workspace.type === 'data' && <Monitor className="w-5 h-5" />}
                          {workspace.type === 'ai' && <Zap className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{workspace.name}</h3>
                            {workspace.starred && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
                            {workspace.isPrivate ? <Lock className="w-4 h-4 text-gray-400" /> : <Unlock className="w-4 h-4 text-gray-400" />}
                          </div>
                          <p className="text-sm text-gray-400">{workspace.framework}</p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workspace.status)}`}>
                        {workspace.status}
                      </div>
                    </div>

                    <p className="text-gray-400 text-sm mb-4">{workspace.description}</p>

                    {/* Resource Usage */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 flex items-center gap-1">
                          <Cpu className="w-3 h-3" />
                          CPU
                        </span>
                        <span className="text-blue-400">{workspace.resourceUsage.cpu}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-1">
                        <div
                          className="bg-blue-400 h-1 rounded-full transition-all"
                          style={{ width: `${workspace.resourceUsage.cpu}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 flex items-center gap-1">
                          <HardDrive className="w-3 h-3" />
                          Memory
                        </span>
                        <span className="text-green-400">{workspace.resourceUsage.memory}MB</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {workspace.status === 'active' ? (
                          <button
                            onClick={() => handleWorkspaceAction(workspace.id, 'stop')}
                            className="p-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-all"
                          >
                            <Stop className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleWorkspaceAction(workspace.id, 'start')}
                            className="p-2 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 transition-all"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button className="p-2 rounded-lg bg-gray-600/20 text-gray-400 hover:bg-gray-600/30 transition-all">
                          <Terminal className="w-4 h-4" />
                        </button>
                        
                        {workspace.url && (
                          <button className="p-2 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-all">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Users className="w-3 h-3" />
                        {workspace.collaborators}
                      </div>
                    </div>

                    {workspace.url && (
                      <div className="mt-3 pt-3 border-t border-gray-700/50">
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="w-4 h-4 text-blue-400" />
                          <span className="text-blue-400">{workspace.url}</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'templates' && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {workspaceTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTemplate(template)}
                  className="p-6 rounded-xl bg-gray-900/50 border border-purple-500/20 hover:border-purple-500/40 cursor-pointer transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${getTypeColor(template.type)}`}>
                      {template.icon}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                      {template.difficulty}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-400 transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {template.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.tech.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-1 bg-gray-800/50 text-gray-300 text-xs rounded-lg"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateWorkspace(template);
                    }}
                    className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    Create Workspace
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="p-6 rounded-xl bg-gray-900/50 border border-purple-500/20">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {[
                    { action: 'Started workspace', target: 'Podplay Studio Frontend', time: '2 minutes ago', type: 'start' },
                    { action: 'Deployed', target: 'Backend API Server', time: '1 hour ago', type: 'deploy' },
                    { action: 'Created workspace', target: 'AI Model Training', time: '3 hours ago', type: 'create' },
                    { action: 'Stopped workspace', target: 'Legacy Frontend', time: '1 day ago', type: 'stop' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'start' ? 'bg-green-400/10 text-green-400' :
                        activity.type === 'deploy' ? 'bg-blue-400/10 text-blue-400' :
                        activity.type === 'create' ? 'bg-purple-400/10 text-purple-400' :
                        'bg-yellow-400/10 text-yellow-400'
                      }`}>
                        {activity.type === 'start' && <Play className="w-4 h-4" />}
                        {activity.type === 'deploy' && <Upload className="w-4 h-4" />}
                        {activity.type === 'create' && <Plus className="w-4 h-4" />}
                        {activity.type === 'stop' && <Stop className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="text-white">{activity.action}</span>
                          <span className="text-purple-400 mx-1">{activity.target}</span>
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
