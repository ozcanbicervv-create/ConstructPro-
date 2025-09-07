import { NextRequest, NextResponse } from 'next/server';
import { withRequestCorrelation } from '@/middleware/correlation.middleware';
import { withErrorHandler } from '@/middleware/error-handler.middleware';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';
import { authMiddleware } from '@/middleware/auth.middleware';

interface SystemStatus {
  status: 'operational' | 'degraded' | 'maintenance' | 'outage';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: ServiceStatus[];
  metrics: SystemMetrics;
  alerts: Alert[];
}

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  responseTime: number;
  uptime: number;
  lastIncident?: string;
  metrics?: Record<string, any>;
}

interface SystemMetrics {
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
  };
  database: {
    connections: number;
    queryTime: number;
    slowQueries: number;
  };
  api: {
    requestsPerMinute: number;
    averageResponseTime: number;
    errorRate: number;
  };
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

class StatusMonitor {
  private static instance: StatusMonitor;
  private startTime: number;
  private alerts: Alert[] = [];
  private metrics: Map<string, any> = new Map();

  constructor() {
    this.startTime = Date.now();
  }

  public static getInstance(): StatusMonitor {
    if (!StatusMonitor.instance) {
      StatusMonitor.instance = new StatusMonitor();
    }
    return StatusMonitor.instance;
  }

  public async getSystemStatus(): Promise<SystemStatus> {
    const timestamp = new Date().toISOString();
    const uptime = Date.now() - this.startTime;

    // Check all services
    const services = await this.checkAllServices();
    
    // Get system metrics
    const metrics = await this.getSystemMetrics();
    
    // Determine overall status
    const overallStatus = this.determineSystemStatus(services, metrics);

    return {
      status: overallStatus,
      timestamp,
      uptime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services,
      metrics,
      alerts: this.getActiveAlerts()
    };
  }

  private async checkAllServices(): Promise<ServiceStatus[]> {
    const services: ServiceStatus[] = [];

    // Database service
    const dbStatus = await this.checkDatabaseService();
    services.push(dbStatus);

    // Redis service
    const redisStatus = await this.checkRedisService();
    services.push(redisStatus);

    // File storage service
    const storageStatus = await this.checkStorageService();
    services.push(storageStatus);

    // Socket.IO service
    const socketStatus = await this.checkSocketService();
    services.push(socketStatus);

    return services;
  }

  private async checkDatabaseService(): Promise<ServiceStatus> {
    const startTime = Date.now();
    
    try {
      // Test basic connectivity
      await prisma.$queryRaw`SELECT 1`;
      
      // Get connection info
      const result = await prisma.$queryRaw`
        SELECT 
          (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
          (SELECT count(*) FROM pg_stat_activity) as total_connections
      ` as any[];
      
      const responseTime = Date.now() - startTime;
      
      return {
        name: 'Database',
        status: responseTime < 1000 ? 'operational' : 'degraded',
        responseTime,
        uptime: Date.now() - this.startTime,
        metrics: {
          activeConnections: result[0]?.active_connections || 0,
          totalConnections: result[0]?.total_connections || 0
        }
      };
    } catch (error) {
      this.addAlert('error', `Database service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      return {
        name: 'Database',
        status: 'outage',
        responseTime: Date.now() - startTime,
        uptime: 0,
        lastIncident: new Date().toISOString()
      };
    }
  }

  private async checkRedisService(): Promise<ServiceStatus> {
    const startTime = Date.now();
    
    try {
      if (!redis) {
        throw new Error('Redis client not initialized');
      }

      await redis.ping();
      const info = await redis.info('memory');
      
      const responseTime = Date.now() - startTime;
      
      return {
        name: 'Redis Cache',
        status: responseTime < 500 ? 'operational' : 'degraded',
        responseTime,
        uptime: Date.now() - this.startTime,
        metrics: {
          memoryUsage: this.parseRedisMemoryInfo(info)
        }
      };
    } catch (error) {
      this.addAlert('error', `Redis service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      return {
        name: 'Redis Cache',
        status: 'outage',
        responseTime: Date.now() - startTime,
        uptime: 0,
        lastIncident: new Date().toISOString()
      };
    }
  }

  private async checkStorageService(): Promise<ServiceStatus> {
    const startTime = Date.now();
    
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const uploadsDir = path.join(process.cwd(), 'uploads');
      await fs.access(uploadsDir);
      
      const stats = await fs.stat(uploadsDir);
      const responseTime = Date.now() - startTime;
      
      return {
        name: 'File Storage',
        status: 'operational',
        responseTime,
        uptime: Date.now() - this.startTime,
        metrics: {
          accessible: true,
          lastModified: stats.mtime
        }
      };
    } catch (error) {
      this.addAlert('warning', `Storage service warning: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      return {
        name: 'File Storage',
        status: 'degraded',
        responseTime: Date.now() - startTime,
        uptime: Date.now() - this.startTime,
        lastIncident: new Date().toISOString()
      };
    }
  }

  private async checkSocketService(): Promise<ServiceStatus> {
    const startTime = Date.now();
    
    try {
      // This is a basic check - in a real implementation you'd check the Socket.IO server
      const responseTime = Date.now() - startTime;
      
      return {
        name: 'Real-time Communication',
        status: 'operational',
        responseTime,
        uptime: Date.now() - this.startTime,
        metrics: {
          connectedClients: 0 // Would get from Socket.IO server
        }
      };
    } catch (error) {
      return {
        name: 'Real-time Communication',
        status: 'degraded',
        responseTime: Date.now() - startTime,
        uptime: Date.now() - this.startTime,
        lastIncident: new Date().toISOString()
      };
    }
  }

  private async getSystemMetrics(): Promise<SystemMetrics> {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      memory: {
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal,
        percentage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
      },
      cpu: {
        usage: (cpuUsage.user + cpuUsage.system) / 1000000 // Convert to seconds
      },
      database: {
        connections: 0, // Would get from database
        queryTime: 0,   // Would calculate from metrics
        slowQueries: 0  // Would get from monitoring
      },
      api: {
        requestsPerMinute: 0,     // Would get from metrics
        averageResponseTime: 0,   // Would calculate from logs
        errorRate: 0              // Would calculate from error logs
      }
    };
  }

  private determineSystemStatus(services: ServiceStatus[], metrics: SystemMetrics): 'operational' | 'degraded' | 'maintenance' | 'outage' {
    const serviceStatuses = services.map(s => s.status);
    
    if (serviceStatuses.includes('outage')) {
      return 'outage';
    }
    
    if (serviceStatuses.includes('degraded')) {
      return 'degraded';
    }
    
    // Check system metrics for degradation
    if (metrics.memory.percentage > 90 || metrics.api.errorRate > 5) {
      return 'degraded';
    }
    
    return 'operational';
  }

  private parseRedisMemoryInfo(info: string): any {
    const lines = info.split('\r\n');
    const memoryInfo: any = {};
    
    lines.forEach(line => {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        if (key.includes('memory')) {
          memoryInfo[key] = value;
        }
      }
    });
    
    return memoryInfo;
  }

  private addAlert(type: 'warning' | 'error' | 'critical', message: string): void {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: new Date().toISOString(),
      resolved: false
    };
    
    this.alerts.push(alert);
    
    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-50);
    }
    
    logger.warn(`System alert: ${message}`, { alertId: alert.id, type });
  }

  private getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolved).slice(-10);
  }
}

const statusMonitor = StatusMonitor.getInstance();

async function GET(request: NextRequest) {
  // Check if user has admin permissions
  const authResult = await authMiddleware(request);
  if (!authResult.success || !authResult.user) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    }, { status: 401 });
  }

  // Check admin permissions (simplified - you'd check actual roles)
  if (authResult.user.role !== 'ADMIN') {
    return NextResponse.json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Admin access required'
      }
    }, { status: 403 });
  }

  const systemStatus = await statusMonitor.getSystemStatus();
  
  logger.info('System status checked', {
    status: systemStatus.status,
    userId: authResult.user.id,
    servicesCount: systemStatus.services.length,
    alertsCount: systemStatus.alerts.length
  });

  return NextResponse.json({
    success: true,
    data: systemStatus
  });
}

// Apply middleware
const handler = withErrorHandler(withRequestCorrelation(GET));
export { handler as GET };