import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/materials/route';
import { GET as getById, PATCH, DELETE } from '@/app/api/materials/[id]/route';
import { materialService } from '@/services/material.service';

// Mock the material service
jest.mock('@/services/material.service');
const mockMaterialService = materialService as jest.Mocked<typeof materialService>;

// Mock authentication
jest.mock('@/utils/api-helpers', () => ({
  ...jest.requireActual('@/utils/api-helpers'),
  requireAuth: jest.fn().mockResolvedValue({
    user: { id: 'user_123', email: 'test@example.com' }
  }),
}));

describe('Material Management API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/materials', () => {
    it('should create a material successfully', async () => {
      const materialData = {
        projectId: 'proj_123',
        name: 'Portland Cement',
        description: 'High-grade cement',
        category: 'cement',
        unit: 'bags',
        quantity: 100,
        unitPrice: 25.50,
        supplierId: 'supplier_456',
        specifications: { grade: 'OPC 53' }
      };

      const createdMaterial = {
        id: 'mat_123',
        ...materialData,
        totalCost: 2550.00,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockMaterialService.validateProjectAccess.mockResolvedValue(true);
      mockMaterialService.createMaterial.mockResolvedValue(createdMaterial as any);

      const request = new NextRequest('http://localhost/api/materials', {
        method: 'POST',
        body: JSON.stringify(materialData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
      expect(result.data.id).toBe('mat_123');
      expect(result.data.totalCost).toBe(2550.00);
      expect(result.message).toBe('Material created successfully');
    });

    it('should return 403 when user lacks project access', async () => {
      const materialData = {
        projectId: 'proj_123',
        name: 'Portland Cement',
        unit: 'bags',
        quantity: 100,
        unitPrice: 25.50
      };

      mockMaterialService.validateProjectAccess.mockResolvedValue(false);

      const request = new NextRequest('http://localhost/api/materials', {
        method: 'POST',
        body: JSON.stringify(materialData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });

    it('should return 400 for invalid material data', async () => {
      const invalidData = {
        projectId: 'proj_123',
        name: '', // Invalid: empty name
        unit: 'bags',
        quantity: -10, // Invalid: negative quantity
        unitPrice: 25.50
      };

      const request = new NextRequest('http://localhost/api/materials', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/materials', () => {
    it('should get materials with pagination', async () => {
      const mockMaterials = [
        {
          id: 'mat_123',
          name: 'Portland Cement',
          category: 'cement',
          quantity: 100,
          unitPrice: 25.50,
          totalCost: 2550.00
        },
        {
          id: 'mat_124',
          name: 'Steel Rebar',
          category: 'steel',
          quantity: 50,
          unitPrice: 45.00,
          totalCost: 2250.00
        }
      ];

      const paginatedResponse = {
        data: mockMaterials,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      };

      mockMaterialService.getMaterials.mockResolvedValue(paginatedResponse as any);

      const request = new NextRequest('http://localhost/api/materials?page=1&limit=10');
      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });

    it('should apply filters correctly', async () => {
      const mockMaterials = [
        {
          id: 'mat_123',
          name: 'Portland Cement',
          category: 'cement',
          quantity: 100,
          unitPrice: 25.50,
          totalCost: 2550.00
        }
      ];

      const paginatedResponse = {
        data: mockMaterials,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      };

      mockMaterialService.getMaterials.mockResolvedValue(paginatedResponse as any);

      const request = new NextRequest('http://localhost/api/materials?category=cement&search=portland&minCost=1000');
      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(mockMaterialService.getMaterials).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'cement',
          search: 'portland',
          minCost: 1000
        }),
        expect.any(Object)
      );
    });
  });

  describe('GET /api/materials/:id', () => {
    it('should get material by ID successfully', async () => {
      const mockMaterial = {
        id: 'mat_123',
        name: 'Portland Cement',
        category: 'cement',
        quantity: 100,
        unitPrice: 25.50,
        totalCost: 2550.00,
        project: { id: 'proj_123', name: 'Test Project' },
        supplier: { id: 'supplier_456', name: 'Test Supplier' },
        orders: []
      };

      mockMaterialService.validateMaterialAccess.mockResolvedValue(true);
      mockMaterialService.getMaterialById.mockResolvedValue(mockMaterial as any);

      const request = new NextRequest('http://localhost/api/materials/mat_123');
      const response = await getById(request, { params: { id: 'mat_123' } });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.id).toBe('mat_123');
      expect(result.data.project).toBeDefined();
      expect(result.data.supplier).toBeDefined();
    });

    it('should return 403 when user lacks access', async () => {
      mockMaterialService.validateMaterialAccess.mockResolvedValue(false);

      const request = new NextRequest('http://localhost/api/materials/mat_123');
      const response = await getById(request, { params: { id: 'mat_123' } });
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });

    it('should return 404 when material not found', async () => {
      mockMaterialService.validateMaterialAccess.mockResolvedValue(true);
      mockMaterialService.getMaterialById.mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/materials/mat_999');
      const response = await getById(request, { params: { id: 'mat_999' } });
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result.error.code).toBe('PROJECT_NOT_FOUND');
    });
  });

  describe('PATCH /api/materials/:id', () => {
    it('should update material successfully', async () => {
      const updateData = {
        quantity: 150,
        unitPrice: 24.00
      };

      const updatedMaterial = {
        id: 'mat_123',
        name: 'Portland Cement',
        quantity: 150,
        unitPrice: 24.00,
        totalCost: 3600.00,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockMaterialService.validateMaterialAccess.mockResolvedValue(true);
      mockMaterialService.updateMaterial.mockResolvedValue(updatedMaterial as any);

      const request = new NextRequest('http://localhost/api/materials/mat_123', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await PATCH(request, { params: { id: 'mat_123' } });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.quantity).toBe(150);
      expect(result.data.totalCost).toBe(3600.00);
      expect(result.message).toBe('Material updated successfully');
    });

    it('should return 404 when material not found', async () => {
      const updateData = { quantity: 150 };

      mockMaterialService.validateMaterialAccess.mockResolvedValue(true);
      mockMaterialService.updateMaterial.mockRejectedValue(new Error('Material not found'));

      const request = new NextRequest('http://localhost/api/materials/mat_999', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await PATCH(request, { params: { id: 'mat_999' } });
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result.error.code).toBe('PROJECT_NOT_FOUND');
    });
  });

  describe('DELETE /api/materials/:id', () => {
    it('should delete material successfully', async () => {
      mockMaterialService.validateMaterialAccess.mockResolvedValue(true);
      mockMaterialService.deleteMaterial.mockResolvedValue();

      const request = new NextRequest('http://localhost/api/materials/mat_123', {
        method: 'DELETE'
      });

      const response = await DELETE(request, { params: { id: 'mat_123' } });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Material deleted successfully');
    });

    it('should return 400 when material has existing orders', async () => {
      mockMaterialService.validateMaterialAccess.mockResolvedValue(true);
      mockMaterialService.deleteMaterial.mockRejectedValue(
        new Error('Cannot delete material that has existing orders')
      );

      const request = new NextRequest('http://localhost/api/materials/mat_123', {
        method: 'DELETE'
      });

      const response = await DELETE(request, { params: { id: 'mat_123' } });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.message).toContain('existing orders');
    });

    it('should return 404 when material not found', async () => {
      mockMaterialService.validateMaterialAccess.mockResolvedValue(true);
      mockMaterialService.deleteMaterial.mockRejectedValue(new Error('Material not found'));

      const request = new NextRequest('http://localhost/api/materials/mat_999', {
        method: 'DELETE'
      });

      const response = await DELETE(request, { params: { id: 'mat_999' } });
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result.error.code).toBe('PROJECT_NOT_FOUND');
    });
  });
});