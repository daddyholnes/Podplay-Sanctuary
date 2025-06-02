// SearchService.ts - Service for browser search and research functionalities
import { API_ENDPOINTS, buildApiUrl } from '../config/api';

// Type definitions for search results
export interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: string;
  publication_date?: string;
  favicon_url?: string;
  image_url?: string;
  score?: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total_results: number;
  search_time_ms: number;
  page: number;
  has_more: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * SearchService - Handles web search and research functionalities
 * Integrates with the MCP search endpoints for deep research
 */
class SearchService {
  /**
   * Perform a web search
   * @param query - Search query string
   * @param page - Page number for pagination
   * @param perPage - Results per page
   * @returns Promise with search results
   */
  async webSearch(
    query: string,
    page: number = 1,
    perPage: number = 10
  ): Promise<ApiResponse<SearchResponse>> {
    try {
      const url = new URL(buildApiUrl(API_ENDPOINTS.MCP.SEARCH));
      url.searchParams.append('q', query);
      url.searchParams.append('page', String(page));
      url.searchParams.append('per_page', String(perPage));
      
      const response = await fetch(url.toString());
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to perform web search:', error);
      return {
        success: false,
        error: 'Failed to perform web search. Please try again.'
      };
    }
  }

  /**
   * Search for specific information with deep research
   * @param query - Research query
   * @param options - Additional research options
   * @returns Promise with research results
   */
  async deepResearch(
    query: string,
    options: {
      depth?: 'shallow' | 'medium' | 'deep';
      sources?: string[];
      trustLevel?: 'low' | 'medium' | 'high';
      format?: 'summary' | 'detailed' | 'raw';
    } = {}
  ): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.MCP.DISCOVER), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          options,
        }),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to perform deep research:', error);
      return {
        success: false,
        error: 'Failed to perform deep research. Please try again.'
      };
    }
  }

  /**
   * Get trending topics for research
   * @param category - Optional category filter
   * @returns Promise with trending topics
   */
  async getTrendingTopics(category?: string): Promise<ApiResponse<any[]>> {
    try {
      const url = new URL(buildApiUrl(API_ENDPOINTS.MCP.TRENDING));
      if (category) {
        url.searchParams.append('category', category);
      }
      
      const response = await fetch(url.toString());
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch trending topics:', error);
      return {
        success: false,
        error: 'Failed to fetch trending topics. Please try again.'
      };
    }
  }

  /**
   * Save a search result to memory for future reference
   * @param result - Search result to save
   * @returns Promise with save status
   */
  async saveToMemory(result: SearchResult): Promise<ApiResponse<{ saved: boolean }>> {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.MAMA_BEAR.MEMORIES_SEARCH), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(result),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to save search result to memory:', error);
      return {
        success: false,
        error: 'Failed to save to memory. Please try again.'
      };
    }
  }

  /**
   * Search saved memories
   * @param query - Search query string
   * @returns Promise with memory search results
   */
  async searchMemories(query: string): Promise<ApiResponse<SearchResult[]>> {
    try {
      const url = new URL(buildApiUrl(API_ENDPOINTS.MAMA_BEAR.MEMORIES_SEARCH));
      url.searchParams.append('q', query);
      
      const response = await fetch(url.toString());
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to search memories:', error);
      return {
        success: false,
        error: 'Failed to search memories. Please try again.'
      };
    }
  }
}

// Export a singleton instance
export const searchService = new SearchService();
export default searchService;
