import { io, Socket } from 'socket.io-client';

import { 
  SocketEvents,
  SocketClient,
  Notification,
  UserPresencePayload,
  ProjectUpdatePayload,
  TaskUpdatePayload,
  TypingIndicatorPayload,
  CollaborativeEditPayload
} from '@/types/realtime.types';

class SocketClientManager implements SocketClient {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(userId?: string): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    this.userId = userId || this.userId;
    if (!this.userId) {
      console.error('User ID is required for socket connection');
      return;
    }

    const socketUrl = process.env.NODE_ENV === 'production' 
      ? window.location.origin 
      : 'http://localhost:3001';

    this.socket = io(socketUrl, {
      path: '/api/socketio',
      auth: {
        userId: this.userId
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.setupEventHandlers();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.reconnectAttempts = 0;
  }

  joinProject(projectId: string): void {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit(SocketEvents.JOIN_PROJECT, { projectId });
  }

  leaveProject(projectId: string): void {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit(SocketEvents.LEAVE_PROJECT, { projectId });
  }

  sendMessage(message: any): void {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('message', message);
  }

  // Real-time updates
  broadcastProjectUpdate(projectId: string, changes: Record<string, any>): void {
    if (!this.socket?.connected) {return;}

    const payload: ProjectUpdatePayload = {
      projectId,
      updatedBy: this.userId!,
      changes,
      timestamp: new Date()
    };

    this.socket.emit('project_update', payload);
  }

  broadcastTaskUpdate(taskId: string, projectId: string, changes: Record<string, any>): void {
    if (!this.socket?.connected) {return;}

    const payload: TaskUpdatePayload = {
      taskId,
      projectId,
      updatedBy: this.userId!,
      changes,
      timestamp: new Date()
    };

    this.socket.emit('task_update', payload);
  }

  // Presence and typing
  startTyping(projectId: string, taskId?: string, documentId?: string): void {
    if (!this.socket?.connected) {return;}

    const payload: TypingIndicatorPayload = {
      userId: this.userId!,
      projectId,
      taskId,
      documentId,
      isTyping: true
    };

    this.socket.emit('start_typing', payload);
  }

  stopTyping(projectId: string, taskId?: string, documentId?: string): void {
    if (!this.socket?.connected) {return;}

    const payload: TypingIndicatorPayload = {
      userId: this.userId!,
      projectId,
      taskId,
      documentId,
      isTyping: false
    };

    this.socket.emit('stop_typing', payload);
  }

  // Collaborative editing
  startEditingDocument(documentId: string): void {
    if (!this.socket?.connected) {return;}

    this.socket.emit(SocketEvents.DOCUMENT_EDIT_START, { documentId });
  }

  endEditingDocument(documentId: string): void {
    if (!this.socket?.connected) {return;}

    this.socket.emit(SocketEvents.DOCUMENT_EDIT_END, { documentId });
  }

  updateCursorPosition(documentId: string, position: number): void {
    if (!this.socket?.connected) {return;}

    this.socket.emit(SocketEvents.DOCUMENT_CURSOR_MOVE, { documentId, position });
  }

  updateDocumentContent(documentId: string, content: string, position?: number): void {
    if (!this.socket?.connected) {return;}

    this.socket.emit(SocketEvents.DOCUMENT_CONTENT_CHANGE, { 
      documentId, 
      content, 
      position 
    });
  }

  // Notifications
  markNotificationRead(notificationId: string): void {
    if (!this.socket?.connected) {return;}

    this.socket.emit('mark_notification_read', { notificationId });
  }

  getNotifications(limit?: number, unreadOnly?: boolean): void {
    if (!this.socket?.connected) {return;}

    this.socket.emit('get_notifications', { limit, unreadOnly });
  }

  // Presence queries
  getOnlineUsers(): void {
    if (!this.socket?.connected) {return;}

    this.socket.emit('get_online_users');
  }

  getProjectMembers(projectId: string): void {
    if (!this.socket?.connected) {return;}

    this.socket.emit('get_project_members', { projectId });
  }

  getActiveEditors(documentId: string): void {
    if (!this.socket?.connected) {return;}

    this.socket.emit('get_active_editors', { documentId });
  }

  getDocumentLock(documentId: string): void {
    if (!this.socket?.connected) {return;}

    this.socket.emit('get_document_lock', { documentId });
  }

  // Event listeners
  on(event: string, callback: (data: any) => void): void {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    this.socket.on(event, callback);
  }

  off(event: string, callback?: (data: any) => void): void {
    if (!this.socket) {return;}

    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  emit(event: string, data: any): void {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit(event, data);
  }

  // Connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  private setupEventHandlers(): void {
    if (!this.socket) {return;}

    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to ConstructPro real-time server');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect
        return;
      }

      // Attempt to reconnect
      this.attemptReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.attemptReconnect();
    });

    // Welcome message
    this.socket.on('welcome', (data) => {
      console.log('Welcome message:', data);
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Project room events
    this.socket.on('project_joined', (data) => {
      console.log('Joined project room:', data.projectId);
    });

    this.socket.on('project_left', (data) => {
      console.log('Left project room:', data.projectId);
    });

    // Edit session responses
    this.socket.on('edit_session_response', (response) => {
      if (!response.success) {
        console.warn('Edit session failed:', response.message);
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);

    setTimeout(() => {
      if (this.socket && !this.socket.connected) {
        this.socket.connect();
      }
    }, delay);
  }
}

// Export singleton instance
export const socketClient = new SocketClientManager();

// Export types for convenience
export type {
  Notification,
  UserPresencePayload,
  ProjectUpdatePayload,
  TaskUpdatePayload,
  TypingIndicatorPayload,
  CollaborativeEditPayload
};

export { SocketEvents };