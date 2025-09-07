import { ProjectRole, UserRole } from '@prisma/client';
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
 * GET /api/projects/:id/team
 * Get all team members for a specific project with role management
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
  const role = searchParams.get('role') as ProjectRole | null;
  const userRole = searchParams.get('userRole') as UserRole | null;
  const search = searchParams.get('search');
  const isActive = searchParams.get('isActive');
  
  // Get pagination parameters
  const pagination = getPaginationParams(searchParams);
  
  // Build where clause for project members
  const where: any = {
    projectId,
  };
  
  if (role) {
    where.role = role;
  }
  
  if (search || userRole || isActive !== null) {
    where.user = {};
    
    if (userRole) {
      where.user.role = userRole;
    }
    
    if (isActive !== null) {
      where.user.isOnline = isActive === 'true';
    }
    
    if (search) {
      where.user.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { company: { contains: search } },
      ];
    }
  }
  
  // Get team members with pagination
  const [members, total] = await Promise.all([
    prisma.projectMember.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: [
        { role: 'asc' },
        { joinedAt: 'asc' },
      ],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            firstName: true,
            lastName: true,
            title: true,
            company: true,
            phone: true,
            role: true,
            isOnline: true,
            lastActive: true,
          },
        },
      },
    }),
    prisma.projectMember.count({ where }),
  ]);
  
  // Get additional team statistics and workload information
  const memberIds = members.map(member => member.userId);
  
  // Get task assignments for team members
  const taskAssignments = await prisma.task.groupBy({
    by: ['assignedTo'],
    where: {
      projectId,
      assignedTo: { in: memberIds },
    },
    _count: { assignedTo: true },
  });
  
  // Get task completion statistics
  const taskCompletions = await prisma.task.groupBy({
    by: ['assignedTo', 'status'],
    where: {
      projectId,
      assignedTo: { in: memberIds },
    },
    _count: { assignedTo: true },
  });
  
  // Calculate workload and performance metrics for each member
  const membersWithStats = members.map(member => {
    const assignments = taskAssignments.find(ta => ta.assignedTo === member.userId)?._count.assignedTo || 0;
    const completions = taskCompletions.filter(tc => tc.assignedTo === member.userId);
    
    const completedTasks = completions.find(tc => tc.status === 'COMPLETED')?._count.assignedTo || 0;
    const inProgressTasks = completions.find(tc => tc.status === 'IN_PROGRESS')?._count.assignedTo || 0;
    const todoTasks = completions.find(tc => tc.status === 'TODO')?._count.assignedTo || 0;
    const blockedTasks = completions.find(tc => tc.status === 'BLOCKED')?._count.assignedTo || 0;
    
    const completionRate = assignments > 0 ? (completedTasks / assignments) * 100 : 0;
    
    return {
      ...member,
      stats: {
        totalTasks: assignments,
        completedTasks,
        inProgressTasks,
        todoTasks,
        blockedTasks,
        completionRate: Math.round(completionRate * 100) / 100,
        workload: inProgressTasks + todoTasks, // Simple workload calculation
      },
    };
  });
  
  // Get project manager information
  const projectManager = await prisma.user.findUnique({
    where: { id: project.managerId },
    select: {
      id: true,
      name: true,
      email: true,
      firstName: true,
      lastName: true,
      title: true,
      company: true,
      phone: true,
      role: true,
      isOnline: true,
      lastActive: true,
    },
  });
  
  // Calculate team statistics
  const teamStats = {
    totalMembers: total + 1, // Include project manager
    activeMembers: members.filter(m => m.user.isOnline).length + (projectManager?.isOnline ? 1 : 0),
    roleBreakdown: await prisma.projectMember.groupBy({
      by: ['role'],
      where: { projectId },
      _count: { role: true },
    }),
    averageCompletionRate: membersWithStats.length > 0 
      ? membersWithStats.reduce((sum, member) => sum + member.stats.completionRate, 0) / membersWithStats.length
      : 0,
    totalTasksAssigned: taskAssignments.reduce((sum, ta) => sum + ta._count.assignedTo, 0),
  };
  
  const response = createPaginatedResponse(membersWithStats, total, pagination.page, pagination.limit);
  
  // Add team management information to response
  return NextResponse.json({
    ...response,
    projectManager,
    stats: teamStats,
  });
});