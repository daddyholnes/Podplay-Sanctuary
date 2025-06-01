import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageCircle, Search, Globe, FileText, Image, Paperclip, Mic, Video,
  Send, Plus, Settings, Moon, Sun, MoreVertical, Bookmark, Star,
  ArrowRight, RefreshCw, ExternalLink, Copy, ThumbsUp, ThumbsDown,
  Folder, Clock, Zap, Brain, Target, MapPin, Users, Code2, Database,
  Share, MessageSquare, Bell, Download, Upload, CheckCircle, X, AlertCircle,
  PanelRight, Maximize2, Minimize2, LayoutGrid, GitBranch, Tag, Package,
  Handshake, Briefcase, UserCheck, UserPlus, UserMinus, Lock, Unlock,
  Heart, Calendar, Filter, Award, Sparkles, Gift, Command, Shield
} from 'lucide-react';

// Types for Mama Bear Chat and MCP Collaboration features
type MessageRole = 'user' | 'assistant' | 'system';
type ChatType = 'project' | 'research' | 'casual' | 'creative';
type AttachmentType = 'image' | 'file' | 'code' | 'audio' | 'video';
type PackageVersionStatus = 'latest' | 'outdated' | 'critical';
type CollaborationStatus = 'shared' | 'private' | 'team';
type UpdateSeverity = 'low' | 'medium' | 'high';

interface Attachment {
  id: string;
  type: AttachmentType;
  url: string;
  name: string;
  preview?: string;
  metadata?: Record<string, any>;
}

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  attachments?: Attachment[];
  reactions?: Record<string, number>;
  isMarkdown?: boolean;
  metadata?: Record<string, any>;
}

interface ChatSession {
  id: number;
  title: string;
  lastMessage: string;
  timestamp: string;
  messageCount: number;
  type: ChatType;
  isPinned?: boolean;
  collaborators?: string[];
  isShared?: boolean;
}

interface Comment {
  id: string;
  author: string;
  authorAvatar?: string;
  content: string;
  timestamp: string;
  likes: number;
  isMarkdown?: boolean;
}

interface McpPackage {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  downloads: number;
  stars: number;
  versionStatus: PackageVersionStatus;
  isInstalled: boolean;
  installProgress?: number;
  comments?: Comment[];
  collaborationStatus?: CollaborationStatus;
  lastUpdated: string;
  marketplace: string;
  tags: string[];
}

interface UpdateNotification {
  id: string;
  packageId: string;
  packageName: string;
  currentVersion: string;
  newVersion: string;
  changelog?: string;
  updateAvailable: boolean;
  severity: UpdateSeverity;
  timestamp: string;
}

interface ThemeInterface {
  bg: string;
  cardBg: string;
  border: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  input: string;
  button: string;
  accent: string;
  highlight: string;
  success: string;
  warning: string;
  error: string;
  badge: string;
  selected: string;
  collaboration: string;
}

const MamaBearMainChat = () => {
  // Core state management
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [recentChats, setRecentChats] = useState<ChatSession[]>([]);
  const [showBrowser, setShowBrowser] = useState(false);
  const [browserUrl, setBrowserUrl] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [showResearch, setShowResearch] = useState(false);
  
  // MCP Package collaboration features
  const [activePackages, setActivePackages] = useState<McpPackage[]>([]);
  const [showPackageDetails, setShowPackageDetails] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<McpPackage | null>(null);
  const [packageComments, setPackageComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [updateNotifications, setUpdateNotifications] = useState<UpdateNotification[]>([]);
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Enhanced theme with collaboration UI styles
  const theme: ThemeInterface = {
    bg: isDarkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50',
    cardBg: isDarkMode ? 'bg-slate-800/80' : 'bg-white/80',
    border: isDarkMode ? 'border-slate-700/50' : 'border-purple-200/50',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-slate-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-slate-400' : 'text-gray-500',
    input: isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white' : 'bg-white/50 border-purple-300/50 text-gray-900',
    button: isDarkMode ? 'bg-slate-700/50 hover:bg-slate-600/50' : 'bg-purple-100/50 hover:bg-purple-200/50',
    accent: 'from-purple-500 to-pink-500',
    highlight: isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100/50',
    success: isDarkMode ? 'text-green-400' : 'text-green-600',
    warning: isDarkMode ? 'text-amber-400' : 'text-amber-600',
    error: isDarkMode ? 'text-red-400' : 'text-red-500',
    badge: isDarkMode ? 'bg-purple-800/50 text-purple-200' : 'bg-purple-200/70 text-purple-700',
    selected: isDarkMode ? 'bg-purple-800/30 border-purple-600/50' : 'bg-purple-100 border-purple-300/50',
    collaboration: isDarkMode ? 'bg-indigo-900/30 border-indigo-700/30' : 'bg-indigo-50 border-indigo-200'
  };

  // Sample recent chats
  const sampleChats: ChatSession[] = [
    {
      id: 1,
      title: 'Podplay Studio Architecture',
      lastMessage: 'Let me draft the technical architecture for your multi-modal platform...',
      timestamp: '2 hours ago',
      messageCount: 47,
      type: 'project',
      isPinned: true
    },
    {
      id: 2,
      title: 'MCP Package Development',
      lastMessage: 'I found these packages that might help with your multimodal goals...',
      timestamp: '3 hours ago',
      messageCount: 32,
      type: 'research',
      isShared: true,
      collaborators: ['Scout', 'Dev Workspace']
    },
    {
      id: 3,
      title: 'Creative Coding Ideas',
      lastMessage: 'Here are some visualization techniques we could explore...',
      timestamp: 'Yesterday',
      messageCount: 18,
      type: 'creative'
    },
    {
      id: 4,
      title: 'Agent Orchestration System',
      lastMessage: 'I have researched the latest autonomous agent patterns for you...',
      timestamp: 'Yesterday',
      messageCount: 23,
      type: 'research'
    }
  ];
  
  // Sample MCP packages with collaboration features
  const samplePackages: McpPackage[] = [
    {
      id: 'p1',
      name: 'puppeteer-mcp',
      version: '1.2.0',
      description: 'Browser automation for web scraping and testing',
      author: 'MCP Team',
      downloads: 3452,
      stars: 87,
      versionStatus: 'latest',
      isInstalled: true,
      marketplace: 'MCP Central',
      tags: ['automation', 'browser', 'testing'],
      lastUpdated: '2023-06-15',
      comments: [
        {
          id: 'c1',
          author: 'Nathan',
          authorAvatar: '/avatars/nathan.png',
          content: 'This is perfect for our web automation needs in the Scout workflow!',
          timestamp: '2023-06-16',
          likes: 2,
          isMarkdown: false
        },
        {
          id: 'c2',
          author: 'Scout Agent',
          authorAvatar: '/avatars/scout.png',
          content: 'I can use this to gather better research data from interactive websites.',
          timestamp: '2023-06-16',
          likes: 1,
          isMarkdown: false
        }
      ],
      collaborationStatus: 'shared'
    },
    {
      id: 'p2',
      name: 'brave-search',
      version: '0.9.5',
      description: 'Privacy-focused search API integration',
      author: 'Brave Team',
      downloads: 1879,
      stars: 45,
      versionStatus: 'outdated',
      isInstalled: true,
      marketplace: 'MCP Central',
      tags: ['search', 'privacy', 'research'],
      lastUpdated: '2023-05-20',
      comments: [],
      collaborationStatus: 'private'
    },
    {
      id: 'p3',
      name: 'sequential-thinking',
      version: '2.1.0',
      description: 'Enhanced reasoning for complex problem solving',
      author: 'Cognitive AI Labs',
      downloads: 2145,
      stars: 76,
      versionStatus: 'critical',
      isInstalled: true,
      marketplace: 'MCP Central',
      tags: ['reasoning', 'cognitive', 'problem-solving'],
      lastUpdated: '2023-06-01',
      comments: [],
      collaborationStatus: 'team'
    },
    {
      id: 'p4',
      name: 'vision-ai',
      version: '2.0.3',
      description: 'Advanced image processing and visual recognition',
      author: 'VisionLabs',
      downloads: 1254,
      stars: 47,
      versionStatus: 'latest',
      isInstalled: true,
      marketplace: 'GitHub',
      tags: ['vision', 'images', 'multimodal'],
      lastUpdated: '2023-05-28',
      collaborationStatus: 'shared',
      comments: [
        {
          id: 'c1',
          author: 'Nathan',
          authorAvatar: '/avatars/nathan.png',
          content: 'This package is amazing for visual processing!',
          timestamp: '2023-05-29',
          likes: 2,
          isMarkdown: false
        },
        {
          id: 'c2',
          author: 'Scout',
          authorAvatar: '/avatars/scout.png',
          content: 'I integrated this with the research workspace - works great!',
          timestamp: '2023-05-30',
          likes: 1,
          isMarkdown: false
        }
      ]
    },
    {
      id: 'p5',
      name: 'Audio Processing Suite',
      version: '0.9.8',
      description: 'Audio processing, transcription, and sound analysis for MCP',
      author: 'AudioWizards',
      downloads: 876,
      stars: 32,
      versionStatus: 'outdated',
      isInstalled: true,
      marketplace: 'Docker Hub',
      tags: ['audio', 'speech', 'transcription'],
      lastUpdated: '2023-04-15',
      collaborationStatus: 'private',
      comments: []
    }
  ];
  
  // Sample update notifications
  const sampleNotifications: UpdateNotification[] = [
    {
      id: 'n1',
      packageId: 'p2',
      packageName: 'brave-search',
      currentVersion: '0.9.5',
      newVersion: '1.0.0',
      changelog: '- Major release with improved search accuracy\n- Better filtering options\n- Reduced API latency by 40%',
      updateAvailable: true,
      severity: 'medium',
      timestamp: '2023-06-10'
    },
    {
      id: 'n2',
      packageId: 'p3',
      packageName: 'sequential-thinking',
      currentVersion: '2.1.0',
      newVersion: '2.2.0',
      changelog: '- Critical security patch\n- Fixed memory leak issue\n- Added new reasoning templates',
      updateAvailable: true,
      severity: 'high',
      timestamp: '2023-06-12'
    },
    {
      id: 'n3',
      packageId: 'p5',
      packageName: 'Audio Processing Suite',
      currentVersion: '0.9.8',
      newVersion: '1.0.0',
      changelog: '- Improved transcription accuracy\n- Added noise cancellation\n- New speech-to-text models',
      updateAvailable: true,
      severity: 'medium',
      timestamp: '2023-06-01'
    }
  ];
  
  // Initialize state with sample data
  useEffect(() => {
    setRecentChats(sampleChats);
    setActivePackages(samplePackages);
    setUpdateNotifications(sampleNotifications);
  }, []);
  
  // Collaboration feature handlers for MCP packages
  const handleAddComment = (packageId: string, comment: string) => {
    if (!comment.trim()) return;
    
    const newCommentObj: Comment = {
      id: `c${Date.now()}`,
      author: 'Nathan',
      authorAvatar: '/avatars/nathan.png',
      content: comment,
      timestamp: new Date().toLocaleString(),
      likes: 0,
      isMarkdown: false
    };
    
    // Add comment to the selected package
    setActivePackages(prevPackages =>
      prevPackages.map(pkg =>
        pkg.id === packageId
          ? { ...pkg, comments: [...(pkg.comments || []), newCommentObj] }
          : pkg
      )
    );
    
    // If this is the currently selected package, update package comments
    if (selectedPackage?.id === packageId) {
      setPackageComments(prev => [...prev, newCommentObj]);
      setNewComment('');
    }
    
    // Show a toast notification (placeholder for actual implementation)
    console.log('Comment added:', newCommentObj);
  };
  
  const handleSharePackage = (packageId: string, status: CollaborationStatus) => {
    // Update package collaboration status
    setActivePackages(prevPackages =>
      prevPackages.map(pkg =>
        pkg.id === packageId
          ? { ...pkg, collaborationStatus: status }
          : pkg
      )
    );
    
    // If this is the currently selected package, update its status
    if (selectedPackage?.id === packageId) {
      setSelectedPackage(prev => 
        prev ? { ...prev, collaborationStatus: status } : null
      );
    }
    
    // Show a toast notification (placeholder for actual implementation)
    console.log(`Package ${packageId} sharing status changed to ${status}`);
  };
  
  const handleUpdatePackage = (packageId: string) => {
    // Find the notification for this package
    const notification = updateNotifications.find(n => n.packageId === packageId);
    if (!notification) return;
    
    // Update the package version
    setActivePackages(prevPackages =>
      prevPackages.map(pkg =>
        pkg.id === packageId
          ? { 
              ...pkg, 
              version: notification.newVersion,
              versionStatus: 'latest',
              lastUpdated: new Date().toLocaleString()
            }
          : pkg
      )
    );
    
    // Remove the update notification
    setUpdateNotifications(prev =>
      prev.filter(n => n.packageId !== packageId)
    );
    
    // If this is the currently selected package, update its version
    if (selectedPackage?.id === packageId) {
      setSelectedPackage(prev => 
        prev ? { 
          ...prev, 
          version: notification.newVersion,
          versionStatus: 'latest',
          lastUpdated: new Date().toLocaleString()
        } : null
      );
    }
    
    // Show a toast notification (placeholder for actual implementation)
    console.log(`Package ${packageId} updated to ${notification.newVersion}`);
  };
  
  const handleSelectPackage = (packageId: string) => {
    const pkg = activePackages.find(p => p.id === packageId);
    if (pkg) {
      setSelectedPackage(pkg);
      setPackageComments(pkg.comments || []);
      setShowPackageDetails(true);
    }
  };
      downloads: 1254,
      stars: 47,
      versionStatus: 'latest' as PackageVersionStatus,
      isInstalled: true,
      marketplace: 'GitHub',
      tags: ['vision', 'images', 'multimodal'],
      lastUpdated: '2025-05-28',
      collaborationStatus: 'shared' as CollaborationStatus,
      comments: [
        {
          id: 'c1',
          author: 'Nathan',
          content: 'This package is amazing for visual processing!',
          timestamp: '2025-05-29',
          likes: 2
        },
        {
          id: 'c2',
          author: 'Scout',
          content: 'I integrated this with the research workspace - works great!',
          timestamp: '2025-05-30',
          likes: 1
        }
      ]
    },
    {
      id: 'dh-mcp-audio-tools',
      name: 'Audio Processing Suite',
      version: '0.9.8',
      description: 'Audio processing, transcription, and sound analysis for MCP',
      author: 'AudioWizards',
      downloads: 876,
      stars: 32,
      versionStatus: 'outdated' as PackageVersionStatus,
      isInstalled: true,
      marketplace: 'Docker Hub',
      tags: ['audio', 'speech', 'transcription'],
      lastUpdated: '2025-04-15',
      collaborationStatus: 'private' as CollaborationStatus
    }
  ];
  
  // Sample update notifications
  const sampleNotifications = [
    {
      id: 'n1',
      packageId: 'dh-mcp-audio-tools',
      packageName: 'Audio Processing Suite',
      currentVersion: '0.9.8',
      newVersion: '1.0.0',
      changelog: '- Improved transcription accuracy\n- Added noise cancellation\n- New speech-to-text models',
      updateAvailable: true,
      severity: 'medium' as const,
      timestamp: '2025-06-01'
    }
  ];
  
  // Initialize with sample data
  useEffect(() => {
    setRecentChats(sampleChats);
    setActivePackages(samplePackages);
    setUpdateNotifications(sampleNotifications);
  }, []);
  
  // Collaboration feature handlers
  const handleAddComment = (packageId: string, comment: string) => {
    if (!comment.trim()) return;
    
    const newCommentObj: Comment = {
      id: `c${Date.now()}`,
      author: 'Nathan',
      content: comment,
      timestamp: new Date().toISOString(),
      likes: 0
    };
    
    setActivePackages(packages => packages.map(pkg => 
      pkg.id === packageId 
        ? { ...pkg, comments: [...(pkg.comments || []), newCommentObj] }
        : pkg
    ));
    
    setNewComment('');
  };
  
  const handleSharePackage = (packageId: string, status: CollaborationStatus) => {
    setActivePackages(packages => packages.map(pkg => 
      pkg.id === packageId 
        ? { ...pkg, collaborationStatus: status }
        : pkg
    ));
  };
  
  const handleUpdatePackage = (packageId: string) => {
    // Mark notification as processed
    setUpdateNotifications(notifications => 
      notifications.filter(n => n.packageId !== packageId)
    );
    
    // Update package version
    setActivePackages(packages => packages.map(pkg => 
      pkg.id === packageId 
        ? { 
            ...pkg, 
            version: updateNotifications.find(n => n.packageId === packageId)?.newVersion || pkg.version,
            versionStatus: 'latest' as PackageVersionStatus,
            lastUpdated: new Date().toISOString()
          }
        : pkg
    ));
  };}itle: 'Scout Agent Development',
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

    const userMessage: ChatMessage = {
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

  const loadChat = (chat) => {
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

  const handleWebSearch = (query) => {
    setBrowserUrl(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
    setShowBrowser(true);
  };

  const ChatTypeIcon = ({ type }) => {
    const icons = {
      project: <Folder size={16} className="text-purple-500" />,
      research: <Search size={16} className="text-purple-600" />,
      planning: <Target size={16} className="text-pink-500" />,
      technical: <Code2 size={16} className="text-purple-700" />,
      general: <MessageCircle size={16} className="text-purple-400" />
    };
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${theme.text}`}>Collaboration</h3>
            <button 
              onClick={() => setShowCollaborationPanel(false)}
              className={`p-2 rounded-lg ${theme.button} ${theme.text}`}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-4">
          {/* Collaboration Status */}
          <div>
            <h4 className={`text-sm font-medium mb-2 ${theme.textSecondary}`}>Sharing Status</h4>
            <div className="flex gap-2">
              <button 
                onClick={() => selectedPackage && handleSharePackage(selectedPackage.id, 'private')}
                className={`px-3 py-2 rounded-md text-sm ${selectedPackage.collaborationStatus === 'private' ? theme.selected : theme.button} ${theme.text}`}>
                Private
              </button>
              <button 
                onClick={() => selectedPackage && handleSharePackage(selectedPackage.id, 'team')}
                className={`px-3 py-2 rounded-md text-sm ${selectedPackage.collaborationStatus === 'team' ? theme.selected : theme.button} ${theme.text}`}>
                Team
              </button>
              <button 
                onClick={() => selectedPackage && handleSharePackage(selectedPackage.id, 'shared')}
                className={`px-3 py-2 rounded-md text-sm ${selectedPackage.collaborationStatus === 'shared' ? theme.selected : theme.button} ${theme.text}`}>
                Public
              </button>
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
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Ask Mama Bear anything... I can research, plan, analyze, or just chat!"
                onKeyPress={(e) => {
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
                onChange={(e) => setBrowserUrl(e.target.value)}
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