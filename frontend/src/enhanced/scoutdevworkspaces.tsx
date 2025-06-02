import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Plus, Coffee, Heart, Settings, Sun, Moon, Minimize2, Maximize2, X, 
  Terminal, Folder, Code, Play, Save, RefreshCw, MessageCircle, 
  Cloud, Server, Box, Zap, Eye, Calendar, Clock, Sparkles, Shield,
  Paperclip, Image, Video, Mic, MicOff, FileText, Camera, Upload,
  Github, GitBranch, GitCommit, GitPullRequest, Link, Copy
} from 'lucide-react';

const DevWorkspaces = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [showMamaBear, setShowMamaBear] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [draggedWindow, setDraggedWindow] = useState(null);
  
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingType, setRecordingType] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubUser, setGithubUser] = useState(null);
  const [githubRepos, setGithubRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const audioRef = useRef(null);

  const dailyBriefing = {
    time: new Date().toLocaleTimeString(),
    newTools: ['Docker Desktop MCP', 'VS Code Remote MCP'],
    modelUpdates: ['Gemini 2.5 Flash available', 'Claude 3.5 Sonnet updated'],
    priorities: ['Project Podplay Build', 'Scout Agent refinement'],
    weather: '☀️ Clear focus today'
  };

  const environmentTemplates = [
    {
      id: 'nixos',
      name: 'NixOS Development',
      icon: '❄️',
      color: 'from-blue-500 to-cyan-500',
      description: 'Reproducible development environment',
      tools: ['Nix', 'Python', 'Node.js', 'VS Code'],
      spinUpTime: '~2 minutes'
    },
    {
      id: 'codespace',
      name: 'GitHub Codespace',
      icon: '🌐',
      color: 'from-gray-600 to-gray-800',
      description: 'Cloud-based VS Code environment',
      tools: ['GitHub Integration', 'VS Code', 'Docker'],
      spinUpTime: '~1 minute'
    },
    {
      id: 'oracle-vm',
      name: 'Oracle Cloud VM',
      icon: '☁️',
      color: 'from-orange-500 to-red-500',
      description: 'Full cloud virtual machine',
      tools: ['Ubuntu', 'Docker', 'Full Root Access'],
      spinUpTime: '~3 minutes'
    },
    {
      id: 'local-docker',
      name: 'Local Docker',
      icon: '🐳',
      color: 'from-blue-600 to-purple-600',
      description: 'Containerized local environment',
      tools: ['Docker', 'Custom Images', 'Fast Setup'],
      spinUpTime: '~30 seconds'
    }
  ];

  const theme = {
    bg: isDarkMode ? 'bg-slate-900' : 'bg-gray-50',
    cardBg: isDarkMode ? 'bg-slate-800/80' : 'bg-white/80',
    border: isDarkMode ? 'border-slate-700/50' : 'border-gray-200/50',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-slate-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-slate-400' : 'text-gray-500',
    input: isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white' : 'bg-white/50 border-gray-300/50 text-gray-900',
    button: isDarkMode ? 'bg-slate-700/50 hover:bg-slate-600/50' : 'bg-gray-100/50 hover:bg-gray-200/50',
    accent: 'from-purple-500 to-pink-500'
  };

  useEffect(() => {
    setChatMessages([
      {
        id: 1,
        sender: 'mama-bear',
        text: `Good ${new Date().getHours() < 12 ? 'morning' : 'afternoon'}, Nathan! ☕💝 I've prepared your sanctuary. Here's today's briefing:`,
        timestamp: new Date(),
        type: 'greeting'
      },
      {
        id: 2,
        sender: 'mama-bear',
        text: `🔧 **New Tools**: ${dailyBriefing.newTools.join(', ')}\n🤖 **Model Updates**: ${dailyBriefing.modelUpdates.join(', ')}\n📋 **Today's Focus**: ${dailyBriefing.priorities.join(', ')}\n\n${dailyBriefing.weather} Ready to create something beautiful together?`,
        timestamp: new Date(),
        type: 'briefing'
      }
    ]);
  }, []);

  const handleFileUpload = (files, type) => {
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach(file => {
      setUploadedFiles(prev => [...prev, {
        id: Date.now() + Math.random(),
        file,
        type,
        name: file.name,
        size: file.size,
        preview: type === 'image' ? URL.createObjectURL(file) : null
      }]);
    });

    setChatMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'mama-bear',
      text: `📎 I see you've uploaded ${files.length} file(s)! I'll help you work with ${files.length === 1 ? 'it' : 'them'}. What would you like to do? 💝`,
      timestamp: new Date(),
      type: 'file-acknowledgment'
    }]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files, 'file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    for (let item of items) {
      if (item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();
        if (blob) {
          handleFileUpload([blob], 'image');
        }
      }
    }
  };

  const startRecording = async (type) => {
    try {
      const constraints = type === 'audio' ? { audio: true } : { audio: true, video: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      
      setMediaRecorder(recorder);
      setRecordingType(type);
      setIsRecording(true);
      setRecordedChunks([]);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { 
          type: type === 'audio' ? 'audio/webm' : 'video/webm' 
        });
        const file = new File([blob], `recorded-${type}-${Date.now()}.webm`, { 
          type: blob.type 
        });
        handleFileUpload([file], type);
        
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        setMediaRecorder(null);
        setRecordingType(null);
        setRecordedChunks([]);
      };

      recorder.start();

      setChatMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'mama-bear',
        text: `🎤 I'm listening... Recording ${type} for you. Take your time! 💝`,
        timestamp: new Date(),
        type: 'recording-start'
      }]);

    } catch (error) {
      console.error('Error starting recording:', error);
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'mama-bear',
        text: `❌ I couldn't start ${type} recording. Please check your permissions and try again. I'm here to help! 💝`,
        timestamp: new Date(),
        type: 'error'
      }]);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  };

  const connectGitHub = async () => {
    setChatMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'mama-bear',
      text: `🔐 I'll connect you to GitHub securely... This would normally open GitHub's authorization page. 💝`,
      timestamp: new Date(),
      type: 'github-auth'
    }]);

    setTimeout(() => {
      setGithubConnected(true);
      setGithubUser({
        login: 'nathan-dev',
        name: 'Nathan',
        avatar_url: 'https://github.com/github.png'
      });
      setGithubRepos([
        { id: 1, name: 'podplay-studio', private: true, description: 'Your amazing Podplay Build project' },
        { id: 2, name: 'scout-agent', private: false, description: 'Scout autonomous agent' },
        { id: 3, name: 'mama-bear-ai', private: true, description: 'Mama Bear development' }
      ]);

      setChatMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'mama-bear',
        text: `✅ Successfully connected to GitHub! I can see your repos and I'm ready to help with version control. Welcome back! 🚀💝`,
        timestamp: new Date(),
        type: 'github-success'
      }]);
    }, 2000);
  };

  const disconnectGitHub = () => {
    setGithubConnected(false);
    setGithubUser(null);
    setGithubRepos([]);
    setSelectedRepo(null);
    
    setChatMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'mama-bear',
      text: `👋 Disconnected from GitHub safely. Your sanctuary is always secure with me! 💝`,
      timestamp: new Date(),
      type: 'github-disconnect'
    }]);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const createWorkspace = async (template, customPrompt = null) => {
    setIsCreatingWorkspace(true);
    
    const newWorkspace = {
      id: Date.now(),
      name: customPrompt ? `Custom: ${customPrompt.slice(0, 30)}...` : template.name,
      template: template.id,
      icon: template.icon,
      color: template.color,
      status: 'spinning-up',
      position: { x: 100 + (workspaces.length * 50), y: 100 + (workspaces.length * 50) },
      size: { width: 800, height: 600 },
      isMinimized: false,
      tools: template.tools,
      chatHistory: [],
      files: [],
      terminalHistory: [],
      url: null,
      createdAt: new Date()
    };

    setWorkspaces(prev => [...prev, newWorkspace]);
    setActiveWorkspace(newWorkspace.id);

    setChatMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'mama-bear',
      text: `🎯 Spinning up your ${template.name} environment... This usually takes ${template.spinUpTime}. I'll let you know when it's ready! 💫`,
      timestamp: new Date(),
      type: 'status'
    }]);

    setTimeout(() => {
      setWorkspaces(prev => prev.map(ws => 
        ws.id === newWorkspace.id 
          ? { ...ws, status: 'ready', url: `https://vscode-${template.id}-${newWorkspace.id}.example.com` }
          : ws
      ));
      
      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'mama-bear',
        text: `✅ Your ${template.name} environment is ready! Everything is configured and waiting for you. Happy coding! 🚀`,
        timestamp: new Date(),
        type: 'success'
      }]);
      
      setIsCreatingWorkspace(false);
    }, 3000);
  };

  const handleWindowDrag = useCallback((workspaceId, newPosition) => {
    setWorkspaces(prev => prev.map(ws => 
      ws.id === workspaceId ? { ...ws, position: newPosition } : ws
    ));
  }, []);

  const handleWindowResize = useCallback((workspaceId, newSize) => {
    setWorkspaces(prev => prev.map(ws => 
      ws.id === workspaceId ? { ...ws, size: newSize } : ws
    ));
  }, []);

  const sendMessage = () => {
    if (!newMessage.trim() && uploadedFiles.length === 0) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: newMessage,
      files: [...uploadedFiles],
      timestamp: new Date(),
      type: 'message'
    };

    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setUploadedFiles([]);

    const lowerMessage = newMessage.toLowerCase();
    if (lowerMessage.includes('spin up') || lowerMessage.includes('create') || lowerMessage.includes('new environment')) {
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          id: Date.now(),
          sender: 'mama-bear',
          text: `🎯 I'll create that environment for you right away! Let me pick the best template...`,
          timestamp: new Date(),
          type: 'response'
        }]);

        const template = lowerMessage.includes('nixos') ? environmentTemplates[0] :
                         lowerMessage.includes('codespace') ? environmentTemplates[1] :
                         lowerMessage.includes('oracle') || lowerMessage.includes('cloud') ? environmentTemplates[2] :
                         environmentTemplates[3];

        setTimeout(() => createWorkspace(template, newMessage), 1000);
      }, 500);
    } else if (lowerMessage.includes('github') || lowerMessage.includes('git')) {
      setTimeout(() => {
        if (!githubConnected) {
          setChatMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'mama-bear',
            text: `🐙 I can help you with GitHub! Would you like me to connect your account so we can work with repositories together? 💝`,
            timestamp: new Date(),
            type: 'github-offer'
          }]);
        } else {
          setChatMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'mama-bear',
            text: `🚀 I see you're connected to GitHub! I can help you clone repos, create branches, or manage your code. What would you like to do? 💝`,
            timestamp: new Date(),
            type: 'github-help'
          }]);
        }
      }, 500);
    } else {
      setTimeout(() => {
        const responses = [
          `I'm here to help! ${userMessage.files.length > 0 ? `I can see you've shared ${userMessage.files.length} file(s) with me. ` : ''}What would you like to work on today? 💝`,
          `That sounds interesting! ${userMessage.files.length > 0 ? `Those files look helpful. ` : ''}Should I spin up an environment for that? 🎯`,
          `I've got your back! ${userMessage.files.length > 0 ? `I'll analyze those files for you. ` : ''}Let me know if you need any tools or environments set up. 🛠️`,
          `Perfect! ${userMessage.files.length > 0 ? `I can work with those files. ` : ''}I'm ready to assist with whatever you need. Your sanctuary is always here. 🏠`
        ];
        
        setChatMessages(prev => [...prev, {
          id: Date.now(),
          sender: 'mama-bear',
          text: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date(),
          type: 'response'
        }]);
      }, 800);
    }
  };

  const WorkspaceWindow = ({ workspace }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const dragRef = useRef(null);

    if (workspace.isMinimized) return null;

    return (
      <div
        ref={dragRef}
        className={`absolute ${theme.cardBg} backdrop-blur-md rounded-2xl shadow-2xl border ${theme.border} overflow-hidden transition-all duration-200 ${
          isDragging ? 'shadow-purple-500/20 scale-105' : ''
        }`}
        style={{
          left: workspace.position.x,
          top: workspace.position.y,
          width: workspace.size.width,
          height: workspace.size.height,
          zIndex: activeWorkspace === workspace.id ? 1000 : 999
        }}
        onClick={() => setActiveWorkspace(workspace.id)}
      >
        <div 
          className={`flex items-center justify-between p-4 border-b ${theme.border} bg-gradient-to-r ${workspace.color} bg-opacity-10 cursor-move`}
          onMouseDown={(e) => {
            setIsDragging(true);
            const startX = e.clientX - workspace.position.x;
            const startY = e.clientY - workspace.position.y;

            const handleMouseMove = (e) => {
              handleWindowDrag(workspace.id, {
                x: e.clientX - startX,
                y: e.clientY - startY
              });
            };

            const handleMouseUp = () => {
              setIsDragging(false);
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${workspace.color} flex items-center justify-center text-lg shadow-lg`}>
              {workspace.icon}
            </div>
            <div>
              <h3 className={`font-semibold ${theme.text} text-sm`}>{workspace.name}</h3>
              <div className="flex items-center gap-2 text-xs">
                <span className={`px-2 py-0.5 rounded-full ${
                  workspace.status === 'ready' ? 'bg-green-500/20 text-green-400' :
                  workspace.status === 'spinning-up' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {workspace.status === 'ready' ? '● Ready' : 
                   workspace.status === 'spinning-up' ? '◐ Starting...' : '○ Stopped'}
                </span>
                <span className={theme.textTertiary}>
                  {workspace.tools.slice(0, 2).join(', ')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className={`p-2 rounded-lg ${theme.button} transition-colors`}>
              <Save size={14} />
            </button>
            <button className={`p-2 rounded-lg ${theme.button} transition-colors`}>
              <RefreshCw size={14} />
            </button>
            <button 
              onClick={() => setWorkspaces(prev => prev.map(ws => 
                ws.id === workspace.id ? { ...ws, isMinimized: true } : ws
              ))}
              className={`p-2 rounded-lg ${theme.button} transition-colors`}
            >
              <Minimize2 size={14} />
            </button>
            <button 
              onClick={() => setWorkspaces(prev => prev.filter(ws => ws.id !== workspace.id))}
              className={`p-2 rounded-lg ${theme.button} transition-colors text-red-400 hover:text-red-300`}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="h-full pb-16">
          {workspace.status === 'ready' && workspace.url ? (
            <iframe
              src={workspace.url}
              className="w-full h-full border-0"
              title={workspace.name}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
          ) : workspace.status === 'spinning-up' ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className={`text-xl font-semibold ${theme.text} mb-2`}>Setting up your environment...</h3>
                <p className={theme.textSecondary}>Installing {workspace.tools.join(', ')}</p>
                <div className="mt-4 flex justify-center">
                  <div className="bg-purple-500/20 rounded-lg p-3">
                    <p className="text-purple-400 text-sm">✨ Mama Bear is preparing everything perfectly for you</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className={`text-6xl mb-4`}>{workspace.icon}</div>
                <h3 className={`text-xl font-semibold ${theme.text} mb-2`}>Environment Stopped</h3>
                <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white hover:scale-105 transition-transform">
                  <Play size={16} className="inline mr-2" />
                  Start Environment
                </button>
              </div>
            </div>
          )}
        </div>

        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-50 hover:opacity-100"
          onMouseDown={(e) => {
            setIsResizing(true);
            const startX = e.clientX;
            const startY = e.clientY;
            const startWidth = workspace.size.width;
            const startHeight = workspace.size.height;

            const handleMouseMove = (e) => {
              handleWindowResize(workspace.id, {
                width: Math.max(400, startWidth + (e.clientX - startX)),
                height: Math.max(300, startHeight + (e.clientY - startY))
              });
            };

            const handleMouseUp = () => {
              setIsResizing(false);
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        >
          <div className="w-full h-full bg-purple-500/30" style={{ clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)' }} />
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${theme.bg} transition-colors duration-300 overflow-hidden`}>
      <div className="flex h-screen">
        <div className={`w-96 ${theme.cardBg} backdrop-blur-md border-r ${theme.border} flex flex-col transition-all duration-300 ${
          showMamaBear ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-6 border-b border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg">
                  💝
                </div>
                <div>
                  <h2 className={`text-lg font-bold ${theme.text}`}>Mama Bear</h2>
                  <p className={`text-sm ${theme.textSecondary}`}>Your caring dev partner</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-2 rounded-lg ${theme.button} transition-colors`}
                >
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button
                  onClick={() => setShowMamaBear(false)}
                  className={`p-2 rounded-lg ${theme.button} transition-colors`}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            <div className="bg-purple-500/10 rounded-xl p-3 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Heart size={14} className="text-purple-400" />
                <span className={`text-sm font-medium ${theme.text}`}>Your Sanctuary Status</span>
              </div>
              <div className="text-xs space-y-1">
                <div className={theme.textSecondary}>🏠 {workspaces.length} environments ready</div>
                <div className={theme.textSecondary}>☕ Focus mode: {dailyBriefing.weather}</div>
                <div className={theme.textSecondary}>⏰ Last update: {dailyBriefing.time}</div>
              </div>
            </div>

            <div className="bg-slate-500/10 rounded-xl p-3 border border-slate-500/20 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Github size={16} className={githubConnected ? 'text-green-400' : theme.textTertiary} />
                  <span className={`text-sm font-medium ${theme.text}`}>
                    {githubConnected ? `Connected as ${githubUser?.name}` : 'GitHub Integration'}
                  </span>
                </div>
                {githubConnected ? (
                  <button
                    onClick={disconnectGitHub}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={connectGitHub}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Connect
                  </button>
                )}
              </div>
              {githubConnected && (
                <div className="mt-2 text-xs space-y-1">
                  <div className={theme.textSecondary}>📁 {githubRepos.length} repositories</div>
                  {selectedRepo && (
                    <div className={theme.textSecondary}>🌟 Working on: {selectedRepo.name}</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-4">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-lg ${
                  message.sender === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}>
                  {message.sender === 'user' ? '👤' : '💝'}
                </div>
                
                <div className={`flex-1 max-w-xs ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-3 rounded-2xl ${theme.cardBg} backdrop-blur-md border ${theme.border} shadow-lg`}>
                    {message.files && message.files.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {message.files.map(file => (
                          <div key={file.id} className="flex items-center gap-2 p-2 bg-purple-500/10 rounded-lg">
                            {file.preview ? (
                              <img src={file.preview} alt={file.name} className="w-8 h-8 rounded object-cover" />
                            ) : file.type === 'audio' ? (
                              <div className="w-8 h-8 bg-green-500/20 rounded flex items-center justify-center">
                                <Mic size={14} className="text-green-400" />
                              </div>
                            ) : file.type === 'video' ? (
                              <div className="w-8 h-8 bg-red-500/20 rounded flex items-center justify-center">
                                <Video size={14} className="text-red-400" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center">
                                <FileText size={14} className="text-blue-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-purple-300 truncate">{file.name}</p>
                              <p className="text-xs text-purple-400">{(file.size / 1024).toFixed(1)}KB</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {message.text && (
                      <div className={`${theme.text} text-sm leading-relaxed whitespace-pre-wrap`}>
                        {message.text}
                      </div>
                    )}
                    
                    <div className={`text-xs ${theme.textTertiary} mt-2`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-purple-500/20">
            {uploadedFiles.length > 0 && (
              <div className="mb-4 p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-purple-300 font-medium">📎 Ready to send:</span>
                  <button
                    onClick={() => setUploadedFiles([])}
                    className="text-xs text-purple-400 hover:text-purple-300"
                  >
                    Clear all
                  </button>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {uploadedFiles.map(file => (
                    <div key={file.id} className="flex items-center gap-2 p-2 bg-purple-500/20 rounded-lg">
                      {file.preview ? (
                        <img src={file.preview} alt={file.name} className="w-8 h-8 rounded object-cover" />
                      ) : file.type === 'audio' ? (
                        <div className="w-8 h-8 bg-green-500/20 rounded flex items-center justify-center">
                          <Mic size={14} className="text-green-400" />
                        </div>
                      ) : file.type === 'video' ? (
                        <div className="w-8 h-8 bg-red-500/20 rounded flex items-center justify-center">
                          <Video size={14} className="text-red-400" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center">
                          <FileText size={14} className="text-blue-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-purple-200 truncate">{file.name}</p>
                        <p className="text-xs text-purple-400">{(file.size / 1024).toFixed(1)}KB</p>
                      </div>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="text-purple-400 hover:text-purple-300 p-1"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isRecording && (
              <div className="mb-4 p-3 bg-red-500/10 rounded-xl border border-red-500/20 animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                  <span className="text-sm text-red-300 font-medium">
                    🎤 Recording {recordingType}... Click to stop
                  </span>
                  <button
                    onClick={stopRecording}
                    className="ml-auto px-3 py-1 bg-red-500/20 text-red-300 rounded-lg text-xs hover:bg-red-500/30 transition-colors"
                  >
                    Stop Recording
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-2 rounded-lg ${theme.button} transition-colors hover:scale-105`}
                  title="Upload files"
                >
                  <Paperclip size={16} />
                </button>
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className={`p-2 rounded-lg ${theme.button} transition-colors hover:scale-105`}
                  title="Upload images"
                >
                  <Image size={16} />
                </button>
                <button
                  onClick={() => videoInputRef.current?.click()}
                  className={`p-2 rounded-lg ${theme.button} transition-colors hover:scale-105`}
                  title="Upload video"
                >
                  <Video size={16} />
                </button>

                <button
                  onClick={() => isRecording ? stopRecording() : startRecording('audio')}
                  className={`p-2 rounded-lg transition-colors hover:scale-105 ${
                    isRecording && recordingType === 'audio' 
                      ? 'bg-red-500/20 text-red-400' 
                      : theme.button
                  }`}
                  title={isRecording && recordingType === 'audio' ? "Stop audio recording" : "Record audio"}
                >
                  {isRecording && recordingType === 'audio' ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
                <button
                  onClick={() => isRecording ? stopRecording() : startRecording('video')}
                  className={`p-2 rounded-lg transition-colors hover:scale-105 ${
                    isRecording && recordingType === 'video' 
                      ? 'bg-red-500/20 text-red-400' 
                      : theme.button
                  }`}
                  title={isRecording && recordingType === 'video' ? "Stop video recording" : "Record video"}
                >
                  <Camera size={16} />
                </button>

                {githubConnected && (
                  <>
                    <div className="w-px h-6 bg-purple-500/30"></div>
                    <button
                      className={`p-2 rounded-lg ${theme.button} transition-colors hover:scale-105`}
                      title="GitHub actions"
                    >
                      <Github size={16} />
                    </button>
                    <button
                      className={`p-2 rounded-lg ${theme.button} transition-colors hover:scale-105`}
                      title="Create branch"
                    >
                      <GitBranch size={16} />
                    </button>
                    <button
                      className={`p-2 rounded-lg ${theme.button} transition-colors hover:scale-105`}
                      title="Commit changes"
                    >
                      <GitCommit size={16} />
                    </button>
                  </>
                )}

                <div className="flex-1 flex justify-end">
                  {uploadedFiles.length > 0 && (
                    <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full">
                      {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} ready
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Talk to Mama Bear... (You can also drag files, paste images, or record audio/video)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onPaste={handlePaste}
                  className={`flex-1 px-4 py-3 pr-12 rounded-xl border ${theme.input} focus:border-purple-400 focus:outline-none transition-colors backdrop-blur-sm resize-none`}
                  rows={1}
                  style={{ minHeight: '50px', maxHeight: '120px' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() && uploadedFiles.length === 0}
                  className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white disabled:opacity-50 transition-all hover:scale-105 flex items-center justify-center"
                >
                  💝
                </button>
              </div>

              <div className={`text-xs ${theme.textTertiary} text-center`}>
                💡 Try: "Spin up a NixOS environment" • Drop files anywhere • Paste images • Record voice notes
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              hidden
              multiple
              onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'file')}
            />
            <input
              ref={imageInputRef}
              type="file"
              hidden
              accept="image/*"
              multiple
              onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'image')}
            />
            <input
              ref={videoInputRef}
              type="file"
              hidden
              accept="video/*"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'video')}
            />
          </div>
        </div>

        <div className="flex-1 relative">
          <div className={`${theme.cardBg} backdrop-blur-md border-b ${theme.border} p-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {!showMamaBear && (
                  <button
                    onClick={() => setShowMamaBear(true)}
                    className={`p-2 rounded-lg ${theme.button} transition-colors`}
                  >
                    <MessageCircle size={18} />
                  </button>
                )}
                <h1 className={`text-2xl font-bold bg-gradient-to-r ${theme.accent} bg-clip-text text-transparent`}>
                  🏠 Your Dev Sanctuary
                </h1>
                <div className={`text-sm ${theme.textSecondary}`}>
                  {workspaces.length} environments • {workspaces.filter(w => w.status === 'ready').length} ready
                  {githubConnected && ` • 🐙 ${githubRepos.length} repos`}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  {environmentTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => createWorkspace(template)}
                      disabled={isCreatingWorkspace}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${template.color} bg-opacity-10 border border-current border-opacity-20 hover:bg-opacity-20 transition-all disabled:opacity-50`}
                      title={`Create ${template.name}`}
                    >
                      <span>{template.icon}</span>
                      <span className={`text-sm font-medium ${theme.text}`}>{template.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div 
            className="relative h-full overflow-hidden" 
            style={{ height: 'calc(100vh - 80px)' }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 1px, transparent 0)`,
                backgroundSize: '20px 20px'
              }} />
            </div>

            {workspaces.length === 0 && !isCreatingWorkspace && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="text-8xl mb-6">🏠</div>
                  <h2 className={`text-3xl font-bold ${theme.text} mb-4`}>Welcome to Your Sanctuary</h2>
                  <p className={`${theme.textSecondary} mb-8 leading-relaxed`}>
                    This is your calm, focused space for creation. Mama Bear is here to help you spin up environments, 
                    manage your projects, and keep everything organized. No stress, no overwhelm - just pure focus.
                  </p>
                  <div className="space-y-3">
                    <p className={`text-sm ${theme.textTertiary}`}>Ask Mama Bear to create an environment:</p>
                    <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
                      <p className="text-purple-400 text-sm italic">
                        "Spin up a NixOS environment with Python for my new project"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {workspaces.map(workspace => (
              <WorkspaceWindow key={workspace.id} workspace={workspace} />
            ))}

            {workspaces.some(w => w.isMinimized) && (
              <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 p-3 ${theme.cardBg} backdrop-blur-md rounded-2xl border ${theme.border} shadow-xl`}>
                {workspaces.filter(w => w.isMinimized).map(workspace => (
                  <button
                    key={workspace.id}
                    onClick={() => setWorkspaces(prev => prev.map(ws => 
                      ws.id === workspace.id ? { ...ws, isMinimized: false } : ws
                    ))}
                    className={`w-12 h-12 rounded-xl bg-gradient-to-r ${workspace.color} flex items-center justify-center text-lg shadow-lg hover:scale-110 transition-transform`}
                    title={workspace.name}
                  >
                    {workspace.icon}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevWorkspaces;