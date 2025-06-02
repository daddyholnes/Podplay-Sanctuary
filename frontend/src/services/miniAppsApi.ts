import api from './api';

/**
 * Types for Mini App handling
 */
export interface MiniApp {
  id: string;
  name: string;
  description: string;
  category: string;
  author: string;
  version: string;
  rating: number;
  downloads: number;
  tags: string[];
  icon: string;
  color: string;
  installed: boolean;
  featured: boolean;
  lastUsed?: string; // ISO date string
  permissions: string[];
  requirements?: {
    minVersion: string;
    dependencies: string[];
  };
  previewImages?: string[];
}

export interface MiniAppSession {
  id: string;
  appId: string;
  name: string;
  state: Record<string, any>;
  created: string;
  updated: string;
}

/**
 * API services for Scout Mini Apps Hub module
 * Handles mini application discovery, installation, and session management
 */
const miniAppsApi = {
  // App discovery
  async getApps(category?: string, query?: string): Promise<MiniApp[]> {
    const response = await api.get('/mini-apps', {
      params: { category, query }
    });
    return response.data;
  },

  async getAppDetails(appId: string): Promise<MiniApp> {
    const response = await api.get(`/mini-apps/${appId}`);
    return response.data;
  },
  
  async getFeaturedApps(): Promise<MiniApp[]> {
    const response = await api.get('/mini-apps/featured');
    return response.data;
  },

  // App categories
  async getCategories(): Promise<{id: string, name: string, count: number}[]> {
    const response = await api.get('/mini-apps/categories');
    return response.data;
  },

  // App management
  async getInstalledApps(): Promise<MiniApp[]> {
    const response = await api.get('/mini-apps/installed');
    return response.data;
  },

  async installApp(appId: string): Promise<{success: boolean, message: string}> {
    const response = await api.post(`/mini-apps/${appId}/install`);
    return response.data;
  },

  async uninstallApp(appId: string): Promise<{success: boolean, message: string}> {
    const response = await api.post(`/mini-apps/${appId}/uninstall`);
    return response.data;
  },

  async updateApp(appId: string): Promise<{success: boolean, message: string}> {
    const response = await api.post(`/mini-apps/${appId}/update`);
    return response.data;
  },
  
  // App sessions
  async getSessions(appId: string): Promise<MiniAppSession[]> {
    const response = await api.get(`/mini-apps/${appId}/sessions`);
    return response.data;
  },
  
  async createSession(appId: string, name: string): Promise<MiniAppSession> {
    const response = await api.post(`/mini-apps/${appId}/sessions`, { name });
    return response.data;
  },
  
  async getSessionState(appId: string, sessionId: string): Promise<Record<string, any>> {
    const response = await api.get(`/mini-apps/${appId}/sessions/${sessionId}/state`);
    return response.data;
  },
  
  async updateSessionState(
    appId: string, 
    sessionId: string, 
    state: Record<string, any>
  ): Promise<{success: boolean}> {
    const response = await api.patch(`/mini-apps/${appId}/sessions/${sessionId}/state`, state);
    return response.data;
  },
  
  async deleteSession(appId: string, sessionId: string): Promise<void> {
    await api.delete(`/mini-apps/${appId}/sessions/${sessionId}`);
  },
  
  // App usage 
  async launchApp(appId: string, sessionId?: string): Promise<{
    sessionId: string,
    appData: Record<string, any>,
    url?: string
  }> {
    const response = await api.post('/mini-apps/launch', {
      appId,
      sessionId
    });
    return response.data;
  },
  
  async recordUsage(appId: string): Promise<void> {
    await api.post(`/mini-apps/${appId}/usage`);
  },
  
  // App data management
  async getAppData(appId: string, key: string): Promise<any> {
    const response = await api.get(`/mini-apps/${appId}/data/${key}`);
    return response.data;
  },
  
  async setAppData(appId: string, key: string, value: any): Promise<{success: boolean}> {
    const response = await api.post(`/mini-apps/${appId}/data/${key}`, { value });
    return response.data;
  },
  
  async deleteAppData(appId: string, key: string): Promise<void> {
    await api.delete(`/mini-apps/${appId}/data/${key}`);
  },
  
  // App assets management
  async getAppAsset(appId: string, assetPath: string): Promise<Blob> {
    const response = await api.get(`/mini-apps/${appId}/assets/${assetPath}`, {
      responseType: 'blob'
    });
    return response.data;
  },
  
  // App screenshots/preview images
  async getAppScreenshots(appId: string): Promise<string[]> {
    const response = await api.get(`/mini-apps/${appId}/screenshots`);
    return response.data;
  }
};

export default miniAppsApi;
