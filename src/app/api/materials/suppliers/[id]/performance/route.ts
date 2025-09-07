import { NextRequest, NextResponse } from 'next/server';

import { materialService } from '@/services/material.service';
import { 
  withErrorHandling, 
  requireAuth, 
  createErrorResponse,
  ErrorCodes 
} from '@/utils/api-helpers';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/materials/suppliers/:id/performance - Get supplier performance metrics
export const GET = withErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const session = await requireAuth(request);
  const { id } = params;
  
  try {
    // Get supplier performance metrics
    const performance = await materialService.getSupplierPerformanceMetrics(id);
    
    return NextResponse.json({
      success: true,
      data: performance,
      message: 'Supplier performance metrics retrieved successfully'
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Supplier not found') {
      return createErrorResponse(
        ErrorCodes.PROJECT_NOT_FOUND,
        'Supplier not found',
        404
      );
    }
    throw error;
  }
});