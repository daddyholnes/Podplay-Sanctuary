
export interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'mama-bear' | 'scout' | 'gemini' | 'claude'; // Added more senders
  timestamp: string;
  section: string;
  attachments?: { name: string; type: string; data: string; size?: number }[]; // Store processed file info
  isLoading?: boolean; // For optimistic UI updates
}

export interface MiniApp {
  id: string;
  name: string;
  url: string;
  icon: string; // Can be emoji or path to an SVG/image
  category: string;
  description?: string;
  allowedDomains?: string[];
  theme?: 'light' | 'dark' | 'auto';
}

export interface Environment {
  id: string;
  name: string;
  type: 'codespaces' | 'nixos' | 'vm' | string; // Allow string for custom types
  status: 'running' | 'stopped' | 'pending' | 'error' | string;
  packages?: string[];
  mcpServers?: string[];
  repository?: string;
  lastUsed?: string; // ISO date string
}

export interface Task {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  progress?: number; // 0-100
  currentStep?: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string; // ISO date string
  event: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
}

// API Response Types (examples)
export interface DailyBriefingResponse {
  briefing: string;
  date: string;
}

export interface MemorySearchResult {
  id: string;
  content: string;
  timestamp: string;
  relevance: number;
}

export interface CodeAnalysisResponse {
  analysisId: string;
  summary: string;
  suggestions: string[];
  language: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string; // e.g., "Google", "Anthropic"
  capabilities: string[]; // e.g., ["text", "image", "audio"]
}

export interface WorkspaceCreationResponse {
  workspaceId: string;
  status: string;
  message: string;
}

export interface ActiveWorkspaceResponse extends Environment {}

export interface ScoutRequestResponse {
  taskId: string;
  status: string;
  message: string;
}

export interface ScoutTimelineResponse {
  taskId: string;
  timeline: TimelineEvent[];
}

// From Zustand store definition
export type Theme = 'light' | 'dark';
export type ScoutStatus = 'idle' | 'working' | 'error';

export interface AttachmentFile {
  name: string;
  type: string;
  data: string; // base64 data URL
  size: number;
}
