/**
 * @fileoverview Comprehensive test suite for WorkspaceService
 * Tests project management, file operations, collaboration features,
 * version control integration, and workspace synchronization
 */

import { WorkspaceService } from '../../services/workspace/WorkspaceService';
import { mockWorkspaceData, mockProjectData, mockFileData } from '../utils';
import type { 
  Workspace, 
  Project, 
  WorkspaceFile,
  CollaborationSession,
  WorkspaceSettings,
  FileSystemOperation 
} from '../../types';

// Mock dependencies
jest.mock('../../services/api/ApiService');
jest.mock('../../services/storage/StorageService');
jest.mock('../../utils/logger');

const mockApiService = {
  request: jest.fn(),
  upload: jest.fn(),
  download: jest.fn(),
};

const mockStorageService = {
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
  clear: jest.fn(),
};

// Mock file system APIs
Object.defineProperty(global, 'File', {
  value: class MockFile {
    constructor(
      public parts: BlobPart[],
      public name: string,
      public options: FilePropertyBag = {}
    ) {}
    get size() { return this.parts.join('').length; }
    get type() { return this.options.type || 'text/plain'; }
  },
});

describe('WorkspaceService', () => {
  let workspaceService: WorkspaceService;

  beforeEach(() => {
    jest.clearAllMocks();
    workspaceService = new WorkspaceService(mockApiService as any, mockStorageService as any);
  });

  describe('Workspace Management', () => {
    it('should create new workspace successfully', async () => {
      const workspaceData = {
        name: 'Test Workspace',
        description: 'A test workspace for unit testing',
        settings: {
          autoSave: true,
          theme: 'dark',
          language: 'en',
        },
      };

      const mockCreatedWorkspace: Workspace = {
        ...mockWorkspaceData.defaultWorkspace,
        ...workspaceData,
        id: 'workspace-123',
        createdAt: new Date().toISOString(),
      };

      mockApiService.request.mockResolvedValue({
        data: mockCreatedWorkspace,
        success: true,
      });

      const result = await workspaceService.createWorkspace(workspaceData);

      expect(result).toEqual(mockCreatedWorkspace);
      expect(mockApiService.request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/workspaces',
        data: workspaceData,
      });
    });

    it('should load existing workspace', async () => {
      const workspaceId = 'workspace-456';
      const mockWorkspace = mockWorkspaceData.collaborativeWorkspace;

      mockApiService.request.mockResolvedValue({
        data: mockWorkspace,
        success: true,
      });

      const result = await workspaceService.loadWorkspace(workspaceId);

      expect(result).toEqual(mockWorkspace);
      expect(mockApiService.request).toHaveBeenCalledWith({
        method: 'GET',
        url: `/workspaces/${workspaceId}`,
      });
    });

    it('should list user workspaces', async () => {
      const mockWorkspaces = [
        mockWorkspaceData.defaultWorkspace,
        mockWorkspaceData.collaborativeWorkspace,
        mockWorkspaceData.templateWorkspace,
      ];

      mockApiService.request.mockResolvedValue({
        data: { workspaces: mockWorkspaces },
        success: true,
      });

      const result = await workspaceService.listWorkspaces();

      expect(result).toEqual(mockWorkspaces);
      expect(mockApiService.request).toHaveBeenCalledWith({
        method: 'GET',
        url: '/workspaces',
      });
    });

    it('should update workspace settings', async () => {
      const workspaceId = 'workspace-789';
      const settingsUpdate: Partial<WorkspaceSettings> = {
        autoSave: false,
        theme: 'light',
        fileTreeExpanded: true,
      };

      mockApiService.request.mockResolvedValue({
        data: { success: true },
        success: true,
      });

      await workspaceService.updateWorkspaceSettings(workspaceId, settingsUpdate);

      expect(mockApiService.request).toHaveBeenCalledWith({
        method: 'PATCH',
        url: `/workspaces/${workspaceId}/settings`,
        data: settingsUpdate,
      });
    });

    it('should delete workspace', async () => {
      const workspaceId = 'workspace-delete';

      mockApiService.request.mockResolvedValue({
        data: { success: true },
        success: true,
      });

      await workspaceService.deleteWorkspace(workspaceId);

      expect(mockApiService.request).toHaveBeenCalledWith({
        method: 'DELETE',
        url: `/workspaces/${workspaceId}`,
      });
    });
  });

  describe('Project Management', () => {
    it('should create new project in workspace', async () => {
      const workspaceId = 'workspace-123';
      const projectData = {
        name: 'Test Project',
        description: 'A test project',
        template: 'react-typescript',
        settings: {
          buildTool: 'vite',
          packageManager: 'npm',
        },
      };

      const mockCreatedProject: Project = {
        ...mockProjectData.reactProject,
        ...projectData,
        id: 'project-123',
        workspaceId,
      };

      mockApiService.request.mockResolvedValue({
        data: mockCreatedProject,
        success: true,
      });

      const result = await workspaceService.createProject(workspaceId, projectData);

      expect(result).toEqual(mockCreatedProject);
      expect(mockApiService.request).toHaveBeenCalledWith({
        method: 'POST',
        url: `/workspaces/${workspaceId}/projects`,
        data: projectData,
      });
    });

    it('should load project structure', async () => {
      const projectId = 'project-456';
      const mockProjectStructure = mockProjectData.nodeProject;

      mockApiService.request.mockResolvedValue({
        data: mockProjectStructure,
        success: true,
      });

      const result = await workspaceService.loadProject(projectId);

      expect(result).toEqual(mockProjectStructure);
      expect(mockApiService.request).toHaveBeenCalledWith({
        method: 'GET',
        url: `/projects/${projectId}`,
      });
    });

    it('should handle project templates', async () => {
      const mockTemplates = [
        { id: 'react-ts', name: 'React TypeScript', description: 'React with TypeScript' },
        { id: 'vue-js', name: 'Vue.js', description: 'Vue.js application' },
        { id: 'node-api', name: 'Node.js API', description: 'Express.js API server' },
      ];

      mockApiService.request.mockResolvedValue({
        data: { templates: mockTemplates },
        success: true,
      });

      const result = await workspaceService.getProjectTemplates();

      expect(result).toEqual(mockTemplates);
      expect(mockApiService.request).toHaveBeenCalledWith({
        method: 'GET',
        url: '/project-templates',
      });
    });

    it('should initialize project from template', async () => {
      const workspaceId = 'workspace-789';
      const templateId = 'react-typescript';
      const projectName = 'My React App';

      mockApiService.request.mockResolvedValue({
        data: { 
          project: mockProjectData.reactProject,
          files: mockFileData.reactProjectFiles,
        },
        success: true,
      });

      const result = await workspaceService.initializeProjectFromTemplate(
        workspaceId,
        templateId,
        projectName
      );

      expect(result).toHaveProperty('project');
      expect(result).toHaveProperty('files');
      expect(mockApiService.request).toHaveBeenCalledWith({
        method: 'POST',
        url: `/workspaces/${workspaceId}/projects/from-template`,
        data: { templateId, name: projectName },
      });
    });
  });

  describe('File Operations', () => {
    const projectId = 'project-123';

    it('should create new file', async () => {
      const fileData = {
        name: 'Component.tsx',
        path: '/src/components/Component.tsx',
        content: 'import React from "react";\n\nexport const Component = () => {\n  return <div>Hello</div>;\n};',
        type: 'typescript',
      };

      const mockCreatedFile: WorkspaceFile = {
        ...mockFileData.typescriptFile,
        ...fileData,
        id: 'file-123',
        projectId,
      };

      mockApiService.request.mockResolvedValue({
        data: mockCreatedFile,
        success: true,
      });

      const result = await workspaceService.createFile(projectId, fileData);

      expect(result).toEqual(mockCreatedFile);
      expect(mockApiService.request).toHaveBeenCalledWith({
        method: 'POST',
        url: `/projects/${projectId}/files`,
        data: fileData,
      });
    });

    it('should read file content', async () => {
      const fileId = 'file-456';
      const mockFileContent = mockFileData.typescriptFile.content;

      mockApiService.request.mockResolvedValue({
        data: { content: mockFileContent },
        success: true,
      });

      const result = await workspaceService.readFile(fileId);

      expect(result).toBe(mockFileContent);
      expect(mockApiService.request).toHaveBeenCalledWith({
        method: 'GET',
        url: `/files/${fileId}/content`,
      });
    });

    it('should update file content', async () => {
      const fileId = 'file-789';
      const newContent = 'console.log("Updated content");';

      mockApiService.request.mockResolvedValue({
        data: { success: true, version: 2 },
        success: true,
      });

      const result = await workspaceService.updateFile(fileId, { content: newContent });

      expect(result).toEqual({ success: true, version: 2 });
      expect(mockApiService.request).toHaveBeenCalledWith({
        method: 'PUT',
        url: `/files/${fileId}`,
        data: { content: newContent },
      });
    });

    it('should delete file', async () => {
      const fileId = 'file-delete';

      mockApiService.request.mockResolvedValue({
        data: { success: true },
        success: true,
      });

      await workspaceService.deleteFile(fileId);

      expect(mockApiService.request).toHaveBeenCalledWith({
        method: 'DELETE',
        url: `/files/${fileId}`,
      });
    });

    it('should move/rename file', async () => {
      const fileId = 'file-move';
      const newPath = '/src/components/NewName.tsx';

      mockApiService.request.mockResolvedValue({
        data: { success: true, newPath },
        success: true,
      });

      const result = await workspaceService.moveFile(fileId, newPath);

      expect(result).toEqual({ success: true, newPath });
      expect(mockApiService.request).toHaveBeenCalledWith({
        method: 'PATCH',
        url: `/files/${fileId}/move`,
        data: { newPath },
      });
    });

    it('should handle file uploads', async () => {
      const projectId = 'project-upload';
      const file = new File(['file content'], 'upload.txt', { type: 'text/plain' });
      const uploadPath = '/uploads/';

      mockApiService.upload.mockResolvedValue({
        data: {
          file: {
            id: 'file-uploaded',
            name: 'upload.txt',
            path: '/uploads/upload.txt',
            size: file.size,
          },
        },
        success: true,
      });

      const result = await workspaceService.uploadFile(projectId, file, uploadPath);

      expect(result).toHaveProperty('file');
      expect(mockApiService.upload).toHaveBeenCalledWith({
        url: `/projects/${projectId}/upload`,
        file,
        data: { path: uploadPath },
      });
    });

    it('should batch file operations', async () => {
      const operations: FileSystemOperation[] = [
        { type: 'create', path: '/new-file.js', content: 'console.log("new");' },
        { type: 'update', fileId: 'file-1', content: 'updated content' },
        { type: 'delete', fileId: 'file-2' },
        { type: 'move', fileId: 'file-3', newPath: '/new-location.js' },
      ];

      mockApiService.request.mockResolvedValue({
        data: { 
          results: operations.map((op, index) => ({ 
            operation: op, 
            success: true, 
            id: `result-${index}` 
          })),
        },
        success: true,
      });

      const result = await workspaceService.batchFileOperations(projectId, operations);

      expect(result).toHaveProperty('results');
      expect(result.results).toHaveLength(4);
      expect(mockApiService.request).toHaveBeenCalledWith({
        method: 'POST',
        url: `/projects/${projectId}/batch-operations`,
        data: { operations },
      });
    });
  });

  describe('Collaboration Features', () => {
    it('should start collaboration session', async () => {
      const workspaceId = 'workspace-collab';
      const sessionData = {
        name: 'Design Review',
        participants: ['user-1', 'user-2'],
        permissions: {
          'user-1': 'owner',
          'user-2': 'editor',
        },
      };

      const mockSession: CollaborationSession = {
        id: 'session-123',
        workspaceId,
        ...sessionData,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockApiService.request.mockResolvedValue({
        data: mockSession,
        success: true,
      });

      const result = await workspaceService.startCollaborationSession(workspaceId, sessionData);

      expect(result).toEqual(mockSession);
      expect(mockApiService.request).toHaveBeenCalledWith({
        method: 'POST',
        url: `/workspaces/${workspaceId}/collaboration`,
        data: sessionData,
      });
    });

    it('should join collaboration session', async () => {
      const sessionId = 'session-456';
      const userId = 'user-join';

      mockApiService.request.mockResolvedValue({
        data: { success: true, role: 'viewer' },
        success: true,
      });

      const result = await workspaceService.joinCollaborationSession(sessionId, userId);

      expect(result).toEqual({ success: true, role: 'viewer' });
      expect(mockApiService.request).toHaveBeenCalledWith({
        method: 'POST',
        url: `/collaboration/${sessionId}/join`,
        data: { userId },
      });
    });

    it('should handle real-time collaboration events', async () => {
      const workspaceId = 'workspace-rt';
      const eventHandler = jest.fn();

      workspaceService.onCollaborationEvent(eventHandler);

      // Simulate real-time events
      const events = [
        {
          type: 'user_joined',
          data: { userId: 'user-new', userName: 'New User' },
        },
        {
          type: 'file_modified',
          data: { fileId: 'file-123', userId: 'user-editor', changes: ['line 15'] },
        },
        {
          type: 'cursor_moved',
          data: { userId: 'user-cursor', fileId: 'file-456', position: { line: 10, column: 5 } },
        },
      ];

      for (const event of events) {
        workspaceService.emitCollaborationEvent(event);
      }

      expect(eventHandler).toHaveBeenCalledTimes(3);
      events.forEach((event, index) => {
        expect(eventHandler).toHaveBeenNthCalledWith(index + 1, event);
      });
    });

    it('should handle permission changes', async () => {
      const sessionId = 'session-permissions';
      const userId = 'user-permissions';
      const newRole = 'editor';

      mockApiService.request.mockResolvedValue({
        data: { success: true, role: newRole },
        success: true,
      });

      const result = await workspaceService.updateUserPermissions(sessionId, userId, newRole);

      expect(result).toEqual({ success: true, role: newRole });
      expect(mockApiService.request).toHaveBeenCalledWith({
        method: 'PATCH',
        url: `/collaboration/${sessionId}/permissions`,
        data: { userId, role: newRole },
      });
    });
  });

  describe('Version Control Integration', () => {
    it('should initialize git repository', async () => {
      const projectId = 'project-git';
      const gitConfig = {
        remoteUrl: 'https://github.com/user/repo.git',
        branch: 'main',
        username: 'testuser',
        email: 'test@example.com',
      };

      mockApiService.request.mockResolvedValue({
        data: { success: true, repositoryId: 'repo-123' },
        success: true,
      });

      const result = await workspaceService.initializeGitRepository(projectId, gitConfig);

      expect(result).toEqual({ success: true, repositoryId: 'repo-123' });
      expect(mockApiService.request).toHaveBeenCalledWith({
        method: 'POST',
        url: `/projects/${projectId}/git/init`,
        data: gitConfig,
      });
    });

    it('should commit changes', async () => {
      const projectId = 'project-commit';
      const commitData = {
        message: 'Add new feature',
        files: ['src/feature.ts', 'src/tests/feature.test.ts'],
        author: {
          name: 'Test User',
          email: 'test@example.com',
        },
      };

      mockApiService.request.mockResolvedValue({
        data: { 
          success: true, 
          commitHash: 'abc123def456',
          timestamp: new Date().toISOString(),
        },
        success: true,
      });

      const result = await workspaceService.commitChanges(projectId, commitData);

      expect(result).toHaveProperty('commitHash');
      expect(result.success).toBe(true);
      expect(mockApiService.request).toHaveBeenCalledWith({
        method: 'POST',
        url: `/projects/${projectId}/git/commit`,
        data: commitData,
      });
    });

    it('should get commit history', async () => {
      const projectId = 'project-history';
      const mockCommits = [
        {
          hash: 'abc123',
          message: 'Latest commit',
          author: 'User 1',
          timestamp: '2025-01-01T12:00:00Z',
        },
        {
          hash: 'def456',
          message: 'Previous commit',
          author: 'User 2',
          timestamp: '2025-01-01T11:00:00Z',
        },
      ];

      mockApiService.request.mockResolvedValue({
        data: { commits: mockCommits },
        success: true,
      });

      const result = await workspaceService.getCommitHistory(projectId);

      expect(result).toEqual(mockCommits);
      expect(mockApiService.request).toHaveBeenCalledWith({
        method: 'GET',
        url: `/projects/${projectId}/git/history`,
      });
    });

    it('should handle branch operations', async () => {
      const projectId = 'project-branches';

      // Create branch
      mockApiService.request.mockResolvedValue({
        data: { success: true, branch: 'feature/new-feature' },
        success: true,
      });

      const createResult = await workspaceService.createBranch(projectId, 'feature/new-feature');
      expect(createResult.branch).toBe('feature/new-feature');

      // Switch branch
      const switchResult = await workspaceService.switchBranch(projectId, 'feature/new-feature');
      expect(switchResult.success).toBe(true);

      // Merge branch
      const mergeResult = await workspaceService.mergeBranch(projectId, 'feature/new-feature', 'main');
      expect(mergeResult.success).toBe(true);
    });
  });

  describe('Search and Navigation', () => {
    it('should search files in workspace', async () => {
      const workspaceId = 'workspace-search';
      const searchQuery = {
        query: 'useState',
        fileTypes: ['.tsx', '.ts'],
        includeContent: true,
        caseSensitive: false,
      };

      const mockSearchResults = [
        {
          fileId: 'file-1',
          fileName: 'Component.tsx',
          matches: [
            { line: 5, content: 'const [state, setState] = useState("");', column: 30 },
          ],
        },
        {
          fileId: 'file-2',
          fileName: 'Hook.ts',
          matches: [
            { line: 12, content: 'import { useState } from "react";', column: 9 },
          ],
        },
      ];

      mockApiService.request.mockResolvedValue({
        data: { results: mockSearchResults },
        success: true,
      });

      const result = await workspaceService.searchFiles(workspaceId, searchQuery);

      expect(result).toEqual(mockSearchResults);
      expect(mockApiService.request).toHaveBeenCalledWith({
        method: 'POST',
        url: `/workspaces/${workspaceId}/search`,
        data: searchQuery,
      });
    });

    it('should find symbol definitions', async () => {
      const projectId = 'project-symbols';
      const symbol = 'MyComponent';

      const mockDefinitions = [
        {
          fileId: 'file-component',
          fileName: 'MyComponent.tsx',
          line: 15,
          column: 7,
          type: 'function',
        },
      ];

      mockApiService.request.mockResolvedValue({
        data: { definitions: mockDefinitions },
        success: true,
      });

      const result = await workspaceService.findDefinition(projectId, symbol);

      expect(result).toEqual(mockDefinitions);
      expect(mockApiService.request).toHaveBeenCalledWith({
        method: 'GET',
        url: `/projects/${projectId}/symbols/${symbol}/definition`,
      });
    });

    it('should find symbol references', async () => {
      const projectId = 'project-refs';
      const symbol = 'MyComponent';

      const mockReferences = [
        {
          fileId: 'file-app',
          fileName: 'App.tsx',
          line: 20,
          column: 12,
          context: '<MyComponent prop="value" />',
        },
        {
          fileId: 'file-test',
          fileName: 'App.test.tsx',
          line: 8,
          column: 25,
          context: 'render(<MyComponent />);',
        },
      ];

      mockApiService.request.mockResolvedValue({
        data: { references: mockReferences },
        success: true,
      });

      const result = await workspaceService.findReferences(projectId, symbol);

      expect(result).toEqual(mockReferences);
      expect(mockApiService.request).toHaveBeenCalledWith({
        method: 'GET',
        url: `/projects/${projectId}/symbols/${symbol}/references`,
      });
    });
  });

  describe('Caching and Offline Support', () => {
    it('should cache workspace data locally', async () => {
      const workspaceId = 'workspace-cache';
      const workspace = mockWorkspaceData.defaultWorkspace;

      mockStorageService.get.mockResolvedValue(null);
      mockApiService.request.mockResolvedValue({
        data: workspace,
        success: true,
      });

      const result = await workspaceService.loadWorkspace(workspaceId);

      expect(result).toEqual(workspace);
      expect(mockStorageService.set).toHaveBeenCalledWith(
        `workspace_${workspaceId}`,
        workspace
      );
    });

    it('should load from cache when offline', async () => {
      const workspaceId = 'workspace-offline';
      const cachedWorkspace = mockWorkspaceData.defaultWorkspace;

      mockStorageService.get.mockResolvedValue(cachedWorkspace);
      mockApiService.request.mockRejectedValue(new Error('Network error'));

      const result = await workspaceService.loadWorkspace(workspaceId, { allowCached: true });

      expect(result).toEqual(cachedWorkspace);
      expect(mockStorageService.get).toHaveBeenCalledWith(`workspace_${workspaceId}`);
    });

    it('should sync changes when back online', async () => {
      const changes = [
        { type: 'file_update', fileId: 'file-1', content: 'new content' },
        { type: 'file_create', path: '/new-file.js', content: 'console.log("new");' },
      ];

      mockStorageService.get.mockResolvedValue(changes);
      mockApiService.request.mockResolvedValue({
        data: { synced: changes.length },
        success: true,
      });

      const result = await workspaceService.syncPendingChanges();

      expect(result.synced).toBe(2);
      expect(mockStorageService.remove).toHaveBeenCalledWith('pending_changes');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const workspaceId = 'workspace-error';
      const apiError = new Error('API Error: Workspace not found');

      mockApiService.request.mockRejectedValue(apiError);

      await expect(workspaceService.loadWorkspace(workspaceId)).rejects.toThrow(
        'API Error: Workspace not found'
      );
    });

    it('should handle network timeouts', async () => {
      const timeoutError = new Error('Request timeout');
      mockApiService.request.mockRejectedValue(timeoutError);

      await expect(workspaceService.createWorkspace({
        name: 'Test',
        description: 'Test workspace',
      })).rejects.toThrow('Request timeout');
    });

    it('should validate input parameters', async () => {
      await expect(workspaceService.createWorkspace({
        name: '', // Invalid empty name
        description: 'Valid description',
      })).rejects.toThrow('validation');

      await expect(workspaceService.updateFile('', { 
        content: 'valid content' 
      })).rejects.toThrow('validation');
    });

    it('should handle concurrent operations safely', async () => {
      const fileId = 'file-concurrent';
      const operations = [
        workspaceService.updateFile(fileId, { content: 'update 1' }),
        workspaceService.updateFile(fileId, { content: 'update 2' }),
        workspaceService.updateFile(fileId, { content: 'update 3' }),
      ];

      mockApiService.request.mockResolvedValue({
        data: { success: true, version: 1 },
        success: true,
      });

      const results = await Promise.allSettled(operations);
      
      // At least one should succeed
      expect(results.some(result => result.status === 'fulfilled')).toBe(true);
    });
  });
});
