import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  FileText, 
  Eye, 
  Clock, 
  Download, 
  Play, 
  Rocket,
  Heart,
  Coffee,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useThemeStore, useScoutStore } from '@/stores';
import { api } from '@/lib/api';

const ScoutAgent: React.FC = () => {
  const { theme } = useThemeStore();
  const { 
    stage, 
    projectId, 
    files, 
    timeline, 
    isGenerating,
    setStage,
    setProjectId,
    setFiles,
    setTimeline,
    addTimelineItem,
    setGenerating
  } = useScoutStore();

  const [prompt, setPrompt] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const quickActions = [
    { icon: FileText, label: 'Research', color: 'blue' },
    { icon: Rocket, label: 'Create', color: 'purple' },
    { icon: Star, label: 'Plan', color: 'green' },
    { icon: Coffee, label: 'Analyze', color: 'orange' },
    { icon: Heart, label: 'Learn', color: 'pink' },
  ];

  const sampleFiles = [
    { name: 'App.tsx', type: 'tsx', size: '2.4 KB', status: 'complete' },
    { name: 'package.json', type: 'json', size: '1.2 KB', status: 'complete' },
    { name: 'main.py', type: 'python', size: '3.1 KB', status: 'generating' },
    { name: 'README.md', type: 'markdown', size: '0.8 KB', status: 'pending' },
  ];

  const sampleTimeline = [
    { id: 1, title: 'Project Analysis', status: 'complete', time: '0:00' },
    { id: 2, title: 'Architecture Planning', status: 'complete', time: '0:15' },
    { id: 3, title: 'Code Generation', status: 'active', time: '0:30' },
    { id: 4, title: 'Testing & Optimization', status: 'pending', time: '0:45' },
    { id: 5, title: 'Production Ready', status: 'pending', time: '1:00' },
  ];

  const startProject = async () => {
    if (!prompt.trim()) return;
    
    setGenerating(true);
    setStage('planning');
    
    // Simulate API call
    try {
      // const response = await api.createScoutProject(prompt);
      // if (response.success) {
      //   setProjectId(response.data.project_id);
      // }
      
      // Simulate progression through stages
      setTimeout(() => setStage('workspace'), 2000);
      setTimeout(() => setStage('production'), 4000);
    } catch (error) {
      console.error('Failed to start project:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleQuickAction = (action: string) => {
    setPrompt(`${action} a new project`);
  };

  const downloadFile = (fileName: string) => {
    // Implement file download
    console.log('Downloading:', fileName);
  };

  const downloadProject = () => {
    // Implement project download
    console.log('Downloading complete project');
  };

  // Welcome Stage
  if (stage === 'welcome') {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <div className="mb-8">
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 ${
              theme === 'light'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-purple-800/30 text-purple-200'
            }`}>
              Scout Alpha
            </div>
            <h1 className={`text-4xl font-bold mb-4 ${
              theme === 'light' ? 'text-purple-800' : 'text-purple-100'
            }`}>
              Hey Nathan, Got work? Let's jam!
            </h1>
            <p className={`text-xl ${
              theme === 'light' ? 'text-purple-600' : 'text-purple-300'
            }`}>
              Let Scout do it for you...
            </p>
          </div>

          <div className="mb-8">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Plan Multi-LLM App with Gemini API & Scout"
              className="text-lg h-14 rounded-xl text-center"
              onKeyPress={(e) => e.key === 'Enter' && startProject()}
            />
            <Button
              onClick={startProject}
              disabled={!prompt.trim()}
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Project
            </Button>
          </div>

          <div className="flex justify-center space-x-4">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleQuickAction(action.label)}
                className={`flex flex-col items-center p-4 rounded-xl transition-colors ${
                  theme === 'light'
                    ? 'bg-white hover:bg-gray-50 border border-gray-200'
                    : 'bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600'
                }`}
              >
                <action.icon className={`w-6 h-6 mb-2 text-${action.color}-500`} />
                <span className={`text-sm font-medium ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  {action.label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Main Workspace (Planning, Workspace, Production stages)
  return (
    <div className="h-full flex">
      {/* Timeline Panel */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`w-80 border-r flex flex-col ${
          theme === 'light'
            ? 'bg-white/50 border-purple-200'
            : 'bg-slate-800/50 border-slate-700'
        } backdrop-blur-md`}
      >
        <div className="p-4 border-b border-purple-200 dark:border-slate-700">
          <h3 className={`font-semibold ${
            theme === 'light' ? 'text-purple-800' : 'text-purple-100'
          }`}>
            Timeline
          </h3>
        </div>
        <div className="flex-1 p-4 space-y-3">
          {sampleTimeline.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                item.status === 'complete' ? 'bg-green-50 dark:bg-green-900/20' :
                item.status === 'active' ? 'bg-purple-50 dark:bg-purple-900/20' :
                'bg-gray-50 dark:bg-gray-800/50'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                item.status === 'complete' ? 'bg-green-500' :
                item.status === 'active' ? 'bg-purple-500 animate-pulse' :
                'bg-gray-300'
              }`}>
                {item.status === 'complete' ? (
                  <div className="w-2 h-2 bg-white rounded-full" />
                ) : item.status === 'active' ? (
                  <Play className="w-3 h-3 text-white" />
                ) : (
                  <div className="w-2 h-2 bg-white rounded-full opacity-50" />
                )}
              </div>
              <div className="flex-1">
                <p className={`font-medium text-sm ${
                  theme === 'light' ? 'text-gray-800' : 'text-gray-200'
                }`}>
                  {item.title}
                </p>
                <p className={`text-xs ${
                  theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {item.time}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Files Panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={`w-96 border-r flex flex-col ${
          theme === 'light'
            ? 'bg-white/50 border-purple-200'
            : 'bg-slate-800/50 border-slate-700'
        } backdrop-blur-md`}
      >
        <div className="p-4 border-b border-purple-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold ${
              theme === 'light' ? 'text-purple-800' : 'text-purple-100'
            }`}>
              Files
            </h3>
            <Button
              onClick={downloadProject}
              size="sm"
              variant="outline"
              className="text-purple-600 border-purple-300"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Project
            </Button>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-2">
          {sampleFiles.map((file, index) => (
            <motion.div
              key={file.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className={`p-3 rounded-lg border transition-all hover:shadow-sm ${
                theme === 'light'
                  ? 'bg-white border-gray-200 hover:border-purple-300'
                  : 'bg-slate-700/50 border-slate-600 hover:border-purple-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-purple-500" />
                    <span className={`font-medium ${
                      theme === 'light' ? 'text-gray-800' : 'text-gray-200'
                    }`}>
                      {file.name}
                    </span>
                    <Badge variant={
                      file.type === 'tsx' ? 'default' :
                      file.type === 'python' ? 'secondary' :
                      file.type === 'json' ? 'outline' :
                      'secondary'
                    }>
                      {file.type.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-xs ${
                      theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {file.size}
                    </span>
                    <Badge variant={
                      file.status === 'complete' ? 'default' :
                      file.status === 'generating' ? 'secondary' :
                      'outline'
                    }>
                      {file.status}
                    </Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => downloadFile(file.name)}
                  disabled={file.status !== 'complete'}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Preview Panel */}
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex-1 flex flex-col"
      >
        <div className={`p-4 border-b ${
          theme === 'light'
            ? 'bg-white/50 border-purple-200'
            : 'bg-slate-800/50 border-slate-700'
        } backdrop-blur-md`}>
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold ${
              theme === 'light' ? 'text-purple-800' : 'text-purple-100'
            }`}>
              Preview
            </h3>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button size="sm" variant="outline">
                Code
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-8">
          {stage === 'planning' ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                theme === 'light' ? 'bg-purple-100' : 'bg-purple-800/30'
              }`}>
                <Brain className="w-10 h-10 text-purple-600 animate-pulse" />
              </div>
              <h4 className={`text-lg font-semibold mb-2 ${
                theme === 'light' ? 'text-purple-800' : 'text-purple-100'
              }`}>
                Planning your project...
              </h4>
              <p className={`${
                theme === 'light' ? 'text-purple-600' : 'text-purple-300'
              }`}>
                Scout is analyzing your requirements and creating the perfect architecture
              </p>
            </motion.div>
          ) : stage === 'workspace' ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                theme === 'light' ? 'bg-green-100' : 'bg-green-800/30'
              }`}>
                <Coffee className="w-10 h-10 text-green-600 animate-pulse" />
              </div>
              <h4 className={`text-lg font-semibold mb-2 ${
                theme === 'light' ? 'text-green-800' : 'text-green-100'
              }`}>
                Building your workspace...
              </h4>
              <p className={`${
                theme === 'light' ? 'text-green-600' : 'text-green-300'
              }`}>
                Files are being generated and workspace is being set up
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                theme === 'light' ? 'bg-blue-100' : 'bg-blue-800/30'
              }`}>
                <Rocket className="w-10 h-10 text-blue-600" />
              </div>
              <h4 className={`text-lg font-semibold mb-2 ${
                theme === 'light' ? 'text-blue-800' : 'text-blue-100'
              }`}>
                Production Ready!
              </h4>
              <p className={`${
                theme === 'light' ? 'text-blue-600' : 'text-blue-300'
              }`}>
                Your project is complete and ready for deployment
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const Brain: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
  </svg>
);

export default ScoutAgent;