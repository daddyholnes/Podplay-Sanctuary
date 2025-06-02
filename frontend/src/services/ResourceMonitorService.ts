// ResourceMonitorService.ts - Service for retrieving system resource metrics
import { API_ENDPOINTS, buildApiUrl } from '../config/api';

// Type definitions for system metrics
export interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  timestamp: string;
}

export interface SystemMetrics {
  cpu: SystemMetric;
  memory: SystemMetric;
  disk: SystemMetric;
  network: SystemMetric;
  processCount: SystemMetric;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * ResourceMonitorService - Retrieves system resource metrics for the ResourceMonitorPanel
 * Connects to the Control Center and System API endpoints
 */
class ResourceMonitorService {
  /**
   * Fetch current system metrics
   * @returns Promise with system metrics data
   */
  async getSystemMetrics(): Promise<ApiResponse<SystemMetrics>> {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.SYSTEM.METRICS));
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch system metrics:', error);
      return {
        success: false,
        error: 'Failed to load system metrics. Please try again.',
        // Return mock data as fallback to prevent UI breaking
        data: this.getMockMetrics()
      };
    }
  }

  /**
   * Get historical metrics for a specific resource
   * @param metricType - Type of metric (cpu, memory, disk, network)
   * @param timeRange - Time range in minutes (default: 60)
   * @returns Promise with historical metric data
   */
  async getHistoricalMetrics(
    metricType: 'cpu' | 'memory' | 'disk' | 'network' | 'processCount',
    timeRange: number = 60
  ): Promise<ApiResponse<{ timestamps: string[]; values: number[] }>> {
    try {
      const response = await fetch(
        `${buildApiUrl(API_ENDPOINTS.CONTROL_CENTER.SYSTEM_METRICS)}/${metricType}/history?timeRange=${timeRange}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Failed to fetch historical metrics for ${metricType}:`, error);
      return {
        success: false,
        error: `Failed to load ${metricType} history. Please try again.`,
        // Return mock historical data as fallback
        data: this.getMockHistoricalData()
      };
    }
  }

  /**
   * Generate mock metrics for use during development or when API is unavailable
   * @returns Mock system metrics object
   */
  private getMockMetrics(): SystemMetrics {
    const now = new Date().toISOString();
    
    return {
      cpu: {
        id: 'cpu',
        name: 'CPU Usage',
        value: Math.floor(Math.random() * 60) + 20, // 20-80%
        unit: '%',
        status: 'normal',
        timestamp: now
      },
      memory: {
        id: 'memory',
        name: 'Memory Usage',
        value: Math.floor(Math.random() * 50) + 30, // 30-80%
        unit: '%',
        status: 'normal',
        timestamp: now
      },
      disk: {
        id: 'disk',
        name: 'Disk Usage',
        value: Math.floor(Math.random() * 40) + 30, // 30-70%
        unit: '%',
        status: 'normal',
        timestamp: now
      },
      network: {
        id: 'network',
        name: 'Network Usage',
        value: Math.floor(Math.random() * 10) + 1, // 1-11 MB/s
        unit: 'MB/s',
        status: 'normal',
        timestamp: now
      },
      processCount: {
        id: 'processCount',
        name: 'Process Count',
        value: Math.floor(Math.random() * 50) + 20, // 20-70 processes
        unit: 'processes',
        status: 'normal',
        timestamp: now
      }
    };
  }

  /**
   * Generate mock historical data for development or when API is unavailable
   * @returns Mock historical data with timestamps and values
   */
  private getMockHistoricalData(): { timestamps: string[]; values: number[] } {
    const timestamps: string[] = [];
    const values: number[] = [];
    const now = new Date();
    
    // Generate data points for the last hour
    for (let i = 60; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60000); // i minutes ago
      timestamps.push(timestamp.toISOString());
      
      // Generate a value between 10-90 with some randomness but follow a pattern
      const baseValue = 40 + 20 * Math.sin(i / 10);
      const randomOffset = Math.random() * 15 - 7.5;
      values.push(Math.max(5, Math.min(95, baseValue + randomOffset)));
    }
    
    return { timestamps, values };
  }
}

// Export a singleton instance
export const resourceMonitorService = new ResourceMonitorService();
export default resourceMonitorService;
