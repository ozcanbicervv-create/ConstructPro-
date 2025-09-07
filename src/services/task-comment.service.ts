import { TaskComment } from '@prisma/client';

import { prisma } from '@/utils/db';
import { CreateTaskCommentRequest } from '@/utils/validation-schemas';

// Extended task comment type with relations
export type TaskCommentWithRelations = TaskComment & {
  user: {
    id: string;
    name: string | null;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  task: {
    id: string;
    title: string;
    projectId: string;
  };
};

export class TaskCommentService {
  // Get all comments for a task with threading support
  static async getTaskComments(taskId: string, userId: string): Promise<TaskCommentWithRelations[]> {
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
      throw new Error('Insufficient permissions to view task comments');
    }

    const comments = await prisma.taskComment.findMany({
      where: { taskId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            projectId: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' }, // Chronological order for threading
    });

    return comments;
  }

  // Create a new comment on a task
  static async createTaskComment(
    taskId: string, 
    data: CreateTaskCommentRequest, 
    userId: string
  ): Promise<TaskCommentWithRelations> {
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
      throw new Error('Insufficient permissions to comment on this task');
    }

    const comment = await prisma.taskComment.create({
      data: {
        taskId,
        userId,
        content: data.content,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            projectId: true,
          },
        },
      },
    });

    return comment;
  }

  // Update a comment (only by the author)
  static async updateTaskComment(
    commentId: string, 
    content: string, 
    userId: string
  ): Promise<TaskCommentWithRelations | null> {
    const existingComment = await prisma.taskComment.findUnique({
      where: { id: commentId },
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

    if (!existingComment) {
      return null;
    }

    // Only allow the comment author or project manager to update
    const canUpdate = existingComment.userId === userId || 
      existingComment.task.project.managerId === userId;

    if (!canUpdate) {
      throw new Error('Insufficient permissions to update this comment');
    }

    const updatedComment = await prisma.taskComment.update({
      where: { id: commentId },
      data: { content },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            projectId: true,
          },
        },
      },
    });

    return updatedComment;
  }

  // Delete a comment (only by the author or project manager)
  static async deleteTaskComment(commentId: string, userId: string): Promise<boolean> {
    const comment = await prisma.taskComment.findUnique({
      where: { id: commentId },
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

    if (!comment) {
      return false;
    }

    // Only allow the comment author or project manager to delete
    const canDelete = comment.userId === userId || 
      comment.task.project.managerId === userId;

    if (!canDelete) {
      throw new Error('Insufficient permissions to delete this comment');
    }

    await prisma.taskComment.delete({
      where: { id: commentId },
    });

    return true;
  }
}