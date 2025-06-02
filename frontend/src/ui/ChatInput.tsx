import React, { useState, useRef, useCallback } from 'react';
import styled from '@emotion/styled';
import { Send, Mic, MicOff, Paperclip, Image, Video, FileText, Code2, Smile } from 'lucide-react';
import useAppStore from '../store/useAppStore';

interface ChatInputProps {
  onSendMessage: (text: string, attachments?: FileList | File[]) => void;
  onStartRecording?: () => void;
  onStopRecording?: (audioBlob: Blob) => void;
  placeholder?: string;
  disabled?: boolean;
  supportedAttachments?: Array<'image' | 'video' | 'audio' | 'file' | 'code'>;
  className?: string;
}

// Styled Components
const InputContainer = styled.div<{ isDarkMode: boolean }>`
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  background: ${({ isDarkMode }) =>
    isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.5)'};
  border: 1px solid ${({ isDarkMode }) =>
    isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.8)'};
  backdrop-filter: blur(8px);
  padding: 0.5rem;
  transition: all 0.2s ease;
  
  &:focus-within {
    border-color: ${({ isDarkMode }) =>
      isDarkMode ? 'rgba(139, 92, 246, 0.5)' : 'rgba(139, 92, 246, 0.3)'};
    box-shadow: 0 0 0 2px ${({ isDarkMode }) =>
      isDarkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)'};
  }
`;

const FilePreviewContainer = styled.div<{ isDarkMode: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 8px;
  background: ${({ isDarkMode }) =>
    isDarkMode ? 'rgba(15, 23, 42, 0.5)' : 'rgba(248, 250, 252, 0.5)'};
  margin-bottom: 0.5rem;
`;

const FilePreview = styled.div<{ isDarkMode: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: ${({ isDarkMode }) =>
    isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.5)'};
  border: 1px solid ${({ isDarkMode }) =>
    isDarkMode ? 'rgba(71, 85, 105, 0.5)' : 'rgba(203, 213, 225, 0.8)'};
  
  &:hover .remove-button {
    opacity: 1;
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.8);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
  border: none;
  
  &:hover {
    background: rgba(220, 38, 38, 0.9);
  }
`;

const FileName = styled.span<{ isDarkMode: boolean }>`
  font-size: 0.6rem;
  color: ${({ isDarkMode }) => (isDarkMode ? '#cbd5e1' : '#475569')};
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  padding: 0 4px;
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InputButtons = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const IconButton = styled.button<{ isDarkMode: boolean; isActive?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: ${({ isDarkMode, isActive }) =>
    isActive
      ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.6), rgba(236, 72, 153, 0.6))'
      : isDarkMode
      ? 'rgba(51, 65, 85, 0.5)'
      : 'rgba(241, 245, 249, 0.7)'};
  color: ${({ isDarkMode, isActive }) =>
    isActive
      ? 'white'
      : isDarkMode
      ? '#cbd5e1'
      : '#64748b'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ isDarkMode, isActive }) =>
      isActive
        ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.7), rgba(236, 72, 153, 0.7))'
        : isDarkMode
        ? 'rgba(71, 85, 105, 0.7)'
        : 'rgba(226, 232, 240, 0.9)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea<{ isDarkMode: boolean }>`
  flex: 1;
  border: none;
  background: transparent;
  color: ${({ isDarkMode }) => (isDarkMode ? 'white' : '#1e293b')};
  resize: none;
  padding: 0.5rem;
  font-family: inherit;
  font-size: 0.875rem;
  
  &::placeholder {
    color: ${({ isDarkMode }) => (isDarkMode ? '#94a3b8' : '#94a3b8')};
  }
  
  &:focus {
    outline: none;
  }
`;

const SendButton = styled.button<{ isDarkMode: boolean; hasContent: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  background: ${({ hasContent }) =>
    hasContent
      ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(236, 72, 153, 0.9))'
      : 'rgba(148, 163, 184, 0.5)'};
  
  color: ${({ hasContent }) => (hasContent ? 'white' : '#cbd5e1')};
  
  &:hover:not(:disabled) {
    background: ${({ hasContent }) =>
      hasContent
        ? 'linear-gradient(135deg, rgba(139, 92, 246, 1), rgba(236, 72, 153, 1))'
        : 'rgba(148, 163, 184, 0.6)'};
    transform: ${({ hasContent }) => (hasContent ? 'scale(1.05)' : 'none')};
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

// Main Component
const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStartRecording,
  onStopRecording,
  placeholder = 'Type a message...',
  disabled = false,
  supportedAttachments = ['image', 'video', 'audio', 'file', 'code'],
  className,
}) => {
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  
  // Handle text input change and auto-resize
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    
    // Auto-resize textarea
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, []);
  
  // Handle sending a message
  const handleSend = useCallback(() => {
    if ((text.trim() || attachments.length > 0) && !disabled) {
      onSendMessage(text, attachments);
      setText('');
      setAttachments([]);
      
      // Reset textarea height
      if (textAreaRef.current) {
        textAreaRef.current.style.height = 'auto';
      }
    }
  }, [text, attachments, disabled, onSendMessage]);
  
  // Handle recording toggle
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
      onStopRecording?.(new Blob()); // This would be the actual audio blob in a real implementation
    } else {
      setIsRecording(true);
      onStartRecording?.();
    }
  }, [isRecording, onStartRecording, onStopRecording]);
  
  // Handle file selection
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      setAttachments((prev) => [...prev, ...newFiles]);
    }
  }, []);
  
  // Handle file removal
  const removeFile = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);
  
  // Key press handler for sending on Enter (but not with Shift)
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);
  
  // File type icon mapping
  const getFileIcon = useCallback((file: File) => {
    const fileType = file.type.split('/')[0];
    switch (fileType) {
      case 'image':
        return <Image size={16} />;
      case 'video':
        return <Video size={16} />;
      case 'audio':
        return <Mic size={16} />;
      default:
        return <FileText size={16} />;
    }
  }, []);
  
  // Generate file preview
  const getFilePreview = useCallback((file: File, index: number) => {
    const fileType = file.type.split('/')[0];
    
    return (
      <FilePreview key={index} isDarkMode={isDarkMode}>
        {fileType === 'image' ? (
          <img
            src={URL.createObjectURL(file)}
            alt={file.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {getFileIcon(file)}
          </div>
        )}
        <FileName isDarkMode={isDarkMode}>
          {file.name.length > 12 ? `${file.name.substring(0, 10)}...` : file.name}
        </FileName>
        <RemoveButton className="remove-button" onClick={() => removeFile(index)}>
          ×
        </RemoveButton>
      </FilePreview>
    );
  }, [isDarkMode, getFileIcon, removeFile]);
  
  return (
    <InputContainer isDarkMode={isDarkMode} className={className}>
      {attachments.length > 0 && (
        <FilePreviewContainer isDarkMode={isDarkMode}>
          {attachments.map((file, index) => getFilePreview(file, index))}
        </FilePreviewContainer>
      )}
      
      <InputRow>
        <InputButtons>
          {supportedAttachments.includes('file') && (
            <IconButton
              isDarkMode={isDarkMode}
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              aria-label="Attach file"
            >
              <Paperclip size={16} />
            </IconButton>
          )}
          
          {supportedAttachments.includes('image') && (
            <IconButton
              isDarkMode={isDarkMode}
              onClick={() => imageInputRef.current?.click()}
              disabled={disabled}
              aria-label="Attach image"
            >
              <Image size={16} />
            </IconButton>
          )}
          
          {supportedAttachments.includes('video') && (
            <IconButton
              isDarkMode={isDarkMode}
              onClick={() => videoInputRef.current?.click()}
              disabled={disabled}
              aria-label="Attach video"
            >
              <Video size={16} />
            </IconButton>
          )}
          
          {supportedAttachments.includes('audio') && (
            <IconButton
              isDarkMode={isDarkMode}
              isActive={isRecording}
              onClick={toggleRecording}
              disabled={disabled}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
            </IconButton>
          )}
          
          {supportedAttachments.includes('code') && (
            <IconButton
              isDarkMode={isDarkMode}
              onClick={() => {
                setText((prev) => prev + '\n```\n\n```');
                setTimeout(() => {
                  if (textAreaRef.current) {
                    textAreaRef.current.focus();
                    const pos = textAreaRef.current.value.lastIndexOf('```') - 1;
                    textAreaRef.current.setSelectionRange(pos, pos);
                  }
                }, 0);
              }}
              disabled={disabled}
              aria-label="Insert code block"
            >
              <Code2 size={16} />
            </IconButton>
          )}
          
          <IconButton
            isDarkMode={isDarkMode}
            onClick={() => {/* Emoji picker would open here */}}
            disabled={disabled}
            aria-label="Add emoji"
          >
            <Smile size={16} />
          </IconButton>
        </InputButtons>
        
        <TextArea
          ref={textAreaRef}
          value={text}
          onChange={handleTextChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          isDarkMode={isDarkMode}
        />
        
        <SendButton
          isDarkMode={isDarkMode}
          hasContent={!!(text.trim() || attachments.length)}
          onClick={handleSend}
          disabled={!(text.trim() || attachments.length) || disabled}
          aria-label="Send message"
        >
          <Send size={16} />
        </SendButton>
      </InputRow>
      
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileSelect(e.target.files)}
        style={{ display: 'none' }}
        multiple
      />
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        style={{ display: 'none' }}
        multiple
      />
      <input
        type="file"
        ref={videoInputRef}
        accept="video/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        style={{ display: 'none' }}
      />
    </InputContainer>
  );
};

export default ChatInput;