# Error Handling and Logging Implementation

## Overview

This document outlines the comprehensive error handling and logging system implemented for ConstructPro, providing centralized error management, structured logging, error notifications, and API monitoring capabilities.

## Components Implemented

### 1. Centralized Error Handling Middleware (`src/middleware/error-handler.middleware.ts`)

**Features:**
- Centralized error handling with consistent error responses
- Custom `AppError` class with severity levels and error codes
- Automatic error logging and notification processing
- Production-safe error message sanitization
- Request correlation ID support

**Error Codes:**
- Authentication errors (INVALID_CREDENTIALS, TOKEN_EXPIRED, etc.)
- Validation errors (VALIDATION_ERROR, DUPLICATE_ENTRY, etc.)
- Business logic errors (PROJECT_NOT_FOUND, TASK_ASSIGNMENT_FAILED, etc.)
- System errors (DATABASE_ERROR, FILE_UPLOAD_FAILED, etc.)

**Error Severity Levels:**
- LOW: Minor issues that don't affect functionality
- MEDIUM: Issues that may impact user experience
- HIGH: Serious issues that affect system functionality
- CRITICAL: System-threatening issues requiring immediate attention

### 2. Structured Logging System (`src/lib/logger.ts`)

**Features:**
- Winston-based logging with multiple transports
- Request correlation ID tracking
- Structured JSON logging for production
- Colorized console output for development
- Daily log rotation with compression
- Specialized logging methods for different event types

**Log Levels:**
- ERROR: System errors and exceptions
- WARN: Warning conditions
- INFO: General information
- HTTP: API request/response logging
- DEBUG: Detailed debugging information

**Specialized Logging Methods:**
- `logApiRequest()`: HTTP request/response logging
- `logAuthentication()`: Authentication events
- `logDatabaseOperation()`: Database operations
- `logBusinessEvent()`: Business logic events
- `logSecurityEvent()`: Security-related events
- `logPerformanceMetric()`: Performance metrics

### 3. Error Notification System (`src/services/error-notification.service.ts`)

**Features:**
- Intelligent error notification with configurable alert rules
- Multiple notification channels (in-app, email, webhooks)
- Alert cooldowns to prevent notification spam
- Error frequency tracking and pattern detection
- Automatic escalation for critical errors
- Webhook integration (Slack, Teams, etc.)

**Default Alert Rules:**
- Critical system errors (immediate notification)
- Database connection errors (3 failures in 5 minutes)
- Authentication failures (5 failures in 10 minutes)
- Rate limit exceeded (10 occurrences in 5 minutes)
- File upload failures (5 failures in 15 minutes)

**Alert Actions:**
- Notify administrators
- Escalate to higher-level support
- Auto-resolve after specified time
- Call external webhooks

### 4. API Monitoring Service (`src/services/api-monitoring.service.ts`)

**Features:**
- Real-time API performance monitoring
- Request/response time tracking
- Error rate calculation
- Health check system for dependencies
- Historical metrics storage in Redis
- Performance trend analysis

**Metrics Tracked:**
- Total requests, successful/failed counts
- Average, P95, P99 response times
- Error rates by endpoint and status code
- Requests per second (RPS)
- System resource usage (memory, CPU)

**Health Checks:**
- Database connectivity
- Redis cache availability
- File system accessibility
- External service status

### 5. Request Correlation Middleware (`src/middleware/correlation.middleware.ts`)

**Features:**
- Automatic request ID generation
- Request context tracking using AsyncLocalStorage
- Performance monitoring integration
- Response time measurement
- Request/response header management

### 6. Enhanced Health and Status Endpoints

**Health Endpoint (`/api/health`):**
- System health status (healthy/degraded/unhealthy)
- Individual service health checks
- System uptime and version information
- Performance metrics

**Status Endpoint (`/api/status`):**
- Detailed system status for administrators
- Service-specific metrics and alerts
- Historical performance data
- Active system alerts

**Monitoring Dashboard (`/api/admin/monitoring`):**
- Comprehensive monitoring data access
- Error statistics and trends
- Alert rule management
- Performance analytics

### 7. Comprehensive Test Suite

**Test Files:**
- `src/tests/error-handling.test.ts`: Error handler middleware tests
- `src/tests/logging.test.ts`: Logging system tests
- `src/tests/error-notification.test.ts`: Error notification service tests
- `src/tests/api-monitoring.test.ts`: API monitoring service tests
- `src/tests/error-monitoring-integration.test.ts`: End-to-end integration tests
- `src/tests/api-comprehensive.test.ts`: Comprehensive API endpoint tests

**Test Coverage:**
- Unit tests for all error handling components
- Integration tests for middleware chains
- Performance impact testing
- Memory leak prevention testing
- Error notification flow testing

## Usage Examples

### Basic Error Handling

```typescript
import { withErrorHandler, createError } from '@/middleware/error-handler.middleware';

async function handler(request: NextRequest) {
  if (!isValidInput(request)) {
    throw createError.validation('Invalid input data', { 
      field: 'email', 
      reason: 'Invalid format' 
    });
  }
  
  // Your logic here
  return NextResponse.json({ success: true });
}

export const POST = withErrorHandler(handler);
```

### Custom Logging

```typescript
import { logger } from '@/lib/logger';

// Log business events
logger.logBusinessEvent('project_created', 'project', {
  projectId: 'proj_123',
  userId: 'user_456',
  requestId: 'req_789'
});

// Log security events
logger.logSecurityEvent('unauthorized_access_attempt', 'high', {
  ip: '192.168.1.100',
  userAgent: 'suspicious-bot',
  requestId: 'req_security'
});
```

### Adding Custom Alert Rules

```typescript
import { errorNotificationService } from '@/services/error-notification.service';

const customRule = {
  name: 'High Memory Usage Alert',
  condition: {
    pattern: 'memory.*exceeded',
    frequency: { count: 3, timeWindow: 10 }
  },
  actions: {
    notify: true,
    escalate: true,
    webhook: 'https://hooks.slack.com/services/...'
  },
  recipients: ['devops', 'admin'],
  enabled: true
};

const ruleId = errorNotificationService.addAlertRule(customRule);
```

### Monitoring API Performance

```typescript
import { apiMonitoringService } from '@/services/api-monitoring.service';

// Get system metrics
const metrics = apiMonitoringService.getSystemMetrics();
console.log(`Current RPS: ${metrics.requests.rps}`);
console.log(`Error Rate: ${metrics.errors.rate}%`);

// Get slowest endpoints
const slowEndpoints = apiMonitoringService.getSlowestEndpoints(5);
slowEndpoints.forEach(endpoint => {
  console.log(`${endpoint.method} ${endpoint.endpoint}: ${endpoint.averageResponseTime}ms`);
});
```

## Configuration

### Environment Variables

```env
# Logging Configuration
LOG_LEVEL=info
NODE_ENV=production

# Notification Webhooks
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/...

# Redis Configuration (for metrics storage)
REDIS_URL=redis://localhost:6379
```

### Log File Structure

```
logs/
├── error-2024-01-15.log      # Error logs
├── combined-2024-01-15.log   # All logs
├── access-2024-01-15.log     # HTTP access logs
└── archived/                 # Compressed old logs
```

## Performance Considerations

### Memory Management
- Response time history limited to 1000 entries per endpoint
- Error history limited to 100 entries per error code
- Automatic cleanup of old metrics every hour
- Request count cleanup for RPS calculation

### Caching Strategy
- System metrics cached in Redis for 24 hours
- Health check results cached for 30 seconds
- Alert cooldowns prevent notification spam

### Async Processing
- Error notifications processed asynchronously
- Webhook calls don't block request processing
- Database operations use connection pooling

## Security Features

### Error Message Sanitization
- Internal error details hidden in production
- Stack traces only shown in development
- Sensitive data filtered from logs

### Access Control
- Admin-only access to monitoring endpoints
- Role-based alert rule management
- Audit logging for configuration changes

## Monitoring and Alerting

### Default Monitoring
- Automatic slow request detection (>2 seconds)
- High error rate alerts (>10% with >10 requests)
- Memory usage monitoring
- Database connection monitoring

### Custom Metrics
- Business-specific KPIs
- User behavior tracking
- Performance benchmarks
- SLA compliance monitoring

## Integration Points

### Middleware Chain
```
Request → Correlation → Authentication → Rate Limiting → Error Handler → Response
```

### Service Dependencies
- Database (PostgreSQL) for user data
- Redis for caching and metrics storage
- File system for log storage
- External webhooks for notifications

## Troubleshooting

### Common Issues
1. **High Memory Usage**: Check response time history limits
2. **Missing Notifications**: Verify webhook URLs and network connectivity
3. **Slow Performance**: Review database query performance and caching
4. **Log File Growth**: Ensure log rotation is working properly

### Debug Commands
```bash
# View recent errors
tail -f logs/error-$(date +%Y-%m-%d).log

# Check system metrics
curl http://localhost:3000/api/health

# View monitoring dashboard
curl -H "Authorization: Bearer admin-token" http://localhost:3000/api/admin/monitoring
```

## Future Enhancements

### Planned Features
- Machine learning-based anomaly detection
- Distributed tracing integration
- Custom dashboard UI
- Mobile app notifications
- Integration with external monitoring tools (DataDog, New Relic)

### Scalability Improvements
- Horizontal scaling support
- Load balancer health checks
- Multi-region deployment support
- Event streaming for real-time analytics

This comprehensive error handling and logging system provides ConstructPro with enterprise-grade reliability, observability, and maintainability, ensuring smooth operations and quick issue resolution.