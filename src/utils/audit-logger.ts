import { NextRequest } from 'next/server';

import { prisma } from '@/utils/db';

/**
 * Comprehensive audit logging system for ConstructPro
 * Tracks authentication, authorization, and security events
 */

export interface AuditLogEntry {
  userId?: string;
  sessionId?: string;
  event: AuditEvent;
  resource?: string;
  resourceId?: string;
  action?: string;
  result: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export type AuditEvent = 
  // Authentication events
  | 'LOGIN_ATTEMPT'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'LOGOUT'
  | 'PASSWORD_CHANGE'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_RESET_SUCCESS'
  
  // MFA events
  | 'MFA_SETUP'
  | 'MFA_ENABLED'
  | 'MFA_DISABLED'
  | 'MFA_VERIFICATION_SUCCESS'
  | 'MFA_VERIFICATION_FAILURE'
  
  // Authorization events
  | 'PERMISSION_GRANTED'
  | 'PERMISSION_DENIED'
  | 'ROLE_ASSIGNED'
  | 'ROLE_REMOVED'
  
  // Resource access events
  | 'RESOURCE_CREATED'
  | 'RESOURCE_UPDATED'
  | 'RESOURCE_DELETED'
  | 'RESOURCE_ACCESSED'
  
  // Security events
  | 'RATE_LIMIT_EXCEEDED'
  | 'SUSPICIOUS_ACTIVITY'
  | 'SECURITY_VIOLATION'
  | 'API_KEY_USED'
  | 'API_KEY_INVALID'
  
  // Session events
  | 'SESSION_CREATED'
  | 'SESSION_EXPIRED'
  | 'SESSION_TERMINATED'
  | 'CONCURRENT_SESSION_DETECTED';

/**
 * Main audit logger class
 */
export class AuditLogger {
  private static instance: AuditLogger;
  private logQueue: AuditLogEntry[] = [];
  private isProcessing = false;

  private constructor() {
    // Process log queue every 5 seconds
    setInterval(() => {
      this.processLogQueue();
    }, 5000);
  }

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  /**
   * Log an audit event
   */
  async log(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
    const logEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date()
    };

    // Add to queue for batch processing
    this.logQueue.push(logEntry);

    // Also log to console for immediate visibility
    console.log('AUDIT_LOG:', JSON.stringify({
      event: logEntry.event,
      userId: logEntry.userId,
      resource: logEntry.resource,
      result: logEntry.result,
      timestamp: logEntry.timestamp.toISOString()
    }));

    // Process immediately for critical events
    if (this.isCriticalEvent(entry.event)) {
      await this.processLogQueue();
    }
  }

  /**
   * Log authentication event
   */
  async logAuth(
    event: Extract<AuditEvent, 'LOGIN_ATTEMPT' | 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'PASSWORD_RESET_REQUEST' | 'PASSWORD_RESET_SUCCESS'>,
    userId?: string,
    metadata?: Record<string, any>,
    request?: NextRequest
  ): Promise<void> {
    await this.log({
      userId,
      event,
      result: event.includes('FAILURE') ? 'FAILURE' : 'SUCCESS',
      ipAddress: request ? this.getClientIP(request) : undefined,
      userAgent: request?.headers.get('user-agent') || undefined,
      metadata
    });
  }

  /**
   * Log MFA event
   */
  async logMFA(
    event: Extract<AuditEvent, 'MFA_SETUP' | 'MFA_ENABLED' | 'MFA_DISABLED' | 'MFA_VERIFICATION_SUCCESS' | 'MFA_VERIFICATION_FAILURE'>,
    userId: string,
    metadata?: Record<string, any>,
    request?: NextRequest
  ): Promise<void> {
    await this.log({
      userId,
      event,
      result: event.includes('FAILURE') ? 'FAILURE' : 'SUCCESS',
      ipAddress: request ? this.getClientIP(request) : undefined,
      userAgent: request?.headers.get('user-agent') || undefined,
      metadata
    });
  }

  /**
   * Log authorization event
   */
  async logAuthorization(
    event: Extract<AuditEvent, 'PERMISSION_GRANTED' | 'PERMISSION_DENIED' | 'ROLE_ASSIGNED' | 'ROLE_REMOVED'>,
    userId: string,
    resource: string,
    action: string,
    result: 'SUCCESS' | 'FAILURE' | 'BLOCKED',
    metadata?: Record<string, any>,
    request?: NextRequest
  ): Promise<void> {
    await this.log({
      userId,
      event,
      resource,
      action,
      result,
      ipAddress: request ? this.getClientIP(request) : undefined,
      userAgent: request?.headers.get('user-agent') || undefined,
      metadata
    });
  }

  /**
   * Log resource access event
   */
  async logResourceAccess(
    event: Extract<AuditEvent, 'RESOURCE_CREATED' | 'RESOURCE_UPDATED' | 'RESOURCE_DELETED' | 'RESOURCE_ACCESSED'>,
    userId: string,
    resource: string,
    resourceId: string,
    action: string,
    result: 'SUCCESS' | 'FAILURE' | 'BLOCKED' = 'SUCCESS',
    metadata?: Record<string, any>,
    request?: NextRequest
  ): Promise<void> {
    await this.log({
      userId,
      event,
      resource,
      resourceId,
      action,
      result,
      ipAddress: request ? this.getClientIP(request) : undefined,
      userAgent: request?.headers.get('user-agent') || undefined,
      metadata
    });
  }

  /**
   * Log security event
   */
  async logSecurity(
    event: Extract<AuditEvent, 'RATE_LIMIT_EXCEEDED' | 'SUSPICIOUS_ACTIVITY' | 'SECURITY_VIOLATION' | 'API_KEY_USED' | 'API_KEY_INVALID'>,
    userId?: string,
    metadata?: Record<string, any>,
    request?: NextRequest
  ): Promise<void> {
    await this.log({
      userId,
      event,
      result: event.includes('INVALID') || event.includes('VIOLATION') || event.includes('EXCEEDED') ? 'BLOCKED' : 'SUCCESS',
      ipAddress: request ? this.getClientIP(request) : undefined,
      userAgent: request?.headers.get('user-agent') || undefined,
      metadata
    });
  }

  /**
   * Log session event
   */
  async logSession(
    event: Extract<AuditEvent, 'SESSION_CREATED' | 'SESSION_EXPIRED' | 'SESSION_TERMINATED' | 'CONCURRENT_SESSION_DETECTED'>,
    userId: string,
    sessionId?: string,
    metadata?: Record<string, any>,
    request?: NextRequest
  ): Promise<void> {
    await this.log({
      userId,
      sessionId,
      event,
      result: event.includes('EXPIRED') || event.includes('TERMINATED') ? 'BLOCKED' : 'SUCCESS',
      ipAddress: request ? this.getClientIP(request) : undefined,
      userAgent: request?.headers.get('user-agent') || undefined,
      metadata
    });
  }

  /**
   * Get audit logs with filtering
   */
  async getLogs(filters: {
    userId?: string;
    event?: AuditEvent;
    resource?: string;
    result?: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  } = {}): Promise<AuditLogEntry[]> {
    // TODO: Implement database query when audit log table is created
    // For now, return empty array
    console.log('Audit log query requested:', filters);
    return [];
  }

  /**
   * Get security summary for a user
   */
  async getSecuritySummary(userId: string, days = 30): Promise<{
    totalEvents: number;
    failedLogins: number;
    successfulLogins: number;
    mfaEvents: number;
    securityViolations: number;
    lastLogin?: Date;
    suspiciousActivity: boolean;
  }> {
    // TODO: Implement when audit log table is created
    console.log('Security summary requested for user:', userId);
    return {
      totalEvents: 0,
      failedLogins: 0,
      successfulLogins: 0,
      mfaEvents: 0,
      securityViolations: 0,
      suspiciousActivity: false
    };
  }

  /**
   * Process the log queue and store in database
   */
  private async processLogQueue(): Promise<void> {
    if (this.isProcessing || this.logQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const logsToProcess = [...this.logQueue];
      this.logQueue = [];

      // TODO: Batch insert into audit log table
      // await prisma.auditLog.createMany({
      //   data: logsToProcess
      // });

      console.log(`Processed ${logsToProcess.length} audit log entries`);

    } catch (error) {
      console.error('Failed to process audit log queue:', error);
      // Re-add failed logs to queue
      this.logQueue.unshift(...this.logQueue);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Check if event is critical and needs immediate processing
   */
  private isCriticalEvent(event: AuditEvent): boolean {
    const criticalEvents: AuditEvent[] = [
      'SECURITY_VIOLATION',
      'SUSPICIOUS_ACTIVITY',
      'MULTIPLE_FAILED_LOGINS',
      'CONCURRENT_SESSION_DETECTED'
    ];
    return criticalEvents.includes(event);
  }

  /**
   * Extract client IP from request
   */
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    return request.headers.get('x-real-ip') || 
           request.ip || 
           'unknown';
  }
}

/**
 * Convenience function to get audit logger instance
 */
export function getAuditLogger(): AuditLogger {
  return AuditLogger.getInstance();
}

/**
 * Audit middleware to automatically log API requests
 */
export function withAuditLogging(
  handler: (req: NextRequest) => Promise<Response>,
  options: {
    resource?: string;
    action?: string;
    logSuccess?: boolean;
    logFailure?: boolean;
  } = {}
) {
  return async (req: NextRequest): Promise<Response> => {
    const startTime = Date.now();
    const auditLogger = getAuditLogger();
    
    try {
      const response = await handler(req);
      const duration = Date.now() - startTime;

      // Log successful requests if enabled
      if (options.logSuccess !== false && response.status < 400) {
        await auditLogger.logResourceAccess(
          'RESOURCE_ACCESSED',
          'system', // Would be actual user ID from auth
          options.resource || req.nextUrl.pathname,
          'unknown', // Would be actual resource ID
          options.action || req.method,
          'SUCCESS',
          {
            statusCode: response.status,
            duration,
            endpoint: req.nextUrl.pathname,
            method: req.method
          },
          req
        );
      }

      return response;

    } catch (error) {
      const duration = Date.now() - startTime;

      // Log failed requests if enabled
      if (options.logFailure !== false) {
        await auditLogger.logResourceAccess(
          'RESOURCE_ACCESSED',
          'system', // Would be actual user ID from auth
          options.resource || req.nextUrl.pathname,
          'unknown', // Would be actual resource ID
          options.action || req.method,
          'FAILURE',
          {
            error: error instanceof Error ? error.message : 'Unknown error',
            duration,
            endpoint: req.nextUrl.pathname,
            method: req.method
          },
          req
        );
      }

      throw error;
    }
  };
}

export type { AuditLogEntry, AuditEvent };