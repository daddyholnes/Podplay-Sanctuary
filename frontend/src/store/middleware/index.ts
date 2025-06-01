/**
 * Middleware Index
 * 
 * Barrel export for all middleware modules
 */

export { default as apiMiddleware, enhancedApiMiddleware } from './apiMiddleware';
export { default as socketMiddleware } from './socketMiddleware';
export { default as errorMiddleware } from './errorMiddleware';
export { default as loggingMiddleware } from './loggingMiddleware';

// Re-export action creators
export {
  createApiAction,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  invalidateCache,
} from './apiMiddleware';

export {
  connectSocket,
  disconnectSocket,
  emitSocketEvent,
  subscribeToEvent,
  unsubscribeFromEvent,
  getSocketConnectionStatus,
  clearMessageQueue,
  getQueuedMessageCount,
} from './socketMiddleware';

export {
  createErrorAction,
  getErrorStats,
  getErrorReports,
  clearErrorReports,
  setErrorReporting,
  setRecoveryStrategy,
} from './errorMiddleware';

export {
  createLogger,
  getLogger,
  debug,
  info,
  warn,
  error,
  startTiming,
  endTiming,
  getLogs,
  getActionLogs,
  getPerformanceMetrics,
  clearLogs,
  enhanceWithDevTools,
  createPerformanceMonitor,
} from './loggingMiddleware';
