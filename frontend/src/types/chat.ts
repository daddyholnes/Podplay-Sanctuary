// Message types
export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
}

// Chat session types
export interface ChatSession {
  id: string;
  name: string;
  model: string;
  systemInstruction?: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage?: string;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// Chat input types
export interface ChatInputState {
  message: string;
  attachments: File[];
  isRecording: boolean;
  isProcessing: boolean;
}

// Message status
export type MessageStatus = 'sending' | 'complete' | 'error';

// Chat UI states
export interface ChatUIState {
  inputFocused: boolean;
  showEmojiPicker: boolean;
  showAttachmentMenu: boolean;
  minimized: boolean;
  fullscreen: boolean;
}

// Agent types
export interface AgentState {
  isThinking: boolean;
  actionStep?: string;
  progressPercent?: number;
  showTypingIndicator: boolean;
}

// Media recording types
export interface MediaRecordingState {
  isRecordingAudio: boolean;
  isRecordingVideo: boolean;
  audioBlob?: Blob;
  videoBlob?: Blob;
  recordingTime: number;
  audioUrl?: string;
  videoUrl?: string;
}
