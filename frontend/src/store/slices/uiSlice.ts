/**
 * UI Slice - User Interface State Management
 * 
 * Manages application-wide UI state including theme, layout,
 * notifications, modals, sidebars, and user preferences
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme = 'default' | 'blue' | 'green' | 'purple' | 'orange';
export type LayoutMode = 'default' | 'minimal' | 'focus' | 'split';
export type SidebarPosition = 'left' | 'right';
export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  duration?: number;
  persistent?: boolean;
  actions?: Array<{
    label: string;
    action: string;
    primary?: boolean;
  }>;
  metadata?: Record<string, any>;
}

export interface ModalState {
  id: string;
  component: string;
  props?: Record<string, any>;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closable?: boolean;
  persistent?: boolean;
}

export interface SidebarState {
  isOpen: boolean;
  position: SidebarPosition;
  width: number;
  collapsed: boolean;
  pinned: boolean;
  activeTab?: string;
}

export interface PanelState {
  id: string;
  title: string;
  component: string;
  props?: Record<string, any>;
  isVisible: boolean;
  position: 'left' | 'right' | 'bottom' | 'floating';
  size: number;
  minimized: boolean;
  closable: boolean;
}

export interface ViewportState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
}

export interface CommandPaletteState {
  isOpen: boolean;
  query: string;
  selectedIndex: number;
  commands: Array<{
    id: string;
    label: string;
    description?: string;
    icon?: string;
    shortcut?: string;
    category: string;
    action: string;
    params?: Record<string, any>;
  }>;
  recentCommands: string[];
}

export interface QuickActionsState {
  isVisible: boolean;
  position: { x: number; y: number };
  context?: string;
  actions: Array<{
    id: string;
    label: string;
    icon?: string;
    action: string;
    params?: Record<string, any>;
    disabled?: boolean;
  }>;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  focusOutlines: boolean;
  colorBlindMode?: 'protanopia' | 'deuteranopia' | 'tritanopia' | 'none';
}

export interface UIPreferences {
  theme: ThemeMode;
  colorScheme: ColorScheme;
  layout: LayoutMode;
  fontSize: number;
  fontFamily: string;
  compactMode: boolean;
  showLineNumbers: boolean;
  showMinimap: boolean;
  wordWrap: boolean;
  autoSave: boolean;
  confirmActions: boolean;
  animations: boolean;
  sounds: boolean;
  notifications: {
    desktop: boolean;
    inApp: boolean;
    position: ToastPosition;
    duration: number;
    groupSimilar: boolean;
  };
}

export interface UIState {
  // Theme & Appearance
  theme: ThemeMode;
  colorScheme: ColorScheme;
  preferences: UIPreferences;
  accessibility: AccessibilitySettings;
  
  // Layout & Navigation
  layout: LayoutMode;
  sidebar: SidebarState;
  panels: PanelState[];
  viewport: ViewportState;
  fullscreen: boolean;
  zenMode: boolean;
  
  // Notifications & Feedback
  notifications: NotificationItem[];
  toasts: NotificationItem[];
  
  // Modals & Dialogs
  modals: ModalState[];
  
  // Interactive Elements
  commandPalette: CommandPaletteState;
  quickActions: QuickActionsState;
  contextMenu: {
    isVisible: boolean;
    position: { x: number; y: number };
    items: Array<{
      id: string;
      label: string;
      icon?: string;
      action: string;
      separator?: boolean;
      disabled?: boolean;
    }>;
  };
  
  // Loading & Status
  globalLoading: boolean;
  loadingStates: Record<string, boolean>;
  statusMessage?: string;
  
  // Feature Flags
  features: Record<string, boolean>;
  experiments: Record<string, boolean>;
  
  // Performance
  performance: {
    enableAnimations: boolean;
    enableTransitions: boolean;
    lazyLoading: boolean;
    virtualization: boolean;
  };
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: UIState = {
  // Theme & Appearance
  theme: 'system',
  colorScheme: 'default',
  preferences: {
    theme: 'system',
    colorScheme: 'default',
    layout: 'default',
    fontSize: 14,
    fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', monospace",
    compactMode: false,
    showLineNumbers: true,
    showMinimap: true,
    wordWrap: true,
    autoSave: true,
    confirmActions: true,
    animations: true,
    sounds: false,
    notifications: {
      desktop: true,
      inApp: true,
      position: 'top-right',
      duration: 5000,
      groupSimilar: true,
    },
  },
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
    fontSize: 'medium',
    focusOutlines: true,
    colorBlindMode: 'none',
  },
  
  // Layout & Navigation
  layout: 'default',
  sidebar: {
    isOpen: true,
    position: 'left',
    width: 280,
    collapsed: false,
    pinned: true,
    activeTab: 'explorer',
  },
  panels: [],
  viewport: {
    width: 1920,
    height: 1080,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    orientation: 'landscape',
  },
  fullscreen: false,
  zenMode: false,
  
  // Notifications & Feedback
  notifications: [],
  toasts: [],
  
  // Modals & Dialogs
  modals: [],
  
  // Interactive Elements
  commandPalette: {
    isOpen: false,
    query: '',
    selectedIndex: 0,
    commands: [],
    recentCommands: [],
  },
  quickActions: {
    isVisible: false,
    position: { x: 0, y: 0 },
    actions: [],
  },
  contextMenu: {
    isVisible: false,
    position: { x: 0, y: 0 },
    items: [],
  },
  
  // Loading & Status
  globalLoading: false,
  loadingStates: {},
  
  // Feature Flags
  features: {
    darkMode: true,
    aiAssistant: true,
    codeAnalysis: true,
    realTimeSync: true,
    voiceCommands: false,
    gestureControls: false,
  },
  experiments: {
    newChatInterface: false,
    enhancedSearch: false,
    smartSuggestions: true,
  },
  
  // Performance
  performance: {
    enableAnimations: true,
    enableTransitions: true,
    lazyLoading: true,
    virtualization: true,
  },
};

// ============================================================================
// Async Thunks
// ============================================================================

export const initializeUI = createAsyncThunk(
  'ui/initialize',
  async (_, { getState }) => {
    const state = getState() as RootState;
    
    // Detect system theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const systemTheme = prefersDark ? 'dark' : 'light';
    
    // Detect viewport
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      isMobile: window.innerWidth < 768,
      isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
      isDesktop: window.innerWidth >= 1024,
      orientation: window.innerWidth > window.innerHeight ? 'landscape' as const : 'portrait' as const,
    };
    
    // Check accessibility preferences
    const accessibility = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
    };
    
    return {
      systemTheme,
      viewport,
      accessibility,
    };
  }
);

export const showNotification = createAsyncThunk(
  'ui/showNotification',
  async (notification: Omit<NotificationItem, 'id' | 'timestamp'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now();
    
    // Request desktop notification permission if needed
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    
    return {
      ...notification,
      id,
      timestamp,
    };
  }
);

export const updateViewport = createAsyncThunk(
  'ui/updateViewport',
  async () => {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      isMobile: window.innerWidth < 768,
      isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
      isDesktop: window.innerWidth >= 1024,
      orientation: window.innerWidth > window.innerHeight ? 'landscape' as const : 'portrait' as const,
    };
  }
);

// ============================================================================
// Slice Definition
// ============================================================================

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme & Appearance
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
      state.preferences.theme = action.payload;
    },
    
    setColorScheme: (state, action: PayloadAction<ColorScheme>) => {
      state.colorScheme = action.payload;
      state.preferences.colorScheme = action.payload;
    },
    
    updatePreferences: (state, action: PayloadAction<Partial<UIPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    
    updateAccessibility: (state, action: PayloadAction<Partial<AccessibilitySettings>>) => {
      state.accessibility = { ...state.accessibility, ...action.payload };
    },
    
    // Layout & Navigation
    setLayout: (state, action: PayloadAction<LayoutMode>) => {
      state.layout = action.payload;
      state.preferences.layout = action.payload;
    },
    
    toggleSidebar: (state) => {
      state.sidebar.isOpen = !state.sidebar.isOpen;
    },
    
    setSidebarWidth: (state, action: PayloadAction<number>) => {
      state.sidebar.width = Math.max(200, Math.min(600, action.payload));
    },
    
    collapseSidebar: (state, action: PayloadAction<boolean>) => {
      state.sidebar.collapsed = action.payload;
    },
    
    setSidebarTab: (state, action: PayloadAction<string>) => {
      state.sidebar.activeTab = action.payload;
    },
    
    toggleFullscreen: (state) => {
      state.fullscreen = !state.fullscreen;
    },
    
    toggleZenMode: (state) => {
      state.zenMode = !state.zenMode;
    },
    
    // Panels
    addPanel: (state, action: PayloadAction<Omit<PanelState, 'id'>>) => {
      const id = `panel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      state.panels.push({ ...action.payload, id });
    },
    
    removePanel: (state, action: PayloadAction<string>) => {
      state.panels = state.panels.filter(panel => panel.id !== action.payload);
    },
    
    updatePanel: (state, action: PayloadAction<{ id: string; updates: Partial<PanelState> }>) => {
      const { id, updates } = action.payload;
      const panelIndex = state.panels.findIndex(panel => panel.id === id);
      if (panelIndex !== -1) {
        state.panels[panelIndex] = { ...state.panels[panelIndex], ...updates };
      }
    },
    
    // Notifications
    addNotification: (state, action: PayloadAction<NotificationItem>) => {
      state.notifications.unshift(action.payload);
      // Keep only last 100 notifications
      if (state.notifications.length > 100) {
        state.notifications = state.notifications.slice(0, 100);
      }
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
      state.toasts = state.toasts.filter(n => n.id !== action.payload);
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
      state.toasts = [];
    },
    
    addToast: (state, action: PayloadAction<NotificationItem>) => {
      state.toasts.unshift(action.payload);
      // Keep only last 10 toasts visible
      if (state.toasts.length > 10) {
        state.toasts = state.toasts.slice(0, 10);
      }
    },
    
    // Modals
    openModal: (state, action: PayloadAction<Omit<ModalState, 'id'>>) => {
      const id = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      state.modals.push({ ...action.payload, id });
    },
    
    closeModal: (state, action: PayloadAction<string>) => {
      state.modals = state.modals.filter(modal => modal.id !== action.payload);
    },
    
    closeTopModal: (state) => {
      if (state.modals.length > 0) {
        state.modals.pop();
      }
    },
    
    closeAllModals: (state) => {
      state.modals = [];
    },
    
    // Command Palette
    toggleCommandPalette: (state) => {
      state.commandPalette.isOpen = !state.commandPalette.isOpen;
      if (!state.commandPalette.isOpen) {
        state.commandPalette.query = '';
        state.commandPalette.selectedIndex = 0;
      }
    },
    
    setCommandPaletteQuery: (state, action: PayloadAction<string>) => {
      state.commandPalette.query = action.payload;
      state.commandPalette.selectedIndex = 0;
    },
    
    setCommandPaletteSelection: (state, action: PayloadAction<number>) => {
      state.commandPalette.selectedIndex = Math.max(0, 
        Math.min(action.payload, state.commandPalette.commands.length - 1));
    },
    
    updateCommands: (state, action: PayloadAction<typeof state.commandPalette.commands>) => {
      state.commandPalette.commands = action.payload;
    },
    
    addRecentCommand: (state, action: PayloadAction<string>) => {
      state.commandPalette.recentCommands = [
        action.payload,
        ...state.commandPalette.recentCommands.filter(cmd => cmd !== action.payload)
      ].slice(0, 10);
    },
    
    // Quick Actions
    showQuickActions: (state, action: PayloadAction<{ 
      position: { x: number; y: number }; 
      context?: string; 
      actions: typeof state.quickActions.actions 
    }>) => {
      state.quickActions = {
        isVisible: true,
        ...action.payload,
      };
    },
    
    hideQuickActions: (state) => {
      state.quickActions.isVisible = false;
    },
    
    // Context Menu
    showContextMenu: (state, action: PayloadAction<{
      position: { x: number; y: number };
      items: typeof state.contextMenu.items;
    }>) => {
      state.contextMenu = {
        isVisible: true,
        ...action.payload,
      };
    },
    
    hideContextMenu: (state) => {
      state.contextMenu.isVisible = false;
    },
    
    // Loading States
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
    
    setLoadingState: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      const { key, loading } = action.payload;
      if (loading) {
        state.loadingStates[key] = true;
      } else {
        delete state.loadingStates[key];
      }
    },
    
    setStatusMessage: (state, action: PayloadAction<string | undefined>) => {
      state.statusMessage = action.payload;
    },
    
    // Feature Flags
    setFeature: (state, action: PayloadAction<{ key: string; enabled: boolean }>) => {
      const { key, enabled } = action.payload;
      state.features[key] = enabled;
    },
    
    setExperiment: (state, action: PayloadAction<{ key: string; enabled: boolean }>) => {
      const { key, enabled } = action.payload;
      state.experiments[key] = enabled;
    },
    
    // Performance
    updatePerformance: (state, action: PayloadAction<Partial<typeof state.performance>>) => {
      state.performance = { ...state.performance, ...action.payload };
    },
  },
  
  extraReducers: (builder) => {
    builder
      .addCase(initializeUI.fulfilled, (state, action) => {
        const { systemTheme, viewport, accessibility } = action.payload;
        
        // Update theme if set to system
        if (state.theme === 'system') {
          state.theme = systemTheme as ThemeMode;
        }
        
        // Update viewport
        state.viewport = viewport;
        
        // Update accessibility settings
        state.accessibility = { ...state.accessibility, ...accessibility };
        
        // Adjust layout for mobile
        if (viewport.isMobile) {
          state.sidebar.isOpen = false;
          state.sidebar.collapsed = true;
          state.layout = 'minimal';
        }
      })
      
      .addCase(showNotification.fulfilled, (state, action) => {
        const notification = action.payload;
        
        // Add to notifications list
        state.notifications.unshift(notification);
        
        // Add to toasts if not persistent
        if (!notification.persistent) {
          state.toasts.unshift(notification);
        }
        
        // Cleanup old notifications
        if (state.notifications.length > 100) {
          state.notifications = state.notifications.slice(0, 100);
        }
        
        if (state.toasts.length > 10) {
          state.toasts = state.toasts.slice(0, 10);
        }
      })
      
      .addCase(updateViewport.fulfilled, (state, action) => {
        const oldViewport = state.viewport;
        state.viewport = action.payload;
        
        // Auto-adjust layout based on viewport changes
        if (oldViewport.isDesktop && action.payload.isMobile) {
          state.sidebar.isOpen = false;
          state.sidebar.collapsed = true;
          state.layout = 'minimal';
        } else if (oldViewport.isMobile && action.payload.isDesktop) {
          state.sidebar.isOpen = true;
          state.sidebar.collapsed = false;
          state.layout = 'default';
        }
      });
  },
});

// ============================================================================
// Actions Export
// ============================================================================

export const {
  // Theme & Appearance
  setTheme,
  setColorScheme,
  updatePreferences,
  updateAccessibility,
  
  // Layout & Navigation
  setLayout,
  toggleSidebar,
  setSidebarWidth,
  collapseSidebar,
  setSidebarTab,
  toggleFullscreen,
  toggleZenMode,
  
  // Panels
  addPanel,
  removePanel,
  updatePanel,
  
  // Notifications
  addNotification,
  removeNotification,
  clearNotifications,
  addToast,
  
  // Modals
  openModal,
  closeModal,
  closeTopModal,
  closeAllModals,
  
  // Command Palette
  toggleCommandPalette,
  setCommandPaletteQuery,
  setCommandPaletteSelection,
  updateCommands,
  addRecentCommand,
  
  // Quick Actions
  showQuickActions,
  hideQuickActions,
  
  // Context Menu
  showContextMenu,
  hideContextMenu,
  
  // Loading States
  setGlobalLoading,
  setLoadingState,
  setStatusMessage,
  
  // Feature Flags
  setFeature,
  setExperiment,
  
  // Performance
  updatePerformance,
} = uiSlice.actions;

// ============================================================================
// Selectors
// ============================================================================

export const selectTheme = (state: RootState) => state.ui.theme;
export const selectColorScheme = (state: RootState) => state.ui.colorScheme;
export const selectPreferences = (state: RootState) => state.ui.preferences;
export const selectAccessibility = (state: RootState) => state.ui.accessibility;

export const selectLayout = (state: RootState) => state.ui.layout;
export const selectSidebar = (state: RootState) => state.ui.sidebar;
export const selectPanels = (state: RootState) => state.ui.panels;
export const selectViewport = (state: RootState) => state.ui.viewport;
export const selectIsFullscreen = (state: RootState) => state.ui.fullscreen;
export const selectIsZenMode = (state: RootState) => state.ui.zenMode;

export const selectNotifications = (state: RootState) => state.ui.notifications;
export const selectToasts = (state: RootState) => state.ui.toasts;
export const selectUnreadNotifications = (state: RootState) => 
  state.ui.notifications.filter(n => !n.metadata?.read);

export const selectModals = (state: RootState) => state.ui.modals;
export const selectTopModal = (state: RootState) => 
  state.ui.modals[state.ui.modals.length - 1];

export const selectCommandPalette = (state: RootState) => state.ui.commandPalette;
export const selectQuickActions = (state: RootState) => state.ui.quickActions;
export const selectContextMenu = (state: RootState) => state.ui.contextMenu;

export const selectGlobalLoading = (state: RootState) => state.ui.globalLoading;
export const selectLoadingStates = (state: RootState) => state.ui.loadingStates;
export const selectIsLoading = (key: string) => (state: RootState) => 
  state.ui.loadingStates[key] || false;
export const selectStatusMessage = (state: RootState) => state.ui.statusMessage;

export const selectFeatures = (state: RootState) => state.ui.features;
export const selectExperiments = (state: RootState) => state.ui.experiments;
export const selectIsFeatureEnabled = (feature: string) => (state: RootState) => 
  state.ui.features[feature] || false;
export const selectIsExperimentEnabled = (experiment: string) => (state: RootState) => 
  state.ui.experiments[experiment] || false;

export const selectPerformance = (state: RootState) => state.ui.performance;

// Computed selectors
export const selectIsMobile = (state: RootState) => state.ui.viewport.isMobile;
export const selectIsTablet = (state: RootState) => state.ui.viewport.isTablet;
export const selectIsDesktop = (state: RootState) => state.ui.viewport.isDesktop;

export const selectActiveTheme = (state: RootState) => {
  if (state.ui.theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return state.ui.theme;
};

export const selectHasAnyLoading = (state: RootState) => 
  state.ui.globalLoading || Object.keys(state.ui.loadingStates).length > 0;

// ============================================================================
// Reducer Export
// ============================================================================

export default uiSlice.reducer;
