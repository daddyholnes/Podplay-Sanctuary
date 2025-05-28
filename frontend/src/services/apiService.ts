import { API_BASE_URL, buildApiUrl, API_ENDPOINTS } from '../config/api';
import { notify } from './notificationService'; // Import notificationService

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  isBlob?: boolean; // To handle blob responses, e.g., for file downloads
}

async function request<T>(
  fullUrl: string, // Changed from 'endpoint' to 'fullUrl' for clarity
  options: ApiOptions = {}
): Promise<T> {
  const { method = 'GET', headers = {}, body, isBlob = false } = options;
  const config: RequestInit = {
    method,
    headers: {
      // Default to JSON, but allow override, especially for FormData
      ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
  };

  if (body) {
    // Don't stringify FormData
    config.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(fullUrl, config);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // If response is not JSON, use statusText or a generic message
        errorData = { message: response.statusText || `Server error: ${response.status}`, status: response.status };
      }
      const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
      notify.error(`API Error: ${errorMessage}`);
      throw new Error(errorMessage); // Throw after notifying
    }

    if (response.status === 204) { // No Content
      return null as T;
    }

    if (isBlob) {
      return response.blob() as Promise<T>;
    }

    return response.json();

  } catch (error) {
    // This catch block handles network errors or errors from the !response.ok block
    if (error instanceof Error) {
      // Check if the error message already indicates it's an API error that we've handled and notified
      // This is to prevent double notifications for errors thrown from the !response.ok block
      if (!error.message.includes('API Error:')) { // Check if we already prefixed it
          if (!(error instanceof DOMException && error.name === 'AbortError')) { // Don't notify for aborts
            notify.error(`Network or Request Error: ${error.message}`);
          }
      }
      throw error; // Re-throw the error to be caught by calling code if needed
    } else {
      // For unexpected error types
      notify.error('An unknown network error occurred.');
      throw new Error('An unknown network error occurred.');
    }
  }
}

// Helper to determine if a path is an API_ENDPOINTS key
function isApiEndpointKey(path: string): path is keyof typeof API_ENDPOINTS {
    // This is a simplified check. A more robust check might involve iterating through API_ENDPOINTS keys
    // or checking if buildApiUrl(path) throws an error or returns a valid URL.
    // For now, we assume paths not starting with '/' are keys.
    return !path.startsWith('/');
}

export const apiService = {
  get: <T>(pathOrKey: string, params?: Record<string, string | number | boolean>) => {
    let fullPath: string;
    if (isApiEndpointKey(pathOrKey)) {
      fullPath = buildApiUrl(pathOrKey);
    } else {
      fullPath = `${API_BASE_URL}${pathOrKey}`;
    }
    
    if (params) {
      const queryParams = new URLSearchParams(params as Record<string,string>).toString();
      fullPath = `${fullPath}?${queryParams}`;
    }
    return request<T>(fullPath);
  },

  post: <T>(pathOrKey: string, data: any, headers?: Record<string, string>) => {
    let fullPath: string;
    if (isApiEndpointKey(pathOrKey)) {
      fullPath = buildApiUrl(pathOrKey);
    } else {
      fullPath = `${API_BASE_URL}${pathOrKey}`;
    }
    return request<T>(fullPath, { method: 'POST', body: data, headers });
  },

  put: <T>(pathOrKey: string, data: any, headers?: Record<string, string>) => {
    let fullPath: string;
    if (isApiEndpointKey(pathOrKey)) {
      fullPath = buildApiUrl(pathOrKey);
    } else {
      fullPath = `${API_BASE_URL}${pathOrKey}`;
    }
    return request<T>(fullPath, { method: 'PUT', body: data, headers });
  },

  delete: <T>(pathOrKey: string, params?: Record<string, string | number>) => {
    let fullPath: string;
    if (isApiEndpointKey(pathOrKey)) {
      fullPath = buildApiUrl(pathOrKey);
    } else {
      fullPath = `${API_BASE_URL}${pathOrKey}`;
    }
    if (params) {
      const queryParams = new URLSearchParams(params as Record<string,string>).toString();
      fullPath = `${fullPath}?${queryParams}`;
    }
    return request<T>(fullPath, { method: 'DELETE' });
  },
  
  patch: <T>(pathOrKey: string, data: any, headers?: Record<string, string>) => {
    let fullPath: string;
    if (isApiEndpointKey(pathOrKey)) {
      fullPath = buildApiUrl(pathOrKey);
    } else {
      fullPath = `${API_BASE_URL}${pathOrKey}`;
    }
    return request<T>(fullPath, { method: 'PATCH', body: data, headers });
  },

  // Example for fetching a blob (e.g., a file)
  getBlob: (pathOrKey: string, params?: Record<string, string | number>) => {
    let fullPath: string;
    if (isApiEndpointKey(pathOrKey)) {
      fullPath = buildApiUrl(pathOrKey);
    } else {
      fullPath = `${API_BASE_URL}${pathOrKey}`;
    }
    if (params) {
      const queryParams = new URLSearchParams(params as Record<string,string>).toString();
      fullPath = `${fullPath}?${queryParams}`;
    }
    return request<Blob>(fullPath, { isBlob: true });
  },
};

// Example of how buildApiUrl might be structured (for context, not part of this file)
/*
// In frontend/src/config/api.ts
export const API_ENDPOINTS = {
  MCP: {
    SEARCH: 'MCP.SEARCH', // This would be a key that buildApiUrl resolves to an actual path
    INSTALL: 'MCP.INSTALL',
    CATEGORIES: 'MCP.CATEGORIES',
    DISCOVER: 'MCP.DISCOVER',
  },
  MAMA_BEAR: {
    BRIEFING: 'MAMA_BEAR.BRIEFING',
    CHAT: 'MAMA_BEAR.CHAT',
  },
  // ... other endpoints
};

export function buildApiUrl(endpointKey: keyof typeof API_ENDPOINTS, pathParams?: Record<string, string | number>): string {
  // Logic to map endpointKey to actual URL path
  // e.g., const path = resolvePathFromKey(endpointKey);
  // return `${API_BASE_URL}${path}`;
  return `${API_BASE_URL}/api/placeholder_for_key/${endpointKey}`; // Placeholder
}
*/
