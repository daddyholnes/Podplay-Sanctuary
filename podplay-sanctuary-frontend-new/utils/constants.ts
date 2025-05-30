
import { MiniApp } from '../types';

// Note: Using process.env.VITE_... as defined in vite.config.ts's 'define' block.
// Vite will replace these with string literals during the build.

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // VITE_API_BASE_URL?: string; // No longer directly used for the API_BASE_URL constant
      // VITE_SOCKET_URL?: string; // No longer directly used for the SOCKET_URL constant
      VITE_APP_TITLE?: string;
      VITE_APP_VERSION?: string;
    }
  }
}

// For development, Vite's proxy handles routing.
// API calls should target relative paths that the proxy can catch.
export const API_BASE_URL = '/api'; 

// Socket.io client will connect to the current host if no URL is provided,
// or if '/' is provided. This allows Vite's proxy for /socket.io to work.
export const SOCKET_URL = '/'; 

// These can still use the Vite define mechanism if needed.
export const APP_TITLE = process.env.VITE_APP_TITLE || 'Podplay Sanctuary';
export const APP_VERSION = process.env.VITE_APP_VERSION || '1.0.0';

export const SECTIONS = [
  { id: 'mama-bear', name: 'Mama Bear Hub', path: '/', icon: '🐻' },
  { id: 'vertex-garden', name: 'Vertex Garden', path: '/vertex-garden', icon: '🌿' },
  { id: 'mini-apps', name: 'Mini Apps', path: '/mini-apps', icon: '🚀' },
  { id: 'workspaces', name: 'Workspaces', path: '/workspaces', icon: '🛠️' },
  { id: 'scout-agent', name: 'Scout Agent', path: '/scout', icon: '🎯' },
];

export const DEFAULT_MINI_APPS: MiniApp[] = [
  { id: 'github', name: 'GitHub', url: 'https://github.com', icon: '🐙', category: 'development', description: 'Code hosting and collaboration.' },
  { id: 'claude', name: 'Claude AI', url: 'https://claude.ai', icon: '💬', category: 'ai', description: 'Conversational AI assistant.' },
  { id: 'vscode', name: 'VS Code Web', url: 'https://vscode.dev', icon: '💻', category: 'development', description: 'Online code editor.' },
  { id: 'figma', name: 'Figma', url: 'https://figma.com', icon: '🎨', category: 'design', description: 'Collaborative design tool.' },
  { id: 'excalidraw', name: 'Excalidraw', url: 'https://excalidraw.com', icon: '✏️', category: 'design', description: 'Virtual whiteboard.' },
  { id: 'linear', name: 'Linear', url: 'https://linear.app', icon: '📊', category: 'project management', description: 'Issue tracking and project management.' },
];

export const DEFAULT_MODEL_OPTIONS: { id: string, name: string }[] = [
  { id: 'gemini-pro', name: 'Gemini Pro' },
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
  { id: 'gpt-4o', name: 'GPT-4o (Mock)'}, // Assuming backend supports this or similar
];

export const ENVIRONMENT_TYPES = [
  { id: 'codespaces', name: 'GitHub Codespaces' },
  { id: 'nixos', name: 'NixOS Environment' },
  { id: 'vm', name: 'Oracle VM' },
  { id: 'docker', name: 'Docker Container' },
];

export const COMMON_PACKAGES = ['Node.js', 'Python', 'Java', 'Go', 'Rust', 'Git'];
export const MCP_SERVER_TYPES = ['Web API', 'Database', 'Cache', 'Message Queue', 'Auth Service'];
