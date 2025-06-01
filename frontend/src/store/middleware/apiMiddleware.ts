/**
 * API Middleware
 * 
 * Redux middleware for handling API calls, request/response intercepting,
 * error handling, retries, and state synchronization
 */

import { Middleware, MiddlewareAPI, Dispatch, AnyAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import { APIClient } from '../../services/api/APIClient';
import { APIError } from '../../services/api/APIError';
import { setLoadingState, showNotification } from '../slices/uiSlice';

// ============================================================================
// Types & Constants
// ============================================================================

interface ApiAction extends AnyAction {
  type: string;
  payload?: any;
  meta?: {
    api?: {
      endpoint: string;
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      data?: any;
      params?: Record<string, any>;
      headers?: Record<string, string>;
      timeout?: number;
      retries?: number;
      cache?: boolean;
      loadingKey?: string;
      successAction?: string;
      errorAction?: string;
      silent?: boolean;
      optimistic?: boolean;
    };
  };
}

const API_REQUEST = 'API_REQUEST';
const API_SUCCESS = 'API_SUCCESS';
const API_ERROR = 'API_ERROR';

// ============================================================================
// Helper Functions
// ============================================================================

const isApiAction = (action: AnyAction): action is ApiAction => {
  return action.meta?.api !== undefined;
};

const createApiRequestAction = (originalAction: ApiAction, requestId: string) => ({
  type: `${originalAction.type}_REQUEST`,
  payload: { requestId, ...originalAction.payload },
  meta: { ...originalAction.meta, requestId },
});

const createApiSuccessAction = (originalAction: ApiAction, data: any, requestId: string) => ({
  type: originalAction.meta?.api?.successAction || `${originalAction.type}_SUCCESS`,
  payload: { data, requestId, ...originalAction.payload },
  meta: { ...originalAction.meta, requestId },
});

const createApiErrorAction = (originalAction: ApiAction, error: APIError, requestId: string) => ({
  type: originalAction.meta?.api?.errorAction || `${originalAction.type}_ERROR`,
  payload: { error: error.toJSON(), requestId, ...originalAction.payload },
  meta: { ...originalAction.meta, requestId },
  error: true,
});

const generateRequestId = () => `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// ============================================================================
// Retry Logic
// ============================================================================

interface RetryConfig {
  maxRetries: number;
  backoffMultiplier: number;
  maxBackoffMs: number;
  retryableErrors: string[];
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  backoffMultiplier: 1.5,
  maxBackoffMs: 30000,
  retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', 'SERVER_ERROR'],
};

const shouldRetry = (error: APIError, retryCount: number, config: RetryConfig): boolean => {
  if (retryCount >= config.maxRetries) return false;
  if (error.status && error.status >= 400 && error.status < 500) return false; // Client errors
  return config.retryableErrors.includes(error.code);
};

const calculateBackoff = (retryCount: number, config: RetryConfig): number => {
  const backoff = Math.min(
    1000 * Math.pow(config.backoffMultiplier, retryCount),
    config.maxBackoffMs
  );
  // Add jitter to prevent thundering herd
  return backoff + Math.random() * 1000;
};

const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// Request Queue Management
// ============================================================================

interface QueuedRequest {
  action: ApiAction;
  requestId: string;
  retryCount: number;
  timestamp: number;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class RequestQueue {
  private queue: QueuedRequest[] = [];
  private processing = false;
  private maxConcurrent = 6;
  private activeRequests = 0;

  add(request: QueuedRequest): void {
    this.queue.push(request);
    if (!this.processing) {
      this.process();
    }
  }

  private async process(): Promise<void> {
    this.processing = true;

    while (this.queue.length > 0 && this.activeRequests < this.maxConcurrent) {
      const request = this.queue.shift();
      if (request) {
        this.activeRequests++;
        this.executeRequest(request).finally(() => {
          this.activeRequests--;
        });
      }
    }

    if (this.queue.length > 0) {
      // Check again after a short delay
      setTimeout(() => this.process(), 100);
    } else {
      this.processing = false;
    }
  }

  private async executeRequest(request: QueuedRequest): Promise<void> {
    try {
      const result = await this.makeApiCall(request);
      request.resolve(result);
    } catch (error) {
      request.reject(error);
    }
  }

  private async makeApiCall(request: QueuedRequest): Promise<any> {
    const { action, retryCount } = request;
    const apiConfig = action.meta!.api!;

    try {
      const apiClient = APIClient.getInstance();
      
      const response = await apiClient.request({
        url: apiConfig.endpoint,
        method: apiConfig.method || 'GET',
        data: apiConfig.data,
        params: apiConfig.params,
        headers: apiConfig.headers,
        timeout: apiConfig.timeout,
      });

      return response.data;
    } catch (error) {
      const apiError = error instanceof APIError ? error : APIError.fromError(error as Error);
      
      if (shouldRetry(apiError, retryCount, defaultRetryConfig)) {
        const backoffMs = calculateBackoff(retryCount, defaultRetryConfig);
        await delay(backoffMs);
        
        // Retry by adding back to queue
        const retryRequest: QueuedRequest = {
          ...request,
          retryCount: retryCount + 1,
        };
        
        return new Promise((resolve, reject) => {
          retryRequest.resolve = resolve;
          retryRequest.reject = reject;
          this.add(retryRequest);
        });
      }

      throw apiError;
    }
  }
}

const requestQueue = new RequestQueue();

// ============================================================================
// Cache Management
// ============================================================================

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
  key: string;
}

class ApiCache {
  private cache = new Map<string, CacheEntry>();
  private readonly defaultTtl = 5 * 60 * 1000; // 5 minutes

  generateKey(endpoint: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${endpoint}${paramString}`;
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: any, ttl = this.defaultTtl): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      key,
    });
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const regex = new RegExp(pattern);
    for (const [key] of this.cache) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

const apiCache = new ApiCache();

// Cleanup cache every 5 minutes
setInterval(() => apiCache.cleanup(), 5 * 60 * 1000);

// ============================================================================
// Middleware Implementation
// ============================================================================

export const apiMiddleware: Middleware<{}, RootState> = 
  (store: MiddlewareAPI<Dispatch<AnyAction>, RootState>) => 
  (next: Dispatch<AnyAction>) => 
  async (action: AnyAction) => {
    // Pass through non-API actions
    if (!isApiAction(action)) {
      return next(action);
    }

    const apiAction = action as ApiAction;
    const apiConfig = apiAction.meta!.api!;
    const requestId = generateRequestId();

    // Handle optimistic updates
    if (apiConfig.optimistic) {
      next(action);
    }

    // Set loading state
    const loadingKey = apiConfig.loadingKey || `api_${apiConfig.endpoint}`;
    store.dispatch(setLoadingState({ key: loadingKey, loading: true }));

    // Dispatch request action
    store.dispatch(createApiRequestAction(apiAction, requestId));

    try {
      let responseData: any;

      // Check cache for GET requests
      if (apiConfig.cache && (!apiConfig.method || apiConfig.method === 'GET')) {
        const cacheKey = apiCache.generateKey(apiConfig.endpoint, apiConfig.params);
        const cachedData = apiCache.get(cacheKey);
        
        if (cachedData) {
          responseData = cachedData;
        } else {
          responseData = await makeQueuedRequest(apiAction, requestId);
          apiCache.set(cacheKey, responseData);
        }
      } else {
        responseData = await makeQueuedRequest(apiAction, requestId);
        
        // Invalidate related cache entries for mutations
        if (apiConfig.method && apiConfig.method !== 'GET') {
          const basePath = apiConfig.endpoint.split('/')[0];
          apiCache.invalidate(basePath);
        }
      }

      // Dispatch success action
      store.dispatch(createApiSuccessAction(apiAction, responseData, requestId));

      // Show success notification if not silent
      if (!apiConfig.silent && apiConfig.method && apiConfig.method !== 'GET') {
        store.dispatch(showNotification({
          type: 'success',
          title: 'Request Successful',
          message: `${apiConfig.method} ${apiConfig.endpoint} completed successfully`,
          duration: 3000,
        }));
      }

      return responseData;

    } catch (error) {
      const apiError = error instanceof APIError ? error : APIError.fromError(error as Error);
      
      // Dispatch error action
      store.dispatch(createApiErrorAction(apiAction, apiError, requestId));

      // Show error notification if not silent
      if (!apiConfig.silent) {
        store.dispatch(showNotification({
          type: 'error',
          title: 'Request Failed',
          message: apiError.message,
          duration: 5000,
          actions: [
            {
              label: 'Retry',
              action: 'retry_request',
            },
            {
              label: 'Dismiss',
              action: 'dismiss',
            },
          ],
        }));
      }

      // Log error for debugging
      console.error('API Request Failed:', {
        endpoint: apiConfig.endpoint,
        method: apiConfig.method,
        error: apiError.toJSON(),
        requestId,
      });

      throw apiError;

    } finally {
      // Clear loading state
      store.dispatch(setLoadingState({ key: loadingKey, loading: false }));
    }
  };

// ============================================================================
// Helper Functions for Queue
// ============================================================================

const makeQueuedRequest = (action: ApiAction, requestId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const queuedRequest: QueuedRequest = {
      action,
      requestId,
      retryCount: 0,
      timestamp: Date.now(),
      resolve,
      reject,
    };

    requestQueue.add(queuedRequest);
  });
};

// ============================================================================
// Action Creators
// ============================================================================

export const createApiAction = (
  type: string,
  apiConfig: ApiAction['meta']['api'],
  payload?: any
): ApiAction => ({
  type,
  payload,
  meta: { api: apiConfig },
});

// Common API action creators
export const apiGet = (endpoint: string, params?: Record<string, any>, options?: Partial<ApiAction['meta']['api']>) =>
  createApiAction('API_GET', {
    endpoint,
    method: 'GET',
    params,
    cache: true,
    ...options,
  });

export const apiPost = (endpoint: string, data?: any, options?: Partial<ApiAction['meta']['api']>) =>
  createApiAction('API_POST', {
    endpoint,
    method: 'POST',
    data,
    ...options,
  });

export const apiPut = (endpoint: string, data?: any, options?: Partial<ApiAction['meta']['api']>) =>
  createApiAction('API_PUT', {
    endpoint,
    method: 'PUT',
    data,
    ...options,
  });

export const apiDelete = (endpoint: string, options?: Partial<ApiAction['meta']['api']>) =>
  createApiAction('API_DELETE', {
    endpoint,
    method: 'DELETE',
    ...options,
  });

// ============================================================================
// Cache Control
// ============================================================================

export const invalidateCache = (pattern?: string) => ({
  type: 'INVALIDATE_CACHE',
  payload: { pattern },
});

// Add cache invalidation to middleware
const originalMiddleware = apiMiddleware;
export const enhancedApiMiddleware: Middleware<{}, RootState> = 
  (store) => (next) => (action) => {
    // Handle cache invalidation
    if (action.type === 'INVALIDATE_CACHE') {
      apiCache.invalidate(action.payload?.pattern);
      return next(action);
    }

    return originalMiddleware(store)(next)(action);
  };

export default enhancedApiMiddleware;
