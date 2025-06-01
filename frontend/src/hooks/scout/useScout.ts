/**
 * Scout Hook - useScout
 * 
 * A comprehensive React hook for managing Scout agent functionality in Podplay Sanctuary.
 * Scout is an AI-powered agent that explores, analyzes, and provides insights about
 * codebases, projects, and development environments.
 * 
 * Features:
 * - Codebase exploration and analysis
 * - Real-time project scanning
 * - Dependency analysis and recommendations
 * - Code quality metrics and insights
 * - Architectural pattern detection
 * - Performance bottleneck identification
 * - Security vulnerability scanning
 * - Documentation generation
 * - Migration assistance and recommendations
 * 
 * @author Podplay Sanctuary Team
 * @version 1.0.0
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useSocket } from '../api/useSocket';
import { useAPI } from '../api/useAPI';
import { ScoutSocketService } from '../../services/socket/ScoutSocketService';

export interface ScoutScanResult {
  id: string;
  projectId: string;
  type: 'full' | 'incremental' | 'targeted' | 'security' | 'performance';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  progress: number;
  totalFiles: number;
  scannedFiles: number;
  findings: ScoutFinding[];
  metrics: ScoutMetrics;
  recommendations: ScoutRecommendation[];
  errors: string[];
  metadata?: any;
}

export interface ScoutFinding {
  id: string;
  type: 'issue' | 'improvement' | 'insight' | 'warning' | 'error';
  category: 'security' | 'performance' | 'maintainability' | 'architecture' | 'documentation' | 'dependencies';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  file?: string;
  line?: number;
  column?: number;
  code?: string;
  fix?: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  tags: string[];
  references: string[];
  createdAt: Date;
}

export interface ScoutMetrics {
  codebase: {
    totalLines: number;
    codeLines: number;
    commentLines: number;
    blankLines: number;
    fileCount: number;
    directoryCount: number;
    languages: Record<string, number>;
    frameworks: string[];
    libraries: Record<string, string>;
  };
  quality: {
    maintainabilityIndex: number;
    technicalDebt: number;
    testCoverage: number;
    duplicateCode: number;
    complexity: {
      cyclomatic: number;
      cognitive: number;
      halstead: any;
    };
  };
  security: {
    vulnerabilities: number;
    riskScore: number;
    outdatedDependencies: number;
    securityDebt: number;
  };
  performance: {
    bundleSize: number;
    loadTime: number;
    bottlenecks: number;
    optimizationOpportunities: number;
  };
}

export interface ScoutRecommendation {
  id: string;
  type: 'upgrade' | 'refactor' | 'optimize' | 'security' | 'architecture' | 'tooling';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  rationale: string;
  impact: {
    effort: 'low' | 'medium' | 'high';
    risk: 'low' | 'medium' | 'high';
    benefit: 'low' | 'medium' | 'high';
  };
  steps: string[];
  resources: string[];
  estimatedTime: string;
  dependencies: string[];
  tags: string[];
}

export interface ScoutInsight {
  id: string;
  type: 'pattern' | 'trend' | 'anomaly' | 'opportunity' | 'risk';
  category: string;
  title: string;
  description: string;
  data: any;
  confidence: number;
  relevance: number;
  actionable: boolean;
  createdAt: Date;
}

export interface UseScoutOptions {
  // Auto-scanning options
  autoScanOnProjectOpen?: boolean;
  scanInterval?: number;
  incrementalScan?: boolean;
  
  // Scan configuration
  scanDepth?: 'shallow' | 'medium' | 'deep';
  includeTests?: boolean;
  includeDependencies?: boolean;
  includeDocumentation?: boolean;
  
  // Analysis options
  enableSecurity?: boolean;
  enablePerformance?: boolean;
  enableArchitecture?: boolean;
  enableQuality?: boolean;
  
  // Real-time options
  enableRealTimeAnalysis?: boolean;
  watchForChanges?: boolean;
  
  // Filtering options
  filePatterns?: string[];
  ignorePatterns?: string[];
  minSeverity?: ScoutFinding['severity'];
  
  // Callbacks
  onScanProgress?: (progress: number, status: string) => void;
  onScanComplete?: (result: ScoutScanResult) => void;
  onFindingFound?: (finding: ScoutFinding) => void;
  onInsightGenerated?: (insight: ScoutInsight) => void;
  onError?: (error: Error) => void;
}

export interface UseScoutResult {
  // Scan state
  currentScan: ScoutScanResult | null;
  scanHistory: ScoutScanResult[];
  isScanning: boolean;
  scanProgress: number;
  
  // Analysis results
  findings: ScoutFinding[];
  metrics: ScoutMetrics | null;
  recommendations: ScoutRecommendation[];
  insights: ScoutInsight[];
  
  // Filtering and sorting
  filteredFindings: ScoutFinding[];
  findingCounts: Record<string, number>;
  
  // Connection state
  isConnected: boolean;
  
  // Scan management
  startScan: (type?: ScoutScanResult['type'], options?: any) => Promise<ScoutScanResult>;
  cancelScan: () => Promise<void>;
  pauseScan: () => Promise<void>;
  resumeScan: () => Promise<void>;
  
  // Analysis actions
  analyzeFile: (filePath: string) => Promise<ScoutFinding[]>;
  analyzeFunction: (filePath: string, functionName: string) => Promise<ScoutFinding[]>;
  exploreProject: (projectId: string) => Promise<ScoutInsight[]>;
  
  // Finding management
  dismissFinding: (findingId: string) => void;
  fixFinding: (findingId: string) => Promise<void>;
  ignoreFinding: (findingId: string, reason?: string) => void;
  
  // Filtering and search
  filterFindings: (filters: any) => void;
  searchFindings: (query: string) => ScoutFinding[];
  groupFindingsByCategory: () => Record<string, ScoutFinding[]>;
  
  // Recommendations
  applyRecommendation: (recommendationId: string) => Promise<void>;
  dismissRecommendation: (recommendationId: string) => void;
  
  // Insights
  generateInsights: () => Promise<ScoutInsight[]>;
  refreshInsights: () => Promise<void>;
  
  // Export and reporting
  exportFindings: (format: 'json' | 'csv' | 'pdf' | 'html') => Promise<Blob>;
  generateReport: (template: string) => Promise<string>;
  
  // Configuration
  updateScanConfig: (config: Partial<UseScoutOptions>) => void;
  getScanConfig: () => UseScoutOptions;
}

interface ScoutState {
  currentScan: ScoutScanResult | null;
  scanHistory: ScoutScanResult[];
  findings: ScoutFinding[];
  metrics: ScoutMetrics | null;
  recommendations: ScoutRecommendation[];
  insights: ScoutInsight[];
  filteredFindings: ScoutFinding[];
  findingFilters: any;
  scanProgress: number;
  scanConfig: UseScoutOptions;
}

export function useScout(
  projectId: string | null,
  options: UseScoutOptions = {}
): UseScoutResult {
  const {
    autoScanOnProjectOpen = true,
    scanInterval = 0, // 0 = disabled
    incrementalScan = true,
    scanDepth = 'medium',
    includeTests = true,
    includeDependencies = true,
    includeDocumentation = true,
    enableSecurity = true,
    enablePerformance = true,
    enableArchitecture = true,
    enableQuality = true,
    enableRealTimeAnalysis = false,
    watchForChanges = true,
    filePatterns = ['**/*.{js,ts,jsx,tsx,py,java,c,cpp,cs,php,rb,go,rs}'],
    ignorePatterns = ['node_modules/**', '.git/**', 'dist/**', 'build/**', '**/*.min.js'],
    minSeverity = 'low',
    onScanProgress,
    onScanComplete,
    onFindingFound,
    onInsightGenerated,
    onError
  } = options;

  // State management
  const [state, setState] = useState<ScoutState>({
    currentScan: null,
    scanHistory: [],
    findings: [],
    metrics: null,
    recommendations: [],
    insights: [],
    filteredFindings: [],
    findingFilters: { severity: minSeverity },
    scanProgress: 0,
    scanConfig: options
  });

  // Service reference
  const scoutService = useRef(new ScoutSocketService());

  // WebSocket connection for real-time updates
  const {
    isConnected,
    sendJsonMessage,
    lastMessage
  } = useSocket(
    process.env.REACT_APP_SCOUT_WS_URL || 'ws://localhost:8000/ws/scout',
    {
      autoConnect: !!projectId,
      onMessage: handleSocketMessage,
      onError: (error) => onError?.(new Error(`Scout WebSocket error: ${error}`))
    }
  );

  // API hooks for Scout operations
  const { execute: startScanAPI, isLoading: isStartingScan } = useAPI(
    async (projectId: string, scanType: string, config: any) => {
      return scoutService.current.startScan(projectId, scanType, config);
    },
    { manual: true }
  );

  const { execute: getScanHistory } = useAPI(
    async (projectId: string) => {
      return scoutService.current.getScanHistory(projectId);
    },
    { manual: true }
  );

  const { execute: getFindings } = useAPI(
    async (scanId: string) => {
      return scoutService.current.getFindings(scanId);
    },
    { manual: true }
  );

  // Handle WebSocket messages
  function handleSocketMessage(data: any) {
    try {
      switch (data.type) {
        case 'scan_progress':
          handleScanProgress(data.payload);
          break;
        case 'scan_complete':
          handleScanComplete(data.payload);
          break;
        case 'finding_found':
          handleFindingFound(data.payload);
          break;
        case 'insight_generated':
          handleInsightGenerated(data.payload);
          break;
        case 'scan_error':
          handleScanError(data.payload);
          break;
        case 'metrics_updated':
          handleMetricsUpdate(data.payload);
          break;
        default:
          console.warn('Unknown Scout message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling Scout socket message:', error);
      onError?.(error as Error);
    }
  }

  // Handle scan progress updates
  const handleScanProgress = useCallback((progressData: any) => {
    const progress = progressData.progress || 0;
    
    setState(prev => ({
      ...prev,
      scanProgress: progress,
      currentScan: prev.currentScan ? {
        ...prev.currentScan,
        progress,
        scannedFiles: progressData.scannedFiles || prev.currentScan.scannedFiles,
        status: progressData.status || prev.currentScan.status
      } : null
    }));
    
    onScanProgress?.(progress, progressData.status || 'running');
  }, [onScanProgress]);

  // Handle scan completion
  const handleScanComplete = useCallback((scanData: any) => {
    const scan: ScoutScanResult = {
      ...scanData,
      startTime: new Date(scanData.startTime),
      endTime: new Date(scanData.endTime),
      findings: scanData.findings.map((f: any) => ({
        ...f,
        createdAt: new Date(f.createdAt)
      }))
    };
    
    setState(prev => ({
      ...prev,
      currentScan: scan,
      scanHistory: [scan, ...prev.scanHistory],
      findings: scan.findings,
      metrics: scan.metrics,
      recommendations: scan.recommendations,
      scanProgress: 100
    }));
    
    // Apply current filters
    applyFilters(scan.findings);
    
    onScanComplete?.(scan);
  }, [onScanComplete]);

  // Handle new finding
  const handleFindingFound = useCallback((findingData: any) => {
    const finding: ScoutFinding = {
      ...findingData,
      createdAt: new Date(findingData.createdAt)
    };
    
    setState(prev => ({
      ...prev,
      findings: [...prev.findings, finding]
    }));
    
    // Check if finding passes current filters
    if (passesFindingFilters(finding, state.findingFilters)) {
      setState(prev => ({
        ...prev,
        filteredFindings: [...prev.filteredFindings, finding]
      }));
    }
    
    onFindingFound?.(finding);
  }, [onFindingFound, state.findingFilters]);

  // Handle insight generation
  const handleInsightGenerated = useCallback((insightData: any) => {
    const insight: ScoutInsight = {
      ...insightData,
      createdAt: new Date(insightData.createdAt)
    };
    
    setState(prev => ({
      ...prev,
      insights: [...prev.insights, insight]
    }));
    
    onInsightGenerated?.(insight);
  }, [onInsightGenerated]);

  // Handle scan errors
  const handleScanError = useCallback((errorData: any) => {
    setState(prev => ({
      ...prev,
      currentScan: prev.currentScan ? {
        ...prev.currentScan,
        status: 'failed',
        errors: [...prev.currentScan.errors, errorData.message]
      } : null
    }));
    
    onError?.(new Error(errorData.message));
  }, [onError]);

  // Handle metrics updates
  const handleMetricsUpdate = useCallback((metricsData: any) => {
    setState(prev => ({
      ...prev,
      metrics: metricsData
    }));
  }, []);

  // Check if finding passes filters
  const passesFindingFilters = useCallback((finding: ScoutFinding, filters: any): boolean => {
    // Severity filter
    if (filters.severity) {
      const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
      const minSeverityLevel = severityOrder[filters.severity as keyof typeof severityOrder];
      const findingSeverityLevel = severityOrder[finding.severity];
      
      if (findingSeverityLevel < minSeverityLevel) {
        return false;
      }
    }
    
    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(finding.category)) {
        return false;
      }
    }
    
    // Type filter
    if (filters.types && filters.types.length > 0) {
      if (!filters.types.includes(finding.type)) {
        return false;
      }
    }
    
    // File filter
    if (filters.files && filters.files.length > 0) {
      if (!finding.file || !filters.files.some((pattern: string) => 
        finding.file!.includes(pattern))) {
        return false;
      }
    }
    
    return true;
  }, []);

  // Apply filters to findings
  const applyFilters = useCallback((findings: ScoutFinding[] = state.findings) => {
    const filtered = findings.filter(finding => 
      passesFindingFilters(finding, state.findingFilters)
    );
    
    setState(prev => ({
      ...prev,
      filteredFindings: filtered
    }));
  }, [state.findings, state.findingFilters, passesFindingFilters]);

  // Start scan
  const startScan = useCallback(async (
    type: ScoutScanResult['type'] = 'full',
    scanOptions: any = {}
  ): Promise<ScoutScanResult> => {
    if (!projectId) {
      throw new Error('No project ID provided');
    }
    
    try {
      const scanConfig = {
        type,
        depth: scanDepth,
        includeTests,
        includeDependencies,
        includeDocumentation,
        enableSecurity,
        enablePerformance,
        enableArchitecture,
        enableQuality,
        filePatterns,
        ignorePatterns,
        ...scanOptions
      };
      
      const scan = await startScanAPI(projectId, type, scanConfig);
      
      setState(prev => ({
        ...prev,
        currentScan: scan,
        scanProgress: 0,
        findings: [],
        filteredFindings: []
      }));
      
      // Send WebSocket command to start real-time updates
      if (isConnected) {
        sendJsonMessage({
          type: 'subscribe_scan',
          payload: { scanId: scan.id }
        });
      }
      
      return scan;
    } catch (error) {
      onError?.(error as Error);
      throw error;
    }
  }, [projectId, scanDepth, includeTests, includeDependencies, includeDocumentation, enableSecurity, enablePerformance, enableArchitecture, enableQuality, filePatterns, ignorePatterns, startScanAPI, isConnected, sendJsonMessage, onError]);

  // Cancel scan
  const cancelScan = useCallback(async () => {
    if (!state.currentScan) {
      return;
    }
    
    if (isConnected) {
      sendJsonMessage({
        type: 'cancel_scan',
        payload: { scanId: state.currentScan.id }
      });
    }
    
    setState(prev => ({
      ...prev,
      currentScan: prev.currentScan ? {
        ...prev.currentScan,
        status: 'cancelled'
      } : null
    }));
  }, [state.currentScan, isConnected, sendJsonMessage]);

  // Filter findings
  const filterFindings = useCallback((filters: any) => {
    setState(prev => ({
      ...prev,
      findingFilters: { ...prev.findingFilters, ...filters }
    }));
    
    // Apply filters will be triggered by useEffect
  }, []);

  // Search findings
  const searchFindings = useCallback((query: string): ScoutFinding[] => {
    const lowerQuery = query.toLowerCase();
    return state.findings.filter(finding =>
      finding.title.toLowerCase().includes(lowerQuery) ||
      finding.description.toLowerCase().includes(lowerQuery) ||
      finding.file?.toLowerCase().includes(lowerQuery) ||
      finding.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }, [state.findings]);

  // Group findings by category
  const groupFindingsByCategory = useCallback((): Record<string, ScoutFinding[]> => {
    return state.filteredFindings.reduce((groups, finding) => {
      const category = finding.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(finding);
      return groups;
    }, {} as Record<string, ScoutFinding[]>);
  }, [state.filteredFindings]);

  // Calculate finding counts
  const calculateFindingCounts = useCallback((): Record<string, number> => {
    const counts = {
      total: state.findings.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      security: 0,
      performance: 0,
      maintainability: 0,
      architecture: 0
    };
    
    state.findings.forEach(finding => {
      counts[finding.severity]++;
      counts[finding.category]++;
    });
    
    return counts;
  }, [state.findings]);

  // Auto-scan on project change
  useEffect(() => {
    if (projectId && autoScanOnProjectOpen && isConnected) {
      startScan('incremental');
    }
  }, [projectId, autoScanOnProjectOpen, isConnected, startScan]);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [state.findingFilters, applyFilters]);

  // Load scan history when project changes
  useEffect(() => {
    if (projectId) {
      getScanHistory(projectId).then(history => {
        setState(prev => ({
          ...prev,
          scanHistory: history || []
        }));
      }).catch(error => {
        console.error('Failed to load scan history:', error);
      });
    }
  }, [projectId, getScanHistory]);

  return {
    // Scan state
    currentScan: state.currentScan,
    scanHistory: state.scanHistory,
    isScanning: state.currentScan?.status === 'running' || isStartingScan,
    scanProgress: state.scanProgress,
    
    // Analysis results
    findings: state.findings,
    metrics: state.metrics,
    recommendations: state.recommendations,
    insights: state.insights,
    
    // Filtering and sorting
    filteredFindings: state.filteredFindings,
    findingCounts: calculateFindingCounts(),
    
    // Connection state
    isConnected,
    
    // Scan management
    startScan,
    cancelScan,
    pauseScan: async () => { throw new Error('Not implemented'); },
    resumeScan: async () => { throw new Error('Not implemented'); },
    
    // Analysis actions
    analyzeFile: async () => { throw new Error('Not implemented'); },
    analyzeFunction: async () => { throw new Error('Not implemented'); },
    exploreProject: async () => { throw new Error('Not implemented'); },
    
    // Finding management
    dismissFinding: () => { throw new Error('Not implemented'); },
    fixFinding: async () => { throw new Error('Not implemented'); },
    ignoreFinding: () => { throw new Error('Not implemented'); },
    
    // Filtering and search
    filterFindings,
    searchFindings,
    groupFindingsByCategory,
    
    // Recommendations
    applyRecommendation: async () => { throw new Error('Not implemented'); },
    dismissRecommendation: () => { throw new Error('Not implemented'); },
    
    // Insights
    generateInsights: async () => { throw new Error('Not implemented'); },
    refreshInsights: async () => { throw new Error('Not implemented'); },
    
    // Export and reporting
    exportFindings: async () => { throw new Error('Not implemented'); },
    generateReport: async () => { throw new Error('Not implemented'); },
    
    // Configuration
    updateScanConfig: (config) => {
      setState(prev => ({
        ...prev,
        scanConfig: { ...prev.scanConfig, ...config }
      }));
    },
    getScanConfig: () => state.scanConfig
  };
}
