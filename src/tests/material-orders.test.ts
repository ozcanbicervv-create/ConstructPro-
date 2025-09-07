import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { PrismaClient, OrderStatus } from '@prisma/client';

import { materialService } from '@/services/material.service';

const prisma = new PrismaClient();

describe('Material Orders Service', () => {
  let testProjectId: string;
  let testSupplierId: string;
  let testMaterialId: string;
  const testUserId = 'test-user-id';
  let testOrderId: string;

  beforeEach(async () => {
    // Create test project
    const project = await prisma.project.create({
      data: {
        name: 'Test Project for Orders',
        managerId: testUserId,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    testProjectId = project.id;

    // Create test supplier
    const supplier = await prisma.materialSupplier.create({
      data: {
        name: 'Test Supplier',
        rating: 4.5,
        contactInfo: { email: 'supplier@test.com', phone: '123-456-7890' },
      },
    });
    testSupplierId = supplier.id;

    // Create test material
    const material = await prisma.material.create({
      data: {
        projectId: testProjectId,
        name: 'Test Material',
        category: 'cement',
        unit: 'bags',
        quantity: 100,
        unitPrice: 25,
        totalCost: 2500,
        supplierId: testSupplierId,
      },
    });
    testMaterialId = material.id;
  });

  afterEach(async () => {
    // Clean up test data
    if (testOrderId) {
      await prisma.materialOrder.deleteMany({
        where: { id: testOrderId },
      });
    }
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

  describe('createMaterialOrder', () => {
    it('should create a material order successfully', async () => {
      const orderData = {
        materialId: testMaterialId,
        supplierId: testSupplierId,
        quantity: 50,
        unitPrice: 25,
      };

      const order = await materialService.createMaterialOrder(orderData);
      testOrderId = order.id;

      expect(order).toBeDefined();
      expect(order.materialId).toBe(testMaterialId);
      expect(order.supplierId).toBe(testSupplierId);
      expect(order.quantity).toBe(50);
      expect(order.unitPrice).toBe(25);
      expect(order.totalCost).toBe(1250);
      expect(order.status).toBe(OrderStatus.PENDING);
    });

    it('should throw error for non-existent material', async () => {
      const orderData = {
        materialId: 'non-existent-id',
        supplierId: testSupplierId,
        quantity: 50,
        unitPrice: 25,
      };

      await expect(materialService.createMaterialOrder(orderData)).rejects.toThrow(
        'Material not found'
      );
    });

    it('should throw error for non-existent supplier', async () => {
      const orderData = {
        materialId: testMaterialId,
        supplierId: 'non-existent-id',
        quantity: 50,
        unitPrice: 25,
      };

      await expect(materialService.createMaterialOrder(orderData)).rejects.toThrow(
        'Supplier not found'
      );
    });

    it('should calculate total cost correctly', async () => {
      const orderData = {
        materialId: testMaterialId,
        supplierId: testSupplierId,
        quantity: 75,
        unitPrice: 30,
      };

      const order = await materialService.createMaterialOrder(orderData);
      testOrderId = order.id;

      expect(order.totalCost).toBe(2250); // 75 * 30
    });
  });

  describe('getMaterialOrders', () => {
    beforeEach(async () => {
      // Create test order
      const order = await materialService.createMaterialOrder({
        materialId: testMaterialId,
        supplierId: testSupplierId,
        quantity: 50,
        unitPrice: 25,
      });
      testOrderId = order.id;
    });

    it('should get material orders with pagination', async () => {
      const filters = {};
      const pagination = { page: 1, limit: 10, skip: 0 };

      const result = await materialService.getMaterialOrders(filters, pagination, testUserId);

      expect(result.data).toBeDefined();
      expect(result.pagination).toBeDefined();
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].id).toBe(testOrderId);
    });

    it('should filter orders by status', async () => {
      const filters = { status: OrderStatus.PENDING };
      const pagination = { page: 1, limit: 10, skip: 0 };

      const result = await materialService.getMaterialOrders(filters, pagination, testUserId);

      result.data.forEach(order => {
        expect(order.status).toBe(OrderStatus.PENDING);
      });
    });

    it('should filter orders by supplier', async () => {
      const filters = { supplierId: testSupplierId };
      const pagination = { page: 1, limit: 10, skip: 0 };

      const result = await materialService.getMaterialOrders(filters, pagination, testUserId);

      result.data.forEach(order => {
        expect(order.supplierId).toBe(testSupplierId);
      });
    });

    it('should filter orders by project', async () => {
      const filters = { projectId: testProjectId };
      const pagination = { page: 1, limit: 10, skip: 0 };

      const result = await materialService.getMaterialOrders(filters, pagination, testUserId);

      result.data.forEach(order => {
        expect(order.material?.project?.id).toBe(testProjectId);
      });
    });

    it('should search orders by material or supplier name', async () => {
      const filters = { search: 'Test Material' };
      const pagination = { page: 1, limit: 10, skip: 0 };

      const result = await materialService.getMaterialOrders(filters, pagination, testUserId);

      expect(result.data.length).toBeGreaterThan(0);
    });
  });

  describe('getMaterialOrderById', () => {
    beforeEach(async () => {
      const order = await materialService.createMaterialOrder({
        materialId: testMaterialId,
        supplierId: testSupplierId,
        quantity: 50,
        unitPrice: 25,
      });
      testOrderId = order.id;
    });

    it('should get order by ID with access validation', async () => {
      const order = await materialService.getMaterialOrderById(testOrderId, testUserId);

      expect(order).toBeDefined();
      expect(order?.id).toBe(testOrderId);
      expect(order?.material).toBeDefined();
      expect(order?.supplier).toBeDefined();
    });

    it('should return null for non-existent order', async () => {
      const order = await materialService.getMaterialOrderById('non-existent-id', testUserId);

      expect(order).toBeNull();
    });

    it('should throw access denied for unauthorized user', async () => {
      await expect(
        materialService.getMaterialOrderById(testOrderId, 'unauthorized-user')
      ).rejects.toThrow('Access denied');
    });
  });

  describe('updateMaterialOrder', () => {
    beforeEach(async () => {
      const order = await materialService.createMaterialOrder({
        materialId: testMaterialId,
        supplierId: testSupplierId,
        quantity: 50,
        unitPrice: 25,
      });
      testOrderId = order.id;
    });

    it('should update order status', async () => {
      const updateData = { status: OrderStatus.CONFIRMED };

      const updatedOrder = await materialService.updateMaterialOrder(
        testOrderId,
        updateData,
        testUserId
      );

      expect(updatedOrder.status).toBe(OrderStatus.CONFIRMED);
    });

    it('should update quantity and recalculate total cost', async () => {
      const updateData = { quantity: 75 };

      const updatedOrder = await materialService.updateMaterialOrder(
        testOrderId,
        updateData,
        testUserId
      );

      expect(updatedOrder.quantity).toBe(75);
      expect(updatedOrder.totalCost).toBe(1875); // 75 * 25
    });

    it('should update unit price and recalculate total cost', async () => {
      const updateData = { unitPrice: 30 };

      const updatedOrder = await materialService.updateMaterialOrder(
        testOrderId,
        updateData,
        testUserId
      );

      expect(updatedOrder.unitPrice).toBe(30);
      expect(updatedOrder.totalCost).toBe(1500); // 50 * 30
    });

    it('should throw error for unauthorized user', async () => {
      const updateData = { status: OrderStatus.CONFIRMED };

      await expect(
        materialService.updateMaterialOrder(testOrderId, updateData, 'unauthorized-user')
      ).rejects.toThrow('Order not found');
    });
  });

  describe('cancelMaterialOrder', () => {
    beforeEach(async () => {
      const order = await materialService.createMaterialOrder({
        materialId: testMaterialId,
        supplierId: testSupplierId,
        quantity: 50,
        unitPrice: 25,
      });
      testOrderId = order.id;
    });

    it('should cancel pending order', async () => {
      await materialService.cancelMaterialOrder(testOrderId, testUserId);

      const order = await materialService.getMaterialOrderById(testOrderId, testUserId);
      expect(order?.status).toBe(OrderStatus.CANCELLED);
    });

    it('should throw error when cancelling delivered order', async () => {
      // First update order to delivered
      await materialService.updateMaterialOrder(
        testOrderId,
        { status: OrderStatus.DELIVERED },
        testUserId
      );

      await expect(
        materialService.cancelMaterialOrder(testOrderId, testUserId)
      ).rejects.toThrow('Cannot cancel delivered order');
    });

    it('should throw error for unauthorized user', async () => {
      await expect(
        materialService.cancelMaterialOrder(testOrderId, 'unauthorized-user')
      ).rejects.toThrow('Order not found');
    });
  });
});