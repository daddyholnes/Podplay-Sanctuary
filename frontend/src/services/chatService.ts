import api from './api';
import { ChatSession, ChatMessage, MessageRole } from '@/types/chat';

export const chatService = {
  // Sessions
  getSessions: async (): Promise<ChatSession[]> => {
    try {
      const response = await api.get('/sessions');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      throw error;
    }
  },

  createSession: async (model: string, systemInstruction?: string): Promise<ChatSession> => {
    try {
      const response = await api.post('/sessions', {
        model_name: model,
        system_instruction: systemInstruction
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  },

  updateSession: async (sessionId: string, name: string): Promise<ChatSession> => {
    try {
      const response = await api.put(`/sessions/${sessionId}`, { name });
      return response.data;
    } catch (error) {
      console.error(`Failed to update session ${sessionId}:`, error);
      throw error;
    }
  },

  deleteSession: async (sessionId: string): Promise<void> => {
    try {
      await api.delete(`/sessions/${sessionId}`);
    } catch (error) {
      console.error(`Failed to delete session ${sessionId}:`, error);
      throw error;
    }
  },

  // Messages
  getMessages: async (sessionId: string): Promise<ChatMessage[]> => {
    try {
      const response = await api.get(`/sessions/${sessionId}/messages`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch messages for session ${sessionId}:`, error);
      throw error;
    }
  },

  sendMessage: async (
    sessionId: string, 
    content: string,
    role: MessageRole = 'user',
    attachments?: File[]
  ): Promise<ChatMessage> => {
    try {
      let payload: any = { 
        role,
        content 
      };
      
      // If there are attachments, use FormData
      if (attachments && attachments.length > 0) {
        const formData = new FormData();
        formData.append('role', role);
        formData.append('content', content);
        
        attachments.forEach((file, index) => {
          formData.append(`file${index}`, file);
        });
        
        const response = await api.post(`/sessions/${sessionId}/messages`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      } else {
        // Regular JSON payload if no attachments
        const response = await api.post(`/sessions/${sessionId}/messages`, payload);
        return response.data;
      }
    } catch (error) {
      console.error(`Failed to send message to session ${sessionId}:`, error);
      throw error;
    }
  },

  // Export
  exportSession: async (sessionId: string, format: 'json' | 'markdown' | 'html' = 'markdown'): Promise<Blob> => {
    try {
      const response = await api.get(`/sessions/${sessionId}/export?format=${format}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to export session ${sessionId}:`, error);
      throw error;
    }
  }
};

export default chatService;
