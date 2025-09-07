// Service layer exports
// Centralized exports for all services



import { authService } from './auth.service';
import { socketService } from './socket.service';


export { ApiService, apiService } from './api.service';
export { AuthService, authService } from './auth.service';
export { ProjectService, projectService } from './project.service';
export { SocketService, socketService } from './socket.service';
export { UserService, userService } from './user.service';

// Re-export types for convenience
export type {
  ApiResponse,
  ApiError,
  ApiRequestOptions,
  PaginatedResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectSearchRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskSearchRequest,
  CreateMaterialRequest,
  UpdateMaterialRequest,
  MaterialSearchRequest,
  MaterialComparisonRequest,
  MaterialComparisonResponse,
  FileUploadRequest,
  FileUploadResponse,
  SocketMessage,
  SocketResponse,
  SocketMessageType,
} from '@/types/api.types';

// Service initialization helper
export const initializeServices = async () => {
  try {
    // Initialize auth service (checks for existing tokens)
    await authService.initialize();
    
    // Setup auto token refresh
    await authService.setupAutoRefresh();
    
    // Connect socket service if user is authenticated
    if (authService.isAuthenticated()) {
      await socketService.connect();
    }
    
    console.log('Services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
    throw error;
  }
};

// Service cleanup helper
export const cleanupServices = () => {
  try {
    // Disconnect socket
    socketService.disconnect();
    
    // Clear auth data if needed
    // authService.logout(); // Uncomment if you want to clear auth on cleanup
    
    console.log('Services cleaned up successfully');
  } catch (error) {
    console.error('Failed to cleanup services:', error);
  }
};