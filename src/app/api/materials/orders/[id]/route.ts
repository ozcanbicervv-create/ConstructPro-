import { OrderStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { materialService } from '@/services/material.service';
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

// Update order schema
const updateOrderSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  quantity: z.number().min(0).optional(),
  unitPrice: z.number().min(0).optional(),
  expectedDeliveryDate: z.string().datetime().optional(),
  actualDeliveryDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

type UpdateOrderRequest = z.infer<typeof updateOrderSchema>;

// GET /api/materials/orders/:id - Get order by ID
export const GET = withErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const session = await requireAuth(request);
  const { id } = params;
  
  try {
    // Get the order with access validation
    const order = await materialService.getMaterialOrderById(id, session.user?.id || '');
    
    if (!order) {
      return createErrorResponse(
        ErrorCodes.PROJECT_NOT_FOUND,
        'Order not found or access denied',
        404
      );
    }
    
    return NextResponse.json({
      success: true,
      data: order
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Access denied') {
      return createErrorResponse(
        ErrorCodes.INSUFFICIENT_PERMISSIONS,
        'You do not have permission to view this order',
        403
      );
    }
    throw error;
  }
});

// PATCH /api/materials/orders/:id - Update order
export const PATCH = withErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const session = await requireAuth(request);
  const { id } = params;
  const body = await request.json();
  
  // Validate request data
  const updateData: UpdateOrderRequest = validateRequest(updateOrderSchema, body);
  
  try {
    // Update the order with access validation
    const order = await materialService.updateMaterialOrder(id, updateData, session.user?.id || '');
    
    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order updated successfully'
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Order not found') {
        return createErrorResponse(
          ErrorCodes.PROJECT_NOT_FOUND,
          'Order not found',
          404
        );
      }
      if (error.message === 'Access denied') {
        return createErrorResponse(
          ErrorCodes.INSUFFICIENT_PERMISSIONS,
          'You do not have permission to update this order',
          403
        );
      }
    }
    throw error;
  }
});

// DELETE /api/materials/orders/:id - Cancel/delete order
export const DELETE = withErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const session = await requireAuth(request);
  const { id } = params;
  
  try {
    // Cancel/delete the order with access validation
    await materialService.cancelMaterialOrder(id, session.user?.id || '');
    
    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Order not found') {
        return createErrorResponse(
          ErrorCodes.PROJECT_NOT_FOUND,
          'Order not found',
          404
        );
      }
      if (error.message === 'Access denied') {
        return createErrorResponse(
          ErrorCodes.INSUFFICIENT_PERMISSIONS,
          'You do not have permission to cancel this order',
          403
        );
      }
      if (error.message === 'Cannot cancel delivered order') {
        return createErrorResponse(
          ErrorCodes.VALIDATION_ERROR,
          'Cannot cancel an order that has already been delivered',
          400
        );
      }
    }
    throw error;
  }
});