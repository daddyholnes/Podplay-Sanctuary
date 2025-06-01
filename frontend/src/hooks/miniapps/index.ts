/**
 * MiniApps Hooks Barrel Export
 * 
 * Centralized exports for all mini-application React hooks
 * Provides clean imports: import { useMiniApps, useMiniAppLauncher } from '@/hooks/miniapps'
 */

// Core MiniApps hooks
export { default as useMiniApps } from './useMiniApps';

// Re-export types for convenience
export type {
  UseMiniAppsOptions,
  UseMiniAppsResult,
  MiniAppsState,
  MiniApp,
  MiniAppConfig,
  MiniAppCategory,
  MiniAppWindow,
  MiniAppSandbox,
  MiniAppPermissions
} from './useMiniApps';
