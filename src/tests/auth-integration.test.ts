import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { RBAC } from '@/utils/rbac';
import { UserRole } from '@prisma/client';

describe('Authentication Integration Tests', () => {
  describe('RBAC (Role-Based Access Control)', () => {
    it('should check permissions correctly for ADMIN role', () => {
      // Admin should have all permissions
      expect(RBAC.hasPermission(UserRole.ADMIN, 'projects', 'create')).toBe(true);
      expect(RBAC.hasPermission(UserRole.ADMIN, 'users', 'manage')).toBe(true);
      expect(RBAC.hasPermission(UserRole.ADMIN, 'system', 'configure')).toBe(true);
      expect(RBAC.hasPermission(UserRole.ADMIN, 'materials', 'order')).toBe(true);
      expect(RBAC.hasPermission(UserRole.ADMIN, 'documents', 'approve')).toBe(true);
    });

    it('should check permissions correctly for PROJECT_MANAGER role', () => {
      // Project Manager should have project permissions but not system
      expect(RBAC.hasPermission(UserRole.PROJECT_MANAGER, 'projects', 'create')).toBe(true);
      expect(RBAC.hasPermission(UserRole.PROJECT_MANAGER, 'tasks', 'assign')).toBe(true);
      expect(RBAC.hasPermission(UserRole.PROJECT_MANAGER, 'materials', 'order')).toBe(true);
      expect(RBAC.hasPermission(UserRole.PROJECT_MANAGER, 'documents', 'approve')).toBe(true);
      expect(RBAC.hasPermission(UserRole.PROJECT_MANAGER, 'system', 'configure')).toBe(false);
      expect(RBAC.hasPermission(UserRole.PROJECT_MANAGER, 'users', 'manage')).toBe(false);
    });

    it('should check permissions correctly for SITE_SUPERVISOR role', () => {
      expect(RBAC.hasPermission(UserRole.SITE_SUPERVISOR, 'projects', 'read')).toBe(true);
      expect(RBAC.hasPermission(UserRole.SITE_SUPERVISOR, 'tasks', 'assign')).toBe(true);
      expect(RBAC.hasPermission(UserRole.SITE_SUPERVISOR, 'materials', 'update')).toBe(true);
      expect(RBAC.hasPermission(UserRole.SITE_SUPERVISOR, 'documents', 'create')).toBe(true);
      expect(RBAC.hasPermission(UserRole.SITE_SUPERVISOR, 'projects', 'create')).toBe(false);
      expect(RBAC.hasPermission(UserRole.SITE_SUPERVISOR, 'materials', 'order')).toBe(false);
    });

    it('should check permissions correctly for WORKER role', () => {
      // Worker should have limited permissions
      expect(RBAC.hasPermission(UserRole.WORKER, 'tasks', 'read')).toBe(true);
      expect(RBAC.hasPermission(UserRole.WORKER, 'tasks', 'update')).toBe(true);
      expect(RBAC.hasPermission(UserRole.WORKER, 'documents', 'read')).toBe(true);
      expect(RBAC.hasPermission(UserRole.WORKER, 'documents', 'create')).toBe(true);
      expect(RBAC.hasPermission(UserRole.WORKER, 'tasks', 'create')).toBe(false);
      expect(RBAC.hasPermission(UserRole.WORKER, 'projects', 'delete')).toBe(false);
      expect(RBAC.hasPermission(UserRole.WORKER, 'materials', 'order')).toBe(false);
    });

    it('should check permissions correctly for CLIENT role', () => {
      // Client should have read-only access
      expect(RBAC.hasPermission(UserRole.CLIENT, 'projects', 'read')).toBe(true);
      expect(RBAC.hasPermission(UserRole.CLIENT, 'tasks', 'read')).toBe(true);
      expect(RBAC.hasPermission(UserRole.CLIENT, 'documents', 'read')).toBe(true);
      expect(RBAC.hasPermission(UserRole.CLIENT, 'reports', 'read')).toBe(true);
      expect(RBAC.hasPermission(UserRole.CLIENT, 'projects', 'update')).toBe(false);
      expect(RBAC.hasPermission(UserRole.CLIENT, 'tasks', 'create')).toBe(false);
      expect(RBAC.hasPermission(UserRole.CLIENT, 'materials', 'order')).toBe(false);
    });

    it('should check permissions correctly for SUPPLIER role', () => {
      expect(RBAC.hasPermission(UserRole.SUPPLIER, 'materials', 'read')).toBe(true);
      expect(RBAC.hasPermission(UserRole.SUPPLIER, 'materials', 'update')).toBe(true);
      expect(RBAC.hasPermission(UserRole.SUPPLIER, 'orders', 'read')).toBe(true);
      expect(RBAC.hasPermission(UserRole.SUPPLIER, 'orders', 'update')).toBe(true);
      expect(RBAC.hasPermission(UserRole.SUPPLIER, 'documents', 'create')).toBe(true);
      expect(RBAC.hasPermission(UserRole.SUPPLIER, 'projects', 'create')).toBe(false);
      expect(RBAC.hasPermission(UserRole.SUPPLIER, 'tasks', 'assign')).toBe(false);
    });

    it('should check role hierarchy correctly', () => {
      expect(RBAC.hasRoleLevel(UserRole.ADMIN, UserRole.PROJECT_MANAGER)).toBe(true);
      expect(RBAC.hasRoleLevel(UserRole.PROJECT_MANAGER, UserRole.SITE_SUPERVISOR)).toBe(true);
      expect(RBAC.hasRoleLevel(UserRole.SITE_SUPERVISOR, UserRole.WORKER)).toBe(true);
      expect(RBAC.hasRoleLevel(UserRole.WORKER, UserRole.PROJECT_MANAGER)).toBe(false);
      expect(RBAC.hasRoleLevel(UserRole.CLIENT, UserRole.ADMIN)).toBe(false);
      expect(RBAC.hasRoleLevel(UserRole.SUPPLIER, UserRole.PROJECT_MANAGER)).toBe(false);
    });

    it('should return correct role levels', () => {
      expect(RBAC.getRoleLevel(UserRole.ADMIN)).toBe(6);
      expect(RBAC.getRoleLevel(UserRole.PROJECT_MANAGER)).toBe(5);
      expect(RBAC.getRoleLevel(UserRole.SITE_SUPERVISOR)).toBe(4);
      expect(RBAC.getRoleLevel(UserRole.CLIENT)).toBe(3);
      expect(RBAC.getRoleLevel(UserRole.SUPPLIER)).toBe(2);
      expect(RBAC.getRoleLevel(UserRole.WORKER)).toBe(1);
    });

    it('should return correct role descriptions', () => {
      expect(RBAC.getRoleDescription(UserRole.ADMIN)).toContain('administrative');
      expect(RBAC.getRoleDescription(UserRole.PROJECT_MANAGER)).toContain('Manage projects');
      expect(RBAC.getRoleDescription(UserRole.SITE_SUPERVISOR)).toContain('Supervise');
      expect(RBAC.getRoleDescription(UserRole.WORKER)).toContain('Execute assigned tasks');
      expect(RBAC.getRoleDescription(UserRole.CLIENT)).toContain('View project');
      expect(RBAC.getRoleDescription(UserRole.SUPPLIER)).toContain('Manage materials');
    });

    it('should get available actions for role and resource', () => {
      const adminProjectActions = RBAC.getAvailableActions(UserRole.ADMIN, 'projects');
      expect(adminProjectActions).toContain('create');
      expect(adminProjectActions).toContain('read');
      expect(adminProjectActions).toContain('update');
      expect(adminProjectActions).toContain('delete');
      expect(adminProjectActions).toContain('manage');

      const workerProjectActions = RBAC.getAvailableActions(UserRole.WORKER, 'projects');
      expect(workerProjectActions).toContain('read');
      expect(workerProjectActions).not.toContain('create');
      expect(workerProjectActions).not.toContain('delete');

      const clientTaskActions = RBAC.getAvailableActions(UserRole.CLIENT, 'tasks');
      expect(clientTaskActions).toContain('read');
      expect(clientTaskActions).not.toContain('create');
      expect(clientTaskActions).not.toContain('update');
      expect(clientTaskActions).not.toContain('assign');
    });
  });

  describe('Construction-specific permissions', () => {
    it('should validate project management permissions', () => {
      expect(RBAC.canAccessProject(UserRole.ADMIN, 'manage')).toBe(true);
      expect(RBAC.canAccessProject(UserRole.PROJECT_MANAGER, 'manage')).toBe(true);
      expect(RBAC.canAccessProject(UserRole.SITE_SUPERVISOR, 'read')).toBe(true);
      expect(RBAC.canAccessProject(UserRole.WORKER, 'read')).toBe(true);
      expect(RBAC.canAccessProject(UserRole.CLIENT, 'read')).toBe(true);
      
      expect(RBAC.canAccessProject(UserRole.WORKER, 'manage')).toBe(false);
      expect(RBAC.canAccessProject(UserRole.CLIENT, 'update')).toBe(false);
      expect(RBAC.canAccessProject(UserRole.SUPPLIER, 'delete')).toBe(false);
    });

    it('should validate task management permissions', () => {
      expect(RBAC.canManageTasks(UserRole.ADMIN, 'assign')).toBe(true);
      expect(RBAC.canManageTasks(UserRole.PROJECT_MANAGER, 'assign')).toBe(true);
      expect(RBAC.canManageTasks(UserRole.SITE_SUPERVISOR, 'assign')).toBe(true);
      expect(RBAC.canManageTasks(UserRole.WORKER, 'update')).toBe(true);
      
      expect(RBAC.canManageTasks(UserRole.WORKER, 'create')).toBe(false);
      expect(RBAC.canManageTasks(UserRole.CLIENT, 'assign')).toBe(false);
      expect(RBAC.canManageTasks(UserRole.SUPPLIER, 'delete')).toBe(false);
    });

    it('should validate material management permissions', () => {
      expect(RBAC.canManageMaterials(UserRole.ADMIN, 'order')).toBe(true);
      expect(RBAC.canManageMaterials(UserRole.PROJECT_MANAGER, 'order')).toBe(true);
      expect(RBAC.canManageMaterials(UserRole.SUPPLIER, 'update')).toBe(true);
      expect(RBAC.canManageMaterials(UserRole.SITE_SUPERVISOR, 'update')).toBe(true);
      
      expect(RBAC.canManageMaterials(UserRole.WORKER, 'order')).toBe(false);
      expect(RBAC.canManageMaterials(UserRole.CLIENT, 'create')).toBe(false);
      expect(RBAC.canManageMaterials(UserRole.SUPPLIER, 'delete')).toBe(false);
    });

    it('should validate document management permissions', () => {
      expect(RBAC.canManageDocuments(UserRole.ADMIN, 'approve')).toBe(true);
      expect(RBAC.canManageDocuments(UserRole.PROJECT_MANAGER, 'approve')).toBe(true);
      expect(RBAC.canManageDocuments(UserRole.SITE_SUPERVISOR, 'create')).toBe(true);
      expect(RBAC.canManageDocuments(UserRole.WORKER, 'create')).toBe(true);
      expect(RBAC.canManageDocuments(UserRole.SUPPLIER, 'create')).toBe(true);
      
      expect(RBAC.canManageDocuments(UserRole.WORKER, 'approve')).toBe(false);
      expect(RBAC.canManageDocuments(UserRole.CLIENT, 'create')).toBe(false);
      expect(RBAC.canManageDocuments(UserRole.SITE_SUPERVISOR, 'approve')).toBe(false);
    });

    it('should validate team management permissions', () => {
      expect(RBAC.canManageTeam(UserRole.ADMIN, 'manage')).toBe(true);
      expect(RBAC.canManageTeam(UserRole.PROJECT_MANAGER, 'manage')).toBe(true);
      expect(RBAC.canManageTeam(UserRole.SITE_SUPERVISOR, 'assign')).toBe(true);
      
      expect(RBAC.canManageTeam(UserRole.WORKER, 'manage')).toBe(false);
      expect(RBAC.canManageTeam(UserRole.CLIENT, 'assign')).toBe(false);
      expect(RBAC.canManageTeam(UserRole.SUPPLIER, 'manage')).toBe(false);
    });

    it('should validate report access permissions', () => {
      expect(RBAC.canAccessReports(UserRole.ADMIN, 'export')).toBe(true);
      expect(RBAC.canAccessReports(UserRole.PROJECT_MANAGER, 'export')).toBe(true);
      expect(RBAC.canAccessReports(UserRole.SITE_SUPERVISOR, 'create')).toBe(true);
      expect(RBAC.canAccessReports(UserRole.WORKER, 'read')).toBe(true);
      expect(RBAC.canAccessReports(UserRole.CLIENT, 'read')).toBe(true);
      
      expect(RBAC.canAccessReports(UserRole.WORKER, 'export')).toBe(false);
      expect(RBAC.canAccessReports(UserRole.CLIENT, 'create')).toBe(false);
      expect(RBAC.canAccessReports(UserRole.SUPPLIER, 'export')).toBe(false);
    });

    it('should validate system management permissions', () => {
      expect(RBAC.canManageSystem(UserRole.ADMIN, 'configure')).toBe(true);
      expect(RBAC.canManageSystem(UserRole.ADMIN, 'monitor')).toBe(true);
      expect(RBAC.canManageSystem(UserRole.ADMIN, 'backup')).toBe(true);
      
      expect(RBAC.canManageSystem(UserRole.PROJECT_MANAGER, 'configure')).toBe(false);
      expect(RBAC.canManageSystem(UserRole.SITE_SUPERVISOR, 'monitor')).toBe(false);
      expect(RBAC.canManageSystem(UserRole.WORKER, 'backup')).toBe(false);
      expect(RBAC.canManageSystem(UserRole.CLIENT, 'configure')).toBe(false);
      expect(RBAC.canManageSystem(UserRole.SUPPLIER, 'monitor')).toBe(false);
    });
  });
});