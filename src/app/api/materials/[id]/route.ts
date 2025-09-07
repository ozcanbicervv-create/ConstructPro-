import { NextRequest, NextResponse } from 'next/server';
import { materialService } from '@/services/material.service';
import { 
  updateMaterialSchema,
  UpdateMaterialRequest 
} from '@/utils/validation-schemas';
import { 
  withErrorHandling, 
  requireAuth, 
  validateRequest,
  createErrorResponse,
  ErrorCodes 
} from '@/utils/api-helpers';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/materials/:id - Get material by ID
export const GET = withErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const session = await requireAuth(request);
  const { id } = params;
  
  // Verify user has access to this material
  const hasAccess = await materialService.validateMaterialAccess(id, session.user.id);
  if (!hasAccess) {
    return createErrorResponse(
      ErrorCodes.INSUFFICIENT_PERMISSIONS,
      'You do not have permission to view this material',
      403
    );
  }
  
  // Get the material
  const material = await materialService.getMaterialById(id);
  
  if (!material) {
    return createErrorResponse(
      ErrorCodes.PROJECT_NOT_FOUND,
      'Material not found',
      404
    );
  }
  
  return NextResponse.json({
    success: true,
    data: material
  });
});

// PATCH /api/materials/:id - Update material
export const PATCH = withErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const session = await requireAuth(request);
  const { id } = params;
  const body = await request.json();
  
  // Verify user has access to this material
  const hasAccess = await materialService.validateMaterialAccess(id, session.user.id);
  if (!hasAccess) {
    return createErrorResponse(
      ErrorCodes.INSUFFICIENT_PERMISSIONS,
      'You do not have permission to update this material',
      403
    );
  }
  
  // Validate request data
  const updateData: UpdateMaterialRequest = validateRequest(updateMaterialSchema, body);
  
  try {
    // Update the material
    const material = await materialService.updateMaterial(id, updateData);
    
    return NextResponse.json({
      success: true,
      data: material,
      message: 'Material updated successfully'
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Material not found') {
      return createErrorResponse(
        ErrorCodes.PROJECT_NOT_FOUND,
        'Material not found',
        404
      );
    }
    throw error;
  }
});

// DELETE /api/materials/:id - Delete material
export const DELETE = withErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const session = await requireAuth(request);
  const { id } = params;
  
  // Verify user has access to this material
  const hasAccess = await materialService.validateMaterialAccess(id, session.user.id);
  if (!hasAccess) {
    return createErrorResponse(
      ErrorCodes.INSUFFICIENT_PERMISSIONS,
      'You do not have permission to delete this material',
      403
    );
  }
  
  try {
    // Delete the material
    await materialService.deleteMaterial(id);
    
    return NextResponse.json({
      success: true,
      message: 'Material deleted successfully'
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Material not found') {
        return createErrorResponse(
          ErrorCodes.PROJECT_NOT_FOUND,
          'Material not found',
          404
        );
      }
      if (error.message === 'Cannot delete material that has existing orders') {
        return createErrorResponse(
          ErrorCodes.VALIDATION_ERROR,
          'Cannot delete material that has existing orders',
          400
        );
      }
    }
    throw error;
  }
});