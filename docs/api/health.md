# Health API

The Health API provides endpoints for monitoring the application's health and status.

## Endpoints

### GET /api/health

Returns the overall health status of the application.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "uptime": 3600,
    "version": "0.1.0",
    "environment": "production",
    "services": {
      "database": "healthy",
      "redis": "healthy",
      "external_apis": "healthy"
    }
  }
}
```

**Status Codes:**
- `200` - Application is healthy
- `503` - Application is unhealthy

### GET /api/health/detailed

Returns detailed health information including performance metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "uptime": 3600,
    "version": "0.1.0",
    "environment": "production",
    "services": {
      "database": {
        "status": "healthy",
        "responseTime": 15,
        "connections": {
          "active": 5,
          "idle": 10,
          "total": 15
        }
      },
      "memory": {
        "used": 256,
        "total": 512,
        "percentage": 50
      },
      "cpu": {
        "usage": 25.5
      }
    }
  }
}
```