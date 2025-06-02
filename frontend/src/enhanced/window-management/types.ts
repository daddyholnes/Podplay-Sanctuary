import { ReactNode } from 'react';

export interface Size {
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface WindowState {
  id: string;
  title: string;
  type: string;
  position: Position;
  size: Size;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  isFocused: boolean;
  createdAt: string;
  agentType?: string;
  agentState?: any;
}

export interface AgentProps {
  agentType: string;
  agentState: any;
  updateAgentState: (newState: any) => void;
}

export interface WindowDefinition {
  title: string;
  component: (props: AgentProps) => ReactNode;
  defaultSize: Size;
  minSize: Size;
  icon: string;
  category: string;
}

export interface WindowContextType {
  windows: WindowState[];
  activeWindowId: string | null;
  createWindow: (type: string, options?: Partial<WindowState>) => string;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, position: Position) => void;
  updateWindowSize: (id: string, size: Size) => void;
  getWindowState: (id: string) => WindowState | undefined;
  updateAgentState: (windowId: string, newState: any) => void;
}
