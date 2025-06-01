/**
 * API Type Definitions
 * 
 * Comprehensive TypeScript interfaces for all API interactions, requests, responses,
 * and data models used throughout the Podplay Sanctuary application.
 * 
 * @fileoverview Complete API type system with request/response types, error handling, and utilities
 * @version 1.0.0
 * @author Podplay Sanctuary Team
 */

// ============================================================================
// BASE API TYPES
// ============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: string;
  requestId: string;
  meta?: ResponseMeta;
}

/**
 * API error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string;
  stack?: string;
  timestamp: string;
}

/**
 * Response metadata
 */
export interface ResponseMeta {
  pagination?: PaginationMeta;
  performance?: PerformanceMeta;
  version?: string;
  deprecation?: DeprecationWarning;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextPage?: number;
  prevPage?: number;
}

/**
 * Performance metrics
 */
export interface PerformanceMeta {
  duration: number;
  cacheHit?: boolean;
  dbQueries?: number;
  memoryUsage?: number;
}

/**
 * Deprecation warning
 */
export interface DeprecationWarning {
  message: string;
  deprecatedSince: string;
  willBeRemovedIn: string;
  replacement?: string;
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

/**
 * Base API request configuration
 */
export interface ApiRequest {
  url: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  retries?: number;
  cache?: boolean;
}

/**
 * HTTP methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

/**
 * Request options
 */
export interface RequestOptions {
  signal?: AbortSignal;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cache?: boolean | CacheOptions;
  transform?: (data: any) => any;
  validate?: (data: any) => boolean;
}

/**
 * Cache configuration
 */
export interface CacheOptions {
  ttl?: number;
  key?: string;
  tags?: string[];
  invalidateOn?: string[];
}

// ============================================================================
// AUTHENTICATION & AUTHORIZATION
// ============================================================================

/**
 * User authentication data
 */
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  roles: UserRole[];
  permissions: Permission[];
  preferences: UserPreferences;
  metadata: UserMetadata;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

/**
 * User roles
 */
export type UserRole = 'admin' | 'moderator' | 'user' | 'guest' | 'developer';

/**
 * User permissions
 */
export interface Permission {
  resource: string;
  actions: PermissionAction[];
  conditions?: Record<string, any>;
}

/**
 * Permission actions
 */
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'execute' | 'admin';

/**
 * User preferences
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  frequency: 'immediate' | 'daily' | 'weekly' | 'never';
  types: NotificationType[];
}

/**
 * Notification types
 */
export type NotificationType = 'chat' | 'workspace' | 'scout' | 'mcp' | 'system' | 'security';

/**
 * Privacy settings
 */
export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  activityTracking: boolean;
  dataSharing: boolean;
  analyticsOptOut: boolean;
}

/**
 * Accessibility settings
 */
export interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'xl';
  screenReader: boolean;
  keyboardNavigation: boolean;
}

/**
 * User metadata
 */
export interface UserMetadata {
  loginCount: number;
  lastIpAddress?: string;
  userAgent?: string;
  registrationSource: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
}

/**
 * Authentication request
 */
export interface AuthRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  captcha?: string;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken: string;
  expiresAt: string;
  sessionId: string;
}

/**
 * Token refresh request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
  captcha?: string;
}

/**
 * Password change request
 */
export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ============================================================================
// FILE & MEDIA TYPES
// ============================================================================

/**
 * File upload data
 */
export interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnailUrl?: string;
  metadata: FileMetadata;
  uploadedBy: string;
  uploadedAt: string;
}

/**
 * File metadata
 */
export interface FileMetadata {
  width?: number;
  height?: number;
  duration?: number;
  bitrate?: number;
  format?: string;
  encoding?: string;
  checksum: string;
  virusScanResult?: 'clean' | 'infected' | 'pending';
}

/**
 * File upload request
 */
export interface FileUploadRequest {
  file: File;
  category?: FileCategory;
  metadata?: Partial<FileMetadata>;
  compress?: boolean;
  generateThumbnail?: boolean;
}

/**
 * File categories
 */
export type FileCategory = 'image' | 'video' | 'audio' | 'document' | 'code' | 'data' | 'other';

/**
 * File search criteria
 */
export interface FileSearchCriteria {
  query?: string;
  category?: FileCategory;
  type?: string;
  sizeMin?: number;
  sizeMax?: number;
  uploadedAfter?: string;
  uploadedBefore?: string;
  uploadedBy?: string;
  tags?: string[];
}

// ============================================================================
// SEARCH & FILTERING
// ============================================================================

/**
 * Search request
 */
export interface SearchRequest {
  query: string;
  filters?: SearchFilters;
  sort?: SortOptions;
  pagination?: PaginationRequest;
  facets?: string[];
  highlight?: boolean;
}

/**
 * Search filters
 */
export interface SearchFilters {
  category?: string[];
  tags?: string[];
  dateRange?: DateRange;
  status?: string[];
  author?: string[];
  [key: string]: any;
}

/**
 * Sort options
 */
export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
  secondarySort?: SortOptions;
}

/**
 * Date range filter
 */
export interface DateRange {
  start?: string;
  end?: string;
  preset?: 'today' | 'week' | 'month' | 'year' | 'custom';
}

/**
 * Pagination request
 */
export interface PaginationRequest {
  page: number;
  limit: number;
  offset?: number;
}

/**
 * Search response
 */
export interface SearchResponse<T = any> {
  results: T[];
  total: number;
  facets?: SearchFacets;
  suggestions?: string[];
  query: string;
  executionTime: number;
}

/**
 * Search facets
 */
export interface SearchFacets {
  [key: string]: FacetValue[];
}

/**
 * Facet value
 */
export interface FacetValue {
  value: string;
  count: number;
  selected?: boolean;
}

// ============================================================================
// WEBSOCKET TYPES
// ============================================================================

/**
 * WebSocket message
 */
export interface WebSocketMessage<T = any> {
  type: string;
  id: string;
  data: T;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

/**
 * WebSocket event types
 */
export type WebSocketEventType = 
  | 'connect'
  | 'disconnect'
  | 'error'
  | 'message'
  | 'typing'
  | 'presence'
  | 'notification'
  | 'system';

/**
 * WebSocket connection state
 */
export type WebSocketState = 'connecting' | 'connected' | 'disconnected' | 'error';

/**
 * WebSocket configuration
 */
export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnect?: boolean;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
  heartbeat?: boolean;
  heartbeatInterval?: number;
}

// ============================================================================
// API ENDPOINT TYPES
// ============================================================================

/**
 * API endpoint configuration
 */
export interface ApiEndpoint {
  path: string;
  method: HttpMethod;
  auth?: boolean;
  rateLimit?: RateLimitConfig;
  cache?: CacheConfig;
  validation?: ValidationConfig;
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  requests: number;
  window: number;
  skipSuccessful?: boolean;
  skipFailed?: boolean;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  ttl: number;
  tags?: string[];
  vary?: string[];
  revalidate?: boolean;
}

/**
 * Validation configuration
 */
export interface ValidationConfig {
  schema?: Record<string, any>;
  rules?: ValidationRule[];
  sanitize?: boolean;
}

/**
 * Validation rule
 */
export interface ValidationRule {
  field: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'url';
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  custom?: (value: any) => boolean | string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * API client configuration
 */
export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
  interceptors?: ApiInterceptors;
  cache?: boolean;
  auth?: AuthConfig;
}

/**
 * API interceptors
 */
export interface ApiInterceptors {
  request?: RequestInterceptor[];
  response?: ResponseInterceptor[];
  error?: ErrorInterceptor[];
}

/**
 * Interceptor types
 */
export type RequestInterceptor = (request: ApiRequest) => ApiRequest | Promise<ApiRequest>;
export type ResponseInterceptor = (response: ApiResponse) => ApiResponse | Promise<ApiResponse>;
export type ErrorInterceptor = (error: ApiError) => ApiError | Promise<ApiError>;

/**
 * Authentication configuration
 */
export interface AuthConfig {
  type: 'bearer' | 'basic' | 'api-key' | 'oauth';
  token?: string;
  username?: string;
  password?: string;
  apiKey?: string;
  header?: string;
}

/**
 * Generic resource type
 */
export interface Resource {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  version?: number;
  metadata?: Record<string, any>;
}

/**
 * Batch operation request
 */
export interface BatchRequest<T = any> {
  operations: BatchOperation<T>[];
  atomic?: boolean;
  continueOnError?: boolean;
}

/**
 * Batch operation
 */
export interface BatchOperation<T = any> {
  id: string;
  operation: 'create' | 'update' | 'delete';
  data?: T;
  conditions?: Record<string, any>;
}

/**
 * Batch operation response
 */
export interface BatchResponse<T = any> {
  results: BatchResult<T>[];
  summary: BatchSummary;
}

/**
 * Batch operation result
 */
export interface BatchResult<T = any> {
  id: string;
  success: boolean;
  data?: T;
  error?: ApiError;
}

/**
 * Batch operation summary
 */
export interface BatchSummary {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
  duration: number;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for API response
 */
export function isApiResponse<T>(obj: any): obj is ApiResponse<T> {
  return obj && typeof obj === 'object' && typeof obj.success === 'boolean';
}

/**
 * Type guard for API error
 */
export function isApiError(obj: any): obj is ApiError {
  return obj && typeof obj === 'object' && typeof obj.code === 'string' && typeof obj.message === 'string';
}

/**
 * Type guard for authenticated user
 */
export function isAuthUser(obj: any): obj is AuthUser {
  return obj && typeof obj === 'object' && typeof obj.id === 'string' && Array.isArray(obj.roles);
}

/**
 * Type guard for file upload
 */
export function isFileUpload(obj: any): obj is FileUpload {
  return obj && typeof obj === 'object' && typeof obj.id === 'string' && typeof obj.url === 'string';
}

// ============================================================================
// CONDITIONAL TYPES
// ============================================================================

/**
 * Extract response data type
 */
export type ApiResponseData<T> = T extends ApiResponse<infer U> ? U : never;

/**
 * Make fields optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make fields required
 */
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Create request type from response type
 */
export type CreateRequest<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'version'>;

/**
 * Create update request type from response type
 */
export type UpdateRequest<T> = Partial<CreateRequest<T>>;

/**
 * Extract ID type
 */
export type IdType<T> = T extends { id: infer U } ? U : string;

/**
 * Paginated response type
 */
export type PaginatedResponse<T> = ApiResponse<{
  items: T[];
  pagination: PaginationMeta;
}>;

// ============================================================================
// EXPORT COLLECTIONS
// ============================================================================

/**
 * All API request types
 */
export type ApiRequestTypes = 
  | ApiRequest
  | AuthRequest
  | RefreshTokenRequest
  | PasswordResetRequest
  | PasswordChangeRequest
  | FileUploadRequest
  | SearchRequest
  | PaginationRequest
  | BatchRequest;

/**
 * All API response types
 */
export type ApiResponseTypes =
  | ApiResponse
  | AuthResponse
  | SearchResponse
  | PaginatedResponse<any>
  | BatchResponse;

/**
 * All error types
 */
export type ErrorTypes =
  | ApiError
  | Error
  | TypeError
  | ReferenceError;

/**
 * All user-related types
 */
export type UserTypes =
  | AuthUser
  | UserRole
  | Permission
  | UserPreferences
  | UserMetadata;
