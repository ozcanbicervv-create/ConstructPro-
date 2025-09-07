// User-related type definitions

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role: UserRole;
  company?: string;
  title?: string;
  phone?: string;
  image?: string;
  isOnline: boolean;
  lastActive: Date;
  mfaEnabled: boolean;
  mfaSecret?: string;
  backupCodes?: string[];
  theme: string;
  language: string;
  preferences?: any;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  SITE_SUPERVISOR = 'SITE_SUPERVISOR',
  WORKER = 'WORKER',
  CLIENT = 'CLIENT',
  SUPPLIER = 'SUPPLIER'
}

export interface UserProfile extends User {
  stats: UserStats;
  preferences: UserPreferences;
}

export interface UserStats {
  projectsCount: number;
  tasksCompleted: number;
  totalHours: number;
  rating: number;
  reviewsCount: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisible: boolean;
    showEmail: boolean;
    showPhone: boolean;
  };
}

// Multi-Factor Authentication types
export interface MFASetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface MFAVerificationRequest {
  code: string;
}

// Enhanced user types for construction industry
export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  joinedAt: Date;
  user?: User;
}

export enum ProjectRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  SUPERVISOR = 'SUPERVISOR',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER'
}