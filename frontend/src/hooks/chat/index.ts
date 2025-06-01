/**
 * Chat Hooks Barrel Export
 * 
 * Centralized exports for all chat-related React hooks
 * Provides clean imports: import { useChat, useChatHistory } from '@/hooks/chat'
 */

// Core chat hooks
export { default as useChat } from './useChat';
export { default as useChatHistory } from './useChatHistory';

// Re-export types for convenience
export type {
  UseChatOptions,
  UseChatResult
} from './useChat';

export type {
  ConversationHistory,
  HistoricalMessage,
  SearchFilters,
  ConversationStats,
  ExportOptions,
  UseChatHistoryOptions,
  UseChatHistoryResult
} from './useChatHistory';
