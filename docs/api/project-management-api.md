# Project Management API Documentation

## Overview

This document describes the Project Management API endpoints implemented for ConstructPro. These endpoints provide comprehensive project management functionality including CRUD operations, filtering, pagination, and related data access.

## Authentication

All endpoints require authentication via NextAuth.js session. Users must be logged in to access any project management functionality.

## Authorization

- **Project Creation**: Requires `ADMIN` or `PROJECT_MANAGER` role
- **Project Access**: Users can only access projects where they are:
  - The project manager
  - A project member
  - An admin (can access all projects)

## Base URL

All endpoints are prefixed with `/api/projects`

## Endpoints

### 1. Create Project

**POST** `/api/projects`

Creates a new project with the authenticated user as the manager.

#### Request Body

```json
{
  "name": "string (3-100 chars, required)",
  "description": "string (optional)",
  "startDate": "ISO 8601 datetime (required)",
  "endDate": "ISO 8601 datetime (required, must be after startDate)",
  "budget": "number (optional, >= 0)",
  "location": "string (optional)",
  "priority": "LOW | MEDIUM | HIGH | URGENT (optional, default: MEDIUM)",
  "metadata": "object (optional)"
}
```

#### Response

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "managerId": "string",
  "status": "PLANNING",
  "priority": "MEDIUM",
  "startDate": "datetime",
  "endDate": "datetime",
  "budget": "decimal",
  "location": "string",
  "metadata": "object",
  "manager": {
    "id": "string",
    "name": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string"
  },
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

#### Status Codes

- `201` - Project created successfully
- `400` - Validation error
- `401` - Unauthorized
- `403` - Insufficient permissions

---

### 2. List Projects

**GET** `/api/projects`

Retrieves projects with filtering, pagination, and search capabilities.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10, max: 100) |
| `status` | enum | Filter by project status |
| `priority` | enum | Filter by project priority |
| `managerId` | string | Filter by manager ID |
| `search` | string | Search in name, description, location |
| `startDateFrom` | datetime | Filter projects starting from date |
| `startDateTo` | datetime | Filter projects starting before date |
| `endDateFrom` | datetime | Filter projects ending from date |
| `endDateTo` | datetime | Filter projects ending before date |
| `budgetMin` | number | Minimum budget filter |
| `budgetMax` | number | Maximum budget filter |
| `location` | string | Filter by location |

#### Response

```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "managerId": "string",
      "status": "enum",
      "priority": "enum",
      "startDate": "datetime",
      "endDate": "datetime",
      "budget": "decimal",
      "location": "string",
      "manager": { "..." },
      "tasks": [ "..." ],
      "materials": [ "..." ],
      "documents": [ "..." ],
      "members": [ "..." ],
      "milestones": [ "..." ],
      "phases": [ "..." ],
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 3. Get Project Details

**GET** `/api/projects/:id`

Retrieves detailed information about a specific project including all related data.

#### Response

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "managerId": "string",
  "status": "enum",
  "priority": "enum",
  "startDate": "datetime",
  "endDate": "datetime",
  "budget": "decimal",
  "location": "string",
  "metadata": "object",
  "manager": {
    "id": "string",
    "name": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string"
  },
  "tasks": [
    {
      "id": "string",
      "title": "string",
      "status": "enum",
      "priority": "enum",
      "dueDate": "datetime"
    }
  ],
  "materials": [
    {
      "id": "string",
      "name": "string",
      "quantity": "decimal",
      "totalCost": "decimal"
    }
  ],
  "documents": [
    {
      "id": "string",
      "name": "string",
      "type": "enum",
      "fileSize": "number"
    }
  ],
  "members": [
    {
      "id": "string",
      "role": "enum",
      "user": {
        "id": "string",
        "name": "string",
        "email": "string"
      }
    }
  ],
  "milestones": [
    {
      "id": "string",
      "name": "string",
      "dueDate": "datetime",
      "completed": "boolean"
    }
  ],
  "phases": [
    {
      "id": "string",
      "name": "string",
      "status": "enum",
      "startDate": "datetime",
      "endDate": "datetime"
    }
  ],
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

#### Status Codes

- `200` - Success
- `401` - Unauthorized
- `403` - Access denied
- `404` - Project not found

---

### 4. Update Project

**PATCH** `/api/projects/:id`

Updates a project with partial data. Only project managers, owners, or admins can update projects.

#### Request Body

All fields are optional:

```json
{
  "name": "string (3-100 chars)",
  "description": "string",
  "status": "PLANNING | IN_PROGRESS | ON_HOLD | COMPLETED | CANCELLED",
  "priority": "LOW | MEDIUM | HIGH | URGENT",
  "startDate": "ISO 8601 datetime",
  "endDate": "ISO 8601 datetime",
  "budget": "number (>= 0)",
  "location": "string",
  "metadata": "object"
}
```

#### Response

Returns the updated project object (same format as GET `/api/projects/:id`).

#### Status Codes

- `200` - Project updated successfully
- `400` - Validation error
- `401` - Unauthorized
- `403` - Insufficient permissions
- `404` - Project not found

---

### 5. Delete Project

**DELETE** `/api/projects/:id`

Deletes a project and all related data (cascade delete). Only project managers, owners, or admins can delete projects.

#### Response

```json
{
  "message": "Project deleted successfully",
  "projectId": "string"
}
```

#### Status Codes

- `200` - Project deleted successfully
- `401` - Unauthorized
- `403` - Insufficient permissions
- `404` - Project not found

---

## Related Data Endpoints

### 6. Get Project Tasks

**GET** `/api/projects/:id/tasks`

Retrieves all tasks for a specific project with filtering and pagination.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Items per page |
| `status` | enum | Filter by task status |
| `priority` | enum | Filter by task priority |
| `assignedTo` | string | Filter by assignee ID |
| `search` | string | Search in title, description |

---

### 7. Get Project Materials

**GET** `/api/projects/:id/materials`

Retrieves all materials for a specific project with filtering and pagination.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Items per page |
| `category` | string | Filter by material category |
| `supplierId` | string | Filter by supplier |
| `search` | string | Search in name, description |
| `minCost` | number | Minimum cost filter |
| `maxCost` | number | Maximum cost filter |

---

### 8. Get Project Documents

**GET** `/api/projects/:id/documents`

Retrieves all documents for a specific project with filtering and pagination.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Items per page |
| `type` | enum | Filter by document type |
| `search` | string | Search in name, description |
| `mimeType` | string | Filter by MIME type |
| `minSize` | number | Minimum file size |
| `maxSize` | number | Maximum file size |

---

### 9. Get Project Team

**GET** `/api/projects/:id/team`

Retrieves all team members for a specific project with their roles and statistics.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Items per page |
| `role` | enum | Filter by project role |
| `search` | string | Search in user details |

#### Response

Includes member statistics:
- Assigned tasks count
- Completed tasks count
- Overdue tasks count
- Completion rate percentage

---

### 10. Get Project Statistics

**GET** `/api/projects/:id/stats`

Retrieves comprehensive statistics and analytics for a specific project.

#### Response

```json
{
  "project": {
    "id": "string",
    "name": "string",
    "status": "enum",
    "priority": "enum",
    "progress": "number (percentage)",
    "startDate": "datetime",
    "endDate": "datetime",
    "budget": "decimal"
  },
  "timeline": {
    "totalDays": "number",
    "daysElapsed": "number",
    "daysRemaining": "number",
    "isOverdue": "boolean",
    "progressByTime": "number (percentage)"
  },
  "tasks": {
    "total": "number",
    "byStatus": {
      "TODO": "number",
      "IN_PROGRESS": "number",
      "COMPLETED": "number",
      "BLOCKED": "number"
    },
    "completionRate": "number (percentage)",
    "overdue": "number"
  },
  "materials": {
    "total": "number",
    "totalCost": "decimal",
    "totalQuantity": "decimal",
    "averageUnitPrice": "decimal"
  },
  "documents": {
    "total": "number",
    "byType": {
      "BLUEPRINT": { "count": "number", "totalSize": "number" },
      "SPECIFICATION": { "count": "number", "totalSize": "number" }
    },
    "totalSize": "number"
  },
  "team": {
    "total": "number",
    "byRole": {
      "OWNER": "number",
      "MANAGER": "number",
      "MEMBER": "number"
    }
  },
  "milestones": {
    "total": "number",
    "completed": "number",
    "completionRate": "number (percentage)",
    "upcoming": "number"
  },
  "phases": {
    "total": "number",
    "byStatus": {
      "PLANNED": "number",
      "IN_PROGRESS": "number",
      "COMPLETED": "number"
    }
  },
  "budget": {
    "allocated": "decimal",
    "spent": "decimal",
    "remaining": "decimal",
    "spentPercentage": "number"
  },
  "recentActivity": [
    {
      "id": "string",
      "title": "string",
      "status": "enum",
      "updatedAt": "datetime",
      "assignee": { "name": "string" }
    }
  ],
  "generatedAt": "datetime"
}
```

## Error Handling

All endpoints use standardized error responses:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "statusCode": 400,
    "details": "Additional error details (development only)",
    "timestamp": "ISO 8601 datetime"
  }
}
```

### Common Error Codes

- `UNAUTHORIZED` - Authentication required
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `VALIDATION_ERROR` - Request validation failed
- `PROJECT_NOT_FOUND` - Project not found or access denied
- `INTERNAL_SERVER_ERROR` - Unexpected server error

## Rate Limiting

All endpoints are subject to rate limiting to prevent abuse. The current limits are:
- 100 requests per 15-minute window per user
- Burst limit of 20 requests per minute

## Data Types

### Enums

**ProjectStatus**
- `PLANNING`
- `IN_PROGRESS`
- `ON_HOLD`
- `COMPLETED`
- `CANCELLED`

**ProjectPriority**
- `LOW`
- `MEDIUM`
- `HIGH`
- `URGENT`

**TaskStatus**
- `TODO`
- `IN_PROGRESS`
- `IN_REVIEW`
- `COMPLETED`
- `BLOCKED`

**DocumentType**
- `BLUEPRINT`
- `SPECIFICATION`
- `CONTRACT`
- `PHOTO`
- `REPORT`
- `OTHER`

**ProjectRole**
- `OWNER`
- `MANAGER`
- `SUPERVISOR`
- `MEMBER`
- `VIEWER`

## Implementation Notes

1. **Database**: Uses Prisma ORM with SQLite (development) / PostgreSQL (production)
2. **Validation**: Zod schemas for request validation
3. **Authentication**: NextAuth.js with JWT tokens
4. **Caching**: Ready for Redis integration
5. **Pagination**: Cursor-based pagination for optimal performance
6. **Search**: Full-text search across relevant fields
7. **Security**: Input sanitization and SQL injection prevention
8. **Logging**: Comprehensive error logging and monitoring

## Testing

Use tools like Postman, curl, or the built-in API testing interface to test these endpoints. Ensure you have a valid session cookie or JWT token for authentication.

## Next Steps

This API implementation covers all requirements for Task 3. The next tasks will build upon this foundation to add:
- Task management endpoints
- Material management endpoints
- File upload and document management
- Enhanced authentication features
- Real-time communication enhancements