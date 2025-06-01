/**
 * Workspace State Selectors
 * 
 * Specialized selectors for workspace and file management including
 * projects, files, Git operations, and development environment state.
 * Optimized with memoization for performance.
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import type { 
  WorkspaceState, 
  Project, 
  FileItem, 
  GitStatus, 
  FileWatcher,
  WorkspaceSettings,
  FileFilter,
  ProjectFilter
} from '../slices/workspaceSlice';

// Base workspace selector
export const selectWorkspace = (state: RootState): WorkspaceState => state.workspace;

// Project selectors
export const selectProjects = createSelector(
  [selectWorkspace],
  (workspace) => workspace.projects
);

export const selectActiveProjectId = createSelector(
  [selectWorkspace],
  (workspace) => workspace.activeProjectId
);

export const selectActiveProject = createSelector(
  [selectProjects, selectActiveProjectId],
  (projects, activeId) => 
    activeId ? projects.find(project => project.id === activeId) || null : null
);

export const selectProjectById = createSelector(
  [selectProjects, (_: RootState, projectId: string) => projectId],
  (projects, projectId) => 
    projects.find(project => project.id === projectId) || null
);

export const selectRecentProjects = createSelector(
  [selectProjects],
  (projects) => 
    [...projects]
      .sort((a, b) => b.lastAccessed - a.lastAccessed)
      .slice(0, 10)
);

export const selectFavoriteProjects = createSelector(
  [selectProjects],
  (projects) => projects.filter(project => project.isFavorite)
);

export const selectProjectsByType = createSelector(
  [selectProjects, (_: RootState, type: string) => type],
  (projects, type) => projects.filter(project => project.type === type)
);

export const selectProjectsByLanguage = createSelector(
  [selectProjects, (_: RootState, language: string) => language],
  (projects, language) => 
    projects.filter(project => project.languages.includes(language))
);

// File selectors
export const selectFiles = createSelector(
  [selectWorkspace],
  (workspace) => workspace.files
);

export const selectOpenFiles = createSelector(
  [selectFiles],
  (files) => files.filter(file => file.isOpen)
);

export const selectActiveFileId = createSelector(
  [selectWorkspace],
  (workspace) => workspace.activeFileId
);

export const selectActiveFile = createSelector(
  [selectFiles, selectActiveFileId],
  (files, activeId) => 
    activeId ? files.find(file => file.id === activeId) || null : null
);

export const selectFileById = createSelector(
  [selectFiles, (_: RootState, fileId: string) => fileId],
  (files, fileId) => files.find(file => file.id === fileId) || null
);

export const selectFilesByPath = createSelector(
  [selectFiles, (_: RootState, path: string) => path],
  (files, path) => files.filter(file => file.path.startsWith(path))
);

export const selectFilesByExtension = createSelector(
  [selectFiles, (_: RootState, extension: string) => extension],
  (files, extension) => files.filter(file => file.path.endsWith(extension))
);

export const selectModifiedFiles = createSelector(
  [selectFiles],
  (files) => files.filter(file => file.isModified)
);

export const selectRecentFiles = createSelector(
  [selectFiles],
  (files) => 
    [...files]
      .sort((a, b) => b.lastAccessed - a.lastAccessed)
      .slice(0, 20)
);

export const selectFileTree = createSelector(
  [selectFiles],
  (files) => {
    const tree: Record<string, any> = {};
    
    files.forEach(file => {
      const parts = file.path.split('/');
      let current = tree;
      
      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = index === parts.length - 1 
            ? { ...file, isFile: true }
            : { isDirectory: true, children: {} };
        }
        if (!current[part].isFile) {
          current = current[part].children;
        }
      });
    });
    
    return tree;
  }
);

// Git selectors
export const selectGitStatus = createSelector(
  [selectWorkspace],
  (workspace) => workspace.gitStatus
);

export const selectGitBranch = createSelector(
  [selectGitStatus],
  (gitStatus) => gitStatus?.currentBranch || null
);

export const selectGitChanges = createSelector(
  [selectGitStatus],
  (gitStatus) => gitStatus?.changes || []
);

export const selectStagedChanges = createSelector(
  [selectGitChanges],
  (changes) => changes.filter(change => change.staged)
);

export const selectUnstagedChanges = createSelector(
  [selectGitChanges],
  (changes) => changes.filter(change => !change.staged)
);

export const selectGitCommits = createSelector(
  [selectGitStatus],
  (gitStatus) => gitStatus?.commits || []
);

export const selectGitRemotes = createSelector(
  [selectGitStatus],
  (gitStatus) => gitStatus?.remotes || []
);

export const selectGitBranches = createSelector(
  [selectGitStatus],
  (gitStatus) => gitStatus?.branches || []
);

// File watcher selectors
export const selectFileWatchers = createSelector(
  [selectWorkspace],
  (workspace) => workspace.fileWatchers
);

export const selectActiveWatchers = createSelector(
  [selectFileWatchers],
  (watchers) => watchers.filter(watcher => watcher.isActive)
);

export const selectWatchersByPath = createSelector(
  [selectFileWatchers, (_: RootState, path: string) => path],
  (watchers, path) => watchers.filter(watcher => watcher.path === path)
);

// Settings selectors
export const selectWorkspaceSettings = createSelector(
  [selectWorkspace],
  (workspace) => workspace.settings
);

export const selectAutoSave = createSelector(
  [selectWorkspaceSettings],
  (settings) => settings.autoSave
);

export const selectFileAssociations = createSelector(
  [selectWorkspaceSettings],
  (settings) => settings.fileAssociations
);

export const selectEditorSettings = createSelector(
  [selectWorkspaceSettings],
  (settings) => settings.editor
);

export const selectGitSettings = createSelector(
  [selectWorkspaceSettings],
  (settings) => settings.git
);

// Filter selectors
export const selectFileFilter = createSelector(
  [selectWorkspace],
  (workspace) => workspace.fileFilter
);

export const selectProjectFilter = createSelector(
  [selectWorkspace],
  (workspace) => workspace.projectFilter
);

export const selectFilteredFiles = createSelector(
  [selectFiles, selectFileFilter],
  (files, filter) => {
    if (!filter) return files;
    
    let filtered = files;
    
    if (filter.extension) {
      filtered = filtered.filter(file => file.path.endsWith(filter.extension));
    }
    
    if (filter.isModified !== undefined) {
      filtered = filtered.filter(file => file.isModified === filter.isModified);
    }
    
    if (filter.isOpen !== undefined) {
      filtered = filtered.filter(file => file.isOpen === filter.isOpen);
    }
    
    if (filter.sizeRange) {
      const { min, max } = filter.sizeRange;
      filtered = filtered.filter(file => 
        file.size >= min && file.size <= max
      );
    }
    
    if (filter.dateRange) {
      const { start, end } = filter.dateRange;
      filtered = filtered.filter(file => 
        file.lastModified >= start && file.lastModified <= end
      );
    }
    
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(query) ||
        file.path.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }
);

export const selectFilteredProjects = createSelector(
  [selectProjects, selectProjectFilter],
  (projects, filter) => {
    if (!filter) return projects;
    
    let filtered = projects;
    
    if (filter.type) {
      filtered = filtered.filter(project => project.type === filter.type);
    }
    
    if (filter.language) {
      filtered = filtered.filter(project => 
        project.languages.includes(filter.language)
      );
    }
    
    if (filter.isFavorite !== undefined) {
      filtered = filtered.filter(project => 
        project.isFavorite === filter.isFavorite
      );
    }
    
    if (filter.dateRange) {
      const { start, end } = filter.dateRange;
      filtered = filtered.filter(project => 
        project.lastAccessed >= start && project.lastAccessed <= end
      );
    }
    
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(query) ||
        project.path.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }
);

// Status selectors
export const selectWorkspaceLoading = createSelector(
  [selectWorkspace],
  (workspace) => workspace.loading
);

export const selectWorkspaceErrors = createSelector(
  [selectWorkspace],
  (workspace) => workspace.errors
);

export const selectLastUpdate = createSelector(
  [selectWorkspace],
  (workspace) => workspace.lastUpdate
);

// Composite selectors
export const selectWorkspaceMetrics = createSelector(
  [selectProjects, selectFiles, selectModifiedFiles, selectOpenFiles],
  (projects, files, modifiedFiles, openFiles) => ({
    totalProjects: projects.length,
    totalFiles: files.length,
    openFilesCount: openFiles.length,
    modifiedFilesCount: modifiedFiles.length,
    averageFilesPerProject: projects.length > 0 
      ? Math.round(files.length / projects.length) 
      : 0,
    diskUsage: files.reduce((total, file) => total + (file.size || 0), 0)
  })
);

export const selectWorkspaceStatus = createSelector(
  [selectWorkspaceLoading, selectWorkspaceErrors, selectGitStatus, selectActiveWatchers],
  (loading, errors, gitStatus, activeWatchers) => ({
    isLoading: Object.values(loading).some(Boolean),
    hasErrors: errors.length > 0,
    hasGitRepo: !!gitStatus,
    watchersActive: activeWatchers.length,
    isHealthy: errors.length === 0 && !Object.values(loading).some(Boolean)
  })
);

export const selectProjectStats = createSelector(
  [selectActiveProject, selectFiles, selectGitChanges],
  (project, files, gitChanges) => {
    if (!project) return null;
    
    const projectFiles = files.filter(file => 
      file.path.startsWith(project.path)
    );
    
    const projectChanges = gitChanges.filter(change => 
      change.path.startsWith(project.path)
    );
    
    return {
      id: project.id,
      name: project.name,
      fileCount: projectFiles.length,
      modifiedFileCount: projectFiles.filter(f => f.isModified).length,
      gitChangesCount: projectChanges.length,
      totalSize: projectFiles.reduce((total, file) => total + (file.size || 0), 0),
      lastActivity: Math.max(
        project.lastAccessed,
        ...projectFiles.map(f => f.lastAccessed)
      ),
      languages: project.languages,
      isActive: true
    };
  }
);

export const selectWorkspaceActivity = createSelector(
  [selectFiles, selectProjects, selectGitCommits],
  (files, projects, commits) => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    return {
      todayFileChanges: files.filter(f => f.lastModified > now - oneDay).length,
      todayProjectAccess: projects.filter(p => p.lastAccessed > now - oneDay).length,
      recentCommits: commits.filter(c => c.timestamp > now - 7 * oneDay).length,
      lastActivity: Math.max(
        ...files.map(f => f.lastAccessed),
        ...projects.map(p => p.lastAccessed),
        0
      ),
      activeProjects: projects.filter(p => 
        p.lastAccessed > now - 7 * oneDay
      ).length
    };
  }
);

export const selectWorkspacePerformance = createSelector(
  [selectFiles, selectProjects, selectActiveWatchers],
  (files, projects, watchers) => ({
    fileLoadSpeed: calculateFileLoadSpeed(files),
    projectSwitchTime: calculateProjectSwitchTime(projects),
    watcherPerformance: calculateWatcherPerformance(watchers),
    memoryUsage: calculateMemoryUsage(files, projects),
    optimizationScore: calculateWorkspaceOptimizationScore(files, projects, watchers)
  })
);

// Helper functions for performance calculations
function calculateFileLoadSpeed(files: FileItem[]): number {
  // Simplified calculation - in practice, this would track actual load times
  return files.length > 500 ? 250 : 150; // ms
}

function calculateProjectSwitchTime(projects: Project[]): number {
  return projects.length > 20 ? 400 : 200; // ms
}

function calculateWatcherPerformance(watchers: FileWatcher[]): number {
  return watchers.length > 10 ? 80 : 95; // performance score
}

function calculateMemoryUsage(files: FileItem[], projects: Project[]): number {
  // Simplified calculation
  return (files.length * 0.1) + (projects.length * 0.5); // MB
}

function calculateWorkspaceOptimizationScore(
  files: FileItem[], 
  projects: Project[], 
  watchers: FileWatcher[]
): number {
  let score = 100;
  
  // Reduce score for large datasets
  if (files.length > 1000) score -= 15;
  if (projects.length > 50) score -= 10;
  if (watchers.length > 20) score -= 5;
  
  // Reduce score for many modified files
  const modifiedFiles = files.filter(f => f.isModified);
  if (modifiedFiles.length > 20) score -= 10;
  
  return Math.max(0, Math.min(100, score));
}

// Export all selectors
export default {
  // Base
  selectWorkspace,
  
  // Projects
  selectProjects,
  selectActiveProjectId,
  selectActiveProject,
  selectProjectById,
  selectRecentProjects,
  selectFavoriteProjects,
  selectProjectsByType,
  selectProjectsByLanguage,
  
  // Files
  selectFiles,
  selectOpenFiles,
  selectActiveFileId,
  selectActiveFile,
  selectFileById,
  selectFilesByPath,
  selectFilesByExtension,
  selectModifiedFiles,
  selectRecentFiles,
  selectFileTree,
  
  // Git
  selectGitStatus,
  selectGitBranch,
  selectGitChanges,
  selectStagedChanges,
  selectUnstagedChanges,
  selectGitCommits,
  selectGitRemotes,
  selectGitBranches,
  
  // Watchers
  selectFileWatchers,
  selectActiveWatchers,
  selectWatchersByPath,
  
  // Settings
  selectWorkspaceSettings,
  selectAutoSave,
  selectFileAssociations,
  selectEditorSettings,
  selectGitSettings,
  
  // Filters
  selectFileFilter,
  selectProjectFilter,
  selectFilteredFiles,
  selectFilteredProjects,
  
  // Status
  selectWorkspaceLoading,
  selectWorkspaceErrors,
  selectLastUpdate,
  
  // Composite
  selectWorkspaceMetrics,
  selectWorkspaceStatus,
  selectProjectStats,
  selectWorkspaceActivity,
  selectWorkspacePerformance
};
