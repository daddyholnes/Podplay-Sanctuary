// Core Types for PodPlay Sanctuary

export interface User {
  id: string;
  name: string;
  email: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'purple-neon';
  fontSize: 'small' | 'medium' | 'large';
  animations: boolean;
  notifications: boolean;
  sensoryMode: boolean;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'assistant';
  content: string;
  attachments?: Attachment[];
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  project_type: 'research' | 'planning' | 'technical' | 'project' | 'general';
  message_count: number;
  updated_at: string;
  mem0_conversation_id?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document';
  size: number;
  url: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: 'gemini' | 'openai' | 'anthropic';
  capabilities: string[];
  pricing: {
    input: number;
    output: number;
  };
  context_length: number;
  rate_limits: {
    rpm: number;
    rpd?: number;
  };
  knowledge_cutoff?: string;
  badges?: string[];
}

export interface Workspace {
  id: string;
  name: string;
  template_type: 'nixos' | 'docker' | 'codespace' | 'oracle';
  status: 'creating' | 'running' | 'stopped' | 'error';
  configuration: Record<string, any>;
  access_url?: string;
  created_at: string;
}

export interface MCPPackage {
  id: string;
  name: string;
  description: string;
  marketplace: 'github' | 'docker' | 'custom';
  version: string;
  capabilities: string[];
  rating: number;
  downloads: number;
  installation_status?: 'installing' | 'installed' | 'failed';
}

export interface MiniApp {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  category: string;
  isActive?: boolean;
}

export interface ChatState {
  conversations: Conversation[];
  currentConversation?: Conversation;
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
}

export interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaces: string[];
  isCreating: boolean;
}

export interface MCPState {
  packages: MCPPackage[];
  installedPackages: string[];
  isSearching: boolean;
  searchQuery: string;
  selectedCategory?: string;
}

// API Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// WebSocket Events
export interface SocketEvents {
  'message:new': Message;
  'message:typing': { user_id: string; is_typing: boolean };
  'conversation:updated': Conversation;
  'workspace:status': { workspace_id: string; status: Workspace['status'] };
  'workspace:output': { workspace_id: string; output: string };
  'mcp:install:progress': { package_id: string; progress: number };
  'mcp:install:complete': { package_id: string; success: boolean };
  'file:upload:progress': { file_id: string; progress: number };
}