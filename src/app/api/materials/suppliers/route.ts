import { NextRequest, NextResponse } from 'next/server';
import { materialService } from '@/services/material.service';
import { 
  withErrorHandling, 
  requireAuth, 
  getPaginationParams,
  validateRequest 
} from '@/utils/api-helpers';
import { z } from 'zod';

// Supplier filters schema
const supplierFiltersSchema = z.object({
  search: z.string().optional(),
  minRating: z.string().transform(val => parseFloat(val)).optional(),
  category: z.string().optional(),
  location: z.string().optional(),
});

type SupplierFilters = z.infer<typeof supplierFiltersSchema>;

// GET /api/materials/suppliers - Get suppliers with rating system
export const GET = withErrorHandling(async (request: NextRequest) => {
  const session = await requireAuth(request);
  const { searchParams } = new URL(request.url);
  
  // Parse filters
  const filters: SupplierFilters = validateRequest(supplierFiltersSchema, {
    search: searchParams.get('search'),
    minRating: searchParams.get('minRating'),
    category: searchParams.get('category'),
    location: searchParams.get('location'),
  });
  
  // Get pagination parameters
  const pagination = getPaginationParams(searchParams);
  
  // Get suppliers with performance metrics
  const result = await materialService.getSuppliersWithRatings(filters, pagination);
  
  return NextResponse.json({
    success: true,
    ...result
  });
});