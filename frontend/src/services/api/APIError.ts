/**
 * APIError - Custom error class for API-related errors
 * Provides detailed error information for debugging and user feedback
 */

export class APIError extends Error {
  public readonly status: number;
  public readonly endpoint: string;
  public readonly details: string;
  public readonly timestamp: Date;

  constructor(
    message: string,
    status: number = 0,
    endpoint: string = '',
    details: string = ''
  ) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.endpoint = endpoint;
    this.details = details;
    this.timestamp = new Date();

    // Ensure the error stack trace points to where the error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
    }
  }

  /**
   * Check if error is a network/connection error
   */
  get isNetworkError(): boolean {
    return this.status === 0 || this.message.includes('fetch');
  }

  /**
   * Check if error is a client error (4xx)
   */
  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if error is a server error (5xx)
   */
  get isServerError(): boolean {
    return this.status >= 500 && this.status < 600;
  }

  /**
   * Check if error is an authentication error
   */
  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /**
   * Check if error indicates rate limiting
   */
  get isRateLimitError(): boolean {
    return this.status === 429;
  }

  /**
   * Get user-friendly error message
   */
  get userMessage(): string {
    if (this.isNetworkError) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    
    if (this.isAuthError) {
      return 'Authentication failed. Please log in again.';
    }
    
    if (this.isRateLimitError) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    
    if (this.isServerError) {
      return 'Server error occurred. Please try again later.';
    }
    
    if (this.isClientError) {
      return 'Request failed. Please check your input and try again.';
    }
    
    return this.message || 'An unexpected error occurred.';
  }

  /**
   * Get error details for logging/debugging
   */
  toLogObject(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      endpoint: this.endpoint,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
      isNetworkError: this.isNetworkError,
      isClientError: this.isClientError,
      isServerError: this.isServerError,
      isAuthError: this.isAuthError,
      isRateLimitError: this.isRateLimitError,
    };
  }

  /**
   * Convert to JSON string for logging
   */
  toJSON(): string {
    return JSON.stringify(this.toLogObject(), null, 2);
  }

  /**
   * Create APIError from fetch error
   */
  static fromFetchError(error: Error, endpoint: string): APIError {
    return new APIError(
      `Network error: ${error.message}`,
      0,
      endpoint,
      error.name
    );
  }

  /**
   * Create APIError from HTTP response
   */
  static fromResponse(response: Response, endpoint: string, details?: string): APIError {
    return new APIError(
      `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      endpoint,
      details || response.statusText
    );
  }
}

export default APIError;
