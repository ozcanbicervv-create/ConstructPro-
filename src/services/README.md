# Service Layer Documentation

The service layer provides a centralized and consistent way to handle API communication, authentication, real-time updates, and business logic in the ConstructPro application.

## Overview

The service layer consists of the following services:

- **ApiService**: Centralized HTTP client with error handling and retry logic
- **AuthService**: Authentication and user session management
- **ProjectService**: Project, task, and material management operations
- **SocketService**: Real-time communication via WebSocket
- **UserService**: User profile and user-related operations

## Quick Start

### 1. Import Services

```typescript
import { 
  authService, 
  projectService, 
  socketService, 
  userService,
  initializeServices 
} from '@/services';
```

### 2. Initialize Services (App Startup)

```typescript
// In your app initialization (e.g., layout.tsx or _app.tsx)
useEffect(() => {
  initializeServices().catch(console.error);
}, []);
```

### 3. Use Services in Components

```typescript
// Example: Load projects
const [projects, setProjects] = useState<Project[]>([]);

useEffect(() => {
  const loadProjects = async () => {
    try {
      const response = await projectService.getProjects();
      if (response.success) {
        setProjects(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  loadProjects();
}, []);
```

## Service Details

### ApiService

The base HTTP client that all other services use internally.

```typescript
// Direct usage (rarely needed)
const response = await apiService.get<User[]>('/api/users');
const createResponse = await apiService.post<Project>('/api/projects', projectData);

// File upload with progress
const uploadResponse = await apiService.uploadFile(
  '/api/documents/upload',
  file,
  { projectId: '123' },
  (progress) => console.log(`Upload: ${progress}%`)
);
```

**Features:**
- Automatic retry logic with exponential backoff
- Request/response transformation
- Error handling and standardized error format
- File upload with progress tracking
- Timeout handling
- Authentication token management

### AuthService

Handles user authentication and session management.

```typescript
// Login
const loginResponse = await authService.login({
  email: 'user@example.com',
  password: 'password123'
});

// Register
const registerResponse = await authService.register({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
  // ... other fields
});

// Check authentication status
if (authService.isAuthenticated()) {
  // User is logged in
}

// Get current user
const user = authService.getUser();

// Logout
await authService.logout();
```

**Features:**
- JWT token management with automatic refresh
- Secure token storage in localStorage
- Session validation and expiry handling
- Password reset and email verification
- Auto-refresh setup to prevent token expiry

### ProjectService

Manages projects, tasks, materials, and related operations.

```typescript
// Get projects with filtering
const projectsResponse = await projectService.getProjects({
  status: ['active', 'in-progress'],
  page: 1,
  limit: 20
});

// Create project
const newProject = await projectService.createProject({
  name: 'New Construction Project',
  description: 'Modern residential building',
  // ... other project data
});

// Get project tasks
const tasksResponse = await projectService.getProjectTasks('project-id');

// Create task
const newTask = await projectService.createTask({
  title: 'Foundation Work',
  projectId: 'project-id',
  // ... other task data
});

// Material comparison
const comparisonResponse = await projectService.compareMaterials({
  query: 'cement',
  category: 'cement',
  location: { latitude: 40.7128, longitude: -74.0060 }
});

// Upload documents
const uploadResponse = await projectService.uploadDocument(
  file,
  {
    projectId: 'project-id',
    type: 'blueprint',
    category: 'planning'
  },
  (progress) => console.log(`Upload: ${progress}%`)
);
```

### SocketService

Handles real-time communication via WebSocket.

```typescript
// Connect to socket
await socketService.connect();

// Subscribe to project updates
const unsubscribe = socketService.subscribe('project_update', (payload) => {
  console.log('Project updated:', payload);
  // Update UI accordingly
});

// Subscribe to project-specific events
const unsubscribeProject = socketService.subscribeToProject('project-id', (message) => {
  console.log('Project message:', message);
});

// Send message
await socketService.sendMessage('team_message', {
  text: 'Hello team!',
  projectId: 'project-id'
});

// Join project room
await socketService.joinRoom('project-id', 'project');

// Update user status
socketService.updateUserStatus('online');

// Cleanup
unsubscribe();
unsubscribeProject();
```

**Features:**
- Automatic reconnection with exponential backoff
- Message queuing when disconnected
- Room-based messaging (projects, tasks, teams)
- Typed message system
- Event subscription management

### UserService

Manages user profiles and user-related operations.

```typescript
// Get current user profile
const profileResponse = await userService.getCurrentUserProfile();

// Update profile
const updateResponse = await userService.updateProfile({
  firstName: 'John',
  lastName: 'Doe',
  company: 'Construction Co.',
  title: 'Project Manager'
});

// Search users
const usersResponse = await userService.searchUsers({
  query: 'john',
  role: 'MANAGER',
  page: 1,
  limit: 10
});

// Upload avatar
const avatarResponse = await userService.uploadAvatar(
  avatarFile,
  (progress) => console.log(`Upload: ${progress}%`)
);

// Get user statistics
const statsResponse = await userService.getUserStats('user-id');
```

## Error Handling

All services return a consistent response format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: string;
  requestId?: string;
}

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  statusCode?: number;
}
```

### Error Handling Best Practices

```typescript
try {
  const response = await projectService.getProjects();
  
  if (response.success && response.data) {
    // Handle success
    setProjects(response.data);
  } else {
    // Handle API error
    console.error('API Error:', response.error);
    showErrorToast(response.error?.message || 'Unknown error');
  }
} catch (error) {
  // Handle network/unexpected errors
  console.error('Network Error:', error);
  showErrorToast('Network error occurred');
}
```

## Real-time Updates

### Setting up Real-time Features

```typescript
useEffect(() => {
  // Connect socket
  socketService.connect();

  // Subscribe to relevant events
  const unsubscribeProject = socketService.subscribe('project_update', (payload) => {
    // Update project in local state
    setProjects(prev => 
      prev.map(project => 
        project.id === payload.projectId 
          ? { ...project, ...payload.updates }
          : project
      )
    );
  });

  const unsubscribeTask = socketService.subscribe('task_update', (payload) => {
    // Update task in local state
    setTasks(prev => 
      prev.map(task => 
        task.id === payload.taskId 
          ? { ...task, ...payload.updates }
          : task
      )
    );
  });

  // Cleanup on unmount
  return () => {
    unsubscribeProject();
    unsubscribeTask();
    socketService.disconnect();
  };
}, []);
```

## TypeScript Support

All services are fully typed with TypeScript. Import types as needed:

```typescript
import type { 
  Project, 
  Task, 
  Material, 
  User,
  CreateProjectRequest,
  UpdateTaskRequest,
  ApiResponse,
  PaginatedResponse 
} from '@/types';
```

## Best Practices

### 1. Service Initialization

Always initialize services at app startup:

```typescript
// In your root layout or app component
useEffect(() => {
  initializeServices().catch(console.error);
}, []);
```

### 2. Error Handling

Always handle both success and error cases:

```typescript
const response = await projectService.getProjects();

if (response.success) {
  // Handle success
} else {
  // Handle error
  console.error(response.error);
}
```

### 3. Loading States

Show loading states during API calls:

```typescript
const [loading, setLoading] = useState(false);

const loadData = async () => {
  setLoading(true);
  try {
    const response = await projectService.getProjects();
    // Handle response
  } finally {
    setLoading(false);
  }
};
```

### 4. Real-time Cleanup

Always cleanup socket subscriptions:

```typescript
useEffect(() => {
  const unsubscribe = socketService.subscribe('event', handler);
  return unsubscribe; // Cleanup on unmount
}, []);
```

### 5. Authentication Checks

Check authentication before making authenticated requests:

```typescript
if (!authService.isAuthenticated()) {
  // Redirect to login or show error
  return;
}

// Proceed with authenticated request
const response = await projectService.getProjects();
```

## Migration from Direct API Calls

### Before (Direct fetch)

```typescript
const response = await fetch('/api/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(projectData)
});

const result = await response.json();
```

### After (Service Layer)

```typescript
const response = await projectService.createProject(projectData);

if (response.success) {
  // Handle success
} else {
  // Handle error
}
```

## Testing

Services can be easily mocked for testing:

```typescript
// Mock the service
jest.mock('@/services', () => ({
  projectService: {
    getProjects: jest.fn().mockResolvedValue({
      success: true,
      data: mockProjects
    })
  }
}));
```

## Performance Considerations

- Services implement automatic retry logic
- Requests are automatically deduplicated where appropriate
- Socket connections are managed efficiently with automatic reconnection
- File uploads support progress tracking and can be cancelled
- Authentication tokens are automatically refreshed before expiry

## Security

- All authentication tokens are stored securely
- Services automatically handle token refresh
- CSRF protection is built-in
- Input validation is performed at the service layer
- Sensitive operations require proper authentication