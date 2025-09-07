import { TaskStatus, TaskPriority } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { 
  withErrorHandling, 
  requireAuth, 
  createErrorResponse,
  ErrorCodes,
  getPaginationParams,
  createPaginatedResponse
} from '@/utils/api-helpers';
import { prisma } from '@/utils/db';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * GET /api/projects/:id/tasks
 * Get all tasks for a specific project with filtering options
 */
export const GET = withErrorHandling(async (request: NextRequest, context: RouteContext) => {
  const session = await requireAuth(request);
  const { id: projectId } = context.params;
  const { searchParams } = new URL(request.url);
  
  // Check if user has access to this project
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        where: { userId: session.user.id },
      },
    },
  });
  
  if (!project) {
    return createErrorResponse(
      ErrorCodes.PROJECT_NOT_FOUND,
      'Project not found',
      404
    );
  }
  
  // Check access permissions
  const hasAccess = project.managerId === session.user.id || 
    project.members.length > 0 ||
    session.user.role === 'ADMIN';
    
  if (!hasAccess) {
    return createErrorResponse(
      ErrorCodes.INSUFFICIENT_PERMISSIONS,
      'You do not have access to this project',
      403
    );
  }
  
  // Parse query parameters for filtering
  const status = searchParams.get('status') as TaskStatus | null;
  const priority = searchParams.get('priority') as TaskPriority | null;
  const assignedTo = searchParams.get('assignedTo');
  const search = searchParams.get('search');
  const dueDateFrom = searchParams.get('dueDateFrom');
  const dueDateTo = searchParams.get('dueDateTo');
  
  // Get pagination parameters
  const pagination = getPaginationParams(searchParams);
  
  // Build where clause
  const where: any = {
    projectId,
  };
  
  if (status) {
    where.status = status;
  }
  
  if (priority) {
    where.priority = priority;
  }
  
  if (assignedTo) {
    where.assignedTo = assignedTo;
  }
  
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }
  
  if (dueDateFrom || dueDateTo) {
    where.dueDate = {};
    if (dueDateFrom) {
      where.dueDate.gte = new Date(dueDateFrom);
    }
    if (dueDateTo) {
      where.dueDate.lte = new Date(dueDateTo);
    }
  }
  
  // Get tasks with pagination
  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 3, // Latest 3 comments
        },
        attachments: {
          select: {
            id: true,
            name: true,
            fileSize: true,
            mimeType: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            comments: true,
            attachments: true,
          },
        },
      },
    }),
    prisma.task.count({ where }),
  ]);
  
  const response = createPaginatedResponse(tasks, total, pagination.page, pagination.limit);
  
  return NextResponse.json(response);
});