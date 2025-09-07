import { NextRequest, NextResponse } from 'next/server';
import { withRequestCorrelation } from '@/middleware/correlation.middleware';
import { withErrorHandler } from '@/middleware/error-handler.middleware';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: ServiceHealth;
    redis: ServiceHealth;
    fileSystem: ServiceHealth;
  };
  metrics: {
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
  };
}

interface ServiceHealth {
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  error?: string;
  lastChecked: string;
}

class HealthChecker {
  private static instance: HealthChecker;
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  public static getInstance(): HealthChecker {
    if (!HealthChecker.instance) {
      HealthChecker.instance = new HealthChecker();
    }
    return HealthChecker.instance;
  }

  public async performHealthCheck(): Promise<HealthCheckResult> {
    const timestamp = new Date().toISOString();
    const uptime = Date.now() - this.startTime;

    // Check all services
    const [database, redisHealth, fileSystem] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkFileSystem()
    ]);

    // Determine overall status
    const services = { database, redis: redisHealth, fileSystem };
    const overallStatus = this.determineOverallStatus(services);

    // Get system metrics
    const metrics = {
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };

    return {
      status: overallStatus,
      timestamp,
      uptime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services,
      metrics
    };
  }

  private async checkDatabase(): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      await prisma.$queryRaw`SELECT 1`;
      
      return {
        status: 'healthy',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Database health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date().toISOString()
      };
    }
  }

  private async checkRedis(): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      if (!redis) {
        return {
          status: 'unhealthy',
          error: 'Redis client not initialized',
          lastChecked: new Date().toISOString()
        };
      }

      await redis.ping();
      
      return {
        status: 'healthy',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Redis health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date().toISOString()
      };
    }
  }

  private async checkFileSystem(): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const testFile = path.join(process.cwd(), 'uploads', '.health-check');
      const testContent = `health-check-${Date.now()}`;
      
      // Write test file
      await fs.writeFile(testFile, testContent);
      
      // Read test file
      const content = await fs.readFile(testFile, 'utf-8');
      
      // Clean up test file
      await fs.unlink(testFile);
      
      if (content !== testContent) {
        throw new Error('File system read/write mismatch');
      }
      
      return {
        status: 'healthy',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      logger.error('File system health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date().toISOString()
      };
    }
  }

  private determineOverallStatus(services: Record<string, ServiceHealth>): 'healthy' | 'unhealthy' | 'degraded' {
    const statuses = Object.values(services).map(service => service.status);
    
    if (statuses.every(status => status === 'healthy')) {
      return 'healthy';
    }
    
    if (statuses.some(status => status === 'healthy')) {
      return 'degraded';
    }
    
    return 'unhealthy';
  }
}

const healthChecker = HealthChecker.getInstance();

async function GET(request: NextRequest) {
  const healthResult = await healthChecker.performHealthCheck();
  
  // Log health check
  logger.info('Health check performed', {
    status: healthResult.status,
    uptime: healthResult.uptime,
    services: Object.entries(healthResult.services).map(([name, service]) => ({
      name,
      status: service.status,
      responseTime: service.responseTime
    }))
  });

  const statusCode = healthResult.status === 'healthy' ? 200 : 
                    healthResult.status === 'degraded' ? 200 : 503;

  return NextResponse.json({
    success: true,
    data: healthResult
  }, { status: statusCode });
}

// Apply middleware
const handler = withErrorHandler(withRequestCorrelation(GET));
export { handler as GET };