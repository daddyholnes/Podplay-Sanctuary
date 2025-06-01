/**
 * MCP Hooks Barrel Export
 * 
 * Centralized exports for all Model Context Protocol React hooks
 * Provides clean imports: import { useMCP, useMCPServers } from '@/hooks/mcp'
 */

// Core MCP hooks
export { default as useMCP } from './useMCP';

// Re-export types for convenience
export type {
  UseMCPOptions,
  UseMCPResult,
  MCPState,
  MCPServer,
  MCPServerConfig,
  MCPProtocol,
  MCPCapability,
  MCPHealth,
  MCPMarketplace
} from './useMCP';
