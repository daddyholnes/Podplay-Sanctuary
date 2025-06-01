/**
 * Scout API Endpoints  
 * File exploration, workspace management, and code analysis endpoints
 */

import { apiClient } from '../APIClient';
import { 
  ScoutQuery, 
  ScoutResponse, 
  ScoutFile, 
  WorkspaceInfo 
} from '../APITypes';

export class ScoutAPI {
  /**
   * Query files and directories in workspace
   */
  static async queryFiles(query: ScoutQuery): Promise<ScoutResponse> {
    const response = await apiClient.post<ScoutResponse>('/api/scout/query', query);
    return response.data;
  }

  /**
   * Get workspace information
   */
  static async getWorkspaceInfo(path?: string): Promise<WorkspaceInfo> {
    const endpoint = path ? `/api/scout/workspace?path=${encodeURIComponent(path)}` : '/api/scout/workspace';
    const response = await apiClient.get<WorkspaceInfo>(endpoint);
    return response.data;
  }

  /**
   * Get file tree for a directory
   */
  static async getFileTree(
    path: string = '.', 
    maxDepth: number = 3,
    includeHidden: boolean = false
  ): Promise<ScoutFile[]> {
    const params = new URLSearchParams({
      path,
      maxDepth: maxDepth.toString(),
      includeHidden: includeHidden.toString(),
    });
    
    const response = await apiClient.get<ScoutFile[]>(`/api/scout/files?${params}`);
    return response.data;
  }

  /**
   * Read file content
   */
  static async readFile(filePath: string): Promise<{
    content: string;
    encoding: string;
    size: number;
    modified: string;
  }> {
    const response = await apiClient.get(
      `/api/scout/file/read?path=${encodeURIComponent(filePath)}`
    );
    return response.data;
  }

  /**
   * Write file content
   */
  static async writeFile(
    filePath: string, 
    content: string, 
    encoding: string = 'utf8'
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/api/scout/file/write', {
      path: filePath,
      content,
      encoding,
    });
    return response.data;
  }

  /**
   * Create new file or directory
   */
  static async createPath(
    path: string, 
    type: 'file' | 'directory',
    content?: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/api/scout/file/create', {
      path,
      type,
      content,
    });
    return response.data;
  }

  /**
   * Delete file or directory
   */
  static async deletePath(path: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(
      `/api/scout/file?path=${encodeURIComponent(path)}`
    );
    return response.data;
  }

  /**
   * Rename/move file or directory
   */
  static async movePath(
    oldPath: string, 
    newPath: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/api/scout/file/move', {
      oldPath,
      newPath,
    });
    return response.data;
  }

  /**
   * Search for files by name pattern
   */
  static async searchFiles(
    pattern: string,
    directory: string = '.',
    caseSensitive: boolean = false
  ): Promise<ScoutFile[]> {
    const params = new URLSearchParams({
      pattern,
      directory,
      caseSensitive: caseSensitive.toString(),
    });
    
    const response = await apiClient.get<ScoutFile[]>(`/api/scout/search/files?${params}`);
    return response.data;
  }

  /**
   * Search for text content within files
   */
  static async searchContent(
    searchTerm: string,
    fileTypes: string[] = [],
    directory: string = '.',
    caseSensitive: boolean = false
  ): Promise<Array<{
    file: string;
    matches: Array<{
      line: number;
      content: string;
      column: number;
    }>;
  }>> {
    const response = await apiClient.post('/api/scout/search/content', {
      searchTerm,
      fileTypes,
      directory,
      caseSensitive,
    });
    return response.data;
  }

  /**
   * Analyze code structure and dependencies
   */
  static async analyzeCodeStructure(
    path: string,
    language?: string
  ): Promise<{
    language: string;
    functions: Array<{ name: string; line: number; complexity: number }>;
    classes: Array<{ name: string; line: number; methods: string[] }>;
    imports: Array<{ module: string; line: number; type: string }>;
    exports: Array<{ name: string; line: number; type: string }>;
    dependencies: string[];
    metrics: {
      linesOfCode: number;
      complexity: number;
      maintainabilityIndex: number;
    };
  }> {
    const params = new URLSearchParams({ path });
    if (language) params.append('language', language);
    
    const response = await apiClient.get(`/api/scout/analyze/structure?${params}`);
    return response.data;
  }

  /**
   * Get file statistics
   */
  static async getFileStats(path: string = '.'): Promise<{
    totalFiles: number;
    totalDirectories: number;
    totalSize: number;
    fileTypes: Record<string, number>;
    languages: Record<string, number>;
    largestFiles: Array<{ path: string; size: number }>;
  }> {
    const response = await apiClient.get(
      `/api/scout/stats?path=${encodeURIComponent(path)}`
    );
    return response.data;
  }

  /**
   * Watch for file changes (WebSocket-based)
   */
  static watchFiles(
    paths: string[],
    onFileChange: (event: {
      type: 'created' | 'modified' | 'deleted';
      path: string;
      timestamp: string;
    }) => void,
    onError: (error: Error) => void
  ): () => void {
    // TODO: Implement WebSocket file watching
    console.log('File watching not yet implemented');
    return () => {}; // Return cleanup function
  }

  /**
   * Get Scout status and capabilities
   */
  static async getStatus(): Promise<{
    status: 'active' | 'idle' | 'error';
    currentWorkspace: string;
    capabilities: string[];
    memoryUsage: number;
    filesIndexed: number;
    lastActivity: string;
  }> {
    const response = await apiClient.get('/api/scout/status');
    return response.data;
  }

  /**
   * Execute Scout command
   */
  static async executeCommand(
    command: string,
    args: Record<string, any> = {}
  ): Promise<{
    success: boolean;
    output: string;
    error?: string;
    duration: number;
  }> {
    const response = await apiClient.post('/api/scout/command', {
      command,
      args,
    });
    return response.data;
  }
}

export default ScoutAPI;
