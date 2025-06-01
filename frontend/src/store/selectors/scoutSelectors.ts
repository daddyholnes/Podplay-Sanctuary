/**
 * Scout State Selectors
 * 
 * Specialized selectors for AI-powered code analysis, insights,
 * suggestions, and codebase intelligence features.
 * Optimized with memoization for performance.
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import type { 
  ScoutState, 
  Analysis, 
  Insight, 
  Suggestion, 
  CodeMetrics,
  ScoutSettings,
  AnalysisFilter,
  InsightFilter
} from '../slices/scoutSlice';

// Base scout selector
export const selectScout = (state: RootState): ScoutState => state.scout;

// Analysis selectors
export const selectAnalyses = createSelector(
  [selectScout],
  (scout) => scout.analyses
);

export const selectActiveAnalysisId = createSelector(
  [selectScout],
  (scout) => scout.activeAnalysisId
);

export const selectActiveAnalysis = createSelector(
  [selectAnalyses, selectActiveAnalysisId],
  (analyses, activeId) => 
    activeId ? analyses.find(analysis => analysis.id === activeId) || null : null
);

export const selectAnalysisById = createSelector(
  [selectAnalyses, (_: RootState, analysisId: string) => analysisId],
  (analyses, analysisId) => 
    analyses.find(analysis => analysis.id === analysisId) || null
);

export const selectRecentAnalyses = createSelector(
  [selectAnalyses],
  (analyses) => 
    [...analyses]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10)
);

export const selectAnalysesByType = createSelector(
  [selectAnalyses, (_: RootState, type: string) => type],
  (analyses, type) => analyses.filter(analysis => analysis.type === type)
);

export const selectAnalysesByStatus = createSelector(
  [selectAnalyses, (_: RootState, status: string) => status],
  (analyses, status) => analyses.filter(analysis => analysis.status === status)
);

export const selectRunningAnalyses = createSelector(
  [selectAnalyses],
  (analyses) => analyses.filter(analysis => analysis.status === 'running')
);

export const selectCompletedAnalyses = createSelector(
  [selectAnalyses],
  (analyses) => analyses.filter(analysis => analysis.status === 'completed')
);

export const selectFailedAnalyses = createSelector(
  [selectAnalyses],
  (analyses) => analyses.filter(analysis => analysis.status === 'failed')
);

// Insight selectors
export const selectInsights = createSelector(
  [selectScout],
  (scout) => scout.insights
);

export const selectInsightsByType = createSelector(
  [selectInsights, (_: RootState, type: string) => type],
  (insights, type) => insights.filter(insight => insight.type === type)
);

export const selectInsightsBySeverity = createSelector(
  [selectInsights, (_: RootState, severity: string) => severity],
  (insights, severity) => insights.filter(insight => insight.severity === severity)
);

export const selectCriticalInsights = createSelector(
  [selectInsights],
  (insights) => insights.filter(insight => insight.severity === 'critical')
);

export const selectHighPriorityInsights = createSelector(
  [selectInsights],
  (insights) => insights.filter(insight => 
    insight.severity === 'critical' || insight.severity === 'high'
  )
);

export const selectNewInsights = createSelector(
  [selectInsights],
  (insights) => insights.filter(insight => !insight.isRead)
);

export const selectInsightsByFile = createSelector(
  [selectInsights, (_: RootState, filePath: string) => filePath],
  (insights, filePath) => insights.filter(insight => 
    insight.location?.file === filePath
  )
);

export const selectInsightsByTag = createSelector(
  [selectInsights, (_: RootState, tag: string) => tag],
  (insights, tag) => insights.filter(insight => 
    insight.tags.includes(tag)
  )
);

// Suggestion selectors
export const selectSuggestions = createSelector(
  [selectScout],
  (scout) => scout.suggestions
);

export const selectSuggestionsByType = createSelector(
  [selectSuggestions, (_: RootState, type: string) => type],
  (suggestions, type) => suggestions.filter(suggestion => suggestion.type === type)
);

export const selectSuggestionsByPriority = createSelector(
  [selectSuggestions, (_: RootState, priority: string) => priority],
  (suggestions, priority) => suggestions.filter(suggestion => suggestion.priority === priority)
);

export const selectActiveSuggestions = createSelector(
  [selectSuggestions],
  (suggestions) => suggestions.filter(suggestion => !suggestion.isDismissed)
);

export const selectImplementedSuggestions = createSelector(
  [selectSuggestions],
  (suggestions) => suggestions.filter(suggestion => suggestion.isImplemented)
);

export const selectSuggestionsByFile = createSelector(
  [selectSuggestions, (_: RootState, filePath: string) => filePath],
  (suggestions, filePath) => suggestions.filter(suggestion => 
    suggestion.location?.file === filePath
  )
);

export const selectAutoFixableSuggestions = createSelector(
  [selectSuggestions],
  (suggestions) => suggestions.filter(suggestion => suggestion.canAutoFix)
);

// Code metrics selectors
export const selectCodeMetrics = createSelector(
  [selectScout],
  (scout) => scout.codeMetrics
);

export const selectOverallMetrics = createSelector(
  [selectCodeMetrics],
  (metrics) => metrics.overall
);

export const selectFileMetrics = createSelector(
  [selectCodeMetrics],
  (metrics) => metrics.files
);

export const selectMetricsByFile = createSelector(
  [selectFileMetrics, (_: RootState, filePath: string) => filePath],
  (fileMetrics, filePath) => fileMetrics[filePath] || null
);

export const selectComplexityMetrics = createSelector(
  [selectOverallMetrics],
  (overall) => ({
    cyclomaticComplexity: overall.cyclomaticComplexity,
    cognitiveComplexity: overall.cognitiveComplexity,
    maintainabilityIndex: overall.maintainabilityIndex
  })
);

export const selectQualityMetrics = createSelector(
  [selectOverallMetrics],
  (overall) => ({
    codeQuality: overall.codeQuality,
    testCoverage: overall.testCoverage,
    duplication: overall.duplication,
    technicalDebt: overall.technicalDebt
  })
);

export const selectPerformanceMetrics = createSelector(
  [selectOverallMetrics],
  (overall) => ({
    performanceScore: overall.performanceScore,
    bundleSize: overall.bundleSize,
    loadTime: overall.loadTime
  })
);

// Settings selectors
export const selectScoutSettings = createSelector(
  [selectScout],
  (scout) => scout.settings
);

export const selectAnalysisSettings = createSelector(
  [selectScoutSettings],
  (settings) => settings.analysis
);

export const selectInsightSettings = createSelector(
  [selectScoutSettings],
  (settings) => settings.insights
);

export const selectSuggestionSettings = createSelector(
  [selectScoutSettings],
  (settings) => settings.suggestions
);

export const selectNotificationSettings = createSelector(
  [selectScoutSettings],
  (settings) => settings.notifications
);

// Filter selectors
export const selectAnalysisFilter = createSelector(
  [selectScout],
  (scout) => scout.analysisFilter
);

export const selectInsightFilter = createSelector(
  [selectScout],
  (scout) => scout.insightFilter
);

export const selectFilteredAnalyses = createSelector(
  [selectAnalyses, selectAnalysisFilter],
  (analyses, filter) => {
    if (!filter) return analyses;
    
    let filtered = analyses;
    
    if (filter.type) {
      filtered = filtered.filter(analysis => analysis.type === filter.type);
    }
    
    if (filter.status) {
      filtered = filtered.filter(analysis => analysis.status === filter.status);
    }
    
    if (filter.dateRange) {
      const { start, end } = filter.dateRange;
      filtered = filtered.filter(analysis => 
        analysis.timestamp >= start && analysis.timestamp <= end
      );
    }
    
    if (filter.files?.length) {
      filtered = filtered.filter(analysis => 
        filter.files!.some(file => analysis.files.includes(file))
      );
    }
    
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filtered = filtered.filter(analysis => 
        analysis.name.toLowerCase().includes(query) ||
        analysis.description?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }
);

export const selectFilteredInsights = createSelector(
  [selectInsights, selectInsightFilter],
  (insights, filter) => {
    if (!filter) return insights;
    
    let filtered = insights;
    
    if (filter.type) {
      filtered = filtered.filter(insight => insight.type === filter.type);
    }
    
    if (filter.severity) {
      filtered = filtered.filter(insight => insight.severity === filter.severity);
    }
    
    if (filter.isRead !== undefined) {
      filtered = filtered.filter(insight => insight.isRead === filter.isRead);
    }
    
    if (filter.tags?.length) {
      filtered = filtered.filter(insight => 
        filter.tags!.some(tag => insight.tags.includes(tag))
      );
    }
    
    if (filter.files?.length) {
      filtered = filtered.filter(insight => 
        filter.files!.includes(insight.location?.file || '')
      );
    }
    
    if (filter.dateRange) {
      const { start, end } = filter.dateRange;
      filtered = filtered.filter(insight => 
        insight.timestamp >= start && insight.timestamp <= end
      );
    }
    
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filtered = filtered.filter(insight => 
        insight.title.toLowerCase().includes(query) ||
        insight.description.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }
);

// Status selectors
export const selectScoutLoading = createSelector(
  [selectScout],
  (scout) => scout.loading
);

export const selectScoutErrors = createSelector(
  [selectScout],
  (scout) => scout.errors
);

export const selectLastUpdate = createSelector(
  [selectScout],
  (scout) => scout.lastUpdate
);

// Composite selectors
export const selectScoutMetrics = createSelector(
  [selectAnalyses, selectInsights, selectSuggestions, selectNewInsights],
  (analyses, insights, suggestions, newInsights) => ({
    totalAnalyses: analyses.length,
    totalInsights: insights.length,
    totalSuggestions: suggestions.length,
    newInsightsCount: newInsights.length,
    runningAnalyses: analyses.filter(a => a.status === 'running').length,
    criticalInsights: insights.filter(i => i.severity === 'critical').length,
    autoFixableSuggestions: suggestions.filter(s => s.canAutoFix).length
  })
);

export const selectScoutStatus = createSelector(
  [selectScoutLoading, selectScoutErrors, selectRunningAnalyses],
  (loading, errors, runningAnalyses) => ({
    isLoading: Object.values(loading).some(Boolean),
    hasErrors: errors.length > 0,
    hasRunningAnalyses: runningAnalyses.length > 0,
    isHealthy: errors.length === 0 && !Object.values(loading).some(Boolean)
  })
);

export const selectCodeHealthScore = createSelector(
  [selectOverallMetrics, selectCriticalInsights, selectHighPriorityInsights],
  (metrics, criticalInsights, highPriorityInsights) => {
    if (!metrics) return 0;
    
    let score = 100;
    
    // Reduce score based on metrics
    if (metrics.codeQuality < 80) score -= (80 - metrics.codeQuality) * 0.5;
    if (metrics.testCoverage < 70) score -= (70 - metrics.testCoverage) * 0.3;
    if (metrics.maintainabilityIndex < 70) score -= (70 - metrics.maintainabilityIndex) * 0.4;
    
    // Reduce score for critical issues
    score -= criticalInsights.length * 10;
    score -= highPriorityInsights.length * 3;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }
);

export const selectScoutActivity = createSelector(
  [selectAnalyses, selectInsights, selectSuggestions],
  (analyses, insights, suggestions) => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    return {
      todayAnalyses: analyses.filter(a => a.timestamp > now - oneDay).length,
      todayInsights: insights.filter(i => i.timestamp > now - oneDay).length,
      todaySuggestions: suggestions.filter(s => s.timestamp > now - oneDay).length,
      lastActivity: Math.max(
        ...analyses.map(a => a.timestamp),
        ...insights.map(i => i.timestamp),
        ...suggestions.map(s => s.timestamp),
        0
      ),
      weeklyTrend: calculateWeeklyTrend(analyses, insights, suggestions)
    };
  }
);

export const selectScoutPerformance = createSelector(
  [selectAnalyses, selectInsights, selectCodeMetrics],
  (analyses, insights, metrics) => ({
    analysisSpeed: calculateAnalysisSpeed(analyses),
    insightGeneration: calculateInsightGenerationSpeed(insights),
    metricsCalculation: calculateMetricsSpeed(metrics),
    memoryUsage: calculateScoutMemoryUsage(analyses, insights),
    optimizationScore: calculateScoutOptimizationScore(analyses, insights, metrics)
  })
);

// Helper functions for performance calculations
function calculateWeeklyTrend(
  analyses: Analysis[], 
  insights: Insight[], 
  suggestions: Suggestion[]
): number {
  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const twoWeeks = 2 * oneWeek;
  
  const thisWeek = [
    ...analyses.filter(a => a.timestamp > now - oneWeek),
    ...insights.filter(i => i.timestamp > now - oneWeek),
    ...suggestions.filter(s => s.timestamp > now - oneWeek)
  ].length;
  
  const lastWeek = [
    ...analyses.filter(a => a.timestamp > now - twoWeeks && a.timestamp <= now - oneWeek),
    ...insights.filter(i => i.timestamp > now - twoWeeks && i.timestamp <= now - oneWeek),
    ...suggestions.filter(s => s.timestamp > now - twoWeeks && s.timestamp <= now - oneWeek)
  ].length;
  
  if (lastWeek === 0) return thisWeek > 0 ? 100 : 0;
  return Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
}

function calculateAnalysisSpeed(analyses: Analysis[]): number {
  const completedAnalyses = analyses.filter(a => a.status === 'completed');
  if (completedAnalyses.length === 0) return 0;
  
  const avgDuration = completedAnalyses.reduce((sum, analysis) => 
    sum + (analysis.duration || 1000), 0
  ) / completedAnalyses.length;
  
  return Math.round(avgDuration);
}

function calculateInsightGenerationSpeed(insights: Insight[]): number {
  // Simplified calculation
  return insights.length > 100 ? 800 : 500; // ms
}

function calculateMetricsSpeed(metrics: CodeMetrics): number {
  // Simplified calculation
  return Object.keys(metrics.files).length > 100 ? 1200 : 600; // ms
}

function calculateScoutMemoryUsage(analyses: Analysis[], insights: Insight[]): number {
  // Simplified calculation
  return (analyses.length * 0.2) + (insights.length * 0.1); // MB
}

function calculateScoutOptimizationScore(
  analyses: Analysis[], 
  insights: Insight[], 
  metrics: CodeMetrics
): number {
  let score = 100;
  
  // Reduce score for large datasets
  if (analyses.length > 100) score -= 10;
  if (insights.length > 500) score -= 10;
  if (Object.keys(metrics.files).length > 200) score -= 5;
  
  // Reduce score for failed analyses
  const failedAnalyses = analyses.filter(a => a.status === 'failed');
  score -= failedAnalyses.length * 5;
  
  return Math.max(0, Math.min(100, score));
}

// Export all selectors
export default {
  // Base
  selectScout,
  
  // Analyses
  selectAnalyses,
  selectActiveAnalysisId,
  selectActiveAnalysis,
  selectAnalysisById,
  selectRecentAnalyses,
  selectAnalysesByType,
  selectAnalysesByStatus,
  selectRunningAnalyses,
  selectCompletedAnalyses,
  selectFailedAnalyses,
  
  // Insights
  selectInsights,
  selectInsightsByType,
  selectInsightsBySeverity,
  selectCriticalInsights,
  selectHighPriorityInsights,
  selectNewInsights,
  selectInsightsByFile,
  selectInsightsByTag,
  
  // Suggestions
  selectSuggestions,
  selectSuggestionsByType,
  selectSuggestionsByPriority,
  selectActiveSuggestions,
  selectImplementedSuggestions,
  selectSuggestionsByFile,
  selectAutoFixableSuggestions,
  
  // Metrics
  selectCodeMetrics,
  selectOverallMetrics,
  selectFileMetrics,
  selectMetricsByFile,
  selectComplexityMetrics,
  selectQualityMetrics,
  selectPerformanceMetrics,
  
  // Settings
  selectScoutSettings,
  selectAnalysisSettings,
  selectInsightSettings,
  selectSuggestionSettings,
  selectNotificationSettings,
  
  // Filters
  selectAnalysisFilter,
  selectInsightFilter,
  selectFilteredAnalyses,
  selectFilteredInsights,
  
  // Status
  selectScoutLoading,
  selectScoutErrors,
  selectLastUpdate,
  
  // Composite
  selectScoutMetrics,
  selectScoutStatus,
  selectCodeHealthScore,
  selectScoutActivity,
  selectScoutPerformance
};
