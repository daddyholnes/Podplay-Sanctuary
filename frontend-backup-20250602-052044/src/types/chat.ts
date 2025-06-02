/**
 * Chat types for Podplay Sanctuary
 */

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  model_id: string;
  message_count: number;
  type: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  attachments?: Attachment[];
  metadata?: Record<string, any>;
  suggestions?: string[];
  actions?: string[];
}

export interface Attachment {
  id: string;
  type: 'image' | 'audio' | 'video' | 'file' | 'code';
  url: string;
  filename: string;
  mime_type: string;
  size?: number;
  metadata?: Record<string, any>;
}

export interface NewChatSessionRequest {
  title: string;
  model_id?: string;
  type?: string;
}

export interface NewChatMessageRequest {
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: Attachment[];
  metadata?: Record<string, any>;
}

export interface ApiError {
  status: 'error';
  error: string;
  code?: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: string;
  code?: string;
}
