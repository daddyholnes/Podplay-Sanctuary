import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronRight, File, Folder, Download, RefreshCw, X, Minimize2, Maximize2, MoreVertical, Play, CheckCircle, Clock, Zap } from 'lucide-react';

const ScoutWorkflow = () => {
  const [currentStage, setCurrentStage] = useState('welcome'); // welcome, planning, workspace, production
  const [leftPanelWidth, setLeftPanelWidth] = useState(320);
  const [selectedFile, setSelectedFile] = useState('env.txt');
  const [timelineSteps, setTimelineSteps] = useState([]);
  const [generatedFiles, setGeneratedFiles] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [userInput, setUserInput] = useState('');

  // Animation states
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);

  // Welcome stage - Start planning
  const handleStartPlanning = (prompt) => {
    setCurrentStage('planning');
    setUserInput(prompt);
    
    // Simulate agent planning
    setChatMessages([
      { type: 'user', content: prompt, timestamp: new Date() },
      { type: 'agent', content: "Perfect! Let me break this down and create a comprehensive plan for you... 🎯", timestamp: new Date() }
    ]);
    
    setIsAgentThinking(true);
    
    // Simulate planning process
    setTimeout(() => {
      const planSteps = [
        { id: 1, title: 'Environment Setup', status: 'planning', description: 'Configure APIs and dependencies' },
        { id: 2, title: 'Frontend Architecture', status: 'pending', description: 'React + TypeScript structure' },
        { id: 3, title: 'Backend Services', status: 'pending', description: 'FastAPI + Multi-LLM integration' },
        { id: 4, title: 'UI Components', status: 'pending', description: 'Chat interface and file management' },
        { id: 5, title: 'Deployment', status: 'pending', description: 'Production build and hosting' }
      ];
      
      setTimelineSteps(planSteps);
      setChatMessages(prev => [...prev, {
        type: 'agent',
        content: "Great! I've created a 5-stage plan. Ready to start building? This will be amazing! 🚀",
        timestamp: new Date()
      }]);
      setIsAgentThinking(false);
    }, 3000);
  };

  // Transition to workspace
  const handleStartWorkspace = () => {
    setCurrentStage('transitioning');
    setIsTransitioning(true);
    setAnimationStep(0);
    
    // Simulate file generation
    const files = [
      { name: 'package.json', type: 'config', status: 'generating' },
      { name: 'App.tsx', type: 'react', status: 'pending' },
      { name: 'server.py', type: 'python', status: 'pending' },
      { name: 'docker-compose.yml', type: 'docker', status: 'pending' }
    ];
    
    setGeneratedFiles(files);
    
    // Animate file generation
    files.forEach((file, index) => {
      setTimeout(() => {
        setGeneratedFiles(prev => prev.map(f => 
          f.name === file.name ? { ...f, status: 'generated' } : f
        ));
        
        setTimelineSteps(prev => prev.map((step, i) => 
          i === index + 1 ? { ...step, status: 'active' } : step
        ));
        
        setChatMessages(prev => [...prev, {
          type: 'agent',
          content: `✅ Generated ${file.name} - ${file.type} ready!`,
          timestamp: new Date()
        }]);
      }, index * 1500);
    });
    
    // Transition to workspace after all files generated
    setTimeout(() => {
      setCurrentStage('workspace');
      setIsTransitioning(false);
    }, files.length * 1500 + 1000);
  };

  // Resizing functionality
  const startResize = useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftPanelWidth;

    const handleMouseMove = (e) => {
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
              disabled={!userInput}
              className="absolute right-2 top-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all"
            >
              <Play size={20} />
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
          
          <div className="space-y-4 mb-8">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-slideIn`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className={`max-w-md p-4 rounded-2xl ${
                  msg.type === 'user' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-slate-700 text-purple-100'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isAgentThinking && (
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

          {timelineSteps.length > 0 && (
            <div className="space-y-3 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">📋 Project Timeline</h3>
              {timelineSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-4 p-3 rounded-lg border transition-all animate-dropIn ${
                    step.status === 'planning' ? 'bg-yellow-900/30 border-yellow-500/30' :
                    step.status === 'active' ? 'bg-green-900/30 border-green-500/30' :
                    'bg-slate-800/50 border-slate-600/30'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step.status === 'planning' ? 'bg-yellow-500 text-black' :
                    step.status === 'active' ? 'bg-green-500 text-white' :
                    'bg-slate-600 text-gray-300'
                  }`}>
                    {step.status === 'planning' ? <Clock size={16} /> :
                     step.status === 'active' ? <CheckCircle size={16} /> :
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

          {timelineSteps.length > 0 && !isAgentThinking && (
            <div className="text-center">
              <button
                onClick={handleStartWorkspace}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
              >
                <Zap className="inline mr-2" size={20} />
                Start Building! 🚀
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Workspace Stage Component
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
          <span className="text-green-400 text-sm">● Building...</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="text-gray-400 hover:text-white p-2 rounded">
            <Minimize2 size={16} />
          </button>
          <button className="text-gray-400 hover:text-white p-2 rounded">
            <Maximize2 size={16} />
          </button>
          <button className="text-gray-400 hover:text-white p-2 rounded">
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
              {timelineSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-2 rounded text-sm ${
                    step.status === 'active' ? 'bg-green-900/30 text-green-300' :
                    step.status === 'planning' ? 'bg-yellow-900/30 text-yellow-300' :
                    'text-gray-400'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    step.status === 'active' ? 'bg-green-400' :
                    step.status === 'planning' ? 'bg-yellow-400' :
                    'bg-gray-600'
                  }`}></div>
                  {step.title}
                </div>
              ))}
            </div>
          </div>

          {/* Chat Section */}
          <div className="flex-1 flex flex-col">
            <div className="p-3 border-b border-slate-700">
              <h3 className="text-white font-medium">💬 Chat with Mama Bear</h3>
            </div>
            
            <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-64">
              {chatMessages.slice(-5).map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs p-2 rounded-lg text-sm ${
                    msg.type === 'user' 
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
                placeholder="Ask Mama Bear..."
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
              {generatedFiles.map((file, index) => (
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
                    'bg-gray-600'
                  }`}></div>
                </div>
              ))}
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
                <div className="mb-2">📄 {selectedFile}</div>
                <div className="bg-slate-900 p-3 rounded text-xs font-mono">
                  {selectedFile === 'package.json' && `{
  "name": "scout-generated-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.0.0",
    "typescript": "^5.0.0"
  }
}`}
                  {selectedFile === 'App.tsx' && `import React from 'react';

function App() {
  return (
    <div className="App">
      <h1>Scout Generated App</h1>
      <p>Built with ❤️ by Scout</p>
    </div>
  );
}

export default App;`}
                  {selectedFile === 'env.txt' && `# Environment Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENV=development
REACT_APP_SCOUT_VERSION=1.0.0`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render current stage
  const renderCurrentStage = () => {
    switch (currentStage) {
      case 'welcome':
        return <WelcomeStage />;
      case 'planning':
        return <PlanningStage />;
      case 'transitioning':
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

export default ScoutWorkflow;
