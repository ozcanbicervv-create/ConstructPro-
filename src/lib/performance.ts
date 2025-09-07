import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';
import { cacheManager } from './redis';

// Initialize default metrics collection
collectDefaultMetrics();

// Custom metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
});

export const databaseQueryDuration = new Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

export const cacheHitRate = new Counter({
  name: 'cache_operations_total',
  help: 'Total cache operations',
  labelNames: ['operation', 'result'],
});

export const apiRateLimitHits = new Counter({
  name: 'api_rate_limit_hits_total',
  help: 'Total API rate limit hits',
  labelNames: ['endpoint', 'user_id'],
});

// Performance monitoring class
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private alertThresholds = {
    responseTime: 5000, // 5 seconds
    errorRate: 0.05, // 5%
    memoryUsage: 0.9, // 90%
    cpuUsage: 0.8, // 80%
  };

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Track HTTP request metrics
  trackHttpRequest(method: string, route: string, statusCode: number, duration: number): void {
    httpRequestDuration
      .labels(method, route, statusCode.toString())
      .observe(duration / 1000);

    httpRequestTotal
      .labels(method, route, statusCode.toString())
      .inc();

    // Check for performance alerts
    if (duration > this.alertThresholds.responseTime) {
      this.triggerAlert('slow_response', {
        method,
        route,
        duration,
        threshold: this.alertThresholds.responseTime,
      });
    }
  }

  // Track database query metrics
  trackDatabaseQuery(operation: string, table: string, duration: number): void {
    databaseQueryDuration
      .labels(operation, table)
      .observe(duration / 1000);
  }

  // Track cache operations
  trackCacheOperation(operation: 'hit' | 'miss' | 'set' | 'delete', key?: string): void {
    cacheHitRate.labels(operation, operation === 'hit' ? 'success' : 'failure').inc();
  }

  // Track rate limit hits
  trackRateLimitHit(endpoint: string, userId?: string): void {
    apiRateLimitHits.labels(endpoint, userId || 'anonymous').inc();
  }

  // Get performance metrics
  async getMetrics(): Promise<string> {
    return register.metrics();
  }

  // Get performance summary
  async getPerformanceSummary(): Promise<{
    responseTime: {
      avg: number;
      p95: number;
      p99: number;
    };
    requestCount: number;
    errorRate: number;
    cacheStats: any;
    systemMetrics: {
      memoryUsage: number;
      cpuUsage: number;
    };
  }> {
    try {
      // Get cache statistics
      const cacheStats = await cacheManager.getStats();

      // Calculate response time metrics (simplified)
      const metrics = await register.getSingleMetric('http_request_duration_seconds');
      const responseTimeData = metrics ? await metrics.get() : null;

      // Get request count
      const requestMetrics = await register.getSingleMetric('http_requests_total');
      const requestData = requestMetrics ? await requestMetrics.get() : null;

      // Calculate error rate
      const totalRequests = requestData?.values.reduce((sum, metric) => sum + metric.value, 0) || 0;
      const errorRequests = requestData?.values
        .filter(metric => {
          const statusCode = parseInt(metric.labels.status_code || '200');
          return statusCode >= 400;
        })
        .reduce((sum, metric) => sum + metric.value, 0) || 0;

      const errorRate = totalRequests > 0 ? errorRequests / totalRequests : 0;

      // Get system metrics
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      return {
        responseTime: {
          avg: 0, // Would need more complex calculation
          p95: 0,
          p99: 0,
        },
        requestCount: totalRequests,
        errorRate,
        cacheStats,
        systemMetrics: {
          memoryUsage: memoryUsage.heapUsed / memoryUsage.heapTotal,
          cpuUsage: (cpuUsage.user + cpuUsage.system) / 1000000, // Convert to seconds
        },
      };
    } catch (error) {
      console.error('Error getting performance summary:', error);
      return {
        responseTime: { avg: 0, p95: 0, p99: 0 },
        requestCount: 0,
        errorRate: 0,
        cacheStats: {},
        systemMetrics: { memoryUsage: 0, cpuUsage: 0 },
      };
    }
  }

  // Trigger performance alert
  private async triggerAlert(type: string, data: any): Promise<void> {
    const alert = {
      type,
      timestamp: new Date().toISOString(),
      data,
      severity: this.getAlertSeverity(type, data),
    };

    console.warn('🚨 Performance Alert:', alert);

    // Store alert in cache for dashboard
    try {
      const alertKey = `alerts:${type}:${Date.now()}`;
      await cacheManager.set(alertKey, alert, 3600); // Store for 1 hour
    } catch (error) {
      console.error('Error storing alert:', error);
    }

    // In production, you might want to send to external monitoring service
    // await this.sendToMonitoringService(alert);
  }

  // Get alert severity
  private getAlertSeverity(type: string, data: any): 'low' | 'medium' | 'high' | 'critical' {
    switch (type) {
      case 'slow_response':
        if (data.duration > 10000) return 'critical';
        if (data.duration > 5000) return 'high';
        return 'medium';
      case 'high_error_rate':
        if (data.errorRate > 0.1) return 'critical';
        if (data.errorRate > 0.05) return 'high';
        return 'medium';
      case 'memory_usage':
        if (data.usage > 0.95) return 'critical';
        if (data.usage > 0.9) return 'high';
        return 'medium';
      default:
        return 'low';
    }
  }

  // Health check
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, boolean>;
    metrics: any;
  }> {
    const checks = {
      redis: false,
      database: false,
      memory: false,
      responseTime: false,
    };

    try {
      // Check Redis connection
      await cacheManager.redis.ping();
      checks.redis = true;
    } catch (error) {
      console.error('Redis health check failed:', error);
    }

    // Check memory usage
    const memoryUsage = process.memoryUsage();
    const memoryRatio = memoryUsage.heapUsed / memoryUsage.heapTotal;
    checks.memory = memoryRatio < this.alertThresholds.memoryUsage;

    // Get performance metrics
    const metrics = await this.getPerformanceSummary();
    checks.responseTime = metrics.responseTime.avg < this.alertThresholds.responseTime;

    // Determine overall status
    const healthyChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;
    
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (healthyChecks === totalChecks) {
      status = 'healthy';
    } else if (healthyChecks >= totalChecks * 0.7) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      checks,
      metrics,
    };
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Response time tracking middleware helper
export function createResponseTimeTracker() {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const route = req.route?.path || req.path || 'unknown';
      
      performanceMonitor.trackHttpRequest(
        req.method,
        route,
        res.statusCode,
        duration
      );
    });
    
    next();
  };
}

// Database query timing helper
export function trackDatabaseQuery<T>(
  operation: string,
  table: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  
  return queryFn().finally(() => {
    const duration = Date.now() - startTime;
    performanceMonitor.trackDatabaseQuery(operation, table, duration);
  });
}