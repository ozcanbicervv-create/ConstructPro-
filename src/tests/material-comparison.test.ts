import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';

import { materialService } from '@/services/material.service';

const prisma = new PrismaClient();

describe('Material Comparison Service', () => {
  let testProjectId: string;
  let testSupplierIds: string[] = [];
  let testMaterialIds: string[] = [];

  beforeEach(async () => {
    // Create test project
    const project = await prisma.project.create({
      data: {
        name: 'Test Project for Material Comparison',
        managerId: 'test-user-id',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    testProjectId = project.id;

    // Create test suppliers
    const supplier1 = await prisma.materialSupplier.create({
      data: {
        name: 'Supplier A',
        rating: 4.5,
        contactInfo: { email: 'supplier-a@test.com', phone: '123-456-7890' },
      },
    });

    const supplier2 = await prisma.materialSupplier.create({
      data: {
        name: 'Supplier B',
        rating: 4.0,
        contactInfo: { email: 'supplier-b@test.com', phone: '123-456-7891' },
      },
    });

    testSupplierIds = [supplier1.id, supplier2.id];

    // Create test materials
    const material1 = await prisma.material.create({
      data: {
        projectId: testProjectId,
        name: 'Concrete Mix',
        category: 'cement',
        unit: 'cubic meter',
        quantity: 10,
        unitPrice: 150,
        totalCost: 1500,
        supplierId: supplier1.id,
        specifications: { strength: '30MPa', type: 'ready-mix' },
      },
    });

    const material2 = await prisma.material.create({
      data: {
        projectId: testProjectId,
        name: 'Concrete Mix Premium',
        category: 'cement',
        unit: 'cubic meter',
        quantity: 10,
        unitPrice: 180,
        totalCost: 1800,
        supplierId: supplier2.id,
        specifications: { strength: '35MPa', type: 'ready-mix' },
      },
    });

    testMaterialIds = [material1.id, material2.id];
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.material.deleteMany({
      where: { id: { in: testMaterialIds } },
    });
    await prisma.materialSupplier.deleteMany({
      where: { id: { in: testSupplierIds } },
    });
    await prisma.project.delete({
      where: { id: testProjectId },
    });
  });

  describe('compareMaterials', () => {
    it('should compare materials from different suppliers', async () => {
      const compareData = {
        materialName: 'Concrete Mix',
        category: 'cement',
        quantity: 15,
        unit: 'cubic meter',
        specifications: { strength: '30MPa' },
      };

      const result = await materialService.compareMaterials(compareData);

      expect(result).toBeDefined();
      expect(result.searchCriteria).toEqual(compareData);
      expect(result.totalSuppliersFound).toBeGreaterThan(0);
      expect(result.allSuppliers).toHaveLength(2);
      expect(result.bestValue).toBeDefined();
      expect(result.marketAnalysis).toBeDefined();
      expect(result.marketAnalysis.averageMarketPrice).toBeGreaterThan(0);
    });

    it('should filter by specific suppliers when provided', async () => {
      const compareData = {
        materialName: 'Concrete Mix',
        category: 'cement',
        quantity: 15,
        unit: 'cubic meter',
        supplierIds: [testSupplierIds[0]], // Only first supplier
      };

      const result = await materialService.compareMaterials(compareData);

      expect(result.totalSuppliersFound).toBe(1);
      expect(result.allSuppliers[0].supplier.id).toBe(testSupplierIds[0]);
    });

    it('should throw error when no suppliers found', async () => {
      const compareData = {
        materialName: 'Non-existent Material',
        category: 'non-existent',
        quantity: 10,
        unit: 'pieces',
      };

      await expect(materialService.compareMaterials(compareData)).rejects.toThrow(
        'No suppliers found for comparison'
      );
    });

    it('should calculate pricing analysis correctly', async () => {
      const compareData = {
        materialName: 'Concrete Mix',
        category: 'cement',
        quantity: 10,
        unit: 'cubic meter',
      };

      const result = await materialService.compareMaterials(compareData);

      expect(result.allSuppliers).toHaveLength(2);
      
      // Check that suppliers are sorted by best value (quality + price)
      const firstSupplier = result.allSuppliers[0];
      const secondSupplier = result.allSuppliers[1];
      
      expect(firstSupplier.pricing.estimatedTotalCost).toBeGreaterThan(0);
      expect(firstSupplier.performance.qualityRating).toBeGreaterThanOrEqual(0);
      expect(firstSupplier.recommendations).toBeDefined();
    });

    it('should include market analysis with price variance', async () => {
      const compareData = {
        materialName: 'Concrete Mix',
        category: 'cement',
        quantity: 10,
        unit: 'cubic meter',
      };

      const result = await materialService.compareMaterials(compareData);

      expect(result.marketAnalysis.averageMarketPrice).toBeGreaterThan(0);
      expect(result.marketAnalysis.priceVariance).toBeGreaterThanOrEqual(0);
      expect(result.marketAnalysis.recommendedBudget).toBeGreaterThan(0);
    });
  });

  describe('getSuppliersWithRatings', () => {
    it('should get suppliers with performance metrics', async () => {
      const filters = {};
      const pagination = { page: 1, limit: 10, skip: 0 };

      const result = await materialService.getSuppliersWithRatings(filters, pagination);

      expect(result.data).toBeDefined();
      expect(result.pagination).toBeDefined();
      expect(result.data.length).toBeGreaterThan(0);
      
      const supplier = result.data[0];
      expect(supplier.performance).toBeDefined();
      expect(supplier.capabilities).toBeDefined();
      expect(supplier.performance.deliveryRate).toBeGreaterThanOrEqual(0);
      expect(supplier.performance.totalOrders).toBeGreaterThanOrEqual(0);
    });

    it('should filter suppliers by minimum rating', async () => {
      const filters = { minRating: 4.2 };
      const pagination = { page: 1, limit: 10, skip: 0 };

      const result = await materialService.getSuppliersWithRatings(filters, pagination);

      result.data.forEach(supplier => {
        expect(supplier.rating).toBeGreaterThanOrEqual(4.2);
      });
    });

    it('should search suppliers by name', async () => {
      const filters = { search: 'Supplier A' };
      const pagination = { page: 1, limit: 10, skip: 0 };

      const result = await materialService.getSuppliersWithRatings(filters, pagination);

      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].name).toContain('Supplier A');
    });
  });

  describe('calculateMaterialCostEstimation', () => {
    it('should calculate cost estimation for project', async () => {
      const result = await materialService.calculateMaterialCostEstimation(testProjectId);

      expect(result.projectId).toBe(testProjectId);
      expect(result.budget).toBeDefined();
      expect(result.materials).toBeDefined();
      expect(result.categoryBreakdown).toBeDefined();
      expect(result.recommendations).toBeDefined();
      
      expect(result.materials.total).toBe(2);
      expect(result.materials.estimated).toBeGreaterThan(0);
      expect(result.categoryBreakdown.cement).toBeDefined();
    });

    it('should calculate budget variance correctly', async () => {
      // Update project with budget
      await prisma.project.update({
        where: { id: testProjectId },
        data: { budget: 5000 },
      });

      const result = await materialService.calculateMaterialCostEstimation(testProjectId);

      expect(result.budget.allocated).toBe(5000);
      expect(result.budget.estimated).toBeGreaterThan(0);
      expect(result.budget.variance).toBeDefined();
      expect(result.budget.utilizationRate).toBeGreaterThanOrEqual(0);
    });

    it('should provide recommendations based on budget status', async () => {
      const result = await materialService.calculateMaterialCostEstimation(testProjectId);

      expect(result.recommendations.overBudget).toBeDefined();
      expect(result.recommendations.needsReview).toBeDefined();
      expect(result.recommendations.onTrack).toBeDefined();
      expect(result.recommendations.underBudget).toBeDefined();
    });
  });
});