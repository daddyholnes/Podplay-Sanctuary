import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import chatApi, { ChatMessage, ChatSession, ChatAttachment } from '../services/chatApi';
import realtimeChatService from '../services/realtimeChatService';
import { useSocket } from './SocketContext';

// API response interface for consistent typing
interface ApiResponse<T> {
  data: T;
  status: number;
  success: boolean;
  message?: string;
}

// Chat context state interface
interface ChatSessionContextState {
  sessions: ChatSession[];
  activeSession: ChatSession | null;
  loading: boolean;
  error: Error | null;
  typingStatus: Record<string, boolean>; // sessionId -> isTyping
  
  // Session operations
  loadSessions: () => Promise<void>;
  createSession: (name: string, description?: string) => Promise<ChatSession>;
  updateSession: (sessionId: string, updates: Partial<Omit<ChatSession, 'id' | 'messages'>>) => Promise<ChatSession>;
  deleteSession: (sessionId: string) => Promise<void>;
  selectSession: (sessionId: string) => Promise<void>;
  
  // Message operations
  sendMessage: (content: string, attachments?: File[]) => Promise<ChatMessage>;
  sendTypingIndicator: (isTyping?: boolean) => void;
  
  // File operations
  uploadAttachment: (file: File) => Promise<ChatAttachment>;
  
  // Audio operations
  startAudioRecording: () => Promise<{ recordingId: string }>;
  stopAudioRecording: (recordingId: string) => Promise<ChatAttachment>;
  transcribeAudio: (audioAttachmentId: string) => Promise<{ text: string }>;
  
  // Stage management
  updateStage: (stage: ChatSession['stage']) => Promise<ChatSession>;
}

// Create the context
const ChatSessionContext = createContext<ChatSessionContextState | undefined>(undefined);

// Provider component
export const ChatSessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [typingStatus, setTypingStatus] = useState<Record<string, boolean>>({});

  const { isConnected } = useSocket();

  // Initialize real-time chat service
  useEffect(() => {
    if (isConnected) {
      realtimeChatService.initialize();
    }
  }, [isConnected]);

  // Subscribe to real-time events
  useEffect(() => {
    // Handle new messages
    const unsubscribeNewMessage = realtimeChatService.subscribe('new-message', ({ message, sessionId }) => {
      setSessions(prevSessions => {
        return prevSessions.map(session => {
          if (session.id === sessionId) {
            // Avoid duplicate messages
            const messageExists = session.messages.some(m => m.id === message.id);
            if (messageExists) return session;
            
            return {
              ...session,
              messages: [...session.messages, message],
              updated: new Date().toISOString()
            };
          }
          return session;
        });
      });
      
      // Update active session if needed
      if (activeSession?.id === sessionId) {
        setActiveSession(prev => {
          if (!prev) return null;
          
          // Avoid duplicate messages
          const messageExists = prev.messages.some(m => m.id === message.id);
          if (messageExists) return prev;
          
          return {
            ...prev,
            messages: [...prev.messages, message],
            updated: new Date().toISOString()
          };
        });
      }
    });
    
    // Handle typing indicators
    const unsubscribeTypingIndicator = realtimeChatService.subscribe('typing-indicator', ({ sessionId, isTyping }) => {
      setTypingStatus(prev => ({
        ...prev,
        [sessionId]: isTyping
      }));
    });
    
    // Handle session updates
    const unsubscribeSessionUpdated = realtimeChatService.subscribe('session-updated', ({ session }) => {
      setSessions(prevSessions => {
        return prevSessions.map(s => s.id === session.id ? session : s);
      });
      
      // Update active session if needed
      if (activeSession?.id === session.id) {
        setActiveSession(session);
      }
    });
    
    // Handle session deletions
    const unsubscribeSessionDeleted = realtimeChatService.subscribe('session-deleted', ({ sessionId }) => {
      setSessions(prevSessions => prevSessions.filter(s => s.id !== sessionId));
      
      // Clear active session if needed
      if (activeSession?.id === sessionId) {
        setActiveSession(null);
      }
    });
    
    // Cleanup subscriptions
    return () => {
      unsubscribeNewMessage();
      unsubscribeTypingIndicator();
      unsubscribeSessionUpdated();
      unsubscribeSessionDeleted();
    };
  }, [activeSession]);

  // Load all chat sessions
  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await chatApi.getSessions();
      setSessions(response);
    } catch (err) {
      console.error('Failed to load sessions:', err);
      setError(err instanceof Error ? err : new Error('Failed to load sessions'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new chat session
  const createSession = useCallback(async (name: string, description?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const session = await chatApi.createSession(name, description);
      setSessions(prev => [...prev, session]);
      
      // Automatically select the new session
      await selectSession(session.id);
      
      return session;
    } catch (err) {
      console.error('Failed to create session:', err);
      const error = err instanceof Error ? err : new Error('Failed to create session');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update an existing chat session
  const updateSession = useCallback(async (
    sessionId: string, 
    updates: Partial<Omit<ChatSession, 'id' | 'messages'>>
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedSession = await chatApi.updateSession(sessionId, updates);
      
      setSessions(prev => 
        prev.map(session => session.id === sessionId ? updatedSession : session)
      );
      
      // Update active session if needed
      if (activeSession?.id === sessionId) {
        setActiveSession(updatedSession);
      }
      
      return updatedSession;
    } catch (err) {
      console.error('Failed to update session:', err);
      const error = err instanceof Error ? err : new Error('Failed to update session');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [activeSession]);

  // Delete a chat session
  const deleteSession = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await chatApi.deleteSession(sessionId);
      
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      
      // Clear active session if needed
      if (activeSession?.id === sessionId) {
        setActiveSession(null);
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
      const error = err instanceof Error ? err : new Error('Failed to delete session');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [activeSession]);

  // Select a chat session
  const selectSession = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const session = await chatApi.getSession(sessionId);
      setActiveSession(session);
      
      // Update real-time chat service
      realtimeChatService.setActiveSession(sessionId);
    } catch (err) {
      console.error('Failed to select session:', err);
      setError(err instanceof Error ? err : new Error('Failed to select session'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Send a message in the active session
  const sendMessage = useCallback(async (content: string, attachments: File[] = []) => {
    if (!activeSession) {
      throw new Error('No active session selected');
    }
    
    try {
      // Use the real-time chat service for sending
      const message = await realtimeChatService.sendMessage(
        activeSession.id, 
        content, 
        attachments,
        {
          onStart: () => {
            // Clear typing indicator
            realtimeChatService.clearTypingIndicator(activeSession.id);
          },
          onSuccess: (newMessage) => {
            // Update the local state with the new message
            setActiveSession(prev => {
              if (!prev) return null;
              
              return {
                ...prev,
                messages: [...prev.messages, newMessage],
                updated: new Date().toISOString()
              };
            });
          },
          onError: (err) => {
            console.error('Failed to send message:', err);
            setError(err);
          }
        }
      );
      
      return message;
    } catch (err) {
      console.error('Failed to send message:', err);
      const error = err instanceof Error ? err : new Error('Failed to send message');
      setError(error);
      throw error;
    }
  }, [activeSession]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((isTyping: boolean = true) => {
    if (!activeSession) return;
    
    realtimeChatService.sendTypingIndicator(activeSession.id, isTyping);
  }, [activeSession]);

  // Upload file attachment
  const uploadAttachment = useCallback(async (file: File) => {
    try {
      return await chatApi.uploadAttachment(file);
    } catch (err) {
      console.error('Failed to upload attachment:', err);
      const error = err instanceof Error ? err : new Error('Failed to upload attachment');
      setError(error);
      throw error;
    }
  }, []);

  // Start audio recording
  const startAudioRecording = useCallback(async () => {
    try {
      return await chatApi.startAudioRecording();
    } catch (err) {
      console.error('Failed to start audio recording:', err);
      const error = err instanceof Error ? err : new Error('Failed to start audio recording');
      setError(error);
      throw error;
    }
  }, []);

  // Stop audio recording
  const stopAudioRecording = useCallback(async (recordingId: string) => {
    try {
      return await chatApi.stopAudioRecording(recordingId);
    } catch (err) {
      console.error('Failed to stop audio recording:', err);
      const error = err instanceof Error ? err : new Error('Failed to stop audio recording');
      setError(error);
      throw error;
    }
  }, []);

  // Transcribe audio
  const transcribeAudio = useCallback(async (audioAttachmentId: string) => {
    try {
      return await chatApi.transcribeAudio(audioAttachmentId);
    } catch (err) {
      console.error('Failed to transcribe audio:', err);
      const error = err instanceof Error ? err : new Error('Failed to transcribe audio');
      setError(error);
      throw error;
    }
  }, []);

  // Update session stage
  const updateStage = useCallback(async (stage: ChatSession['stage']) => {
    if (!activeSession) {
      throw new Error('No active session selected');
    }
    
    try {
      const updatedSession = await chatApi.updateStage(activeSession.id, stage);
      
      setActiveSession(updatedSession);
      
      // Also update in sessions list
      setSessions(prev => 
        prev.map(session => session.id === updatedSession.id ? updatedSession : session)
      );
      
      return updatedSession;
    } catch (err) {
      console.error('Failed to update stage:', err);
      const error = err instanceof Error ? err : new Error('Failed to update stage');
      setError(error);
      throw error;
    }
  }, [activeSession]);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Provide context value
  const contextValue: ChatSessionContextState = {
    sessions,
    activeSession,
    loading,
    error,
    typingStatus,
    loadSessions,
    createSession,
    updateSession,
    deleteSession,
    selectSession,
    sendMessage,
    sendTypingIndicator,
    uploadAttachment,
    startAudioRecording,
    stopAudioRecording,
    transcribeAudio,
    updateStage
  };

  return (
    <ChatSessionContext.Provider value={contextValue}>
      {children}
    </ChatSessionContext.Provider>
  );
};

// Hook to use the chat session context
export const useChatSession = () => {
  const context = useContext(ChatSessionContext);
  
  if (context === undefined) {
    throw new Error('useChatSession must be used within a ChatSessionProvider');
  }
  
  return context;
};