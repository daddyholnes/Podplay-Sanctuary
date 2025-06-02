import api from './api';

/**
 * Types for MCP tool handling
 */
export interface McpTool {
  id: string;
  name: string;
  description: string;
  category: string;
  provider: string;
  version: string;
  rating: number;
  downloads: number;
  tags: string[];
  installed: boolean;
  featured: boolean;
  icon: string;
  permissions: string[];
  documentation: string;
  createdAt: string;
  updatedAt: string;
}

export interface McpToolInstallOptions {
  autoUpdate?: boolean;
  customConfig?: Record<string, any>;
}

/**
 * API services for Scout MCP Marketplace module
 * Handles MCP tool discovery, installation, and management
 */
const mcpApi = {
  // Tool discovery
  async getTools(category?: string, query?: string): Promise<McpTool[]> {
    const response = await api.get('/mcp/tools', {
      params: { category, query }
    });
    return response.data;
  },

  async getToolDetails(toolId: string): Promise<McpTool> {
    const response = await api.get(`/mcp/tools/${toolId}`);
    return response.data;
  },
  
  async getFeaturedTools(): Promise<McpTool[]> {
    const response = await api.get('/mcp/tools/featured');
    return response.data;
  },
  
  async getPopularTools(): Promise<McpTool[]> {
    const response = await api.get('/mcp/tools/popular');
    return response.data;
  },

  // Tool categories
  async getCategories(): Promise<{id: string, name: string, count: number}[]> {
    const response = await api.get('/mcp/categories');
    return response.data;
  },

  // Tool management
  async getInstalledTools(): Promise<McpTool[]> {
    const response = await api.get('/mcp/tools/installed');
    return response.data;
  },

  async installTool(toolId: string, options?: McpToolInstallOptions): Promise<{success: boolean, message: string}> {
    const response = await api.post(`/mcp/tools/${toolId}/install`, options || {});
    return response.data;
  },

  async uninstallTool(toolId: string): Promise<{success: boolean, message: string}> {
    const response = await api.post(`/mcp/tools/${toolId}/uninstall`);
    return response.data;
  },

  async updateTool(toolId: string): Promise<{success: boolean, message: string}> {
    const response = await api.post(`/mcp/tools/${toolId}/update`);
    return response.data;
  },
  
  // Tool configuration
  async getToolConfig(toolId: string): Promise<Record<string, any>> {
    const response = await api.get(`/mcp/tools/${toolId}/config`);
    return response.data;
  },
  
  async updateToolConfig(toolId: string, config: Record<string, any>): Promise<{success: boolean, message: string}> {
    const response = await api.post(`/mcp/tools/${toolId}/config`, config);
    return response.data;
  },
  
  // Tool usage statistics
  async getToolStats(toolId: string): Promise<{
    usage: number,
    averageResponseTime: number,
    errorRate: number,
    lastUsed: string
  }> {
    const response = await api.get(`/mcp/tools/${toolId}/stats`);
    return response.data;
  },
  
  // Tool providers
  async getToolProviders(): Promise<{id: string, name: string, toolCount: number}[]> {
    const response = await api.get('/mcp/providers');
    return response.data;
  },

  // Tool authorization
  async authorizeToolProvider(providerId: string): Promise<{authUrl: string}> {
    const response = await api.post(`/mcp/providers/${providerId}/authorize`);
    return response.data;
  },

  // Tool token management
  async getToolTokens(): Promise<{providerId: string, tokenName: string, expiresAt: string}[]> {
    const response = await api.get('/mcp/tokens');
    return response.data;
  },

  async revokeToolToken(providerId: string): Promise<{success: boolean}> {
    const response = await api.post(`/mcp/tokens/${providerId}/revoke`);
    return response.data;
  }
};

export default mcpApi;
