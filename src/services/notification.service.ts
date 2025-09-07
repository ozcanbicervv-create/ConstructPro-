import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';

import { 
  Notification, 
  NotificationType, 
  NotificationPriority,
  SocketEvents 
} from '@/types/realtime.types';

const prisma = new PrismaClient();

export class NotificationService {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: any,
    priority: NotificationPriority = NotificationPriority.MEDIUM
  ): Promise<Notification> {
    const notification: Notification = {
      id: crypto.randomUUID(),
      userId,
      type,
      title,
      message,
      data,
      priority,
      read: false,
      createdAt: new Date(),
      expiresAt: this.calculateExpiryDate(priority)
    };

    // Store in database (assuming we have a notifications table)
    try {
      // Note: This would require adding a Notification model to Prisma schema
      // For now, we'll store in memory or use a simple storage mechanism
      await this.storeNotification(notification);
    } catch (error) {
      console.error('Failed to store notification:', error);
    }

    // Send real-time notification
    await this.sendRealTimeNotification(notification);

    return notification;
  }

  async sendRealTimeNotification(notification: Notification): Promise<void> {
    // Send to specific user
    this.io.to(`user:${notification.userId}`).emit(SocketEvents.NOTIFICATION_SENT, notification);

    // For urgent notifications, also send to all user's active sessions
    if (notification.priority === NotificationPriority.URGENT) {
      const userSockets = await this.getUserSockets(notification.userId);
      userSockets.forEach(socketId => {
        this.io.to(socketId).emit(SocketEvents.NOTIFICATION_SENT, notification);
      });
    }
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      // Update in database
      await this.updateNotificationStatus(notificationId, true);
      
      // Emit read event
      this.io.to(`user:${userId}`).emit(SocketEvents.NOTIFICATION_READ, { 
        notificationId,
        readAt: new Date()
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  async getUserNotifications(
    userId: string, 
    limit = 50,
    unreadOnly = false
  ): Promise<Notification[]> {
    // This would query the database for user notifications
    // For now, return empty array as placeholder
    return [];
  }

  async sendProjectNotification(
    projectId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: any,
    priority: NotificationPriority = NotificationPriority.MEDIUM,
    excludeUserId?: string
  ): Promise<void> {
    try {
      // Get project members
      const projectMembers = await this.getProjectMembers(projectId);
      
      // Send notification to each member
      const notifications = await Promise.all(
        projectMembers
          .filter(member => member.userId !== excludeUserId)
          .map(member => 
            this.createNotification(
              member.userId,
              type,
              title,
              message,
              { ...data, projectId },
              priority
            )
          )
      );

      console.log(`Sent ${notifications.length} project notifications for project ${projectId}`);
    } catch (error) {
      console.error('Failed to send project notifications:', error);
    }
  }

  async sendTaskNotification(
    taskId: string,
    projectId: string,
    assigneeId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: any,
    priority: NotificationPriority = NotificationPriority.MEDIUM
  ): Promise<void> {
    await this.createNotification(
      assigneeId,
      type,
      title,
      message,
      { ...data, taskId, projectId },
      priority
    );
  }

  async sendSystemNotification(
    type: NotificationType,
    title: string,
    message: string,
    data?: any,
    priority: NotificationPriority = NotificationPriority.HIGH
  ): Promise<void> {
    // Send to all connected users
    this.io.emit(SocketEvents.NOTIFICATION_SENT, {
      id: crypto.randomUUID(),
      userId: 'system',
      type,
      title,
      message,
      data,
      priority,
      read: false,
      createdAt: new Date()
    });
  }

  private calculateExpiryDate(priority: NotificationPriority): Date | undefined {
    const now = new Date();
    switch (priority) {
      case NotificationPriority.LOW:
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      case NotificationPriority.MEDIUM:
        return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
      case NotificationPriority.HIGH:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day
      case NotificationPriority.URGENT:
        return undefined; // Never expires
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  private async storeNotification(notification: Notification): Promise<void> {
    // Placeholder for database storage
    // This would use Prisma to store the notification
    console.log('Storing notification:', notification.id);
  }

  private async updateNotificationStatus(notificationId: string, read: boolean): Promise<void> {
    // Placeholder for database update
    console.log(`Updating notification ${notificationId} read status to ${read}`);
  }

  private async getUserSockets(userId: string): Promise<string[]> {
    // Get all socket IDs for a user
    const sockets = await this.io.in(`user:${userId}`).fetchSockets();
    return sockets.map(socket => socket.id);
  }

  private async getProjectMembers(projectId: string): Promise<{ userId: string }[]> {
    try {
      // This would query the database for project members
      // For now, return empty array as placeholder
      return [];
    } catch (error) {
      console.error('Failed to get project members:', error);
      return [];
    }
  }
}