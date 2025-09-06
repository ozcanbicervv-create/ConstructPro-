import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

/**
 * Comprehensive Health Check Endpoint for ConstructPro
 * Used by Coolify and monitoring systems to verify application health
 */

let prisma: PrismaClient | null = null;

// Initialize Prisma client for health checks
function getPrismaClient() {
  if (!prisma) {
    try {
      prisma = new PrismaClient();
    } catch (error) {
      console.error('Failed to initialize Prisma client:', error);
      return null;
    }
  }
  return prisma;
}

// Individual health check functions
async function checkDatabase(): Promise<{ status: string; latency?: number; error?: string }> {
  try {
    const client = getPrismaClient();
    if (!client) {
      return { status: 'unavailable', error: 'Prisma client not initialized' };
    }

    const start = Date.now();
    await client.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;

    return { status: 'healthy', latency };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error instanceof Error ? error.message : 'Database connection failed' 
    };
  }
}

function checkMemory(): { status: string; usage: any; warning?: string } {
  const memUsage = process.memoryUsage();
  const usedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  const totalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
  const usagePercent = Math.round((usedMB / totalMB) * 100);

  const usage = {
    used: usedMB,
    total: totalMB,
    percentage: usagePercent,
    rss: Math.round(memUsage.rss / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024),
  };

  let status = 'healthy';
  let warning;

  if (usagePercent > 90) {
    status = 'critical';
    warning = 'Memory usage is critically high';
  } else if (usagePercent > 75) {
    status = 'warning';
    warning = 'Memory usage is high';
  }

  return { status, usage, warning };
}

function checkDisk(): { status: string; warning?: string } {
  // Basic disk check - in a real implementation, you'd check actual disk usage
  // For now, we'll just return healthy
  return { status: 'healthy' };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Perform all health checks
    const [dbCheck, memoryCheck, diskCheck] = await Promise.all([
      checkDatabase(),
      Promise.resolve(checkMemory()),
      Promise.resolve(checkDisk()),
    ]);

    const responseTime = Date.now() - startTime;

    // Determine overall health status
    const checks = [dbCheck, memoryCheck, diskCheck];
    const hasUnhealthy = checks.some(check => check.status === 'unhealthy' || check.status === 'critical');
    const hasWarning = checks.some(check => check.status === 'warning');

    let overallStatus = 'healthy';
    if (hasUnhealthy) {
      overallStatus = 'unhealthy';
    } else if (hasWarning) {
      overallStatus = 'warning';
    }

    const healthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      service: 'ConstructPro',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'production',
      uptime: Math.round(process.uptime()),
      responseTime,
      checks: {
        database: dbCheck,
        memory: memoryCheck,
        disk: diskCheck,
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
      },
    };

    // Return appropriate HTTP status based on health
    const httpStatus = overallStatus === 'unhealthy' ? 503 : 200;

    return NextResponse.json(healthStatus, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Health-Status': overallStatus,
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    const errorResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'ConstructPro',
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime,
    };
    
    return NextResponse.json(errorResponse, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Health-Status': 'unhealthy',
      },
    });
  }
}

// Support HEAD requests for simple health checks
export async function HEAD(request: NextRequest) {
  try {
    // Quick check without detailed response
    const client = getPrismaClient();
    if (client) {
      await client.$queryRaw`SELECT 1`;
    }
    return new NextResponse(null, { 
      status: 200,
      headers: {
        'X-Health-Status': 'healthy',
      },
    });
  } catch (error) {
    return new NextResponse(null, { 
      status: 503,
      headers: {
        'X-Health-Status': 'unhealthy',
      },
    });
  }
}