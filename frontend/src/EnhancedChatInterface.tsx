import React, { useState, useEffect, useRef, useCallback } from 'react';
import { buildApiUrl, API_ENDPOINTS } from './config/api';
import './EnhancedChat.css';

// ==================== CHAT INTERFACES ====================

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'mama-bear';
  timestamp: Date;
  type: 'text' | 'code' | 'mcp-action' | 'system';
  attachments?: MediaAttachment[];
  metadata?: {
    mcpServer?: string;
    codeLanguage?: string;
    executionResult?: any;
    memories?: any[];
  };
}

interface MediaAttachment {
  id: string;
  type: 'image' | 'audio' | 'video' | 'file';
  name: string;
  size: number;
  url?: string;
  data?: File | Blob | string | ArrayBuffer;
  mimeType: string;
}

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  currentInput: string;
  attachments: MediaAttachment[];
  isRecording: boolean;
  recordingDuration: number;
  memories: any[];
  connectedModels: string[];
  activeMCPServers: string[];
  isDragOver: boolean;
}

// ==================== ENHANCED CHAT COMPONENT ====================

export const EnhancedChatInterface: React.FC = () => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isTyping: false,
    currentInput: '',
    attachments: [],
    isRecording: false,
    recordingDuration: 0,
    memories: [],
    connectedModels: ['Mama Bear Core', 'Mem0.ai Memory', 'Together.ai Sandbox'],
    activeMCPServers: [],
    isDragOver: false
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  useEffect(() => {
    // Load initial chat state and send welcome message
    const initChat = async () => {
      await sendWelcomeMessage();
      await loadActiveMCPServers();
    };
    initChat();

    // Setup drag and drop
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setChatState(prev => ({ ...prev, isDragOver: true }));
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      setChatState(prev => ({ ...prev, isDragOver: false }));
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setChatState(prev => ({ ...prev, isDragOver: false }));
      
      if (e.dataTransfer?.files) {
        handleFileSelection(Array.from(e.dataTransfer.files));
      }
    };

    // Setup paste handler for images
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (const item of Array.from(items)) {
          if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            if (file) {
              handleFileSelection([file]);
            }
          }
        }
      }
    };

    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDrop);
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('drop', handleDrop);
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  // ==================== MULTIMODAL FUNCTIONS ====================

  const handleFileSelection = useCallback((files: File[]) => {
    const newAttachments: MediaAttachment[] = [];
    
    Array.from(files).forEach((file) => {
      const attachment: MediaAttachment = {
        id: Date.now().toString() + Math.random(),
        type: file.type.startsWith('image/') ? 'image' :
              file.type.startsWith('video/') ? 'video' :
              file.type.startsWith('audio/') ? 'audio' : 'file',
        name: file.name,
        size: file.size,
        mimeType: file.type,
        data: file
      };
      
      // Create preview URL for images
      if (file.type.startsWith('image/')) {
        attachment.url = URL.createObjectURL(file);
      }
      
      newAttachments.push(attachment);
    });
    
    setChatState(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }));
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setChatState(prev => {
      const attachment = prev.attachments.find(a => a.id === id);
      if (attachment?.url) {
        URL.revokeObjectURL(attachment.url);
      }
      return {
        ...prev,
        attachments: prev.attachments.filter(a => a.id !== id)
      };
    });
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const attachment: MediaAttachment = {
          id: Date.now().toString(),
          type: 'audio',
          name: `Recording_${new Date().toISOString().slice(0, 16)}.webm`,
          size: blob.size,
          mimeType: 'audio/webm',
          data: blob,
          url: URL.createObjectURL(blob)
        };
        
        setChatState(prev => ({
          ...prev,
          attachments: [...prev.attachments, attachment],
          isRecording: false,
          recordingDuration: 0
        }));
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setChatState(prev => ({ ...prev, isRecording: true, recordingDuration: 0 }));
      
      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setChatState(prev => ({ ...prev, recordingDuration: prev.recordingDuration + 1 }));
      }, 1000);
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to start recording. Please check microphone permissions.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && chatState.isRecording) {
      mediaRecorderRef.current.stop();
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  }, [chatState.isRecording]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatRecordingTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendWelcomeMessage = async () => {
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      content: `🐻 **Welcome to your Sanctuary, Nathan!**

I'm Mama Bear, your lead developer agent, and I'm absolutely thrilled to chat with you! 

✨ **What I can help you with:**
• 🏪 **MCP Server Discovery** - Find and install powerful context protocol servers
• 🧠 **Memory-Enhanced Conversations** - I remember our past discussions via Mem0.ai
• 🔧 **Code Execution** - Run code directly in our Together.ai sandbox
• 📊 **Daily Briefings** - Stay updated on new tools and opportunities
• 🎯 **Project Management** - Help prioritize and manage your development tasks

💫 **Enhanced Features:**
• Persistent memory across sessions
• Real-time MCP marketplace integration  
• Multi-model collaboration capabilities
• Intelligent context awareness

What would you like to explore first? I'm here to make your development journey extraordinary! 🚀`,
      sender: 'mama-bear',
      timestamp: new Date(),
      type: 'text'
    };

    setChatState(prev => ({
      ...prev,
      messages: [welcomeMessage]
    }));
  };

  const loadActiveMCPServers = async () => {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.MCP.MANAGE));
      const data = await response.json();
      if (data.success) {
        setChatState(prev => ({
          ...prev,
          activeMCPServers: data.installed_servers.map((server: any) => server.name)
        }));
      }
    } catch (error) {
      console.error('Failed to load MCP servers:', error);
    }
  };

  const sendMessage = async () => {
    if (!chatState.currentInput.trim() && chatState.attachments.length === 0) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: chatState.currentInput,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
      attachments: chatState.attachments.length > 0 ? [...chatState.attachments] : undefined
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      currentInput: '',
      attachments: [], // Clear attachments after sending
      isTyping: true
    }));

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.MAMA_BEAR.CHAT), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: chatState.currentInput,
          user_id: 'nathan',
          attachments: chatState.attachments.map(att => ({
            type: att.type,
            name: att.name,
            size: att.size,
            mimeType: att.mimeType
          }))
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const mamaBearResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          sender: 'mama-bear',
          timestamp: new Date(),
          type: 'text',
          metadata: {
            memories: data.memories || []
          }
        };

        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, mamaBearResponse],
          isTyping: false
        }));
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatState(prev => ({ ...prev, isTyping: false }));
    }

    // Clean up attachment URLs
    chatState.attachments.forEach(att => {
      if (att.url) {
        URL.revokeObjectURL(att.url);
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessageContent = (content: string) => {
    // Enhanced markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/🐻/g, '<span class="bear-emoji">🐻</span>')
      .replace(/•/g, '<span class="bullet">•</span>');
  };

  const getMessageIcon = (sender: string, type: string) => {
    if (sender === 'mama-bear') return '🐻';
    if (type === 'code') return '⚡';
    if (type === 'mcp-action') return '🔧';
    return '👤';
  };

  return (
    <div className="enhanced-chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="agent-status">
          <div className="agent-avatar">🐻</div>
          <div className="agent-info">
            <h3>Mama Bear</h3>
            <p className="agent-subtitle">Lead Developer Agent</p>
          </div>
        </div>
        
        <div className="system-status">
          <div className="status-indicators">
            <div className="status-item">
              <span className="status-dot active"></span>
              <span>Memory Active</span>
            </div>
            <div className="status-item">
              <span className="status-dot active"></span>
              <span>Sandbox Ready</span>
            </div>
            <div className="status-item">
              <span className="status-dot active"></span>
              <span>{chatState.activeMCPServers.length} MCP Servers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="chat-messages">
        {chatState.messages.map((message) => (
          <div key={message.id} className={`message ${message.sender}`}>
            <div className="message-header">
              <span className="message-icon">
                {getMessageIcon(message.sender, message.type)}
              </span>
              <span className="message-sender">
                {message.sender === 'mama-bear' ? 'Mama Bear' : 'Nathan'}
              </span>
              <span className="message-timestamp">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <div 
              className="message-content"
              dangerouslySetInnerHTML={{ 
                __html: formatMessageContent(message.content) 
              }}
            />
            {message.attachments && message.attachments.length > 0 && (
              <div className="message-attachments">
                {message.attachments.map((attachment) => (
                  <div key={attachment.id} className="message-attachment">
                    {attachment.type === 'image' && attachment.url && (
                      <img 
                        src={attachment.url} 
                        alt={attachment.name}
                        className="attachment-image"
                      />
                    )}
                    {attachment.type === 'audio' && attachment.url && (
                      <audio controls className="attachment-audio">
                        <source src={attachment.url} type={attachment.mimeType} />
                      </audio>
                    )}
                    {attachment.type === 'video' && attachment.url && (
                      <video controls className="attachment-video">
                        <source src={attachment.url} type={attachment.mimeType} />
                      </video>
                    )}
                    {attachment.type === 'file' && (
                      <div className="attachment-file">
                        <span className="file-icon">📄</span>
                        <span className="file-name">{attachment.name}</span>
                        <span className="file-size">{formatFileSize(attachment.size)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {message.metadata?.memories && message.metadata.memories.length > 0 && (
              <div className="memory-context">
                <span className="memory-indicator">🧠 Using {message.metadata.memories.length} memories</span>
              </div>
            )}
          </div>
        ))}
        
        {chatState.isTyping && (
          <div className="message mama-bear typing">
            <div className="message-header">
              <span className="message-icon">🐻</span>
              <span className="message-sender">Mama Bear</span>
            </div>
            <div className="typing-indicator">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="typing-text">Thinking with enhanced context...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Drag & Drop Overlay */}
      {chatState.isDragOver && (
        <div className="drag-drop-overlay">
          <div className="drag-drop-content">
            <div className="drag-drop-icon">📁</div>
            <h3>Drop your files here</h3>
            <p>Images, videos, audio files, or documents</p>
          </div>
        </div>
      )}

      {/* Chat Input */}
      <div className="chat-input-container">
        {/* Attachment Previews */}
        {chatState.attachments.length > 0 && (
          <div className="attachment-previews">
            {chatState.attachments.map((attachment) => (
              <div key={attachment.id} className="attachment-preview">
                {attachment.type === 'image' && attachment.url && (
                  <div className="image-preview">
                    <img src={attachment.url} alt={attachment.name} />
                    <div className="preview-overlay">
                      <button 
                        className="remove-attachment"
                        onClick={() => removeAttachment(attachment.id)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
                {attachment.type !== 'image' && (
                  <div className="file-preview">
                    <div className="file-icon">
                      {attachment.type === 'video' ? '🎥' : 
                       attachment.type === 'audio' ? '🎵' : '📄'}
                    </div>
                    <div className="file-info">
                      <span className="file-name">{attachment.name}</span>
                      <span className="file-size">{formatFileSize(attachment.size)}</span>
                    </div>
                    <button 
                      className="remove-attachment"
                      onClick={() => removeAttachment(attachment.id)}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="input-enhancement-bar">
          <div className="quick-actions">
            <button className="quick-action" title="Search MCP Servers">
              🏪 MCP
            </button>
            <button className="quick-action" title="Execute Code">
              ⚡ Code
            </button>
            <button className="quick-action" title="View Memories">
              🧠 Memory
            </button>
            <button className="quick-action" title="Daily Briefing">
              📊 Brief
            </button>
          </div>
          
          <div className="model-status">
            <span className="model-indicator">
              💎 Enhanced Agent Active
            </span>
          </div>
        </div>

        {/* Multimodal Input Container */}
        <div className="multimodal-input-container">
          {/* Media Input Buttons */}
          <div className="media-input-buttons">
            <button 
              className="media-button"
              onClick={() => imageInputRef.current?.click()}
              title="Add Image"
            >
              🖼️
            </button>
            
            <button 
              className="media-button"
              onClick={() => videoInputRef.current?.click()}
              title="Add Video"
            >
              🎥
            </button>
            
            <button 
              className={`media-button ${chatState.isRecording ? 'recording' : ''}`}
              onClick={chatState.isRecording ? stopRecording : startRecording}
              title={chatState.isRecording ? 'Stop Recording' : 'Record Audio'}
            >
              {chatState.isRecording ? '⏹️' : '🎤'}
              {chatState.isRecording && (
                <div className="recording-indicator">
                  <span className="recording-time">{formatRecordingTime(chatState.recordingDuration)}</span>
                  <div className="audio-visualizer">
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                  </div>
                </div>
              )}
            </button>
            
            <button 
              className="media-button"
              onClick={() => fileInputRef.current?.click()}
              title="Add File"
            >
              📎
            </button>
          </div>
          
          {/* Text Input Area */}
          <div className="text-input-area">
            <textarea
              ref={inputRef}
              value={chatState.currentInput}
              onChange={(e) => setChatState(prev => ({ ...prev, currentInput: e.target.value }))}
              onKeyPress={handleKeyPress}
              placeholder="Ask Mama Bear anything... I have access to MCP servers, persistent memory, and code execution! 🚀"
              className="chat-input"
              rows={3}
            />
            
            <button 
              onClick={sendMessage}
              disabled={!chatState.currentInput.trim() || chatState.isTyping}
              className="send-button gradient"
            >
              {chatState.isTyping ? '⏳' : '🚀'}
            </button>
          </div>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="*/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => e.target.files && handleFileSelection(Array.from(e.target.files))}
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => e.target.files && handleFileSelection(Array.from(e.target.files))}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => e.target.files && handleFileSelection(Array.from(e.target.files))}
        />
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => e.target.files && handleFileSelection(Array.from(e.target.files))}
        />
        
        <div className="input-hints">
          <span className="hint">💡 Try: "Install GitHub MCP server" or "Execute some Python code" or "What do you remember about me?"</span>
          <span className="hint multimodal">📎 Drag files, paste images, or click media buttons to add attachments</span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedChatInterface;
