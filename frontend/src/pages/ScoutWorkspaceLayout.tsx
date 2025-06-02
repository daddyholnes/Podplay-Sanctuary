import { useState } from 'react';
import { Download, RefreshCw, CheckCircle, Clock, Zap, Play } from 'lucide-react';

interface ChatMessage {
  type: string;
  content: string;
  timestamp: Date;
}

interface TimelineStep {
  id: number;
  title: string;
  status: string;
  description: string;
}

interface GeneratedFile {
  id: number;
  name: string;
  type: string;
  icon: string;
  status: string;
}

const ScoutWorkflow = () => {
  const [currentStage, setCurrentStage] = useState('welcome'); // welcome, planning, workspace, production
  const [leftPanelWidth, setLeftPanelWidth] = useState(320);
  const [selectedFile, setSelectedFile] = useState('env.txt');
  const [timelineSteps, setTimelineSteps] = useState<TimelineStep[]>([]);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [userInput, setUserInput] = useState('');

  // Animation states
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);

  // Welcome stage - Start planning
  const handleStartPlanning = (prompt: string) => {
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
  const transitionToWorkspace = () => {
    setIsTransitioning(true);
    setCurrentStage('transitioning');
    
    // Multi-stage animation
    const animationSequence = [
      () => setAnimationStep(1), // Fade out welcome
      () => setAnimationStep(2), // Slide in timeline
      () => setAnimationStep(3), // Materialize files panel
      () => setAnimationStep(4), // Emerge preview panel
      () => setAnimationStep(5), // Reposition chat
      () => {
        setCurrentStage('workspace');
        setIsTransitioning(false);
        startProduction();
      }
    ];

    animationSequence.forEach((step, index) => {
      setTimeout(step, index * 500);
    });
  };

  // Start production phase
  const startProduction = () => {
    setCurrentStage('production');
    
    // Simulate file generation
    const files = [
      { name: 'package.json', type: 'config', icon: '📦', status: 'generating' },
      { name: 'App.tsx', type: 'component', icon: '⚛️', status: 'pending' },
      { name: 'main.py', type: 'backend', icon: '🐍', status: 'pending' },
      { name: '.env', type: 'config', icon: '🔧', status: 'pending' },
      { name: 'README.md', type: 'docs', icon: '📖', status: 'pending' }
    ];

    // Animate files appearing
    files.forEach((file, index) => {
      setTimeout(() => {
        setGeneratedFiles(prev => [...prev, { ...file, id: Date.now() + index }]);
        
        // Update timeline
        setTimelineSteps(prev => prev.map((step, i) => 
          i === Math.floor(index / 2) ? { ...step, status: 'completed' } : step
        ));
        
        // Add chat update
        setChatMessages(prev => [...prev, {
          type: 'agent',
          content: `✅ Generated ${file.name} - ${file.type} ready!`,
          timestamp: new Date()
        }]);
      }, index * 1500);
    });
  };

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
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Project Timeline</h3>
              <div className="space-y-3 mb-6">
                {timelineSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg animate-slideIn"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.status === 'completed' ? 'bg-green-500' :
                      step.status === 'planning' ? 'bg-yellow-500' : 'bg-slate-600'
                    }`}>
                      {step.status === 'completed' ? <CheckCircle size={16} /> : <Clock size={16} />}
                    </div>
                    <div>
                      <div className="text-white font-medium">{step.title}</div>
                      <div className="text-purple-300 text-sm">{step.description}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={transitionToWorkspace}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
              >
                <Zap size={20} className="inline mr-2" />
                Start Building! 🚀
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Workspace Component (your existing design enhanced)
  const WorkspaceStage = () => (
    <div className="h-screen flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Left Panel - Timeline + Chat */}
      <div 
        className={`border-r border-purple-500/30 transition-all duration-500 ${
          isTransitioning ? 'transform -translate-x-full opacity-0' : 'transform translate-x-0 opacity-100'
        }`}
        style={{ width: leftPanelWidth }}
      >
        <div className="h-full flex flex-col bg-slate-900/90 backdrop-blur-sm">
          {/* Timeline Section */}
          <div className="h-1/2 border-b border-purple-500/30">
            <div className="p-4 border-b border-purple-500/30">
              <h3 className="text-lg font-semibold text-purple-100">Timeline</h3>
            </div>
            <div className="flex-1 overflow-auto p-2">
              {timelineSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-3 mb-2 rounded-lg transition-all cursor-pointer ${
                    step.status === 'completed' ? 'bg-green-600/30 border-green-500/50' :
                    step.status === 'planning' ? 'bg-yellow-600/30 border-yellow-500/50' :
                    'bg-slate-700/50 border-slate-600/50'
                  } border animate-slideIn`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${
                      step.status === 'completed' ? 'bg-green-500' :
                      step.status === 'planning' ? 'bg-yellow-500' : 'bg-slate-500'
                    }`} />
                    <span className="text-sm font-medium">{step.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Section */}
          <div className="h-1/2 flex flex-col">
            <div className="p-4 border-b border-purple-500/30">
              <h3 className="text-lg font-semibold text-purple-100">💝 Mama Bear</h3>
            </div>
            <div className="flex-1 overflow-auto p-2 space-y-2">
              {chatMessages.slice(-5).map((msg, index) => (
                <div
                  key={index}
                  className={`p-2 rounded text-xs ${
                    msg.type === 'user' ? 'bg-purple-600/30 ml-4' : 'bg-slate-700/50 mr-4'
                  } animate-slideIn`}
                >
                  {msg.content}
                </div>
              ))}
            </div>
            <div className="p-2 border-t border-purple-500/30">
              <input
                type="text"
                placeholder="Chat with Mama Bear..."
                className="w-full bg-slate-700/50 border border-purple-500/30 rounded px-2 py-1 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Resize Handle */}
        <div 
          className="absolute top-0 right-0 w-1 h-full cursor-ew-resize bg-purple-500/20 hover:bg-purple-500/40 transition-colors"
          onMouseDown={(e) => {
            e.preventDefault();
            const startX = e.clientX;
            const startWidth = leftPanelWidth;
            
            const handleMouseMove = (e: MouseEvent) => {
              const newWidth = Math.max(200, Math.min(500, startWidth + (e.clientX - startX)));
              setLeftPanelWidth(newWidth);
            };
            
            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        />
      </div>

      {/* Center Panel - Files */}
      <div className={`w-80 border-r border-purple-500/30 transition-all duration-700 ${
        isTransitioning && animationStep < 3 ? 'transform scale-0 opacity-0' : 'transform scale-100 opacity-100'
      }`}>
        <div className="h-full flex flex-col bg-slate-800/90 backdrop-blur-sm">
          <div className="p-4 border-b border-purple-500/30">
            <h3 className="text-lg font-semibold text-purple-100">📁 Files</h3>
          </div>
          <div className="flex-1 overflow-auto p-2">
            {generatedFiles.map((file, index) => (
              <div
                key={file.id}
                onClick={() => setSelectedFile(file.name)}
                className={`flex items-center gap-2 p-2 mb-1 rounded cursor-pointer transition-all animate-dropIn ${
                  selectedFile === file.name 
                    ? 'bg-purple-600/30 text-purple-100' 
                    : 'text-purple-300 hover:bg-purple-800/20'
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <span className="text-xs">{file.icon}</span>
                <span className="text-sm font-mono truncate">{file.name}</span>
                {file.status === 'generating' && (
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className={`flex-1 transition-all duration-1000 ${
        isTransitioning && animationStep < 4 ? 'transform translate-x-full opacity-0' : 'transform translate-x-0 opacity-100'
      }`}>
        <div className="h-full flex flex-col bg-slate-700/90 backdrop-blur-sm">
          <div className="p-4 border-b border-purple-500/30">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-purple-100">🔍 Preview</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm">
                  <RefreshCw size={14} className="inline mr-1" />
                  Refresh
                </button>
                <button className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm">
                  <Download size={14} className="inline mr-1" />
                  Download
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-auto">
            {selectedFile ? (
              <div className="bg-slate-900/50 rounded-lg p-4 h-full">
                <pre className="text-purple-100 text-sm whitespace-pre-wrap">
                  {`// ${selectedFile} - Generated by Scout.new 🚀\n\n// This file was autonomously created by Mama Bear\n// Full-stack development magic in progress...\n\nconsole.log("Hello from ${selectedFile}!");`}
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-purple-300">
                  <div className="text-6xl mb-4">🤖</div>
                  <p>Select a file to preview</p>
                </div>
              </div>
            )}
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
    </div>
  );
};

export default ScoutWorkflow;