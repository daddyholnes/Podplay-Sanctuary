import React, { useState, useRef, useEffect } from 'react';
import ScoutLogo from './components/ScoutLogo';
import { Sparkles, MessageSquare, ArrowRight, Paperclip, Mic, MicOff, Image, Video, X, FileText, Upload, UploadCloud, Music, SlidersHorizontal, MessageCircle, Send, File, Smile, ChevronDown } from 'lucide-react';
import { sendMessageToModel, uploadFiles, transcribeAudio } from './services/modelService';
import { modelData, modelGroups } from './services/modelData';

// Custom Badge component since we don't have @mantine/core
interface BadgeProps {
  children: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'purple' | 'indigo';
  size?: 'xs' | 'sm';
}

const Badge: React.FC<BadgeProps> = ({ children, color = 'blue', size = 'xs' }) => {
  const colorClasses = {
    blue: 'bg-indigo-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    purple: 'bg-purple-600',
    indigo: 'bg-indigo-600'
  };
  
  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5'
  };
  
  return (
    <span className={`${colorClasses[color]} ${sizeClasses[size]} font-semibold rounded text-white inline-flex items-center justify-center`}>
      {children}
    </span>
  );
};

// Import types from service
import type { Message as ServiceMessage, UploadedFile as ServiceUploadedFile, Model as AIModel } from './services/modelService';

// TypeScript interfaces
interface Message extends ServiceMessage {
  tokens?: number;
}

interface ModelResponse {
  message: Message;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  preview?: string;
  uploadTime: Date;
}

// Helper function to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

const ScoutMultiModalChat: React.FC = () => {
  // State
  const [inputText, setInputText] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-pro-preview-05-06');
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Emoji set
  const emojis = ['😊', '👍', '🎉', '🤔', '❤️', '👋', '🔥', '✨', '🚀', '👏', 
                  '😂', '🙌', '👀', '💡', '📝', '🧠', '🤖', '💻', '🌟', '🎯'];
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputText.trim() && uploadedFiles.length === 0) return;
    
    // Prepare user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: inputText.trim(),
      createdAt: new Date(),
      fileIds: uploadedFiles.map(file => file.id)
    };
    
    // Add user message to chat
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    setUploadedFiles([]);
    setIsLoading(true);
    
    try {
      // Prepare files for sending
      const fileUrls = uploadedFiles.map(file => file.url);
      
      // Send message to model
      const response = await sendMessageToModel(
        selectedModel,
        [userMessage],
        uploadedFiles.map(file => ({
          id: file.id,
          name: file.name,
          type: file.type,
          size: file.size,
          url: file.url,
          uploadTime: file.uploadTime
        }))
      );
      
      // Add assistant response to chat
      setMessages(prevMessages => [...prevMessages, {
        id: response.message.id,
        role: 'assistant',
        content: response.message.content,
        createdAt: new Date(),
        model: selectedModel,
        tokens: response.usage?.totalTokens
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      setMessages(prevMessages => [...prevMessages, {
        id: generateId(),
        role: 'system',
        content: 'Sorry, there was an error processing your request. Please try again.',
        createdAt: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    try {
      setIsLoading(true);
      
      // Upload files to server
      const uploadedFileData = await uploadFiles(Array.from(files));
      
      // Add to uploaded files state
      const newFiles = uploadedFileData.map(file => ({
        id: file.id || generateId(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: file.url,
        preview: file.type.startsWith('image/') ? file.url : undefined,
        uploadTime: new Date()
      }));
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle recording audio
  const handleToggleRecording = async () => {
    if (isRecording) {
      // Stop recording logic would go here
      setIsRecording(false);
      
      // In a real implementation, we would save the audio and transcribe it
      try {
        setIsLoading(true);
        
        // Simulate audio transcription (in real app, would use actual audio data)
        // Create a Blob to represent audio data
        const audioBlob = new Blob(['dummy audio data'], { type: 'audio/wav' });
        
        // Get transcription text
        const transcriptionText = await transcribeAudio(audioBlob);
        
        // Add transcription to input
        setInputText(prev => prev + " " + transcriptionText);
      } catch (error) {
        console.error('Error transcribing audio:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Start recording logic would go here
      setIsRecording(true);
    }
  };
  
  // Handle adding emoji to input
  const handleEmojiClick = (emoji: string) => {
    setInputText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };
  
  // Handle file button click for different file types
  const handleFileButtonClick = (type: 'document' | 'image' | 'video') => {
    if (fileInputRef.current) {
      if (type === 'image') {
        fileInputRef.current.accept = 'image/*';
      } else if (type === 'video') {
        fileInputRef.current.accept = 'video/*';
      } else {
        fileInputRef.current.accept = '.pdf,.doc,.docx,.txt';
      }
      fileInputRef.current.click();
    }
  };
  
  // Remove uploaded file
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  // Toggle recording state and handle audio recording
  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording simulation
      setIsRecording(false);
      
      // Simulate transcription result after a delay
      setTimeout(() => {
        setInputText(prev => prev + (prev ? ' ' : '') + 'Transcribed audio content would appear here.');
      }, 1000);
    } else {
      // Start recording simulation
      setIsRecording(true);
    }
  };
  
  // Remove uploaded file
  const removeUploadedFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Top header */}
      <div className="h-12 border-b border-purple-900/50 bg-gradient-to-r from-purple-950 to-indigo-950 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScoutLogo size={28} />
          <h1 className="text-lg font-semibold text-white/90">Scout Multimodal Chat Test</h1>
        </div>
        <span className="text-xs text-purple-300">Connected to AI models API on port 5001</span>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Model selection sidebar */}
        <div className="w-64 border-r border-purple-900/30 bg-gradient-to-b from-purple-950 to-indigo-950 p-3 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-3 px-2 text-white/90">🔮 AI Models</h2>
          <p className="text-xs text-purple-300 mb-3 px-2">Select your AI companion from the list below</p>
          
          {/* Models List */}
          <div className="space-y-4">
            {/* Gemini Models */}
            <div className="text-xs font-medium text-white/60 px-2 pt-1">💎 Gemini Models</div>
            
            <div className="rounded-lg overflow-hidden transition-all hover:shadow-lg border border-purple-700/30 bg-gradient-to-br from-blue-900/70 to-indigo-900/70">
              <button 
                className={`w-full flex items-center gap-3 p-3 text-left ${selectedModel === 'gemini-2.5-pro-preview-05-06' ? 'bg-purple-800/40' : ''}`}
                onClick={() => setSelectedModel('gemini-2.5-pro-preview-05-06')}
              >
                <ScoutLogo size={36} className="from-blue-500 to-blue-700" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm flex items-center gap-1.5">
                    Gemini 2.5 Pro Preview
                    <Badge color="blue">NEW</Badge>
                  </div>
                  <div className="text-xs text-purple-300 truncate">$1.25/$10.00 (≤200K) | 150 RPM</div>
                </div>
              </button>
            </div>
            
            <div className="rounded-lg overflow-hidden transition-all hover:shadow-lg border border-purple-700/30 bg-gradient-to-br from-blue-900/70 to-indigo-900/70">
              <button 
                className={`w-full flex items-center gap-3 p-3 text-left ${selectedModel === 'gemini-2.5-flash-preview-04-17' ? 'bg-purple-800/40' : ''}`}
                onClick={() => setSelectedModel('gemini-2.5-flash-preview-04-17')}
              >
                <ScoutLogo size={36} className="from-blue-400 to-blue-600" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">Gemini 2.5 Flash Preview 04-17</div>
                  <div className="text-xs text-purple-300 truncate">Fast preview model | Jan 2025</div>
                </div>
              </button>
            </div>
            
            <div className="rounded-lg overflow-hidden transition-all hover:shadow-lg border border-purple-700/30 bg-gradient-to-br from-blue-900/70 to-indigo-900/70">
              <button 
                className={`w-full flex items-center gap-3 p-3 text-left ${selectedModel === 'gemini-2.5-flash-preview-05-20' ? 'bg-purple-800/40' : ''}`}
                onClick={() => setSelectedModel('gemini-2.5-flash-preview-05-20')}
              >
                <ScoutLogo size={36} className="from-blue-400 to-blue-600" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm flex items-center gap-1.5">
                    Gemini 2.5 Flash Preview 05-20
                    <Badge color="green">NEW</Badge>
                  </div>
                  <div className="text-xs text-purple-300 truncate">Latest features | Jan 2025</div>
                </div>
              </button>
            </div>
            
            {/* OpenAI Models */}
            <div className="text-xs font-medium text-white/60 px-2 pt-1">🤖 OpenAI Models</div>
            
            <div className="rounded-lg overflow-hidden transition-all hover:shadow-lg border border-purple-700/30 bg-gradient-to-br from-indigo-900/70 to-indigo-950/70">
              <button 
                className={`w-full flex items-center gap-3 p-3 text-left ${selectedModel === 'gemini-2.0-flash' ? 'bg-purple-800/40' : ''}`}
                onClick={() => setSelectedModel('gemini-2.0-flash')}
              >
                {modelData['gpt-4.1-turbo']?.logoUrl ? (
                  <img 
                    src={modelData['gpt-4.1-turbo'].logoUrl} 
                    alt="GPT-4.1 Turbo logo" 
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <MessageSquare size={24} className="text-purple-200" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm flex items-center gap-1.5">
                    {modelData['gpt-4.1-turbo']?.displayName || 'GPT-4.1 Turbo'}
                    <Badge color="green">NEW</Badge>
                  </div>
                  <div className="text-xs text-purple-300 truncate">{modelData['gpt-4.1-turbo']?.pricing} | {modelData['gpt-4.1-turbo']?.rpm}</div>
                </div>
              </button>
            </div>
            
            <div className="rounded-lg overflow-hidden transition-all hover:shadow-lg border border-purple-700/30 bg-gradient-to-br from-indigo-900/70 to-indigo-950/70">
              <button 
                className={`w-full flex items-center gap-3 p-3 text-left ${selectedModel === 'gemini-2.0-flash-lite' ? 'bg-purple-800/40' : ''}`}
                onClick={() => setSelectedModel('gemini-2.0-flash-lite')}
              >
                {modelData['gpt-4o']?.logoUrl ? (
                  <img 
                    src={modelData['gpt-4o'].logoUrl} 
                    alt="GPT-4o logo" 
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <MessageSquare size={24} className="text-purple-200" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{modelData['gpt-4o']?.displayName || 'GPT-4o'}</div>
                  <div className="text-xs text-purple-300 truncate">{modelData['gpt-4o']?.pricing} | {modelData['gpt-4o']?.rpm}</div>
                </div>
              </button>
            </div>
            
            {/* Claude Models */}
            <div className="text-xs font-medium text-white/60 px-2 pt-1">🔮 Claude Models</div>
            
            <div className="rounded-lg overflow-hidden transition-all hover:shadow-lg border border-purple-700/30 bg-gradient-to-br from-purple-900/70 to-indigo-900/70">
              <button 
                className={`w-full flex items-center gap-3 p-3 text-left ${selectedModel === 'gemini-1.5-pro' ? 'bg-purple-800/40' : ''}`}
                onClick={() => setSelectedModel('gemini-1.5-pro')}
              >
                {modelData['gemini-1.5-pro']?.logoUrl ? (
                  <img 
                    src={modelData['gemini-1.5-pro'].logoUrl} 
                    alt="Gemini 1.5 Pro logo" 
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <Sparkles size={24} className="text-purple-200" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{modelData['gemini-1.5-pro']?.displayName || 'Gemini 1.5 Pro'}</div>
                  <div className="text-xs text-purple-300 truncate">{modelData['gemini-1.5-pro']?.pricing} | {modelData['gemini-1.5-pro']?.rpm}</div>
                </div>
              </button>
            </div>
            
            <div className="rounded-lg overflow-hidden transition-all hover:shadow-lg border border-purple-700/30 bg-gradient-to-br from-purple-900/70 to-indigo-900/70">
              <button 
                className={`w-full flex items-center gap-3 p-3 text-left ${selectedModel === 'gemini-1.5-flash' ? 'bg-purple-800/40' : ''}`}
                onClick={() => setSelectedModel('gemini-1.5-flash')}
              >
                {modelData['gemini-1.5-flash']?.logoUrl ? (
                  <img 
                    src={modelData['gemini-1.5-flash'].logoUrl} 
                    alt="Gemini 1.5 Flash logo" 
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <MessageSquare size={24} className="text-purple-200" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{modelData['gemini-1.5-flash']?.displayName || 'Gemini 1.5 Flash'}</div>
                  <div className="text-xs text-purple-300 truncate">{modelData['gemini-1.5-flash']?.pricing} | {modelData['gemini-1.5-flash']?.rpm}</div>
                </div>
              </button>
            </div>
            
            <div className="rounded-lg overflow-hidden transition-all hover:shadow-lg border border-purple-700/30 bg-gradient-to-br from-purple-900/70 to-indigo-900/70">
              <button 
                className={`w-full flex items-center gap-3 p-3 text-left ${selectedModel === 'gemini-1.5-flash-8b' ? 'bg-purple-800/40' : ''}`}
                onClick={() => setSelectedModel('gemini-1.5-flash-8b')}
              >
                {modelData['claude-opus-4']?.logoUrl ? (
                  <img 
                    src={modelData['claude-opus-4'].logoUrl} 
                    alt="Claude Opus logo" 
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <MessageSquare size={24} className="text-purple-200" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm flex items-center gap-1.5">
                    {modelData['claude-opus-4']?.displayName || 'Claude Opus 4'}
                    <Badge color="purple">OPUS</Badge>
                  </div>
              </div>
            </button>
          </div>
          
          <div className="rounded-lg overflow-hidden transition-all hover:shadow-lg border border-purple-700/30 bg-gradient-to-br from-blue-900/70 to-indigo-900/70">
            <button 
              className={`w-full flex items-center gap-3 p-3 text-left ${selectedModel === 'gemini-2.5-flash-preview-04-17' ? 'bg-purple-800/40' : ''}`}
              onClick={() => setSelectedModel('gemini-2.5-flash-preview-04-17')}
            >
              {modelData['gemini-2.5-flash-preview-04-17']?.logoUrl ? (
                <img 
                  src={modelData['gemini-2.5-flash-preview-04-17'].logoUrl} 
                  alt="Gemini 2.5 Flash Preview logo" 
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <ScoutLogo size={36} className="from-blue-400 to-blue-600" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">Gemini 2.5 Flash Preview 04-17</div>
                <div className="text-xs text-purple-300 truncate">Fast preview model | Jan 2025</div>
              </div>
            </button>
          </div>
          
          <div className="rounded-lg overflow-hidden transition-all hover:shadow-lg border border-purple-700/30 bg-gradient-to-br from-blue-900/70 to-indigo-900/70">
            <button 
              className={`w-full flex items-center gap-3 p-3 text-left ${selectedModel === 'gemini-2.5-flash-preview-05-20' ? 'bg-purple-800/40' : ''}`}
              onClick={() => setSelectedModel('gemini-2.5-flash-preview-05-20')}
            >
              {modelData['gemini-2.5-flash-preview-05-20']?.logoUrl ? (
                <img 
                  src={modelData['gemini-2.5-flash-preview-05-20'].logoUrl} 
                  alt="Gemini 2.5 Flash Preview logo" 
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <ScoutLogo size={36} className="from-blue-400 to-blue-600" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm flex items-center gap-1.5">
                  Gemini 2.5 Flash Preview 05-20
                  <Badge color="green">NEW</Badge>
                </div>
                <div className="text-xs text-purple-300 truncate">Latest features | Jan 2025</div>
              </div>
            </button>
          </div>
          
          {/* OpenAI Models */}
          <div className="text-xs font-medium text-white/60 px-2 pt-1">🤖 OpenAI Models</div>
          
          <div className="rounded-lg overflow-hidden transition-all hover:shadow-lg border border-purple-700/30 bg-gradient-to-br from-indigo-900/70 to-indigo-950/70">
            <button 
              className={`w-full flex items-center gap-3 p-3 text-left ${selectedModel === 'gpt-4.1-turbo' ? 'bg-purple-800/40' : ''}`}
              onClick={() => setSelectedModel('gpt-4.1-turbo')}
            >
              {modelData['gpt-4.1-turbo']?.logoUrl ? (
                <img 
                  src={modelData['gpt-4.1-turbo'].logoUrl} 
                  alt="GPT-4.1 Turbo logo" 
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <MessageSquare size={24} className="text-purple-200" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm flex items-center gap-1.5">
                  {modelData['gpt-4.1-turbo']?.displayName || 'GPT-4.1 Turbo'}
                  <Badge color="green">NEW</Badge>
                </div>
                <div className="text-xs text-purple-300 truncate">{modelData['gpt-4.1-turbo']?.pricing} | {modelData['gpt-4.1-turbo']?.rpm}</div>
              </div>
            </button>
          </div>
          
          <div className="rounded-lg overflow-hidden transition-all hover:shadow-lg border border-purple-700/30 bg-gradient-to-br from-indigo-900/70 to-indigo-950/70">
            <button 
              className={`w-full flex items-center gap-3 p-3 text-left ${selectedModel === 'gpt-4o' ? 'bg-purple-800/40' : ''}`}
              onClick={() => setSelectedModel('gpt-4o')}
            >
              {modelData['gpt-4o']?.logoUrl ? (
                <img 
                  src={modelData['gpt-4o'].logoUrl} 
                  alt="GPT-4o logo" 
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <MessageSquare size={24} className="text-purple-200" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{modelData['gpt-4o']?.displayName || 'GPT-4o'}</div>
                <div className="text-xs text-purple-300 truncate">{modelData['gpt-4o']?.pricing} | {modelData['gpt-4o']?.rpm}</div>
              </div>
            </button>
          </div>
          
          {/* Claude Models */}
          <div className="text-xs font-medium text-white/60 px-2 pt-1">🔮 Claude Models</div>
          
          <div className="rounded-lg overflow-hidden transition-all hover:shadow-lg border border-purple-700/30 bg-gradient-to-br from-purple-900/70 to-indigo-900/70">
            <button 
              className={`w-full flex items-center gap-3 p-3 text-left ${selectedModel === 'claude-opus-4' ? 'bg-purple-800/40' : ''}`}
              onClick={() => setSelectedModel('claude-opus-4')}
            >
              {modelData['claude-opus-4']?.logoUrl ? (
                <img 
                  src={modelData['claude-opus-4'].logoUrl} 
                  alt="Claude Opus logo" 
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <MessageSquare size={24} className="text-purple-200" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm flex items-center gap-1.5">
                  {modelData['claude-opus-4']?.displayName || 'Claude Opus 4'}
                  <Badge color="purple">OPUS</Badge>
                </div>
                <div className="text-xs text-purple-300 truncate">{modelData['claude-opus-4']?.pricing} | {modelData['claude-opus-4']?.rpm}</div>
              </div>
            </button>
          </div>
          
          <div className="rounded-lg overflow-hidden transition-all hover:shadow-lg border border-purple-700/30 bg-gradient-to-br from-purple-900/70 to-indigo-900/70">
            <button 
              className={`w-full flex items-center gap-3 p-3 text-left ${selectedModel === 'claude-haiku-3.5' ? 'bg-purple-800/40' : ''}`}
              onClick={() => setSelectedModel('claude-haiku-3.5')}
            >
              {modelData['claude-haiku-3.5']?.logoUrl ? (
                <img 
                  src={modelData['claude-haiku-3.5'].logoUrl} 
                  alt="Claude Haiku logo" 
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <MessageSquare size={24} className="text-purple-200" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm flex items-center gap-1.5">
                  {modelData['claude-haiku-3.5']?.displayName || 'Claude Haiku 3.5'}
                  <Badge color="blue">HAIKU</Badge>
                </div>
                <div className="text-xs text-purple-300 truncate">{modelData['claude-haiku-3.5']?.pricing} | {modelData['claude-haiku-3.5']?.rpm}</div>
              </div>
            </button>
          </div>
          
          {/* Gemma Models */}
          <div className="text-xs font-medium text-white/60 px-2 pt-1">🎯 Gemma Models</div>
          
          <div className="rounded-lg overflow-hidden transition-all hover:shadow-lg border border-purple-700/30 bg-gradient-to-br from-blue-900/70 to-indigo-900/70">
            <button 
              className={`w-full flex items-center gap-3 p-3 text-left ${selectedModel === 'gemma-3-4b' ? 'bg-purple-800/40' : ''}`}
              onClick={() => setSelectedModel('gemma-3-4b')}
            >
              {modelData['gemma-3-4b']?.logoUrl ? (
                <img 
                  src={modelData['gemma-3-4b'].logoUrl} 
                  alt="Gemma 3 4B logo" 
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <ScoutLogo size={36} className="from-teal-500 to-teal-700" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm flex items-center gap-1.5">
                  Gemma 3 4B
                  <Badge color="green">FREE</Badge>
                </div>
                <div className="text-xs text-purple-300 truncate">$0.00/$0.00 | Open source</div>
              </div>
            </button>
          </div>
        </div>
      </div>
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto flex flex-col">
      <div className="max-w-4xl mx-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400 mt-16">
            <ScoutLogo size={80} className="mb-6" />
            <h3 className="text-xl font-medium mb-2">Chat with {selectedModel.split('-')[0]} AI</h3>
            <p className="max-w-md">Ask questions, upload files, code, multi-modal content, and more!</p>
          </div>
        ) : (
          messages.map(message => (
            <div 
              key={message.id} 
              className={`mb-4 p-3 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-purple-800/50 ml-8' 
                  : message.role === 'system' 
                    ? 'bg-gray-800/80 border border-gray-700' 
                    : 'bg-indigo-900/40 mr-8'
              }`}
            >
              <div className="font-medium mb-1">
                {message.role === 'user' ? 'You' : message.role === 'system' ? 'System' : 'Assistant'}
              </div>
              <div className="whitespace-pre-wrap">{message.content}</div>
              {message.tokens && (
                <div className="text-xs text-gray-400 mt-2">
                  Tokens: {message.tokens}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Uploaded files preview */}
      {uploadedFiles.length > 0 && (
        <div className="px-4 py-2 bg-gray-800/70 flex gap-2 overflow-x-auto">
          {uploadedFiles.map((file, index) => (
            <div 
              key={file.id} 
              className="relative flex-shrink-0 p-2 bg-gray-700 rounded-md flex items-center gap-2"
            >
              {file.type.startsWith('image/') && file.preview ? (
                <img src={file.preview} alt={file.name} className="h-10 w-10 object-cover rounded" />
              ) : (
                <FileText size={20} className="text-gray-300" />
              )}
              <span className="text-sm max-w-[100px] truncate">{file.name}</span>
              <button 
                onClick={() => removeFile(index)}
                className="text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => handleFileUpload(e.target.files)} 
        className="hidden" 
      />
      
      {/* Fixed chat input at bottom */}
      <div className="border-t border-purple-900/50 bg-gradient-to-r from-purple-950 to-indigo-950 p-4">
        <div className="max-w-4xl mx-auto flex items-end gap-2">
          {/* Uploaded files display */}
          {uploadedFiles.length > 0 && (
            <div className="flex overflow-x-auto gap-2 p-3 bg-purple-900/30 border-t border-purple-700/30 backdrop-blur-sm transition-all duration-300 ease-in-out">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center bg-purple-800/50 rounded-lg p-2 min-w-fit backdrop-blur-sm shadow-lg border border-purple-700/20 transition-all duration-200 hover:bg-purple-700/50">
                  {file.type.includes('image') ? (
                    <Image size={18} className="text-purple-300 mr-2" />
                  ) : file.type.includes('video') ? (
                    <Video size={18} className="text-purple-300 mr-2" />
                  ) : (
                    <File size={18} className="text-purple-300 mr-2" />
                  )}
                  <span className="text-sm text-white truncate max-w-32">{file.name}</span>
                  <button 
                    onClick={() => removeFile(index)} 
                    className="ml-2 text-purple-300 hover:text-red-400 transition-colors duration-200 p-1 rounded-full hover:bg-purple-800/70"
                    aria-label="Remove file"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex-1 relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${selectedModel.split('-')[0]}...`}
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="w-full bg-gray-800/80 border border-purple-700/50 rounded-lg py-3 px-4 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent resize-none overflow-hidden"
              style={{ minHeight: '44px', maxHeight: '120px' }}
              ref={textareaRef}
              rows={1}
            />

            {/* Emoji picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-full mb-2 right-0 bg-gray-800 border border-purple-700/50 rounded-lg shadow-lg p-3 z-10">
                <div className="grid grid-cols-8 gap-1">
                  {['😊', '👍', '❤️', '🔥', '🎉', '😂', '🤔', '👀', '✨', '😎', '👌', '👏', '🙏', '🚀', '💯', '👋'].map(emoji => (
                    <button
                      key={emoji}
                      className="flex items-center justify-center hover:bg-gray-700 rounded p-1 text-xl"
                      onClick={() => {
                        setInputText(prev => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-12 bottom-2.5 text-gray-400 hover:text-purple-300"
            >
              <Smile size={18} />
            </button>
            
            <div className="absolute right-3 bottom-2 flex gap-0.5">
              <button 
                onClick={handleSendMessage} 
                disabled={isLoading || (!inputText.trim() && uploadedFiles.length === 0)}
                className={`p-1.5 rounded-full ${isLoading || (!inputText.trim() && uploadedFiles.length === 0) ? 'text-gray-500' : 'text-purple-400 hover:text-purple-300 hover:bg-purple-900/30'}`}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
          
          {/* Attachment buttons */}
          <div className="flex items-center gap-1">
            <button 
              onClick={() => handleFileButtonClick('document')} 
              className="p-1.5 text-gray-400 hover:text-purple-300 hover:bg-purple-900/30 rounded"
            >
              <FileText size={18} />
            </button>
            <button 
              onClick={() => handleFileButtonClick('image')} 
              className="p-1.5 text-gray-400 hover:text-purple-300 hover:bg-purple-900/30 rounded"
            >
              <Image size={18} />
            </button>
            <button 
              onClick={() => handleFileButtonClick('video')} 
              className="p-1.5 text-gray-400 hover:text-purple-300 hover:bg-purple-900/30 rounded"
            >
              <Video size={18} />
            </button>
            <button 
              onClick={toggleRecording} 
              className={`p-1.5 hover:bg-purple-900/30 rounded ${isRecording ? 'text-red-500' : 'text-gray-400 hover:text-purple-300'}`}
            >
              {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoutMultiModalChat;
