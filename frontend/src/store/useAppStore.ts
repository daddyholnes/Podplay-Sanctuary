import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Main Podplay Sanctuary application store
 * Provides global state management for all core modules
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  attachments?: Array<{
    type: 'image' | 'video' | 'audio' | 'file';
    url: string;
    name: string;
  }>;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  model?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  content?: string;
  icon?: string;
  children?: WorkspaceFile[];
}

export interface Workspace {
  id: string;
  name: string;
  template: string;
  icon: string;
  color: string;
  files: WorkspaceFile[];
  isMinimized: boolean;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface McpPackage {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  stars: number;
  downloads: number;
  lastUpdated: string;
  categories: string[];
  tags: string[];
  repository: string;
  isInstalled: boolean;
}

interface AppState {
  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  // Chat Sessions
  chatSessions: ChatSession[];
  currentChatSessionId: string | null;
  createChatSession: (title: string, model?: string) => Promise<ChatSession>;
  selectChatSession: (sessionId: string) => void;
  addMessageToChatSession: (sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => Promise<ChatMessage>;
  loadChatSessions: () => Promise<void>;
  
  // Workspaces
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
  createWorkspace: (workspace: Omit<Workspace, 'id'>) => void;
  selectWorkspace: (workspaceId: string) => void;
  updateWorkspacePosition: (workspaceId: string, position: Partial<Workspace['position']>) => void;
  toggleWorkspaceMinimized: (workspaceId: string) => void;
  
  // MCP Marketplace
  mcpPackages: McpPackage[];
  installedPackageIds: Set<string>;
  loadMcpPackages: () => Promise<void>;
  installPackage: (packageId: string) => Promise<void>;
  uninstallPackage: (packageId: string) => Promise<void>;

  // Browser Integration
  browserUrl: string;
  setBrowserUrl: (url: string) => void;
  
  // API Status
  isApiReady: boolean;
  apiError: string | null;
  checkApiStatus: () => Promise<void>;
}

const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme
      isDarkMode: true,
      toggleDarkMode: () => set(state => ({ isDarkMode: !state.isDarkMode })),
      
      // Chat Sessions
      chatSessions: [],
      currentChatSessionId: null,
      createChatSession: async (title: string, model?: string) => {
        try {
          // API call would go here in production
          const newSession: ChatSession = {
            id: `session-${Date.now()}`,
            title,
            messages: [],
            model: model || 'gemini-2.5-pro',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set(state => ({
            chatSessions: [...state.chatSessions, newSession],
            currentChatSessionId: newSession.id,
          }));
          
          return newSession;
        } catch (error) {
          console.error('Error creating chat session:', error);
          throw error;
        }
      },
      selectChatSession: (sessionId: string) => {
        set({ currentChatSessionId: sessionId });
      },
      addMessageToChatSession: async (sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
        try {
          // In production, this would call the backend API
          const newMessage: ChatMessage = {
            ...message,
            id: `msg-${Date.now()}`,
            timestamp: new Date().toISOString(),
          };
          
          set(state => ({
            chatSessions: state.chatSessions.map(session => 
              session.id === sessionId
                ? {
                    ...session,
                    messages: [...session.messages, newMessage],
                    updatedAt: new Date().toISOString(),
                  }
                : session
            ),
          }));
          
          // If this is a user message, we would typically also get an AI response here
          // For now, we'll just return the message we added
          return newMessage;
        } catch (error) {
          console.error('Error adding message to chat session:', error);
          throw error;
        }
      },
      loadChatSessions: async () => {
        try {
          // In production, this would call the backend API
          // For now, we'll use mock data if the store is empty
          const { chatSessions } = get();
          
          if (chatSessions.length === 0) {
            // Add some mock data
            set({
              chatSessions: [
                {
                  id: 'session-1',
                  title: 'Podplay Studio Architecture',
                  messages: [
                    {
                      id: 'msg-1',
                      role: 'user',
                      content: 'Can you help me design the Podplay Studio architecture?',
                      timestamp: new Date(Date.now() - 3600000).toISOString(),
                    },
                    {
                      id: 'msg-2',
                      role: 'assistant',
                      content: 'Of course, love! Let me draft the technical architecture for your multi-modal platform...',
                      timestamp: new Date(Date.now() - 3500000).toISOString(),
                    },
                  ],
                  createdAt: new Date(Date.now() - 3600000).toISOString(),
                  updatedAt: new Date(Date.now() - 3500000).toISOString(),
                },
              ],
              currentChatSessionId: 'session-1',
            });
          }
        } catch (error) {
          console.error('Error loading chat sessions:', error);
        }
      },
      
      // Workspaces
      workspaces: [],
      currentWorkspaceId: null,
      createWorkspace: (workspace) => {
        const newWorkspace: Workspace = {
          ...workspace,
          id: `workspace-${Date.now()}`,
        };
        
        set(state => ({
          workspaces: [...state.workspaces, newWorkspace],
          currentWorkspaceId: newWorkspace.id,
        }));
      },
      selectWorkspace: (workspaceId) => {
        set({ currentWorkspaceId: workspaceId });
      },
      updateWorkspacePosition: (workspaceId, position) => {
        set(state => ({
          workspaces: state.workspaces.map(workspace => 
            workspace.id === workspaceId
              ? {
                  ...workspace,
                  position: {
                    ...workspace.position,
                    ...position,
                  },
                }
              : workspace
          ),
        }));
      },
      toggleWorkspaceMinimized: (workspaceId) => {
        set(state => ({
          workspaces: state.workspaces.map(workspace => 
            workspace.id === workspaceId
              ? {
                  ...workspace,
                  isMinimized: !workspace.isMinimized,
                }
              : workspace
          ),
        }));
      },
      
      // MCP Marketplace
      mcpPackages: [],
      installedPackageIds: new Set(['docker-toolkit', 'github-mcp']),
      loadMcpPackages: async () => {
        try {
          // In production, this would call the backend API
          // For now, we'll use mock data
          set({
            mcpPackages: [
              {
                id: 'docker-toolkit',
                name: 'Docker Toolkit',
                description: 'Complete Docker integration with container management, build tools, and monitoring',
                version: '1.2.0',
                author: 'MCP Team',
                stars: 482,
                downloads: 12830,
                lastUpdated: '2 weeks ago',
                categories: ['devops', 'containers'],
                tags: ['docker', 'containers', 'devops'],
                repository: 'https://github.com/mcp/docker-toolkit',
                isInstalled: true,
              },
              {
                id: 'github-mcp',
                name: 'GitHub MCP',
                description: 'Full GitHub API integration with repositories, issues, PRs, and more',
                version: '2.0.1',
                author: 'MCP Team',
                stars: 621,
                downloads: 18742,
                lastUpdated: '1 week ago',
                categories: ['git', 'collaboration'],
                tags: ['github', 'git', 'version-control'],
                repository: 'https://github.com/mcp/github-mcp',
                isInstalled: true,
              },
              {
                id: 'puppeteer-browser',
                name: 'Puppeteer Browser',
                description: 'Web automation and browsing capabilities with Puppeteer',
                version: '1.0.5',
                author: 'MCP Team',
                stars: 389,
                downloads: 9421,
                lastUpdated: '3 weeks ago',
                categories: ['web', 'automation'],
                tags: ['puppeteer', 'browser', 'automation'],
                repository: 'https://github.com/mcp/puppeteer-browser',
                isInstalled: false,
              },
            ],
          });
        } catch (error) {
          console.error('Error loading MCP packages:', error);
        }
      },
      installPackage: async (packageId) => {
        try {
          // In production, this would call the backend API
          // For now, we'll just update our local state
          const { installedPackageIds, mcpPackages } = get();
          const newInstalledPackages = new Set(installedPackageIds);
          newInstalledPackages.add(packageId);
          
          set({
            installedPackageIds: newInstalledPackages,
            mcpPackages: mcpPackages.map(pkg => 
              pkg.id === packageId
                ? { ...pkg, isInstalled: true }
                : pkg
            ),
          });
        } catch (error) {
          console.error('Error installing package:', error);
          throw error;
        }
      },
      uninstallPackage: async (packageId) => {
        try {
          // In production, this would call the backend API
          const { installedPackageIds, mcpPackages } = get();
          const newInstalledPackages = new Set(installedPackageIds);
          newInstalledPackages.delete(packageId);
          
          set({
            installedPackageIds: newInstalledPackages,
            mcpPackages: mcpPackages.map(pkg => 
              pkg.id === packageId
                ? { ...pkg, isInstalled: false }
                : pkg
            ),
          });
        } catch (error) {
          console.error('Error uninstalling package:', error);
          throw error;
        }
      },
      
      // Browser Integration
      browserUrl: '',
      setBrowserUrl: (url) => {
        set({ browserUrl: url });
      },
      
      // API Status
      isApiReady: false,
      apiError: null,
      checkApiStatus: async () => {
        try {
          // In production, this would call the backend API health check
          // For now, we'll simulate a successful response
          set({
            isApiReady: true,
            apiError: null,
          });
        } catch (error) {
          console.error('API status check failed:', error);
          set({
            isApiReady: false,
            apiError: 'Could not connect to Podplay API. Please check your connection.',
          });
        }
      },
    }),
    {
      name: 'podplay-sanctuary-store',
      // Only persist what makes sense across sessions
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        chatSessions: state.chatSessions,
        currentChatSessionId: state.currentChatSessionId,
        installedPackageIds: Array.from(state.installedPackageIds),
      }),
      // Migrate old persisted data if the schema changes
      version: 1,
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            // Convert array back to Set for installedPackageIds
            if (Array.isArray(state.installedPackageIds)) {
              state.installedPackageIds = new Set(state.installedPackageIds);
            }
            
            // Check API status on app load
            state.checkApiStatus();
            
            // Load initial data
            state.loadChatSessions();
            state.loadMcpPackages();
          }
        };
      },
    }
  )
);

export default useAppStore;