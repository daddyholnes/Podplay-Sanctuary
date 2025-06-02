import React, { useState, useEffect, useRef, ChangeEvent, KeyboardEvent, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  X, 
  Check, 
  CheckCircle,
  Code2,
  Database,
  Globe,
  Info,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  Trash,
  XCircle,
  Settings as SettingsIcon,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Loader,
  RefreshCcw,
  Send,
  Brain,
  Sun,
  Moon,
  Star,
  ArrowRight,
  LogOut,
  Save,
  FileText,
  Image,
  Clock,
  AlignLeft,
  User,
  Bot
} from 'lucide-react';

// Import MamaBear chat service
import { mamaBearChatService } from '../services/mamaBearChatService';
import { getSessionMenuItems as getSessionMenuItemsFromActions } from '../components/MamaBearSessionActions';

// Import types
import { 
  ChatSession, 
  ChatMessage, 
  FormattedChatMessage, 
  ApiResponse, 
  ToastProps, 
  MenuItem, 
  ThemeStyles 
} from '../types/chatTypes';

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

// Theme helper hook for dark mode management
const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) return savedMode === 'true';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString());
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  return { isDarkMode, toggleDarkMode };
};

// Function to get theme styles based on dark mode
const getThemeStyles = (isDarkMode: boolean): ThemeStyles => {
  return {
    bg: isDarkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50',
    cardBg: isDarkMode ? 'bg-slate-800/80' : 'bg-white/80',
    border: isDarkMode ? 'border-slate-700/50' : 'border-purple-200/50',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-slate-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-slate-400' : 'text-gray-500',
    input: isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white' : 'bg-white/50 border-purple-300/50 text-gray-900',
    button: isDarkMode ? 'bg-slate-700/50 hover:bg-slate-600/50' : 'bg-purple-100/50 hover:bg-purple-200/50',
    accent: 'from-purple-500 to-pink-500',
  };
};

// UI Components

// Main MamaBearMainChat component
const MamaBearMainChat: React.FC<MamaBearMainChatProps> = ({ className = '' }) => {
  // Theme management
  const { isDarkMode, toggleDarkMode } = useTheme();
  const styles = getThemeStyles(isDarkMode);

  // State hooks
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeChat, setActiveChat] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<FormattedChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [newChatType, setNewChatType] = useState<ChatSession['type']>('chat');
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sessionMenuOpen, setSessionMenuOpen] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Load sessions on component mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Automatically dismiss toasts after their duration
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    toasts.forEach(toast => {
      const timer = setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration);
      timers.push(timer);
    });
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [toasts]);

  // Helper functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const displayToast = (message: string, type: ToastProps['type'] = 'info', variant?: ToastProps['variant'], duration = 5000) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type, variant, duration }]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const response = await mamaBearChatService.getSessions();
      if (response.status === 'success') {
        setSessions(response.data);
        // Select the most recent session if available
        if (response.data.length > 0 && !activeChat) {
          // Sort by updated_at, most recent first
          const sortedSessions = [...response.data].sort((a, b) => 
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          );
          selectSession(sortedSessions[0]);
        }
      } else {
        displayToast(`Failed to load sessions: ${response.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      displayToast(`Error loading sessions: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (sessionId: string) => {
    setIsLoading(true);
    try {
      const response = await mamaBearChatService.getMessages(sessionId);
      if (response.status === 'success') {
        // Format messages
        const formattedMessages: FormattedChatMessage[] = response.data.map(msg => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          session_id: msg.session_id,
          created_at: new Date(msg.created_at),
          suggestions: msg.metadata?.suggestions || [],
          actions: msg.metadata?.actions || [],
        }));
        setMessages(formattedMessages);
      } else {
        displayToast(`Failed to load messages: ${response.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      displayToast(`Error loading messages: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const selectSession = (session: ChatSession) => {
    setActiveChat(session);
    loadMessages(session.id);
  };

  const createSession = async () => {
    if (!newChatName.trim()) {
      displayToast('Please enter a name for the new chat', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await mamaBearChatService.createSession(newChatName, newChatType);
      if (response.status === 'success') {
        setSessions(prev => [...prev, response.data]);
        selectSession(response.data);
        setIsCreatingChat(false);
        setNewChatName('');
        displayToast('New chat created successfully', 'success', 'purple');
      } else {
        displayToast(`Failed to create chat: ${response.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      displayToast(`Error creating chat: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !activeChat) return;

    // Add user message to chat
    const userMessage: FormattedChatMessage = {
      id: `temp-${Date.now()}`,
      content: inputValue,
      role: 'user',
      session_id: activeChat.id,
      created_at: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Add assistant loading message
    const loadingMessage: FormattedChatMessage = {
      id: `loading-${Date.now()}`,
      content: '',
      role: 'assistant',
      session_id: activeChat.id,
      created_at: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, loadingMessage]);

    try {
      const response = await mamaBearChatService.sendMessage(activeChat.id, inputValue);
      if (response.status === 'success') {
        // Replace loading message with actual response
        setMessages(prev => prev.filter(msg => !msg.isLoading).concat({
          id: response.data.id,
          content: response.data.content,
          role: response.data.role,
          session_id: response.data.session_id,
          created_at: new Date(response.data.created_at),
          suggestions: response.data.metadata?.suggestions || [],
          actions: response.data.metadata?.actions || [],
        }));
      } else {
        // Replace loading message with error
        setMessages(prev => prev.filter(msg => !msg.isLoading).concat({
          id: `error-${Date.now()}`,
          content: 'Sorry, there was an error generating a response.',
          role: 'assistant',
          session_id: activeChat.id,
          created_at: new Date(),
          isError: true,
        }));
        displayToast(`Error sending message: ${response.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      // Replace loading message with error
      setMessages(prev => prev.filter(msg => !msg.isLoading).concat({
        id: `error-${Date.now()}`,
        content: 'Sorry, there was an error generating a response.',
        role: 'assistant',
        session_id: activeChat.id,
        created_at: new Date(),
        isError: true,
      }));
      displayToast(`Error sending message: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Filtered sessions for search
  const filteredSessions = searchQuery.trim() === ''
    ? sessions
    : sessions.filter(session => 
        session.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Session menu items
  const getSessionMenuItems = (session: ChatSession): MenuItem[] => [
    {
      id: 'rename',
      label: 'Rename',
      icon: <FileText size={16} />,
      onClick: () => {/* TODO: Implement rename */}
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash size={16} />,
      onClick: () => {/* TODO: Implement delete */}
    },
    {
      id: 'export',
      label: 'Export',
      icon: <Save size={16} />,
      onClick: () => {/* TODO: Implement export */}
    }
  ];

  // Main menu items
  const menuItems: MenuItem[] = [
    {
      id: 'new-chat',
      label: 'New Chat',
      icon: <Plus size={16} />,
      onClick: () => setIsCreatingChat(true)
    },
    {
      id: 'toggle-theme',
      label: isDarkMode ? 'Light Mode' : 'Dark Mode',
      icon: isDarkMode ? <Sun size={16} /> : <Moon size={16} />,
      onClick: toggleDarkMode
    },
    { id: 'divider-1', type: 'divider', label: '', onClick: () => {} },
    {
      id: 'settings',
      label: 'Settings',
      icon: <SettingsIcon size={16} />,
      onClick: () => setShowSettings(true)
    },
    {
      id: 'help',
      label: 'Help',
      icon: <Info size={16} />,
      onClick: () => displayToast('Help system coming soon!', 'info', 'purple')
    }
  ];

  // Render functions
  const renderChatMessage = (message: FormattedChatMessage) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';
    
    return (
      <div 
        key={message.id} 
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div 
          className={`relative max-w-3/4 px-4 py-3 rounded-lg ${isUser
            ? `bg-gradient-to-r ${styles.accent} text-white`
            : isSystem
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-200'
              : `${styles.cardBg} ${styles.text} border ${styles.border}`
          }`}
        >
          {message.isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader className="animate-spin" size={16} />
              <span>Generating response...</span>
            </div>
          ) : (
            <>
              <div className="whitespace-pre-wrap">{message.content}</div>
              
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs font-medium">Suggestions:</div>
                  <div className="flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, idx) => (
                      <Button 
                        key={idx} 
                        variant="ghost" 
                        className="py-1 px-2 text-xs" 
                        onClick={() => {
                          setInputValue(suggestion);
                        }}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {message.actions && message.actions.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs font-medium">Actions:</div>
                  <div className="flex flex-wrap gap-2">
                    {message.actions.map((action, idx) => (
                      <Button 
                        key={idx} 
                        variant="purple" 
                        className="py-1 px-2 text-xs"
                        onClick={() => {
                          // TODO: Implement action handling
                          displayToast(`Action '${action}' clicked`, 'info');
                        }}
                      >
                        {action}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          
          <div className="text-xs opacity-70 mt-2 flex justify-end">
            {message.created_at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    );
  };

  // Render the UI
  return (
    <div className={`flex h-full overflow-hidden ${styles.bg} ${styles.text} ${className}`}>
      {/* Sessions sidebar */}
      <div className={`w-64 border-r ${styles.border} flex flex-col`}>
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-medium">Mama Bear Chat</h2>
          <Dropdown
            trigger={
              <button className="p-2 rounded-full hover:bg-black/10 transition-colors">
                <Menu size={20} />
              </button>
            }
            items={menuItems}
            isOpen={menuOpen}
            setIsOpen={setMenuOpen}
          />
        </div>
        
        <div className="p-2">
          <div className="relative mb-3">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          
          <Button 
            variant="purple" 
            className="w-full mb-3"
            onClick={() => setIsCreatingChat(true)}
          >
            <Plus className="mr-2" size={16} /> New Chat
          </Button>
        </div>
        
        <div className="flex-1 overflow-auto">
          {filteredSessions.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchQuery ? 'No matching chats found' : 'No chats yet'}
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredSessions.map(session => (
                <div key={session.id} className="relative">
                  <button
                    className={`w-full text-left p-3 rounded-lg flex items-center gap-2 transition-colors ${activeChat?.id === session.id
                      ? 'bg-purple-100/50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                    onClick={() => selectSession(session)}
                  >
                    <ChatTypeIcon type={session.type} />
                    <span className="flex-1 truncate">{session.name}</span>
                    <button
                      className="p-1 rounded-full hover:bg-black/10 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSessionMenuOpen(sessionMenuOpen === session.id ? null : session.id);
                      }}
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </button>
                  
                  {sessionMenuOpen === session.id && (
                    <Dropdown
                      trigger={<></>}
                      items={getSessionMenuItems(session)}
                      isOpen={true}
                      setIsOpen={(open) => {
                        if (!open) setSessionMenuOpen(null);
                      }}
                      className="absolute right-8 top-0"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {!activeChat ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md p-8">
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Welcome to Mama Bear Chat
              </h2>
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                Your personal AI assistant and guide. Select a chat from the sidebar or create a new one to get started.
              </p>
              <Button 
                variant="purple" 
                onClick={() => setIsCreatingChat(true)}
              >
                <Plus className="mr-2" size={18} /> Create New Chat
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className={`p-4 border-b ${styles.border} flex justify-between items-center`}>
              <div className="flex items-center gap-2">
                <ChatTypeIcon type={activeChat.type} size={20} />
                <h2 className="font-medium">{activeChat.name}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  className="p-2 rounded-full hover:bg-black/10 transition-colors"
                  title="Refresh"
                  onClick={() => loadMessages(activeChat.id)}
                >
                  <RefreshCcw size={18} />
                </button>
              </div>
            </div>
            
            {/* Messages area */}
            <div className="flex-1 overflow-auto p-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center max-w-md p-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      No messages yet. Start the conversation by sending a message below.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map(renderChatMessage)}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            {/* Input area */}
            <div className={`p-4 border-t ${styles.border}`}>
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  multiline
                  rows={2}
                  className="flex-1"
                />
                <Button
                  variant="purple"
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="self-end"
                >
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Create chat modal */}
      <Modal
        isOpen={isCreatingChat}
        onClose={() => setIsCreatingChat(false)}
        title="Create New Chat"
      >
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Chat Name</label>
            <Input
              value={newChatName}
              onChange={(e) => setNewChatName(e.target.value)}
              placeholder="Enter chat name"
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium">Chat Type</label>
            <div className="grid grid-cols-2 gap-2">
              {['chat', 'code', 'web', 'image'].map(type => (
                <button
                  key={type}
                  className={`p-3 border rounded-lg flex items-center gap-2 ${newChatType === type
                    ? 'bg-purple-100 border-purple-300 text-purple-700 dark:bg-purple-900/20 dark:border-purple-700 dark:text-purple-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setNewChatType(type as ChatSession['type'])}
                >
                  <ChatTypeIcon type={type} />
                  <span className="capitalize">{type}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button 
              variant="ghost" 
              onClick={() => setIsCreatingChat(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="purple" 
              onClick={createSession}
              disabled={!newChatName.trim() || isLoading}
            >
              {isLoading ? <Loader className="animate-spin mr-2" size={16} /> : null}
              Create
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Settings modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Settings"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
              {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
              <span>Dark Mode</span>
            </div>
            <button
              className={`w-12 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-purple-500' : 'bg-gray-300'}`}
              onClick={toggleDarkMode}
            >
              <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${isDarkMode ? 'translate-x-6' : ''}`} />
            </button>
          </div>
          
          {/* Additional settings would go here */}
          
          <div className="flex justify-end gap-2 mt-6">
            <Button 
              variant="purple" 
              onClick={() => setShowSettings(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Toast container */}
      <ToastContainer 
        toasts={toasts} 
        removeToast={removeToast} 
        position="top-right"
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center gap-3 shadow-xl">
            <Loader className="animate-spin text-purple-500" size={24} />
            <span>Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Toast component
const Toast: React.FC<{ 
  message: string; 
  type?: 'success' | 'error' | 'info';
  variant?: 'purple' | 'default';
  onClose?: () => void;
}> = ({ 
  message, 
  type = 'info',
  variant = 'default',
  onClose 
}) => {
  let bgColor = '';
  let textColor = '';
  let borderColor = '';
  let Icon = Info;

  if (variant === 'purple') {
    bgColor = 'bg-gradient-to-r from-purple-500 to-pink-500';
    textColor = 'text-white';
    borderColor = 'border-purple-400';
  } else {
    switch (type) {
      case 'success':
        bgColor = 'bg-green-100 dark:bg-green-900/30';
        textColor = 'text-green-800 dark:text-green-200';
        borderColor = 'border-green-200 dark:border-green-800';
        Icon = CheckCircle;
        break;
      case 'error':
        bgColor = 'bg-red-100 dark:bg-red-900/30';
        textColor = 'text-red-800 dark:text-red-200';
        borderColor = 'border-red-200 dark:border-red-800';
        Icon = XCircle;
        break;
      case 'info':
      default:
        bgColor = 'bg-blue-100 dark:bg-blue-900/30';
        textColor = 'text-blue-800 dark:text-blue-200';
        borderColor = 'border-blue-200 dark:border-blue-800';
        Icon = Info;
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex items-center p-3 mb-3 rounded-lg border ${bgColor} ${textColor} ${borderColor} shadow-lg`}
    >
      <Icon className="mr-2 flex-shrink-0" size={18} />
      <p className="text-sm flex-grow">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 p-1 rounded-full hover:bg-black/10 transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      )}
    </motion.div>
  );
};

// Toast container component
const ToastContainer: React.FC<{ 
  toasts: ToastProps[]; 
  removeToast?: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}> = ({ 
  toasts, 
  removeToast,
  position = 'top-right' 
}) => {
  let positionClasses = 'top-4 right-4';
  switch (position) {
    case 'top-left':
      positionClasses = 'top-4 left-4';
      break;
    case 'bottom-right':
      positionClasses = 'bottom-4 right-4';
      break;
    case 'bottom-left':
      positionClasses = 'bottom-4 left-4';
      break;
    default:
      positionClasses = 'top-4 right-4';
  }

  return (
    <div className={`fixed z-50 flex flex-col ${positionClasses} max-w-sm`}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast 
            key={toast.id} 
            message={toast.message} 
            type={toast.type} 
            variant={toast.variant}
            onClose={removeToast ? () => removeToast(toast.id) : undefined} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Button component
const Button: React.FC<{
  onClick?: () => void;
  variant?: 'purple' | 'primary' | 'secondary' | 'ghost' | 'outline';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
  children: React.ReactNode;
}> = ({
  onClick,
  variant = 'primary',
  className = '',
  children,
  disabled = false,
  type = 'button',
  title,
}) => {
  let variantClasses = '';

  switch (variant) {
    case 'purple':
      variantClasses = 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600';
      break;
    case 'primary':
      variantClasses = 'bg-blue-500 text-white hover:bg-blue-600';
      break;
    case 'secondary':
      variantClasses = 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600';
      break;
    case 'ghost':
      variantClasses = 'bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/50';
      break;
    case 'outline':
      variantClasses = 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800/50';
      break;
  }

  return (
    <button
      type={type}
      className={`px-4 py-2 rounded-lg transition-colors ${variantClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
};

// Input component
const Input: React.FC<{
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
}> = ({
  value,
  onChange,
  onKeyDown,
  placeholder = '',
  className = '',
  type = 'text',
  multiline = false,
  rows = 3
}) => {
  const baseClasses = 'w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-colors';
  const themeClasses = 'bg-white/50 border-purple-200 text-gray-900 dark:bg-gray-800/50 dark:border-gray-700 dark:text-white';
  
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={`${baseClasses} ${themeClasses} ${className}`}
        rows={rows}
      />
    );
  }

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className={`${baseClasses} ${themeClasses} ${className}`}
    />
  );
};

// Panel component
const Panel: React.FC<{
  title?: string;
  headerRight?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
  children: React.ReactNode;
}> = ({
  title,
  headerRight,
  className = '',
  bodyClassName = '',
  headerClassName = '',
  children
}) => {
  return (
    <div className={`flex flex-col border rounded-lg shadow-sm overflow-hidden ${className}`}>
      {title && (
        <div className={`flex justify-between items-center p-3 border-b ${headerClassName}`}>
          <h3 className="font-medium">{title}</h3>
          {headerRight}
        </div>
      )}
      <div className={`flex-1 p-3 overflow-auto ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};

// Modal component
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

// Dropdown component
const Dropdown: React.FC<{
  trigger: React.ReactNode;
  items: MenuItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  className?: string;
}> = ({
  trigger,
  items,
  isOpen,
  setIsOpen,
  className = ''
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsOpen]);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10"
          >
            <div className="py-1">
              {items.map((item) => (
                item.type === 'divider' ? (
                  <div key={item.id} className="border-t border-gray-200 dark:border-gray-700 my-1" />
                ) : (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.onClick();
                      setIsOpen(false);
                    }}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.label}
                  </button>
                )
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Function to get theme styles based on dark mode
const getThemeStyles = (isDarkMode: boolean): ThemeStyles => {
  return {
    bg: isDarkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50',
    cardBg: isDarkMode ? 'bg-slate-800/80' : 'bg-white/80',
    border: isDarkMode ? 'border-slate-700/50' : 'border-purple-200/50',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-slate-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-slate-400' : 'text-gray-500',
    input: isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white' : 'bg-white/50 border-purple-300/50 text-gray-900',
    button: isDarkMode ? 'bg-slate-700/50 hover:bg-slate-600/50' : 'bg-purple-100/50 hover:bg-purple-200/50',
    accent: 'from-purple-500 to-pink-500',
  };
};

// Main MamaBearMainChat component
const MamaBearMainChat: React.FC<MamaBearMainChatProps> = ({ className = '' }) => {
  // Theme management
  const { isDarkMode, toggleDarkMode } = useTheme();
  const styles = getThemeStyles(isDarkMode);

  // State hooks
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeChat, setActiveChat] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<FormattedChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [newChatType, setNewChatType] = useState<ChatSession['type']>('chat');
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sessionMenuOpen, setSessionMenuOpen] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Load sessions on component mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Automatically dismiss toasts after their duration
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    toasts.forEach(toast => {
      const timer = setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration);
      timers.push(timer);
    });
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [toasts]);

  // Helper functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const displayToast = (message: string, type: ToastProps['type'] = 'info', variant?: ToastProps['variant'], duration = 5000) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type, variant, duration }]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const response = await mamaBearChatService.getSessions();
      if (response.status === 'success') {
        setSessions(response.data);
        // Select the most recent session if available
        if (response.data.length > 0 && !activeChat) {
          // Sort by updated_at, most recent first
          const sortedSessions = [...response.data].sort((a, b) => 
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          );
          selectSession(sortedSessions[0]);
        }
      } else {
        displayToast(`Failed to load sessions: ${response.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      displayToast(`Error loading sessions: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (sessionId: string) => {
    setIsLoading(true);
    try {
      const response = await mamaBearChatService.getMessages(sessionId);
      if (response.status === 'success') {
        // Format messages
        const formattedMessages: FormattedChatMessage[] = response.data.map(msg => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          session_id: msg.session_id,
          created_at: new Date(msg.created_at),
          suggestions: msg.metadata?.suggestions || [],
          actions: msg.metadata?.actions || [],
        }));
        setMessages(formattedMessages);
      } else {
        displayToast(`Failed to load messages: ${response.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      displayToast(`Error loading messages: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const selectSession = (session: ChatSession) => {
    setActiveChat(session);
    loadMessages(session.id);
  };

  const createSession = async () => {
    if (!newChatName.trim()) {
      displayToast('Please enter a name for the new chat', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await mamaBearChatService.createSession(newChatName, newChatType);
      if (response.status === 'success') {
        setSessions(prev => [...prev, response.data]);
        selectSession(response.data);
        setIsCreatingChat(false);
        setNewChatName('');
        displayToast('New chat created successfully', 'success', 'purple');
      } else {
        displayToast(`Failed to create chat: ${response.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      displayToast(`Error creating chat: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !activeChat) return;

    // Add user message to chat
    const userMessage: FormattedChatMessage = {
      id: `temp-${Date.now()}`,
      content: inputValue,
      role: 'user',
      session_id: activeChat.id,
      created_at: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Add assistant loading message
    const loadingMessage: FormattedChatMessage = {
      id: `loading-${Date.now()}`,
      content: '',
      role: 'assistant',
      session_id: activeChat.id,
      created_at: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, loadingMessage]);

    try {
      const response = await mamaBearChatService.sendMessage(activeChat.id, inputValue);
      if (response.status === 'success') {
        // Replace loading message with actual response
        setMessages(prev => prev.filter(msg => !msg.isLoading).concat({
          id: response.data.id,
          content: response.data.content,
          role: response.data.role,
          session_id: response.data.session_id,
          created_at: new Date(response.data.created_at),
          suggestions: response.data.metadata?.suggestions || [],
          actions: response.data.metadata?.actions || [],
        }));
      } else {
        // Replace loading message with error
        setMessages(prev => prev.filter(msg => !msg.isLoading).concat({
          id: `error-${Date.now()}`,
          content: 'Sorry, there was an error generating a response.',
          role: 'assistant',
          session_id: activeChat.id,
          created_at: new Date(),
          isError: true,
        }));
        displayToast(`Error sending message: ${response.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      // Replace loading message with error
      setMessages(prev => prev.filter(msg => !msg.isLoading).concat({
        id: `error-${Date.now()}`,
        content: 'Sorry, there was an error generating a response.',
        role: 'assistant',
        session_id: activeChat.id,
        created_at: new Date(),
        isError: true,
      }));
      displayToast(`Error sending message: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Filtered sessions for search
  const filteredSessions = searchQuery.trim() === ''
    ? sessions
    : sessions.filter(session => 
        session.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Session menu items
  const getSessionMenuItems = (session: ChatSession): MenuItem[] => [
    {
      id: 'rename',
      label: 'Rename',
      icon: <FileText size={16} />,
      onClick: () => {/* TODO: Implement rename */}
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash size={16} />,
      onClick: () => {/* TODO: Implement delete */}
    },
    {
      id: 'export',
      label: 'Export',
      icon: <Save size={16} />,
      onClick: () => {/* TODO: Implement export */}
    }
  ];

  // Main menu items
  const menuItems: MenuItem[] = [
    {
      id: 'new-chat',
      label: 'New Chat',
      icon: <Plus size={16} />,
      onClick: () => setIsCreatingChat(true)
    },
    {
      id: 'toggle-theme',
      label: isDarkMode ? 'Light Mode' : 'Dark Mode',
      icon: isDarkMode ? <Sun size={16} /> : <Moon size={16} />,
      onClick: toggleDarkMode
    },
    { id: 'divider-1', type: 'divider', label: '', onClick: () => {} },
    {
      id: 'settings',
      label: 'Settings',
      icon: <SettingsIcon size={16} />,
      onClick: () => setShowSettings(true)
    },
    {
      id: 'help',
      label: 'Help',
      icon: <Info size={16} />,
      onClick: () => displayToast('Help system coming soon!', 'info', 'purple')
    }
  ];

  // Render functions
  const renderChatMessage = (message: FormattedChatMessage) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';
    
    return (
      <div 
        key={message.id} 
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div 
          className={`relative max-w-3/4 px-4 py-3 rounded-lg ${isUser
            ? `bg-gradient-to-r ${styles.accent} text-white`
            : isSystem
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-200'
              : `${styles.cardBg} ${styles.text} border ${styles.border}`
          }`}
        >
          {message.isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader className="animate-spin" size={16} />
              <span>Generating response...</span>
            </div>
          ) : (
            <>
              <div className="whitespace-pre-wrap">{message.content}</div>
              
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs font-medium">Suggestions:</div>
                  <div className="flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, idx) => (
                      <Button 
                        key={idx} 
                        variant="ghost" 
                        className="py-1 px-2 text-xs" 
                        onClick={() => {
                          setInputValue(suggestion);
                        }}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {message.actions && message.actions.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs font-medium">Actions:</div>
                  <div className="flex flex-wrap gap-2">
                    {message.actions.map((action, idx) => (
                      <Button 
                        key={idx} 
                        variant="purple" 
                        className="py-1 px-2 text-xs"
                        onClick={() => {
                          // TODO: Implement action handling
                          displayToast(`Action '${action}' clicked`, 'info');
                        }}
                      >
                        {action}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          
          <div className="text-xs opacity-70 mt-2 flex justify-end">
            {message.created_at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    );
  };

  // Render the UI
  return (
    <div className={`flex h-full overflow-hidden ${styles.bg} ${styles.text} ${className}`}>
      {/* Sessions sidebar */}
      <div className={`w-64 border-r ${styles.border} flex flex-col`}>
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-medium">Mama Bear Chat</h2>
          <Dropdown
            trigger={
              <button className="p-2 rounded-full hover:bg-black/10 transition-colors">
                <Menu size={20} />
              </button>
            }
            items={menuItems}
            isOpen={menuOpen}
            setIsOpen={setMenuOpen}
          />
        </div>
        
        <div className="p-2">
          <div className="relative mb-3">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          
          <Button 
            variant="purple" 
            className="w-full mb-3"
            onClick={() => setIsCreatingChat(true)}
          >
            <Plus className="mr-2" size={16} /> New Chat
          </Button>
        </div>
        
        <div className="flex-1 overflow-auto">
          {filteredSessions.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchQuery ? 'No matching chats found' : 'No chats yet'}
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredSessions.map(session => (
                <div key={session.id} className="relative">
                  <button
                    className={`w-full text-left p-3 rounded-lg flex items-center gap-2 transition-colors ${activeChat?.id === session.id
                      ? 'bg-purple-100/50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                    onClick={() => selectSession(session)}
                  >
                    <ChatTypeIcon type={session.type} />
                    <span className="flex-1 truncate">{session.name}</span>
                    <button
                      className="p-1 rounded-full hover:bg-black/10 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSessionMenuOpen(sessionMenuOpen === session.id ? null : session.id);
                      }}
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </button>
                  
                  {sessionMenuOpen === session.id && (
                    <Dropdown
                      trigger={<></>}
                      items={getSessionMenuItems(session)}
                      isOpen={true}
                      setIsOpen={(open) => {
                        if (!open) setSessionMenuOpen(null);
                      }}
                      className="absolute right-8 top-0"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {!activeChat ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md p-8">
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Welcome to Mama Bear Chat
              </h2>
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                Your personal AI assistant and guide. Select a chat from the sidebar or create a new one to get started.
              </p>
              <Button 
                variant="purple" 
                onClick={() => setIsCreatingChat(true)}
              >
                <Plus className="mr-2" size={18} /> Create New Chat
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className={`p-4 border-b ${styles.border} flex justify-between items-center`}>
              <div className="flex items-center gap-2">
                <ChatTypeIcon type={activeChat.type} size={20} />
                <h2 className="font-medium">{activeChat.name}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  className="p-2 rounded-full hover:bg-black/10 transition-colors"
                  title="Refresh"
                  onClick={() => loadMessages(activeChat.id)}
                >
                  <RefreshCcw size={18} />
                </button>
              </div>
            </div>
            
            {/* Messages area */}
            <div className="flex-1 overflow-auto p-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center max-w-md p-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      No messages yet. Start the conversation by sending a message below.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map(renderChatMessage)}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            {/* Input area */}
            <div className={`p-4 border-t ${styles.border}`}>
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  multiline
                  rows={2}
                  className="flex-1"
                />
                <Button
                  variant="purple"
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="self-end"
                >
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Create chat modal */}
      <Modal
        isOpen={isCreatingChat}
        onClose={() => setIsCreatingChat(false)}
        title="Create New Chat"
      >
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Chat Name</label>
            <Input
              value={newChatName}
              onChange={(e) => setNewChatName(e.target.value)}
              placeholder="Enter chat name"
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium">Chat Type</label>
            <div className="grid grid-cols-2 gap-2">
              {['chat', 'code', 'web', 'image'].map(type => (
                <button
                  key={type}
                  className={`p-3 border rounded-lg flex items-center gap-2 ${newChatType === type
                    ? 'bg-purple-100 border-purple-300 text-purple-700 dark:bg-purple-900/20 dark:border-purple-700 dark:text-purple-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setNewChatType(type as ChatSession['type'])}
                >
                  <ChatTypeIcon type={type} />
                  <span className="capitalize">{type}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button 
              variant="ghost" 
              onClick={() => setIsCreatingChat(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="purple" 
              onClick={createSession}
              disabled={!newChatName.trim() || isLoading}
            >
              {isLoading ? <Loader className="animate-spin mr-2" size={16} /> : null}
              Create
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Settings modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Settings"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
              {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
              <span>Dark Mode</span>
            </div>
            <button
              className={`w-12 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-purple-500' : 'bg-gray-300'}`}
              onClick={toggleDarkMode}
            >
              <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${isDarkMode ? 'translate-x-6' : ''}`} />
            </button>
          </div>
          
          {/* Additional settings would go here */}
          
          <div className="flex justify-end gap-2 mt-6">
            <Button 
              variant="purple" 
              onClick={() => setShowSettings(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Toast container */}
      <ToastContainer 
        toasts={toasts} 
        removeToast={removeToast} 
        position="top-right"
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center gap-3 shadow-xl">
            <Loader className="animate-spin text-purple-500" size={24} />
            <span>Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Toast component
const Toast: React.FC<{ 
  message: string; 
  type?: 'success' | 'error' | 'info';
  variant?: 'purple' | 'default';
  onClose: () => void;
}> = ({ 
  message, 
  type = 'info', 
  variant = 'default',
  onClose 
}) => {
  let bgColor = 'bg-blue-500';
  let Icon = Info;

  if (type === 'success') {
    bgColor = variant === 'purple' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-green-500';
    Icon = CheckCircle;
  } else if (type === 'error') {
    bgColor = 'bg-red-500';
    Icon = XCircle;
  } else {
    bgColor = variant === 'purple' ? 'bg-gradient-to-r from-purple-400 to-blue-500' : 'bg-blue-500';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`${bgColor} text-white p-3 rounded-lg shadow-lg flex items-center justify-between mb-2 max-w-md`}
    >
      <div className="flex items-center">
        <Icon size={18} className="mr-2" />
        <span>{message}</span>
      </div>
      <button onClick={onClose} className="ml-3 text-white hover:text-gray-200">
        <X size={18} />
      </button>
    </motion.div>
  );
};

// Toast container component
const ToastContainer: React.FC<{ toasts: ToastProps[]; removeToast: (id: string) => void }> = ({ 
  toasts, 
  removeToast 
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            layout
          >
            <Toast
              message={toast.message}
              type={toast.type}
              variant={toast.variant}
              onClose={() => removeToast(toast.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Button component with variants
const Button: React.FC<{
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'purple' | 'outline';
  className?: string;
  className?: string; 
  title?: string; 
  children: React.ReactNode;
  direction?: 'row' | 'column';
  headerClassName?: string;
  bodyClassName?: string;
}> = ({ 
  className = '', 
  title, 
  children,
  direction = 'column',
  headerClassName = '',
  bodyClassName = ''
}) => {
  const directionClass = direction === 'row' ? 'flex-row' : 'flex-col';
  
  return (
    <div className={`flex flex-col rounded-lg overflow-hidden ${className}`}>
      {title && (
        <div className={`p-3 font-medium ${headerClassName}`}>{title}</div>
      )}
      <div className={`flex-1 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};

const Button: React.FC<{ 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'ghost'; 
  className?: string; 
  children: React.ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit';
  title?: string;
}> = ({ onClick, variant = 'primary', className, children, disabled, type = 'button', title }) => {
  const baseStyles = 'rounded-md px-3 py-2 font-medium flex items-center justify-center gap-2';
  const variantStyles = {
    primary: 'bg-purple-600 text-white hover:bg-purple-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
  };
  
  return (
    <button
      type={type}
      className={`${baseStyles} ${variantStyles[variant]} ${className || ''}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
};

const Input: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
}> = ({ value, onChange, onKeyDown, placeholder, className, type = 'text', multiline, rows = 3 }) => {
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={`w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 ${className || ''}`}
        rows={rows}
      />
    );
  }
  
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className={`w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 ${className || ''}`}
    />
  );
};

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg w-full mx-4 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>
        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>
  );
};

const Toast: React.FC<{ 
  message: string; 
  type?: 'success' | 'error' | 'info';
  variant?: 'purple' | 'default';
  onClose: () => void;
}> = ({ 
  message, 
  type = 'info',
  variant = 'default',
  onClose 
}) => {
  let bgColor = '';
  let textColor = '';
  let IconComponent;

  // Set styles based on toast type and variant
  if (variant === 'purple') {
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
    }
  } else {
    switch (type) {
      case 'success':
        bgColor = 'bg-green-600';
        textColor = 'text-white';
        IconComponent = Check;
        break;
      case 'error':
        bgColor = 'bg-red-600';
        textColor = 'text-white';
        IconComponent = XCircle;
        break;
      case 'info':
      default:
        bgColor = 'bg-blue-600';
        textColor = 'text-white';
        IconComponent = Info;
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.8 }}
      className={`rounded-md p-4 ${bgColor} ${textColor} shadow-lg flex items-start gap-3`}
    >
      <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1">{message}</div>
      <button onClick={onClose} className="text-white hover:text-gray-200">
        <X className="w-5 h-5" />
      </button>
    </motion.div>
  );
};

const ToastContainer: React.FC<{ toasts: ToastProps[] }> = ({ toasts }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-72">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="transform transition-all duration-200"
          >
            <Toast
              message={toast.message}
              type={toast.type}
              variant="purple"
              onClose={() => {}}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const ChatTypeIcon: React.FC<{ type: string; size?: number }> = ({ type, size = 16 }) => {
  let IconComponent;

  switch (type) {
    case 'code':
      IconComponent = Code2;
      break;
    case 'data':
      IconComponent = Database;
      break;
    case 'web':
      IconComponent = Globe;
      break;
    case 'ai':
      IconComponent = Brain;
      break;
    default:
      IconComponent = MessageCircle;
  }

  return <IconComponent size={size} />;
};

const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    typeof window !== 'undefined' && 
    window.matchMedia && 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', newMode);
      localStorage.setItem('darkMode', newMode ? 'true' : 'false');
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      const darkMode = savedMode === 'true';
      setIsDarkMode(darkMode);
      document.documentElement.classList.toggle('dark', darkMode);
    }
  }, []);

  return { isDarkMode, toggleDarkMode };
};

const getThemeStyles = (isDarkMode: boolean) => {
  return isDarkMode
    ? {
        bg: 'bg-gray-900',
        cardBg: 'bg-gray-800',
        border: 'border-gray-700',
        text: 'text-white',
        textSecondary: 'text-gray-300',
        textTertiary: 'text-gray-400',
        input: 'bg-gray-800 text-white border-gray-700',
        button: 'bg-purple-700 hover:bg-purple-600 text-white',
        accent: 'text-purple-400',
      }
    : {
        bg: 'bg-white',
        cardBg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-900',
        textSecondary: 'text-gray-600',
        textTertiary: 'text-gray-500',
        input: 'bg-white text-gray-900 border-gray-300',
        button: 'bg-purple-600 hover:bg-purple-500 text-white',
        accent: 'text-purple-600',
      };
};

const MamaBearMainChat: React.FC = () => {
  // UI State
  const [inputMessage, setInputMessage] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [messages, setMessages] = useState<FormattedChatMessage[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);
  
  // Chat State
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  
  // UI states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [browserUrl, setBrowserUrl] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Theme
  const { isDarkMode, toggleDarkMode } = useTheme();
  
  // Theme styles
  const theme = getThemeStyles(isDarkMode);
  
  // Display toast notification
  const displayToast = (message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    setTimeout(() => setToasts(prev => prev.filter(toast => toast.id !== id)), duration);
  };

  // Load chat sessions from API
  const loadChatSessions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await mamaBearChatService.getSessions();
      
      if (response.status === 'success' && response.data) {
        setChatSessions(response.data);
        // If there are sessions and no active chat, set the first one as active
        if (response.data.length > 0 && !selectedChatId) {
          setSelectedChatId(response.data[0].id);
          setSelectedChat(response.data[0]);
          await loadChatMessages(response.data[0].id);
        }
      } else {
        setError(response.error || 'Failed to load chat sessions');
        displayToast('Failed to load chat sessions', 'error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error loading chats';
      setError(errorMessage);
      displayToast(`Error: ${errorMessage}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load messages for a specific chat session
  const loadChatMessages = async (chatId: string) => {
    if (!chatId) return;
    
    setIsLoadingMessages(true);
    setMessagesError(null);
    
    try {
      const response = await mamaBearChatService.getMessages(chatId);
      
      if (response.status === 'success' && response.data) {
        // Convert API chat messages to formatted messages for display
        const formattedMessages: FormattedChatMessage[] = response.data.map(msg => ({
          id: msg.id,
          content: msg.content,
          role: msg.role as 'user' | 'assistant' | 'system',
          timestamp: new Date(msg.created_at), // Convert string to Date
          suggestions: msg.suggestions || []
        }));
        
        setMessages(formattedMessages);
      } else {
        setMessagesError(response.error || 'Failed to load chat messages');
        displayToast('Failed to load chat messages', 'error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error loading messages';
      setMessagesError(errorMessage);
      displayToast(`Error: ${errorMessage}`, 'error');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Send message to API
  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedChatId) return;
    
    setIsSending(true);
    
    // Add user message to UI immediately
    const tempId = `temp-${Date.now()}`;
    const userMessage: FormattedMessage = {
      id: tempId,
      role: 'user',
      text: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    try {
      // Send message to API
      const response = await mamaBearChatService.sendMessage(
        activeChat.id, 
        inputValue
      );
      
      if (response.status === 'success' && response.data) {
        // Replace temp message with confirmed message from server
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempId ? 
            {
              id: response.data.id,
              role: response.data.role,
              text: response.data.content,
              timestamp: new Date(response.data.created_at),
              suggestions: response.data.metadata?.suggestions || [],
              actions: response.data.metadata?.actions || []
            } : msg
          )
        );
        
        // Add assistant response if included in the response
        if (response.data.role === 'assistant') {
          const assistantMessage: FormattedMessage = {
            id: response.data.id,
            role: 'assistant',
            text: response.data.content,
            timestamp: new Date(response.data.created_at),
            suggestions: response.data.metadata?.suggestions || [],
            actions: response.data.metadata?.actions || []
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          displayToast('New message received', 'success');
        }
        
        // Refresh the chat sessions list to update last message
        loadChatSessions();
      } else {
        displayToast(response.error || 'Failed to send message', 'error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error sending message';
      displayToast(`Error: ${errorMessage}`, 'error');
    } finally {
      setIsSending(false);
    }
  };

  // Start new chat via API
  const startNewChat = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await mamaBearChatService.createSession(
        'New Conversation',
        'chat'
      );
      
      if (response.status === 'success' && response.data) {
        // Add the new session to the chat sessions list
        setChatSessions(prev => [response.data, ...prev]);
        
        // Set as active chat
        setActiveChat(response.data);
        setMessages([]);
        displayToast('Started new chat', 'success');
        
        if (inputRef.current) {
          inputRef.current.focus();
        }
      } else {
        setError(response.error || 'Failed to create new chat');
        displayToast('Failed to create new chat', 'error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error creating chat';
      setError(errorMessage);
      displayToast(`Error: ${errorMessage}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Select and load a chat session
  const selectChat = async (session: ChatSession) => {
    if (!session || !session.id) return;
    
    setActiveChat(session);
    loadChat(session);
    displayToast(`Loaded chat: ${session.title}`, 'info');
  };

  // REMOVED_DUPLICATE_WEB_SEARCH
    setBrowserUrl(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
    setShowBrowser(true);
    displayToast(`Searching for: ${query}`);
  };

  // REMOVED_DUPLICATE_WEB_SEARCH
    setBrowserUrl(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
    setShowBrowser(true);
    displayToast(`Searching for: ${query}`, 'info');
  };

  // Menu items
  const chatOptionsMenu: MenuItem[] = [
    { id: 'rename', label: 'Rename Chat', icon: <Bookmark size={16} />, onClick: () => displayToast('Rename feature coming soon') },
    { id: 'star', label: 'Star Chat', icon: <Star size={16} />, onClick: () => displayToast('Star feature coming soon') },
    { id: 'divider1', type: 'divider', label: '', onClick: () => {} },
    { id: 'export', label: 'Export Chat', icon: <ArrowRight size={16} />, onClick: () => displayToast('Export feature coming soon') },
    { id: 'divider2', type: 'divider', label: '', onClick: () => {} },
    { id: 'delete', label: 'Delete Chat', icon: <X size={16} className="text-red-500" />, onClick: () => displayToast('Delete feature coming soon') }
  ];

  return (
    <div className={`flex h-screen ${theme.bg} transition-colors duration-300`}>
      {/* Toast notifications */}
      <AnimatePresence>
        {toasts.length > 0 && (
          <ToastContainer position="top-right">
            {toasts.map(toast => (
              <Toast 
                key={toast.id}
                variant="purple"
                message={toast.message}
                onClose={() => {
                  setToasts(prev => prev.filter(t => t.id !== toast.id));
                }}
              />
            ))}
          </ToastContainer>
        )}
      </AnimatePresence>

      {/* Left sidebar - Chat History */}
      {showSidebar && (
        <Panel
          title="Chat History"
          className="w-80 h-full flex flex-col overflow-hidden"
          headerClassName="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
          bodyClassName="flex-1 overflow-y-auto"
        >
          {/* Search and New Chat */}
          <div className="p-4 border-b border-purple-200/20">
            <div className="flex gap-2">
              <Input
                icon={<Search size={18} />}
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Tooltip content="New Chat">
                <Button 
                  variant="purple" 
                  size="icon"
                  onClick={startNewChat}
                >
                  <Plus size={18} />
                </Button>
              </Tooltip>
            </div>
          </div>

          {/* Recent Chats */}
          <div className="p-4">
            <h3 className={`text-sm font-semibold mb-2 ${theme.textSecondary}`}>Recent Chats</h3>
            <div className="space-y-2">
              {sampleChats.filter(chat => 
                chat.title.toLowerCase().includes(searchQuery.toLowerCase())
              ).map(chat => (
                <div
                  key={chat.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    activeChat?.id === chat.id
                      ? 'bg-purple-500/20 border-purple-500/30'
                      : `${theme.cardBg} hover:bg-purple-500/10`
                  } border border-transparent hover:border-purple-500/20`}
                  onClick={() => loadChat(chat)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <ChatTypeIcon type={chat.type} />
                      <span className={`font-medium ${theme.text}`}>{chat.title}</span>
                    </div>
                    <ContextMenu
                      trigger={
                        <button className="opacity-50 hover:opacity-100">
                          <MoreVertical size={16} />
                        </button>
                      }
                      items={chatOptionsMenu}
                    />
                  </div>
                  <p className={`mt-1 text-sm ${theme.textTertiary} truncate`}>
                    {chat.lastMessage}
                  </p>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className={`${theme.textTertiary}`}>{chat.timestamp}</span>
                    <span className="bg-purple-500/20 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                      {chat.messageCount} msgs
                </div>
              ) : error ? (
                <div className="p-3 text-red-500 text-center">
                  <AlertCircle size={24} className="mx-auto mb-2" />
                  <p>{error}</p>
                  <Button
                    onClick={loadChatSessions}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <ul className="space-y-1 p-1">
                  {chatSessions
                    .filter((chat) =>
                      chat.title.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((chat) => (
                      <li
                        key={chat.id}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedChatId === chat.id ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                        onClick={() => selectChat(chat.id)}
                      >
                        <div className="flex-shrink-0">
                          <ChatTypeIcon type={chat.type || 'chat'} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate ${theme.text}`}>
                            {chat.title}
                          </p>
                          <p className={`text-xs truncate ${theme.textTertiary}`}>
                            {new Date(chat.updated_at || chat.created_at).toLocaleString()}
                          </p>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </aside>
                  </p>
                </div>
              </div>
            </div>
          </Panel>
        )}
      </div>

      {/* Settings Modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Settings"
      >
        <div className="space-y-4 p-2">
          <div className="flex items-center justify-between">
            <span className={theme.text}>Dark Mode</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
            >
              {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className={theme.text}>Show Browser by Default</span>
            <Button
              variant={showBrowser ? "purple" : "outline"}
              size="sm"
              onClick={() => setShowBrowser(!showBrowser)}
            >
              {showBrowser ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className={theme.text}>Appearance</span>
            <Dropdown
              trigger={
                <Button variant="outline" size="sm">
                  Purple Theme
                </Button>
              }
              items={[
                { id: 'purple', label: 'Purple Theme (Default)' },
                { id: 'blue', label: 'Blue Theme (Coming Soon)' },
                { id: 'green', label: 'Green Theme (Coming Soon)' },
              ]}
              onSelect={(id) => displayToast(`Selected theme: ${id}`)}
            />
          </div>
          
          <div className="pt-4 flex justify-end">
            <Button
              variant="purple"
              onClick={() => {
                displayToast('Settings saved');
                setShowSettings(false);
              }}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MamaBearMainChat;
