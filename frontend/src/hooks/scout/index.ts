/**
 * Scout Hooks Barrel Export
 * 
 * Centralized exports for all scout/codebase analysis React hooks
 * Provides clean imports: import { useScout, useCodeAnalysis } from '@/hooks/scout'
 */

// Core scout hooks
export { default as useScout } from './useScout';

// Re-export types for convenience
export type {
  UseScoutOptions,
  UseScoutResult,
  ScoutState,
  AnalysisRequest,
  AnalysisResult,
  CodeInsight,
  SecurityIssue,
  PerformanceMetric,
  RecommendationEngine
} from './useScout';
