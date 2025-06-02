'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Brain, 
  Zap, 
  Code, 
  Database, 
  Globe, 
  ArrowRight,
  Sparkles,
  Target,
  Cpu,
  Network,
  FileCode,
  Play,
  Pause,
  Settings,
  History,
  BookOpen,
  Lightbulb
} from 'lucide-react';
import { useChatStore } from '@/lib/stores/chat';

interface ScoutCapability {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'analysis' | 'automation' | 'development' | 'research';
  status: 'active' | 'idle' | 'processing';
}

interface ScoutTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  result?: string;
  timestamp: Date;
}

const scoutCapabilities: ScoutCapability[] = [
  {
    id: 'code-analysis',
    name: 'Code Analysis',
    description: 'Deep analysis of codebase structure, patterns, and optimization opportunities',
    icon: <Code className="w-5 h-5" />,
    category: 'analysis',
    status: 'active'
  },
  {
    id: 'api-discovery',
    name: 'API Discovery',
    description: 'Automatically discover and document API endpoints and integrations',
    icon: <Network className="w-5 h-5" />,
    category: 'analysis',
    status: 'active'
  },
  {
    id: 'workflow-automation',
    name: 'Workflow Automation',
    description: 'Create and execute automated workflows for repetitive tasks',
    icon: <Zap className="w-5 h-5" />,
    category: 'automation',
    status: 'idle'
  },
  {
    id: 'data-extraction',
    name: 'Data Extraction',
    description: 'Extract and structure data from various sources and formats',
    icon: <Database className="w-5 h-5" />,
    category: 'automation',
    status: 'idle'
  },
  {
    id: 'smart-refactoring',
    name: 'Smart Refactoring',
    description: 'Intelligent code refactoring with pattern recognition',
    icon: <FileCode className="w-5 h-5" />,
    category: 'development',
    status: 'active'
  },
  {
    id: 'research-assistant',
    name: 'Research Assistant',
    description: 'Comprehensive research and information gathering',
    icon: <Globe className="w-5 h-5" />,
    category: 'research',
    status: 'active'
  }
];

export default function ScoutAgent() {
  const [activeTab, setActiveTab] = useState<'capabilities' | 'tasks' | 'insights'>('capabilities');
  const [selectedCapability, setSelectedCapability] = useState<ScoutCapability | null>(null);
  const [tasks, setTasks] = useState<ScoutTask[]>([
    {
      id: '1',
      title: 'Analyze Podplay Backend Structure',
      description: 'Deep analysis of Flask backend architecture and API endpoints',
      status: 'completed',
      progress: 100,
      result: 'Found 23 endpoints, 5 optimization opportunities',
      timestamp: new Date(Date.now() - 1000 * 60 * 30)
    },
    {
      id: '2',
      title: 'Frontend Component Audit',
      description: 'Review React components for reusability and performance',
      status: 'running',
      progress: 65,
      timestamp: new Date(Date.now() - 1000 * 60 * 5)
    }
  ]);
  const [query, setQuery] = useState('');
  const { addMessage } = useChatStore();

  const handleCapabilitySelect = (capability: ScoutCapability) => {
    setSelectedCapability(capability);
    // Here you would trigger the capability execution
    addMessage({
      id: Date.now().toString(),
      content: `Activating ${capability.name}: ${capability.description}`,
      role: 'assistant',
      timestamp: new Date(),
      type: 'text'
    });
  };

  const handleTaskStart = (capabilityId: string) => {
    const capability = scoutCapabilities.find(c => c.id === capabilityId);
    if (!capability) return;

    const newTask: ScoutTask = {
      id: Date.now().toString(),
      title: `Execute ${capability.name}`,
      description: capability.description,
      status: 'running',
      progress: 0,
      timestamp: new Date()
    };

    setTasks(prev => [newTask, ...prev]);

    // Simulate task execution
    const interval = setInterval(() => {
      setTasks(prev => prev.map(task => {
        if (task.id === newTask.id && task.status === 'running') {
          const newProgress = (task.progress || 0) + Math.random() * 20;
          if (newProgress >= 100) {
            clearInterval(interval);
            return {
              ...task,
              status: 'completed',
              progress: 100,
              result: `${capability.name} completed successfully`
            };
          }
          return { ...task, progress: newProgress };
        }
        return task;
      }));
    }, 1000);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'analysis': return 'text-blue-400';
      case 'automation': return 'text-green-400';
      case 'development': return 'text-purple-400';
      case 'research': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'processing': return 'text-yellow-400';
      case 'idle': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'running': return 'text-blue-400';
      case 'completed': return 'text-green-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-purple-500/20 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Scout Agent
              </h1>
              <p className="text-gray-400">Intelligent automation and analysis assistant</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask Scout to analyze, automate, or research something..."
              className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 placeholder-gray-500"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-all">
              Execute
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mt-6">
            {[
              { id: 'capabilities', label: 'Capabilities', icon: <Sparkles className="w-4 h-4" /> },
              { id: 'tasks', label: 'Active Tasks', icon: <Target className="w-4 h-4" /> },
              { id: 'insights', label: 'Insights', icon: <Lightbulb className="w-4 h-4" /> }
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
          {activeTab === 'capabilities' && (
            <motion.div
              key="capabilities"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scoutCapabilities.map((capability) => (
                  <motion.div
                    key={capability.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCapabilitySelect(capability)}
                    className="p-6 rounded-xl bg-gray-900/50 border border-purple-500/20 hover:border-purple-500/40 cursor-pointer transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg bg-gray-800/50 ${getCategoryColor(capability.category)}`}>
                        {capability.icon}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(capability.status)}`}>
                        {capability.status}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-400 transition-colors">
                      {capability.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      {capability.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${getCategoryColor(capability.category)}`}>
                        {capability.category}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTaskStart(capability.id);
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-purple-600/20 text-purple-400 rounded-lg text-xs font-medium hover:bg-purple-600/30 transition-all"
                      >
                        <Play className="w-3 h-3" />
                        Execute
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-6 rounded-xl bg-gray-900/50 border border-purple-500/20"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">{task.title}</h3>
                      <p className="text-gray-400 text-sm">{task.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${getTaskStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {task.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  {task.status === 'running' && typeof task.progress === 'number' && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-400">Progress</span>
                        <span className="text-sm text-purple-400">{Math.round(task.progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {task.result && (
                    <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-green-400 text-sm font-medium">Result: </span>
                      <span className="text-gray-300 text-sm">{task.result}</span>
                    </div>
                  )}
                </motion.div>
              ))}

              {tasks.length === 0 && (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">No Active Tasks</h3>
                  <p className="text-gray-500">Execute a capability to start your first Scout task</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <div className="p-6 rounded-xl bg-gray-900/50 border border-purple-500/20">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  Knowledge Base
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <h4 className="font-medium text-purple-400">API Endpoints Discovered</h4>
                    <p className="text-sm text-gray-400">23 endpoints mapped across 5 modules</p>
                  </div>
                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <h4 className="font-medium text-green-400">Code Patterns</h4>
                    <p className="text-sm text-gray-400">React hooks pattern detected in 89% of components</p>
                  </div>
                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <h4 className="font-medium text-orange-400">Performance Insights</h4>
                    <p className="text-sm text-gray-400">Bundle size can be reduced by 23% with lazy loading</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-gray-900/50 border border-purple-500/20">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-blue-400" />
                  System Analysis
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Code Quality Score</span>
                    <span className="text-green-400 font-medium">87/100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Test Coverage</span>
                    <span className="text-yellow-400 font-medium">64%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Dependencies</span>
                    <span className="text-blue-400 font-medium">45 packages</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Security Issues</span>
                    <span className="text-red-400 font-medium">2 medium</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
