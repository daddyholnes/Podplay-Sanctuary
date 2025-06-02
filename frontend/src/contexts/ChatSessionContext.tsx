// ChatSessionContext.tsx - Context provider for managing chat sessions and messages
import React, { createContext, useState, useEffect, useCallback, useContext, ReactNode } from 'react';
import chatService, { ChatMessage, ChatSession, ApiResponse } from '../services/ChatService';
import modelService, { AIModel } from '../services/ModelService';
import webSocketService from '../services/WebSocketService';

// Context state interface
interface ChatSessionContextState {
  // Chat sessions
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  isLoadingSessions: boolean;
  sessionError: string | null;
  
  // Messages
  messages: ChatMessage[];
  isLoadingMessages: boolean;
  messagesError: string | null;
  
  // Message input and streaming
  messageInput: string;
  setMessageInput: (input: string) => void;
  isSending: boolean;
  isStreaming: boolean;
  streamingMessage: string;
  
  // File attachments
  attachments: File[];
  addAttachment: (file: File) => void;
  removeAttachment: (index: number) => void;
  
  // Models
  availableModels: AIModel[];
  selectedModel: AIModel | null;
  isLoadingModels: boolean;
  modelsError: string | null;
  
  // Actions
  selectSession: (sessionId: string) => Promise<void>;
  createSession: (title: string, modelId: string) => Promise<string | null>;
  deleteSession: (sessionId: string) => Promise<boolean>;
  sendMessage: (message: string, attachments?: File[]) => Promise<boolean>;
  selectModel: (modelId: string) => void;
  loadMoreMessages: () => Promise<void>;
  loadOlderSessions: () => Promise<void>;
}

// Create context with default values
const ChatSessionContext = createContext<ChatSessionContextState>({
  // Default values will be replaced by the provider
  sessions: [],
  currentSession: null,
  isLoadingSessions: false,
  sessionError: null,
  
  messages: [],
  isLoadingMessages: false,
  messagesError: null,
  
  messageInput: '',
  setMessageInput: () => {},
  isSending: false,
  isStreaming: false,
  streamingMessage: '',
  
  attachments: [],
  addAttachment: () => {},
  removeAttachment: () => {},
  
  availableModels: [],
  selectedModel: null,
  isLoadingModels: false,
  modelsError: null,
  
  selectSession: async () => {},
  createSession: async () => null,
  deleteSession: async () => false,
  sendMessage: async () => false,
  selectModel: () => {},
  loadMoreMessages: async () => {},
  loadOlderSessions: async () => {},
});

// Chat Session Provider component
export const ChatSessionProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  // Sessions state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState<boolean>(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  
  // Messages state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  
  // Message input and streaming state
  const [messageInput, setMessageInput] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  
  // File attachments state
  const [attachments, setAttachments] = useState<File[]>([]);
  
  // Models state
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  
  // Pagination state
  const [hasMoreMessages, setHasMoreMessages] = useState<boolean>(false);
  const [hasMoreSessions, setHasMoreSessions] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Load available models on mount
  useEffect(() => {
    loadAvailableModels();
  }, []);
  
  // Load chat sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);
  
  // Subscribe to message updates via WebSocket when a session is selected
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    if (currentSession) {
      unsubscribe = webSocketService.subscribeToStreamingChat(
        currentSession.id,
        (chunk) => {
          setStreamingMessage((prev) => prev + chunk);
        },
        () => {
          setIsStreaming(false);
          // Add the completed streaming message to messages array
          if (streamingMessage) {
            const newMessage: ChatMessage = {
              role: 'assistant',
              content: streamingMessage,
              timestamp: new Date().toISOString(),
            };
            
            setMessages((prevMessages) => [...prevMessages, newMessage]);
            setStreamingMessage('');
            
            // Update session with new message count
            if (currentSession) {
              setCurrentSession({
                ...currentSession,
                message_count: currentSession.message_count + 1,
                last_message: streamingMessage.substring(0, 100) + '...',
              });
            }
          }
        }
      );
    }
    
    // Cleanup subscription on unmount or session change
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentSession, streamingMessage]);

  /**
   * Load available AI models
   */
  const loadAvailableModels = async () => {
    setIsLoadingModels(true);
    setModelsError(null);
    
    try {
      const response = await modelService.getAvailableModels();
      
      if (response.success && response.data) {
        setAvailableModels(response.data);
        
        // Select the first model as default if none is selected
        if (!selectedModel && response.data.length > 0) {
          setSelectedModel(response.data[0]);
        }
      } else {
        setModelsError(response.error || 'Failed to load models');
      }
    } catch (error) {
      console.error('Error loading models:', error);
      setModelsError('An unexpected error occurred while loading models');
    } finally {
      setIsLoadingModels(false);
    }
  };

  /**
   * Load chat sessions
   */
  const loadSessions = async () => {
    setIsLoadingSessions(true);
    setSessionError(null);
    
    try {
      const response = await chatService.loadSessions();
      
      if (response.success && response.data) {
        setSessions(response.data);
        setHasMoreSessions(response.data.length >= 10); // Assuming 10 sessions per page
        
        // Select the most recent session if available
        if (response.data.length > 0 && !currentSession) {
          await selectSession(response.data[0].id);
        }
      } else {
        setSessionError(response.error || 'Failed to load sessions');
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      setSessionError('An unexpected error occurred while loading sessions');
    } finally {
      setIsLoadingSessions(false);
    }
  };

  /**
   * Select a chat session and load its messages
   */
  const selectSession = async (sessionId: string) => {
    setIsLoadingMessages(true);
    setMessagesError(null);
    
    try {
      // Find the session in our current list
      const session = sessions.find((s) => s.id === sessionId);
      if (session) {
        setCurrentSession(session);
      }
      
      // Load messages for this session
      const response = await chatService.getMessages(sessionId);
      
      if (response.success && response.data) {
        setMessages(response.data);
        setHasMoreMessages(response.data.length >= 50); // Assuming 50 messages per page
      } else {
        setMessagesError(response.error || 'Failed to load messages');
      }
    } catch (error) {
      console.error(`Error loading messages for session ${sessionId}:`, error);
      setMessagesError('An unexpected error occurred while loading messages');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  /**
   * Create a new chat session
   */
  const createSession = async (title: string, modelId: string): Promise<string | null> => {
    setIsLoadingSessions(true);
    setSessionError(null);
    
    try {
      const response = await chatService.createSession(title, modelId);
      
      if (response.success && response.data) {
        // Add the new session to our list
        setSessions((prev) => [response.data!, ...prev]);
        
        // Select the new session
        await selectSession(response.data.id);
        
        return response.data.id;
      } else {
        setSessionError(response.error || 'Failed to create session');
        return null;
      }
    } catch (error) {
      console.error('Error creating session:', error);
      setSessionError('An unexpected error occurred while creating session');
      return null;
    } finally {
      setIsLoadingSessions(false);
    }
  };

  /**
   * Delete a chat session
   */
  const deleteSession = async (sessionId: string): Promise<boolean> => {
    try {
      const response = await chatService.deleteSession(sessionId);
      
      if (response.success && response.data?.deleted) {
        // Remove the session from our list
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        
        // If we deleted the current session, select another one
        if (currentSession?.id === sessionId) {
          const remainingSessions = sessions.filter((s) => s.id !== sessionId);
          if (remainingSessions.length > 0) {
            await selectSession(remainingSessions[0].id);
          } else {
            setCurrentSession(null);
            setMessages([]);
          }
        }
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error(`Error deleting session ${sessionId}:`, error);
      return false;
    }
  };

  /**
   * Send a message in the current chat session
   */
  const sendMessage = async (message: string, fileAttachments?: File[]): Promise<boolean> => {
    if (!currentSession) return false;
    
    setIsSending(true);
    setMessagesError(null);
    
    try {
      // Add user message to state immediately for better UX
      const userMessage: ChatMessage = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, userMessage]);
      
      // Clear input and attachments
      setMessageInput('');
      const attachmentsToSend = [...attachments];
      setAttachments([]);
      
      // Start streaming mode
      setIsStreaming(true);
      setStreamingMessage('');
      
      // Send message to API
      const response = await chatService.sendMessage(
        currentSession.id,
        message,
        attachmentsToSend
      );
      
      if (!response.success) {
        setMessagesError(response.error || 'Failed to send message');
        setIsStreaming(false);
        return false;
      }
      
      // Update session with new message count
      if (currentSession) {
        setCurrentSession({
          ...currentSession,
          message_count: currentSession.message_count + 1,
          last_message: message.substring(0, 100) + '...',
        });
        
        // Update the session in the sessions list
        setSessions((prev) =>
          prev.map((s) =>
            s.id === currentSession.id
              ? {
                  ...s,
                  message_count: s.message_count + 1,
                  last_message: message.substring(0, 100) + '...',
                  updated_at: new Date().toISOString(),
                }
              : s
          )
        );
      }
      
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      setMessagesError('An unexpected error occurred while sending message');
      setIsStreaming(false);
      return false;
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Select an AI model to use
   */
  const selectModel = (modelId: string) => {
    const model = availableModels.find((m) => m.id === modelId);
    if (model) {
      setSelectedModel(model);
    }
  };

  /**
   * Add a file attachment to the message
   */
  const addAttachment = (file: File) => {
    setAttachments((prev) => [...prev, file]);
  };

  /**
   * Remove a file attachment from the message
   */
  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Load more messages for the current session (pagination)
   */
  const loadMoreMessages = async () => {
    if (!currentSession || !hasMoreMessages || isLoadingMessages) return;
    
    setIsLoadingMessages(true);
    
    try {
      // Implementation would depend on how pagination is handled in your API
      // This is a placeholder for the loadMoreMessages functionality
      // For example, you might load messages with a different page or offset
      
      setCurrentPage((prev) => prev + 1);
      
      // After loading, you would append the new messages to the existing ones
      // setMessages((prev) => [...prev, ...newMessages]);
      // setHasMoreMessages(newMessages.length >= 50);
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  /**
   * Load older sessions (pagination)
   */
  const loadOlderSessions = async () => {
    if (!hasMoreSessions || isLoadingSessions) return;
    
    setIsLoadingSessions(true);
    
    try {
      // Implementation would depend on how pagination is handled in your API
      // This is a placeholder for the loadOlderSessions functionality
      // Similar to loadMoreMessages but for sessions
      
      // After loading, you would append the new sessions to the existing ones
      // setSessions((prev) => [...prev, ...newSessions]);
      // setHasMoreSessions(newSessions.length >= 10);
    } catch (error) {
      console.error('Error loading older sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Create the context value object with all our state and functions
  const contextValue: ChatSessionContextState = {
    sessions,
    currentSession,
    isLoadingSessions,
    sessionError,
    
    messages,
    isLoadingMessages,
    messagesError,
    
    messageInput,
    setMessageInput,
    isSending,
    isStreaming,
    streamingMessage,
    
    attachments,
    addAttachment,
    removeAttachment,
    
    availableModels,
    selectedModel,
    isLoadingModels,
    modelsError,
    
    selectSession,
    createSession,
    deleteSession,
    sendMessage,
    selectModel,
    loadMoreMessages,
    loadOlderSessions,
  };

  return (
    <ChatSessionContext.Provider value={contextValue}>
      {children}
    </ChatSessionContext.Provider>
  );
};

// Custom hook to use the chat session context
export const useChatSession = () => useContext(ChatSessionContext);

export default ChatSessionContext;
