import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/db';
import { 
  withErrorHandling, 
  requireAuth, 
  createErrorResponse,
  ErrorCodes
} from '@/utils/api-helpers';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * GET /api/projects/:id/stats
 * Get comprehensive analytics and statistics for a specific project
 */
export const GET = withErrorHandling(async (request: NextRequest, context: RouteContext) => {
  const session = await requireAuth(request);
  const { id: projectId } = context.params;
  
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
  
  // Calculate project timeline statistics
  const now = new Date();
  const startDate = new Date(project.startDate);
  const endDate = new Date(project.endDate);
  const totalDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.max(0, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const remainingDays = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const timeProgress = totalDuration > 0 ? Math.min(100, (elapsedDays / totalDuration) * 100) : 0;
  
  // Get task statistics
  const taskStats = await prisma.task.groupBy({
    by: ['status'],
    where: { projectId },
    _count: { status: true },
  });
  
  const totalTasks = taskStats.reduce((sum, stat) => sum + stat._count.status, 0);
  const completedTasks = taskStats.find(stat => stat.status === 'COMPLETED')?._count.status || 0;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  // Get task priority breakdown
  const taskPriorityStats = await prisma.task.groupBy({
    by: ['priority'],
    where: { projectId },
    _count: { priority: true },
  });
  
  // Get overdue tasks
  const overdueTasks = await prisma.task.count({
    where: {
      projectId,
      dueDate: { lt: now },
      status: { not: 'COMPLETED' },
    },
  });
  
  // Get upcoming tasks (due in next 7 days)
  const upcomingTasks = await prisma.task.count({
    where: {
      projectId,
      dueDate: {
        gte: now,
        lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
      status: { not: 'COMPLETED' },
    },
  });
  
  // Get material statistics
  const materialStats = await prisma.material.aggregate({
    where: { projectId },
    _count: { id: true },
    _sum: { totalCost: true },
  });
  
  // Get material category breakdown
  const materialCategoryStats = await prisma.material.groupBy({
    by: ['category'],
    where: { projectId },
    _count: { category: true },
    _sum: { totalCost: true },
  });
  
  // Get document statistics
  const documentStats = await prisma.projectDocument.aggregate({
    where: { projectId },
    _count: { id: true },
    _sum: { fileSize: true },
  });
  
  // Get document type breakdown
  const documentTypeStats = await prisma.projectDocument.groupBy({
    by: ['type'],
    where: { projectId },
    _count: { type: true },
  });
  
  // Get team statistics
  const teamStats = await prisma.projectMember.aggregate({
    where: { projectId },
    _count: { id: true },
  });
  
  // Get team role breakdown
  const teamRoleStats = await prisma.projectMember.groupBy({
    by: ['role'],
    where: { projectId },
    _count: { role: true },
  });
  
  // Get milestone statistics
  const milestoneStats = await prisma.milestone.aggregate({
    where: { projectId },
    _count: { id: true },
  });
  
  const completedMilestones = await prisma.milestone.count({
    where: { projectId, completed: true },
  });
  
  const overdueMilestones = await prisma.milestone.count({
    where: {
      projectId,
      dueDate: { lt: now },
      completed: false,
    },
  });
  
  // Get phase statistics
  const phaseStats = await prisma.projectPhase.groupBy({
    by: ['status'],
    where: { projectId },
    _count: { status: true },
  });
  
  // Calculate budget statistics
  const budgetSpent = Number(materialStats._sum.totalCost || 0);
  const budgetTotal = Number(project.budget || 0);
  const budgetRemaining = budgetTotal - budgetSpent;
  const budgetProgress = budgetTotal > 0 ? (budgetSpent / budgetTotal) * 100 : 0;
  
  // Get recent activity (last 30 days)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const recentActivity = {
    tasksCreated: await prisma.task.count({
      where: { projectId, createdAt: { gte: thirtyDaysAgo } },
    }),
    tasksCompleted: await prisma.task.count({
      where: { 
        projectId, 
        status: 'COMPLETED',
        updatedAt: { gte: thirtyDaysAgo },
      },
    }),
    documentsUploaded: await prisma.projectDocument.count({
      where: { projectId, createdAt: { gte: thirtyDaysAgo } },
    }),
    materialsAdded: await prisma.material.count({
      where: { projectId, createdAt: { gte: thirtyDaysAgo } },
    }),
  };
  
  // Compile comprehensive project analytics
  const projectAnalytics = {
    // Project overview
    project: {
      id: project.id,
      name: project.name,
      status: project.status,
      priority: project.priority,
      startDate: project.startDate,
      endDate: project.endDate,
      budget: budgetTotal,
    },
    
    // Timeline analytics
    timeline: {
      totalDuration,
      elapsedDays,
      remainingDays,
      timeProgress: Math.round(timeProgress * 100) / 100,
      isOverdue: now > endDate,
      daysOverdue: now > endDate ? Math.ceil((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24)) : 0,
    },
    
    // Task analytics
    tasks: {
      total: totalTasks,
      completed: completedTasks,
      progress: Math.round(taskProgress * 100) / 100,
      overdue: overdueTasks,
      upcoming: upcomingTasks,
      statusBreakdown: taskStats,
      priorityBreakdown: taskPriorityStats,
    },
    
    // Material analytics
    materials: {
      total: materialStats._count.id || 0,
      totalValue: budgetSpent,
      categoryBreakdown: materialCategoryStats,
    },
    
    // Budget analytics
    budget: {
      total: budgetTotal,
      spent: budgetSpent,
      remaining: budgetRemaining,
      progress: Math.round(budgetProgress * 100) / 100,
      isOverBudget: budgetSpent > budgetTotal,
      overBudgetAmount: Math.max(0, budgetSpent - budgetTotal),
    },
    
    // Document analytics
    documents: {
      total: documentStats._count.id || 0,
      totalSize: documentStats._sum.fileSize || 0,
      typeBreakdown: documentTypeStats,
    },
    
    // Team analytics
    team: {
      total: (teamStats._count.id || 0) + 1, // Include project manager
      roleBreakdown: teamRoleStats,
    },
    
    // Milestone analytics
    milestones: {
      total: milestoneStats._count.id || 0,
      completed: completedMilestones,
      overdue: overdueMilestones,
      progress: milestoneStats._count.id > 0 ? (completedMilestones / milestoneStats._count.id) * 100 : 0,
    },
    
    // Phase analytics
    phases: {
      statusBreakdown: phaseStats,
    },
    
    // Recent activity
    recentActivity,
    
    // Overall project health score (0-100)
    healthScore: Math.round(
      (taskProgress * 0.4 + 
       (milestoneStats._count.id > 0 ? (completedMilestones / milestoneStats._count.id) * 100 : 100) * 0.3 +
       (budgetTotal > 0 ? Math.max(0, 100 - budgetProgress) : 100) * 0.2 +
       (overdueTasks === 0 ? 100 : Math.max(0, 100 - (overdueTasks / totalTasks) * 100)) * 0.1)
    ),
  };
  
  return NextResponse.json(projectAnalytics);
});