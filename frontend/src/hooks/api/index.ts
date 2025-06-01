/**
 * API Hooks Barrel Export
 * 
 * Centralized exports for all API-related React hooks
 * Provides clean imports: import { useAPI, useSocket, useNotifications } from '@/hooks/api'
 */

// Core API hooks
export { default as useAPI } from './useAPI';
export { default as useSocket } from './useSocket';
export { default as useNotifications } from './useNotifications';

// Re-export types for convenience
export type {
  UseAPIOptions,
  UseAPIResult
} from './useAPI';

export type {
  Notification,
  NotificationAction,
  NotificationPreferences,
  NotificationQueue,
  UseNotificationsOptions,
  UseNotificationsResult
} from './useNotifications';
