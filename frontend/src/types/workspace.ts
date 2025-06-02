// Shared type definitions for workspace components

export interface TimelineStep {
  id: string; // We consistently use string IDs throughout the app
  title: string;
  description: string;
  status: 'planning' | 'pending' | 'completed';
}

export interface GeneratedFile {
  id: string;
  name: string;
  type: string;
  icon?: string;
  status: string;
  content?: string;
  children?: GeneratedFile[];
}

// Agent update types
export interface BaseUpdate {
  id: string;
  type: string;
  timestamp: string;
}

export interface PlanUpdate extends BaseUpdate {
  payload: {
    id: string;
    steps: TimelineStep[];
  }
}

export interface FileUpdate extends BaseUpdate {
  payload: {
    id: string;
    name: string;
    type: string;
    status: string;
    content?: string;
    children?: any[];
  }
}