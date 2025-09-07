import { Server } from 'socket.io';

import { 
  SocketUser, 
  ProjectRoom, 
  UserPresencePayload,
  SocketEvents 
} from '@/types/realtime.types';

export class PresenceService {
  private io: Server;
  private connectedUsers: Map<string, SocketUser> = new Map();
  private projectRooms: Map<string, ProjectRoom> = new Map();
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  constructor(io: Server) {
    this.io = io;
  }

  async userConnected(socketId: string, userId: string): Promise<void> {
    const now = new Date();
    
    // Create or update socket user
    const socketUser: SocketUser = {
      id: socketId,
      socketId,
      userId,
      projectIds: [],
      isOnline: true,
      lastSeen: now
    };

    this.connectedUsers.set(socketId, socketUser);

    // Track user sockets
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);

    // Update user online status in database
    await this.updateUserOnlineStatus(userId, true, now);

    // Broadcast user online status
    const presencePayload: UserPresencePayload = {
      userId,
      isOnline: true,
      lastSeen: now
    };

    this.io.emit(SocketEvents.USER_ONLINE, presencePayload);

    console.log(`User ${userId} connected with socket ${socketId}`);
  }

  async userDisconnected(socketId: string): Promise<void> {
    const socketUser = this.connectedUsers.get(socketId);
    if (!socketUser) {return;}

    const { userId } = socketUser;
    const now = new Date();

    // Remove from connected users
    this.connectedUsers.delete(socketId);

    // Remove from user sockets
    const userSocketSet = this.userSockets.get(userId);
    if (userSocketSet) {
      userSocketSet.delete(socketId);
      
      // If no more sockets for this user, mark as offline
      if (userSocketSet.size === 0) {
        this.userSockets.delete(userId);
        
        // Update user offline status in database
        await this.updateUserOnlineStatus(userId, false, now);

        // Broadcast user offline status
        const presencePayload: UserPresencePayload = {
          userId,
          isOnline: false,
          lastSeen: now
        };

        this.io.emit(SocketEvents.USER_OFFLINE, presencePayload);
      }
    }

    // Remove from all project rooms
    socketUser.projectIds.forEach(projectId => {
      this.leaveProjectRoom(socketId, projectId);
    });

    console.log(`User ${userId} disconnected from socket ${socketId}`);
  }

  async joinProjectRoom(socketId: string, projectId: string): Promise<void> {
    const socketUser = this.connectedUsers.get(socketId);
    if (!socketUser) {return;}

    // Add to socket's project list
    if (!socketUser.projectIds.includes(projectId)) {
      socketUser.projectIds.push(projectId);
    }

    // Join socket.io room
    const socket = this.io.sockets.sockets.get(socketId);
    if (socket) {
      await socket.join(`project:${projectId}`);
    }

    // Update project room
    if (!this.projectRooms.has(projectId)) {
      this.projectRooms.set(projectId, {
        projectId,
        members: [],
        activeUsers: 0
      });
    }

    const projectRoom = this.projectRooms.get(projectId)!;
    const existingMember = projectRoom.members.find(m => m.socketId === socketId);
    
    if (!existingMember) {
      projectRoom.members.push(socketUser);
      projectRoom.activeUsers = this.getUniqueUsersInProject(projectId);
    }

    // Broadcast to project members
    this.io.to(`project:${projectId}`).emit(SocketEvents.PROJECT_MEMBER_ADDED, {
      projectId,
      userId: socketUser.userId,
      activeUsers: projectRoom.activeUsers,
      timestamp: new Date()
    });

    console.log(`User ${socketUser.userId} joined project room ${projectId}`);
  }

  leaveProjectRoom(socketId: string, projectId: string): void {
    const socketUser = this.connectedUsers.get(socketId);
    if (!socketUser) {return;}

    // Remove from socket's project list
    socketUser.projectIds = socketUser.projectIds.filter(id => id !== projectId);

    // Leave socket.io room
    const socket = this.io.sockets.sockets.get(socketId);
    if (socket) {
      socket.leave(`project:${projectId}`);
    }

    // Update project room
    const projectRoom = this.projectRooms.get(projectId);
    if (projectRoom) {
      projectRoom.members = projectRoom.members.filter(m => m.socketId !== socketId);
      projectRoom.activeUsers = this.getUniqueUsersInProject(projectId);

      // If no members left, remove the room
      if (projectRoom.members.length === 0) {
        this.projectRooms.delete(projectId);
      }

      // Broadcast to remaining project members
      this.io.to(`project:${projectId}`).emit(SocketEvents.PROJECT_MEMBER_REMOVED, {
        projectId,
        userId: socketUser.userId,
        activeUsers: projectRoom.activeUsers,
        timestamp: new Date()
      });
    }

    console.log(`User ${socketUser.userId} left project room ${projectId}`);
  }

  getProjectMembers(projectId: string): SocketUser[] {
    const projectRoom = this.projectRooms.get(projectId);
    return projectRoom ? projectRoom.members : [];
  }

  getOnlineUsers(): SocketUser[] {
    return Array.from(this.connectedUsers.values());
  }

  getUserPresence(userId: string): { isOnline: boolean; lastSeen: Date } | null {
    const userSockets = this.userSockets.get(userId);
    if (userSockets && userSockets.size > 0) {
      // User is online if they have active sockets
      const socketId = Array.from(userSockets)[0];
      const socketUser = this.connectedUsers.get(socketId);
      return socketUser ? {
        isOnline: true,
        lastSeen: socketUser.lastSeen
      } : null;
    }

    // User is offline, would need to check database for last seen
    return { isOnline: false, lastSeen: new Date() };
  }

  broadcastToProject(projectId: string, event: string, data: any): void {
    this.io.to(`project:${projectId}`).emit(event, data);
  }

  broadcastToUser(userId: string, event: string, data: any): void {
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      userSockets.forEach(socketId => {
        this.io.to(socketId).emit(event, data);
      });
    }
  }

  getProjectStats(projectId: string): { activeUsers: number; totalMembers: number } {
    const projectRoom = this.projectRooms.get(projectId);
    if (!projectRoom) {
      return { activeUsers: 0, totalMembers: 0 };
    }

    return {
      activeUsers: projectRoom.activeUsers,
      totalMembers: projectRoom.members.length
    };
  }

  private getUniqueUsersInProject(projectId: string): number {
    const projectRoom = this.projectRooms.get(projectId);
    if (!projectRoom) {return 0;}

    const uniqueUserIds = new Set(projectRoom.members.map(m => m.userId));
    return uniqueUserIds.size;
  }

  private async updateUserOnlineStatus(userId: string, isOnline: boolean, lastSeen: Date): Promise<void> {
    try {
      // This would update the user's online status in the database
      // For now, just log the action
      console.log(`Updating user ${userId} online status: ${isOnline}, last seen: ${lastSeen}`);
      
      // In a real implementation, this would be:
      // await prisma.user.update({
      //   where: { id: userId },
      //   data: { isOnline, lastActive: lastSeen }
      // });
    } catch (error) {
      console.error('Failed to update user online status:', error);
    }
  }
}