// server.ts - Next.js Standalone + Socket.IO
import { setupSocket } from './src/utils/socket';
import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';
import { performanceMonitor, createResponseTimeTracker } from './src/lib/performance';
import { redis, redisSession } from './src/lib/redis';
import { applyDatabaseIndexes, optimizedPrisma } from './src/lib/database-optimization';
import compression from 'compression';
import responseTime from 'response-time';

const dev = process.env.NODE_ENV !== 'production';
const currentPort = 3001;
const hostname = '0.0.0.0';

// Custom server with Socket.IO integration
async function createCustomServer() {
  try {
    // Initialize performance monitoring
    console.log('🚀 Initializing ConstructPro server...');
    
    // Test Redis connections
    try {
      await redis.ping();
      console.log('✅ Redis cache connection established');
    } catch (error) {
      console.warn('⚠️ Redis cache connection failed:', error);
    }

    try {
      await redisSession.ping();
      console.log('✅ Redis session store connection established');
    } catch (error) {
      console.warn('⚠️ Redis session store connection failed:', error);
    }

    // Test database connection and apply indexes
    try {
      const isHealthy = await optimizedPrisma.healthCheck();
      if (isHealthy) {
        console.log('✅ Database connection established');
        await applyDatabaseIndexes(optimizedPrisma);
      } else {
        console.warn('⚠️ Database health check failed');
      }
    } catch (error) {
      console.warn('⚠️ Database connection failed:', error);
    }

    // Create Next.js app
    const nextApp = next({ 
      dev,
      dir: process.cwd(),
      // In production, use the current directory where .next is located
      conf: dev ? undefined : { distDir: './.next' }
    });

    await nextApp.prepare();
    const handle = nextApp.getRequestHandler();

    // Create HTTP server that will handle both Next.js and Socket.IO
    const server = createServer((req, res) => {
      // Skip socket.io requests from Next.js handler
      if (req.url?.startsWith('/api/socketio')) {
        return;
      }
      
      // Apply performance monitoring middleware
      const startTime = Date.now();
      
      // Track response time (only if available)
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        const route = req.url || 'unknown';
        if (performanceMonitor && performanceMonitor.trackHttpRequest) {
          performanceMonitor.trackHttpRequest(
            req.method || 'GET',
            route,
            res.statusCode || 200,
            duration
          );
        }
      });
      
      handle(req, res);
    });

    // Setup Socket.IO
    const io = new Server(server, {
      path: '/api/socketio',
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    setupSocket(io);

    // Start the server
    server.listen(currentPort, hostname, () => {
      console.log(`✅ ConstructPro server ready on http://${hostname}:${currentPort}`);
      console.log(`✅ Socket.IO server running at ws://${hostname}:${currentPort}/api/socketio`);
      console.log(`📊 Performance monitoring enabled`);
      console.log(`🗄️ Cache and session management active`);
      
      // Log initial performance metrics (only if available)
      if (performanceMonitor) {
        performanceMonitor.getPerformanceSummary().then(summary => {
          console.log('📈 Initial performance metrics:', {
            requestCount: summary.requestCount,
            errorRate: summary.errorRate,
            memoryUsage: `${(summary.systemMetrics.memoryUsage * 100).toFixed(2)}%`,
          });
        }).catch(error => {
          console.warn('Failed to get performance summary:', error);
        });
      }
    });

  } catch (err) {
    console.error('Server startup error:', err);
    process.exit(1);
  }
}

// Start the server
createCustomServer();
