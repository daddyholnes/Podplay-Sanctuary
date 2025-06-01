/**
 * @fileoverview Chat slice for Redux store
 * @version 1.0.0
 * @author Podplay Sanctuary Team
 * 
 * Manages chat state including:
 * - Active conversations and message history
 * - AI assistant interactions
 * - Real-time message updates
 * - Chat settings and preferences
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ChatService } from '../../services/ai/ChatService';
import { SessionManager } from '../../services/storage/SessionManager';

/**
 * Chat message interface
 */
export interface ChatMessage {
  id: string;
  conversationId: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: number;
  metadata?: {
    model?: string;
    tokens?: number;
    cost?: number;
    context?: string[];
    attachments?: string[];
  };
  status: 'sending' | 'sent' | 'delivered' | 'error';
  error?: string;
}

/**
 * Chat conversation interface
 */
export interface ChatConversation {
  id: string;
  title: string;
  summary?: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  lastMessage?: ChatMessage;
  settings: {
    model: string;
    temperature: number;
    maxTokens: number;
    systemPrompt?: string;
  };
  tags: string[];
  archived: boolean;
}

/**
 * Chat state interface
 */
export interface ChatState {
  // Active conversation
  activeConversationId: string | null;
  conversations: Record<string, ChatConversation>;
  messages: Record<string, ChatMessage[]>;
  
  // UI state
  isLoading: boolean;
  isTyping: boolean;
  typingIndicator: string | null;
  
  // Message composition
  messageInput: string;
  attachments: string[];
  
  // Settings
  settings: {
    autoSave: boolean;
    soundEnabled: boolean;
    showTimestamps: boolean;
    compactMode: boolean;
    maxHistoryDays: number;
  };
  
  // Search and filters
  searchQuery: string;
  filteredMessages: string[];
  
  // Error handling
  error: string | null;
  retryQueue: string[];
  
  // Performance metrics
  metrics: {
    totalMessages: number;
    totalConversations: number;
    avgResponseTime: number;
    tokensUsed: number;
  };
}

/**
 * Initial state
 */
const initialState: ChatState = {
  activeConversationId: null,
  conversations: {},
  messages: {},
  
  isLoading: false,
  isTyping: false,
  typingIndicator: null,
  
  messageInput: '',
  attachments: [],
  
  settings: {
    autoSave: true,
    soundEnabled: true,
    showTimestamps: true,
    compactMode: false,
    maxHistoryDays: 30,
  },
  
  searchQuery: '',
  filteredMessages: [],
  
  error: null,
  retryQueue: [],
  
  metrics: {
    totalMessages: 0,
    totalConversations: 0,
    avgResponseTime: 0,
    tokensUsed: 0,
  },
};

/**
 * Async thunks for chat operations
 */

// Send message to AI assistant
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (payload: {
    content: string;
    conversationId?: string;
    attachments?: string[];
  }, { getState, rejectWithValue }) => {
    try {
      const chatService = ChatService.getInstance();
      const response = await chatService.sendMessage(
        payload.content,
        payload.conversationId,
        payload.attachments
      );
      
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to send message');
    }
  }
);

// Load conversation history
export const loadConversation = createAsyncThunk(
  'chat/loadConversation',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const sessionManager = SessionManager.getInstance();
      const conversation = await sessionManager.loadConversation(conversationId);
      const messages = await sessionManager.loadMessages(conversationId);
      
      return { conversation, messages };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load conversation');
    }
  }
);

// Create new conversation
export const createConversation = createAsyncThunk(
  'chat/createConversation',
  async (payload: {
    title?: string;
    systemPrompt?: string;
    model?: string;
  }, { rejectWithValue }) => {
    try {
      const chatService = ChatService.getInstance();
      const conversation = await chatService.createConversation(payload);
      
      return conversation;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create conversation');
    }
  }
);

// Delete conversation
export const deleteConversation = createAsyncThunk(
  'chat/deleteConversation',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const sessionManager = SessionManager.getInstance();
      await sessionManager.deleteConversation(conversationId);
      
      return conversationId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete conversation');
    }
  }
);

// Search messages
export const searchMessages = createAsyncThunk(
  'chat/searchMessages',
  async (query: string, { getState }) => {
    const state = getState() as { chat: ChatState };
    const allMessages = Object.values(state.chat.messages).flat();
    
    if (!query.trim()) {
      return [];
    }
    
    return allMessages
      .filter(message => 
        message.content.toLowerCase().includes(query.toLowerCase()) ||
        message.metadata?.context?.some(ctx => 
          ctx.toLowerCase().includes(query.toLowerCase())
        )
      )
      .map(message => message.id);
  }
);

/**
 * Chat slice
 */
export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Message input management
    setMessageInput: (state, action: PayloadAction<string>) => {
      state.messageInput = action.payload;
    },
    
    clearMessageInput: (state) => {
      state.messageInput = '';
      state.attachments = [];
    },
    
    // Attachment management
    addAttachment: (state, action: PayloadAction<string>) => {
      if (!state.attachments.includes(action.payload)) {
        state.attachments.push(action.payload);
      }
    },
    
    removeAttachment: (state, action: PayloadAction<string>) => {
      state.attachments = state.attachments.filter(
        attachment => attachment !== action.payload
      );
    },
    
    clearAttachments: (state) => {
      state.attachments = [];
    },
    
    // Conversation management
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversationId = action.payload;
      state.error = null;
    },
    
    updateConversationTitle: (state, action: PayloadAction<{
      conversationId: string;
      title: string;
    }>) => {
      const { conversationId, title } = action.payload;
      if (state.conversations[conversationId]) {
        state.conversations[conversationId].title = title;
        state.conversations[conversationId].updatedAt = Date.now();
      }
    },
    
    archiveConversation: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      if (state.conversations[conversationId]) {
        state.conversations[conversationId].archived = true;
        
        // Switch to another conversation if this was active
        if (state.activeConversationId === conversationId) {
          const activeConversations = Object.values(state.conversations)
            .filter(conv => !conv.archived)
            .sort((a, b) => b.updatedAt - a.updatedAt);
          
          state.activeConversationId = activeConversations[0]?.id || null;
        }
      }
    },
    
    unarchiveConversation: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      if (state.conversations[conversationId]) {
        state.conversations[conversationId].archived = false;
      }
    },
    
    // Real-time indicators
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    
    setTypingIndicator: (state, action: PayloadAction<string | null>) => {
      state.typingIndicator = action.payload;
    },
    
    // Settings
    updateSettings: (state, action: PayloadAction<Partial<ChatState['settings']>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    
    // Search
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    
    clearSearch: (state) => {
      state.searchQuery = '';
      state.filteredMessages = [];
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null;
    },
    
    addToRetryQueue: (state, action: PayloadAction<string>) => {
      if (!state.retryQueue.includes(action.payload)) {
        state.retryQueue.push(action.payload);
      }
    },
    
    removeFromRetryQueue: (state, action: PayloadAction<string>) => {
      state.retryQueue = state.retryQueue.filter(id => id !== action.payload);
    },
    
    // Message status updates
    updateMessageStatus: (state, action: PayloadAction<{
      messageId: string;
      status: ChatMessage['status'];
      error?: string;
    }>) => {
      const { messageId, status, error } = action.payload;
      
      // Find and update message in all conversations
      Object.values(state.messages).forEach(messages => {
        const message = messages.find(msg => msg.id === messageId);
        if (message) {
          message.status = status;
          if (error) message.error = error;
        }
      });
    },
    
    // Metrics
    updateMetrics: (state, action: PayloadAction<Partial<ChatState['metrics']>>) => {
      state.metrics = { ...state.metrics, ...action.payload };
    },
  },
  
  extraReducers: (builder) => {
    // Send message
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        
        const { userMessage, assistantMessage, conversationId } = action.payload;
        
        // Update or create conversation
        if (!state.conversations[conversationId]) {
          // This shouldn't happen, but handle gracefully
          return;
        }
        
        // Add messages
        if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }
        
        state.messages[conversationId].push(userMessage, assistantMessage);
        
        // Update conversation
        state.conversations[conversationId].lastMessage = assistantMessage;
        state.conversations[conversationId].messageCount += 2;
        state.conversations[conversationId].updatedAt = Date.now();
        
        // Clear input
        state.messageInput = '';
        state.attachments = [];
        
        // Update metrics
        state.metrics.totalMessages += 2;
        if (assistantMessage.metadata?.tokens) {
          state.metrics.tokensUsed += assistantMessage.metadata.tokens;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Load conversation
    builder
      .addCase(loadConversation.fulfilled, (state, action) => {
        const { conversation, messages } = action.payload;
        
        state.conversations[conversation.id] = conversation;
        state.messages[conversation.id] = messages;
      })
      .addCase(loadConversation.rejected, (state, action) => {
        state.error = action.payload as string;
      });
    
    // Create conversation
    builder
      .addCase(createConversation.fulfilled, (state, action) => {
        const conversation = action.payload;
        
        state.conversations[conversation.id] = conversation;
        state.messages[conversation.id] = [];
        state.activeConversationId = conversation.id;
        
        state.metrics.totalConversations += 1;
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.error = action.payload as string;
      });
    
    // Delete conversation
    builder
      .addCase(deleteConversation.fulfilled, (state, action) => {
        const conversationId = action.payload;
        
        delete state.conversations[conversationId];
        delete state.messages[conversationId];
        
        if (state.activeConversationId === conversationId) {
          state.activeConversationId = null;
        }
        
        state.metrics.totalConversations -= 1;
      })
      .addCase(deleteConversation.rejected, (state, action) => {
        state.error = action.payload as string;
      });
    
    // Search messages
    builder
      .addCase(searchMessages.fulfilled, (state, action) => {
        state.filteredMessages = action.payload;
      });
  },
});

// Export actions
export const {
  setMessageInput,
  clearMessageInput,
  addAttachment,
  removeAttachment,
  clearAttachments,
  setActiveConversation,
  updateConversationTitle,
  archiveConversation,
  unarchiveConversation,
  setTyping,
  setTypingIndicator,
  updateSettings,
  setSearchQuery,
  clearSearch,
  clearError,
  addToRetryQueue,
  removeFromRetryQueue,
  updateMessageStatus,
  updateMetrics,
} = chatSlice.actions;

// Export selectors
export const selectActiveConversation = (state: { chat: ChatState }) => {
  const { activeConversationId, conversations } = state.chat;
  return activeConversationId ? conversations[activeConversationId] : null;
};

export const selectActiveMessages = (state: { chat: ChatState }) => {
  const { activeConversationId, messages } = state.chat;
  return activeConversationId ? messages[activeConversationId] || [] : [];
};

export const selectConversationsByDate = (state: { chat: ChatState }) => {
  return Object.values(state.chat.conversations)
    .filter(conv => !conv.archived)
    .sort((a, b) => b.updatedAt - a.updatedAt);
};

export const selectArchivedConversations = (state: { chat: ChatState }) => {
  return Object.values(state.chat.conversations)
    .filter(conv => conv.archived)
    .sort((a, b) => b.updatedAt - a.updatedAt);
};

export const selectSearchResults = (state: { chat: ChatState }) => {
  const { filteredMessages, messages } = state.chat;
  return filteredMessages
    .map(messageId => {
      // Find message in all conversations
      for (const conversationMessages of Object.values(messages)) {
        const message = conversationMessages.find(msg => msg.id === messageId);
        if (message) return message;
      }
      return null;
    })
    .filter(Boolean) as ChatMessage[];
};

export const selectChatStats = (state: { chat: ChatState }) => {
  const { conversations, messages, metrics } = state.chat;
  
  const totalMessages = Object.values(messages).reduce(
    (sum, msgs) => sum + msgs.length, 0
  );
  
  const activeConversations = Object.values(conversations)
    .filter(conv => !conv.archived).length;
  
  const archivedConversations = Object.values(conversations)
    .filter(conv => conv.archived).length;
  
  return {
    ...metrics,
    totalMessages,
    activeConversations,
    archivedConversations,
  };
};

// Export reducer
export default chatSlice.reducer;
