/**
 * Chat API Endpoints
 * Centralized chat-related API calls and data transformations
 */

import { apiClient } from '../APIClient';
import { 
  ChatSendRequest, 
  ChatResponse, 
  ChatHistoryResponse, 
  APIResponse 
} from '../APITypes';

export class ChatAPI {
  /**
   * Send a chat message
   */
  static async sendMessage(request: ChatSendRequest): Promise<ChatResponse> {
    const response = await apiClient.post<ChatResponse>('/api/chat/send', request);
    return response.data;
  }

  /**
   * Get chat history for a session
   */
  static async getHistory(sessionId?: string): Promise<ChatHistoryResponse> {
    const endpoint = sessionId ? `/api/chat/history?sessionId=${sessionId}` : '/api/chat/history';
    const response = await apiClient.get<ChatHistoryResponse>(endpoint);
    return response.data;
  }

  /**
   * Clear chat history
   */
  static async clearHistory(sessionId?: string): Promise<{ success: boolean; message: string }> {
    const data = sessionId ? { sessionId } : {};
    const response = await apiClient.post<{ success: boolean; message: string }>('/api/chat/clear', data);
    return response.data;
  }

  /**
   * Stream chat response (WebSocket-based)
   */
  static async streamMessage(
    request: ChatSendRequest, 
    onChunk: (chunk: string) => void,
    onComplete: (response: ChatResponse) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      // For now, fallback to regular API call
      // TODO: Implement WebSocket streaming
      const response = await this.sendMessage(request);
      
      // Simulate streaming by chunking the response
      const words = response.response.split(' ');
      for (let i = 0; i < words.length; i++) {
        setTimeout(() => {
          onChunk(words[i] + (i < words.length - 1 ? ' ' : ''));
          if (i === words.length - 1) {
            onComplete(response);
          }
        }, i * 50); // 50ms delay between words
      }
    } catch (error) {
      onError(error as Error);
    }
  }

  /**
   * Get chat session info
   */
  static async getSessionInfo(sessionId: string): Promise<{
    id: string;
    created: string;
    messageCount: number;
    lastActivity: string;
  }> {
    const response = await apiClient.get(`/api/chat/session/${sessionId}`);
    return response.data;
  }

  /**
   * Create a new chat session
   */
  static async createSession(name?: string): Promise<{
    sessionId: string;
    name: string;
    created: string;
  }> {
    const response = await apiClient.post('/api/chat/session', { name });
    return response.data;
  }

  /**
   * Delete a chat session
   */
  static async deleteSession(sessionId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`/api/chat/session/${sessionId}`);
    return response.data;
  }

  /**
   * Export chat history as various formats
   */
  static async exportHistory(
    sessionId: string, 
    format: 'json' | 'markdown' | 'txt'
  ): Promise<{ data: string; filename: string }> {
    const response = await apiClient.get(
      `/api/chat/export/${sessionId}?format=${format}`
    );
    return response.data;
  }

  /**
   * Search chat history
   */
  static async searchHistory(
    query: string, 
    sessionId?: string
  ): Promise<{
    results: Array<{
      messageId: string;
      content: string;
      timestamp: string;
      sessionId: string;
      relevanceScore: number;
    }>;
    totalFound: number;
  }> {
    const params = new URLSearchParams({ query });
    if (sessionId) params.append('sessionId', sessionId);
    
    const response = await apiClient.get(`/api/chat/search?${params}`);
    return response.data;
  }
}

export default ChatAPI;
