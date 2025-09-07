import { Server, Socket } from 'socket.io';

import { CollaborativeEditingService } from '@/services/collaborative-editing.service';
import { NotificationService } from '@/services/notification.service';
import { PresenceService } from '@/services/presence.service';
import { 
  SocketEvents,
  ProjectUpdatePayload,
  TaskUpdatePayload,
  UserPresencePayload,
  TypingIndicatorPayload,
  CollaborativeEditPayload
} from '@/types/realtime.types';

// Services
let notificationService: NotificationService;
let presenceService: PresenceService;
let collaborativeEditingService: CollaborativeEditingService;

export const setupSocket = (io: Server) => {
  // Initialize services
  notificationService = new NotificationService(io);
  presenceService = new PresenceService(io);
  collaborativeEditingService = new CollaborativeEditingService(io);

  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);
    
    // Authentication middleware - extract user info from socket
    const userId = extractUserIdFromSocket(socket);
    if (!userId) {
      console.log('Unauthenticated connection, disconnecting:', socket.id);
      socket.disconnect();
      return;
    }

    // Handle user connection
    handleUserConnection(socket, userId);

    // Project room management
    setupProjectRoomHandlers(socket, userId);

    // Real-time updates
    setupRealTimeUpdateHandlers(socket, userId);

    // Presence and typing indicators
    setupPresenceHandlers(socket, userId);

    // Collaborative editing
    setupCollaborativeEditingHandlers(socket, userId);

    // Notification handling
    setupNotificationHandlers(socket, userId);

    // Handle disconnect
    socket.on('disconnect', () => {
      handleUserDisconnection(socket, userId);
    });

    // Send welcome message with user context
    socket.emit('welcome', {
      message: 'Connected to ConstructPro real-time server',
      userId,
      timestamp: new Date().toISOString(),
      features: [
        'project-rooms',
        'real-time-updates',
        'presence-tracking',
        'collaborative-editing',
        'notifications'
      ]
    });
  });
};

function extractUserIdFromSocket(socket: Socket): string | null {
  // Extract user ID from socket handshake auth or query
  const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId;
  return typeof userId === 'string' ? userId : null;
}

async function handleUserConnection(socket: Socket, userId: string) {
  try {
    // Register user as connected
    await presenceService.userConnected(socket.id, userId);
    
    // Join user-specific room for direct messaging
    await socket.join(`user:${userId}`);
    
    console.log(`User ${userId} connected and joined personal room`);
  } catch (error) {
    console.error('Error handling user connection:', error);
  }
}

function setupProjectRoomHandlers(socket: Socket, userId: string) {
  // Join project room
  socket.on(SocketEvents.JOIN_PROJECT, async (data: { projectId: string }) => {
    try {
      await presenceService.joinProjectRoom(socket.id, data.projectId);
      socket.emit('project_joined', { 
        projectId: data.projectId, 
        timestamp: new Date().toISOString() 
      });
    } catch (error) {
      console.error('Error joining project room:', error);
      socket.emit('error', { message: 'Failed to join project room' });
    }
  });

  // Leave project room
  socket.on(SocketEvents.LEAVE_PROJECT, (data: { projectId: string }) => {
    try {
      presenceService.leaveProjectRoom(socket.id, data.projectId);
      socket.emit('project_left', { 
        projectId: data.projectId, 
        timestamp: new Date().toISOString() 
      });
    } catch (error) {
      console.error('Error leaving project room:', error);
    }
  });
}

function setupRealTimeUpdateHandlers(socket: Socket, userId: string) {
  // Project updates
  socket.on('project_update', (payload: ProjectUpdatePayload) => {
    presenceService.broadcastToProject(
      payload.projectId,
      SocketEvents.PROJECT_UPDATED,
      payload
    );
  });

  // Task updates
  socket.on('task_update', (payload: TaskUpdatePayload) => {
    presenceService.broadcastToProject(
      payload.projectId,
      SocketEvents.TASK_UPDATED,
      payload
    );
  });

  // Project status changes
  socket.on('project_status_change', (data: { projectId: string; status: string; updatedBy: string }) => {
    presenceService.broadcastToProject(
      data.projectId,
      SocketEvents.PROJECT_STATUS_CHANGED,
      {
        ...data,
        timestamp: new Date().toISOString()
      }
    );
  });

  // Task status changes
  socket.on('task_status_change', (data: { taskId: string; projectId: string; status: string; updatedBy: string }) => {
    presenceService.broadcastToProject(
      data.projectId,
      SocketEvents.TASK_STATUS_CHANGED,
      {
        ...data,
        timestamp: new Date().toISOString()
      }
    );
  });
}

function setupPresenceHandlers(socket: Socket, userId: string) {
  // Typing indicators
  socket.on('start_typing', (data: TypingIndicatorPayload) => {
    if (data.documentId) {
      collaborativeEditingService.startTyping(userId, data.documentId, data.taskId);
    } else if (data.projectId) {
      // Broadcast typing in project context
      presenceService.broadcastToProject(
        data.projectId,
        SocketEvents.USER_TYPING,
        { ...data, userId }
      );
    }
  });

  socket.on('stop_typing', (data: TypingIndicatorPayload) => {
    if (data.documentId) {
      collaborativeEditingService.stopTyping(userId, data.documentId);
    } else if (data.projectId) {
      // Broadcast stop typing in project context
      presenceService.broadcastToProject(
        data.projectId,
        SocketEvents.USER_STOP_TYPING,
        { ...data, userId }
      );
    }
  });

  // Get online users
  socket.on('get_online_users', () => {
    const onlineUsers = presenceService.getOnlineUsers();
    socket.emit('online_users', onlineUsers);
  });

  // Get project members
  socket.on('get_project_members', (data: { projectId: string }) => {
    const members = presenceService.getProjectMembers(data.projectId);
    socket.emit('project_members', { projectId: data.projectId, members });
  });
}

function setupCollaborativeEditingHandlers(socket: Socket, userId: string) {
  // Start editing document
  socket.on(SocketEvents.DOCUMENT_EDIT_START, async (data: { documentId: string }) => {
    const result = await collaborativeEditingService.startEditSession(
      socket.id,
      userId,
      data.documentId
    );
    socket.emit('edit_session_response', result);
  });

  // End editing document
  socket.on(SocketEvents.DOCUMENT_EDIT_END, async (data: { documentId: string }) => {
    await collaborativeEditingService.endEditSession(socket.id, userId, data.documentId);
  });

  // Cursor movement
  socket.on(SocketEvents.DOCUMENT_CURSOR_MOVE, async (data: { documentId: string; position: number }) => {
    await collaborativeEditingService.updateCursorPosition(userId, data.documentId, data.position);
  });

  // Content changes
  socket.on(SocketEvents.DOCUMENT_CONTENT_CHANGE, async (data: { documentId: string; content: string; position?: number }) => {
    await collaborativeEditingService.updateDocumentContent(
      userId,
      data.documentId,
      data.content,
      data.position
    );
  });

  // Get active editors
  socket.on('get_active_editors', (data: { documentId: string }) => {
    const editors = collaborativeEditingService.getActiveEditors(data.documentId);
    socket.emit('active_editors', { documentId: data.documentId, editors });
  });

  // Get document lock status
  socket.on('get_document_lock', (data: { documentId: string }) => {
    const lock = collaborativeEditingService.getDocumentLock(data.documentId);
    socket.emit('document_lock_status', { documentId: data.documentId, lock });
  });
}

function setupNotificationHandlers(socket: Socket, userId: string) {
  // Mark notification as read
  socket.on('mark_notification_read', async (data: { notificationId: string }) => {
    await notificationService.markAsRead(data.notificationId, userId);
  });

  // Get user notifications
  socket.on('get_notifications', async (data: { limit?: number; unreadOnly?: boolean }) => {
    const notifications = await notificationService.getUserNotifications(
      userId,
      data.limit,
      data.unreadOnly
    );
    socket.emit('user_notifications', notifications);
  });
}

async function handleUserDisconnection(socket: Socket, userId: string) {
  try {
    // Clean up presence
    await presenceService.userDisconnected(socket.id);
    
    // Clean up collaborative editing sessions
    collaborativeEditingService.cleanupUserSessions(socket.id, userId);
    
    console.log(`User ${userId} disconnected and cleaned up`);
  } catch (error) {
    console.error('Error handling user disconnection:', error);
  }
}

// Export services for use in API routes
export { notificationService, presenceService, collaborativeEditingService };