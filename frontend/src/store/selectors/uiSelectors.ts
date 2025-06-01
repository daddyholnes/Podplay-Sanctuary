/**
 * UI State Selectors
 * 
 * Specialized selectors for UI state management including theme,
 * layout, notifications, modals, and accessibility preferences.
 * Optimized with memoization for performance.
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import type { 
  UIState, 
  ThemeConfig, 
  LayoutConfig, 
  NotificationState,
  ModalState,
  CommandPaletteState,
  AccessibilitySettings,
  NotificationItem,
  ModalInstance
} from '../slices/uiSlice';

// Base UI selector
export const selectUI = (state: RootState): UIState => state.ui;

// Theme selectors
export const selectTheme = createSelector(
  [selectUI],
  (ui) => ui.theme
);

export const selectCurrentTheme = createSelector(
  [selectTheme],
  (theme) => theme.current
);

export const selectThemeConfig = createSelector(
  [selectTheme],
  (theme) => theme.config
);

export const selectCustomThemes = createSelector(
  [selectTheme],
  (theme) => theme.customThemes
);

export const selectThemePreferences = createSelector(
  [selectTheme],
  (theme) => ({
    current: theme.current,
    autoSwitch: theme.autoSwitch,
    systemPreference: theme.systemPreference
  })
);

// Layout selectors
export const selectLayout = createSelector(
  [selectUI],
  (ui) => ui.layout
);

export const selectSidebarConfig = createSelector(
  [selectLayout],
  (layout) => ({
    isOpen: layout.sidebar.isOpen,
    width: layout.sidebar.width,
    isCollapsed: layout.sidebar.isCollapsed,
    position: layout.sidebar.position
  })
);

export const selectPanelsConfig = createSelector(
  [selectLayout],
  (layout) => layout.panels
);

export const selectActivePanel = createSelector(
  [selectPanelsConfig],
  (panels) => panels.activePanel
);

export const selectPanelSizes = createSelector(
  [selectPanelsConfig],
  (panels) => panels.sizes
);

export const selectViewportConfig = createSelector(
  [selectLayout],
  (layout) => layout.viewport
);

export const selectZoomLevel = createSelector(
  [selectViewportConfig],
  (viewport) => viewport.zoom
);

export const selectFullscreenMode = createSelector(
  [selectViewportConfig],
  (viewport) => viewport.fullscreen
);

// Notification selectors
export const selectNotifications = createSelector(
  [selectUI],
  (ui) => ui.notifications
);

export const selectNotificationItems = createSelector(
  [selectNotifications],
  (notifications) => notifications.items
);

export const selectNotificationSettings = createSelector(
  [selectNotifications],
  (notifications) => notifications.settings
);

export const selectUnreadNotifications = createSelector(
  [selectNotificationItems],
  (items) => items.filter(item => !item.read)
);

export const selectNotificationsByType = createSelector(
  [selectNotificationItems],
  (items) => {
    return items.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = [];
      }
      acc[item.type].push(item);
      return acc;
    }, {} as Record<string, NotificationItem[]>);
  }
);

export const selectRecentNotifications = createSelector(
  [selectNotificationItems],
  (items) => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    return items
      .filter(item => item.timestamp > oneHourAgo)
      .sort((a, b) => b.timestamp - a.timestamp);
  }
);

// Modal selectors
export const selectModals = createSelector(
  [selectUI],
  (ui) => ui.modals
);

export const selectOpenModals = createSelector(
  [selectModals],
  (modals) => modals.stack.filter(modal => modal.isOpen)
);

export const selectActiveModal = createSelector(
  [selectOpenModals],
  (openModals) => openModals[openModals.length - 1] || null
);

export const selectModalById = createSelector(
  [selectModals, (_: RootState, modalId: string) => modalId],
  (modals, modalId) => modals.stack.find(modal => modal.id === modalId) || null
);

export const selectModalHistory = createSelector(
  [selectModals],
  (modals) => modals.history
);

export const selectModalSettings = createSelector(
  [selectModals],
  (modals) => modals.settings
);

// Command Palette selectors
export const selectCommandPalette = createSelector(
  [selectUI],
  (ui) => ui.commandPalette
);

export const selectCommandPaletteState = createSelector(
  [selectCommandPalette],
  (commandPalette) => ({
    isOpen: commandPalette.isOpen,
    query: commandPalette.query,
    selectedIndex: commandPalette.selectedIndex
  })
);

export const selectCommandPaletteResults = createSelector(
  [selectCommandPalette],
  (commandPalette) => commandPalette.results
);

export const selectCommandPaletteHistory = createSelector(
  [selectCommandPalette],
  (commandPalette) => commandPalette.history
);

export const selectCommandPaletteSettings = createSelector(
  [selectCommandPalette],
  (commandPalette) => commandPalette.settings
);

// Accessibility selectors
export const selectAccessibility = createSelector(
  [selectUI],
  (ui) => ui.accessibility
);

export const selectReducedMotion = createSelector(
  [selectAccessibility],
  (accessibility) => accessibility.reducedMotion
);

export const selectHighContrast = createSelector(
  [selectAccessibility],
  (accessibility) => accessibility.highContrast
);

export const selectFontSize = createSelector(
  [selectAccessibility],
  (accessibility) => accessibility.fontSize
);

export const selectScreenReaderEnabled = createSelector(
  [selectAccessibility],
  (accessibility) => accessibility.screenReader
);

export const selectKeyboardNavigation = createSelector(
  [selectAccessibility],
  (accessibility) => accessibility.keyboardNavigation
);

export const selectFocusIndicators = createSelector(
  [selectAccessibility],
  (accessibility) => accessibility.focusIndicators
);

// Loading and error selectors
export const selectUILoading = createSelector(
  [selectUI],
  (ui) => ui.loading
);

export const selectUIErrors = createSelector(
  [selectUI],
  (ui) => ui.errors
);

export const selectLastUIUpdate = createSelector(
  [selectUI],
  (ui) => ui.lastUpdate
);

// Composite UI state selectors
export const selectUIPreferences = createSelector(
  [selectThemePreferences, selectLayout, selectAccessibility],
  (theme, layout, accessibility) => ({
    theme,
    layout: {
      sidebar: layout.sidebar,
      panels: layout.panels.activePanel,
      zoom: layout.viewport.zoom
    },
    accessibility
  })
);

export const selectUIStatus = createSelector(
  [selectUILoading, selectUIErrors, selectOpenModals, selectUnreadNotifications],
  (loading, errors, openModals, unreadNotifications) => ({
    isLoading: Object.values(loading).some(Boolean),
    hasErrors: errors.length > 0,
    hasOpenModals: openModals.length > 0,
    unreadCount: unreadNotifications.length,
    isHealthy: errors.length === 0 && !Object.values(loading).some(Boolean)
  })
);

export const selectUIMetrics = createSelector(
  [selectNotificationItems, selectModalHistory, selectCommandPaletteHistory],
  (notifications, modalHistory, commandHistory) => ({
    totalNotifications: notifications.length,
    unreadNotifications: notifications.filter(n => !n.read).length,
    modalsOpened: modalHistory.length,
    commandsExecuted: commandHistory.length,
    lastActivity: Math.max(
      ...notifications.map(n => n.timestamp),
      ...modalHistory.map(m => m.timestamp),
      ...commandHistory.map(c => c.timestamp),
      0
    )
  })
);

// Performance selectors
export const selectUIPerformance = createSelector(
  [selectTheme, selectLayout, selectAccessibility],
  (theme, layout, accessibility) => ({
    themeComplexity: Object.keys(theme.customThemes).length,
    layoutComplexity: Object.keys(layout.panels.sizes).length,
    accessibilityFeatures: [
      accessibility.reducedMotion,
      accessibility.highContrast,
      accessibility.screenReader,
      accessibility.keyboardNavigation,
      accessibility.focusIndicators
    ].filter(Boolean).length,
    optimizationScore: calculateUIOptimizationScore(theme, layout, accessibility)
  })
);

// Helper function for performance calculations
function calculateUIOptimizationScore(
  theme: ThemeConfig,
  layout: LayoutConfig,
  accessibility: AccessibilitySettings
): number {
  let score = 100;
  
  // Reduce score for complexity
  if (Object.keys(theme.customThemes).length > 5) score -= 10;
  if (Object.keys(layout.panels.sizes).length > 10) score -= 5;
  
  // Increase score for accessibility features
  const accessibilityFeatures = [
    accessibility.reducedMotion,
    accessibility.highContrast,
    accessibility.screenReader,
    accessibility.keyboardNavigation,
    accessibility.focusIndicators
  ].filter(Boolean).length;
  
  score += accessibilityFeatures * 2;
  
  return Math.max(0, Math.min(100, score));
}

// Export all selectors
export default {
  // Base
  selectUI,
  
  // Theme
  selectTheme,
  selectCurrentTheme,
  selectThemeConfig,
  selectCustomThemes,
  selectThemePreferences,
  
  // Layout
  selectLayout,
  selectSidebarConfig,
  selectPanelsConfig,
  selectActivePanel,
  selectPanelSizes,
  selectViewportConfig,
  selectZoomLevel,
  selectFullscreenMode,
  
  // Notifications
  selectNotifications,
  selectNotificationItems,
  selectNotificationSettings,
  selectUnreadNotifications,
  selectNotificationsByType,
  selectRecentNotifications,
  
  // Modals
  selectModals,
  selectOpenModals,
  selectActiveModal,
  selectModalById,
  selectModalHistory,
  selectModalSettings,
  
  // Command Palette
  selectCommandPalette,
  selectCommandPaletteState,
  selectCommandPaletteResults,
  selectCommandPaletteHistory,
  selectCommandPaletteSettings,
  
  // Accessibility
  selectAccessibility,
  selectReducedMotion,
  selectHighContrast,
  selectFontSize,
  selectScreenReaderEnabled,
  selectKeyboardNavigation,
  selectFocusIndicators,
  
  // Status
  selectUILoading,
  selectUIErrors,
  selectLastUIUpdate,
  
  // Composite
  selectUIPreferences,
  selectUIStatus,
  selectUIMetrics,
  selectUIPerformance
};
