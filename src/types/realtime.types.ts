// Real-time communication type definitions

export interface SocketUser {
  id: string;
  socketId: string;
  userId: string;
  projectIds: string[];
  isOnline: boolean;
  lastSeen: Date;
}

export interface ProjectRoom {
  projectId: string;
  members: SocketUser[];
  activeUsers: number;
}

// Real-time events
export enum SocketEvents {
  // Connection events
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  JOIN_PROJECT = 'join_project',
  LEAVE_PROJECT = 'leave_project',
  
  // Presence events
  USER_ONLINE = 'user_online',
  USER_OFFLINE = 'user_offline',
  USER_TYPING = 'user_typing',
  USER_STOP_TYPING = 'user_stop_typing',
  
  // Project events
  PROJECT_UPDATED = 'project_updated',
  PROJECT_STATUS_CHANGED = 'project_status_changed',
  PROJECT_MEMBER_ADDED = 'project_member_added',
  PROJECT_MEMBER_REMOVED = 'project_member_removed',
  
  // Task events
  TASK_CREATED = 'task_created',
  TASK_UPDATED = 'task_updated',
  TASK_ASSIGNED = 'task_assigned',
  TASK_STATUS_CHANGED = 'task_status_changed',
  TASK_COMMENT_ADDED = 'task_comment_added',
  TASK_ATTACHMENT_ADDED = 'task_attachment_added',
  
  // Material events
  MATERIAL_UPDATED = 'material_updated',
  MATERIAL_ORDER_CREATED = 'material_order_created',
  
  // Document events
  DOCUMENT_UPLOADED = 'document_uploaded',
  DOCUMENT_SHARED = 'document_shared',
  DOCUMENT_APPROVED = 'document_approved',
  
  // Notification events
  NOTIFICATION_SENT = 'notification_sent',
  NOTIFICATION_READ = 'notification_read',
  
  // Collaborative editing
  DOCUMENT_EDIT_START = 'document_edit_start',
  DOCUMENT_EDIT_END = 'document_edit_end',
  DOCUMENT_CURSOR_MOVE = 'document_cursor_move',
  DOCUMENT_CONTENT_CHANGE = 'document_content_change'
}

// Notification system
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  priority: NotificationPriority;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export enum NotificationType {
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

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

// Real-time event payloads
export interface ProjectUpdatePayload {
  projectId: string;
  updatedBy: string;
  changes: Record<string, any>;
  timestamp: Date;
}

export interface TaskUpdatePayload {
  taskId: string;
  projectId: string;
  updatedBy: string;
  changes: Record<string, any>;
  timestamp: Date;
}

export interface UserPresencePayload {
  userId: string;
  isOnline: boolean;
  lastSeen: Date;
  projectId?: string;
}

export interface TypingIndicatorPayload {
  userId: string;
  projectId: string;
  taskId?: string;
  documentId?: string;
  isTyping: boolean;
}

export interface CollaborativeEditPayload {
  documentId: string;
  userId: string;
  action: 'start' | 'end' | 'cursor' | 'content';
  position?: number;
  content?: string;
  timestamp: Date;
}

// Socket server interfaces
export interface SocketServer {
  joinProject(userId: string, projectId: string): Promise<void>;
  leaveProject(userId: string, projectId: string): Promise<void>;
  broadcastToProject(projectId: string, event: string, data: any): void;
  broadcastToUser(userId: string, event: string, data: any): void;
  updateUserPresence(userId: string, isOnline: boolean): Promise<void>;
  getProjectMembers(projectId: string): SocketUser[];
  sendNotification(notification: Notification): Promise<void>;
}

// Client-side socket interface
export interface SocketClient {
  connect(): void;
  disconnect(): void;
  joinProject(projectId: string): void;
  leaveProject(projectId: string): void;
  sendMessage(message: any): void;
  on(event: string, callback: (data: any) => void): void;
  off(event: string, callback?: (data: any) => void): void;
  emit(event: string, data: any): void;
}