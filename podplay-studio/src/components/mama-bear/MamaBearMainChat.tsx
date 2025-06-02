'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle, Search, Globe, FileText, Image, Paperclip, Mic, Video,
  Send, Plus, Settings, Moon, Sun, MoreVertical, Bookmark, Star,
  ArrowRight, RefreshCw, ExternalLink, Copy, ThumbsUp, ThumbsDown,
  Folder, Clock, Zap, Brain, Target, MapPin, Users, Code2, Database,
  X, Minimize2, Maximize2, ChevronDown
} from 'lucide-react';
import { useChatStore } from '@/lib/stores/chat';
import { cn, formatTimestamp } from '@/lib/utils';
import { Message, Conversation } from '@/lib/api/client';
import { apiClient } from '@/lib/api/client';
import { getModelLogo, getLogo } from '@/lib/assets/logos';

export const MamaBearMainChat: React.FC = () => {
  const {
    isDarkMode,
    setIsDarkMode,
    currentMessage,
    setCurrentMessage,
    messages,
    addMessage,
    setMessages,
    isTyping,
    setIsTyping,
    recentConversations,
    setRecentConversations,
    showBrowser,
    setShowBrowser,
    browserUrl,
    setBrowserUrl,
    showResearch,
    setShowResearch,
    currentConversation,
    setCurrentConversation,
    attachedFiles,
    addAttachedFile,
    removeAttachedFile,
    clearInput
  } = useChatStore();

  const [selectedModel, setSelectedModel] = useState('gemini-1.5-pro');
  const [showModelSelector, setShowModelSelector] = useState(false);

  const availableModels = [
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', description: 'Latest multimodal model' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', description: 'Fast and powerful' },
    { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', description: 'Best for analysis' },
    { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', description: 'Most capable' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', description: 'Long context' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google', description: 'Fast responses' },
    { id: 'grok-beta', name: 'Grok Beta', provider: 'X.AI', description: 'Witty and real-time' }
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Initialize WebSocket connection and listeners
  useEffect(() => {
    const initializeConnection = async () => {
      try {
        await apiClient.initializeSocket();
        console.log('✅ WebSocket connected for MamaBearMainChat');
      } catch (error) {
        console.error('❌ Failed to initialize WebSocket:', error);
      }
    };

    initializeConnection();

    // Cleanup on unmount
    return () => {
      if (currentConversation?.id) {
        apiClient.leaveChatConversation(currentConversation.id);
      }
    };
  }, []);

  // Listen for new messages when conversation changes
  useEffect(() => {
    if (!currentConversation?.id) return;

    // Join the conversation room
    apiClient.joinChatConversation(currentConversation.id);

    // Listen for new messages
    const unsubscribe = apiClient.onNewMessage(currentConversation.id, (message: Message) => {
      console.log('📨 Received new message:', message);
      addMessage(message);
      if (message.sender === 'mama-bear') {
        setIsTyping(false);
      }
    });

    return () => {
      unsubscribe();
      apiClient.leaveChatConversation(currentConversation.id);
    };
  }, [currentConversation?.id, addMessage, setIsTyping]);

  const theme = {
    bg: isDarkMode ? 'bg-slate-900' : 'bg-podplay-gradient',
    cardBg: isDarkMode ? 'bg-slate-800/80' : 'bg-white/80',
    border: isDarkMode ? 'border-slate-700/50' : 'border-podplay-200/50',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-slate-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-slate-400' : 'text-gray-500',
    input: isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white' : 'bg-white/50 border-podplay-300/50 text-gray-900',
    button: isDarkMode ? 'bg-slate-700/50 hover:bg-slate-600/50' : 'bg-podplay-100/50 hover:bg-podplay-200/50',
    accent: 'from-podplay-500 to-podplay-600'
  };

  // Initialize with sample data
  useEffect(() => {
    const sampleChats: Conversation[] = [
      {
        id: '1',
        title: 'Podplay Studio Architecture',
        lastMessage: 'Let me draft the technical architecture for your multi-modal platform...',
        timestamp: '2 hours ago',
        messageCount: 47,
        type: 'project'
      },
      {
        id: '2',
        title: 'Scout Agent Development',
        lastMessage: 'I\'ve researched the latest autonomous agent patterns for you...',
        timestamp: 'Yesterday',
        messageCount: 23,
        type: 'research'
      },
      {
        id: '3',
        title: 'MCP Marketplace Strategy',
        lastMessage: 'Based on my analysis of existing marketplaces...',
        timestamp: '2 days ago',
        messageCount: 15,
        type: 'planning'
      },
      {
        id: '4',
        title: 'Accessibility & Sensory Design',
        lastMessage: 'I found some excellent resources on neurodivergent-friendly UX...',
        timestamp: '3 days ago',
        messageCount: 31,
        type: 'research'
      },
      {
        id: '5',
        title: 'AI Model Integration',
        lastMessage: 'Here\'s how we can optimize the Gemini 2.5 integration...',
        timestamp: 'Last week',
        messageCount: 19,
        type: 'technical'
      }
    ];

    setRecentConversations(sampleChats);
    
    // Initialize main chat if no conversation selected
    if (!currentConversation && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        sender: 'mama-bear',
        text: `Hello Nathan! 💝 Welcome to our sanctuary. I'm your Mama Bear - powered by Gemini 2.5 with all your memories, tools, and capabilities at my fingertips.\n\n🧠 **My Powers:**\n• Full access to your mem0 memory storage\n• Deep web research and analysis\n• MCP tool orchestration\n• Project planning and architecture\n• Connection to Scout and Workspaces Mama Bears\n\nWhat shall we explore together today? I'm here to research, plan, build, or simply chat about whatever's on your mind. 🌟`,
        timestamp: new Date(),
        type: 'greeting',
        suggestions: ['Research a new project idea', 'Plan the next Podplay feature', 'Analyze market trends', 'Draft technical architecture']
      };
      setMessages([welcomeMessage]);
    }
  }, [setRecentConversations, setMessages, currentConversation, messages.length]);

  const sendMessage = async () => {
    if (!currentMessage.trim() && attachedFiles.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: currentMessage,
      timestamp: new Date(),
      type: 'message',
      attachments: attachedFiles.map(file => ({
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size
      }))
    };

    // Add user message to UI immediately
    addMessage(userMessage);
    const messageText = currentMessage;
    clearInput();
    setIsTyping(true);

    try {
      // Use WebSocket to send message if we have a conversation
      if (currentConversation?.id) {
        await apiClient.sendMessage(currentConversation.id, {
          sender: 'user',
          text: messageText,
          type: 'message',
          attachments: userMessage.attachments
        });
      } else {
        // Create a new conversation if none exists
        const newConversation = await apiClient.createConversation('New Chat', 'general');
        setCurrentConversation(newConversation);
        setRecentConversations([newConversation, ...recentConversations]);
        
        // Join the new conversation and send the message
        apiClient.joinChatConversation(newConversation.id);
        await apiClient.sendMessage(newConversation.id, {
          sender: 'user',
          text: messageText,
          type: 'message',
          attachments: userMessage.attachments
        });
      }
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      setIsTyping(false);
      
      // Fallback to simulated response if WebSocket fails
      setTimeout(() => {
        const lowerMessage = messageText.toLowerCase();
        let response = '';
        let actions: string[] = [];

        if (lowerMessage.includes('research') || lowerMessage.includes('find') || lowerMessage.includes('analyze')) {
          response = `🔍 **Starting deep research for you...**\n\nI'm using my full capabilities:\n• Searching current web data\n• Cross-referencing with your memory\n• Analyzing patterns and trends\n• Preparing comprehensive findings\n\nLet me gather the most relevant and up-to-date information on this topic. I'll provide you with insights that connect to your existing projects and goals.`;
          actions = ['search-web', 'analyze-patterns'];
          setShowResearch(true);
        } else if (lowerMessage.includes('plan') || lowerMessage.includes('architecture') || lowerMessage.includes('design')) {
          response = `📋 **Excellent! Let me draft a comprehensive plan...**\n\nI'm drawing from:\n• Your previous project patterns (from mem0)\n• Current best practices and technologies\n• Your sensory preferences and workflow needs\n• Integration with your existing tools\n\nI'll create a detailed plan that I can then share with Scout Mama Bear or Workspaces Mama Bear for implementation. Would you like me to start with a high-level overview or dive into specific technical details?`;
          actions = ['draft-plan', 'analyze-requirements'];
        } else {
          response = `I'm here to help with whatever you need! 💝 \n\nAs your main Mama Bear, I can:\n• **Deep research** any topic with web search + memory\n• **Plan and architect** your projects\n• **Coordinate** with Scout and Workspaces Mama Bears\n• **Remember everything** with your mem0 storage\n• **Browse together** using our shared web preview\n\nWhat's on your mind today? I'm ready to dive deep into any project, research question, or planning challenge you have. 🚀`;
          actions = ['ready-to-help'];
        }

        setIsTyping(false);
        addMessage({
          id: (Date.now() + 1).toString(),
          sender: 'mama-bear',
          text: response,
          timestamp: new Date(),
          type: 'response',
          actions: actions,
          suggestions: actions.includes('search-web') ? 
            ['Browse relevant websites together', 'Analyze competitor solutions', 'Research latest trends'] :
            ['Continue planning', 'Start implementation', 'Research related topics']
        });
      }, 2000);
    }
  };

  const startNewChat = () => {
    const newChat: Conversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      lastMessage: '',
      timestamp: 'Just now',
      messageCount: 0,
      type: 'general'
    };
    setRecentConversations([newChat, ...recentConversations]);
    setCurrentConversation(newChat);
    setMessages([{
      id: '1',
      sender: 'mama-bear',
      text: `Fresh start! 💝 What shall we explore in this new conversation?`,
      timestamp: new Date(),
      type: 'greeting'
    }]);
  };

  const loadChat = (chat: Conversation) => {
    setCurrentConversation(chat);
    // In real implementation, load from mem0 storage
    setMessages([
      {
        id: '1',
        sender: 'mama-bear',
        text: `Welcome back to our "${chat.title}" conversation! 💝 I remember everything we discussed. Where would you like to continue?`,
        timestamp: new Date(),
        type: 'loaded'
      }
    ]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        addAttachedFile(file);
      });
    }
  };

  const ChatTypeIcon: React.FC<{ type: string }> = ({ type }) => {
    const icons = {
      project: <Folder size={16} className="text-podplay-500" />,
      research: <Search size={16} className="text-podplay-600" />,
      planning: <Target size={16} className="text-podplay-500" />,
      technical: <Code2 size={16} className="text-podplay-700" />,
      general: <MessageCircle size={16} className="text-podplay-400" />
    };
    return icons[type as keyof typeof icons] || icons.general;
  };

  return (
    <div className={cn('h-screen flex transition-colors duration-300', theme.bg)}>
      {/* Left Sidebar - Recent Chats */}
      <div className={cn('w-80 backdrop-blur-md border-r flex flex-col', theme.cardBg, theme.border)}>
        <div className="p-6 border-b border-podplay-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-podplay-500 to-podplay-600 flex items-center justify-center text-xl shadow-lg">
                💝
              </div>
              <div>
                <h2 className={cn('font-bold', theme.text)}>Mama Bear</h2>
                <p className={cn('text-sm', theme.textTertiary)}>Your AI Research Partner</p>
              </div>
            </div>
            <button
              onClick={startNewChat}
              className={cn('p-2 rounded-lg transition-colors', theme.button)}
              title="New Chat"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-podplay-400" size={16} />
            <input
              type="text"
              placeholder="Search conversations..."
              className={cn('w-full pl-10 pr-4 py-2 rounded-lg border focus:border-podplay-400 focus:outline-none transition-colors text-sm backdrop-blur-sm', theme.input)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-4">
            <h3 className={cn('text-sm font-medium mb-3', theme.textSecondary)}>Recent Conversations</h3>
            <div className="space-y-2">
              {recentConversations.map(chat => (
                <div
                  key={chat.id}
                  onClick={() => loadChat(chat)}
                  className={cn(
                    'p-3 rounded-lg cursor-pointer transition-all duration-200 border',
                    'hover:bg-podplay-100/50 dark:hover:bg-podplay-900/20',
                    currentConversation?.id === chat.id 
                      ? 'border-podplay-400/50 bg-podplay-100/50 dark:bg-podplay-900/20' 
                      : 'border-transparent'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <ChatTypeIcon type={chat.type} />
                    <div className="flex-1 min-w-0">
                      <h4 className={cn('font-medium text-sm truncate', theme.text)}>{chat.title}</h4>
                      <p className={cn('text-xs mt-1 line-clamp-2', theme.textTertiary)}>{chat.lastMessage}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={cn('text-xs', theme.textTertiary)}>{chat.timestamp}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-podplay-100 dark:bg-podplay-900/30 text-podplay-600 dark:text-podplay-400">
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

        <div className="p-4 border-t border-podplay-500/20">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={cn('p-2 rounded-lg transition-colors flex-1', theme.button)}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className={cn('p-2 rounded-lg transition-colors flex-1', theme.button)}>
              <Settings size={16} />
            </button>
            <button 
              onClick={() => setShowBrowser(!showBrowser)}
              className={cn(
                'p-2 rounded-lg transition-colors flex-1',
                theme.button,
                showBrowser ? 'bg-podplay-100 dark:bg-podplay-900/30' : ''
              )}
            >
              <Globe size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={cn('flex-1 flex flex-col', showBrowser ? 'w-1/2' : 'w-full')}>
        {/* Chat Header */}
        <div className={cn('p-6 border-b backdrop-blur-md', theme.border, theme.cardBg)}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={cn('text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent', theme.accent)}>
                {currentConversation?.title || '💝 Main Conversation'}
              </h1>
              <p className={cn('mt-1', theme.textSecondary)}>
                Powered by {availableModels.find(m => m.id === selectedModel)?.name} • Connected to mem0 • Full MCP Access
              </p>
            </div>
            
            {/* Model Selector */}
            <div className="relative">
              <button
                onClick={() => setShowModelSelector(!showModelSelector)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2 rounded-xl border transition-all duration-200',
                  'hover:bg-podplay-100/50 dark:hover:bg-podplay-900/20',
                  theme.border,
                  theme.button
                )}
              >
                <img 
                  src={getModelLogo(selectedModel).logoPath} 
                  alt={selectedModel}
                  className="w-6 h-6 rounded"
                />
                <div className="text-left">
                  <div className={cn('text-sm font-medium', theme.text)}>
                    {availableModels.find(m => m.id === selectedModel)?.name}
                  </div>
                  <div className={cn('text-xs', theme.textSecondary)}>
                    {availableModels.find(m => m.id === selectedModel)?.provider}
                  </div>
                </div>
                <ChevronDown 
                  size={16} 
                  className={cn(
                    'transition-transform duration-200',
                    showModelSelector ? 'rotate-180' : ''
                  )}
                />
              </button>

              {/* Model Dropdown */}
              {showModelSelector && (
                <div className={cn(
                  'absolute right-0 top-full mt-2 w-80 rounded-xl border shadow-xl z-50 overflow-hidden backdrop-blur-md',
                  theme.border,
                  theme.cardBg
                )}>
                  <div className="p-3 border-b border-podplay-500/20">
                    <h3 className={cn('font-medium text-sm', theme.text)}>Select AI Model</h3>
                    <p className={cn('text-xs mt-1', theme.textSecondary)}>Choose your preferred AI assistant</p>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {availableModels.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id);
                          setShowModelSelector(false);
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 transition-colors text-left',
                          'hover:bg-podplay-100/50 dark:hover:bg-podplay-900/20',
                          selectedModel === model.id ? 'bg-podplay-100/50 dark:bg-podplay-900/20' : ''
                        )}
                      >
                        <img 
                          src={getModelLogo(model.id).logoPath} 
                          alt={model.name}
                          className="w-8 h-8 rounded"
                        />
                        <div className="flex-1">
                          <div className={cn('font-medium text-sm', theme.text)}>{model.name}</div>
                          <div className={cn('text-xs', theme.textSecondary)}>{model.provider}</div>
                          <div className={cn('text-xs mt-1', theme.textTertiary)}>{model.description}</div>
                        </div>
                        {selectedModel === model.id && (
                          <div className="w-2 h-2 rounded-full bg-podplay-500"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {showResearch && (
                <div className="flex items-center gap-2 px-3 py-1 bg-podplay-100/50 dark:bg-podplay-900/30 rounded-full backdrop-blur-sm">
                  <div className="w-2 h-2 bg-podplay-500 rounded-full animate-pulse-soft"></div>
                  <span className={cn('text-sm', theme.textSecondary)}>Researching...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {messages.map(message => (
            <div
              key={message.id}
              className={cn(
                'flex gap-4',
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.sender === 'mama-bear' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-podplay-500 to-podplay-600 flex items-center justify-center text-sm flex-shrink-0">
                  💝
                </div>
              )}
              
              <div className={cn(
                'max-w-2xl rounded-2xl px-4 py-3 backdrop-blur-sm',
                message.sender === 'user'
                  ? 'bg-podplay-500 text-white ml-12'
                  : 'bg-white/80 dark:bg-slate-800/80 text-gray-900 dark:text-white mr-12'
              )}>
                <div className="whitespace-pre-wrap">{message.text}</div>
                
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.attachments.map(attachment => (
                      <div key={attachment.id} className="text-xs opacity-75">
                        📎 {attachment.name}
                      </div>
                    ))}
                  </div>
                )}
                
                {message.suggestions && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentMessage(suggestion)}
                        className="text-xs px-2 py-1 rounded-full bg-podplay-100/50 hover:bg-podplay-200/50 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="mt-2 text-xs opacity-50">
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
              
              {message.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm flex-shrink-0">
                  👤
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-podplay-500 to-podplay-600 flex items-center justify-center text-sm">
                💝
              </div>
              <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl px-4 py-3 backdrop-blur-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-podplay-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-podplay-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-podplay-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className={cn('p-6 border-t backdrop-blur-md', theme.border, theme.cardBg)}>
          {/* Attached Files */}
          {attachedFiles.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {attachedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 bg-podplay-100/50 dark:bg-podplay-900/30 rounded-lg text-sm"
                >
                  <Paperclip size={14} />
                  <span>{file.name}</span>
                  <button
                    onClick={() => removeAttachedFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Message Mama Bear..."
                className={cn(
                  'w-full px-4 py-3 rounded-xl border resize-none focus:outline-none focus:border-podplay-400 transition-colors backdrop-blur-sm',
                  theme.input
                )}
                rows={1}
              />
            </div>
            
            {/* File Upload Buttons */}
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                multiple
              />
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                multiple
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className={cn('p-2 rounded-lg transition-colors', theme.button)}
                title="Upload File"
              >
                <Paperclip size={18} />
              </button>
              
              <button
                onClick={() => imageInputRef.current?.click()}
                className={cn('p-2 rounded-lg transition-colors', theme.button)}
                title="Upload Image"
              >
                <Image size={18} />
              </button>
              
              <button
                onClick={() => audioInputRef.current?.click()}
                className={cn('p-2 rounded-lg transition-colors', theme.button)}
                title="Record Audio"
              >
                <Mic size={18} />
              </button>
              
              <button
                onClick={() => videoInputRef.current?.click()}
                className={cn('p-2 rounded-lg transition-colors', theme.button)}
                title="Record Video"
              >
                <Video size={18} />
              </button>
              
              <button
                onClick={sendMessage}
                disabled={!currentMessage.trim() && attachedFiles.length === 0}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  currentMessage.trim() || attachedFiles.length > 0
                    ? 'bg-gradient-to-r from-podplay-500 to-podplay-600 text-white hover:from-podplay-600 hover:to-podplay-700'
                    : theme.button
                )}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Shared Browser Panel */}
      {showBrowser && (
        <div className={cn('w-1/2 flex flex-col border-l backdrop-blur-md', theme.border, theme.cardBg)}>
          <div className="p-4 border-b border-podplay-500/20">
            <div className="flex items-center gap-3">
              <Globe size={20} className="text-podplay-500" />
              <input
                type="url"
                value={browserUrl}
                onChange={(e) => setBrowserUrl(e.target.value)}
                placeholder="Enter URL to browse together..."
                className={cn('flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:border-podplay-400 transition-colors text-sm', theme.input)}
              />
              <button
                onClick={() => setShowBrowser(false)}
                className={cn('p-2 rounded-lg transition-colors', theme.button)}
              >
                <X size={16} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 bg-white">
            {browserUrl ? (
              <iframe
                src={browserUrl}
                className="w-full h-full border-0"
                title="Shared Browser"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Globe size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Enter a URL above to start browsing together</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
