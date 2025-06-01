/**
 * Chat Hook - useChat
 * 
 * A comprehensive React hook for managing chat functionality in Podplay Sanctuary.
 * Handles message management, real-time communication, chat history, typing indicators,
 * and AI agent interactions with full state management and error handling.
 * 
 * Features:
 * - Real-time messaging with WebSocket integration
 * - Message history with pagination
 * - Typing indicators and presence
 * - AI agent integration (Mama Bear, Code Assistant, etc.)
 * - Message caching and persistence
 * - Optimistic updates with rollback
 * - Rate limiting and spam protection
 * - Message formatting and rich content support
 * - Thread and conversation management
 * 
 * @author Podplay Sanctuary Team
 * @version 1.0.0
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useSocket } from '../api/useSocket';
import { useAPI } from '../api/useAPI';
import { ChatService } from '../../services/ai/ChatService';
import { ChatSocketService } from '../../services/socket/ChatSocketService';
import { SessionManager } from '../../services/storage/SessionManager';

export interface ChatMessage {
  id: string;
  content: string;
  type: 'user' | 'ai' | 'system' | 'error';
  timestamp: Date;
  author: string;
  conversationId: string;
  threadId?: string;
  metadata?: {
    agent?: string;
    model?: string;
    tokens?: number;
    confidence?: number;
    sources?: string[];
    attachments?: any[];
  };
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  optimistic?: boolean;
}

export interface ChatConversation {
  id: string;
  title: string;
  type: 'chat' | 'code' | 'mcp' | 'workspace';
  agent: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  isActive: boolean;
  metadata?: any;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: Date;
}

export interface UseChatOptions {
  // Connection options
  autoConnect?: boolean;
  conversationId?: string;
  agent?: string;
  
  // Message options
  enableTypingIndicators?: boolean;
  enablePresence?: boolean;
  messagePageSize?: number;
  maxMessageHistory?: number;
  
  // AI options
  enableAI?: boolean;
  aiModel?: string;
  aiContext?: any;
  
  // Persistence options
  persistMessages?: boolean;
  persistConversations?: boolean;
  
  // Rate limiting
  rateLimitMs?: number;
  maxMessagesPerMinute?: number;
  
  // Callbacks
  onMessageReceived?: (message: ChatMessage) => void;
  onMessageSent?: (message: ChatMessage) => void;
  onMessageFailed?: (message: ChatMessage, error: Error) => void;
  onTypingUpdate?: (indicators: TypingIndicator[]) => void;
  onConversationUpdate?: (conversation: ChatConversation) => void;
  onError?: (error: Error) => void;
}

export interface UseChatResult {
  // Message state
  messages: ChatMessage[];
  isLoading: boolean;
  isConnected: boolean;
  hasMore: boolean;
  
  // Conversation state
  conversation: ChatConversation | null;
  conversations: ChatConversation[];
  
  // Typing and presence
  typingIndicators: TypingIndicator[];
  isTyping: boolean;
  
  // Actions
  sendMessage: (content: string, type?: ChatMessage['type']) => Promise<ChatMessage>;
  sendAIMessage: (content: string, context?: any) => Promise<ChatMessage>;
  editMessage: (messageId: string, content: string) => Promise<ChatMessage>;
  deleteMessage: (messageId: string) => Promise<void>;
  retryMessage: (messageId: string) => Promise<ChatMessage>;
  
  // Conversation management
  createConversation: (title: string, type: ChatConversation['type'], agent: string) => Promise<ChatConversation>;
  switchConversation: (conversationId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  updateConversation: (conversationId: string, updates: Partial<ChatConversation>) => Promise<ChatConversation>;
  
  // History management
  loadMoreMessages: () => Promise<void>;
  clearHistory: () => void;
  exportConversation: (format: 'json' | 'txt' | 'md') => string;
  
  // Typing and presence
  setTyping: (isTyping: boolean) => void;
  
  // Connection management
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
}

interface ChatState {
  messages: ChatMessage[];
  conversations: ChatConversation[];
  currentConversation: ChatConversation | null;
  typingIndicators: TypingIndicator[];
  isTyping: boolean;
  hasMore: boolean;
  lastMessageTimestamp: Date | null;
  messageBuffer: ChatMessage[];
}

export function useChat(options: UseChatOptions = {}): UseChatResult {
  const {
    autoConnect = true,
    conversationId: initialConversationId,
    agent = 'mama-bear',
    enableTypingIndicators = true,
    enablePresence = true,
    messagePageSize = 50,
    maxMessageHistory = 1000,
    enableAI = true,
    aiModel = 'gemini-pro',
    aiContext,
    persistMessages = true,
    persistConversations = true,
    rateLimitMs = 1000,
    maxMessagesPerMinute = 60,
    onMessageReceived,
    onMessageSent,
    onMessageFailed,
    onTypingUpdate,
    onConversationUpdate,
    onError
  } = options;

  // State management
  const [state, setState] = useState<ChatState>({
    messages: [],
    conversations: [],
    currentConversation: null,
    typingIndicators: [],
    isTyping: false,
    hasMore: true,
    lastMessageTimestamp: null,
    messageBuffer: []
  });

  // Services
  const chatService = useRef(new ChatService());
  const socketService = useRef(new ChatSocketService());
  const sessionManager = useRef(SessionManager.getInstance());

  // Rate limiting
  const messageCountRef = useRef<{ count: number; resetTime: number }>({ count: 0, resetTime: Date.now() + 60000 });
  const lastMessageTimeRef = useRef<number>(0);

  // WebSocket connection
  const {
    isConnected,
    sendJsonMessage,
    lastMessage,
    connect: connectSocket,
    disconnect: disconnectSocket,
    reconnect: reconnectSocket
  } = useSocket(
    process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:8000/ws/chat',
    {
      autoConnect,
      reconnect: true,
      onMessage: handleSocketMessage,
      onError: (error) => onError?.(new Error(`WebSocket error: ${error}`))
    }
  );

  // API hooks for message operations
  const { execute: loadMessages, isLoading: isLoadingMessages } = useAPI(
    async (conversationId: string, offset: number = 0, limit: number = messagePageSize) => {
      return chatService.current.getMessages(conversationId, offset, limit);
    },
    { manual: true }
  );

  const { execute: saveMessage } = useAPI(
    async (message: ChatMessage) => {
      return chatService.current.saveMessage(message);
    },
    { manual: true }
  );

  const { execute: loadConversations } = useAPI(
    async () => {
      return chatService.current.getConversations();
    },
    { enabled: persistConversations }
  );

  // Rate limiting check
  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    
    // Reset counter if minute has passed
    if (now >= messageCountRef.current.resetTime) {
      messageCountRef.current = { count: 0, resetTime: now + 60000 };
    }
    
    // Check message frequency
    if (now - lastMessageTimeRef.current < rateLimitMs) {
      return false;
    }
    
    // Check messages per minute
    if (messageCountRef.current.count >= maxMessagesPerMinute) {
      return false;
    }
    
    return true;
  }, [rateLimitMs, maxMessagesPerMinute]);

  // Handle WebSocket messages
  function handleSocketMessage(data: any) {
    try {
      switch (data.type) {
        case 'message':
          handleIncomingMessage(data.payload);
          break;
        case 'typing':
          handleTypingUpdate(data.payload);
          break;
        case 'conversation_update':
          handleConversationUpdate(data.payload);
          break;
        case 'message_status':
          handleMessageStatusUpdate(data.payload);
          break;
        case 'error':
          onError?.(new Error(data.payload.message));
          break;
        default:
          console.warn('Unknown socket message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling socket message:', error);
      onError?.(error as Error);
    }
  }

  // Handle incoming message
  const handleIncomingMessage = useCallback((messageData: any) => {
    const message: ChatMessage = {
      ...messageData,
      timestamp: new Date(messageData.timestamp),
      status: 'delivered'
    };
    
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message].slice(-maxMessageHistory),
      lastMessageTimestamp: message.timestamp
    }));
    
    onMessageReceived?.(message);
    
    // Save to persistence if enabled
    if (persistMessages) {
      saveMessage(message);
    }
  }, [maxMessageHistory, persistMessages, onMessageReceived]);

  // Handle typing indicators
  const handleTypingUpdate = useCallback((typingData: any) => {
    setState(prev => ({
      ...prev,
      typingIndicators: typingData.indicators.map((indicator: any) => ({
        ...indicator,
        timestamp: new Date(indicator.timestamp)
      }))
    }));
    
    onTypingUpdate?.(state.typingIndicators);
  }, [onTypingUpdate, state.typingIndicators]);

  // Handle conversation updates
  const handleConversationUpdate = useCallback((conversationData: any) => {
    const conversation: ChatConversation = {
      ...conversationData,
      createdAt: new Date(conversationData.createdAt),
      updatedAt: new Date(conversationData.updatedAt)
    };
    
    setState(prev => ({
      ...prev,
      conversations: prev.conversations.map(c => 
        c.id === conversation.id ? conversation : c
      ),
      currentConversation: prev.currentConversation?.id === conversation.id 
        ? conversation 
        : prev.currentConversation
    }));
    
    onConversationUpdate?.(conversation);
  }, [onConversationUpdate]);

  // Handle message status updates
  const handleMessageStatusUpdate = useCallback((statusData: any) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === statusData.messageId 
          ? { ...msg, status: statusData.status }
          : msg
      )
    }));
  }, []);

  // Generate unique message ID
  const generateMessageId = useCallback(() => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Send message
  const sendMessage = useCallback(async (
    content: string, 
    type: ChatMessage['type'] = 'user'
  ): Promise<ChatMessage> => {
    if (!checkRateLimit()) {
      throw new Error('Rate limit exceeded');
    }
    
    if (!state.currentConversation) {
      throw new Error('No active conversation');
    }
    
    const messageId = generateMessageId();
    const message: ChatMessage = {
      id: messageId,
      content,
      type,
      timestamp: new Date(),
      author: 'user',
      conversationId: state.currentConversation.id,
      status: 'sending',
      optimistic: true
    };
    
    // Add optimistic message
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }));
    
    try {
      // Send via WebSocket
      if (isConnected) {
        sendJsonMessage({
          type: 'send_message',
          payload: message
        });
      }
      
      // Update rate limiting
      messageCountRef.current.count++;
      lastMessageTimeRef.current = Date.now();
      
      // Update message status
      const sentMessage = { ...message, status: 'sent' as const, optimistic: false };
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === messageId ? sentMessage : msg
        )
      }));
      
      onMessageSent?.(sentMessage);
      
      // Save to persistence
      if (persistMessages) {
        await saveMessage(sentMessage);
      }
      
      return sentMessage;
    } catch (error) {
      // Handle send failure
      const failedMessage = { ...message, status: 'failed' as const };
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === messageId ? failedMessage : msg
        )
      }));
      
      onMessageFailed?.(failedMessage, error as Error);
      throw error;
    }
  }, [state.currentConversation, isConnected, checkRateLimit, generateMessageId, sendJsonMessage, persistMessages, onMessageSent, onMessageFailed]);

  // Send AI message
  const sendAIMessage = useCallback(async (content: string, context?: any): Promise<ChatMessage> => {
    if (!enableAI) {
      throw new Error('AI functionality is disabled');
    }
    
    // Send user message first
    await sendMessage(content, 'user');
    
    try {
      // Get AI response
      const aiResponse = await chatService.current.generateResponse(content, {
        model: aiModel,
        agent,
        context: { ...aiContext, ...context },
        conversationId: state.currentConversation?.id
      });
      
      // Create AI message
      const aiMessage: ChatMessage = {
        id: generateMessageId(),
        content: aiResponse.content,
        type: 'ai',
        timestamp: new Date(),
        author: agent,
        conversationId: state.currentConversation!.id,
        status: 'delivered',
        metadata: {
          agent,
          model: aiModel,
          tokens: aiResponse.tokens,
          confidence: aiResponse.confidence,
          sources: aiResponse.sources
        }
      };
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage]
      }));
      
      onMessageReceived?.(aiMessage);
      
      // Save to persistence
      if (persistMessages) {
        await saveMessage(aiMessage);
      }
      
      return aiMessage;
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: generateMessageId(),
        content: `Error: ${(error as Error).message}`,
        type: 'error',
        timestamp: new Date(),
        author: 'system',
        conversationId: state.currentConversation!.id,
        status: 'delivered'
      };
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage]
      }));
      
      throw error;
    }
  }, [enableAI, sendMessage, aiModel, agent, aiContext, state.currentConversation, generateMessageId, persistMessages, onMessageReceived]);

  // Create conversation
  const createConversation = useCallback(async (
    title: string,
    type: ChatConversation['type'],
    agentType: string
  ): Promise<ChatConversation> => {
    const conversation: ChatConversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      type,
      agent: agentType,
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0,
      isActive: true
    };
    
    setState(prev => ({
      ...prev,
      conversations: [...prev.conversations, conversation],
      currentConversation: conversation,
      messages: []
    }));
    
    // Save to persistence
    if (persistConversations) {
      await chatService.current.saveConversation(conversation);
    }
    
    return conversation;
  }, [persistConversations]);

  // Switch conversation
  const switchConversation = useCallback(async (conversationId: string) => {
    const conversation = state.conversations.find(c => c.id === conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    setState(prev => ({
      ...prev,
      currentConversation: conversation,
      messages: [],
      hasMore: true
    }));
    
    // Load messages for this conversation
    try {
      const messages = await loadMessages(conversationId);
      setState(prev => ({
        ...prev,
        messages: messages.reverse(), // Latest first
        hasMore: messages.length === messagePageSize
      }));
    } catch (error) {
      console.error('Failed to load conversation messages:', error);
    }
  }, [state.conversations, loadMessages, messagePageSize]);

  // Set typing status
  const setTyping = useCallback((isTyping: boolean) => {
    setState(prev => ({ ...prev, isTyping }));
    
    if (enableTypingIndicators && isConnected) {
      sendJsonMessage({
        type: 'typing',
        payload: {
          isTyping,
          conversationId: state.currentConversation?.id
        }
      });
    }
  }, [enableTypingIndicators, isConnected, sendJsonMessage, state.currentConversation]);

  // Load more messages
  const loadMoreMessages = useCallback(async () => {
    if (!state.currentConversation || !state.hasMore || isLoadingMessages) {
      return;
    }
    
    try {
      const olderMessages = await loadMessages(
        state.currentConversation.id,
        state.messages.length,
        messagePageSize
      );
      
      setState(prev => ({
        ...prev,
        messages: [...olderMessages.reverse(), ...prev.messages],
        hasMore: olderMessages.length === messagePageSize
      }));
    } catch (error) {
      console.error('Failed to load more messages:', error);
    }
  }, [state.currentConversation, state.hasMore, state.messages.length, isLoadingMessages, loadMessages, messagePageSize]);

  // Clear history
  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
      hasMore: true
    }));
  }, []);

  // Export conversation
  const exportConversation = useCallback((format: 'json' | 'txt' | 'md'): string => {
    const conversation = state.currentConversation;
    const messages = state.messages;
    
    if (!conversation) {
      throw new Error('No active conversation to export');
    }
    
    switch (format) {
      case 'json':
        return JSON.stringify({ conversation, messages }, null, 2);
      
      case 'txt':
        return messages.map(msg => 
          `[${msg.timestamp.toLocaleString()}] ${msg.author}: ${msg.content}`
        ).join('\n');
      
      case 'md':
        let markdown = `# ${conversation.title}\n\n`;
        markdown += `**Agent**: ${conversation.agent}\n`;
        markdown += `**Created**: ${conversation.createdAt.toLocaleString()}\n\n`;
        markdown += '---\n\n';
        
        messages.forEach(msg => {
          markdown += `**${msg.author}** _(${msg.timestamp.toLocaleString()})_\n\n`;
          markdown += `${msg.content}\n\n`;
        });
        
        return markdown;
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }, [state.currentConversation, state.messages]);

  // Initialize conversation on mount
  useEffect(() => {
    if (initialConversationId) {
      switchConversation(initialConversationId);
    }
  }, [initialConversationId, switchConversation]);

  return {
    // Message state
    messages: state.messages,
    isLoading: isLoadingMessages,
    isConnected,
    hasMore: state.hasMore,
    
    // Conversation state
    conversation: state.currentConversation,
    conversations: state.conversations,
    
    // Typing and presence
    typingIndicators: state.typingIndicators,
    isTyping: state.isTyping,
    
    // Actions
    sendMessage,
    sendAIMessage,
    editMessage: async () => { throw new Error('Not implemented'); },
    deleteMessage: async () => { throw new Error('Not implemented'); },
    retryMessage: async () => { throw new Error('Not implemented'); },
    
    // Conversation management
    createConversation,
    switchConversation,
    deleteConversation: async () => { throw new Error('Not implemented'); },
    updateConversation: async () => { throw new Error('Not implemented'); },
    
    // History management
    loadMoreMessages,
    clearHistory,
    exportConversation,
    
    // Typing and presence
    setTyping,
    
    // Connection management
    connect: connectSocket,
    disconnect: disconnectSocket,
    reconnect: reconnectSocket
  };
}
