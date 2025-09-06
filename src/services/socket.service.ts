import { io, Socket } from 'socket.io-client';
import type { 
  SocketMessage, 
  SocketResponse, 
  SocketMessageType 
} from '@/types/api.types';

/**
 * Socket service for handling real-time communication
 * Manages WebSocket connections, message handling, and event subscriptions
 */
export class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventListeners: Map<string, Set<Function>> = new Map();
  private messageQueue: SocketMessage[] = [];
  private connectionPromise: Promise<void> | null = null;

  private readonly SOCKET_EVENTS = {
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    CONNECT_ERROR: 'connect_error',
    RECONNECT: 'reconnect',
    RECONNECT_ERROR: 'reconnect_error',
    RECONNECT_FAILED: 'reconnect_failed',
    MESSAGE: 'message',
    ERROR: 'error',
  } as const;

  /**
   * Initialize socket connection
   */
  async connect(serverUrl?: string, options?: any): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this._connect(serverUrl, options);
    return this.connectionPromise;
  }

  private async _connect(serverUrl?: string, options?: any): Promise<void> {
    try {
      const url = serverUrl || window.location.origin;
      
      this.socket = io(url, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        ...options,
      });

      return new Promise((resolve, reject) => {
        if (!this.socket) {
          reject(new Error('Failed to create socket instance'));
          return;
        }

        // Connection successful
        this.socket.on(this.SOCKET_EVENTS.CONNECT, () => {
          console.log('Socket connected:', this.socket?.id);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.connectionPromise = null;
          
          // Process queued messages
          this.processMessageQueue();
          
          // Emit connection event
          this.emit('connected', { socketId: this.socket?.id });
          
          resolve();
        });

        // Connection error
        this.socket.on(this.SOCKET_EVENTS.CONNECT_ERROR, (error) => {
          console.error('Socket connection error:', error);
          this.isConnected = false;
          this.connectionPromise = null;
          
          this.emit('connection_error', { error });
          reject(error);
        });

        // Disconnection
        this.socket.on(this.SOCKET_EVENTS.DISCONNECT, (reason) => {
          console.log('Socket disconnected:', reason);
          this.isConnected = false;
          
          this.emit('disconnected', { reason });
        });

        // Reconnection events
        this.socket.on(this.SOCKET_EVENTS.RECONNECT, (attemptNumber) => {
          console.log('Socket reconnected after', attemptNumber, 'attempts');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          this.emit('reconnected', { attemptNumber });
        });

        this.socket.on(this.SOCKET_EVENTS.RECONNECT_ERROR, (error) => {
          console.error('Socket reconnection error:', error);
          this.reconnectAttempts++;
          
          this.emit('reconnect_error', { error, attempts: this.reconnectAttempts });
        });

        this.socket.on(this.SOCKET_EVENTS.RECONNECT_FAILED, () => {
          console.error('Socket reconnection failed after maximum attempts');
          this.isConnected = false;
          
          this.emit('reconnect_failed', { maxAttempts: this.maxReconnectAttempts });
        });

        // Generic message handler
        this.socket.on(this.SOCKET_EVENTS.MESSAGE, (message: SocketMessage) => {
          this.handleMessage(message);
        });

        // Error handler
        this.socket.on(this.SOCKET_EVENTS.ERROR, (error) => {
          console.error('Socket error:', error);
          this.emit('error', { error });
        });
      });
    } catch (error) {
      this.connectionPromise = null;
      throw error;
    }
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.isConnected = false;
    this.connectionPromise = null;
    this.eventListeners.clear();
    this.messageQueue = [];
  }

  /**
   * Send message through socket
   */
  async sendMessage<T = any>(
    type: SocketMessageType,
    payload: T,
    options?: {
      projectId?: string;
      taskId?: string;
      timeout?: number;
    }
  ): Promise<SocketResponse<any>> {
    const message: SocketMessage<T> = {
      type,
      payload,
      timestamp: new Date().toISOString(),
      messageId: this.generateMessageId(),
      projectId: options?.projectId,
      taskId: options?.taskId,
    };

    if (!this.isConnected || !this.socket) {
      // Queue message if not connected
      this.messageQueue.push(message);
      throw new Error('Socket not connected. Message queued for later delivery.');
    }

    return new Promise((resolve, reject) => {
      const timeout = options?.timeout || 10000;
      const timeoutId = setTimeout(() => {
        reject(new Error('Socket message timeout'));
      }, timeout);

      // Send message and wait for response
      this.socket!.emit('message', message, (response: SocketResponse) => {
        clearTimeout(timeoutId);
        
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error || 'Socket message failed'));
        }
      });
    });
  }

  /**
   * Subscribe to specific message types
   */
  subscribe(messageType: SocketMessageType, callback: (payload: any) => void): () => void {
    if (!this.eventListeners.has(messageType)) {
      this.eventListeners.set(messageType, new Set());
    }
    
    this.eventListeners.get(messageType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(messageType);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.eventListeners.delete(messageType);
        }
      }
    };
  }

  /**
   * Subscribe to project-specific events
   */
  subscribeToProject(projectId: string, callback: (message: SocketMessage) => void): () => void {
    const eventName = `project:${projectId}`;
    
    if (this.socket) {
      this.socket.on(eventName, callback);
    }

    return () => {
      if (this.socket) {
        this.socket.off(eventName, callback);
      }
    };
  }

  /**
   * Subscribe to task-specific events
   */
  subscribeToTask(taskId: string, callback: (message: SocketMessage) => void): () => void {
    const eventName = `task:${taskId}`;
    
    if (this.socket) {
      this.socket.on(eventName, callback);
    }

    return () => {
      if (this.socket) {
        this.socket.off(eventName, callback);
      }
    };
  }

  /**
   * Join a room (project, task, etc.)
   */
  async joinRoom(roomId: string, roomType: 'project' | 'task' | 'team' = 'project'): Promise<void> {
    if (!this.isConnected || !this.socket) {
      throw new Error('Socket not connected');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('join_room', { roomId, roomType }, (response: SocketResponse) => {
        if (response.success) {
          console.log(`Joined ${roomType} room:`, roomId);
          resolve();
        } else {
          reject(new Error(response.error || 'Failed to join room'));
        }
      });
    });
  }

  /**
   * Leave a room
   */
  async leaveRoom(roomId: string, roomType: 'project' | 'task' | 'team' = 'project'): Promise<void> {
    if (!this.isConnected || !this.socket) {
      throw new Error('Socket not connected');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('leave_room', { roomId, roomType }, (response: SocketResponse) => {
        if (response.success) {
          console.log(`Left ${roomType} room:`, roomId);
          resolve();
        } else {
          reject(new Error(response.error || 'Failed to leave room'));
        }
      });
    });
  }

  /**
   * Send typing indicator
   */
  sendTyping(roomId: string, isTyping: boolean): void {
    if (this.isConnected && this.socket) {
      this.socket.emit('typing', { roomId, isTyping });
    }
  }

  /**
   * Update user status
   */
  updateUserStatus(status: 'online' | 'away' | 'busy' | 'offline'): void {
    if (this.isConnected && this.socket) {
      this.socket.emit('user_status', { status });
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): {
    connected: boolean;
    socketId?: string;
    reconnectAttempts: number;
  } {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(message: SocketMessage): void {
    console.log('Received socket message:', message);

    // Emit to specific message type listeners
    const listeners = this.eventListeners.get(message.type);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(message.payload);
        } catch (error) {
          console.error('Error in socket message callback:', error);
        }
      });
    }

    // Emit to general message listeners
    this.emit('message', message);
  }

  /**
   * Process queued messages when connection is restored
   */
  private processMessageQueue(): void {
    if (this.messageQueue.length > 0) {
      console.log(`Processing ${this.messageQueue.length} queued messages`);
      
      const messages = [...this.messageQueue];
      this.messageQueue = [];
      
      messages.forEach(message => {
        if (this.socket) {
          this.socket.emit('message', message);
        }
      });
    }
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Emit custom events
   */
  private emit(eventName: string, data: any): void {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${eventName} callback:`, error);
        }
      });
    }
  }

  /**
   * Add event listener for socket events
   */
  on(eventName: string, callback: Function): () => void {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, new Set());
    }
    
    this.eventListeners.get(eventName)!.add(callback);

    return () => {
      const listeners = this.eventListeners.get(eventName);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.eventListeners.delete(eventName);
        }
      }
    };
  }

  /**
   * Remove event listener
   */
  off(eventName: string, callback?: Function): void {
    if (callback) {
      const listeners = this.eventListeners.get(eventName);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.eventListeners.delete(eventName);
        }
      }
    } else {
      this.eventListeners.delete(eventName);
    }
  }
}

// Create singleton instance
export const socketService = new SocketService();