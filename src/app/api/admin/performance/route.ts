import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor } from '@/lib/performance';
import { cacheManager } from '@/lib/redis';
import { optimizedPrisma } from '@/lib/database-optimization';
import { CompressionStats } from '@/middleware/compression.middleware';
import { RateLimitStats } from '@/middleware/rate-limit.middleware';
import { authMiddleware } from '@/middleware/auth.middleware';

// GET /api/admin/performance - Get performance metrics
export async function GET(request: NextRequest) {
  try {
    // Apply authentication middleware
    const authResult = await authMiddleware(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Check if user has admin permissions
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'summary';

    switch (type) {
      case 'summary':
        return await getPerformanceSummary();
      case 'metrics':
        return await getDetailedMetrics();
      case 'health':
        return await getHealthCheck();
      case 'cache':
        return await getCacheStats();
      case 'database':
        return await getDatabaseStats();
      default:
        return NextResponse.json(
          { error: 'Invalid performance type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Performance API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get performance summary
async function getPerformanceSummary() {
  try {
    const [
      performanceSummary,
      cacheStats,
      compressionStats,
      rateLimitStats,
      healthCheck,
    ] = await Promise.all([
      performanceMonitor.getPerformanceSummary(),
      cacheManager.getStats(),
      CompressionStats.getStats(),
      RateLimitStats.getStats(),
      performanceMonitor.healthCheck(),
    ]);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: healthCheck.status,
      performance: performanceSummary,
      cache: cacheStats,
      compression: compressionStats,
      rateLimit: rateLimitStats,
      health: healthCheck,
    });
  } catch (error) {
    console.error('Error getting performance summary:', error);
    return NextResponse.json(
      { error: 'Failed to get performance summary' },
      { status: 500 }
    );
  }
}

// Get detailed metrics
async function getDetailedMetrics() {
  try {
    const metrics = await performanceMonitor.getMetrics();
    
    return new NextResponse(metrics, {
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error getting detailed metrics:', error);
    return NextResponse.json(
      { error: 'Failed to get detailed metrics' },
      { status: 500 }
    );
  }
}

// Get health check
async function getHealthCheck() {
  try {
    const healthCheck = await performanceMonitor.healthCheck();
    
    return NextResponse.json(healthCheck, {
      status: healthCheck.status === 'healthy' ? 200 : 
              healthCheck.status === 'degraded' ? 200 : 503,
    });
  } catch (error) {
    console.error('Error getting health check:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: 'Health check failed',
        checks: {},
        metrics: {},
      },
      { status: 503 }
    );
  }
}

// Get cache statistics
async function getCacheStats() {
  try {
    const stats = await cacheManager.getStats();
    
    // Get additional cache information
    const info = await cacheManager.redis.info();
    const keyspaceInfo = await cacheManager.redis.info('keyspace');
    
    return NextResponse.json({
      ...stats,
      info: {
        version: info.match(/redis_version:(.+)/)?.[1] || 'unknown',
        uptime: info.match(/uptime_in_seconds:(\d+)/)?.[1] || '0',
        connectedClients: info.match(/connected_clients:(\d+)/)?.[1] || '0',
        usedMemoryPeak: info.match(/used_memory_peak_human:(.+)/)?.[1] || 'N/A',
      },
      keyspace: keyspaceInfo,
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return NextResponse.json(
      { error: 'Failed to get cache statistics' },
      { status: 500 }
    );
  }
}

// Get database statistics
async function getDatabaseStats() {
  try {
    const [
      healthCheck,
      queryPerformance,
    ] = await Promise.all([
      optimizedPrisma.healthCheck(),
      optimizedPrisma.analyzeQueryPerformance(),
    ]);

    // Get database size information (PostgreSQL specific)
    let databaseSize = null;
    try {
      const sizeResult = await optimizedPrisma.$queryRaw<Array<{ size: string }>>`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size;
      `;
      databaseSize = sizeResult[0]?.size || 'N/A';
    } catch (error) {
      // Fallback for non-PostgreSQL databases
      databaseSize = 'N/A';
    }

    // Get table statistics
    let tableStats = null;
    try {
      const tables = await optimizedPrisma.$queryRaw<Array<{
        table_name: string;
        row_count: number;
        size: string;
      }>>`
        SELECT 
          schemaname||'.'||tablename as table_name,
          n_tup_ins + n_tup_upd + n_tup_del as row_count,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
        FROM pg_stat_user_tables 
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        LIMIT 10;
      `;
      tableStats = tables;
    } catch (error) {
      // Fallback for non-PostgreSQL databases
      tableStats = [];
    }

    return NextResponse.json({
      healthy: healthCheck,
      databaseSize,
      queryPerformance,
      tableStats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error getting database stats:', error);
    return NextResponse.json(
      { error: 'Failed to get database statistics' },
      { status: 500 }
    );
  }
}

// POST /api/admin/performance - Performance actions
export async function POST(request: NextRequest) {
  try {
    // Apply authentication middleware
    const authResult = await authMiddleware(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Check if user has admin permissions
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, target } = body;

    switch (action) {
      case 'clear_cache':
        return await clearCache(target);
      case 'reset_stats':
        return await resetStats(target);
      case 'optimize_database':
        return await optimizeDatabase();
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Performance action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Clear cache
async function clearCache(target?: string) {
  try {
    switch (target) {
      case 'all':
        await cacheManager.redis.flushdb();
        break;
      case 'api':
        await cacheManager.delPattern('api:*');
        break;
      case 'projects':
        await cacheManager.delPattern('project*');
        break;
      case 'tasks':
        await cacheManager.delPattern('task*');
        break;
      case 'materials':
        await cacheManager.delPattern('material*');
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid cache target' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Cache cleared: ${target}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}

// Reset statistics
async function resetStats(target?: string) {
  try {
    switch (target) {
      case 'compression':
        CompressionStats.reset();
        break;
      case 'all':
        CompressionStats.reset();
        // Add other stats reset here
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid stats target' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Statistics reset: ${target}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error resetting stats:', error);
    return NextResponse.json(
      { error: 'Failed to reset statistics' },
      { status: 500 }
    );
  }
}

// Optimize database
async function optimizeDatabase() {
  try {
    // Run database optimization tasks
    const results = [];

    // Analyze tables (PostgreSQL)
    try {
      await optimizedPrisma.$executeRaw`ANALYZE;`;
      results.push('Tables analyzed');
    } catch (error) {
      results.push('Table analysis failed');
    }

    // Vacuum database (PostgreSQL)
    try {
      await optimizedPrisma.$executeRaw`VACUUM;`;
      results.push('Database vacuumed');
    } catch (error) {
      results.push('Database vacuum failed');
    }

    return NextResponse.json({
      success: true,
      message: 'Database optimization completed',
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error optimizing database:', error);
    return NextResponse.json(
      { error: 'Failed to optimize database' },
      { status: 500 }
    );
  }
}