/**
 * APIClient - Centralized HTTP client for all API communications
 * Handles authentication, error handling, and request/response transformations
 */

import { APIError } from './APIError';
import { APIResponse, APIRequestConfig, APIEndpoint } from './APITypes';

export class APIClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private authToken?: string;

  constructor(baseURL: string = 'http://localhost:8000') {
    this.baseURL = baseURL.replace(/\/$/, ''); // Remove trailing slash
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Set authentication token for all requests
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Remove authentication token
   */
  clearAuthToken(): void {
    this.authToken = undefined;
  }

  /**
   * Get full URL for an endpoint
   */
  private getURL(endpoint: string): string {
    return `${this.baseURL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  }

  /**
   * Get headers for request including auth if available
   */
  private getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    return headers;
  }

  /**
   * Generic request method
   */
  private async request<T>(
    endpoint: string,
    config: APIRequestConfig = {}
  ): Promise<APIResponse<T>> {
    const {
      method = 'GET',
      data,
      headers: customHeaders,
      timeout = 30000,
      retries = 3,
    } = config;

    const url = this.getURL(endpoint);
    const headers = this.getHeaders(customHeaders);

    const fetchOptions: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(timeout),
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      fetchOptions.body = JSON.stringify(data);
    }

    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, fetchOptions);
        
        if (!response.ok) {
          throw new APIError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            endpoint,
            await response.text().catch(() => 'Unknown error')
          );
        }

        const responseData = await response.json();
        
        return {
          data: responseData,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
        };

      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on client errors (4xx) or auth errors
        if (error instanceof APIError && error.status >= 400 && error.status < 500) {
          throw error;
        }
        
        // Don't retry on last attempt
        if (attempt === retries) {
          break;
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw new APIError(
      `Request failed after ${retries + 1} attempts: ${lastError.message}`,
      0,
      endpoint,
      lastError.message
    );
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: Omit<APIRequestConfig, 'method' | 'data'>): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, config?: Omit<APIRequestConfig, 'method'>): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', data });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, config?: Omit<APIRequestConfig, 'method'>): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', data });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any, config?: Omit<APIRequestConfig, 'method'>): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', data });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: Omit<APIRequestConfig, 'method' | 'data'>): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * Get API status and version info
   */
  async getStatus(): Promise<APIResponse<{ status: string; version: string; timestamp: string }>> {
    return this.get('/status');
  }
}

// Export singleton instance
export const apiClient = new APIClient();
export default apiClient;
