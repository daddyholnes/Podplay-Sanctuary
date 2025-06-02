// Workspace types for the Scout Dev Workspaces

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  type: WorkspaceType;
  template?: string;
  createdAt: string;
  updatedAt: string;
  lastAccessed?: string;
  files: WorkspaceFile[];
  gitRepo?: GitRepository;
  environment?: DevelopmentEnvironment;
}

export type WorkspaceType = 'web' | 'python' | 'nodejs' | 'react' | 'custom';

export interface WorkspaceFile {
  id: string;
  name: string;
  path: string;
  type: FileType;
  content?: string;
  size: number;
  lastModified: string;
  language?: string;
}

export type FileType = 'file' | 'directory';

export interface GitRepository {
  url: string;
  branch: string;
  lastCommit?: string;
  commitMessage?: string;
  status?: GitStatus[];
}

export interface GitStatus {
  file: string;
  status: 'modified' | 'added' | 'deleted' | 'renamed' | 'untracked';
}

export interface DevelopmentEnvironment {
  id: string;
  type: EnvironmentType;
  status: EnvironmentStatus;
  url?: string;
  resources: ResourceUsage;
}

export type EnvironmentType = 'container' | 'vm' | 'cloud' | 'local';

export type EnvironmentStatus = 
  | 'creating' 
  | 'running' 
  | 'stopped' 
  | 'paused' 
  | 'error' 
  | 'terminated';

export interface ResourceUsage {
  cpu: number; // percentage
  memory: number; // MB
  disk: number; // MB
  network: {
    up: number; // KB/s
    down: number; // KB/s
  };
}

// Workspace panel layout
export interface PanelLayout {
  id: string;
  type: PanelType;
  position: PanelPosition;
  size: PanelSize;
  visible: boolean;
  minimized: boolean;
  content?: any;
}

export type PanelType = 
  | 'explorer' 
  | 'editor' 
  | 'preview' 
  | 'terminal' 
  | 'chat' 
  | 'output'
  | 'resources'
  | 'custom';

export interface PanelPosition {
  x: number;
  y: number;
  zIndex: number;
}

export interface PanelSize {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}
