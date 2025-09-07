import { Server } from 'socket.io';

import { 
  CollaborativeEditPayload,
  TypingIndicatorPayload,
  SocketEvents 
} from '@/types/realtime.types';

interface EditSession {
  documentId: string;
  userId: string;
  socketId: string;
  startTime: Date;
  lastActivity: Date;
  cursorPosition?: number;
}

interface DocumentLock {
  documentId: string;
  userId: string;
  socketId: string;
  lockedAt: Date;
  expiresAt: Date;
}

export class CollaborativeEditingService {
  private io: Server;
  private activeSessions: Map<string, EditSession[]> = new Map(); // documentId -> sessions
  private documentLocks: Map<string, DocumentLock> = new Map(); // documentId -> lock
  private typingIndicators: Map<string, Map<string, NodeJS.Timeout>> = new Map(); // documentId -> userId -> timeout

  constructor(io: Server) {
    this.io = io;
    
    // Clean up expired locks every minute
    setInterval(() => {
      this.cleanupExpiredLocks();
    }, 60000);
  }

  async startEditSession(
    socketId: string,
    userId: string,
    documentId: string
  ): Promise<{ success: boolean; message?: string; lock?: DocumentLock }> {
    // Check if document is locked by another user
    const existingLock = this.documentLocks.get(documentId);
    if (existingLock && existingLock.userId !== userId && existingLock.expiresAt > new Date()) {
      return {
        success: false,
        message: `Document is currently being edited by another user until ${existingLock.expiresAt.toISOString()}`
      };
    }

    // Create or update edit session
    const session: EditSession = {
      documentId,
      userId,
      socketId,
      startTime: new Date(),
      lastActivity: new Date()
    };

    if (!this.activeSessions.has(documentId)) {
      this.activeSessions.set(documentId, []);
    }

    const sessions = this.activeSessions.get(documentId)!;
    const existingSessionIndex = sessions.findIndex(s => s.userId === userId);
    
    if (existingSessionIndex >= 0) {
      sessions[existingSessionIndex] = session;
    } else {
      sessions.push(session);
    }

    // Create document lock (expires in 30 minutes)
    const lock: DocumentLock = {
      documentId,
      userId,
      socketId,
      lockedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
    };
    this.documentLocks.set(documentId, lock);

    // Join document room
    const socket = this.io.sockets.sockets.get(socketId);
    if (socket) {
      await socket.join(`document:${documentId}`);
    }

    // Broadcast edit start to other users
    const payload: CollaborativeEditPayload = {
      documentId,
      userId,
      action: 'start',
      timestamp: new Date()
    };

    this.io.to(`document:${documentId}`).emit(SocketEvents.DOCUMENT_EDIT_START, payload);

    console.log(`User ${userId} started editing document ${documentId}`);

    return { success: true, lock };
  }

  async endEditSession(socketId: string, userId: string, documentId: string): Promise<void> {
    // Remove from active sessions
    const sessions = this.activeSessions.get(documentId);
    if (sessions) {
      const updatedSessions = sessions.filter(s => s.socketId !== socketId);
      if (updatedSessions.length === 0) {
        this.activeSessions.delete(documentId);
      } else {
        this.activeSessions.set(documentId, updatedSessions);
      }
    }

    // Remove document lock if owned by this user
    const lock = this.documentLocks.get(documentId);
    if (lock && lock.userId === userId) {
      this.documentLocks.delete(documentId);
    }

    // Leave document room
    const socket = this.io.sockets.sockets.get(socketId);
    if (socket) {
      socket.leave(`document:${documentId}`);
    }

    // Clear typing indicator
    this.stopTyping(userId, documentId);

    // Broadcast edit end to other users
    const payload: CollaborativeEditPayload = {
      documentId,
      userId,
      action: 'end',
      timestamp: new Date()
    };

    this.io.to(`document:${documentId}`).emit(SocketEvents.DOCUMENT_EDIT_END, payload);

    console.log(`User ${userId} ended editing document ${documentId}`);
  }

  async updateCursorPosition(
    userId: string,
    documentId: string,
    position: number
  ): Promise<void> {
    // Update session cursor position
    const sessions = this.activeSessions.get(documentId);
    if (sessions) {
      const session = sessions.find(s => s.userId === userId);
      if (session) {
        session.cursorPosition = position;
        session.lastActivity = new Date();
      }
    }

    // Broadcast cursor position to other users in the document
    const payload: CollaborativeEditPayload = {
      documentId,
      userId,
      action: 'cursor',
      position,
      timestamp: new Date()
    };

    this.io.to(`document:${documentId}`).emit(SocketEvents.DOCUMENT_CURSOR_MOVE, payload);
  }

  async updateDocumentContent(
    userId: string,
    documentId: string,
    content: string,
    position?: number
  ): Promise<void> {
    // Update session activity
    const sessions = this.activeSessions.get(documentId);
    if (sessions) {
      const session = sessions.find(s => s.userId === userId);
      if (session) {
        session.lastActivity = new Date();
      }
    }

    // Broadcast content change to other users
    const payload: CollaborativeEditPayload = {
      documentId,
      userId,
      action: 'content',
      content,
      position,
      timestamp: new Date()
    };

    this.io.to(`document:${documentId}`).emit(SocketEvents.DOCUMENT_CONTENT_CHANGE, payload);

    console.log(`User ${userId} updated content in document ${documentId}`);
  }

  startTyping(userId: string, documentId: string, taskId?: string): void {
    // Clear existing typing timeout
    this.stopTyping(userId, documentId);

    // Set up typing indicator timeout (stops after 3 seconds of inactivity)
    if (!this.typingIndicators.has(documentId)) {
      this.typingIndicators.set(documentId, new Map());
    }

    const timeout = setTimeout(() => {
      this.stopTyping(userId, documentId);
    }, 3000);

    this.typingIndicators.get(documentId)!.set(userId, timeout);

    // Broadcast typing indicator
    const payload: TypingIndicatorPayload = {
      userId,
      projectId: '', // Would need to be passed or derived
      documentId,
      taskId,
      isTyping: true
    };

    this.io.to(`document:${documentId}`).emit(SocketEvents.USER_TYPING, payload);
  }

  stopTyping(userId: string, documentId: string): void {
    const documentTyping = this.typingIndicators.get(documentId);
    if (documentTyping) {
      const timeout = documentTyping.get(userId);
      if (timeout) {
        clearTimeout(timeout);
        documentTyping.delete(userId);
      }

      if (documentTyping.size === 0) {
        this.typingIndicators.delete(documentId);
      }
    }

    // Broadcast stop typing
    const payload: TypingIndicatorPayload = {
      userId,
      projectId: '', // Would need to be passed or derived
      documentId,
      isTyping: false
    };

    this.io.to(`document:${documentId}`).emit(SocketEvents.USER_STOP_TYPING, payload);
  }

  getActiveEditors(documentId: string): EditSession[] {
    return this.activeSessions.get(documentId) || [];
  }

  getDocumentLock(documentId: string): DocumentLock | undefined {
    const lock = this.documentLocks.get(documentId);
    if (lock && lock.expiresAt > new Date()) {
      return lock;
    }
    return undefined;
  }

  extendLock(userId: string, documentId: string, minutes = 30): boolean {
    const lock = this.documentLocks.get(documentId);
    if (lock && lock.userId === userId) {
      lock.expiresAt = new Date(Date.now() + minutes * 60 * 1000);
      return true;
    }
    return false;
  }

  forceReleaseLock(documentId: string, adminUserId: string): boolean {
    const lock = this.documentLocks.get(documentId);
    if (lock) {
      this.documentLocks.delete(documentId);
      
      // Notify the user who had the lock
      this.io.to(`user:${lock.userId}`).emit('document_lock_released', {
        documentId,
        releasedBy: adminUserId,
        timestamp: new Date()
      });

      return true;
    }
    return false;
  }

  private cleanupExpiredLocks(): void {
    const now = new Date();
    const expiredLocks: string[] = [];

    this.documentLocks.forEach((lock, documentId) => {
      if (lock.expiresAt <= now) {
        expiredLocks.push(documentId);
      }
    });

    expiredLocks.forEach(documentId => {
      const lock = this.documentLocks.get(documentId);
      if (lock) {
        this.documentLocks.delete(documentId);
        
        // Notify that the lock has expired
        this.io.to(`document:${documentId}`).emit('document_lock_expired', {
          documentId,
          previousOwner: lock.userId,
          timestamp: now
        });

        console.log(`Document lock expired for document ${documentId}, previously owned by ${lock.userId}`);
      }
    });
  }

  // Clean up when user disconnects
  cleanupUserSessions(socketId: string, userId: string): void {
    // Remove from all active sessions
    this.activeSessions.forEach((sessions, documentId) => {
      const userSession = sessions.find(s => s.socketId === socketId);
      if (userSession) {
        this.endEditSession(socketId, userId, documentId);
      }
    });

    // Remove any typing indicators
    this.typingIndicators.forEach((userTyping, documentId) => {
      if (userTyping.has(userId)) {
        this.stopTyping(userId, documentId);
      }
    });
  }
}