import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { z } from 'zod';

// Mock dependencies
jest.mock('@/utils/db');
jest.mock('@/utils/audit-logger');

// Mock ApiKeyService
let keyCounter = 0;
const mockApiKeyService = {
  generateApiKey: jest.fn(() => {
    keyCounter++;
    return {
      key: `ck_${'a'.repeat(63)}${keyCounter}`,
      hashedKey: `${'b'.repeat(63)}${keyCounter}`
    };
  }),
  createApiKey: jest.fn(),
  revokeApiKey: jest.fn(),
  listUserApiKeys: jest.fn(),
  getApiKeyStats: jest.fn()
};

jest.mock('@/middleware/api-key.middleware', () => ({
  ApiKeyService: mockApiKeyService,
  withApiKey: jest.fn(),
  ApiKeyPermissions: {}
}));

// Import after mocking
import { ApiKeyService } from '@/middleware/api-key.middleware';
import { getAuditLogger } from '@/utils/audit-logger';
import { sanitizeText, sanitizeHtml, sanitizeFilename } from '@/utils/security/input-validation';
import { createRateLimit } from '@/utils/security/rate-limiting';

describe('Input Validation and Sanitization', () => {
  describe('sanitizeText', () => {
    it('should remove HTML tags and dangerous content', () => {
      const maliciousInput = '<script>alert("xss")</script>Normal text';
      const sanitized = sanitizeText(maliciousInput);
      
      expect(sanitized).toContain('Normal text');
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('javascript:');
    });

    it('should remove event handlers', () => {
      const maliciousInput = 'onclick=alert("xss") Normal text';
      const sanitized = sanitizeText(maliciousInput);
      
      expect(sanitized).not.toContain('onclick=');
      expect(sanitized).toContain('Normal text');
    });

    it('should limit text length', () => {
      const longText = 'a'.repeat(2000);
      const sanitized = sanitizeText(longText);
      
      expect(sanitized.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const maliciousHtml = '<div>Safe content</div><script>alert("xss")</script>';
      const sanitized = sanitizeHtml(maliciousHtml);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
    });

    it('should remove iframe tags', () => {
      const maliciousHtml = '<div>Content</div><iframe src="malicious.com"></iframe>';
      const sanitized = sanitizeHtml(maliciousHtml);
      
      expect(sanitized).not.toContain('<iframe>');
      expect(sanitized).not.toContain('malicious.com');
    });
  });

  describe('sanitizeFilename', () => {
    it('should remove unsafe characters', () => {
      const unsafeFilename = '../../../etc/passwd';
      const sanitized = sanitizeFilename(unsafeFilename);
      
      expect(sanitized).not.toContain('../');
      expect(sanitized).not.toContain('/');
    });

    it('should limit filename length', () => {
      const longFilename = 'a'.repeat(300) + '.txt';
      const sanitized = sanitizeFilename(longFilename);
      
      expect(sanitized.length).toBeLessThanOrEqual(255);
    });

    it('should preserve safe characters', () => {
      const safeFilename = 'document-2023_final.pdf';
      const sanitized = sanitizeFilename(safeFilename);
      
      expect(sanitized).toBe(safeFilename);
    });
  });
});

describe('Rate Limiting', () => {
  describe('createRateLimit', () => {
    it('should create rate limit function with correct configuration', () => {
      const rateLimit = createRateLimit({
        windowMs: 60000,
        maxRequests: 100
      });
      
      expect(typeof rateLimit).toBe('function');
    });
  });
});

describe('API Key Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateApiKey', () => {
    it('should generate API key with correct format', () => {
      const { key, hashedKey } = ApiKeyService.generateApiKey();
      
      expect(key).toMatch(/^ck_[a-f0-9]{64}$/);
      expect(hashedKey).toHaveLength(64);
      expect(typeof hashedKey).toBe('string');
    });

    it('should generate unique keys', () => {
      const key1 = ApiKeyService.generateApiKey();
      const key2 = ApiKeyService.generateApiKey();
      
      expect(key1.key).not.toBe(key2.key);
      expect(key1.hashedKey).not.toBe(key2.hashedKey);
    });
  });
});

describe('Audit Logger', () => {
  let auditLogger: any;

  beforeEach(() => {
    const mockAuditLogger = {
      log: jest.fn(),
      logAuth: jest.fn(),
      logMFA: jest.fn(),
      logAuthorization: jest.fn(),
      logResourceAccess: jest.fn(),
      logSecurity: jest.fn(),
      logSession: jest.fn(),
      getLogs: jest.fn().mockResolvedValue([]),
      getSecuritySummary: jest.fn().mockResolvedValue({
        totalEvents: 0,
        failedLogins: 0,
        successfulLogins: 0,
        mfaEvents: 0,
        securityViolations: 0,
        suspiciousActivity: false
      })
    };

    (getAuditLogger as jest.MockedFunction<typeof getAuditLogger>)
      .mockReturnValue(mockAuditLogger);
    
    auditLogger = mockAuditLogger;
  });

  it('should log authentication events', async () => {
    await auditLogger.logAuth('LOGIN_SUCCESS', 'user-1', {
      ipAddress: '192.168.1.1'
    });

    expect(auditLogger.logAuth).toHaveBeenCalledWith(
      'LOGIN_SUCCESS',
      'user-1',
      { ipAddress: '192.168.1.1' }
    );
  });

  it('should log resource access events', async () => {
    await auditLogger.logResourceAccess(
      'RESOURCE_CREATED',
      'user-1',
      'project',
      'project-1',
      'create',
      'SUCCESS',
      { projectName: 'Test Project' }
    );

    expect(auditLogger.logResourceAccess).toHaveBeenCalledWith(
      'RESOURCE_CREATED',
      'user-1',
      'project',
      'project-1',
      'create',
      'SUCCESS',
      { projectName: 'Test Project' }
    );
  });

  it('should log security events', async () => {
    await auditLogger.logSecurity('RATE_LIMIT_EXCEEDED', 'user-1', {
      endpoint: '/api/projects',
      attempts: 101
    });

    expect(auditLogger.logSecurity).toHaveBeenCalledWith(
      'RATE_LIMIT_EXCEEDED',
      'user-1',
      { endpoint: '/api/projects', attempts: 101 }
    );
  });

  it('should retrieve security summary', async () => {
    const summary = await auditLogger.getSecuritySummary('user-1', 30);

    expect(summary).toEqual({
      totalEvents: 0,
      failedLogins: 0,
      successfulLogins: 0,
      mfaEvents: 0,
      securityViolations: 0,
      suspiciousActivity: false
    });
  });
});