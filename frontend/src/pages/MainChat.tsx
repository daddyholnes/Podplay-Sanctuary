import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  Paperclip, 
  Mic, 
  Video, 
  Search, 
  Settings,
  Coffee,
  Heart,
  Brain,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useThemeStore, useChatStore } from '@/stores';
import { api } from '@/lib/api';
import { Message, Conversation } from '@/types';
import Logo from '../components/Logo';

const MainChat: React.FC = () => {
  const { theme } = useThemeStore();
  const { 
    conversations, 
    currentConversation, 
    messages, 
    isLoading, 
    isTyping,
    setConversations,
    setCurrentConversation,
    setMessages,
    addMessage,
    setLoading,
    setTyping
  } = useChatStore();

  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);
  const [browserUrl, setBrowserUrl] = useState('https://www.google.com');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load conversations on component mount
  useEffect(() => {
    loadConversations();
    
    // Set up socket listeners
    api.onSocketEvent('message:new', handleNewMessage);
    api.onSocketEvent('message:typing', handleTypingIndicator);
    
    return () => {
      api.offSocketEvent('message:new', handleNewMessage);
      api.offSocketEvent('message:typing', handleTypingIndicator);
    };
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation.id);
    }
  }, [currentConversation]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const response = await api.getConversations(5);
      if (response.success && response.data) {
        setConversations(response.data);
        if (response.data.length > 0 && !currentConversation) {
          setCurrentConversation(response.data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setLoading(true);
      const response = await api.getMessages(conversationId);
      if (response.success && response.data) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (message: Message) => {
    addMessage(message);
  };

  const handleTypingIndicator = (data: { user_id: string; is_typing: boolean }) => {
    setTyping(data.is_typing);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !currentConversation) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      conversation_id: currentConversation.id,
      sender_type: 'user',
      content: inputValue,
      created_at: new Date().toISOString(),
    };

    addMessage(userMessage);
    setInputValue('');
    setLoading(true);

    try {
      const response = await api.sendMessage(currentConversation.id, inputValue);
      if (response.success && response.data) {
        addMessage(response.data);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await api.createConversation('New Conversation', 'general');
      if (response.success && response.data) {
        setConversations([response.data, ...conversations]);
        setCurrentConversation(response.data);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileUpload = async (files: FileList) => {
    // Handle file upload logic
    console.log('Files uploaded:', files);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Implement audio recording logic
  };

  const dailyBriefing = {
    greeting: "Good morning, Nathan! ☕",
    updates: [
      "2 new MCP tools available for your projects",
      "Gemini 2.5 model update with improved reasoning",
      "3 active workspaces running smoothly"
    ],
    mood: "Ready to create something amazing today?"
  };

  return (
    <div className="h-full flex">
      {/* Sidebar with Conversations */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`w-80 border-r flex flex-col ${
          theme === 'light'
            ? 'bg-white/50 border-purple-200'
            : theme === 'dark'
            ? 'bg-slate-800/50 border-slate-700'
            : 'bg-purple-900/30 border-purple-600/30'
        } backdrop-blur-md`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-purple-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${
              theme === 'light' ? 'text-purple-800' : 'text-purple-100'
            }`}>
              Recent Chats
            </h2>
            <Button
              size="sm"
              onClick={createNewConversation}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              New Chat
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  currentConversation?.id === conversation.id
                    ? theme === 'light'
                      ? 'bg-purple-100 border border-purple-200'
                      : 'bg-purple-800/30 border border-purple-600/30'
                    : theme === 'light'
                    ? 'hover:bg-gray-50'
                    : 'hover:bg-slate-700/50'
                }`}
                onClick={() => setCurrentConversation(conversation)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    conversation.project_type === 'research' ? 'bg-blue-100 text-blue-600' :
                    conversation.project_type === 'planning' ? 'bg-green-100 text-green-600' :
                    conversation.project_type === 'technical' ? 'bg-purple-100 text-purple-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {conversation.project_type === 'research' ? <Brain className="w-4 h-4" /> :
                     conversation.project_type === 'planning' ? <Settings className="w-4 h-4" /> :
                     conversation.project_type === 'technical' ? <Coffee className="w-4 h-4" /> :
                     <Heart className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${
                      theme === 'light' ? 'text-gray-900' : 'text-gray-100'
                    }`}>
                      {conversation.title}
                    </p>
                    <p className={`text-sm truncate ${
                      theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {conversation.message_count} messages
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </motion.div>

      {/* Main Chat Area */}
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
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-transparent">
              <Logo name={((currentConversation as any)?.model || 'gemini').toLowerCase()} size={36} alt="Current Model Logo" darkMode={theme === 'dark'} />
            </div>
            <div>
              <h3 className={`font-semibold ${
                theme === 'light' ? 'text-purple-800' : 'text-purple-100'
              }`}>
                Mama Bear
              </h3>
              <p className={`text-sm ${
                theme === 'light' ? 'text-purple-600' : 'text-purple-300'
              }`}>
                Your caring AI partner • {isTyping ? 'Typing...' : 'Online'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBrowser(!showBrowser)}
              className={showBrowser ? 'bg-purple-100 text-purple-700' : ''}
            >
              <Globe className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        <div className="flex-1 flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            {messages.length === 0 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="p-6 m-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-600/30"
              >
                <h4 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-3">
                  {dailyBriefing.greeting}
                </h4>
                <div className="space-y-2 mb-4">
                  {dailyBriefing.updates.map((update, index) => (
                    <p key={index} className="text-sm text-purple-600 dark:text-purple-300">
                      • {update}
                    </p>
                  ))}
                </div>
                <p className="text-purple-700 dark:text-purple-200 font-medium">
                  {dailyBriefing.mood}
                </p>
              </motion.div>
            )}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      message.sender_type === 'user'
                        ? 'bg-purple-600 text-white'
                        : theme === 'light'
                        ? 'bg-white border border-gray-200'
                        : 'bg-slate-700 border border-slate-600'
                    }`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-2 ${
                        message.sender_type === 'user' 
                          ? 'text-purple-200' 
                          : theme === 'light' 
                          ? 'text-gray-500' 
                          : 'text-gray-400'
                      }`}>
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
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
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-purple-200 dark:border-slate-700 flex items-end space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleRecording}
              className={`${isRecording ? 'text-red-600' : 'text-purple-600'} hover:text-purple-700`}
            >
              <Mic className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-purple-600 hover:text-purple-700"
            >
              <Video className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message Mama Bear..."
                className="min-h-[44px] max-h-32 resize-none"
                rows={1}
              />
            </div>
            <Button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Shared Browser */}
          {showBrowser && (
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className={`w-96 border-l flex flex-col ${
                theme === 'light'
                  ? 'bg-white/50 border-purple-200'
                  : theme === 'dark'
                  ? 'bg-slate-800/50 border-slate-700'
                  : 'bg-purple-900/30 border-purple-600/30'
              } backdrop-blur-md`}
            >
              <div className="p-3 border-b border-purple-200 dark:border-slate-700">
                <Input
                  value={browserUrl}
                  onChange={(e) => setBrowserUrl(e.target.value)}
                  placeholder="Enter URL..."
                  className="text-sm"
                />
              </div>
              <div className="flex-1">
                <iframe
                  src={browserUrl}
                  className="w-full h-full border-none"
                  title="Shared Browser"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
      />
    </div>
  );
};

export default MainChat;