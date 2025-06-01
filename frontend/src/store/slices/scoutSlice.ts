/**
 * @fileoverview Scout slice for Redux store
 * @version 1.0.0
 * @author Podplay Sanctuary Team
 * 
 * Manages Scout AI state including:
 * - Codebase analysis and insights
 * - Code quality metrics and recommendations
 * - Pattern detection and optimization suggestions
 * - Real-time code intelligence
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

/**
 * Code insight interface
 */
export interface CodeInsight {
  id: string;
  type: 'suggestion' | 'warning' | 'error' | 'info' | 'performance' | 'security';
  title: string;
  description: string;
  file: string;
  line?: number;
  column?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  tags: string[];
  confidence: number;
  autoFixable: boolean;
  fixSuggestion?: string;
  relatedFiles?: string[];
  documentation?: string;
  createdAt: number;
  updatedAt: number;
  status: 'active' | 'dismissed' | 'fixed' | 'ignored';
}

/**
 * Code pattern interface
 */
export interface CodePattern {
  id: string;
  name: string;
  description: string;
  pattern: string;
  category: 'design' | 'performance' | 'security' | 'maintainability';
  occurrences: {
    file: string;
    line: number;
    context: string;
  }[];
  impact: 'positive' | 'negative' | 'neutral';
  recommendation?: string;
  examples?: string[];
}

/**
 * Analysis result interface
 */
export interface AnalysisResult {
  id: string;
  projectPath: string;
  timestamp: number;
  duration: number;
  filesAnalyzed: number;
  linesAnalyzed: number;
  insights: CodeInsight[];
  patterns: CodePattern[];
  metrics: {
    complexity: number;
    maintainability: number;
    testCoverage: number;
    duplicateCode: number;
    techDebt: number;
    security: number;
  };
  summary: {
    totalIssues: number;
    criticalIssues: number;
    fixableIssues: number;
    newIssues: number;
    resolvedIssues: number;
  };
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    effort: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
  }[];
}

/**
 * File analysis interface
 */
export interface FileAnalysis {
  path: string;
  language: string;
  size: number;
  lines: number;
  functions: number;
  classes: number;
  complexity: number;
  maintainabilityIndex: number;
  duplicateBlocks: number;
  testCoverage: number;
  lastAnalyzed: number;
  insights: CodeInsight[];
  dependencies: string[];
  exports: string[];
  imports: string[];
}

/**
 * Scout configuration interface
 */
export interface ScoutConfig {
  analysisDepth: 'quick' | 'standard' | 'deep';
  enabledRules: string[];
  ignoredPaths: string[];
  customRules: {
    id: string;
    name: string;
    pattern: string;
    message: string;
    severity: CodeInsight['severity'];
  }[];
  autoFix: boolean;
  realTimeAnalysis: boolean;
  maxFileSize: number;
  maxFiles: number;
  parallelAnalysis: boolean;
}

/**
 * Scout state interface
 */
export interface ScoutState {
  // Analysis state
  isAnalyzing: boolean;
  currentAnalysis: {
    id: string;
    progress: number;
    currentFile: string;
    stage: 'scanning' | 'analyzing' | 'processing' | 'generating';
    startTime: number;
  } | null;
  
  // Analysis results
  currentResult: AnalysisResult | null;
  analysisHistory: AnalysisResult[];
  fileAnalyses: Record<string, FileAnalysis>;
  
  // Insights and patterns
  activeInsights: CodeInsight[];
  filteredInsights: CodeInsight[];
  dismissedInsights: string[];
  patterns: CodePattern[];
  
  // Real-time analysis
  realtimeEnabled: boolean;
  watchedFiles: string[];
  pendingFiles: string[];
  
  // Filters and sorting
  filters: {
    severity: CodeInsight['severity'][];
    type: CodeInsight['type'][];
    category: string[];
    status: CodeInsight['status'][];
    files: string[];
  };
  sortBy: 'severity' | 'type' | 'file' | 'date' | 'confidence';
  sortOrder: 'asc' | 'desc';
  searchQuery: string;
  
  // Configuration
  config: ScoutConfig;
  
  // UI state
  selectedInsight: string | null;
  expandedCategories: Record<string, boolean>;
  showDismissed: boolean;
  groupBy: 'none' | 'file' | 'type' | 'severity' | 'category';
  
  // Statistics
  stats: {
    totalAnalyses: number;
    totalInsights: number;
    insightsByType: Record<string, number>;
    insightsBySeverity: Record<string, number>;
    trendsOverTime: {
      date: string;
      totalIssues: number;
      criticalIssues: number;
      fixedIssues: number;
    }[];
  };
  
  // Performance metrics
  performance: {
    averageAnalysisTime: number;
    filesPerSecond: number;
    memoryUsage: number;
    cacheHitRate: number;
  };
  
  // Error handling
  error: string | null;
  warnings: string[];
  
  // Loading states
  isLoading: boolean;
  isGeneratingReport: boolean;
  isSavingConfig: boolean;
}

/**
 * Initial state
 */
const initialState: ScoutState = {
  isAnalyzing: false,
  currentAnalysis: null,
  
  currentResult: null,
  analysisHistory: [],
  fileAnalyses: {},
  
  activeInsights: [],
  filteredInsights: [],
  dismissedInsights: [],
  patterns: [],
  
  realtimeEnabled: true,
  watchedFiles: [],
  pendingFiles: [],
  
  filters: {
    severity: ['high', 'critical'],
    type: [],
    category: [],
    status: ['active'],
    files: [],
  },
  sortBy: 'severity',
  sortOrder: 'desc',
  searchQuery: '',
  
  config: {
    analysisDepth: 'standard',
    enabledRules: [],
    ignoredPaths: ['node_modules', '.git', 'dist', 'build'],
    customRules: [],
    autoFix: false,
    realTimeAnalysis: true,
    maxFileSize: 1024 * 1024, // 1MB
    maxFiles: 1000,
    parallelAnalysis: true,
  },
  
  selectedInsight: null,
  expandedCategories: {},
  showDismissed: false,
  groupBy: 'severity',
  
  stats: {
    totalAnalyses: 0,
    totalInsights: 0,
    insightsByType: {},
    insightsBySeverity: {},
    trendsOverTime: [],
  },
  
  performance: {
    averageAnalysisTime: 0,
    filesPerSecond: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
  },
  
  error: null,
  warnings: [],
  
  isLoading: false,
  isGeneratingReport: false,
  isSavingConfig: false,
};

/**
 * Async thunks for Scout operations
 */

// Start full codebase analysis
export const startAnalysis = createAsyncThunk(
  'scout/startAnalysis',
  async (payload: {
    projectPath: string;
    config?: Partial<ScoutConfig>;
  }, { getState, rejectWithValue }) => {
    try {
      // This would integrate with the Scout service
      // For now, simulate analysis
      const analysisId = `analysis_${Date.now()}`;
      
      return {
        id: analysisId,
        projectPath: payload.projectPath,
        config: payload.config,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to start analysis');
    }
  }
);

// Analyze single file
export const analyzeFile = createAsyncThunk(
  'scout/analyzeFile',
  async (filePath: string, { rejectWithValue }) => {
    try {
      // This would integrate with the Scout service
      // For now, return mock analysis
      const analysis: FileAnalysis = {
        path: filePath,
        language: getLanguageFromPath(filePath),
        size: 1024,
        lines: 100,
        functions: 5,
        classes: 1,
        complexity: 3.2,
        maintainabilityIndex: 75,
        duplicateBlocks: 0,
        testCoverage: 80,
        lastAnalyzed: Date.now(),
        insights: [],
        dependencies: [],
        exports: [],
        imports: [],
      };
      
      return analysis;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to analyze file');
    }
  }
);

// Apply auto-fix
export const applyAutoFix = createAsyncThunk(
  'scout/applyAutoFix',
  async (insightId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { scout: ScoutState };
      const insight = state.scout.activeInsights.find(i => i.id === insightId);
      
      if (!insight || !insight.autoFixable) {
        throw new Error('Insight not found or not auto-fixable');
      }
      
      // This would integrate with file modification service
      // For now, just mark as fixed
      return {
        insightId,
        applied: true,
        changes: insight.fixSuggestion || 'Auto-fix applied',
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to apply auto-fix');
    }
  }
);

// Generate analysis report
export const generateReport = createAsyncThunk(
  'scout/generateReport',
  async (payload: {
    format: 'json' | 'html' | 'pdf' | 'markdown';
    includeCode: boolean;
    analysisId?: string;
  }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { scout: ScoutState };
      const analysis = payload.analysisId 
        ? state.scout.analysisHistory.find(a => a.id === payload.analysisId)
        : state.scout.currentResult;
      
      if (!analysis) {
        throw new Error('No analysis available for report generation');
      }
      
      // This would integrate with report generation service
      const report = {
        format: payload.format,
        content: 'Generated report content',
        downloadUrl: `report_${analysis.id}.${payload.format}`,
        generatedAt: Date.now(),
      };
      
      return report;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to generate report');
    }
  }
);

// Load configuration
export const loadConfig = createAsyncThunk(
  'scout/loadConfig',
  async (projectPath: string, { rejectWithValue }) => {
    try {
      // This would load from .scoutrc or similar config file
      const config: Partial<ScoutConfig> = {
        analysisDepth: 'standard',
        enabledRules: ['complexity', 'security', 'performance'],
        realTimeAnalysis: true,
      };
      
      return config;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load configuration');
    }
  }
);

/**
 * Helper function to determine language from file path
 */
function getLanguageFromPath(path: string): string {
  const extension = path.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    cs: 'csharp',
    php: 'php',
    rb: 'ruby',
    go: 'go',
    rs: 'rust',
  };
  
  return languageMap[extension || ''] || 'unknown';
}

/**
 * Scout slice
 */
export const scoutSlice = createSlice({
  name: 'scout',
  initialState,
  reducers: {
    // Analysis control
    stopAnalysis: (state) => {
      state.isAnalyzing = false;
      state.currentAnalysis = null;
    },
    
    updateAnalysisProgress: (state, action: PayloadAction<{
      progress: number;
      currentFile: string;
      stage: ScoutState['currentAnalysis']['stage'];
    }>) => {
      if (state.currentAnalysis) {
        state.currentAnalysis.progress = action.payload.progress;
        state.currentAnalysis.currentFile = action.payload.currentFile;
        state.currentAnalysis.stage = action.payload.stage;
      }
    },
    
    // Insight management
    selectInsight: (state, action: PayloadAction<string | null>) => {
      state.selectedInsight = action.payload;
    },
    
    dismissInsight: (state, action: PayloadAction<string>) => {
      const insightId = action.payload;
      
      // Add to dismissed list
      if (!state.dismissedInsights.includes(insightId)) {
        state.dismissedInsights.push(insightId);
      }
      
      // Update insight status
      const insight = state.activeInsights.find(i => i.id === insightId);
      if (insight) {
        insight.status = 'dismissed';
      }
      
      // Update filtered insights
      state.filteredInsights = state.filteredInsights.filter(
        i => i.id !== insightId
      );
    },
    
    undismissInsight: (state, action: PayloadAction<string>) => {
      const insightId = action.payload;
      
      // Remove from dismissed list
      state.dismissedInsights = state.dismissedInsights.filter(
        id => id !== insightId
      );
      
      // Update insight status
      const insight = state.activeInsights.find(i => i.id === insightId);
      if (insight) {
        insight.status = 'active';
      }
      
      // Re-apply filters to include this insight
      applyFilters(state);
    },
    
    markInsightAsFixed: (state, action: PayloadAction<string>) => {
      const insightId = action.payload;
      const insight = state.activeInsights.find(i => i.id === insightId);
      
      if (insight) {
        insight.status = 'fixed';
        insight.updatedAt = Date.now();
      }
    },
    
    // Filters and sorting
    setFilters: (state, action: PayloadAction<Partial<ScoutState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      applyFilters(state);
    },
    
    setSortBy: (state, action: PayloadAction<ScoutState['sortBy']>) => {
      state.sortBy = action.payload;
      applySorting(state);
    },
    
    setSortOrder: (state, action: PayloadAction<ScoutState['sortOrder']>) => {
      state.sortOrder = action.payload;
      applySorting(state);
    },
    
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      applyFilters(state);
    },
    
    clearFilters: (state) => {
      state.filters = {
        severity: [],
        type: [],
        category: [],
        status: ['active'],
        files: [],
      };
      state.searchQuery = '';
      applyFilters(state);
    },
    
    // UI state
    setGroupBy: (state, action: PayloadAction<ScoutState['groupBy']>) => {
      state.groupBy = action.payload;
    },
    
    toggleCategoryExpansion: (state, action: PayloadAction<string>) => {
      const category = action.payload;
      state.expandedCategories[category] = !state.expandedCategories[category];
    },
    
    toggleShowDismissed: (state) => {
      state.showDismissed = !state.showDismissed;
      applyFilters(state);
    },
    
    // Real-time analysis
    toggleRealtimeAnalysis: (state) => {
      state.realtimeEnabled = !state.realtimeEnabled;
      state.config.realTimeAnalysis = state.realtimeEnabled;
    },
    
    addWatchedFile: (state, action: PayloadAction<string>) => {
      const filePath = action.payload;
      if (!state.watchedFiles.includes(filePath)) {
        state.watchedFiles.push(filePath);
      }
    },
    
    removeWatchedFile: (state, action: PayloadAction<string>) => {
      const filePath = action.payload;
      state.watchedFiles = state.watchedFiles.filter(f => f !== filePath);
    },
    
    addPendingFile: (state, action: PayloadAction<string>) => {
      const filePath = action.payload;
      if (!state.pendingFiles.includes(filePath)) {
        state.pendingFiles.push(filePath);
      }
    },
    
    removePendingFile: (state, action: PayloadAction<string>) => {
      const filePath = action.payload;
      state.pendingFiles = state.pendingFiles.filter(f => f !== filePath);
    },
    
    // Configuration
    updateConfig: (state, action: PayloadAction<Partial<ScoutConfig>>) => {
      state.config = { ...state.config, ...action.payload };
    },
    
    addCustomRule: (state, action: PayloadAction<ScoutConfig['customRules'][0]>) => {
      state.config.customRules.push(action.payload);
    },
    
    removeCustomRule: (state, action: PayloadAction<string>) => {
      const ruleId = action.payload;
      state.config.customRules = state.config.customRules.filter(
        rule => rule.id !== ruleId
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
    
    clearWarnings: (state) => {
      state.warnings = [];
    },
    
    // Statistics
    updateStats: (state, action: PayloadAction<Partial<ScoutState['stats']>>) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    
    updatePerformance: (state, action: PayloadAction<Partial<ScoutState['performance']>>) => {
      state.performance = { ...state.performance, ...action.payload };
    },
  },
  
  extraReducers: (builder) => {
    // Start analysis
    builder
      .addCase(startAnalysis.pending, (state) => {
        state.isAnalyzing = true;
        state.error = null;
      })
      .addCase(startAnalysis.fulfilled, (state, action) => {
        const { id, projectPath } = action.payload;
        
        state.currentAnalysis = {
          id,
          progress: 0,
          currentFile: '',
          stage: 'scanning',
          startTime: Date.now(),
        };
      })
      .addCase(startAnalysis.rejected, (state, action) => {
        state.isAnalyzing = false;
        state.error = action.payload as string;
      });
    
    // Analyze file
    builder
      .addCase(analyzeFile.fulfilled, (state, action) => {
        const analysis = action.payload;
        state.fileAnalyses[analysis.path] = analysis;
      })
      .addCase(analyzeFile.rejected, (state, action) => {
        state.error = action.payload as string;
      });
    
    // Apply auto-fix
    builder
      .addCase(applyAutoFix.fulfilled, (state, action) => {
        const { insightId } = action.payload;
        const insight = state.activeInsights.find(i => i.id === insightId);
        
        if (insight) {
          insight.status = 'fixed';
          insight.updatedAt = Date.now();
        }
      })
      .addCase(applyAutoFix.rejected, (state, action) => {
        state.error = action.payload as string;
      });
    
    // Generate report
    builder
      .addCase(generateReport.pending, (state) => {
        state.isGeneratingReport = true;
      })
      .addCase(generateReport.fulfilled, (state) => {
        state.isGeneratingReport = false;
      })
      .addCase(generateReport.rejected, (state, action) => {
        state.isGeneratingReport = false;
        state.error = action.payload as string;
      });
    
    // Load configuration
    builder
      .addCase(loadConfig.fulfilled, (state, action) => {
        state.config = { ...state.config, ...action.payload };
      });
  },
});

/**
 * Helper function to apply filters to insights
 */
function applyFilters(state: ScoutState) {
  let filtered = [...state.activeInsights];
  
  // Apply severity filter
  if (state.filters.severity.length > 0) {
    filtered = filtered.filter(insight => 
      state.filters.severity.includes(insight.severity)
    );
  }
  
  // Apply type filter
  if (state.filters.type.length > 0) {
    filtered = filtered.filter(insight => 
      state.filters.type.includes(insight.type)
    );
  }
  
  // Apply category filter
  if (state.filters.category.length > 0) {
    filtered = filtered.filter(insight => 
      state.filters.category.includes(insight.category)
    );
  }
  
  // Apply status filter
  if (state.filters.status.length > 0) {
    filtered = filtered.filter(insight => 
      state.filters.status.includes(insight.status)
    );
  }
  
  // Apply file filter
  if (state.filters.files.length > 0) {
    filtered = filtered.filter(insight => 
      state.filters.files.includes(insight.file)
    );
  }
  
  // Apply search query
  if (state.searchQuery.trim()) {
    const query = state.searchQuery.toLowerCase();
    filtered = filtered.filter(insight => 
      insight.title.toLowerCase().includes(query) ||
      insight.description.toLowerCase().includes(query) ||
      insight.file.toLowerCase().includes(query) ||
      insight.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }
  
  // Apply dismissed filter
  if (!state.showDismissed) {
    filtered = filtered.filter(insight => insight.status !== 'dismissed');
  }
  
  state.filteredInsights = filtered;
  applySorting(state);
}

/**
 * Helper function to apply sorting to filtered insights
 */
function applySorting(state: ScoutState) {
  const sortMultiplier = state.sortOrder === 'asc' ? 1 : -1;
  
  state.filteredInsights.sort((a, b) => {
    switch (state.sortBy) {
      case 'severity':
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return (severityOrder[a.severity] - severityOrder[b.severity]) * sortMultiplier;
      
      case 'type':
        return a.type.localeCompare(b.type) * sortMultiplier;
      
      case 'file':
        return a.file.localeCompare(b.file) * sortMultiplier;
      
      case 'date':
        return (a.updatedAt - b.updatedAt) * sortMultiplier;
      
      case 'confidence':
        return (a.confidence - b.confidence) * sortMultiplier;
      
      default:
        return 0;
    }
  });
}

// Export actions
export const {
  stopAnalysis,
  updateAnalysisProgress,
  selectInsight,
  dismissInsight,
  undismissInsight,
  markInsightAsFixed,
  setFilters,
  setSortBy,
  setSortOrder,
  setSearchQuery,
  clearFilters,
  setGroupBy,
  toggleCategoryExpansion,
  toggleShowDismissed,
  toggleRealtimeAnalysis,
  addWatchedFile,
  removeWatchedFile,
  addPendingFile,
  removePendingFile,
  updateConfig,
  addCustomRule,
  removeCustomRule,
  clearError,
  addWarning,
  clearWarnings,
  updateStats,
  updatePerformance,
} = scoutSlice.actions;

// Export selectors
export const selectCurrentAnalysis = (state: { scout: ScoutState }) => 
  state.scout.currentAnalysis;

export const selectFilteredInsights = (state: { scout: ScoutState }) => 
  state.scout.filteredInsights;

export const selectSelectedInsight = (state: { scout: ScoutState }) => {
  const { selectedInsight, activeInsights } = state.scout;
  return selectedInsight ? activeInsights.find(i => i.id === selectedInsight) : null;
};

export const selectInsightsByFile = (state: { scout: ScoutState }) => {
  const { filteredInsights } = state.scout;
  const grouped: Record<string, CodeInsight[]> = {};
  
  filteredInsights.forEach(insight => {
    if (!grouped[insight.file]) {
      grouped[insight.file] = [];
    }
    grouped[insight.file].push(insight);
  });
  
  return grouped;
};

export const selectInsightsBySeverity = (state: { scout: ScoutState }) => {
  const { filteredInsights } = state.scout;
  const grouped: Record<string, CodeInsight[]> = {};
  
  filteredInsights.forEach(insight => {
    if (!grouped[insight.severity]) {
      grouped[insight.severity] = [];
    }
    grouped[insight.severity].push(insight);
  });
  
  return grouped;
};

export const selectAnalysisProgress = (state: { scout: ScoutState }) => {
  const { currentAnalysis, isAnalyzing } = state.scout;
  return {
    isAnalyzing,
    progress: currentAnalysis?.progress || 0,
    currentFile: currentAnalysis?.currentFile || '',
    stage: currentAnalysis?.stage || 'scanning',
  };
};

export const selectScoutConfig = (state: { scout: ScoutState }) => 
  state.scout.config;

export const selectScoutStats = (state: { scout: ScoutState }) => 
  state.scout.stats;

export const selectScoutPerformance = (state: { scout: ScoutState }) => 
  state.scout.performance;

// Export reducer
export default scoutSlice.reducer;
