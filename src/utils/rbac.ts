import { UserRole } from '@prisma/client';
import { AuthService } from '@/services/auth.service';

/**
 * Role-based access control utilities
 */
export class RBAC {
  /**
   * Check if user has permission for specific resource and action
   */
  static hasPermission(userRole: UserRole, resource: string, action: string): boolean {
    return AuthService.checkPermission(userRole, resource, action);
  }

  /**
   * Check if user can access project
   */
  static canAccessProject(userRole: UserRole, action: 'read' | 'update' | 'delete' | 'manage'): boolean {
    return this.hasPermission(userRole, 'projects', action);
  }

  /**
   * Check if user can manage tasks
   */
  static canManageTasks(userRole: UserRole, action: 'create' | 'read' | 'update' | 'delete' | 'assign'): boolean {
    return this.hasPermission(userRole, 'tasks', action);
  }

  /**
   * Check if user can manage materials
   */
  static canManageMaterials(userRole: UserRole, action: 'create' | 'read' | 'update' | 'delete' | 'order'): boolean {
    return this.hasPermission(userRole, 'materials', action);
  }

  /**
   * Check if user can manage documents
   */
  static canManageDocuments(userRole: UserRole, action: 'create' | 'read' | 'update' | 'delete' | 'approve' | 'share'): boolean {
    return this.hasPermission(userRole, 'documents', action);
  }

  /**
   * Check if user can manage team members
   */
  static canManageTeam(userRole: UserRole, action: 'read' | 'assign' | 'manage'): boolean {
    return this.hasPermission(userRole, 'team', action);
  }

  /**
   * Check if user can access reports
   */
  static canAccessReports(userRole: UserRole, action: 'create' | 'read' | 'export'): boolean {
    return this.hasPermission(userRole, 'reports', action);
  }

  /**
   * Check if user can manage system settings
   */
  static canManageSystem(userRole: UserRole, action: 'configure' | 'monitor' | 'backup'): boolean {
    return this.hasPermission(userRole, 'system', action);
  }

  /**
   * Get role hierarchy level (higher number = more privileges)
   */
  static getRoleLevel(role: UserRole): number {
    const hierarchy: Record<UserRole, number> = {
      [UserRole.WORKER]: 1,
      [UserRole.SUPPLIER]: 2,
      [UserRole.CLIENT]: 3,
      [UserRole.SITE_SUPERVISOR]: 4,
      [UserRole.PROJECT_MANAGER]: 5,
      [UserRole.ADMIN]: 6
    };

    return hierarchy[role] || 0;
  }

  /**
   * Check if user role has higher or equal privileges than required role
   */
  static hasRoleLevel(userRole: UserRole, requiredRole: UserRole): boolean {
    return this.getRoleLevel(userRole) >= this.getRoleLevel(requiredRole);
  }

  /**
   * Get construction-specific role permissions description
   */
  static getRoleDescription(role: UserRole): string {
    const descriptions: Record<UserRole, string> = {
      [UserRole.ADMIN]: 'Full system access with administrative privileges',
      [UserRole.PROJECT_MANAGER]: 'Manage projects, teams, and resources',
      [UserRole.SITE_SUPERVISOR]: 'Supervise on-site activities and manage workers',
      [UserRole.WORKER]: 'Execute assigned tasks and update progress',
      [UserRole.CLIENT]: 'View project progress and documents',
      [UserRole.SUPPLIER]: 'Manage materials and orders'
    };

    return descriptions[role] || 'Unknown role';
  }

  /**
   * Get available actions for role and resource
   */
  static getAvailableActions(userRole: UserRole, resource: string): string[] {
    const permissions = AuthService.getUserPermissions(userRole);
    const resourcePermission = permissions.find(p => p.resource === resource);
    return resourcePermission?.actions || [];
  }
}

/**
 * Construction industry specific permission constants
 */
export const CONSTRUCTION_PERMISSIONS = {
  PROJECTS: {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete',
    MANAGE: 'manage'
  },
  TASKS: {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete',
    ASSIGN: 'assign'
  },
  MATERIALS: {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete',
    ORDER: 'order'
  },
  DOCUMENTS: {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete',
    APPROVE: 'approve',
    SHARE: 'share'
  },
  TEAM: {
    READ: 'read',
    ASSIGN: 'assign',
    MANAGE: 'manage'
  },
  REPORTS: {
    CREATE: 'create',
    READ: 'read',
    EXPORT: 'export'
  },
  SYSTEM: {
    CONFIGURE: 'configure',
    MONITOR: 'monitor',
    BACKUP: 'backup'
  }
} as const;