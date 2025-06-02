import React, { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  MessageCircle, Search, Globe, FileText, Image, Paperclip, Mic, Video,
  Send, Plus, Settings, Moon, Sun, MoreVertical, Bookmark, Star,
  ArrowRight, RefreshCw, ExternalLink, Copy, ThumbsUp, ThumbsDown,
  Folder, Clock, Zap, Brain, Target, MapPin, Users, Code2, Database,
  Check, XCircle, Info, X, ChevronRight, ChevronDown, AlertCircle,
} from 'lucide-react';

import mamaBearChatService from '../services/MamaBearChatService';
import { ChatSession, ChatMessage, ApiResponse } from '../types/chat';

// Enhanced interfaces combining ui-foundation sophistication with current backend integration
interface FormattedChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  created_at: Date;
  suggestions?: string[];
  type?: 'greeting' | 'response' | 'error';
  metadata?: any;
}

interface RecentChat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  messageCount: number;
  type: 'project' | 'research' | 'planning' | 'technical';
}

interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration: number;
}

interface MamaBearMainChatProps {
  className?: string;
}

// Theme interface for consistent styling
interface ThemeStyles {
  bg: string;
  cardBg: string;
  border: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  input: string;
  button: string;
  accent: string;
}

// Helper function to get theme styles
const getThemeStyles = (isDarkMode: boolean): ThemeStyles => {
  return {
    bg: isDarkMode ? 'bg-gray-900' : 'bg-gray-100',
    cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-gray-500' : 'text-gray-400',
    input: isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300',
    button: isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600',
    accent: isDarkMode ? 'text-purple-400' : 'text-purple-600',
  };
};

// Chat type icon component
const ChatTypeIcon: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'code':
      return <Code2 className="w-4 h-4" />;
    case 'web':
      return <Globe className="w-4 h-4" />;
    case 'image':
      return <Database className="w-4 h-4" />;
    case 'chat':
    default:
      return <MessageCircle className="w-4 h-4" />;
  }
};

// Toast component for notifications
const Toast: React.FC<{ 
  message: string; 
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}> = ({ 
  message, 
  type = 'info',
  onClose 
}) => {
  let bgColor = '';
  let textColor = '';
  let IconComponent;

  switch (type) {
    case 'success':
      bgColor = 'bg-green-600 dark:bg-green-700';
      textColor = 'text-white';
      IconComponent = Check;
      break;
    case 'error':
      bgColor = 'bg-red-600 dark:bg-red-700';
      textColor = 'text-white';
      IconComponent = XCircle;
      break;
    case 'info':
    default:
      bgColor = 'bg-purple-600 dark:bg-purple-700';
      textColor = 'text-white';
      IconComponent = Info;
      break;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${bgColor} ${textColor}`}
    >
      <IconComponent className="w-4 h-4" />
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

// Toast container component
const ToastContainer: React.FC<{ toasts: ToastProps[]; removeToast: (id: string) => void }> = ({
  toasts,
  removeToast,
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Main component
const MamaBearMainChat: React.FC<MamaBearMainChatProps> = ({ className }) => {
  // State management
  const [messages, setMessages] = useState<FormattedChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatSession, setActiveChatSession] = useState<ChatSession | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Theme
  const theme = getThemeStyles(isDarkMode);

  // Toast management
  const displayToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    const newToast: ToastProps = {
      id,
      message,
      type,
      duration: 5000,
    };
    
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      removeToast(id);
    }, newToast.duration);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat sessions on component mount
  useEffect(() => {
    loadChatSessions();
  }, []);

  // Load chat sessions
  const loadChatSessions = async () => {
    try {
      const response = await mamaBearChatService.getSessions();
      if (response.status === 'success' && response.data) {
        setChatSessions(response.data);
      } else {
        displayToast(`Failed to load chat sessions: ${response.error}`, 'error');
      }
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
      displayToast('Failed to load chat sessions', 'error');
    }
  };

  // Load messages for a chat session
  const loadChatMessages = async (sessionId: string) => {
    try {
      setIsLoading(true);
      const response = await mamaBearChatService.getMessages(sessionId);
      if (response.status === 'success' && response.data) {
        const formattedMessages: FormattedChatMessage[] = response.data.map(msg => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          timestamp: new Date(msg.created_at),
          created_at: new Date(msg.created_at),
          suggestions: msg.suggestions || []
        }));
        setMessages(formattedMessages);
      } else {
        displayToast(`Failed to load chat messages: ${response.error}`, 'error');
      }
    } catch (error) {
      console.error('Failed to load chat messages:', error);
      displayToast('Failed to load chat messages', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!inputValue.trim() || !activeChatSession) return;

    const userMessage: FormattedChatMessage = {
      id: `user-${Date.now()}`,
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
      created_at: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await mamaBearChatService.sendMessage(activeChatSession.id, inputValue);
      if (response.status === 'success' && response.data) {
        const assistantMessage: FormattedChatMessage = {
          id: response.data.id,
          content: response.data.content,
          role: 'assistant',
          timestamp: new Date(response.data.created_at),
          created_at: new Date(response.data.created_at),
          suggestions: response.data.suggestions || []
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        displayToast(`Failed to send message: ${response.error}`, 'error');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      displayToast('Failed to send message', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Create new chat session
  const createNewChat = async () => {
    try {
      const response = await mamaBearChatService.createSession('New Chat', 'chat');
      if (response.status === 'success' && response.data) {
        const newSession = response.data;
        setChatSessions(prev => [newSession, ...prev]);
        setActiveChatSession(newSession);
        setMessages([]);
        displayToast('New chat created', 'success');
      } else {
        displayToast(`Failed to create new chat: ${response.error}`, 'error');
      }
    } catch (error) {
      console.error('Failed to create new chat:', error);
      displayToast('Failed to create new chat', 'error');
    }
  };

  // Handle input change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Handle key press
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Select chat session
  const selectChatSession = (session: ChatSession) => {
    setActiveChatSession(session);
    loadChatMessages(session.id);
    displayToast(`Loaded chat: ${session.title}`, 'info');
  };

  // Web search handler
  const handleWebSearch = (query: string) => {
    displayToast(`Searching for: ${query}`, 'info');
    setInputValue(query);
  };

  return (
    <div className={`flex h-screen ${theme.bg} ${theme.text} ${className || ''}`}>
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Left sidebar - Chat History */}
      <div className={`${isLeftSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden ${theme.cardBg} ${theme.border} border-r flex flex-col`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Chat History</h2>
            <button
              onClick={createNewChat}
              className={`p-2 rounded-lg ${theme.button} text-white hover:opacity-90 transition-opacity`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {chatSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => selectChatSession(session)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                activeChatSession?.id === session.id
                  ? 'bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              } border ${theme.border}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <ChatTypeIcon type={session.type} />
                <span className="text-sm font-medium truncate">{session.title}</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(session.updated_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className={`${theme.cardBg} ${theme.border} border-b p-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {isLeftSidebarOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h1 className="text-xl font-bold">MamaBear Chat</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-4 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : `${theme.cardBg} ${theme.border} border`
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleWebSearch(suggestion)}
                        className="block w-full text-left text-xs p-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className={`p-4 rounded-lg ${theme.cardBg} ${theme.border} border`}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">MamaBear is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className={`${theme.cardBg} ${theme.border} border-t p-4`}>
          <div className="flex items-center gap-3">
            <div className={`flex-1 relative rounded-lg border ${theme.input}`}>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Ask MamaBear anything..."
                className={`w-full p-3 pr-12 rounded-lg ${theme.input} focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none`}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg ${theme.button} text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MamaBearMainChat;
