/**
 * Chat State Selectors
 * 
 * Specialized selectors for chat functionality including conversations,
 * messages, AI interactions, and real-time communication state.
 * Optimized with memoization for performance.
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import type { 
  ChatState, 
  Conversation, 
  Message, 
  AIModel, 
  ChatSettings,
  MessageFilter,
  ConversationFilter
} from '../slices/chatSlice';

// Base chat selector
export const selectChat = (state: RootState): ChatState => state.chat;

// Conversation selectors
export const selectConversations = createSelector(
  [selectChat],
  (chat) => chat.conversations
);

export const selectActiveConversationId = createSelector(
  [selectChat],
  (chat) => chat.activeConversationId
);

export const selectActiveConversation = createSelector(
  [selectConversations, selectActiveConversationId],
  (conversations, activeId) => 
    activeId ? conversations.find(conv => conv.id === activeId) || null : null
);

export const selectConversationById = createSelector(
  [selectConversations, (_: RootState, conversationId: string) => conversationId],
  (conversations, conversationId) => 
    conversations.find(conv => conv.id === conversationId) || null
);

export const selectRecentConversations = createSelector(
  [selectConversations],
  (conversations) => 
    [...conversations]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 10)
);

export const selectFavoriteConversations = createSelector(
  [selectConversations],
  (conversations) => conversations.filter(conv => conv.isFavorite)
);

export const selectArchivedConversations = createSelector(
  [selectConversations],
  (conversations) => conversations.filter(conv => conv.isArchived)
);

export const selectConversationsByTag = createSelector(
  [selectConversations, (_: RootState, tag: string) => tag],
  (conversations, tag) => 
    conversations.filter(conv => conv.tags.includes(tag))
);

// Message selectors
export const selectMessages = createSelector(
  [selectChat],
  (chat) => chat.messages
);

export const selectActiveConversationMessages = createSelector(
  [selectMessages, selectActiveConversationId],
  (messages, activeConversationId) => 
    activeConversationId 
      ? messages.filter(msg => msg.conversationId === activeConversationId)
          .sort((a, b) => a.timestamp - b.timestamp)
      : []
);

export const selectMessagesByConversationId = createSelector(
  [selectMessages, (_: RootState, conversationId: string) => conversationId],
  (messages, conversationId) => 
    messages.filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => a.timestamp - b.timestamp)
);

export const selectLastMessage = createSelector(
  [selectActiveConversationMessages],
  (messages) => messages[messages.length - 1] || null
);

export const selectUnreadMessages = createSelector(
  [selectMessages],
  (messages) => messages.filter(msg => !msg.isRead)
);

export const selectMessagesByType = createSelector(
  [selectActiveConversationMessages, (_: RootState, type: string) => type],
  (messages, type) => messages.filter(msg => msg.type === type)
);

export const selectMessagesWithAttachments = createSelector(
  [selectActiveConversationMessages],
  (messages) => messages.filter(msg => msg.attachments && msg.attachments.length > 0)
);

// AI Model selectors
export const selectAIModels = createSelector(
  [selectChat],
  (chat) => chat.aiModels
);

export const selectActiveAIModel = createSelector(
  [selectAIModels, selectChat],
  (models, chat) => 
    models.find(model => model.id === chat.activeModelId) || models[0] || null
);

export const selectAvailableAIModels = createSelector(
  [selectAIModels],
  (models) => models.filter(model => model.isAvailable)
);

export const selectAIModelsByProvider = createSelector(
  [selectAIModels, (_: RootState, provider: string) => provider],
  (models, provider) => models.filter(model => model.provider === provider)
);

export const selectAIModelCapabilities = createSelector(
  [selectActiveAIModel],
  (activeModel) => activeModel ? activeModel.capabilities : []
);

// Chat settings selectors
export const selectChatSettings = createSelector(
  [selectChat],
  (chat) => chat.settings
);

export const selectAutoSave = createSelector(
  [selectChatSettings],
  (settings) => settings.autoSave
);

export const selectNotificationSettings = createSelector(
  [selectChatSettings],
  (settings) => settings.notifications
);

export const selectAISettings = createSelector(
  [selectChatSettings],
  (settings) => settings.ai
);

export const selectUISettings = createSelector(
  [selectChatSettings],
  (settings) => settings.ui
);

// Filter selectors
export const selectMessageFilter = createSelector(
  [selectChat],
  (chat) => chat.messageFilter
);

export const selectConversationFilter = createSelector(
  [selectChat],
  (chat) => chat.conversationFilter
);

export const selectFilteredMessages = createSelector(
  [selectActiveConversationMessages, selectMessageFilter],
  (messages, filter) => {
    if (!filter) return messages;
    
    let filtered = messages;
    
    if (filter.type) {
      filtered = filtered.filter(msg => msg.type === filter.type);
    }
    
    if (filter.sender) {
      filtered = filtered.filter(msg => msg.sender === filter.sender);
    }
    
    if (filter.dateRange) {
      const { start, end } = filter.dateRange;
      filtered = filtered.filter(msg => 
        msg.timestamp >= start && msg.timestamp <= end
      );
    }
    
    if (filter.hasAttachments !== undefined) {
      filtered = filtered.filter(msg => 
        Boolean(msg.attachments?.length) === filter.hasAttachments
      );
    }
    
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filtered = filtered.filter(msg => 
        msg.content.toLowerCase().includes(query) ||
        msg.metadata?.title?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }
);

export const selectFilteredConversations = createSelector(
  [selectConversations, selectConversationFilter],
  (conversations, filter) => {
    if (!filter) return conversations;
    
    let filtered = conversations;
    
    if (filter.tags?.length) {
      filtered = filtered.filter(conv => 
        filter.tags!.some(tag => conv.tags.includes(tag))
      );
    }
    
    if (filter.isFavorite !== undefined) {
      filtered = filtered.filter(conv => conv.isFavorite === filter.isFavorite);
    }
    
    if (filter.isArchived !== undefined) {
      filtered = filtered.filter(conv => conv.isArchived === filter.isArchived);
    }
    
    if (filter.dateRange) {
      const { start, end } = filter.dateRange;
      filtered = filtered.filter(conv => 
        conv.updatedAt >= start && conv.updatedAt <= end
      );
    }
    
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filtered = filtered.filter(conv => 
        conv.title.toLowerCase().includes(query) ||
        conv.summary?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }
);

// Status selectors
export const selectChatLoading = createSelector(
  [selectChat],
  (chat) => chat.loading
);

export const selectChatErrors = createSelector(
  [selectChat],
  (chat) => chat.errors
);

export const selectTypingUsers = createSelector(
  [selectChat],
  (chat) => chat.typingUsers
);

export const selectConnectionStatus = createSelector(
  [selectChat],
  (chat) => chat.connectionStatus
);

export const selectLastUpdate = createSelector(
  [selectChat],
  (chat) => chat.lastUpdate
);

// Composite selectors
export const selectChatMetrics = createSelector(
  [selectConversations, selectMessages, selectUnreadMessages],
  (conversations, messages, unreadMessages) => ({
    totalConversations: conversations.length,
    totalMessages: messages.length,
    unreadCount: unreadMessages.length,
    favoriteCount: conversations.filter(c => c.isFavorite).length,
    archivedCount: conversations.filter(c => c.isArchived).length,
    averageMessagesPerConversation: conversations.length > 0 
      ? Math.round(messages.length / conversations.length) 
      : 0
  })
);

export const selectChatStatus = createSelector(
  [selectChatLoading, selectChatErrors, selectConnectionStatus, selectTypingUsers],
  (loading, errors, connectionStatus, typingUsers) => ({
    isLoading: Object.values(loading).some(Boolean),
    hasErrors: errors.length > 0,
    isConnected: connectionStatus === 'connected',
    hasTypingUsers: typingUsers.length > 0,
    isHealthy: errors.length === 0 && connectionStatus === 'connected'
  })
);

export const selectConversationStats = createSelector(
  [selectActiveConversation, selectActiveConversationMessages],
  (conversation, messages) => {
    if (!conversation) return null;
    
    const userMessages = messages.filter(m => m.sender === 'user');
    const aiMessages = messages.filter(m => m.sender === 'ai');
    const systemMessages = messages.filter(m => m.sender === 'system');
    
    return {
      id: conversation.id,
      title: conversation.title,
      messageCount: messages.length,
      userMessageCount: userMessages.length,
      aiMessageCount: aiMessages.length,
      systemMessageCount: systemMessages.length,
      duration: messages.length > 0 
        ? messages[messages.length - 1].timestamp - messages[0].timestamp 
        : 0,
      lastActivity: conversation.updatedAt,
      hasAttachments: messages.some(m => m.attachments?.length),
      isActive: true
    };
  }
);

export const selectChatActivity = createSelector(
  [selectMessages, selectConversations],
  (messages, conversations) => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    return {
      todayMessages: messages.filter(m => m.timestamp > now - oneDay).length,
      todayConversations: conversations.filter(c => c.updatedAt > now - oneDay).length,
      lastActivity: Math.max(
        ...messages.map(m => m.timestamp),
        ...conversations.map(c => c.updatedAt),
        0
      ),
      activeConversations: conversations.filter(c => 
        c.updatedAt > now - 7 * oneDay && !c.isArchived
      ).length
    };
  }
);

export const selectChatPerformance = createSelector(
  [selectMessages, selectConversations, selectAIModels],
  (messages, conversations, aiModels) => ({
    messageProcessingSpeed: calculateMessageProcessingSpeed(messages),
    conversationLoadTime: calculateConversationLoadTime(conversations),
    aiResponseTime: calculateAIResponseTime(messages),
    modelSwitchTime: calculateModelSwitchTime(aiModels),
    optimizationScore: calculateChatOptimizationScore(messages, conversations)
  })
);

// Helper functions for performance calculations
function calculateMessageProcessingSpeed(messages: Message[]): number {
  // Simplified calculation - in practice, this would track actual processing times
  return messages.length > 100 ? 850 : 950; // ms
}

function calculateConversationLoadTime(conversations: Conversation[]): number {
  return conversations.length > 50 ? 120 : 80; // ms
}

function calculateAIResponseTime(messages: Message[]): number {
  const aiMessages = messages.filter(m => m.sender === 'ai');
  if (aiMessages.length === 0) return 0;
  
  // Simplified calculation
  return aiMessages.length > 100 ? 2500 : 1800; // ms
}

function calculateModelSwitchTime(aiModels: AIModel[]): number {
  return aiModels.length > 5 ? 300 : 150; // ms
}

function calculateChatOptimizationScore(
  messages: Message[], 
  conversations: Conversation[]
): number {
  let score = 100;
  
  // Reduce score for large datasets
  if (messages.length > 1000) score -= 10;
  if (conversations.length > 100) score -= 5;
  
  // Reduce score for old unread messages
  const oldUnread = messages.filter(m => 
    !m.isRead && Date.now() - m.timestamp > 24 * 60 * 60 * 1000
  );
  score -= oldUnread.length * 2;
  
  return Math.max(0, Math.min(100, score));
}

// Export all selectors
export default {
  // Base
  selectChat,
  
  // Conversations
  selectConversations,
  selectActiveConversationId,
  selectActiveConversation,
  selectConversationById,
  selectRecentConversations,
  selectFavoriteConversations,
  selectArchivedConversations,
  selectConversationsByTag,
  
  // Messages
  selectMessages,
  selectActiveConversationMessages,
  selectMessagesByConversationId,
  selectLastMessage,
  selectUnreadMessages,
  selectMessagesByType,
  selectMessagesWithAttachments,
  
  // AI Models
  selectAIModels,
  selectActiveAIModel,
  selectAvailableAIModels,
  selectAIModelsByProvider,
  selectAIModelCapabilities,
  
  // Settings
  selectChatSettings,
  selectAutoSave,
  selectNotificationSettings,
  selectAISettings,
  selectUISettings,
  
  // Filters
  selectMessageFilter,
  selectConversationFilter,
  selectFilteredMessages,
  selectFilteredConversations,
  
  // Status
  selectChatLoading,
  selectChatErrors,
  selectTypingUsers,
  selectConnectionStatus,
  selectLastUpdate,
  
  // Composite
  selectChatMetrics,
  selectChatStatus,
  selectConversationStats,
  selectChatActivity,
  selectChatPerformance
};
