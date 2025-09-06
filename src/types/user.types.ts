// User-related type definitions

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name?: string;
  role: 'admin' | 'user' | 'manager';
  company?: string;
  title?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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