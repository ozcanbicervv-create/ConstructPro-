import { prisma } from '@/utils/db';
import { TaskAttachment } from '@prisma/client';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Extended task attachment type with relations
export type TaskAttachmentWithRelations = TaskAttachment & {
  task: {
    id: string;
    title: string;
    projectId: string;
  };
};

export class TaskAttachmentService {
  // Get all attachments for a task
  static async getTaskAttachments(taskId: string, userId: string): Promise<TaskAttachmentWithRelations[]> {
    // First verify user has access to the task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: {
            members: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    // Check if user has access to the project
    const hasAccess = task.project.managerId === userId || 
      task.project.members.some(member => member.userId === userId);

    if (!hasAccess) {
      throw new Error('Insufficient permissions to view task attachments');
    }

    const attachments = await prisma.taskAttachment.findMany({
      where: { taskId },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            projectId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return attachments;
  }

  // Upload and create a new attachment for a task
  static async createTaskAttachment(
    taskId: string, 
    file: File, 
    userId: string
  ): Promise<TaskAttachmentWithRelations> {
    // First verify user has access to the task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: {
            members: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    // Check if user has access to the project
    const hasAccess = task.project.managerId === userId || 
      task.project.members.some(member => member.userId === userId);

    if (!hasAccess) {
      throw new Error('Insufficient permissions to attach files to this task');
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 50MB limit');
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv',
      'application/zip', 'application/x-rar-compressed',
      'application/dwg', 'application/dxf'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error('File type not allowed');
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || '';
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    
    // Create upload directory structure
    const uploadDir = join(process.cwd(), 'uploads', 'tasks', taskId);
    await mkdir(uploadDir, { recursive: true });
    
    const filePath = join(uploadDir, uniqueFilename);
    const relativePath = join('uploads', 'tasks', taskId, uniqueFilename);

    // Save file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create database record
    const attachment = await prisma.taskAttachment.create({
      data: {
        taskId,
        name: file.name,
        filePath: relativePath,
        fileSize: file.size,
        mimeType: file.type,
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            projectId: true,
          },
        },
      },
    });

    return attachment;
  }

  // Delete an attachment
  static async deleteTaskAttachment(attachmentId: string, userId: string): Promise<boolean> {
    const attachment = await prisma.taskAttachment.findUnique({
      where: { id: attachmentId },
      include: {
        task: {
          include: {
            project: {
              include: {
                members: {
                  where: { userId },
                },
              },
            },
          },
        },
      },
    });

    if (!attachment) {
      return false;
    }

    // Check if user has access to the project
    const hasAccess = attachment.task.project.managerId === userId || 
      attachment.task.project.members.some(member => member.userId === userId);

    if (!hasAccess) {
      throw new Error('Insufficient permissions to delete this attachment');
    }

    // Delete file from disk (optional - you might want to keep files for audit)
    try {
      const fs = require('fs').promises;
      const fullPath = join(process.cwd(), attachment.filePath);
      await fs.unlink(fullPath);
    } catch (error) {
      // Log error but don't fail the operation
      console.warn('Failed to delete file from disk:', error);
    }

    // Delete database record
    await prisma.taskAttachment.delete({
      where: { id: attachmentId },
    });

    return true;
  }

  // Get attachment file for download
  static async getAttachmentFile(attachmentId: string, userId: string): Promise<{
    filePath: string;
    fileName: string;
    mimeType: string;
  } | null> {
    const attachment = await prisma.taskAttachment.findUnique({
      where: { id: attachmentId },
      include: {
        task: {
          include: {
            project: {
              include: {
                members: {
                  where: { userId },
                },
              },
            },
          },
        },
      },
    });

    if (!attachment) {
      return null;
    }

    // Check if user has access to the project
    const hasAccess = attachment.task.project.managerId === userId || 
      attachment.task.project.members.some(member => member.userId === userId);

    if (!hasAccess) {
      throw new Error('Insufficient permissions to download this attachment');
    }

    return {
      filePath: join(process.cwd(), attachment.filePath),
      fileName: attachment.name,
      mimeType: attachment.mimeType,
    };
  }
}