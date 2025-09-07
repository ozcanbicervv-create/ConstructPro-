import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST as comparePost } from '@/app/api/materials/compare/route';
import { GET as suppliersGet } from '@/app/api/materials/suppliers/route';
import { POST as ordersPost, GET as ordersGet } from '@/app/api/materials/orders/route';
import { GET as costEstimationGet } from '@/app/api/materials/cost-estimation/route';

// Mock the auth function
jest.mock('@/utils/api-helpers', () => ({
  ...jest.requireActual('@/utils/api-helpers'),
  requireAuth: jest.fn().mockResolvedValue({
    user: { id: 'test-user-id', email: 'test@example.com' }
  }),
  withErrorHandling: (handler: any) => handler,
  validateRequest: jest.fn().mockImplementation((schema, data) => data),
  getPaginationParams: jest.fn().mockReturnValue({ page: 1, limit: 10, skip: 0 }),
  createErrorResponse: jest.fn().mockImplementation((code, message, status) => 
    new Response(JSON.stringify({ error: code, message }), { status })
  ),
  ErrorCodes: {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
    PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  },
}));

// Mock the material service
jest.mock('@/services/material.service', () => ({
  materialService: {
    compareMaterials: jest.fn().mockResolvedValue({
      searchCriteria: {
        materialName: 'Test Material',
        category: 'cement',
        quantity: 10,
        unit: 'bags',
      },
      totalSuppliersFound: 2,
      bestValue: {
        supplier: { id: 'supplier-1', name: 'Best Supplier' },
        pricing: { estimatedTotalCost: 1000 },
        performance: { qualityRating: 4.5 },
      },
      allSuppliers: [],
      marketAnalysis: {
        averageMarketPrice: 100,
        priceVariance: 10,
        recommendedBudget: 1100,
      },
    }),
    getSuppliersWithRatings: jest.fn().mockResolvedValue({
      data: [
        {
          id: 'supplier-1',
          name: 'Test Supplier',
          rating: 4.5,
          performance: {
            deliveryRate: 95,
            totalOrders: 50,
          },
          capabilities: {
            materialCount: 25,
            categories: ['cement', 'steel'],
          },
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    }),
    createMaterialOrder: jest.fn().mockResolvedValue({
      id: 'order-1',
      materialId: 'material-1',
      supplierId: 'supplier-1',
      quantity: 10,
      unitPrice: 100,
      totalCost: 1000,
      status: 'PENDING',
    }),
    getMaterialOrders: jest.fn().mockResolvedValue({
      data: [
        {
          id: 'order-1',
          materialId: 'material-1',
          supplierId: 'supplier-1',
          quantity: 10,
          unitPrice: 100,
          totalCost: 1000,
          status: 'PENDING',
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    }),
    calculateMaterialCostEstimation: jest.fn().mockResolvedValue({
      projectId: 'project-1',
      budget: {
        allocated: 10000,
        estimated: 8500,
        ordered: 7000,
        remaining: 3000,
        variance: -15,
        utilizationRate: 70,
      },
      materials: {
        total: 5,
        estimated: 8500,
        ordered: 7000,
        pending: 1500,
      },
      categoryBreakdown: {
        cement: { estimatedCost: 3000, orderedCost: 2500, materialCount: 2 },
        steel: { estimatedCost: 5500, orderedCost: 4500, materialCount: 3 },
      },
      recommendations: {
        overBudget: false,
        needsReview: false,
        onTrack: true,
        underBudget: true,
      },
    }),
    validateMaterialAccess: jest.fn().mockResolvedValue(true),
    validateProjectAccess: jest.fn().mockResolvedValue(true),
  },
}));

describe('Material Comparison and Supplier Management API', () => {
  describe('POST /api/materials/compare', () => {
    it('should compare materials successfully', async () => {
      const request = new NextRequest('http://localhost/api/materials/compare', {
        method: 'POST',
        body: JSON.stringify({
          materialName: 'Test Material',
          category: 'cement',
          quantity: 10,
          unit: 'bags',
        }),
      });

      const response = await comparePost(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.searchCriteria.materialName).toBe('Test Material');
      expect(data.data.totalSuppliersFound).toBe(2);
      expect(data.data.bestValue).toBeDefined();
      expect(data.data.marketAnalysis).toBeDefined();
    });
  });

  describe('GET /api/materials/suppliers', () => {
    it('should get suppliers with ratings successfully', async () => {
      const request = new NextRequest('http://localhost/api/materials/suppliers?minRating=4.0');

      const response = await suppliersGet(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].name).toBe('Test Supplier');
      expect(data.data[0].rating).toBe(4.5);
      expect(data.data[0].performance).toBeDefined();
      expect(data.data[0].capabilities).toBeDefined();
    });
  });

  describe('POST /api/materials/orders', () => {
    it('should create material order successfully', async () => {
      const request = new NextRequest('http://localhost/api/materials/orders', {
        method: 'POST',
        body: JSON.stringify({
          materialId: 'material-1',
          supplierId: 'supplier-1',
          quantity: 10,
          unitPrice: 100,
        }),
      });

      const response = await ordersPost(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('order-1');
      expect(data.data.totalCost).toBe(1000);
      expect(data.data.status).toBe('PENDING');
    });
  });

  describe('GET /api/materials/orders', () => {
    it('should get material orders successfully', async () => {
      const request = new NextRequest('http://localhost/api/materials/orders?status=PENDING');

      const response = await ordersGet(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].status).toBe('PENDING');
    });
  });

  describe('GET /api/materials/cost-estimation', () => {
    it('should get cost estimation successfully', async () => {
      const request = new NextRequest('http://localhost/api/materials/cost-estimation?projectId=project-1');

      const response = await costEstimationGet(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.projectId).toBe('project-1');
      expect(data.data.budget).toBeDefined();
      expect(data.data.materials).toBeDefined();
      expect(data.data.categoryBreakdown).toBeDefined();
      expect(data.data.recommendations).toBeDefined();
    });

    it('should return error when projectId is missing', async () => {
      const request = new NextRequest('http://localhost/api/materials/cost-estimation');

      const response = await costEstimationGet(request);

      expect(response.status).toBe(400);
    });
  });
});