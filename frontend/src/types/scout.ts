/**
 * Scout Types - Code Analysis and Insights Type Definitions
 * 
 * Comprehensive TypeScript types for the Scout code analysis system,
 * covering code insights, metrics, suggestions, dependency analysis,
 * performance monitoring, and developer tools integration.
 */

// ============================================================================
// CORE SCOUT TYPES
// ============================================================================

/**
 * Scout analysis session identifier and metadata
 */
export interface ScoutSession {
  id: string;
  workspaceId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  status: ScoutSessionStatus;
  analysisType: ScoutAnalysisType;
  configuration: ScoutConfiguration;
  metadata: ScoutSessionMetadata;
}

export type ScoutSessionStatus = 
  | 'initializing'
  | 'scanning'
  | 'analyzing'
  | 'generating_insights'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type ScoutAnalysisType = 
  | 'full_workspace'
  | 'incremental'
  | 'file_specific'
  | 'dependency_scan'
  | 'security_audit'
  | 'performance_analysis'
  | 'code_quality'
  | 'technical_debt';

export interface ScoutConfiguration {
  includePatterns: string[];
  excludePatterns: string[];
  analysisDepth: 'shallow' | 'deep' | 'comprehensive';
  enabledAnalyzers: ScoutAnalyzer[];
  thresholds: ScoutThresholds;
  outputFormat: ScoutOutputFormat[];
  realTimeUpdates: boolean;
}

export type ScoutAnalyzer = 
  | 'syntax'
  | 'complexity'
  | 'dependencies'
  | 'security'
  | 'performance'
  | 'maintainability'
  | 'accessibility'
  | 'testing'
  | 'documentation'
  | 'architecture';

export type ScoutOutputFormat = 
  | 'detailed_report'
  | 'summary_dashboard'
  | 'issue_list'
  | 'metrics_export'
  | 'recommendations'
  | 'trend_analysis';

// ============================================================================
// CODE ANALYSIS TYPES
// ============================================================================

/**
 * Comprehensive code analysis results
 */
export interface ScoutAnalysisResult {
  sessionId: string;
  timestamp: Date;
  workspace: WorkspaceAnalysis;
  files: FileAnalysis[];
  dependencies: DependencyAnalysis;
  security: SecurityAnalysis;
  performance: PerformanceAnalysis;
  quality: CodeQualityAnalysis;
  architecture: ArchitectureAnalysis;
  recommendations: ScoutRecommendation[];
  metrics: ScoutMetrics;
  trends: ScoutTrends;
}

export interface WorkspaceAnalysis {
  totalFiles: number;
  analyzedFiles: number;
  skippedFiles: number;
  languages: LanguageBreakdown[];
  structure: ProjectStructure;
  patterns: ArchitecturalPattern[];
  complexity: ComplexityMetrics;
  testCoverage: TestCoverageMetrics;
}

export interface FileAnalysis {
  path: string;
  language: string;
  size: number;
  lines: number;
  lastModified: Date;
  complexity: FileComplexity;
  issues: CodeIssue[];
  metrics: FileMetrics;
  dependencies: FileDependency[];
  exports: FileExport[];
  imports: FileImport[];
  functions: FunctionAnalysis[];
  classes: ClassAnalysis[];
  documentation: DocumentationAnalysis;
}

export interface LanguageBreakdown {
  language: string;
  fileCount: number;
  lineCount: number;
  percentage: number;
  complexity: number;
  issues: number;
}

// ============================================================================
// CODE COMPLEXITY AND METRICS
// ============================================================================

export interface ComplexityMetrics {
  cyclomatic: number;
  cognitive: number;
  halstead: HalsteadMetrics;
  maintainabilityIndex: number;
  technicalDebt: TechnicalDebtMetrics;
}

export interface HalsteadMetrics {
  vocabulary: number;
  length: number;
  calculatedLength: number;
  volume: number;
  difficulty: number;
  effort: number;
  timeToProgram: number;
  bugsDelivered: number;
}

export interface TechnicalDebtMetrics {
  totalMinutes: number;
  rating: TechnicalDebtRating;
  categories: TechnicalDebtCategory[];
  trends: DebtTrend[];
  recommendations: DebtRecommendation[];
}

export type TechnicalDebtRating = 'A' | 'B' | 'C' | 'D' | 'E';

export interface TechnicalDebtCategory {
  type: DebtType;
  minutes: number;
  issues: number;
  severity: IssueSeverity;
  examples: string[];
}

export type DebtType = 
  | 'code_smells'
  | 'duplicated_code'
  | 'complexity'
  | 'documentation'
  | 'testing'
  | 'security'
  | 'performance'
  | 'maintainability';

// ============================================================================
// CODE ISSUES AND SUGGESTIONS
// ============================================================================

export interface CodeIssue {
  id: string;
  type: IssueType;
  severity: IssueSeverity;
  category: IssueCategory;
  title: string;
  description: string;
  location: CodeLocation;
  rule: string;
  ruleDescription: string;
  examples: IssueExample[];
  suggestions: IssueSuggestion[];
  relatedIssues: string[];
  tags: string[];
  effort: FixEffort;
  confidence: number;
  autoFixable: boolean;
}

export type IssueType = 
  | 'error'
  | 'warning'
  | 'info'
  | 'suggestion'
  | 'security'
  | 'performance'
  | 'accessibility'
  | 'best_practice';

export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type IssueCategory = 
  | 'syntax'
  | 'logic'
  | 'performance'
  | 'security'
  | 'maintainability'
  | 'accessibility'
  | 'testing'
  | 'documentation'
  | 'style'
  | 'complexity';

export interface CodeLocation {
  file: string;
  startLine: number;
  endLine: number;
  startColumn: number;
  endColumn: number;
  function?: string;
  class?: string;
  method?: string;
}

export interface IssueExample {
  title: string;
  before: string;
  after: string;
  explanation: string;
}

export interface IssueSuggestion {
  id: string;
  title: string;
  description: string;
  type: SuggestionType;
  changes: CodeChange[];
  impact: SuggestionImpact;
  effort: FixEffort;
  confidence: number;
  tags: string[];
}

export type SuggestionType = 
  | 'refactor'
  | 'optimize'
  | 'modernize'
  | 'security_fix'
  | 'performance_improvement'
  | 'accessibility_fix'
  | 'best_practice'
  | 'documentation';

export interface CodeChange {
  file: string;
  operation: ChangeOperation;
  location: CodeLocation;
  oldCode: string;
  newCode: string;
  reason: string;
}

export type ChangeOperation = 'insert' | 'delete' | 'replace' | 'move';

export interface SuggestionImpact {
  performance: ImpactLevel;
  maintainability: ImpactLevel;
  security: ImpactLevel;
  accessibility: ImpactLevel;
  testability: ImpactLevel;
  readability: ImpactLevel;
}

export type ImpactLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

export type FixEffort = 'trivial' | 'easy' | 'medium' | 'hard' | 'major';

// ============================================================================
// DEPENDENCY ANALYSIS
// ============================================================================

export interface DependencyAnalysis {
  direct: Dependency[];
  transitive: Dependency[];
  dev: Dependency[];
  peer: Dependency[];
  vulnerabilities: SecurityVulnerability[];
  outdated: OutdatedDependency[];
  unused: UnusedDependency[];
  graph: DependencyGraph;
  conflicts: DependencyConflict[];
  recommendations: DependencyRecommendation[];
}

export interface Dependency {
  name: string;
  version: string;
  type: DependencyType;
  license: string;
  size: number;
  lastUpdate: Date;
  maintainers: string[];
  repository: string;
  documentation: string;
  usage: DependencyUsage[];
  health: DependencyHealth;
}

export type DependencyType = 'production' | 'development' | 'peer' | 'optional';

export interface DependencyUsage {
  file: string;
  imports: string[];
  frequency: number;
  criticality: 'low' | 'medium' | 'high' | 'critical';
}

export interface DependencyHealth {
  score: number;
  factors: HealthFactor[];
  issues: string[];
  recommendations: string[];
}

export interface HealthFactor {
  name: string;
  score: number;
  weight: number;
  description: string;
}

export interface SecurityVulnerability {
  id: string;
  dependency: string;
  version: string;
  severity: IssueSeverity;
  title: string;
  description: string;
  cve?: string;
  cvss?: number;
  publishDate: Date;
  patchedVersions: string[];
  recommendations: string[];
}

export interface OutdatedDependency {
  name: string;
  currentVersion: string;
  latestVersion: string;
  type: 'major' | 'minor' | 'patch';
  changelog: string;
  breakingChanges: boolean;
  effort: UpdateEffort;
}

export type UpdateEffort = 'trivial' | 'easy' | 'moderate' | 'complex' | 'major';

// ============================================================================
// PERFORMANCE ANALYSIS
// ============================================================================

export interface PerformanceAnalysis {
  bundleSize: BundleAnalysis;
  runtime: RuntimeAnalysis;
  memory: MemoryAnalysis;
  network: NetworkAnalysis;
  rendering: RenderingAnalysis;
  bottlenecks: PerformanceBottleneck[];
  recommendations: PerformanceRecommendation[];
  metrics: PerformanceMetrics;
}

export interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  chunks: BundleChunk[];
  treeshaking: TreeshakingAnalysis;
  duplicates: DuplicateModule[];
  suggestions: BundleOptimization[];
}

export interface BundleChunk {
  name: string;
  size: number;
  modules: ChunkModule[];
  dependencies: string[];
  loadTime: number;
  criticality: 'critical' | 'high' | 'medium' | 'low';
}

export interface RuntimeAnalysis {
  executionTime: ExecutionProfile[];
  asyncOperations: AsyncProfile[];
  eventLoops: EventLoopProfile[];
  memoryLeaks: MemoryLeak[];
  cpuUsage: CPUProfile[];
}

export interface PerformanceBottleneck {
  type: BottleneckType;
  location: CodeLocation;
  impact: ImpactLevel;
  description: string;
  metrics: BottleneckMetrics;
  suggestions: PerformanceRecommendation[];
}

export type BottleneckType = 
  | 'cpu_intensive'
  | 'memory_leak'
  | 'blocking_operation'
  | 'inefficient_algorithm'
  | 'excessive_renders'
  | 'large_bundle'
  | 'slow_network';

// ============================================================================
// ARCHITECTURE ANALYSIS
// ============================================================================

export interface ArchitectureAnalysis {
  patterns: ArchitecturalPattern[];
  layers: ArchitecturalLayer[];
  dependencies: ArchitecturalDependency[];
  violations: ArchitecturalViolation[];
  metrics: ArchitecturalMetrics;
  recommendations: ArchitecturalRecommendation[];
}

export interface ArchitecturalPattern {
  name: string;
  type: PatternType;
  confidence: number;
  components: PatternComponent[];
  benefits: string[];
  drawbacks: string[];
  compliance: number;
}

export type PatternType = 
  | 'mvc'
  | 'mvp'
  | 'mvvm'
  | 'component_based'
  | 'layered'
  | 'microservices'
  | 'event_driven'
  | 'pub_sub'
  | 'observer'
  | 'singleton'
  | 'factory'
  | 'repository';

export interface ArchitecturalLayer {
  name: string;
  level: number;
  components: string[];
  responsibilities: string[];
  dependencies: LayerDependency[];
  violations: LayerViolation[];
}

// ============================================================================
// SCOUT RECOMMENDATIONS
// ============================================================================

export interface ScoutRecommendation {
  id: string;
  type: RecommendationType;
  priority: RecommendationPriority;
  title: string;
  description: string;
  rationale: string;
  benefits: string[];
  effort: FixEffort;
  impact: SuggestionImpact;
  steps: RecommendationStep[];
  examples: RecommendationExample[];
  relatedIssues: string[];
  tags: string[];
  confidence: number;
}

export type RecommendationType = 
  | 'refactoring'
  | 'optimization'
  | 'security'
  | 'performance'
  | 'maintainability'
  | 'testing'
  | 'documentation'
  | 'architecture'
  | 'dependencies'
  | 'best_practices';

export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';

export interface RecommendationStep {
  order: number;
  title: string;
  description: string;
  code?: string;
  files?: string[];
  commands?: string[];
  validation?: string;
}

export interface RecommendationExample {
  title: string;
  before: string;
  after: string;
  explanation: string;
  benefits: string[];
}

// ============================================================================
// SCOUT METRICS AND TRENDS
// ============================================================================

export interface ScoutMetrics {
  overview: OverviewMetrics;
  quality: QualityMetrics;
  complexity: ComplexityMetrics;
  maintainability: MaintainabilityMetrics;
  security: SecurityMetrics;
  performance: PerformanceMetrics;
  testing: TestingMetrics;
  documentation: DocumentationMetrics;
}

export interface OverviewMetrics {
  totalFiles: number;
  totalLines: number;
  totalFunctions: number;
  totalClasses: number;
  languages: LanguageBreakdown[];
  lastAnalysis: Date;
  analysisTime: number;
}

export interface QualityMetrics {
  overallScore: number;
  maintainabilityIndex: number;
  codeSmells: number;
  duplicatedLines: number;
  duplicatedBlocks: number;
  technicalDebt: TechnicalDebtMetrics;
}

export interface MaintainabilityMetrics {
  index: number;
  factors: MaintainabilityFactor[];
  trends: MetricTrend[];
  recommendations: string[];
}

export interface MaintainabilityFactor {
  name: string;
  score: number;
  weight: number;
  description: string;
  impact: ImpactLevel;
}

export interface SecurityMetrics {
  vulnerabilities: VulnerabilityCount;
  securityHotspots: number;
  securityRating: SecurityRating;
  compliance: ComplianceScore[];
}

export interface VulnerabilityCount {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
}

export type SecurityRating = 'A' | 'B' | 'C' | 'D' | 'E';

export interface ComplianceScore {
  standard: string;
  score: number;
  violations: number;
  recommendations: string[];
}

export interface TestingMetrics {
  coverage: TestCoverageMetrics;
  quality: TestQualityMetrics;
  performance: TestPerformanceMetrics;
}

export interface TestCoverageMetrics {
  lines: CoverageStats;
  functions: CoverageStats;
  branches: CoverageStats;
  statements: CoverageStats;
  files: FileCoverage[];
}

export interface CoverageStats {
  total: number;
  covered: number;
  percentage: number;
}

// ============================================================================
// SCOUT TRENDS AND HISTORY
// ============================================================================

export interface ScoutTrends {
  quality: TrendData[];
  complexity: TrendData[];
  maintainability: TrendData[];
  security: TrendData[];
  performance: TrendData[];
  testing: TrendData[];
  velocity: VelocityTrend[];
}

export interface TrendData {
  date: Date;
  value: number;
  change: number;
  changePercentage: number;
  trend: TrendDirection;
}

export type TrendDirection = 'improving' | 'stable' | 'degrading';

export interface VelocityTrend {
  date: Date;
  linesAdded: number;
  linesRemoved: number;
  filesChanged: number;
  complexity: number;
  quality: number;
}

export interface MetricTrend {
  metric: string;
  current: number;
  previous: number;
  change: number;
  direction: TrendDirection;
  period: string;
}

// ============================================================================
// SCOUT CONFIGURATION AND THRESHOLDS
// ============================================================================

export interface ScoutThresholds {
  complexity: ComplexityThresholds;
  maintainability: MaintainabilityThresholds;
  security: SecurityThresholds;
  performance: PerformanceThresholds;
  testing: TestingThresholds;
  quality: QualityThresholds;
}

export interface ComplexityThresholds {
  cyclomatic: ThresholdConfig;
  cognitive: ThresholdConfig;
  maintainabilityIndex: ThresholdConfig;
  linesPerFunction: ThresholdConfig;
  parametersPerFunction: ThresholdConfig;
}

export interface ThresholdConfig {
  good: number;
  warning: number;
  critical: number;
  enabled: boolean;
}

export interface MaintainabilityThresholds {
  index: ThresholdConfig;
  technicalDebt: ThresholdConfig;
  duplicatedLines: ThresholdConfig;
  codeSmells: ThresholdConfig;
}

export interface SecurityThresholds {
  vulnerabilities: VulnerabilityThresholds;
  securityHotspots: ThresholdConfig;
  compliance: ComplianceThresholds;
}

export interface VulnerabilityThresholds {
  critical: ThresholdConfig;
  high: ThresholdConfig;
  medium: ThresholdConfig;
  low: ThresholdConfig;
}

// ============================================================================
// SCOUT REAL-TIME AND LIVE ANALYSIS
// ============================================================================

export interface ScoutLiveAnalysis {
  sessionId: string;
  isActive: boolean;
  currentFile?: string;
  progress: AnalysisProgress;
  realtimeUpdates: ScoutRealtimeUpdate[];
  notifications: ScoutNotification[];
}

export interface AnalysisProgress {
  phase: AnalysisPhase;
  percentage: number;
  currentTask: string;
  estimatedTimeRemaining: number;
  filesProcessed: number;
  totalFiles: number;
}

export type AnalysisPhase = 
  | 'initialization'
  | 'file_discovery'
  | 'syntax_analysis'
  | 'dependency_scan'
  | 'security_audit'
  | 'performance_analysis'
  | 'generating_insights'
  | 'finalizing';

export interface ScoutRealtimeUpdate {
  timestamp: Date;
  type: UpdateType;
  data: UpdateData;
  severity?: IssueSeverity;
}

export type UpdateType = 
  | 'issue_found'
  | 'issue_resolved'
  | 'metric_changed'
  | 'recommendation_added'
  | 'analysis_complete'
  | 'error_occurred';

export interface UpdateData {
  file?: string;
  issue?: CodeIssue;
  metric?: MetricUpdate;
  recommendation?: ScoutRecommendation;
  error?: AnalysisError;
}

export interface ScoutNotification {
  id: string;
  type: NotificationType;
  severity: IssueSeverity;
  title: string;
  message: string;
  timestamp: Date;
  actions?: NotificationAction[];
  dismissed: boolean;
}

export type NotificationType = 
  | 'new_issue'
  | 'critical_vulnerability'
  | 'performance_degradation'
  | 'quality_improvement'
  | 'analysis_complete'
  | 'recommendation_available';

export interface NotificationAction {
  label: string;
  action: string;
  primary: boolean;
}

// ============================================================================
// SCOUT UTILITIES AND HELPERS
// ============================================================================

export interface ScoutSessionMetadata {
  version: string;
  configuration: ScoutConfiguration;
  environment: EnvironmentInfo;
  performance: SessionPerformance;
  statistics: SessionStatistics;
}

export interface EnvironmentInfo {
  nodeVersion: string;
  platform: string;
  architecture: string;
  memory: number;
  cpuCores: number;
}

export interface SessionPerformance {
  startTime: Date;
  endTime?: Date;
  duration?: number;
  memoryUsage: MemoryUsageStats;
  cpuUsage: number;
}

export interface SessionStatistics {
  filesScanned: number;
  issuesFound: number;
  recommendationsGenerated: number;
  errorsEncountered: number;
}

/**
 * Type guards for Scout types
 */
export const isScoutSession = (obj: any): obj is ScoutSession => {
  return obj && typeof obj.id === 'string' && typeof obj.workspaceId === 'string';
};

export const isCodeIssue = (obj: any): obj is CodeIssue => {
  return obj && typeof obj.id === 'string' && typeof obj.type === 'string';
};

export const isScoutRecommendation = (obj: any): obj is ScoutRecommendation => {
  return obj && typeof obj.id === 'string' && typeof obj.type === 'string';
};

/**
 * Utility types for Scout operations
 */
export type ScoutEventHandler<T = any> = (event: ScoutEvent<T>) => void;

export interface ScoutEvent<T = any> {
  type: string;
  data: T;
  timestamp: Date;
  sessionId: string;
}

export type ScoutAnalysisFilter = {
  filePatterns?: string[];
  issueTypes?: IssueType[];
  severities?: IssueSeverity[];
  categories?: IssueCategory[];
  analyzers?: ScoutAnalyzer[];
};

export type ScoutSortOptions = {
  field: string;
  direction: 'asc' | 'desc';
  secondarySort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
};

export interface ScoutExportOptions {
  format: 'json' | 'csv' | 'html' | 'pdf' | 'markdown';
  sections: string[];
  includeCharts: boolean;
  includeCode: boolean;
  template?: string;
}
