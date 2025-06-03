import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Mic, MicOff, Paperclip, Image, Video, FileText, Settings, 
  Sun, Moon, ChevronDown, Copy, ThumbsUp, ThumbsDown, RotateCcw,
  Zap, Eye, Clock, DollarSign, Database, Sparkles, Brain, MessageSquare, X
} from 'lucide-react';
import { sendMessageToModel, uploadFiles, transcribeAudio } from './services/modelService';
import type { Message as ServiceMessage, UploadedFile as ServiceUploadedFile } from './services/modelService';

// Define TypeScript interfaces
interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  preview?: string;
  uploadTime: Date;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  tokens?: number;
  fileIds?: string[];
}

interface CapabilityBadgeProps {
  capability: string;
}

interface CapabilityIcon {
  icon: React.ReactNode;
  color: string;
}

interface AIModel {
  name: string;
  provider: string;
  icon: string;
  color: string;
  capabilities: string[];
  contextLength: string;
  pricing: string;
  rateLimit: string;
  knowledgeCutoff: string;
  specialties: string[];
  description: string;
  useCases: string[];
  badge?: {
    text: string;
    color: string;
  };
}

interface ThemeClasses {
  bg: string;
  cardBg: string;
  border: string;
  text: string;
  textSecondary: string;
  input: string;
  button: string;
}

const ScoutMultiModalChat: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-pro-preview-05-06');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [showModelSelector, setShowModelSelector] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // AI Models configuration (Current Google AI Studio models)
  const models: Record<string, AIModel> = {
    // Gemini 2.5 Models
    'gemini-2.5-pro-preview-05-06': {
      name: 'Gemini 2.5 Pro Preview 05-06',
      provider: 'Google',
      icon: '💎',
      color: 'from-blue-500 to-cyan-500',
      capabilities: ['vision', 'audio', 'code', 'reasoning', 'long-context'],
      contextLength: '2M tokens',
      pricing: '≤200K: $1.25/$10.00 | >200K: $2.50/$15.00',
      rateLimit: '150 RPM',
      knowledgeCutoff: 'Jan 2025',
      specialties: ['Coding', 'Reasoning', 'Multimodal understanding'],
      description: 'Reason over complex problems, tackle difficult code, math and STEM problems',
      useCases: ['Complex problem solving', 'Large dataset analysis', 'Advanced coding tasks'],
      badge: {
        text: 'PRO',
        color: 'bg-blue-600'
      }
    },
    'gemini-2.5-flash-preview-04-17': {
      name: 'Gemini 2.5 Flash Preview 04-17',
      provider: 'Google',
      icon: '⚡',
      color: 'from-cyan-500 to-blue-500',
      capabilities: ['vision', 'audio', 'fast', 'code'],
      contextLength: '1M tokens',
      pricing: '$0.075 / 1M tokens',
      rateLimit: '1000 RPM',
      knowledgeCutoff: 'Apr 2024',
      specialties: ['Speed', 'Multimodal', 'Preview features'],
      description: 'Fast preview model with latest Gemini 2.5 capabilities',
      useCases: ['Quick responses', 'Real-time chat', 'Simple queries'],
      badge: {
        text: 'FLASH',
        color: 'bg-cyan-600'
      }
    },
    'gemini-2.5-flash-preview-05-20': {
      name: 'Gemini 2.5 Flash Preview 05-20',
      provider: 'Google',
      icon: '✨',
      color: 'from-purple-500 to-blue-500',
      capabilities: ['vision', 'audio', 'fast', 'code', 'new'],
      contextLength: '1M tokens',
      pricing: '$0.075 / 1M tokens',
      rateLimit: '1000 RPM',
      knowledgeCutoff: 'May 2024',
      specialties: ['Latest features', 'Speed', 'Multimodal'],
      description: 'Newest Gemini 2.5 Flash preview with enhanced capabilities',
      useCases: ['Quick responses', 'Real-time applications', 'Creative tasks'],
      badge: {
        text: 'NEW',
        color: 'bg-purple-600'
      }
    },
    
    // Gemini 2.0 Models
    'gemini-2.0-flash': {
      name: 'Gemini 2.0 Flash',
      provider: 'Google',
      icon: '🚀',
      color: 'from-orange-500 to-red-500',
      capabilities: ['vision', 'audio', 'video', 'streaming', 'tools'],
      contextLength: 'All lengths',
      pricing: '$0.10 / $0.40 per 1M tokens',
      rateLimit: '2000 RPM | Free: 15 RPM',
      knowledgeCutoff: 'Aug 2024',
      specialties: ['Multimodal understanding', 'Realtime streaming', 'Native tool use'],
      description: 'Process 10,000 lines of code, call tools natively, stream images and video',
      useCases: ['Code processing', 'Tool integration', 'Real-time streaming']
    },
    'gemini-2.0-flash-lite': {
      name: 'Gemini 2.0 Flash-Lite',
      provider: 'Google',
      icon: '💨',
      color: 'from-yellow-400 to-orange-400',
      capabilities: ['fast', 'lightweight', 'streaming'],
      contextLength: 'Standard',
      pricing: '$0.05 / $0.20 per 1M tokens',
      rateLimit: '3000 RPM',
      knowledgeCutoff: 'Aug 2024',
      specialties: ['Ultra-fast', 'Lightweight', 'Cost-effective'],
      description: 'Lightweight version optimized for speed and efficiency',
      useCases: ['Mobile applications', 'Resource-limited devices', 'Quick responses'],
      badge: {
        text: 'LITE',
        color: 'bg-yellow-500'
      }
    },
    
    // Gemini 1.5 Models
    'gemini-1.5-pro': {
      name: 'Gemini 1.5 Pro',
      provider: 'Google',
      icon: '💎',
      color: 'from-blue-600 to-indigo-600',
      capabilities: ['vision', 'audio', 'long-context', 'code'],
      contextLength: '2M tokens',
      pricing: '$1.25 / $5.00 per 1M tokens',
      rateLimit: '360 RPM',
      knowledgeCutoff: 'Feb 2024',
      specialties: ['Long context', 'Complex reasoning', 'Multimodal'],
      description: 'Most capable model for complex, multi-step tasks',
      useCases: ['Complex analysis', 'Research assistance', 'Content creation'],
      badge: {
        text: 'PRO',
        color: 'bg-blue-600'
      }
    },
    'gemini-1.5-flash': {
      name: 'Gemini 1.5 Flash',
      provider: 'Google',
      icon: '⚡',
      color: 'from-yellow-500 to-orange-500',
      capabilities: ['vision', 'audio', 'fast', 'code'],
      contextLength: '1M tokens',
      pricing: '$0.075 / $0.30 per 1M tokens',
      rateLimit: '1000 RPM',
      knowledgeCutoff: 'Feb 2024',
      specialties: ['Speed', 'Efficiency', 'Balanced performance'],
      description: 'Fast and versatile for a wide range of tasks',
      useCases: ['Quick responses', 'Real-time chat', 'Standard tasks'],
      badge: {
        text: 'FAST',
        color: 'bg-orange-600'
      }
    },
    'gemini-1.5-flash-8b': {
      name: 'Gemini 1.5 Flash-8B',
      provider: 'Google',
      icon: '🏃',
      color: 'from-green-500 to-teal-500',
      capabilities: ['fast', 'multilingual', 'summarization', 'low-latency'],
      contextLength: '1M tokens',
      pricing: '≤128K: $0.0375/$0.15 | >128K: $0.075/$0.30',
      badge: {
        text: 'LITE',
        color: 'bg-green-600'
      },
      rateLimit: '4000 RPM | Free: 15 RPM',
      knowledgeCutoff: 'Sep 2024',
      specialties: ['Low latency', 'Multilingual', 'Summarization'],
      description: 'Realtime data transformation, translation, summarize 8 novels worth of text',
      useCases: ['Real-time translation', 'Data transformation', 'Text summarization', 'Mobile', 'Edge devices']
    },
    
    // Gemma Models (Open Source)
    'gemma-3-4b': {
      name: 'Gemma 3 4B',
      provider: 'Google',
      icon: '🎯',
      color: 'from-green-400 to-emerald-500',
      capabilities: ['multimodal', 'multilingual', 'low-latency', 'free'],
      contextLength: 'All lengths',
      pricing: 'FREE ($0.00 / $0.00)',
      rateLimit: 'Free: 30 RPM',
      knowledgeCutoff: 'Aug 2024',
      specialties: ['Free to use', 'Multimodal', 'Fast responses'],
      description: 'Visual and text processing, translation, research content summarization',
      useCases: ['Visual processing', 'Text translation', 'Research summarization'],
      badge: {
        text: 'FREE',
        color: 'bg-green-500'
      }
    },
    
    // Anthropic Models (Current)
    'claude-3-5-sonnet-20241022': {
      name: 'Claude 3.5 Sonnet',
      provider: 'Anthropic',
      icon: '🎭',
      color: 'from-orange-500 to-red-500',
      capabilities: ['vision', 'code', 'reasoning', 'analysis'],
      contextLength: '200K tokens',
      pricing: '$3.00 / $15.00 per 1M tokens',
      rateLimit: '4000 RPM',
      knowledgeCutoff: 'Apr 2024',
      specialties: ['Code generation', 'Analysis', 'Creative writing'],
      description: 'Anthropic\'s most intelligent model for complex tasks',
      useCases: ['Code development', 'Content creation', 'Data analysis'],
      badge: {
        text: 'PRO',
        color: 'bg-orange-600'
      }
    },
    'claude-3-5-haiku-20241022': {
      name: 'Claude 3.5 Haiku',
      provider: 'Anthropic',
      icon: '🌸',
      color: 'from-pink-500 to-rose-500',
      capabilities: ['fast', 'code', 'reasoning', 'vision'],
      contextLength: '200K tokens',
      pricing: '$0.80 / $4.00 per 1M tokens',
      rateLimit: '5000 RPM',
      knowledgeCutoff: 'Jul 2024',
      specialties: ['Speed', 'Vision', 'Cost-effective'],
      description: 'Fast and intelligent with vision capabilities',
      useCases: ['Quick responses', 'Image understanding', 'Daily assistance'],
      badge: {
        text: 'FAST',
        color: 'bg-pink-500'
      }
    },
    'claude-3-opus-20240229': {
      name: 'Claude 3 Opus',
      provider: 'Anthropic',
      icon: '👑',
      color: 'from-purple-600 to-indigo-600',
      capabilities: ['vision', 'reasoning', 'analysis', 'creative'],
      contextLength: '200K tokens',
      pricing: '$15.00 / $75.00 per 1M tokens',
      rateLimit: '4000 RPM',
      knowledgeCutoff: 'Aug 2023',
      specialties: ['Top performance', 'Complex reasoning', 'Research'],
      description: 'Most powerful model for highly complex tasks',
      useCases: ['Scientific research', 'Complex problem solving', 'Advanced analysis'],
      badge: {
        text: 'PREMIUM',
        color: 'bg-indigo-700'
      }
    },
    
    // OpenAI Models (Current)
    'gpt-4o': {
      name: 'GPT-4o',
      provider: 'OpenAI',
      icon: '🤖',
      color: 'from-green-500 to-emerald-500',
      capabilities: ['vision', 'audio', 'code', 'reasoning'],
      contextLength: '128K tokens',
      pricing: '$2.50 / $10.00 per 1M tokens',
      rateLimit: '10000 RPM',
      knowledgeCutoff: 'Oct 2023',
      specialties: ['Multimodal', 'Reasoning', 'General purpose'],
      description: 'OpenAI\'s flagship multimodal model',
      useCases: ['Image understanding', 'General assistant', 'Content creation'],
      badge: {
        text: 'PRO',
        color: 'bg-emerald-600'
      }
    },
    'gpt-4o-mini': {
      name: 'GPT-4o Mini',
      provider: 'OpenAI',
      icon: '🚀',
      color: 'from-teal-500 to-blue-500',
      capabilities: ['vision', 'fast', 'code'],
      contextLength: '128K tokens',
      pricing: '$0.15 / $0.60 per 1M tokens',
      rateLimit: '30000 RPM',
      knowledgeCutoff: 'Oct 2023',
      specialties: ['Speed', 'Efficiency', 'Vision'],
      description: 'Smaller, faster version of GPT-4o',
      useCases: ['Quick responses', 'Real-time applications', 'Simple vision tasks'],
      badge: {
        text: 'MINI',
        color: 'bg-green-600'
      }
    },
    'o1-preview': {
      name: 'o1 Preview',
      provider: 'OpenAI',
      icon: '🧠',
      color: 'from-purple-500 to-indigo-500',
      capabilities: ['reasoning', 'math', 'science', 'code'],
      contextLength: '128K tokens',
      pricing: '$15.00 / $60.00 per 1M tokens',
      rateLimit: '500 RPM',
      knowledgeCutoff: 'Oct 2023',
      specialties: ['Advanced reasoning', 'Math', 'Science'],
      description: 'OpenAI\'s reasoning model for complex problems',
      useCases: ['Complex reasoning', 'Mathematical proofs', 'Scientific research'],
      badge: {
        text: 'PREMIUM',
        color: 'bg-purple-600'
      }
    },
    'o1-mini': {
      name: 'o1 Mini',
      provider: 'OpenAI',
      icon: '🔬',
      color: 'from-violet-500 to-purple-500',
      capabilities: ['reasoning', 'math', 'code', 'fast'],
      contextLength: '128K tokens',
      pricing: '$3.00 / $12.00 per 1M tokens',
      rateLimit: '1000 RPM',
      knowledgeCutoff: 'Oct 2023',
      specialties: ['Fast reasoning', 'STEM', 'Coding'],
      description: 'Faster reasoning model for STEM and coding',
      useCases: ['Coding assistance', 'Technical problems', 'Academic work'],
      badge: {
        text: 'MINI',
        color: 'bg-violet-600'
      }
    }
  };

  const currentModel = models[selectedModel];

  // Theme classes
  const themeClasses = {
    bg: isDarkMode ? 'bg-slate-900' : 'bg-gray-50',
    cardBg: isDarkMode ? 'bg-slate-800/80' : 'bg-white/80',
    border: isDarkMode ? 'border-slate-700/50' : 'border-gray-200/50',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-slate-300' : 'text-gray-600',
    input: isDarkMode ? 'bg-slate-800/50 border-slate-700/50 text-white' : 'bg-white/50 border-gray-300/50 text-gray-900',
    button: isDarkMode ? 'bg-slate-700/50 hover:bg-slate-600/50' : 'bg-gray-100/50 hover:bg-gray-200/50'
  };

  // Handle file uploads
  const handleFileUpload = async (files: FileList, type: string): Promise<void> => {
    if (!files || files.length === 0) return;
    
    try {
      // Show temporary local previews first for better UX
      const tempFiles: UploadedFile[] = Array.from(files).map(file => ({
        id: Math.random().toString(36).substring(2, 15),
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        uploadTime: new Date()
      }));
      
      setUploadedFiles(prev => [...prev, ...tempFiles]);
      
      // Upload files to server using our service
      const serverFiles = await uploadFiles(Array.from(files));
      
      // Convert service format to our component format
      const uploadedFilesResponse: UploadedFile[] = serverFiles.map(file => ({
        id: file.id,
        name: file.name,
        type: file.type,
        size: file.size,
        url: file.url,
        preview: file.preview,
        uploadTime: file.uploadTime
      }));
      
      // Replace temporary files with actual server responses
      setUploadedFiles(prev => {
        const filteredPrev = prev.filter(p => !tempFiles.some(t => t.id === p.id));
        return [...filteredPrev, ...uploadedFilesResponse];
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      // Show error message to user
      alert('Failed to upload files. Please try again.');
    }
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileUpload(files, 'file');
  };

  // Remove uploaded file
  const handleRemoveFile = (fileId: string): void => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  // Send message
  const handleSendMessage = async (): Promise<void> => {
    if (!inputText.trim() && uploadedFiles.length === 0) return;

    // Add user message
    const userMessage: Message = {
      id: Math.random().toString(36).substring(2, 15),
      role: 'user',
      content: inputText,
      timestamp: new Date(),
      fileIds: uploadedFiles.map(file => file.id)
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    try {
      // Convert our messages to service format
      const serviceMessages: ServiceMessage[] = messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        tokens: msg.tokens,
        model: msg.model,
        fileIds: msg.fileIds
      }));
      
      // Convert user message to service format
      const serviceUserMessage: ServiceMessage = {
        id: userMessage.id,
        role: userMessage.role,
        content: userMessage.content,
        timestamp: userMessage.timestamp,
        fileIds: userMessage.fileIds
      };
      
      // Convert our files to service format
      const serviceFiles: ServiceUploadedFile[] = uploadedFiles.map(file => ({
        id: file.id,
        name: file.name,
        type: file.type,
        size: file.size,
        url: file.url,
        preview: file.preview,
        uploadTime: file.uploadTime
      }));
      
      // Send message to the appropriate model via our service
      const modelResponse = await sendMessageToModel(
        selectedModel, 
        [...serviceMessages, serviceUserMessage],
        serviceFiles
      );
      
      // Convert service response to our format
      const aiMessage: Message = {
        id: modelResponse.message.id,
        role: modelResponse.message.role,
        content: modelResponse.message.content,
        timestamp: modelResponse.message.timestamp,
        model: modelResponse.message.model,
        tokens: modelResponse.message.tokens,
        fileIds: modelResponse.message.fileIds
      };
      
      // Add AI response to messages
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting model response:', error);
      
      // Add error message if API call fails
      const errorMessage: Message = {
        id: Math.random().toString(36).substring(2, 15),
        role: 'assistant',
        content: 'I apologize, but I encountered an error while processing your message. Please try again or select a different model.',
        timestamp: new Date(),
        model: selectedModel
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Capability badges
  const CapabilityBadge: React.FC<CapabilityBadgeProps> = ({ capability }) => {
    const capabilityIcons: Record<string, CapabilityIcon> = {
      vision: { icon: <Eye size={12} />, color: 'bg-blue-500/20 text-blue-400' },
      audio: { icon: <Mic size={12} />, color: 'bg-green-500/20 text-green-400' },
      video: { icon: <Video size={12} />, color: 'bg-purple-500/20 text-purple-400' },
      code: { icon: <FileText size={12} />, color: 'bg-orange-500/20 text-orange-400' },
      reasoning: { icon: <Brain size={12} />, color: 'bg-pink-500/20 text-pink-400' },
      'long-context': { icon: <Database size={12} />, color: 'bg-cyan-500/20 text-cyan-400' },
      fast: { icon: <Zap size={12} />, color: 'bg-yellow-500/20 text-yellow-400' },
      math: { icon: <Sparkles size={12} />, color: 'bg-indigo-500/20 text-indigo-400' },
      science: { icon: <Sparkles size={12} />, color: 'bg-teal-500/20 text-teal-400' },
      analysis: { icon: <Brain size={12} />, color: 'bg-red-500/20 text-red-400' }
    };

    const config = capabilityIcons[capability] || capabilityIcons.code;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {capability}
      </span>
    );
  };

  return (
    <div className={`h-screen flex ${themeClasses.bg} transition-colors duration-300`}>
      {/* Model Selector Sidebar */}
      <div className={`w-80 ${themeClasses.cardBg} backdrop-blur-md border-r ${themeClasses.border} flex flex-col`}>
        {/* Header */}
        <div className="p-6 border-b border-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-bold ${themeClasses.text}`}>🤖 AI Models</h2>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg ${themeClasses.button} transition-colors`}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
          <p className={`text-sm ${themeClasses.textSecondary}`}>
            Choose your AI companion for different tasks
          </p>
        </div>

        {/* Model List */}
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {Object.entries(models).map(([key, model]) => (
            <div
              key={key}
              onClick={() => setSelectedModel(key)}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                selectedModel === key 
                  ? `border-purple-500/50 bg-gradient-to-r ${model.color} bg-opacity-10` 
                  : `border-transparent ${themeClasses.button} hover:border-purple-500/30`
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${model.color} flex items-center justify-center text-lg shadow-lg`}>
                  {model.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-semibold ${themeClasses.text} text-sm`}>{model.name}</h3>
                    {model.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${model.badge.color}`}>
                        {model.badge.text}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs ${themeClasses.textSecondary}`}>{model.provider}</p>
                </div>
              </div>
              
              <p className={`text-xs ${themeClasses.textSecondary} mb-3 line-clamp-2`}>
                {model.description}
              </p>

              <div className="flex flex-wrap gap-1 mb-3">
                {model.capabilities.slice(0, 3).map(cap => (
                  <CapabilityBadge key={cap} capability={cap} />
                ))}
                {model.capabilities.length > 3 && (
                  <span className="text-xs text-purple-400">+{model.capabilities.length - 3}</span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-1 text-xs">
                <div className={`${themeClasses.textSecondary}`}>
                  <Clock size={10} className="inline mr-1" />
                  {model.contextLength}
                </div>
                <div className={`${themeClasses.textSecondary} truncate`}>
                  <DollarSign size={10} className="inline mr-1" />
                  {model.pricing}
                </div>
                {model.rateLimit && (
                  <div className={`${themeClasses.textSecondary}`}>
                    <Zap size={10} className="inline mr-1" />
                    {model.rateLimit}
                  </div>
                )}
                {model.knowledgeCutoff && (
                  <div className={`${themeClasses.textSecondary}`}>
                    📅 {model.knowledgeCutoff}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className={`${themeClasses.cardBg} backdrop-blur-md border-b ${themeClasses.border} p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${currentModel.color} flex items-center justify-center text-xl shadow-lg`}>
                {currentModel.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className={`text-xl font-bold ${themeClasses.text}`}>{currentModel.name}</h1>
                  {currentModel.badge && (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      currentModel.badge.text === 'NEW' ? 'bg-blue-500/20 text-blue-400' : 
                      currentModel.badge.text === 'FREE' ? 'bg-green-500/20 text-green-400' : 
                      currentModel.badge.color || 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {currentModel.badge.text}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs">
                  <span className={`${themeClasses.textSecondary}`}>
                    <Database size={12} className="inline mr-1" />
                    {currentModel.contextLength}
                  </span>
                  <span className={`${themeClasses.textSecondary}`}>
                    <DollarSign size={12} className="inline mr-1" />
                    {currentModel.pricing}
                  </span>
                  {currentModel.rateLimit && (
                    <span className={`${themeClasses.textSecondary}`}>
                      <Zap size={12} className="inline mr-1" />
                      {currentModel.rateLimit}
                    </span>
                  )}
                  {currentModel.knowledgeCutoff && (
                    <span className={`${themeClasses.textSecondary}`}>
                      📅 {currentModel.knowledgeCutoff}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className={`p-2 rounded-lg ${themeClasses.button} transition-colors`}>
                <Settings size={18} />
              </button>
              <button className={`p-2 rounded-lg ${themeClasses.button} transition-colors`}>
                <RotateCcw size={18} />
              </button>
            </div>
          </div>

          {/* Capabilities Row */}
          <div className="flex flex-wrap gap-2 mt-4">
            {currentModel.capabilities.map(cap => (
              <CapabilityBadge key={cap} capability={cap} />
            ))}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className={`w-24 h-24 rounded-2xl bg-gradient-to-r ${currentModel.color} flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl`}>
                {currentModel.icon}
              </div>
              <h2 className={`text-2xl font-bold ${themeClasses.text} mb-2`}>
                Chat with {currentModel.name}
              </h2>
              <p className={`${themeClasses.textSecondary} mb-6 max-w-md mx-auto`}>
                {currentModel.description}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {currentModel.specialties.map(specialty => (
                  <span key={specialty} className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-lg ${
                message.role === 'user' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                  : `bg-gradient-to-r ${message.model && models[message.model]?.color || 'from-purple-700 to-purple-900'}`
              }`}>
                {message.role === 'user' ? '👤' : (message.model && models[message.model]?.icon || '🤖')}
              </div>
              
              <div className={`flex-1 max-w-3xl ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-4 rounded-2xl ${themeClasses.cardBg} backdrop-blur-md border ${themeClasses.border} shadow-lg`}>
                  {message.fileIds && message.fileIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {message.fileIds.map(fileId => {
                        const file = uploadedFiles.find(f => f.id === fileId);
                        return (
                          <div key={fileId} className="flex items-center gap-2 p-2 bg-purple-500/20 rounded-lg">
                            {file?.preview ? (
                              <img src={file.preview} alt={file.name} className="w-8 h-8 rounded object-cover" />
                            ) : (
                              <FileText size={16} className="text-purple-400" />
                            )}
                            <span className="text-sm text-purple-300">{file?.name || 'File'}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  <p className={`${themeClasses.text} leading-relaxed`}>{message.content}</p>
                  
                  <div className={`flex items-center gap-3 mt-3 pt-3 border-t ${themeClasses.border}`}>
                    <span className={`text-xs ${themeClasses.textSecondary}`}>
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    {message.tokens && (
                      <span className={`text-xs ${themeClasses.textSecondary}`}>
                        {message.tokens} tokens
                      </span>
                    )}
                    <div className="flex gap-1 ml-auto">
                      <button className={`p-1 rounded ${themeClasses.button} transition-colors`}>
                        <Copy size={12} />
                      </button>
                      <button className={`p-1 rounded ${themeClasses.button} transition-colors`}>
                        <ThumbsUp size={12} />
                      </button>
                      <button className={`p-1 rounded ${themeClasses.button} transition-colors`}>
                        <ThumbsDown size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${currentModel.color} flex items-center justify-center text-lg shadow-lg`}>
                {currentModel.icon}
              </div>
              <div className={`p-4 rounded-2xl ${themeClasses.cardBg} backdrop-blur-md border ${themeClasses.border}`}>
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
        <div className={`${themeClasses.cardBg} backdrop-blur-md border-t ${themeClasses.border} p-4`}>
          {/* File Uploads Preview */}
          {uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 p-3 bg-purple-500/10 rounded-xl">
              {uploadedFiles.map(file => (
                <div key={file.id} className="flex items-center gap-2 p-2 bg-purple-500/20 rounded-lg">
                  <span className="text-xs truncate max-w-[150px]">{file.name}</span>
                  <button
                    onClick={() => handleRemoveFile(file.id)}
                    className="p-1 rounded-full bg-purple-600/30 hover:bg-purple-600/50 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Message Input */}
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${currentModel.name}...`}
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              onDrop={(e: React.DragEvent<HTMLTextAreaElement>) => {
                e.preventDefault();
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                  handleFileUpload(files, 'file');
                }
              }}
              onDragOver={(e: React.DragEvent<HTMLTextAreaElement>) => e.preventDefault()}
              className={`w-full px-4 py-3 pr-12 rounded-xl border ${themeClasses.input} focus:border-purple-400 focus:outline-none resize-none transition-colors backdrop-blur-sm`}
              rows={1}
              style={{ minHeight: '50px' }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() && uploadedFiles.length === 0}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 ${inputText.trim() || uploadedFiles.length > 0 ? '' : 'opacity-50 cursor-not-allowed'}`}
            >
              <Send size={16} />
            </button>
          </div>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            hidden
            multiple
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileUpload(e.target.files, 'file');
              }
            }}
          />
          <input
            ref={imageInputRef}
            type="file"
            hidden
            accept="image/*"
            multiple
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileUpload(e.target.files, 'image');
              }
            }}
          />
          <input
            ref={videoInputRef}
            type="file"
            hidden
            accept="video/*"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileUpload(e.target.files, 'video');
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ScoutMultiModalChat;