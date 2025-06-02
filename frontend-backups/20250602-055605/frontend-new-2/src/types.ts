
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  avatar?: string; // URL or identifier
  isStreaming?: boolean;
  metadata?: Record<string, any>; // For files, tool calls etc.
}

export enum ViewType {
  MamaBearChat = 'MamaBearChat', // Focused chat view
  UnifiedDevelopmentHub = 'UnifiedDevelopmentHub', // Core dynamic workspace
  ScoutAgentWorkspace = 'ScoutAgentWorkspace', // Focus on agent timeline/monitoring
  MamaBearControlCenter = 'MamaBearControlCenter', // System status, workspace management
  MiniAppsLauncher = 'MiniAppsLauncher', // Launcher for embedded mini-applications
}

export interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ReactNode; // For SVG icons
}

export interface PanelConfig {
  id: string;
  title: string;
  component: React.FC<any>; // Placeholder for panel components
  defaultSize?: string; // e.g. 'w-1/3', 'flex-1'
}

export enum PanelType {
  Editor = 'editor',
  Files = 'files',
  Terminal = 'terminal',
  Preview = 'preview',
  Timeline = 'timeline',
  Controls = 'controls',
}

export interface AgentStep {
  id: string;
  timestamp: Date;
  action: string; // e.g., "Thinking", "Called Tool: Code Interpreter", "Generated File: script.py"
  details?: string; // More details or code snippet
  status: 'running' | 'completed' | 'error';
  tool?: string;
}

export interface GeminiServiceError extends Error {
  isApiKeyError?: boolean;
  isQuotaError?: boolean;
}

export type MiniAppCategory = 'ai' | 'coding' | 'productivity' | 'utilities' | 'research' | 'google';

export interface MiniApp {
  id: string;
  name: string;
  url: string;
  category: MiniAppCategory;
  description: string;
  icon: React.ReactNode;
  featured?: boolean;
  requiresAuth?: boolean;
  isInternal?: boolean; // For Sanctuary internal tools
}
