import { EventEmitter } from 'events';

export type AIErrorCode = 
  | 'API_ERROR'
  | 'RATE_LIMIT_EXCEEDED' 
  | 'INVALID_REQUEST'
  | 'MODEL_UNAVAILABLE'
  | 'TOKEN_LIMIT_EXCEEDED'
  | 'AUTHENTICATION_FAILED'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'QUOTA_EXCEEDED'
  | 'CONTENT_FILTER'
  | 'UNKNOWN_ERROR';

export interface AIError {
  code: AIErrorCode;
  message: string;
  details?: any;
  timestamp: Date;
  retryable: boolean;
  retryAfter?: number;
  model?: string;
  requestId?: string;
}

export interface ErrorRecoveryStrategy {
  code: AIErrorCode;
  maxRetries: number;
  backoffMultiplier: number;
  baseDelay: number;
  fallbackModel?: string;
  fallbackAction?: () => Promise<any>;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorsByCode: Map<AIErrorCode, number>;
  errorsByModel: Map<string, number>;
  recoveryAttempts: number;
  successfulRecoveries: number;
  averageRecoveryTime: number;
}

export class AIErrorHandler extends EventEmitter {
  private retryStrategies = new Map<AIErrorCode, ErrorRecoveryStrategy>();
  private activeRetries = new Map<string, number>();
  private metrics: ErrorMetrics = {
    totalErrors: 0,
    errorsByCode: new Map(),
    errorsByModel: new Map(),
    recoveryAttempts: 0,
    successfulRecoveries: 0,
    averageRecoveryTime: 0
  };

  constructor() {
    super();
    this.setupDefaultStrategies();
  }

  private setupDefaultStrategies(): void {
    // Rate limiting - exponential backoff
    this.retryStrategies.set('RATE_LIMIT_EXCEEDED', {
      code: 'RATE_LIMIT_EXCEEDED',
      maxRetries: 5,
      backoffMultiplier: 2,
      baseDelay: 1000,
      fallbackModel: 'gemini-pro'
    });

    // Network errors - quick retry
    this.retryStrategies.set('NETWORK_ERROR', {
      code: 'NETWORK_ERROR',
      maxRetries: 3,
      backoffMultiplier: 1.5,
      baseDelay: 500
    });

    // Timeout errors - moderate retry
    this.retryStrategies.set('TIMEOUT_ERROR', {
      code: 'TIMEOUT_ERROR',
      maxRetries: 3,
      backoffMultiplier: 2,
      baseDelay: 2000
    });

    // Model unavailable - try fallback
    this.retryStrategies.set('MODEL_UNAVAILABLE', {
      code: 'MODEL_UNAVAILABLE',
      maxRetries: 2,
      backoffMultiplier: 1,
      baseDelay: 1000,
      fallbackModel: 'gemini-pro'
    });

    // Token limit - no retry, immediate fallback
    this.retryStrategies.set('TOKEN_LIMIT_EXCEEDED', {
      code: 'TOKEN_LIMIT_EXCEEDED',
      maxRetries: 0,
      backoffMultiplier: 1,
      baseDelay: 0,
      fallbackAction: this.handleTokenLimitExceeded.bind(this)
    });

    // Content filter - no retry
    this.retryStrategies.set('CONTENT_FILTER', {
      code: 'CONTENT_FILTER',
      maxRetries: 0,
      backoffMultiplier: 1,
      baseDelay: 0,
      fallbackAction: this.handleContentFilter.bind(this)
    });

    // Authentication - single retry
    this.retryStrategies.set('AUTHENTICATION_FAILED', {
      code: 'AUTHENTICATION_FAILED',
      maxRetries: 1,
      backoffMultiplier: 1,
      baseDelay: 1000,
      fallbackAction: this.handleAuthenticationFailure.bind(this)
    });

    // API errors - moderate retry
    this.retryStrategies.set('API_ERROR', {
      code: 'API_ERROR',
      maxRetries: 2,
      backoffMultiplier: 1.5,
      baseDelay: 1000
    });

    // Invalid request - no retry
    this.retryStrategies.set('INVALID_REQUEST', {
      code: 'INVALID_REQUEST',
      maxRetries: 0,
      backoffMultiplier: 1,
      baseDelay: 0
    });

    // Quota exceeded - long backoff
    this.retryStrategies.set('QUOTA_EXCEEDED', {
      code: 'QUOTA_EXCEEDED',
      maxRetries: 2,
      backoffMultiplier: 3,
      baseDelay: 60000, // 1 minute
      fallbackModel: 'gemini-pro'
    });

    // Unknown errors - conservative retry
    this.retryStrategies.set('UNKNOWN_ERROR', {
      code: 'UNKNOWN_ERROR',
      maxRetries: 1,
      backoffMultiplier: 2,
      baseDelay: 2000
    });
  }

  async handleError(
    error: Error | AIError, 
    context: {
      operation?: string;
      model?: string;
      requestId?: string;
      retryContext?: string;
    } = {}
  ): Promise<never> {
    const aiError = this.normalizeError(error, context);
    this.updateMetrics(aiError);
    
    const retryKey = context.retryContext || `${aiError.code}_${Date.now()}`;
    const currentRetries = this.activeRetries.get(retryKey) || 0;
    
    this.emit('error', aiError);
    
    const strategy = this.retryStrategies.get(aiError.code);
    
    if (strategy && currentRetries < strategy.maxRetries && aiError.retryable) {
      this.activeRetries.set(retryKey, currentRetries + 1);
      this.metrics.recoveryAttempts++;
      
      const delay = this.calculateDelay(strategy, currentRetries);
      
      this.emit('retryAttempt', {
        error: aiError,
        attempt: currentRetries + 1,
        maxRetries: strategy.maxRetries,
        delay
      });
      
      await this.delay(delay);
      
      // If there's a fallback action, try it
      if (strategy.fallbackAction) {
        try {
          const recoveryStartTime = Date.now();
          await strategy.fallbackAction();
          
          this.metrics.successfulRecoveries++;
          const recoveryTime = Date.now() - recoveryStartTime;
          this.updateRecoveryTime(recoveryTime);
          
          this.activeRetries.delete(retryKey);
          this.emit('recovered', aiError);
          
          // Don't throw - recovery was successful
          return;
        } catch (recoveryError) {
          // Recovery failed, continue with normal error handling
        }
      }
      
      // Return a recovery instruction instead of throwing
      throw new Error(`Retry attempt ${currentRetries + 1}/${strategy.maxRetries} for ${aiError.code}`);
    }
    
    this.activeRetries.delete(retryKey);
    
    // Try fallback model if available
    if (strategy?.fallbackModel && context.model !== strategy.fallbackModel) {
      this.emit('fallbackModel', {
        originalModel: context.model,
        fallbackModel: strategy.fallbackModel,
        error: aiError
      });
      
      throw new Error(`Fallback to model: ${strategy.fallbackModel}`);
    }
    
    // No more recovery options
    this.emit('unrecoverable', aiError);
    throw this.createUserFriendlyError(aiError);
  }

  private normalizeError(error: Error | AIError, context: any): AIError {
    if (this.isAIError(error)) {
      return error;
    }

    const message = error.message.toLowerCase();
    let code: AIErrorCode = 'UNKNOWN_ERROR';
    let retryable = true;
    let retryAfter: number | undefined;

    // Classify error based on message content
    if (message.includes('rate limit') || message.includes('429')) {
      code = 'RATE_LIMIT_EXCEEDED';
      retryAfter = this.extractRetryAfter(error.message);
    } else if (message.includes('token limit') || message.includes('context length')) {
      code = 'TOKEN_LIMIT_EXCEEDED';
      retryable = false;
    } else if (message.includes('model') && message.includes('unavailable')) {
      code = 'MODEL_UNAVAILABLE';
    } else if (message.includes('authentication') || message.includes('401')) {
      code = 'AUTHENTICATION_FAILED';
    } else if (message.includes('network') || message.includes('connection')) {
      code = 'NETWORK_ERROR';
    } else if (message.includes('timeout')) {
      code = 'TIMEOUT_ERROR';
    } else if (message.includes('quota') || message.includes('billing')) {
      code = 'QUOTA_EXCEEDED';
    } else if (message.includes('content filter') || message.includes('safety')) {
      code = 'CONTENT_FILTER';
      retryable = false;
    } else if (message.includes('invalid') || message.includes('400')) {
      code = 'INVALID_REQUEST';
      retryable = false;
    } else if (message.includes('api') || message.includes('500')) {
      code = 'API_ERROR';
    }

    return {
      code,
      message: error.message,
      details: error.stack,
      timestamp: new Date(),
      retryable,
      retryAfter,
      model: context.model,
      requestId: context.requestId
    };
  }

  private isAIError(error: any): error is AIError {
    return error && typeof error.code === 'string' && error.timestamp instanceof Date;
  }

  private extractRetryAfter(message: string): number | undefined {
    const match = message.match(/retry after (\d+)/i);
    return match ? parseInt(match[1]) * 1000 : undefined;
  }

  private calculateDelay(strategy: ErrorRecoveryStrategy, attempt: number): number {
    const exponentialDelay = strategy.baseDelay * Math.pow(strategy.backoffMultiplier, attempt);
    const jitter = Math.random() * 0.1 * exponentialDelay; // Add 10% jitter
    return Math.min(exponentialDelay + jitter, 60000); // Cap at 1 minute
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private updateMetrics(error: AIError): void {
    this.metrics.totalErrors++;
    
    const currentCount = this.metrics.errorsByCode.get(error.code) || 0;
    this.metrics.errorsByCode.set(error.code, currentCount + 1);
    
    if (error.model) {
      const modelCount = this.metrics.errorsByModel.get(error.model) || 0;
      this.metrics.errorsByModel.set(error.model, modelCount + 1);
    }
  }

  private updateRecoveryTime(recoveryTime: number): void {
    const totalTime = this.metrics.averageRecoveryTime * (this.metrics.successfulRecoveries - 1);
    this.metrics.averageRecoveryTime = (totalTime + recoveryTime) / this.metrics.successfulRecoveries;
  }

  private async handleTokenLimitExceeded(): Promise<void> {
    this.emit('tokenLimitExceeded');
    // Could implement context truncation here
    throw new Error('Response truncated due to token limit. Please use a shorter prompt or break down your request.');
  }

  private async handleContentFilter(): Promise<void> {
    this.emit('contentFiltered');
    throw new Error('Content was filtered due to safety policies. Please rephrase your request.');
  }

  private async handleAuthenticationFailure(): Promise<void> {
    this.emit('authenticationFailed');
    // Could trigger re-authentication flow here
    throw new Error('Authentication failed. Please check your API credentials.');
  }

  private createUserFriendlyError(error: AIError): Error {
    const userMessages: Record<AIErrorCode, string> = {
      'RATE_LIMIT_EXCEEDED': 'Too many requests. Please wait a moment and try again.',
      'TOKEN_LIMIT_EXCEEDED': 'Your request is too long. Please shorten it and try again.',
      'MODEL_UNAVAILABLE': 'The AI model is temporarily unavailable. Trying backup model...',
      'AUTHENTICATION_FAILED': 'Authentication failed. Please check your credentials.',
      'NETWORK_ERROR': 'Network connection failed. Please check your internet connection.',
      'TIMEOUT_ERROR': 'Request timed out. Please try again.',
      'QUOTA_EXCEEDED': 'Usage quota exceeded. Please check your billing settings.',
      'CONTENT_FILTER': 'Content was blocked by safety filters. Please rephrase your request.',
      'INVALID_REQUEST': 'Invalid request format. Please check your input.',
      'API_ERROR': 'API service error. Please try again later.',
      'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again.'
    };

    const userMessage = userMessages[error.code] || error.message;
    const friendlyError = new Error(userMessage);
    
    // Preserve original error details for debugging
    (friendlyError as any).originalError = error;
    
    return friendlyError;
  }

  setRetryStrategy(code: AIErrorCode, strategy: Partial<ErrorRecoveryStrategy>): void {
    const existing = this.retryStrategies.get(code);
    this.retryStrategies.set(code, {
      code,
      maxRetries: strategy.maxRetries ?? existing?.maxRetries ?? 1,
      backoffMultiplier: strategy.backoffMultiplier ?? existing?.backoffMultiplier ?? 1.5,
      baseDelay: strategy.baseDelay ?? existing?.baseDelay ?? 1000,
      fallbackModel: strategy.fallbackModel ?? existing?.fallbackModel,
      fallbackAction: strategy.fallbackAction ?? existing?.fallbackAction
    });
  }

  getMetrics(): ErrorMetrics {
    return {
      ...this.metrics,
      errorsByCode: new Map(this.metrics.errorsByCode),
      errorsByModel: new Map(this.metrics.errorsByModel)
    };
  }

  getErrorHistory(limit: number = 10): AIError[] {
    // This would typically come from a persistent store
    // For now, we'll return an empty array as this is just the structure
    return [];
  }

  clearMetrics(): void {
    this.metrics = {
      totalErrors: 0,
      errorsByCode: new Map(),
      errorsByModel: new Map(),
      recoveryAttempts: 0,
      successfulRecoveries: 0,
      averageRecoveryTime: 0
    };
  }

  isRetryable(error: AIError): boolean {
    return error.retryable && (this.retryStrategies.get(error.code)?.maxRetries || 0) > 0;
  }

  getRecommendedAction(error: AIError): string {
    const strategy = this.retryStrategies.get(error.code);
    
    if (!strategy) {
      return 'Please try again later.';
    }

    if (strategy.maxRetries === 0) {
      return 'This error cannot be automatically resolved. Please check your input.';
    }

    if (strategy.fallbackModel) {
      return `Will retry with ${strategy.fallbackModel} model.`;
    }

    if (strategy.fallbackAction) {
      return 'Attempting automatic recovery...';
    }

    return `Will retry up to ${strategy.maxRetries} times with increasing delays.`;
  }
}
