import React, { useState, useRef, useEffect } from 'react';
import { useChatSession } from '../../contexts/ChatSessionContext';
import { useSocket } from '../../contexts/SocketContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ChatMessage, ChatSession } from '../../services/chatApi';

// Component Imports (these would be your actual UI components)
import ChatSidebar from './components/ChatSidebar';
import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import MultiModalInput from './components/MultiModalInput';
import WebBrowserPanel from './components/WebBrowserPanel';
import LoadingScreen from './components/LoadingScreen';

// CSS Import
import './MamaBearMainChat.css';

/**
 * MamaBearMainChat - The primary interface for interacting with Mama Bear
 * This is a sanctuary for research, planning, and deep thinking
 */
const MamaBearMainChat: React.FC = () => {
  // Context hooks
  const { 
    sessions, 
    activeSession, 
    loading, 
    error,
    typingStatus,
    loadSessions,
    createSession,
    selectSession,
    sendMessage,
    sendTypingIndicator,
    updateStage
  } = useChatSession();
  
  const { isConnected: socketConnected } = useSocket();
  const { isDarkMode } = useTheme();
  
  // Component state
  const [browserVisible, setBrowserVisible] = useState<boolean>(false);
  const [browserUrl, setBrowserUrl] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Handle message submission
  const handleSendMessage = async () => {
    if (!inputValue.trim() && attachments.length === 0) return;
    
    try {
      await sendMessage(inputValue, attachments);
      setInputValue('');
      setAttachments([]);
    } catch (err) {
      console.error('Failed to send message:', err);
      // Show error notification
    }
  };
  
  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    
    const newAttachments = Array.from(files);
    setAttachments(prev => [...prev, ...newAttachments]);
  };
  
  // Handle file drop
  const handleFileDrop = (files: FileList) => {
    const newAttachments = Array.from(files);
    setAttachments(prev => [...prev, ...newAttachments]);
  };
  
  // Handle paste event (for images)
  const handlePaste = (event: React.ClipboardEvent) => {
    const items = event.clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          setAttachments(prev => [...prev, file]);
        }
      }
    }
  };
  
  // Handle input change with typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Send typing indicator if input is not empty
    if (value.trim()) {
      sendTypingIndicator(true);
    }
  };
  
  // Handle browser open
  const handleOpenBrowser = (url: string) => {
    setBrowserUrl(url);
    setBrowserVisible(true);
  };
  
  // Effect to scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages]);
  
  // Effect to create default session if none exists
  useEffect(() => {
    const initializeChat = async () => {
      // If sessions loaded and none exist, create a default session
      if (!loading && sessions.length === 0) {
        try {
          await createSession('New Research', 'Started with Mama Bear');
        } catch (err) {
          console.error('Failed to create initial session:', err);
        }
      }
      // If sessions exist but none is active, select the most recent one
      else if (!loading && sessions.length > 0 && !activeSession) {
        // Sort sessions by updated timestamp (most recent first)
        const sortedSessions = [...sessions].sort(
          (a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime()
        );
        
        await selectSession(sortedSessions[0].id);
      }
    };
    
    initializeChat();
  }, [loading, sessions, activeSession, createSession, selectSession]);

  // Show loading screen if loading initial data
  if (loading && (!sessions.length || !activeSession)) {
    return <LoadingScreen />;
  }
  
  // Determine if Mama Bear is typing
  const isMamaBearTyping = activeSession 
    ? typingStatus[activeSession.id] === true 
    : false;

  return (
    <div className={`mama-bear-chat ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Sidebar with recent chats and actions */}
      <ChatSidebar 
        sessions={sessions}
        activeSessionId={activeSession?.id}
        onSelectSession={selectSession}
        onCreateSession={createSession}
      />
      
      {/* Main chat area */}
      <div className="mama-bear-chat-main">
        {/* Chat header with session info and actions */}
        <ChatHeader 
          session={activeSession}
          socketConnected={socketConnected}
          onOpenBrowser={() => setBrowserVisible(true)}
        />
        
        {/* Messages container */}
        <div className="messages-container">
          {activeSession && (
            <MessageList 
              messages={activeSession.messages}
              isTyping={isMamaBearTyping}
            />
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Multi-modal input area */}
        <MultiModalInput 
          value={inputValue}
          onChange={handleInputChange}
          onSubmit={handleSendMessage}
          onPaste={handlePaste}
          attachments={attachments}
          onRemoveAttachment={(index) => {
            setAttachments(prev => prev.filter((_, i) => i !== index));
          }}
          onFileSelect={handleFileSelect}
          onFileDrop={handleFileDrop}
          isRecording={isRecording}
          onStartRecording={() => setIsRecording(true)}
          onStopRecording={() => setIsRecording(false)}
          fileInputRef={fileInputRef}
        />
      </div>
      
      {/* Web browser panel */}
      {browserVisible && (
        <WebBrowserPanel 
          url={browserUrl}
          onClose={() => setBrowserVisible(false)}
          onUrlChange={setBrowserUrl}
        />
      )}
    </div>
  );
};

export default MamaBearMainChat;