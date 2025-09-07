// Application route constants

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROJECTS: '/projects',
  PROJECT_DETAIL: '/projects/[id]',
  TASKS: '/tasks',
  MATERIALS: '/materials',
  TEAM: '/team',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  ADMIN: '/admin',
  REPORTS: '/reports',
  CALENDAR: '/calendar',
  DOCUMENTS: '/documents',
} as const;

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    PROFILE: '/api/auth/profile',
  },
  PROJECTS: {
    LIST: '/api/projects',
    CREATE: '/api/projects',
    DETAIL: '/api/projects/[id]',
    UPDATE: '/api/projects/[id]',
    DELETE: '/api/projects/[id]',
    MEMBERS: '/api/projects/[id]/members',
    TASKS: '/api/projects/[id]/tasks',
    MATERIALS: '/api/projects/[id]/materials',
    DOCUMENTS: '/api/projects/[id]/documents',
  },
  TASKS: {
    LIST: '/api/tasks',
    CREATE: '/api/tasks',
    DETAIL: '/api/tasks/[id]',
    UPDATE: '/api/tasks/[id]',
    DELETE: '/api/tasks/[id]',
  },
  MATERIALS: {
    LIST: '/api/materials',
    CREATE: '/api/materials',
    DETAIL: '/api/materials/[id]',
    UPDATE: '/api/materials/[id]',
    DELETE: '/api/materials/[id]',
  },
  USERS: {
    LIST: '/api/users',
    DETAIL: '/api/users/[id]',
    UPDATE: '/api/users/[id]',
  },
  UPLOAD: {
    FILE: '/api/upload',
    IMAGE: '/api/upload/image',
  },
} as const;

export const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  JOIN_PROJECT: 'join_project',
  LEAVE_PROJECT: 'leave_project',
  PROJECT_UPDATE: 'project_update',
  TASK_UPDATE: 'task_update',
  TEAM_MESSAGE: 'team_message',
  NOTIFICATION: 'notification',
} as const;