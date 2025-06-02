// Unified Design System Context for Podplay Sanctuary
// Provides scout.new-inspired theming and state management across all components
// Enables dynamic workspace transformations with consistent aesthetics

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// ==================== THEME INTERFACES ====================

export interface SanctuaryTheme {
  name: 'sanctuary' | 'scout' | 'minimal';
  colors: {
    // Primary Sanctuary palette
    sanctuaryPrimary: string;
    sanctuarySecondary: string;
    sanctuaryAccent: string;
    sanctuaryWarm: string;
    sanctuaryCozy: string;
    sanctuaryBackground: string;
    sanctuaryBackgroundSecondary: string;
    sanctuaryBackgroundTertiary: string;
    
    // Text colors
    sanctuaryText: string;
    sanctuaryTextSecondary: string;
    sanctuaryTextMuted: string;
    
    // UI elements
    sanctuaryBorder: string;
    sanctuarySurface: string;
    sanctuarySurfaceHover: string;
    sanctuaryError: string;
    sanctuarySuccess: string;
    sanctuaryWarning: string;
  };
  gradients: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    glassmorphism: string;
  };
  effects: {
    backdropBlur: string;
    glassMorphism: string;
    elevation: string[];
    borderRadius: string[];
    transitions: string;
  };
  typography: {
    fontPrimary: string;
    fontCode: string;
    fontSize: string[];
    fontWeight: string[];
    lineHeight: string[];
  };
  spacing: string[];
  breakpoints: string[];
}

export interface WorkspaceView {
  id: string;
  name: string;
  icon: string;
  component: ReactNode;
  description: string;
  category: 'primary' | 'secondary' | 'utility';
  isActive: boolean;
}

export interface UnifiedWorkspaceState {
  activeView: string;
  views: WorkspaceView[];
  isTransitioning: boolean;
  transitionDuration: number;
  sidebarCollapsed: boolean;
  chatPersistent: boolean;
  chatMode: 'floating' | 'sidebar' | 'bottom' | 'overlay';
  currentTheme: 'sanctuary' | 'scout' | 'minimal';
  dynamicBackground: boolean;
  glassEffects: boolean;
}

// ==================== CONTEXT INTERFACE ====================

interface DesignSystemContextValue {
  theme: SanctuaryTheme;
  workspaceState: UnifiedWorkspaceState;
  
  // Theme functions
  setTheme: (theme: 'sanctuary' | 'scout' | 'minimal') => void;
  toggleDynamicBackground: () => void;
  toggleGlassEffects: () => void;
    // Workspace functions
  setActiveView: (viewId: string) => void;
  addView: (view: WorkspaceView) => void;
  removeView: (viewId: string) => void;
  toggleSidebar: () => void;
  togglePersistentChat: () => void;
  setChatMode: (mode: 'floating' | 'sidebar' | 'bottom' | 'overlay') => void;
  
  // Transition functions
  startTransition: (duration?: number) => void;
  endTransition: () => void;
}

// ==================== DEFAULT THEME ====================

const defaultTheme: SanctuaryTheme = {
  name: 'sanctuary',
  colors: {
    // Primary Sanctuary palette (from existing CSS analysis)
    sanctuaryPrimary: '#a855f7', // Purple primary
    sanctuarySecondary: '#ec4899', // Pink secondary  
    sanctuaryAccent: '#8b5cf6', // Purple accent
    sanctuaryWarm: '#f59e0b', // Warm amber
    sanctuaryCozy: '#10b981', // Cozy green
    sanctuaryBackground: '#0f1419', // Deep dark base
    sanctuaryBackgroundSecondary: '#1a1f2e', // Secondary dark
    sanctuaryBackgroundTertiary: '#2d1b69', // Tertiary purple-dark
    
    // Text colors
    sanctuaryText: '#e8e6e3', // Light cream text
    sanctuaryTextSecondary: '#9ca3af', // Gray secondary text
    sanctuaryTextMuted: '#6b7280', // Muted gray text
    
    // UI elements
    sanctuaryBorder: 'rgba(168, 85, 247, 0.2)', // Purple border with opacity
    sanctuarySurface: 'rgba(55, 65, 81, 0.5)', // Surface with opacity
    sanctuarySurfaceHover: 'rgba(168, 85, 247, 0.2)', // Hover surface
    sanctuaryError: '#ef4444', // Error red
    sanctuarySuccess: '#10b981', // Success green
    sanctuaryWarning: '#f59e0b', // Warning amber
  },
  gradients: {
    primary: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    secondary: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
    accent: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)',
    background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 25%, #2d4a3e 50%, #2d1b69 100%)',
    glassmorphism: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
  },
  effects: {
    backdropBlur: 'blur(20px)',
    glassMorphism: 'backdrop-filter: blur(20px); background: rgba(15, 20, 25, 0.95);',
    elevation: [
      '0 1px 3px rgba(0, 0, 0, 0.12)',
      '0 4px 6px rgba(0, 0, 0, 0.12)',
      '0 8px 16px rgba(0, 0, 0, 0.15)',
      '0 16px 32px rgba(0, 0, 0, 0.2)',
      '0 24px 48px rgba(0, 0, 0, 0.25)',
    ],
    borderRadius: ['0.25rem', '0.5rem', '0.75rem', '1rem', '1.5rem', '2rem'],
    transitions: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  typography: {
    fontPrimary: "'Inter', 'Segoe UI', system-ui, sans-serif",
    fontCode: "'SF Mono', 'Monaco', 'Cascadia Code', monospace",
    fontSize: ['0.75rem', '0.875rem', '1rem', '1.125rem', '1.25rem', '1.5rem', '2rem', '3rem'],
    fontWeight: ['300', '400', '500', '600', '700', '800'],
    lineHeight: ['1.2', '1.4', '1.5', '1.6', '1.8'],
  },
  spacing: ['0.25rem', '0.5rem', '0.75rem', '1rem', '1.5rem', '2rem', '3rem', '4rem', '6rem', '8rem'],
  breakpoints: ['480px', '768px', '1024px', '1280px', '1536px'],
};

// ==================== CONTEXT IMPLEMENTATION ====================

const DesignSystemContext = createContext<DesignSystemContextValue | undefined>(undefined);

export const useDesignSystem = () => {
  const context = useContext(DesignSystemContext);
  if (!context) {
    throw new Error('useDesignSystem must be used within a DesignSystemProvider');
  }
  return context;
};

// ==================== PROVIDER COMPONENT ====================

interface DesignSystemProviderProps {
  children: ReactNode;
}

export const DesignSystemProvider: React.FC<DesignSystemProviderProps> = ({ children }) => {
  const [theme] = useState<SanctuaryTheme>(defaultTheme);
    const [workspaceState, setWorkspaceState] = useState<UnifiedWorkspaceState>({
    activeView: 'UnifiedDynamicWorkspace',
    views: [],
    isTransitioning: false,
    transitionDuration: 300,
    sidebarCollapsed: false,
    chatPersistent: true,
    chatMode: 'floating',
    currentTheme: 'sanctuary',
    dynamicBackground: true,
    glassEffects: true,
  });

  // ==================== THEME FUNCTIONS ====================

  const setTheme = useCallback((newTheme: 'sanctuary' | 'scout' | 'minimal') => {
    setWorkspaceState(prev => ({ ...prev, currentTheme: newTheme }));
  }, []);

  const toggleDynamicBackground = useCallback(() => {
    setWorkspaceState(prev => ({ ...prev, dynamicBackground: !prev.dynamicBackground }));
  }, []);

  const toggleGlassEffects = useCallback(() => {
    setWorkspaceState(prev => ({ ...prev, glassEffects: !prev.glassEffects }));
  }, []);

  // ==================== WORKSPACE FUNCTIONS ====================

  const setActiveView = useCallback((viewId: string) => {
    setWorkspaceState(prev => ({
      ...prev,
      activeView: viewId,
      views: prev.views.map(view => ({
        ...view,
        isActive: view.id === viewId
      }))
    }));
  }, []);

  const addView = useCallback((view: WorkspaceView) => {
    setWorkspaceState(prev => ({
      ...prev,
      views: [...prev.views.filter(v => v.id !== view.id), view]
    }));
  }, []);

  const removeView = useCallback((viewId: string) => {
    setWorkspaceState(prev => ({
      ...prev,
      views: prev.views.filter(v => v.id !== viewId)
    }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setWorkspaceState(prev => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }));
  }, []);
  const togglePersistentChat = useCallback(() => {
    setWorkspaceState(prev => ({ ...prev, chatPersistent: !prev.chatPersistent }));
  }, []);

  const setChatMode = useCallback((mode: 'floating' | 'sidebar' | 'bottom' | 'overlay') => {
    setWorkspaceState(prev => ({ ...prev, chatMode: mode }));
  }, []);

  // ==================== TRANSITION FUNCTIONS ====================

  const startTransition = useCallback((duration = 300) => {
    setWorkspaceState(prev => ({ ...prev, isTransitioning: true, transitionDuration: duration }));
  }, []);

  const endTransition = useCallback(() => {
    setWorkspaceState(prev => ({ ...prev, isTransitioning: false }));
  }, []);

  // ==================== CONTEXT VALUE ====================
  const contextValue: DesignSystemContextValue = {
    theme,
    workspaceState,
    setTheme,
    toggleDynamicBackground,
    toggleGlassEffects,
    setActiveView,
    addView,
    removeView,
    toggleSidebar,
    togglePersistentChat,
    setChatMode,
    startTransition,
    endTransition,
  };

  return (
    <DesignSystemContext.Provider value={contextValue}>
      {children}
    </DesignSystemContext.Provider>
  );
};

export default DesignSystemProvider;
