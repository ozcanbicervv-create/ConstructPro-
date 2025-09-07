# Real-time Communication API Documentation

## Overview

The ConstructPro real-time communication system provides comprehensive WebSocket-based features for project collaboration, including:

- **Room-based project communication** - Users can join/leave project-specific rooms
- **Real-time project status broadcasting** - Instant updates for project changes
- **Online presence tracking** - Track user online status and activity
- **In-app notification system** - Priority-based notification delivery
- **Collaborative editing** - Real-time document editing with conflict resolution
- **Typing indicators** - Show when users are actively typing

## Architecture

### Core Components

1. **Socket.IO Server** (`src/utils/socket.ts`) - Main WebSocket server setup
2. **Notification Service** (`src/services/notification.service.ts`) - Handles all notification logic
3. **Presence Service** (`src/services/presence.service.ts`) - Manages user presence and project rooms
4. **Collaborative Editing Service** (`src/services/collaborative-editing.service.ts`) - Document editing coordination
5. **Socket Client** (`src/utils/socket-client.ts`) - Frontend WebSocket client

### Event System

All real-time events are defined in `src/types/realtime.types.ts` using the `SocketEvents` enum.

## WebSocket Connection

### Client Connection

```typescript
import { socketClient } from '@/utils/socket-client';

// Connect with user authentication
socketClient.connect('user-123');

// Join a project room
socketClient.joinProject('project-456');

// Listen for events
socketClient.on('project_updated', (data) => {
  console.log('Project updated:', data);
});
```

### Authentication

WebSocket connections require user authentication via the `auth.userId` parameter:

```typescript
const socket = io('ws://localhost:3001/api/socketio', {
  auth: { userId: 'user-123' }
});
```

## Project Rooms

### Joining/Leaving Projects

Users can join project-specific rooms to receive targeted updates:

```typescript
// Join project room
socket.emit('join_project', { projectId: 'project-123' });

// Leave project room  
socket.emit('leave_project', { projectId: 'project-123' });
```

### Room Events

- `project_joined` - Confirmation of joining a project room
- `project_left` - Confirmation of leaving a project room
- `project_member_added` - When a user joins the project room
- `project_member_removed` - When a user leaves the project room

## Real-time Updates

### Project Updates

Broadcast project changes to all project members:

```typescript
// Client-side: Broadcast project update
socketClient.broadcastProjectUpdate('project-123', {
  status: 'in_progress',
  updatedBy: 'user-456'
});

// Listen for project updates
socketClient.on('project_updated', (data) => {
  console.log('Project updated:', data.changes);
});
```

### Task Updates

Real-time task status and assignment updates:

```typescript
// Broadcast task update
socketClient.broadcastTaskUpdate('task-789', 'project-123', {
  status: 'completed',
  assignee: 'user-456'
});

// Listen for task updates
socketClient.on('task_updated', (data) => {
  console.log('Task updated:', data.taskId, data.changes);
});
```

## Presence Tracking

### Online Status

The system automatically tracks user online/offline status:

```typescript
// Listen for user presence changes
socketClient.on('user_online', (data) => {
  console.log(`User ${data.userId} is now online`);
});

socketClient.on('user_offline', (data) => {
  console.log(`User ${data.userId} went offline at ${data.lastSeen}`);
});
```

### Project Member Presence

Get real-time information about active project members:

```typescript
// Get current project members
socketClient.getProjectMembers('project-123');

// Listen for member updates
socketClient.on('project_members', (data) => {
  console.log(`Project ${data.projectId} has ${data.members.length} active members`);
});
```

## Notification System

### Notification Types

```typescript
enum NotificationType {
  PROJECT_UPDATE = 'PROJECT_UPDATE',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_DUE_SOON = 'TASK_DUE_SOON',
  TASK_OVERDUE = 'TASK_OVERDUE',
  TASK_COMPLETED = 'TASK_COMPLETED',
  MATERIAL_LOW_STOCK = 'MATERIAL_LOW_STOCK',
  DOCUMENT_APPROVAL_NEEDED = 'DOCUMENT_APPROVAL_NEEDED',
  DOCUMENT_APPROVED = 'DOCUMENT_APPROVED',
  DOCUMENT_REJECTED = 'DOCUMENT_REJECTED',
  PROJECT_MILESTONE = 'PROJECT_MILESTONE',
  TEAM_MEMBER_ADDED = 'TEAM_MEMBER_ADDED',
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE'
}
```

### Priority Levels

```typescript
enum NotificationPriority {
  LOW = 'LOW',        // 7 days expiry
  MEDIUM = 'MEDIUM',  // 3 days expiry
  HIGH = 'HIGH',      // 1 day expiry
  URGENT = 'URGENT'   // Never expires
}
```

### Receiving Notifications

```typescript
// Listen for new notifications
socketClient.on('notification_sent', (notification) => {
  console.log('New notification:', notification.title);
  
  // Show notification in UI
  showNotification(notification);
});

// Mark notification as read
socketClient.markNotificationRead('notification-123');
```

## Collaborative Editing

### Document Editing Sessions

The system provides document locking and collaborative editing:

```typescript
// Start editing a document
socketClient.startEditingDocument('document-123');

// Listen for edit session response
socketClient.on('edit_session_response', (response) => {
  if (response.success) {
    console.log('Edit session started, lock acquired');
  } else {
    console.log('Cannot edit:', response.message);
  }
});

// Update cursor position
socketClient.updateCursorPosition('document-123', 150);

// Update document content
socketClient.updateDocumentContent('document-123', 'New content', 100);

// End editing session
socketClient.endEditingDocument('document-123');
```

### Collaborative Events

- `document_edit_start` - User starts editing a document
- `document_edit_end` - User stops editing a document
- `document_cursor_move` - Cursor position update
- `document_content_change` - Document content update
- `document_lock_expired` - Document lock has expired

### Typing Indicators

```typescript
// Start typing indicator
socketClient.startTyping('project-123', 'task-456', 'document-789');

// Stop typing indicator
socketClient.stopTyping('project-123', 'task-456', 'document-789');

// Listen for typing indicators
socketClient.on('user_typing', (data) => {
  console.log(`${data.userId} is typing in ${data.documentId}`);
});

socketClient.on('user_stop_typing', (data) => {
  console.log(`${data.userId} stopped typing`);
});
```

## REST API Endpoints

### Notifications

#### GET /api/notifications
Get user notifications with filtering options.

**Query Parameters:**
- `limit` (number, optional) - Maximum number of notifications (default: 50)
- `unreadOnly` (boolean, optional) - Only return unread notifications

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "notif-123",
      "userId": "user-456",
      "type": "TASK_ASSIGNED",
      "title": "New Task Assigned",
      "message": "You have been assigned a new task",
      "priority": "HIGH",
      "read": false,
      "createdAt": "2024-01-15T10:30:00Z",
      "data": {
        "taskId": "task-789",
        "projectId": "project-123"
      }
    }
  ]
}
```

#### POST /api/notifications
Create a new notification.

**Request Body:**
```json
{
  "userId": "user-456",
  "type": "TASK_ASSIGNED",
  "title": "New Task Assigned",
  "message": "You have been assigned a new task",
  "data": {
    "taskId": "task-789",
    "projectId": "project-123"
  },
  "priority": "HIGH"
}
```

#### PATCH /api/notifications/[id]/read
Mark a notification as read.

### Presence

#### GET /api/presence/online-users
Get all currently online users.

**Response:**
```json
{
  "success": true,
  "data": {
    "onlineUsers": [
      {
        "id": "socket-123",
        "socketId": "socket-123",
        "userId": "user-456",
        "projectIds": ["project-123"],
        "isOnline": true,
        "lastSeen": "2024-01-15T10:30:00Z"
      }
    ],
    "totalCount": 1
  }
}
```

#### GET /api/presence/projects/[id]/members
Get active members in a project room.

**Response:**
```json
{
  "success": true,
  "data": {
    "projectId": "project-123",
    "members": [...],
    "stats": {
      "activeUsers": 3,
      "totalMembers": 5
    }
  }
}
```

#### GET /api/presence/users/[id]/status
Get a specific user's presence status.

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user-456",
    "isOnline": true,
    "lastSeen": "2024-01-15T10:30:00Z"
  }
}
```

### Collaborative Editing

#### GET /api/collaborative-editing/documents/[id]/editors
Get active editors for a document.

**Response:**
```json
{
  "success": true,
  "data": {
    "documentId": "doc-123",
    "activeEditors": [
      {
        "documentId": "doc-123",
        "userId": "user-456",
        "socketId": "socket-789",
        "startTime": "2024-01-15T10:30:00Z",
        "lastActivity": "2024-01-15T10:35:00Z",
        "cursorPosition": 150
      }
    ],
    "editorCount": 1
  }
}
```

#### GET /api/collaborative-editing/documents/[id]/lock
Get document lock status.

**Response:**
```json
{
  "success": true,
  "data": {
    "documentId": "doc-123",
    "lock": {
      "documentId": "doc-123",
      "userId": "user-456",
      "socketId": "socket-789",
      "lockedAt": "2024-01-15T10:30:00Z",
      "expiresAt": "2024-01-15T11:00:00Z"
    },
    "isLocked": true
  }
}
```

#### PATCH /api/collaborative-editing/documents/[id]/lock
Extend document lock.

**Request Body:**
```json
{
  "action": "extend",
  "minutes": 30
}
```

#### DELETE /api/collaborative-editing/documents/[id]/lock
Force release document lock (admin only).

### Real-time Broadcasting

#### POST /api/realtime/broadcast
Trigger real-time updates and notifications.

**Request Body Examples:**

**Project Update:**
```json
{
  "type": "project_update",
  "target": {
    "projectId": "project-123"
  },
  "data": {
    "title": "Project Status Updated",
    "message": "Project moved to in progress",
    "changes": {
      "status": "in_progress"
    }
  }
}
```

**Task Assignment:**
```json
{
  "type": "task_assigned",
  "target": {
    "projectId": "project-123",
    "taskId": "task-456",
    "assigneeId": "user-789"
  },
  "data": {
    "title": "New Task Assigned",
    "message": "You have been assigned a new task"
  }
}
```

**System Notification:**
```json
{
  "type": "system_notification",
  "target": {},
  "data": {
    "title": "System Maintenance",
    "message": "System will be down for maintenance at 2 AM",
    "priority": "URGENT"
  }
}
```

## Error Handling

### Connection Errors

The client automatically handles connection failures with exponential backoff:

```typescript
// Connection status
if (socketClient.isConnected()) {
  console.log('Connected to real-time server');
} else {
  console.log('Disconnected from server');
}

// Listen for connection events
socketClient.on('connect', () => {
  console.log('Connected to server');
});

socketClient.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

socketClient.on('connect_error', (error) => {
  console.error('Connection error:', error);
});
```

### API Error Responses

All API endpoints return consistent error responses:

```json
{
  "error": "Error message describing what went wrong",
  "code": "ERROR_CODE" // Optional error code
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error (server-side errors)

## Performance Considerations

### Connection Limits

- Maximum concurrent connections per server: 10,000
- Maximum rooms per user: 50
- Maximum notifications per user: 1,000 (older notifications auto-expire)

### Message Rate Limiting

- Maximum events per user per second: 10
- Typing indicators are throttled to prevent spam
- Document content updates are debounced on the client side

### Memory Management

- User presence data is cleaned up on disconnect
- Expired document locks are automatically removed
- Old notifications are periodically cleaned up based on priority

## Security

### Authentication

All WebSocket connections require valid user authentication. Unauthenticated connections are immediately disconnected.

### Authorization

- Users can only join projects they have access to
- Document editing requires appropriate permissions
- Admin-only operations (like force releasing locks) are protected

### Data Validation

All incoming events and API requests are validated for:
- Required fields
- Data types
- Enum values
- User permissions

## Testing

### Unit Tests

Run the real-time communication tests:

```bash
npm test src/tests/realtime-communication.test.ts
npm test src/tests/realtime-api-integration.test.ts
```

### Integration Testing

The system includes comprehensive integration tests covering:
- WebSocket connection and disconnection
- Project room management
- Real-time event broadcasting
- Notification delivery
- Collaborative editing workflows
- Error handling scenarios

### Load Testing

For production deployments, consider load testing with tools like Artillery or Socket.IO's built-in load testing utilities to ensure the system can handle expected concurrent users.

## Monitoring

### Metrics to Track

- Active WebSocket connections
- Messages per second
- Room membership counts
- Notification delivery rates
- Document lock duration
- Connection error rates

### Logging

The system logs important events:
- User connections/disconnections
- Project room joins/leaves
- Document editing sessions
- Notification deliveries
- Error conditions

All logs include timestamps, user IDs, and relevant context for debugging and monitoring.