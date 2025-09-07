import { Task, Prisma } from '@prisma/client';

import { PaginationParams, PaginatedResponse, createPaginatedResponse } from '@/utils/api-helpers';
import { prisma } from '@/utils/db';
import { CreateTaskRequest, UpdateTaskRequest, TaskFilters } from '@/utils/validation-schemas';

// Extended task type with relations
export type TaskWithRelations = Task & {
  project: {
    id: string;
    name: string;
    status: string;
  };
  assignee?: {
    id: string;
    name: string | null;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  creator: {
    id: string;
    name: string | null;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  comments: Array<{
    id: string;
    content: string;
    createdAt: Date;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }>;
  attachments: Array<{
    id: string;
    name: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    createdAt: Date;
  }>;
};

export class TaskService {
  // Check user availability for task assignment
  static async checkUserAvailability(userId: string, startDate?: Date, endDate?: Date): Promise<{
    isAvailable: boolean;
    workload: number;
    conflictingTasks: Array<{
      id: string;
      title: string;
      dueDate: Date | null;
      estimatedHours: number | null;
    }>;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get user's active tasks
    const activeTasks = await prisma.task.findMany({
      where: {
        assignedTo: userId,
        status: {
          in: ['TODO', 'IN_PROGRESS', 'IN_REVIEW'],
        },
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
        estimatedHours: true,
      },
    });

    // Calculate current workload (sum of estimated hours for active tasks)
    const totalEstimatedHours = activeTasks.reduce((sum, task) => {
      const hours = task.estimatedHours ? parseFloat(task.estimatedHours.toString()) : 0;
      return sum + hours;
    }, 0);

    // Define workload thresholds
    const maxWeeklyHours = 40;
    const workloadPercentage = (totalEstimatedHours / maxWeeklyHours) * 100;

    // Check for conflicting tasks if date range is provided
    let conflictingTasks: Array<{
      id: string;
      title: string;
      dueDate: Date | null;
      estimatedHours: number | null;
    }> = [];

    if (startDate && endDate) {
      conflictingTasks = activeTasks.filter(task => {
        if (!task.dueDate) {return false;}
        return task.dueDate >= startDate && task.dueDate <= endDate;
      }).map(task => ({
        id: task.id,
        title: task.title,
        dueDate: task.dueDate,
        estimatedHours: task.estimatedHours ? parseFloat(task.estimatedHours.toString()) : null,
      }));
    }

    // User is considered available if workload is under 80% and no critical conflicts
    const isAvailable = workloadPercentage < 80 && conflictingTasks.length < 3;

    return {
      isAvailable,
      workload: Math.round(workloadPercentage),
      conflictingTasks,
    };
  }

  // Validate task assignment
  static async validateTaskAssignment(taskData: CreateTaskRequest | UpdateTaskRequest, userId?: string): Promise<void> {
    if (!taskData.assignedTo) {return;}

    // Check if assigned user exists and has access to the project
    const assignee = await prisma.user.findUnique({
      where: { id: taskData.assignedTo },
    });

    if (!assignee) {
      throw new Error('Assigned user not found');
    }

    // If this is for a specific project, check project access
    if ('projectId' in taskData) {
      const project = await prisma.project.findUnique({
        where: { id: taskData.projectId },
        include: {
          members: {
            where: { userId: taskData.assignedTo },
          },
        },
      });

      if (!project) {
        throw new Error('Project not found');
      }

      const hasAccess = project.managerId === taskData.assignedTo ||
        project.members.some(member => member.userId === taskData.assignedTo);

      if (!hasAccess) {
        throw new Error('Assigned user does not have access to this project');
      }
    }

    // Check user availability
    const dueDate = taskData.dueDate ? new Date(taskData.dueDate) : undefined;
    const startDate = dueDate ? new Date(dueDate.getTime() - (7 * 24 * 60 * 60 * 1000)) : undefined; // 1 week before due date

    const availability = await this.checkUserAvailability(
      taskData.assignedTo,
      startDate,
      dueDate
    );

    // Warn if user has high workload but don't block assignment
    if (!availability.isAvailable) {
      console.warn(`Warning: User ${taskData.assignedTo} has high workload (${availability.workload}%) and ${availability.conflictingTasks.length} conflicting tasks`);
    }
  }

  // Create a new task
  static async createTask(data: CreateTaskRequest, createdBy: string): Promise<Task> {
    // Verify project exists and user has access
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
      include: {
        members: {
          where: { userId: createdBy },
        },
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Check if user has access to the project
    const hasAccess = project.managerId === createdBy || 
      project.members.some(member => member.userId === createdBy);

    if (!hasAccess) {
      throw new Error('Insufficient permissions to create tasks in this project');
    }

    // Validate task assignment if assignedTo is provided
    if (data.assignedTo) {
      await this.validateTaskAssignment(data, createdBy);
    }

    const task = await prisma.task.create({
      data: {
        ...data,
        createdBy,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        estimatedHours: data.estimatedHours ? new Prisma.Decimal(data.estimatedHours) : null,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
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
      },
    });

    return task;
  }

  // Get tasks with filtering and pagination
  static async getTasks(
    filters: TaskFilters,
    pagination: PaginationParams,
    userId?: string
  ): Promise<PaginatedResponse<TaskWithRelations>> {
    const where: Prisma.TaskWhereInput = {};

    // Apply filters
    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.assignedTo) {
      where.assignedTo = filters.assignedTo;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    if (filters.dueDateFrom || filters.dueDateTo) {
      where.dueDate = {};
      if (filters.dueDateFrom) {
        where.dueDate.gte = new Date(filters.dueDateFrom);
      }
      if (filters.dueDateTo) {
        where.dueDate.lte = new Date(filters.dueDateTo);
      }
    }

    // If userId is provided, filter to tasks in projects where user has access
    if (userId) {
      where.project = {
        OR: [
          { managerId: userId },
          { members: { some: { userId } } },
        ],
      };
    }

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
          project: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
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
                  email: true,
                },
              },
            },
            take: 3, // Limit to recent comments
            orderBy: { createdAt: 'desc' },
          },
          attachments: {
            select: {
              id: true,
              name: true,
              filePath: true,
              fileSize: true,
              mimeType: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.task.count({ where }),
    ]);

    return createPaginatedResponse(tasks, total, pagination.page, pagination.limit);
  }

  // Get a single task by ID with full relations
  static async getTaskById(id: string, userId?: string): Promise<TaskWithRelations | null> {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
            managerId: true,
            members: {
              select: {
                userId: true,
              },
            },
          },
        },
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
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        attachments: {
          select: {
            id: true,
            name: true,
            filePath: true,
            fileSize: true,
            mimeType: true,
            createdAt: true,
          },
        },
      },
    });

    if (!task) {
      return null;
    }

    // Check if user has access to this task's project
    if (userId) {
      const hasAccess = task.project.managerId === userId || 
        task.project.members.some(member => member.userId === userId);
      
      if (!hasAccess) {
        return null;
      }
    }

    return task;
  }

  // Update a task
  static async updateTask(
    id: string,
    data: UpdateTaskRequest,
    userId: string
  ): Promise<Task | null> {
    // First check if task exists and user has permission
    const existingTask = await prisma.task.findUnique({
      where: { id },
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

    if (!existingTask) {
      return null;
    }

    // Check if user has access to the project
    const hasAccess = existingTask.project.managerId === userId || 
      existingTask.project.members.some(member => member.userId === userId);

    if (!hasAccess) {
      throw new Error('Insufficient permissions');
    }

    // Validate task assignment if assignedTo is being changed
    if (data.assignedTo && data.assignedTo !== existingTask.assignedTo) {
      await this.validateTaskAssignment({ ...data, projectId: existingTask.projectId }, userId);
    }

    const updateData: Prisma.TaskUpdateInput = { ...data };

    // Convert date strings to Date objects
    if (data.dueDate) {
      updateData.dueDate = new Date(data.dueDate);
    }
    if (data.estimatedHours !== undefined) {
      updateData.estimatedHours = data.estimatedHours ? new Prisma.Decimal(data.estimatedHours) : null;
    }
    if (data.actualHours !== undefined) {
      updateData.actualHours = data.actualHours ? new Prisma.Decimal(data.actualHours) : null;
    }

    return await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
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
      },
    });
  }

  // Delete a task
  static async deleteTask(id: string, userId: string): Promise<boolean> {
    // Check if task exists and user has permission
    const task = await prisma.task.findUnique({
      where: { id },
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
      return false;
    }

    // Check if user has access to the project
    const hasAccess = task.project.managerId === userId || 
      task.project.members.some(member => member.userId === userId);

    if (!hasAccess) {
      throw new Error('Insufficient permissions');
    }

    // Only allow deletion if user is project manager, task creator, or has appropriate role
    const canDelete = task.project.managerId === userId || 
      task.createdBy === userId ||
      task.project.members.some(member => 
        member.userId === userId && ['OWNER', 'MANAGER', 'SUPERVISOR'].includes(member.role)
      );

    if (!canDelete) {
      throw new Error('Insufficient permissions to delete this task');
    }

    // Perform cascade delete of related data
    await prisma.$transaction(async (tx) => {
      // Delete task attachments
      await tx.taskAttachment.deleteMany({
        where: { taskId: id },
      });

      // Delete task comments
      await tx.taskComment.deleteMany({
        where: { taskId: id },
      });

      // Delete the task
      await tx.task.delete({
        where: { id },
      });
    });

    return true;
  }

  // Get task progress and completion metrics
  static async getTaskProgress(taskId: string, userId: string): Promise<{
    task: TaskWithRelations;
    progress: {
      completionPercentage: number;
      timeSpent: number;
      timeRemaining: number;
      isOverdue: boolean;
      daysUntilDue: number | null;
      estimatedCompletion: Date | null;
    };
    timeline: {
      created: Date;
      started: Date | null;
      lastUpdated: Date;
      completed: Date | null;
      dueDate: Date | null;
    };
    metrics: {
      commentsCount: number;
      attachmentsCount: number;
      hoursLogged: number;
      estimatedHours: number;
      efficiency: number; // actual vs estimated hours ratio
    };
  } | null> {
    const task = await this.getTaskById(taskId, userId);
    
    if (!task) {
      return null;
    }

    // Calculate progress metrics
    const actualHours = task.actualHours ? parseFloat(task.actualHours.toString()) : 0;
    const estimatedHours = task.estimatedHours ? parseFloat(task.estimatedHours.toString()) : 0;
    
    // Calculate completion percentage based on status and time spent
    let completionPercentage = 0;
    switch (task.status) {
      case 'TODO':
        completionPercentage = 0;
        break;
      case 'IN_PROGRESS':
        // Base on time spent vs estimated
        completionPercentage = estimatedHours > 0 ? Math.min((actualHours / estimatedHours) * 100, 90) : 25;
        break;
      case 'IN_REVIEW':
        completionPercentage = 95;
        break;
      case 'COMPLETED':
        completionPercentage = 100;
        break;
      case 'BLOCKED':
        // Keep current progress but don't advance
        completionPercentage = estimatedHours > 0 ? Math.min((actualHours / estimatedHours) * 100, 50) : 10;
        break;
    }

    // Calculate time metrics
    const timeRemaining = Math.max(0, estimatedHours - actualHours);
    const isOverdue = task.dueDate ? new Date() > task.dueDate : false;
    const daysUntilDue = task.dueDate ? 
      Math.ceil((task.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

    // Estimate completion date based on current progress
    let estimatedCompletion: Date | null = null;
    if (task.status !== 'COMPLETED' && timeRemaining > 0 && actualHours > 0) {
      const hoursPerDay = actualHours / Math.max(1, (new Date().getTime() - task.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      const daysToComplete = timeRemaining / Math.max(0.5, hoursPerDay);
      estimatedCompletion = new Date(Date.now() + (daysToComplete * 24 * 60 * 60 * 1000));
    }

    // Calculate efficiency (lower is better - actual vs estimated hours)
    const efficiency = estimatedHours > 0 ? actualHours / estimatedHours : 1;

    // Determine start date (first time status changed from TODO or first actual hours logged)
    // This would require additional tracking in a real implementation
    const started = task.status !== 'TODO' ? task.updatedAt : null;

    return {
      task,
      progress: {
        completionPercentage: Math.round(completionPercentage),
        timeSpent: actualHours,
        timeRemaining,
        isOverdue,
        daysUntilDue,
        estimatedCompletion,
      },
      timeline: {
        created: task.createdAt,
        started,
        lastUpdated: task.updatedAt,
        completed: task.status === 'COMPLETED' ? task.updatedAt : null,
        dueDate: task.dueDate,
      },
      metrics: {
        commentsCount: task.comments.length,
        attachmentsCount: task.attachments.length,
        hoursLogged: actualHours,
        estimatedHours,
        efficiency: Math.round(efficiency * 100) / 100,
      },
    };
  }

  // Get project task statistics and metrics
  static async getProjectTaskMetrics(projectId: string, userId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
    blockedTasks: number;
    averageCompletionTime: number;
    totalEstimatedHours: number;
    totalActualHours: number;
    efficiency: number;
    tasksByPriority: Record<string, number>;
    tasksByAssignee: Array<{
      userId: string;
      userName: string;
      taskCount: number;
      completedCount: number;
      workload: number;
    }>;
  }> {
    // Verify user has access to the project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          where: { userId },
        },
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const hasAccess = project.managerId === userId || 
      project.members.some(member => member.userId === userId);

    if (!hasAccess) {
      throw new Error('Insufficient permissions to view project metrics');
    }

    // Get all project tasks with assignee information
    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Calculate basic metrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
    const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const overdueTasks = tasks.filter(t => t.dueDate && new Date() > t.dueDate && t.status !== 'COMPLETED').length;
    const blockedTasks = tasks.filter(t => t.status === 'BLOCKED').length;

    // Calculate time metrics
    const totalEstimatedHours = tasks.reduce((sum, task) => {
      return sum + (task.estimatedHours ? parseFloat(task.estimatedHours.toString()) : 0);
    }, 0);

    const totalActualHours = tasks.reduce((sum, task) => {
      return sum + (task.actualHours ? parseFloat(task.actualHours.toString()) : 0);
    }, 0);

    const efficiency = totalEstimatedHours > 0 ? totalActualHours / totalEstimatedHours : 1;

    // Calculate average completion time (for completed tasks)
    const completedTasksWithTimes = tasks.filter(t => t.status === 'COMPLETED');
    const averageCompletionTime = completedTasksWithTimes.length > 0 ?
      completedTasksWithTimes.reduce((sum, task) => {
        const completionTime = (task.updatedAt.getTime() - task.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        return sum + completionTime;
      }, 0) / completedTasksWithTimes.length : 0;

    // Tasks by priority
    const tasksByPriority = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Tasks by assignee
    const assigneeMap = new Map();
    tasks.forEach(task => {
      if (task.assignedTo && task.assignee) {
        const key = task.assignedTo;
        if (!assigneeMap.has(key)) {
          assigneeMap.set(key, {
            userId: task.assignee.id,
            userName: task.assignee.name || `${task.assignee.firstName || ''} ${task.assignee.lastName || ''}`.trim(),
            taskCount: 0,
            completedCount: 0,
            estimatedHours: 0,
          });
        }
        const assigneeData = assigneeMap.get(key);
        assigneeData.taskCount++;
        if (task.status === 'COMPLETED') {
          assigneeData.completedCount++;
        }
        assigneeData.estimatedHours += task.estimatedHours ? parseFloat(task.estimatedHours.toString()) : 0;
      }
    });

    const tasksByAssignee = Array.from(assigneeMap.values()).map(assignee => ({
      ...assignee,
      workload: Math.round((assignee.estimatedHours / 40) * 100), // Assuming 40 hours per week
    }));

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      blockedTasks,
      averageCompletionTime: Math.round(averageCompletionTime * 10) / 10,
      totalEstimatedHours,
      totalActualHours,
      efficiency: Math.round(efficiency * 100) / 100,
      tasksByPriority,
      tasksByAssignee,
    };
  }
}