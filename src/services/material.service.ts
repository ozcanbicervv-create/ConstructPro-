import { PrismaClient, OrderStatus } from '@prisma/client';
import { Material, MaterialSupplier, MaterialOrder } from '@/types/project.types';
import { CreateMaterialRequest, UpdateMaterialRequest, MaterialFilters } from '@/utils/validation-schemas';
import { PaginationParams, PaginatedResponse } from '@/utils/api-helpers';

const prisma = new PrismaClient();

export class MaterialService {
  // Create a new material
  async createMaterial(data: CreateMaterialRequest): Promise<Material> {
    // Calculate total cost
    const totalCost = data.quantity * data.unitPrice;

    const material = await prisma.material.create({
      data: {
        ...data,
        totalCost,
      },
      include: {
        project: true,
        supplier: true,
        orders: true,
      },
    });

    return material as Material;
  }

  // Get materials with filtering and pagination
  async getMaterials(
    filters: MaterialFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<Material>> {
    const where: any = {};

    // Apply filters
    if (filters.category) {
      where.category = {
        contains: filters.category,
        mode: 'insensitive',
      };
    }

    if (filters.supplierId) {
      where.supplierId = filters.supplierId;
    }

    if (filters.search) {
      where.OR = [
        {
          name: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (filters.minCost !== undefined || filters.maxCost !== undefined) {
      where.totalCost = {};
      if (filters.minCost !== undefined) {
        where.totalCost.gte = filters.minCost;
      }
      if (filters.maxCost !== undefined) {
        where.totalCost.lte = filters.maxCost;
      }
    }

    if (filters.minQuantity !== undefined || filters.maxQuantity !== undefined) {
      where.quantity = {};
      if (filters.minQuantity !== undefined) {
        where.quantity.gte = filters.minQuantity;
      }
      if (filters.maxQuantity !== undefined) {
        where.quantity.lte = filters.maxQuantity;
      }
    }

    // Get total count for pagination
    const total = await prisma.material.count({ where });

    // Get materials with pagination
    const materials = await prisma.material.findMany({
      where,
      include: {
        project: true,
        supplier: true,
        orders: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: pagination.skip,
      take: pagination.limit,
    });

    return {
      data: materials as Material[],
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
        hasNext: pagination.page < Math.ceil(total / pagination.limit),
        hasPrev: pagination.page > 1,
      },
    };
  }

  // Get material by ID
  async getMaterialById(id: string): Promise<Material | null> {
    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        project: true,
        supplier: true,
        orders: {
          include: {
            supplier: true,
          },
        },
      },
    });

    return material as Material | null;
  }

  // Update material
  async updateMaterial(id: string, data: UpdateMaterialRequest): Promise<Material> {
    // Get current material to calculate new total cost if needed
    const currentMaterial = await prisma.material.findUnique({
      where: { id },
    });

    if (!currentMaterial) {
      throw new Error('Material not found');
    }

    // Calculate new total cost if quantity or unit price changed
    let totalCost = currentMaterial.totalCost.toNumber();
    const newQuantity = data.quantity ?? currentMaterial.quantity.toNumber();
    const newUnitPrice = data.unitPrice ?? currentMaterial.unitPrice.toNumber();

    if (data.quantity !== undefined || data.unitPrice !== undefined) {
      totalCost = newQuantity * newUnitPrice;
    }

    const material = await prisma.material.update({
      where: { id },
      data: {
        ...data,
        totalCost,
      },
      include: {
        project: true,
        supplier: true,
        orders: true,
      },
    });

    return material as Material;
  }

  // Delete material with usage validation
  async deleteMaterial(id: string): Promise<void> {
    // Check if material has any orders
    const ordersCount = await prisma.materialOrder.count({
      where: { materialId: id },
    });

    if (ordersCount > 0) {
      throw new Error('Cannot delete material that has existing orders');
    }

    await prisma.material.delete({
      where: { id },
    });
  }

  // Get materials by project ID
  async getMaterialsByProjectId(projectId: string): Promise<Material[]> {
    const materials = await prisma.material.findMany({
      where: { projectId },
      include: {
        supplier: true,
        orders: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return materials as Material[];
  }

  // Check if material exists and user has access
  async validateMaterialAccess(materialId: string, userId: string): Promise<boolean> {
    const material = await prisma.material.findUnique({
      where: { id: materialId },
      include: {
        project: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!material) {
      return false;
    }

    // Check if user is project manager or team member
    const hasAccess =
      material.project.managerId === userId ||
      material.project.members.some(member => member.userId === userId);

    return hasAccess;
  }

  // Check if user has access to project for creating materials
  async validateProjectAccess(projectId: string, userId: string): Promise<boolean> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: true,
      },
    });

    if (!project) {
      return false;
    }

    // Check if user is project manager or team member
    const hasAccess =
      project.managerId === userId ||
      project.members.some(member => member.userId === userId);

    return hasAccess;
  }

  // Get material inventory summary
  async getMaterialInventorySummary(projectId?: string) {
    const where = projectId ? { projectId } : {};

    const summary = await prisma.material.groupBy({
      by: ['category'],
      where,
      _count: {
        id: true,
      },
      _sum: {
        totalCost: true,
        quantity: true,
      },
    });

    return summary.map(item => ({
      category: item.category || 'Uncategorized',
      count: item._count.id,
      totalCost: item._sum.totalCost || 0,
      totalQuantity: item._sum.quantity || 0,
    }));
  }

  // Material comparison with pricing analysis
  async compareMaterials(compareData: {
    materialName: string;
    category?: string;
    quantity: number;
    unit: string;
    specifications?: any;
    supplierIds?: string[];
  }) {
    const where: any = {};

    // Build search criteria
    where.OR = [
      {
        name: {
          contains: compareData.materialName,
          mode: 'insensitive',
        },
      },
    ];

    if (compareData.category) {
      where.category = {
        contains: compareData.category,
        mode: 'insensitive',
      };
    }

    if (compareData.unit) {
      where.unit = compareData.unit;
    }

    // Find similar materials from different suppliers
    const materials = await prisma.material.findMany({
      where,
      include: {
        supplier: true,
        orders: {
          include: {
            supplier: true,
          },
          orderBy: {
            orderDate: 'desc',
          },
          take: 5, // Recent orders for pricing trends
        },
      },
    });

    if (materials.length === 0) {
      throw new Error('No suppliers found for comparison');
    }

    // Group by supplier and calculate metrics
    const supplierComparison = new Map();

    materials.forEach(material => {
      if (!material.supplier) return;

      const supplierId = material.supplier.id;
      if (compareData.supplierIds && !compareData.supplierIds.includes(supplierId)) {
        return; // Skip if specific suppliers requested and this isn't one
      }

      if (!supplierComparison.has(supplierId)) {
        supplierComparison.set(supplierId, {
          supplier: material.supplier,
          materials: [],
          averagePrice: 0,
          totalQuantity: 0,
          deliveryPerformance: 0,
          qualityRating: material.supplier.rating?.toNumber() || 0,
        });
      }

      const supplierData = supplierComparison.get(supplierId);
      supplierData.materials.push({
        id: material.id,
        name: material.name,
        unitPrice: material.unitPrice.toNumber(),
        quantity: material.quantity.toNumber(),
        totalCost: material.totalCost.toNumber(),
        specifications: material.specifications,
      });
    });

    // Calculate pricing analysis for each supplier
    const comparison = Array.from(supplierComparison.values()).map(supplierData => {
      const materials = supplierData.materials;
      const totalValue = materials.reduce((sum, m) => sum + m.totalCost, 0);
      const totalQuantity = materials.reduce((sum, m) => sum + m.quantity, 0);
      const averagePrice = totalQuantity > 0 ? totalValue / totalQuantity : 0;

      // Calculate estimated cost for requested quantity
      const estimatedCost = averagePrice * compareData.quantity;

      // Calculate delivery performance from recent orders
      const recentOrders = materials.flatMap(m =>
        prisma.materialOrder.findMany({
          where: {
            materialId: m.id,
            status: { in: [OrderStatus.DELIVERED, OrderStatus.CANCELLED] }
          },
          take: 10,
        })
      );

      return {
        supplier: {
          id: supplierData.supplier.id,
          name: supplierData.supplier.name,
          rating: supplierData.qualityRating,
          contactInfo: supplierData.supplier.contactInfo,
        },
        pricing: {
          averageUnitPrice: averagePrice,
          estimatedTotalCost: estimatedCost,
          priceRange: {
            min: Math.min(...materials.map(m => m.unitPrice)),
            max: Math.max(...materials.map(m => m.unitPrice)),
          },
          availableMaterials: materials.length,
        },
        performance: {
          qualityRating: supplierData.qualityRating,
          deliveryReliability: 0.85, // Placeholder - would calculate from actual delivery data
          responseTime: '24h', // Placeholder - would calculate from historical data
        },
        recommendations: {
          costEffective: estimatedCost < averagePrice * compareData.quantity * 1.1,
          qualityAssured: supplierData.qualityRating >= 4.0,
          reliable: true, // Placeholder - would calculate from delivery history
        },
      };
    });

    // Sort by best overall value (combination of price and quality)
    comparison.sort((a, b) => {
      const scoreA = (a.performance.qualityRating * 0.4) + ((1 / a.pricing.estimatedTotalCost) * 1000 * 0.6);
      const scoreB = (b.performance.qualityRating * 0.4) + ((1 / b.pricing.estimatedTotalCost) * 1000 * 0.6);
      return scoreB - scoreA;
    });

    return {
      searchCriteria: compareData,
      totalSuppliersFound: comparison.length,
      bestValue: comparison[0] || null,
      allSuppliers: comparison,
      marketAnalysis: {
        averageMarketPrice: comparison.reduce((sum, c) => sum + c.pricing.averageUnitPrice, 0) / comparison.length,
        priceVariance: this.calculatePriceVariance(comparison.map(c => c.pricing.averageUnitPrice)),
        recommendedBudget: compareData.quantity * (comparison.reduce((sum, c) => sum + c.pricing.averageUnitPrice, 0) / comparison.length) * 1.1,
      },
    };
  }

  // Get suppliers with rating system and performance metrics
  async getSuppliersWithRatings(
    filters: {
      search?: string;
      minRating?: number;
      category?: string;
      location?: string;
    },
    pagination: PaginationParams
  ) {
    const where: any = {};

    if (filters.search) {
      where.name = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    if (filters.minRating !== undefined) {
      where.rating = {
        gte: filters.minRating,
      };
    }

    // Get total count
    const total = await prisma.materialSupplier.count({ where });

    // Get suppliers with performance metrics
    const suppliers = await prisma.materialSupplier.findMany({
      where,
      include: {
        materials: {
          select: {
            id: true,
            name: true,
            category: true,
            unitPrice: true,
          },
        },
        orders: {
          select: {
            id: true,
            status: true,
            orderDate: true,
            totalCost: true,
          },
          orderBy: {
            orderDate: 'desc',
          },
          take: 50, // Recent orders for performance calculation
        },
      },
      orderBy: [
        { rating: 'desc' },
        { name: 'asc' },
      ],
      skip: pagination.skip,
      take: pagination.limit,
    });

    // Calculate performance metrics for each supplier
    const suppliersWithMetrics = suppliers.map(supplier => {
      const orders = supplier.orders;
      const deliveredOrders = orders.filter(o => o.status === OrderStatus.DELIVERED);
      const cancelledOrders = orders.filter(o => o.status === OrderStatus.CANCELLED);

      const deliveryRate = orders.length > 0 ? deliveredOrders.length / orders.length : 0;
      const cancellationRate = orders.length > 0 ? cancelledOrders.length / orders.length : 0;

      const totalOrderValue = orders.reduce((sum, o) => sum + o.totalCost.toNumber(), 0);
      const averageOrderValue = orders.length > 0 ? totalOrderValue / orders.length : 0;

      // Calculate material categories supplied
      const categories = [...new Set(supplier.materials.map(m => m.category).filter(Boolean))];

      return {
        id: supplier.id,
        name: supplier.name,
        contactInfo: supplier.contactInfo,
        rating: supplier.rating?.toNumber() || 0,
        performance: {
          deliveryRate: Math.round(deliveryRate * 100),
          cancellationRate: Math.round(cancellationRate * 100),
          totalOrders: orders.length,
          averageOrderValue,
          recentActivity: orders.slice(0, 5).map(o => ({
            date: o.orderDate,
            status: o.status,
            value: o.totalCost.toNumber(),
          })),
        },
        capabilities: {
          materialCount: supplier.materials.length,
          categories,
          priceRange: {
            min: supplier.materials.length > 0 ? Math.min(...supplier.materials.map(m => m.unitPrice.toNumber())) : 0,
            max: supplier.materials.length > 0 ? Math.max(...supplier.materials.map(m => m.unitPrice.toNumber())) : 0,
          },
        },
        createdAt: supplier.createdAt,
        updatedAt: supplier.updatedAt,
      };
    });

    return {
      data: suppliersWithMetrics,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
        hasNext: pagination.page < Math.ceil(total / pagination.limit),
        hasPrev: pagination.page > 1,
      },
    };
  }

  // Create material order with tracking
  async createMaterialOrder(orderData: {
    materialId: string;
    supplierId: string;
    quantity: number;
    unitPrice: number;
    expectedDeliveryDate?: string;
    notes?: string;
  }) {
    // Verify material exists
    const material = await prisma.material.findUnique({
      where: { id: orderData.materialId },
    });

    if (!material) {
      throw new Error('Material not found');
    }

    // Verify supplier exists
    const supplier = await prisma.materialSupplier.findUnique({
      where: { id: orderData.supplierId },
    });

    if (!supplier) {
      throw new Error('Supplier not found');
    }

    // Calculate total cost
    const totalCost = orderData.quantity * orderData.unitPrice;

    // Create the order
    const order = await prisma.materialOrder.create({
      data: {
        materialId: orderData.materialId,
        supplierId: orderData.supplierId,
        quantity: orderData.quantity,
        unitPrice: orderData.unitPrice,
        totalCost,
        status: OrderStatus.PENDING,
      },
      include: {
        material: {
          include: {
            project: true,
          },
        },
        supplier: true,
      },
    });

    return order as MaterialOrder;
  }

  // Get material orders with filtering
  async getMaterialOrders(
    filters: {
      status?: OrderStatus;
      supplierId?: string;
      materialId?: string;
      projectId?: string;
      search?: string;
      dateFrom?: string;
      dateTo?: string;
    },
    pagination: PaginationParams,
    userId: string
  ) {
    const where: any = {};

    // Apply filters
    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.supplierId) {
      where.supplierId = filters.supplierId;
    }

    if (filters.materialId) {
      where.materialId = filters.materialId;
    }

    if (filters.projectId) {
      where.material = {
        projectId: filters.projectId,
      };
    }

    if (filters.search) {
      where.OR = [
        {
          material: {
            name: {
              contains: filters.search,
              mode: 'insensitive',
            },
          },
        },
        {
          supplier: {
            name: {
              contains: filters.search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    if (filters.dateFrom || filters.dateTo) {
      where.orderDate = {};
      if (filters.dateFrom) {
        where.orderDate.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.orderDate.lte = new Date(filters.dateTo);
      }
    }

    // Add user access control - only show orders for projects user has access to
    where.material = {
      ...where.material,
      project: {
        OR: [
          { managerId: userId },
          { members: { some: { userId } } },
        ],
      },
    };

    // Get total count
    const total = await prisma.materialOrder.count({ where });

    // Get orders
    const orders = await prisma.materialOrder.findMany({
      where,
      include: {
        material: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        supplier: true,
      },
      orderBy: {
        orderDate: 'desc',
      },
      skip: pagination.skip,
      take: pagination.limit,
    });

    return {
      data: orders as MaterialOrder[],
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
        hasNext: pagination.page < Math.ceil(total / pagination.limit),
        hasPrev: pagination.page > 1,
      },
    };
  }

  // Calculate material cost estimation with budget tracking
  async calculateMaterialCostEstimation(projectId: string) {
    const materials = await prisma.material.findMany({
      where: { projectId },
      include: {
        supplier: true,
        orders: true,
      },
    });

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { budget: true },
    });

    const totalEstimatedCost = materials.reduce((sum, material) => {
      return sum + material.totalCost.toNumber();
    }, 0);

    const totalOrderedCost = materials.reduce((sum, material) => {
      const orderedCost = material.orders.reduce((orderSum, order) => {
        return orderSum + order.totalCost.toNumber();
      }, 0);
      return sum + orderedCost;
    }, 0);

    const projectBudget = project?.budget?.toNumber() || 0;
    const budgetVariance = projectBudget > 0 ? ((totalEstimatedCost - projectBudget) / projectBudget) * 100 : 0;

    // Group by category for detailed breakdown
    const categoryBreakdown = materials.reduce((acc, material) => {
      const category = material.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = {
          estimatedCost: 0,
          orderedCost: 0,
          materialCount: 0,
        };
      }

      acc[category].estimatedCost += material.totalCost.toNumber();
      acc[category].orderedCost += material.orders.reduce((sum, order) => sum + order.totalCost.toNumber(), 0);
      acc[category].materialCount += 1;

      return acc;
    }, {} as Record<string, any>);

    return {
      projectId,
      budget: {
        allocated: projectBudget,
        estimated: totalEstimatedCost,
        ordered: totalOrderedCost,
        remaining: projectBudget - totalOrderedCost,
        variance: budgetVariance,
        utilizationRate: projectBudget > 0 ? (totalOrderedCost / projectBudget) * 100 : 0,
      },
      materials: {
        total: materials.length,
        estimated: totalEstimatedCost,
        ordered: totalOrderedCost,
        pending: totalEstimatedCost - totalOrderedCost,
      },
      categoryBreakdown,
      recommendations: {
        overBudget: budgetVariance > 10,
        needsReview: budgetVariance > 5,
        onTrack: Math.abs(budgetVariance) <= 5,
        underBudget: budgetVariance < -5,
      },
    };
  }

  // Get material order by ID with access validation
  async getMaterialOrderById(orderId: string, userId: string) {
    const order = await prisma.materialOrder.findUnique({
      where: { id: orderId },
      include: {
        material: {
          include: {
            project: {
              include: {
                members: true,
              },
            },
          },
        },
        supplier: true,
      },
    });

    if (!order) {
      return null;
    }

    // Check access
    const hasAccess =
      order.material.project.managerId === userId ||
      order.material.project.members.some(member => member.userId === userId);

    if (!hasAccess) {
      throw new Error('Access denied');
    }

    return order as MaterialOrder;
  }

  // Update material order with access validation
  async updateMaterialOrder(
    orderId: string,
    updateData: {
      status?: OrderStatus;
      quantity?: number;
      unitPrice?: number;
      expectedDeliveryDate?: string;
      actualDeliveryDate?: string;
      notes?: string;
    },
    userId: string
  ) {
    // First check if order exists and user has access
    const existingOrder = await this.getMaterialOrderById(orderId, userId);
    if (!existingOrder) {
      throw new Error('Order not found');
    }

    // Calculate new total cost if quantity or unit price changed
    let totalCost = existingOrder.totalCost.toNumber();
    if (updateData.quantity !== undefined || updateData.unitPrice !== undefined) {
      const newQuantity = updateData.quantity ?? existingOrder.quantity.toNumber();
      const newUnitPrice = updateData.unitPrice ?? existingOrder.unitPrice.toNumber();
      totalCost = newQuantity * newUnitPrice;
    }

    // Update the order
    const order = await prisma.materialOrder.update({
      where: { id: orderId },
      data: {
        ...updateData,
        totalCost,
      },
      include: {
        material: {
          include: {
            project: true,
          },
        },
        supplier: true,
      },
    });

    return order as MaterialOrder;
  }

  // Cancel material order with access validation
  async cancelMaterialOrder(orderId: string, userId: string) {
    // First check if order exists and user has access
    const existingOrder = await this.getMaterialOrderById(orderId, userId);
    if (!existingOrder) {
      throw new Error('Order not found');
    }

    // Check if order can be cancelled
    if (existingOrder.status === OrderStatus.DELIVERED) {
      throw new Error('Cannot cancel delivered order');
    }

    // Cancel the order
    await prisma.materialOrder.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
      },
    });
  }

  // Get supplier performance tracking
  async getSupplierPerformanceMetrics(supplierId: string) {
    const supplier = await prisma.materialSupplier.findUnique({
      where: { id: supplierId },
      include: {
        orders: {
          orderBy: {
            orderDate: 'desc',
          },
        },
        materials: true,
      },
    });

    if (!supplier) {
      throw new Error('Supplier not found');
    }

    const orders = supplier.orders;
    const totalOrders = orders.length;

    if (totalOrders === 0) {
      return {
        supplier: {
          id: supplier.id,
          name: supplier.name,
          rating: supplier.rating?.toNumber() || 0,
        },
        performance: {
          totalOrders: 0,
          deliveryRate: 0,
          averageDeliveryTime: 0,
          qualityScore: supplier.rating?.toNumber() || 0,
          onTimeDeliveryRate: 0,
          cancellationRate: 0,
        },
        trends: {
          monthlyOrders: [],
          qualityTrend: 'stable',
          deliveryTrend: 'stable',
        },
      };
    }

    // Calculate performance metrics
    const deliveredOrders = orders.filter(o => o.status === OrderStatus.DELIVERED);
    const cancelledOrders = orders.filter(o => o.status === OrderStatus.CANCELLED);
    const shippedOrders = orders.filter(o => o.status === OrderStatus.SHIPPED);

    const deliveryRate = (deliveredOrders.length / totalOrders) * 100;
    const cancellationRate = (cancelledOrders.length / totalOrders) * 100;

    // Calculate average delivery time (placeholder - would need actual delivery dates)
    const averageDeliveryTime = 5; // days - placeholder

    // Calculate on-time delivery rate (placeholder)
    const onTimeDeliveryRate = 85; // percentage - placeholder

    // Monthly order trends (last 12 months)
    const monthlyOrders = this.calculateMonthlyOrderTrends(orders);

    return {
      supplier: {
        id: supplier.id,
        name: supplier.name,
        rating: supplier.rating?.toNumber() || 0,
        totalMaterials: supplier.materials.length,
      },
      performance: {
        totalOrders,
        deliveryRate: Math.round(deliveryRate),
        averageDeliveryTime,
        qualityScore: supplier.rating?.toNumber() || 0,
        onTimeDeliveryRate,
        cancellationRate: Math.round(cancellationRate),
        totalOrderValue: orders.reduce((sum, o) => sum + o.totalCost.toNumber(), 0),
      },
      trends: {
        monthlyOrders,
        qualityTrend: 'stable', // Would calculate from historical ratings
        deliveryTrend: 'improving', // Would calculate from delivery performance over time
      },
      recentOrders: orders.slice(0, 10).map(order => ({
        id: order.id,
        orderDate: order.orderDate,
        status: order.status,
        totalCost: order.totalCost.toNumber(),
        quantity: order.quantity.toNumber(),
      })),
    };
  }

  // Helper method to calculate monthly order trends
  private calculateMonthlyOrderTrends(orders: any[]) {
    const now = new Date();
    const monthlyData = [];

    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate >= monthStart && orderDate <= monthEnd;
      });

      monthlyData.push({
        month: monthStart.toISOString().substring(0, 7), // YYYY-MM format
        orderCount: monthOrders.length,
        totalValue: monthOrders.reduce((sum, o) => sum + o.totalCost.toNumber(), 0),
      });
    }

    return monthlyData;
  }

  // Helper method to calculate price variance
  private calculatePriceVariance(prices: number[]): number {
    if (prices.length === 0) return 0;

    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;

    return Math.sqrt(variance);
  }
}

export const materialService = new MaterialService();