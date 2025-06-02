// Global type declarations for Podplay Sanctuary

// TypeScript support for environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    VITE_API_URL?: string;
    VITE_WS_URL?: string;
  }
}

// Support for Vite's import.meta.env
interface ImportMetaEnv {
  VITE_API_URL?: string;
  VITE_WS_URL?: string;
}

// Module declarations for internal services
declare module '@/services/collaboration/WorkspaceCollaboration' {
  const WorkspaceCollaboration: any;
  export default WorkspaceCollaboration;
}

declare module '@/services/git/EnhancedGitService' {
  const EnhancedGitService: any;
  export default EnhancedGitService;
}

declare module '@/services/monitoring/ResourceMonitor' {
  class ResourceMonitor {
    static getInstance(): ResourceMonitor;
    startMonitoring(workspaceId: string): Promise<void>;
    on(event: string, callback: (...args: any[]) => void): void;
  }
  export default ResourceMonitor;
}

declare module '@/services/agent-communication' {
  export interface AgentMessage {
    type: string;
    content: any;
    timestamp: number;
  }
  
  export class AgentCommunication {
    static getInstance(): AgentCommunication;
    sendMessage(message: AgentMessage): void;
    onMessage(callback: (message: AgentMessage) => void): void;
  }
  
  export default AgentCommunication;
}

declare module '@/services/agent-communication/types' {
  export interface AgentConfig {
    id: string;
    name: string;
    capabilities: string[];
  }
  
  export interface AgentStatus {
    isActive: boolean;
    lastSeen: Date;
  }
}

declare module '@/agents/MamaBearChat' {
  import { FC } from 'react';
  const MamaBearChat: FC<{
    agentId?: string;
    onMessage?: (message: string) => void;
  }>;
  export default MamaBearChat;
}

// Third-party module declarations
declare module 'react-resizable' {
  import { ComponentType, CSSProperties } from 'react';
  
  export interface ResizableProps {
    width: number;
    height: number;
    onResize?: (e: any, data: { size: { width: number; height: number } }) => void;
    onResizeStart?: (e: any, data: any) => void;
    onResizeStop?: (e: any, data: any) => void;
    draggableOpts?: any;
    minConstraints?: [number, number];
    maxConstraints?: [number, number];
    style?: CSSProperties;
    className?: string;
    children?: React.ReactNode;
  }
  
  const Resizable: ComponentType<ResizableProps>;
  export default Resizable;
  
  export const ResizableBox: ComponentType<ResizableProps>;
}

// Global types for the application
type WorkspacePanelProps = {
  workspaceId: string;
  className?: string;
  style?: React.CSSProperties;
};

type Alert = {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  timestamp: number;
  details?: any;
};
