
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAppStore } from '../store/useAppStore';
import { apiService } from '../services/api';
import { ChatMessage, ModelInfo, AttachmentFile } from '../types';
import Button from '../components/Button';
import Icon from '../components/Icon';
import Card, { CardHeader, CardContent } from '../components/Card';
import { Select, Textarea } from '../components/Input';
import Spinner from '../components/common/Spinner';
import { processFiles, getFileIcon } from '../utils/fileUtils';
import { DEFAULT_MODEL_OPTIONS } from '../utils/constants';

const SECTION_ID = 'vertex-garden';

const VertexGarden: React.FC = () => {
  const { chatHistory, addMessage, updateMessage } = useAppStore(state => ({
    chatHistory: state.chatHistory.filter(msg => msg.section === SECTION_ID),
    addMessage: state.addMessage,
    updateMessage: state.updateMessage,
  }));

  const [availableModels, setAvailableModels] = useState<ModelInfo[]>(DEFAULT_MODEL_OPTIONS.map(m => ({...m, provider: 'Unknown', capabilities: ['text']})));
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL_OPTIONS[0]?.id || '');
  const [currentMessage, setCurrentMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const fetchModels = useCallback(async () => {
    try {
      const models = await apiService.getAvailableModels();
      if (models && models.length > 0) {
        setAvailableModels(models);
        if (!selectedModel && models[0]) {
          setSelectedModel(models[0].id);
        }
      } else {
        // Stick to default if API returns empty or error
        console.warn("No models fetched from API, using defaults.");
      }
    } catch (error) {
      console.error("Error fetching models:", error);
      addMessage({ id: `err_${Date.now()}`, message: `Error fetching models: ${error instanceof Error ? error.message : 'Unknown error'}`, sender: 'gemini', timestamp: new Date().toISOString(), section: SECTION_ID });
    }
  }, [addMessage, selectedModel]);

  const createSession = useCallback(async (modelId: string) => {
    if (!modelId) return;
    try {
      const session = await apiService.createVertexSession(modelId);
      setCurrentSessionId(session.sessionId);
      addMessage({ id: `info_${Date.now()}`, message: `New session started with ${modelId}. Session ID: ${session.sessionId}`, sender: 'gemini', timestamp: new Date().toISOString(), section: SECTION_ID });
    } catch (error) {
      console.error("Error creating session:", error);
      addMessage({ id: `err_${Date.now()}`, message: `Error creating session: ${error instanceof Error ? error.message : 'Unknown error'}`, sender: 'gemini', timestamp: new Date().toISOString(), section: SECTION_ID });
    }
  }, [addMessage]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  useEffect(() => {
    if (selectedModel) {
      createSession(selectedModel);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModel]); // createSession is memoized

  const handleSendMessage = async () => {
    if (currentMessage.trim() === '' && attachments.length === 0) return;
    setIsLoading(true);
    
    const tempId = `temp_${Date.now()}`;
    let processedAttachments: AttachmentFile[] | undefined;

    if (attachments.length > 0) {
      processedAttachments = await processFiles(attachments);
    }
    
    addMessage({
      id: tempId,
      message: currentMessage.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
      section: SECTION_ID,
      attachments: processedAttachments,
      isLoading: true,
    });

    const formData = new FormData();
    formData.append('message', currentMessage.trim());
    formData.append('model', selectedModel);
    if (currentSessionId) formData.append('sessionId', currentSessionId);
    attachments.forEach(file => formData.append('media', file, file.name));
    
    setCurrentMessage('');
    setAttachments([]);

    try {
      const responseMessage = await apiService.sendVertexGardenMessage(formData);
      // Assuming responseMessage contains the final ID and content.
      // If socket updates, this manual update might be redundant or cause issues.
      // For now, let's assume API returns full message and we update the temporary one.
      updateMessage(tempId, { ...responseMessage, sender: (selectedModel.toLowerCase().includes('claude') ? 'claude' : 'gemini') as 'gemini' | 'claude', isLoading: false });
    } catch (error) {
      console.error("Error sending multimodal message:", error);
      updateMessage(tempId, { message: `Error: ${error instanceof Error ? error.message : 'Failed to send.'}`, isLoading: false });
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setAttachments(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.mov'],
      'audio/*': ['.mp3', '.wav', '.ogg'],
    }
  });
  
  const removeAttachment = (fileName: string) => {
    setAttachments(files => files.filter(file => file.name !== fileName));
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <header className="flex items-center justify-between pb-2 border-b border-border">
        <h1 className="font-display text-2xl text-green-500 flex items-center">
          <Icon name="vertexGarden" className="w-8 h-8 mr-2" /> Multimodal Vertex Garden
        </h1>
        <Select
          options={availableModels.map(m => ({ value: m.id, label: m.name }))}
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-auto md:min-w-[200px]"
        />
      </header>

      {/* Chat Area */}
      <Card className="flex-grow flex flex-col overflow-hidden">
        <CardContent ref={chatContainerRef} className="flex-grow overflow-y-auto space-y-4 bg-secondary-bg p-4">
          {chatHistory.length === 0 && (
            <div className="text-center text-text-muted py-10">
              <Icon name="chat" className="w-12 h-12 mx-auto mb-2" />
              <p>Chat with powerful multimodal models. Upload images, videos, or audio.</p>
            </div>
          )}
          {chatHistory.map((msg) => (
             <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-xl shadow-sm ${msg.sender === 'user' ? 'bg-accent text-white' : 'bg-tertiary-bg text-text-primary'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {msg.attachments.map((att, idx) => (
                      <div key={`${att.name}-${idx}`} className="p-1.5 rounded bg-black/10">
                        {att.type.startsWith('image/') && <img src={att.data} alt={att.name} className="max-w-xs max-h-64 rounded" />}
                        {att.type.startsWith('video/') && <video src={att.data} controls className="max-w-xs max-h-64 rounded" />}
                        {att.type.startsWith('audio/') && <audio src={att.data} controls className="w-full" />}
                        <p className="text-xs mt-1">{getFileIcon(att.type)} {att.name} ({Math.round((att.size || 0) / 1024)}KB)</p>
                      </div>
                    ))}
                  </div>
                )}
                 <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString()} | {msg.sender}</p>
                 {msg.isLoading && <Spinner size="sm" className="mt-1" />}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      
      {/* Input Area */}
      <div {...getRootProps()} className={`p-3 border border-dashed rounded-lg ${isDragActive ? 'border-accent bg-accent-light' : 'border-border hover:border-text-muted'}`}>
        <input {...getInputProps()} ref={fileInputRef} />
        <div className="flex items-end space-x-2">
          <Textarea
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Ask about images, videos, or audio..."
            rows={1}
            className="flex-grow resize-none overflow-y-auto bg-primary-bg border-border focus:ring-accent focus:border-accent rounded-lg max-h-[150px]"
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
          />
          <Button onClick={open} variant="secondary" size="md" leftIcon="cloudUpload" className="h-[44px]">
            Media
          </Button>
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || (currentMessage.trim() === '' && attachments.length === 0)}
            isLoading={isLoading}
            className="h-[44px]"
            variant="primary"
          >
            Send
          </Button>
        </div>
        {attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {attachments.map(file => (
              <div key={file.name} className="bg-accent-light text-accent text-xs px-2 py-1 rounded-full flex items-center">
                {getFileIcon(file.type)} <span className="ml-1.5">{file.name}</span>
                <button onClick={(e) => { e.stopPropagation(); removeAttachment(file.name); }} className="ml-1.5 text-accent hover:text-accent-hover">
                  <Icon name="xMark" className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
         {isDragActive && <p className="text-center text-accent mt-2">Drop files here...</p>}
      </div>
    </div>
  );
};

export default VertexGarden;
