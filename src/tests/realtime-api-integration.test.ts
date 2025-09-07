import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/notifications/route';
import { PATCH } from '@/app/api/notifications/[id]/read/route';
import { GET as GetOnlineUsers } from '@/app/api/presence/online-users/route';
import { GET as GetProjectMembers } from '@/app/api/presence/projects/[id]/members/route';
import { POST as BroadcastUpdate } from '@/app/api/realtime/broadcast/route';
import { NotificationType, NotificationPriority } from '@/types/realtime.types';

// Mock the socket services
jest.mock('@/utils/socket', () => ({
  notificationService: {
    getUserNotifications: jest.fn(),
    createNotification: jest.fn(),
    markAsRead: jest.fn(),
    sendProjectNotification: jest.fn(),
    sendSystemNotification: jest.fn()
  },
  presenceService: {
    getOnlineUsers: jest.fn(),
    getProjectMembers: jest.fn(),
    getProjectStats: jest.fn(),
    broadcastToProject: jest.fn(),
    broadcastToUser: jest.fn()
  },
  collaborativeEditingService: {
    getActiveEditors: jest.fn(),
    getDocumentLock: jest.fn(),
    extendLock: jest.fn(),
    forceReleaseLock: jest.fn()
  }
}));

// Mock authentication middleware
jest.mock('@/middleware/auth.middleware', () => ({
  authenticateRequest: jest.fn()
}));

import { notificationService, presenceService } from '@/utils/socket';
import { authenticateRequest } from '@/middleware/auth.middleware';

const mockAuthenticateRequest = authenticateRequest as jest.MockedFunction<typeof authenticateRequest>;
const mockNotificationService = notificationService as jest.Mocked<typeof notificationService>;
const mockPresenceService = presenceService as jest.Mocked<typeof presenceService>;

describe('Real-time API Integration Tests', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    role: 'PROJECT_MANAGER'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthenticateRequest.mockResolvedValue({
      success: true,
      user: mockUser
    });
  });

  describe('Notifications API', () => {
    describe('GET /api/notifications', () => {
      test('should fetch user notifications successfully', async () => {
        const mockNotifications = [
          {
            id: 'notif-1',
            userId: 'user-123',
            type: NotificationType.TASK_ASSIGNED,
            title: 'New Task',
            message: 'You have been assigned a new task',
            priority: NotificationPriority.HIGH,
            read: false,
            createdAt: new Date()
          }
        ];

        mockNotificationService.getUserNotifications.mockResolvedValue(mockNotifications);

        const request = new NextRequest('http://localhost:3000/api/notifications?limit=10&unreadOnly=true');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data).toEqual(mockNotifications);
        expect(mockNotificationService.getUserNotifications).toHaveBeenCalledWith(
          'user-123',
          10,
          true
        );
      });

      test('should handle authentication failure', async () => {
        mockAuthenticateRequest.mockResolvedValue({
          success: false,
          error: 'Unauthorized'
        });

        const request = new NextRequest('http://localhost:3000/api/notifications');
        const response = await GET(request);

        expect(response.status).toBe(401);
      });
    });

    describe('POST /api/notifications', () => {
      test('should create notification successfully', async () => {
        const mockNotification = {
          id: 'notif-1',
          userId: 'user-456',
          type: NotificationType.TASK_ASSIGNED,
          title: 'New Task',
          message: 'You have been assigned a new task',
          priority: NotificationPriority.HIGH,
          read: false,
          createdAt: new Date()
        };

        mockNotificationService.createNotification.mockResolvedValue(mockNotification);

        const requestBody = {
          userId: 'user-456',
          type: NotificationType.TASK_ASSIGNED,
          title: 'New Task',
          message: 'You have been assigned a new task',
          priority: NotificationPriority.HIGH
        };

        const request = new NextRequest('http://localhost:3000/api/notifications', {
          method: 'POST',
          body: JSON.stringify(requestBody)
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.success).toBe(true);
        expect(data.data).toEqual(mockNotification);
        expect(mockNotificationService.createNotification).toHaveBeenCalledWith(
          'user-456',
          NotificationType.TASK_ASSIGNED,
          'New Task',
          'You have been assigned a new task',
          undefined,
          NotificationPriority.HIGH
        );
      });

      test('should validate required fields', async () => {
        const request = new NextRequest('http://localhost:3000/api/notifications', {
          method: 'POST',
          body: JSON.stringify({
            userId: 'user-456'
            // Missing required fields
          })
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('Missing required fields');
      });

      test('should validate notification type', async () => {
        const request = new NextRequest('http://localhost:3000/api/notifications', {
          method: 'POST',
          body: JSON.stringify({
            userId: 'user-456',
            type: 'INVALID_TYPE',
            title: 'Test',
            message: 'Test message'
          })
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('Invalid notification type');
      });
    });

    describe('PATCH /api/notifications/[id]/read', () => {
      test('should mark notification as read', async () => {
        mockNotificationService.markAsRead.mockResolvedValue();

        const request = new NextRequest('http://localhost:3000/api/notifications/notif-1/read', {
          method: 'PATCH'
        });

        const response = await PATCH(request, { params: { id: 'notif-1' } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(mockNotificationService.markAsRead).toHaveBeenCalledWith('notif-1', 'user-123');
      });
    });
  });

  describe('Presence API', () => {
    describe('GET /api/presence/online-users', () => {
      test('should fetch online users successfully', async () => {
        const mockOnlineUsers = [
          {
            id: 'socket-1',
            socketId: 'socket-1',
            userId: 'user-1',
            projectIds: ['project-1'],
            isOnline: true,
            lastSeen: new Date()
          }
        ];

        mockPresenceService.getOnlineUsers.mockReturnValue(mockOnlineUsers);

        const request = new NextRequest('http://localhost:3000/api/presence/online-users');
        const response = await GetOnlineUsers(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.onlineUsers).toEqual(mockOnlineUsers);
        expect(data.data.totalCount).toBe(1);
      });
    });

    describe('GET /api/presence/projects/[id]/members', () => {
      test('should fetch project members successfully', async () => {
        const mockMembers = [
          {
            id: 'socket-1',
            socketId: 'socket-1',
            userId: 'user-1',
            projectIds: ['project-1'],
            isOnline: true,
            lastSeen: new Date()
          }
        ];

        const mockStats = {
          activeUsers: 1,
          totalMembers: 1
        };

        mockPresenceService.getProjectMembers.mockReturnValue(mockMembers);
        mockPresenceService.getProjectStats.mockReturnValue(mockStats);

        const request = new NextRequest('http://localhost:3000/api/presence/projects/project-1/members');
        const response = await GetProjectMembers(request, { params: { id: 'project-1' } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.projectId).toBe('project-1');
        expect(data.data.members).toEqual(mockMembers);
        expect(data.data.stats).toEqual(mockStats);
      });
    });
  });

  describe('Real-time Broadcast API', () => {
    describe('POST /api/realtime/broadcast', () => {
      test('should broadcast project update successfully', async () => {
        mockPresenceService.broadcastToProject.mockImplementation(() => {});
        mockNotificationService.sendProjectNotification.mockResolvedValue();

        const requestBody = {
          type: 'project_update',
          target: { projectId: 'project-1' },
          data: {
            title: 'Project Updated',
            message: 'The project status has been updated',
            changes: { status: 'in_progress' }
          }
        };

        const request = new NextRequest('http://localhost:3000/api/realtime/broadcast', {
          method: 'POST',
          body: JSON.stringify(requestBody)
        });

        const response = await BroadcastUpdate(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.type).toBe('project_update');
        expect(mockPresenceService.broadcastToProject).toHaveBeenCalled();
        expect(mockNotificationService.sendProjectNotification).toHaveBeenCalled();
      });

      test('should broadcast task assignment successfully', async () => {
        mockPresenceService.broadcastToProject.mockImplementation(() => {});
        mockNotificationService.sendTaskNotification.mockResolvedValue();

        const requestBody = {
          type: 'task_assigned',
          target: {
            projectId: 'project-1',
            taskId: 'task-1',
            assigneeId: 'user-2'
          },
          data: {
            title: 'New Task Assigned',
            message: 'You have been assigned a new task'
          }
        };

        const request = new NextRequest('http://localhost:3000/api/realtime/broadcast', {
          method: 'POST',
          body: JSON.stringify(requestBody)
        });

        const response = await BroadcastUpdate(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(mockPresenceService.broadcastToProject).toHaveBeenCalled();
        expect(mockNotificationService.sendTaskNotification).toHaveBeenCalled();
      });

      test('should validate required fields for project update', async () => {
        const requestBody = {
          type: 'project_update',
          target: {}, // Missing projectId
          data: { title: 'Test' }
        };

        const request = new NextRequest('http://localhost:3000/api/realtime/broadcast', {
          method: 'POST',
          body: JSON.stringify(requestBody)
        });

        const response = await BroadcastUpdate(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('projectId is required');
      });

      test('should validate required fields for task assignment', async () => {
        const requestBody = {
          type: 'task_assigned',
          target: {
            projectId: 'project-1'
            // Missing taskId and assigneeId
          },
          data: { title: 'Test' }
        };

        const request = new NextRequest('http://localhost:3000/api/realtime/broadcast', {
          method: 'POST',
          body: JSON.stringify(requestBody)
        });

        const response = await BroadcastUpdate(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('taskId and assigneeId are required');
      });

      test('should handle system notifications', async () => {
        mockNotificationService.sendSystemNotification.mockResolvedValue();

        const requestBody = {
          type: 'system_notification',
          target: {},
          data: {
            title: 'System Maintenance',
            message: 'System will be down for maintenance',
            priority: NotificationPriority.URGENT
          }
        };

        const request = new NextRequest('http://localhost:3000/api/realtime/broadcast', {
          method: 'POST',
          body: JSON.stringify(requestBody)
        });

        const response = await BroadcastUpdate(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(mockNotificationService.sendSystemNotification).toHaveBeenCalled();
      });

      test('should handle unsupported broadcast type', async () => {
        const requestBody = {
          type: 'unsupported_type',
          target: {},
          data: {}
        };

        const request = new NextRequest('http://localhost:3000/api/realtime/broadcast', {
          method: 'POST',
          body: JSON.stringify(requestBody)
        });

        const response = await BroadcastUpdate(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('Unsupported broadcast type');
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle service errors gracefully', async () => {
      mockNotificationService.getUserNotifications.mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost:3000/api/notifications');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch notifications');
    });

    test('should handle missing parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/presence/projects//members');
      const response = await GetProjectMembers(request, { params: { id: '' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Project ID is required');
    });
  });
});