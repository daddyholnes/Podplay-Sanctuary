/**
 * Core API Hook - useAPI
 * 
 * A comprehensive React hook that provides a unified interface for making API calls
 * with built-in error handling, loading states, caching, retries, and request cancellation.
 * This hook serves as the foundation for all API interactions in Podplay Sanctuary.
 * 
 * Features:
 * - Automatic loading state management
 * - Built-in error handling with retry logic
 * - Request cancellation support
 * - Response caching with TTL
 * - TypeScript support with generic types
 * - Optimistic updates
 * - Request deduplication
 * - Background refresh capabilities
 * 
 * @author Podplay Sanctuary Team
 * @version 1.0.0
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { APIClient } from '../../services/api/APIClient';
import { APIError } from '../../services/api/APIError';
import { CacheService } from '../../services/storage/CacheService';

export interface UseAPIOptions<T> {
  // Core options
  initialData?: T;
  enabled?: boolean;
  manual?: boolean;
  
  // Caching options
  cacheKey?: string;
  cacheTTL?: number;
  staleWhileRevalidate?: boolean;
  
  // Error handling
  retries?: number;
  retryDelay?: number;
  retryCondition?: (error: APIError) => boolean;
  
  // Performance options
  debounceMs?: number;
  throttleMs?: number;
  dedupe?: boolean;
  
  // Callbacks
  onSuccess?: (data: T) => void;
  onError?: (error: APIError) => void;
  onSettled?: (data: T | undefined, error: APIError | undefined) => void;
  
  // Transform
  select?: (data: any) => T;
  placeholderData?: T;
}

export interface UseAPIResult<T> {
  // Data state
  data: T | undefined;
  error: APIError | undefined;
  isLoading: boolean;
  isValidating: boolean;
  isError: boolean;
  isSuccess: boolean;
  
  // Actions
  execute: (...args: any[]) => Promise<T>;
  mutate: (data?: T | ((current: T | undefined) => T), revalidate?: boolean) => void;
  cancel: () => void;
  retry: () => Promise<T>;
  refresh: () => Promise<T>;
  
  // Metadata
  lastFetch: Date | undefined;
  fetchCount: number;
  retryCount: number;
}

interface RequestState<T> {
  data: T | undefined;
  error: APIError | undefined;
  isLoading: boolean;
  isValidating: boolean;
  lastFetch: Date | undefined;
  fetchCount: number;
  retryCount: number;
}

const activeRequests = new Map<string, Promise<any>>();
const cacheService = CacheService.getInstance();

export function useAPI<T = any>(
  apiCall: (...args: any[]) => Promise<T>,
  options: UseAPIOptions<T> = {}
): UseAPIResult<T> {
  const {
    initialData,
    enabled = true,
    manual = false,
    cacheKey,
    cacheTTL = 5 * 60 * 1000, // 5 minutes
    staleWhileRevalidate = false,
    retries = 3,
    retryDelay = 1000,
    retryCondition = (error) => error.statusCode >= 500,
    debounceMs = 0,
    throttleMs = 0,
    dedupe = true,
    onSuccess,
    onError,
    onSettled,
    select,
    placeholderData
  } = options;

  // State management
  const [state, setState] = useState<RequestState<T>>({
    data: initialData || placeholderData,
    error: undefined,
    isLoading: false,
    isValidating: false,
    lastFetch: undefined,
    fetchCount: 0,
    retryCount: 0
  });

  // Refs for cleanup and cancellation
  const abortControllerRef = useRef<AbortController>();
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const throttleTimeoutRef = useRef<NodeJS.Timeout>();
  const lastExecutionRef = useRef<number>(0);
  const argsRef = useRef<any[]>([]);

  // Generate cache key for request
  const getCacheKey = useCallback((args: any[]) => {
    if (cacheKey) {
      return `${cacheKey}:${JSON.stringify(args)}`;
    }
    return `api:${apiCall.name}:${JSON.stringify(args)}`;
  }, [cacheKey, apiCall]);

  // Cancel any ongoing request
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = undefined;
    }
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = undefined;
    }
    
    if (throttleTimeoutRef.current) {
      clearTimeout(throttleTimeoutRef.current);
      throttleTimeoutRef.current = undefined;
    }
  }, []);

  // Execute the API call
  const execute = useCallback(async (...args: any[]): Promise<T> => {
    const requestCacheKey = getCacheKey(args);
    
    // Handle deduplication
    if (dedupe && activeRequests.has(requestCacheKey)) {
      return activeRequests.get(requestCacheKey)!;
    }

    // Handle throttling
    if (throttleMs > 0) {
      const now = Date.now();
      const timeSinceLastExecution = now - lastExecutionRef.current;
      
      if (timeSinceLastExecution < throttleMs) {
        const delay = throttleMs - timeSinceLastExecution;
        await new Promise(resolve => {
          throttleTimeoutRef.current = setTimeout(resolve, delay);
        });
      }
      
      lastExecutionRef.current = Date.now();
    }

    // Check cache first
    if (cacheKey && !state.isValidating) {
      const cachedData = await cacheService.get<T>(requestCacheKey);
      if (cachedData) {
        setState(prev => ({
          ...prev,
          data: select ? select(cachedData) : cachedData,
          error: undefined,
          isLoading: false,
          isValidating: staleWhileRevalidate
        }));
        
        if (!staleWhileRevalidate) {
          return cachedData;
        }
      }
    }

    // Setup abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Update loading state
    setState(prev => ({
      ...prev,
      isLoading: !staleWhileRevalidate && !prev.data,
      isValidating: true,
      error: undefined
    }));

    const executeRequest = async (retryCount = 0): Promise<T> => {
      try {
        // Add signal to API call if it supports it
        const requestArgs = [...args];
        if (apiCall.length > args.length) {
          requestArgs.push({ signal });
        }

        const response = await apiCall(...requestArgs);
        
        if (signal.aborted) {
          throw new APIError('Request was cancelled', 'CANCELLED', 0);
        }

        const data = select ? select(response) : response;

        // Cache the response
        if (cacheKey) {
          await cacheService.set(requestCacheKey, response, cacheTTL);
        }

        // Update state
        setState(prev => ({
          ...prev,
          data,
          error: undefined,
          isLoading: false,
          isValidating: false,
          lastFetch: new Date(),
          fetchCount: prev.fetchCount + 1,
          retryCount: 0
        }));

        // Call success callback
        onSuccess?.(data);
        onSettled?.(data, undefined);

        return data;
      } catch (error) {
        if (signal.aborted) {
          throw error;
        }

        const apiError = error instanceof APIError ? error : new APIError(
          error instanceof Error ? error.message : 'Unknown error',
          'UNKNOWN_ERROR',
          0
        );

        // Check if we should retry
        if (retryCount < retries && retryCondition(apiError)) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, retryCount)));
          return executeRequest(retryCount + 1);
        }

        // Update error state
        setState(prev => ({
          ...prev,
          error: apiError,
          isLoading: false,
          isValidating: false,
          retryCount
        }));

        // Call error callback
        onError?.(apiError);
        onSettled?.(undefined, apiError);

        throw apiError;
      }
    };

    const promise = executeRequest();
    
    if (dedupe) {
      activeRequests.set(requestCacheKey, promise);
      promise.finally(() => {
        activeRequests.delete(requestCacheKey);
      });
    }

    return promise;
  }, [apiCall, options, state.isValidating, state.data]);

  // Debounced execute
  const debouncedExecute = useCallback((...args: any[]) => {
    if (debounceMs > 0) {
      return new Promise<T>((resolve, reject) => {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
        
        debounceTimeoutRef.current = setTimeout(() => {
          execute(...args).then(resolve).catch(reject);
        }, debounceMs);
      });
    }
    
    return execute(...args);
  }, [execute, debounceMs]);

  // Mutate data manually
  const mutate = useCallback((
    data?: T | ((current: T | undefined) => T),
    revalidate = true
  ) => {
    setState(prev => ({
      ...prev,
      data: typeof data === 'function' ? (data as Function)(prev.data) : data ?? prev.data
    }));
    
    if (revalidate && argsRef.current.length > 0) {
      execute(...argsRef.current);
    }
  }, [execute]);

  // Retry the last request
  const retry = useCallback(() => {
    if (argsRef.current.length > 0) {
      return execute(...argsRef.current);
    }
    return Promise.reject(new Error('No previous request to retry'));
  }, [execute]);

  // Refresh (bypass cache)
  const refresh = useCallback(async () => {
    if (cacheKey && argsRef.current.length > 0) {
      const requestCacheKey = getCacheKey(argsRef.current);
      await cacheService.delete(requestCacheKey);
    }
    return retry();
  }, [cacheKey, getCacheKey, retry]);

  // Auto-execute on mount if enabled and not manual
  useEffect(() => {
    if (enabled && !manual && !state.data && !state.isLoading) {
      execute().catch(() => {
        // Error is already handled in execute
      });
    }
  }, [enabled, manual]); // Only run on mount or when enabled/manual changes

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    // Data state
    data: state.data,
    error: state.error,
    isLoading: state.isLoading,
    isValidating: state.isValidating,
    isError: !!state.error,
    isSuccess: !state.isLoading && !state.error && state.data !== undefined,
    
    // Actions
    execute: debouncedExecute,
    mutate,
    cancel,
    retry,
    refresh,
    
    // Metadata
    lastFetch: state.lastFetch,
    fetchCount: state.fetchCount,
    retryCount: state.retryCount
  };
}

// Specialized hooks for common patterns
export function useQuery<T>(
  queryFn: () => Promise<T>,
  options: Omit<UseAPIOptions<T>, 'manual'> = {}
) {
  return useAPI(queryFn, { ...options, manual: false });
}

export function useMutation<T, TArgs extends any[] = any[]>(
  mutationFn: (...args: TArgs) => Promise<T>,
  options: Omit<UseAPIOptions<T>, 'enabled' | 'manual'> = {}
) {
  return useAPI(mutationFn, { ...options, manual: true, enabled: false });
}

export function useLazyQuery<T, TArgs extends any[] = any[]>(
  queryFn: (...args: TArgs) => Promise<T>,
  options: Omit<UseAPIOptions<T>, 'manual'> = {}
) {
  return useAPI(queryFn, { ...options, manual: true });
}
