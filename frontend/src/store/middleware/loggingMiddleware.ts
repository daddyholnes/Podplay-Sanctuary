/**
 * Logging Middleware
 * 
 * Redux middleware for comprehensive logging, debugging, performance monitoring,
 * and development tools integration
 */

import { Middleware, MiddlewareAPI, Dispatch, AnyAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

// ============================================================================
// Types & Constants
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface ActionLog {
  id: string;
  timestamp: number;
  action: AnyAction;
  prevState: any;
  nextState: any;
  duration: number;
  stateChanges: string[];
  metadata?: Record<string, any>;
}

export interface PerformanceMetrics {
  actionCount: number;
  averageActionTime: number;
  slowestActions: Array<{ type: string; duration: number; timestamp: number }>;
  stateSize: number;
  memoryUsage?: number;
  renderCount?: number;
}

// ============================================================================
// Logger Configuration
// ============================================================================

interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  categories: string[];
  excludeActions: string[];
  includeState: boolean;
  maxLogs: number;
  performance: boolean;
  console: boolean;
  storage: boolean;
  remote: boolean;
  remoteEndpoint?: string;
  filters: {
    actions?: string[];
    states?: string[];
    sensitive?: string[];
  };
}

const defaultConfig: LoggerConfig = {
  enabled: process.env.NODE_ENV === 'development',
  level: 'debug',
  categories: ['action', 'state', 'performance', 'error'],
  excludeActions: ['@@redux/INIT', '@@INIT'],
  includeState: true,
  maxLogs: 1000,
  performance: true,
  console: true,
  storage: false,
  remote: false,
  filters: {
    sensitive: ['password', 'token', 'secret', 'key', 'auth'],
  },
};

// ============================================================================
// Logger Service
// ============================================================================

class LoggerService {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private actionLogs: ActionLog[] = [];
  private performanceMetrics: PerformanceMetrics = {
    actionCount: 0,
    averageActionTime: 0,
    slowestActions: [],
    stateSize: 0,
  };
  private startTimes = new Map<string, number>();

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.setupStorageCleanup();
  }

  private setupStorageCleanup(): void {
    // Clean up old logs every hour
    setInterval(() => {
      this.cleanupLogs();
    }, 60 * 60 * 1000);
  }

  private cleanupLogs(): void {
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    const cutoff = Date.now() - maxAge;

    this.logs = this.logs.filter(log => log.timestamp > cutoff);
    this.actionLogs = this.actionLogs.filter(log => log.timestamp > cutoff);

    // Keep only top slowest actions
    this.performanceMetrics.slowestActions = this.performanceMetrics.slowestActions
      .filter(action => action.timestamp > cutoff)
      .slice(0, 50);
  }

  log(level: LogLevel, category: string, message: string, data?: any, metadata?: Record<string, any>): void {
    if (!this.config.enabled || !this.shouldLog(level, category)) {
      return;
    }

    const entry: LogEntry = {
      id: this.generateId(),
      timestamp: Date.now(),
      level,
      category,
      message,
      data: this.sanitizeData(data),
      metadata,
    };

    this.addLog(entry);
    this.outputLog(entry);
  }

  logAction(action: AnyAction, prevState: any, nextState: any, duration: number): void {
    if (!this.config.enabled || this.shouldExcludeAction(action.type)) {
      return;
    }

    const stateChanges = this.detectStateChanges(prevState, nextState);
    
    const actionLog: ActionLog = {
      id: this.generateId(),
      timestamp: Date.now(),
      action: this.sanitizeAction(action),
      prevState: this.config.includeState ? this.sanitizeData(prevState) : undefined,
      nextState: this.config.includeState ? this.sanitizeData(nextState) : undefined,
      duration,
      stateChanges,
    };

    this.addActionLog(actionLog);
    this.updatePerformanceMetrics(action.type, duration, nextState);

    if (this.config.console) {
      this.logActionToConsole(actionLog);
    }
  }

  startTiming(id: string): void {
    this.startTimes.set(id, performance.now());
  }

  endTiming(id: string, category: string = 'performance', message?: string): number {
    const startTime = this.startTimes.get(id);
    if (!startTime) return 0;

    const duration = performance.now() - startTime;
    this.startTimes.delete(id);

    this.log('info', category, message || `Operation ${id} completed`, { duration });
    return duration;
  }

  private shouldLog(level: LogLevel, category: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const logLevelIndex = levels.indexOf(level);

    return logLevelIndex >= currentLevelIndex && 
           this.config.categories.includes(category);
  }

  private shouldExcludeAction(actionType: string): boolean {
    return this.config.excludeActions.some(excluded => 
      actionType.includes(excluded)
    );
  }

  private addLog(entry: LogEntry): void {
    this.logs.unshift(entry);
    
    if (this.logs.length > this.config.maxLogs) {
      this.logs = this.logs.slice(0, this.config.maxLogs);
    }

    if (this.config.storage) {
      this.saveToStorage(entry);
    }

    if (this.config.remote && this.config.remoteEndpoint) {
      this.sendToRemote(entry);
    }
  }

  private addActionLog(log: ActionLog): void {
    this.actionLogs.unshift(log);
    
    if (this.actionLogs.length > this.config.maxLogs) {
      this.actionLogs = this.actionLogs.slice(0, this.config.maxLogs);
    }
  }

  private outputLog(entry: LogEntry): void {
    if (!this.config.console) return;

    const timestamp = new Date(entry.timestamp).toISOString();
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}] [${entry.category}]`;

    switch (entry.level) {
      case 'debug':
        console.debug(prefix, entry.message, entry.data);
        break;
      case 'info':
        console.info(prefix, entry.message, entry.data);
        break;
      case 'warn':
        console.warn(prefix, entry.message, entry.data);
        break;
      case 'error':
        console.error(prefix, entry.message, entry.data);
        break;
    }
  }

  private logActionToConsole(actionLog: ActionLog): void {
    const groupName = `🔄 ${actionLog.action.type} (${actionLog.duration.toFixed(2)}ms)`;
    
    console.group(groupName);
    console.log('Action:', actionLog.action);
    
    if (actionLog.stateChanges.length > 0) {
      console.log('State Changes:', actionLog.stateChanges);
    }
    
    if (this.config.includeState) {
      console.log('Previous State:', actionLog.prevState);
      console.log('Next State:', actionLog.nextState);
    }
    
    console.groupEnd();
  }

  private detectStateChanges(prevState: any, nextState: any): string[] {
    const changes: string[] = [];
    
    if (!prevState || !nextState) return changes;

    const checkChanges = (prev: any, next: any, path = ''): void => {
      if (prev === next) return;

      if (typeof prev !== 'object' || typeof next !== 'object') {
        changes.push(path);
        return;
      }

      const allKeys = new Set([...Object.keys(prev), ...Object.keys(next)]);
      
      for (const key of allKeys) {
        const newPath = path ? `${path}.${key}` : key;
        
        if (!(key in prev)) {
          changes.push(`${newPath} (added)`);
        } else if (!(key in next)) {
          changes.push(`${newPath} (removed)`);
        } else {
          checkChanges(prev[key], next[key], newPath);
        }
      }
    };

    checkChanges(prevState, nextState);
    return changes;
  }

  private updatePerformanceMetrics(actionType: string, duration: number, state: any): void {
    this.performanceMetrics.actionCount++;
    
    // Update average
    const totalTime = this.performanceMetrics.averageActionTime * (this.performanceMetrics.actionCount - 1) + duration;
    this.performanceMetrics.averageActionTime = totalTime / this.performanceMetrics.actionCount;

    // Track slow actions
    if (duration > 10) { // Actions slower than 10ms
      this.performanceMetrics.slowestActions.unshift({
        type: actionType,
        duration,
        timestamp: Date.now(),
      });

      // Keep only top 50 slowest
      this.performanceMetrics.slowestActions = this.performanceMetrics.slowestActions
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 50);
    }

    // Calculate state size
    try {
      this.performanceMetrics.stateSize = JSON.stringify(state).length;
    } catch (error) {
      // Circular reference or other JSON error
      this.performanceMetrics.stateSize = 0;
    }

    // Memory usage (if available)
    if ((performance as any).memory) {
      this.performanceMetrics.memoryUsage = (performance as any).memory.usedJSHeapSize;
    }
  }

  private sanitizeData(data: any): any {
    if (!data) return data;

    const sanitize = (obj: any, depth = 0): any => {
      if (depth > 10) return '[Max Depth Reached]';
      
      if (obj === null || typeof obj !== 'object') {
        return obj;
      }

      if (Array.isArray(obj)) {
        return obj.map(item => sanitize(item, depth + 1));
      }

      const sanitized: any = {};
      
      for (const [key, value] of Object.entries(obj)) {
        // Check for sensitive data
        if (this.config.filters.sensitive?.some(sensitive => 
          key.toLowerCase().includes(sensitive.toLowerCase())
        )) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = sanitize(value, depth + 1);
        }
      }

      return sanitized;
    };

    return sanitize(data);
  }

  private sanitizeAction(action: AnyAction): AnyAction {
    return {
      ...action,
      payload: this.sanitizeData(action.payload),
    };
  }

  private generateId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveToStorage(entry: LogEntry): void {
    try {
      const storageKey = 'podplay_logs';
      const existing = localStorage.getItem(storageKey);
      const logs = existing ? JSON.parse(existing) : [];
      
      logs.unshift(entry);
      
      // Keep only recent logs in storage
      const maxStorageLogs = 100;
      if (logs.length > maxStorageLogs) {
        logs.splice(maxStorageLogs);
      }
      
      localStorage.setItem(storageKey, JSON.stringify(logs));
    } catch (error) {
      console.warn('Failed to save log to storage:', error);
    }
  }

  private async sendToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      console.warn('Failed to send log to remote endpoint:', error);
    }
  }

  // Public API methods
  getLogs(level?: LogLevel, category?: string): LogEntry[] {
    let filtered = this.logs;

    if (level) {
      filtered = filtered.filter(log => log.level === level);
    }

    if (category) {
      filtered = filtered.filter(log => log.category === category);
    }

    return filtered;
  }

  getActionLogs(actionType?: string): ActionLog[] {
    if (actionType) {
      return this.actionLogs.filter(log => log.action.type === actionType);
    }
    return this.actionLogs;
  }

  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  clearLogs(): void {
    this.logs = [];
    this.actionLogs = [];
    this.performanceMetrics = {
      actionCount: 0,
      averageActionTime: 0,
      slowestActions: [],
      stateSize: 0,
    };
  }

  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): LoggerConfig {
    return { ...this.config };
  }
}

// ============================================================================
// Logger Instance
// ============================================================================

const logger = new LoggerService();

// ============================================================================
// Middleware Implementation
// ============================================================================

export const loggingMiddleware: Middleware<{}, RootState> = 
  (store: MiddlewareAPI<Dispatch<AnyAction>, RootState>) => 
  (next: Dispatch<AnyAction>) => 
  (action: AnyAction) => {
    const startTime = performance.now();
    const prevState = store.getState();

    logger.log('debug', 'action', `Dispatching action: ${action.type}`, action);

    try {
      const result = next(action);
      const endTime = performance.now();
      const duration = endTime - startTime;
      const nextState = store.getState();

      logger.logAction(action, prevState, nextState, duration);

      // Warn about slow actions
      if (duration > 100) {
        logger.log('warn', 'performance', `Slow action detected: ${action.type}`, {
          duration,
          action: action.type,
        });
      }

      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      logger.log('error', 'action', `Action failed: ${action.type}`, {
        action,
        error: error instanceof Error ? error.message : error,
        duration,
      });

      throw error;
    }
  };

// ============================================================================
// Debug Tools Integration
// ============================================================================

// Redux DevTools Extension integration
export const enhanceWithDevTools = (store: any) => {
  if (typeof window !== 'undefined' && (window as any).__REDUX_DEVTOOLS_EXTENSION__) {
    const devTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__.connect({
      name: 'Podplay Sanctuary',
      features: {
        pause: true,
        lock: true,
        persist: true,
        export: true,
        import: 'custom',
        jump: true,
        skip: true,
        reorder: true,
        dispatch: true,
        test: true,
      },
    });

    devTools.init(store.getState());

    store.subscribe(() => {
      devTools.send('STATE_UPDATE', store.getState());
    });

    return devTools;
  }

  return null;
};

// ============================================================================
// Performance Monitoring
// ============================================================================

export const createPerformanceMonitor = () => {
  let renderCount = 0;
  let lastRenderTime = 0;

  return {
    trackRender: () => {
      renderCount++;
      lastRenderTime = performance.now();
      
      logger.log('debug', 'performance', `Render #${renderCount}`, {
        renderCount,
        timestamp: lastRenderTime,
      });
    },

    getStats: () => ({
      renderCount,
      lastRenderTime,
      ...logger.getPerformanceMetrics(),
    }),
  };
};

// ============================================================================
// Exported API
// ============================================================================

export const createLogger = (config?: Partial<LoggerConfig>) => new LoggerService(config);

export const getLogger = () => logger;

export const debug = (category: string, message: string, data?: any) =>
  logger.log('debug', category, message, data);

export const info = (category: string, message: string, data?: any) =>
  logger.log('info', category, message, data);

export const warn = (category: string, message: string, data?: any) =>
  logger.log('warn', category, message, data);

export const error = (category: string, message: string, data?: any) =>
  logger.log('error', category, message, data);

export const startTiming = (id: string) => logger.startTiming(id);
export const endTiming = (id: string, category?: string, message?: string) =>
  logger.endTiming(id, category, message);

export const getLogs = (level?: LogLevel, category?: string) => logger.getLogs(level, category);
export const getActionLogs = (actionType?: string) => logger.getActionLogs(actionType);
export const getPerformanceMetrics = () => logger.getPerformanceMetrics();
export const clearLogs = () => logger.clearLogs();

// ============================================================================
// Development Helpers
// ============================================================================

if (process.env.NODE_ENV === 'development') {
  // Expose logger to global scope for debugging
  (window as any).logger = logger;
  
  // Add performance observers
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
          logger.log('debug', 'performance', `Performance measure: ${entry.name}`, {
            duration: entry.duration,
            startTime: entry.startTime,
          });
        }
      }
    });
    
    observer.observe({ entryTypes: ['measure'] });
  }
}

export default loggingMiddleware;
