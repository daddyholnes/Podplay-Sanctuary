import { EventEmitter } from 'events';
import { SocketService } from './SocketService';
import { SocketErrorHandler } from './SocketErrorHandler';
import { 
  WorkspaceFile, 
  WorkspaceFolder, 
  FileChange,
  FileSystemEvent,
  WorkspaceConfiguration,
  WorkspaceError
} from '../api/APITypes';

export interface WorkspaceSocketConfig {
  watchPatterns?: string[];
  ignorePatterns?: string[];
  debounceDelay?: number;
  maxFileSize?: number;
  enableBinaryFiles?: boolean;
  syncOnConnect?: boolean;
}

export interface FileWatcher {
  id: string;
  pattern: string;
  recursive: boolean;
  events: FileSystemEvent[];
  callback: (event: FileSystemEvent) => void;
}

export interface WorkspaceSync {
  lastSyncTime: Date;
  pendingChanges: FileChange[];
  conflictedFiles: string[];
  syncInProgress: boolean;
}

export class WorkspaceSocketService extends EventEmitter {
  private socketService: SocketService;
  private errorHandler: SocketErrorHandler;
  private config: Required<WorkspaceSocketConfig>;
  private fileWatchers = new Map<string, FileWatcher>();
  private workspaceSync: WorkspaceSync = {
    lastSyncTime: new Date(),
    pendingChanges: [],
    conflictedFiles: [],
    syncInProgress: false
  };
  private debounceTimers = new Map<string, NodeJS.Timeout>();
  private currentWorkspace?: string;

  constructor(
    socketService: SocketService,
    errorHandler: SocketErrorHandler,
    config: WorkspaceSocketConfig = {}
  ) {
    super();
    this.socketService = socketService;
    this.errorHandler = errorHandler;
    
    this.config = {
      watchPatterns: config.watchPatterns ?? ['**/*'],
      ignorePatterns: config.ignorePatterns ?? [
        'node_modules/**',
        '.git/**',
        '**/*.tmp',
        '**/*.log',
        '**/dist/**',
        '**/build/**'
      ],
      debounceDelay: config.debounceDelay ?? 500,
      maxFileSize: config.maxFileSize ?? 50 * 1024 * 1024, // 50MB
      enableBinaryFiles: config.enableBinaryFiles ?? false,
      syncOnConnect: config.syncOnConnect ?? true
    };

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Socket connection events
    this.socketService.on('connected', () => {
      this.emit('workspaceConnected');
      if (this.config.syncOnConnect && this.currentWorkspace) {
        this.syncWorkspace();
      }
    });

    this.socketService.on('disconnected', () => {
      this.emit('workspaceDisconnected');
      this.clearDebounceTimers();
    });

    this.socketService.on('reconnected', () => {
      this.emit('workspaceReconnected');
      this.reestablishWatchers();
    });

    // Workspace-specific events
    this.socketService.on('file:changed', this.handleFileChanged.bind(this));
    this.socketService.on('file:created', this.handleFileCreated.bind(this));
    this.socketService.on('file:deleted', this.handleFileDeleted.bind(this));
    this.socketService.on('file:renamed', this.handleFileRenamed.bind(this));
    this.socketService.on('folder:created', this.handleFolderCreated.bind(this));
    this.socketService.on('folder:deleted', this.handleFolderDeleted.bind(this));
    this.socketService.on('workspace:sync', this.handleWorkspaceSync.bind(this));
    this.socketService.on('workspace:conflict', this.handleWorkspaceConflict.bind(this));

    // Error handling
    this.errorHandler.on('error', (error) => {
      this.emit('workspaceError', error);
    });
  }

  async setWorkspace(workspacePath: string): Promise<void> {
    try {
      this.currentWorkspace = workspacePath;
      
      const response = await this.socketService.emit('workspace:set', { 
        path: workspacePath,
        config: this.config
      });
      
      this.emit('workspaceSet', response.data);
    } catch (error) {
      throw this.errorHandler.handleError(error as Error, 'SET_WORKSPACE_FAILED');
    }
  }

  async getWorkspaceStructure(): Promise<WorkspaceFolder> {
    try {
      const response = await this.socketService.emit('workspace:structure');
      return response.data;
    } catch (error) {
      throw this.errorHandler.handleError(error as Error, 'GET_WORKSPACE_STRUCTURE_FAILED');
    }
  }

  async watchFiles(pattern: string, options: {
    recursive?: boolean;
    events?: FileSystemEvent[];
  } = {}): Promise<string> {
    const watcherId = this.generateWatcherId();
    
    try {
      await this.socketService.emit('file:watch', {
        watcherId,
        pattern,
        recursive: options.recursive ?? true,
        events: options.events ?? ['created', 'modified', 'deleted']
      });

      const watcher: FileWatcher = {
        id: watcherId,
        pattern,
        recursive: options.recursive ?? true,
        events: options.events ?? ['created', 'modified', 'deleted'],
        callback: (event) => this.emit('fileEvent', event)
      };

      this.fileWatchers.set(watcherId, watcher);
      
      return watcherId;
    } catch (error) {
      throw this.errorHandler.handleError(error as Error, 'WATCH_FILES_FAILED');
    }
  }

  async unwatchFiles(watcherId: string): Promise<void> {
    try {
      await this.socketService.emit('file:unwatch', { watcherId });
      this.fileWatchers.delete(watcherId);
    } catch (error) {
      throw this.errorHandler.handleError(error as Error, 'UNWATCH_FILES_FAILED');
    }
  }

  async readFile(filePath: string): Promise<WorkspaceFile> {
    try {
      const response = await this.socketService.emit('file:read', { path: filePath });
      return response.data;
    } catch (error) {
      throw this.errorHandler.handleError(error as Error, 'READ_FILE_FAILED');
    }
  }

  async writeFile(filePath: string, content: string, options: {
    encoding?: string;
    createDirectories?: boolean;
    backup?: boolean;
  } = {}): Promise<void> {
    try {
      // Check file size
      if (content.length > this.config.maxFileSize) {
        throw new Error(`File size exceeds maximum allowed size of ${this.config.maxFileSize} bytes`);
      }

      await this.socketService.emit('file:write', {
        path: filePath,
        content,
        encoding: options.encoding ?? 'utf8',
        createDirectories: options.createDirectories ?? true,
        backup: options.backup ?? false
      });

      this.addPendingChange({
        type: 'modified',
        path: filePath,
        timestamp: new Date()
      });
    } catch (error) {
      throw this.errorHandler.handleError(error as Error, 'WRITE_FILE_FAILED');
    }
  }

  async createFile(filePath: string, content: string = ''): Promise<void> {
    try {
      await this.socketService.emit('file:create', {
        path: filePath,
        content
      });

      this.addPendingChange({
        type: 'created',
        path: filePath,
        timestamp: new Date()
      });
    } catch (error) {
      throw this.errorHandler.handleError(error as Error, 'CREATE_FILE_FAILED');
    }
  }

  async deleteFile(filePath: string, options: {
    permanent?: boolean;
    backup?: boolean;
  } = {}): Promise<void> {
    try {
      await this.socketService.emit('file:delete', {
        path: filePath,
        permanent: options.permanent ?? false,
        backup: options.backup ?? true
      });

      this.addPendingChange({
        type: 'deleted',
        path: filePath,
        timestamp: new Date()
      });
    } catch (error) {
      throw this.errorHandler.handleError(error as Error, 'DELETE_FILE_FAILED');
    }
  }

  async renameFile(oldPath: string, newPath: string): Promise<void> {
    try {
      await this.socketService.emit('file:rename', {
        oldPath,
        newPath
      });

      this.addPendingChange({
        type: 'renamed',
        path: oldPath,
        newPath,
        timestamp: new Date()
      });
    } catch (error) {
      throw this.errorHandler.handleError(error as Error, 'RENAME_FILE_FAILED');
    }
  }

  async createFolder(folderPath: string): Promise<void> {
    try {
      await this.socketService.emit('folder:create', { path: folderPath });

      this.addPendingChange({
        type: 'created',
        path: folderPath,
        timestamp: new Date()
      });
    } catch (error) {
      throw this.errorHandler.handleError(error as Error, 'CREATE_FOLDER_FAILED');
    }
  }

  async deleteFolder(folderPath: string, options: {
    recursive?: boolean;
    permanent?: boolean;
  } = {}): Promise<void> {
    try {
      await this.socketService.emit('folder:delete', {
        path: folderPath,
        recursive: options.recursive ?? true,
        permanent: options.permanent ?? false
      });

      this.addPendingChange({
        type: 'deleted',
        path: folderPath,
        timestamp: new Date()
      });
    } catch (error) {
      throw this.errorHandler.handleError(error as Error, 'DELETE_FOLDER_FAILED');
    }
  }

  async syncWorkspace(): Promise<void> {
    if (this.workspaceSync.syncInProgress) {
      return;
    }

    try {
      this.workspaceSync.syncInProgress = true;
      this.emit('syncStarted');

      const response = await this.socketService.emit('workspace:sync', {
        lastSyncTime: this.workspaceSync.lastSyncTime,
        pendingChanges: this.workspaceSync.pendingChanges
      });

      this.workspaceSync.lastSyncTime = new Date();
      this.workspaceSync.pendingChanges = [];
      this.workspaceSync.conflictedFiles = response.data.conflicts || [];

      this.emit('syncCompleted', response.data);
    } catch (error) {
      this.emit('syncFailed', error);
      throw this.errorHandler.handleError(error as Error, 'SYNC_WORKSPACE_FAILED');
    } finally {
      this.workspaceSync.syncInProgress = false;
    }
  }

  async resolveConflict(filePath: string, resolution: 'local' | 'remote' | 'merge'): Promise<void> {
    try {
      await this.socketService.emit('workspace:resolve-conflict', {
        filePath,
        resolution
      });

      const index = this.workspaceSync.conflictedFiles.indexOf(filePath);
      if (index > -1) {
        this.workspaceSync.conflictedFiles.splice(index, 1);
      }

      this.emit('conflictResolved', { filePath, resolution });
    } catch (error) {
      throw this.errorHandler.handleError(error as Error, 'RESOLVE_CONFLICT_FAILED');
    }
  }

  async searchFiles(query: string, options: {
    includePatterns?: string[];
    excludePatterns?: string[];
    caseSensitive?: boolean;
    wholeWord?: boolean;
    regex?: boolean;
    maxResults?: number;
  } = {}): Promise<WorkspaceFile[]> {
    try {
      const response = await this.socketService.emit('workspace:search', {
        query,
        ...options
      });

      return response.data;
    } catch (error) {
      throw this.errorHandler.handleError(error as Error, 'SEARCH_FILES_FAILED');
    }
  }

  getWorkspaceSync(): WorkspaceSync {
    return { ...this.workspaceSync };
  }

  getPendingChanges(): FileChange[] {
    return [...this.workspaceSync.pendingChanges];
  }

  getConflictedFiles(): string[] {
    return [...this.workspaceSync.conflictedFiles];
  }

  getActiveWatchers(): FileWatcher[] {
    return Array.from(this.fileWatchers.values());
  }

  private handleFileChanged(data: { event: FileSystemEvent }): void {
    this.debounceEvent(data.event.path, () => {
      this.emit('fileChanged', data.event);
      this.addPendingChange({
        type: 'modified',
        path: data.event.path,
        timestamp: new Date()
      });
    });
  }

  private handleFileCreated(data: { event: FileSystemEvent }): void {
    this.emit('fileCreated', data.event);
    this.addPendingChange({
      type: 'created',
      path: data.event.path,
      timestamp: new Date()
    });
  }

  private handleFileDeleted(data: { event: FileSystemEvent }): void {
    this.emit('fileDeleted', data.event);
    this.addPendingChange({
      type: 'deleted',
      path: data.event.path,
      timestamp: new Date()
    });
  }

  private handleFileRenamed(data: { event: FileSystemEvent }): void {
    this.emit('fileRenamed', data.event);
    this.addPendingChange({
      type: 'renamed',
      path: data.event.path,
      newPath: data.event.newPath,
      timestamp: new Date()
    });
  }

  private handleFolderCreated(data: { event: FileSystemEvent }): void {
    this.emit('folderCreated', data.event);
  }

  private handleFolderDeleted(data: { event: FileSystemEvent }): void {
    this.emit('folderDeleted', data.event);
  }

  private handleWorkspaceSync(data: { changes: FileChange[] }): void {
    this.emit('workspaceSync', data.changes);
  }

  private handleWorkspaceConflict(data: { conflicts: string[] }): void {
    this.workspaceSync.conflictedFiles = data.conflicts;
    this.emit('workspaceConflict', data.conflicts);
  }

  private debounceEvent(path: string, callback: () => void): void {
    const existingTimer = this.debounceTimers.get(path);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      callback();
      this.debounceTimers.delete(path);
    }, this.config.debounceDelay);

    this.debounceTimers.set(path, timer);
  }

  private clearDebounceTimers(): void {
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
  }

  private async reestablishWatchers(): Promise<void> {
    const watchers = Array.from(this.fileWatchers.values());
    this.fileWatchers.clear();

    for (const watcher of watchers) {
      try {
        await this.watchFiles(watcher.pattern, {
          recursive: watcher.recursive,
          events: watcher.events
        });
      } catch (error) {
        this.errorHandler.handleError(error as Error, 'REESTABLISH_WATCHER_FAILED');
      }
    }
  }

  private addPendingChange(change: FileChange): void {
    // Remove any existing change for the same path
    this.workspaceSync.pendingChanges = this.workspaceSync.pendingChanges.filter(
      c => c.path !== change.path
    );
    
    // Add the new change
    this.workspaceSync.pendingChanges.push(change);
    
    // Limit the number of pending changes
    if (this.workspaceSync.pendingChanges.length > 1000) {
      this.workspaceSync.pendingChanges = this.workspaceSync.pendingChanges.slice(-1000);
    }
  }

  private generateWatcherId(): string {
    return `watcher_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  disconnect(): void {
    this.clearDebounceTimers();
    this.fileWatchers.clear();
    this.workspaceSync.pendingChanges = [];
    this.workspaceSync.conflictedFiles = [];
    this.removeAllListeners();
  }
}
