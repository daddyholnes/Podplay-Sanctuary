/**
 * MCP API Endpoints
 * Model Context Protocol server management and integration endpoints
 */

import { apiClient } from '../APIClient';
import { 
  MCPServer, 
  MCPInstallRequest, 
  MCPInstallResponse 
} from '../APITypes';

export class MCPAPI {
  /**
   * Get all available MCP servers
   */
  static async getServers(): Promise<MCPServer[]> {
    const response = await apiClient.get<MCPServer[]>('/api/mcp/servers');
    return response.data;
  }

  /**
   * Get details of a specific MCP server
   */
  static async getServer(serverId: string): Promise<MCPServer> {
    const response = await apiClient.get<MCPServer>(`/api/mcp/servers/${serverId}`);
    return response.data;
  }

  /**
   * Install an MCP server
   */
  static async installServer(request: MCPInstallRequest): Promise<MCPInstallResponse> {
    const response = await apiClient.post<MCPInstallResponse>('/api/mcp/install', request);
    return response.data;
  }

  /**
   * Uninstall an MCP server
   */
  static async uninstallServer(serverId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/api/mcp/servers/${serverId}`);
    return response.data;
  }

  /**
   * Start an MCP server
   */
  static async startServer(serverId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`/api/mcp/servers/${serverId}/start`);
    return response.data;
  }

  /**
   * Stop an MCP server
   */
  static async stopServer(serverId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`/api/mcp/servers/${serverId}/stop`);
    return response.data;
  }

  /**
   * Restart an MCP server
   */
  static async restartServer(serverId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`/api/mcp/servers/${serverId}/restart`);
    return response.data;
  }

  /**
   * Get MCP server status
   */
  static async getServerStatus(serverId?: string): Promise<{
    servers: Array<{
      id: string;
      name: string;
      status: 'active' | 'inactive' | 'error';
      uptime: number;
      lastSeen: string;
      capabilities: string[];
      resourceUsage: {
        cpu: number;
        memory: number;
      };
    }>;
    totalActive: number;
    totalInactive: number;
  }> {
    const endpoint = serverId ? `/api/mcp/status/${serverId}` : '/api/mcp/status';
    const response = await apiClient.get(endpoint);
    return response.data;
  }

  /**
   * Update MCP server configuration
   */
  static async updateServerConfig(
    serverId: string, 
    config: Record<string, any>
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.patch(`/api/mcp/servers/${serverId}/config`, { config });
    return response.data;
  }

  /**
   * Get MCP server logs
   */
  static async getServerLogs(
    serverId: string,
    options: {
      lines?: number;
      since?: string;
      level?: 'debug' | 'info' | 'warn' | 'error';
    } = {}
  ): Promise<{
    logs: Array<{
      timestamp: string;
      level: string;
      message: string;
      data?: any;
    }>;
    totalLines: number;
  }> {
    const params = new URLSearchParams();
    if (options.lines) params.append('lines', options.lines.toString());
    if (options.since) params.append('since', options.since);
    if (options.level) params.append('level', options.level);
    
    const response = await apiClient.get(`/api/mcp/servers/${serverId}/logs?${params}`);
    return response.data;
  }

  /**
   * Test MCP server connection
   */
  static async testServerConnection(serverId: string): Promise<{
    success: boolean;
    latency: number;
    capabilities: string[];
    version: string;
    error?: string;
  }> {
    const response = await apiClient.post(`/api/mcp/servers/${serverId}/test`);
    return response.data;
  }

  /**
   * Get MCP marketplace (available servers to install)
   */
  static async getMarketplace(category?: string): Promise<Array<{
    id: string;
    name: string;
    description: string;
    version: string;
    author: string;
    category: string;
    capabilities: string[];
    requirements: string[];
    installUrl: string;
    documentation: string;
    rating: number;
    downloads: number;
    isInstalled: boolean;
  }>> {
    const endpoint = category ? `/api/mcp/marketplace?category=${category}` : '/api/mcp/marketplace';
    const response = await apiClient.get(endpoint);
    return response.data;
  }

  /**
   * Search MCP marketplace
   */
  static async searchMarketplace(query: string): Promise<Array<{
    id: string;
    name: string;
    description: string;
    relevanceScore: number;
    category: string;
    capabilities: string[];
  }>> {
    const response = await apiClient.get(`/api/mcp/marketplace/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  /**
   * Get MCP server capabilities
   */
  static async getServerCapabilities(serverId: string): Promise<{
    capabilities: Array<{
      name: string;
      description: string;
      version: string;
      parameters: Record<string, any>;
      examples: any[];
    }>;
    totalCapabilities: number;
  }> {
    const response = await apiClient.get(`/api/mcp/servers/${serverId}/capabilities`);
    return response.data;
  }

  /**
   * Execute MCP server capability
   */
  static async executeCapability(
    serverId: string,
    capabilityName: string,
    parameters: Record<string, any> = {}
  ): Promise<{
    success: boolean;
    result: any;
    executionTime: number;
    error?: string;
  }> {
    const response = await apiClient.post(`/api/mcp/servers/${serverId}/execute`, {
      capability: capabilityName,
      parameters,
    });
    return response.data;
  }

  /**
   * Bulk operations on MCP servers
   */
  static async bulkOperation(
    operation: 'start' | 'stop' | 'restart' | 'uninstall',
    serverIds: string[]
  ): Promise<{
    success: number;
    failed: number;
    results: Array<{
      serverId: string;
      success: boolean;
      message: string;
    }>;
  }> {
    const response = await apiClient.post('/api/mcp/bulk', {
      operation,
      serverIds,
    });
    return response.data;
  }
}

export default MCPAPI;
