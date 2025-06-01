import { EventEmitter } from 'events';
import { SocketService } from './SocketService';
import { SocketErrorHandler } from './SocketErrorHandler';
import { 
  ChatMessage, 
  ChatRoom, 
  TypingIndicator,
  MessageReaction,
  ChatEvent,
  ChatError
} from '../api/APITypes';

export interface ChatSocketConfig {
  reconnectAttempts?: number;
  heartbeatInterval?: number;
  typingTimeout?: number;
  messageBuffer?: number;
  autoMarkRead?: boolean;
}

export interface ChatRoomMetadata {
  id: string;
  name: string;
  participants: string[];
  lastActivity: Date;
  unreadCount: number;
  isTyping: TypingIndicator[];
}

export interface MessageDeliveryStatus {
  messageId: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: Date;
  error?: ChatError;
}

export class ChatSocketService extends EventEmitter {
  private socketService: SocketService;
  private errorHandler: SocketErrorHandler;
  private config: Required<ChatSocketConfig>;
  private activeRooms = new Map<string, ChatRoomMetadata>();
  private messageQueue = new Map<string, ChatMessage[]>();
  private deliveryStatus = new Map<string, MessageDeliveryStatus>();
  private typingUsers = new Map<string, Set<string>>();
  private heartbeatInterval?: NodeJS.Timeout;
  private typingTimeouts = new Map<string, NodeJS.Timeout>();

  constructor(
    socketService: SocketService,
    errorHandler: SocketErrorHandler,
    config: ChatSocketConfig = {}
  ) {
    super();
    this.socketService = socketService;
    this.errorHandler = errorHandler;
    
    this.config = {
      reconnectAttempts: config.reconnectAttempts ?? 5,
      heartbeatInterval: config.heartbeatInterval ?? 30000,
      typingTimeout: config.typingTimeout ?? 3000,
      messageBuffer: config.messageBuffer ?? 100,
      autoMarkRead: config.autoMarkRead ?? true
    };

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Socket connection events
    this.socketService.on('connected', () => {
      this.emit('chatConnected');
      this.startHeartbeat();
      this.resendPendingMessages();
    });

    this.socketService.on('disconnected', () => {
      this.emit('chatDisconnected');
      this.stopHeartbeat();
      this.clearTypingTimeouts();
    });

    this.socketService.on('reconnected', () => {
      this.emit('chatReconnected');
      this.rejoinActiveRooms();
    });

    // Chat-specific events
    this.socketService.on('message:received', this.handleMessageReceived.bind(this));
    this.socketService.on('message:delivered', this.handleMessageDelivered.bind(this));
    this.socketService.on('message:read', this.handleMessageRead.bind(this));
    this.socketService.on('typing:start', this.handleTypingStart.bind(this));
    this.socketService.on('typing:stop', this.handleTypingStop.bind(this));
    this.socketService.on('room:joined', this.handleRoomJoined.bind(this));
    this.socketService.on('room:left', this.handleRoomLeft.bind(this));
    this.socketService.on('reaction:added', this.handleReactionAdded.bind(this));
    this.socketService.on('reaction:removed', this.handleReactionRemoved.bind(this));

    // Error handling
    this.errorHandler.on('error', (error) => {
      this.emit('chatError', error);
    });
  }

  async joinRoom(roomId: string): Promise<ChatRoomMetadata> {
    try {
      const response = await this.socketService.emit('room:join', { roomId });
      const roomMetadata: ChatRoomMetadata = response.data;
      
      this.activeRooms.set(roomId, roomMetadata);
      this.emit('roomJoined', roomMetadata);
      
      return roomMetadata;
    } catch (error) {
      throw this.errorHandler.handleError(error as Error, 'JOIN_ROOM_FAILED');
    }
  }

  async leaveRoom(roomId: string): Promise<void> {
    try {
      await this.socketService.emit('room:leave', { roomId });
      
      this.activeRooms.delete(roomId);
      this.messageQueue.delete(roomId);
      this.typingUsers.delete(roomId);
      
      this.emit('roomLeft', roomId);
    } catch (error) {
      throw this.errorHandler.handleError(error as Error, 'LEAVE_ROOM_FAILED');
    }
  }

  async sendMessage(roomId: string, content: string, type: 'text' | 'code' | 'file' = 'text'): Promise<string> {
    const messageId = this.generateMessageId();
    const message: ChatMessage = {
      id: messageId,
      roomId,
      content,
      type,
      senderId: await this.getCurrentUserId(),
      timestamp: new Date(),
      status: 'sending'
    };

    try {
      // Add to delivery tracking
      this.deliveryStatus.set(messageId, {
        messageId,
        status: 'sending',
        timestamp: new Date()
      });

      // Emit optimistic update
      this.emit('messageOptimistic', message);

      // Send via socket
      await this.socketService.emit('message:send', {
        roomId,
        messageId,
        content,
        type
      });

      this.updateDeliveryStatus(messageId, 'sent');
      return messageId;
    } catch (error) {
      this.updateDeliveryStatus(messageId, 'failed', error as Error);
      this.queueMessage(roomId, message);
      throw this.errorHandler.handleError(error as Error, 'SEND_MESSAGE_FAILED');
    }
  }

  async markMessageAsRead(roomId: string, messageId: string): Promise<void> {
    try {
      await this.socketService.emit('message:read', { roomId, messageId });
    } catch (error) {
      throw this.errorHandler.handleError(error as Error, 'MARK_READ_FAILED');
    }
  }

  async addReaction(messageId: string, emoji: string): Promise<void> {
    try {
      await this.socketService.emit('reaction:add', { messageId, emoji });
    } catch (error) {
      throw this.errorHandler.handleError(error as Error, 'ADD_REACTION_FAILED');
    }
  }

  async removeReaction(messageId: string, emoji: string): Promise<void> {
    try {
      await this.socketService.emit('reaction:remove', { messageId, emoji });
    } catch (error) {
      throw this.errorHandler.handleError(error as Error, 'REMOVE_REACTION_FAILED');
    }
  }

  startTyping(roomId: string): void {
    this.socketService.emit('typing:start', { roomId }).catch((error) => {
      this.errorHandler.handleError(error, 'TYPING_START_FAILED');
    });

    // Auto-stop typing after timeout
    const existingTimeout = this.typingTimeouts.get(roomId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const timeout = setTimeout(() => {
      this.stopTyping(roomId);
    }, this.config.typingTimeout);

    this.typingTimeouts.set(roomId, timeout);
  }

  stopTyping(roomId: string): void {
    this.socketService.emit('typing:stop', { roomId }).catch((error) => {
      this.errorHandler.handleError(error, 'TYPING_STOP_FAILED');
    });

    const timeout = this.typingTimeouts.get(roomId);
    if (timeout) {
      clearTimeout(timeout);
      this.typingTimeouts.delete(roomId);
    }
  }

  getActiveRooms(): ChatRoomMetadata[] {
    return Array.from(this.activeRooms.values());
  }

  getRoomMetadata(roomId: string): ChatRoomMetadata | undefined {
    return this.activeRooms.get(roomId);
  }

  getMessageDeliveryStatus(messageId: string): MessageDeliveryStatus | undefined {
    return this.deliveryStatus.get(messageId);
  }

  getTypingUsers(roomId: string): string[] {
    return Array.from(this.typingUsers.get(roomId) || []);
  }

  private handleMessageReceived(data: { message: ChatMessage }): void {
    const { message } = data;
    
    if (this.config.autoMarkRead) {
      this.markMessageAsRead(message.roomId, message.id).catch(() => {
        // Silent fail for auto-read
      });
    }

    this.emit('messageReceived', message);
  }

  private handleMessageDelivered(data: { messageId: string }): void {
    this.updateDeliveryStatus(data.messageId, 'delivered');
    this.emit('messageDelivered', data.messageId);
  }

  private handleMessageRead(data: { messageId: string, readBy: string }): void {
    this.updateDeliveryStatus(data.messageId, 'read');
    this.emit('messageRead', data);
  }

  private handleTypingStart(data: { roomId: string, userId: string }): void {
    const typingSet = this.typingUsers.get(data.roomId) || new Set();
    typingSet.add(data.userId);
    this.typingUsers.set(data.roomId, typingSet);
    
    this.emit('typingStart', data);
  }

  private handleTypingStop(data: { roomId: string, userId: string }): void {
    const typingSet = this.typingUsers.get(data.roomId);
    if (typingSet) {
      typingSet.delete(data.userId);
      if (typingSet.size === 0) {
        this.typingUsers.delete(data.roomId);
      }
    }
    
    this.emit('typingStop', data);
  }

  private handleRoomJoined(data: { room: ChatRoomMetadata }): void {
    this.activeRooms.set(data.room.id, data.room);
    this.emit('roomJoined', data.room);
  }

  private handleRoomLeft(data: { roomId: string }): void {
    this.activeRooms.delete(data.roomId);
    this.emit('roomLeft', data.roomId);
  }

  private handleReactionAdded(data: { messageId: string, reaction: MessageReaction }): void {
    this.emit('reactionAdded', data);
  }

  private handleReactionRemoved(data: { messageId: string, reaction: MessageReaction }): void {
    this.emit('reactionRemoved', data);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.socketService.emit('chat:heartbeat', { timestamp: Date.now() }).catch(() => {
        // Heartbeat failed, connection might be unstable
      });
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }

  private clearTypingTimeouts(): void {
    this.typingTimeouts.forEach(timeout => clearTimeout(timeout));
    this.typingTimeouts.clear();
  }

  private async rejoinActiveRooms(): Promise<void> {
    const rooms = Array.from(this.activeRooms.keys());
    for (const roomId of rooms) {
      try {
        await this.joinRoom(roomId);
      } catch (error) {
        this.errorHandler.handleError(error as Error, 'REJOIN_ROOM_FAILED');
      }
    }
  }

  private async resendPendingMessages(): Promise<void> {
    for (const [roomId, messages] of this.messageQueue) {
      for (const message of messages) {
        try {
          await this.sendMessage(roomId, message.content, message.type);
        } catch (error) {
          // Keep in queue for next reconnection attempt
        }
      }
    }
  }

  private queueMessage(roomId: string, message: ChatMessage): void {
    const queue = this.messageQueue.get(roomId) || [];
    queue.push(message);
    
    if (queue.length > this.config.messageBuffer) {
      queue.shift(); // Remove oldest message
    }
    
    this.messageQueue.set(roomId, queue);
  }

  private updateDeliveryStatus(
    messageId: string, 
    status: MessageDeliveryStatus['status'], 
    error?: Error
  ): void {
    const currentStatus = this.deliveryStatus.get(messageId);
    if (currentStatus) {
      currentStatus.status = status;
      currentStatus.timestamp = new Date();
      if (error) {
        currentStatus.error = { code: 'DELIVERY_ERROR', message: error.message };
      }
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getCurrentUserId(): Promise<string> {
    // This would typically come from authentication service
    return 'current_user_id';
  }

  disconnect(): void {
    this.stopHeartbeat();
    this.clearTypingTimeouts();
    this.activeRooms.clear();
    this.messageQueue.clear();
    this.deliveryStatus.clear();
    this.typingUsers.clear();
    this.removeAllListeners();
  }
}
