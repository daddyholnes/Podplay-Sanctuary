/**
 * SocketErrorHandler - Centralized error handling for WebSocket connections
 * Provides error categorization, logging, and recovery strategies
 */

import { SocketError } from '../api/APITypes';

export interface ErrorHandlerConfig {
  enableLogging?: boolean;
  enableReporting?: boolean;
  maxErrorHistory?: number;
  reportingEndpoint?: string;
}

export type ErrorCategory = 'connection' | 'authentication' | 'rate_limit' | 'server' | 'client' | 'unknown';

export interface ProcessedError {
  original: SocketError;
  category: ErrorCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userMessage: string;
  technicalMessage: string;
  recoveryStrategy: 'retry' | 'reconnect' | 'escalate' | 'ignore';
  timestamp: Date;
}

export class SocketErrorHandler {
  private config: ErrorHandlerConfig;
  private errorHistory: ProcessedError[] = [];
  private errorCounts: Map<ErrorCategory, number> = new Map();
  private lastErrorTime: Date | null = null;

  constructor(config: ErrorHandlerConfig = {}) {
    this.config = {
      enableLogging: true,
      enableReporting: false,
      maxErrorHistory: 100,
      ...config,
    };
    
    this.initializeErrorCounts();
  }

  /**
   * Process and handle a socket error
   */
  handleError(error: SocketError): ProcessedError {
    const processedError = this.processError(error);
    
    // Add to history
    this.addToHistory(processedError);
    
    // Update counts
    this.updateErrorCounts(processedError.category);
    
    // Log if enabled
    if (this.config.enableLogging) {
      this.logError(processedError);
    }
    
    // Report if enabled
    if (this.config.enableReporting) {
      this.reportError(processedError);
    }
    
    // Execute recovery strategy
    this.executeRecoveryStrategy(processedError);
    
    this.lastErrorTime = new Date();
    
    return processedError;
  }

  /**
   * Process raw error into categorized error
   */
  private processError(error: SocketError): ProcessedError {
    const category = this.categorizeError(error);
    const severity = this.determineSeverity(error, category);
    const userMessage = this.generateUserMessage(error, category);
    const technicalMessage = this.generateTechnicalMessage(error);
    const recoveryStrategy = this.determineRecoveryStrategy(error, category);

    return {
      original: error,
      category,
      severity,
      userMessage,
      technicalMessage,
      recoveryStrategy,
      timestamp: new Date(),
    };
  }

  /**
   * Categorize error type
   */
  private categorizeError(error: SocketError): ErrorCategory {
    const message = error.message.toLowerCase();
    const code = error.code?.toLowerCase();

    if (message.includes('connection') || message.includes('connect') || code === 'connection_error') {
      return 'connection';
    }
    
    if (message.includes('auth') || message.includes('unauthorized') || code === 'auth_error') {
      return 'authentication';
    }
    
    if (message.includes('rate') || message.includes('limit') || code === 'rate_limit') {
      return 'rate_limit';
    }
    
    if (message.includes('server') || message.includes('internal') || code?.startsWith('server_')) {
      return 'server';
    }
    
    if (message.includes('client') || message.includes('invalid') || code?.startsWith('client_')) {
      return 'client';
    }
    
    return 'unknown';
  }

  /**
   * Determine error severity
   */
  private determineSeverity(error: SocketError, category: ErrorCategory): 'low' | 'medium' | 'high' | 'critical' {
    switch (category) {
      case 'connection':
        return this.getConnectionErrorsSeverity();
      case 'authentication':
        return 'high';
      case 'rate_limit':
        return 'medium';
      case 'server':
        return 'high';
      case 'client':
        return 'low';
      default:
        return 'medium';
    }
  }

  /**
   * Get connection error severity based on frequency
   */
  private getConnectionErrorsSeverity(): 'low' | 'medium' | 'high' | 'critical' {
    const connectionErrors = this.errorCounts.get('connection') || 0;
    const timeSinceLastError = this.lastErrorTime ? Date.now() - this.lastErrorTime.getTime() : Infinity;
    
    if (connectionErrors > 5 && timeSinceLastError < 60000) { // 5 errors in 1 minute
      return 'critical';
    } else if (connectionErrors > 3 && timeSinceLastError < 300000) { // 3 errors in 5 minutes
      return 'high';
    } else if (connectionErrors > 1) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Generate user-friendly error message
   */
  private generateUserMessage(error: SocketError, category: ErrorCategory): string {
    switch (category) {
      case 'connection':
        return 'Connection lost. Attempting to reconnect...';
      case 'authentication':
        return 'Authentication failed. Please log in again.';
      case 'rate_limit':
        return 'Too many requests. Please wait a moment.';
      case 'server':
        return 'Server error occurred. Please try again later.';
      case 'client':
        return 'Request error. Please check your input.';
      default:
        return 'An unexpected error occurred.';
    }
  }

  /**
   * Generate technical error message for debugging
   */
  private generateTechnicalMessage(error: SocketError): string {
    return `[${error.type}] ${error.message} ${error.code ? `(Code: ${error.code})` : ''} at ${error.timestamp}`;
  }

  /**
   * Determine recovery strategy
   */
  private determineRecoveryStrategy(error: SocketError, category: ErrorCategory): 'retry' | 'reconnect' | 'escalate' | 'ignore' {
    switch (category) {
      case 'connection':
        return 'reconnect';
      case 'authentication':
        return 'escalate';
      case 'rate_limit':
        return 'retry';
      case 'server':
        const serverErrors = this.errorCounts.get('server') || 0;
        return serverErrors > 3 ? 'escalate' : 'retry';
      case 'client':
        return 'ignore';
      default:
        return 'retry';
    }
  }

  /**
   * Execute recovery strategy
   */
  private executeRecoveryStrategy(processedError: ProcessedError): void {
    switch (processedError.recoveryStrategy) {
      case 'retry':
        console.log('Implementing retry strategy for error:', processedError.technicalMessage);
        break;
      case 'reconnect':
        console.log('Implementing reconnection strategy for error:', processedError.technicalMessage);
        break;
      case 'escalate':
        console.error('Escalating error:', processedError.technicalMessage);
        break;
      case 'ignore':
        console.debug('Ignoring error:', processedError.technicalMessage);
        break;
    }
  }

  /**
   * Log error to console with appropriate level
   */
  private logError(processedError: ProcessedError): void {
    const logMessage = `[SocketError][${processedError.category}][${processedError.severity}] ${processedError.technicalMessage}`;
    
    switch (processedError.severity) {
      case 'critical':
        console.error(logMessage);
        break;
      case 'high':
        console.error(logMessage);
        break;
      case 'medium':
        console.warn(logMessage);
        break;
      case 'low':
        console.info(logMessage);
        break;
    }
  }

  /**
   * Report error to external service
   */
  private async reportError(processedError: ProcessedError): Promise<void> {
    if (!this.config.reportingEndpoint) return;
    
    try {
      await fetch(this.config.reportingEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: processedError,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to report socket error:', error);
    }
  }

  /**
   * Add error to history
   */
  private addToHistory(processedError: ProcessedError): void {
    this.errorHistory.push(processedError);
    
    // Maintain max history size
    if (this.errorHistory.length > (this.config.maxErrorHistory || 100)) {
      this.errorHistory.shift();
    }
  }

  /**
   * Update error counts
   */
  private updateErrorCounts(category: ErrorCategory): void {
    const currentCount = this.errorCounts.get(category) || 0;
    this.errorCounts.set(category, currentCount + 1);
  }

  /**
   * Initialize error counts
   */
  private initializeErrorCounts(): void {
    const categories: ErrorCategory[] = ['connection', 'authentication', 'rate_limit', 'server', 'client', 'unknown'];
    categories.forEach(category => this.errorCounts.set(category, 0));
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    errorsByCategory: Record<ErrorCategory, number>;
    errorsByHour: Record<string, number>;
    averageErrorsPerHour: number;
    lastErrorTime: Date | null;
  } {
    const now = new Date();
    const hourlyStats: Record<string, number> = {};
    
    this.errorHistory.forEach(error => {
      const hour = error.timestamp.getHours();
      const key = `${hour}:00`;
      hourlyStats[key] = (hourlyStats[key] || 0) + 1;
    });
    
    return {
      totalErrors: this.errorHistory.length,
      errorsByCategory: Object.fromEntries(this.errorCounts) as Record<ErrorCategory, number>,
      errorsByHour: hourlyStats,
      averageErrorsPerHour: this.errorHistory.length / 24,
      lastErrorTime: this.lastErrorTime,
    };
  }

  /**
   * Clear error history
   */
  clearHistory(): void {
    this.errorHistory = [];
    this.initializeErrorCounts();
    this.lastErrorTime = null;
  }

  /**
   * Get recent errors
   */
  getRecentErrors(count: number = 10): ProcessedError[] {
    return this.errorHistory.slice(-count);
  }
}

export default SocketErrorHandler;
