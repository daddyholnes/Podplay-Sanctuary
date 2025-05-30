
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAppStore } from '../store/useAppStore';
import { apiService } from '../services/api';
import { ChatMessage, AttachmentFile } from '../types';
import Icon from './Icon';
import Button from './Button';
import { processFiles, getFileIcon } from '../utils/fileUtils';
import { Textarea } from './Input'; // Assuming Input.tsx exports Textarea

const GlobalChatBar: React.FC = () => {
  const { currentSection, addMessage, chatHistory, isGlobalChatHistoryOpen, toggleGlobalChatHistory } = useAppStore();
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`; // Max height 200px
    }
  };

  useEffect(autoResizeTextarea, [message]);

  const handleSendMessage = useCallback(async () => {
    if (message.trim() === '' && attachments.length === 0) return;
    setIsLoading(true);
    const tempId = `temp_${Date.now()}`;
    
    let processedAttachments: AttachmentFile[] | undefined = undefined;
    if (attachments.length > 0) {
      try {
        processedAttachments = await processFiles(attachments);
      } catch (error) {
        console.error("Error processing files:", error);
        addMessage({
          id: `error_${Date.now()}`,
          message: "Error processing attachments.",
          sender: 'mama-bear', // System message
          timestamp: new Date().toISOString(),
          section: currentSection,
        });
        setIsLoading(false);
        return;
      }
    }

    addMessage({
      id: tempId,
      message: message.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
      section: currentSection,
      attachments: processedAttachments,
      isLoading: true,
    });

    setMessage('');
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto'; // Reset height

    try {
      // Backend is expected to echo the user message or send a new one with the actual ID
      // For now, we assume the API call triggers a socket event that updates/replaces this message.
      await apiService.sendMamaBearMessage(message.trim(), currentSection, {}, processedAttachments);
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage({
        id: `error_${Date.now()}`,
        message: `Error: ${error instanceof Error ? error.message : 'Failed to send message.'}`,
        sender: 'mama-bear',
        timestamp: new Date().toISOString(),
        section: currentSection,
      });
    } finally {
      setIsLoading(false);
    }
  }, [message, attachments, currentSection, addMessage]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setAttachments(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true, // Allow manual click via button
    noKeyboard: true,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];
        mediaRecorderRef.current.ondataavailable = event => {
          audioChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); // Or other preferred type
          const audioFile = new File([audioBlob], `voice_recording_${Date.now()}.webm`, { type: 'audio/webm' });
          setAttachments(prev => [...prev, audioFile]);
          stream.getTracks().forEach(track => track.stop()); // Release microphone
        };
        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error accessing microphone:", error);
        // Show error to user
      }
    }
  };
  
  const removeAttachment = (fileName: string) => {
    setAttachments(files => files.filter(file => file.name !== fileName));
  };

  const currentSectionChat = chatHistory.filter(msg => msg.section === currentSection);

  return (
    <>
      {/* Chat History Sidebar */}
      {isGlobalChatHistoryOpen && (
        <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-secondary-bg border-l border-border shadow-xl z-40 transform transition-transform duration-300 ease-in-out flex flex-col"
             style={{ transform: isGlobalChatHistoryOpen ? 'translateX(0)' : 'translateX(100%)' }}>
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-display text-lg">Chat History ({currentSection})</h3>
            <Button variant="ghost" size="sm" onClick={toggleGlobalChatHistory}><Icon name="xMark" /></Button>
          </div>
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {currentSectionChat.length === 0 && <p className="text-text-muted text-center py-4">No messages in this section yet.</p>}
            {currentSectionChat.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl ${msg.sender === 'user' ? 'bg-accent text-white' : 'bg-tertiary-bg text-text-primary'}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.attachments.map(att => (
                        <div key={att.name} className="flex items-center text-xs p-1.5 rounded bg-black/10">
                           {getFileIcon(att.type)} <span className="ml-1.5 truncate">{att.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Chat Bar */}
      <div
        {...getRootProps()}
        className={`fixed bottom-0 left-0 right-0 bg-primary-bg/80 backdrop-blur-md border-t border-border shadow-2xl_top rounded-t-xl p-3 md:p-4 z-50 transition-all duration-300 ease-in-out ${isDragActive ? 'ring-2 ring-accent' : ''}`}
      >
        <div className="container mx-auto flex items-end space-x-2">
          <Button variant="ghost" size="sm" onClick={toggleGlobalChatHistory} className="hidden md:inline-flex self-center">
            <Icon name="bars3" />
          </Button>
          
          <label htmlFor="file-upload-global" className="cursor-pointer self-center">
            <Icon name="paperClip" className="w-6 h-6 text-text-secondary hover:text-accent" />
          </label>
          <input {...getInputProps()} id="file-upload-global" className="hidden" />

          <Button variant="ghost" size="sm" onClick={() => {/* TODO: Emoji Picker */}} className="self-center">
            <Icon name="sparkles" /> {/* Simplified emoji icon */}
          </Button>
          
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${currentSection}... (Shift+Enter for new line)`}
            rows={1}
            className="flex-grow resize-none overflow-y-auto bg-secondary-bg border-border focus:ring-accent focus:border-accent rounded-lg max-h-[200px] transition-height duration-200"
            textareaClassName="py-2.5 px-3.5"
          />

          <Button variant="ghost" size="sm" onClick={handleVoiceRecording} className={`self-center ${isRecording ? 'text-error' : 'text-text-secondary'}`}>
            <Icon name={isRecording ? "stopCircle" : "speakerWave"} />
          </Button>

          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || (message.trim() === '' && attachments.length === 0)}
            isLoading={isLoading}
            className="self-end h-[44px] w-[44px] p-0 flex items-center justify-center rounded-full"
            variant="primary"
          >
            <Icon name="paperAirplane" className="w-5 h-5" />
          </Button>
        </div>
        {attachments.length > 0 && (
          <div className="mt-2 px-1 flex flex-wrap gap-2">
            {attachments.map(file => (
              <div key={file.name} className="bg-accent-light text-accent text-xs px-2 py-1 rounded-full flex items-center">
                {getFileIcon(file.type)} <span className="ml-1.5">{file.name}</span>
                <button onClick={() => removeAttachment(file.name)} className="ml-1.5 text-accent hover:text-accent-hover">
                  <Icon name="xMark" className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default GlobalChatBar;
