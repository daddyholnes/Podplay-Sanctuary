// ChatService.ts - Service for interacting with the Mama Bear chat API
import { API_ENDPOINTS, buildApiUrl, buildDynamicApiUrl } from '../config/api';

// Type definitions for chat messages and sessions
export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  metadata?: {
    model?: string;
    tokens?: number;
    images?: string[];
    files?: string[];
    audioUrl?: string;
    videoUrl?: string;
    [key: string]: any;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  model_id: string;
  message_count: number;
  last_message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * ChatService - Handles all communication with the Mama Bear chat API
 * Provides functions for sending messages, managing sessions, and handling multimodal content
 */
class ChatService {
  /**
   * Fetch all available chat sessions
   * @returns Promise with array of chat sessions
   */
  async loadSessions(): Promise<ApiResponse<ChatSession[]>> {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.MAMA_BEAR.SESSIONS));
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
      return { 
        success: false, 
        error: 'Failed to load chat sessions. Please try again.' 
      };
    }
  }

  /**
   * Create a new chat session
   * @param title - Title for the new chat session
   * @param modelId - ID of the model to use for this session
   * @returns Promise with newly created session
   */
  async createSession(title: string, modelId: string): Promise<ApiResponse<ChatSession>> {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.MAMA_BEAR.SESSIONS), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, model_id: modelId }),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to create chat session:', error);
      return { 
        success: false, 
        error: 'Failed to create chat session. Please try again.' 
      };
    }
  }

  /**
   * Get messages for a specific chat session
   * @param sessionId - ID of the chat session
   * @returns Promise with array of messages
   */
  async getMessages(sessionId: string): Promise<ApiResponse<ChatMessage[]>> {
    try {
      const url = buildDynamicApiUrl(API_ENDPOINTS.VERTEX_GARDEN.SESSION_MESSAGES, { sessionId });
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Failed to load messages for session ${sessionId}:`, error);
      return { 
        success: false, 
        error: 'Failed to load chat messages. Please try again.' 
      };
    }
  }

  /**
   * Send a message to the chat API
   * @param sessionId - ID of the chat session
   * @param message - The message to send
   * @param attachments - Optional file attachments
   * @returns Promise with the API response containing the assistant's reply
   */
  async sendMessage(
    sessionId: string, 
    message: string,
    attachments?: File[]
  ): Promise<ApiResponse<ChatMessage>> {
    try {
      // Handle attachments if any
      let body;
      let headers = {};
      
      if (attachments && attachments.length > 0) {
        // Use FormData for multipart/form-data to handle file uploads
        const formData = new FormData();
        formData.append('message', message);
        formData.append('session_id', sessionId);
        
        // Add each attachment
        attachments.forEach((file, index) => {
          formData.append(`attachment_${index}`, file);
        });
        
        body = formData;
      } else {
        // Regular JSON request without attachments
        body = JSON.stringify({
          message,
          session_id: sessionId,
        });
        headers = {
          'Content-Type': 'application/json',
        };
      }

      const response = await fetch(buildApiUrl(API_ENDPOINTS.MAMA_BEAR.CHAT), {
        method: 'POST',
        headers,
        body,
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to send message:', error);
      return { 
        success: false, 
        error: 'Failed to send message. Please try again.' 
      };
    }
  }

  /**
   * Delete a chat session
   * @param sessionId - ID of the session to delete
   * @returns Promise with the API response
   */
  async deleteSession(sessionId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    try {
      const response = await fetch(`${buildApiUrl(API_ENDPOINTS.MAMA_BEAR.SESSIONS)}/${sessionId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Failed to delete session ${sessionId}:`, error);
      return { 
        success: false, 
        error: 'Failed to delete chat session. Please try again.' 
      };
    }
  }

  /**
   * Get available AI models for chat
   * @returns Promise with array of available models
   */
  async getAvailableModels(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.MAMA_BEAR.MODELS));
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch available models:', error);
      return { 
        success: false, 
        error: 'Failed to load available models. Please try again.' 
      };
    }
  }
  
  /**
   * Search chat memories
   * @param query - Search query string
   * @returns Promise with search results
   */
  async searchMemories(query: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${buildApiUrl(API_ENDPOINTS.MAMA_BEAR.MEMORIES_SEARCH)}?q=${encodeURIComponent(query)}`);
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
export const chatService = new ChatService();
export default chatService;
