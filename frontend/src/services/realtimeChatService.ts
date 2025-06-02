import socketService from './socketService';
import chatApi, { ChatMessage, ChatSession } from './chatApi';

/**
 * RealTimeChat Service
 * Extends the basic chatApi with real-time capabilities
 */
class RealTimeChatService {
  private activeSessionId: string | null = null;
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private typingStatusInterval: number = 3000; // 3 seconds
  
  /**
   * Initialize the real-time chat service and set up event listeners
   */
  initialize(): void {
    // Listen for new messages from other users/agents
    socketService.on('message:new', this.handleNewMessage);
    
    // Listen for typing indicators
    socketService.on('message:typing', this.handleTypingIndicator);
    
    // Listen for session updates
    socketService.on('session:updated', this.handleSessionUpdate);
    
    // Listen for session deletions
    socketService.on('session:deleted', this.handleSessionDeleted);
  }
  
  /**
   * Set the active session ID
   */
  setActiveSession(sessionId: string | null): void {
    this.activeSessionId = sessionId;
  }
  
  /**
   * Get the active session ID
   */
  getActiveSession(): string | null {
    return this.activeSessionId;
  }
  
  /**
   * Send a message with real-time updates
   */
  async sendMessage(
    sessionId: string, 
    content: string, 
    attachments: File[] = [],
    callbacks?: {
      onStart?: () => void;
      onProgress?: (progress: number) => void;
      onSuccess?: (message: ChatMessage) => void;
      onError?: (error: Error) => void;
    }
  ): Promise<ChatMessage> {
    try {
      callbacks?.onStart?.();
      
      // Clear any active typing indicators
      this.clearTypingIndicator(sessionId);
      
      // Send message via API
      const message = await chatApi.sendMessage(sessionId, content, attachments);
      
      // Emit socket event for real-time update
      // (This is optional as the server will also broadcast the message)
      socketService.emit('message:new', message, sessionId);
      
      callbacks?.onSuccess?.(message);
      return message;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to send message');
      callbacks?.onError?.(err);
      throw err;
    }
  }
  
  /**
   * Send typing indicator
   */
  sendTypingIndicator(sessionId: string, isTyping: boolean = true): void {
    // Clear existing timeout if any
    if (this.typingTimeouts.has(sessionId)) {
      clearTimeout(this.typingTimeouts.get(sessionId));
      this.typingTimeouts.delete(sessionId);
    }
    
    // Send typing indicator
    socketService.emit('message:typing', sessionId, isTyping);
    
    // Set timeout to automatically clear typing indicator
    if (isTyping) {
      const timeout = setTimeout(() => {
        socketService.emit('message:typing', sessionId, false);
        this.typingTimeouts.delete(sessionId);
      }, this.typingStatusInterval);
      
      this.typingTimeouts.set(sessionId, timeout);
    }
  }
  
  /**
   * Clear typing indicator
   */
  clearTypingIndicator(sessionId: string): void {
    if (this.typingTimeouts.has(sessionId)) {
      clearTimeout(this.typingTimeouts.get(sessionId));
      this.typingTimeouts.delete(sessionId);
      socketService.emit('message:typing', sessionId, false);
    }
  }
  
  /**
   * Handle new message from socket
   */
  private handleNewMessage = (message: ChatMessage, sessionId: string): void => {
    // Custom event to notify components about new messages
    const event = new CustomEvent('podplay:new-message', {
      detail: { message, sessionId }
    });
    window.dispatchEvent(event);
    
    // If this is for the active session, mark as read
    if (sessionId === this.activeSessionId) {
      this.markMessageAsRead(sessionId, message.id);
    }
  };
  
  /**
   * Handle typing indicator from socket
   */
  private handleTypingIndicator = (sessionId: string, isTyping: boolean): void => {
    // Custom event to notify components about typing status
    const event = new CustomEvent('podplay:typing-indicator', {
      detail: { sessionId, isTyping }
    });
    window.dispatchEvent(event);
  };
  
  /**
   * Handle session update from socket
   */
  private handleSessionUpdate = (session: ChatSession): void => {
    // Custom event to notify components about session updates
    const event = new CustomEvent('podplay:session-updated', {
      detail: { session }
    });
    window.dispatchEvent(event);
  };
  
  /**
   * Handle session deletion from socket
   */
  private handleSessionDeleted = (sessionId: string): void => {
    // Custom event to notify components about session deletion
    const event = new CustomEvent('podplay:session-deleted', {
      detail: { sessionId }
    });
    window.dispatchEvent(event);
  };
  
  /**
   * Mark a message as read
   */
  async markMessageAsRead(sessionId: string, messageId: string): Promise<void> {
    try {
      // API call to mark message as read
      await chatApi.markMessageAsRead?.(sessionId, messageId);
      
      // Emit socket event for real-time update
      socketService.emit('message:read', sessionId, messageId, 'current-user');
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  }
  
  /**
   * Subscribe to custom events
   */
  subscribe<T extends keyof PodplayEventMap>(
    event: T, 
    callback: (detail: PodplayEventMap[T]) => void
  ): () => void {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<PodplayEventMap[T]>;
      callback(customEvent.detail);
    };
    
    window.addEventListener(`podplay:${event}`, handler as EventListener);
    
    // Return unsubscribe function
    return () => {
      window.removeEventListener(`podplay:${event}`, handler as EventListener);
    };
  }
}

// Define the custom event map
interface PodplayEventMap {
  'new-message': { message: ChatMessage, sessionId: string };
  'typing-indicator': { sessionId: string, isTyping: boolean };
  'session-updated': { session: ChatSession };
  'session-deleted': { sessionId: string };
}

// Create a singleton instance
const realtimeChatService = new RealTimeChatService();

export default realtimeChatService;