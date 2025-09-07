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

// Material comparison request schema
const materialCompareSchema = z.object({
  materialName: z.string().min(1, 'Material name is required'),
  category: z.string().optional(),
  quantity: z.number().min(0, 'Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  specifications: z.record(z.any()).optional(),
  supplierIds: z.array(z.string()).optional(), // Optional list of specific suppliers to compare
});

type MaterialCompareRequest = z.infer<typeof materialCompareSchema>;

// POST /api/materials/compare - Compare materials from different suppliers
export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await requireAuth(request);
  const body = await request.json();
  
  // Validate request data
  const compareData: MaterialCompareRequest = validateRequest(materialCompareSchema, body);
  
  try {
    // Get material comparison analysis
    const comparison = await materialService.compareMaterials(compareData);
    
    return NextResponse.json({
      success: true,
      data: comparison,
      message: 'Material comparison completed successfully'
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'No suppliers found for comparison') {
        return createErrorResponse(
          ErrorCodes.PROJECT_NOT_FOUND,
          'No suppliers found for the specified material',
          404
        );
      }
    }
    throw error;
  }
});