import React, { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  MessageCircle,
  Settings,
  Send,
  Plus,
  Check,
  XCircle,
  Info,
  Moon,
  Sun,
  Code2,
  Database,
  Globe,
  Brain,
  Search,
  X,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  ExternalLink,
  Folder,
  Bookmark,
  Star,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

import mamaBearChatService from '../services/MamaBearChatService';

// Enhanced interfaces for our component
interface ChatSession {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  type: 'chat' | 'code' | 'web' | 'image' | 'default';
}

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  session_id: string;
  timestamp: string;
  created_at: string;
  suggestions?: string[];
}

// Formatted message with properly typed date fields
interface FormattedChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  session_id: string;
  timestamp: Date;
  created_at: Date;
  suggestions?: string[];
}

interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  success: boolean;
}

interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  variant?: 'purple' | 'default';
  duration: number;
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
const ChatTypeIcon: React.FC<{ type: ChatSession['type'] }> = ({ type }) => {
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

// Toast container component
const ToastContainer: React.FC<{
  toasts: ToastProps[];
  removeToast: (id: string) => void;
}> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-80">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            transition={{ duration: 0.2 }}
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

// Main component implementation
const MamaBearMainChat: React.FC = () => {
  // State for dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Apply theme styles
  const theme = getThemeStyles(isDarkMode);
  
  // Toast state
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  
  // Chat state
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatSession, setActiveChatSession] = useState<ChatSession | null>(null);
  const [chatMessages, setChatMessages] = useState<FormattedChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  
  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Function to toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };
  
  // Display toast notification
  const displayToast = (message: string, type: 'success' | 'error' | 'info' = 'info', variant: 'purple' | 'default' = 'default', duration = 5000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastProps = {
      id,
      message,
      type,
      variant,
      duration
    };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove toast after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
    
    return id;
  };
  
  // Remove toast notification
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  // Load chat sessions from API
  const loadChatSessions = async () => {
    try {
      setIsLoading(true);
      const response = await mamaBearChatService.getSessions();
      
      if (response.success && response.data) {
        setChatSessions(response.data);
        
        // Select the first session if exists and none is active
        if (response.data.length > 0 && !activeChatSession) {
          setActiveChatSession(response.data[0]);
          loadChatMessages(response.data[0].id);
        }
      } else {
        displayToast(`Failed to load chat sessions: ${response.message}`, 'error');
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      displayToast('Failed to load chat sessions. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load chat messages for a specific session
  const loadChatMessages = async (sessionId: string) => {
    if (!sessionId) return;
    
    try {
      setIsLoadingMessages(true);
      const response = await mamaBearChatService.getMessages(sessionId);
      
      if (response.success && response.data) {
        // Format messages with proper Date objects
        const formattedMessages: FormattedChatMessage[] = response.data.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
          created_at: new Date(msg.created_at)
        }));
        
        setChatMessages(formattedMessages);
      } else {
        displayToast(`Failed to load chat messages: ${response.message}`, 'error');
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
      displayToast('Failed to load chat messages. Please try again.', 'error');
    } finally {
      setIsLoadingMessages(false);
      
      // Scroll to bottom after messages load
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  };
  
  // Send a message in the current chat session
  const sendMessage = async () => {
    if (!inputMessage.trim() || !activeChatSession) return;
    
    try {
      setIsSending(true);
      
      // Add user message to chat immediately
      const userMsg: FormattedChatMessage = {
        id: `temp-${Date.now()}`,
        content: inputMessage,
        role: 'user',
        session_id: activeChatSession.id,
        timestamp: new Date(),
        created_at: new Date()
      };
      
      setChatMessages(prev => [...prev, userMsg]);
      setInputMessage('');
      scrollToBottom();
      
      // Send to API
      const response = await mamaBearChatService.sendMessage(activeChatSession.id, inputMessage);
      
      if (response.success && response.data) {
        // Add assistant response
        const assistantMsg: FormattedChatMessage = {
          id: response.data.id,
          content: response.data.content,
          role: 'assistant',
          session_id: activeChatSession.id,
          timestamp: new Date(response.data.timestamp),
          created_at: new Date(response.data.created_at),
          suggestions: response.data.suggestions
        };
        
        setChatMessages(prev => [...prev, assistantMsg]);
        scrollToBottom();
      } else {
        displayToast(`Failed to send message: ${response.message}`, 'error');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      displayToast('Failed to send message. Please try again.', 'error');
    } finally {
      setIsSending(false);
    }
  };
  
  // Create a new chat session
  const createNewChat = async () => {
    try {
      setIsLoading(true);
      const response = await mamaBearChatService.createSession();
      
      if (response.success && response.data) {
        // Add new session to list and select it
        setChatSessions(prev => [response.data, ...prev]);
        setActiveChatSession(response.data);
        setChatMessages([]);
        displayToast('New chat created', 'success');
      } else {
        displayToast(`Failed to create new chat: ${response.message}`, 'error');
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
      displayToast('Failed to create new chat. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Select a chat session
  const selectChat = async (sessionId: string) => {
    if (!sessionId || (activeChatSession && activeChatSession.id === sessionId)) return;
    
    try {
      const session = chatSessions.find(s => s.id === sessionId);
      if (session) {
        setActiveChatSession(session);
        loadChatMessages(sessionId);
      }
    } catch (error) {
      console.error('Error selecting chat:', error);
      displayToast('Failed to select chat. Please try again.', 'error');
    }
  };
  
  // Handle input change
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
  };
  
  // Handle key press in input
  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Load chat sessions on mount
  useEffect(() => {
    loadChatSessions();
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

// Chat component props
interface ChatProps {
  isDarkMode: boolean;
}

// Helper function to get theme styles based on dark mode
const getThemeStyles = (isDarkMode: boolean): ThemeStyles => {
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

// Chat type icon component
const ChatTypeIcon: React.FC<{ type: string; className?: string }> = ({ type, className = 'w-4 h-4' }) => {
  switch (type) {
    case 'code':
      return <Code2 className={className} />;
    case 'database':
      return <Database className={className} />;
    case 'web':
      return <Globe className={className} />;
    case 'ai':
      return <Brain className={className} />;
    default:
      return <MessageCircle className={className} />;
  }
};

// Toast component for notifications
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
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
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
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
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
  );}

// Define interfaces for component props and state
interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration: number;
}

interface FormattedChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date; // Use Date consistently
  suggestions?: string[];
  actions?: string[];
  isLoading?: boolean;
  isError?: boolean;
}

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  type?: 'item' | 'divider';
  onClick: () => void;
}

// UI Components (placeholders - replace with your actual UI components)
const Panel: React.FC<{ 
  className?: string; 
  title?: string; 
  children: React.ReactNode;
  direction?: 'row' | 'column';
}> = ({ className, title, children, direction = 'column' }) => (
  <div className={`border rounded-lg shadow-sm p-4 flex flex-${direction === 'column' ? 'col' : 'row'} ${className || ''}`}>
    {title && <h3 className="text-lg font-medium mb-3">{title}</h3>}
    {children}
  </div>
);

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

const Tooltip: React.FC<{
  content: string;
  children: React.ReactNode;
}> = ({ content, children }) => {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative inline-block">
      <div 
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div className="absolute z-10 px-2 py-1 text-sm text-white bg-gray-700 rounded shadow-lg bottom-full mb-2">
          {content}
        </div>
      )}
    </div>
  );
};

const Dropdown: React.FC<{
  trigger: React.ReactNode;
  items: {
    id: string;
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    type?: 'item' | 'divider';
  }[];
}> = ({ trigger, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1">
            {items.map(item => (
              item.type === 'divider' ? (
                <div key={item.id} className="border-t border-gray-200 dark:border-gray-700 my-1" />
              ) : (
                <button
                  key={item.id}
                  onClick={() => {
                    item.onClick();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  {item.icon}
                  {item.label}
                </button>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Note: We are using only one set of interface declarations from above
// The duplicated interfaces have been removed to fix TypeScript errors

// Toast Components
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

// Toast Component
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

// Theme Helper
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

// Chat Type Icon Component
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

// Main Component
interface MamaBearMainChatProps {
  className?: string;
}

const MamaBearMainChat: React.FC<MamaBearMainChatProps> = ({ className }) => {
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
  const getTheme = (isDark: boolean) => {
    return {
      bg: isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50',
      cardBg: isDark ? 'bg-slate-800/80' : 'bg-white/80',
      border: isDark ? 'border-slate-700/50' : 'border-purple-200/50',
      text: isDark ? 'text-white' : 'text-gray-900',
      textSecondary: isDark ? 'text-slate-300' : 'text-gray-600',
      textTertiary: isDark ? 'text-slate-400' : 'text-gray-500',
      input: isDark ? 'bg-slate-700/50 border-slate-600/50 text-white' : 'bg-white/50 border-purple-300/50 text-gray-900',
      button: isDark ? 'bg-slate-700/50 hover:bg-slate-600/50' : 'bg-purple-100/50 hover:bg-purple-200/50',
      accent: 'from-purple-500 to-pink-500'
    };
  };
  
  const theme = getTheme(isDarkMode);
  
  // Toast handling function
  const displayToast = (message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    
    // Auto-dismiss toast after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chat sessions from API
  const loadChatSessions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await mamaBearChatService.getSessions();
      
      if (response && response.data) {
        setChatSessions(response.data);
        
        // If there are sessions and no active chat, set the first one as active
        if (response.data.length > 0 && !selectedChatId) {
          setSelectedChatId(response.data[0].id);
          setSelectedChat(response.data[0]);
          await loadChatMessages(response.data[0].id);
        }
      } else {
        throw new Error('Failed to load chat sessions');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error loading chat sessions';
      setError(errorMessage);
      displayToast(`Error: ${errorMessage}`, 'error');
      console.error('Failed to load chat sessions:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Load chat messages for a specific chat session
  const loadChatMessages = async (chatId: string) => {
    if (!chatId) return;
    
    setIsLoadingMessages(true);
    setMessagesError(null);
    
    try {
      const response = await mamaBearChatService.getMessages(chatId);
      
      if (response && response.data) {
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
        throw new Error('Failed to load chat messages');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error loading messages';
      setMessagesError(errorMessage);
      displayToast(`Error: ${errorMessage}`, 'error');
      console.error(`Failed to load messages for chat ${chatId}:`, err);
    } finally {
      setIsLoadingMessages(false);
    }
  };
  
  // Load chat sessions on component mount
  useEffect(() => {
    loadChatSessions();
  }, []);

  // Load messages for a specific chat session
  const loadChatMessages = async (chatId: string) => {
    if (!chatId) return;
    
    setIsLoadingMessages(true);
    setMessagesError(null);
    
    try {
      const response = await mamaBearChatService.getChatMessages(chatId);
      
      if (response && Array.isArray(response)) {
        // Convert API chat messages to formatted messages for display
        const formattedMessages: FormattedChatMessage[] = response.map(msg => ({
          id: msg.id,
          content: msg.content,
          role: msg.role as 'user' | 'assistant' | 'system',
          timestamp: new Date(msg.created_at).toLocaleString(),
          suggestions: msg.suggestions || []
        }));
        
        setMessages(formattedMessages);
      } else {
        throw new Error('Failed to load chat messages');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error loading messages';
      setMessagesError(errorMessage);
      displayToast(`Error: ${errorMessage}`, 'error');
      console.error(`Failed to load chat ${chatId}:`, err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Send message to API
  const sendMessage = async () => {
    if (!inputValue.trim() || !selectedChatId) return;
    
    setIsSending(true);
    
    // Add user message to UI immediately
    const tempId = `temp-${Date.now()}`;
    const userMessage: FormattedChatMessage = {
      id: tempId,
      content: inputValue,
      role: 'user',
      timestamp: new Date().toLocaleString()
    };
    
    // Create a loading message for the assistant's response
    const loadingMessage: FormattedChatMessage = {
      id: `loading-${Date.now()}`,
      content: '',
      role: 'assistant',
      timestamp: new Date().toLocaleString(),
      isLoading: true
    };
    
    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInputValue('');
    
    // Scroll to bottom after adding messages
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    
    try {
      // Send message to API
      const response = await mamaBearChatService.sendMessage(selectedChatId, inputValue);
      
      if (response) {
        // Remove the loading message and add the real response
        setMessages(prev => {
          const filtered = prev.filter(msg => msg.id !== loadingMessage.id);
          return [...filtered, {
            id: response.id || `response-${Date.now()}`,
            content: response.content,
            role: 'assistant',
            timestamp: new Date(response.created_at || Date.now()).toLocaleString(),
            suggestions: response.suggestions || []
          }];
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error sending message';
      
      // Replace loading message with error message
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id ? 
        {
          ...msg, 
          content: 'Failed to get response. Please try again.',
          isLoading: false,
          isError: true
        } : msg
      ));
      
      displayToast(`Error: ${errorMessage}`, 'error');
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
      // Scroll to bottom after receiving response
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  // Handle input change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Handle input key press (Enter to send)
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isSending) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Handle send button click
  const handleSendClick = () => {
    if (!isSending) {
      sendMessage();
    }
  };

  // Create a new chat session
  const createNewChat = async () => {
    setIsLoading(true);
    
    try {
      const response = await mamaBearChatService.createChatSession();
      
      if (response && response.id) {
        setChatSessions(prev => [response, ...prev]);
        setSelectedChatId(response.id);
        setMessages([]);
        displayToast('New chat created', 'success');
        
        // Focus the input field
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      } else {
        throw new Error('Failed to create new chat');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error creating chat';
      displayToast(`Error: ${errorMessage}`, 'error');
      console.error('Failed to create new chat:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Select a chat session
  const selectChat = (chatId: string) => {
    if (chatId !== selectedChatId) {
      setSelectedChatId(chatId);
      loadChatMessages(chatId);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Display toast notification
  const displayToast = (message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000) => {
    const id = nextToastId.current++;
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
        if (response.data.length > 0 && !activeChat) {
          setActiveChat(response.data[0]);
          loadChat(response.data[0]);
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
  
  // Load chat sessions on component mount
  useEffect(() => {
    loadChatSessions();
  }, []);

  // Load messages for a specific chat session
  const loadChat = async (session: ChatSession) => {
    if (!session || !session.id) return;
    
    setIsLoadingMessages(true);
    setMessagesError(null);
    
    try {
      const response = await mamaBearChatService.getMessages(session.id);
      
      if (response.status === 'success' && response.data) {
        // Convert API chat messages to formatted messages for display
        const formattedMessages: FormattedMessage[] = response.data.map(msg => ({
          id: msg.id,
          role: msg.role,
          text: msg.content,
          timestamp: new Date(msg.created_at),
          suggestions: msg.metadata?.suggestions || [],
          actions: msg.metadata?.actions || []
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
    if (!inputValue.trim() || !activeChat || !activeChat.id) return;
    
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

  // Handle web search
  const handleWebSearch = (query: string) => {
    setBrowserUrl(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
    setShowBrowser(true);
    displayToast(`Searching for: ${query}`);
  };

  // Handle web search
  const handleWebSearch = (query: string) => {
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
