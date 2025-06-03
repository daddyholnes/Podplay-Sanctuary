import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Paperclip, 
  Mic, 
  Video, 
  Camera,
  Upload,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Zap,
  Eye,
  Clock,
  DollarSign,
  Activity,
  Smile,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useThemeStore, useChatStore } from '@/stores';
import { AIModel, Message } from '@/types';

const MultiModalChat: React.FC = () => {
  const { theme } = useThemeStore();
  const { selectedModel, setSelectedModel } = useChatStore();
  
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedTextColor, setSelectedTextColor] = useState('default');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Emoji options
  const commonEmojis = [
    '😀', '😂', '🤣', '😊', '😍', '🤔', '👍', '👎', '❤️', '🔥',
    '💯', '🎉', '🚀', '💡', '⚡', '🌟', '🎯', '🏆', '💪', '🙌',
    '👏', '🤝', '🙏', '✨', '🌈', '🎈', '🎊', '🥳', '😎', '🤩'
  ];

  // Text color options
  const textColors = [
    { name: 'Default', value: 'default', class: '' },
    { name: 'Purple', value: 'purple', class: 'text-purple-600 dark:text-purple-400' },
    { name: 'Blue', value: 'blue', class: 'text-blue-600 dark:text-blue-400' },
    { name: 'Green', value: 'green', class: 'text-green-600 dark:text-green-400' },
    { name: 'Orange', value: 'orange', class: 'text-orange-600 dark:text-orange-400' },
    { name: 'Red', value: 'red', class: 'text-red-600 dark:text-red-400' },
    { name: 'Pink', value: 'pink', class: 'text-pink-600 dark:text-pink-400' },
    { name: 'Indigo', value: 'indigo', class: 'text-indigo-600 dark:text-indigo-400' }
  ];

  // Available AI Models with latest API data for paid tier users
  const availableModels: AIModel[] = [
    // Gemini Models
    {
      id: 'gemini-2.5-pro-preview-05-06',
      name: 'Gemini 2.5 Pro Preview',
      provider: 'gemini',
      capabilities: ['Coding', 'Reasoning', 'Multimodal'],
      pricing: { input: 1.25, output: 10.00 },
      context_length: 200000,
      rate_limits: { rpm: 150 },
      knowledge_cutoff: 'Jan 2025',
      badges: ['NEW']
    },
    {
      id: 'gemini-2.0-flash-exp',
      name: 'Gemini 2.0 Flash Experimental',
      provider: 'gemini',
      capabilities: ['Multimodal', 'Realtime', 'Tool use'],
      pricing: { input: 0.075, output: 0.30 },
      context_length: 1000000,
      rate_limits: { rpm: 2000, rpd: 1500 },
      knowledge_cutoff: 'Aug 2024',
      badges: ['EXPERIMENTAL']
    },
    {
      id: 'gemini-1.5-pro-002',
      name: 'Gemini 1.5 Pro 002',
      provider: 'gemini',
      capabilities: ['Complex reasoning', 'Multimodal', 'Long context'],
      pricing: { input: 1.25, output: 5.00 },
      context_length: 2000000,
      rate_limits: { rpm: 360, rpd: 1500 },
      knowledge_cutoff: 'Oct 2024'
    },
    {
      id: 'gemini-1.5-flash-002',
      name: 'Gemini 1.5 Flash 002',
      provider: 'gemini',
      capabilities: ['Fast', 'Multimodal', 'Cost-effective'],
      pricing: { input: 0.075, output: 0.30 },
      context_length: 1000000,
      rate_limits: { rpm: 1000, rpd: 1500 },
      knowledge_cutoff: 'Oct 2024'
    },
    
    // OpenAI Models (Latest Tier 1/Paid)
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'openai',
      capabilities: ['Vision', 'Code', 'Reasoning', 'Audio'],
      pricing: { input: 2.50, output: 10.00 },
      context_length: 128000,
      rate_limits: { rpm: 3000 },
      knowledge_cutoff: 'Oct 2023'
    },
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: 'openai',
      capabilities: ['Vision', 'Code', 'Fast'],
      pricing: { input: 0.15, output: 0.60 },
      context_length: 128000,
      rate_limits: { rpm: 5000 },
      knowledge_cutoff: 'Oct 2023'
    },
    {
      id: 'o1-preview',
      name: 'o1 Preview',
      provider: 'openai',
      capabilities: ['Advanced reasoning', 'Complex problems'],
      pricing: { input: 15.00, output: 60.00 },
      context_length: 128000,
      rate_limits: { rpm: 500 },
      knowledge_cutoff: 'Oct 2023',
      badges: ['REASONING']
    },
    {
      id: 'o1-mini',
      name: 'o1 Mini',
      provider: 'openai',
      capabilities: ['Fast reasoning', 'STEM', 'Math'],
      pricing: { input: 3.00, output: 12.00 },
      context_length: 128000,
      rate_limits: { rpm: 1000 },
      knowledge_cutoff: 'Oct 2023',
      badges: ['REASONING', 'FAST']
    },
    
    // Anthropic Models (Latest Claude 3.5 & 4.0 Series)
    {
      id: 'claude-3-5-sonnet-20241022',
      name: 'Claude 3.5 Sonnet (New)',
      provider: 'anthropic',
      capabilities: ['Vision', 'Code', 'Analysis', 'Writing'],
      pricing: { input: 3.00, output: 15.00 },
      context_length: 200000,
      rate_limits: { rpm: 4000 },
      knowledge_cutoff: 'Apr 2024',
      badges: ['UPDATED']
    },
    {
      id: 'claude-3-5-haiku-20241022',
      name: 'Claude 3.5 Haiku',
      provider: 'anthropic',
      capabilities: ['Fast', 'Vision', 'Cost-effective'],
      pricing: { input: 0.80, output: 4.00 },
      context_length: 200000,
      rate_limits: { rpm: 5000 },
      knowledge_cutoff: 'Jul 2024',
      badges: ['NEW', 'VISION']
    },
    {
      id: 'claude-3-opus-20240229',
      name: 'Claude 3 Opus',
      provider: 'anthropic',
      capabilities: ['Top performance', 'Complex tasks', 'Research'],
      pricing: { input: 15.00, output: 75.00 },
      context_length: 200000,
      rate_limits: { rpm: 4000 },
      knowledge_cutoff: 'Aug 2023',
      badges: ['PREMIUM']
    }
  ];

  useEffect(() => {
    if (!selectedModel && availableModels.length > 0) {
      setSelectedModel(availableModels[0]);
    }
  }, [selectedModel, setSelectedModel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'gemini': return 'blue';
      case 'openai': return 'green';
      case 'anthropic': return 'orange';
      default: return 'gray';
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !selectedModel) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      conversation_id: 'multi-modal-chat',
      sender_type: 'user',
      content: inputValue,
      attachments: uploadedFiles.length > 0 ? uploadedFiles.map(file => ({
        id: Date.now().toString(),
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'document',
        size: file.size,
        url: URL.createObjectURL(file)
      })) : undefined,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setUploadedFiles([]);
    setIsLoading(true);

    try {
      // Here you would call the appropriate API based on the selected model
      // For now, simulate a response
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          conversation_id: 'multi-modal-chat',
          sender_type: 'assistant',
          content: `Hello! I'm ${selectedModel.name}. I understand you said: "${inputValue}". How can I help you further with my ${selectedModel.capabilities.join(', ')} capabilities?`,
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Implement audio recording logic
  };

  const insertEmoji = (emoji: string) => {
    setInputValue(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const getTextColorClass = () => {
    const color = textColors.find(c => c.value === selectedTextColor);
    return color?.class || '';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Compact Model Selection Tabs */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`border-b ${
          theme === 'light'
            ? 'bg-white/50 border-purple-200'
            : theme === 'dark'
            ? 'bg-slate-800/50 border-slate-700'
            : 'bg-purple-900/30 border-purple-600/30'
        } backdrop-blur-md`}
      >
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className={`text-lg font-semibold ${
              theme === 'light' ? 'text-purple-800' : 'text-purple-100'
            }`}>
              AI Models
            </h2>
            <Badge variant="outline" className="text-xs">
              {availableModels.length} available
            </Badge>
          </div>
          
          <ScrollArea className="w-full">
            <div className="flex space-x-2 pb-2">
              {availableModels.map((model, index) => {
                const isSelected = selectedModel?.id === model.id;
                return (
                  <motion.div
                    key={model.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="relative group"
                  >
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedModel(model)}
                      className={`min-w-fit whitespace-nowrap relative ${
                        isSelected
                          ? `bg-${getProviderColor(model.provider)}-600 hover:bg-${getProviderColor(model.provider)}-700`
                          : `hover:border-${getProviderColor(model.provider)}-300`
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Zap className={`w-3 h-3 ${
                          isSelected ? 'text-white' : `text-${getProviderColor(model.provider)}-600`
                        }`} />
                        <span className="text-xs font-medium">{model.name}</span>
                        {model.badges?.map((badge) => (
                          <Badge 
                            key={badge} 
                            variant="secondary" 
                            className="text-xs px-1 py-0 text-xs"
                          >
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    </Button>
                    
                    {/* Hover Tooltip */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <Card className="shadow-xl border-2">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-sm">{model.name}</h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs text-${getProviderColor(model.provider)}-600`}
                                >
                                  {model.provider.toUpperCase()}
                                </Badge>
                                {model.badges?.map((badge) => (
                                  <Badge key={badge} variant="secondary" className="text-xs">
                                    {badge}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-3">
                          {/* Capabilities */}
                          <div>
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Best for:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {model.capabilities.map((capability) => (
                                <Badge key={capability} variant="outline" className="text-xs">
                                  {capability}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Pricing & Stats */}
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <div className="flex items-center space-x-1 mb-1">
                                <DollarSign className="w-3 h-3" />
                                <span className="font-medium">Pricing</span>
                              </div>
                              <p>In: ${model.pricing.input}/1M</p>
                              <p>Out: ${model.pricing.output}/1M</p>
                            </div>
                            <div>
                              <div className="flex items-center space-x-1 mb-1">
                                <Activity className="w-3 h-3" />
                                <span className="font-medium">Limits</span>
                              </div>
                              <p>{model.rate_limits.rpm} RPM</p>
                              {model.rate_limits.rpd && <p>{model.rate_limits.rpd} RPD</p>}
                            </div>
                          </div>

                          {/* Context & Updates */}
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{model.context_length.toLocaleString()} tokens</span>
                            </div>
                            {model.knowledge_cutoff && (
                              <span className="text-gray-500">
                                Updated: {model.knowledge_cutoff}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </motion.div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={`p-4 border-b flex items-center justify-between ${
            theme === 'light'
              ? 'bg-white/50 border-purple-200'
              : theme === 'dark'
              ? 'bg-slate-800/50 border-slate-700'
              : 'bg-purple-900/30 border-purple-600/30'
          } backdrop-blur-md`}
        >
          {selectedModel && (
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-${getProviderColor(selectedModel.provider)}-100 dark:bg-${getProviderColor(selectedModel.provider)}-900/30`}>
                <Zap className={`w-5 h-5 text-${getProviderColor(selectedModel.provider)}-600`} />
              </div>
              <div>
                <h3 className={`font-semibold ${
                  theme === 'light' ? 'text-purple-800' : 'text-purple-100'
                }`}>
                  {selectedModel.name}
                </h3>
                <p className={`text-sm ${
                  theme === 'light' ? 'text-purple-600' : 'text-purple-300'
                }`}>
                  ${selectedModel.pricing.input}/${selectedModel.pricing.output} • {selectedModel.context_length.toLocaleString()} tokens
                </p>
              </div>
              {selectedModel.badges?.map((badge) => (
                <Badge key={badge} variant="secondary">
                  {badge}
                </Badge>
              ))}
            </div>
          )}
        </motion.div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.length === 0 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center py-12"
              >
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  theme === 'light' ? 'bg-purple-100' : 'bg-purple-800/30'
                }`}>
                  <Zap className="w-10 h-10 text-purple-600" />
                </div>
                <h4 className={`text-lg font-semibold mb-2 ${
                  theme === 'light' ? 'text-purple-800' : 'text-purple-100'
                }`}>
                  Ready to chat with {selectedModel?.name}
                </h4>
                <p className={`${
                  theme === 'light' ? 'text-purple-600' : 'text-purple-300'
                }`}>
                  Start a conversation with multi-modal AI capabilities
                </p>
              </motion.div>
            )}

            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.sender_type === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.sender_type === 'user'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : theme === 'light'
                      ? 'bg-white border border-gray-200 shadow-sm text-gray-900'
                      : 'bg-slate-700 border border-slate-600 text-gray-100'
                  }`}>
                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {message.attachments.map((attachment) => (
                          <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-black/10 rounded-lg">
                            {attachment.type === 'image' ? <Eye className="w-4 h-4" /> : <Paperclip className="w-4 h-4" />}
                            <span className="text-sm truncate">{attachment.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <p className={`whitespace-pre-wrap font-medium leading-relaxed ${
                      message.sender_type === 'user' 
                        ? 'text-white' 
                        : selectedTextColor === 'default' 
                        ? (theme === 'light' ? 'text-gray-900' : 'text-gray-100')
                        : getTextColorClass()
                    }`} 
                    style={{ 
                      fontSize: '15px', 
                      lineHeight: '1.6',
                      fontFamily: 'Inter, system-ui, sans-serif'
                    }}>
                      {message.content}
                    </p>
                    
                    <div className="flex items-center justify-between mt-3">
                      <p className={`text-xs font-medium ${
                        message.sender_type === 'user' 
                          ? 'text-purple-100' 
                          : theme === 'light' 
                          ? 'text-gray-600' 
                          : 'text-gray-300'
                      }`}>
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                      
                      {message.sender_type === 'assistant' && (
                        <div className="flex items-center space-x-1">
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <ThumbsUp className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <ThumbsDown className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  theme === 'light'
                    ? 'bg-white border border-gray-200'
                    : 'bg-slate-700 border border-slate-600'
                }`}>
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className={`p-4 border-t ${
            theme === 'light'
              ? 'bg-white/50 border-purple-200'
              : theme === 'dark'
              ? 'bg-slate-800/50 border-slate-700'
              : 'bg-purple-900/30 border-purple-600/30'
          } backdrop-blur-md`}
        >
          <div className="max-w-4xl mx-auto">
            {/* File Previews */}
            {uploadedFiles.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                    theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-slate-700 border-slate-600'
                  }`}>
                    {file.type.startsWith('image/') ? <Eye className="w-4 h-4" /> : <Paperclip className="w-4 h-4" />}
                    <span className="text-sm truncate max-w-32">{file.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0"
                      onClick={() => removeFile(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end space-x-3 relative">
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-purple-600 hover:text-purple-700"
                  title="Attach file"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-purple-600 hover:text-purple-700"
                  title="Upload media"
                >
                  <Upload className="w-4 h-4" />
                </Button>
                
                {/* Emoji Picker Button */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-purple-600 hover:text-purple-700"
                    title="Add emoji"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                  
                  {/* Emoji Picker Dropdown */}
                  {showEmojiPicker && (
                    <div className={`absolute bottom-full left-0 mb-2 p-3 rounded-lg border shadow-lg z-50 w-64 ${
                      theme === 'light' 
                        ? 'bg-white border-gray-200' 
                        : 'bg-slate-800 border-slate-600'
                    }`}>
                      <div className="grid grid-cols-8 gap-1">
                        {commonEmojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => insertEmoji(emoji)}
                            className="p-1 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded text-lg transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Text Color Picker */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="text-purple-600 hover:text-purple-700"
                    title="Text color"
                  >
                    <Palette className="w-4 h-4" />
                  </Button>
                  
                  {/* Color Picker Dropdown */}
                  {showColorPicker && (
                    <div className={`absolute bottom-full left-0 mb-2 p-3 rounded-lg border shadow-lg z-50 w-48 ${
                      theme === 'light' 
                        ? 'bg-white border-gray-200' 
                        : 'bg-slate-800 border-slate-600'
                    }`}>
                      <h4 className="text-sm font-medium mb-2">Text Color</h4>
                      <div className="space-y-1">
                        {textColors.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => {
                              setSelectedTextColor(color.value);
                              setShowColorPicker(false);
                            }}
                            className={`w-full text-left px-2 py-1 rounded text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors ${
                              selectedTextColor === color.value ? 'bg-purple-100 dark:bg-purple-900/30' : ''
                            } ${color.class}`}
                          >
                            {color.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleRecording}
                  className={`${isRecording ? 'text-red-600' : 'text-purple-600'} hover:text-purple-700`}
                  title="Voice recording"
                >
                  <Mic className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-purple-600 hover:text-purple-700"
                  title="Video recording"
                >
                  <Video className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-purple-600 hover:text-purple-700"
                  title="Take photo"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex-1">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Message ${selectedModel?.name || 'AI'}...`}
                  className={`min-h-[44px] max-h-32 resize-none font-medium text-base leading-relaxed ${getTextColorClass()}`}
                  rows={1}
                  style={{ 
                    fontSize: '16px', 
                    lineHeight: '1.6',
                    fontFamily: 'Inter, system-ui, sans-serif'
                  }}
                />
              </div>
              
              <Button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf,.txt,.doc,.docx"
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  );
};

export default MultiModalChat;