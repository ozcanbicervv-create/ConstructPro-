import { NextRequest, NextResponse } from 'next/server';

/**
 * System Metrics Endpoint for ConstructPro Monitoring
 * Provides detailed system metrics for monitoring dashboards
 */

interface SystemMetrics {
  timestamp: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
    rss: number;
    external: number;
    arrayBuffers: number;
  };
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  process: {
    pid: number;
    version: string;
    platform: string;
    arch: string;
  };
  environment: {
    nodeEnv: string;
    version: string;
  };
}

function getMemoryMetrics() {
  const memUsage = process.memoryUsage();
  return {
    used: Math.round(memUsage.heapUsed / 1024 / 1024),
    total: Math.round(memUsage.heapTotal / 1024 / 1024),
    percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
    rss: Math.round(memUsage.rss / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024),
    arrayBuffers: Math.round(memUsage.arrayBuffers / 1024 / 1024),
  };
}

function getCpuMetrics() {
  const cpuUsage = process.cpuUsage();
  const loadAverage = process.platform !== 'win32' ? require('os').loadavg() : [0, 0, 0];
  
  return {
    usage: Math.round(((cpuUsage.user + cpuUsage.system) / 1000000) * 100) / 100,
    loadAverage,
  };
}

export async function GET(request: NextRequest) {
  try {
    const metrics: SystemMetrics = {
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      memory: getMemoryMetrics(),
      cpu: getCpuMetrics(),
      process: {
        pid: process.pid,
        version: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
      },
    };

    return NextResponse.json(metrics, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Metrics collection failed:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to collect metrics',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
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