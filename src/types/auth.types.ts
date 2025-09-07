import { UserRole } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  name?: string;
  company?: string;
  title?: string;
  phone?: string;
  mfaEnabled: boolean;
  isOnline: boolean;
  lastActive: Date;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
}

export interface MFASetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  title?: string;
  phone?: string;
  role?: UserRole;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export interface AuthError {
  code: string;
  message: string;
  statusCode: number;
}

export interface AuditLogEntry {
  userId: string;
  event: 'login' | 'logout' | 'mfa_enabled' | 'mfa_disabled' | 'password_changed' | 'failed_login';
  timestamp: Date;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    mfaUsed?: boolean;
    success?: boolean;
    reason?: string;
    [key: string]: any;
  };
}

export interface SessionInfo {
  userId: string;
  isActive: boolean;
  lastActive: Date;
  userAgent?: string;
  ipAddress?: string;
}

export interface PermissionCheck {
  resource: string;
  action: string;
  allowed: boolean;
}

export interface RolePermissions {
  role: UserRole;
  permissions: {
    resource: string;
    actions: string[];
  }[];
}

// Construction-specific role types
export type ConstructionRole = 
  | 'ADMIN'
  | 'PROJECT_MANAGER' 
  | 'SITE_SUPERVISOR'
  | 'WORKER'
  | 'CLIENT'
  | 'SUPPLIER';

// Permission resources specific to construction industry
export type ConstructionResource = 
  | 'projects'
  | 'tasks'
  | 'materials'
  | 'documents'
  | 'team'
  | 'reports'
  | 'system'
  | 'orders';

// Permission actions
export type PermissionAction = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'manage'
  | 'assign'
  | 'approve'
  | 'share'
  | 'export'
  | 'configure'
  | 'monitor'
  | 'backup'
  | 'order';