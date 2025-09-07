import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/db';
import { 
  withErrorHandling, 
  requireAuth, 
  createErrorResponse,
  ErrorCodes,
  getPaginationParams,
  createPaginatedResponse
} from '@/utils/api-helpers';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * GET /api/projects/:id/materials
 * Get all materials for a specific project with tracking and filtering options
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
  const category = searchParams.get('category');
  const supplierId = searchParams.get('supplierId');
  const search = searchParams.get('search');
  const minCost = searchParams.get('minCost');
  const maxCost = searchParams.get('maxCost');
  const minQuantity = searchParams.get('minQuantity');
  const maxQuantity = searchParams.get('maxQuantity');
  
  // Get pagination parameters
  const pagination = getPaginationParams(searchParams);
  
  // Build where clause
  const where: any = {
    projectId,
  };
  
  if (category) {
    where.category = category;
  }
  
  if (supplierId) {
    where.supplierId = supplierId;
  }
  
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }
  
  if (minCost || maxCost) {
    where.totalCost = {};
    if (minCost) {
      where.totalCost.gte = parseFloat(minCost);
    }
    if (maxCost) {
      where.totalCost.lte = parseFloat(maxCost);
    }
  }
  
  if (minQuantity || maxQuantity) {
    where.quantity = {};
    if (minQuantity) {
      where.quantity.gte = parseFloat(minQuantity);
    }
    if (maxQuantity) {
      where.quantity.lte = parseFloat(maxQuantity);
    }
  }
  
  // Get materials with pagination and tracking information
  const [materials, total] = await Promise.all([
    prisma.material.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: [
        { totalCost: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            contactInfo: true,
            rating: true,
          },
        },
        orders: {
          select: {
            id: true,
            quantity: true,
            unitPrice: true,
            totalCost: true,
            status: true,
            orderDate: true,
          },
          orderBy: { orderDate: 'desc' },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    }),
    prisma.material.count({ where }),
  ]);
  
  // Calculate material tracking statistics
  const materialStats = {
    totalMaterials: total,
    totalValue: materials.reduce((sum, material) => sum + Number(material.totalCost), 0),
    categories: await prisma.material.groupBy({
      by: ['category'],
      where: { projectId },
      _count: { category: true },
      _sum: { totalCost: true },
    }),
    suppliers: await prisma.material.groupBy({
      by: ['supplierId'],
      where: { projectId, supplierId: { not: null } },
      _count: { supplierId: true },
      _sum: { totalCost: true },
    }),
  };
  
  const response = createPaginatedResponse(materials, total, pagination.page, pagination.limit);
  
  // Add tracking statistics to response
  return NextResponse.json({
    ...response,
    stats: materialStats,
  });
});