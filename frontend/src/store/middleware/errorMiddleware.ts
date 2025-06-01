/**
 * Error Middleware
 * 
 * Redux middleware for centralized error handling, logging,
 * reporting, and user feedback
 */

import { Middleware, MiddlewareAPI, Dispatch, AnyAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import { showNotification, setStatusMessage } from '../slices/uiSlice';
import { APIError } from '../../services/api/APIError';

// ============================================================================
// Types & Constants
// ============================================================================

export interface ErrorAction extends AnyAction {
  error: true;
  payload: {
    error: any;
    context?: string;
    recoverable?: boolean;
    silent?: boolean;
    retryable?: boolean;
  };
}

export interface ErrorReport {
  id: string;
  timestamp: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  category: 'network' | 'validation' | 'auth' | 'permission' | 'server' | 'client' | 'unknown';
  message: string;
  stack?: string;
  context?: any;
  userAgent?: string;
  url?: string;
  userId?: string;
  sessionId?: string;
  buildVersion?: string;
  metadata?: Record<string, any>;
}

export interface ErrorRecoveryStrategy {
  type: 'retry' | 'redirect' | 'refresh' | 'logout' | 'ignore';
  params?: any;
  delay?: number;
  maxAttempts?: number;
}

// ============================================================================
// Error Classification
// ============================================================================

class ErrorClassifier {
  static classifyError(error: any): {
    level: ErrorReport['level'];
    category: ErrorReport['category'];
    recoverable: boolean;
    retryable: boolean;
  } {
    // Handle API errors
    if (error instanceof APIError || error?.code) {
      return this.classifyApiError(error);
    }

    // Handle network errors
    if (error?.name === 'NetworkError' || error?.message?.includes('network')) {
      return {
        level: 'medium',
        category: 'network',
        recoverable: true,
        retryable: true,
      };
    }

    // Handle timeout errors
    if (error?.name === 'TimeoutError' || error?.message?.includes('timeout')) {
      return {
        level: 'medium',
        category: 'network',
        recoverable: true,
        retryable: true,
      };
    }

    // Handle permission errors
    if (error?.status === 403 || error?.message?.includes('permission')) {
      return {
        level: 'high',
        category: 'permission',
        recoverable: false,
        retryable: false,
      };
    }

    // Handle authentication errors
    if (error?.status === 401 || error?.message?.includes('unauthorized')) {
      return {
        level: 'high',
        category: 'auth',
        recoverable: true,
        retryable: false,
      };
    }

    // Handle validation errors
    if (error?.status === 400 || error?.message?.includes('validation')) {
      return {
        level: 'low',
        category: 'validation',
        recoverable: true,
        retryable: false,
      };
    }

    // Handle server errors
    if (error?.status >= 500) {
      return {
        level: 'high',
        category: 'server',
        recoverable: true,
        retryable: true,
      };
    }

    // Handle client errors
    if (error?.status >= 400 && error?.status < 500) {
      return {
        level: 'medium',
        category: 'client',
        recoverable: true,
        retryable: false,
      };
    }

    // Default classification
    return {
      level: 'medium',
      category: 'unknown',
      recoverable: false,
      retryable: false,
    };
  }

  private static classifyApiError(error: APIError): {
    level: ErrorReport['level'];
    category: ErrorReport['category'];
    recoverable: boolean;
    retryable: boolean;
  } {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return {
          level: 'medium',
          category: 'network',
          recoverable: true,
          retryable: true,
        };

      case 'TIMEOUT':
        return {
          level: 'medium',
          category: 'network',
          recoverable: true,
          retryable: true,
        };

      case 'UNAUTHORIZED':
        return {
          level: 'high',
          category: 'auth',
          recoverable: true,
          retryable: false,
        };

      case 'FORBIDDEN':
        return {
          level: 'high',
          category: 'permission',
          recoverable: false,
          retryable: false,
        };

      case 'VALIDATION_ERROR':
        return {
          level: 'low',
          category: 'validation',
          recoverable: true,
          retryable: false,
        };

      case 'SERVER_ERROR':
        return {
          level: 'high',
          category: 'server',
          recoverable: true,
          retryable: true,
        };

      case 'RATE_LIMITED':
        return {
          level: 'medium',
          category: 'server',
          recoverable: true,
          retryable: true,
        };

      default:
        return {
          level: 'medium',
          category: 'unknown',
          recoverable: false,
          retryable: false,
        };
    }
  }
}

// ============================================================================
// Error Reporting Service
// ============================================================================

class ErrorReportingService {
  private reports: ErrorReport[] = [];
  private maxReports = 100;
  private reportingEnabled = true;
  private endpoints = {
    production: '/api/errors',
    development: '/api/dev-errors',
  };

  createReport(error: any, context?: any): ErrorReport {
    const classification = ErrorClassifier.classifyError(error);
    
    const report: ErrorReport = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level: classification.level,
      category: classification.category,
      message: error?.message || String(error),
      stack: error?.stack,
      context,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      buildVersion: process.env.REACT_APP_VERSION,
      metadata: {
        recoverable: classification.recoverable,
        retryable: classification.retryable,
        ...error?.metadata,
      },
    };

    this.addReport(report);
    return report;
  }

  private addReport(report: ErrorReport): void {
    this.reports.unshift(report);
    
    // Keep only the latest reports
    if (this.reports.length > this.maxReports) {
      this.reports = this.reports.slice(0, this.maxReports);
    }

    // Send report to server if enabled
    if (this.reportingEnabled && report.level !== 'low') {
      this.sendReport(report).catch(console.error);
    }
  }

  private async sendReport(report: ErrorReport): Promise<void> {
    try {
      const endpoint = process.env.NODE_ENV === 'production' 
        ? this.endpoints.production 
        : this.endpoints.development;

      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });
    } catch (error) {
      console.error('Failed to send error report:', error);
    }
  }

  getReports(level?: ErrorReport['level']): ErrorReport[] {
    if (level) {
      return this.reports.filter(report => report.level === level);
    }
    return [...this.reports];
  }

  clearReports(): void {
    this.reports = [];
  }

  setReportingEnabled(enabled: boolean): void {
    this.reportingEnabled = enabled;
  }

  getStats(): {
    total: number;
    byLevel: Record<ErrorReport['level'], number>;
    byCategory: Record<ErrorReport['category'], number>;
    recent: number;
  } {
    const stats = {
      total: this.reports.length,
      byLevel: { low: 0, medium: 0, high: 0, critical: 0 },
      byCategory: { network: 0, validation: 0, auth: 0, permission: 0, server: 0, client: 0, unknown: 0 },
      recent: 0,
    };

    const oneHourAgo = Date.now() - (60 * 60 * 1000);

    this.reports.forEach(report => {
      stats.byLevel[report.level]++;
      stats.byCategory[report.category]++;
      
      if (report.timestamp > oneHourAgo) {
        stats.recent++;
      }
    });

    return stats;
  }
}

const errorReporting = new ErrorReportingService();

// ============================================================================
// Error Recovery Strategies
// ============================================================================

class ErrorRecoveryManager {
  private strategies = new Map<string, ErrorRecoveryStrategy>();
  private retryAttempts = new Map<string, number>();

  constructor() {
    this.setupDefaultStrategies();
  }

  private setupDefaultStrategies(): void {
    // Network errors - retry with backoff
    this.strategies.set('network', {
      type: 'retry',
      delay: 1000,
      maxAttempts: 3,
    });

    // Authentication errors - redirect to login
    this.strategies.set('auth', {
      type: 'redirect',
      params: { path: '/login' },
    });

    // Server errors - retry once, then show error
    this.strategies.set('server', {
      type: 'retry',
      delay: 2000,
      maxAttempts: 1,
    });

    // Permission errors - show error message
    this.strategies.set('permission', {
      type: 'ignore',
    });

    // Validation errors - show form errors
    this.strategies.set('validation', {
      type: 'ignore',
    });
  }

  getStrategy(category: ErrorReport['category'], actionType?: string): ErrorRecoveryStrategy | null {
    // Check for action-specific strategy first
    if (actionType) {
      const specificStrategy = this.strategies.get(`${category}:${actionType}`);
      if (specificStrategy) return specificStrategy;
    }

    // Fall back to category strategy
    return this.strategies.get(category) || null;
  }

  shouldRetry(errorId: string, strategy: ErrorRecoveryStrategy): boolean {
    if (strategy.type !== 'retry') return false;
    
    const attempts = this.retryAttempts.get(errorId) || 0;
    const maxAttempts = strategy.maxAttempts || 1;
    
    return attempts < maxAttempts;
  }

  recordRetryAttempt(errorId: string): void {
    const attempts = this.retryAttempts.get(errorId) || 0;
    this.retryAttempts.set(errorId, attempts + 1);
  }

  clearRetryHistory(errorId: string): void {
    this.retryAttempts.delete(errorId);
  }

  setStrategy(key: string, strategy: ErrorRecoveryStrategy): void {
    this.strategies.set(key, strategy);
  }
}

const recoveryManager = new ErrorRecoveryManager();

// ============================================================================
// Helper Functions
// ============================================================================

const isErrorAction = (action: AnyAction): action is ErrorAction => {
  return action.error === true;
};

const generateErrorId = () => `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const sanitizeError = (error: any): any => {
  // Remove sensitive information
  const sanitized = { ...error };
  
  // Remove tokens, passwords, etc.
  const sensitiveKeys = ['token', 'password', 'secret', 'key', 'auth'];
  sensitiveKeys.forEach(key => {
    if (sanitized[key]) {
      sanitized[key] = '[REDACTED]';
    }
  });

  return sanitized;
};

// ============================================================================
// Middleware Implementation
// ============================================================================

export const errorMiddleware: Middleware<{}, RootState> = 
  (store: MiddlewareAPI<Dispatch<AnyAction>, RootState>) => 
  (next: Dispatch<AnyAction>) => 
  (action: AnyAction) => {
    try {
      // Pass action to next middleware first
      const result = next(action);

      // Handle error actions
      if (isErrorAction(action)) {
        handleErrorAction(store, action);
      }

      return result;
    } catch (error) {
      // Catch any synchronous errors in reducers
      console.error('Error in reducer:', error);
      
      const errorReport = errorReporting.createReport(error, {
        action: sanitizeError(action),
        state: 'reducer_execution',
      });

      store.dispatch(showNotification({
        type: 'error',
        title: 'Application Error',
        message: 'An unexpected error occurred. Please try again.',
        duration: 5000,
      }));

      // Re-throw to maintain error flow
      throw error;
    }
  };

// ============================================================================
// Error Action Handler
// ============================================================================

const handleErrorAction = (
  store: MiddlewareAPI<Dispatch<AnyAction>, RootState>,
  action: ErrorAction
) => {
  const { error, context, recoverable, silent, retryable } = action.payload;
  
  // Create error report
  const errorReport = errorReporting.createReport(error, {
    action: sanitizeError(action),
    context,
    recoverable,
    retryable,
  });

  // Skip user feedback if silent
  if (silent) {
    console.error('Silent error:', errorReport);
    return;
  }

  // Get recovery strategy
  const strategy = recoveryManager.getStrategy(errorReport.category, action.type);

  // Handle different error levels
  switch (errorReport.level) {
    case 'critical':
      handleCriticalError(store, errorReport, strategy);
      break;
    
    case 'high':
      handleHighError(store, errorReport, strategy);
      break;
    
    case 'medium':
      handleMediumError(store, errorReport, strategy);
      break;
    
    case 'low':
      handleLowError(store, errorReport, strategy);
      break;
  }

  // Attempt recovery if strategy exists
  if (strategy && recoveryManager.shouldRetry(errorReport.id, strategy)) {
    attemptRecovery(store, errorReport, strategy, action);
  }
};

const handleCriticalError = (
  store: MiddlewareAPI<Dispatch<AnyAction>, RootState>,
  report: ErrorReport,
  strategy?: ErrorRecoveryStrategy | null
) => {
  console.error('Critical error:', report);
  
  store.dispatch(showNotification({
    type: 'error',
    title: 'Critical Error',
    message: 'A critical error has occurred. The application may need to be restarted.',
    persistent: true,
    actions: [
      {
        label: 'Refresh Page',
        action: 'refresh_page',
        primary: true,
      },
      {
        label: 'Report Issue',
        action: 'report_issue',
      },
    ],
  }));

  store.dispatch(setStatusMessage('Critical error - application may be unstable'));
};

const handleHighError = (
  store: MiddlewareAPI<Dispatch<AnyAction>, RootState>,
  report: ErrorReport,
  strategy?: ErrorRecoveryStrategy | null
) => {
  console.error('High severity error:', report);
  
  let message = report.message;
  let actions: any[] = [];

  if (report.category === 'auth') {
    message = 'Authentication required. Please log in again.';
    actions = [
      {
        label: 'Log In',
        action: 'redirect_login',
        primary: true,
      },
    ];
  } else if (report.category === 'permission') {
    message = 'You do not have permission to perform this action.';
  } else if (report.metadata?.retryable) {
    actions = [
      {
        label: 'Retry',
        action: 'retry_action',
      },
    ];
  }

  store.dispatch(showNotification({
    type: 'error',
    title: 'Error',
    message,
    duration: 8000,
    actions,
  }));
};

const handleMediumError = (
  store: MiddlewareAPI<Dispatch<AnyAction>, RootState>,
  report: ErrorReport,
  strategy?: ErrorRecoveryStrategy | null
) => {
  console.warn('Medium severity error:', report);
  
  let message = report.message;
  let actions: any[] = [];

  if (report.metadata?.retryable) {
    actions = [
      {
        label: 'Retry',
        action: 'retry_action',
      },
    ];
  }

  store.dispatch(showNotification({
    type: 'warning',
    title: 'Warning',
    message,
    duration: 5000,
    actions,
  }));
};

const handleLowError = (
  store: MiddlewareAPI<Dispatch<AnyAction>, RootState>,
  report: ErrorReport,
  strategy?: ErrorRecoveryStrategy | null
) => {
  console.info('Low severity error:', report);
  
  // Only show notification for validation errors
  if (report.category === 'validation') {
    store.dispatch(showNotification({
      type: 'info',
      title: 'Validation Error',
      message: report.message,
      duration: 4000,
    }));
  }
};

const attemptRecovery = async (
  store: MiddlewareAPI<Dispatch<AnyAction>, RootState>,
  report: ErrorReport,
  strategy: ErrorRecoveryStrategy,
  originalAction: ErrorAction
) => {
  recoveryManager.recordRetryAttempt(report.id);

  switch (strategy.type) {
    case 'retry':
      if (strategy.delay) {
        await new Promise(resolve => setTimeout(resolve, strategy.delay));
      }
      
      // Re-dispatch original action (without error flag)
      const retryAction = { ...originalAction, error: false };
      store.dispatch(retryAction);
      break;

    case 'redirect':
      if (strategy.params?.path) {
        window.location.href = strategy.params.path;
      }
      break;

    case 'refresh':
      window.location.reload();
      break;

    case 'logout':
      // Dispatch logout action
      store.dispatch({ type: 'AUTH_LOGOUT' });
      break;

    case 'ignore':
      // Do nothing
      break;
  }
};

// ============================================================================
// Error Action Creators
// ============================================================================

export const createErrorAction = (
  type: string,
  error: any,
  context?: any,
  options?: {
    recoverable?: boolean;
    silent?: boolean;
    retryable?: boolean;
  }
): ErrorAction => ({
  type,
  error: true,
  payload: {
    error,
    context,
    ...options,
  },
});

// ============================================================================
// Error Reporting API
// ============================================================================

export const getErrorStats = () => errorReporting.getStats();
export const getErrorReports = (level?: ErrorReport['level']) => errorReporting.getReports(level);
export const clearErrorReports = () => errorReporting.clearReports();
export const setErrorReporting = (enabled: boolean) => errorReporting.setReportingEnabled(enabled);

export const setRecoveryStrategy = (key: string, strategy: ErrorRecoveryStrategy) => 
  recoveryManager.setStrategy(key, strategy);

// ============================================================================
// Global Error Handlers
// ============================================================================

// Handle unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    errorReporting.createReport(event.reason, {
      type: 'unhandled_promise_rejection',
      url: window.location.href,
    });
  });

  // Handle global JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    errorReporting.createReport(event.error, {
      type: 'global_error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      url: window.location.href,
    });
  });
}

export default errorMiddleware;
