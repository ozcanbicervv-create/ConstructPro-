import { NextRequest, NextResponse } from 'next/server';
import { presenceService, notificationService } from '@/utils/socket';
import { authenticateRequest } from '@/middleware/auth.middleware';
import { 
  SocketEvents,
  NotificationType,
  NotificationPriority 
} from '@/types/realtime.types';

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const body = await request.json();
    const { type, target, data } = body;

    if (!type || !target) {
      return NextResponse.json(
        { error: 'Missing required fields: type, target' },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();
    const payload = { ...data, timestamp, triggeredBy: authResult.user!.id };

    switch (type) {
      case 'project_update':
        if (!target.projectId) {
          return NextResponse.json(
            { error: 'projectId is required for project updates' },
            { status: 400 }
          );
        }
        
        presenceService.broadcastToProject(
          target.projectId,
          SocketEvents.PROJECT_UPDATED,
          payload
        );

        // Send notification to project members
        await notificationService.sendProjectNotification(
          target.projectId,
          NotificationType.PROJECT_UPDATE,
          data.title || 'Project Updated',
          data.message || 'A project has been updated',
          payload,
          NotificationPriority.MEDIUM,
          authResult.user!.id
        );
        break;

      case 'task_update':
        if (!target.projectId || !target.taskId) {
          return NextResponse.json(
            { error: 'projectId and taskId are required for task updates' },
            { status: 400 }
          );
        }

        presenceService.broadcastToProject(
          target.projectId,
          SocketEvents.TASK_UPDATED,
          { ...payload, taskId: target.taskId }
        );

        // Send notification to assigned user if specified
        if (target.assigneeId) {
          await notificationService.sendTaskNotification(
            target.taskId,
            target.projectId,
            target.assigneeId,
            NotificationType.TASK_ASSIGNED,
            data.title || 'Task Updated',
            data.message || 'A task has been updated',
            payload
          );
        }
        break;

      case 'task_assigned':
        if (!target.projectId || !target.taskId || !target.assigneeId) {
          return NextResponse.json(
            { error: 'projectId, taskId, and assigneeId are required for task assignments' },
            { status: 400 }
          );
        }

        presenceService.broadcastToProject(
          target.projectId,
          SocketEvents.TASK_ASSIGNED,
          { ...payload, taskId: target.taskId, assigneeId: target.assigneeId }
        );

        await notificationService.sendTaskNotification(
          target.taskId,
          target.projectId,
          target.assigneeId,
          NotificationType.TASK_ASSIGNED,
          data.title || 'New Task Assigned',
          data.message || 'You have been assigned a new task',
          payload,
          NotificationPriority.HIGH
        );
        break;

      case 'material_update':
        if (!target.projectId) {
          return NextResponse.json(
            { error: 'projectId is required for material updates' },
            { status: 400 }
          );
        }

        presenceService.broadcastToProject(
          target.projectId,
          SocketEvents.MATERIAL_UPDATED,
          payload
        );
        break;

      case 'document_uploaded':
        if (!target.projectId) {
          return NextResponse.json(
            { error: 'projectId is required for document uploads' },
            { status: 400 }
          );
        }

        presenceService.broadcastToProject(
          target.projectId,
          SocketEvents.DOCUMENT_UPLOADED,
          payload
        );

        await notificationService.sendProjectNotification(
          target.projectId,
          NotificationType.DOCUMENT_APPROVAL_NEEDED,
          data.title || 'New Document Uploaded',
          data.message || 'A new document has been uploaded to the project',
          payload,
          NotificationPriority.MEDIUM,
          authResult.user!.id
        );
        break;

      case 'user_notification':
        if (!target.userId) {
          return NextResponse.json(
            { error: 'userId is required for user notifications' },
            { status: 400 }
          );
        }

        presenceService.broadcastToUser(
          target.userId,
          SocketEvents.NOTIFICATION_SENT,
          payload
        );
        break;

      case 'system_notification':
        await notificationService.sendSystemNotification(
          NotificationType.SYSTEM_MAINTENANCE,
          data.title || 'System Notification',
          data.message || 'System notification',
          payload,
          data.priority || NotificationPriority.HIGH
        );
        break;

      default:
        return NextResponse.json(
          { error: `Unsupported broadcast type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Broadcast sent successfully`,
      type,
      target,
      timestamp
    });
  } catch (error) {
    console.error('Error broadcasting real-time update:', error);
    return NextResponse.json(
      { error: 'Failed to broadcast update' },
      { status: 500 }
    );
  }
}