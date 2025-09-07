import { NextRequest, NextResponse } from 'next/server';
import { materialService } from '@/services/material.service';
import { 
  createMaterialSchema, 
  materialFiltersSchema,
  CreateMaterialRequest,
  MaterialFilters 
} from '@/utils/validation-schemas';
import { 
  withErrorHandling, 
  requireAuth, 
  validateRequest, 
  getPaginationParams,
  createPaginatedResponse,
  createErrorResponse,
  ErrorCodes 
} from '@/utils/api-helpers';

// POST /api/materials - Create a new material
export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await requireAuth(request);
  const body = await request.json();
  
  // Validate request data
  const materialData: CreateMaterialRequest = validateRequest(createMaterialSchema, body);
  
  // Verify user has access to the project
  const hasAccess = await materialService.validateProjectAccess(materialData.projectId, session.user.id);
  if (!hasAccess) {
    return createErrorResponse(
      ErrorCodes.INSUFFICIENT_PERMISSIONS,
      'You do not have permission to add materials to this project',
      403
    );
  }
  
  // Create the material
  const material = await materialService.createMaterial(materialData);
  
  return NextResponse.json({
    success: true,
    data: material,
    message: 'Material created successfully'
  }, { status: 201 });
});

// GET /api/materials - Get materials with filtering and pagination
export const GET = withErrorHandling(async (request: NextRequest) => {
  const session = await requireAuth(request);
  const { searchParams } = new URL(request.url);
  
  // Parse filters
  const filters: MaterialFilters = validateRequest(materialFiltersSchema, {
    category: searchParams.get('category'),
    supplierId: searchParams.get('supplierId'),
    search: searchParams.get('search'),
    minCost: searchParams.get('minCost'),
    maxCost: searchParams.get('maxCost'),
    minQuantity: searchParams.get('minQuantity'),
    maxQuantity: searchParams.get('maxQuantity'),
  });
  
  // Get pagination parameters
  const pagination = getPaginationParams(searchParams);
  
  // Get materials
  const result = await materialService.getMaterials(filters, pagination);
  
  return NextResponse.json({
    success: true,
    ...result
  });
});