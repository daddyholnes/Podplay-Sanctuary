// Type definitions for the frontend application

export interface Message {
  id: number;
  text: string;
  sender?: string;
  timestamp: Date;
  type: string;
  files?: FileAttachment[];
  model?: string;
  tokens?: number;
  suggestions?: string[];
  actions?: string[];
}

export interface Chat {
  id: number;
  title: string;
  lastMessage: string;
  timestamp: string;
  messageCount: number;
  type: string;
}

export interface FileAttachment {
  id: number;
  name: string;
  size: number;
  type: string;
  preview?: string;
}

export interface AIModel {
  name: string;
  provider: string;
  icon: string;
  color: string;
  capabilities: string[];
  contextLength: string;
  pricing: string;
  rateLimit: string;
  knowledgeCutoff: string;
  specialties: string[];
  description: string;
  useCases: string[];
  badge?: string;
}

export interface Theme {
  bg: string;
  cardBg: string;
  border: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  button: string;
  accent: string;
}
