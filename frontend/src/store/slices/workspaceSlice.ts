/**
 * @fileoverview Workspace slice for Redux store
 * @version 1.0.0
 * @author Podplay Sanctuary Team
 * 
 * Manages workspace state including:
 * - Project files and directory structure
 * - File editing and version control
 * - Environment and configuration management
 * - Real-time file system watching
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { WorkspaceManager } from '../../services/workspace/WorkspaceManager';
import { FileManager } from '../../services/workspace/FileManager';
import { EnvironmentManager } from '../../services/workspace/EnvironmentManager';

/**
 * File system item interface
 */
export interface FileSystemItem {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  lastModified: number;
  isOpen?: boolean;
  isDirty?: boolean;
  content?: string;
  language?: string;
  encoding?: string;
  lineEndings?: 'LF' | 'CRLF';
  children?: FileSystemItem[];
  gitStatus?: 'modified' | 'added' | 'deleted' | 'untracked' | 'staged';
  permissions?: {
    readable: boolean;
    writable: boolean;
    executable: boolean;
  };
}

/**
 * Project configuration interface
 */
export interface ProjectConfig {
  name: string;
  description?: string;
  version: string;
  language: string;
  framework?: string;
  dependencies: Record<string, string>;
  scripts: Record<string, string>;
  environments: string[];
  buildOutputs: string[];
  testPatterns: string[];
  lintRules?: Record<string, any>;
  formatConfig?: Record<string, any>;
}

/**
 * Environment configuration interface
 */
export interface EnvironmentConfig {
  name: string;
  type: 'development' | 'staging' | 'production' | 'test';
  variables: Record<string, string>;
  isActive: boolean;
  isSecure: boolean;
  lastUsed: number;
}

/**
 * Workspace state interface
 */
export interface WorkspaceState {
  // Project information
  currentProject: {
    id: string;
    name: string;
    path: string;
    rootPath: string;
    config: ProjectConfig | null;
    isLoaded: boolean;
  } | null;
  
  // File system
  fileTree: FileSystemItem[];
  openFiles: Record<string, FileSystemItem>;
  activeFileId: string | null;
  recentFiles: string[];
  
  // Search and navigation
  searchQuery: string;
  searchResults: FileSystemItem[];
  searchInProgress: boolean;
  currentDirectory: string;
  navigationHistory: string[];
  navigationIndex: number;
  
  // File operations
  clipboard: {
    operation: 'copy' | 'cut' | null;
    items: string[];
  };
  pendingOperations: {
    id: string;
    type: 'create' | 'delete' | 'move' | 'copy';
    source?: string;
    target: string;
    progress: number;
  }[];
  
  // Environment management
  environments: Record<string, EnvironmentConfig>;
  activeEnvironment: string | null;
  
  // Version control
  gitStatus: {
    branch: string;
    isClean: boolean;
    ahead: number;
    behind: number;
    changedFiles: string[];
    stagedFiles: string[];
  } | null;
  
  // Watching and sync
  watchedPaths: string[];
  lastSync: number;
  conflictFiles: string[];
  
  // UI state
  sidebarVisible: boolean;
  explorerExpanded: Record<string, boolean>;
  sortBy: 'name' | 'type' | 'size' | 'modified';
  sortOrder: 'asc' | 'desc';
  viewMode: 'tree' | 'list';
  showHiddenFiles: boolean;
  
  // Performance and caching
  fileCache: Record<string, {
    content: string;
    timestamp: number;
    checksum: string;
  }>;
  thumbnailCache: Record<string, string>;
  
  // Error handling
  error: string | null;
  warnings: string[];
  
  // Loading states
  isLoading: boolean;
  isSearching: boolean;
  isSyncing: boolean;
  
  // Statistics
  stats: {
    totalFiles: number;
    totalSize: number;
    fileTypes: Record<string, number>;
    recentActivity: {
      date: string;
      filesModified: number;
      linesAdded: number;
      linesRemoved: number;
    }[];
  };
}

/**
 * Initial state
 */
const initialState: WorkspaceState = {
  currentProject: null,
  
  fileTree: [],
  openFiles: {},
  activeFileId: null,
  recentFiles: [],
  
  searchQuery: '',
  searchResults: [],
  searchInProgress: false,
  currentDirectory: '',
  navigationHistory: [],
  navigationIndex: -1,
  
  clipboard: {
    operation: null,
    items: [],
  },
  pendingOperations: [],
  
  environments: {},
  activeEnvironment: null,
  
  gitStatus: null,
  
  watchedPaths: [],
  lastSync: 0,
  conflictFiles: [],
  
  sidebarVisible: true,
  explorerExpanded: {},
  sortBy: 'name',
  sortOrder: 'asc',
  viewMode: 'tree',
  showHiddenFiles: false,
  
  fileCache: {},
  thumbnailCache: {},
  
  error: null,
  warnings: [],
  
  isLoading: false,
  isSearching: false,
  isSyncing: false,
  
  stats: {
    totalFiles: 0,
    totalSize: 0,
    fileTypes: {},
    recentActivity: [],
  },
};

/**
 * Async thunks for workspace operations
 */

// Load project
export const loadProject = createAsyncThunk(
  'workspace/loadProject',
  async (projectPath: string, { rejectWithValue }) => {
    try {
      const workspaceManager = WorkspaceManager.getInstance();
      const project = await workspaceManager.loadProject(projectPath);
      const fileTree = await workspaceManager.getFileTree(projectPath);
      
      return { project, fileTree };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load project');
    }
  }
);

// Refresh file tree
export const refreshFileTree = createAsyncThunk(
  'workspace/refreshFileTree',
  async (path?: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { workspace: WorkspaceState };
      const targetPath = path || state.workspace.currentProject?.rootPath;
      
      if (!targetPath) {
        throw new Error('No project path available');
      }
      
      const workspaceManager = WorkspaceManager.getInstance();
      const fileTree = await workspaceManager.getFileTree(targetPath);
      
      return fileTree;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to refresh file tree');
    }
  }
);

// Open file
export const openFile = createAsyncThunk(
  'workspace/openFile',
  async (filePath: string, { rejectWithValue }) => {
    try {
      const fileManager = FileManager.getInstance();
      const fileContent = await fileManager.readFile(filePath);
      const fileStats = await fileManager.getFileStats(filePath);
      
      return {
        path: filePath,
        content: fileContent,
        stats: fileStats,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to open file');
    }
  }
);

// Save file
export const saveFile = createAsyncThunk(
  'workspace/saveFile',
  async (payload: { filePath: string; content: string }, { rejectWithValue }) => {
    try {
      const fileManager = FileManager.getInstance();
      await fileManager.writeFile(payload.filePath, payload.content);
      
      return {
        filePath: payload.filePath,
        timestamp: Date.now(),
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to save file');
    }
  }
);

// Create file or directory
export const createFileSystemItem = createAsyncThunk(
  'workspace/createFileSystemItem',
  async (payload: {
    path: string;
    type: 'file' | 'directory';
    content?: string;
  }, { rejectWithValue }) => {
    try {
      const fileManager = FileManager.getInstance();
      
      if (payload.type === 'file') {
        await fileManager.writeFile(payload.path, payload.content || '');
      } else {
        await fileManager.createDirectory(payload.path);
      }
      
      const stats = await fileManager.getFileStats(payload.path);
      return { ...payload, stats };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create item');
    }
  }
);

// Delete file or directory
export const deleteFileSystemItem = createAsyncThunk(
  'workspace/deleteFileSystemItem',
  async (path: string, { rejectWithValue }) => {
    try {
      const fileManager = FileManager.getInstance();
      await fileManager.deleteItem(path);
      
      return path;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete item');
    }
  }
);

// Search files
export const searchFiles = createAsyncThunk(
  'workspace/searchFiles',
  async (payload: {
    query: string;
    path?: string;
    includeContent?: boolean;
  }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { workspace: WorkspaceState };
      const searchPath = payload.path || state.workspace.currentProject?.rootPath;
      
      if (!searchPath) {
        throw new Error('No search path available');
      }
      
      const fileManager = FileManager.getInstance();
      const results = await fileManager.searchFiles(
        searchPath,
        payload.query,
        payload.includeContent
      );
      
      return results;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to search files');
    }
  }
);

// Load environments
export const loadEnvironments = createAsyncThunk(
  'workspace/loadEnvironments',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { workspace: WorkspaceState };
      const projectPath = state.workspace.currentProject?.rootPath;
      
      if (!projectPath) {
        throw new Error('No project loaded');
      }
      
      const envManager = EnvironmentManager.getInstance();
      const environments = await envManager.loadEnvironments(projectPath);
      
      return environments;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load environments');
    }
  }
);

// Update Git status
export const updateGitStatus = createAsyncThunk(
  'workspace/updateGitStatus',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { workspace: WorkspaceState };
      const projectPath = state.workspace.currentProject?.rootPath;
      
      if (!projectPath) {
        throw new Error('No project loaded');
      }
      
      const workspaceManager = WorkspaceManager.getInstance();
      const gitStatus = await workspaceManager.getGitStatus(projectPath);
      
      return gitStatus;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update Git status');
    }
  }
);

/**
 * Workspace slice
 */
export const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    // File management
    setActiveFile: (state, action: PayloadAction<string | null>) => {
      state.activeFileId = action.payload;
      
      // Add to recent files
      if (action.payload && !state.recentFiles.includes(action.payload)) {
        state.recentFiles.unshift(action.payload);
        
        // Keep only last 20 recent files
        if (state.recentFiles.length > 20) {
          state.recentFiles = state.recentFiles.slice(0, 20);
        }
      }
    },
    
    closeFile: (state, action: PayloadAction<string>) => {
      const fileId = action.payload;
      delete state.openFiles[fileId];
      
      // Update active file if closing the active one
      if (state.activeFileId === fileId) {
        const remainingFiles = Object.keys(state.openFiles);
        state.activeFileId = remainingFiles.length > 0 ? remainingFiles[0] : null;
      }
    },
    
    markFileDirty: (state, action: PayloadAction<string>) => {
      const fileId = action.payload;
      if (state.openFiles[fileId]) {
        state.openFiles[fileId].isDirty = true;
      }
    },
    
    markFileClean: (state, action: PayloadAction<string>) => {
      const fileId = action.payload;
      if (state.openFiles[fileId]) {
        state.openFiles[fileId].isDirty = false;
      }
    },
    
    updateFileContent: (state, action: PayloadAction<{
      fileId: string;
      content: string;
    }>) => {
      const { fileId, content } = action.payload;
      if (state.openFiles[fileId]) {
        state.openFiles[fileId].content = content;
        state.openFiles[fileId].isDirty = true;
      }
    },
    
    // Navigation
    setCurrentDirectory: (state, action: PayloadAction<string>) => {
      const newPath = action.payload;
      
      // Add to navigation history
      if (state.navigationHistory[state.navigationIndex] !== newPath) {
        // Remove any forward history when navigating to new location
        state.navigationHistory = state.navigationHistory.slice(0, state.navigationIndex + 1);
        state.navigationHistory.push(newPath);
        state.navigationIndex = state.navigationHistory.length - 1;
        
        // Keep history manageable
        if (state.navigationHistory.length > 50) {
          state.navigationHistory = state.navigationHistory.slice(-50);
          state.navigationIndex = state.navigationHistory.length - 1;
        }
      }
      
      state.currentDirectory = newPath;
    },
    
    navigateBack: (state) => {
      if (state.navigationIndex > 0) {
        state.navigationIndex -= 1;
        state.currentDirectory = state.navigationHistory[state.navigationIndex];
      }
    },
    
    navigateForward: (state) => {
      if (state.navigationIndex < state.navigationHistory.length - 1) {
        state.navigationIndex += 1;
        state.currentDirectory = state.navigationHistory[state.navigationIndex];
      }
    },
    
    // Explorer UI
    toggleSidebar: (state) => {
      state.sidebarVisible = !state.sidebarVisible;
    },
    
    setSidebarVisible: (state, action: PayloadAction<boolean>) => {
      state.sidebarVisible = action.payload;
    },
    
    toggleDirectoryExpansion: (state, action: PayloadAction<string>) => {
      const path = action.payload;
      state.explorerExpanded[path] = !state.explorerExpanded[path];
    },
    
    setDirectoryExpanded: (state, action: PayloadAction<{
      path: string;
      expanded: boolean;
    }>) => {
      const { path, expanded } = action.payload;
      state.explorerExpanded[path] = expanded;
    },
    
    // Sorting and filtering
    setSortBy: (state, action: PayloadAction<WorkspaceState['sortBy']>) => {
      state.sortBy = action.payload;
    },
    
    setSortOrder: (state, action: PayloadAction<WorkspaceState['sortOrder']>) => {
      state.sortOrder = action.payload;
    },
    
    setViewMode: (state, action: PayloadAction<WorkspaceState['viewMode']>) => {
      state.viewMode = action.payload;
    },
    
    toggleHiddenFiles: (state) => {
      state.showHiddenFiles = !state.showHiddenFiles;
    },
    
    // Search
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    
    clearSearch: (state) => {
      state.searchQuery = '';
      state.searchResults = [];
    },
    
    // Clipboard operations
    copyToClipboard: (state, action: PayloadAction<string[]>) => {
      state.clipboard = {
        operation: 'copy',
        items: action.payload,
      };
    },
    
    cutToClipboard: (state, action: PayloadAction<string[]>) => {
      state.clipboard = {
        operation: 'cut',
        items: action.payload,
      };
    },
    
    clearClipboard: (state) => {
      state.clipboard = {
        operation: null,
        items: [],
      };
    },
    
    // Environment management
    setActiveEnvironment: (state, action: PayloadAction<string | null>) => {
      state.activeEnvironment = action.payload;
      
      // Update last used timestamp
      if (action.payload && state.environments[action.payload]) {
        state.environments[action.payload].lastUsed = Date.now();
      }
    },
    
    updateEnvironmentVariable: (state, action: PayloadAction<{
      envName: string;
      key: string;
      value: string;
    }>) => {
      const { envName, key, value } = action.payload;
      if (state.environments[envName]) {
        state.environments[envName].variables[key] = value;
      }
    },
    
    removeEnvironmentVariable: (state, action: PayloadAction<{
      envName: string;
      key: string;
    }>) => {
      const { envName, key } = action.payload;
      if (state.environments[envName]) {
        delete state.environments[envName].variables[key];
      }
    },
    
    // File watching
    addWatchedPath: (state, action: PayloadAction<string>) => {
      if (!state.watchedPaths.includes(action.payload)) {
        state.watchedPaths.push(action.payload);
      }
    },
    
    removeWatchedPath: (state, action: PayloadAction<string>) => {
      state.watchedPaths = state.watchedPaths.filter(
        path => path !== action.payload
      );
    },
    
    // Conflict resolution
    addConflictFile: (state, action: PayloadAction<string>) => {
      if (!state.conflictFiles.includes(action.payload)) {
        state.conflictFiles.push(action.payload);
      }
    },
    
    removeConflictFile: (state, action: PayloadAction<string>) => {
      state.conflictFiles = state.conflictFiles.filter(
        file => file !== action.payload
      );
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null;
    },
    
    addWarning: (state, action: PayloadAction<string>) => {
      if (!state.warnings.includes(action.payload)) {
        state.warnings.push(action.payload);
      }
    },
    
    removeWarning: (state, action: PayloadAction<string>) => {
      state.warnings = state.warnings.filter(
        warning => warning !== action.payload
      );
    },
    
    clearWarnings: (state) => {
      state.warnings = [];
    },
    
    // Cache management
    updateFileCache: (state, action: PayloadAction<{
      path: string;
      content: string;
      checksum: string;
    }>) => {
      const { path, content, checksum } = action.payload;
      state.fileCache[path] = {
        content,
        checksum,
        timestamp: Date.now(),
      };
    },
    
    clearFileCache: (state, action: PayloadAction<string>) => {
      delete state.fileCache[action.payload];
    },
    
    // Statistics
    updateStats: (state, action: PayloadAction<Partial<WorkspaceState['stats']>>) => {
      state.stats = { ...state.stats, ...action.payload };
    },
  },
  
  extraReducers: (builder) => {
    // Load project
    builder
      .addCase(loadProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadProject.fulfilled, (state, action) => {
        state.isLoading = false;
        
        const { project, fileTree } = action.payload;
        state.currentProject = {
          id: project.id,
          name: project.name,
          path: project.path,
          rootPath: project.rootPath,
          config: project.config,
          isLoaded: true,
        };
        state.fileTree = fileTree;
        state.currentDirectory = project.rootPath;
        
        // Reset navigation history
        state.navigationHistory = [project.rootPath];
        state.navigationIndex = 0;
      })
      .addCase(loadProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Refresh file tree
    builder
      .addCase(refreshFileTree.fulfilled, (state, action) => {
        state.fileTree = action.payload;
        state.lastSync = Date.now();
      });
    
    // Open file
    builder
      .addCase(openFile.fulfilled, (state, action) => {
        const { path, content, stats } = action.payload;
        
        const fileItem: FileSystemItem = {
          id: path,
          name: path.split('/').pop() || path,
          path,
          type: 'file',
          size: stats.size,
          lastModified: stats.lastModified,
          isOpen: true,
          isDirty: false,
          content,
          language: getLanguageFromPath(path),
        };
        
        state.openFiles[path] = fileItem;
        state.activeFileId = path;
      })
      .addCase(openFile.rejected, (state, action) => {
        state.error = action.payload as string;
      });
    
    // Save file
    builder
      .addCase(saveFile.fulfilled, (state, action) => {
        const { filePath } = action.payload;
        
        if (state.openFiles[filePath]) {
          state.openFiles[filePath].isDirty = false;
          state.openFiles[filePath].lastModified = Date.now();
        }
      })
      .addCase(saveFile.rejected, (state, action) => {
        state.error = action.payload as string;
      });
    
    // Search files
    builder
      .addCase(searchFiles.pending, (state) => {
        state.isSearching = true;
      })
      .addCase(searchFiles.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload;
      })
      .addCase(searchFiles.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload as string;
      });
    
    // Load environments
    builder
      .addCase(loadEnvironments.fulfilled, (state, action) => {
        state.environments = action.payload;
      });
    
    // Update Git status
    builder
      .addCase(updateGitStatus.fulfilled, (state, action) => {
        state.gitStatus = action.payload;
      });
  },
});

/**
 * Helper function to determine language from file path
 */
function getLanguageFromPath(path: string): string {
  const extension = path.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascriptreact',
    ts: 'typescript',
    tsx: 'typescriptreact',
    py: 'python',
    html: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    json: 'json',
    md: 'markdown',
    yml: 'yaml',
    yaml: 'yaml',
    xml: 'xml',
    sh: 'shellscript',
    sql: 'sql',
  };
  
  return languageMap[extension || ''] || 'plaintext';
}

// Export actions
export const {
  setActiveFile,
  closeFile,
  markFileDirty,
  markFileClean,
  updateFileContent,
  setCurrentDirectory,
  navigateBack,
  navigateForward,
  toggleSidebar,
  setSidebarVisible,
  toggleDirectoryExpansion,
  setDirectoryExpanded,
  setSortBy,
  setSortOrder,
  setViewMode,
  toggleHiddenFiles,
  setSearchQuery,
  clearSearch,
  copyToClipboard,
  cutToClipboard,
  clearClipboard,
  setActiveEnvironment,
  updateEnvironmentVariable,
  removeEnvironmentVariable,
  addWatchedPath,
  removeWatchedPath,
  addConflictFile,
  removeConflictFile,
  clearError,
  addWarning,
  removeWarning,
  clearWarnings,
  updateFileCache,
  clearFileCache,
  updateStats,
} = workspaceSlice.actions;

// Export selectors
export const selectCurrentProject = (state: { workspace: WorkspaceState }) => 
  state.workspace.currentProject;

export const selectActiveFile = (state: { workspace: WorkspaceState }) => {
  const { activeFileId, openFiles } = state.workspace;
  return activeFileId ? openFiles[activeFileId] : null;
};

export const selectOpenFiles = (state: { workspace: WorkspaceState }) => 
  Object.values(state.workspace.openFiles);

export const selectFileTree = (state: { workspace: WorkspaceState }) => 
  state.workspace.fileTree;

export const selectCurrentEnvironment = (state: { workspace: WorkspaceState }) => {
  const { activeEnvironment, environments } = state.workspace;
  return activeEnvironment ? environments[activeEnvironment] : null;
};

export const selectNavigationState = (state: { workspace: WorkspaceState }) => ({
  canGoBack: state.workspace.navigationIndex > 0,
  canGoForward: state.workspace.navigationIndex < state.workspace.navigationHistory.length - 1,
  currentPath: state.workspace.currentDirectory,
});

export const selectDirtyFiles = (state: { workspace: WorkspaceState }) => 
  Object.values(state.workspace.openFiles).filter(file => file.isDirty);

export const selectRecentFiles = (state: { workspace: WorkspaceState }) => 
  state.workspace.recentFiles;

export const selectSearchState = (state: { workspace: WorkspaceState }) => ({
  query: state.workspace.searchQuery,
  results: state.workspace.searchResults,
  isSearching: state.workspace.isSearching,
});

export const selectWorkspaceStats = (state: { workspace: WorkspaceState }) => 
  state.workspace.stats;

// Export reducer
export default workspaceSlice.reducer;
