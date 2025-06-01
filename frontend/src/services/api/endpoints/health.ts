/**
 * Health API Endpoints
 * System health monitoring and diagnostics endpoints
 */

import { apiClient } from '../APIClient';
import { HealthStatus, SystemStatus } from '../APITypes';

export class HealthAPI {
  /**
   * Basic health check
   */
  static async check(): Promise<HealthStatus> {
    const response = await apiClient.get<HealthStatus>('/health');
    return response.data;
  }

  /**
   * Detailed system status
   */
  static async getSystemStatus(): Promise<SystemStatus> {
    const response = await apiClient.get<SystemStatus>('/api/health/status');
    return response.data;
  }

  /**
   * Check specific service health
   */
  static async checkService(serviceName: string): Promise<{
    service: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    lastCheck: string;
    responseTime: number;
    details?: Record<string, any>;
  }> {
    const response = await apiClient.get(`/api/health/service/${serviceName}`);
    return response.data;
  }

  /**
   * Get all service statuses
   */
  static async getAllServices(): Promise<{
    services: Array<{
      name: string;
      status: 'healthy' | 'degraded' | 'unhealthy';
      lastCheck: string;
      responseTime: number;
      uptime: number;
    }>;
    overall: 'healthy' | 'degraded' | 'unhealthy';
  }> {
    const response = await apiClient.get('/api/health/services');
    return response.data;
  }

  /**
   * Get database health
   */
  static async checkDatabase(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    connectionCount: number;
    queryTime: number;
    lastMigration: string;
    diskUsage: {
      used: number;
      total: number;
      percentage: number;
    };
  }> {
    const response = await apiClient.get('/api/health/database');
    return response.data;
  }

  /**
   * Get AI service health
   */
  static async checkAI(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    models: Array<{
      name: string;
      status: 'available' | 'unavailable' | 'degraded';
      responseTime: number;
      lastUsed: string;
    }>;
    totalRequests: number;
    averageResponseTime: number;
  }> {
    const response = await apiClient.get('/api/health/ai');
    return response.data;
  }

  /**
   * Get MCP service health
   */
  static async checkMCP(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    serversActive: number;
    serversTotal: number;
    averageResponseTime: number;
    totalExecutions: number;
  }> {
    const response = await apiClient.get('/api/health/mcp');
    return response.data;
  }

  /**
   * Get Scout service health
   */
  static async checkScout(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    filesIndexed: number;
    lastIndexUpdate: string;
    workspacesActive: number;
    queryResponseTime: number;
  }> {
    const response = await apiClient.get('/api/health/scout');
    return response.data;
  }

  /**
   * Performance metrics
   */
  static async getPerformanceMetrics(): Promise<{
    cpu: {
      usage: number;
      cores: number;
      loadAverage: number[];
    };
    memory: {
      used: number;
      total: number;
      percentage: number;
      swapUsed: number;
      swapTotal: number;
    };
    disk: {
      used: number;
      total: number;
      percentage: number;
      readSpeed: number;
      writeSpeed: number;
    };
    network: {
      bytesIn: number;
      bytesOut: number;
      packetsIn: number;
      packetsOut: number;
      errors: number;
    };
  }> {
    const response = await apiClient.get('/api/health/performance');
    return response.data;
  }

  /**
   * Get error logs summary
   */
  static async getErrorSummary(hours: number = 24): Promise<{
    totalErrors: number;
    errorsByLevel: Record<string, number>;
    errorsByService: Record<string, number>;
    topErrors: Array<{
      message: string;
      count: number;
      lastOccurrence: string;
      service: string;
    }>;
    timeRange: {
      start: string;
      end: string;
      hours: number;
    };
  }> {
    const response = await apiClient.get(`/api/health/errors?hours=${hours}`);
    return response.data;
  }

  /**
   * Get alerts
   */
  static async getAlerts(): Promise<{
    alerts: Array<{
      id: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      service: string;
      message: string;
      timestamp: string;
      acknowledged: boolean;
      resolved: boolean;
    }>;
    totalUnacknowledged: number;
    totalUnresolved: number;
  }> {
    const response = await apiClient.get('/api/health/alerts');
    return response.data;
  }

  /**
   * Acknowledge an alert
   */
  static async acknowledgeAlert(alertId: string): Promise<{ success: boolean }> {
    const response = await apiClient.post(`/api/health/alerts/${alertId}/acknowledge`);
    return response.data;
  }

  /**
   * Resolve an alert
   */
  static async resolveAlert(alertId: string): Promise<{ success: boolean }> {
    const response = await apiClient.post(`/api/health/alerts/${alertId}/resolve`);
    return response.data;
  }

  /**
   * Get API response times
   */
  static async getResponseTimes(endpoint?: string): Promise<{
    endpoints: Array<{
      endpoint: string;
      averageResponseTime: number;
      minResponseTime: number;
      maxResponseTime: number;
      requestCount: number;
      errorRate: number;
    }>;
    overall: {
      averageResponseTime: number;
      totalRequests: number;
      totalErrors: number;
      errorRate: number;
    };
  }> {
    const url = endpoint ? `/api/health/response-times?endpoint=${encodeURIComponent(endpoint)}` : '/api/health/response-times';
    const response = await apiClient.get(url);
    return response.data;
  }

  /**
   * Run diagnostic tests
   */
  static async runDiagnostics(): Promise<{
    testResults: Array<{
      test: string;
      status: 'pass' | 'fail' | 'warning';
      message: string;
      duration: number;
      details?: any;
    }>;
    overallStatus: 'pass' | 'fail' | 'warning';
    totalDuration: number;
  }> {
    const response = await apiClient.post('/api/health/diagnostics');
    return response.data;
  }

  /**
   * Get uptime information
   */
  static async getUptime(): Promise<{
    uptime: number;
    startTime: string;
    version: string;
    environment: string;
    deploymentTime: string;
  }> {
    const response = await apiClient.get('/api/health/uptime');
    return response.data;
  }
}

export default HealthAPI;
