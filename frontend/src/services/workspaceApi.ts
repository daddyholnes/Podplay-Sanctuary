import api from './api';
import { Project, Workspace, File, FileContent } from '@/types/workspace';

/**
 * API services for Scout Dev Workspaces module
 * Handles all workspace, project, and file operations
 */
const workspaceApi = {
  // Project operations
  async getProjects(): Promise<Project[]> {
    const response = await api.get('/workspaces/projects');
    return response.data;
  },

  async getProject(projectId: string): Promise<Project> {
    const response = await api.get(`/workspaces/projects/${projectId}`);
    return response.data;
  },

  async createProject(project: Omit<Project, 'id'>): Promise<Project> {
    const response = await api.post('/workspaces/projects', project);
    return response.data;
  },

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    const response = await api.patch(`/workspaces/projects/${projectId}`, updates);
    return response.data;
  },

  async deleteProject(projectId: string): Promise<void> {
    await api.delete(`/workspaces/projects/${projectId}`);
  },

  // Workspace operations
  async getWorkspaces(projectId: string): Promise<Workspace[]> {
    const response = await api.get(`/workspaces/projects/${projectId}/workspaces`);
    return response.data;
  },

  async getWorkspace(projectId: string, workspaceId: string): Promise<Workspace> {
    const response = await api.get(`/workspaces/projects/${projectId}/workspaces/${workspaceId}`);
    return response.data;
  },

  async createWorkspace(projectId: string, workspace: Omit<Workspace, 'id'>): Promise<Workspace> {
    const response = await api.post(`/workspaces/projects/${projectId}/workspaces`, workspace);
    return response.data;
  },

  async updateWorkspace(projectId: string, workspaceId: string, updates: Partial<Workspace>): Promise<Workspace> {
    const response = await api.patch(`/workspaces/projects/${projectId}/workspaces/${workspaceId}`, updates);
    return response.data;
  },

  async deleteWorkspace(projectId: string, workspaceId: string): Promise<void> {
    await api.delete(`/workspaces/projects/${projectId}/workspaces/${workspaceId}`);
  },

  // File operations
  async getFiles(projectId: string, workspaceId: string, path: string = '/'): Promise<File[]> {
    const response = await api.get(`/workspaces/projects/${projectId}/workspaces/${workspaceId}/files`, {
      params: { path }
    });
    return response.data;
  },

  async getFileContent(projectId: string, workspaceId: string, filePath: string): Promise<FileContent> {
    const response = await api.get(
      `/workspaces/projects/${projectId}/workspaces/${workspaceId}/files/content`,
      { params: { path: filePath } }
    );
    return response.data;
  },

  async saveFileContent(
    projectId: string, 
    workspaceId: string, 
    filePath: string, 
    content: string
  ): Promise<void> {
    await api.post(`/workspaces/projects/${projectId}/workspaces/${workspaceId}/files/content`, {
      path: filePath,
      content
    });
  },

  async createFile(
    projectId: string, 
    workspaceId: string, 
    filePath: string, 
    content: string = ''
  ): Promise<File> {
    const response = await api.post(`/workspaces/projects/${projectId}/workspaces/${workspaceId}/files`, {
      path: filePath,
      content
    });
    return response.data;
  },

  async deleteFile(projectId: string, workspaceId: string, filePath: string): Promise<void> {
    await api.delete(`/workspaces/projects/${projectId}/workspaces/${workspaceId}/files`, {
      params: { path: filePath }
    });
  },

  async renameFile(
    projectId: string,
    workspaceId: string,
    oldPath: string,
    newPath: string
  ): Promise<File> {
    const response = await api.patch(`/workspaces/projects/${projectId}/workspaces/${workspaceId}/files/rename`, {
      oldPath,
      newPath
    });
    return response.data;
  },

  // Terminal operations
  async executeCommand(
    projectId: string,
    workspaceId: string,
    command: string
  ): Promise<{id: string}> {
    const response = await api.post(`/workspaces/projects/${projectId}/workspaces/${workspaceId}/terminal/execute`, {
      command
    });
    return response.data;
  },

  async getCommandOutput(
    projectId: string,
    workspaceId: string,
    commandId: string
  ): Promise<{output: string, status: 'running' | 'complete' | 'error', exitCode?: number}> {
    const response = await api.get(
      `/workspaces/projects/${projectId}/workspaces/${workspaceId}/terminal/output/${commandId}`
    );
    return response.data;
  },

  // System resource monitoring
  async getResourceUsage(
    projectId: string, 
    workspaceId: string
  ): Promise<{cpu: number, memory: number, disk: number}> {
    const response = await api.get(
      `/workspaces/projects/${projectId}/workspaces/${workspaceId}/resources`
    );
    return response.data;
  }
};

export default workspaceApi;
