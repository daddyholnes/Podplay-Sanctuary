import api from './api';

/**
 * Types for chat message handling
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  attachments?: ChatAttachment[];
}

export interface ChatAttachment {
  id: string;
  type: 'image' | 'audio' | 'video' | 'file';
  url: string;
  name: string;
  size: number;
  mimeType: string;
  thumbnail?: string;
}

export interface ChatSession {
  id: string;
  name: string;
  description?: string;
  created: string;
  updated: string;
  messages: ChatMessage[];
  stage: 'welcome' | 'planning' | 'workspace' | 'production';
}

/**
 * API services for Scout MultiModal Chat module
 * Handles all chat operations including multimodal inputs
 */
const chatApi = {
  // Session operations
  async getSessions(): Promise<ChatSession[]> {
    const response = await api.get('/chat/sessions');
    return response.data;
  },

  async getSession(sessionId: string): Promise<ChatSession> {
    const response = await api.get(`/chat/sessions/${sessionId}`);
    return response.data;
  },

  async createSession(name: string, description?: string): Promise<ChatSession> {
    const response = await api.post('/chat/sessions', { name, description });
    return response.data;
  },

  async updateSession(sessionId: string, updates: Partial<Omit<ChatSession, 'id' | 'messages'>>): Promise<ChatSession> {
    const response = await api.patch(`/chat/sessions/${sessionId}`, updates);
    return response.data;
  },

  async deleteSession(sessionId: string): Promise<void> {
    await api.delete(`/chat/sessions/${sessionId}`);
  },

  // Message operations
  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    const response = await api.get(`/chat/sessions/${sessionId}/messages`);
    return response.data;
  },

  async sendMessage(sessionId: string, message: string, attachments: File[] = []): Promise<ChatMessage> {
    // If no attachments, use regular JSON endpoint
    if (attachments.length === 0) {
      const response = await api.post(`/chat/sessions/${sessionId}/messages`, { content: message });
      return response.data;
    }
    
    // For attachments, we need to use FormData
    const formData = new FormData();
    formData.append('content', message);
    
    attachments.forEach((file, index) => {
      formData.append(`attachment_${index}`, file);
    });
    
    const response = await api.post(`/chat/sessions/${sessionId}/messages/multimodal`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },

  async deleteMessage(sessionId: string, messageId: string): Promise<void> {
    await api.delete(`/chat/sessions/${sessionId}/messages/${messageId}`);
  },

  // Stage management
  async updateStage(sessionId: string, stage: ChatSession['stage']): Promise<ChatSession> {
    const response = await api.patch(`/chat/sessions/${sessionId}/stage`, { stage });
    return response.data;
  },
  
  // File operations specific to chat
  async uploadAttachment(file: File): Promise<ChatAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/chat/attachments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },
  
  async getAttachment(attachmentId: string): Promise<ChatAttachment> {
    const response = await api.get(`/chat/attachments/${attachmentId}`);
    return response.data;
  },
  
  async deleteAttachment(attachmentId: string): Promise<void> {
    await api.delete(`/chat/attachments/${attachmentId}`);
  },

  // Audio recording
  async startAudioRecording(): Promise<{recordingId: string}> {
    const response = await api.post('/chat/audio/start-recording');
    return response.data;
  },
  
  async stopAudioRecording(recordingId: string): Promise<ChatAttachment> {
    const response = await api.post(`/chat/audio/stop-recording/${recordingId}`);
    return response.data;
  },
  
  // Speech-to-text
  async transcribeAudio(audioAttachmentId: string): Promise<{text: string}> {
    const response = await api.post(`/chat/speech-to-text/${audioAttachmentId}`);
    return response.data;
  }
};

export default chatApi;
