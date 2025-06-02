/**
 * Agent communication types
 */

// Agent types supported by the system
export type AgentType = 'mama-bear' | 'scout' | 'workspace';

// Agent message interface
export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  attachments?: Array<{
    id: string;
    type: string;
    url?: string;
    data?: string;
    name: string;
    size?: number;
  }>;
  metadata?: Record<string, any>;
}

// Agent session interface
export interface AgentSession {
  id: string;
  agentType: AgentType;
  name: string;
  created: string;
  lastActive: string;
  messageCount: number;
  metadata?: Record<string, any>;
}

// Agent state interface
export interface AgentState {
  currentTask?: string;
  status: 'idle' | 'thinking' | 'working' | 'error';
  progress?: number;
  memory?: {
    shortTerm: Array<{key: string, value: any}>;
    longTerm: Array<{key: string, value: any}>;
  };
  context?: Record<string, any>;
}

// Agent capabilities
export interface AgentCapabilities {
  canSearch: boolean;
  canUseTools: boolean;
  canCreateFiles: boolean;
  canModifyFiles: boolean;
  canExecuteCode: boolean;
  canBrowseWeb: boolean;
  maxContextSize: number;
  supportedAttachmentTypes: string[];
}

// Agent response with action
export interface AgentResponse extends AgentMessage {
  actions?: Array<{
    type: string;
    parameters: Record<string, any>;
    description: string;
    status: 'pending' | 'completed' | 'failed';
  }>;
  suggestions?: string[];
}
