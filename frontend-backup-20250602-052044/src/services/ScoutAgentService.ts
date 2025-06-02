// ScoutAgentService.ts - Service for interacting with the Scout Agent API
import { API_ENDPOINTS, buildApiUrl, buildDynamicApiUrl, endpointBuilders } from '../config/api';

// Type definitions for Scout projects and analysis
export interface ScoutProject {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'paused' | 'completed' | 'failed';
  repository_url?: string;
  tags?: string[];
  metrics?: {
    files_analyzed: number;
    issues_found: number;
    suggestions_made: number;
  };
}

export interface ScoutAnalysis {
  id: string;
  project_id: string;
  timestamp: string;
  status: 'in_progress' | 'completed' | 'failed';
  findings: ScoutFinding[];
  summary?: string;
}

export interface ScoutFinding {
  id: string;
  type: 'issue' | 'suggestion' | 'information';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  file_path?: string;
  line_number?: number;
  code_snippet?: string;
  suggested_fix?: string;
  tags?: string[];
}

export interface ScoutMetrics {
  id: string;
  project_id: string;
  timestamp: string;
  metrics: {
    [key: string]: number | string | boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * ScoutAgentService - Handles all communication with the Scout Agent API
 * Scout Agent is responsible for research, discovery, and project analysis
 */
class ScoutAgentService {
  /**
   * List all Scout projects
   * @returns Promise with array of projects
   */
  async listProjects(): Promise<ApiResponse<ScoutProject[]>> {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.SCOUT_AGENT.LIST_PROJECTS));
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to list Scout projects:', error);
      return { 
        success: false, 
        error: 'Failed to load Scout projects. Please try again.' 
      };
    }
  }

  /**
   * Get details for a specific project
   * @param projectId - ID of the project
   * @returns Promise with project details
   */
  async getProject(projectId: string): Promise<ApiResponse<ScoutProject>> {
    try {
      const url = buildDynamicApiUrl(API_ENDPOINTS.SCOUT_AGENT.GET_PROJECT, { id: projectId });
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Failed to get Scout project ${projectId}:`, error);
      return { 
        success: false, 
        error: 'Failed to load project details. Please try again.' 
      };
    }
  }

  /**
   * Create a new Scout project
   * @param projectData - Project details
   * @returns Promise with newly created project
   */
  async createProject(projectData: { 
    name: string; 
    description?: string;
    repository_url?: string;
    tags?: string[];
  }): Promise<ApiResponse<ScoutProject>> {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.SCOUT_AGENT.CREATE_PROJECT), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to create Scout project:', error);
      return { 
        success: false, 
        error: 'Failed to create project. Please try again.' 
      };
    }
  }

  /**
   * Update a Scout project
   * @param projectId - ID of the project to update
   * @param projectData - Updated project details
   * @returns Promise with updated project
   */
  async updateProject(
    projectId: string,
    projectData: {
      name?: string;
      description?: string;
      status?: 'active' | 'paused' | 'completed';
      repository_url?: string;
      tags?: string[];
    }
  ): Promise<ApiResponse<ScoutProject>> {
    try {
      const url = buildDynamicApiUrl(API_ENDPOINTS.SCOUT_AGENT.UPDATE_PROJECT, { id: projectId });
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Failed to update Scout project ${projectId}:`, error);
      return { 
        success: false, 
        error: 'Failed to update project. Please try again.' 
      };
    }
  }

  /**
   * Request project analysis
   * @param projectId - ID of the project to analyze
   * @returns Promise with analysis status
   */
  async analyzeProject(projectId: string): Promise<ApiResponse<{ analysisId: string }>> {
    try {
      const url = buildDynamicApiUrl(API_ENDPOINTS.SCOUT_AGENT.ANALYZE_PROJECT, { id: projectId });
      const response = await fetch(url, {
        method: 'POST',
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Failed to analyze Scout project ${projectId}:`, error);
      return { 
        success: false, 
        error: 'Failed to start project analysis. Please try again.' 
      };
    }
  }

  /**
   * Get project analysis results
   * @param projectId - ID of the project
   * @returns Promise with analysis findings
   */
  async getAnalysisResults(projectId: string): Promise<ApiResponse<ScoutAnalysis>> {
    try {
      const url = buildDynamicApiUrl(API_ENDPOINTS.SCOUT_AGENT.GET_ANALYSIS, { id: projectId });
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Failed to get analysis results for project ${projectId}:`, error);
      return { 
        success: false, 
        error: 'Failed to load analysis results. Please try again.' 
      };
    }
  }

  /**
   * Get project metrics
   * @param projectId - ID of the project
   * @returns Promise with project metrics
   */
  async getProjectMetrics(projectId: string): Promise<ApiResponse<ScoutMetrics>> {
    try {
      const url = buildDynamicApiUrl(API_ENDPOINTS.SCOUT_AGENT.GET_METRICS, { id: projectId });
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Failed to get metrics for project ${projectId}:`, error);
      return { 
        success: false, 
        error: 'Failed to load project metrics. Please try again.' 
      };
    }
  }

  /**
   * Delete a Scout project
   * @param projectId - ID of the project to delete
   * @returns Promise with deletion status
   */
  async deleteProject(projectId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    try {
      const url = buildDynamicApiUrl(API_ENDPOINTS.SCOUT_AGENT.DELETE_PROJECT, { id: projectId });
      const response = await fetch(url, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Failed to delete Scout project ${projectId}:`, error);
      return { 
        success: false, 
        error: 'Failed to delete project. Please try again.' 
      };
    }
  }
  
  /**
   * Set up WebSocket connection for real-time project updates
   * @param projectId - ID of the project to monitor
   * @param onMessage - Callback function for received messages
   * @returns WebSocket connection object
   */
  connectToProjectWebsocket(
    projectId: string, 
    onMessage: (data: any) => void
  ): WebSocket {
    const wsUrl = buildDynamicApiUrl(API_ENDPOINTS.SCOUT_AGENT.WEBSOCKET_CONNECT, { id: projectId })
      .replace('http', 'ws');
    
    const socket = new WebSocket(wsUrl);
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    return socket;
  }
}

// Export a singleton instance
export const scoutAgentService = new ScoutAgentService();
export default scoutAgentService;
