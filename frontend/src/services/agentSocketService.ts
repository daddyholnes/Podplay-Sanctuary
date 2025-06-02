import { io, Socket } from 'socket.io-client';
import { EventEmitter } from 'events';

/**
 * AgentSocketService
 * 
 * Handles socket communication between frontend and agent system.
 * Provides real-time updates from agents and model usage.
 */
export class AgentSocketService extends EventEmitter {
  private socket: Socket | null = null;
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 2000;
  private apiUrl: string = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Agent-specific event types
  private readonly AGENT_EVENTS = {
    MESSAGE: 'agent:message',
    RESPONSE: 'agent:response',
    STATE_UPDATE: 'agent:state_update',
    WINDOW_REQUEST: 'agent:window_request',
    ERROR: 'agent:error'
  };

  // Model-specific event types
  private readonly MODEL_EVENTS = {
    USAGE_UPDATE: 'model_usage_update',
    USAGE_REQUEST: 'model_usage_request',
    QUOTA_ALERT: 'model_quota_alert'
  };

  // Scout workflow event types
  private readonly SCOUT_EVENTS = {
    WORKFLOW_PROGRESS: 'scout_workflow_progress',
    TASK_UPDATE: 'scout_task_update',
    FILE_GENERATED: 'scout_file_generated',
    PROJECT_COMPLETE: 'scout_project_complete'
  };

  // Window management event types
  private readonly WINDOW_EVENTS = {
    CREATE: 'window:create',
    CLOSE: 'window:close',
    MINIMIZE: 'window:minimize',
    MAXIMIZE: 'window:maximize',
    RESTORE: 'window:restore',
    POSITION: 'window:position',
    SIZE: 'window:size',
    FOCUS: 'window:focus',
    UPDATE: 'window:update',
    LOAD_LAYOUT: 'window:loadLayout',
    SAVE_LAYOUT: 'window:saveLayout',
    FULL_SYNC: 'window:fullSync',
    REQUEST_SYNC: 'window:requestSync'
  };

  constructor() {
    super();
    this.initSocket();
  }

  /**
   * Initialize socket connection
   */
  private initSocket(): void {
    try {
      this.socket = io(this.apiUrl, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Socket initialization error:', error);
      this.emit('error', { message: 'Failed to connect to agent system' });
    }
  }

  /**
   * Set up socket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      this.connected = true;
      this.reconnectAttempts = 0;
      this.emit('connected');
      console.log('Connected to agent system');
      
      // Request initial data
      this.requestModelUsage();
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      this.emit('disconnected');
      console.log('Disconnected from agent system');
    });

    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
      console.error('Connection error:', error);
      this.emit('error', { message: 'Connection error', error });
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.socket?.disconnect();
        this.emit('max_reconnect_attempts');
      }
    });

    // Agent events
    this.socket.on(this.AGENT_EVENTS.RESPONSE, (data) => {
      this.emit('agent_response', data);
    });

    this.socket.on(this.AGENT_EVENTS.STATE_UPDATE, (data) => {
      this.emit('agent_state_update', data);
    });

    this.socket.on(this.AGENT_EVENTS.WINDOW_REQUEST, (data) => {
      this.emit('agent_window_request', data);
    });

    this.socket.on(this.AGENT_EVENTS.ERROR, (data) => {
      this.emit('agent_error', data);
    });

    // Model events
    this.socket.on(this.MODEL_EVENTS.USAGE_UPDATE, (data) => {
      this.emit('model_usage_update', data);
    });

    this.socket.on(this.MODEL_EVENTS.QUOTA_ALERT, (data) => {
      this.emit('model_quota_alert', data);
    });

    // Scout workflow events
    this.socket.on(this.SCOUT_EVENTS.WORKFLOW_PROGRESS, (data) => {
      this.emit('scout_workflow_progress', data);
    });

    this.socket.on(this.SCOUT_EVENTS.TASK_UPDATE, (data) => {
      this.emit('scout_task_update', data);
    });

    this.socket.on(this.SCOUT_EVENTS.FILE_GENERATED, (data) => {
      this.emit('scout_file_generated', data);
    });

    this.socket.on(this.SCOUT_EVENTS.PROJECT_COMPLETE, (data) => {
      this.emit('scout_project_complete', data);
    });

    // Window management events
    this.socket.on(this.WINDOW_EVENTS.CREATE, (data) => {
      this.emit('window_create', data);
    });

    this.socket.on(this.WINDOW_EVENTS.UPDATE, (data) => {
      this.emit('window_update', data);
    });

    this.socket.on(this.WINDOW_EVENTS.FULL_SYNC, (data) => {
      this.emit('window_full_sync', data);
    });
  }

  /**
   * Send a message to a specific agent
   */
  public sendAgentMessage(agentType: string, content: string, metadata: any = {}): void {
    if (!this.socket || !this.connected) {
      this.emit('error', { message: 'Not connected to agent system' });
      return;
    }

    this.socket.emit(this.AGENT_EVENTS.MESSAGE, {
      agentType,
      content,
      metadata,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Request model usage statistics
   */
  public requestModelUsage(): void {
    if (!this.socket || !this.connected) {
      this.emit('error', { message: 'Not connected to agent system' });
      return;
    }

    this.socket.emit(this.MODEL_EVENTS.USAGE_REQUEST, {
      user_id: 'nathan',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Start Scout workflow planning
   */
  public startScoutPlanning(projectRequest: string): void {
    if (!this.socket || !this.connected) {
      this.emit('error', { message: 'Not connected to agent system' });
      return;
    }

    this.socket.emit('scout:start_planning', {
      user_id: 'nathan',
      project_request: projectRequest,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Request a window sync
   */
  public requestWindowSync(): void {
    if (!this.socket || !this.connected) {
      this.emit('error', { message: 'Not connected to agent system' });
      return;
    }

    this.socket.emit(this.WINDOW_EVENTS.REQUEST_SYNC);
  }

  /**
   * Update a window
   */
  public updateWindow(windowData: any): void {
    if (!this.socket || !this.connected) {
      this.emit('error', { message: 'Not connected to agent system' });
      return;
    }

    this.socket.emit(this.WINDOW_EVENTS.UPDATE, { window: windowData });
  }

  /**
   * Create a new window
   */
  public createWindow(windowData: any): void {
    if (!this.socket || !this.connected) {
      this.emit('error', { message: 'Not connected to agent system' });
      return;
    }

    this.socket.emit(this.WINDOW_EVENTS.CREATE, windowData);
  }

  /**
   * Check if connected to socket
   */
  public isConnected(): boolean {
    return this.connected;
  }

  /**
   * Disconnect from socket
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  /**
   * Reconnect to socket
   */
  public reconnect(): void {
    this.disconnect();
    this.initSocket();
  }
}

// Export singleton instance
export const agentSocketService = new AgentSocketService();