# Material Comparison and Supplier Management API

This document describes the material comparison and supplier management endpoints implemented as part of the database API implementation.

## Overview

The material comparison and supplier management system provides comprehensive functionality for:
- Comparing materials from different suppliers with pricing analysis
- Managing supplier information with performance tracking
- Creating and tracking material orders
- Cost estimation and budget variance analysis

## API Endpoints

### Material Comparison

#### POST /api/materials/compare
Compare materials from different suppliers with pricing analysis algorithms.

**Request Body:**
```json
{
  "materialName": "Concrete Mix",
  "category": "cement",
  "quantity": 15,
  "unit": "cubic meter",
  "specifications": {
    "strength": "30MPa",
    "type": "ready-mix"
  },
  "supplierIds": ["supplier-1", "supplier-2"] // Optional: specific suppliers
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "searchCriteria": {
      "materialName": "Concrete Mix",
      "category": "cement",
      "quantity": 15,
      "unit": "cubic meter"
    },
    "totalSuppliersFound": 3,
    "bestValue": {
      "supplier": {
        "id": "supplier-1",
        "name": "Best Concrete Co",
        "rating": 4.5,
        "contactInfo": {...}
      },
      "pricing": {
        "averageUnitPrice": 150,
        "estimatedTotalCost": 2250,
        "priceRange": {
          "min": 140,
          "max": 180
        },
        "availableMaterials": 5
      },
      "performance": {
        "qualityRating": 4.5,
        "deliveryReliability": 0.95,
        "responseTime": "24h"
      },
      "recommendations": {
        "costEffective": true,
        "qualityAssured": true,
        "reliable": true
      }
    },
    "allSuppliers": [...],
    "marketAnalysis": {
      "averageMarketPrice": 165,
      "priceVariance": 15.2,
      "recommendedBudget": 2475
    }
  }
}
```

### Supplier Management

#### GET /api/materials/suppliers
Get suppliers with rating system and performance metrics.

**Query Parameters:**
- `search` (string): Search by supplier name
- `minRating` (number): Minimum rating filter
- `category` (string): Filter by material category
- `location` (string): Filter by location
- `page` (number): Page number for pagination
- `limit` (number): Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "supplier-1",
      "name": "Premium Materials Ltd",
      "contactInfo": {
        "email": "contact@premium.com",
        "phone": "+1-555-0123",
        "address": "123 Industrial Ave"
      },
      "rating": 4.2,
      "performance": {
        "deliveryRate": 95,
        "cancellationRate": 2,
        "totalOrders": 150,
        "averageOrderValue": 5000,
        "recentActivity": [...]
      },
      "capabilities": {
        "materialCount": 45,
        "categories": ["cement", "steel", "wood"],
        "priceRange": {
          "min": 50,
          "max": 2000
        }
      },
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-20T15:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### GET /api/materials/suppliers/:id/performance
Get detailed performance metrics for a specific supplier.

**Response:**
```json
{
  "success": true,
  "data": {
    "supplier": {
      "id": "supplier-1",
      "name": "Premium Materials Ltd",
      "rating": 4.2,
      "totalMaterials": 45
    },
    "performance": {
      "totalOrders": 150,
      "deliveryRate": 95,
      "averageDeliveryTime": 3.2,
      "qualityScore": 4.2,
      "onTimeDeliveryRate": 92,
      "cancellationRate": 2,
      "totalOrderValue": 750000
    },
    "trends": {
      "monthlyOrders": [
        {
          "month": "2024-01",
          "orderCount": 12,
          "totalValue": 60000
        }
      ],
      "qualityTrend": "improving",
      "deliveryTrend": "stable"
    },
    "recentOrders": [...]
  }
}
```

### Material Orders

#### POST /api/materials/orders
Create a new material order with tracking.

**Request Body:**
```json
{
  "materialId": "material-123",
  "supplierId": "supplier-456",
  "quantity": 50,
  "unitPrice": 25.50,
  "expectedDeliveryDate": "2024-02-15T00:00:00Z",
  "notes": "Urgent delivery required"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "order-789",
    "materialId": "material-123",
    "supplierId": "supplier-456",
    "quantity": 50,
    "unitPrice": 25.50,
    "totalCost": 1275,
    "status": "PENDING",
    "orderDate": "2024-01-20T10:00:00Z",
    "material": {...},
    "supplier": {...}
  }
}
```

#### GET /api/materials/orders
Get material orders with filtering and pagination.

**Query Parameters:**
- `status` (enum): Filter by order status (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
- `supplierId` (string): Filter by supplier
- `materialId` (string): Filter by material
- `projectId` (string): Filter by project
- `search` (string): Search in material or supplier names
- `dateFrom` (string): Filter orders from date
- `dateTo` (string): Filter orders to date
- `page` (number): Page number
- `limit` (number): Items per page

#### GET /api/materials/orders/:id
Get specific order details.

#### PATCH /api/materials/orders/:id
Update order status, quantity, or pricing.

**Request Body:**
```json
{
  "status": "CONFIRMED",
  "quantity": 55,
  "unitPrice": 24.00,
  "actualDeliveryDate": "2024-02-14T14:30:00Z",
  "notes": "Delivered early"
}
```

#### DELETE /api/materials/orders/:id
Cancel an order (only if not delivered).

### Cost Estimation

#### GET /api/materials/cost-estimation
Calculate material cost estimation with budget tracking and variance analysis.

**Query Parameters:**
- `projectId` (string, required): Project ID for cost estimation

**Response:**
```json
{
  "success": true,
  "data": {
    "projectId": "project-123",
    "budget": {
      "allocated": 100000,
      "estimated": 95000,
      "ordered": 75000,
      "remaining": 25000,
      "variance": -5.0,
      "utilizationRate": 75.0
    },
    "materials": {
      "total": 25,
      "estimated": 95000,
      "ordered": 75000,
      "pending": 20000
    },
    "categoryBreakdown": {
      "cement": {
        "estimatedCost": 30000,
        "orderedCost": 25000,
        "materialCount": 8
      },
      "steel": {
        "estimatedCost": 45000,
        "orderedCost": 35000,
        "materialCount": 12
      },
      "wood": {
        "estimatedCost": 20000,
        "orderedCost": 15000,
        "materialCount": 5
      }
    },
    "recommendations": {
      "overBudget": false,
      "needsReview": false,
      "onTrack": true,
      "underBudget": true
    }
  }
}
```

## Features Implemented

### 1. Material Comparison with Pricing Analysis
- **Smart Material Matching**: Finds similar materials across suppliers based on name, category, and specifications
- **Pricing Analysis**: Calculates average prices, price ranges, and estimated costs for requested quantities
- **Supplier Ranking**: Ranks suppliers by combination of price competitiveness and quality ratings
- **Market Analysis**: Provides market insights including price variance and recommended budget
- **Specification Matching**: Considers material specifications for more accurate comparisons

### 2. Supplier Rating and Performance System
- **Comprehensive Metrics**: Tracks delivery rate, cancellation rate, order volume, and average order value
- **Quality Ratings**: Maintains supplier quality scores based on historical performance
- **Performance Trends**: Analyzes monthly order patterns and performance trends over time
- **Capability Assessment**: Tracks supplier material categories, count, and price ranges
- **Recent Activity**: Shows recent order history and current performance status

### 3. Material Order Tracking
- **Order Lifecycle Management**: Tracks orders from creation through delivery
- **Status Updates**: Supports status transitions (PENDING → CONFIRMED → SHIPPED → DELIVERED)
- **Cost Calculations**: Automatically calculates total costs and handles price updates
- **Access Control**: Ensures users can only access orders for projects they have permissions for
- **Order Validation**: Prevents invalid operations like cancelling delivered orders

### 4. Supplier Performance Tracking
- **Delivery Metrics**: Tracks on-time delivery rates and average delivery times
- **Quality Monitoring**: Monitors quality scores and trends over time
- **Order Analytics**: Provides detailed order history and performance analytics
- **Trend Analysis**: Identifies improving, stable, or declining performance patterns
- **Monthly Reporting**: Generates monthly order and performance reports

### 5. Cost Estimation and Budget Tracking
- **Budget Variance Analysis**: Compares estimated costs against allocated budgets
- **Category Breakdown**: Provides detailed cost analysis by material category
- **Utilization Tracking**: Monitors budget utilization rates and remaining funds
- **Variance Recommendations**: Provides recommendations based on budget status
- **Real-time Updates**: Updates cost estimates as orders are placed and materials are added

## Security and Access Control

All endpoints implement:
- **Authentication**: Requires valid JWT tokens
- **Authorization**: Project-based access control
- **Input Validation**: Comprehensive request validation using Zod schemas
- **Error Handling**: Consistent error responses with appropriate HTTP status codes
- **Rate Limiting**: Protection against abuse (configured at middleware level)

## Error Handling

The API provides consistent error responses:

```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Invalid request data",
  "details": {...}
}
```

Common error codes:
- `VALIDATION_ERROR`: Invalid input data
- `INSUFFICIENT_PERMISSIONS`: Access denied
- `PROJECT_NOT_FOUND`: Resource not found
- `MATERIAL_NOT_FOUND`: Material not found
- `SUPPLIER_NOT_FOUND`: Supplier not found

## Performance Considerations

- **Database Indexing**: Optimized queries with proper indexing on frequently searched fields
- **Pagination**: All list endpoints support pagination to handle large datasets
- **Caching**: Redis caching for frequently accessed supplier and material data
- **Query Optimization**: Efficient database queries with selective field loading
- **Connection Pooling**: PostgreSQL connection pooling for scalability

## Integration Points

The material comparison and supplier management system integrates with:
- **Project Management**: Links materials and orders to specific projects
- **User Management**: Enforces user permissions and access control
- **Notification System**: Can trigger notifications for order status changes
- **Reporting System**: Provides data for project cost reports and analytics
- **Audit Logging**: Tracks all material and order operations for compliance

This implementation provides a comprehensive foundation for material procurement and supplier management in construction projects, with robust pricing analysis, performance tracking, and budget management capabilities.