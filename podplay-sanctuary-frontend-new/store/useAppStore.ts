
import { create } from 'zustand';
import { ChatMessage, Environment, Task, Theme, ScoutStatus } from '../types';
import { SECTIONS } from '../utils/constants';

interface AppState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  currentSection: string; // section id
  setCurrentSection: (section: string) => void;

  chatHistory: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  clearChatHistory: (section?: string) => void; // Optional section filter

  activeEnvironments: Environment[];
  addEnvironment: (env: Environment) => void;
  updateEnvironment: (id: string, updates: Partial<Environment>) => void;
  removeEnvironment: (id: string) => void;
  setActiveEnvironments: (envs: Environment[]) => void;

  scoutStatus: ScoutStatus;
  currentScoutTask: Task | null;
  setScoutStatus: (status: ScoutStatus) => void;
  setCurrentScoutTask: (task: Task | null) => void;
  updateScoutTaskProgress: (progress: number, currentStep?: string) => void;

  isGlobalChatHistoryOpen: boolean;
  toggleGlobalChatHistory: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  theme: (() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('app-theme') as Theme | null;
      if (storedTheme) return storedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  })(),
  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      localStorage.setItem('app-theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
  },
  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(newTheme);
  },

  currentSection: SECTIONS[0].id,
  setCurrentSection: (sectionId) => set({ currentSection: sectionId }),

  chatHistory: [],
  addMessage: (message) => {
    // Prevent duplicate messages if streaming and id is same
    set((state) => {
      const existingMessageIndex = state.chatHistory.findIndex(m => m.id === message.id && message.isLoading);
      if (existingMessageIndex !== -1 && message.isLoading === false) {
        // This is the final version of a streaming message
        const updatedHistory = [...state.chatHistory];
        updatedHistory[existingMessageIndex] = message;
        return { chatHistory: updatedHistory };
      } else if (existingMessageIndex === -1) {
         return { chatHistory: [...state.chatHistory, message] };
      }
      return state; // No change if it's a duplicate loading message
    });
  },
  updateMessage: (id, updates) =>
    set((state) => ({
      chatHistory: state.chatHistory.map((msg) =>
        msg.id === id ? { ...msg, ...updates, isLoading: false } : msg
      ),
    })),
  clearChatHistory: (section) =>
    set((state) => ({
      chatHistory: section ? state.chatHistory.filter(msg => msg.section !== section) : [],
    })),

  activeEnvironments: [],
  addEnvironment: (env) => set(state => ({ activeEnvironments: [...state.activeEnvironments, env] })),
  updateEnvironment: (id, updates) => set(state => ({
    activeEnvironments: state.activeEnvironments.map(env => env.id === id ? { ...env, ...updates } : env)
  })),
  removeEnvironment: (id) => set(state => ({
    activeEnvironments: state.activeEnvironments.filter(env => env.id !== id)
  })),
  setActiveEnvironments: (envs) => set({ activeEnvironments: envs }),
  
  scoutStatus: 'idle',
  currentScoutTask: null,
  setScoutStatus: (status) => set({ scoutStatus: status }),
  setCurrentScoutTask: (task) => set({ currentScoutTask: task }),
  updateScoutTaskProgress: (progress, currentStep) => set(state => ({
    currentScoutTask: state.currentScoutTask 
      ? { ...state.currentScoutTask, progress, currentStep: currentStep || state.currentScoutTask.currentStep } 
      : null
  })),

  isGlobalChatHistoryOpen: false,
  toggleGlobalChatHistory: () => set(state => ({ isGlobalChatHistoryOpen: !state.isGlobalChatHistoryOpen })),
}));

// Initialize theme on load
if (typeof window !== 'undefined') {
  const initialTheme = useAppStore.getState().theme;
  document.documentElement.setAttribute('data-theme', initialTheme);
  localStorage.setItem('app-theme', initialTheme);
}
