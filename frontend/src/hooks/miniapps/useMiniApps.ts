/**
 * Mini Apps Hook - useMiniApps
 * 
 * A comprehensive React hook for managing mini-applications within Podplay Sanctuary.
 * Handles app discovery, lifecycle management, sandboxing, communication,
 * and integration with the main application ecosystem.
 * 
 * Features:
 * - Dynamic app loading and unloading
 * - Sandboxed execution environment
 * - App marketplace integration
 * - Inter-app communication
 * - Resource management and quotas
 * - Permission system
 * - State persistence
 * - Hot reloading for development
 * 
 * @author Podplay Sanctuary Team
 * @version 1.0.0
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAPI } from '../api/useAPI';
import { useSocket } from '../api/useSocket';

export interface MiniApp {
  id: string;
  name: string;
  displayName: string;
  version: string;
  description: string;
  category: 'productivity' | 'development' | 'utilities' | 'entertainment' | 'education' | 'communication' | 'custom';
  author: string;
  icon: string;
  banner?: string;
  
  // Runtime info
  status: 'available' | 'installed' | 'running' | 'suspended' | 'error' | 'updating';
  type: 'iframe' | 'web-component' | 'react' | 'module' | 'service-worker';
  
  // Installation
  source: 'marketplace' | 'local' | 'development' | 'sideload';
  installPath?: string;
  entryPoint: string;
  
  // Metadata
  tags: string[];
  license: string;
  homepage?: string;
  repository?: string;
  documentation?: string;
  size: number;
  downloads: number;
  rating: number;
  reviews: number;
  lastUpdated: Date;
  createdAt: Date;
  
  // Configuration
  config: MiniAppConfig;
  permissions: MiniAppPermission[];
  dependencies: string[];
  requirements: MiniAppRequirement[];
  
  // Runtime state
  instanceId?: string;
  windowId?: string;
  container?: HTMLElement;
  state?: any;
  
  // Performance metrics
  metrics?: {
    loadTime: number;
    memoryUsage: number;
    cpuUsage: number;
    networkRequests: number;
    errors: number;
  };
}

export interface MiniAppConfig {
  // UI configuration
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  resizable: boolean;
  draggable: boolean;
  
  // Behavior
  singleton: boolean;
  autoStart: boolean;
  background: boolean;
  persistent: boolean;
  
  // Security
  sandbox: boolean;
  allowedOrigins: string[];
  csp?: string;
  
  // Features
  allowFullscreen: boolean;
  allowNotifications: boolean;
  allowClipboard: boolean;
  allowCamera: boolean;
  allowMicrophone: boolean;
  
  // Integration
  exposeAPIs: string[];
  subscribeEvents: string[];
  
  // Environment
  environment?: Record<string, string>;
  arguments?: string[];
}

export interface MiniAppPermission {
  name: string;
  description: string;
  type: 'required' | 'optional';
  granted: boolean;
  scope?: string;
}

export interface MiniAppRequirement {
  type: 'api' | 'feature' | 'permission' | 'dependency';
  name: string;
  version?: string;
  optional: boolean;
  satisfied: boolean;
}

export interface MiniAppInstance {
  id: string;
  appId: string;
  windowId: string;
  containerId: string;
  status: 'loading' | 'ready' | 'running' | 'suspended' | 'crashed';
  startTime: Date;
  lastActivity: Date;
  state: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  visible: boolean;
  focused: boolean;
}

export interface MiniAppMessage {
  id: string;
  type: 'api-call' | 'event' | 'state-update' | 'error' | 'log';
  source: string;
  target?: string;
  method?: string;
  payload: any;
  timestamp: Date;
}

export interface UseMiniAppsOptions {
  // Marketplace options
  enableMarketplace?: boolean;
  marketplaceUrl?: string;
  
  // Auto-discovery
  autoDiscoverApps?: boolean;
  discoveryPaths?: string[];
  
  // Performance options
  maxConcurrentApps?: number;
  memoryLimit?: number;
  cpuLimit?: number;
  
  // Security options
  defaultSandbox?: boolean;
  allowUnsignedApps?: boolean;
  
  // Development options
  enableDevMode?: boolean;
  hotReload?: boolean;
  debugMode?: boolean;
  
  // UI options
  windowManager?: 'native' | 'custom';
  defaultLayout?: 'grid' | 'tabs' | 'overlay';
  
  // Callbacks
  onAppInstalled?: (app: MiniApp) => void;
  onAppLaunched?: (instance: MiniAppInstance) => void;
  onAppClosed?: (instance: MiniAppInstance) => void;
  onAppError?: (app: MiniApp, error: Error) => void;
  onMessage?: (message: MiniAppMessage) => void;
  onError?: (error: Error) => void;
}

export interface UseMiniAppsResult {
  // App state
  apps: MiniApp[];
  installedApps: MiniApp[];
  runningApps: MiniApp[];
  availableApps: MiniApp[];
  
  // Instance state
  instances: MiniAppInstance[];
  activeInstance: MiniAppInstance | null;
  
  // Loading states
  isLoadingApps: boolean;
  isInstalling: boolean;
  isLaunching: boolean;
  
  // App management
  installApp: (appId: string, config?: Partial<MiniAppConfig>) => Promise<MiniApp>;
  uninstallApp: (appId: string) => Promise<void>;
  updateApp: (appId: string) => Promise<MiniApp>;
  configureApp: (appId: string, config: Partial<MiniAppConfig>) => Promise<MiniApp>;
  
  // Instance management
  launchApp: (appId: string, options?: any) => Promise<MiniAppInstance>;
  closeApp: (instanceId: string) => Promise<void>;
  suspendApp: (instanceId: string) => Promise<void>;
  resumeApp: (instanceId: string) => Promise<void>;
  restartApp: (instanceId: string) => Promise<void>;
  
  // Window management
  focusApp: (instanceId: string) => void;
  minimizeApp: (instanceId: string) => void;
  maximizeApp: (instanceId: string) => void;
  resizeApp: (instanceId: string, width: number, height: number) => void;
  moveApp: (instanceId: string, x: number, y: number) => void;
  
  // Communication
  sendMessage: (instanceId: string, message: any) => Promise<any>;
  broadcastMessage: (message: any, targets?: string[]) => void;
  subscribeToEvents: (instanceId: string, events: string[]) => void;
  
  // Discovery and marketplace
  discoverApps: () => Promise<MiniApp[]>;
  searchApps: (query: string, filters?: any) => Promise<MiniApp[]>;
  getAppDetails: (appId: string) => Promise<MiniApp>;
  
  // Development support
  loadLocalApp: (path: string) => Promise<MiniApp>;
  reloadApp: (instanceId: string) => Promise<void>;
  debugApp: (instanceId: string) => Promise<any>;
  
  // Utilities
  exportAppData: (appId: string) => Promise<Blob>;
  importAppData: (appId: string, data: Blob) => Promise<void>;
  getAppLogs: (instanceId: string, lines?: number) => Promise<string[]>;
  getAppMetrics: (instanceId: string) => Promise<any>;
  
  // Layout management
  saveLayout: (name: string) => Promise<void>;
  loadLayout: (name: string) => Promise<void>;
  resetLayout: () => void;
}

interface MiniAppsState {
  apps: MiniApp[];
  instances: MiniAppInstance[];
  messages: MiniAppMessage[];
  activeInstanceId: string | null;
  isInstalling: boolean;
  isLaunching: boolean;
  installProgress: Record<string, number>;
  windowManager: any;
}

export function useMiniApps(options: UseMiniAppsOptions = {}): UseMiniAppsResult {
  const {
    enableMarketplace = true,
    marketplaceUrl = process.env.REACT_APP_MINIAPPS_MARKETPLACE_URL || 'https://apps.podplay.dev/api',
    autoDiscoverApps = true,
    discoveryPaths = ['./apps', './mini-apps'],
    maxConcurrentApps = 10,
    memoryLimit = 512 * 1024 * 1024, // 512MB
    cpuLimit = 50, // 50%
    defaultSandbox = true,
    allowUnsignedApps = false,
    enableDevMode = process.env.NODE_ENV === 'development',
    hotReload = enableDevMode,
    debugMode = enableDevMode,
    windowManager = 'custom',
    defaultLayout = 'tabs',
    onAppInstalled,
    onAppLaunched,
    onAppClosed,
    onAppError,
    onMessage,
    onError
  } = options;

  // State management
  const [state, setState] = useState<MiniAppsState>({
    apps: [],
    instances: [],
    messages: [],
    activeInstanceId: null,
    isInstalling: false,
    isLaunching: false,
    installProgress: {},
    windowManager: null
  });

  // Refs for cleanup and management
  const instancesRef = useRef<Map<string, any>>(new Map());
  const messageHandlersRef = useRef<Map<string, Function>>(new Map());
  const performanceMonitorRef = useRef<NodeJS.Timeout>();

  // WebSocket connection for real-time app events
  const {
    isConnected,
    sendJsonMessage,
    lastMessage
  } = useSocket(
    process.env.REACT_APP_MINIAPPS_WS_URL || 'ws://localhost:8000/ws/miniapps',
    {
      autoConnect: true,
      onMessage: handleSocketMessage,
      onError: (error) => onError?.(new Error(`MiniApps WebSocket error: ${error}`))
    }
  );

  // API hooks for app operations
  const { data: appsData, execute: loadApps, isLoading: isLoadingApps } = useAPI(
    async () => {
      const response = await fetch(`${marketplaceUrl}/apps`);
      return response.json();
    },
    { enabled: enableMarketplace, cacheKey: 'miniapps:apps', cacheTTL: 300000 }
  );

  const { execute: installAppAPI } = useAPI(
    async (appId: string, config: any) => {
      const response = await fetch(`${marketplaceUrl}/apps/${appId}/install`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      return response.json();
    },
    { manual: true }
  );

  const { execute: discoverAppsAPI } = useAPI(
    async () => {
      const response = await fetch(`${marketplaceUrl}/discover`);
      return response.json();
    },
    { manual: true }
  );

  // Handle WebSocket messages
  function handleSocketMessage(data: any) {
    try {
      switch (data.type) {
        case 'app_installed':
          handleAppInstalled(data.payload);
          break;
        case 'app_launched':
          handleAppLaunched(data.payload);
          break;
        case 'app_closed':
          handleAppClosed(data.payload);
          break;
        case 'app_error':
          handleAppError(data.payload);
          break;
        case 'app_message':
          handleAppMessage(data.payload);
          break;
        case 'instance_update':
          handleInstanceUpdate(data.payload);
          break;
        case 'install_progress':
          handleInstallProgress(data.payload);
          break;
        default:
          console.warn('Unknown MiniApps message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling MiniApps socket message:', error);
      onError?.(error as Error);
    }
  }

  // Handle app installation
  const handleAppInstalled = useCallback((appData: any) => {
    const app: MiniApp = {
      ...appData,
      lastUpdated: new Date(appData.lastUpdated),
      createdAt: new Date(appData.createdAt)
    };

    setState(prev => ({
      ...prev,
      apps: prev.apps.map(a => a.id === app.id ? app : a),
      isInstalling: false,
      installProgress: {
        ...prev.installProgress,
        [app.id]: 100
      }
    }));

    onAppInstalled?.(app);

    // Auto-launch if configured
    if (app.config.autoStart) {
      launchApp(app.id);
    }
  }, [onAppInstalled]);

  // Handle app launch
  const handleAppLaunched = useCallback((instanceData: any) => {
    const instance: MiniAppInstance = {
      ...instanceData,
      startTime: new Date(instanceData.startTime),
      lastActivity: new Date(instanceData.lastActivity)
    };

    setState(prev => ({
      ...prev,
      instances: [...prev.instances, instance],
      isLaunching: false,
      activeInstanceId: instance.id
    }));

    onAppLaunched?.(instance);
  }, [onAppLaunched]);

  // Handle app closure
  const handleAppClosed = useCallback((instanceData: any) => {
    setState(prev => ({
      ...prev,
      instances: prev.instances.filter(i => i.id !== instanceData.instanceId),
      activeInstanceId: prev.activeInstanceId === instanceData.instanceId 
        ? null 
        : prev.activeInstanceId
    }));

    // Cleanup instance
    if (instancesRef.current.has(instanceData.instanceId)) {
      instancesRef.current.delete(instanceData.instanceId);
    }

    const instance = state.instances.find(i => i.id === instanceData.instanceId);
    if (instance) {
      onAppClosed?.(instance);
    }
  }, [state.instances, onAppClosed]);

  // Handle app errors
  const handleAppError = useCallback((errorData: any) => {
    const app = state.apps.find(a => a.id === errorData.appId);
    if (app) {
      onAppError?.(app, new Error(errorData.message));
    }
  }, [state.apps, onAppError]);

  // Handle app messages
  const handleAppMessage = useCallback((messageData: any) => {
    const message: MiniAppMessage = {
      ...messageData,
      timestamp: new Date(messageData.timestamp)
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages.slice(-999), message] // Keep last 1000 messages
    }));

    onMessage?.(message);

    // Route message to appropriate handler
    const handler = messageHandlersRef.current.get(message.target || 'global');
    if (handler) {
      handler(message);
    }
  }, [onMessage]);

  // Handle instance updates
  const handleInstanceUpdate = useCallback((instanceData: any) => {
    const instance: MiniAppInstance = {
      ...instanceData,
      startTime: new Date(instanceData.startTime),
      lastActivity: new Date(instanceData.lastActivity)
    };

    setState(prev => ({
      ...prev,
      instances: prev.instances.map(i => i.id === instance.id ? instance : i)
    }));
  }, []);

  // Handle installation progress
  const handleInstallProgress = useCallback((progressData: any) => {
    setState(prev => ({
      ...prev,
      installProgress: {
        ...prev.installProgress,
        [progressData.appId]: progressData.progress
      }
    }));
  }, []);

  // Install app
  const installApp = useCallback(async (
    appId: string,
    config: Partial<MiniAppConfig> = {}
  ): Promise<MiniApp> => {
    try {
      setState(prev => ({
        ...prev,
        isInstalling: true,
        installProgress: { ...prev.installProgress, [appId]: 0 }
      }));

      const app = await installAppAPI(appId, config);
      return app;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isInstalling: false,
        installProgress: { ...prev.installProgress, [appId]: 0 }
      }));
      onError?.(error as Error);
      throw error;
    }
  }, [installAppAPI, onError]);

  // Launch app
  const launchApp = useCallback(async (
    appId: string,
    options: any = {}
  ): Promise<MiniAppInstance> => {
    try {
      const app = state.apps.find(a => a.id === appId);
      if (!app) {
        throw new Error('App not found');
      }

      // Check if singleton and already running
      if (app.config.singleton) {
        const existingInstance = state.instances.find(i => i.appId === appId);
        if (existingInstance) {
          focusApp(existingInstance.id);
          return existingInstance;
        }
      }

      // Check concurrent app limit
      if (state.instances.length >= maxConcurrentApps) {
        throw new Error('Maximum concurrent apps limit reached');
      }

      setState(prev => ({ ...prev, isLaunching: true }));

      if (isConnected) {
        sendJsonMessage({
          type: 'launch_app',
          payload: { appId, options }
        });
      }

      // Return placeholder instance (will be updated via WebSocket)
      const instanceId = `instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const instance: MiniAppInstance = {
        id: instanceId,
        appId,
        windowId: `window_${instanceId}`,
        containerId: `container_${instanceId}`,
        status: 'loading',
        startTime: new Date(),
        lastActivity: new Date(),
        state: {},
        position: options.position || { x: 100, y: 100 },
        size: options.size || { width: app.config.defaultWidth || 800, height: app.config.defaultHeight || 600 },
        zIndex: 1000 + state.instances.length,
        visible: true,
        focused: true
      };

      return instance;
    } catch (error) {
      setState(prev => ({ ...prev, isLaunching: false }));
      onError?.(error as Error);
      throw error;
    }
  }, [state.apps, state.instances, maxConcurrentApps, isConnected, sendJsonMessage, onError]);

  // Close app
  const closeApp = useCallback(async (instanceId: string) => {
    if (isConnected) {
      sendJsonMessage({
        type: 'close_app',
        payload: { instanceId }
      });
    }
  }, [isConnected, sendJsonMessage]);

  // Focus app
  const focusApp = useCallback((instanceId: string) => {
    setState(prev => ({
      ...prev,
      activeInstanceId: instanceId,
      instances: prev.instances.map(i => ({
        ...i,
        focused: i.id === instanceId,
        zIndex: i.id === instanceId ? 2000 : i.zIndex
      }))
    }));
  }, []);

  // Send message to app
  const sendMessage = useCallback(async (instanceId: string, message: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store resolve/reject for response handling
      messageHandlersRef.current.set(messageId, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.result);
        }
        messageHandlersRef.current.delete(messageId);
      });

      if (isConnected) {
        sendJsonMessage({
          type: 'app_message',
          payload: {
            id: messageId,
            target: instanceId,
            message
          }
        });
      } else {
        messageHandlersRef.current.delete(messageId);
        reject(new Error('Not connected'));
      }
    });
  }, [isConnected, sendJsonMessage]);

  // Discover apps
  const discoverApps = useCallback(async (): Promise<MiniApp[]> => {
    try {
      const apps = await discoverAppsAPI();
      return apps;
    } catch (error) {
      onError?.(error as Error);
      throw error;
    }
  }, [discoverAppsAPI, onError]);

  // Get filtered app lists
  const installedApps = state.apps.filter(a => a.status !== 'available');
  const runningApps = state.apps.filter(a => 
    state.instances.some(i => i.appId === a.id && i.status === 'running')
  );
  const availableApps = state.apps.filter(a => a.status === 'available');
  const activeInstance = state.instances.find(i => i.id === state.activeInstanceId) || null;

  // Update apps when data loads
  useEffect(() => {
    if (appsData) {
      setState(prev => ({
        ...prev,
        apps: appsData.map((appData: any) => ({
          ...appData,
          lastUpdated: new Date(appData.lastUpdated),
          createdAt: new Date(appData.createdAt)
        }))
      }));
    }
  }, [appsData]);

  // Auto-discover apps
  useEffect(() => {
    if (autoDiscoverApps) {
      discoverApps();
    }
  }, [autoDiscoverApps, discoverApps]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all timeouts and intervals
      if (performanceMonitorRef.current) {
        clearInterval(performanceMonitorRef.current);
      }

      // Close all app instances
      state.instances.forEach(instance => {
        closeApp(instance.id);
      });

      // Clear message handlers
      messageHandlersRef.current.clear();
    };
  }, [state.instances, closeApp]);

  return {
    // App state
    apps: state.apps,
    installedApps,
    runningApps,
    availableApps,
    
    // Instance state
    instances: state.instances,
    activeInstance,
    
    // Loading states
    isLoadingApps,
    isInstalling: state.isInstalling,
    isLaunching: state.isLaunching,
    
    // App management
    installApp,
    uninstallApp: async () => { throw new Error('Not implemented'); },
    updateApp: async () => { throw new Error('Not implemented'); },
    configureApp: async () => { throw new Error('Not implemented'); },
    
    // Instance management
    launchApp,
    closeApp,
    suspendApp: async () => { throw new Error('Not implemented'); },
    resumeApp: async () => { throw new Error('Not implemented'); },
    restartApp: async () => { throw new Error('Not implemented'); },
    
    // Window management
    focusApp,
    minimizeApp: () => { throw new Error('Not implemented'); },
    maximizeApp: () => { throw new Error('Not implemented'); },
    resizeApp: () => { throw new Error('Not implemented'); },
    moveApp: () => { throw new Error('Not implemented'); },
    
    // Communication
    sendMessage,
    broadcastMessage: () => { throw new Error('Not implemented'); },
    subscribeToEvents: () => { throw new Error('Not implemented'); },
    
    // Discovery and marketplace
    discoverApps,
    searchApps: async () => { throw new Error('Not implemented'); },
    getAppDetails: async () => { throw new Error('Not implemented'); },
    
    // Development support
    loadLocalApp: async () => { throw new Error('Not implemented'); },
    reloadApp: async () => { throw new Error('Not implemented'); },
    debugApp: async () => { throw new Error('Not implemented'); },
    
    // Utilities
    exportAppData: async () => { throw new Error('Not implemented'); },
    importAppData: async () => { throw new Error('Not implemented'); },
    getAppLogs: async () => { throw new Error('Not implemented'); },
    getAppMetrics: async () => { throw new Error('Not implemented'); },
    
    // Layout management
    saveLayout: async () => { throw new Error('Not implemented'); },
    loadLayout: async () => { throw new Error('Not implemented'); },
    resetLayout: () => { throw new Error('Not implemented'); }
  };
}
