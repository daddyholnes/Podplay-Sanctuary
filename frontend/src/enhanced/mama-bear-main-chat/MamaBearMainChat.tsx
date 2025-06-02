import { useState, useEffect, useRef, useContext } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';
import chatService from '@/services/chatService';
import { ChatSession, ChatMessage, MessageRole } from '@/types/chat';

// Icons
import {
  MessageCircle,
  PlusCircle,
  Send,
  X,
  Paperclip,
  Mic,
  Video,
  Image,
  Smile,
  MoreVertical,
  Download,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle,
  LoaderCircle
} from 'lucide-react';

// Components that will be created later
import SessionList from './components/SessionList';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';

const MamaBearMainChat = () => {
  // Theme
  const { theme } = useContext(ThemeContext);
  
  // State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Lifecycle hooks
  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (currentSession) {
      loadMessages(currentSession.id);
      document.title = `${currentSession.name} | Mama Bear Chat`;
    } else {
      document.title = 'Mama Bear Chat';
    }
  }, [currentSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Helper functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    // Simple toast notification - will be replaced with a proper component
    console.log(`[${type.toUpperCase()}] ${message}`);
    setError(type === 'error' ? message : null);
    
    if (type === 'error') {
      setTimeout(() => setError(null), 5000);
    }
  };

  // API interactions
  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const fetchedSessions = await chatService.getSessions();
      setSessions(fetchedSessions);
      
      if (fetchedSessions.length > 0 && !currentSession) {
        setCurrentSession(fetchedSessions[0]);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
      showToast('Failed to load chat sessions', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      setIsLoading(true);
      const fetchedMessages = await chatService.getMessages(sessionId);
      setMessages(fetchedMessages);
    } catch (error) {
      console.error(`Failed to load messages for session ${sessionId}:`, error);
      showToast('Failed to load chat messages', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      setIsLoading(true);
      // Default to a "Gemini" model, customize as needed
      const newSession = await chatService.createSession('gemini', 'You are Mama-Gem, the Lead Developer Agent in Nathan\'s Podplay Sanctuary.');
      setSessions([newSession, ...sessions]);
      setCurrentSession(newSession);
      setMessages([]);
      showToast('New chat session created');
    } catch (error) {
      console.error('Failed to create new session:', error);
      showToast('Failed to create new chat session', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const selectSession = (session: ChatSession) => {
    if (currentSession?.id !== session.id) {
      setCurrentSession(session);
    }
  };

  const sendMessage = async () => {
    if (!currentSession || (!inputValue.trim() && attachments.length === 0)) return;
    
    try {
      setIsProcessing(true);
      
      // Add user message to UI immediately
      const tempUserMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        sessionId: currentSession.id,
        role: 'user',
        content: inputValue,
        timestamp: new Date().toISOString(),
        attachments: attachments.length > 0 ? attachments.map(file => ({
          id: `temp-${file.name}`,
          filename: file.name,
          contentType: file.type,
          size: file.size,
          url: URL.createObjectURL(file)
        })) : undefined
      };
      
      setMessages([...messages, tempUserMessage]);
      
      // Clear input
      setInputValue('');
      setAttachments([]);
      
      // Send to API
      const userMessage = await chatService.sendMessage(
        currentSession.id,
        inputValue,
        'user',
        attachments
      );
      
      // Replace temp message with real one
      setMessages(messages => 
        messages.map(msg => 
          msg.id === tempUserMessage.id ? userMessage : msg
        )
      );
      
      // Add typing indicator
      const tempAssistantMessage: ChatMessage = {
        id: `temp-typing-${Date.now()}`,
        sessionId: currentSession.id,
        role: 'assistant',
        content: '...',
        timestamp: new Date().toISOString()
      };
      
      setMessages(msgs => [...msgs, tempAssistantMessage]);
      
      // Get AI response
      const assistantMessage = await chatService.sendMessage(
        currentSession.id,
        '',
        'assistant'
      );
      
      // Replace typing indicator with real response
      setMessages(messages => 
        messages.map(msg => 
          msg.id === tempAssistantMessage.id ? assistantMessage : msg
        )
      );
      
    } catch (error) {
      console.error('Failed to send message:', error);
      showToast('Failed to send message', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Session actions
  const handleRenameSession = async (sessionId: string, newName: string) => {
    try {
      await chatService.updateSession(sessionId, newName);
      setSessions(sessions.map(session => 
        session.id === sessionId 
          ? { ...session, name: newName } 
          : session
      ));
      
      if (currentSession?.id === sessionId) {
        setCurrentSession({ ...currentSession, name: newName });
      }
      
      showToast('Chat session renamed');
    } catch (error) {
      console.error('Failed to rename session:', error);
      showToast('Failed to rename chat session', 'error');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await chatService.deleteSession(sessionId);
      
      const updatedSessions = sessions.filter(session => session.id !== sessionId);
      setSessions(updatedSessions);
      
      if (currentSession?.id === sessionId) {
        setCurrentSession(updatedSessions.length > 0 ? updatedSessions[0] : null);
      }
      
      showToast('Chat session deleted');
    } catch (error) {
      console.error('Failed to delete session:', error);
      showToast('Failed to delete chat session', 'error');
    }
  };

  const handleExportSession = async (sessionId: string, format: 'json' | 'markdown' | 'html' = 'markdown') => {
    try {
      const blob = await chatService.exportSession(sessionId, format);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-export-${sessionId}.${format === 'json' ? 'json' : format === 'html' ? 'html' : 'md'}`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast(`Chat session exported as ${format}`);
    } catch (error) {
      console.error('Failed to export session:', error);
      showToast('Failed to export chat session', 'error');
    }
  };

  // UI handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments([...attachments, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Render component
  return (
    <div className="flex h-full bg-sanctuary-light dark:bg-sanctuary-dark">
      {/* Sessions Sidebar */}
      <div className="w-64 h-full border-r border-purple-100 dark:border-purple-900 flex flex-col">
        <div className="p-4 border-b border-purple-100 dark:border-purple-900">
          <h2 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-2">
            Mama Bear Chat
          </h2>
          <button
            onClick={createNewSession}
            className="w-full btn-primary flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            <PlusCircle size={16} />
            <span>New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {isLoading && sessions.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <LoaderCircle size={24} className="animate-spin text-purple-500" />
            </div>
          ) : (
            <div className="space-y-1">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-2 rounded-md cursor-pointer flex items-center ${
                    currentSession?.id === session.id
                      ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                      : 'hover:bg-purple-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => selectSession(session)}
                >
                  <MessageCircle size={16} className="mr-2 flex-shrink-0" />
                  <div className="flex-1 truncate">{session.name}</div>
                  {currentSession?.id === session.id && (
                    <div className="flex items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Open a modal or prompt for rename
                          const newName = prompt('Enter new name:', session.name);
                          if (newName) {
                            handleRenameSession(session.id, newName);
                          }
                        }}
                        className="p-1 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this chat?')) {
                            handleDeleteSession(session.id);
                          }
                        }}
                        className="p-1 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {sessions.length === 0 && !isLoading && (
                <div className="text-center p-4 text-gray-500 dark:text-gray-400">
                  No chat sessions yet.
                  <br />
                  Start a new chat!
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {currentSession ? (
          <>
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-purple-100 dark:border-purple-900 flex items-center justify-between">
              <h3 className="font-medium text-purple-700 dark:text-purple-300">
                {currentSession.name}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleExportSession(currentSession.id)}
                  className="p-2 rounded-full hover:bg-purple-50 dark:hover:bg-gray-800"
                  title="Export chat"
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={(e) => {
                    const newName = prompt('Rename chat:', currentSession.name);
                    if (newName) {
                      handleRenameSession(currentSession.id, newName);
                    }
                  }}
                  className="p-2 rounded-full hover:bg-purple-50 dark:hover:bg-gray-800"
                  title="Rename chat"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this chat?')) {
                      handleDeleteSession(currentSession.id);
                    }
                  }}
                  className="p-2 rounded-full hover:bg-purple-50 dark:hover:bg-gray-800"
                  title="Delete chat"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoading && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <LoaderCircle size={32} className="animate-spin text-purple-500" />
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={
                        message.role === 'user'
                          ? 'message-user'
                          : message.role === 'system'
                          ? 'message-system'
                          : 'message-assistant'
                      }
                    >
                      {message.role === 'assistant' && message.content === '...' ? (
                        <div className="typing-indicator">
                          <span className="typing-indicator-dot"></span>
                          <span className="typing-indicator-dot"></span>
                          <span className="typing-indicator-dot"></span>
                        </div>
                      ) : (
                        <>
                          {/* Display message content */}
                          <div className="whitespace-pre-wrap">{message.content}</div>
                          
                          {/* Display attachments if any */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {message.attachments.map((attachment) => (
                                <div key={attachment.id} className="file-preview">
                                  {attachment.contentType.startsWith('image/') ? (
                                    <img
                                      src={attachment.url}
                                      alt={attachment.filename}
                                      className="image-preview max-h-40"
                                    />
                                  ) : (
                                    <div className="flex items-center text-sm">
                                      <Paperclip size={14} className="mr-2" />
                                      <span>{attachment.filename}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
              
              {/* Error message */}
              {error && (
                <div className="flex justify-center">
                  <div className="bg-red-100 text-red-800 px-4 py-2 rounded-md flex items-center">
                    <AlertCircle size={16} className="mr-2" />
                    {error}
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-purple-100 dark:border-purple-900">
              {/* Attachment previews */}
              {attachments.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="bg-purple-50 dark:bg-gray-800 rounded-md p-1 flex items-center"
                    >
                      <span className="text-xs text-gray-700 dark:text-gray-300 px-2 truncate max-w-xs">
                        {file.name}
                      </span>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="p-1 hover:bg-purple-100 dark:hover:bg-gray-700 rounded-full"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Message Mama Bear..."
                    className="input-field min-h-[60px] max-h-[200px] py-3 pr-10 resize-none"
                    disabled={isProcessing}
                  />
                  <div className="absolute right-2 bottom-2 flex items-center">
                    <button
                      onClick={openFileDialog}
                      className="p-2 rounded-full hover:bg-purple-50 dark:hover:bg-gray-800 text-purple-700 dark:text-purple-300"
                      title="Attach files"
                      disabled={isProcessing}
                    >
                      <Paperclip size={18} />
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={sendMessage}
                  disabled={(!inputValue.trim() && attachments.length === 0) || isProcessing}
                  className={`btn-primary rounded-full p-3 ${
                    (!inputValue.trim() && attachments.length === 0) || isProcessing
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {isProcessing ? (
                    <LoaderCircle size={20} className="animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                className="hidden"
              />

              {/* Multi-modal options */}
              <div className="flex justify-start mt-2 space-x-2">
                <button
                  className="p-2 rounded-full hover:bg-purple-50 dark:hover:bg-gray-800 text-purple-700 dark:text-purple-300"
                  title="Record audio"
                  disabled={isProcessing}
                >
                  <Mic size={16} />
                </button>
                <button
                  className="p-2 rounded-full hover:bg-purple-50 dark:hover:bg-gray-800 text-purple-700 dark:text-purple-300"
                  title="Record video"
                  disabled={isProcessing}
                >
                  <Video size={16} />
                </button>
                <button
                  className="p-2 rounded-full hover:bg-purple-50 dark:hover:bg-gray-800 text-purple-700 dark:text-purple-300"
                  title="Paste image"
                  disabled={isProcessing}
                >
                  <Image size={16} />
                </button>
                <button
                  className="p-2 rounded-full hover:bg-purple-50 dark:hover:bg-gray-800 text-purple-700 dark:text-purple-300"
                  title="Emoji picker"
                  disabled={isProcessing}
                >
                  <Smile size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          // Welcome screen when no chat is selected
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="w-16 h-16 rounded-full bg-purple-gradient flex items-center justify-center mb-4">
              <MessageCircle size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-purple-700 dark:text-purple-300 mb-2">
              Welcome to Mama Bear Chat
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
              Your personal AI-powered sanctuary for focused development and creative exploration.
            </p>
            <button onClick={createNewSession} className="btn-primary flex items-center gap-2">
              <PlusCircle size={18} />
              <span>Start a New Chat</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MamaBearMainChat;
