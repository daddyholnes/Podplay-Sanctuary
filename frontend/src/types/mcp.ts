/**
 * MCP Types - Model Context Protocol Type Definitions
 * 
 * Comprehensive TypeScript types for the Model Context Protocol (MCP) system,
 * covering server connections, tool definitions, resource management,
 * authentication, and communication protocols.
 */

// ============================================================================
// CORE MCP TYPES
// ============================================================================

/**
 * MCP Server connection and configuration
 */
export interface MCPServer {
  id: string;
  name: string;
  description: string;
  version: string;
  url: string;
  protocol: MCPProtocol;
  status: MCPServerStatus;
  capabilities: MCPCapabilities;
  authentication: MCPAuthentication;
  configuration: MCPServerConfiguration;
  metadata: MCPServerMetadata;
  lastConnected?: Date;
  lastError?: MCPError;
}

export type MCPProtocol = 'http' | 'https' | 'ws' | 'wss' | 'stdio' | 'sse';

export type MCPServerStatus = 
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'authenticated'
  | 'error'
  | 'timeout'
  | 'unauthorized'
  | 'maintenance';

export interface MCPCapabilities {
  tools: MCPToolCapability[];
  resources: MCPResourceCapability[];
  prompts: MCPPromptCapability[];
  logging: MCPLoggingCapability;
  sampling: MCPSamplingCapability;
  roots: MCPRootsCapability;
  experimental?: Record<string, any>;
}

export interface MCPAuthentication {
  type: MCPAuthType;
  credentials: MCPCredentials;
  token?: string;
  refreshToken?: string;
  expiresAt?: Date;
  scopes: string[];
}

export type MCPAuthType = 'none' | 'basic' | 'bearer' | 'oauth2' | 'api_key' | 'custom';

export interface MCPCredentials {
  username?: string;
  password?: string;
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  customFields?: Record<string, string>;
}

// ============================================================================
// MCP TOOLS
// ============================================================================

/**
 * MCP Tool definitions and execution
 */
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: MCPToolSchema;
  outputSchema?: MCPToolSchema;
  category: MCPToolCategory;
  tags: string[];
  deprecated?: boolean;
  experimental?: boolean;
  documentation?: MCPToolDocumentation;
  examples: MCPToolExample[];
  metadata: MCPToolMetadata;
}

export interface MCPToolSchema {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  properties?: Record<string, MCPToolProperty>;
  required?: string[];
  additionalProperties?: boolean;
  items?: MCPToolSchema;
  enum?: any[];
  format?: string;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  description?: string;
  examples?: any[];
  default?: any;
}

export interface MCPToolProperty {
  type: string;
  description: string;
  enum?: any[];
  format?: string;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  default?: any;
  examples?: any[];
  deprecated?: boolean;
}

export type MCPToolCategory = 
  | 'file_system'
  | 'network'
  | 'database'
  | 'api'
  | 'utility'
  | 'development'
  | 'system'
  | 'ai'
  | 'communication'
  | 'security'
  | 'monitoring'
  | 'custom';

export interface MCPToolDocumentation {
  summary: string;
  description: string;
  parameters: MCPParameterDoc[];
  returns: MCPReturnDoc;
  errors: MCPErrorDoc[];
  examples: MCPToolExample[];
  seeAlso: string[];
  changelog?: MCPChangelogEntry[];
}

export interface MCPParameterDoc {
  name: string;
  type: string;
  description: string;
  required: boolean;
  default?: any;
  examples: any[];
}

export interface MCPReturnDoc {
  type: string;
  description: string;
  schema: MCPToolSchema;
  examples: any[];
}

export interface MCPErrorDoc {
  code: string;
  message: string;
  description: string;
  resolution?: string;
}

export interface MCPToolExample {
  name: string;
  description: string;
  input: Record<string, any>;
  output: any;
  explanation?: string;
}

export interface MCPToolMetadata {
  version: string;
  author: string;
  license: string;
  repository?: string;
  documentation?: string;
  performance: MCPPerformanceMetrics;
  usage: MCPUsageStats;
}

// ============================================================================
// MCP TOOL EXECUTION
// ============================================================================

export interface MCPToolCall {
  id: string;
  toolName: string;
  arguments: Record<string, any>;
  timestamp: Date;
  status: MCPCallStatus;
  serverId: string;
  userId?: string;
  sessionId?: string;
  metadata: MCPCallMetadata;
}

export type MCPCallStatus = 
  | 'pending'
  | 'executing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'timeout';

export interface MCPCallMetadata {
  duration?: number;
  retryCount: number;
  priority: MCPCallPriority;
  timeout: number;
  context?: Record<string, any>;
}

export type MCPCallPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface MCPToolResult {
  callId: string;
  status: MCPResultStatus;
  data?: any;
  error?: MCPError;
  metadata: MCPResultMetadata;
  timestamp: Date;
}

export type MCPResultStatus = 'success' | 'error' | 'partial' | 'timeout';

export interface MCPResultMetadata {
  executionTime: number;
  memoryUsage?: number;
  warnings?: string[];
  debugInfo?: Record<string, any>;
}

export interface MCPToolUsage {
  toolName: string;
  callCount: number;
  totalDuration: number;
  averageDuration: number;
  successRate: number;
  lastUsed: Date;
  errorCount: number;
  commonErrors: MCPErrorSummary[];
}

export interface MCPErrorSummary {
  type: string;
  count: number;
  lastOccurred: Date;
  message: string;
}

// ============================================================================
// MCP RESOURCES
// ============================================================================

/**
 * MCP Resource management and access
 */
export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
  size?: number;
  lastModified?: Date;
  metadata: MCPResourceMetadata;
  access: MCPResourceAccess;
  caching: MCPResourceCaching;
}

export interface MCPResourceMetadata {
  version?: string;
  author?: string;
  tags: string[];
  category: MCPResourceCategory;
  encoding?: string;
  checksum?: string;
  compression?: string;
  customFields?: Record<string, any>;
}

export type MCPResourceCategory = 
  | 'document'
  | 'image'
  | 'audio'
  | 'video'
  | 'data'
  | 'code'
  | 'config'
  | 'template'
  | 'schema'
  | 'other';

export interface MCPResourceAccess {
  permissions: MCPPermission[];
  restrictions: MCPRestriction[];
  rateLimit?: MCPRateLimit;
  authentication?: MCPResourceAuth;
}

export interface MCPPermission {
  action: MCPAction;
  granted: boolean;
  conditions?: MCPCondition[];
}

export type MCPAction = 'read' | 'write' | 'delete' | 'list' | 'subscribe';

export interface MCPRestriction {
  type: MCPRestrictionType;
  value: any;
  message: string;
}

export type MCPRestrictionType = 
  | 'time_window'
  | 'user_role'
  | 'ip_address'
  | 'rate_limit'
  | 'file_size'
  | 'content_type';

export interface MCPResourceCaching {
  enabled: boolean;
  ttl?: number;
  strategy: MCPCacheStrategy;
  tags?: string[];
  invalidationRules?: MCPInvalidationRule[];
}

export type MCPCacheStrategy = 
  | 'no_cache'
  | 'cache_first'
  | 'network_first'
  | 'cache_only'
  | 'network_only'
  | 'stale_while_revalidate';

// ============================================================================
// MCP PROMPTS
// ============================================================================

/**
 * MCP Prompt templates and management
 */
export interface MCPPrompt {
  name: string;
  description: string;
  template: string;
  parameters: MCPPromptParameter[];
  metadata: MCPPromptMetadata;
  examples: MCPPromptExample[];
  validation: MCPPromptValidation;
}

export interface MCPPromptParameter {
  name: string;
  type: MCPParameterType;
  description: string;
  required: boolean;
  default?: any;
  constraints?: MCPParameterConstraints;
  examples: any[];
}

export type MCPParameterType = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'file'
  | 'url'
  | 'email'
  | 'date'
  | 'regex';

export interface MCPParameterConstraints {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enum?: any[];
  format?: string;
}

export interface MCPPromptMetadata {
  version: string;
  author: string;
  category: MCPPromptCategory;
  tags: string[];
  complexity: MCPComplexity;
  estimatedTokens: number;
  language: string;
  lastUpdated: Date;
}

export type MCPPromptCategory = 
  | 'general'
  | 'code_generation'
  | 'analysis'
  | 'documentation'
  | 'testing'
  | 'debugging'
  | 'optimization'
  | 'explanation'
  | 'translation'
  | 'custom';

export type MCPComplexity = 'simple' | 'moderate' | 'complex' | 'advanced';

export interface MCPPromptExample {
  name: string;
  description: string;
  input: Record<string, any>;
  output: string;
  explanation?: string;
}

export interface MCPPromptValidation {
  rules: MCPValidationRule[];
  customValidators?: MCPCustomValidator[];
}

export interface MCPValidationRule {
  field: string;
  type: MCPValidationType;
  message: string;
  parameters?: Record<string, any>;
}

export type MCPValidationType = 
  | 'required'
  | 'type'
  | 'length'
  | 'pattern'
  | 'range'
  | 'enum'
  | 'custom';

export interface MCPCustomValidator {
  name: string;
  function: string;
  parameters: Record<string, any>;
}

// ============================================================================
// MCP COMMUNICATION
// ============================================================================

/**
 * MCP Protocol messages and communication
 */
export interface MCPMessage {
  id: string;
  type: MCPMessageType;
  method?: string;
  params?: Record<string, any>;
  result?: any;
  error?: MCPError;
  timestamp: Date;
  serverId: string;
  clientId?: string;
}

export type MCPMessageType = 
  | 'request'
  | 'response'
  | 'notification'
  | 'error'
  | 'heartbeat'
  | 'progress'
  | 'stream'
  | 'cancel';

export interface MCPRequest extends MCPMessage {
  type: 'request';
  method: string;
  params: Record<string, any>;
}

export interface MCPResponse extends MCPMessage {
  type: 'response';
  result?: any;
  error?: MCPError;
}

export interface MCPNotification extends MCPMessage {
  type: 'notification';
  method: string;
  params?: Record<string, any>;
}

export interface MCPProgress extends MCPMessage {
  type: 'progress';
  token: string;
  value: MCPProgressValue;
}

export interface MCPProgressValue {
  kind: 'begin' | 'report' | 'end';
  title?: string;
  message?: string;
  percentage?: number;
  increment?: number;
  cancellable?: boolean;
}

export interface MCPStreamMessage extends MCPMessage {
  type: 'stream';
  streamId: string;
  sequence: number;
  data: any;
  isLast: boolean;
}

// ============================================================================
// MCP ERRORS AND EXCEPTIONS
// ============================================================================

export interface MCPError {
  code: MCPErrorCode;
  message: string;
  data?: any;
  stack?: string;
  timestamp: Date;
  serverId?: string;
  callId?: string;
}

export type MCPErrorCode = 
  | 'parse_error'
  | 'invalid_request'
  | 'method_not_found'
  | 'invalid_params'
  | 'internal_error'
  | 'server_error'
  | 'connection_error'
  | 'timeout_error'
  | 'authentication_error'
  | 'authorization_error'
  | 'resource_not_found'
  | 'resource_unavailable'
  | 'rate_limit_exceeded'
  | 'quota_exceeded'
  | 'validation_error'
  | 'execution_error'
  | 'cancelled_error';

export interface MCPErrorContext {
  request?: MCPRequest;
  server?: MCPServer;
  tool?: MCPTool;
  resource?: MCPResource;
  additionalInfo?: Record<string, any>;
}

export interface MCPRetryPolicy {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: MCPErrorCode[];
  customRetryLogic?: (error: MCPError, attempt: number) => boolean;
}

// ============================================================================
// MCP SESSION AND CONNECTION
// ============================================================================

export interface MCPSession {
  id: string;
  serverId: string;
  userId?: string;
  status: MCPSessionStatus;
  startTime: Date;
  endTime?: Date;
  lastActivity: Date;
  configuration: MCPSessionConfiguration;
  statistics: MCPSessionStatistics;
  context: MCPSessionContext;
}

export type MCPSessionStatus = 
  | 'initializing'
  | 'active'
  | 'idle'
  | 'suspended'
  | 'terminated'
  | 'error';

export interface MCPSessionConfiguration {
  timeout: number;
  keepAlive: boolean;
  compression: boolean;
  encryption: boolean;
  logging: MCPLoggingLevel;
  rateLimiting: MCPRateLimit;
}

export type MCPLoggingLevel = 'none' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

export interface MCPRateLimit {
  requests: number;
  window: number;
  burst?: number;
  keyGenerator?: string;
}

export interface MCPSessionStatistics {
  requestCount: number;
  responseCount: number;
  errorCount: number;
  totalDuration: number;
  averageLatency: number;
  bytesTransferred: number;
  toolsUsed: string[];
  resourcesAccessed: string[];
}

export interface MCPSessionContext {
  userPreferences?: Record<string, any>;
  environmentVariables?: Record<string, string>;
  workspaceInfo?: MCPWorkspaceInfo;
  customData?: Record<string, any>;
}

export interface MCPWorkspaceInfo {
  path: string;
  name: string;
  type: string;
  version?: string;
  configuration?: Record<string, any>;
}

// ============================================================================
// MCP CAPABILITIES AND FEATURES
// ============================================================================

export interface MCPToolCapability {
  listChanged?: boolean;
  subscribe?: boolean;
  call?: boolean;
}

export interface MCPResourceCapability {
  listChanged?: boolean;
  subscribe?: boolean;
  read?: boolean;
  write?: boolean;
}

export interface MCPPromptCapability {
  listChanged?: boolean;
  get?: boolean;
}

export interface MCPLoggingCapability {
  enabled: boolean;
  level: MCPLoggingLevel;
  destinations: MCPLogDestination[];
}

export interface MCPLogDestination {
  type: 'console' | 'file' | 'network' | 'custom';
  configuration: Record<string, any>;
}

export interface MCPSamplingCapability {
  enabled: boolean;
  createMessage?: boolean;
}

export interface MCPRootsCapability {
  listChanged?: boolean;
}

// ============================================================================
// MCP SERVER CONFIGURATION
// ============================================================================

export interface MCPServerConfiguration {
  connection: MCPConnectionConfig;
  security: MCPSecurityConfig;
  performance: MCPPerformanceConfig;
  logging: MCPLoggingConfig;
  features: MCPFeatureConfig;
}

export interface MCPConnectionConfig {
  protocol: MCPProtocol;
  host?: string;
  port?: number;
  path?: string;
  timeout: number;
  retryPolicy: MCPRetryPolicy;
  keepAlive: boolean;
  compression: boolean;
}

export interface MCPSecurityConfig {
  authentication: MCPAuthentication;
  encryption: MCPEncryptionConfig;
  authorization: MCPAuthorizationConfig;
  validation: MCPValidationConfig;
}

export interface MCPEncryptionConfig {
  enabled: boolean;
  algorithm?: string;
  keySize?: number;
  certificatePath?: string;
  privateKeyPath?: string;
}

export interface MCPAuthorizationConfig {
  enabled: boolean;
  rules: MCPAuthorizationRule[];
  defaultPermissions: MCPPermission[];
}

export interface MCPAuthorizationRule {
  resource: string;
  action: MCPAction;
  conditions: MCPCondition[];
  effect: 'allow' | 'deny';
}

export interface MCPCondition {
  type: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'not_in' | 'regex';
  value: any;
}

export interface MCPValidationConfig {
  enabled: boolean;
  strict: boolean;
  customValidators: MCPCustomValidator[];
}

export interface MCPPerformanceConfig {
  maxConcurrentRequests: number;
  requestQueueSize: number;
  responseTimeout: number;
  rateLimiting: MCPRateLimit;
  caching: MCPCacheConfig;
}

export interface MCPCacheConfig {
  enabled: boolean;
  strategy: MCPCacheStrategy;
  ttl: number;
  maxSize: number;
  evictionPolicy: 'lru' | 'lfu' | 'fifo' | 'custom';
}

export interface MCPLoggingConfig {
  level: MCPLoggingLevel;
  destinations: MCPLogDestination[];
  includeStackTrace: boolean;
  rotationPolicy?: MCPLogRotationPolicy;
}

export interface MCPLogRotationPolicy {
  maxFileSize: number;
  maxFiles: number;
  rotationInterval?: string;
}

export interface MCPFeatureConfig {
  tools: boolean;
  resources: boolean;
  prompts: boolean;
  streaming: boolean;
  progress: boolean;
  cancellation: boolean;
  experimental: Record<string, boolean>;
}

// ============================================================================
// MCP MONITORING AND METRICS
// ============================================================================

export interface MCPServerMetadata {
  version: string;
  protocol: string;
  capabilities: MCPCapabilities;
  health: MCPHealthStatus;
  metrics: MCPMetrics;
  uptime: number;
  lastHealthCheck: Date;
}

export interface MCPHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  checks: MCPHealthCheck[];
  lastUpdated: Date;
}

export interface MCPHealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  duration: number;
  lastChecked: Date;
}

export interface MCPMetrics {
  requests: MCPRequestMetrics;
  errors: MCPErrorMetrics;
  performance: MCPPerformanceMetrics;
  resources: MCPResourceMetrics;
}

export interface MCPRequestMetrics {
  total: number;
  successful: number;
  failed: number;
  averageLatency: number;
  requestsPerSecond: number;
  methodBreakdown: Record<string, number>;
}

export interface MCPErrorMetrics {
  total: number;
  byCode: Record<MCPErrorCode, number>;
  byMethod: Record<string, number>;
  errorRate: number;
  lastError?: MCPError;
}

export interface MCPPerformanceMetrics {
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  throughput: number;
  concurrentConnections: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface MCPResourceMetrics {
  totalResources: number;
  accessCount: number;
  cacheHitRate: number;
  averageResourceSize: number;
  bandwidthUsage: number;
}

export interface MCPUsageStats {
  dailyRequests: number;
  weeklyRequests: number;
  monthlyRequests: number;
  uniqueUsers: number;
  popularTools: string[];
  popularResources: string[];
  errorTrends: MCPErrorTrend[];
}

export interface MCPErrorTrend {
  date: Date;
  errorCount: number;
  errorRate: number;
  commonErrors: MCPErrorCode[];
}

// ============================================================================
// MCP CHANGE MANAGEMENT
// ============================================================================

export interface MCPChangelogEntry {
  version: string;
  date: Date;
  type: 'major' | 'minor' | 'patch' | 'hotfix';
  changes: MCPChange[];
  breaking: boolean;
  migration?: MCPMigrationGuide;
}

export interface MCPChange {
  type: 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security';
  description: string;
  component?: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
}

export interface MCPMigrationGuide {
  fromVersion: string;
  toVersion: string;
  steps: MCPMigrationStep[];
  automated: boolean;
  estimatedTime: number;
}

export interface MCPMigrationStep {
  order: number;
  description: string;
  command?: string;
  manual: boolean;
  validation?: string;
}

// ============================================================================
// MCP INVALIDATION RULES
// ============================================================================

export interface MCPInvalidationRule {
  trigger: MCPInvalidationTrigger;
  targets: string[];
  delay?: number;
  cascade: boolean;
}

export interface MCPInvalidationTrigger {
  type: 'time' | 'event' | 'condition' | 'manual';
  parameters: Record<string, any>;
}

// ============================================================================
// MCP UTILITY TYPES AND TYPE GUARDS
// ============================================================================

/**
 * Type guards for MCP types
 */
export const isMCPServer = (obj: any): obj is MCPServer => {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
};

export const isMCPTool = (obj: any): obj is MCPTool => {
  return obj && typeof obj.name === 'string' && obj.inputSchema;
};

export const isMCPResource = (obj: any): obj is MCPResource => {
  return obj && typeof obj.uri === 'string' && typeof obj.name === 'string';
};

export const isMCPError = (obj: any): obj is MCPError => {
  return obj && typeof obj.code === 'string' && typeof obj.message === 'string';
};

/**
 * Utility types for MCP operations
 */
export type MCPEventHandler<T = any> = (event: MCPEvent<T>) => void;

export interface MCPEvent<T = any> {
  type: string;
  data: T;
  timestamp: Date;
  serverId: string;
  sessionId?: string;
}

export type MCPToolFilter = {
  category?: MCPToolCategory;
  tags?: string[];
  deprecated?: boolean;
  experimental?: boolean;
};

export type MCPResourceFilter = {
  mimeType?: string;
  category?: MCPResourceCategory;
  tags?: string[];
  sizeRange?: [number, number];
  modifiedSince?: Date;
};

export interface MCPBatchRequest {
  id: string;
  requests: MCPRequest[];
  options: MCPBatchOptions;
}

export interface MCPBatchOptions {
  stopOnError: boolean;
  maxConcurrency: number;
  timeout: number;
  priority: MCPCallPriority;
}

export interface MCPBatchResponse {
  id: string;
  responses: (MCPResponse | MCPError)[];
  summary: MCPBatchSummary;
}

export interface MCPBatchSummary {
  total: number;
  successful: number;
  failed: number;
  duration: number;
  errors: MCPError[];
}

export interface MCPSubscription {
  id: string;
  type: 'tools' | 'resources' | 'prompts' | 'logs' | 'metrics';
  filter?: any;
  callback: MCPEventHandler;
  active: boolean;
  createdAt: Date;
}

export interface MCPConnectionPool {
  servers: Map<string, MCPServer>;
  sessions: Map<string, MCPSession>;
  maxConnections: number;
  connectionTimeout: number;
  idleTimeout: number;
  healthCheckInterval: number;
}

/**
 * MCP Configuration builders and validators
 */
export interface MCPConfigBuilder {
  server(config: Partial<MCPServerConfiguration>): MCPConfigBuilder;
  security(config: Partial<MCPSecurityConfig>): MCPConfigBuilder;
  performance(config: Partial<MCPPerformanceConfig>): MCPConfigBuilder;
  logging(config: Partial<MCPLoggingConfig>): MCPConfigBuilder;
  build(): MCPServerConfiguration;
  validate(): MCPValidationResult;
}

export interface MCPValidationResult {
  valid: boolean;
  errors: MCPValidationError[];
  warnings: MCPValidationWarning[];
}

export interface MCPValidationError {
  field: string;
  message: string;
  code: string;
}

export interface MCPValidationWarning {
  field: string;
  message: string;
  recommendation: string;
}
