import { useState, useRef, useEffect } from 'react';
import { 
  Send, MessageCircle, Settings, Moon, Sun, Plus, Search, Paperclip, Mic, Video, 
  Bookmark, MoreVertical, Globe, RefreshCw, ExternalLink, X, Copy, ThumbsUp, 
  ThumbsDown, Folder, Target, Code2, FileText, Image
} from 'lucide-react';
import type { Message, Chat } from '../types';

export const MamaBearMainChat = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [recentChats, setRecentChats] = useState<Chat[]>([]);
  const [showBrowser, setShowBrowser] = useState(false);
  const [browserUrl, setBrowserUrl] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showResearch, setShowResearch] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const theme = {
    bg: isDarkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50',
    cardBg: isDarkMode ? 'bg-slate-800/80' : 'bg-white/80',
    border: isDarkMode ? 'border-slate-700/50' : 'border-purple-200/50',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-slate-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-slate-400' : 'text-gray-500',
    input: isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white' : 'bg-white/50 border-purple-300/50 text-gray-900',
    button: isDarkMode ? 'bg-slate-700/50 hover:bg-slate-600/50' : 'bg-purple-100/50 hover:bg-purple-200/50',
    accent: 'from-purple-500 to-pink-500'
  };

  // Sample recent chats
  const sampleChats = [
    {
      id: 1,
      title: 'Podplay Studio Architecture',
      lastMessage: 'Let me draft the technical architecture for your multi-modal platform...',
      timestamp: '2 hours ago',
      messageCount: 47,
      type: 'project'
    },
    {
      id: 2,
      title: 'Scout Agent Development',
      lastMessage: 'I\'ve researched the latest autonomous agent patterns for you...',
      timestamp: 'Yesterday',
      messageCount: 23,
      type: 'research'
    },
    {
      id: 3,
      title: 'MCP Marketplace Strategy',
      lastMessage: 'Based on my analysis of existing marketplaces...',
      timestamp: '2 days ago',
      messageCount: 15,
      type: 'planning'
    },
    {
      id: 4,
      title: 'Accessibility & Sensory Design',
      lastMessage: 'I found some excellent resources on neurodivergent-friendly UX...',
      timestamp: '3 days ago',
      messageCount: 31,
      type: 'research'
    },
    {
      id: 5,
      title: 'AI Model Integration',
      lastMessage: 'Here\'s how we can optimize the Gemini 2.5 integration...',
      timestamp: 'Last week',
      messageCount: 19,
      type: 'technical'
    }
  ];

  useEffect(() => {
    setRecentChats(sampleChats);
    
    // Initialize main chat
    if (!selectedChat) {
      setMessages([
        {
          id: 1,
          sender: 'mama-bear',
          text: `Hello Nathan! 💝 Welcome to our sanctuary. I'm your Mama Bear - powered by Gemini 2.5 with all your memories, tools, and capabilities at my fingertips.\n\n🧠 **My Powers:**\n• Full access to your mem0 memory storage\n• Deep web research and analysis\n• MCP tool orchestration\n• Project planning and architecture\n• Connection to Scout and Workspaces Mama Bears\n\nWhat shall we explore together today? I'm here to research, plan, build, or simply chat about whatever's on your mind. 🌟`,
          timestamp: new Date(),
          type: 'greeting',
          suggestions: ['Research a new project idea', 'Plan the next Podplay feature', 'Analyze market trends', 'Draft technical architecture']
        }
      ]);
    }
  }, [selectedChat]);

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: currentMessage,
      timestamp: new Date(),
      type: 'message'
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    // Simulate Mama Bear's intelligent response
    setTimeout(() => {
      const lowerMessage = currentMessage.toLowerCase();
      let response = '';
      let actions = [];

      if (lowerMessage.includes('research') || lowerMessage.includes('find') || lowerMessage.includes('analyze')) {
        response = `🔍 **Starting deep research for you...**\n\nI'm using my full capabilities:\n• Searching current web data\n• Cross-referencing with your memory\n• Analyzing patterns and trends\n• Preparing comprehensive findings\n\nLet me gather the most relevant and up-to-date information on this topic. I'll provide you with insights that connect to your existing projects and goals.`;
        actions = ['search-web', 'analyze-patterns'];
        setShowResearch(true);
      } else if (lowerMessage.includes('plan') || lowerMessage.includes('architecture') || lowerMessage.includes('design')) {
        response = `📋 **Excellent! Let me draft a comprehensive plan...**\n\nI'm drawing from:\n• Your previous project patterns (from mem0)\n• Current best practices and technologies\n• Your sensory preferences and workflow needs\n• Integration with your existing tools\n\nI'll create a detailed plan that I can then share with Scout Mama Bear or Workspaces Mama Bear for implementation. Would you like me to start with a high-level overview or dive into specific technical details?`;
        actions = ['draft-plan', 'analyze-requirements'];
      } else if (lowerMessage.includes('scout') || lowerMessage.includes('workspace')) {
        response = `🤝 **Coordinating with your other Mama Bears...**\n\nI can seamlessly collaborate with:\n• **Scout Mama Bear** - for autonomous development workflows\n• **Workspaces Mama Bear** - for environment management\n\nI'll draft detailed plans and hand them off, ensuring perfect continuity of your vision. They'll have all the context they need from our conversation and your memory storage. What would you like me to prepare for them?`;
        actions = ['coordinate-bears', 'draft-handoff'];
      } else {
        response = `I'm here to help with whatever you need! 💝 \n\nAs your main Mama Bear, I can:\n• **Deep research** any topic with web search + memory\n• **Plan and architect** your projects\n• **Coordinate** with Scout and Workspaces Mama Bears\n• **Remember everything** with your mem0 storage\n• **Browse together** using our shared web preview\n\nWhat's on your mind today? I'm ready to dive deep into any project, research question, or planning challenge you have. 🚀`;
        actions = ['ready-to-help'];
      }

      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'mama-bear',
        text: response,
        timestamp: new Date(),
        type: 'response',
        actions: actions,
        suggestions: actions.includes('search-web') ? 
          ['Browse relevant websites together', 'Analyze competitor solutions', 'Research latest trends'] :
          ['Continue planning', 'Start implementation', 'Research related topics']
      }]);
    }, 2000);
  };

  const startNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: 'New Chat',
      lastMessage: '',
      timestamp: 'Just now',
      messageCount: 0,
      type: 'general'
    };
    setRecentChats(prev => [newChat, ...prev]);
    setSelectedChat(newChat);
    setMessages([{
      id: 1,
      sender: 'mama-bear',
      text: `Fresh start! 💝 What shall we explore in this new conversation?`,
      timestamp: new Date(),
      type: 'greeting'
    }]);
  };

  const loadChat = (chat: Chat) => {
    setSelectedChat(chat);
    // In real implementation, load from mem0 storage
    setMessages([
      {
        id: 1,
        sender: 'mama-bear',
        text: `Welcome back to our "${chat.title}" conversation! 💝 I remember everything we discussed. Where would you like to continue?`,
        timestamp: new Date(),
        type: 'loaded'
      }
    ]);
  };

  const handleWebSearch = (query: string) => {
    setBrowserUrl(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
    setShowBrowser(true);
  };

  const ChatTypeIcon = ({ type }: { type: string }) => {
    const icons: Record<string, React.ReactElement> = {
      project: <Folder size={16} className="text-purple-500" />,
      research: <Search size={16} className="text-purple-600" />,
      planning: <Target size={16} className="text-pink-500" />,
      technical: <Code2 size={16} className="text-purple-700" />,
      general: <MessageCircle size={16} className="text-purple-400" />
    };
    return icons[type] || icons.general;
  };

  return (
    <div className={`h-screen flex ${theme.bg} transition-colors duration-300`}>
      {/* Left Sidebar - Recent Chats */}
      <div className={`w-80 ${theme.cardBg} backdrop-blur-md border-r ${theme.border} flex flex-col`}>
        <div className="p-6 border-b border-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xl shadow-lg">
                💝
              </div>
              <div>
                <h2 className={`font-bold ${theme.text}`}>Mama Bear</h2>
                <p className={`text-sm ${theme.textTertiary}`}>Your AI Research Partner</p>
              </div>
            </div>
            <button
              onClick={startNewChat}
              className={`p-2 rounded-lg ${theme.button} transition-colors`}
              title="New Chat"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={16} />
            <input
              type="text"
              placeholder="Search conversations..."
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${theme.input} focus:border-purple-400 focus:outline-none transition-colors text-sm backdrop-blur-sm`}
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-4">
            <h3 className={`text-sm font-medium ${theme.textSecondary} mb-3`}>Recent Conversations</h3>
            <div className="space-y-2">
              {recentChats.map(chat => (
                <div
                  key={chat.id}
                  onClick={() => loadChat(chat)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-purple-100/50 dark:hover:bg-purple-900/20 border ${
                    selectedChat?.id === chat.id ? 'border-purple-400/50 bg-purple-100/50 dark:bg-purple-900/20' : 'border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <ChatTypeIcon type={chat.type} />
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium ${theme.text} text-sm truncate`}>{chat.title}</h4>
                      <p className={`text-xs ${theme.textTertiary} mt-1 line-clamp-2`}>{chat.lastMessage}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs ${theme.textTertiary}`}>{chat.timestamp}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400`}>
                          {chat.messageCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-purple-500/20">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg ${theme.button} transition-colors flex-1`}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className={`p-2 rounded-lg ${theme.button} transition-colors flex-1`}>
              <Settings size={16} />
            </button>
            <button 
              onClick={() => setShowBrowser(!showBrowser)}
              className={`p-2 rounded-lg ${theme.button} transition-colors flex-1 ${showBrowser ? 'bg-purple-100 dark:bg-purple-900/30' : ''}`}
            >
              <Globe size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col ${showBrowser ? 'w-1/2' : 'w-full'}`}>
        {/* Chat Header */}
        <div className={`p-6 border-b ${theme.border} ${theme.cardBg} backdrop-blur-md`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold bg-gradient-to-r ${theme.accent} bg-clip-text text-transparent`}>
                {selectedChat?.title || '💝 Main Conversation'}
              </h1>
              <p className={`${theme.textSecondary} mt-1`}>
                Powered by Gemini 2.5 • Connected to mem0 • Full MCP Access
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {showResearch && (
                <div className="flex items-center gap-2 px-3 py-1 bg-purple-100/50 dark:bg-purple-900/30 rounded-full backdrop-blur-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                  <span className="text-sm text-purple-600 dark:text-purple-400">Researching...</span>
                </div>
              )}
              
              <button className={`p-2 rounded-lg ${theme.button} transition-colors`}>
                <Bookmark size={18} />
              </button>
              <button className={`p-2 rounded-lg ${theme.button} transition-colors`}>
                <MoreVertical size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className={`w-24 h-24 rounded-2xl bg-gradient-to-r ${theme.accent} flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl`}>
                  💝
                </div>
                <h2 className={`text-2xl font-bold bg-gradient-to-r ${theme.accent} bg-clip-text text-transparent mb-3`}>Hello, Nathan!</h2>
                <p className={`${theme.textSecondary} leading-relaxed`}>
                  I'm your Mama Bear - your AI research partner with deep memory, web access, and the ability to coordinate with all your other AI assistants. What shall we explore together?
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-lg ${
                  message.sender === 'user' 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}>
                  {message.sender === 'user' ? '👤' : '💝'}
                </div>
                
                <div className={`flex-1 max-w-4xl ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-6 rounded-2xl ${
                    message.sender === 'user' 
                      ? 'bg-purple-100/50 dark:bg-purple-900/20 border border-purple-200/50 dark:border-purple-800/50' 
                      : `${theme.cardBg} border ${theme.border}`
                  } shadow-sm backdrop-blur-md`}>
                    <div className={`${theme.text} leading-relaxed whitespace-pre-wrap`}>
                      {message.text}
                    </div>
                    
                    {message.suggestions && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentMessage(suggestion)}
                            className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-sm hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {message.actions && (
                      <div className="mt-4 flex gap-2">
                        {message.actions.includes('search-web') && (
                          <button
                            onClick={() => handleWebSearch(currentMessage)}
                            className="flex items-center gap-2 px-3 py-2 bg-purple-100/50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-sm hover:bg-purple-200/50 dark:hover:bg-purple-900/50 transition-colors backdrop-blur-sm"
                          >
                            <Globe size={14} />
                            Search Web
                          </button>
                        )}
                        {message.actions.includes('draft-plan') && (
                          <button className="flex items-center gap-2 px-3 py-2 bg-pink-100/50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-lg text-sm hover:bg-pink-200/50 dark:hover:bg-pink-900/50 transition-colors backdrop-blur-sm">
                            <FileText size={14} />
                            Draft Plan
                          </button>
                        )}
                      </div>
                    )}
                    
                    <div className={`text-xs ${theme.textTertiary} mt-4 flex items-center justify-between`}>
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                      {message.sender === 'mama-bear' && (
                        <div className="flex gap-2">
                          <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                            <Copy size={12} />
                          </button>
                          <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                            <ThumbsUp size={12} />
                          </button>
                          <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                            <ThumbsDown size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isTyping && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-lg shadow-lg">
                💝
              </div>
              <div className={`p-6 rounded-2xl ${theme.cardBg} border ${theme.border} shadow-sm backdrop-blur-md`}>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className={`p-6 border-t ${theme.border} ${theme.cardBg} backdrop-blur-md`}>
          <div className="flex gap-4">
            {/* Multi-modal Controls */}
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`p-3 rounded-xl ${theme.button} transition-colors hover:scale-105`}
                title="Attach file"
              >
                <Paperclip size={18} />
              </button>
              <button
                onClick={() => imageInputRef.current?.click()}
                className={`p-3 rounded-xl ${theme.button} transition-colors hover:scale-105`}
                title="Upload image"
              >
                <Image size={18} />
              </button>
              <button className={`p-3 rounded-xl ${theme.button} transition-colors hover:scale-105`} title="Record voice">
                <Mic size={18} />
              </button>
              <button
                onClick={() => videoInputRef.current?.click()}
                className={`p-3 rounded-xl ${theme.button} transition-colors hover:scale-105`}
                title="Upload video"
              >
                <Video size={18} />
              </button>
            </div>

            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                value={currentMessage}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCurrentMessage(e.target.value)}
                placeholder="Ask Mama Bear anything... I can research, plan, analyze, or just chat!"
                onKeyPress={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                className={`w-full px-6 py-4 pr-16 rounded-xl border ${theme.input} focus:border-purple-400 focus:outline-none resize-none transition-colors backdrop-blur-sm`}
                rows={1}
                style={{ minHeight: '60px', maxHeight: '150px' }}
              />
              <button
                onClick={sendMessage}
                disabled={!currentMessage.trim()}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-3 bg-gradient-to-r ${theme.accent} rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105`}
              >
                <Send size={18} />
              </button>
            </div>
          </div>

          <div className={`text-xs ${theme.textTertiary} mt-2 text-center`}>
            💡 I have access to web search, your memory (mem0), MCP tools, and can coordinate with Scout & Workspaces Mama Bears
          </div>

          {/* Hidden file inputs */}
          <input ref={fileInputRef} type="file" hidden multiple />
          <input ref={imageInputRef} type="file" hidden accept="image/*" multiple />
          <input ref={videoInputRef} type="file" hidden accept="video/*" />
        </div>
      </div>

      {/* Browser Panel */}
      {showBrowser && (
        <div className={`w-1/2 ${theme.cardBg} backdrop-blur-md border-l ${theme.border} flex flex-col`}>
          <div className="p-4 border-b border-purple-500/20">
            <div className="flex items-center gap-3 mb-3">
              <Globe size={20} className="text-purple-500" />
              <h3 className={`font-semibold ${theme.text}`}>Shared Browser</h3>
              <button
                onClick={() => setShowBrowser(false)}
                className={`ml-auto p-1 rounded ${theme.button}`}
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="flex gap-2">
              <input
                type="url"
                value={browserUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBrowserUrl(e.target.value)}
                className={`flex-1 px-3 py-2 rounded-lg border ${theme.input} focus:border-purple-400 focus:outline-none`}
                placeholder="Enter URL or search query..."
              />
              <button className={`px-3 py-2 rounded-lg ${theme.button} transition-colors`}>
                <RefreshCw size={16} />
              </button>
              <button className={`px-3 py-2 rounded-lg ${theme.button} transition-colors`}>
                <ExternalLink size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1">
            {browserUrl ? (
              <iframe
                src={browserUrl}
                className="w-full h-full border-0"
                title="Shared Browser"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Globe size={48} className="text-purple-400 mx-auto mb-4" />
                  <h3 className={`text-lg font-semibold ${theme.text} mb-2`}>Shared Web Browser</h3>
                  <p className={theme.textSecondary}>
                    Both you and Mama Bear can navigate and view web content together
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MamaBearMainChat;