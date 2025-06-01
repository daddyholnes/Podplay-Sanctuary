/**
 * Workspace Type Definitions
 * 
 * Comprehensive TypeScript interfaces for workspace management, file operations,
 * project structure, version control, and collaborative development features.
 * 
 * @fileoverview Complete workspace system types with files, projects, collaboration, and version control
 * @version 1.0.0
 * @author Podplay Sanctuary Team
 */

import type { ApiResponse, Resource, AuthUser, FileUpload } from './api';

// ============================================================================
// WORKSPACE TYPES
// ============================================================================

/**
 * Workspace entity
 */
export interface Workspace extends Resource {
  name: string;
  description?: string;
  type: WorkspaceType;
  status: WorkspaceStatus;
  visibility: WorkspaceVisibility;
  settings: WorkspaceSettings;
  permissions: WorkspacePermissions;
  statistics: WorkspaceStatistics;
  owner: AuthUser;
  members: WorkspaceMember[];
  projects: Project[];
  tags: string[];
  template?: WorkspaceTemplate;
  integrations: WorkspaceIntegration[];
  backup: BackupConfig;
  metadata: WorkspaceMetadata;
}

/**
 * Workspace types
 */
export type WorkspaceType = 
  | 'personal'
  | 'team'
  | 'organization'
  | 'public'
  | 'template'
  | 'sandbox'
  | 'archive';

/**
 * Workspace status
 */
export type WorkspaceStatus = 
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'archived'
  | 'deleted'
  | 'maintenance';

/**
 * Workspace visibility
 */
export type WorkspaceVisibility = 'private' | 'internal' | 'public' | 'restricted';

/**
 * Workspace member
 */
export interface WorkspaceMember {
  userId: string;
  user?: AuthUser;
  role: WorkspaceRole;
  permissions: WorkspacePermission[];
  joinedAt: string;
  lastActiveAt: string;
  invitedBy?: string;
  customTitle?: string;
  status: MemberStatus;
  preferences: MemberPreferences;
}

/**
 * Workspace roles
 */
export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer' | 'guest' | 'contributor';

/**
 * Workspace permissions
 */
export type WorkspacePermission = 
  | 'read'
  | 'write'
  | 'delete'
  | 'create_project'
  | 'delete_project'
  | 'manage_members'
  | 'manage_settings'
  | 'manage_integrations'
  | 'export_data'
  | 'view_analytics';

/**
 * Member status
 */
export type MemberStatus = 'active' | 'pending' | 'suspended' | 'left';

/**
 * Member preferences
 */
export interface MemberPreferences {
  notifications: NotificationSettings;
  defaultView: string;
  autoSave: boolean;
  theme: string;
  shortcuts: Record<string, string>;
}

// ============================================================================
// PROJECT TYPES
// ============================================================================

/**
 * Project entity
 */
export interface Project extends Resource {
  workspaceId: string;
  name: string;
  description?: string;
  type: ProjectType;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  settings: ProjectSettings;
  structure: ProjectStructure;
  dependencies: ProjectDependency[];
  scripts: ProjectScript[];
  environments: ProjectEnvironment[];
  collaborators: ProjectCollaborator[];
  files: WorkspaceFile[];
  tags: string[];
  template?: ProjectTemplate;
  metadata: ProjectMetadata;
}

/**
 * Project types
 */
export type ProjectType = 
  | 'web'
  | 'mobile'
  | 'desktop'
  | 'api'
  | 'library'
  | 'documentation'
  | 'data'
  | 'ai_ml'
  | 'game'
  | 'other';

/**
 * Project status
 */
export type ProjectStatus = 
  | 'planning'
  | 'development'
  | 'testing'
  | 'staging'
  | 'production'
  | 'maintenance'
  | 'archived'
  | 'deprecated';

/**
 * Project visibility
 */
export type ProjectVisibility = 'private' | 'workspace' | 'public' | 'restricted';

/**
 * Project collaborator
 */
export interface ProjectCollaborator {
  userId: string;
  user?: AuthUser;
  role: ProjectRole;
  permissions: ProjectPermission[];
  joinedAt: string;
  contributions: ContributionStats;
}

/**
 * Project roles
 */
export type ProjectRole = 'owner' | 'maintainer' | 'developer' | 'reviewer' | 'tester' | 'viewer';

/**
 * Project permissions
 */
export type ProjectPermission = 
  | 'read_code'
  | 'write_code'
  | 'delete_files'
  | 'manage_branches'
  | 'merge_requests'
  | 'deploy'
  | 'manage_settings'
  | 'manage_collaborators';

// ============================================================================
// FILE SYSTEM TYPES
// ============================================================================

/**
 * Workspace file
 */
export interface WorkspaceFile extends Resource {
  projectId?: string;
  name: string;
  path: string;
  type: FileType;
  size: number;
  mimeType: string;
  encoding?: string;
  content?: string;
  binaryContent?: ArrayBuffer;
  checksum: string;
  language?: ProgrammingLanguage;
  syntax?: SyntaxInfo;
  permissions: FilePermissions;
  versions: FileVersion[];
  locks: FileLock[];
  collaborators: FileCollaborator[];
  annotations: FileAnnotation[];
  metadata: FileMetadata;
}

/**
 * File types
 */
export type FileType = 
  | 'file'
  | 'directory'
  | 'symlink'
  | 'mount'
  | 'virtual'
  | 'binary'
  | 'compressed';

/**
 * Programming languages
 */
export type ProgrammingLanguage = 
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'java'
  | 'csharp'
  | 'cpp'
  | 'rust'
  | 'go'
  | 'php'
  | 'ruby'
  | 'swift'
  | 'kotlin'
  | 'html'
  | 'css'
  | 'scss'
  | 'sql'
  | 'json'
  | 'yaml'
  | 'xml'
  | 'markdown'
  | 'text'
  | 'other';

/**
 * File permissions
 */
export interface FilePermissions {
  read: boolean;
  write: boolean;
  execute: boolean;
  delete: boolean;
  share: boolean;
  owner: string;
  group?: string;
  others: FileAccess[];
}

/**
 * File access
 */
export interface FileAccess {
  userId: string;
  permissions: ('read' | 'write' | 'execute' | 'delete')[];
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
}

/**
 * File version
 */
export interface FileVersion {
  id: string;
  version: string;
  content: string;
  size: number;
  checksum: string;
  changes: FileChange[];
  author: string;
  message: string;
  tags: string[];
  createdAt: string;
  parentVersion?: string;
  mergeVersions?: string[];
}

/**
 * File change
 */
export interface FileChange {
  type: ChangeType;
  line: number;
  column?: number;
  content: string;
  oldContent?: string;
  length?: number;
}

/**
 * Change types
 */
export type ChangeType = 'insert' | 'delete' | 'replace' | 'move';

/**
 * File lock
 */
export interface FileLock {
  id: string;
  userId: string;
  user?: AuthUser;
  type: LockType;
  region?: TextRegion;
  acquiredAt: string;
  expiresAt?: string;
  message?: string;
}

/**
 * Lock types
 */
export type LockType = 'exclusive' | 'shared' | 'checkout' | 'region';

/**
 * Text region
 */
export interface TextRegion {
  start: TextPosition;
  end: TextPosition;
}

/**
 * Text position
 */
export interface TextPosition {
  line: number;
  column: number;
}

/**
 * File collaborator
 */
export interface FileCollaborator {
  userId: string;
  user?: AuthUser;
  cursor?: TextPosition;
  selection?: TextRegion;
  lastActivity: string;
  status: CollaboratorStatus;
  color: string;
}

/**
 * Collaborator status
 */
export type CollaboratorStatus = 'viewing' | 'editing' | 'commenting' | 'away';

/**
 * File annotation
 */
export interface FileAnnotation {
  id: string;
  type: AnnotationType;
  line: number;
  column?: number;
  content: string;
  author: string;
  createdAt: string;
  resolved?: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  replies: AnnotationReply[];
}

/**
 * Annotation types
 */
export type AnnotationType = 'comment' | 'suggestion' | 'issue' | 'todo' | 'note' | 'warning';

/**
 * Annotation reply
 */
export interface AnnotationReply {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

// ============================================================================
// FOLDER STRUCTURE TYPES
// ============================================================================

/**
 * Directory structure
 */
export interface DirectoryStructure {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  children?: DirectoryStructure[];
  metadata?: DirectoryMetadata;
}

/**
 * Directory metadata
 */
export interface DirectoryMetadata {
  fileCount: number;
  directoryCount: number;
  totalSize: number;
  lastModified: string;
  permissions: FilePermissions;
  isEmpty: boolean;
  isRoot: boolean;
  depth: number;
}

/**
 * File tree node
 */
export interface FileTreeNode {
  id: string;
  name: string;
  path: string;
  type: FileType;
  expanded?: boolean;
  selected?: boolean;
  children?: FileTreeNode[];
  parent?: string;
  level: number;
  hasChildren: boolean;
  isLoading?: boolean;
  icon?: string;
  status?: FileStatus;
}

/**
 * File status
 */
export type FileStatus = 
  | 'untracked'
  | 'modified'
  | 'added'
  | 'deleted'
  | 'renamed'
  | 'copied'
  | 'staged'
  | 'committed'
  | 'conflicted';

// ============================================================================
// SYNTAX AND LANGUAGE SUPPORT
// ============================================================================

/**
 * Syntax information
 */
export interface SyntaxInfo {
  language: ProgrammingLanguage;
  version?: string;
  dialect?: string;
  features: LanguageFeature[];
  highlighting: SyntaxHighlighting;
  completion: CodeCompletion;
  linting: LintingConfig;
  formatting: FormattingConfig;
}

/**
 * Language features
 */
export type LanguageFeature = 
  | 'syntax_highlighting'
  | 'auto_completion'
  | 'error_detection'
  | 'refactoring'
  | 'debugging'
  | 'testing'
  | 'formatting'
  | 'folding'
  | 'minimap';

/**
 * Syntax highlighting
 */
export interface SyntaxHighlighting {
  theme: string;
  rules: HighlightRule[];
  customTokens: CustomToken[];
}

/**
 * Highlight rule
 */
export interface HighlightRule {
  pattern: string;
  type: TokenType;
  style: TokenStyle;
}

/**
 * Token types
 */
export type TokenType = 
  | 'keyword'
  | 'string'
  | 'number'
  | 'comment'
  | 'function'
  | 'variable'
  | 'type'
  | 'operator'
  | 'punctuation'
  | 'constant';

/**
 * Token style
 */
export interface TokenStyle {
  color?: string;
  backgroundColor?: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'strikethrough';
}

/**
 * Custom token
 */
export interface CustomToken {
  name: string;
  pattern: string;
  style: TokenStyle;
}

/**
 * Code completion
 */
export interface CodeCompletion {
  enabled: boolean;
  triggerCharacters: string[];
  providers: CompletionProvider[];
  ranking: CompletionRanking;
}

/**
 * Completion provider
 */
export interface CompletionProvider {
  name: string;
  type: ProviderType;
  config: Record<string, any>;
  priority: number;
}

/**
 * Provider types
 */
export type ProviderType = 'lsp' | 'ai' | 'snippets' | 'keywords' | 'files' | 'custom';

/**
 * Completion ranking
 */
export interface CompletionRanking {
  algorithm: 'frequency' | 'relevance' | 'hybrid';
  weights: RankingWeights;
}

/**
 * Ranking weights
 */
export interface RankingWeights {
  textSimilarity: number;
  contextRelevance: number;
  usageFrequency: number;
  recency: number;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

/**
 * Workspace settings
 */
export interface WorkspaceSettings {
  general: GeneralSettings;
  editor: EditorSettings;
  terminal: TerminalSettings;
  git: GitSettings;
  build: BuildSettings;
  deployment: DeploymentSettings;
  security: SecuritySettings;
  collaboration: CollaborationSettings;
}

/**
 * General settings
 */
export interface GeneralSettings {
  name: string;
  description?: string;
  defaultLanguage: ProgrammingLanguage;
  autoSave: boolean;
  autoSaveDelay: number;
  fileWatcher: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  excludedPaths: string[];
}

/**
 * Editor settings
 */
export interface EditorSettings {
  theme: string;
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  tabSize: number;
  insertSpaces: boolean;
  wordWrap: boolean;
  lineNumbers: boolean;
  minimap: boolean;
  folding: boolean;
  bracketMatching: boolean;
  autoIndent: boolean;
  formatOnSave: boolean;
  trimWhitespace: boolean;
}

/**
 * Terminal settings
 */
export interface TerminalSettings {
  shell: string;
  fontSize: number;
  fontFamily: string;
  theme: string;
  scrollback: number;
  cursorStyle: 'block' | 'line' | 'underline';
  cursorBlink: boolean;
  environmentVariables: Record<string, string>;
}

/**
 * Git settings
 */
export interface GitSettings {
  enabled: boolean;
  remote?: string;
  branch: string;
  autoCommit: boolean;
  autoCommitMessage: string;
  ignorePaths: string[];
  hooks: GitHook[];
}

/**
 * Git hook
 */
export interface GitHook {
  name: string;
  command: string;
  enabled: boolean;
}

/**
 * Build settings
 */
export interface BuildSettings {
  enabled: boolean;
  command: string;
  outputPath: string;
  environmentVariables: Record<string, string>;
  beforeHooks: BuildHook[];
  afterHooks: BuildHook[];
}

/**
 * Build hook
 */
export interface BuildHook {
  name: string;
  command: string;
  condition?: string;
  timeout?: number;
}

/**
 * Deployment settings
 */
export interface DeploymentSettings {
  enabled: boolean;
  provider: DeploymentProvider;
  config: DeploymentConfig;
  environments: DeploymentEnvironment[];
  pipeline: DeploymentPipeline;
}

/**
 * Deployment providers
 */
export type DeploymentProvider = 'vercel' | 'netlify' | 'aws' | 'gcp' | 'azure' | 'heroku' | 'custom';

/**
 * Deployment configuration
 */
export interface DeploymentConfig {
  provider: DeploymentProvider;
  credentials: Record<string, string>;
  region?: string;
  domain?: string;
  customDomain?: string;
  ssl: boolean;
  cdn: boolean;
  environmentVariables: Record<string, string>;
}

/**
 * Deployment environment
 */
export interface DeploymentEnvironment {
  name: string;
  type: 'development' | 'staging' | 'production';
  branch: string;
  domain?: string;
  variables: Record<string, string>;
  secrets: Record<string, string>;
}

/**
 * Deployment pipeline
 */
export interface DeploymentPipeline {
  stages: PipelineStage[];
  triggers: PipelineTrigger[];
  notifications: PipelineNotification[];
}

/**
 * Pipeline stage
 */
export interface PipelineStage {
  name: string;
  type: 'build' | 'test' | 'deploy' | 'notify';
  command?: string;
  environment?: string;
  condition?: string;
  timeout?: number;
  retries?: number;
}

/**
 * Pipeline trigger
 */
export interface PipelineTrigger {
  event: 'push' | 'pull_request' | 'tag' | 'schedule' | 'manual';
  condition?: string;
  branches?: string[];
}

/**
 * Pipeline notification
 */
export interface PipelineNotification {
  type: 'email' | 'slack' | 'webhook';
  recipients: string[];
  events: ('start' | 'success' | 'failure')[];
  config: Record<string, any>;
}

// ============================================================================
// PROJECT CONFIGURATION
// ============================================================================

/**
 * Project settings
 */
export interface ProjectSettings {
  name: string;
  version: string;
  description?: string;
  homepage?: string;
  repository?: RepositoryInfo;
  license?: string;
  keywords: string[];
  author?: AuthorInfo;
  contributors: AuthorInfo[];
  engines: EngineRequirement[];
  scripts: Record<string, string>;
  dependencies: DependencyMap;
  devDependencies: DependencyMap;
  peerDependencies: DependencyMap;
  bundledDependencies: string[];
  optionalDependencies: DependencyMap;
}

/**
 * Repository information
 */
export interface RepositoryInfo {
  type: 'git' | 'svn' | 'mercurial';
  url: string;
  directory?: string;
}

/**
 * Author information
 */
export interface AuthorInfo {
  name: string;
  email?: string;
  url?: string;
}

/**
 * Engine requirement
 */
export interface EngineRequirement {
  name: string;
  version: string;
}

/**
 * Dependency map
 */
export type DependencyMap = Record<string, string>;

/**
 * Project structure
 */
export interface ProjectStructure {
  root: string;
  source: string;
  build?: string;
  dist?: string;
  assets?: string;
  docs?: string;
  tests?: string;
  config?: string;
  scripts?: string;
  public?: string;
  static?: string;
}

/**
 * Project dependency
 */
export interface ProjectDependency {
  name: string;
  version: string;
  type: DependencyType;
  scope: DependencyScope;
  license?: string;
  description?: string;
  homepage?: string;
  repository?: string;
  vulnerabilities: Vulnerability[];
  updatesAvailable: string[];
}

/**
 * Dependency types
 */
export type DependencyType = 'runtime' | 'development' | 'peer' | 'optional' | 'bundled';

/**
 * Dependency scopes
 */
export type DependencyScope = 'production' | 'development' | 'test' | 'build';

/**
 * Vulnerability information
 */
export interface Vulnerability {
  id: string;
  severity: VulnerabilitySeverity;
  title: string;
  description: string;
  cwe?: string[];
  cvss?: number;
  url?: string;
  patchedIn?: string;
}

/**
 * Vulnerability severity
 */
export type VulnerabilitySeverity = 'low' | 'moderate' | 'high' | 'critical';

/**
 * Project script
 */
export interface ProjectScript {
  name: string;
  command: string;
  description?: string;
  env?: Record<string, string>;
  workingDirectory?: string;
  timeout?: number;
  background?: boolean;
}

/**
 * Project environment
 */
export interface ProjectEnvironment {
  name: string;
  type: EnvironmentType;
  status: EnvironmentStatus;
  url?: string;
  variables: Record<string, string>;
  secrets: Record<string, string>;
  resources: EnvironmentResource[];
  deployments: Deployment[];
}

/**
 * Environment types
 */
export type EnvironmentType = 'development' | 'testing' | 'staging' | 'production' | 'review';

/**
 * Environment status
 */
export type EnvironmentStatus = 'active' | 'inactive' | 'deploying' | 'failed' | 'archived';

/**
 * Environment resource
 */
export interface EnvironmentResource {
  type: ResourceType;
  name: string;
  config: Record<string, any>;
  status: ResourceStatus;
}

/**
 * Resource types
 */
export type ResourceType = 'database' | 'storage' | 'cache' | 'queue' | 'api' | 'cdn' | 'monitor';

/**
 * Resource status
 */
export type ResourceStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

/**
 * Deployment information
 */
export interface Deployment {
  id: string;
  version: string;
  commit: string;
  branch: string;
  environment: string;
  status: DeploymentStatus;
  startedAt: string;
  completedAt?: string;
  deployedBy: string;
  logs: DeploymentLog[];
  rollback?: RollbackInfo;
}

/**
 * Deployment status
 */
export type DeploymentStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled' | 'rolled_back';

/**
 * Deployment log
 */
export interface DeploymentLog {
  timestamp: string;
  level: LogLevel;
  message: string;
  stage?: string;
  data?: Record<string, any>;
}

/**
 * Log levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * Rollback information
 */
export interface RollbackInfo {
  fromVersion: string;
  toVersion: string;
  reason: string;
  performedBy: string;
  performedAt: string;
  success: boolean;
}

// ============================================================================
// METADATA TYPES
// ============================================================================

/**
 * Workspace metadata
 */
export interface WorkspaceMetadata {
  created: CreationInfo;
  analytics: AnalyticsInfo;
  storage: StorageInfo;
  activity: ActivityInfo;
  health: HealthInfo;
}

/**
 * Creation information
 */
export interface CreationInfo {
  template?: string;
  source?: 'scratch' | 'template' | 'import' | 'clone';
  originalUrl?: string;
  migration?: MigrationInfo;
}

/**
 * Migration information
 */
export interface MigrationInfo {
  from: string;
  version: string;
  completedAt: string;
  issues: string[];
}

/**
 * Analytics information
 */
export interface AnalyticsInfo {
  dailyActiveUsers: number;
  totalSessions: number;
  averageSessionDuration: number;
  topFiles: FileUsage[];
  topLanguages: LanguageUsage[];
}

/**
 * File usage statistics
 */
export interface FileUsage {
  path: string;
  views: number;
  edits: number;
  lastAccessed: string;
}

/**
 * Language usage statistics
 */
export interface LanguageUsage {
  language: ProgrammingLanguage;
  lines: number;
  files: number;
  percentage: number;
}

/**
 * Storage information
 */
export interface StorageInfo {
  used: number;
  available: number;
  limit: number;
  files: number;
  largest: string;
  oldestFile: string;
  newestFile: string;
}

/**
 * Activity information
 */
export interface ActivityInfo {
  lastActivity: string;
  recentActions: ActivityAction[];
  commitFrequency: number;
  deploymentFrequency: number;
}

/**
 * Activity action
 */
export interface ActivityAction {
  type: ActionType;
  target: string;
  user: string;
  timestamp: string;
  details?: Record<string, any>;
}

/**
 * Action types
 */
export type ActionType = 
  | 'file_created'
  | 'file_modified'
  | 'file_deleted'
  | 'file_renamed'
  | 'folder_created'
  | 'folder_deleted'
  | 'member_added'
  | 'member_removed'
  | 'settings_changed'
  | 'deployment'
  | 'backup';

/**
 * Health information
 */
export interface HealthInfo {
  score: number;
  status: HealthStatus;
  issues: HealthIssue[];
  recommendations: string[];
  lastCheck: string;
}

/**
 * Health status
 */
export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'unknown';

/**
 * Health issue
 */
export interface HealthIssue {
  type: IssueType;
  severity: IssueSeverity;
  description: string;
  solution?: string;
  affectedFiles?: string[];
}

/**
 * Issue types
 */
export type IssueType = 
  | 'security'
  | 'performance'
  | 'dependency'
  | 'syntax'
  | 'style'
  | 'accessibility'
  | 'seo'
  | 'compatibility';

/**
 * Issue severity
 */
export type IssueSeverity = 'info' | 'warning' | 'error' | 'critical';

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Workspace statistics
 */
export interface WorkspaceStatistics {
  fileCount: number;
  totalSize: number;
  memberCount: number;
  projectCount: number;
  lastActivity: string;
  createdAt: string;
  languages: LanguageUsage[];
  activity: DailyActivity[];
}

/**
 * Daily activity
 */
export interface DailyActivity {
  date: string;
  files: number;
  commits: number;
  deployments: number;
  activeUsers: number;
}

/**
 * Project metadata
 */
export interface ProjectMetadata {
  size: number;
  fileCount: number;
  lineCount: number;
  complexity: ComplexityMetrics;
  quality: QualityMetrics;
  security: SecurityMetrics;
  performance: PerformanceMetrics;
}

/**
 * Complexity metrics
 */
export interface ComplexityMetrics {
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  maintainabilityIndex: number;
  technicalDebt: TechnicalDebt;
}

/**
 * Technical debt
 */
export interface TechnicalDebt {
  total: number;
  rating: 'A' | 'B' | 'C' | 'D' | 'E';
  issues: TechnicalDebtIssue[];
}

/**
 * Technical debt issue
 */
export interface TechnicalDebtIssue {
  file: string;
  rule: string;
  type: DebtType;
  effort: number;
  description: string;
}

/**
 * Debt types
 */
export type DebtType = 'code_smell' | 'bug' | 'vulnerability' | 'duplication' | 'test_coverage';

/**
 * Quality metrics
 */
export interface QualityMetrics {
  testCoverage: number;
  duplication: number;
  bugs: number;
  vulnerabilities: number;
  codeSmells: number;
  rating: QualityRating;
}

/**
 * Quality rating
 */
export type QualityRating = 'A' | 'B' | 'C' | 'D' | 'E';

/**
 * Security metrics
 */
export interface SecurityMetrics {
  vulnerabilities: VulnerabilityCount;
  secrets: SecretScan;
  dependencies: DependencyScan;
  lastScan: string;
}

/**
 * Vulnerability count
 */
export interface VulnerabilityCount {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

/**
 * Secret scan results
 */
export interface SecretScan {
  found: number;
  types: SecretType[];
  files: string[];
}

/**
 * Secret types
 */
export type SecretType = 'api_key' | 'password' | 'token' | 'certificate' | 'private_key';

/**
 * Dependency scan
 */
export interface DependencyScan {
  total: number;
  vulnerable: number;
  outdated: number;
  unused: number;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  buildTime: number;
  bundleSize: number;
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Create workspace request
 */
export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
  type: WorkspaceType;
  visibility: WorkspaceVisibility;
  template?: string;
  settings?: Partial<WorkspaceSettings>;
}

/**
 * Update workspace request
 */
export interface UpdateWorkspaceRequest {
  name?: string;
  description?: string;
  visibility?: WorkspaceVisibility;
  settings?: Partial<WorkspaceSettings>;
  tags?: string[];
}

/**
 * Create project request
 */
export interface CreateProjectRequest {
  name: string;
  description?: string;
  type: ProjectType;
  visibility: ProjectVisibility;
  template?: string;
  settings?: Partial<ProjectSettings>;
}

/**
 * File operation request
 */
export interface FileOperationRequest {
  operation: FileOperation;
  path: string;
  newPath?: string;
  content?: string;
  encoding?: string;
  createDirectories?: boolean;
}

/**
 * File operations
 */
export type FileOperation = 'create' | 'read' | 'update' | 'delete' | 'move' | 'copy' | 'mkdir' | 'rmdir';

/**
 * Bulk file operation request
 */
export interface BulkFileOperationRequest {
  operations: FileOperationRequest[];
  atomic: boolean;
  continueOnError: boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Workspace permissions
 */
export interface WorkspacePermissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canCreateProject: boolean;
  canManageMembers: boolean;
  canManageSettings: boolean;
  canExport: boolean;
  canViewAnalytics: boolean;
}

/**
 * Project template
 */
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  structure: DirectoryStructure;
  files: TemplateFile[];
  variables: TemplateVariable[];
  scripts: Record<string, string>;
  dependencies: DependencyMap;
}

/**
 * Template file
 */
export interface TemplateFile {
  path: string;
  content: string;
  variables: string[];
  conditions?: string[];
}

/**
 * Template variable
 */
export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  description: string;
  default?: any;
  options?: string[];
  required?: boolean;
}

/**
 * Workspace template
 */
export interface WorkspaceTemplate {
  id: string;
  name: string;
  description: string;
  type: WorkspaceType;
  projects: ProjectTemplate[];
  settings: Partial<WorkspaceSettings>;
  integrations: WorkspaceIntegration[];
}

/**
 * Workspace integration
 */
export interface WorkspaceIntegration {
  id: string;
  name: string;
  type: IntegrationType;
  config: Record<string, any>;
  enabled: boolean;
  lastSync?: string;
  status: IntegrationStatus;
}

/**
 * Integration types
 */
export type IntegrationType = 'git' | 'slack' | 'discord' | 'jira' | 'trello' | 'github' | 'gitlab' | 'bitbucket';

/**
 * Integration status
 */
export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'syncing';

/**
 * Backup configuration
 */
export interface BackupConfig {
  enabled: boolean;
  frequency: BackupFrequency;
  retention: number;
  encryption: boolean;
  compression: boolean;
  exclude: string[];
  destinations: BackupDestination[];
}

/**
 * Backup frequency
 */
export type BackupFrequency = 'daily' | 'weekly' | 'monthly' | 'manual';

/**
 * Backup destination
 */
export interface BackupDestination {
  type: 'local' | 'cloud' | 's3' | 'gcs' | 'azure';
  config: Record<string, any>;
  enabled: boolean;
}

/**
 * File metadata
 */
export interface FileMetadata {
  language?: ProgrammingLanguage;
  lineCount: number;
  characterCount: number;
  wordCount: number;
  lastModified: string;
  lastAccessed: string;
  creator: string;
  editor?: string;
  encoding: string;
  lineEnding: 'lf' | 'crlf' | 'cr';
  bom: boolean;
  binary: boolean;
  executable: boolean;
  hidden: boolean;
  readonly: boolean;
}

/**
 * Linting configuration
 */
export interface LintingConfig {
  enabled: boolean;
  rules: LintRule[];
  ignorePatterns: string[];
  fixOnSave: boolean;
}

/**
 * Lint rule
 */
export interface LintRule {
  name: string;
  level: 'error' | 'warning' | 'info';
  config?: Record<string, any>;
}

/**
 * Formatting configuration
 */
export interface FormattingConfig {
  enabled: boolean;
  formatter: string;
  options: Record<string, any>;
  formatOnSave: boolean;
}

/**
 * Notification settings
 */
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  desktop: boolean;
  slack: boolean;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  types: NotificationType[];
}

/**
 * Notification types
 */
export type NotificationType = 
  | 'file_changes'
  | 'deployments'
  | 'member_activity'
  | 'security_alerts'
  | 'system_updates'
  | 'collaboration';

/**
 * Security settings
 */
export interface SecuritySettings {
  twoFactorRequired: boolean;
  sessionTimeout: number;
  ipWhitelist: string[];
  allowedDomains: string[];
  encryptionRequired: boolean;
  auditLogging: boolean;
  virusScanning: boolean;
}

/**
 * Collaboration settings
 */
export interface CollaborationSettings {
  realTimeEditing: boolean;
  commentSystem: boolean;
  reviewSystem: boolean;
  presenceIndicators: boolean;
  cursorSharing: boolean;
  voiceChat: boolean;
  videoChat: boolean;
  screenSharing: boolean;
}

/**
 * Contribution statistics
 */
export interface ContributionStats {
  commits: number;
  linesAdded: number;
  linesRemoved: number;
  filesModified: number;
  pullRequests: number;
  issues: number;
  reviews: number;
  lastContribution: string;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for workspace
 */
export function isWorkspace(obj: any): obj is Workspace {
  return obj && typeof obj === 'object' && typeof obj.name === 'string' && Array.isArray(obj.members);
}

/**
 * Type guard for project
 */
export function isProject(obj: any): obj is Project {
  return obj && typeof obj === 'object' && typeof obj.workspaceId === 'string';
}

/**
 * Type guard for workspace file
 */
export function isWorkspaceFile(obj: any): obj is WorkspaceFile {
  return obj && typeof obj === 'object' && typeof obj.path === 'string';
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

/**
 * Workspace response
 */
export type WorkspaceResponse<T> = ApiResponse<T>;

/**
 * Workspace list response
 */
export type WorkspaceListResponse = WorkspaceResponse<{
  workspaces: Workspace[];
  total: number;
}>;

/**
 * Project list response
 */
export type ProjectListResponse = WorkspaceResponse<{
  projects: Project[];
  total: number;
}>;

/**
 * File list response
 */
export type FileListResponse = WorkspaceResponse<{
  files: WorkspaceFile[];
  structure: DirectoryStructure;
  total: number;
}>;

/**
 * All workspace-related types
 */
export type WorkspaceTypes = 
  | Workspace
  | Project
  | WorkspaceFile
  | WorkspaceMember
  | ProjectCollaborator
  | FileVersion
  | FileLock
  | FileAnnotation;
