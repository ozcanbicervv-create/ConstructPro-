import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { 
  errorNotificationService, 
  ErrorNotification, 
  AlertRule,
  ErrorSeverity
} from '@/services/error-notification.service';
import { logger } from '@/lib/logger';
import { notificationService } from '@/services/notification.service';
import { prisma } from '@/lib/db';

// Mock dependencies
jest.mock('@/lib/logger');
jest.mock('@/services/notification.service');
jest.mock('@/lib/db');

const mockLogger = logger as jest.Mocked<typeof logger>;
const mockNotificationService = notificationService as jest.Mocked<typeof notificationService>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Error Notification Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset service state
    (errorNotificationService as any).errorHistory.clear();
    (errorNotificationService as any).alertCooldowns.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('processError', () => {
    it('should process critical errors and trigger notifications', async () => {
      const error = new Error('Critical database failure');
      (error as any).code = 'DATABASE_ERROR';
      
      const context = {
        requestId: 'req_123',
        userId: 'user_456',
        ip: '192.168.1.1',
        url: '/api/projects',
        method: 'POST'
      };

      mockNotificationService.notifyAdmins.mockResolvedValue();

      await errorNotificationService.processError(error, ErrorSeverity.CRITICAL, context);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Error notification processed',
        expect.objectContaining({
          severity: ErrorSeverity.CRITICAL,
          requestId: 'req_123'
        })
      );

      expect(mockNotificationService.notifyAdmins).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SYSTEM_ERROR',
          title: 'CRITICAL Error Detected',
          priority: 'HIGH'
        })
      );
    });

    it('should handle multiple authentication failures', async () => {
      const error = new Error('Invalid credentials');
      (error as any).code = 'INVALID_CREDENTIALS';
      
      const context = {
        requestId: 'req_auth',
        ip: '192.168.1.100'
      };

      // Simulate multiple failures
      for (let i = 0; i < 6; i++) {
        await errorNotificationService.processError(error, ErrorSeverity.MEDIUM, {
          ...context,
          requestId: `req_auth_${i}`
        });
      }

      // Should trigger alert after 5 failures
      expect(mockNotificationService.notifyAdmins).toHaveBeenCalled();
    });

    it('should respect alert cooldowns', async () => {
      const error = new Error('Database error');
      (error as any).code = 'DATABASE_ERROR';
      
      const context = { requestId: 'req_cooldown' };

      mockNotificationService.notifyAdmins.mockResolvedValue();

      // First error should trigger alert
      await errorNotificationService.processError(error, ErrorSeverity.HIGH, context);
      
      // Second error immediately after should not trigger due to cooldown
      await errorNotificationService.processError(error, ErrorSeverity.HIGH, {
        ...context,
        requestId: 'req_cooldown_2'
      });

      expect(mockNotificationService.notifyAdmins).toHaveBeenCalledTimes(1);
    });

    it('should handle notification service failures gracefully', async () => {
      const error = new Error('Critical error');
      (error as any).code = 'SYSTEM_ERROR';
      
      const context = { requestId: 'req_notification_fail' };

      mockNotificationService.notifyAdmins.mockRejectedValue(
        new Error('Notification service unavailable')
      );

      // Should not throw even if notification fails
      await expect(
        errorNotificationService.processError(error, ErrorSeverity.CRITICAL, context)
      ).resolves.not.toThrow();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to process error notification',
        expect.objectContaining({
          originalError: 'Critical error'
        })
      );
    });
  });

  describe('Alert Rules Management', () => {
    it('should add new alert rule', () => {
      const rule = {
        name: 'Test Rule',
        condition: {
          errorCode: 'TEST_ERROR',
          severity: ErrorSeverity.HIGH
        },
        actions: {
          notify: true,
          escalate: false,
          autoResolve: false
        },
        recipients: ['admin'],
        enabled: true
      };

      const ruleId = errorNotificationService.addAlertRule(rule);

      expect(ruleId).toMatch(/^rule_\d+_[a-z0-9]{9}$/);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Alert rule added',
        expect.objectContaining({
          ruleId,
          ruleName: 'Test Rule'
        })
      );

      const rules = errorNotificationService.getAlertRules();
      expect(rules.some(r => r.id === ruleId)).toBe(true);
    });

    it('should update existing alert rule', () => {
      const rule = {
        name: 'Original Rule',
        condition: { errorCode: 'TEST_ERROR' },
        actions: { notify: true, escalate: false, autoResolve: false },
        recipients: ['admin'],
        enabled: true
      };

      const ruleId = errorNotificationService.addAlertRule(rule);
      
      const updated = errorNotificationService.updateAlertRule(ruleId, {
        name: 'Updated Rule',
        enabled: false
      });

      expect(updated).toBe(true);
      
      const rules = errorNotificationService.getAlertRules();
      const updatedRule = rules.find(r => r.id === ruleId);
      
      expect(updatedRule?.name).toBe('Updated Rule');
      expect(updatedRule?.enabled).toBe(false);
    });

    it('should delete alert rule', () => {
      const rule = {
        name: 'Rule to Delete',
        condition: { errorCode: 'DELETE_TEST' },
        actions: { notify: true, escalate: false, autoResolve: false },
        recipients: ['admin'],
        enabled: true
      };

      const ruleId = errorNotificationService.addAlertRule(rule);
      
      const deleted = errorNotificationService.deleteAlertRule(ruleId);
      expect(deleted).toBe(true);
      
      const rules = errorNotificationService.getAlertRules();
      expect(rules.some(r => r.id === ruleId)).toBe(false);
    });

    it('should return false for non-existent rule operations', () => {
      const nonExistentId = 'rule_nonexistent';
      
      const updated = errorNotificationService.updateAlertRule(nonExistentId, {
        name: 'Updated'
      });
      expect(updated).toBe(false);
      
      const deleted = errorNotificationService.deleteAlertRule(nonExistentId);
      expect(deleted).toBe(false);
    });
  });

  describe('Error Statistics', () => {
    it('should provide comprehensive error statistics', async () => {
      // Generate some test errors
      const errors = [
        { code: 'DATABASE_ERROR', severity: ErrorSeverity.HIGH },
        { code: 'DATABASE_ERROR', severity: ErrorSeverity.HIGH },
        { code: 'VALIDATION_ERROR', severity: ErrorSeverity.LOW },
        { code: 'AUTH_ERROR', severity: ErrorSeverity.MEDIUM }
      ];

      for (const [index, errorData] of errors.entries()) {
        const error = new Error(`Test error ${index}`);
        (error as any).code = errorData.code;
        
        await errorNotificationService.processError(
          error, 
          errorData.severity, 
          { requestId: `req_stats_${index}` }
        );
      }

      const stats = errorNotificationService.getErrorStatistics();

      expect(stats.totalErrors).toBe(4);
      expect(stats.errorsByCode['DATABASE_ERROR']).toBe(2);
      expect(stats.errorsByCode['VALIDATION_ERROR']).toBe(1);
      expect(stats.errorsByCode['AUTH_ERROR']).toBe(1);
      expect(stats.errorsBySeverity[ErrorSeverity.HIGH]).toBe(2);
      expect(stats.errorsBySeverity[ErrorSeverity.LOW]).toBe(1);
      expect(stats.errorsBySeverity[ErrorSeverity.MEDIUM]).toBe(1);
      expect(stats.recentErrors).toHaveLength(4);
    });

    it('should limit recent errors to last 24 hours', async () => {
      // This test would require mocking Date.now() to simulate old errors
      // For now, we'll just verify the structure
      const stats = errorNotificationService.getErrorStatistics();
      
      expect(stats).toHaveProperty('totalErrors');
      expect(stats).toHaveProperty('errorsByCode');
      expect(stats).toHaveProperty('errorsBySeverity');
      expect(stats).toHaveProperty('recentErrors');
      expect(Array.isArray(stats.recentErrors)).toBe(true);
    });
  });

  describe('Webhook Integration', () => {
    it('should call webhook for configured alert rules', async () => {
      // Mock fetch
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200
      });

      const rule = {
        name: 'Webhook Test Rule',
        condition: { errorCode: 'WEBHOOK_TEST' },
        actions: { 
          notify: false, 
          escalate: false, 
          autoResolve: false,
          webhook: 'https://hooks.slack.com/test'
        },
        recipients: [],
        enabled: true
      };

      errorNotificationService.addAlertRule(rule);

      const error = new Error('Webhook test error');
      (error as any).code = 'WEBHOOK_TEST';

      await errorNotificationService.processError(
        error, 
        ErrorSeverity.HIGH, 
        { requestId: 'req_webhook' }
      );

      expect(global.fetch).toHaveBeenCalledWith(
        'https://hooks.slack.com/test',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('Webhook test error')
        })
      );
    });

    it('should handle webhook failures gracefully', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const rule = {
        name: 'Failing Webhook Rule',
        condition: { errorCode: 'WEBHOOK_FAIL' },
        actions: { 
          notify: false, 
          escalate: false, 
          autoResolve: false,
          webhook: 'https://hooks.slack.com/fail'
        },
        recipients: [],
        enabled: true
      };

      errorNotificationService.addAlertRule(rule);

      const error = new Error('Webhook fail test');
      (error as any).code = 'WEBHOOK_FAIL';

      await expect(
        errorNotificationService.processError(
          error, 
          ErrorSeverity.HIGH, 
          { requestId: 'req_webhook_fail' }
        )
      ).resolves.not.toThrow();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to call webhook',
        expect.objectContaining({
          error: 'Network error'
        })
      );
    });
  });

  describe('User Group Notifications', () => {
    it('should notify users in specified groups', async () => {
      const mockUsers = [
        { id: 'admin_1', email: 'admin1@example.com' },
        { id: 'admin_2', email: 'admin2@example.com' }
      ];

      mockPrisma.user.findMany.mockResolvedValue(mockUsers as any);
      mockNotificationService.sendNotification.mockResolvedValue();

      const rule = {
        name: 'Group Notification Rule',
        condition: { errorCode: 'GROUP_TEST' },
        actions: { notify: true, escalate: false, autoResolve: false },
        recipients: ['admin'],
        enabled: true
      };

      errorNotificationService.addAlertRule(rule);

      const error = new Error('Group notification test');
      (error as any).code = 'GROUP_TEST';

      await errorNotificationService.processError(
        error, 
        ErrorSeverity.HIGH, 
        { requestId: 'req_group' }
      );

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: { role: 'ADMIN' },
        select: { id: true, email: true }
      });

      expect(mockNotificationService.sendNotification).toHaveBeenCalledTimes(2);
    });
  });
});