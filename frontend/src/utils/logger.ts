/**
 * Logger Utilities
 * 
 * Provides comprehensive logging functionality with multiple levels,
 * formatters, transports, and debugging capabilities.
 */

/**
 * Log levels
 */
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4,
}

/**
 * Log entry interface
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  metadata?: Record<string, any>;
  stack?: string;
  userId?: string;
  sessionId?: string;
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  maxStorageEntries: number;
  enablePerformance: boolean;
  enableStackTrace: boolean;
  contextFilter?: string[];
  format?: 'json' | 'text';
}

/**
 * Default logger configuration
 */
export const DEFAULT_LOGGER_CONFIG: LoggerConfig = {
  level: LogLevel.INFO,
  enableConsole: true,
  enableStorage: true,
  enableRemote: false,
  maxStorageEntries: 1000,
  enablePerformance: true,
  enableStackTrace: true,
  format: 'text',
};

/**
 * Log transport interface
 */
export interface LogTransport {
  log(entry: LogEntry): void | Promise<void>;
  flush?(): void | Promise<void>;
  destroy?(): void | Promise<void>;
}

/**
 * Console transport implementation
 */
export class ConsoleTransport implements LogTransport {
  private formatters = {
    json: (entry: LogEntry): string => JSON.stringify(entry, null, 2),
    text: (entry: LogEntry): string => {
      const timestamp = entry.timestamp.toISOString();
      const level = LogLevel[entry.level].padEnd(5);
      const context = entry.context ? `[${entry.context}]` : '';
      const metadata = entry.metadata ? ` ${JSON.stringify(entry.metadata)}` : '';
      return `${timestamp} ${level} ${context} ${entry.message}${metadata}`;
    },
  };

  constructor(private format: 'json' | 'text' = 'text') {}

  log(entry: LogEntry): void {
    const formatted = this.formatters[this.format](entry);
    
    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(formatted, entry.stack);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.TRACE:
        console.trace(formatted);
        break;
    }
  }
}

/**
 * Storage transport implementation
 */
export class StorageTransport implements LogTransport {
  private readonly storageKey = 'app_logs';
  private entries: LogEntry[] = [];

  constructor(private maxEntries: number = 1000) {
    this.loadFromStorage();
  }

  log(entry: LogEntry): void {
    this.entries.push(entry);
    
    // Maintain max entries limit
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }
    
    this.saveToStorage();
  }

  getLogs(): LogEntry[] {
    return [...this.entries];
  }

  clear(): void {
    this.entries = [];
    this.saveToStorage();
  }

  exportLogs(): string {
    return JSON.stringify(this.entries, null, 2);
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.entries = JSON.parse(stored).map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }));
      }
    } catch (error) {
      console.warn('Failed to load logs from storage:', error);
      this.entries = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.entries));
    } catch (error) {
      console.warn('Failed to save logs to storage:', error);
    }
  }

  flush(): void {
    this.saveToStorage();
  }

  destroy(): void {
    this.clear();
  }
}

/**
 * Remote transport implementation
 */
export class RemoteTransport implements LogTransport {
  private queue: LogEntry[] = [];
  private isProcessing = false;
  private retryCount = 0;
  private readonly maxRetries = 3;

  constructor(
    private endpoint: string,
    private batchSize: number = 10,
    private flushInterval: number = 5000
  ) {
    // Auto-flush periodically
    setInterval(() => this.flush(), this.flushInterval);
    
    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flush());
    }
  }

  log(entry: LogEntry): void {
    this.queue.push(entry);
    
    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    const batch = this.queue.splice(0, this.batchSize);
    
    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs: batch }),
      });
      
      this.retryCount = 0;
    } catch (error) {
      console.warn('Failed to send logs to remote endpoint:', error);
      
      // Re-queue on failure
      this.queue.unshift(...batch);
      this.retryCount++;
      
      if (this.retryCount < this.maxRetries) {
        // Exponential backoff
        setTimeout(() => this.flush(), Math.pow(2, this.retryCount) * 1000);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  destroy(): void {
    this.flush();
  }
}

/**
 * Performance monitoring transport
 */
export class PerformanceTransport implements LogTransport {
  private performanceEntries: Array<{
    name: string;
    startTime: number;
    duration?: number;
    metadata?: any;
  }> = [];

  log(entry: LogEntry): void {
    if (entry.metadata?.performance) {
      this.performanceEntries.push({
        name: entry.message,
        startTime: entry.timestamp.getTime(),
        duration: entry.metadata.duration,
        metadata: entry.metadata,
      });
    }
  }

  getPerformanceData(): typeof this.performanceEntries {
    return [...this.performanceEntries];
  }

  clear(): void {
    this.performanceEntries = [];
  }
}

/**
 * Main Logger class
 */
export class Logger {
  private transports: LogTransport[] = [];
  private config: LoggerConfig;
  private context?: string;
  private sessionId: string;
  private performanceMarks: Map<string, number> = new Map();

  constructor(config: Partial<LoggerConfig> = {}, context?: string) {
    this.config = { ...DEFAULT_LOGGER_CONFIG, ...config };
    this.context = context;
    this.sessionId = this.generateSessionId();
    this.setupTransports();
  }

  /**
   * Create a child logger with specific context
   */
  child(context: string): Logger {
    return new Logger(this.config, context);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, {
      ...metadata,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    }, error?.stack);
  }

  /**
   * Log warning message
   */
  warn(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  /**
   * Log info message
   */
  info(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  /**
   * Log debug message
   */
  debug(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  /**
   * Log trace message
   */
  trace(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.TRACE, message, metadata);
  }

  /**
   * Start performance timing
   */
  time(label: string): void {
    this.performanceMarks.set(label, performance.now());
  }

  /**
   * End performance timing and log
   */
  timeEnd(label: string, metadata?: Record<string, any>): void {
    const startTime = this.performanceMarks.get(label);
    if (startTime !== undefined) {
      const duration = performance.now() - startTime;
      this.performanceMarks.delete(label);
      
      this.info(`Performance: ${label}`, {
        ...metadata,
        performance: true,
        duration,
        startTime,
      });
    }
  }

  /**
   * Log API request
   */
  apiRequest(method: string, url: string, status?: number, duration?: number): void {
    this.info(`API ${method} ${url}`, {
      type: 'api_request',
      method,
      url,
      status,
      duration,
    });
  }

  /**
   * Log user action
   */
  userAction(action: string, target?: string, metadata?: Record<string, any>): void {
    this.info(`User action: ${action}`, {
      type: 'user_action',
      action,
      target,
      ...metadata,
    });
  }

  /**
   * Log navigation
   */
  navigation(from: string, to: string, method: 'push' | 'replace' | 'back' = 'push'): void {
    this.info(`Navigation: ${from} -> ${to}`, {
      type: 'navigation',
      from,
      to,
      method,
    });
  }

  /**
   * Log component lifecycle
   */
  component(component: string, event: 'mount' | 'unmount' | 'update', props?: any): void {
    this.debug(`Component ${component} ${event}`, {
      type: 'component_lifecycle',
      component,
      event,
      props,
    });
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>,
    stack?: string
  ): void {
    // Check if logging is enabled for this level
    if (level > this.config.level) return;

    // Check context filter
    if (this.config.contextFilter && this.context) {
      if (!this.config.contextFilter.includes(this.context)) return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context: this.context,
      metadata,
      stack: stack || (this.config.enableStackTrace ? new Error().stack : undefined),
      sessionId: this.sessionId,
    };

    // Send to all transports
    this.transports.forEach(transport => {
      try {
        transport.log(entry);
      } catch (error) {
        console.error('Transport error:', error);
      }
    });
  }

  /**
   * Setup transports based on configuration
   */
  private setupTransports(): void {
    if (this.config.enableConsole) {
      this.transports.push(new ConsoleTransport(this.config.format));
    }

    if (this.config.enableStorage) {
      this.transports.push(new StorageTransport(this.config.maxStorageEntries));
    }

    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.transports.push(new RemoteTransport(this.config.remoteEndpoint));
    }

    if (this.config.enablePerformance) {
      this.transports.push(new PerformanceTransport());
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get storage transport for log export
   */
  getStorageTransport(): StorageTransport | undefined {
    return this.transports.find(
      transport => transport instanceof StorageTransport
    ) as StorageTransport;
  }

  /**
   * Get performance transport for performance data
   */
  getPerformanceTransport(): PerformanceTransport | undefined {
    return this.transports.find(
      transport => transport instanceof PerformanceTransport
    ) as PerformanceTransport;
  }

  /**
   * Flush all transports
   */
  async flush(): Promise<void> {
    await Promise.all(
      this.transports.map(transport => transport.flush?.())
    );
  }

  /**
   * Destroy logger and cleanup
   */
  async destroy(): Promise<void> {
    await Promise.all(
      this.transports.map(transport => transport.destroy?.())
    );
    this.transports = [];
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Recreate transports with new config
    this.transports = [];
    this.setupTransports();
  }

  /**
   * Get current configuration
   */
  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string | null {
    const storageTransport = this.getStorageTransport();
    return storageTransport ? storageTransport.exportLogs() : null;
  }

  /**
   * Clear all stored logs
   */
  clearLogs(): void {
    const storageTransport = this.getStorageTransport();
    storageTransport?.clear();
  }
}

/**
 * Global logger instance
 */
export const logger = new Logger();

/**
 * Create logger with specific configuration
 */
export function createLogger(config?: Partial<LoggerConfig>, context?: string): Logger {
  return new Logger(config, context);
}

/**
 * Logger decorator for methods
 */
export function logMethod(
  level: LogLevel = LogLevel.DEBUG,
  includeArgs: boolean = false,
  includeResult: boolean = false
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;

    descriptor.value = async function (...args: any[]) {
      const methodLogger = logger.child(`${className}.${propertyKey}`);
      
      methodLogger.time(`${className}.${propertyKey}`);
      
      try {
        const metadata: any = {};
        if (includeArgs) metadata.args = args;
        
        methodLogger.log(level, `Method called: ${propertyKey}`, metadata);
        
        const result = await originalMethod.apply(this, args);
        
        if (includeResult) {
          methodLogger.log(level, `Method result: ${propertyKey}`, { result });
        }
        
        return result;
      } catch (error) {
        methodLogger.error(`Method error: ${propertyKey}`, error as Error);
        throw error;
      } finally {
        methodLogger.timeEnd(`${className}.${propertyKey}`);
      }
    };

    return descriptor;
  };
}

/**
 * Logger React hook
 */
export function useLogger(context?: string): Logger {
  return React.useMemo(() => {
    return context ? logger.child(context) : logger;
  }, [context]);
}

/**
 * Error boundary logger
 */
export function logErrorBoundary(error: Error, errorInfo: any): void {
  logger.error('React Error Boundary caught an error', error, {
    type: 'error_boundary',
    componentStack: errorInfo.componentStack,
    errorBoundary: true,
  });
}

/**
 * Utility functions
 */
export const loggerUtils = {
  /**
   * Format log level for display
   */
  formatLogLevel(level: LogLevel): string {
    return LogLevel[level];
  },

  /**
   * Parse log level from string
   */
  parseLogLevel(level: string): LogLevel {
    return LogLevel[level.toUpperCase() as keyof typeof LogLevel] ?? LogLevel.INFO;
  },

  /**
   * Filter logs by level
   */
  filterByLevel(logs: LogEntry[], minLevel: LogLevel): LogEntry[] {
    return logs.filter(log => log.level <= minLevel);
  },

  /**
   * Filter logs by context
   */
  filterByContext(logs: LogEntry[], context: string): LogEntry[] {
    return logs.filter(log => log.context === context);
  },

  /**
   * Filter logs by time range
   */
  filterByTimeRange(logs: LogEntry[], start: Date, end: Date): LogEntry[] {
    return logs.filter(log => log.timestamp >= start && log.timestamp <= end);
  },

  /**
   * Group logs by context
   */
  groupByContext(logs: LogEntry[]): Record<string, LogEntry[]> {
    return logs.reduce((groups, log) => {
      const context = log.context || 'default';
      if (!groups[context]) groups[context] = [];
      groups[context].push(log);
      return groups;
    }, {} as Record<string, LogEntry[]>);
  },

  /**
   * Get log statistics
   */
  getStatistics(logs: LogEntry[]): {
    total: number;
    byLevel: Record<string, number>;
    byContext: Record<string, number>;
    timeRange: { start: Date; end: Date } | null;
  } {
    const byLevel: Record<string, number> = {};
    const byContext: Record<string, number> = {};
    let start: Date | null = null;
    let end: Date | null = null;

    logs.forEach(log => {
      // Count by level
      const level = LogLevel[log.level];
      byLevel[level] = (byLevel[level] || 0) + 1;

      // Count by context
      const context = log.context || 'default';
      byContext[context] = (byContext[context] || 0) + 1;

      // Track time range
      if (!start || log.timestamp < start) start = log.timestamp;
      if (!end || log.timestamp > end) end = log.timestamp;
    });

    return {
      total: logs.length,
      byLevel,
      byContext,
      timeRange: start && end ? { start, end } : null,
    };
  },
};

/**
 * Export all logger utilities
 */
export default {
  // Core
  Logger,
  LogLevel,
  logger,
  createLogger,
  
  // Transports
  ConsoleTransport,
  StorageTransport,
  RemoteTransport,
  PerformanceTransport,
  
  // Decorators and hooks
  logMethod,
  useLogger,
  logErrorBoundary,
  
  // Utils
  loggerUtils,
  
  // Config
  DEFAULT_LOGGER_CONFIG,
};
