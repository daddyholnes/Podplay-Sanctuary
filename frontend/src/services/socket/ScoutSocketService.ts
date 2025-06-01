import { EventEmitter } from 'events';
import { SocketService } from './SocketService';
import { SocketErrorHandler } from './SocketErrorHandler';
import { 
  ScoutAnalysis, 
  FileScoutResult, 
  DependencyGraph,
  SecurityIssue,
  PerformanceMetric,
  CodeQualityReport,
  ScoutError
} from '../api/APITypes';

export interface ScoutSocketConfig {
  analysisDepth?: 'shallow' | 'deep' | 'comprehensive';
  enableRealTimeAnalysis?: boolean;
  debounceDelay?: number;
  maxConcurrentAnalysis?: number;
  enableSecurityScanning?: boolean;
  enablePerformanceMetrics?: boolean;
}

export interface AnalysisJob {
  id: string;
  type: 'file' | 'workspace' | 'dependency' | 'security';
  target: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime: Date;
  endTime?: Date;
  result?: any;
  error?: ScoutError;
}

export interface AnalysisMetrics {
  totalAnalyses: number;
  completedAnalyses: number;
  failedAnalyses: number;
  averageTime: number;
  activeJobs: number;
}

export class ScoutSocketService extends EventEmitter {
  private socketService: SocketService;
  private errorHandler: SocketErrorHandler;
  private config: Required<ScoutSocketConfig>;
  private activeJobs = new Map<string, AnalysisJob>();
  private analysisQueue: AnalysisJob[] = [];
  private analysisMetrics: AnalysisMetrics = {
    totalAnalyses: 0,
    completedAnalyses: 0,
    failedAnalyses: 0,
    averageTime: 0,
    activeJobs: 0
  };
  private realtimeWatchers = new Set<string>();

  constructor(
    socketService: SocketService,
    errorHandler: SocketErrorHandler,
    config: ScoutSocketConfig = {}
  ) {
    super();
    this.socketService = socketService;
    this.errorHandler = errorHandler;
    
    this.config = {
      analysisDepth: config.analysisDepth ?? 'deep',
      enableRealTimeAnalysis: config.enableRealTimeAnalysis ?? true,
      debounceDelay: config.debounceDelay ?? 1000,
      maxConcurrentAnalysis: config.maxConcurrentAnalysis ?? 3,
      enableSecurityScanning: config.enableSecurityScanning ?? true,
      enablePerformanceMetrics: config.enablePerformanceMetrics ?? true
    };

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Socket connection events
    this.socketService.on('connected', () => {
      this.emit('scoutConnected');
      this.resumeAnalysis();
    });

    this.socketService.on('disconnected', () => {
      this.emit('scoutDisconnected');
      this.pauseAnalysis();
    });

    this.socketService.on('reconnected', () => {
      this.emit('scoutReconnected');
      this.reestablishWatchers();
    });

    // Scout-specific events
    this.socketService.on('analysis:started', this.handleAnalysisStarted.bind(this));
    this.socketService.on('analysis:progress', this.handleAnalysisProgress.bind(this));
    this.socketService.on('analysis:completed', this.handleAnalysisCompleted.bind(this));
    this.socketService.on('analysis:failed', this.handleAnalysisFailed.bind(this));
    this.socketService.on('security:issue', this.handleSecurityIssue.bind(this));
    this.socketService.on('performance:metric', this.handlePerformanceMetric.bind(this));
    this.socketService.on('dependency:update', this.handleDependencyUpdate.bind(this));

    // Error handling
    this.errorHandler.on('error', (error) => {
      this.emit('scoutError', error);
    });
  }

  async analyzeFile(filePath: string, options: {
    includeMetrics?: boolean;
    includeSecurity?: boolean;
    includeDependencies?: boolean;
    forceReanalysis?: boolean;
  } = {}): Promise<string> {
    const jobId = this.generateJobId();
    
    try {
      const job: AnalysisJob = {
        id: jobId,
        type: 'file',
        target: filePath,
        status: 'pending',
        progress: 0,
        startTime: new Date()
      };

      this.activeJobs.set(jobId, job);
      this.analysisMetrics.totalAnalyses++;

      await this.socketService.emit('scout:analyze-file', {
        jobId,
        filePath,
        depth: this.config.analysisDepth,
        includeMetrics: options.includeMetrics ?? this.config.enablePerformanceMetrics,
        includeSecurity: options.includeSecurity ?? this.config.enableSecurityScanning,
        includeDependencies: options.includeDependencies ?? true,
        forceReanalysis: options.forceReanalysis ?? false
      });

      return jobId;
    } catch (error) {
      this.activeJobs.delete(jobId);
      throw this.errorHandler.handleError(error as Error, 'ANALYZE_FILE_FAILED');
    }
  }

  async analyzeWorkspace(options: {
    includeTests?: boolean;
    includeNodeModules?: boolean;
    maxDepth?: number;
    patterns?: string[];
    excludePatterns?: string[];
  } = {}): Promise<string> {
    const jobId = this.generateJobId();
    
    try {
      const job: AnalysisJob = {
        id: jobId,
        type: 'workspace',
        target: 'workspace',
        status: 'pending',
        progress: 0,
        startTime: new Date()
      };

      this.activeJobs.set(jobId, job);
      this.analysisMetrics.totalAnalyses++;

      await this.socketService.emit('scout:analyze-workspace', {
        jobId,
        depth: this.config.analysisDepth,
        includeTests: options.includeTests ?? true,
        includeNodeModules: options.includeNodeModules ?? false,
        maxDepth: options.maxDepth ?? 10,
        patterns: options.patterns ?? ['**/*.{ts,js,tsx,jsx,py,java,cpp,c,cs}'],
        excludePatterns: options.excludePatterns ?? [
          'node_modules/**',
          '**/*.test.*',
          '**/*.spec.*',
          'dist/**',
          'build/**'
        ]
      });

      return jobId;
    } catch (error) {
      this.activeJobs.delete(jobId);
      throw this.errorHandler.handleError(error as Error, 'ANALYZE_WORKSPACE_FAILED');
    }
  }

  async analyzeDependencies(options: {
    checkVulnerabilities?: boolean;
    checkUpdates?: boolean;
    includeDev?: boolean;
    depth?: number;
  } = {}): Promise<string> {
    const jobId = this.generateJobId();
    
    try {
      const job: AnalysisJob = {
        id: jobId,
        type: 'dependency',
        target: 'dependencies',
        status: 'pending',
        progress: 0,
        startTime: new Date()
      };

      this.activeJobs.set(jobId, job);
      this.analysisMetrics.totalAnalyses++;

      await this.socketService.emit('scout:analyze-dependencies', {
        jobId,
        checkVulnerabilities: options.checkVulnerabilities ?? this.config.enableSecurityScanning,
        checkUpdates: options.checkUpdates ?? true,
        includeDev: options.includeDev ?? true,
        depth: options.depth ?? 3
      });

      return jobId;
    } catch (error) {
      this.activeJobs.delete(jobId);
      throw this.errorHandler.handleError(error as Error, 'ANALYZE_DEPENDENCIES_FAILED');
    }
  }

  async runSecurityScan(options: {
    scanType?: 'quick' | 'thorough' | 'comprehensive';
    includeSecrets?: boolean;
    includeLicense?: boolean;
    customRules?: string[];
  } = {}): Promise<string> {
    const jobId = this.generateJobId();
    
    try {
      const job: AnalysisJob = {
        id: jobId,
        type: 'security',
        target: 'security',
        status: 'pending',
        progress: 0,
        startTime: new Date()
      };

      this.activeJobs.set(jobId, job);
      this.analysisMetrics.totalAnalyses++;

      await this.socketService.emit('scout:security-scan', {
        jobId,
        scanType: options.scanType ?? 'thorough',
        includeSecrets: options.includeSecrets ?? true,
        includeLicense: options.includeLicense ?? true,
        customRules: options.customRules ?? []
      });

      return jobId;
    } catch (error) {
      this.activeJobs.delete(jobId);
      throw this.errorHandler.handleError(error as Error, 'SECURITY_SCAN_FAILED');
    }
  }

  async enableRealtimeAnalysis(filePaths: string[]): Promise<void> {
    try {
      await this.socketService.emit('scout:enable-realtime', {
        filePaths,
        debounceDelay: this.config.debounceDelay
      });

      filePaths.forEach(path => this.realtimeWatchers.add(path));
      this.emit('realtimeEnabled', filePaths);
    } catch (error) {
      throw this.errorHandler.handleError(error as Error, 'ENABLE_REALTIME_FAILED');
    }
  }

  async disableRealtimeAnalysis(filePaths: string[]): Promise<void> {
    try {
      await this.socketService.emit('scout:disable-realtime', { filePaths });

      filePaths.forEach(path => this.realtimeWatchers.delete(path));
      this.emit('realtimeDisabled', filePaths);
    } catch (error) {
      throw this.errorHandler.handleError(error as Error, 'DISABLE_REALTIME_FAILED');
    }
  }

  async getAnalysisResult(jobId: string): Promise<any> {
    try {
      const response = await this.socketService.emit('scout:get-result', { jobId });
      return response.data;
    } catch (error) {
      throw this.errorHandler.handleError(error as Error, 'GET_ANALYSIS_RESULT_FAILED');
    }
  }

  async cancelAnalysis(jobId: string): Promise<void> {
    try {
      await this.socketService.emit('scout:cancel-analysis', { jobId });
      
      const job = this.activeJobs.get(jobId);
      if (job) {
        job.status = 'failed';
        job.endTime = new Date();
        job.error = { code: 'CANCELLED', message: 'Analysis cancelled by user' };
      }

      this.emit('analysisCancelled', jobId);
    } catch (error) {
      throw this.errorHandler.handleError(error as Error, 'CANCEL_ANALYSIS_FAILED');
    }
  }

  async getCodeQualityReport(): Promise<CodeQualityReport> {
    try {
      const response = await this.socketService.emit('scout:quality-report');
      return response.data;
    } catch (error) {
      throw this.errorHandler.handleError(error as Error, 'GET_QUALITY_REPORT_FAILED');
    }
  }

  async getDependencyGraph(): Promise<DependencyGraph> {
    try {
      const response = await this.socketService.emit('scout:dependency-graph');
      return response.data;
    } catch (error) {
      throw this.errorHandler.handleError(error as Error, 'GET_DEPENDENCY_GRAPH_FAILED');
    }
  }

  getActiveJobs(): AnalysisJob[] {
    return Array.from(this.activeJobs.values());
  }

  getJobStatus(jobId: string): AnalysisJob | undefined {
    return this.activeJobs.get(jobId);
  }

  getAnalysisMetrics(): AnalysisMetrics {
    return { ...this.analysisMetrics };
  }

  getRealtimeWatchers(): string[] {
    return Array.from(this.realtimeWatchers);
  }

  private handleAnalysisStarted(data: { jobId: string }): void {
    const job = this.activeJobs.get(data.jobId);
    if (job) {
      job.status = 'running';
      this.analysisMetrics.activeJobs++;
    }
    
    this.emit('analysisStarted', data.jobId);
  }

  private handleAnalysisProgress(data: { jobId: string, progress: number, stage?: string }): void {
    const job = this.activeJobs.get(data.jobId);
    if (job) {
      job.progress = data.progress;
    }
    
    this.emit('analysisProgress', data);
  }

  private handleAnalysisCompleted(data: { jobId: string, result: any }): void {
    const job = this.activeJobs.get(data.jobId);
    if (job) {
      job.status = 'completed';
      job.progress = 100;
      job.endTime = new Date();
      job.result = data.result;
      
      this.updateMetrics(job);
    }
    
    this.emit('analysisCompleted', data);
  }

  private handleAnalysisFailed(data: { jobId: string, error: ScoutError }): void {
    const job = this.activeJobs.get(data.jobId);
    if (job) {
      job.status = 'failed';
      job.endTime = new Date();
      job.error = data.error;
      
      this.analysisMetrics.failedAnalyses++;
      this.analysisMetrics.activeJobs = Math.max(0, this.analysisMetrics.activeJobs - 1);
    }
    
    this.emit('analysisFailed', data);
  }

  private handleSecurityIssue(data: { issue: SecurityIssue }): void {
    this.emit('securityIssue', data.issue);
  }

  private handlePerformanceMetric(data: { metric: PerformanceMetric }): void {
    this.emit('performanceMetric', data.metric);
  }

  private handleDependencyUpdate(data: { dependency: string, update: any }): void {
    this.emit('dependencyUpdate', data);
  }

  private updateMetrics(job: AnalysisJob): void {
    this.analysisMetrics.completedAnalyses++;
    this.analysisMetrics.activeJobs = Math.max(0, this.analysisMetrics.activeJobs - 1);
    
    if (job.endTime && job.startTime) {
      const duration = job.endTime.getTime() - job.startTime.getTime();
      const totalTime = this.analysisMetrics.averageTime * (this.analysisMetrics.completedAnalyses - 1);
      this.analysisMetrics.averageTime = (totalTime + duration) / this.analysisMetrics.completedAnalyses;
    }
  }

  private pauseAnalysis(): void {
    // Mark all running jobs as pending for retry
    this.activeJobs.forEach(job => {
      if (job.status === 'running') {
        job.status = 'pending';
        this.analysisMetrics.activeJobs = Math.max(0, this.analysisMetrics.activeJobs - 1);
      }
    });
  }

  private resumeAnalysis(): void {
    // Resume pending jobs
    const pendingJobs = Array.from(this.activeJobs.values()).filter(job => job.status === 'pending');
    
    pendingJobs.forEach(job => {
      // Re-queue the job based on its type
      switch (job.type) {
        case 'file':
          this.analyzeFile(job.target).catch(() => {
            // Handle retry failure
          });
          break;
        case 'workspace':
          this.analyzeWorkspace().catch(() => {
            // Handle retry failure
          });
          break;
        case 'dependency':
          this.analyzeDependencies().catch(() => {
            // Handle retry failure
          });
          break;
        case 'security':
          this.runSecurityScan().catch(() => {
            // Handle retry failure
          });
          break;
      }
    });
  }

  private async reestablishWatchers(): Promise<void> {
    if (this.realtimeWatchers.size > 0) {
      const watchedPaths = Array.from(this.realtimeWatchers);
      try {
        await this.enableRealtimeAnalysis(watchedPaths);
      } catch (error) {
        this.errorHandler.handleError(error as Error, 'REESTABLISH_WATCHERS_FAILED');
      }
    }
  }

  private generateJobId(): string {
    return `scout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  disconnect(): void {
    this.activeJobs.clear();
    this.analysisQueue = [];
    this.realtimeWatchers.clear();
    this.removeAllListeners();
  }
}
