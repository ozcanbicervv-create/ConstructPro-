import { describe, it, expect, beforeEach } from '@jest/globals';

// Mock Prisma Client
const mockPrisma = {
  material: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  materialOrder: {
    count: jest.fn(),
  },
  project: {
    findUnique: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
}));

import { MaterialService } from '@/services/material.service';

describe('MaterialService', () => {
  let materialService: MaterialService;

  beforeEach(() => {
    jest.clearAllMocks();
    materialService = new MaterialService();
  });

  describe('createMaterial', () => {
    it('should create a material with calculated total cost', async () => {
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
        updatedAt: new Date(),
        project: {},
        supplier: {},
        orders: []
      };

      mockPrisma.material.create.mockResolvedValue(createdMaterial);

      const result = await materialService.createMaterial(materialData);

      expect(mockPrisma.material.create).toHaveBeenCalledWith({
        data: {
          ...materialData,
          totalCost: 2550.00,
        },
        include: {
          project: true,
          supplier: true,
          orders: true,
        },
      });

      expect(result.id).toBe('mat_123');
      expect(result.totalCost).toBe(2550.00);
    });
  });

  describe('getMaterials', () => {
    it('should get materials with filters and pagination', async () => {
      const filters = {
        category: 'cement',
        search: 'portland',
        minCost: 1000,
        maxCost: 5000,
      };

      const pagination = {
        page: 1,
        limit: 10,
        skip: 0,
      };

      const mockMaterials = [
        {
          id: 'mat_123',
          name: 'Portland Cement',
          category: 'cement',
          totalCost: 2550.00,
        }
      ];

      mockPrisma.material.count.mockResolvedValue(1);
      mockPrisma.material.findMany.mockResolvedValue(mockMaterials);

      const result = await materialService.getMaterials(filters, pagination);

      expect(mockPrisma.material.count).toHaveBeenCalledWith({
        where: expect.objectContaining({
          category: {
            contains: 'cement',
            mode: 'insensitive',
          },
          OR: [
            {
              name: {
                contains: 'portland',
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: 'portland',
                mode: 'insensitive',
              },
            },
          ],
          totalCost: {
            gte: 1000,
            lte: 5000,
          },
        }),
      });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('updateMaterial', () => {
    it('should update material and recalculate total cost', async () => {
      const materialId = 'mat_123';
      const updateData = {
        quantity: 150,
        unitPrice: 24.00,
      };

      const currentMaterial = {
        id: materialId,
        quantity: { toNumber: () => 100 },
        unitPrice: { toNumber: () => 25.50 },
        totalCost: { toNumber: () => 2550.00 },
      };

      const updatedMaterial = {
        id: materialId,
        quantity: 150,
        unitPrice: 24.00,
        totalCost: 3600.00,
        project: {},
        supplier: {},
        orders: []
      };

      mockPrisma.material.findUnique.mockResolvedValue(currentMaterial);
      mockPrisma.material.update.mockResolvedValue(updatedMaterial);

      const result = await materialService.updateMaterial(materialId, updateData);

      expect(mockPrisma.material.update).toHaveBeenCalledWith({
        where: { id: materialId },
        data: {
          ...updateData,
          totalCost: 3600.00,
        },
        include: {
          project: true,
          supplier: true,
          orders: true,
        },
      });

      expect(result.totalCost).toBe(3600.00);
    });

    it('should throw error when material not found', async () => {
      mockPrisma.material.findUnique.mockResolvedValue(null);

      await expect(
        materialService.updateMaterial('mat_999', { quantity: 150 })
      ).rejects.toThrow('Material not found');
    });
  });

  describe('deleteMaterial', () => {
    it('should delete material when no orders exist', async () => {
      const materialId = 'mat_123';

      mockPrisma.materialOrder.count.mockResolvedValue(0);
      mockPrisma.material.delete.mockResolvedValue({});

      await materialService.deleteMaterial(materialId);

      expect(mockPrisma.materialOrder.count).toHaveBeenCalledWith({
        where: { materialId },
      });
      expect(mockPrisma.material.delete).toHaveBeenCalledWith({
        where: { id: materialId },
      });
    });

    it('should throw error when material has existing orders', async () => {
      const materialId = 'mat_123';

      mockPrisma.materialOrder.count.mockResolvedValue(2);

      await expect(
        materialService.deleteMaterial(materialId)
      ).rejects.toThrow('Cannot delete material that has existing orders');

      expect(mockPrisma.material.delete).not.toHaveBeenCalled();
    });
  });

  describe('validateProjectAccess', () => {
    it('should return true when user is project manager', async () => {
      const projectId = 'proj_123';
      const userId = 'user_123';

      const mockProject = {
        id: projectId,
        managerId: userId,
        members: [],
      };

      mockPrisma.project.findUnique.mockResolvedValue(mockProject);

      const result = await materialService.validateProjectAccess(projectId, userId);

      expect(result).toBe(true);
    });

    it('should return true when user is project member', async () => {
      const projectId = 'proj_123';
      const userId = 'user_123';

      const mockProject = {
        id: projectId,
        managerId: 'other_user',
        members: [{ userId }],
      };

      mockPrisma.project.findUnique.mockResolvedValue(mockProject);

      const result = await materialService.validateProjectAccess(projectId, userId);

      expect(result).toBe(true);
    });

    it('should return false when user has no access', async () => {
      const projectId = 'proj_123';
      const userId = 'user_123';

      const mockProject = {
        id: projectId,
        managerId: 'other_user',
        members: [],
      };

      mockPrisma.project.findUnique.mockResolvedValue(mockProject);

      const result = await materialService.validateProjectAccess(projectId, userId);

      expect(result).toBe(false);
    });

    it('should return false when project not found', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      const result = await materialService.validateProjectAccess('proj_999', 'user_123');

      expect(result).toBe(false);
    });
  });
});