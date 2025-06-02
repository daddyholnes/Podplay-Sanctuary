// MamaBearChatService.ts - Specialized service for the MamaBear chat interface
import { API_ENDPOINTS, buildApiUrl, buildDynamicApiUrl } from '../config/api';
import { ChatMessage, ChatSession, ApiResponse } from '../types/chat';

/**
 * MamaBearChatService - Handles all communication with the Mama Bear chat API
 * Specialized for the MamaBear interface with proper error handling and typing
 */
class MamaBearChatService {
  /**
   * Fetch all available chat sessions
   * @returns Promise with array of chat sessions
   */
  async getSessions(): Promise<ApiResponse<ChatSession[]>> {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.MAMA_BEAR.SESSIONS));
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching sessions:', errorData);
        return {
          status: 'error',
          error: errorData.error || `Failed with status ${response.status}`
        };
      }
      
      const data = await response.json();
      return {
        status: 'success',
        data: data
      };
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
      return { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Failed to load chat sessions'
      };
    }
  }

  /**
   * Get a specific chat session by ID
   * @param sessionId - ID of the chat session
   * @returns Promise with the chat session
   */
  async getSession(sessionId: string): Promise<ApiResponse<ChatSession>> {
    try {
      const response = await fetch(buildApiUrl(`${API_ENDPOINTS.MAMA_BEAR.SESSIONS}/${sessionId}`));
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Error fetching session ${sessionId}:`, errorData);
        return {
          status: 'error',
          error: errorData.error || `Failed with status ${response.status}`
        };
      }
      
      const data = await response.json();
      return {
        status: 'success',
        data: data
      };
    } catch (error) {
      console.error(`Failed to load session ${sessionId}:`, error);
      return { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Failed to load chat session'
      };
    }
  }

  /**
   * Create a new chat session
   * @param title - Title for the new chat session
   * @param type - Type of chat session (e.g., 'chat', 'project', 'code', etc.)
   * @param modelId - Optional ID of the model to use for this session
   * @returns Promise with newly created session
   */
  async createSession(
    title: string, 
    type: string = 'chat',
    modelId?: string
  ): Promise<ApiResponse<ChatSession>> {
    try {
      const payload = {
        title,
        type,
        ...(modelId && { model_id: modelId })
      };
      
      const response = await fetch(buildApiUrl(API_ENDPOINTS.MAMA_BEAR.SESSIONS), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error creating session:', errorData);
        return {
          status: 'error',
          error: errorData.error || `Failed with status ${response.status}`
        };
      }
      
      const data = await response.json();
      return {
        status: 'success',
        data: data
      };
    } catch (error) {
      console.error('Failed to create chat session:', error);
      return { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Failed to create chat session'
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
      const url = buildApiUrl(`${API_ENDPOINTS.MAMA_BEAR.SESSIONS}/${sessionId}/messages`);
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Error fetching messages for session ${sessionId}:`, errorData);
        return {
          status: 'error',
          error: errorData.error || `Failed with status ${response.status}`
        };
      }
      
      const data = await response.json();
      return {
        status: 'success',
        data: data
      };
    } catch (error) {
      console.error(`Failed to load messages for session ${sessionId}:`, error);
      return { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Failed to load chat messages'
      };
    }
  }

  /**
   * Send a message to the chat API
   * @param sessionId - ID of the chat session
   * @param content - The message content to send
   * @param attachments - Optional file attachments
   * @returns Promise with the API response containing the assistant's reply
   */
  async sendMessage(
    sessionId: string, 
    content: string,
    attachments?: File[]
  ): Promise<ApiResponse<ChatMessage>> {
    try {
      // Handle attachments if any
      let body;
      let headers = {};
      
      if (attachments && attachments.length > 0) {
        // Use FormData for multipart/form-data to handle file uploads
        const formData = new FormData();
        formData.append('content', content);
        formData.append('role', 'user');
        
        // Add each attachment
        attachments.forEach((file, index) => {
          formData.append(`attachment_${index}`, file);
        });
        
        body = formData;
      } else {
        // Regular JSON request without attachments
        body = JSON.stringify({
          content,
          role: 'user'
        });
        headers = {
          'Content-Type': 'application/json',
        };
      }

      const url = buildApiUrl(`${API_ENDPOINTS.MAMA_BEAR.SESSIONS}/${sessionId}/messages`);
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error sending message:', errorData);
        return {
          status: 'error',
          error: errorData.error || `Failed with status ${response.status}`
        };
      }
      
      const data = await response.json();
      return {
        status: 'success',
        data: data
      };
    } catch (error) {
      console.error('Failed to send message:', error);
      return { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Failed to send message'
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
      const response = await fetch(buildApiUrl(`${API_ENDPOINTS.MAMA_BEAR.SESSIONS}/${sessionId}`), {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Error deleting session ${sessionId}:`, errorData);
        return {
          status: 'error',
          error: errorData.error || `Failed with status ${response.status}`
        };
      }
      
      const data = await response.json();
      return {
        status: 'success',
        data: data
      };
    } catch (error) {
      console.error(`Failed to delete session ${sessionId}:`, error);
      return { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Failed to delete chat session'
      };
    }
  }
}

// Export a singleton instance
export const mamaBearChatService = new MamaBearChatService();
export default mamaBearChatService;
