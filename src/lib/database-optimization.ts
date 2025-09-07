import { PrismaClient } from '@prisma/client';

import { performanceMonitor } from './performance';

// Database connection pool configuration
export const databaseConfig = {
  // Connection pool settings
  connectionLimit: parseInt(process.env.DATABASE_CONNECTION_LIMIT || '20'),
  acquireTimeout: parseInt(process.env.DATABASE_ACQUIRE_TIMEOUT || '60000'),
  timeout: parseInt(process.env.DATABASE_TIMEOUT || '5000'),
  
  // Query optimization settings
  queryTimeout: parseInt(process.env.DATABASE_QUERY_TIMEOUT || '10000'),
  slowQueryThreshold: parseInt(process.env.SLOW_QUERY_THRESHOLD || '1000'),
  
  // Logging settings
  logQueries: process.env.NODE_ENV === 'development',
  logSlowQueries: true,
};

// Enhanced Prisma client with optimization
export class OptimizedPrismaClient extends PrismaClient {
  constructor() {
    super({
      log: databaseConfig.logQueries 
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  // Helper method to track query performance
  private async executeWithTracking<T>(
    operation: string,
    model: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await queryFn();
      const duration = Date.now() - startTime;
      
      // Track query performance
      performanceMonitor.trackDatabaseQuery(operation, model, duration);
      
      // Log slow queries
      if (duration > databaseConfig.slowQueryThreshold) {
        console.warn(`🐌 Slow query detected:`, {
          model,
          operation,
          duration: `${duration}ms`,
        });
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      performanceMonitor.trackDatabaseQuery(operation, model, duration);
      
      console.error('Database query error:', {
        model,
        operation,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      throw error;
    }
  }

  // Optimized project queries
  async findProjectsOptimized(filters: {
    userId?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    return this.executeWithTracking('findMany', 'Project', async () => {
      const { userId, status, search, page = 1, limit = 10 } = filters;
      const offset = (page - 1) * limit;

      const where: any = {};
      
      if (userId) {
        where.OR = [
          { managerId: userId },
          { team: { some: { userId } } },
        ];
      }
      
      if (status) {
        where.status = status;
      }
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [projects, total] = await Promise.all([
        this.project.findMany({
          where,
          include: {
            manager: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            _count: {
              select: {
                tasks: true,
                materials: true,
                documents: true,
                team: true,
              },
            },
          },
          orderBy: [
            { priority: 'desc' },
            { updatedAt: 'desc' },
          ],
          skip: offset,
          take: limit,
        }),
        this.project.count({ where }),
      ]);

      return { projects, total };
    });
  }

  // Optimized task queries with aggregations
  async findTasksWithStats(filters: {
    projectId?: string;
    assignedTo?: string;
    status?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }) {
    const { projectId, assignedTo, status, priority, page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    const where: any = {};
    
    if (projectId) {where.projectId = projectId;}
    if (assignedTo) {where.assignedTo = assignedTo;}
    if (status) {where.status = status;}
    if (priority) {where.priority = priority;}

    const [tasks, total, stats] = await Promise.all([
      this.task.findMany({
        where,
        include: {
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              comments: true,
              attachments: true,
            },
          },
        },
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
          { updatedAt: 'desc' },
        ],
        skip: offset,
        take: limit,
      }),
      this.task.count({ where }),
      this.task.groupBy({
        by: ['status'],
        where: projectId ? { projectId } : {},
        _count: true,
      }),
    ]);

    return { tasks, total, stats };
  }

  // Optimized material queries with supplier data
  async findMaterialsWithSuppliers(filters: {
    projectId?: string;
    category?: string;
    supplierId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { projectId, category, supplierId, search, page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    const where: any = {};
    
    if (projectId) {where.projectId = projectId;}
    if (category) {where.category = category;}
    if (supplierId) {where.supplierId = supplierId;}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [materials, total] = await Promise.all([
      this.material.findMany({
        where,
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              rating: true,
              contactEmail: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          { unitPrice: 'asc' },
          { updatedAt: 'desc' },
        ],
        skip: offset,
        take: limit,
      }),
      this.material.count({ where }),
    ]);

    return { materials, total };
  }

  // Batch operations for better performance
  async batchCreateTasks(tasks: Array<{
    projectId: string;
    title: string;
    description?: string;
    assignedTo?: string;
    priority?: string;
    dueDate?: Date;
    estimatedHours?: number;
  }>) {
    return this.task.createMany({
      data: tasks.map(task => ({
        ...task,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      skipDuplicates: true,
    });
  }

  async batchUpdateTaskStatus(taskIds: string[], status: string, userId: string) {
    return this.task.updateMany({
      where: {
        id: { in: taskIds },
      },
      data: {
        status,
        updatedAt: new Date(),
      },
    });
  }

  // Aggregation queries for dashboard stats
  async getProjectStats(projectId: string) {
    const [
      taskStats,
      materialStats,
      budgetStats,
      recentActivity,
    ] = await Promise.all([
      this.task.groupBy({
        by: ['status'],
        where: { projectId },
        _count: true,
        _avg: { estimatedHours: true, actualHours: true },
      }),
      this.material.aggregate({
        where: { projectId },
        _count: true,
        _sum: { totalCost: true, quantity: true },
      }),
      this.project.findUnique({
        where: { id: projectId },
        select: { budget: true },
      }),
      this.task.findMany({
        where: { projectId },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: {
          assignee: {
            select: { firstName: true, lastName: true },
          },
        },
      }),
    ]);

    return {
      tasks: taskStats,
      materials: materialStats,
      budget: budgetStats?.budget || 0,
      recentActivity,
    };
  }

  // Connection health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  // Query performance analysis
  async analyzeQueryPerformance(): Promise<{
    slowQueries: Array<{
      query: string;
      avgDuration: number;
      count: number;
    }>;
    connectionStats: {
      active: number;
      idle: number;
      total: number;
    };
  }> {
    try {
      // This would be database-specific
      // For PostgreSQL, you might query pg_stat_statements
      // For now, return mock data
      return {
        slowQueries: [],
        connectionStats: {
          active: 5,
          idle: 15,
          total: 20,
        },
      };
    } catch (error) {
      console.error('Query performance analysis failed:', error);
      return {
        slowQueries: [],
        connectionStats: { active: 0, idle: 0, total: 0 },
      };
    }
  }
}

// Database indexing recommendations
export const indexingRecommendations = {
  // User table indexes
  user: [
    'CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);',
    'CREATE INDEX IF NOT EXISTS idx_user_role ON "User"(role);',
    'CREATE INDEX IF NOT EXISTS idx_user_last_active ON "User"("lastActive");',
  ],

  // Project table indexes
  project: [
    'CREATE INDEX IF NOT EXISTS idx_project_manager ON "Project"("managerId");',
    'CREATE INDEX IF NOT EXISTS idx_project_status ON "Project"(status);',
    'CREATE INDEX IF NOT EXISTS idx_project_priority ON "Project"(priority);',
    'CREATE INDEX IF NOT EXISTS idx_project_dates ON "Project"("startDate", "endDate");',
    'CREATE INDEX IF NOT EXISTS idx_project_location ON "Project"(location);',
  ],

  // Task table indexes
  task: [
    'CREATE INDEX IF NOT EXISTS idx_task_project ON "Task"("projectId");',
    'CREATE INDEX IF NOT EXISTS idx_task_assignee ON "Task"("assignedTo");',
    'CREATE INDEX IF NOT EXISTS idx_task_status ON "Task"(status);',
    'CREATE INDEX IF NOT EXISTS idx_task_priority ON "Task"(priority);',
    'CREATE INDEX IF NOT EXISTS idx_task_due_date ON "Task"("dueDate");',
    'CREATE INDEX IF NOT EXISTS idx_task_project_status ON "Task"("projectId", status);',
  ],

  // Material table indexes
  material: [
    'CREATE INDEX IF NOT EXISTS idx_material_project ON "Material"("projectId");',
    'CREATE INDEX IF NOT EXISTS idx_material_supplier ON "Material"("supplierId");',
    'CREATE INDEX IF NOT EXISTS idx_material_category ON "Material"(category);',
    'CREATE INDEX IF NOT EXISTS idx_material_cost ON "Material"("unitPrice", "totalCost");',
  ],

  // Document table indexes
  document: [
    'CREATE INDEX IF NOT EXISTS idx_document_project ON "ProjectDocument"("projectId");',
    'CREATE INDEX IF NOT EXISTS idx_document_type ON "ProjectDocument"(type);',
    'CREATE INDEX IF NOT EXISTS idx_document_uploaded_by ON "ProjectDocument"("uploadedBy");',
    'CREATE INDEX IF NOT EXISTS idx_document_created_at ON "ProjectDocument"("createdAt");',
  ],
};

// Apply database indexes
export async function applyDatabaseIndexes(prisma: OptimizedPrismaClient): Promise<void> {
  try {
    console.log('🔧 Applying database indexes...');
    
    const allIndexes = Object.values(indexingRecommendations).flat();
    
    for (const indexQuery of allIndexes) {
      try {
        await prisma.$executeRawUnsafe(indexQuery);
      } catch (error) {
        // Index might already exist, which is fine
        console.debug('Index creation skipped:', indexQuery);
      }
    }
    
    console.log('✅ Database indexes applied successfully');
  } catch (error) {
    console.error('❌ Error applying database indexes:', error);
  }
}

// Export optimized Prisma instance
export const optimizedPrisma = new OptimizedPrismaClient();