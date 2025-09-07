import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { PrismaClient, OrderStatus } from '@prisma/client';

import { materialService } from '@/services/material.service';

const prisma = new PrismaClient();

describe('Supplier Performance Service', () => {
  let testSupplierId: string;
  let testProjectId: string;
  let testMaterialId: string;
  let testOrderIds: string[] = [];

  beforeEach(async () => {
    // Create test project
    const project = await prisma.project.create({
      data: {
        name: 'Test Project for Supplier Performance',
        managerId: 'test-user-id',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    testProjectId = project.id;

    // Create test supplier
    const supplier = await prisma.materialSupplier.create({
      data: {
        name: 'Performance Test Supplier',
        rating: 4.2,
        contactInfo: { 
          email: 'performance@test.com', 
          phone: '123-456-7890',
          address: '123 Test Street'
        },
      },
    });
    testSupplierId = supplier.id;

    // Create test material
    const material = await prisma.material.create({
      data: {
        projectId: testProjectId,
        name: 'Performance Test Material',
        category: 'steel',
        unit: 'tons',
        quantity: 10,
        unitPrice: 500,
        totalCost: 5000,
        supplierId: testSupplierId,
      },
    });
    testMaterialId = material.id;

    // Create test orders with different statuses
    const orders = await Promise.all([
      prisma.materialOrder.create({
        data: {
          materialId: testMaterialId,
          supplierId: testSupplierId,
          quantity: 5,
          unitPrice: 500,
          totalCost: 2500,
          status: OrderStatus.DELIVERED,
          orderDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        },
      }),
      prisma.materialOrder.create({
        data: {
          materialId: testMaterialId,
          supplierId: testSupplierId,
          quantity: 3,
          unitPrice: 500,
          totalCost: 1500,
          status: OrderStatus.DELIVERED,
          orderDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        },
      }),
      prisma.materialOrder.create({
        data: {
          materialId: testMaterialId,
          supplierId: testSupplierId,
          quantity: 2,
          unitPrice: 500,
          totalCost: 1000,
          status: OrderStatus.CANCELLED,
          orderDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        },
      }),
      prisma.materialOrder.create({
        data: {
          materialId: testMaterialId,
          supplierId: testSupplierId,
          quantity: 4,
          unitPrice: 500,
          totalCost: 2000,
          status: OrderStatus.PENDING,
          orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        },
      }),
    ]);

    testOrderIds = orders.map(order => order.id);
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.materialOrder.deleteMany({
      where: { id: { in: testOrderIds } },
    });
    await prisma.material.delete({
      where: { id: testMaterialId },
    });
    await prisma.materialSupplier.delete({
      where: { id: testSupplierId },
    });
    await prisma.project.delete({
      where: { id: testProjectId },
    });
  });

  describe('getSupplierPerformanceMetrics', () => {
    it('should calculate performance metrics correctly', async () => {
      const performance = await materialService.getSupplierPerformanceMetrics(testSupplierId);

      expect(performance).toBeDefined();
      expect(performance.supplier.id).toBe(testSupplierId);
      expect(performance.supplier.name).toBe('Performance Test Supplier');
      expect(performance.supplier.rating).toBe(4.2);

      // Check performance calculations
      expect(performance.performance.totalOrders).toBe(4);
      expect(performance.performance.deliveryRate).toBe(50); // 2 delivered out of 4 total
      expect(performance.performance.cancellationRate).toBe(25); // 1 cancelled out of 4 total
      expect(performance.performance.totalOrderValue).toBe(7000); // Sum of all order costs
    });

    it('should include recent orders in performance data', async () => {
      const performance = await materialService.getSupplierPerformanceMetrics(testSupplierId);

      expect(performance.recentOrders).toBeDefined();
      expect(performance.recentOrders.length).toBe(4);
      
      // Orders should be sorted by date (most recent first)
      const orderDates = performance.recentOrders.map(order => new Date(order.orderDate));
      for (let i = 1; i < orderDates.length; i++) {
        expect(orderDates[i-1].getTime()).toBeGreaterThanOrEqual(orderDates[i].getTime());
      }
    });

    it('should include monthly order trends', async () => {
      const performance = await materialService.getSupplierPerformanceMetrics(testSupplierId);

      expect(performance.trends.monthlyOrders).toBeDefined();
      expect(performance.trends.monthlyOrders.length).toBe(12); // 12 months of data
      
      // Check that current month has orders
      const currentMonth = new Date().toISOString().substring(0, 7);
      const currentMonthData = performance.trends.monthlyOrders.find(
        month => month.month === currentMonth
      );
      expect(currentMonthData).toBeDefined();
      expect(currentMonthData?.orderCount).toBeGreaterThan(0);
    });

    it('should handle supplier with no orders', async () => {
      // Create supplier with no orders
      const emptySupplier = await prisma.materialSupplier.create({
        data: {
          name: 'Empty Supplier',
          rating: 3.0,
        },
      });

      const performance = await materialService.getSupplierPerformanceMetrics(emptySupplier.id);

      expect(performance.performance.totalOrders).toBe(0);
      expect(performance.performance.deliveryRate).toBe(0);
      expect(performance.performance.cancellationRate).toBe(0);
      expect(performance.recentOrders).toHaveLength(0);

      // Clean up
      await prisma.materialSupplier.delete({
        where: { id: emptySupplier.id },
      });
    });

    it('should throw error for non-existent supplier', async () => {
      await expect(
        materialService.getSupplierPerformanceMetrics('non-existent-id')
      ).rejects.toThrow('Supplier not found');
    });

    it('should include quality and delivery trends', async () => {
      const performance = await materialService.getSupplierPerformanceMetrics(testSupplierId);

      expect(performance.trends.qualityTrend).toBeDefined();
      expect(performance.trends.deliveryTrend).toBeDefined();
      expect(['improving', 'stable', 'declining']).toContain(performance.trends.qualityTrend);
      expect(['improving', 'stable', 'declining']).toContain(performance.trends.deliveryTrend);
    });

    it('should calculate average delivery time and on-time rate', async () => {
      const performance = await materialService.getSupplierPerformanceMetrics(testSupplierId);

      expect(performance.performance.averageDeliveryTime).toBeGreaterThan(0);
      expect(performance.performance.onTimeDeliveryRate).toBeGreaterThanOrEqual(0);
      expect(performance.performance.onTimeDeliveryRate).toBeLessThanOrEqual(100);
    });

    it('should include supplier material count', async () => {
      const performance = await materialService.getSupplierPerformanceMetrics(testSupplierId);

      expect(performance.supplier.totalMaterials).toBe(1);
    });
  });

  describe('monthly order trends calculation', () => {
    it('should generate 12 months of trend data', async () => {
      const performance = await materialService.getSupplierPerformanceMetrics(testSupplierId);
      const monthlyOrders = performance.trends.monthlyOrders;

      expect(monthlyOrders).toHaveLength(12);
      
      // Check that months are in chronological order (oldest to newest)
      for (let i = 1; i < monthlyOrders.length; i++) {
        const prevMonth = new Date(monthlyOrders[i-1].month + '-01');
        const currMonth = new Date(monthlyOrders[i].month + '-01');
        expect(currMonth.getTime()).toBeGreaterThan(prevMonth.getTime());
      }
    });

    it('should include order count and total value for each month', async () => {
      const performance = await materialService.getSupplierPerformanceMetrics(testSupplierId);
      const monthlyOrders = performance.trends.monthlyOrders;

      monthlyOrders.forEach(month => {
        expect(month.orderCount).toBeGreaterThanOrEqual(0);
        expect(month.totalValue).toBeGreaterThanOrEqual(0);
        expect(month.month).toMatch(/^\d{4}-\d{2}$/); // YYYY-MM format
      });
    });
  });
});