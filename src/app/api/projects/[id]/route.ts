import { NextRequest, NextResponse } from 'next/server';

import { ProjectService } from '@/services/project.service';
import { 
  withErrorHandling, 
  requireAuth, 
  validateRequest,
  createErrorResponse,
  ErrorCodes 
} from '@/utils/api-helpers';
import { 
  updateProjectSchema,
  UpdateProjectRequest 
} from '@/utils/validation-schemas';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * GET /api/projects/:id
 * Get a specific project with all related data
 */
export const GET = withErrorHandling(async (request: NextRequest, context: RouteContext) => {
  const session = await requireAuth(request);
  const { id } = context.params;
  
  // Get project - access control is handled in the service
  const userId = session.user.role === 'ADMIN' ? undefined : session.user.id;
  const project = await ProjectService.getProjectById(id, userId);
  
  if (!project) {
    return createErrorResponse(
      ErrorCodes.PROJECT_NOT_FOUND,
      'Project not found or access denied',
      404
    );
  }
  
  return NextResponse.json(project);
});

/**
 * PATCH /api/projects/:id
 * Update a project with partial data
 */
export const PATCH = withErrorHandling(async (request: NextRequest, context: RouteContext) => {
  const session = await requireAuth(request);
  const { id } = context.params;
  
  const body = await request.json();
  const data: UpdateProjectRequest = validateRequest(updateProjectSchema, body);
  
  try {
    const project = await ProjectService.updateProject(id, data, session.user.id);
    
    if (!project) {
      return createErrorResponse(
        ErrorCodes.PROJECT_NOT_FOUND,
        'Project not found or access denied',
        404
      );
    }
    
    return NextResponse.json(project);
  } catch (error) {
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return createErrorResponse(
        ErrorCodes.INSUFFICIENT_PERMISSIONS,
        'You do not have permission to update this project',
        403
      );
    }
    throw error;
  }
});

/**
 * DELETE /api/projects/:id
 * Delete a project and all related data (cascade delete)
 */
export const DELETE = withErrorHandling(async (request: NextRequest, context: RouteContext) => {
  const session = await requireAuth(request);
  const { id } = context.params;
  
  try {
    const deleted = await ProjectService.deleteProject(id, session.user.id);
    
    if (!deleted) {
      return createErrorResponse(
        ErrorCodes.PROJECT_NOT_FOUND,
        'Project not found or access denied',
        404
      );
    }
    
    return NextResponse.json({ 
      message: 'Project deleted successfully',
      projectId: id 
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return createErrorResponse(
        ErrorCodes.INSUFFICIENT_PERMISSIONS,
        'You do not have permission to delete this project',
        403
      );
    }
    throw error;
  }
});