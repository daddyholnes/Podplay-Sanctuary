import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  User, 
  UserPreferences, 
  Conversation, 
  Message, 
  Workspace, 
  MCPPackage, 
  MiniApp,
  AIModel 
} from '@/types';

// Theme Store
interface ThemeState {
  theme: 'light' | 'dark' | 'purple-neon';
  setTheme: (theme: 'light' | 'dark' | 'purple-neon') => void;
  sensoryMode: boolean;
  setSensoryMode: (enabled: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      sensoryMode: false,
      setSensoryMode: (sensoryMode) => set({ sensoryMode }),
    }),
    {
      name: 'podplay-theme',
    }
  )
);

// User Store
interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      updatePreferences: (preferences) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              preferences: {
                ...currentUser.preferences,
                ...preferences,
              },
            },
          });
        }
      },
    })
  )
);

// Chat Store
interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
  selectedModel: AIModel | null;
  availableModels: AIModel[];
  
  setConversations: (conversations: Conversation[]) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setLoading: (loading: boolean) => void;
  setTyping: (typing: boolean) => void;
  setSelectedModel: (model: AIModel | null) => void;
  setAvailableModels: (models: AIModel[]) => void;
}

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      conversations: [],
      currentConversation: null,
      messages: [],
      isLoading: false,
      isTyping: false,
      selectedModel: null,
      availableModels: [],
      
      setConversations: (conversations) => set({ conversations }),
      setCurrentConversation: (currentConversation) => set({ currentConversation }),
      addMessage: (message) => {
        const messages = get().messages;
        set({ messages: [...messages, message] });
      },
      setMessages: (messages) => set({ messages }),
      setLoading: (isLoading) => set({ isLoading }),
      setTyping: (isTyping) => set({ isTyping }),
      setSelectedModel: (selectedModel) => set({ selectedModel }),
      setAvailableModels: (availableModels) => set({ availableModels }),
    })
  )
);

// Workspace Store
interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaces: string[];
  isCreating: boolean;
  
  setWorkspaces: (workspaces: Workspace[]) => void;
  addWorkspace: (workspace: Workspace) => void;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  removeWorkspace: (id: string) => void;
  setActiveWorkspaces: (workspaceIds: string[]) => void;
  addActiveWorkspace: (workspaceId: string) => void;
  removeActiveWorkspace: (workspaceId: string) => void;
  setCreating: (creating: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  devtools(
    (set, get) => ({
      workspaces: [],
      activeWorkspaces: [],
      isCreating: false,
      
      setWorkspaces: (workspaces) => set({ workspaces }),
      addWorkspace: (workspace) => {
        const workspaces = get().workspaces;
        set({ workspaces: [...workspaces, workspace] });
      },
      updateWorkspace: (id, updates) => {
        const workspaces = get().workspaces;
        set({
          workspaces: workspaces.map(ws => 
            ws.id === id ? { ...ws, ...updates } : ws
          ),
        });
      },
      removeWorkspace: (id) => {
        const workspaces = get().workspaces;
        const activeWorkspaces = get().activeWorkspaces;
        set({
          workspaces: workspaces.filter(ws => ws.id !== id),
          activeWorkspaces: activeWorkspaces.filter(wsId => wsId !== id),
        });
      },
      setActiveWorkspaces: (activeWorkspaces) => set({ activeWorkspaces }),
      addActiveWorkspace: (workspaceId) => {
        const activeWorkspaces = get().activeWorkspaces;
        if (!activeWorkspaces.includes(workspaceId)) {
          set({ activeWorkspaces: [...activeWorkspaces, workspaceId] });
        }
      },
      removeActiveWorkspace: (workspaceId) => {
        const activeWorkspaces = get().activeWorkspaces;
        set({ activeWorkspaces: activeWorkspaces.filter(id => id !== workspaceId) });
      },
      setCreating: (isCreating) => set({ isCreating }),
    })
  )
);

// MCP Store
interface MCPState {
  packages: MCPPackage[];
  installedPackages: MCPPackage[];
  isSearching: boolean;
  searchQuery: string;
  selectedCategory: string | null;
  
  setPackages: (packages: MCPPackage[]) => void;
  setInstalledPackages: (packages: MCPPackage[]) => void;
  addInstalledPackage: (packageInfo: MCPPackage) => void;
  removeInstalledPackage: (packageId: string) => void;
  setSearching: (searching: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
}

export const useMCPStore = create<MCPState>()(
  devtools(
    (set, get) => ({
      packages: [],
      installedPackages: [],
      isSearching: false,
      searchQuery: '',
      selectedCategory: null,
      
      setPackages: (packages) => set({ packages }),
      setInstalledPackages: (installedPackages) => set({ installedPackages }),
      addInstalledPackage: (packageInfo) => {
        const installedPackages = get().installedPackages;
        set({ installedPackages: [...installedPackages, packageInfo] });
      },
      removeInstalledPackage: (packageId) => {
        const installedPackages = get().installedPackages;
        set({ installedPackages: installedPackages.filter(pkg => pkg.id !== packageId) });
      },
      setSearching: (isSearching) => set({ isSearching }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
    })
  )
);

// Mini Apps Store
interface MiniAppState {
  apps: MiniApp[];
  activeTabs: MiniApp[];
  currentTab: MiniApp | null;
  
  setApps: (apps: MiniApp[]) => void;
  setActiveTabs: (tabs: MiniApp[]) => void;
  addTab: (app: MiniApp) => void;
  removeTab: (appId: string) => void;
  setCurrentTab: (app: MiniApp | null) => void;
}

export const useMiniAppStore = create<MiniAppState>()(
  devtools(
    (set, get) => ({
      apps: [],
      activeTabs: [],
      currentTab: null,
      
      setApps: (apps) => set({ apps }),
      setActiveTabs: (activeTabs) => set({ activeTabs }),
      addTab: (app) => {
        const activeTabs = get().activeTabs;
        if (!activeTabs.find(tab => tab.id === app.id)) {
          set({ 
            activeTabs: [...activeTabs, app],
            currentTab: app,
          });
        } else {
          set({ currentTab: app });
        }
      },
      removeTab: (appId) => {
        const activeTabs = get().activeTabs;
        const currentTab = get().currentTab;
        const newTabs = activeTabs.filter(tab => tab.id !== appId);
        set({
          activeTabs: newTabs,
          currentTab: currentTab?.id === appId ? (newTabs[0] || null) : currentTab,
        });
      },
      setCurrentTab: (currentTab) => set({ currentTab }),
    })
  )
);

// Scout Store
interface ScoutState {
  stage: 'welcome' | 'planning' | 'workspace' | 'production';
  projectId: string | null;
  files: any[];
  timeline: any[];
  isGenerating: boolean;
  
  setStage: (stage: 'welcome' | 'planning' | 'workspace' | 'production') => void;
  setProjectId: (projectId: string | null) => void;
  setFiles: (files: any[]) => void;
  addFile: (file: any) => void;
  setTimeline: (timeline: any[]) => void;
  addTimelineItem: (item: any) => void;
  setGenerating: (generating: boolean) => void;
}

export const useScoutStore = create<ScoutState>()(
  devtools(
    (set, get) => ({
      stage: 'welcome',
      projectId: null,
      files: [],
      timeline: [],
      isGenerating: false,
      
      setStage: (stage) => set({ stage }),
      setProjectId: (projectId) => set({ projectId }),
      setFiles: (files) => set({ files }),
      addFile: (file) => {
        const files = get().files;
        set({ files: [...files, file] });
      },
      setTimeline: (timeline) => set({ timeline }),
      addTimelineItem: (item) => {
        const timeline = get().timeline;
        set({ timeline: [...timeline, item] });
      },
      setGenerating: (isGenerating) => set({ isGenerating }),
    })
  )
);