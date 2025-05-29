// Enhanced Unified Chat Bar Component
// Combines all multimodal features in a clean, Scout.new-inspired interface
// Designed to work across all pages with the Sanctuary theme

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MediaAttachment } from '../ModelRegistry';
import './EnhancedChatBar.css';

export interface ChatAttachment extends MediaAttachment {
  preview?: string;
  duration?: number; // for audio/video
}

export interface ChatBarProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string, attachments: ChatAttachment[]) => void;
  onAttachmentsChange?: (attachments: ChatAttachment[]) => void;
  attachments?: ChatAttachment[];
  placeholder?: string;
  disabled?: boolean;
  showQuickActions?: boolean;
  theme?: 'sanctuary' | 'scout' | 'minimal';
  allowFileUpload?: boolean;
  allowImageUpload?: boolean;
  allowAudioRecording?: boolean;
  allowVideoRecording?: boolean;
  allowScreenCapture?: boolean;
  className?: string;
}

const EnhancedChatBar: React.FC<ChatBarProps> = ({
  value,
  onChange,
  onSend,
  onAttachmentsChange,
  attachments = [],
  placeholder = "💬 Tell Scout what you want to build...",
  disabled = false,
  showQuickActions = true,
  theme = 'sanctuary',
  allowFileUpload = true,
  allowImageUpload = true,
  allowAudioRecording = true,
  allowVideoRecording = true,
  allowScreenCapture = true,
  className = ""
}) => {
  // ==================== STATE ====================
  const [isRecording, setIsRecording] = useState(false);
  const [recordingType, setRecordingType] = useState<'audio' | 'video' | 'screen' | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // ==================== REFS ====================
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chatBarRef = useRef<HTMLDivElement>(null);

  // ==================== EMOJI CATEGORIES ====================
  const emojiCategories = {
    'Recent': ['😊', '👍', '❤️', '😂', '🔥', '✨', '🚀', '🎉'],
    'Smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘'],
    'Nature': ['🌟', '⭐', '✨', '🌙', '☀️', '🌈', '🌸', '🌺', '🌻', '🌷', '🌹', '🌿', '🍀', '🌳', '🌲', '🌴'],
    'Tech': ['💻', '📱', '⌨️', '🖥️', '🖨️', '📸', '📹', '🎮', '🕹️', '💾', '💿', '📀', '🔌', '🔋', '🧩', '⚙️'],
    'Activity': ['🚀', '🎯', '🎪', '🎨', '🎭', '🎪', '🎨', '🎬', '🎮', '🎯', '🎲', '🧩', '🎪', '🎨', '🎭', '🎪']
  };

  // ==================== DRAG & DROP HANDLERS ====================
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  // ==================== CLIPBOARD HANDLERS ====================
  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          await handleImageFile(file);
        }
      } else if (item.kind === 'string' && item.type === 'text/plain') {
        // Allow normal text paste
        continue;
      }
    }
  }, []);

  // ==================== FILE HANDLING ====================
  const handleFiles = useCallback(async (files: File[]) => {
    const newAttachments: ChatAttachment[] = [];

    for (const file of files) {
      const attachment = await createAttachmentFromFile(file);
      if (attachment) {
        newAttachments.push(attachment);
      }
    }

    const updatedAttachments = [...attachments, ...newAttachments];
    onAttachmentsChange?.(updatedAttachments);
  }, [attachments, onAttachmentsChange]);

  const createAttachmentFromFile = useCallback(async (file: File): Promise<ChatAttachment | null> => {
    const url = URL.createObjectURL(file);
    let preview = url;

    // Generate preview for different file types
    if (file.type.startsWith('image/')) {
      preview = url;
    } else if (file.type.startsWith('video/')) {
      preview = await generateVideoThumbnail(file);
    }

    const attachment: ChatAttachment = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      file,
      blob: file,
      type: getAttachmentType(file.type),
      mimeType: file.type,
      url,
      preview,
      name: file.name,
      size: file.size
    };

    return attachment;
  }, []);

  const getAttachmentType = (mimeType: string): 'image' | 'audio' | 'video' | 'file' => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('video/')) return 'video';
    return 'file';
  };

  const generateVideoThumbnail = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        video.currentTime = 1; // Seek to 1 second
      };

      video.onseeked = () => {
        ctx?.drawImage(video, 0, 0);
        resolve(canvas.toDataURL());
      };

      video.src = URL.createObjectURL(file);
    });
  }, []);

  // ==================== IMAGE SPECIFIC HANDLERS ====================
  const handleImageFile = useCallback(async (file: File) => {
    if (!allowImageUpload) return;
    
    const attachment = await createAttachmentFromFile(file);
    if (attachment) {
      const updatedAttachments = [...attachments, attachment];
      onAttachmentsChange?.(updatedAttachments);
    }
  }, [allowImageUpload, attachments, onAttachmentsChange, createAttachmentFromFile]);

  // ==================== RECORDING FUNCTIONS ====================
  const startAudioRecording = useCallback(async () => {
    if (!allowAudioRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const file = new File([blob], `audio-${Date.now()}.wav`, { type: 'audio/wav' });
        handleFiles([file]);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingType('audio');
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Audio recording failed:', error);
    }
  }, [allowAudioRecording, handleFiles]);

  const startVideoRecording = useCallback(async () => {
    if (!allowVideoRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const file = new File([blob], `video-${Date.now()}.webm`, { type: 'video/webm' });
        handleFiles([file]);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingType('video');
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Video recording failed:', error);
    }
  }, [allowVideoRecording, handleFiles]);

  const startScreenCapture = useCallback(async () => {
    if (!allowScreenCapture) return;

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true, 
        audio: true 
      });
      
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const file = new File([blob], `screen-${Date.now()}.webm`, { type: 'video/webm' });
        handleFiles([file]);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingType('screen');
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Screen capture failed:', error);
    }
  }, [allowScreenCapture, handleFiles]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingType(null);
      setRecordingDuration(0);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  }, [isRecording]);

  // ==================== INPUT HANDLERS ====================
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    
    setIsExpanded(e.target.value.length > 50 || e.target.value.includes('\\n'));
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [value, attachments]);

  const handleSend = useCallback(() => {
    if (value.trim() || attachments.length > 0) {
      onSend(value, attachments);
      onChange('');
      onAttachmentsChange?.([]);
      setIsExpanded(false);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  }, [value, attachments, onSend, onChange, onAttachmentsChange]);

  // ==================== EMOJI HANDLERS ====================
  const insertEmoji = useCallback((emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + emoji + value.substring(end);
      onChange(newValue);
      
      // Reset cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }, 0);
    }
    setShowEmojiPicker(false);
  }, [value, onChange]);

  // ==================== ATTACHMENT MANAGEMENT ====================
  const removeAttachment = useCallback((id: string) => {
    const updated = attachments.filter(att => att.id !== id);
    onAttachmentsChange?.(updated);
  }, [attachments, onAttachmentsChange]);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const formatDuration = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // ==================== EFFECTS ====================
  useEffect(() => {
    // Click outside handlers
    const handleClickOutside = (event: MouseEvent) => {
      if (chatBarRef.current && !chatBarRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
        setShowAttachmentMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ==================== QUICK ACTIONS ====================
  const quickActions = [
    { id: 'research', label: 'Research', icon: '🔍', prompt: 'Help me research ' },
    { id: 'create', label: 'Create', icon: '✨', prompt: 'Help me create ' },
    { id: 'plan', label: 'Plan', icon: '📋', prompt: 'Help me plan ' },
    { id: 'analyze', label: 'Analyze', icon: '📊', prompt: 'Help me analyze ' },
    { id: 'debug', label: 'Debug', icon: '🐛', prompt: 'Help me debug ' }
  ];

  const handleQuickAction = useCallback((prompt: string) => {
    onChange(prompt);
    textareaRef.current?.focus();
  }, [onChange]);

  // ==================== RENDER ====================
  return (
    <div 
      ref={chatBarRef}
      className={`enhanced-chat-bar ${theme} ${isExpanded ? 'expanded' : ''} ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Overlay */}
      {isDragOver && (
        <div className="drag-drop-overlay">
          <div className="drag-drop-content">
            <div className="drag-drop-icon">📎</div>
            <h3>Drop files here</h3>
            <p>Images, videos, audio, documents...</p>
          </div>
        </div>
      )}

      {/* Attachment Previews */}
      {attachments.length > 0 && (
        <div className="attachment-previews">
          {attachments.map((attachment) => (
            <div key={attachment.id} className={`attachment-preview ${attachment.type}`}>
              {attachment.type === 'image' && (
                <div className="image-preview">
                  <img src={attachment.preview || attachment.url} alt={attachment.name} />
                  <button 
                    className="remove-attachment"
                    onClick={() => removeAttachment(attachment.id)}
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
              )}
              
              {attachment.type === 'video' && (
                <div className="video-preview">
                  <video src={attachment.url} className="video-thumbnail" />
                  <div className="video-overlay">
                    <span className="video-icon">▶️</span>
                    {attachment.duration && (
                      <span className="video-duration">{formatDuration(attachment.duration)}</span>
                    )}
                  </div>
                  <button 
                    className="remove-attachment"
                    onClick={() => removeAttachment(attachment.id)}
                    title="Remove video"
                  >
                    ×
                  </button>
                </div>
              )}
              
              {attachment.type === 'audio' && (
                <div className="audio-preview">
                  <div className="audio-icon">🎵</div>
                  <div className="audio-info">
                    <span className="audio-name">{attachment.name}</span>
                    <span className="audio-size">{formatFileSize(attachment.size)}</span>
                  </div>
                  <button 
                    className="remove-attachment"
                    onClick={() => removeAttachment(attachment.id)}
                    title="Remove audio"
                  >
                    ×
                  </button>
                </div>
              )}
              
              {attachment.type === 'file' && (
                <div className="file-preview">
                  <div className="file-icon">📄</div>
                  <div className="file-info">
                    <span className="file-name">{attachment.name}</span>
                    <span className="file-size">{formatFileSize(attachment.size)}</span>
                  </div>
                  <button 
                    className="remove-attachment"
                    onClick={() => removeAttachment(attachment.id)}
                    title="Remove file"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      {showQuickActions && value.length === 0 && (
        <div className="quick-actions">
          {quickActions.map((action) => (
            <button
              key={action.id}
              className="quick-action-btn"
              onClick={() => handleQuickAction(action.prompt)}
              title={action.label}
            >
              <span className="action-icon">{action.icon}</span>
              <span className="action-label">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Recording Indicator */}
      {isRecording && (
        <div className="recording-indicator">
          <div className="recording-pulse"></div>
          <span className="recording-type">
            {recordingType === 'audio' && '🎤'}
            {recordingType === 'video' && '📹'}
            {recordingType === 'screen' && '🖥️'}
          </span>
          <span className="recording-duration">{formatDuration(recordingDuration)}</span>
          <button className="stop-recording-btn" onClick={stopRecording}>
            Stop
          </button>
        </div>
      )}

      {/* Main Input Area */}
      <div className="chat-input-container">
        <div className="input-wrapper">
          {/* Attachment Menu */}
          <div className="attachment-controls">
            <button
              className="attachment-menu-toggle"
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              title="Attach files"
            >
              📎
            </button>
            
            {showAttachmentMenu && (
              <div className="attachment-menu">
                {allowFileUpload && (
                  <button onClick={() => fileInputRef.current?.click()}>
                    📄 Files
                  </button>
                )}
                {allowImageUpload && (
                  <button onClick={() => imageInputRef.current?.click()}>
                    🖼️ Images
                  </button>
                )}
                {allowAudioRecording && (
                  <button onClick={startAudioRecording} disabled={isRecording}>
                    🎤 Record Audio
                  </button>
                )}
                {allowVideoRecording && (
                  <button onClick={startVideoRecording} disabled={isRecording}>
                    📹 Record Video
                  </button>
                )}
                {allowScreenCapture && (
                  <button onClick={startScreenCapture} disabled={isRecording}>
                    🖥️ Screen Capture
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={placeholder}
            disabled={disabled}
            className="chat-textarea"
            rows={1}
          />

          {/* Emoji Button */}
          <button
            className="emoji-toggle"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Add emoji"
          >
            😊
          </button>

          {/* Send Button */}
          <button
            className="send-button"
            onClick={handleSend}
            disabled={disabled || (!value.trim() && attachments.length === 0)}
            title="Send message"
          >
            {isRecording ? '⏹️' : '🚀'}
          </button>
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="emoji-picker">
            <div className="emoji-categories">
              {Object.entries(emojiCategories).map(([category, emojis]) => (
                <div key={category} className="emoji-category">
                  <h4 className="emoji-category-title">{category}</h4>
                  <div className="emoji-grid">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        className="emoji-btn"
                        onClick={() => insertEmoji(emoji)}
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
      />
    </div>
  );
};

export default EnhancedChatBar;
