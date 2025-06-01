/**
 * Chat Type Definitions
 * 
 * Comprehensive TypeScript interfaces for chat functionality including messages,
 * conversations, participants, AI responses, and real-time communication features.
 * 
 * @fileoverview Complete chat system types with messages, conversations, AI integration, and WebSocket support
 * @version 1.0.0
 * @author Podplay Sanctuary Team
 */

import type { ApiResponse, WebSocketMessage, Resource, AuthUser } from './api';

// ============================================================================
// BASE CHAT TYPES
// ============================================================================

/**
 * Chat message entity
 */
export interface ChatMessage extends Resource {
  conversationId: string;
  senderId: string;
  senderType: MessageSenderType;
  content: MessageContent;
  type: MessageType;
  status: MessageStatus;
  replyToId?: string;
  threadId?: string;
  reactions: MessageReaction[];
  attachments: MessageAttachment[];
  mentions: MessageMention[];
  editHistory: MessageEdit[];
  deliveredAt?: string;
  readAt?: string;
  deletedAt?: string;
  isSystem: boolean;
  isAI: boolean;
  aiContext?: AIMessageContext;
  metadata: MessageMetadata;
}

/**
 * Message sender types
 */
export type MessageSenderType = 'user' | 'ai' | 'system' | 'bot' | 'webhook';

/**
 * Message types
 */
export type MessageType = 
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'file'
  | 'code'
  | 'link'
  | 'location'
  | 'poll'
  | 'system'
  | 'typing'
  | 'reaction';

/**
 * Message status
 */
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed' | 'deleted';

/**
 * Message content (union type for different content types)
 */
export type MessageContent = 
  | TextContent
  | ImageContent
  | VideoContent
  | AudioContent
  | FileContent
  | CodeContent
  | LinkContent
  | LocationContent
  | PollContent
  | SystemContent;

/**
 * Text message content
 */
export interface TextContent {
  type: 'text';
  text: string;
  formatting?: TextFormatting;
  language?: string;
}

/**
 * Image message content
 */
export interface ImageContent {
  type: 'image';
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  width?: number;
  height?: number;
  size: number;
  format: string;
  caption?: string;
}

/**
 * Video message content
 */
export interface VideoContent {
  type: 'video';
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  width?: number;
  height?: number;
  size: number;
  format: string;
  caption?: string;
}

/**
 * Audio message content
 */
export interface AudioContent {
  type: 'audio';
  url: string;
  duration?: number;
  size: number;
  format: string;
  waveform?: number[];
  transcript?: string;
}

/**
 * File message content
 */
export interface FileContent {
  type: 'file';
  url: string;
  name: string;
  size: number;
  format: string;
  description?: string;
}

/**
 * Code message content
 */
export interface CodeContent {
  type: 'code';
  code: string;
  language: string;
  filename?: string;
  highlighted?: boolean;
  executable?: boolean;
}

/**
 * Link message content
 */
export interface LinkContent {
  type: 'link';
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  preview: LinkPreview;
}

/**
 * Location message content
 */
export interface LocationContent {
  type: 'location';
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
  radius?: number;
}

/**
 * Poll message content
 */
export interface PollContent {
  type: 'poll';
  question: string;
  options: PollOption[];
  allowMultiple: boolean;
  anonymous: boolean;
  expiresAt?: string;
}

/**
 * System message content
 */
export interface SystemContent {
  type: 'system';
  action: SystemAction;
  data: Record<string, any>;
  template: string;
}

// ============================================================================
// CONVERSATION TYPES
// ============================================================================

/**
 * Chat conversation
 */
export interface Conversation extends Resource {
  title?: string;
  description?: string;
  type: ConversationType;
  participants: ConversationParticipant[];
  settings: ConversationSettings;
  lastMessage?: ChatMessage;
  lastActivity: string;
  messageCount: number;
  unreadCount: number;
  isArchived: boolean;
  isPinned: boolean;
  isMuted: boolean;
  tags: string[];
  aiContext?: ConversationAIContext;
  metadata: ConversationMetadata;
}

/**
 * Conversation types
 */
export type ConversationType = 'direct' | 'group' | 'channel' | 'ai_chat' | 'support' | 'system';

/**
 * Conversation participant
 */
export interface ConversationParticipant {
  userId: string;
  user?: AuthUser;
  role: ParticipantRole;
  permissions: ParticipantPermission[];
  joinedAt: string;
  leftAt?: string;
  lastReadAt?: string;
  isOnline: boolean;
  isTyping: boolean;
  customName?: string;
  isMuted: boolean;
  isBlocked: boolean;
}

/**
 * Participant roles
 */
export type ParticipantRole = 'owner' | 'admin' | 'moderator' | 'member' | 'guest' | 'ai';

/**
 * Participant permissions
 */
export type ParticipantPermission = 
  | 'read'
  | 'write'
  | 'delete_own'
  | 'delete_any'
  | 'moderate'
  | 'invite'
  | 'kick'
  | 'ban'
  | 'manage_settings';

/**
 * Conversation settings
 */
export interface ConversationSettings {
  isPublic: boolean;
  allowInvites: boolean;
  allowFileUploads: boolean;
  allowVoiceMessages: boolean;
  allowBots: boolean;
  messageRetention: number; // days
  maxParticipants?: number;
  moderationLevel: ModerationLevel;
  aiEnabled: boolean;
  aiModel?: string;
  autoTranslate: boolean;
  language?: string;
  customEmojis: CustomEmoji[];
}

/**
 * Moderation levels
 */
export type ModerationLevel = 'none' | 'basic' | 'strict' | 'custom';

// ============================================================================
// MESSAGE INTERACTIONS
// ============================================================================

/**
 * Message reaction
 */
export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
  createdAt: string;
}

/**
 * Message attachment
 */
export interface MessageAttachment {
  id: string;
  type: AttachmentType;
  url: string;
  name: string;
  size: number;
  format: string;
  metadata: AttachmentMetadata;
}

/**
 * Attachment types
 */
export type AttachmentType = 'image' | 'video' | 'audio' | 'document' | 'code' | 'link';

/**
 * Message mention
 */
export interface MessageMention {
  type: MentionType;
  userId?: string;
  text: string;
  offset: number;
  length: number;
}

/**
 * Mention types
 */
export type MentionType = 'user' | 'channel' | 'role' | 'everyone' | 'here';

/**
 * Message edit
 */
export interface MessageEdit {
  content: MessageContent;
  editedAt: string;
  editedBy: string;
  reason?: string;
}

/**
 * Text formatting
 */
export interface TextFormatting {
  bold?: TextRange[];
  italic?: TextRange[];
  underline?: TextRange[];
  strikethrough?: TextRange[];
  code?: TextRange[];
  link?: LinkRange[];
  mention?: MentionRange[];
}

/**
 * Text range
 */
export interface TextRange {
  start: number;
  end: number;
}

/**
 * Link range
 */
export interface LinkRange extends TextRange {
  url: string;
  title?: string;
}

/**
 * Mention range
 */
export interface MentionRange extends TextRange {
  userId: string;
  displayName: string;
}

// ============================================================================
// AI INTEGRATION
// ============================================================================

/**
 * AI message context
 */
export interface AIMessageContext {
  model: string;
  provider: 'openai' | 'anthropic' | 'together' | 'local';
  temperature: number;
  maxTokens?: number;
  systemPrompt?: string;
  tools?: AITool[];
  toolCalls?: AIToolCall[];
  reasoning?: string;
  confidence?: number;
  tokensUsed: TokenUsage;
  responseTime: number;
  cached: boolean;
}

/**
 * Conversation AI context
 */
export interface ConversationAIContext {
  persona?: string;
  instructions?: string;
  memory: AIMemory[];
  context: ContextItem[];
  preferences: AIPreferences;
  capabilities: AICapability[];
  restrictions: AIRestriction[];
}

/**
 * AI tool definition
 */
export interface AITool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  required?: string[];
}

/**
 * AI tool call
 */
export interface AIToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
  result?: any;
  error?: string;
  executedAt: string;
}

/**
 * Token usage tracking
 */
export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
  cost?: number;
}

/**
 * AI memory item
 */
export interface AIMemory {
  id: string;
  type: MemoryType;
  content: string;
  importance: number;
  createdAt: string;
  lastAccessedAt: string;
  expiresAt?: string;
  tags: string[];
}

/**
 * Memory types
 */
export type MemoryType = 'fact' | 'preference' | 'instruction' | 'example' | 'context';

/**
 * Context item
 */
export interface ContextItem {
  type: ContextType;
  content: any;
  relevance: number;
  source: string;
  timestamp: string;
}

/**
 * Context types
 */
export type ContextType = 'file' | 'code' | 'workspace' | 'web' | 'database' | 'api';

/**
 * AI preferences
 */
export interface AIPreferences {
  verbosity: 'concise' | 'normal' | 'detailed';
  codeStyle: string;
  responseFormat: 'text' | 'markdown' | 'structured';
  includeExplanations: boolean;
  includeExamples: boolean;
  language: string;
}

/**
 * AI capability
 */
export interface AICapability {
  name: string;
  description: string;
  enabled: boolean;
  parameters?: Record<string, any>;
}

/**
 * AI restriction
 */
export interface AIRestriction {
  type: RestrictionType;
  rule: string;
  enabled: boolean;
}

/**
 * Restriction types
 */
export type RestrictionType = 'content' | 'action' | 'data' | 'time' | 'resource';

// ============================================================================
// REAL-TIME FEATURES
// ============================================================================

/**
 * Typing indicator
 */
export interface TypingIndicator {
  conversationId: string;
  userId: string;
  user?: AuthUser;
  startedAt: string;
  content?: string;
}

/**
 * Presence status
 */
export interface PresenceStatus {
  userId: string;
  status: UserStatus;
  activity?: UserActivity;
  lastSeen: string;
  deviceInfo?: DeviceInfo;
}

/**
 * User status
 */
export type UserStatus = 'online' | 'away' | 'busy' | 'offline' | 'invisible';

/**
 * User activity
 */
export interface UserActivity {
  type: ActivityType;
  description?: string;
  startedAt: string;
  details?: Record<string, any>;
}

/**
 * Activity types
 */
export type ActivityType = 'typing' | 'recording' | 'uploading' | 'viewing' | 'editing' | 'custom';

/**
 * Device information
 */
export interface DeviceInfo {
  type: DeviceType;
  os: string;
  browser?: string;
  version?: string;
  mobile: boolean;
}

/**
 * Device types
 */
export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'web' | 'api';

// ============================================================================
// CHAT EVENTS
// ============================================================================

/**
 * Chat event (WebSocket message)
 */
export interface ChatEvent extends WebSocketMessage {
  conversationId: string;
  event: ChatEventType;
  payload: ChatEventPayload;
}

/**
 * Chat event types
 */
export type ChatEventType =
  | 'message_sent'
  | 'message_delivered'
  | 'message_read'
  | 'message_deleted'
  | 'message_edited'
  | 'reaction_added'
  | 'reaction_removed'
  | 'typing_start'
  | 'typing_stop'
  | 'user_joined'
  | 'user_left'
  | 'user_online'
  | 'user_offline'
  | 'conversation_created'
  | 'conversation_updated'
  | 'conversation_deleted';

/**
 * Chat event payload (union type)
 */
export type ChatEventPayload =
  | MessageEventPayload
  | TypingEventPayload
  | PresenceEventPayload
  | ConversationEventPayload
  | ReactionEventPayload;

/**
 * Message event payload
 */
export interface MessageEventPayload {
  message: ChatMessage;
  conversation?: Conversation;
}

/**
 * Typing event payload
 */
export interface TypingEventPayload {
  typing: TypingIndicator;
}

/**
 * Presence event payload
 */
export interface PresenceEventPayload {
  presence: PresenceStatus;
}

/**
 * Conversation event payload
 */
export interface ConversationEventPayload {
  conversation: Conversation;
  participant?: ConversationParticipant;
}

/**
 * Reaction event payload
 */
export interface ReactionEventPayload {
  messageId: string;
  reaction: MessageReaction;
  userId: string;
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Send message request
 */
export interface SendMessageRequest {
  conversationId: string;
  content: MessageContent;
  type: MessageType;
  replyToId?: string;
  mentions?: MessageMention[];
  attachments?: string[];
  metadata?: Record<string, any>;
}

/**
 * Create conversation request
 */
export interface CreateConversationRequest {
  type: ConversationType;
  title?: string;
  description?: string;
  participants: string[];
  settings?: Partial<ConversationSettings>;
  initialMessage?: SendMessageRequest;
}

/**
 * Update conversation request
 */
export interface UpdateConversationRequest {
  title?: string;
  description?: string;
  settings?: Partial<ConversationSettings>;
  tags?: string[];
}

/**
 * Add participant request
 */
export interface AddParticipantRequest {
  userId: string;
  role?: ParticipantRole;
  permissions?: ParticipantPermission[];
}

/**
 * Update participant request
 */
export interface UpdateParticipantRequest {
  role?: ParticipantRole;
  permissions?: ParticipantPermission[];
  customName?: string;
}

/**
 * Message search request
 */
export interface MessageSearchRequest {
  query: string;
  conversationIds?: string[];
  messageTypes?: MessageType[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  authorIds?: string[];
  hasAttachments?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Message search response
 */
export interface MessageSearchResponse {
  messages: ChatMessage[];
  total: number;
  facets: {
    conversations: { id: string; name: string; count: number }[];
    authors: { id: string; name: string; count: number }[];
    types: { type: MessageType; count: number }[];
  };
}

// ============================================================================
// METADATA TYPES
// ============================================================================

/**
 * Message metadata
 */
export interface MessageMetadata {
  source?: string;
  clientId?: string;
  platform?: string;
  version?: string;
  encrypted?: boolean;
  translated?: boolean;
  originalLanguage?: string;
  sentiment?: SentimentAnalysis;
  toxicity?: ToxicityAnalysis;
  categories?: string[];
  priority?: MessagePriority;
  expiration?: string;
}

/**
 * Conversation metadata
 */
export interface ConversationMetadata {
  category?: string;
  topic?: string;
  summary?: string;
  keywords?: string[];
  sentiment?: SentimentAnalysis;
  statistics: ConversationStatistics;
  backup?: BackupInfo;
  integration?: IntegrationInfo;
}

/**
 * Attachment metadata
 */
export interface AttachmentMetadata {
  width?: number;
  height?: number;
  duration?: number;
  encoding?: string;
  checksum: string;
  virusScan?: VirusScanResult;
  thumbnail?: string;
  preview?: string;
}

/**
 * Sentiment analysis
 */
export interface SentimentAnalysis {
  score: number; // -1 to 1
  label: 'negative' | 'neutral' | 'positive';
  confidence: number;
  emotions?: EmotionScore[];
}

/**
 * Emotion score
 */
export interface EmotionScore {
  emotion: string;
  score: number;
}

/**
 * Toxicity analysis
 */
export interface ToxicityAnalysis {
  score: number;
  categories: ToxicityCategory[];
  flagged: boolean;
}

/**
 * Toxicity category
 */
export interface ToxicityCategory {
  category: string;
  score: number;
  flagged: boolean;
}

/**
 * Message priority
 */
export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * Conversation statistics
 */
export interface ConversationStatistics {
  totalMessages: number;
  totalParticipants: number;
  averageResponseTime: number;
  messageFrequency: number;
  topWords: WordFrequency[];
  activityPattern: ActivityPattern[];
}

/**
 * Word frequency
 */
export interface WordFrequency {
  word: string;
  count: number;
}

/**
 * Activity pattern
 */
export interface ActivityPattern {
  hour: number;
  messageCount: number;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Poll option
 */
export interface PollOption {
  id: string;
  text: string;
  votes: string[];
  count: number;
}

/**
 * Link preview
 */
export interface LinkPreview {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  type?: string;
  error?: string;
}

/**
 * Custom emoji
 */
export interface CustomEmoji {
  id: string;
  name: string;
  url: string;
  category?: string;
  animated?: boolean;
}

/**
 * System action
 */
export type SystemAction =
  | 'user_joined'
  | 'user_left'
  | 'user_kicked'
  | 'user_banned'
  | 'conversation_created'
  | 'conversation_updated'
  | 'role_changed'
  | 'settings_updated'
  | 'message_pinned'
  | 'message_unpinned';

/**
 * Virus scan result
 */
export interface VirusScanResult {
  status: 'clean' | 'infected' | 'suspicious' | 'pending' | 'error';
  engine: string;
  scanDate: string;
  details?: string;
}

/**
 * Backup information
 */
export interface BackupInfo {
  lastBackup: string;
  schedule: string;
  retention: number;
  encrypted: boolean;
  location: string;
}

/**
 * Integration information
 */
export interface IntegrationInfo {
  type: string;
  config: Record<string, any>;
  lastSync: string;
  enabled: boolean;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for chat message
 */
export function isChatMessage(obj: any): obj is ChatMessage {
  return obj && typeof obj === 'object' && typeof obj.conversationId === 'string';
}

/**
 * Type guard for conversation
 */
export function isConversation(obj: any): obj is Conversation {
  return obj && typeof obj === 'object' && Array.isArray(obj.participants);
}

/**
 * Type guard for chat event
 */
export function isChatEvent(obj: any): obj is ChatEvent {
  return obj && typeof obj === 'object' && typeof obj.conversationId === 'string' && typeof obj.event === 'string';
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Message content types
 */
export type MessageContentType = MessageContent['type'];

/**
 * Extract message content by type
 */
export type ExtractMessageContent<T extends MessageContentType> = Extract<MessageContent, { type: T }>;

/**
 * Chat response types
 */
export type ChatResponse<T> = ApiResponse<T>;

/**
 * Message list response
 */
export type MessageListResponse = ChatResponse<{
  messages: ChatMessage[];
  hasMore: boolean;
  nextCursor?: string;
}>;

/**
 * Conversation list response
 */
export type ConversationListResponse = ChatResponse<{
  conversations: Conversation[];
  total: number;
  unreadTotal: number;
}>;

/**
 * All chat-related types
 */
export type ChatTypes =
  | ChatMessage
  | Conversation
  | ConversationParticipant
  | ChatEvent
  | TypingIndicator
  | PresenceStatus
  | MessageReaction
  | MessageAttachment;
