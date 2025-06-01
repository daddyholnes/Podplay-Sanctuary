/**
 * Workspace Hooks Tests
 * 
 * Comprehensive test suite for workspace-related React hooks.
 * Tests useWorkspace, useProjects, useFiles, and other workspace hooks.
 * 
 * @fileoverview Tests for workspace hooks functionality
 * @version 1.0.0
 * @author Podplay Sanctuary Team
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { useWorkspace } from '../../hooks/workspace/useWorkspace';
import { useProjects } from '../../hooks/workspace/useProjects';
import { useFiles } from '../../hooks/workspace/useFiles';
import { useFileSystem } from '../../hooks/workspace/useFileSystem';
import { 
  createMockStore, 
  createMockWorkspace, 
  createMockProject,
  createMockUser,
  mockFetch,
  mockFileSystem,
  TEST_CONSTANTS 
} from '../utils';

// ============================================================================
// TEST SETUP
// ============================================================================

const createWrapper = (store = createMockStore()) => {
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

describe('Workspace Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.reset();
  });

  // ============================================================================
  // useWorkspace Hook Tests
  // ============================================================================

  describe('useWorkspace', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useWorkspace(), {
        wrapper: createWrapper(),
      });

      expect(result.current.workspaces).toEqual([]);
      expect(result.current.activeWorkspace).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should fetch workspaces on mount', async () => {
      const mockWorkspaces = [
        createMockWorkspace({ id: 'ws-1', name: 'Workspace 1' }),
        createMockWorkspace({ id: 'ws-2', name: 'Workspace 2' }),
      ];

      mockFetch.success(mockWorkspaces);

      const { result } = renderHook(() => useWorkspace(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/workspaces'),
          expect.objectContaining({
            method: 'GET',
          })
        );
      });
    });

    it('should create a new workspace', async () => {
      const newWorkspace = {
        name: 'New Workspace',
        description: 'A new workspace for testing',
      };

      const createdWorkspace = createMockWorkspace(newWorkspace);
      mockFetch.success(createdWorkspace);

      const { result } = renderHook(() => useWorkspace(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.createWorkspace(newWorkspace);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/workspaces'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining(newWorkspace.name),
        })
      );
    });

    it('should update workspace settings', async () => {
      const mockWorkspace = createMockWorkspace();
      const store = createMockStore({
        workspace: {
          workspaces: [mockWorkspace],
          activeWorkspaceId: mockWorkspace.id,
          projects: [],
          files: {},
          loading: false,
          error: null,
        },
      });

      const updates = {
        name: 'Updated Workspace Name',
        description: 'Updated description',
      };

      mockFetch.success({ ...mockWorkspace, ...updates });

      const { result } = renderHook(() => useWorkspace(), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.updateWorkspace(mockWorkspace.id, updates);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/workspaces/${mockWorkspace.id}`),
        expect.objectContaining({
          method: 'PATCH',
          body: expect.stringContaining(updates.name),
        })
      );
    });

    it('should delete a workspace', async () => {
      const mockWorkspace = createMockWorkspace();
      const store = createMockStore({
        workspace: {
          workspaces: [mockWorkspace],
          activeWorkspaceId: null,
          projects: [],
          files: {},
          loading: false,
          error: null,
        },
      });

      mockFetch.success({ success: true });

      const { result } = renderHook(() => useWorkspace(), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.deleteWorkspace(mockWorkspace.id);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/workspaces/${mockWorkspace.id}`),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('should invite collaborators to workspace', async () => {
      const mockWorkspace = createMockWorkspace();
      const store = createMockStore({
        workspace: {
          workspaces: [mockWorkspace],
          activeWorkspaceId: mockWorkspace.id,
          projects: [],
          files: {},
          loading: false,
          error: null,
        },
      });

      const invitation = {
        email: 'collaborator@example.com',
        role: 'editor',
        permissions: ['read', 'write'],
      };

      mockFetch.success({ success: true, invitationId: 'inv-123' });

      const { result } = renderHook(() => useWorkspace(), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.inviteCollaborator(mockWorkspace.id, invitation);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/workspaces/${mockWorkspace.id}/invites`),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining(invitation.email),
        })
      );
    });

    it('should set active workspace', () => {
      const mockWorkspace = createMockWorkspace();
      const store = createMockStore({
        workspace: {
          workspaces: [mockWorkspace],
          activeWorkspaceId: null,
          projects: [],
          files: {},
          loading: false,
          error: null,
        },
      });

      const { result } = renderHook(() => useWorkspace(), {
        wrapper: createWrapper(store),
      });

      act(() => {
        result.current.setActiveWorkspace(mockWorkspace.id);
      });

      expect(result.current.activeWorkspace?.id).toBe(mockWorkspace.id);
    });
  });

  // ============================================================================
  // useProjects Hook Tests
  // ============================================================================

  describe('useProjects', () => {
    it('should fetch projects for workspace', async () => {
      const workspaceId = 'ws-123';
      const mockProjects = [
        createMockProject({ id: 'proj-1', workspaceId }),
        createMockProject({ id: 'proj-2', workspaceId }),
      ];

      mockFetch.success(mockProjects);

      const { result } = renderHook(() => useProjects(workspaceId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining(`/api/workspaces/${workspaceId}/projects`),
          expect.objectContaining({
            method: 'GET',
          })
        );
      });
    });

    it('should create a new project', async () => {
      const workspaceId = 'ws-123';
      const projectData = {
        name: 'New Project',
        description: 'A test project',
        type: 'web' as const,
        template: 'react-typescript',
      };

      const createdProject = createMockProject({
        ...projectData,
        workspaceId,
      });
      mockFetch.success(createdProject);

      const { result } = renderHook(() => useProjects(workspaceId), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.createProject(projectData);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/workspaces/${workspaceId}/projects`),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining(projectData.name),
        })
      );
    });

    it('should clone an existing project', async () => {
      const workspaceId = 'ws-123';
      const sourceProjectId = 'proj-source';
      const cloneData = {
        name: 'Cloned Project',
        description: 'A cloned project',
      };

      const clonedProject = createMockProject({
        ...cloneData,
        workspaceId,
        id: 'proj-cloned',
      });
      mockFetch.success(clonedProject);

      const { result } = renderHook(() => useProjects(workspaceId), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.cloneProject(sourceProjectId, cloneData);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/projects/${sourceProjectId}/clone`),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining(cloneData.name),
        })
      );
    });

    it('should update project configuration', async () => {
      const workspaceId = 'ws-123';
      const projectId = 'proj-123';
      const mockProject = createMockProject({ id: projectId, workspaceId });
      
      const store = createMockStore({
        workspace: {
          workspaces: [],
          activeWorkspaceId: workspaceId,
          projects: [mockProject],
          files: {},
          loading: false,
          error: null,
        },
      });

      const configUpdates = {
        buildCommand: 'npm run build',
        startCommand: 'npm run dev',
        environment: { NODE_ENV: 'development' },
      };

      mockFetch.success({ ...mockProject, config: { ...mockProject.config, ...configUpdates } });

      const { result } = renderHook(() => useProjects(workspaceId), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.updateProjectConfig(projectId, configUpdates);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/projects/${projectId}/config`),
        expect.objectContaining({
          method: 'PATCH',
          body: expect.stringContaining(configUpdates.buildCommand),
        })
      );
    });

    it('should deploy a project', async () => {
      const workspaceId = 'ws-123';
      const projectId = 'proj-123';
      const deploymentConfig = {
        target: 'production',
        environment: 'prod',
        buildConfig: { optimize: true },
      };

      mockFetch.success({
        deploymentId: 'deploy-123',
        status: 'pending',
        url: 'https://deploy-url.com',
      });

      const { result } = renderHook(() => useProjects(workspaceId), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.deployProject(projectId, deploymentConfig);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/projects/${projectId}/deploy`),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining(deploymentConfig.target),
        })
      );
    });

    it('should filter projects by type and status', () => {
      const workspaceId = 'ws-123';
      const mockProjects = [
        createMockProject({ 
          id: 'proj-1', 
          workspaceId, 
          type: 'web',
          metadata: { status: 'active' }
        }),
        createMockProject({ 
          id: 'proj-2', 
          workspaceId, 
          type: 'mobile',
          metadata: { status: 'archived' }
        }),
        createMockProject({ 
          id: 'proj-3', 
          workspaceId, 
          type: 'web',
          metadata: { status: 'active' }
        }),
      ];

      const store = createMockStore({
        workspace: {
          workspaces: [],
          activeWorkspaceId: workspaceId,
          projects: mockProjects,
          files: {},
          loading: false,
          error: null,
        },
      });

      const { result } = renderHook(() => useProjects(workspaceId), {
        wrapper: createWrapper(store),
      });

      act(() => {
        result.current.filterProjects({ type: 'web', status: 'active' });
      });

      expect(result.current.filteredProjects).toHaveLength(2);
      expect(result.current.filteredProjects.every(p => p.type === 'web')).toBe(true);
    });
  });

  // ============================================================================
  // useFiles Hook Tests
  // ============================================================================

  describe('useFiles', () => {
    it('should fetch files for project', async () => {
      const projectId = 'proj-123';
      const mockFiles = [
        { id: 'file-1', name: 'index.tsx', path: '/src/index.tsx', type: 'file' },
        { id: 'file-2', name: 'App.tsx', path: '/src/App.tsx', type: 'file' },
      ];

      mockFetch.success(mockFiles);

      const { result } = renderHook(() => useFiles(projectId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining(`/api/projects/${projectId}/files`),
          expect.objectContaining({
            method: 'GET',
          })
        );
      });
    });

    it('should create a new file', async () => {
      const projectId = 'proj-123';
      const fileData = {
        name: 'newFile.tsx',
        path: '/src/components/',
        content: 'export const NewComponent = () => <div>Hello</div>;',
        type: 'file' as const,
      };

      mockFetch.success({
        id: 'file-new',
        ...fileData,
      });

      const { result } = renderHook(() => useFiles(projectId), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.createFile(fileData);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/projects/${projectId}/files`),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining(fileData.name),
        })
      );
    });

    it('should update file content', async () => {
      const projectId = 'proj-123';
      const fileId = 'file-123';
      const newContent = 'const updatedContent = "hello world";';

      mockFetch.success({
        id: fileId,
        content: newContent,
        updatedAt: new Date().toISOString(),
      });

      const { result } = renderHook(() => useFiles(projectId), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.updateFileContent(fileId, newContent);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/files/${fileId}`),
        expect.objectContaining({
          method: 'PATCH',
          body: expect.stringContaining(newContent),
        })
      );
    });

    it('should handle file uploads', async () => {
      const projectId = 'proj-123';
      const file = mockFileSystem.createFile('upload.txt', 'File content');

      mockFetch.success({
        id: 'file-uploaded',
        name: file.name,
        size: file.size,
        url: '/uploads/upload.txt',
      });

      const { result } = renderHook(() => useFiles(projectId), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.uploadFile(file, '/uploads/');
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/projects/${projectId}/upload`),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
    });

    it('should delete files and directories', async () => {
      const projectId = 'proj-123';
      const fileId = 'file-123';

      mockFetch.success({ success: true });

      const { result } = renderHook(() => useFiles(projectId), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.deleteFile(fileId);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/files/${fileId}`),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('should rename files and directories', async () => {
      const projectId = 'proj-123';
      const fileId = 'file-123';
      const newName = 'renamedFile.tsx';

      mockFetch.success({
        id: fileId,
        name: newName,
        updatedAt: new Date().toISOString(),
      });

      const { result } = renderHook(() => useFiles(projectId), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.renameFile(fileId, newName);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/files/${fileId}/rename`),
        expect.objectContaining({
          method: 'PATCH',
          body: expect.stringContaining(newName),
        })
      );
    });
  });

  // ============================================================================
  // useFileSystem Hook Tests
  // ============================================================================

  describe('useFileSystem', () => {
    it('should navigate file tree structure', () => {
      const mockFileTree = {
        '/': {
          'src/': {
            'components/': {
              'Button.tsx': { type: 'file', size: 1024 },
              'Input.tsx': { type: 'file', size: 856 },
            },
            'index.tsx': { type: 'file', size: 234 },
          },
          'package.json': { type: 'file', size: 512 },
        },
      };

      const { result } = renderHook(() => useFileSystem(mockFileTree), {
        wrapper: createWrapper(),
      });

      // Navigate to src directory
      act(() => {
        result.current.navigateTo('/src');
      });

      expect(result.current.currentPath).toBe('/src');
      expect(result.current.currentDirectory).toEqual(mockFileTree['/']['src/']);

      // Navigate back to root
      act(() => {
        result.current.navigateUp();
      });

      expect(result.current.currentPath).toBe('/');
    });

    it('should search files by name and content', () => {
      const mockFiles = [
        { id: 'file-1', name: 'Button.tsx', content: 'export const Button', path: '/src/components/' },
        { id: 'file-2', name: 'Input.tsx', content: 'export const Input', path: '/src/components/' },
        { id: 'file-3', name: 'utils.ts', content: 'export const formatDate', path: '/src/utils/' },
      ];

      const { result } = renderHook(() => useFileSystem({}), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.searchFiles('Button', mockFiles);
      });

      expect(result.current.searchResults).toHaveLength(1);
      expect(result.current.searchResults[0].name).toBe('Button.tsx');
    });

    it('should get file breadcrumbs for navigation', () => {
      const { result } = renderHook(() => useFileSystem({}), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.navigateTo('/src/components/ui');
      });

      const breadcrumbs = result.current.getBreadcrumbs();
      expect(breadcrumbs).toEqual([
        { name: 'Root', path: '/' },
        { name: 'src', path: '/src' },
        { name: 'components', path: '/src/components' },
        { name: 'ui', path: '/src/components/ui' },
      ]);
    });

    it('should handle file system operations with undo/redo', () => {
      const { result } = renderHook(() => useFileSystem({}), {
        wrapper: createWrapper(),
      });

      // Create a file
      act(() => {
        result.current.createFile('/src', 'newFile.tsx', 'content');
      });

      // Undo the creation
      act(() => {
        result.current.undo();
      });

      expect(result.current.canUndo).toBe(false);

      // Redo the creation
      act(() => {
        result.current.redo();
      });

      expect(result.current.canRedo).toBe(false);
    });
  });

  // ============================================================================
  // Integration Tests
  // ============================================================================

  describe('Workspace Hooks Integration', () => {
    it('should work together for complete workspace management', async () => {
      const mockWorkspace = createMockWorkspace();
      const mockProject = createMockProject({ workspaceId: mockWorkspace.id });
      
      const store = createMockStore({
        workspace: {
          workspaces: [mockWorkspace],
          activeWorkspaceId: mockWorkspace.id,
          projects: [mockProject],
          files: {},
          loading: false,
          error: null,
        },
      });

      // Mock API responses
      mockFetch.success({ success: true });

      const workspaceHook = renderHook(() => useWorkspace(), {
        wrapper: createWrapper(store),
      });

      const projectsHook = renderHook(() => useProjects(mockWorkspace.id), {
        wrapper: createWrapper(store),
      });

      const filesHook = renderHook(() => useFiles(mockProject.id), {
        wrapper: createWrapper(store),
      });

      // Test complete flow: workspace -> project -> file operations
      expect(workspaceHook.result.current.activeWorkspace?.id).toBe(mockWorkspace.id);
      expect(projectsHook.result.current.projects).toContain(
        expect.objectContaining({ id: mockProject.id })
      );

      // Create a new file in the project
      await act(async () => {
        await filesHook.result.current.createFile({
          name: 'test.tsx',
          path: '/src/',
          content: 'export const Test = () => <div>Test</div>;',
          type: 'file',
        });
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/projects/${mockProject.id}/files`),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });
});
