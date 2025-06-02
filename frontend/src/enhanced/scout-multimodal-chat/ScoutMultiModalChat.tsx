import { useState, useRef, useEffect, useContext } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';
import { ChatMessage, ChatSession, MessageRole } from '@/types/chat';

// Import React Resizable for draggable panels
import { Resizable, ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';

// Icons
import {
  MessageCircle,
  Code,
  Play,
  MoreHorizontal,
  Paperclip,
  Mic,
  Video,
  Image,
  Smile,
  Send,
  X,
  Maximize2,
  Minimize2,
  Download,
  Plus,
  Layers,
  ChevronRight,
  FileText,
  Folder,
  Clock,
  LoaderCircle,
  Save
} from 'lucide-react';

// Scout Multi-Modal Chat Implementation
const ScoutMultiModalChat = () => {
  const { theme } = useContext(ThemeContext);
  
  // Scout workflow states
  const WORKFLOW_STAGES = {
    WELCOME: 'welcome',
    PLANNING: 'planning',
    WORKSPACE: 'workspace',
    PRODUCTION: 'production'
  };
  
  // State
  const [currentStage, setCurrentStage] = useState(WORKFLOW_STAGES.WELCOME);
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [chatPosition, setChatPosition] = useState({ x: window.innerWidth - 420, y: 80 });
  const [isDraggingChat, setIsDraggingChat] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [leftPanelWidth, setLeftPanelWidth] = useState(300);
  const [files, setFiles] = useState([
    { id: '1', name: 'index.html', type: 'file', language: 'html' },
    { id: '2', name: 'style.css', type: 'file', language: 'css' },
    { id: '3', name: 'app.js', type: 'file', language: 'javascript' },
    { id: '4', name: 'components', type: 'folder', children: [
      { id: '5', name: 'Header.jsx', type: 'file', language: 'jsx' },
      { id: '6', name: 'Footer.jsx', type: 'file', language: 'jsx' }
    ]}
  ]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [projectName, setProjectName] = useState('My Scout Project');
  const [projectDescription, setProjectDescription] = useState('A React application built with Scout');
  
  // Refs
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Example file content (for demo)
  const fileContents = {
    'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Scout Project</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="app"></div>
  <script src="app.js"></script>
</body>
</html>`,
    'style.css': `/* Scout Project Styles */
body {
  font-family: 'Inter', sans-serif;
  margin: 0;
  padding: 0;
  background: linear-gradient(to right, #8b5cf6, #6d28d9);
  color: #f3f4f6;
}

#app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.container {
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}`,
    'app.js': `// Scout Project JavaScript
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  
  // Create header component
  const header = document.createElement('header');
  header.className = 'container';
  header.innerHTML = '<h1>Welcome to Scout</h1>';
  
  // Create content
  const content = document.createElement('main');
  content.className = 'container';
  content.innerHTML = '<p>This is a project created with Scout AI.</p>';
  
  // Add components to app
  app.appendChild(header);
  app.appendChild(content);
  
  console.log('Scout app initialized');
});`,
    'Header.jsx': `import React from 'react';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">Scout</div>
      <nav>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;`,
    'Footer.jsx': `import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} Scout Project</p>
      <div className="footer-links">
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
      </div>
    </footer>
  );
};

export default Footer;`
  };
  
  // Effect to initialize with welcome message
  useEffect(() => {
    // Add initial welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome-1',
      sessionId: 'scout-session',
      role: 'assistant',
      content: `# Welcome to Scout
      
I'm your Scout agent. I can help you build web applications, explore code, and create projects.

What would you like to build today?`,
      timestamp: new Date().toISOString()
    };
    
    setMessages([welcomeMessage]);
  }, []);
  
  // Effect to scroll chat to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Chat drag handlers
  const startDragChat = (e: React.MouseEvent) => {
    if (chatRef.current) {
      setIsDraggingChat(true);
      setDragOffset({
        x: e.clientX - chatRef.current.getBoundingClientRect().left,
        y: e.clientY - chatRef.current.getBoundingClientRect().top
      });
    }
  };
  
  const onDragChat = (e: MouseEvent) => {
    if (isDraggingChat) {
      const newX = Math.max(0, Math.min(window.innerWidth - 400, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragOffset.y));
      
      setChatPosition({ x: newX, y: newY });
    }
  };
  
  const endDragChat = () => {
    setIsDraggingChat(false);
  };
  
  // Add global mouse event listeners for dragging
  useEffect(() => {
    window.addEventListener('mousemove', onDragChat);
    window.addEventListener('mouseup', endDragChat);
    
    return () => {
      window.removeEventListener('mousemove', onDragChat);
      window.removeEventListener('mouseup', endDragChat);
    };
  }, [isDraggingChat, dragOffset]);
  
  // Helper functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const advanceStage = () => {
    if (currentStage === WORKFLOW_STAGES.WELCOME) {
      setCurrentStage(WORKFLOW_STAGES.PLANNING);
      addSystemMessage("Moving to planning stage...");
    } else if (currentStage === WORKFLOW_STAGES.PLANNING) {
      setCurrentStage(WORKFLOW_STAGES.WORKSPACE);
      addSystemMessage("Setting up your workspace...");
    } else if (currentStage === WORKFLOW_STAGES.WORKSPACE) {
      setCurrentStage(WORKFLOW_STAGES.PRODUCTION);
      addSystemMessage("Project ready for production!");
    }
  };
  
  const addSystemMessage = (content: string) => {
    const newMessage: ChatMessage = {
      id: `system-${Date.now()}`,
      sessionId: 'scout-session',
      role: 'system',
      content,
      timestamp: new Date().toISOString()
    };
    
    setMessages([...messages, newMessage]);
  };
  
  const sendMessage = () => {
    if (!chatMessage.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sessionId: 'scout-session',
      role: 'user',
      content: chatMessage,
      timestamp: new Date().toISOString()
    };
    
    setMessages([...messages, userMessage]);
    setIsLoading(true);
    
    // Clear input
    setChatMessage('');
    
    // Simulate AI response
    setTimeout(() => {
      // This would be replaced with actual API call in production
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sessionId: 'scout-session',
        role: 'assistant',
        content: getAIResponse(chatMessage, currentStage),
        timestamp: new Date().toISOString()
      };
      
      setMessages([...messages, userMessage, assistantMessage]);
      setIsLoading(false);
      
      // Auto advance stage based on certain triggers
      if (
        (currentStage === WORKFLOW_STAGES.WELCOME && chatMessage.toLowerCase().includes('start')) ||
        (currentStage === WORKFLOW_STAGES.PLANNING && chatMessage.toLowerCase().includes('create')) ||
        (currentStage === WORKFLOW_STAGES.WORKSPACE && chatMessage.toLowerCase().includes('finish'))
      ) {
        setTimeout(advanceStage, 1000);
      }
    }, 1500);
  };
  
  // Mock AI responses based on stage and input
  const getAIResponse = (message: string, stage: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (stage === WORKFLOW_STAGES.WELCOME) {
      if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
        return `I can help you build various types of web applications. Just tell me what you'd like to create, and I'll guide you through the process.

Here are some examples:
- A portfolio website
- A task management app
- A blog
- An e-commerce store

What would you like to build?`;
      }
      
      return `Great! I'd be happy to help you build a web application.

Let's start by defining what you want to create. Could you tell me more about your project idea?

Once we have a clear vision, we'll move to the planning stage.`;
    }
    
    if (stage === WORKFLOW_STAGES.PLANNING) {
      return `I've analyzed your requirements and here's what I'm thinking:

## Project Plan
1. Create a responsive web application with modern UI
2. Implement the core features you mentioned
3. Use React for the frontend with a clean component architecture
4. Style with CSS using your preferred purple theme

Are you ready to see how this will look? Let me create a workspace for you.`;
    }
    
    if (stage === WORKFLOW_STAGES.WORKSPACE) {
      if (lowerMessage.includes('file') || lowerMessage.includes('code')) {
        return `I've added the files you requested to the project. You can see them in the file explorer panel.

Take a look at the structure and let me know if you'd like to make any changes.`;
      }
      
      return `I'm working on implementing your project. The files in the explorer show the current structure.

You can click on any file to view its contents. What would you like me to explain or modify?`;
    }
    
    if (stage === WORKFLOW_STAGES.PRODUCTION) {
      if (lowerMessage.includes('download') || lowerMessage.includes('export')) {
        return `Your project is ready to be downloaded!

Click the download button in the workspace toolbar to get a ZIP file with all your project files.

Would you like me to explain how to deploy this project to a hosting service?`;
      }
      
      return `Your project is complete and ready for production!

You can download the files, and I can help you deploy them to a hosting service of your choice.

What would you like to do next?`;
    }
    
    return `I'm here to help with your project. What would you like to do next?`;
  };
  
  // Handle file selection
  const handleFileSelect = (fileId: string, fileName: string) => {
    setSelectedFile(fileName);
  };
  
  // Render file explorer items recursively
  const renderFileExplorerItems = (items: any[], level = 0) => {
    return items.map(item => (
      <div key={item.id}>
        <div 
          className={`flex items-center py-1 px-2 hover:bg-purple-50 dark:hover:bg-gray-800 rounded cursor-pointer ${
            selectedFile === item.name ? 'bg-purple-100 dark:bg-purple-900/50' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => item.type === 'file' && handleFileSelect(item.id, item.name)}
        >
          {item.type === 'folder' ? (
            <Folder size={16} className="mr-2 text-purple-700 dark:text-purple-300" />
          ) : (
            <FileText size={16} className="mr-2 text-purple-700 dark:text-purple-300" />
          )}
          <span className="text-sm">{item.name}</span>
        </div>
        
        {item.type === 'folder' && item.children && (
          <div>
            {renderFileExplorerItems(item.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };
  
  // Render
  return (
    <div className="flex h-full overflow-hidden bg-sanctuary-light dark:bg-sanctuary-dark">
      {/* Left Panel - File Explorer */}
      <Resizable
        width={leftPanelWidth}
        height={Infinity}
        minConstraints={[200, Infinity]}
        maxConstraints={[500, Infinity]}
        onResize={(e, data) => {
          setLeftPanelWidth(data.size.width);
        }}
        handle={
          <div className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize bg-purple-200 dark:bg-purple-800 opacity-0 hover:opacity-100" />
        }
      >
        <div 
          className="h-full border-r border-purple-100 dark:border-purple-900 overflow-hidden flex flex-col"
          style={{ width: leftPanelWidth }}
        >
          {/* Explorer Header */}
          <div className="p-3 border-b border-purple-100 dark:border-purple-900 bg-white dark:bg-gray-900">
            <h3 className="font-medium text-purple-700 dark:text-purple-300">Scout Explorer</h3>
          </div>
          
          {/* Project Info */}
          <div className="p-3 border-b border-purple-100 dark:border-purple-900 bg-purple-50 dark:bg-gray-800">
            <div className="text-sm font-medium text-purple-800 dark:text-purple-200">{projectName}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{projectDescription}</div>
          </div>
          
          {/* File Explorer */}
          <div className="flex-1 overflow-y-auto p-2">
            {renderFileExplorerItems(files)}
          </div>
          
          {/* Timeline */}
          <div className="p-3 border-t border-purple-100 dark:border-purple-900">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center">
                <Clock size={14} className="mr-1" />
                Timeline
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400">
                Stage {Object.values(WORKFLOW_STAGES).indexOf(currentStage) + 1}/4
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full mb-2">
              <div 
                className="h-1 bg-purple-gradient rounded-full"
                style={{ 
                  width: `${(Object.values(WORKFLOW_STAGES).indexOf(currentStage) + 1) * 25}%`,
                  transition: 'width 0.5s ease-in-out'
                }}
              ></div>
            </div>
            
            {/* Stage Labels */}
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              {Object.values(WORKFLOW_STAGES).map((stage, index) => (
                <div 
                  key={stage}
                  className={`${
                    Object.values(WORKFLOW_STAGES).indexOf(currentStage) >= index
                      ? 'text-purple-700 dark:text-purple-300 font-medium'
                      : ''
                  }`}
                >
                  {stage.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Resizable>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="h-12 border-b border-purple-100 dark:border-purple-900 bg-white dark:bg-gray-900 flex items-center px-4">
          <div className="flex space-x-2">
            <button className="p-1.5 rounded hover:bg-purple-50 dark:hover:bg-gray-800 text-purple-700 dark:text-purple-300">
              <Save size={18} />
            </button>
            <button className="p-1.5 rounded hover:bg-purple-50 dark:hover:bg-gray-800 text-purple-700 dark:text-purple-300">
              <Play size={18} />
            </button>
            <button className="p-1.5 rounded hover:bg-purple-50 dark:hover:bg-gray-800 text-purple-700 dark:text-purple-300">
              <Download size={18} />
            </button>
          </div>
          
          <div className="ml-4 text-sm text-gray-600 dark:text-gray-400">
            {selectedFile ? selectedFile : 'No file selected'}
          </div>
          
          <div className="ml-auto">
            <button 
              className="p-1.5 rounded hover:bg-purple-50 dark:hover:bg-gray-800 text-purple-700 dark:text-purple-300"
              onClick={() => setChatMinimized(!chatMinimized)}
            >
              <MessageCircle size={18} />
            </button>
          </div>
        </div>
        
        {/* Preview/Editor Area */}
        <div className="flex-1 overflow-auto p-4">
          {selectedFile ? (
            <div className="h-full">
              {/* File content */}
              <div className="card h-full overflow-auto">
                <pre className="text-sm font-mono p-4 whitespace-pre-wrap overflow-x-auto">
                  {fileContents[selectedFile] || 'File content not available'}
                </pre>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-gradient flex items-center justify-center">
                  <Code size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-purple-700 dark:text-purple-300 mb-2">
                  Scout Workspace
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {currentStage === WORKFLOW_STAGES.WELCOME 
                    ? 'Tell Scout what you want to build to get started' 
                    : currentStage === WORKFLOW_STAGES.PLANNING
                    ? 'Scout is planning your project'
                    : currentStage === WORKFLOW_STAGES.WORKSPACE
                    ? 'Select a file from the explorer to view or edit'
                    : 'Your project is ready for production'}
                </p>
                
                {currentStage !== WORKFLOW_STAGES.WELCOME && (
                  <div className="mt-4">
                    <button 
                      className="btn-primary mx-auto"
                      onClick={advanceStage}
                    >
                      {currentStage === WORKFLOW_STAGES.PLANNING 
                        ? 'Create Workspace' 
                        : currentStage === WORKFLOW_STAGES.WORKSPACE
                        ? 'Finish Project'
                        : 'Download Project'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Floating Chat */}
      {!chatMinimized ? (
        <div 
          ref={chatRef}
          className="fixed rounded-lg shadow-sanctuary-lg overflow-hidden flex flex-col bg-white dark:bg-gray-900 border border-purple-100 dark:border-purple-900 w-[400px] h-[500px]"
          style={{ 
            left: `${chatPosition.x}px`, 
            top: `${chatPosition.y}px`,
            zIndex: 1000
          }}
        >
          {/* Chat Header */}
          <div 
            className="bg-purple-gradient p-3 flex items-center justify-between cursor-move"
            onMouseDown={startDragChat}
          >
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-2">
                <Layers size={14} className="text-white" />
              </div>
              <h3 className="font-medium text-white">Scout Chat</h3>
            </div>
            <div className="flex space-x-1">
              <button 
                className="p-1 rounded hover:bg-white/10 text-white"
                onClick={() => setChatMinimized(true)}
              >
                <Minimize2 size={16} />
              </button>
            </div>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={
                    message.role === 'user'
                      ? 'message-user'
                      : message.role === 'system'
                      ? 'message-system'
                      : 'message-assistant'
                  }
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="message-assistant">
                  <div className="typing-indicator">
                    <span className="typing-indicator-dot"></span>
                    <span className="typing-indicator-dot"></span>
                    <span className="typing-indicator-dot"></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Chat Input */}
          <div className="p-3 border-t border-purple-100 dark:border-purple-900">
            <div className="flex">
              <div className="flex-1 relative">
                <textarea
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Message Scout..."
                  className="input-field min-h-[60px] max-h-[120px] py-3 pr-10 resize-none"
                  disabled={isLoading}
                ></textarea>
                <div className="absolute right-2 bottom-2 flex items-center">
                  <button
                    className="p-1.5 rounded hover:bg-purple-50 dark:hover:bg-gray-800 text-purple-700 dark:text-purple-300"
                    title="Attach files"
                  >
                    <Paperclip size={16} />
                  </button>
                </div>
              </div>
              
              <button
                onClick={sendMessage}
                disabled={!chatMessage.trim() || isLoading}
                className={`btn-primary rounded-full p-3 ml-2 self-end ${
                  !chatMessage.trim() || isLoading
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                {isLoading ? (
                  <LoaderCircle size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
            
            {/* Multi-modal options */}
            <div className="flex justify-start mt-2 space-x-2">
              <button
                className="p-1.5 rounded hover:bg-purple-50 dark:hover:bg-gray-800 text-purple-700 dark:text-purple-300"
                title="Record audio"
              >
                <Mic size={14} />
              </button>
              <button
                className="p-1.5 rounded hover:bg-purple-50 dark:hover:bg-gray-800 text-purple-700 dark:text-purple-300"
                title="Record video"
              >
                <Video size={14} />
              </button>
              <button
                className="p-1.5 rounded hover:bg-purple-50 dark:hover:bg-gray-800 text-purple-700 dark:text-purple-300"
                title="Paste image"
              >
                <Image size={14} />
              </button>
              <button
                className="p-1.5 rounded hover:bg-purple-50 dark:hover:bg-gray-800 text-purple-700 dark:text-purple-300"
                title="Emoji picker"
              >
                <Smile size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Minimized chat button
        <button
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-purple-gradient shadow-sanctuary flex items-center justify-center z-50"
          onClick={() => setChatMinimized(false)}
        >
          <MessageCircle size={20} className="text-white" />
        </button>
      )}
    </div>
  );
};

export default ScoutMultiModalChat;
