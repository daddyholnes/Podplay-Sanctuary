/**
 * MCP State Selectors
 * 
 * Specialized selectors for Model Context Protocol server management,
 * connections, tools, and resources state.
 * Optimized with memoization for performance.
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import type { 
  MCPState, 
  MCPServer, 
  MCPConnection, 
  MCPTool, 
  MCPResource,
  MCPSettings,
  ServerFilter,
  ToolFilter
} from '../slices/mcpSlice';

// Base MCP selector
export const selectMCP = (state: RootState): MCPState => state.mcp;

// Server selectors
export const selectServers = createSelector(
  [selectMCP],
  (mcp) => mcp.servers
);

export const selectActiveServerId = createSelector(
  [selectMCP],
  (mcp) => mcp.activeServerId
);

export const selectActiveServer = createSelector(
  [selectServers, selectActiveServerId],
  (servers, activeId) => 
    activeId ? servers.find(server => server.id === activeId) || null : null
);

export const selectServerById = createSelector(
  [selectServers, (_: RootState, serverId: string) => serverId],
  (servers, serverId) => servers.find(server => server.id === serverId) || null
);

export const selectConnectedServers = createSelector(
  [selectServers],
  (servers) => servers.filter(server => server.status === 'connected')
);

export const selectDisconnectedServers = createSelector(
  [selectServers],
  (servers) => servers.filter(server => server.status === 'disconnected')
);

export const selectConnectingServers = createSelector(
  [selectServers],
  (servers) => servers.filter(server => server.status === 'connecting')
);

export const selectErroredServers = createSelector(
  [selectServers],
  (servers) => servers.filter(server => server.status === 'error')
);

export const selectServersByType = createSelector(
  [selectServers, (_: RootState, type: string) => type],
  (servers, type) => servers.filter(server => server.type === type)
);

export const selectFavoriteServers = createSelector(
  [selectServers],
  (servers) => servers.filter(server => server.isFavorite)
);

export const selectEnabledServers = createSelector(
  [selectServers],
  (servers) => servers.filter(server => server.isEnabled)
);

// Connection selectors
export const selectConnections = createSelector(
  [selectMCP],
  (mcp) => mcp.connections
);

export const selectActiveConnections = createSelector(
  [selectConnections],
  (connections) => connections.filter(conn => conn.isActive)
);

export const selectConnectionById = createSelector(
  [selectConnections, (_: RootState, connectionId: string) => connectionId],
  (connections, connectionId) => 
    connections.find(conn => conn.id === connectionId) || null
);

export const selectConnectionsByServer = createSelector(
  [selectConnections, (_: RootState, serverId: string) => serverId],
  (connections, serverId) => 
    connections.filter(conn => conn.serverId === serverId)
);

export const selectConnectionStats = createSelector(
  [selectConnections],
  (connections) => {
    const stats = connections.reduce((acc, conn) => {
      acc.total++;
      if (conn.isActive) acc.active++;
      if (conn.lastError) acc.withErrors++;
      acc.totalMessages += conn.messageCount || 0;
      acc.totalUptime += conn.uptime || 0;
      return acc;
    }, {
      total: 0,
      active: 0,
      withErrors: 0,
      totalMessages: 0,
      totalUptime: 0
    });
    
    return {
      ...stats,
      averageUptime: stats.total > 0 ? stats.totalUptime / stats.total : 0,
      averageMessages: stats.total > 0 ? stats.totalMessages / stats.total : 0
    };
  }
);

// Tool selectors
export const selectTools = createSelector(
  [selectMCP],
  (mcp) => mcp.tools
);

export const selectAvailableTools = createSelector(
  [selectTools],
  (tools) => tools.filter(tool => tool.isAvailable)
);

export const selectToolsByServer = createSelector(
  [selectTools, (_: RootState, serverId: string) => serverId],
  (tools, serverId) => tools.filter(tool => tool.serverId === serverId)
);

export const selectToolsByCategory = createSelector(
  [selectTools, (_: RootState, category: string) => category],
  (tools, category) => tools.filter(tool => tool.category === category)
);

export const selectFavoriteTools = createSelector(
  [selectTools],
  (tools) => tools.filter(tool => tool.isFavorite)
);

export const selectRecentlyUsedTools = createSelector(
  [selectTools],
  (tools) => 
    [...tools]
      .filter(tool => tool.lastUsed)
      .sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0))
      .slice(0, 10)
);

export const selectToolUsageStats = createSelector(
  [selectTools],
  (tools) => {
    const stats = tools.reduce((acc, tool) => {
      acc.total++;
      if (tool.isAvailable) acc.available++;
      acc.totalUsage += tool.usageCount || 0;
      
      if (tool.category) {
        if (!acc.byCategory[tool.category]) {
          acc.byCategory[tool.category] = 0;
        }
        acc.byCategory[tool.category]++;
      }
      
      return acc;
    }, {
      total: 0,
      available: 0,
      totalUsage: 0,
      byCategory: {} as Record<string, number>
    });
    
    return {
      ...stats,
      averageUsage: stats.total > 0 ? stats.totalUsage / stats.total : 0
    };
  }
);

// Resource selectors
export const selectResources = createSelector(
  [selectMCP],
  (mcp) => mcp.resources
);

export const selectResourcesByServer = createSelector(
  [selectResources, (_: RootState, serverId: string) => serverId],
  (resources, serverId) => resources.filter(resource => resource.serverId === serverId)
);

export const selectResourcesByType = createSelector(
  [selectResources, (_: RootState, type: string) => type],
  (resources, type) => resources.filter(resource => resource.type === type)
);

export const selectCachedResources = createSelector(
  [selectResources],
  (resources) => resources.filter(resource => resource.isCached)
);

export const selectResourcesByMimeType = createSelector(
  [selectResources, (_: RootState, mimeType: string) => mimeType],
  (resources, mimeType) => resources.filter(resource => resource.mimeType === mimeType)
);

// Settings selectors
export const selectMCPSettings = createSelector(
  [selectMCP],
  (mcp) => mcp.settings
);

export const selectConnectionSettings = createSelector(
  [selectMCPSettings],
  (settings) => settings.connection
);

export const selectSecuritySettings = createSelector(
  [selectMCPSettings],
  (settings) => settings.security
);

export const selectLoggingSettings = createSelector(
  [selectMCPSettings],
  (settings) => settings.logging
);

export const selectNotificationSettings = createSelector(
  [selectMCPSettings],
  (settings) => settings.notifications
);

// Filter selectors
export const selectServerFilter = createSelector(
  [selectMCP],
  (mcp) => mcp.serverFilter
);

export const selectToolFilter = createSelector(
  [selectMCP],
  (mcp) => mcp.toolFilter
);

export const selectFilteredServers = createSelector(
  [selectServers, selectServerFilter],
  (servers, filter) => {
    if (!filter) return servers;
    
    let filtered = servers;
    
    if (filter.status) {
      filtered = filtered.filter(server => server.status === filter.status);
    }
    
    if (filter.type) {
      filtered = filtered.filter(server => server.type === filter.type);
    }
    
    if (filter.isEnabled !== undefined) {
      filtered = filtered.filter(server => server.isEnabled === filter.isEnabled);
    }
    
    if (filter.isFavorite !== undefined) {
      filtered = filtered.filter(server => server.isFavorite === filter.isFavorite);
    }
    
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filtered = filtered.filter(server => 
        server.name.toLowerCase().includes(query) ||
        server.description?.toLowerCase().includes(query) ||
        server.url?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }
);

export const selectFilteredTools = createSelector(
  [selectTools, selectToolFilter],
  (tools, filter) => {
    if (!filter) return tools;
    
    let filtered = tools;
    
    if (filter.category) {
      filtered = filtered.filter(tool => tool.category === filter.category);
    }
    
    if (filter.isAvailable !== undefined) {
      filtered = filtered.filter(tool => tool.isAvailable === filter.isAvailable);
    }
    
    if (filter.isFavorite !== undefined) {
      filtered = filtered.filter(tool => tool.isFavorite === filter.isFavorite);
    }
    
    if (filter.serverId) {
      filtered = filtered.filter(tool => tool.serverId === filter.serverId);
    }
    
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filtered = filtered.filter(tool => 
        tool.name.toLowerCase().includes(query) ||
        tool.description?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }
);

// Status selectors
export const selectMCPLoading = createSelector(
  [selectMCP],
  (mcp) => mcp.loading
);

export const selectMCPErrors = createSelector(
  [selectMCP],
  (mcp) => mcp.errors
);

export const selectLastUpdate = createSelector(
  [selectMCP],
  (mcp) => mcp.lastUpdate
);

// Composite selectors
export const selectMCPMetrics = createSelector(
  [selectServers, selectConnections, selectTools, selectResources],
  (servers, connections, tools, resources) => ({
    totalServers: servers.length,
    connectedServers: servers.filter(s => s.status === 'connected').length,
    totalConnections: connections.length,
    activeConnections: connections.filter(c => c.isActive).length,
    totalTools: tools.length,
    availableTools: tools.filter(t => t.isAvailable).length,
    totalResources: resources.length,
    cachedResources: resources.filter(r => r.isCached).length
  })
);

export const selectMCPStatus = createSelector(
  [selectMCPLoading, selectMCPErrors, selectConnectedServers, selectActiveConnections],
  (loading, errors, connectedServers, activeConnections) => ({
    isLoading: Object.values(loading).some(Boolean),
    hasErrors: errors.length > 0,
    hasConnectedServers: connectedServers.length > 0,
    hasActiveConnections: activeConnections.length > 0,
    isHealthy: errors.length === 0 && connectedServers.length > 0
  })
);

export const selectServerHealth = createSelector(
  [selectActiveServer, selectConnectionsByServer],
  (server, connections) => {
    if (!server) return null;
    
    const serverConnections = connections.filter(c => c.serverId === server.id);
    const activeConnections = serverConnections.filter(c => c.isActive);
    const errorConnections = serverConnections.filter(c => c.lastError);
    
    return {
      id: server.id,
      name: server.name,
      status: server.status,
      isHealthy: server.status === 'connected' && activeConnections.length > 0,
      connectionCount: serverConnections.length,
      activeConnectionCount: activeConnections.length,
      errorConnectionCount: errorConnections.length,
      uptime: server.uptime || 0,
      lastError: server.lastError,
      responseTime: server.responseTime || 0
    };
  }
);

export const selectMCPActivity = createSelector(
  [selectServers, selectConnections, selectTools],
  (servers, connections, tools) => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    return {
      todayConnections: connections.filter(c => 
        c.connectedAt && c.connectedAt > now - oneDay
      ).length,
      todayToolUsage: tools.reduce((sum, tool) => 
        sum + (tool.lastUsed && tool.lastUsed > now - oneDay ? tool.usageCount || 0 : 0), 0
      ),
      activeServers: servers.filter(s => s.status === 'connected').length,
      lastActivity: Math.max(
        ...connections.map(c => c.connectedAt || 0),
        ...tools.map(t => t.lastUsed || 0),
        0
      )
    };
  }
);

export const selectMCPPerformance = createSelector(
  [selectServers, selectConnections, selectTools],
  (servers, connections, tools) => ({
    averageResponseTime: calculateAverageResponseTime(servers),
    connectionStability: calculateConnectionStability(connections),
    toolPerformance: calculateToolPerformance(tools),
    resourceCacheHitRate: calculateCacheHitRate(),
    optimizationScore: calculateMCPOptimizationScore(servers, connections, tools)
  })
);

// Helper functions for performance calculations
function calculateAverageResponseTime(servers: MCPServer[]): number {
  const connectedServers = servers.filter(s => s.status === 'connected' && s.responseTime);
  if (connectedServers.length === 0) return 0;
  
  const totalResponseTime = connectedServers.reduce((sum, server) => 
    sum + (server.responseTime || 0), 0
  );
  
  return Math.round(totalResponseTime / connectedServers.length);
}

function calculateConnectionStability(connections: MCPConnection[]): number {
  if (connections.length === 0) return 100;
  
  const stableConnections = connections.filter(conn => 
    !conn.lastError && (conn.uptime || 0) > 60000 // 1 minute
  );
  
  return Math.round((stableConnections.length / connections.length) * 100);
}

function calculateToolPerformance(tools: MCPTool[]): number {
  const availableTools = tools.filter(t => t.isAvailable);
  if (tools.length === 0) return 100;
  
  return Math.round((availableTools.length / tools.length) * 100);
}

function calculateCacheHitRate(): number {
  // Simplified calculation - would be based on actual cache metrics
  return 85; // 85% hit rate
}

function calculateMCPOptimizationScore(
  servers: MCPServer[], 
  connections: MCPConnection[], 
  tools: MCPTool[]
): number {
  let score = 100;
  
  // Reduce score for disconnected servers
  const disconnectedServers = servers.filter(s => s.status !== 'connected');
  score -= disconnectedServers.length * 10;
  
  // Reduce score for inactive connections
  const inactiveConnections = connections.filter(c => !c.isActive);
  score -= inactiveConnections.length * 5;
  
  // Reduce score for unavailable tools
  const unavailableTools = tools.filter(t => !t.isAvailable);
  score -= unavailableTools.length * 2;
  
  return Math.max(0, Math.min(100, score));
}

// Export all selectors
export default {
  // Base
  selectMCP,
  
  // Servers
  selectServers,
  selectActiveServerId,
  selectActiveServer,
  selectServerById,
  selectConnectedServers,
  selectDisconnectedServers,
  selectConnectingServers,
  selectErroredServers,
  selectServersByType,
  selectFavoriteServers,
  selectEnabledServers,
  
  // Connections
  selectConnections,
  selectActiveConnections,
  selectConnectionById,
  selectConnectionsByServer,
  selectConnectionStats,
  
  // Tools
  selectTools,
  selectAvailableTools,
  selectToolsByServer,
  selectToolsByCategory,
  selectFavoriteTools,
  selectRecentlyUsedTools,
  selectToolUsageStats,
  
  // Resources
  selectResources,
  selectResourcesByServer,
  selectResourcesByType,
  selectCachedResources,
  selectResourcesByMimeType,
  
  // Settings
  selectMCPSettings,
  selectConnectionSettings,
  selectSecuritySettings,
  selectLoggingSettings,
  selectNotificationSettings,
  
  // Filters
  selectServerFilter,
  selectToolFilter,
  selectFilteredServers,
  selectFilteredTools,
  
  // Status
  selectMCPLoading,
  selectMCPErrors,
  selectLastUpdate,
  
  // Composite
  selectMCPMetrics,
  selectMCPStatus,
  selectServerHealth,
  selectMCPActivity,
  selectMCPPerformance
};
