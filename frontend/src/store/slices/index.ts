/**
 * Slices Index
 * 
 * Barrel export for all slice modules
 */

// UI Slice
export { default as uiReducer } from './uiSlice';
export * from './uiSlice';

// Chat Slice
export { default as chatReducer } from './chatSlice';
export * from './chatSlice';

// Workspace Slice
export { default as workspaceReducer } from './workspaceSlice';
export * from './workspaceSlice';

// Scout Slice
export { default as scoutReducer } from './scoutSlice';
export * from './scoutSlice';

// MCP Slice
export { default as mcpReducer } from './mcpSlice';
export * from './mcpSlice';
