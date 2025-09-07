# Task Collaboration API Documentation

This document describes the task collaboration features implemented as part of the database API implementation.

## Overview

The task collaboration features provide comprehensive functionality for:
- Task comments and discussions
- File attachments to tasks
- Task assignment validation with user availability checking
- Task progress tracking with completion metrics and timelines

## API Endpoints

### Task Comments

#### Create Comment
- **POST** `/api/tasks/:id/comments`
- **Description**: Add a comment to a task for discussions
- **Body**: `{ content: string }`
- **Response**: Created comment with user information

#### Get Comments
- **GET** `/api/tasks/:id/comments`
- **Description**: Retrieve all comments for a task with threading support
- **Response**: Array of comments in chronological order

#### Update Comment
- **PATCH** `/api/tasks/:id/comments/:commentId`
- **Description**: Update a comment (only by author or project manager)
- **Body**: `{ content: string }`
- **Response**: Updated comment

#### Delete Comment
- **DELETE** `/api/tasks/:id/comments/:commentId`
- **Description**: Delete a comment (only by author or project manager)
- **Response**: Success confirmation

### Task Attachments

#### Upload Attachment
- **POST** `/api/tasks/:id/attachments`
- **Description**: Upload a file attachment to a task
- **Body**: FormData with 'file' field
- **Supported Types**: Images, PDFs, Office documents, CAD files, archives
- **Max Size**: 50MB
- **Response**: Created attachment metadata

#### Get Attachments
- **GET** `/api/tasks/:id/attachments`
- **Description**: Retrieve all attachments for a task
- **Response**: Array of attachment metadata

#### Download Attachment
- **GET** `/api/tasks/:id/attachments/:attachmentId`
- **Description**: Download an attachment file
- **Response**: File download with proper headers

#### Delete Attachment
- **DELETE** `/api/tasks/:id/attachments/:attachmentId`
- **Description**: Delete an attachment
- **Response**: Success confirmation

### Task Progress Tracking

#### Get Task Progress
- **GET** `/api/tasks/:id/progress`
- **Description**: Get comprehensive task progress and metrics
- **Response**: 
```json
{
  "task": { /* task details */ },
  "progress": {
    "completionPercentage": 75,
    "timeSpent": 6,
    "timeRemaining": 2,
    "isOverdue": false,
    "daysUntilDue": 3,
    "estimatedCompletion": "2024-01-15T10:00:00Z"
  },
  "timeline": {
    "created": "2024-01-01T09:00:00Z",
    "started": "2024-01-02T10:00:00Z",
    "lastUpdated": "2024-01-12T14:30:00Z",
    "completed": null,
    "dueDate": "2024-01-15T17:00:00Z"
  },
  "metrics": {
    "commentsCount": 5,
    "attachmentsCount": 3,
    "hoursLogged": 6,
    "estimatedHours": 8,
    "efficiency": 0.75
  }
}
```

### User Availability

#### Check User Availability
- **GET** `/api/users/:id/availability`
- **Description**: Check user availability for task assignment
- **Query Parameters**: 
  - `startDate` (optional): Start date for conflict checking
  - `endDate` (optional): End date for conflict checking
- **Response**:
```json
{
  "isAvailable": true,
  "workload": 65,
  "conflictingTasks": [
    {
      "id": "task-id",
      "title": "Conflicting Task",
      "dueDate": "2024-01-15T17:00:00Z",
      "estimatedHours": 4
    }
  ]
}
```

### Project Task Metrics

#### Get Project Task Metrics
- **GET** `/api/projects/:id/tasks/metrics`
- **Description**: Get comprehensive task statistics for a project
- **Response**:
```json
{
  "totalTasks": 25,
  "completedTasks": 15,
  "inProgressTasks": 8,
  "overdueTasks": 2,
  "blockedTasks": 0,
  "averageCompletionTime": 5.2,
  "totalEstimatedHours": 200,
  "totalActualHours": 180,
  "efficiency": 0.9,
  "tasksByPriority": {
    "HIGH": 5,
    "MEDIUM": 15,
    "LOW": 5
  },
  "tasksByAssignee": [
    {
      "userId": "user-id",
      "userName": "John Doe",
      "taskCount": 8,
      "completedCount": 5,
      "workload": 75
    }
  ]
}
```

## Features Implemented

### 1. Task Comments with Threading
- Chronological comment ordering for natural conversation flow
- User information included with each comment
- Permission-based editing and deletion
- Project access validation

### 2. File Attachments
- Support for multiple file types (images, documents, CAD files)
- File size validation (50MB limit)
- Secure file storage with organized directory structure
- Download functionality with proper MIME type handling
- Automatic cleanup on deletion

### 3. Task Assignment Validation
- User existence verification
- Project access validation for assignees
- Workload calculation based on active tasks
- Conflict detection for overlapping due dates
- Availability scoring with configurable thresholds

### 4. Progress Tracking
- Dynamic completion percentage calculation based on status and time spent
- Timeline tracking with key milestones
- Efficiency metrics (actual vs estimated hours)
- Overdue detection and days until due calculation
- Estimated completion date projection

### 5. Project-Level Metrics
- Comprehensive task statistics
- Team workload distribution
- Priority and status breakdowns
- Performance metrics and efficiency tracking

## Security Features

- **Authentication**: All endpoints require valid session
- **Authorization**: Project-based access control
- **File Validation**: Type and size restrictions for uploads
- **Input Sanitization**: Comprehensive validation using Zod schemas
- **Permission Checks**: Role-based access for comments and attachments

## Error Handling

All endpoints use standardized error responses with:
- Consistent error codes
- Descriptive error messages
- Proper HTTP status codes
- Request correlation for debugging

## Database Schema

The implementation uses the existing Prisma schema with:
- `TaskComment` model for comment storage
- `TaskAttachment` model for file metadata
- Enhanced `Task` model with progress tracking fields
- Proper foreign key relationships and cascading deletes

## Performance Considerations

- **Pagination**: Large result sets are paginated
- **Indexing**: Database indexes on frequently queried fields
- **File Storage**: Organized directory structure for efficient file access
- **Caching**: Ready for Redis caching implementation
- **Query Optimization**: Selective field loading and relation includes

## Requirements Satisfied

This implementation satisfies the following requirements:

- **3.4**: Task assignment validation with user availability checking
- **3.5**: Task progress tracking with completion metrics and timelines  
- **7.2**: Real-time communication enhancements (comment system foundation)

The implementation provides a solid foundation for construction project task collaboration with enterprise-grade features for security, performance, and usability.