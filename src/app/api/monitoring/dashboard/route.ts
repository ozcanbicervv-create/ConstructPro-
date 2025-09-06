import { NextRequest, NextResponse } from 'next/server';
import { resourceMonitor } from '@/lib/monitoring';
import { requestTracker } from '@/middleware/monitoring';

/**
 * Monitoring Dashboard API for ConstructPro
 * Provides comprehensive monitoring data for dashboards and alerts
 */

export async function GET(request: NextRequest) {
  try {
    // Collect current metrics
    const currentMetrics = resourceMonitor.collectMetrics();
    const healthSummary = resourceMonitor.getHealthSummary();
    const requestStats = requestTracker.getStats();
    const recentRequests = requestTracker.getRecentRequests(20);
    const metricsHistory = resourceMonitor.getMetricsHistory(50);

    // Calculate additional statistics
    const uptime = Math.round(process.uptime());
    const uptimeFormatted = formatUptime(uptime);

    // Memory trend analysis
    const memoryTrend = calculateTrend(
      metricsHistory.slice(-10).map(m => m.memory.percentage)
    );

    // CPU trend analysis
    const cpuTrend = calculateTrend(
      metricsHistory.slice(-10).map(m => m.cpu.usage)
    );

    // Response time trend
    const responseTimeTrend = calculateTrend(
      metricsHistory.slice(-10).map(m => m.responseTime).filter(rt => rt > 0)
    );

    const dashboardData = {
      timestamp: new Date().toISOString(),
      service: 'ConstructPro',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      
      // Overall health
      health: healthSummary,
      
      // Current metrics
      current: {
        uptime: {
          seconds: uptime,
          formatted: uptimeFormatted,
        },
        memory: {
          ...currentMetrics.memory,
          trend: memoryTrend,
        },
        cpu: {
          ...currentMetrics.cpu,
          trend: cpuTrend,
        },
        responseTime: {
          current: currentMetrics.responseTime,
          average: requestStats.averageResponseTime,
          trend: responseTimeTrend,
        },
      },

      // Request statistics
      requests: {
        ...requestStats,
        recent: recentRequests.map(req => ({
          method: req.method,
          url: req.url.length > 50 ? req.url.substring(0, 50) + '...' : req.url,
          statusCode: req.statusCode,
          responseTime: req.responseTime,
          timestamp: req.timestamp,
        })),
      },

      // Historical data for charts
      history: {
        memory: metricsHistory.map(m => ({
          timestamp: m.timestamp,
          percentage: m.memory.percentage,
          used: m.memory.used,
        })),
        cpu: metricsHistory.map(m => ({
          timestamp: m.timestamp,
          usage: m.cpu.usage,
          loadAverage: m.cpu.loadAverage[0],
        })),
        responseTime: metricsHistory
          .filter(m => m.responseTime > 0)
          .map(m => ({
            timestamp: m.timestamp,
            responseTime: m.responseTime,
          })),
      },

      // System information
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        memoryUsage: process.memoryUsage(),
      },

      // Alerts and warnings
      alerts: healthSummary.issues.map(issue => ({
        type: 'warning',
        message: issue,
        timestamp: new Date().toISOString(),
      })),
    };

    return NextResponse.json(dashboardData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Dashboard data collection failed:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to collect dashboard data',
        timestamp: new Date().toISOString(),
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Format uptime in human-readable format
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Calculate trend direction for a series of values
 */
function calculateTrend(values: number[]): 'up' | 'down' | 'stable' {
  if (values.length < 2) return 'stable';
  
  const first = values[0];
  const last = values[values.length - 1];
  const threshold = 5; // 5% threshold for considering stable
  
  const percentChange = ((last - first) / first) * 100;
  
  if (percentChange > threshold) return 'up';
  if (percentChange < -threshold) return 'down';
  return 'stable';
}

// Support OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}