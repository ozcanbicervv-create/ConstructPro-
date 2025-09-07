import { DocumentType } from '@prisma/client';
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
 * GET /api/projects/:id/documents
 * Get all documents for a specific project with management and filtering options
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
  const type = searchParams.get('type') as DocumentType | null;
  const search = searchParams.get('search');
  const mimeType = searchParams.get('mimeType');
  const uploadedBy = searchParams.get('uploadedBy');
  const minSize = searchParams.get('minSize');
  const maxSize = searchParams.get('maxSize');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  
  // Get pagination parameters
  const pagination = getPaginationParams(searchParams);
  
  // Build where clause
  const where: any = {
    projectId,
  };
  
  if (type) {
    where.type = type;
  }
  
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }
  
  if (mimeType) {
    where.mimeType = { contains: mimeType };
  }
  
  if (uploadedBy) {
    where.uploadedBy = uploadedBy;
  }
  
  if (minSize || maxSize) {
    where.fileSize = {};
    if (minSize) {
      where.fileSize.gte = parseInt(minSize);
    }
    if (maxSize) {
      where.fileSize.lte = parseInt(maxSize);
    }
  }
  
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) {
      where.createdAt.gte = new Date(dateFrom);
    }
    if (dateTo) {
      where.createdAt.lte = new Date(dateTo);
    }
  }
  
  // Get documents with pagination
  const [documents, total] = await Promise.all([
    prisma.projectDocument.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: [
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        name: true,
        description: true,
        filePath: true,
        fileSize: true,
        mimeType: true,
        type: true,
        version: true,
        uploadedBy: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.projectDocument.count({ where }),
  ]);
  
  // Get uploader information for documents
  const uploaderIds = [...new Set(documents.map(doc => doc.uploadedBy))];
  const uploaders = await prisma.user.findMany({
    where: { id: { in: uploaderIds } },
    select: {
      id: true,
      name: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  });
  
  // Map uploader information to documents
  const documentsWithUploaders = documents.map(doc => ({
    ...doc,
    uploader: uploaders.find(user => user.id === doc.uploadedBy),
  }));
  
  // Calculate document management statistics
  const documentStats = {
    totalDocuments: total,
    totalSize: documents.reduce((sum, doc) => sum + doc.fileSize, 0),
    typeBreakdown: await prisma.projectDocument.groupBy({
      by: ['type'],
      where: { projectId },
      _count: { type: true },
      _sum: { fileSize: true },
    }),
    mimeTypeBreakdown: await prisma.projectDocument.groupBy({
      by: ['mimeType'],
      where: { projectId },
      _count: { mimeType: true },
    }),
    recentUploads: await prisma.projectDocument.count({
      where: {
        projectId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    }),
  };
  
  const response = createPaginatedResponse(documentsWithUploaders, total, pagination.page, pagination.limit);
  
  // Add document management statistics to response
  return NextResponse.json({
    ...response,
    stats: documentStats,
  });
});