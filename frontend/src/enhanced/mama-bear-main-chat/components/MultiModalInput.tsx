import React, { useRef, useEffect } from 'react';

// Define props interface
interface MultiModalInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  onPaste: (e: React.ClipboardEvent) => void;
  attachments: File[];
  onRemoveAttachment: (index: number) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileDrop: (files: FileList) => void;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

/**
 * MultiModalInput component - handles text, file, and audio input
 */
const MultiModalInput: React.FC<MultiModalInputProps> = ({
  value,
  onChange,
  onSubmit,
  onPaste,
  attachments,
  onRemoveAttachment,
  onFileSelect,
  onFileDrop,
  isRecording,
  onStartRecording,
  onStopRecording,
  fileInputRef
}) => {
  // Ref for auto-resizing text area
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  
  // Handle file drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileDrop(e.dataTransfer.files);
    }
  };
  
  // Prevent default drag behavior
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  // Handle key press (Enter to submit)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };
  
  // Auto-resize text area based on content
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'inherit';
      const scrollHeight = textAreaRef.current.scrollHeight;
      textAreaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [value]);
  
  // Get file icon based on type
  const getFileIcon = (file: File) => {
    const fileType = file.type.split('/')[0];
    
    switch (fileType) {
      case 'image':
        return URL.createObjectURL(file);
      case 'audio':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
          </svg>
        );
      case 'video':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        );
    }
  };

  return (
    <div 
      className="input-container"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {attachments.length > 0 && (
        <div className="input-attachments">
          {attachments.map((file, index) => (
            <div key={index} className="attachment-preview">
              {typeof getFileIcon(file) === 'string' ? (
                <img src={getFileIcon(file) as string} alt={file.name} />
              ) : (
                <div className="file-icon">{getFileIcon(file)}</div>
              )}
              <button
                className="remove-button"
                onClick={() => onRemoveAttachment(index)}
                aria-label={`Remove ${file.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="input-main">
        <div className="input-actions">
          <button
            className="input-action-button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach file"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
            </svg>
          </button>
          <input
            type="file"
            className="file-input"
            onChange={onFileSelect}
            ref={fileInputRef}
            multiple
            aria-label="Upload file"
          />
          
          <button
            className={`input-action-button ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? onStopRecording : onStartRecording}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          </button>
        </div>
        
        <textarea
          ref={textAreaRef}
          className="input-textarea"
          value={value}
          onChange={onChange}
          onPaste={onPaste}
          onKeyPress={handleKeyPress}
          placeholder="Message Mama Bear..."
          rows={1}
          aria-label="Message input"
        />
        
        <button
          className="send-button"
          onClick={onSubmit}
          disabled={!value.trim() && attachments.length === 0}
          aria-label="Send message"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MultiModalInput;