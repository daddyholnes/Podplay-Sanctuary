/**
 * Root Reducer
 * 
 * Combines all individual slice reducers into a single root reducer
 * for the Redux store. This is the main reducer that manages the
 * entire application state tree.
 */

import { combineReducers } from '@reduxjs/toolkit';

// Import all slice reducers
import chatReducer from './slices/chatSlice';
import workspaceReducer from './slices/workspaceSlice';
import scoutReducer from './slices/scoutSlice';
import mcpReducer from './slices/mcpSlice';
import uiReducer from './slices/uiSlice';

/**
 * Root reducer that combines all slice reducers
 * 
 * This creates the main state structure:
 * {
 *   chat: ChatState,
 *   workspace: WorkspaceState,
 *   scout: ScoutState,
 *   mcp: MCPState,
 *   ui: UIState
 * }
 */
export const rootReducer = combineReducers({
  // Chat functionality - conversations, messages, AI interactions
  chat: chatReducer,
  
  // Workspace management - projects, files, Git operations
  workspace: workspaceReducer,
  
  // AI-powered code analysis and insights
  scout: scoutReducer,
  
  // Model Context Protocol server management
  mcp: mcpReducer,
  
  // UI state - theme, layout, notifications, modals
  ui: uiReducer,
});

// Export the root state type for use throughout the application
export type RootState = ReturnType<typeof rootReducer>;

// Export individual slice types for convenience
export type {
  ChatState,
  Conversation,
  Message,
  AIModel,
  ChatSettings
} from './slices/chatSlice';

export type {
  WorkspaceState,
  Project,
  FileItem,
  GitStatus,
  WorkspaceSettings
} from './slices/workspaceSlice';

export type {
  ScoutState,
  Analysis,
  Insight,
  Suggestion,
  CodeMetrics,
  ScoutSettings
} from './slices/scoutSlice';

export type {
  MCPState,
  MCPServer,
  MCPConnection,
  MCPTool,
  MCPResource,
  MCPSettings
} from './slices/mcpSlice';

export type {
  UIState,
  ThemeConfig,
  LayoutConfig,
  NotificationState,
  ModalState,
  AccessibilitySettings
} from './slices/uiSlice';

// Default export
export default rootReducer;
