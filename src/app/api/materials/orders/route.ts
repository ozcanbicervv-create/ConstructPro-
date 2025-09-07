import { NextRequest, NextResponse } from 'next/server';
import { materialService } from '@/services/material.service';
import { 
  withErrorHandling, 
  requireAuth, 
  validateRequest,
  getPaginationParams,
  createErrorResponse,
  ErrorCodes 
} from '@/utils/api-helpers';
import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

// Material order creation schema
const createMaterialOrderSchema = z.object({
  materialId: z.string().min(1, 'Material ID is required'),
  supplierId: z.string().min(1, 'Supplier ID is required'),
  quantity: z.number().min(0, 'Quantity must be positive'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  expectedDeliveryDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

// Material order filters schema
const orderFiltersSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  supplierId: z.string().optional(),
  materialId: z.string().optional(),
  projectId: z.string().optional(),
  search: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

type CreateMaterialOrderRequest = z.infer<typeof createMaterialOrderSchema>;
type OrderFilters = z.infer<typeof orderFiltersSchema>;

// POST /api/materials/orders - Create material order
export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await requireAuth(request);
  const body = await request.json();
  
  // Validate request data
  const orderData: CreateMaterialOrderRequest = validateRequest(createMaterialOrderSchema, body);
  
  // Verify user has access to the material's project
  const hasAccess = await materialService.validateMaterialAccess(orderData.materialId, session.user?.id || '');
  if (!hasAccess) {
    return createErrorResponse(
      ErrorCodes.INSUFFICIENT_PERMISSIONS,
      'You do not have permission to create orders for this material',
      403
    );
  }
  
  try {
    // Create the material order
    const order = await materialService.createMaterialOrder(orderData);
    
    return NextResponse.json({
      success: true,
      data: order,
      message: 'Material order created successfully'
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Material not found') {
        return createErrorResponse(
          ErrorCodes.PROJECT_NOT_FOUND,
          'Material not found',
          404
        );
      }
      if (error.message === 'Supplier not found') {
        return createErrorResponse(
          ErrorCodes.PROJECT_NOT_FOUND,
          'Supplier not found',
          404
        );
      }
    }
    throw error;
  }
});

// GET /api/materials/orders - Get material orders with filtering
export const GET = withErrorHandling(async (request: NextRequest) => {
  const session = await requireAuth(request);
  const { searchParams } = new URL(request.url);
  
  // Parse filters
  const filters: OrderFilters = validateRequest(orderFiltersSchema, {
    status: searchParams.get('status'),
    supplierId: searchParams.get('supplierId'),
    materialId: searchParams.get('materialId'),
    projectId: searchParams.get('projectId'),
    search: searchParams.get('search'),
    dateFrom: searchParams.get('dateFrom'),
    dateTo: searchParams.get('dateTo'),
  });
  
  // Get pagination parameters
  const pagination = getPaginationParams(searchParams);
  
  // Get material orders
  const result = await materialService.getMaterialOrders(filters, pagination, session.user?.id || '');
  
  return NextResponse.json({
    success: true,
    ...result
  });
});