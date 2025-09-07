import { logger, LogContext } from '@/lib/logger';

// Optional imports for external dependencies
let redis: any = null;
let prisma: any = null;

try {
  redis = require('@/lib/redis').redis;
} catch (error) {
  // Redis not available
}

try {
  prisma = require('@/lib/db').prisma;
} catch (error) {
  // Database not available
}

export interface ApiMetrics {
  endpoint: string;
  method: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  errorRate: number;
  lastRequest: string;
  statusCodes: Record<string, number>;
  errors: Record<string, number>;
}

export interface SystemMetrics {
  timestamp: string;
  requests: {
    total: number;
    successful: number;
    failed: number;
    rps: number; // requests per second
  };
  performance: {
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
  };
  errors: {
    total: number;
    rate: number;
    byCode: Record<string, number>;
  };
  resources: {
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
  };
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    database: boolean;
    redis: boolean;
    fileSystem: boolean;
    externalServices: boolean;
  };
  uptime: number;
  version: string;
  environment: string;
}

class ApiMonitoringService {
  private static instance: ApiMonitoringService;
  private metrics: Map<string, ApiMetrics> = new Map();
  private responseTimes: Map<string, number[]> = new Map();
  private requestCounts: Map<string, number> = new Map();
  private startTime: number;
  private healthChecks: Map<string, boolean> = new Map();

  constructor() {
    this.startTime = Date.now();
    this.initializeHealthChecks();
    this.startPeriodicTasks();
  }

  public static getInstance(): ApiMonitoringService {
    if (!ApiMonitoringService.instance) {
      ApiMonitoringService.instance = new ApiMonitoringService();
    }
    return ApiMonitoringService.instance;
  }

  private initializeHealthChecks(): void {
    this.healthChecks.set('database', true);
    this.healthChecks.set('redis', true);
    this.healthChecks.set('fileSystem', true);
    this.healthChecks.set('externalServices', true);
  }

  private startPeriodicTasks(): void {
    // Clean up old metrics every hour
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 60 * 60 * 1000);

    // Perform health checks every 30 seconds
    setInterval(() => {
      this.performHealthChecks();
    }, 30 * 1000);

    // Log system metrics every 5 minutes
    setInterval(() => {
      this.logSystemMetrics();
    }, 5 * 60 * 1000);
  }

  public recordRequest(
    method: string,
    endpoint: string,
    statusCode: number,
    responseTime: number,
    error?: string
  ): void {
    const key = `${method}:${endpoint}`;
    
    // Update metrics
    const metrics = this.metrics.get(key) || this.createEmptyMetrics(method, endpoint);
    
    metrics.totalRequests++;
    metrics.lastRequest = new Date().toISOString();
    
    if (statusCode >= 200 && statusCode < 400) {
      metrics.successfulRequests++;
    } else {
      metrics.failedRequests++;
    }
    
    // Update status code counts
    const statusKey = statusCode.toString();
    metrics.statusCodes[statusKey] = (metrics.statusCodes[statusKey] || 0) + 1;
    
    // Update error counts
    if (error) {
      metrics.errors[error] = (metrics.errors[error] || 0) + 1;
    }
    
    // Update response times
    const responseTimes = this.responseTimes.get(key) || [];
    responseTimes.push(responseTime);
    
    // Keep only last 1000 response times
    if (responseTimes.length > 1000) {
      responseTimes.splice(0, responseTimes.length - 1000);
    }
    
    this.responseTimes.set(key, responseTimes);
    
    // Calculate response time metrics
    metrics.minResponseTime = Math.min(metrics.minResponseTime, responseTime);
    metrics.maxResponseTime = Math.max(metrics.maxResponseTime, responseTime);
    metrics.averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    
    // Calculate error rate
    metrics.errorRate = (metrics.failedRequests / metrics.totalRequests) * 100;
    
    this.metrics.set(key, metrics);
    
    // Update request count for RPS calculation
    const minute = Math.floor(Date.now() / 60000);
    const countKey = `${minute}:${key}`;
    this.requestCounts.set(countKey, (this.requestCounts.get(countKey) || 0) + 1);
    
    // Log slow requests
    if (responseTime > 2000) {
      logger.warn('Slow API request detected', {
        method,
        endpoint,
        responseTime,
        statusCode
      });
    }
    
    // Log high error rates
    if (metrics.errorRate > 10 && metrics.totalRequests > 10) {
      logger.warn('High error rate detected', {
        method,
        endpoint,
        errorRate: metrics.errorRate,
        totalRequests: metrics.totalRequests,
        failedRequests: metrics.failedRequests
      });
    }
  }

  private createEmptyMetrics(method: string, endpoint: string): ApiMetrics {
    return {
      endpoint,
      method,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      errorRate: 0,
      lastRequest: new Date().toISOString(),
      statusCodes: {},
      errors: {}
    };
  }

  public getApiMetrics(method?: string, endpoint?: string): ApiMetrics[] {
    const allMetrics = Array.from(this.metrics.values());
    
    if (method && endpoint) {
      const key = `${method}:${endpoint}`;
      const metrics = this.metrics.get(key);
      return metrics ? [metrics] : [];
    }
    
    if (method) {
      return allMetrics.filter(m => m.method === method);
    }
    
    if (endpoint) {
      return allMetrics.filter(m => m.endpoint === endpoint);
    }
    
    return allMetrics;
  }

  public getSystemMetrics(): SystemMetrics {
    const now = Date.now();
    const allMetrics = Array.from(this.metrics.values());
    
    // Calculate totals
    const totalRequests = allMetrics.reduce((sum, m) => sum + m.totalRequests, 0);
    const successfulRequests = allMetrics.reduce((sum, m) => sum + m.successfulRequests, 0);
    const failedRequests = allMetrics.reduce((sum, m) => sum + m.failedRequests, 0);
    
    // Calculate RPS (requests per second) for last minute
    const currentMinute = Math.floor(now / 60000);
    let rps = 0;
    for (let i = 0; i < 60; i++) {
      const minute = currentMinute - i;
      for (const [key, count] of this.requestCounts.entries()) {
        if (key.startsWith(`${minute}:`)) {
          rps += count;
        }
      }
    }
    rps = rps / 60; // Average per second over last minute
    
    // Calculate response time percentiles
    const allResponseTimes = Array.from(this.responseTimes.values())
      .flat()
      .sort((a, b) => a - b);
    
    const averageResponseTime = allResponseTimes.length > 0 
      ? allResponseTimes.reduce((sum, time) => sum + time, 0) / allResponseTimes.length 
      : 0;
    
    const p95Index = Math.floor(allResponseTimes.length * 0.95);
    const p99Index = Math.floor(allResponseTimes.length * 0.99);
    
    const p95ResponseTime = allResponseTimes[p95Index] || 0;
    const p99ResponseTime = allResponseTimes[p99Index] || 0;
    
    // Calculate error statistics
    const totalErrors = failedRequests;
    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
    
    const errorsByCode: Record<string, number> = {};
    allMetrics.forEach(metrics => {
      Object.entries(metrics.statusCodes).forEach(([code, count]) => {
        const statusCode = parseInt(code);
        if (statusCode >= 400) {
          errorsByCode[code] = (errorsByCode[code] || 0) + count;
        }
      });
    });
    
    return {
      timestamp: new Date().toISOString(),
      requests: {
        total: totalRequests,
        successful: successfulRequests,
        failed: failedRequests,
        rps
      },
      performance: {
        averageResponseTime,
        p95ResponseTime,
        p99ResponseTime
      },
      errors: {
        total: totalErrors,
        rate: errorRate,
        byCode: errorsByCode
      },
      resources: {
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      }
    };
  }

  public async getHealthStatus(): Promise<HealthStatus> {
    const uptime = Date.now() - this.startTime;
    
    // Perform health checks
    await this.performHealthChecks();
    
    const checks = {
      database: this.healthChecks.get('database') || false,
      redis: this.healthChecks.get('redis') || false,
      fileSystem: this.healthChecks.get('fileSystem') || false,
      externalServices: this.healthChecks.get('externalServices') || false
    };
    
    // Determine overall status
    const healthyChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.values(checks).length;
    
    let status: HealthStatus['status'];
    if (healthyChecks === totalChecks) {
      status = 'healthy';
    } else if (healthyChecks >= totalChecks * 0.5) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }
    
    return {
      status,
      checks,
      uptime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };
  }

  private async performHealthChecks(): Promise<void> {
    // Database health check
    try {
      if (prisma) {
        await prisma.$queryRaw`SELECT 1`;
        this.healthChecks.set('database', true);
      } else {
        this.healthChecks.set('database', false);
      }
    } catch (error) {
      this.healthChecks.set('database', false);
      logger.error('Database health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Redis health check
    try {
      if (redis) {
        await redis.ping();
        this.healthChecks.set('redis', true);
      } else {
        this.healthChecks.set('redis', false);
      }
    } catch (error) {
      this.healthChecks.set('redis', false);
      logger.error('Redis health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // File system health check
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const testFile = path.join(process.cwd(), 'uploads', '.health-check');
      await fs.writeFile(testFile, 'health-check');
      await fs.unlink(testFile);
      
      this.healthChecks.set('fileSystem', true);
    } catch (error) {
      this.healthChecks.set('fileSystem', false);
      logger.error('File system health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // External services health check (placeholder)
    this.healthChecks.set('externalServices', true);
  }

  private cleanupOldMetrics(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    
    // Clean up old request counts
    for (const [key, _] of this.requestCounts.entries()) {
      const [minuteStr] = key.split(':');
      const minute = parseInt(minuteStr);
      if (minute * 60000 < oneHourAgo) {
        this.requestCounts.delete(key);
      }
    }
    
    logger.debug('Cleaned up old metrics', {
      remainingRequestCounts: this.requestCounts.size,
      totalMetrics: this.metrics.size
    });
  }

  private async logSystemMetrics(): Promise<void> {
    const systemMetrics = this.getSystemMetrics();
    
    logger.info('System metrics', {
      totalRequests: systemMetrics.requests.total,
      rps: systemMetrics.requests.rps,
      errorRate: systemMetrics.errors.rate,
      averageResponseTime: systemMetrics.performance.averageResponseTime,
      memoryUsage: systemMetrics.resources.memoryUsage.heapUsed,
      timestamp: systemMetrics.timestamp
    });
    
    // Store metrics in Redis for historical data
    if (redis) {
      try {
        const key = `metrics:${Math.floor(Date.now() / 60000)}`;
        await redis.setex(key, 24 * 60 * 60, JSON.stringify(systemMetrics)); // Keep for 24 hours
      } catch (error) {
        logger.error('Failed to store metrics in Redis', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  public async getHistoricalMetrics(hours = 24): Promise<SystemMetrics[]> {
    if (!redis) {
      return [];
    }
    
    const metrics: SystemMetrics[] = [];
    const now = Math.floor(Date.now() / 60000);
    
    for (let i = 0; i < hours * 60; i += 5) { // Every 5 minutes
      const minute = now - i;
      const key = `metrics:${minute}`;
      
      try {
        const data = await redis.get(key);
        if (data) {
          metrics.push(JSON.parse(data));
        }
      } catch (error) {
        logger.error('Failed to retrieve historical metrics', {
          key,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return metrics.reverse(); // Return in chronological order
  }

  public getTopEndpoints(limit = 10): ApiMetrics[] {
    return Array.from(this.metrics.values())
      .sort((a, b) => b.totalRequests - a.totalRequests)
      .slice(0, limit);
  }

  public getSlowestEndpoints(limit = 10): ApiMetrics[] {
    return Array.from(this.metrics.values())
      .sort((a, b) => b.averageResponseTime - a.averageResponseTime)
      .slice(0, limit);
  }

  public getErrorProneEndpoints(limit = 10): ApiMetrics[] {
    return Array.from(this.metrics.values())
      .filter(m => m.totalRequests > 10) // Only consider endpoints with significant traffic
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, limit);
  }

  public resetMetrics(): void {
    this.metrics.clear();
    this.responseTimes.clear();
    this.requestCounts.clear();
    
    logger.info('API metrics reset');
  }
}

export const apiMonitoringService = ApiMonitoringService.getInstance();