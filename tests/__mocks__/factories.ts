// Test data factories for consistent mock data generation

export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'manager';
  createdAt: string;
  updatedAt: string;
}

export interface MockProject {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  startDate: string;
  endDate?: string;
  budget?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MockTask {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assigneeId?: string;
  projectId: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

// User factory
export const createMockUser = (overrides: Partial<MockUser> = {}): MockUser => ({
  id: `user-${Math.random().toString(36).substr(2, 9)}`,
  email: `test-${Math.random().toString(36).substr(2, 5)}@example.com`,
  name: `Test User ${Math.random().toString(36).substr(2, 5)}`,
  role: 'user',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// Project factory
export const createMockProject = (overrides: Partial<MockProject> = {}): MockProject => ({
  id: `project-${Math.random().toString(36).substr(2, 9)}`,
  name: `Test Project ${Math.random().toString(36).substr(2, 5)}`,
  description: 'A test project for construction management',
  status: 'active',
  startDate: new Date().toISOString(),
  budget: Math.floor(Math.random() * 1000000) + 50000,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// Task factory
export const createMockTask = (overrides: Partial<MockTask> = {}): MockTask => ({
  id: `task-${Math.random().toString(36).substr(2, 9)}`,
  title: `Test Task ${Math.random().toString(36).substr(2, 5)}`,
  description: 'A test task for project management',
  status: 'todo',
  priority: 'medium',
  projectId: `project-${Math.random().toString(36).substr(2, 9)}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// API Response factory
export const createMockApiResponse = <T>(data: T, success = true) => ({
  data,
  success,
  message: success ? 'Operation successful' : 'Operation failed',
  timestamp: new Date().toISOString(),
});

// Error factory
export const createMockError = (message = 'Test error', code = 500) => ({
  message,
  code,
  timestamp: new Date().toISOString(),
});

// Batch factories for creating multiple items
export const createMockUsers = (count: number, overrides: Partial<MockUser> = []): MockUser[] =>
  Array.from({ length: count }, (_, index) => 
    createMockUser({ ...overrides, name: `Test User ${index + 1}` })
  );

export const createMockProjects = (count: number, overrides: Partial<MockProject> = {}): MockProject[] =>
  Array.from({ length: count }, (_, index) => 
    createMockProject({ ...overrides, name: `Test Project ${index + 1}` })
  );

export const createMockTasks = (count: number, projectId: string, overrides: Partial<MockTask> = {}): MockTask[] =>
  Array.from({ length: count }, (_, index) => 
    createMockTask({ ...overrides, projectId, title: `Test Task ${index + 1}` })
  );