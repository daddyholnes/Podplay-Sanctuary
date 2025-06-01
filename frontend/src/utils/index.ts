/**
 * Utils Index
 * 
 * Central export point for all utility modules.
 * Provides convenient access to all utility functions and classes.
 */

// Data formatting utilities
export * from './formatters';
export { default as formatters } from './formatters';

// Validation utilities
export * from './validators';
export { default as validators } from './validators';

// Application constants
export * from './constants';
export { default as constants } from './constants';

// Helper utilities
export * from './helpers';
export { default as helpers } from './helpers';

// Date and time utilities
export * from './date';
export { default as dateUtils } from './date';

// File system utilities
export * from './file';
export { default as fileUtils } from './file';

// Cryptography utilities
export * from './crypto';
export { default as cryptoUtils } from './crypto';

// Performance monitoring utilities
export * from './performance';
export { default as performanceUtils } from './performance';

// Accessibility utilities
export * from './accessibility';
export { default as accessibilityUtils } from './accessibility';

// Testing utilities
export * from './testing';
export { default as testingUtils } from './testing';

// Logging utilities
export * from './logger';
export { default as loggerUtils } from './logger';

/**
 * Unified utils object for convenient access
 */
export const utils = {
  // Data formatting
  formatters: require('./formatters').default,
  
  // Validation
  validators: require('./validators').default,
  
  // Constants
  constants: require('./constants').default,
  
  // Helpers
  helpers: require('./helpers').default,
  
  // Date utilities
  date: require('./date').default,
  
  // File utilities
  file: require('./file').default,
  
  // Crypto utilities
  crypto: require('./crypto').default,
  
  // Performance utilities
  performance: require('./performance').default,
  
  // Accessibility utilities
  accessibility: require('./accessibility').default,
  
  // Testing utilities
  testing: require('./testing').default,
  
  // Logger utilities
  logger: require('./logger').default,
};

/**
 * Common utility functions for quick access
 */
export const {
  // Format utilities
  formatFileSize,
  formatNumber,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  
  // Validation utilities
  isEmail,
  isURL,
  isPhoneNumber,
  validatePassword,
  
  // Helper utilities
  debounce,
  throttle,
  deepClone,
  deepMerge,
  
  // Date utilities
  isToday,
  isTomorrow,
  isYesterday,
  addDays,
  diffInDays,
  
  // File utilities
  getFileExtension,
  getFileName,
  isImageFile,
  isVideoFile,
  
  // Crypto utilities
  generateUUID,
  hashString,
  encryptData,
  decryptData,
  
  // Performance utilities
  performanceMonitor,
  
  // Logger
  logger,
} = {
  ...require('./formatters'),
  ...require('./validators'),
  ...require('./helpers'),
  ...require('./date'),
  ...require('./file'),
  ...require('./crypto'),
  ...require('./performance'),
  ...require('./logger'),
};

/**
 * Re-export types for convenience
 */
export type {
  // Formatter types
  FormatOptions,
  NumberFormatOptions,
  DateFormatOptions,
  
  // Validation types
  ValidationRule,
  ValidationResult,
  PasswordStrength,
  
  // File types
  FileInfo,
  FileValidationOptions,
  CompressionOptions,
  
  // Performance types
  PerformanceMeasurement,
  PerformanceMetric,
  
  // Logger types
  LogEntry,
  LoggerConfig,
  LogTransport,
} from './formatters';

// Re-export enums
export {
  LogLevel,
} from './logger';

/**
 * Utility initialization function
 */
export function initializeUtils(config?: {
  logger?: Partial<import('./logger').LoggerConfig>;
  performance?: Partial<import('./performance').PerformanceMonitor>;
}): void {
  // Initialize logger with custom config
  if (config?.logger) {
    const { logger } = require('./logger');
    logger.updateConfig(config.logger);
  }
  
  // Initialize performance monitoring
  if (config?.performance) {
    const { performanceMonitor } = require('./performance');
    // Apply performance config if needed
  }
  
  // Set up global error handling
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      const { logger } = require('./logger');
      logger.error('Global error caught', event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      const { logger } = require('./logger');
      logger.error('Unhandled promise rejection', event.reason, {
        type: 'unhandled_rejection',
      });
    });
  }
}

/**
 * Development mode utilities
 */
export const devUtils = {
  /**
   * Enable debug mode for all utilities
   */
  enableDebugMode(): void {
    const { logger } = require('./logger');
    logger.updateConfig({
      level: require('./logger').LogLevel.DEBUG,
      enableConsole: true,
      enableStorage: true,
    });
    
    const { performanceMonitor } = require('./performance');
    performanceMonitor.setEnabled(true);
  },
  
  /**
   * Disable debug mode
   */
  disableDebugMode(): void {
    const { logger } = require('./logger');
    logger.updateConfig({
      level: require('./logger').LogLevel.WARN,
      enableConsole: false,
      enableStorage: false,
    });
    
    const { performanceMonitor } = require('./performance');
    performanceMonitor.setEnabled(false);
  },
  
  /**
   * Get debug information
   */
  getDebugInfo(): {
    logger: any;
    performance: any;
    accessibility: any;
  } {
    const { logger } = require('./logger');
    const { performanceMonitor } = require('./performance');
    const { wcagChecker } = require('./accessibility');
    
    return {
      logger: {
        config: logger.getConfig(),
        logs: logger.exportLogs(),
        stats: logger.getStorageTransport()?.getLogs().length || 0,
      },
      performance: {
        measurements: performanceMonitor.getAllMeasurements(),
        metrics: performanceMonitor.getMetrics(),
        report: require('./performance').reportUtils.generateReport(),
      },
      accessibility: {
        audit: wcagChecker.checkPage(),
      },
    };
  },
  
  /**
   * Run comprehensive health check
   */
  healthCheck(): {
    overall: 'healthy' | 'warning' | 'critical';
    checks: {
      logger: boolean;
      performance: boolean;
      accessibility: boolean;
      memory: boolean;
    };
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    const checks = {
      logger: true,
      performance: true,
      accessibility: true,
      memory: true,
    };
    
    try {
      // Check logger
      const { logger } = require('./logger');
      logger.info('Health check - logger test');
    } catch (error) {
      checks.logger = false;
      recommendations.push('Logger is not functioning properly');
    }
    
    try {
      // Check performance monitoring
      const { performanceMonitor } = require('./performance');
      const measurements = performanceMonitor.getAllMeasurements();
      if (measurements.size === 0) {
        recommendations.push('No performance measurements found - consider enabling monitoring');
      }
    } catch (error) {
      checks.performance = false;
      recommendations.push('Performance monitoring is not functioning properly');
    }
    
    try {
      // Check accessibility
      const { wcagChecker } = require('./accessibility');
      const audit = wcagChecker.checkPage();
      if (audit.score < 80) {
        checks.accessibility = false;
        recommendations.push(`Accessibility score is low (${audit.score}/100)`);
      }
    } catch (error) {
      checks.accessibility = false;
      recommendations.push('Accessibility checking is not functioning properly');
    }
    
    try {
      // Check memory usage
      const { memoryUtils } = require('./performance');
      const memory = memoryUtils.getUsage();
      if (memory.used && memory.limit && (memory.used / memory.limit) > 0.9) {
        checks.memory = false;
        recommendations.push('High memory usage detected');
      }
    } catch (error) {
      recommendations.push('Unable to check memory usage');
    }
    
    const failedChecks = Object.values(checks).filter(check => !check).length;
    const overall = failedChecks === 0 ? 'healthy' : failedChecks <= 1 ? 'warning' : 'critical';
    
    return {
      overall,
      checks,
      recommendations,
    };
  },
};

/**
 * Production utilities
 */
export const prodUtils = {
  /**
   * Configure for production environment
   */
  configureForProduction(): void {
    const { logger } = require('./logger');
    logger.updateConfig({
      level: require('./logger').LogLevel.WARN,
      enableConsole: false,
      enableStorage: true,
      enableRemote: true,
      maxStorageEntries: 500,
    });
    
    const { performanceMonitor } = require('./performance');
    performanceMonitor.setEnabled(false);
  },
  
  /**
   * Report critical issues
   */
  reportCriticalIssue(error: Error, context?: Record<string, any>): void {
    const { logger } = require('./logger');
    logger.error('Critical issue reported', error, {
      ...context,
      critical: true,
      timestamp: new Date().toISOString(),
    });
  },
  
  /**
   * Monitor application health
   */
  startHealthMonitoring(interval: number = 60000): () => void {
    const intervalId = setInterval(() => {
      const health = devUtils.healthCheck();
      
      if (health.overall === 'critical') {
        this.reportCriticalIssue(
          new Error('Application health check failed'),
          { health }
        );
      }
    }, interval);
    
    return () => clearInterval(intervalId);
  },
};

/**
 * Default export combining all utilities
 */
export default {
  // Individual utility modules
  ...utils,
  
  // Quick access functions
  formatFileSize,
  formatNumber,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  isEmail,
  isURL,
  isPhoneNumber,
  validatePassword,
  debounce,
  throttle,
  deepClone,
  deepMerge,
  isToday,
  isTomorrow,
  isYesterday,
  addDays,
  diffInDays,
  getFileExtension,
  getFileName,
  isImageFile,
  isVideoFile,
  generateUUID,
  hashString,
  encryptData,
  decryptData,
  performanceMonitor,
  logger,
  
  // Initialization and configuration
  initializeUtils,
  devUtils,
  prodUtils,
};
