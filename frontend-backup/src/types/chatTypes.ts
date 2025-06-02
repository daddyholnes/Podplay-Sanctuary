/**
 * Chat types for the MamaBear chat interface
 */
import { ReactNode } from 'react';

export interface ChatSession {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  type: 'chat' | 'code' | 'web' | 'image' | 'default';
}

export interface ChatMessage {
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

export interface FormattedChatMessage extends Omit<ChatMessage, 'created_at'> {
  created_at: Date;
  timestamp?: Date;
  isLoading?: boolean;
  isError?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  status: string;
  message?: string;
  success?: boolean;
  statusText?: string;
  error?: string;
}

export interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  variant?: 'purple' | 'default';
  duration: number;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  type?: 'item' | 'divider';
  onClick: () => void;
}

export interface MamaBearMainChatProps {
  className?: string;
}

export interface ThemeStyles {
  bg: string;
  cardBg: string;
  border: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  input: string;
  button: string;
  accent: string;
}
