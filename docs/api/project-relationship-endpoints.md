# Project Relationship API Endpoints

This document describes the project relationship API endpoints that provide access to tasks, materials, documents, team members, and analytics for specific projects.

## Authentication

All endpoints require authentication. Include the session token in your requests.

## Base URL

```
/api/projects/:id
```

## Endpoints

### 1. GET /api/projects/:id/tasks

Get all tasks for a specific project with filtering options.

#### Parameters

- `id` (path): Project ID

#### Query Parameters

- `status` (optional): Filter by task status (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `COMPLETED`, `BLOCKED`)
- `priority` (optional): Filter by task priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`)
- `assignedTo` (optional): Filter by assigned user ID
- `search` (optional): Search in task title and description
- `dueDateFrom` (optional): Filter tasks due after this date (ISO string)
- `dueDateTo` (optional): Filter tasks due before this date (ISO string)
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of results per page (default: 10, max: 100)

#### Response

```json
{
  "data": [
    {
      "id": "task-id",
      "title": "Task Title",
      "description": "Task description",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "dueDate": "2024-12-31T23:59:59.000Z",
      "estimatedHours": 8.5,
      "actualHours": 4.0,
      "assignee": {
        "id": "user-id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "creator": {
        "id": "creator-id",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "comments": [
        {
          "id": "comment-id",
          "content": "Latest comment",
          "createdAt": "2024-01-15T10:00:00.000Z",
          "user": {
            "id": "user-id",
            "name": "John Doe"
          }
        }
      ],
      "attachments": [
        {
          "id": "attachment-id",
          "name": "document.pdf",
          "fileSize": 1024000,
          "mimeType": "application/pdf"
        }
      ],
      "_count": {
        "comments": 5,
        "attachments": 2
      }
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

### 2. GET /api/projects/:id/materials

Get all materials for a specific project with tracking information.

#### Parameters

- `id` (path): Project ID

#### Query Parameters

- `category` (optional): Filter by material category
- `supplierId` (optional): Filter by supplier ID
- `search` (optional): Search in material name and description
- `minCost` (optional): Minimum total cost filter
- `maxCost` (optional): Maximum total cost filter
- `minQuantity` (optional): Minimum quantity filter
- `maxQuantity` (optional): Maximum quantity filter
- `page` (optional): Page number for pagination
- `limit` (optional): Number of results per page

#### Response

```json
{
  "data": [
    {
      "id": "material-id",
      "name": "Steel Beams",
      "description": "Structural steel beams",
      "category": "steel",
      "unit": "tons",
      "quantity": 10.5,
      "unitPrice": 1200.00,
      "totalCost": 12600.00,
      "supplier": {
        "id": "supplier-id",
        "name": "Steel Corp",
        "rating": 4.5
      },
      "orders": [
        {
          "id": "order-id",
          "quantity": 5.0,
          "status": "DELIVERED",
          "orderDate": "2024-01-10T00:00:00.000Z"
        }
      ],
      "_count": {
        "orders": 2
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  },
  "stats": {
    "totalMaterials": 15,
    "totalValue": 125000.00,
    "categories": [
      {
        "category": "steel",
        "_count": { "category": 5 },
        "_sum": { "totalCost": 50000.00 }
      }
    ],
    "suppliers": [
      {
        "supplierId": "supplier-id",
        "_count": { "supplierId": 3 },
        "_sum": { "totalCost": 30000.00 }
      }
    ]
  }
}
```

### 3. GET /api/projects/:id/documents

Get all documents for a specific project with management features.

#### Parameters

- `id` (path): Project ID

#### Query Parameters

- `type` (optional): Filter by document type (`BLUEPRINT`, `SPECIFICATION`, `CONTRACT`, `PHOTO`, `REPORT`, `OTHER`)
- `search` (optional): Search in document name and description
- `mimeType` (optional): Filter by MIME type (partial match)
- `uploadedBy` (optional): Filter by uploader user ID
- `minSize` (optional): Minimum file size in bytes
- `maxSize` (optional): Maximum file size in bytes
- `dateFrom` (optional): Filter documents uploaded after this date
- `dateTo` (optional): Filter documents uploaded before this date
- `page` (optional): Page number for pagination
- `limit` (optional): Number of results per page

#### Response

```json
{
  "data": [
    {
      "id": "document-id",
      "name": "Blueprint_v2.pdf",
      "description": "Updated building blueprint",
      "filePath": "/uploads/documents/blueprint_v2.pdf",
      "fileSize": 2048000,
      "mimeType": "application/pdf",
      "type": "BLUEPRINT",
      "version": "2.0",
      "uploadedBy": "user-id",
      "uploader": {
        "id": "user-id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 8,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "stats": {
    "totalDocuments": 8,
    "totalSize": 15728640,
    "typeBreakdown": [
      {
        "type": "BLUEPRINT",
        "_count": { "type": 3 },
        "_sum": { "fileSize": 6144000 }
      }
    ],
    "mimeTypeBreakdown": [
      {
        "mimeType": "application/pdf",
        "_count": { "mimeType": 5 }
      }
    ],
    "recentUploads": 2
  }
}
```

### 4. GET /api/projects/:id/team

Get all team members for a specific project with role management.

#### Parameters

- `id` (path): Project ID

#### Query Parameters

- `role` (optional): Filter by project role (`OWNER`, `MANAGER`, `SUPERVISOR`, `MEMBER`, `VIEWER`)
- `userRole` (optional): Filter by user role (`ADMIN`, `PROJECT_MANAGER`, `SITE_SUPERVISOR`, `WORKER`, `CLIENT`, `SUPPLIER`)
- `search` (optional): Search in user name, email, or company
- `isActive` (optional): Filter by online status (`true`, `false`)
- `page` (optional): Page number for pagination
- `limit` (optional): Number of results per page

#### Response

```json
{
  "data": [
    {
      "id": "member-id",
      "role": "MANAGER",
      "joinedAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "user-id",
        "name": "John Doe",
        "email": "john@example.com",
        "title": "Site Manager",
        "company": "Construction Co",
        "role": "SITE_SUPERVISOR",
        "isOnline": true,
        "lastActive": "2024-01-15T14:30:00.000Z"
      },
      "stats": {
        "totalTasks": 12,
        "completedTasks": 8,
        "inProgressTasks": 3,
        "todoTasks": 1,
        "blockedTasks": 0,
        "completionRate": 66.67,
        "workload": 4
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 6,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "projectManager": {
    "id": "manager-id",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "title": "Project Manager",
    "role": "PROJECT_MANAGER",
    "isOnline": false
  },
  "stats": {
    "totalMembers": 7,
    "activeMembers": 4,
    "roleBreakdown": [
      {
        "role": "MANAGER",
        "_count": { "role": 2 }
      }
    ],
    "averageCompletionRate": 72.5,
    "totalTasksAssigned": 45
  }
}
```

### 5. GET /api/projects/:id/stats

Get comprehensive analytics and statistics for a specific project.

#### Parameters

- `id` (path): Project ID

#### Response

```json
{
  "project": {
    "id": "project-id",
    "name": "Office Building Construction",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.000Z",
    "budget": 1000000.00
  },
  "timeline": {
    "totalDuration": 365,
    "elapsedDays": 45,
    "remainingDays": 320,
    "timeProgress": 12.33,
    "isOverdue": false,
    "daysOverdue": 0
  },
  "tasks": {
    "total": 50,
    "completed": 15,
    "progress": 30.0,
    "overdue": 3,
    "upcoming": 8,
    "statusBreakdown": [
      {
        "status": "COMPLETED",
        "_count": { "status": 15 }
      },
      {
        "status": "IN_PROGRESS",
        "_count": { "status": 12 }
      }
    ],
    "priorityBreakdown": [
      {
        "priority": "HIGH",
        "_count": { "priority": 10 }
      }
    ]
  },
  "materials": {
    "total": 25,
    "totalValue": 450000.00,
    "categoryBreakdown": [
      {
        "category": "steel",
        "_count": { "category": 5 },
        "_sum": { "totalCost": 200000.00 }
      }
    ]
  },
  "budget": {
    "total": 1000000.00,
    "spent": 450000.00,
    "remaining": 550000.00,
    "progress": 45.0,
    "isOverBudget": false,
    "overBudgetAmount": 0
  },
  "documents": {
    "total": 15,
    "totalSize": 52428800,
    "typeBreakdown": [
      {
        "type": "BLUEPRINT",
        "_count": { "type": 5 }
      }
    ]
  },
  "team": {
    "total": 8,
    "roleBreakdown": [
      {
        "role": "MEMBER",
        "_count": { "role": 5 }
      }
    ]
  },
  "milestones": {
    "total": 6,
    "completed": 2,
    "overdue": 1,
    "progress": 33.33
  },
  "phases": {
    "statusBreakdown": [
      {
        "status": "IN_PROGRESS",
        "_count": { "status": 2 }
      }
    ]
  },
  "recentActivity": {
    "tasksCreated": 5,
    "tasksCompleted": 8,
    "documentsUploaded": 3,
    "materialsAdded": 2
  },
  "healthScore": 78
}
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "error": {
    "code": "PROJECT_NOT_FOUND",
    "message": "Project not found",
    "statusCode": 404,
    "timestamp": "2024-01-15T10:00:00.000Z"
  }
}
```

### Common Error Codes

- `UNAUTHORIZED` (401): Authentication required
- `INSUFFICIENT_PERMISSIONS` (403): User doesn't have access to the project
- `PROJECT_NOT_FOUND` (404): Project doesn't exist
- `VALIDATION_ERROR` (400): Invalid query parameters
- `INTERNAL_SERVER_ERROR` (500): Server error

## Access Control

Users can access project data if they are:
- The project manager
- A project team member
- An admin user

## Performance Notes

- All endpoints support pagination to handle large datasets
- Results are ordered by relevance (priority, date, etc.)
- Related data is included to minimize additional API calls
- Statistics are calculated efficiently using database aggregations