import React, { useRef, useState, useCallback, useEffect } from 'react';
import { MediaAttachment } from '../ModelRegistry';
import './MultimodalInput.css';

// ==================== INTERFACES ====================

export interface MultimodalInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onAttachmentsChange: (attachments: MediaAttachment[]) => void;
  attachments: MediaAttachment[];
  placeholder?: string;
  disabled?: boolean;
  showQuickActions?: boolean;
  quickActions?: Array<{ label: string; action: () => void }>;
  className?: string;
}

// ==================== MULTIMODAL INPUT COMPONENT ====================

export const MultimodalInput: React.FC<MultimodalInputProps> = ({
  value,
  onChange,
  onSend,
  onAttachmentsChange,
  attachments,
  placeholder = "Type your message...",
  disabled = false,
  showQuickActions = true,
  quickActions = [],
  className = ""
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ==================== AUDIO RECORDING ====================
  
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const file = new File([blob], `recording-${Date.now()}.wav`, { type: 'audio/wav' });
        
        const newAttachment: MediaAttachment = {
          id: Date.now().toString(),
          file,
          blob,
          type: 'audio',
          mimeType: 'audio/wav',
          url: URL.createObjectURL(blob),
          name: file.name,
          size: file.size
        };

        onAttachmentsChange([...attachments, newAttachment]);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, [attachments, onAttachmentsChange]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingDuration(0);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  }, [isRecording]);

  // ==================== FILE HANDLING ====================
  
  const handleFileSelection = useCallback((files: File[]) => {
    const newAttachments = files.map(file => {
      const type = getFileType(file);
      return {
        id: Date.now().toString() + Math.random().toString(36),
        file,
        type,
        mimeType: file.type,
        url: type === 'image' || type === 'video' ? URL.createObjectURL(file) : undefined,
        name: file.name,
        size: file.size
      } as MediaAttachment;
    });

    onAttachmentsChange([...attachments, ...newAttachments]);
  }, [attachments, onAttachmentsChange]);

  const getFileType = (file: File): MediaAttachment['type'] => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'file';
  };

  const removeAttachment = useCallback((attachmentId: string) => {
    const attachment = attachments.find(att => att.id === attachmentId);
    if (attachment?.url) {
      URL.revokeObjectURL(attachment.url);
    }
    onAttachmentsChange(attachments.filter(att => att.id !== attachmentId));
  }, [attachments, onAttachmentsChange]);

  // ==================== DRAG AND DROP ====================
  
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDragOver(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      
      const files = Array.from(e.dataTransfer?.files || []);
      if (files.length > 0) {
        handleFileSelection(files);
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (items) {
        const files: File[] = [];
        Array.from(items).forEach(item => {
          if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            if (file) files.push(file);
          }
        });
        if (files.length > 0) {
          handleFileSelection(files);
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
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [handleFileSelection]);

  // ==================== KEYBOARD HANDLING ====================
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  // ==================== FORMAT HELPERS ====================
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatRecordingTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFileIcon = (type: MediaAttachment['type']): string => {
    switch (type) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      default: return '📄';
    }
  };

  // ==================== RENDER ====================
  
  return (
    <div className={`multimodal-input ${className}`}>
      {/* Drag & Drop Overlay */}
      {isDragOver && (
        <div className="drag-drop-overlay">
          <div className="drag-drop-content">
            <div className="drag-drop-icon">📎</div>
            <h3>Drop files here</h3>
            <p>Images, videos, audio, and documents</p>
          </div>
        </div>
      )}

      {/* Attachment Previews */}
      {attachments.length > 0 && (
        <div className="attachment-previews">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="attachment-preview">
              {attachment.type === 'image' && attachment.url && (
                <div className="image-preview">
                  <img src={attachment.url} alt={attachment.name} />
                  <div className="preview-overlay">
                    <button
                      className="remove-attachment"
                      onClick={() => removeAttachment(attachment.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
              
              {attachment.type !== 'image' && (
                <div className="file-preview">
                  <span className="file-icon">{getFileIcon(attachment.type)}</span>
                  <div className="file-info">
                    <div className="file-name">{attachment.name}</div>
                    <div className="file-size">{formatFileSize(attachment.size)}</div>
                  </div>
                  <button
                    className="remove-attachment"
                    onClick={() => removeAttachment(attachment.id)}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      {showQuickActions && quickActions.length > 0 && (
        <div className="input-enhancement-bar">
          <div className="quick-actions">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="quick-action"
                onClick={action.action}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Input Area */}
      <div className="multimodal-input-container">
        {/* Media Input Buttons */}
        <div className="media-input-buttons">
          <button 
            className="media-button"
            onClick={() => imageInputRef.current?.click()}
            title="Add Image"
            disabled={disabled}
          >
            🖼️
          </button>
          
          <button 
            className="media-button"
            onClick={() => videoInputRef.current?.click()}
            title="Add Video"
            disabled={disabled}
          >
            🎥
          </button>
          
          <button 
            className={`media-button ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
            title={isRecording ? 'Stop Recording' : 'Record Audio'}
            disabled={disabled}
          >
            {isRecording ? '⏹️' : '🎤'}
            {isRecording && (
              <div className="recording-indicator">
                <span className="recording-time">{formatRecordingTime(recordingDuration)}</span>
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
            disabled={disabled}
          >
            📎
          </button>
        </div>

        {/* Text Input Area */}
        <div className="text-input-area">
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="chat-input"
            rows={3}
            disabled={disabled}
          />
          
          <button 
            onClick={onSend}
            disabled={!value.trim() || disabled}
            className="send-button gradient"
          >
            🚀
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
    </div>
  );
};

export default MultimodalInput;
