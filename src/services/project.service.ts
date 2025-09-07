import { Project, Prisma } from '@prisma/client';

import { PaginationParams, PaginatedResponse, createPaginatedResponse } from '@/utils/api-helpers';
import { prisma } from '@/utils/db';
import { CreateProjectRequest, UpdateProjectRequest, ProjectFilters } from '@/utils/validation-schemas';

// Extended project type with relations
export type ProjectWithRelations = Project & {
  manager: {
    id: string;
    name: string | null;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate: Date | null;
  }>;
  materials: Array<{
    id: string;
    name: string;
    quantity: number;
    totalCost: number;
  }>;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    fileSize: number;
  }>;
  members: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }>;
  milestones: Array<{
    id: string;
    name: string;
    dueDate: Date;
    completed: boolean;
  }>;
  phases: Array<{
    id: string;
    name: string;
    status: string;
    startDate: Date;
    endDate: Date;
  }>;
};

export class ProjectService {
  // Create a new project
  static async createProject(data: CreateProjectRequest, managerId: string): Promise<Project> {
    const project = await prisma.project.create({
      data: {
        ...data,
        managerId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        budget: data.budget ? new Prisma.Decimal(data.budget) : null,
      },
      include: {
        manager: {
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

    // Add the manager as a project member with OWNER role
    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: managerId,
        role: 'OWNER',
      },
    });

    return project;
  }

  // Get projects with filtering and pagination
  static async getProjects(
    filters: ProjectFilters,
    pagination: PaginationParams,
    userId?: string
  ): Promise<PaginatedResponse<ProjectWithRelations>> {
    const where: Prisma.ProjectWhereInput = {};

    // Apply filters
    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.managerId) {
      where.managerId = filters.managerId;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { description: { contains: filters.search } },
        { location: { contains: filters.search } },
      ];
    }

    if (filters.startDateFrom || filters.startDateTo) {
      where.startDate = {};
      if (filters.startDateFrom) {
        where.startDate.gte = new Date(filters.startDateFrom);
      }
      if (filters.startDateTo) {
        where.startDate.lte = new Date(filters.startDateTo);
      }
    }

    if (filters.endDateFrom || filters.endDateTo) {
      where.endDate = {};
      if (filters.endDateFrom) {
        where.endDate.gte = new Date(filters.endDateFrom);
      }
      if (filters.endDateTo) {
        where.endDate.lte = new Date(filters.endDateTo);
      }
    }

    if (filters.budgetMin !== undefined || filters.budgetMax !== undefined) {
      where.budget = {};
      if (filters.budgetMin !== undefined) {
        where.budget.gte = new Prisma.Decimal(filters.budgetMin);
      }
      if (filters.budgetMax !== undefined) {
        where.budget.lte = new Prisma.Decimal(filters.budgetMax);
      }
    }

    if (filters.location) {
      where.location = { contains: filters.location };
    }

    // If userId is provided, filter to projects where user is a member or manager
    if (userId) {
      where.OR = [
        { managerId: userId },
        { members: { some: { userId } } },
      ];
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: [
          { priority: 'desc' },
          { startDate: 'asc' },
        ],
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          tasks: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
              dueDate: true,
            },
            take: 5, // Limit to recent tasks
            orderBy: { createdAt: 'desc' },
          },
          materials: {
            select: {
              id: true,
              name: true,
              quantity: true,
              totalCost: true,
            },
            take: 5, // Limit to recent materials
          },
          documents: {
            select: {
              id: true,
              name: true,
              type: true,
              fileSize: true,
            },
            take: 5, // Limit to recent documents
          },
          members: {
            select: {
              id: true,
              role: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          milestones: {
            select: {
              id: true,
              name: true,
              dueDate: true,
              completed: true,
            },
            orderBy: { dueDate: 'asc' },
          },
          phases: {
            select: {
              id: true,
              name: true,
              status: true,
              startDate: true,
              endDate: true,
            },
            orderBy: { order: 'asc' },
          },
        },
      }),
      prisma.project.count({ where }),
    ]);

    return createPaginatedResponse(projects, total, pagination.page, pagination.limit);
  }

  // Get a single project by ID with full relations
  static async getProjectById(id: string, userId?: string): Promise<ProjectWithRelations | null> {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        materials: {
          select: {
            id: true,
            name: true,
            quantity: true,
            totalCost: true,
          },
        },
        documents: {
          select: {
            id: true,
            name: true,
            type: true,
            fileSize: true,
          },
        },
        members: {
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        milestones: {
          select: {
            id: true,
            name: true,
            dueDate: true,
            completed: true,
          },
          orderBy: { dueDate: 'asc' },
        },
        phases: {
          select: {
            id: true,
            name: true,
            status: true,
            startDate: true,
            endDate: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!project) {
      return null;
    }

    // Check if user has access to this project
    if (userId) {
      const hasAccess = project.managerId === userId || 
        project.members.some(member => member.user.id === userId);
      
      if (!hasAccess) {
        return null;
      }
    }

    return project;
  }

  // Update a project
  static async updateProject(
    id: string,
    data: UpdateProjectRequest,
    userId: string
  ): Promise<Project | null> {
    // First check if user has permission to update this project
    const existingProject = await prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          where: { userId },
        },
      },
    });

    if (!existingProject) {
      return null;
    }

    // Check if user is manager or has appropriate role
    const isManager = existingProject.managerId === userId;
    const isOwnerOrManager = existingProject.members.some(
      member => member.userId === userId && ['OWNER', 'MANAGER'].includes(member.role)
    );

    if (!isManager && !isOwnerOrManager) {
      throw new Error('Insufficient permissions');
    }

    const updateData: Prisma.ProjectUpdateInput = { ...data };

    // Convert date strings to Date objects
    if (data.startDate) {
      updateData.startDate = new Date(data.startDate);
    }
    if (data.endDate) {
      updateData.endDate = new Date(data.endDate);
    }
    if (data.budget !== undefined) {
      updateData.budget = data.budget ? new Prisma.Decimal(data.budget) : null;
    }

    return await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        manager: {
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

  // Delete a project (soft delete by setting status to CANCELLED)
  static async deleteProject(id: string, userId: string): Promise<boolean> {
    // Check if user has permission to delete this project
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          where: { userId },
        },
      },
    });

    if (!project) {
      return false;
    }

    // Only project manager or owner can delete
    const isManager = project.managerId === userId;
    const isOwner = project.members.some(
      member => member.userId === userId && member.role === 'OWNER'
    );

    if (!isManager && !isOwner) {
      throw new Error('Insufficient permissions');
    }

    // Perform cascade delete of related data
    await prisma.$transaction(async (tx) => {
      // Delete task attachments
      await tx.taskAttachment.deleteMany({
        where: {
          task: {
            projectId: id,
          },
        },
      });

      // Delete task comments
      await tx.taskComment.deleteMany({
        where: {
          task: {
            projectId: id,
          },
        },
      });

      // Delete tasks
      await tx.task.deleteMany({
        where: { projectId: id },
      });

      // Delete material orders
      await tx.materialOrder.deleteMany({
        where: {
          material: {
            projectId: id,
          },
        },
      });

      // Delete materials
      await tx.material.deleteMany({
        where: { projectId: id },
      });

      // Delete project documents
      await tx.projectDocument.deleteMany({
        where: { projectId: id },
      });

      // Delete project members
      await tx.projectMember.deleteMany({
        where: { projectId: id },
      });

      // Delete milestones
      await tx.milestone.deleteMany({
        where: { projectId: id },
      });

      // Delete project phases
      await tx.projectPhase.deleteMany({
        where: { projectId: id },
      });

      // Finally delete the project
      await tx.project.delete({
        where: { id },
      });
    });

    return true;
  }
}