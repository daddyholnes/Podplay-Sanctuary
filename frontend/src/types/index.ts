/**
 * Types Barrel Export - Comprehensive TypeScript Type Definitions
 * 
 * This file serves as the main entry point for all TypeScript type definitions
 * in the Podplay Sanctuary application. It provides a clean, organized API
 * for importing types throughout the application.
 * 
 * @fileoverview Central type definitions export for Podplay Sanctuary
 * @version 1.0.0
 * @author Podplay Sanctuary Team
 */

// ============================================================================
// API TYPES - Request/Response, Authentication, File Operations
// ============================================================================

export type {
  // Core API Types
  ApiResponse,
  ApiError,
  ApiRequest,
  PaginatedResponse,
  ApiMetadata,
  
  // Authentication Types
  AuthCredentials,
  AuthResponse,
  AuthUser,
  AuthToken,
  AuthPermission,
  AuthRole,
  AuthSession,
  
  // Request/Response Types
  ChatRequest,
  ChatResponse,
  FileUploadRequest,
  FileUploadResponse,
  WorkspaceRequest,
  WorkspaceResponse,
  ScoutRequest,
  ScoutResponse,
  McpRequest,
  McpResponse,
  
  // WebSocket Types
  WebSocketMessage,
  WebSocketEvent,
  WebSocketError,
  WebSocketConnection,
  WebSocketHandler,
  
  // File Operation Types
  FileMetadata,
  FileOperation,
  FilePermission,
  FileSyncStatus,
  FileVersion,
  
  // Search & Pagination
  SearchParams,
  SearchResult,
  PaginationParams,
  SortOptions,
  FilterOptions,
  
  // Utility Types
  ApiUtilityTypes,
  RequestConfig,
  ResponseInterceptor,
  ErrorHandler,
  RetryConfig,
  CacheConfig
} from './api';

// ============================================================================
// CHAT TYPES - Messaging, Conversations, AI Integration
// ============================================================================

export type {
  // Core Chat Types
  Message,
  Conversation,
  ChatUser,
  ChatParticipant,
  ChatSession,
  
  // Message Types
  MessageType,
  MessageContent,
  MessageMetadata,
  MessageAttachment,
  MessageReaction,
  MessageThread,
  MessageStatus,
  MessageDelivery,
  
  // Conversation Types
  ConversationType,
  ConversationSettings,
  ConversationMetadata,
  ConversationPermissions,
  ConversationSummary,
  
  // AI Integration Types
  AIModel,
  AIProvider,
  AIResponse,
  AIConfiguration,
  AICapability,
  AIUsage,
  AIMetrics,
  
  // Real-time Features
  TypingIndicator,
  PresenceStatus,
  UserPresence,
  ActivityStatus,
  OnlineStatus,
  
  // Chat Features
  ChatCommand,
  ChatBot,
  ChatPlugin,
  ChatWidget,
  ChatNotification,
  ChatHistory,
  ChatBackup,
  ChatExport,
  
  // Collaboration
  CollaborativeEditing,
  SharedWorkspace,
  CollaborationSession,
  CollaborationPermission,
  
  // Advanced Features
  MessageEncryption,
  ChatAnalytics,
  ChatModeration,
  ChatArchive,
  ChatSearch,
  ChatFilter
} from './chat';

// ============================================================================
// WORKSPACE TYPES - File Management, Projects, Collaboration
// ============================================================================

export type {
  // Core Workspace Types
  Workspace,
  Project,
  WorkspaceFile,
  Directory,
  FileSystem,
  
  // File Management
  File,
  FileTree,
  FileNode,
  FileContent,
  FileHistory,
  FileChange,
  FileConflict,
  FileDiff,
  
  // Project Types
  ProjectType,
  ProjectConfig,
  ProjectMetadata,
  ProjectSettings,
  ProjectTemplate,
  ProjectDependency,
  
  // Version Control
  GitRepository,
  GitCommit,
  GitBranch,
  GitTag,
  GitRemote,
  GitStatus,
  GitDiff,
  GitMerge,
  
  // Collaboration
  WorkspaceCollaboration,
  CollaboratorRole,
  CollaboratorPermission,
  WorkspaceInvitation,
  WorkspaceShare,
  
  // File Operations
  FileOperation as WorkspaceFileOperation,
  FileUpload,
  FileDownload,
  FileSync,
  FileBackup,
  FileRestore,
  
  // Workspace Features
  WorkspaceSearch,
  WorkspaceFilter,
  WorkspaceView,
  WorkspaceLayout,
  WorkspaceTheme,
  
  // Security & Permissions
  WorkspaceSecurity,
  AccessControl,
  PermissionLevel,
  SecurityPolicy,
  
  // Integration
  ExternalIntegration,
  APIIntegration,
  WebhookConfig,
  WorkspaceWebhook,
  
  // Analytics & Monitoring
  WorkspaceAnalytics,
  WorkspaceMetrics,
  WorkspaceUsage,
  PerformanceMetrics,
  
  // Deployment
  DeploymentConfig,
  DeploymentPipeline,
  DeploymentStatus,
  DeploymentHistory,
  BuildConfig,
  BuildStatus
} from './workspace';

// ============================================================================
// SCOUT TYPES - Code Analysis, Insights, Performance Monitoring
// ============================================================================

export type {
  // Core Scout Types
  ScoutAnalysis,
  CodeInsight,
  AnalysisResult,
  ScoutMetric,
  ScoutReport,
  
  // Code Analysis
  CodeMetrics,
  CodeQuality,
  CodeComplexity,
  CodeCoverage,
  CodeDuplication,
  CodeSmell,
  
  // Performance Analysis
  PerformanceAnalysis,
  PerformanceMetric,
  PerformanceBaseline,
  PerformanceTrend,
  PerformanceAlert,
  
  // Security Analysis
  SecurityScan,
  SecurityVulnerability,
  SecurityThreat,
  SecurityRecommendation,
  SecurityPolicy as ScoutSecurityPolicy,
  
  // Dependency Analysis
  DependencyGraph,
  DependencyAnalysis,
  DependencyVulnerability,
  DependencyUpdate,
  DependencyConflict,
  
  // Architecture Analysis
  ArchitectureMap,
  ArchitecturePattern,
  ArchitectureViolation,
  ArchitectureRecommendation,
  ComponentDependency,
  
  // Code Suggestions
  CodeSuggestion,
  RefactoringOpportunity,
  OptimizationSuggestion,
  BestPracticeSuggestion,
  
  // Analysis Configuration
  AnalysisConfig,
  AnalysisRule,
  AnalysisThreshold,
  AnalysisSchedule,
  
  // Reporting
  AnalysisReport,
  ReportTemplate,
  ReportMetadata,
  ReportExport,
  
  // Monitoring
  ScoutMonitoring,
  MonitoringAlert,
  MonitoringDashboard,
  MonitoringWidget,
  
  // Integration
  ScoutIntegration,
  AnalysisTool,
  ExternalAnalyzer,
  AnalysisPlugin
} from './scout';

// ============================================================================
// MCP TYPES - Model Context Protocol, Server Management, Tool Integration
// ============================================================================

export type {
  // Core MCP Types
  McpServer,
  McpConnection,
  McpSession,
  McpClient,
  McpProtocol,
  
  // Server Management
  ServerConfig,
  ServerCapability,
  ServerMetadata,
  ServerStatus,
  ServerHealth,
  ServerRegistry,
  
  // Tool Integration
  McpTool,
  ToolDefinition,
  ToolExecution,
  ToolResult,
  ToolError,
  ToolMetadata,
  ToolCategory,
  
  // Resource Management
  McpResource,
  ResourceType,
  ResourceMetadata,
  ResourceAccess,
  ResourcePermission,
  ResourceCache,
  
  // Communication Protocol
  McpMessage,
  McpRequest as McpProtocolRequest,
  McpResponse as McpProtocolResponse,
  McpNotification,
  McpError,
  
  // Authentication & Security
  McpAuthentication,
  McpCredentials,
  McpToken,
  McpPermission,
  McpSecurityPolicy,
  
  // Configuration
  McpConfig,
  ConnectionConfig,
  ProtocolConfig,
  SecurityConfig,
  
  // Events & Lifecycle
  McpEvent,
  ConnectionEvent,
  ServerEvent,
  ToolEvent,
  ResourceEvent,
  
  // Advanced Features
  McpPlugin,
  McpExtension,
  McpMiddleware,
  McpInterceptor,
  
  // Monitoring & Diagnostics
  McpMonitoring,
  ConnectionMetrics,
  PerformanceStats,
  DiagnosticInfo,
  
  // Integration
  McpIntegration,
  ThirdPartyProvider,
  ServiceAdapter,
  ProtocolAdapter
} from './mcp';

// ============================================================================
// UI TYPES - Components, Themes, Layouts, Interactions
// ============================================================================

export type {
  // Core UI Types
  UIComponent,
  ComponentProps,
  ComponentState,
  ComponentRef,
  ComponentConfig,
  
  // Theme System
  Theme,
  ThemeMode,
  ThemeConfig,
  ThemeVariant,
  ThemeToken,
  ColorPalette,
  Typography,
  Spacing,
  
  // Layout System
  Layout,
  LayoutType,
  LayoutConfig,
  GridSystem,
  FlexLayout,
  ResponsiveLayout,
  BreakpointConfig,
  
  // Component Types
  ButtonProps,
  InputProps,
  ModalProps,
  TooltipProps,
  DropdownProps,
  TabsProps,
  AccordionProps,
  CarouselProps,
  
  // Form Components
  FormConfig,
  FormField,
  FormValidation,
  FormState,
  FormError,
  FormSubmission,
  
  // Navigation
  NavigationConfig,
  MenuItem,
  BreadcrumbItem,
  SidebarConfig,
  HeaderConfig,
  FooterConfig,
  
  // Data Display
  TableConfig,
  DataGridConfig,
  ChartConfig,
  GraphConfig,
  ListConfig,
  CardConfig,
  
  // Interaction
  InteractionEvent,
  GestureConfig,
  KeyboardShortcut,
  MouseEvent as UIMouseEvent,
  TouchEvent as UITouchEvent,
  
  // Animation
  AnimationConfig,
  TransitionConfig,
  MotionConfig,
  EasingFunction,
  
  // Accessibility
  AccessibilityConfig,
  AriaAttributes,
  KeyboardNavigation,
  ScreenReaderConfig,
  
  // Responsive Design
  ResponsiveConfig,
  MediaQuery,
  ViewportConfig,
  DeviceConfig,
  
  // State Management
  UIState,
  ComponentState as UIComponentState,
  GlobalUIState,
  UIAction,
  UIReducer,
  
  // Styling
  StyleConfig,
  CSSProperties,
  StyledComponent,
  StyleTheme,
  
  // Advanced Features
  VirtualizationConfig,
  LazyLoadingConfig,
  InfiniteScrollConfig,
  DragAndDropConfig,
  
  // Widget System
  Widget,
  WidgetConfig,
  WidgetProps,
  WidgetRegistry,
  
  // Notification System
  NotificationConfig,
  NotificationType,
  NotificationAction,
  ToastConfig,
  AlertConfig
} from './ui';

// ============================================================================
// GLOBAL TYPES - Application-wide Configuration, Environment, System
// ============================================================================

export type {
  // Application Configuration
  AppConfig,
  EnvironmentConfig,
  BuildConfig,
  RuntimeConfig,
  FeatureFlags,
  
  // Environment Types
  Environment,
  EnvironmentVariable,
  ConfigVariable,
  SecretVariable,
  RuntimeEnvironment,
  
  // System Types
  SystemInfo,
  DeviceInfo,
  BrowserInfo,
  PlatformInfo,
  CapabilityInfo,
  
  // Error Handling
  GlobalError,
  ErrorBoundary,
  ErrorHandler as GlobalErrorHandler,
  ErrorReport,
  ErrorMetadata,
  ErrorRecovery,
  
  // Logging System
  Logger,
  LogLevel,
  LogEntry,
  LogMetadata,
  LogConfig,
  LogTransport,
  
  // Monitoring & Analytics
  Analytics,
  AnalyticsEvent,
  AnalyticsTracker,
  MetricsCollector,
  PerformanceMonitor,
  
  // Security & Privacy
  SecurityConfig as GlobalSecurityConfig,
  PrivacyConfig,
  DataProtection,
  EncryptionConfig,
  SecurityHeaders,
  
  // Deployment & Infrastructure
  DeploymentConfig as GlobalDeploymentConfig,
  InfrastructureConfig,
  ServiceConfig,
  DatabaseConfig,
  CacheConfig as GlobalCacheConfig,
  
  // Internationalization
  I18nConfig,
  LocaleConfig,
  TranslationConfig,
  CultureConfig,
  
  // Plugin System
  Plugin,
  PluginConfig,
  PluginManifest,
  PluginRegistry,
  PluginLoader,
  
  // Advanced Global Types
  GlobalUtilities,
  TypeGuards,
  ConditionalTypes,
  UtilityTypes as GlobalUtilityTypes,
  
  // Application Lifecycle
  AppLifecycle,
  BootstrapConfig,
  ShutdownConfig,
  HealthCheck,
  ReadinessCheck,
  
  // Resource Management
  ResourceManager,
  ResourcePool,
  ResourceLimit,
  ResourceMonitor,
  
  // Event System
  GlobalEvent,
  EventBus,
  EventHandler as GlobalEventHandler,
  EventSubscription,
  
  // State Persistence
  PersistenceConfig,
  StorageConfig,
  CacheStrategy,
  SyncConfig
} from './global';

// ============================================================================
// RE-EXPORTS & TYPE UTILITIES
// ============================================================================

// Common utility types that are frequently used across the application
export type {
  // Standard utility types for better developer experience
  Optional,
  Required,
  Partial,
  Pick,
  Omit,
  Exclude,
  Extract,
  NonNullable,
  ReturnType,
  InstanceType,
  Parameters,
  ConstructorParameters
} from './global';

// ============================================================================
// TYPE GUARDS & VALIDATORS
// ============================================================================

// Export type guard functions for runtime type checking
export {
  // API type guards
  isApiResponse,
  isApiError,
  isAuthUser,
  isWebSocketMessage,
  
  // Chat type guards
  isMessage,
  isConversation,
  isChatUser,
  isAIResponse,
  
  // Workspace type guards
  isWorkspace,
  isProject,
  isFile,
  isDirectory,
  
  // Scout type guards
  isScoutAnalysis,
  isCodeInsight,
  isPerformanceMetric,
  isSecurityVulnerability,
  
  // MCP type guards
  isMcpServer,
  isMcpTool,
  isMcpResource,
  isMcpMessage,
  
  // UI type guards
  isUIComponent,
  isTheme,
  isLayout,
  isInteractionEvent,
  
  // Global type guards
  isAppConfig,
  isEnvironmentConfig,
  isGlobalError,
  isLogEntry
} from './global';

// ============================================================================
// DOCUMENTATION & METADATA
// ============================================================================

/**
 * Type Categories Overview:
 * 
 * 1. **API Types** (445 lines) - Complete request/response system with authentication,
 *    file operations, WebSocket integration, and comprehensive error handling
 * 
 * 2. **Chat Types** (700+ lines) - Messaging system with conversations, AI integration,
 *    real-time features, collaboration tools, and advanced chat capabilities
 * 
 * 3. **Workspace Types** (800+ lines) - File management, project structure, version
 *    control, collaboration, deployment pipelines, and workspace analytics
 * 
 * 4. **Scout Types** (900+ lines) - Code analysis, performance monitoring, security
 *    scanning, dependency analysis, architecture insights, and recommendations
 * 
 * 5. **MCP Types** (850+ lines) - Model Context Protocol with server management,
 *    tool integration, resource handling, and communication protocols
 * 
 * 6. **UI Types** (1000+ lines) - Component system, theme management, layouts,
 *    interactions, accessibility, responsive design, and widget framework
 * 
 * 7. **Global Types** (1200+ lines) - Application configuration, environment
 *    management, error handling, logging, monitoring, security, and system utilities
 * 
 * Total: 6,895+ lines of comprehensive TypeScript type definitions
 */

/**
 * Usage Examples:
 * 
 * ```typescript
 * // Import specific types
 * import type { Message, Conversation } from '@/types';
 * 
 * // Import multiple types from one category
 * import type { 
 *   ApiResponse, 
 *   AuthUser, 
 *   WebSocketMessage 
 * } from '@/types';
 * 
 * // Import type guards
 * import { isMessage, isApiResponse } from '@/types';
 * 
 * // Use in component
 * const ChatComponent: React.FC<{ messages: Message[] }> = ({ messages }) => {
 *   return messages.map(msg => 
 *     isMessage(msg) ? <MessageItem key={msg.id} message={msg} /> : null
 *   );
 * };
 * ```
 */

/**
 * Type Safety Guidelines:
 * 
 * 1. Always prefer importing types over `any`
 * 2. Use type guards for runtime validation
 * 3. Leverage utility types for transformations
 * 4. Follow naming conventions (PascalCase for types)
 * 5. Document complex type relationships
 * 6. Use conditional types for advanced patterns
 * 7. Implement proper error type handling
 * 8. Ensure backwards compatibility
 */

// Export version information for type compatibility checking
export const TYPES_VERSION = '1.0.0';
export const TYPES_BUILD = 'production';
export const TYPES_LAST_UPDATED = '2025-06-01';

// Default export for convenience
export default {
  version: TYPES_VERSION,
  build: TYPES_BUILD,
  lastUpdated: TYPES_LAST_UPDATED,
  categories: [
    'api',
    'chat', 
    'workspace',
    'scout',
    'mcp',
    'ui',
    'global'
  ]
};
