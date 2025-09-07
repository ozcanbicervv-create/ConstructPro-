# Material Management API Documentation

## Overview

The Material Management API provides endpoints for managing construction materials, including creation, retrieval, updates, and deletion with proper validation and access control.

## Base URL

```
/api/materials
```

## Authentication

All endpoints require authentication via session or JWT token.

## Endpoints

### 1. Create Material

**POST** `/api/materials`

Creates a new material for a project.

#### Request Body

```json
{
  "projectId": "string (required)",
  "name": "string (required, 1-200 chars)",
  "description": "string (optional)",
  "category": "string (optional)",
  "unit": "string (required, 1-50 chars)",
  "quantity": "number (required, >= 0)",
  "unitPrice": "number (required, >= 0)",
  "supplierId": "string (optional)",
  "specifications": {
    "key": "value"
  }
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "string",
    "projectId": "string",
    "name": "string",
    "description": "string",
    "category": "string",
    "unit": "string",
    "quantity": 100,
    "unitPrice": 25.50,
    "totalCost": 2550.00,
    "supplierId": "string",
    "specifications": {},
    "project": {},
    "supplier": {},
    "orders": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Material created successfully"
}
```

#### Status Codes

- `201` - Material created successfully
- `400` - Validation error
- `401` - Unauthorized
- `403` - Insufficient permissions
- `500` - Internal server error

---

### 2. Get Materials

**GET** `/api/materials`

Retrieves materials with filtering and pagination.

#### Query Parameters

- `category` (string, optional) - Filter by material category
- `supplierId` (string, optional) - Filter by supplier ID
- `search` (string, optional) - Search in name and description
- `minCost` (number, optional) - Minimum total cost filter
- `maxCost` (number, optional) - Maximum total cost filter
- `minQuantity` (number, optional) - Minimum quantity filter
- `maxQuantity` (number, optional) - Maximum quantity filter
- `page` (number, optional, default: 1) - Page number
- `limit` (number, optional, default: 10, max: 100) - Items per page

#### Example Request

```
GET /api/materials?category=cement&search=portland&page=1&limit=20
```

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "projectId": "string",
      "name": "string",
      "description": "string",
      "category": "string",
      "unit": "string",
      "quantity": 100,
      "unitPrice": 25.50,
      "totalCost": 2550.00,
      "supplierId": "string",
      "specifications": {},
      "project": {},
      "supplier": {},
      "orders": [],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Status Codes

- `200` - Success
- `400` - Invalid query parameters
- `401` - Unauthorized
- `500` - Internal server error

---

### 3. Get Material by ID

**GET** `/api/materials/:id`

Retrieves detailed information about a specific material.

#### Path Parameters

- `id` (string, required) - Material ID

#### Response

```json
{
  "success": true,
  "data": {
    "id": "string",
    "projectId": "string",
    "name": "string",
    "description": "string",
    "category": "string",
    "unit": "string",
    "quantity": 100,
    "unitPrice": 25.50,
    "totalCost": 2550.00,
    "supplierId": "string",
    "specifications": {},
    "project": {
      "id": "string",
      "name": "string",
      "status": "IN_PROGRESS"
    },
    "supplier": {
      "id": "string",
      "name": "string",
      "contactInfo": {},
      "rating": 4.5
    },
    "orders": [
      {
        "id": "string",
        "quantity": 50,
        "unitPrice": 25.50,
        "totalCost": 1275.00,
        "status": "DELIVERED",
        "orderDate": "2024-01-01T00:00:00.000Z",
        "supplier": {}
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Status Codes

- `200` - Success
- `401` - Unauthorized
- `403` - Insufficient permissions
- `404` - Material not found
- `500` - Internal server error

---

### 4. Update Material

**PATCH** `/api/materials/:id`

Updates an existing material with cost and quantity updates.

#### Path Parameters

- `id` (string, required) - Material ID

#### Request Body

```json
{
  "name": "string (optional, 1-200 chars)",
  "description": "string (optional)",
  "category": "string (optional)",
  "unit": "string (optional, 1-50 chars)",
  "quantity": "number (optional, >= 0)",
  "unitPrice": "number (optional, >= 0)",
  "supplierId": "string (optional)",
  "specifications": {
    "key": "value"
  }
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "string",
    "projectId": "string",
    "name": "string",
    "description": "string",
    "category": "string",
    "unit": "string",
    "quantity": 150,
    "unitPrice": 24.00,
    "totalCost": 3600.00,
    "supplierId": "string",
    "specifications": {},
    "project": {},
    "supplier": {},
    "orders": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Material updated successfully"
}
```

#### Status Codes

- `200` - Material updated successfully
- `400` - Validation error
- `401` - Unauthorized
- `403` - Insufficient permissions
- `404` - Material not found
- `500` - Internal server error

---

### 5. Delete Material

**DELETE** `/api/materials/:id`

Deletes a material with usage validation.

#### Path Parameters

- `id` (string, required) - Material ID

#### Response

```json
{
  "success": true,
  "message": "Material deleted successfully"
}
```

#### Status Codes

- `200` - Material deleted successfully
- `400` - Cannot delete material with existing orders
- `401` - Unauthorized
- `403` - Insufficient permissions
- `404` - Material not found
- `500` - Internal server error

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "statusCode": 400,
    "details": {},
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Error Codes

- `UNAUTHORIZED` - Authentication required
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `VALIDATION_ERROR` - Request validation failed
- `PROJECT_NOT_FOUND` - Material not found
- `INTERNAL_SERVER_ERROR` - Server error

## Business Rules

### Material Creation
- User must be project manager or team member
- Project must exist and be accessible
- Total cost is automatically calculated (quantity × unitPrice)

### Material Updates
- User must have access to the material's project
- Total cost is recalculated when quantity or unitPrice changes
- All fields are optional in updates

### Material Deletion
- User must have access to the material's project
- Cannot delete materials that have existing orders
- Deletion is permanent and cannot be undone

### Access Control
- Project managers have full access to project materials
- Team members have access based on project membership
- Materials are isolated by project - users can only access materials from their projects

## Usage Examples

### Create a Material

```javascript
const response = await fetch('/api/materials', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    projectId: 'proj_123',
    name: 'Portland Cement',
    description: 'High-grade cement for foundation work',
    category: 'cement',
    unit: 'bags',
    quantity: 100,
    unitPrice: 25.50,
    supplierId: 'supplier_456',
    specifications: {
      grade: 'OPC 53',
      brand: 'UltraTech'
    }
  })
});

const result = await response.json();
```

### Get Materials with Filters

```javascript
const params = new URLSearchParams({
  category: 'cement',
  search: 'portland',
  minCost: '1000',
  maxCost: '5000',
  page: '1',
  limit: '20'
});

const response = await fetch(`/api/materials?${params}`);
const result = await response.json();
```

### Update Material Quantity and Price

```javascript
const response = await fetch('/api/materials/mat_123', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    quantity: 150,
    unitPrice: 24.00
  })
});

const result = await response.json();
```