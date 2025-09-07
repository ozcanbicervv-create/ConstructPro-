import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { UserRole } from '@prisma/client';

import { SessionManager, AuthAuditLogger } from '@/middleware/auth.middleware';
import { AuthService } from '@/services/auth.service';
import { RBAC } from '@/utils/rbac';


// Mock dependencies
jest.mock('@/utils/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    }
  }
}));
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('otplib');

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    count: jest.fn(),
  }
};

describe('Enhanced Authentication System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('AuthService', () => {
    describe('register', () => {
      it('should register a new user successfully', async () => {
        const userData = {
          email: 'test@example.com',
          password: 'Password123',
          firstName: 'John',
          lastName: 'Doe',
          role: UserRole.WORKER
        };

        const mockUser = {
          id: 'user-1',
          email: userData.email,
          password: 'hashed-password',
          firstName: userData.firstName,
          lastName: userData.lastName,
          name: 'John Doe',
          role: userData.role,
          mfaEnabled: false,
          isOnline: true,
          lastActive: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        };

        mockPrisma.user.findUnique.mockResolvedValue(null);
        mockPrisma.user.create.mockResolvedValue(mockUser as any);

        const result = await AuthService.register(userData);

        expect(result.user.email).toBe(userData.email);
        expect(result.accessToken).toBeDefined();
        expect(result.refreshToken).toBeDefined();
        expect(mockPrisma.user.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role
          })
        });
      });

      it('should throw error if user already exists', async () => {
        const userData = {
          email: 'existing@example.com',
          password: 'Password123'
        };

        mockPrisma.user.findUnique.mockResolvedValue({
          id: 'existing-user',
          email: userData.email
        } as any);

        await expect(AuthService.register(userData)).rejects.toThrow(
          'User with this email already exists'
        );
      });
    });

    describe('login', () => {
      it('should login user with valid credentials', async () => {
        const credentials = {
          email: 'test@example.com',
          password: 'Password123'
        };

        const mockUser = {
          id: 'user-1',
          email: credentials.email,
          password: 'hashed-password',
          mfaEnabled: false,
          isOnline: false,
          lastActive: new Date()
        };

        mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);
        mockPrisma.user.update.mockResolvedValue(mockUser as any);

        // Mock bcrypt compare
        const bcrypt = require('bcryptjs');
        bcrypt.compare.mockResolvedValue(true);

        const result = await AuthService.login(credentials);

        expect(result.user.email).toBe(credentials.email);
        expect(result.accessToken).toBeDefined();
        expect(result.refreshToken).toBeDefined();
        expect(result.requiresMFA).toBeUndefined();
      });

      it('should require MFA when enabled', async () => {
        const credentials = {
          email: 'test@example.com',
          password: 'Password123'
        };

        const mockUser = {
          id: 'user-1',
          email: credentials.email,
          password: 'hashed-password',
          mfaEnabled: true,
          mfaSecret: 'secret',
          isOnline: false,
          lastActive: new Date()
        };

        mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);

        // Mock bcrypt compare
        const bcrypt = require('bcryptjs');
        bcrypt.compare.mockResolvedValue(true);

        const result = await AuthService.login(credentials);

        expect(result.requiresMFA).toBe(true);
        expect(result.accessToken).toBe('');
        expect(result.refreshToken).toBe('');
      });

      it('should throw error for invalid credentials', async () => {
        const credentials = {
          email: 'test@example.com',
          password: 'WrongPassword'
        };

        mockPrisma.user.findUnique.mockResolvedValue(null);

        await expect(AuthService.login(credentials)).rejects.toThrow(
          'Invalid credentials'
        );
      });
    });

    describe('MFA functionality', () => {
      it('should setup MFA for user', async () => {
        const userId = 'user-1';
        const mockUser = {
          id: userId,
          email: 'test@example.com'
        };

        mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);
        mockPrisma.user.update.mockResolvedValue(mockUser as any);

        // Mock otplib
        const { authenticator } = require('otplib');
        authenticator.generateSecret.mockReturnValue('secret');
        authenticator.keyuri.mockReturnValue('otpauth://totp/...');

        const result = await AuthService.enableMFA(userId);

        expect(result.secret).toBeDefined();
        expect(result.qrCodeUrl).toBeDefined();
        expect(result.backupCodes).toHaveLength(10);
        expect(mockPrisma.user.update).toHaveBeenCalledWith({
          where: { id: userId },
          data: expect.objectContaining({
            mfaSecret: 'secret',
            backupCodes: expect.any(Array)
          })
        });
      });

      it('should verify MFA code and enable MFA', async () => {
        const userId = 'user-1';
        const code = '123456';
        const mockUser = {
          id: userId,
          mfaSecret: 'secret'
        };

        mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);
        mockPrisma.user.update.mockResolvedValue(mockUser as any);

        // Mock otplib
        const { authenticator } = require('otplib');
        authenticator.verify.mockReturnValue(true);

        const result = await AuthService.verifyMFA(userId, code);

        expect(result).toBe(true);
        expect(mockPrisma.user.update).toHaveBeenCalledWith({
          where: { id: userId },
          data: { mfaEnabled: true }
        });
      });

      it('should disable MFA with valid password', async () => {
        const userId = 'user-1';
        const password = 'Password123';
        const mockUser = {
          id: userId,
          password: 'hashed-password'
        };

        mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);
        mockPrisma.user.update.mockResolvedValue(mockUser as any);

        // Mock bcrypt compare
        const bcrypt = require('bcryptjs');
        bcrypt.compare.mockResolvedValue(true);

        await AuthService.disableMFA(userId, password);

        expect(mockPrisma.user.update).toHaveBeenCalledWith({
          where: { id: userId },
          data: {
            mfaEnabled: false,
            mfaSecret: null,
            backupCodes: []
          }
        });
      });
    });
  });

  describe('RBAC (Role-Based Access Control)', () => {
    it('should check permissions correctly for different roles', () => {
      // Admin should have all permissions
      expect(RBAC.hasPermission(UserRole.ADMIN, 'projects', 'create')).toBe(true);
      expect(RBAC.hasPermission(UserRole.ADMIN, 'users', 'manage')).toBe(true);
      expect(RBAC.hasPermission(UserRole.ADMIN, 'system', 'configure')).toBe(true);

      // Project Manager should have project permissions but not system
      expect(RBAC.hasPermission(UserRole.PROJECT_MANAGER, 'projects', 'create')).toBe(true);
      expect(RBAC.hasPermission(UserRole.PROJECT_MANAGER, 'tasks', 'assign')).toBe(true);
      expect(RBAC.hasPermission(UserRole.PROJECT_MANAGER, 'system', 'configure')).toBe(false);

      // Worker should have limited permissions
      expect(RBAC.hasPermission(UserRole.WORKER, 'tasks', 'read')).toBe(true);
      expect(RBAC.hasPermission(UserRole.WORKER, 'tasks', 'create')).toBe(false);
      expect(RBAC.hasPermission(UserRole.WORKER, 'projects', 'delete')).toBe(false);

      // Client should have read-only access
      expect(RBAC.hasPermission(UserRole.CLIENT, 'projects', 'read')).toBe(true);
      expect(RBAC.hasPermission(UserRole.CLIENT, 'projects', 'update')).toBe(false);
    });

    it('should check role hierarchy correctly', () => {
      expect(RBAC.hasRoleLevel(UserRole.ADMIN, UserRole.PROJECT_MANAGER)).toBe(true);
      expect(RBAC.hasRoleLevel(UserRole.PROJECT_MANAGER, UserRole.WORKER)).toBe(true);
      expect(RBAC.hasRoleLevel(UserRole.WORKER, UserRole.PROJECT_MANAGER)).toBe(false);
      expect(RBAC.hasRoleLevel(UserRole.CLIENT, UserRole.ADMIN)).toBe(false);
    });

    it('should return correct role descriptions', () => {
      expect(RBAC.getRoleDescription(UserRole.ADMIN)).toContain('administrative');
      expect(RBAC.getRoleDescription(UserRole.PROJECT_MANAGER)).toContain('Manage projects');
      expect(RBAC.getRoleDescription(UserRole.WORKER)).toContain('Execute assigned tasks');
    });
  });

  describe('SessionManager', () => {
    it('should check session activity correctly', async () => {
      const userId = 'user-1';
      const recentTime = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago

      mockPrisma.user.findUnique.mockResolvedValue({
        id: userId,
        isOnline: true,
        lastActive: recentTime
      } as any);

      const isActive = await SessionManager.isSessionActive(userId);
      expect(isActive).toBe(true);
    });

    it('should identify inactive sessions', async () => {
      const userId = 'user-1';
      const oldTime = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

      mockPrisma.user.findUnique.mockResolvedValue({
        id: userId,
        isOnline: true,
        lastActive: oldTime
      } as any);

      const isActive = await SessionManager.isSessionActive(userId);
      expect(isActive).toBe(false);
    });

    it('should cleanup inactive sessions', async () => {
      mockPrisma.user.updateMany.mockResolvedValue({ count: 5 });

      await SessionManager.cleanupInactiveSessions();

      expect(mockPrisma.user.updateMany).toHaveBeenCalledWith({
        where: {
          isOnline: true,
          lastActive: {
            lt: expect.any(Date)
          }
        },
        data: {
          isOnline: false
        }
      });
    });

    it('should force logout user', async () => {
      const userId = 'user-1';
      mockPrisma.user.update.mockResolvedValue({} as any);

      await SessionManager.forceLogout(userId);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { isOnline: false }
      });
    });

    it('should get active sessions count', async () => {
      mockPrisma.user.count.mockResolvedValue(10);

      const count = await SessionManager.getActiveSessionsCount();

      expect(count).toBe(10);
      expect(mockPrisma.user.count).toHaveBeenCalledWith({
        where: { isOnline: true }
      });
    });
  });

  describe('AuthAuditLogger', () => {
    it('should log authentication events', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await AuthAuditLogger.logAuthEvent('user-1', 'login', {
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1'
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'AUTH_AUDIT:',
        expect.stringContaining('"userId":"user-1"')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'AUTH_AUDIT:',
        expect.stringContaining('"event":"login"')
      );

      consoleSpy.mockRestore();
    });

    it('should handle logging errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {
        throw new Error('Logging failed');
      });

      await AuthAuditLogger.logAuthEvent('user-1', 'login');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to log auth event:',
        expect.any(Error)
      );

      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });
});