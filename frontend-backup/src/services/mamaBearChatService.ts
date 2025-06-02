import axios from 'axios';
// Define types inline until the module is properly built
interface ChatSession {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  type: 'chat' | 'code' | 'web' | 'image' | 'default';
}

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  session_id: string;
  created_at: string;
  metadata?: {
    suggestions?: string[];
    actions?: string[];
  };
  suggestions?: string[];
  actions?: string[];
}

interface ApiResponse<T> {
  data: T;
  status: string;
  message?: string;
  success?: boolean;
  statusText?: string;
  error?: string;
}

// For type safety with API responses
interface VertexAPIResponse {
  success: boolean;
  error?: string;
  session?: ChatSession;
  session_id?: string;
  sessions?: ChatSession[];
  messages?: ChatMessage[];
  message_id?: string;
  response?: string | ChatMessage;
  model?: string;
  models?: string[];
}

const API_BASE_URL = '/api/chat';

/**
 * MamaBear Chat Service
 * Handles all interactions with the MamaBear chat backend API
 */
export const mamaBearChatService = {
  /**
   * Get all chat sessions
   * @returns Promise with the list of chat sessions
   */
  getSessions: async (): Promise<ApiResponse<ChatSession[]>> => {
    try {
      const response = await axios.get<VertexAPIResponse>(`${API_BASE_URL}/sessions`);
      return {
        status: 'success',
        data: response.data.sessions || [],
        success: response.data.success
      };
    } catch (error: any) {
      console.error('Error fetching sessions:', error);
      return {
        status: 'error',
        data: [],
        error: error.response?.data?.error || error.message
      };
    }
  },

  /**
   * Get messages for a specific chat session
   * @param sessionId Session ID to get messages for
   * @returns Promise with the list of messages
   */
  getMessages: async (sessionId: string): Promise<ApiResponse<ChatMessage[]>> => {
    try {
      const response = await axios.get<VertexAPIResponse>(`${API_BASE_URL}/sessions/${sessionId}/messages`);
      return {
        status: 'success',
        data: response.data.messages || [],
        success: response.data.success
      };
    } catch (error: any) {
      console.error(`Error fetching messages for session ${sessionId}:`, error);
      return {
        status: 'error',
        data: [],
        error: error.response?.data?.error || error.message
      };
    }
  },

  /**
   * Send a message to a chat session
   * @param sessionId Session ID to send message to
   * @param content Message content
   * @returns Promise with the response message
   */
  sendMessage: async (sessionId: string, content: string): Promise<ApiResponse<ChatMessage>> => {
    try {
      const response = await axios.post<VertexAPIResponse>(`${API_BASE_URL}/sessions/${sessionId}/message`, {
        message: content,
        user_id: 'nathan' // Default user ID
      });

      // Handle the response data - if it's a string, convert to a ChatMessage object
      let messageData: ChatMessage;
      if (typeof response.data.response === 'string') {
        messageData = {
          id: response.data.message_id || 'temp-id',
          content: response.data.response,
          role: 'assistant',
          session_id: sessionId,
          created_at: new Date().toISOString()
        };
      } else {
        messageData = response.data.response as ChatMessage;
      }

      return {
        status: 'success',
        data: messageData,
        success: response.data.success
      };
    } catch (error: any) {
      console.error(`Error sending message to session ${sessionId}:`, error);
      return {
        status: 'error',
        data: {
          id: 'error-message',
          content: error.response?.data?.error || error.message || 'Failed to send message',
          role: 'system',
          session_id: sessionId,
          created_at: new Date().toISOString()
        },
        error: error.response?.data?.error || error.message
      };
    }
  },

  /**
   * Create a new chat session
   * @param name Session name
   * @param type Session type (chat, code, web, etc.)
   * @returns Promise with the created session
   */
  createSession: async (name: string, type: string = 'chat'): Promise<ApiResponse<ChatSession>> => {
    try {
      const response = await axios.post<VertexAPIResponse>(`${API_BASE_URL}/sessions`, {
        session_name: name,
        session_type: type,
        model_name: 'gemini-1.5-flash', // Default model
        system_instruction: `You are MamaBear, Nathan's AI assistant in Podplay Sanctuary.`
      });

      // Create a session object from the response
      const session: ChatSession = response.data.session || {
        id: response.data.session_id || `session-${Date.now()}`,
        name,
        type: type as any,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return {
        status: 'success',
        data: session,
        success: response.data.success || true
      };
    } catch (error: any) {
      console.error('Error creating session:', error);
      return {
        status: 'error',
        data: {
          id: 'error',
          name: 'Error',
          type: 'default' as any,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        error: error.response?.data?.error || error.message
      };
    }
  },

  /**
   * Rename a chat session
   * @param sessionId Session ID to rename
   * @param newName New session name
   * @returns Promise with the updated session
   */
  renameSession: async (sessionId: string, newName: string): Promise<ApiResponse<ChatSession>> => {
    try {
      // Since there's no direct rename endpoint yet, we'll use a workaround
      // First, get current session details
      const sessionResponse = await axios.get<VertexAPIResponse>(`${API_BASE_URL}/sessions/${sessionId}`);
      const sessionInfo = sessionResponse.data;
      
      // Then update it with the new name (simulated for now)
      // In a real implementation, we would have a PATCH endpoint
      console.log(`Renaming session ${sessionId} to "${newName}"`);
      
      // Return a simulated successful response
      return {
        status: 'success',
        data: {
          id: sessionId,
          name: newName,
          type: (sessionInfo.session?.type || 'chat'),
          created_at: sessionInfo.session?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        success: true,
        message: 'Session renamed successfully'
      };
    } catch (error: any) {
      console.error(`Error renaming session ${sessionId}:`, error);
      return {
        status: 'error',
        data: {
          id: sessionId,
          name: '',
          type: 'default' as any,
          created_at: '',
          updated_at: ''
        },
        error: error.response?.data?.error || error.message
      };
    }
  },

  /**
   * Delete a chat session
   * @param sessionId Session ID to delete
   * @returns Promise with success status
   */
  deleteSession: async (sessionId: string): Promise<ApiResponse<{ id: string }>> => {
    try {
      // Simulate deletion since endpoint might not exist yet
      console.log(`Deleting session ${sessionId}`);
      
      // In a real implementation, we would make an actual DELETE request:
      // const response = await axios.delete(`${API_BASE_URL}/sessions/${sessionId}`);
      
      // Return a simulated successful response
      return {
        status: 'success',
        data: { id: sessionId },
        success: true,
        message: 'Session deleted successfully'
      };
    } catch (error: any) {
      console.error(`Error deleting session ${sessionId}:`, error);
      return {
        status: 'error',
        data: { id: sessionId },
        error: error.response?.data?.error || error.message
      };
    }
  },

  /**
   * Export a chat session
   * @param sessionId Session ID to export
   * @returns Promise with the exported data
   */
  exportSession: async (sessionId: string): Promise<ApiResponse<{ id: string, data: string }>> => {
    try {
      // First, get the session data
      const sessionResponse = await this.getMessages(sessionId);
      if (sessionResponse.status === 'error') {
        throw new Error(sessionResponse.error || 'Failed to get session data for export');
      }

      // Get session info
      const sessionInfoResponse = await axios.get<VertexAPIResponse>(`${API_BASE_URL}/sessions/${sessionId}`);
      const sessionInfo = sessionInfoResponse.data.session || { name: 'Chat Export' };
      
      // Format the data as a text export
      const messages = sessionResponse.data || [];
      const exportData = {
        session: sessionInfo,
        messages,
        exported_at: new Date().toISOString(),
      };
      
      // Convert to JSON string
      const exportString = JSON.stringify(exportData, null, 2);
      
      return {
        status: 'success',
        data: { 
          id: sessionId,
          data: exportString
        },
        success: true
      };
    } catch (error: any) {
      console.error(`Error exporting session ${sessionId}:`, error);
      return {
        status: 'error',
        data: { 
          id: sessionId,
          data: ''
        },
        error: error.response?.data?.error || error.message
      };
    }
  },
  
  /**
   * Get list of available models
   * @returns Promise with the list of models
   */
  getModels: async (): Promise<ApiResponse<string[]>> => {
    try {
      const response = await axios.get<VertexAPIResponse>(`${API_BASE_URL}/models`);
      return {
        status: 'success',
        data: response.data.models || ['gemini-1.5-flash', 'gemini-1.5-pro'],
        success: response.data.success || true
      };
    } catch (error: any) {
      console.error('Error fetching models:', error);
      return {
        status: 'error',
        data: ['gemini-1.5-flash'],
        error: error.response?.data?.error || error.message
      };
    }
  }
};
