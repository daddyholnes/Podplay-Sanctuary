/**
 * Global Types - Application-wide Type Definitions
 * 
 * Comprehensive TypeScript types for global application state, configuration,
 * environment variables, error handling, and cross-cutting concerns.
 */

// ============================================================================
// GLOBAL APPLICATION TYPES
// ============================================================================

/**
 * Global application configuration and settings
 */
export interface GlobalConfig {
  app: AppConfig;
  api: APIConfig;
  auth: AuthConfig;
  features: FeatureFlags;
  environment: EnvironmentConfig;
  logging: LoggingConfig;
  monitoring: MonitoringConfig;
  security: SecurityConfig;
  performance: PerformanceConfig;
  ui: UIConfig;
  storage: StorageConfig;
  notifications: NotificationConfig;
  analytics: AnalyticsConfig;
  deployment: DeploymentConfig;
}

export interface AppConfig {
  name: string;
  version: string;
  description: string;
  homepage: string;
  repository: string;
  license: string;
  author: AuthorInfo;
  contributors: ContributorInfo[];
  keywords: string[];
  categories: string[];
  platforms: Platform[];
  languages: LanguageConfig[];
  defaultLanguage: string;
  defaultTimezone: string;
  buildInfo: BuildInfo;
}

export interface AuthorInfo {
  name: string;
  email: string;
  url?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  company?: string;
  social?: SocialLinks;
}

export interface ContributorInfo extends AuthorInfo {
  role: string;
  contributions: string[];
  joinDate: Date;
  lastActivity?: Date;
}

export interface SocialLinks {
  github?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
  blog?: string;
}

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  region?: string;
  flag?: string;
  enabled: boolean;
  percentage?: number;
}

export type Platform = 'web' | 'desktop' | 'mobile' | 'tablet' | 'watch' | 'tv' | 'embedded';

export interface BuildInfo {
  timestamp: Date;
  commit: string;
  branch: string;
  tag?: string;
  buildNumber: number;
  environment: Environment;
  node: string;
  npm: string;
  os: string;
  arch: string;
}

// ============================================================================
// ENVIRONMENT AND CONFIGURATION
// ============================================================================

export type Environment = 'development' | 'test' | 'staging' | 'production' | 'preview';

export interface EnvironmentConfig {
  name: Environment;
  debug: boolean;
  testing: boolean;
  production: boolean;
  preview: boolean;
  variables: EnvironmentVariables;
  urls: EnvironmentURLs;
  limits: EnvironmentLimits;
  features: Record<string, boolean>;
}

export interface EnvironmentVariables {
  // API Configuration
  API_URL: string;
  API_VERSION: string;
  API_TIMEOUT: number;
  API_RETRY_COUNT: number;
  API_RATE_LIMIT: number;
  
  // Authentication
  AUTH_PROVIDER: string;
  AUTH_CLIENT_ID: string;
  AUTH_REDIRECT_URI: string;
  AUTH_SCOPE: string;
  AUTH_TOKEN_STORAGE: 'localStorage' | 'sessionStorage' | 'memory' | 'cookie';
  
  // Database
  DATABASE_URL?: string;
  DATABASE_SSL: boolean;
  DATABASE_POOL_SIZE: number;
  DATABASE_TIMEOUT: number;
  
  // Cache
  CACHE_PROVIDER: 'memory' | 'redis' | 'memcached' | 'file';
  CACHE_TTL: number;
  CACHE_MAX_SIZE: number;
  
  // Storage
  STORAGE_PROVIDER: 'local' | 's3' | 'gcs' | 'azure' | 'cloudinary';
  STORAGE_BUCKET?: string;
  STORAGE_REGION?: string;
  STORAGE_CDN_URL?: string;
  
  // AI Services
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  GOOGLE_AI_API_KEY?: string;
  AI_MODEL_PROVIDER: string;
  AI_MODEL_NAME: string;
  AI_MAX_TOKENS: number;
  AI_TEMPERATURE: number;
  
  // Monitoring
  SENTRY_DSN?: string;
  ANALYTICS_ID?: string;
  LOG_LEVEL: LogLevel;
  METRICS_ENABLED: boolean;
  
  // Features
  FEATURE_REAL_TIME: boolean;
  FEATURE_OFFLINE: boolean;
  FEATURE_PWA: boolean;
  FEATURE_NOTIFICATIONS: boolean;
  FEATURE_ANALYTICS: boolean;
  
  // Security
  ENCRYPTION_KEY?: string;
  JWT_SECRET?: string;
  CORS_ORIGINS: string;
  CSP_ENABLED: boolean;
  HTTPS_ONLY: boolean;
  
  // Performance
  CACHE_ENABLED: boolean;
  COMPRESSION_ENABLED: boolean;
  LAZY_LOADING: boolean;
  PRELOAD_CRITICAL: boolean;
  
  // Custom
  [key: string]: string | number | boolean | undefined;
}

export interface EnvironmentURLs {
  app: string;
  api: string;
  auth: string;
  cdn: string;
  docs: string;
  support: string;
  status: string;
  blog?: string;
  marketing?: string;
}

export interface EnvironmentLimits {
  maxFileSize: number;
  maxUploadSize: number;
  maxRequestSize: number;
  maxConcurrentRequests: number;
  maxCacheSize: number;
  maxLogSize: number;
  rateLimitRequests: number;
  rateLimitWindow: number;
}

// ============================================================================
// FEATURE FLAGS AND TOGGLES
// ============================================================================

export interface FeatureFlags {
  // Core Features
  realTimeChat: boolean;
  voiceCommands: boolean;
  offlineMode: boolean;
  darkMode: boolean;
  accessibility: boolean;
  analytics: boolean;
  telemetry: boolean;
  
  // AI Features
  aiAssistant: boolean;
  aiCodeCompletion: boolean;
  aiCodeReview: boolean;
  aiExplanations: boolean;
  aiTranslation: boolean;
  aiSuggestions: boolean;
  
  // Scout Features
  codeAnalysis: boolean;
  performanceMonitoring: boolean;
  securityScanning: boolean;
  dependencyTracking: boolean;
  qualityMetrics: boolean;
  technicalDebtAnalysis: boolean;
  
  // Workspace Features
  collaboration: boolean;
  versionControl: boolean;
  fileSharing: boolean;
  realTimeEditing: boolean;
  commentSystem: boolean;
  taskManagement: boolean;
  
  // MCP Features
  toolIntegration: boolean;
  resourceManagement: boolean;
  promptTemplates: boolean;
  serverConnections: boolean;
  customTools: boolean;
  
  // UI Features
  advancedThemes: boolean;
  customLayouts: boolean;
  dragAndDrop: boolean;
  shortcuts: boolean;
  commandPalette: boolean;
  searchEverywhere: boolean;
  
  // Integration Features
  githubIntegration: boolean;
  slackIntegration: boolean;
  discordIntegration: boolean;
  jiraIntegration: boolean;
  figmaIntegration: boolean;
  
  // Experimental Features
  experimental: Record<string, boolean>;
  beta: Record<string, boolean>;
  alpha: Record<string, boolean>;
}

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  defaultValue: boolean;
  environment?: Environment[];
  userGroups?: string[];
  percentage?: number;
  conditions?: FeatureCondition[];
  metadata: FeatureFlagMetadata;
}

export interface FeatureCondition {
  type: 'user' | 'environment' | 'date' | 'version' | 'custom';
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

export interface FeatureFlagMetadata {
  category: string;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  tags: string[];
  documentation?: string;
  rolloutPercentage?: number;
  dependencies?: string[];
}

// ============================================================================
// GLOBAL ERROR HANDLING
// ============================================================================

export interface GlobalError extends Error {
  code: ErrorCode;
  category: ErrorCategory;
  severity: ErrorSeverity;
  context: ErrorContext;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  stack?: string;
  cause?: Error;
  metadata?: ErrorMetadata;
}

export type ErrorCode = 
  | 'UNKNOWN_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'CONFLICT_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'SERVER_ERROR'
  | 'CLIENT_ERROR'
  | 'PARSE_ERROR'
  | 'FILE_ERROR'
  | 'DATABASE_ERROR'
  | 'CACHE_ERROR'
  | 'STORAGE_ERROR'
  | 'AI_ERROR'
  | 'MCP_ERROR'
  | 'SCOUT_ERROR'
  | 'WORKSPACE_ERROR'
  | 'CHAT_ERROR'
  | 'UI_ERROR'
  | 'CONFIGURATION_ERROR'
  | 'DEPENDENCY_ERROR'
  | 'SECURITY_ERROR'
  | 'PERFORMANCE_ERROR'
  | 'FEATURE_ERROR'
  | 'INTEGRATION_ERROR'
  | 'EXPERIMENTAL_ERROR';

export type ErrorCategory = 
  | 'system'
  | 'network'
  | 'security'
  | 'validation'
  | 'business'
  | 'integration'
  | 'performance'
  | 'user'
  | 'configuration'
  | 'external';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorContext {
  component?: string;
  function?: string;
  file?: string;
  line?: number;
  column?: number;
  url?: string;
  userAgent?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  action?: string;
  input?: any;
  state?: any;
  environment?: Environment;
  version?: string;
  timestamp: Date;
}

export interface ErrorMetadata {
  retryable: boolean;
  userVisible: boolean;
  reportable: boolean;
  expectedError: boolean;
  recoverable: boolean;
  actions?: ErrorAction[];
  relatedErrors?: string[];
  documentation?: string;
  resolution?: string;
  tags?: string[];
}

export interface ErrorAction {
  type: 'retry' | 'refresh' | 'logout' | 'redirect' | 'report' | 'ignore' | 'custom';
  label: string;
  description?: string;
  action: () => void;
  primary?: boolean;
  destructive?: boolean;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: GlobalError;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
  lastRetry?: Date;
}

export interface ErrorHandler {
  handleError: (error: GlobalError) => void;
  reportError: (error: GlobalError) => Promise<void>;
  recoverFromError: (error: GlobalError) => Promise<boolean>;
  shouldRetry: (error: GlobalError) => boolean;
  getErrorMessage: (error: GlobalError) => string;
  getErrorActions: (error: GlobalError) => ErrorAction[];
}

// ============================================================================
// LOGGING AND MONITORING
// ============================================================================

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'silent';

export interface LoggingConfig {
  level: LogLevel;
  console: boolean;
  file: boolean;
  remote: boolean;
  structured: boolean;
  includeTimestamp: boolean;
  includeLevel: boolean;
  includeContext: boolean;
  includeStack: boolean;
  maxFileSize: number;
  maxFiles: number;
  destinations: LogDestination[];
  filters: LogFilter[];
  formatters: LogFormatter[];
}

export interface LogDestination {
  type: 'console' | 'file' | 'http' | 'websocket' | 'database' | 'custom';
  name: string;
  enabled: boolean;
  level: LogLevel;
  format: 'json' | 'text' | 'custom';
  configuration: Record<string, any>;
}

export interface LogFilter {
  level?: LogLevel;
  category?: string;
  component?: string;
  userId?: string;
  sessionId?: string;
  pattern?: RegExp;
  custom?: (entry: LogEntry) => boolean;
}

export interface LogFormatter {
  type: 'json' | 'text' | 'template' | 'custom';
  template?: string;
  formatter?: (entry: LogEntry) => string;
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  category?: string;
  component?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  context?: Record<string, any>;
  error?: Error;
  stack?: string;
  metadata?: Record<string, any>;
}

export interface MonitoringConfig {
  enabled: boolean;
  metrics: MetricsConfig;
  tracing: TracingConfig;
  profiling: ProfilingConfig;
  alerts: AlertConfig;
  dashboards: DashboardConfig[];
}

export interface MetricsConfig {
  enabled: boolean;
  interval: number;
  retention: number;
  tags: Record<string, string>;
  custom: CustomMetric[];
}

export interface CustomMetric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  description: string;
  labels: string[];
  unit?: string;
}

export interface TracingConfig {
  enabled: boolean;
  sampling: number;
  service: string;
  version: string;
  environment: Environment;
  exporters: TracingExporter[];
}

export interface TracingExporter {
  type: 'console' | 'jaeger' | 'zipkin' | 'otlp' | 'custom';
  endpoint?: string;
  headers?: Record<string, string>;
  compression?: 'gzip' | 'none';
}

export interface ProfilingConfig {
  enabled: boolean;
  cpu: boolean;
  memory: boolean;
  interval: number;
  duration: number;
  endpoint?: string;
}

export interface AlertConfig {
  enabled: boolean;
  channels: AlertChannel[];
  rules: AlertRule[];
}

export interface AlertChannel {
  type: 'email' | 'slack' | 'discord' | 'webhook' | 'sms' | 'push';
  name: string;
  configuration: Record<string, any>;
  enabled: boolean;
}

export interface AlertRule {
  name: string;
  condition: string;
  threshold: number;
  duration: number;
  severity: ErrorSeverity;
  channels: string[];
  enabled: boolean;
}

export interface DashboardConfig {
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  refresh: number;
  timeRange: TimeRange;
}

export interface DashboardWidget {
  type: 'metric' | 'chart' | 'table' | 'text' | 'alert' | 'custom';
  title: string;
  query: string;
  position: WidgetPosition;
  size: WidgetSize;
  configuration: Record<string, any>;
}

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  gap: number;
  responsive: boolean;
}

export interface TimeRange {
  start: Date | string;
  end: Date | string;
  relative?: string;
}

// ============================================================================
// PERFORMANCE AND OPTIMIZATION
// ============================================================================

export interface PerformanceConfig {
  monitoring: boolean;
  optimization: OptimizationConfig;
  caching: CacheConfig;
  bundling: BundleConfig;
  lazy: LazyLoadingConfig;
  prefetch: PrefetchConfig;
  compression: CompressionConfig;
  minification: MinificationConfig;
}

export interface OptimizationConfig {
  images: boolean;
  fonts: boolean;
  css: boolean;
  javascript: boolean;
  html: boolean;
  treeshaking: boolean;
  deadcode: boolean;
  splitting: boolean;
}

export interface CacheConfig {
  browser: BrowserCacheConfig;
  service: ServiceCacheConfig;
  api: APICacheConfig;
  assets: AssetCacheConfig;
}

export interface BrowserCacheConfig {
  enabled: boolean;
  storage: 'localStorage' | 'sessionStorage' | 'indexedDB' | 'memory';
  maxSize: number;
  ttl: number;
  compression: boolean;
  encryption: boolean;
}

export interface ServiceCacheConfig {
  enabled: boolean;
  provider: 'memory' | 'redis' | 'memcached' | 'file';
  maxSize: number;
  ttl: number;
  strategy: 'lru' | 'lfu' | 'fifo' | 'ttl';
}

export interface APICacheConfig {
  enabled: boolean;
  headers: boolean;
  etag: boolean;
  lastModified: boolean;
  maxAge: number;
  staleWhileRevalidate: number;
}

export interface AssetCacheConfig {
  enabled: boolean;
  versioning: boolean;
  cdn: boolean;
  compression: boolean;
  immutable: boolean;
  maxAge: number;
}

export interface BundleConfig {
  splitting: boolean;
  chunks: ChunkConfig;
  optimization: BundleOptimization;
  analysis: boolean;
  sourceMap: boolean | 'inline' | 'external';
}

export interface ChunkConfig {
  vendor: boolean;
  common: boolean;
  runtime: boolean;
  async: boolean;
  maxSize: number;
  minSize: number;
}

export interface BundleOptimization {
  minimize: boolean;
  concatenate: boolean;
  dedupe: boolean;
  scope: boolean;
  sideEffects: boolean;
}

export interface LazyLoadingConfig {
  enabled: boolean;
  components: boolean;
  routes: boolean;
  images: boolean;
  iframes: boolean;
  threshold: number;
  rootMargin: string;
}

export interface PrefetchConfig {
  enabled: boolean;
  routes: boolean;
  resources: boolean;
  api: boolean;
  priority: PrefetchPriority[];
}

export interface PrefetchPriority {
  pattern: string;
  priority: 'high' | 'medium' | 'low';
  condition?: string;
}

export interface CompressionConfig {
  enabled: boolean;
  algorithm: 'gzip' | 'brotli' | 'deflate';
  level: number;
  threshold: number;
  exclude: string[];
}

export interface MinificationConfig {
  html: boolean;
  css: boolean;
  javascript: boolean;
  json: boolean;
  svg: boolean;
  removeComments: boolean;
  removeWhitespace: boolean;
  shortenNames: boolean;
}

// ============================================================================
// SECURITY CONFIGURATION
// ============================================================================

export interface SecurityConfig {
  authentication: SecurityAuthConfig;
  authorization: SecurityAuthzConfig;
  encryption: EncryptionConfig;
  headers: SecurityHeaders;
  csp: CSPConfig;
  cors: CORSConfig;
  rate: RateLimitConfig;
  validation: SecurityValidationConfig;
  audit: AuditConfig;
}

export interface SecurityAuthConfig {
  required: boolean;
  providers: string[];
  sessionTimeout: number;
  refreshTokenRotation: boolean;
  multiFactorAuth: boolean;
  passwordPolicy: PasswordPolicy;
}

export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  prohibitCommon: boolean;
  prohibitPersonal: boolean;
  historyCount: number;
  expirationDays: number;
}

export interface SecurityAuthzConfig {
  enabled: boolean;
  model: 'rbac' | 'abac' | 'acl' | 'custom';
  defaultDeny: boolean;
  inheritance: boolean;
  caching: boolean;
  audit: boolean;
}

export interface EncryptionConfig {
  atRest: boolean;
  inTransit: boolean;
  algorithm: string;
  keySize: number;
  keyRotation: boolean;
  keyRotationInterval: number;
}

export interface SecurityHeaders {
  hsts: boolean;
  xss: boolean;
  contentType: boolean;
  frameOptions: boolean;
  referrer: boolean;
  permissions: boolean;
  custom: Record<string, string>;
}

export interface CSPConfig {
  enabled: boolean;
  reportOnly: boolean;
  defaultSrc: string[];
  scriptSrc: string[];
  styleSrc: string[];
  imgSrc: string[];
  fontSrc: string[];
  connectSrc: string[];
  mediaSrc: string[];
  objectSrc: string[];
  frameSrc: string[];
  childSrc: string[];
  formAction: string[];
  frameAncestors: string[];
  baseUri: string[];
  reportUri?: string;
}

export interface CORSConfig {
  enabled: boolean;
  origins: string[];
  methods: string[];
  headers: string[];
  credentials: boolean;
  maxAge: number;
  preflightContinue: boolean;
  optionsSuccessStatus: number;
}

export interface RateLimitConfig {
  enabled: boolean;
  window: number;
  max: number;
  message: string;
  statusCode: number;
  headers: boolean;
  store: 'memory' | 'redis' | 'database';
  keyGenerator?: string;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
}

export interface SecurityValidationConfig {
  input: boolean;
  output: boolean;
  files: boolean;
  uploads: boolean;
  strict: boolean;
  sanitization: boolean;
  encoding: boolean;
}

export interface AuditConfig {
  enabled: boolean;
  events: string[];
  storage: 'database' | 'file' | 'remote';
  retention: number;
  encryption: boolean;
  integrity: boolean;
}

// ============================================================================
// NOTIFICATION CONFIGURATION
// ============================================================================

export interface NotificationConfig {
  enabled: boolean;
  channels: NotificationChannel[];
  templates: NotificationTemplate[];
  preferences: NotificationPreferences;
  delivery: DeliveryConfig;
  tracking: TrackingConfig;
}

export interface NotificationChannel {
  type: 'email' | 'sms' | 'push' | 'in-app' | 'webhook' | 'slack' | 'discord';
  name: string;
  enabled: boolean;
  configuration: Record<string, any>;
  rateLimit?: RateLimitConfig;
  fallback?: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  subject?: string;
  body: string;
  variables: TemplateVariable[];
  localization: Record<string, NotificationLocalization>;
  metadata: TemplateMetadata;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object';
  required: boolean;
  default?: any;
  description: string;
}

export interface NotificationLocalization {
  subject?: string;
  body: string;
  variables?: Record<string, string>;
}

export interface TemplateMetadata {
  category: string;
  tags: string[];
  version: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreferences {
  global: boolean;
  channels: Record<string, boolean>;
  categories: Record<string, CategoryPreference>;
  quiet: QuietHours;
  frequency: FrequencyConfig;
}

export interface CategoryPreference {
  enabled: boolean;
  channels: string[];
  priority: 'high' | 'medium' | 'low';
  digest: boolean;
}

export interface QuietHours {
  enabled: boolean;
  start: string;
  end: string;
  timezone: string;
  days: string[];
  exceptions: string[];
}

export interface FrequencyConfig {
  immediate: string[];
  hourly: string[];
  daily: string[];
  weekly: string[];
  monthly: string[];
}

export interface DeliveryConfig {
  retries: number;
  timeout: number;
  exponentialBackoff: boolean;
  circuitBreaker: boolean;
  deadLetter: boolean;
  batch: BatchConfig;
}

export interface BatchConfig {
  enabled: boolean;
  size: number;
  timeout: number;
  strategy: 'count' | 'time' | 'size';
}

export interface TrackingConfig {
  enabled: boolean;
  events: string[];
  storage: string;
  retention: number;
  analytics: boolean;
}

// ============================================================================
// ANALYTICS CONFIGURATION
// ============================================================================

export interface AnalyticsConfig {
  enabled: boolean;
  providers: AnalyticsProvider[];
  events: EventConfig;
  user: UserTrackingConfig;
  performance: PerformanceTrackingConfig;
  privacy: PrivacyConfig;
  reporting: ReportingConfig;
}

export interface AnalyticsProvider {
  name: string;
  type: 'google' | 'mixpanel' | 'amplitude' | 'segment' | 'custom';
  enabled: boolean;
  configuration: Record<string, any>;
  sampling?: number;
  filters?: string[];
}

export interface EventConfig {
  automatic: boolean;
  custom: boolean;
  pageViews: boolean;
  interactions: boolean;
  errors: boolean;
  performance: boolean;
  business: boolean;
}

export interface UserTrackingConfig {
  enabled: boolean;
  anonymous: boolean;
  properties: string[];
  segmentation: boolean;
  cohorts: boolean;
  journeys: boolean;
}

export interface PerformanceTrackingConfig {
  enabled: boolean;
  timing: boolean;
  resources: boolean;
  vitals: boolean;
  custom: boolean;
  sampling: number;
}

export interface PrivacyConfig {
  gdpr: boolean;
  ccpa: boolean;
  consent: boolean;
  anonymization: boolean;
  retention: number;
  deletion: boolean;
}

export interface ReportingConfig {
  realtime: boolean;
  scheduled: ScheduledReport[];
  dashboards: string[];
  alerts: AnalyticsAlert[];
}

export interface ScheduledReport {
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  format: 'pdf' | 'csv' | 'json';
  metrics: string[];
}

export interface AnalyticsAlert {
  name: string;
  condition: string;
  threshold: number;
  recipients: string[];
  enabled: boolean;
}

// ============================================================================
// DEPLOYMENT CONFIGURATION
// ============================================================================

export interface DeploymentConfig {
  environment: Environment;
  platform: DeploymentPlatform;
  strategy: DeploymentStrategy;
  automation: AutomationConfig;
  rollback: RollbackConfig;
  monitoring: DeploymentMonitoring;
  secrets: SecretsConfig;
  infrastructure: InfrastructureConfig;
}

export interface DeploymentPlatform {
  type: 'vercel' | 'netlify' | 'aws' | 'azure' | 'gcp' | 'docker' | 'kubernetes' | 'custom';
  region: string[];
  configuration: Record<string, any>;
  scaling: ScalingConfig;
  backup: BackupConfig;
}

export interface DeploymentStrategy {
  type: 'rolling' | 'blue-green' | 'canary' | 'recreate' | 'custom';
  phases: DeploymentPhase[];
  validation: ValidationStep[];
  approval: ApprovalConfig;
}

export interface DeploymentPhase {
  name: string;
  percentage?: number;
  duration?: number;
  criteria: string[];
  rollback: boolean;
}

export interface ValidationStep {
  name: string;
  type: 'health' | 'performance' | 'security' | 'custom';
  timeout: number;
  retries: number;
  criteria: string[];
}

export interface ApprovalConfig {
  required: boolean;
  approvers: string[];
  timeout: number;
  automatic: boolean;
}

export interface AutomationConfig {
  ci: boolean;
  cd: boolean;
  testing: TestingAutomation;
  building: BuildingAutomation;
  deployment: DeploymentAutomation;
}

export interface TestingAutomation {
  unit: boolean;
  integration: boolean;
  e2e: boolean;
  performance: boolean;
  security: boolean;
  coverage: CoverageConfig;
}

export interface CoverageConfig {
  threshold: number;
  enforced: boolean;
  format: string[];
  exclude: string[];
}

export interface BuildingAutomation {
  triggers: string[];
  cache: boolean;
  parallel: boolean;
  artifacts: ArtifactConfig;
}

export interface ArtifactConfig {
  retention: number;
  compression: boolean;
  signing: boolean;
  storage: string;
}

export interface DeploymentAutomation {
  triggers: string[];
  environments: string[];
  approval: boolean;
  rollback: boolean;
  notification: boolean;
}

export interface RollbackConfig {
  automatic: boolean;
  triggers: string[];
  strategy: 'immediate' | 'gradual' | 'manual';
  retention: number;
  validation: boolean;
}

export interface DeploymentMonitoring {
  health: boolean;
  performance: boolean;
  errors: boolean;
  metrics: string[];
  alerts: string[];
  dashboards: string[];
}

export interface SecretsConfig {
  provider: 'env' | 'vault' | 'aws' | 'azure' | 'gcp' | 'custom';
  encryption: boolean;
  rotation: boolean;
  audit: boolean;
  sync: boolean;
}

export interface InfrastructureConfig {
  type: 'serverless' | 'containers' | 'vm' | 'managed' | 'hybrid';
  resources: ResourceConfig;
  networking: NetworkConfig;
  storage: StorageInfraConfig;
  compute: ComputeConfig;
}

export interface ResourceConfig {
  cpu: string;
  memory: string;
  storage: string;
  network: string;
  limits: ResourceLimits;
}

export interface ResourceLimits {
  maxCpu: string;
  maxMemory: string;
  maxStorage: string;
  maxConnections: number;
}

export interface NetworkConfig {
  vpc: boolean;
  subnets: string[];
  security: SecurityGroupConfig[];
  loadBalancer: LoadBalancerConfig;
  cdn: CDNConfig;
}

export interface SecurityGroupConfig {
  name: string;
  rules: SecurityRule[];
}

export interface SecurityRule {
  protocol: string;
  port: number | string;
  source: string;
  direction: 'inbound' | 'outbound';
}

export interface LoadBalancerConfig {
  type: 'application' | 'network' | 'classic';
  health: HealthCheckConfig;
  ssl: boolean;
  sticky: boolean;
}

export interface HealthCheckConfig {
  path: string;
  interval: number;
  timeout: number;
  healthy: number;
  unhealthy: number;
}

export interface CDNConfig {
  enabled: boolean;
  provider: string;
  caching: CDNCacheConfig;
  compression: boolean;
  ssl: boolean;
}

export interface CDNCacheConfig {
  ttl: number;
  headers: string[];
  queryStrings: boolean;
  cookies: boolean;
}

export interface StorageInfraConfig {
  type: 'block' | 'object' | 'file' | 'database';
  provider: string;
  backup: boolean;
  encryption: boolean;
  replication: boolean;
}

export interface ComputeConfig {
  type: 'serverless' | 'container' | 'vm';
  scaling: AutoScalingConfig;
  scheduling: SchedulingConfig;
  monitoring: ComputeMonitoring;
}

export interface AutoScalingConfig {
  enabled: boolean;
  min: number;
  max: number;
  target: number;
  metrics: string[];
  cooldown: number;
}

export interface SchedulingConfig {
  strategy: 'spread' | 'binpack' | 'random';
  constraints: string[];
  affinity: string[];
  tolerations: string[];
}

export interface ComputeMonitoring {
  cpu: boolean;
  memory: boolean;
  disk: boolean;
  network: boolean;
  custom: string[];
}

// ============================================================================
// STORAGE CONFIGURATION
// ============================================================================

export interface StorageConfig {
  local: LocalStorageConfig;
  session: SessionStorageConfig;
  indexedDB: IndexedDBConfig;
  cache: StorageCacheConfig;
  cloud: CloudStorageConfig;
  cdn: CDNStorageConfig;
}

export interface LocalStorageConfig {
  enabled: boolean;
  namespace: string;
  encryption: boolean;
  compression: boolean;
  maxSize: number;
  ttl: number;
  fallback: boolean;
}

export interface SessionStorageConfig {
  enabled: boolean;
  namespace: string;
  encryption: boolean;
  compression: boolean;
  maxSize: number;
  fallback: boolean;
}

export interface IndexedDBConfig {
  enabled: boolean;
  database: string;
  version: number;
  stores: IndexedDBStore[];
  encryption: boolean;
  compression: boolean;
  maxSize: number;
}

export interface IndexedDBStore {
  name: string;
  keyPath: string;
  autoIncrement: boolean;
  indexes: IndexedDBIndex[];
}

export interface IndexedDBIndex {
  name: string;
  keyPath: string;
  unique: boolean;
  multiEntry: boolean;
}

export interface StorageCacheConfig {
  enabled: boolean;
  strategy: 'lru' | 'lfu' | 'fifo' | 'ttl';
  maxSize: number;
  maxItems: number;
  ttl: number;
  compression: boolean;
}

export interface CloudStorageConfig {
  provider: 'aws' | 'azure' | 'gcp' | 'custom';
  bucket: string;
  region: string;
  encryption: boolean;
  versioning: boolean;
  lifecycle: LifecycleConfig[];
}

export interface LifecycleConfig {
  rule: string;
  days: number;
  action: 'delete' | 'archive' | 'transition';
  storage: string;
}

export interface CDNStorageConfig {
  enabled: boolean;
  provider: string;
  domain: string;
  ssl: boolean;
  compression: boolean;
  caching: CDNCacheConfig;
}

// ============================================================================
// UI CONFIGURATION
// ============================================================================

export interface UIConfig {
  theme: UIThemeConfig;
  layout: UILayoutConfig;
  components: UIComponentConfig;
  accessibility: UIAccessibilityConfig;
  animations: UIAnimationConfig;
  responsive: ResponsiveConfig;
  localization: LocalizationConfig;
}

export interface UIThemeConfig {
  default: string;
  available: string[];
  custom: boolean;
  switching: boolean;
  persistence: boolean;
  system: boolean;
}

export interface UILayoutConfig {
  sidebar: boolean;
  header: boolean;
  footer: boolean;
  breadcrumbs: boolean;
  tabs: boolean;
  panels: boolean;
}

export interface UIComponentConfig {
  lazyLoading: boolean;
  errorBoundaries: boolean;
  suspense: boolean;
  memoization: boolean;
  virtualization: boolean;
}

export interface UIAccessibilityConfig {
  enabled: boolean;
  screenReader: boolean;
  keyboard: boolean;
  focus: boolean;
  contrast: boolean;
  motion: boolean;
  text: boolean;
}

export interface UIAnimationConfig {
  enabled: boolean;
  duration: string;
  easing: string;
  prefers: boolean;
  performance: boolean;
}

export interface ResponsiveConfig {
  enabled: boolean;
  breakpoints: Record<string, string>;
  mobile: boolean;
  tablet: boolean;
  desktop: boolean;
  touch: boolean;
}

export interface LocalizationConfig {
  enabled: boolean;
  default: string;
  available: string[];
  fallback: string;
  lazy: boolean;
  namespace: boolean;
  pluralization: boolean;
  formatting: FormattingConfig;
}

export interface FormattingConfig {
  numbers: boolean;
  dates: boolean;
  currency: boolean;
  relative: boolean;
  timezone: boolean;
}

// ============================================================================
// API CONFIGURATION
// ============================================================================

export interface APIConfig {
  baseURL: string;
  version: string;
  timeout: number;
  retries: number;
  rateLimit: number;
  pagination: PaginationConfig;
  authentication: APIAuthConfig;
  caching: APICacheConfig;
  validation: APIValidationConfig;
  documentation: APIDocConfig;
  monitoring: APIMonitoringConfig;
  testing: APITestingConfig;
}

export interface PaginationConfig {
  strategy: 'offset' | 'cursor' | 'page';
  defaultLimit: number;
  maxLimit: number;
  countTotal: boolean;
}

export interface APIAuthConfig {
  type: 'bearer' | 'basic' | 'oauth2' | 'api-key' | 'custom';
  header: string;
  prefix: string;
  refresh: boolean;
  storage: 'memory' | 'localStorage' | 'sessionStorage' | 'cookie';
}

export interface APIValidationConfig {
  request: boolean;
  response: boolean;
  schema: boolean;
  strict: boolean;
}

export interface APIDocConfig {
  enabled: boolean;
  format: 'openapi' | 'swagger' | 'graphql' | 'custom';
  version: string;
  endpoint: string;
  ui: boolean;
}

export interface APIMonitoringConfig {
  enabled: boolean;
  metrics: boolean;
  tracing: boolean;
  logging: boolean;
  errors: boolean;
  performance: boolean;
}

export interface APITestingConfig {
  enabled: boolean;
  mocking: boolean;
  fixtures: boolean;
  recording: boolean;
  contracts: boolean;
}

// ============================================================================
// AUTH CONFIGURATION
// ============================================================================

export interface AuthConfig {
  required: boolean;
  providers: AuthProvider[];
  session: SessionConfig;
  tokens: TokenConfig;
  permissions: PermissionConfig;
  security: AuthSecurityConfig;
  flows: AuthFlowConfig[];
}

export interface AuthProvider {
  name: string;
  type: 'oauth2' | 'saml' | 'ldap' | 'custom';
  enabled: boolean;
  configuration: Record<string, any>;
  scopes: string[];
  claims: string[];
}

export interface SessionConfig {
  timeout: number;
  renewal: boolean;
  concurrent: boolean;
  tracking: boolean;
  storage: 'memory' | 'database' | 'redis';
}

export interface TokenConfig {
  access: TokenTypeConfig;
  refresh: TokenTypeConfig;
  id: TokenTypeConfig;
}

export interface TokenTypeConfig {
  algorithm: string;
  expiration: number;
  issuer: string;
  audience: string;
  claims: string[];
  validation: boolean;
}

export interface PermissionConfig {
  model: 'rbac' | 'abac' | 'acl';
  inheritance: boolean;
  caching: boolean;
  defaultDeny: boolean;
}

export interface AuthSecurityConfig {
  mfa: boolean;
  bruteForce: boolean;
  passwordPolicy: PasswordPolicy;
  lockout: LockoutConfig;
  audit: boolean;
}

export interface LockoutConfig {
  enabled: boolean;
  attempts: number;
  duration: number;
  progressive: boolean;
}

export interface AuthFlowConfig {
  name: string;
  type: 'authorization_code' | 'implicit' | 'client_credentials' | 'password' | 'device';
  enabled: boolean;
  configuration: Record<string, any>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type guards for global types
 */
export const isGlobalConfig = (obj: any): obj is GlobalConfig => {
  return obj && obj.app && obj.api && obj.auth && obj.features;
};

export const isEnvironment = (value: string): value is Environment => {
  return ['development', 'test', 'staging', 'production', 'preview'].includes(value);
};

export const isLogLevel = (value: string): value is LogLevel => {
  return ['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'].includes(value);
};

export const isErrorSeverity = (value: string): value is ErrorSeverity => {
  return ['low', 'medium', 'high', 'critical'].includes(value);
};

/**
 * Configuration builders
 */
export interface ConfigBuilder {
  build(): GlobalConfig;
  validate(): ConfigValidationResult;
  merge(config: Partial<GlobalConfig>): ConfigBuilder;
  environment(env: Environment): ConfigBuilder;
  feature(key: string, enabled: boolean): ConfigBuilder;
}

export interface ConfigValidationResult {
  valid: boolean;
  errors: ConfigValidationError[];
  warnings: ConfigValidationWarning[];
}

export interface ConfigValidationError {
  path: string;
  message: string;
  code: string;
  severity: ErrorSeverity;
}

export interface ConfigValidationWarning {
  path: string;
  message: string;
  recommendation: string;
}

/**
 * Global event types
 */
export type GlobalEventHandler<T = any> = (event: GlobalEvent<T>) => void;

export interface GlobalEvent<T = any> {
  type: string;
  data: T;
  timestamp: Date;
  source: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface GlobalEventBus {
  emit<T>(type: string, data: T): void;
  on<T>(type: string, handler: GlobalEventHandler<T>): () => void;
  off<T>(type: string, handler: GlobalEventHandler<T>): void;
  once<T>(type: string, handler: GlobalEventHandler<T>): void;
  clear(): void;
  getListeners(type?: string): GlobalEventHandler[];
}

/**
 * Global state types
 */
export interface GlobalState {
  config: GlobalConfig;
  user?: UserState;
  session?: SessionState;
  features: FeatureFlags;
  errors: GlobalError[];
  notifications: NotificationState[];
  performance: PerformanceState;
  monitoring: MonitoringState;
}

export interface UserState {
  id: string;
  profile: UserProfile;
  preferences: UserPreferences;
  permissions: UserPermissions;
  session: UserSession;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  timezone: string;
  language: string;
  created: Date;
  updated: Date;
}

export interface UserPreferences {
  theme: string;
  language: string;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  accessibility: AccessibilityPreferences;
}

export interface PrivacyPreferences {
  analytics: boolean;
  tracking: boolean;
  cookies: boolean;
  sharing: boolean;
}

export interface AccessibilityPreferences {
  reduceMotion: boolean;
  highContrast: boolean;
  screenReader: boolean;
  fontSize: number;
  keyboardNavigation: boolean;
}

export interface UserPermissions {
  roles: string[];
  permissions: string[];
  restrictions: string[];
}

export interface UserSession {
  id: string;
  token: string;
  refreshToken?: string;
  expiresAt: Date;
  lastActivity: Date;
  device: DeviceInfo;
  location: LocationInfo;
}

export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  version: string;
  userAgent: string;
}

export interface LocationInfo {
  country?: string;
  region?: string;
  city?: string;
  timezone: string;
  ip?: string;
}

export interface SessionState {
  id: string;
  startTime: Date;
  lastActivity: Date;
  events: SessionEvent[];
  context: SessionContext;
}

export interface SessionEvent {
  type: string;
  timestamp: Date;
  data: any;
}

export interface SessionContext {
  url: string;
  referrer?: string;
  userAgent: string;
  viewport: ViewportInfo;
  connection: ConnectionInfo;
}

export interface ViewportInfo {
  width: number;
  height: number;
  pixelRatio: number;
  orientation: 'portrait' | 'landscape';
}

export interface ConnectionInfo {
  type: 'slow-2g' | '2g' | '3g' | '4g' | 'wifi' | 'ethernet' | 'unknown';
  effectiveType: string;
  downlink: number;
  rtt: number;
}

export interface PerformanceState {
  metrics: PerformanceMetrics;
  vitals: WebVitals;
  resources: ResourceTiming[];
  navigation: NavigationTiming;
}

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactiveTime: number;
  bundleSize: number;
  memoryUsage: number;
  fps: number;
}

export interface WebVitals {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

export interface ResourceTiming {
  name: string;
  type: string;
  duration: number;
  size: number;
  cached: boolean;
}

export interface NavigationTiming {
  type: 'navigate' | 'reload' | 'back_forward' | 'prerender';
  redirectCount: number;
  duration: number;
  domContentLoaded: number;
  loadComplete: number;
}

export interface MonitoringState {
  health: HealthStatus;
  metrics: SystemMetrics;
  alerts: Alert[];
  traces: TraceData[];
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheck[];
  lastUpdated: Date;
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  duration: number;
  message?: string;
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  requests: number;
  errors: number;
  latency: number;
}

export interface Alert {
  id: string;
  type: string;
  severity: ErrorSeverity;
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export interface TraceData {
  id: string;
  operation: string;
  duration: number;
  spans: SpanData[];
  timestamp: Date;
}

export interface SpanData {
  id: string;
  name: string;
  duration: number;
  tags: Record<string, any>;
  logs: LogEntry[];
}
