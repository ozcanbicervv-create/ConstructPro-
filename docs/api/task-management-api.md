# Task Management API Documentation

## Overview

The Task Management API provides comprehensive endpoints for creating, reading, updating, and deleting construction project tasks. All endpoints require authentication and implement role-based access control.

## Base URL

```
/api/tasks
```

## Authentication

All endpoints require a valid session token. Include the session in your request headers or cookies.

## Endpoints

### 1. Create Task

**POST** `/api/tasks`

Creates a new task associated with a project.

#### Request Body

```json
{
  "projectId": "string (required)",
  "title": "string (required, 3-200 chars)",
  "description": "string (optional)",
  "assignedTo": "string (optional, user ID)",
  "priority": "LOW | MEDIUM | HIGH | URGENT (default: MEDIUM)",
  "dueDate": "string (optional, ISO 8601 datetime)",
  "estimatedHours": "number (optional, 0.5-1000)",
  "metadata": "object (optional)"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "string",
    "projectId": "string",
    "title": "string",
    "description": "string",
    "status": "TODO",
    "priority": "MEDIUM",
    "assignedTo": "string",
    "createdBy": "string",
    "dueDate": "2024-01-15T10:00:00Z",
    "estimatedHours": 8.5,
    "actualHours": null,
    "metadata": {},
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T10:00:00Z",
    "project": {
      "id": "string",
      "name": "string",
      "status": "string"
    },
    "assignee": {
      "id": "string",
      "name": "string",
      "email": "string",
      "firstName": "string",
      "lastName": "string"
    },
    "creator": {
      "id": "string",
      "name": "string",
      "email": "string",
      "firstName": "string",
      "lastName": "string"
    }
  },
  "message": "Task created successfully"
}
```

#### Error Responses

- `400` - Validation error or invalid project/assignee
- `401` - Authentication required
- `403` - Insufficient permissions to create tasks in this project
- `404` - Project not found

### 2. List Tasks

**GET** `/api/tasks`

Retrieves tasks with filtering, pagination, and search capabilities.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by task status: `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `COMPLETED`, `BLOCKED` |
| `priority` | string | Filter by priority: `LOW`, `MEDIUM`, `HIGH`, `URGENT` |
| `assignedTo` | string | Filter by assigned user ID |
| `search` | string | Search in task title and description |
| `dueDateFrom` | string | Filter tasks due after this date (ISO 8601) |
| `dueDateTo` | string | Filter tasks due before this date (ISO 8601) |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10, max: 100) |

#### Example Request

```
GET /api/tasks?status=IN_PROGRESS&priority=HIGH&page=1&limit=20
```

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "projectId": "string",
      "title": "string",
      "description": "string",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "assignedTo": "string",
      "createdBy": "string",
      "dueDate": "2024-01-15T10:00:00Z",
      "estimatedHours": 8.5,
      "actualHours": 2.5,
      "metadata": {},
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z",
      "project": {
        "id": "string",
        "name": "string",
        "status": "string"
      },
      "assignee": {
        "id": "string",
        "name": "string",
        "email": "string",
        "firstName": "string",
        "lastName": "string"
      },
      "creator": {
        "id": "string",
        "name": "string",
        "email": "string",
        "firstName": "string",
        "lastName": "string"
      },
      "comments": [
        {
          "id": "string",
          "content": "string",
          "createdAt": "2024-01-01T10:00:00Z",
          "user": {
            "id": "string",
            "name": "string",
            "email": "string"
          }
        }
      ],
      "attachments": [
        {
          "id": "string",
          "name": "string",
          "filePath": "string",
          "fileSize": 1024,
          "mimeType": "image/jpeg",
          "createdAt": "2024-01-01T10:00:00Z"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "message": "Tasks retrieved successfully"
}
```

### 3. Get Task Details

**GET** `/api/tasks/{id}`

Retrieves detailed information about a specific task.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Task ID |

#### Response

```json
{
  "success": true,
  "data": {
    "id": "string",
    "projectId": "string",
    "title": "string",
    "description": "string",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "assignedTo": "string",
    "createdBy": "string",
    "dueDate": "2024-01-15T10:00:00Z",
    "estimatedHours": 8.5,
    "actualHours": 2.5,
    "metadata": {},
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T10:00:00Z",
    "project": {
      "id": "string",
      "name": "string",
      "status": "string"
    },
    "assignee": {
      "id": "string",
      "name": "string",
      "email": "string",
      "firstName": "string",
      "lastName": "string"
    },
    "creator": {
      "id": "string",
      "name": "string",
      "email": "string",
      "firstName": "string",
      "lastName": "string"
    },
    "comments": [
      {
        "id": "string",
        "content": "string",
        "createdAt": "2024-01-01T10:00:00Z",
        "user": {
          "id": "string",
          "name": "string",
          "email": "string"
        }
      }
    ],
    "attachments": [
      {
        "id": "string",
        "name": "string",
        "filePath": "string",
        "fileSize": 1024,
        "mimeType": "image/jpeg",
        "createdAt": "2024-01-01T10:00:00Z"
      }
    ]
  },
  "message": "Task retrieved successfully"
}
```

#### Error Responses

- `401` - Authentication required
- `404` - Task not found or access denied

### 4. Update Task

**PATCH** `/api/tasks/{id}`

Updates an existing task. Supports partial updates and status transitions.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Task ID |

#### Request Body

```json
{
  "title": "string (optional, 3-200 chars)",
  "description": "string (optional)",
  "assignedTo": "string (optional, user ID)",
  "status": "TODO | IN_PROGRESS | IN_REVIEW | COMPLETED | BLOCKED (optional)",
  "priority": "LOW | MEDIUM | HIGH | URGENT (optional)",
  "dueDate": "string (optional, ISO 8601 datetime)",
  "estimatedHours": "number (optional, 0.5-1000)",
  "actualHours": "number (optional, 0-1000)",
  "metadata": "object (optional)"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "string",
    "projectId": "string",
    "title": "string",
    "description": "string",
    "status": "COMPLETED",
    "priority": "HIGH",
    "assignedTo": "string",
    "createdBy": "string",
    "dueDate": "2024-01-15T10:00:00Z",
    "estimatedHours": 8.5,
    "actualHours": 8.0,
    "metadata": {},
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-02T15:30:00Z",
    "project": {
      "id": "string",
      "name": "string",
      "status": "string"
    },
    "assignee": {
      "id": "string",
      "name": "string",
      "email": "string",
      "firstName": "string",
      "lastName": "string"
    },
    "creator": {
      "id": "string",
      "name": "string",
      "email": "string",
      "firstName": "string",
      "lastName": "string"
    }
  },
  "message": "Task updated successfully"
}
```

#### Error Responses

- `400` - Validation error or invalid assignee
- `401` - Authentication required
- `403` - Insufficient permissions to update this task
- `404` - Task not found

### 5. Delete Task

**DELETE** `/api/tasks/{id}`

Deletes a task and all associated data (comments, attachments).

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Task ID |

#### Response

```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

#### Error Responses

- `401` - Authentication required
- `403` - Insufficient permissions to delete this task
- `404` - Task not found

## Task Status Transitions

Tasks follow a defined workflow with the following status transitions:

```
TODO → IN_PROGRESS → IN_REVIEW → COMPLETED
  ↓         ↓           ↓
BLOCKED ← BLOCKED ← BLOCKED
```

## Permission Model

### Task Creation
- User must be a member of the project or project manager
- Assignee (if specified) must have access to the project

### Task Access
- Users can only access tasks in projects they are members of
- Project managers can access all tasks in their projects

### Task Updates
- Task creator, assignee, project manager, or users with OWNER/MANAGER/SUPERVISOR roles can update tasks
- Status transitions are logged for audit purposes

### Task Deletion
- Only project managers, task creators, or users with OWNER/MANAGER/SUPERVISOR roles can delete tasks
- Deletion cascades to comments and attachments

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "statusCode": 400,
    "details": {},
    "timestamp": "2024-01-01T10:00:00Z"
  }
}
```

### Common Error Codes

- `UNAUTHORIZED` - Authentication required
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `VALIDATION_ERROR` - Request validation failed
- `PROJECT_NOT_FOUND` - Task or related resource not found
- `TASK_ASSIGNMENT_FAILED` - Task assignment validation failed
- `INTERNAL_SERVER_ERROR` - Unexpected server error

## Rate Limiting

All endpoints are subject to rate limiting:
- 100 requests per 15-minute window per user
- Burst limit of 20 requests per minute

## Examples

### Create a High Priority Task

```bash
curl -X POST /api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "proj_123",
    "title": "Install electrical wiring in main floor",
    "description": "Complete electrical installation according to blueprint specifications",
    "priority": "HIGH",
    "assignedTo": "user_456",
    "dueDate": "2024-02-15T17:00:00Z",
    "estimatedHours": 16,
    "metadata": {
      "blueprint": "BP-001",
      "materials": ["wire_12awg", "outlets_20amp"]
    }
  }'
```

### Update Task Status to Completed

```bash
curl -X PATCH /api/tasks/task_789 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED",
    "actualHours": 14.5
  }'
```

### Search for Overdue High Priority Tasks

```bash
curl -X GET "/api/tasks?priority=HIGH&dueDateTo=2024-01-01T00:00:00Z&status=TODO,IN_PROGRESS"
```

This API provides comprehensive task management capabilities with proper authentication, authorization, validation, and error handling suitable for production construction project management systems.