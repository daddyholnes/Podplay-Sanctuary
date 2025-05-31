import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Code, 
  Terminal, 
  FileText, 
  Activity, 
  Settings, 
  Sun, 
  Moon, 
  Eye,
  Send,
  Maximize2,
  Minimize2,
  Play,
  Download,
  Upload,
  Search,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Heart,
  Coffee
} from 'lucide-react';

// Theme configurations for accessibility
const themes = {
  light: {
    name: 'Light',
    icon: Sun,
    primary: 'from-blue-50 to-indigo-100',
    secondary: 'bg-white',
    accent: 'bg-blue-500',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    border: 'border-gray-200',
    hover: 'hover:bg-gray-50'
  },
  dark: {
    name: 'Dark',
    icon: Moon,
    primary: 'from-gray-900 to-gray-800',
    secondary: 'bg-gray-800',
    accent: 'bg-indigo-600',
    text: 'text-white',
    textSecondary: 'text-gray-300',
    border: 'border-gray-700',
    hover: 'hover:bg-gray-700'
  },
  sensory: {
    name: 'Sensory Calm',
    icon: Eye,
    primary: 'from-green-50 to-blue-50',
    secondary: 'bg-neutral-50',
    accent: 'bg-green-600',
    text: 'text-gray-800',
    textSecondary: 'text-gray-600',
    border: 'border-green-200',
    hover: 'hover:bg-green-50'
  }
};

// Mama Bear responses for different contexts
const mamaBearPersonality = {
  greeting: "🐻 Hello dear! I'm Mama Bear, your caring development companion. I'm here to make your coding journey calm, organized, and empowering. How can I help you create something wonderful today?",
  
  planning: "Let's create a beautiful plan together. I'll help you break this down into manageable, stress-free steps that honor your unique way of working.",
  
  encouragement: "You're doing amazing work! Remember, every great developer has their own rhythm. I'm here to support you every step of the way.",
  
  transition: "Ready to transform your idea into reality? I'll set up a perfect workspace where everything you need is organized and accessible."
};

const PodplaySanctuaryApp = () => {
  // Core state management
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [workspaceMode, setWorkspaceMode] = useState('chat'); // 'chat' or 'workspace'
  const [activePanel, setActivePanel] = useState('chat');
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'mama-bear',
      content: mamaBearPersonality.greeting,
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [projects, setProjects] = useState([]);
  const [mcpServers, setMcpServers] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState({});

  // Refs for auto-scroll and focus management
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const theme = themes[currentTheme];

  // Initialize connection to backend
  useEffect(() => {
    initializeBackendConnection();
    loadInitialData();
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeBackendConnection = async () => {
    try {
      // Test backend connection
      const response = await fetch('http://localhost:5000/api/test-connection');
      if (response.ok) {
        setIsConnected(true);
        console.log('🐻 Connected to Mama Bear backend');
      }
    } catch (error) {
      console.error('Backend connection failed:', error);
      setIsConnected(false);
    }
  };

  const loadInitialData = async () => {
    try {
      // Load MCP servers
      const mcpResponse = await fetch('http://localhost:5000/api/mcp/search?limit=5');
      if (mcpResponse.ok) {
        const mcpData = await mcpResponse.json();
        setMcpServers(mcpData.servers || []);
      }

      // Load system metrics
      const metricsResponse = await fetch('http://localhost:5000/api/v1/scout_agent/system/metrics');
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setSystemMetrics(metricsData.metrics || {});
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat/mama-bear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          user_id: 'sanctuary_user',
          session_id: 'main_session'
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        const mamaBearResponse = {
          id: Date.now() + 1,
          type: 'mama-bear',
          content: data.response || "I'm here to help! Let me think about that for a moment.",
          timestamp: new Date().toISOString(),
          metadata: data.metadata
        };

        setMessages(prev => [...prev, mamaBearResponse]);

        // Check if this should trigger workspace transition
        if (shouldTransitionToWorkspace(inputMessage, data.response)) {
          setTimeout(() => transitionToWorkspace(), 2000);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'mama-bear',
        content: "I'm having a small technical moment. Let me try to reconnect my systems.",
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const shouldTransitionToWorkspace = (userInput, response) => {
    const transitionKeywords = [
      'create', 'build', 'develop', 'code', 'project', 'workspace', 
      'let\'s start', 'ready to', 'begin', 'make', 'implement'
    ];
    
    const input = userInput.toLowerCase();
    return transitionKeywords.some(keyword => input.includes(keyword));
  };

  const transitionToWorkspace = () => {
    setWorkspaceMode('workspace');
    setActivePanel('overview');
    
    // Add transition message
    const transitionMessage = {
      id: Date.now(),
      type: 'mama-bear',
      content: mamaBearPersonality.transition,
      timestamp: new Date().toISOString(),
      isTransition: true
    };
    setMessages(prev => [...prev, transitionMessage]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Navigation items
  const navItems = [
    { id: 'chat', label: 'Mama Bear Chat', icon: MessageCircle },
    { id: 'overview', label: 'Project Overview', icon: Activity },
    { id: 'code', label: 'Code Editor', icon: Code },
    { id: 'terminal', label: 'Terminal', icon: Terminal },
    { id: 'files', label: 'File Manager', icon: FileText },
    { id: 'mcp', label: 'MCP Marketplace', icon: Search }
  ];

  // Render different workspace panels
  const renderWorkspacePanel = () => {
    switch (activePanel) {
      case 'overview':
        return <ProjectOverviewPanel theme={theme} projects={projects} metrics={systemMetrics} />;
      case 'code':
        return <CodeEditorPanel theme={theme} />;
      case 'terminal':
        return <TerminalPanel theme={theme} />;
      case 'files':
        return <FileManagerPanel theme={theme} />;
      case 'mcp':
        return <MCPMarketplacePanel theme={theme} servers={mcpServers} />;
      default:
        return <ChatPanel theme={theme} messages={messages} isTyping={isTyping} messagesEndRef={messagesEndRef} />;
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.primary} transition-all duration-500`}>
      {/* Header */}
      <header className={`${theme.secondary} ${theme.border} border-b backdrop-blur-sm bg-opacity-90 sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${theme.text}`}>Podplay Sanctuary</h1>
                <p className={`text-sm ${theme.textSecondary}`}>Your Calm Development Space</p>
              </div>
            </div>

            {/* Theme Switcher and Status */}
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-sm ${theme.textSecondary}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {/* Theme Switcher */}
              <div className="flex space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                {Object.entries(themes).map(([key, themeOption]) => {
                  const IconComponent = themeOption.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setCurrentTheme(key)}
                      className={`p-2 rounded transition-colors ${
                        currentTheme === key 
                          ? `${theme.accent} text-white` 
                          : `${theme.textSecondary} ${theme.hover}`
                      }`}
                      title={themeOption.name}
                    >
                      <IconComponent className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {workspaceMode === 'chat' ? (
          /* Chat Mode - Simple, Focused Interface */
          <ChatModeInterface 
            theme={theme}
            messages={messages}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            isTyping={isTyping}
            onSendMessage={sendMessage}
            onKeyPress={handleKeyPress}
            messagesEndRef={messagesEndRef}
            inputRef={inputRef}
          />
        ) : (
          /* Workspace Mode - Full Development Environment */
          <WorkspaceModeInterface
            theme={theme}
            activePanel={activePanel}
            setActivePanel={setActivePanel}
            navItems={navItems}
            renderWorkspacePanel={renderWorkspacePanel}
            messages={messages}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            isTyping={isTyping}
            onSendMessage={sendMessage}
            onKeyPress={handleKeyPress}
            messagesEndRef={messagesEndRef}
          />
        )}
      </div>
    </div>
  );
};

// Chat Mode Interface Component
const ChatModeInterface = ({ 
  theme, messages, inputMessage, setInputMessage, isTyping, 
  onSendMessage, onKeyPress, messagesEndRef, inputRef 
}) => (
  <div className="max-w-4xl mx-auto">
    {/* Welcome Section */}
    <div className="text-center mb-8">
      <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
        <Coffee className="w-10 h-10 text-white" />
      </div>
      <h2 className={`text-3xl font-bold ${theme.text} mb-2`}>Welcome to Your Sanctuary</h2>
      <p className={`text-lg ${theme.textSecondary} max-w-2xl mx-auto`}>
        A calm, empowering space designed for neurodiverse minds. 
        Chat with Mama Bear to start creating something wonderful.
      </p>
    </div>

    {/* Chat Container */}
    <div className={`${theme.secondary} rounded-2xl shadow-xl border ${theme.border} overflow-hidden`}>
      {/* Messages Area */}
      <div className="h-96 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} theme={theme} />
        ))}
        {isTyping && <TypingIndicator theme={theme} />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`p-4 border-t ${theme.border} bg-opacity-50`}>
        <div className="flex space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="Ask Mama Bear anything... ✨"
            className={`flex-1 px-4 py-3 rounded-xl border ${theme.border} ${theme.secondary} ${theme.text} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
          />
          <button
            onClick={onSendMessage}
            disabled={!inputMessage.trim()}
            className={`px-6 py-3 ${theme.accent} text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2 shadow-lg`}
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>

    {/* Quick Actions */}
    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: 'Start a Project', icon: Plus, color: 'bg-blue-500' },
        { label: 'Code Review', icon: Code, color: 'bg-green-500' },
        { label: 'Learn Something', icon: Search, color: 'bg-purple-500' },
        { label: 'Get Organized', icon: CheckCircle, color: 'bg-pink-500' }
      ].map((action, index) => (
        <button
          key={index}
          className={`${theme.secondary} ${theme.border} border rounded-xl p-4 ${theme.hover} transition-all group`}
        >
          <action.icon className={`w-6 h-6 ${action.color.replace('bg-', 'text-')} mx-auto mb-2 group-hover:scale-110 transition-transform`} />
          <p className={`text-sm ${theme.text} font-medium`}>{action.label}</p>
        </button>
      ))}
    </div>
  </div>
);

// Workspace Mode Interface Component
const WorkspaceModeInterface = ({ 
  theme, activePanel, setActivePanel, navItems, renderWorkspacePanel,
  messages, inputMessage, setInputMessage, isTyping, onSendMessage, onKeyPress, messagesEndRef
}) => (
  <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">
    {/* Sidebar Navigation */}
    <div className="col-span-2">
      <div className={`${theme.secondary} rounded-xl ${theme.border} border p-4 h-full`}>
        <h3 className={`${theme.text} font-semibold mb-4`}>Workspace</h3>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePanel(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left ${
                activePanel === item.id 
                  ? `${theme.accent} text-white` 
                  : `${theme.textSecondary} ${theme.hover}`
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>

    {/* Main Content Area */}
    <div className="col-span-7">
      <div className={`${theme.secondary} rounded-xl ${theme.border} border h-full overflow-hidden`}>
        {renderWorkspacePanel()}
      </div>
    </div>

    {/* Chat Sidebar */}
    <div className="col-span-3">
      <div className={`${theme.secondary} rounded-xl ${theme.border} border h-full flex flex-col`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className={`${theme.text} font-semibold flex items-center space-x-2`}>
            <MessageCircle className="w-4 h-4" />
            <span>Mama Bear</span>
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.slice(-5).map((message) => (
            <MessageBubble key={message.id} message={message} theme={theme} compact />
          ))}
          {isTyping && <TypingIndicator theme={theme} compact />}
          <div ref={messagesEndRef} />
        </div>

        <div className={`p-3 border-t ${theme.border}`}>
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={onKeyPress}
              placeholder="Quick question..."
              className={`flex-1 px-3 py-2 text-sm rounded-lg border ${theme.border} ${theme.secondary} ${theme.text} placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500`}
            />
            <button
              onClick={onSendMessage}
              disabled={!inputMessage.trim()}
              className={`px-3 py-2 ${theme.accent} text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Message Bubble Component
const MessageBubble = ({ message, theme, compact = false }) => (
  <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} ${compact ? 'mb-2' : 'mb-4'}`}>
    <div className={`max-w-xs lg:max-w-md ${compact ? 'max-w-full' : ''}`}>
      {message.type === 'mama-bear' && (
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
            <Heart className="w-3 h-3 text-white" />
          </div>
          <span className={`text-xs ${theme.textSecondary} font-medium`}>Mama Bear</span>
        </div>
      )}
      
      <div className={`px-4 py-3 rounded-2xl ${compact ? 'text-sm px-3 py-2' : ''} ${
        message.type === 'user' 
          ? `${theme.accent} text-white` 
          : `bg-gray-100 dark:bg-gray-700 ${theme.text}`
      } ${message.isError ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : ''}`}>
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.isTransition && (
          <div className="mt-2 flex items-center space-x-2 text-sm opacity-75">
            <Zap className="w-4 h-4" />
            <span>Preparing workspace...</span>
          </div>
        )}
      </div>
      
      <div className={`text-xs ${theme.textSecondary} mt-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
        {new Date(message.timestamp).toLocaleTimeString()}
      </div>
    </div>
  </div>
);

// Typing Indicator Component
const TypingIndicator = ({ theme, compact = false }) => (
  <div className="flex justify-start mb-4">
    <div className={`max-w-xs lg:max-w-md ${compact ? 'max-w-full' : ''}`}>
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
          <Heart className="w-3 h-3 text-white" />
        </div>
        <span className={`text-xs ${theme.textSecondary} font-medium`}>Mama Bear</span>
      </div>
      <div className={`px-4 py-3 bg-gray-100 dark:bg-gray-700 ${theme.text} rounded-2xl ${compact ? 'px-3 py-2' : ''}`}>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  </div>
);

// Workspace Panel Components
const ProjectOverviewPanel = ({ theme, projects, metrics }) => (
  <div className="p-6">
    <div className="flex items-center justify-between mb-6">
      <h2 className={`text-2xl font-bold ${theme.text}`}>Project Overview</h2>
      <button className={`px-4 py-2 ${theme.accent} text-white rounded-lg hover:opacity-90 transition-opacity`}>
        <Plus className="w-4 h-4 inline mr-2" />
        New Project
      </button>
    </div>

    {/* System Metrics */}
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className={`p-4 bg-green-50 dark:bg-green-900 rounded-lg`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-600 dark:text-green-400 text-sm font-medium">CPU Usage</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
              {metrics?.cpu?.percent?.toFixed(1) || '0'}%
            </p>
          </div>
          <Activity className="w-8 h-8 text-green-500" />
        </div>
      </div>

      <div className={`p-4 bg-blue-50 dark:bg-blue-900 rounded-lg`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Memory</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {metrics?.memory?.percent?.toFixed(1) || '0'}%
            </p>
          </div>
          <Activity className="w-8 h-8 text-blue-500" />
        </div>
      </div>

      <div className={`p-4 bg-purple-50 dark:bg-purple-900 rounded-lg`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Processes</p>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {metrics?.top_processes?.length || '0'}
            </p>
          </div>
          <Terminal className="w-8 h-8 text-purple-500" />
        </div>
      </div>
    </div>

    {/* Project List */}
    <div className="space-y-4">
      <h3 className={`text-lg font-semibold ${theme.text}`}>Recent Projects</h3>
      {projects.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Code className="w-8 h-8 text-gray-400" />
          </div>
          <p className={`${theme.textSecondary} mb-4`}>No projects yet. Let's create your first one!</p>
          <button className={`px-6 py-3 ${theme.accent} text-white rounded-lg hover:opacity-90 transition-opacity`}>
            Create Project
          </button>
        </div>
      ) : (
        projects.map((project, index) => (
          <div key={index} className={`p-4 border ${theme.border} rounded-lg ${theme.hover} cursor-pointer transition-colors`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-medium ${theme.text}`}>{project.name}</h4>
                <p className={`text-sm ${theme.textSecondary}`}>{project.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  project.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                  'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                }`}>
                  {project.status}
                </span>
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

const CodeEditorPanel = ({ theme }) => (
  <div className="h-full flex flex-col">
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <h2 className={`text-lg font-semibold ${theme.text}`}>Code Editor</h2>
      <div className="flex space-x-2">
        <button className={`px-3 py-1 text-sm ${theme.accent} text-white rounded hover:opacity-90`}>
          <Play className="w-3 h-3 inline mr-1" />
          Run
        </button>
        <button className={`px-3 py-1 text-sm border ${theme.border} ${theme.textSecondary} rounded ${theme.hover}`}>
          <Download className="w-3 h-3 inline mr-1" />
          Save
        </button>
      </div>
    </div>
    <div className="flex-1 p-4">
      <div className={`w-full h-full bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-lg border ${theme.border}`}>
        <div className="text-gray-500 mb-4"># Welcome to your code editor</div>
        <div className="text-blue-400">def</div>
        <div className="ml-4">
          <span className="text-yellow-400">hello_sanctuary</span>
          <span className="text-white">():</span>
        </div>
        <div className="ml-8">
          <span className="text-blue-400">print</span>
          <span className="text-white">(</span>
          <span className="text-green-300">"Welcome to your coding sanctuary! 🐻"</span>
          <span className="text-white">)</span>
        </div>
        <div className="mt-4">
          <span className="text-blue-400">if</span>
          <span className="text-white"> __name__ == </span>
          <span className="text-green-300">"__main__"</span>
          <span className="text-white">:</span>
        </div>
        <div className="ml-4">
          <span className="text-yellow-400">hello_sanctuary</span>
          <span className="text-white">()</span>
        </div>
        <div className="mt-4 text-gray-500"># Start coding with Mama Bear's guidance ✨</div>
      </div>
    </div>
  </div>
);

const TerminalPanel = ({ theme }) => (
  <div className="h-full flex flex-col">
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <h2 className={`text-lg font-semibold ${theme.text}`}>Terminal</h2>
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
      </div>
    </div>
    <div className="flex-1 p-4">
      <div className="w-full h-full bg-black text-green-400 font-mono text-sm p-4 rounded-lg overflow-auto">
        <div className="text-blue-400">mama-bear@sanctuary:~$ </div>
        <div className="text-green-300 mb-2">Welcome to Podplay Sanctuary Terminal! 🐻</div>
        <div className="text-yellow-400 mb-2">System initialized and ready for your commands.</div>
        <div className="mb-4">
          <div className="text-gray-400">Available commands:</div>
          <div className="ml-4 text-cyan-400">• mama-chat [message] - Chat with Mama Bear</div>
          <div className="ml-4 text-cyan-400">• mcp-search [query] - Search MCP marketplace</div>
          <div className="ml-4 text-cyan-400">• project-init [name] - Initialize new project</div>
          <div className="ml-4 text-cyan-400">• help - Show all commands</div>
        </div>
        <div className="text-blue-400">mama-bear@sanctuary:~$ <span className="animate-pulse">_</span></div>
      </div>
    </div>
  </div>
);

const FileManagerPanel = ({ theme }) => (
  <div className="h-full flex flex-col">
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <h2 className={`text-lg font-semibold ${theme.text}`}>File Manager</h2>
      <div className="flex space-x-2">
        <button className={`px-3 py-1 text-sm ${theme.accent} text-white rounded hover:opacity-90`}>
          <Upload className="w-3 h-3 inline mr-1" />
          Upload
        </button>
        <button className={`px-3 py-1 text-sm border ${theme.border} ${theme.textSecondary} rounded ${theme.hover}`}>
          <Plus className="w-3 h-3 inline mr-1" />
          New
        </button>
      </div>
    </div>
    <div className="flex-1 p-4">
      <div className="space-y-2">
        {[
          { name: 'Projects', type: 'folder', files: 3 },
          { name: 'Templates', type: 'folder', files: 8 },
          { name: 'Scripts', type: 'folder', files: 5 },
          { name: 'README.md', type: 'file', size: '2.1 KB' },
          { name: 'config.json', type: 'file', size: '512 B' }
        ].map((item, index) => (
          <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg ${theme.hover} cursor-pointer transition-colors`}>
            <FileText className={`w-5 h-5 ${item.type === 'folder' ? 'text-blue-500' : 'text-gray-400'}`} />
            <div className="flex-1">
              <p className={`font-medium ${theme.text}`}>{item.name}</p>
              <p className={`text-sm ${theme.textSecondary}`}>
                {item.type === 'folder' ? `${item.files} files` : item.size}
              </p>
            </div>
            <div className="text-gray-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const MCPMarketplacePanel = ({ theme, servers }) => (
  <div className="h-full flex flex-col">
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <h2 className={`text-lg font-semibold ${theme.text}`}>MCP Marketplace</h2>
      <button className={`px-3 py-1 text-sm ${theme.accent} text-white rounded hover:opacity-90`}>
        <Search className="w-3 h-3 inline mr-1" />
        Discover
      </button>
    </div>
    <div className="flex-1 p-4 overflow-auto">
      <div className="space-y-4">
        {servers.length === 0 ? (
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className={`${theme.textSecondary} mb-4`}>Discovering MCP servers for you...</p>
          </div>
        ) : (
          servers.map((server, index) => (
            <div key={index} className={`p-4 border ${theme.border} rounded-lg ${theme.hover} transition-colors`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className={`font-medium ${theme.text}`}>{server.name}</h3>
                  <p className={`text-sm ${theme.textSecondary} mt-1`}>{server.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  server.is_official ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                }`}>
                  {server.is_official ? 'Official' : 'Community'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>★ {server.popularity_score}</span>
                  <span>{server.category}</span>
                  <span>{server.author}</span>
                </div>
                <button className={`px-3 py-1 text-sm ${theme.accent} text-white rounded hover:opacity-90`}>
                  Install
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

export default PodplaySanctuaryApp;