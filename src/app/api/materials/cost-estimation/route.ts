import { NextRequest, NextResponse } from 'next/server';

import { materialService } from '@/services/material.service';
import { 
  withErrorHandling, 
  requireAuth, 
  createErrorResponse,
  ErrorCodes 
} from '@/utils/api-helpers';

// GET /api/materials/cost-estimation?projectId=xxx - Get material cost estimation for a project
export const GET = withErrorHandling(async (request: NextRequest) => {
  const session = await requireAuth(request);
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  
  if (!projectId) {
    return createErrorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Project ID is required',
      400
    );
  }
  
  // Verify user has access to the project
  const hasAccess = await materialService.validateProjectAccess(projectId, session.user?.id || '');
  if (!hasAccess) {
    return createErrorResponse(
      ErrorCodes.INSUFFICIENT_PERMISSIONS,
      'You do not have permission to view cost estimation for this project',
      403
    );
  }
  
  try {
    // Get cost estimation with budget tracking
    const estimation = await materialService.calculateMaterialCostEstimation(projectId);
    
    return NextResponse.json({
      success: true,
      data: estimation,
      message: 'Cost estimation calculated successfully'
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Project not found') {
      return createErrorResponse(
        ErrorCodes.PROJECT_NOT_FOUND,
        'Project not found',
        404
      );
    }
    throw error;
  }
});