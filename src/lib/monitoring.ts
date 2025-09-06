/**
 * ConstructPro Monitoring and Alerting System
 * Provides resource monitoring, alerting, and performance tracking
 */

export interface ResourceThresholds {
  memory: {
    warning: number; // percentage
    critical: number; // percentage
  };
  cpu: {
    warning: number; // percentage
    critical: number; // percentage
  };
  responseTime: {
    warning: number; // milliseconds
    critical: number; // milliseconds
  };
  diskSpace: {
    warning: number; // percentage
    critical: number; // percentage
  };
}

export interface AlertConfig {
  enabled: boolean;
  channels: {
    console: boolean;
    webhook?: string;
    email?: string;
  };
  cooldown: number; // minutes between same alerts
}

export interface MonitoringMetrics {
  timestamp: Date;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  responseTime: number;
  activeConnections: number;
  errors: {
    count: number;
    rate: number; // errors per minute
  };
}

class ResourceMonitor {
  private static instance: ResourceMonitor;
  private metrics: MonitoringMetrics[] = [];
  private alerts: Map<string, Date> = new Map();
  private thresholds: ResourceThresholds;
  private alertConfig: AlertConfig;

  constructor() {
    this.thresholds = {
      memory: { warning: 75, critical: 90 },
      cpu: { warning: 70, critical: 85 },
      responseTime: { warning: 2000, critical: 5000 },
      diskSpace: { warning: 80, critical: 95 },
    };

    this.alertConfig = {
      enabled: process.env.NODE_ENV === 'production',
      channels: {
        console: true,
        webhook: process.env.MONITORING_WEBHOOK_URL,
      },
      cooldown: 5, // 5 minutes
    };
  }

  static getInstance(): ResourceMonitor {
    if (!ResourceMonitor.instance) {
      ResourceMonitor.instance = new ResourceMonitor();
    }
    return ResourceMonitor.instance;
  }

  /**
   * Collect current system metrics
   */
  collectMetrics(): MonitoringMetrics {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    const metrics: MonitoringMetrics = {
      timestamp: new Date(),
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024),
        total: Math.round(memUsage.heapTotal / 1024 / 1024),
        percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
      },
      cpu: {
        usage: Math.round(((cpuUsage.user + cpuUsage.system) / 1000000) * 100) / 100,
        loadAverage: process.platform !== 'win32' ? require('os').loadavg() : [0, 0, 0],
      },
      responseTime: 0, // Will be set by request handlers
      activeConnections: 0, // Will be tracked by Socket.IO
      errors: {
        count: 0, // Will be tracked by error handlers
        rate: 0,
      },
    };

    // Store metrics (keep last 100 entries)
    this.metrics.push(metrics);
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }

    // Check thresholds and trigger alerts
    this.checkThresholds(metrics);

    return metrics;
  }

  /**
   * Check if metrics exceed thresholds and trigger alerts
   */
  private checkThresholds(metrics: MonitoringMetrics): void {
    if (!this.alertConfig.enabled) return;

    // Memory check
    if (metrics.memory.percentage >= this.thresholds.memory.critical) {
      this.triggerAlert('memory_critical', `Memory usage critical: ${metrics.memory.percentage}%`);
    } else if (metrics.memory.percentage >= this.thresholds.memory.warning) {
      this.triggerAlert('memory_warning', `Memory usage high: ${metrics.memory.percentage}%`);
    }

    // CPU check
    if (metrics.cpu.usage >= this.thresholds.cpu.critical) {
      this.triggerAlert('cpu_critical', `CPU usage critical: ${metrics.cpu.usage}%`);
    } else if (metrics.cpu.usage >= this.thresholds.cpu.warning) {
      this.triggerAlert('cpu_warning', `CPU usage high: ${metrics.cpu.usage}%`);
    }

    // Response time check
    if (metrics.responseTime >= this.thresholds.responseTime.critical) {
      this.triggerAlert('response_critical', `Response time critical: ${metrics.responseTime}ms`);
    } else if (metrics.responseTime >= this.thresholds.responseTime.warning) {
      this.triggerAlert('response_warning', `Response time high: ${metrics.responseTime}ms`);
    }
  }

  /**
   * Trigger an alert with cooldown protection
   */
  private triggerAlert(alertType: string, message: string): void {
    const now = new Date();
    const lastAlert = this.alerts.get(alertType);
    
    // Check cooldown period
    if (lastAlert) {
      const cooldownMs = this.alertConfig.cooldown * 60 * 1000;
      if (now.getTime() - lastAlert.getTime() < cooldownMs) {
        return; // Still in cooldown
      }
    }

    // Update last alert time
    this.alerts.set(alertType, now);

    // Send alert through configured channels
    this.sendAlert(alertType, message);
  }

  /**
   * Send alert through configured channels
   */
  private async sendAlert(alertType: string, message: string): Promise<void> {
    const alertData = {
      type: alertType,
      message,
      timestamp: new Date().toISOString(),
      service: 'ConstructPro',
      environment: process.env.NODE_ENV,
      metrics: this.getLatestMetrics(),
    };

    // Console logging
    if (this.alertConfig.channels.console) {
      console.warn(`🚨 ALERT [${alertType}]: ${message}`);
    }

    // Webhook notification
    if (this.alertConfig.channels.webhook) {
      try {
        const response = await fetch(this.alertConfig.channels.webhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(alertData),
        });

        if (!response.ok) {
          console.error('Failed to send webhook alert:', response.statusText);
        }
      } catch (error) {
        console.error('Webhook alert error:', error);
      }
    }
  }

  /**
   * Get latest metrics
   */
  getLatestMetrics(): MonitoringMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  /**
   * Get metrics history
   */
  getMetricsHistory(limit: number = 50): MonitoringMetrics[] {
    return this.metrics.slice(-limit);
  }

  /**
   * Update response time for current request
   */
  recordResponseTime(responseTime: number): void {
    const latest = this.getLatestMetrics();
    if (latest) {
      latest.responseTime = responseTime;
    }
  }

  /**
   * Record error occurrence
   */
  recordError(): void {
    const latest = this.getLatestMetrics();
    if (latest) {
      latest.errors.count++;
      // Calculate error rate (errors per minute)
      const oneMinuteAgo = new Date(Date.now() - 60000);
      const recentMetrics = this.metrics.filter(m => m.timestamp > oneMinuteAgo);
      const totalErrors = recentMetrics.reduce((sum, m) => sum + m.errors.count, 0);
      latest.errors.rate = totalErrors;
    }
  }

  /**
   * Get system health summary
   */
  getHealthSummary(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    metrics: MonitoringMetrics | null;
  } {
    const latest = this.getLatestMetrics();
    if (!latest) {
      return { status: 'critical', issues: ['No metrics available'], metrics: null };
    }

    const issues: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Check memory
    if (latest.memory.percentage >= this.thresholds.memory.critical) {
      status = 'critical';
      issues.push(`Critical memory usage: ${latest.memory.percentage}%`);
    } else if (latest.memory.percentage >= this.thresholds.memory.warning) {
      if (status !== 'critical') status = 'warning';
      issues.push(`High memory usage: ${latest.memory.percentage}%`);
    }

    // Check CPU
    if (latest.cpu.usage >= this.thresholds.cpu.critical) {
      status = 'critical';
      issues.push(`Critical CPU usage: ${latest.cpu.usage}%`);
    } else if (latest.cpu.usage >= this.thresholds.cpu.warning) {
      if (status !== 'critical') status = 'warning';
      issues.push(`High CPU usage: ${latest.cpu.usage}%`);
    }

    // Check response time
    if (latest.responseTime >= this.thresholds.responseTime.critical) {
      status = 'critical';
      issues.push(`Critical response time: ${latest.responseTime}ms`);
    } else if (latest.responseTime >= this.thresholds.responseTime.warning) {
      if (status !== 'critical') status = 'warning';
      issues.push(`High response time: ${latest.responseTime}ms`);
    }

    return { status, issues, metrics: latest };
  }
}

// Export singleton instance
export const resourceMonitor = ResourceMonitor.getInstance();

// Auto-start metrics collection in production
if (process.env.NODE_ENV === 'production') {
  // Collect metrics every 30 seconds
  setInterval(() => {
    resourceMonitor.collectMetrics();
  }, 30000);

  console.log('📊 Resource monitoring started for ConstructPro');
}