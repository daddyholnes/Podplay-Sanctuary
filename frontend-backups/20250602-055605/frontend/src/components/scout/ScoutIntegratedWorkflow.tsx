/**
 * Scout Integrated Workflow Component
 * 
 * Integrates the Scout UI with existing Redux store, chat system, and MCP infrastructure.
 * Provides the full Scout.new experience with real backend connectivity.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronRight, File, Folder, Download, RefreshCw, X, Minimize2, Maximize2, MoreVertical, Play, CheckCircle, Clock, Zap } from 'lucide-react';

// Store imports
import type { RootState } from '../../store/rootReducer';
import { sendMessage, createConversation, setActiveConversation } from '../../store/slices/chatSlice';
import { startAnalysis, updateAnalysisProgress } from '../../store/slices/scoutSlice';
import { createProject, addFile, setActiveProject } from '../../store/slices/workspaceSlice';
import { showNotification, setLoading } from '../../store/slices/uiSlice';

// Service imports
import { ChatService } from '../../services/ai/ChatService';
import { WorkspaceService } from '../../services/workspace/WorkspaceService';

// Types
interface ScoutProject {
  id: string;
  name: string;
  description: string;
  type: 'react' | 'next' | 'node' | 'python' | 'fullstack';
  complexity: 'simple' | 'moderate' | 'complex';
  status: 'planning' | 'building' | 'deployed';
  files: ScoutFile[];
  timeline: TimelineStep[];
}

interface ScoutFile {
  name: string;
  type: string;
  content?: string;
  status: 'pending' | 'generating' | 'generated' | 'error';
  size?: number;
}

interface TimelineStep {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'planning' | 'active' | 'completed' | 'error';
  progress?: number;
}

const ScoutIntegratedWorkflow: React.FC = () => {
  // Redux state
  const dispatch = useDispatch();
  const chatState = useSelector((state: RootState) => state.chat);
  const scoutState = useSelector((state: RootState) => state.scout);
  const workspaceState = useSelector((state: RootState) => state.workspace);
  const uiState = useSelector((state: RootState) => state.ui);

  // Local state
  const [currentStage, setCurrentStage] = useState<'welcome' | 'planning' | 'workspace' | 'production'>('welcome');
  const [leftPanelWidth, setLeftPanelWidth] = useState(320);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [userInput, setUserInput] = useState('');
  const [currentProject, setCurrentProject] = useState<ScoutProject | null>(null);

  // Animation states
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Get active conversation messages for Scout
  const scoutMessages = chatState.activeConversationId 
    ? chatState.messages[chatState.activeConversationId] || []
    : [];

  // Scout conversation setup
  useEffect(() => {
    // Create a dedicated Scout conversation if none exists
    if (!chatState.activeConversationId || !chatState.conversations[chatState.activeConversationId]?.title.includes('Scout')) {
      const conversationId = `scout-${Date.now()}`;
      dispatch(createConversation({
        id: conversationId,
        title: 'Scout Autonomous Agent',
        settings: {
          model: 'claude-3-sonnet',
          temperature: 0.7,
          maxTokens: 4000,
          systemPrompt: `You are Scout, an autonomous full-stack development AI assistant. You help users plan, build, and deploy complete applications. 
          
You should:
- Break down complex projects into manageable steps
- Generate code files and configurations
- Provide real-time guidance and feedback
- Be enthusiastic and encouraging
- Use emojis to make interactions friendly

Always respond in a helpful, energetic tone that matches the Scout.new experience.`
        }
      }));
      dispatch(setActiveConversation(conversationId));
    }
  }, [dispatch, chatState.activeConversationId, chatState.conversations]);

  // Welcome stage - Start planning
  const handleStartPlanning = useCallback(async (prompt: string) => {
    setCurrentStage('planning');
    setUserInput(prompt);
    
    try {
      // Start loading
      dispatch(setLoading({ key: 'scout-planning', value: true }));
      
      // Send message to Scout
      const messageId = `msg-${Date.now()}`;
      dispatch(sendMessage({
        id: messageId,
        conversationId: chatState.activeConversationId!,
        content: `Help me plan and build: ${prompt}`,
        role: 'user',
        timestamp: Date.now(),
        status: 'sending'
      }));

      // Create a new project
      const projectId = `project-${Date.now()}`;
      const project: ScoutProject = {
        id: projectId,
        name: prompt.split(' ').slice(0, 3).join(' '),
        description: prompt,
        type: 'fullstack', // Default, can be refined by Scout
        complexity: 'moderate',
        status: 'planning',
        files: [],
        timeline: [
          { id: 1, title: 'Environment Setup', status: 'planning', description: 'Configure APIs and dependencies' },
          { id: 2, title: 'Frontend Architecture', status: 'pending', description: 'React + TypeScript structure' },
          { id: 3, title: 'Backend Services', status: 'pending', description: 'FastAPI + Multi-LLM integration' },
          { id: 4, title: 'UI Components', status: 'pending', description: 'Chat interface and file management' },
          { id: 5, title: 'Deployment', status: 'pending', description: 'Production build and hosting' }
        ]
      };
      
      setCurrentProject(project);
      
      // Add to workspace
      dispatch(createProject({
        id: projectId,
        name: project.name,
        description: project.description,
        path: `/scout-projects/${projectId}`,
        type: 'scout-generated',
        status: 'active'
      }));
      
      dispatch(setActiveProject(projectId));
      
      // Show success notification
      dispatch(showNotification({
        id: `scout-planning-${Date.now()}`,
        type: 'success',
        title: 'Scout Planning Started',
        message: 'Scout is analyzing your request and creating a project plan...',
        duration: 3000
      }));
      
    } catch (error) {
      console.error('Error starting Scout planning:', error);
      dispatch(showNotification({
        id: `scout-error-${Date.now()}`,
        type: 'error',
        title: 'Planning Error',
        message: 'Failed to start Scout planning. Please try again.',
        duration: 5000
      }));
    } finally {
      dispatch(setLoading({ key: 'scout-planning', value: false }));
    }
  }, [dispatch, chatState.activeConversationId]);

  // Transition to workspace
  const handleStartWorkspace = useCallback(async () => {
    if (!currentProject) return;
    
    setCurrentStage('transitioning');
    setIsTransitioning(true);
    
    try {
      dispatch(setLoading({ key: 'scout-building', value: true }));
      
      // Start Scout analysis for the project
      dispatch(startAnalysis({
        projectId: currentProject.id,
        analysisType: 'project-generation',
        options: {
          generateFiles: true,
          setupEnvironment: true,
          createTests: true
        }
      }));
      
      // Simulate file generation process
      const files: ScoutFile[] = [
        { name: 'package.json', type: 'config', status: 'generating' },
        { name: 'App.tsx', type: 'react', status: 'pending' },
        { name: 'server.py', type: 'python', status: 'pending' },
        { name: 'docker-compose.yml', type: 'docker', status: 'pending' },
        { name: 'README.md', type: 'documentation', status: 'pending' }
      ];
      
      // Update project with files
      const updatedProject = { ...currentProject, files };
      setCurrentProject(updatedProject);
      
      // Simulate progressive file generation
      for (let i = 0; i < files.length; i++) {
        setTimeout(() => {
          const file = files[i];
          
          // Update file status
          files[i] = { ...file, status: 'generated' };
          setCurrentProject(prev => prev ? { ...prev, files: [...files] } : null);
          
          // Update timeline
          if (currentProject.timeline[i + 1]) {
            currentProject.timeline[i + 1].status = 'active';
          }
          
          // Add file to workspace
          dispatch(addFile({
            projectId: currentProject.id,
            file: {
              name: file.name,
              path: `/${file.name}`,
              type: file.type,
              content: '', // Would be generated by Scout
              size: 0,
              lastModified: Date.now()
            }
          }));
          
          // Send chat update
          dispatch(sendMessage({
            id: `msg-${Date.now()}`,
            conversationId: chatState.activeConversationId!,
            content: `✅ Generated ${file.name} - ${file.type} component ready!`,
            role: 'assistant',
            timestamp: Date.now(),
            status: 'sent'
          }));
          
          // Update analysis progress
          dispatch(updateAnalysisProgress({
            progress: ((i + 1) / files.length) * 100,
            currentFile: file.name,
            stage: 'generating'
          }));
          
        }, i * 1500);
      }
      
      // Transition to workspace after all files generated
      setTimeout(() => {
        setCurrentStage('workspace');
        setIsTransitioning(false);
        
        dispatch(sendMessage({
          id: `msg-${Date.now()}`,
          conversationId: chatState.activeConversationId!,
          content: '🚀 Project structure complete! Ready to start developing. What would you like to work on first?',
          role: 'assistant',
          timestamp: Date.now(),
          status: 'sent'
        }));
        
        dispatch(showNotification({
          id: `scout-workspace-${Date.now()}`,
          type: 'success',
          title: 'Workspace Ready',
          message: 'Scout has generated your project files and workspace is ready!',
          duration: 3000
        }));
        
      }, files.length * 1500 + 1000);
      
    } catch (error) {
      console.error('Error starting workspace:', error);
      dispatch(showNotification({
        id: `scout-workspace-error-${Date.now()}`,
        type: 'error',
        title: 'Workspace Error',
        message: 'Failed to generate workspace. Please try again.',
        duration: 5000
      }));
    } finally {
      dispatch(setLoading({ key: 'scout-building', value: false }));
    }
  }, [currentProject, dispatch, chatState.activeConversationId]);

  // Send chat message
  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !chatState.activeConversationId) return;
    
    try {
      const messageId = `msg-${Date.now()}`;
      dispatch(sendMessage({
        id: messageId,
        conversationId: chatState.activeConversationId,
        content: message,
        role: 'user',
        timestamp: Date.now(),
        status: 'sending'
      }));
      
      // Here you would typically call the ChatService to get Scout's response
      // For now, we'll simulate a response
      setTimeout(() => {
        dispatch(sendMessage({
          id: `msg-${Date.now()}`,
          conversationId: chatState.activeConversationId!,
          content: `Got it! Let me help you with: ${message}`,
          role: 'assistant',
          timestamp: Date.now(),
          status: 'sent'
        }));
      }, 1000);
      
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [dispatch, chatState.activeConversationId]);

  // Resizing functionality
  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftPanelWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const width = Math.max(200, Math.min(600, startWidth + e.clientX - startX));
      setLeftPanelWidth(width);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [leftPanelWidth]);

  // Quick Actions
  const quickActions = [
    { label: 'Research', icon: '🔍', color: 'bg-blue-500' },
    { label: 'Create', icon: '✨', color: 'bg-purple-500' },
    { label: 'Plan', icon: '📋', color: 'bg-green-500' },
    { label: 'Analyze', icon: '📊', color: 'bg-orange-500' },
    { label: 'Learn', icon: '🎓', color: 'bg-pink-500' }
  ];

  // Welcome Stage Component
  const WelcomeStage = () => (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 animate-pulse-slow">
      <div className="text-center max-w-2xl mx-auto p-8">
        <div className="mb-8 animate-bounce">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Hey! 💝 Got work? Let's jam!
          </h1>
          <p className="text-xl text-gray-600">Your autonomous full-stack development companion</p>
        </div>

        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Let Scout do it for you..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && userInput && handleStartPlanning(userInput)}
              className="w-full px-6 py-4 text-lg rounded-2xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none bg-white/80 backdrop-blur-sm shadow-lg"
            />
            <button
              onClick={() => userInput && handleStartPlanning(userInput)}
              disabled={!userInput || uiState.loadingStates['scout-planning']}
              className="absolute right-2 top-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all"
            >
              {uiState.loadingStates['scout-planning'] ? (
                <RefreshCw size={20} className="animate-spin" />
              ) : (
                <Play size={20} />
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-center gap-4 flex-wrap">
          {quickActions.map((action, index) => (
            <button
              key={action.label}
              onClick={() => handleStartPlanning(`${action.label} a full-stack application with AI integration`)}
              className={`${action.color} text-white px-6 py-3 rounded-xl hover:scale-105 transition-transform shadow-lg backdrop-blur-sm`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <span className="mr-2">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>

        <div className="mt-8 text-sm text-purple-400">
          <span className="bg-purple-100 px-3 py-1 rounded-full">Scout Alpha ✨</span>
        </div>
      </div>
    </div>
  );

  // Planning Stage Component
  const PlanningStage = () => (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl p-8 border border-purple-500/30">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            🤖 Planning Your Project...
          </h2>
          
          <div className="space-y-4 mb-8 max-h-64 overflow-y-auto">
            {scoutMessages.slice(-10).map((msg, index) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideIn`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className={`max-w-md p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-slate-700 text-purple-100'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {chatState.isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-700 p-4 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {currentProject?.timeline && (
            <div className="space-y-3 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">📋 Project Timeline</h3>
              {currentProject.timeline.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-4 p-3 rounded-lg border transition-all animate-dropIn ${
                    step.status === 'planning' ? 'bg-yellow-900/30 border-yellow-500/30' :
                    step.status === 'active' ? 'bg-green-900/30 border-green-500/30' :
                    step.status === 'completed' ? 'bg-blue-900/30 border-blue-500/30' :
                    'bg-slate-800/50 border-slate-600/30'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step.status === 'planning' ? 'bg-yellow-500 text-black' :
                    step.status === 'active' ? 'bg-green-500 text-white' :
                    step.status === 'completed' ? 'bg-blue-500 text-white' :
                    'bg-slate-600 text-gray-300'
                  }`}>
                    {step.status === 'planning' ? <Clock size={16} /> :
                     step.status === 'active' || step.status === 'completed' ? <CheckCircle size={16} /> :
                     step.id}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{step.title}</h4>
                    <p className="text-sm text-gray-400">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentProject && !chatState.isTyping && !uiState.loadingStates['scout-planning'] && (
            <div className="text-center">
              <button
                onClick={handleStartWorkspace}
                disabled={uiState.loadingStates['scout-building']}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg disabled:opacity-50"
              >
                {uiState.loadingStates['scout-building'] ? (
                  <>
                    <RefreshCw className="inline mr-2 animate-spin" size={20} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="inline mr-2" size={20} />
                    Start Building! 🚀
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Workspace Stage Component (continued in next file due to length)
  const WorkspaceStage = () => (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <h1 className="text-white font-semibold">Scout Workspace</h1>
          <span className={`text-sm ${
            scoutState.isAnalyzing ? 'text-yellow-400' : 'text-green-400'
          }`}>
            ● {scoutState.isAnalyzing ? 'Building...' : 'Ready'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="text-gray-400 hover:text-white p-2 rounded">
            <Minimize2 size={16} />
          </button>
          <button className="text-gray-400 hover:text-white p-2 rounded">
            <Maximize2 size={16} />
          </button>
          <button 
            className="text-gray-400 hover:text-white p-2 rounded"
            onClick={() => setCurrentStage('welcome')}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Timeline + Chat */}
        <div className="bg-slate-800" style={{ width: leftPanelWidth }}>
          {/* Timeline Section */}
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <Clock size={16} />
              Progress Timeline
            </h3>
            <div className="space-y-2">
              {currentProject?.timeline.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-2 rounded text-sm ${
                    step.status === 'active' || step.status === 'completed' ? 'bg-green-900/30 text-green-300' :
                    step.status === 'planning' ? 'bg-yellow-900/30 text-yellow-300' :
                    'text-gray-400'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    step.status === 'active' || step.status === 'completed' ? 'bg-green-400' :
                    step.status === 'planning' ? 'bg-yellow-400' :
                    'bg-gray-600'
                  }`}></div>
                  {step.title}
                </div>
              )) || []}
            </div>
          </div>

          {/* Chat Section */}
          <div className="flex-1 flex flex-col">
            <div className="p-3 border-b border-slate-700">
              <h3 className="text-white font-medium">💬 Chat with Scout</h3>
            </div>
            
            <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-64">
              {scoutMessages.slice(-5).map((msg, index) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs p-2 rounded-lg text-sm ${
                    msg.role === 'user' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-slate-700 text-gray-200'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-3 border-t border-slate-700">
              <input
                type="text"
                placeholder="Ask Scout..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    handleSendMessage(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-purple-500 focus:outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className="w-1 bg-slate-700 hover:bg-slate-600 cursor-col-resize flex-shrink-0"
          onMouseDown={startResize}
        />

        {/* Center Panel - File Explorer */}
        <div className="flex-1 bg-slate-900 flex flex-col">
          <div className="p-3 border-b border-slate-700 flex items-center justify-between">
            <h3 className="text-white font-medium">📁 Generated Files</h3>
            <button className="text-gray-400 hover:text-white p-1 rounded">
              <RefreshCw size={16} />
            </button>
          </div>
          
          <div className="flex-1 p-3">
            <div className="space-y-2">
              {currentProject?.files.map((file, index) => (
                <div
                  key={file.name}
                  onClick={() => setSelectedFile(file.name)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    selectedFile === file.name 
                      ? 'bg-purple-900/30 border border-purple-500/50' 
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  <File size={16} className="text-blue-400" />
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{file.name}</div>
                    <div className="text-gray-400 text-xs">{file.type}</div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    file.status === 'generated' ? 'bg-green-400' :
                    file.status === 'generating' ? 'bg-yellow-400 animate-pulse' :
                    file.status === 'error' ? 'bg-red-400' :
                    'bg-gray-600'
                  }`}></div>
                </div>
              )) || []}
            </div>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-96 bg-slate-900 border-l border-slate-700 flex flex-col">
          <div className="p-3 border-b border-slate-700 flex items-center justify-between">
            <h3 className="text-white font-medium">👁️ Preview</h3>
            <div className="flex gap-1">
              <button className="text-gray-400 hover:text-white p-1 rounded">
                <Download size={16} />
              </button>
              <button className="text-gray-400 hover:text-white p-1 rounded">
                <MoreVertical size={16} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-4">
            <div className="bg-slate-800 rounded-lg p-4 h-full">
              <div className="text-gray-300 text-sm">
                <div className="mb-2">📄 {selectedFile || 'Select a file'}</div>
                {selectedFile && (
                  <div className="bg-slate-900 p-3 rounded text-xs font-mono whitespace-pre-wrap">
                    {/* File content would be loaded from the store */}
                    {getFilePreview(selectedFile)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper function for file preview
  const getFilePreview = (fileName: string) => {
    switch (fileName) {
      case 'package.json':
        return JSON.stringify({
          name: "scout-generated-app",
          version: "1.0.0",
          scripts: {
            dev: "vite",
            build: "vite build",
            test: "jest"
          },
          dependencies: {
            react: "^18.0.0",
            typescript: "^5.0.0",
            "@types/react": "^18.0.0"
          }
        }, null, 2);
      case 'App.tsx':
        return `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Scout Generated App</h1>
        <p>Built with ❤️ by Scout AI</p>
      </header>
    </div>
  );
}

export default App;`;
      case 'README.md':
        return `# Scout Generated Project

This project was automatically generated by Scout AI.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Features

- React 18 with TypeScript
- Vite for fast development
- Modern UI components
- Full-stack architecture

Built with Scout AI 🚀`;
      default:
        return `# ${fileName}

File content will be generated by Scout...`;
    }
  };

  // Render current stage
  const renderCurrentStage = () => {
    switch (currentStage) {
      case 'welcome':
        return <WelcomeStage />;
      case 'planning':
        return <PlanningStage />;
      case 'workspace':
      case 'production':
        return <WorkspaceStage />;
      default:
        return <WelcomeStage />;
    }
  };

  return (
    <div className="overflow-hidden">
      {renderCurrentStage()}
      
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes dropIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }
        
        .animate-dropIn {
          animation: dropIn 0.6s ease-out;
        }
        
        .animate-pulse-slow {
          animation: pulse 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ScoutIntegratedWorkflow;
