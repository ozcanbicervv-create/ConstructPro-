import { logger, LogContext } from '@/lib/logger';
import { notificationService } from '@/services/notification.service';

// Define ErrorSeverity locally to avoid circular imports
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Optional prisma import for database operations
let prisma: any = null;
try {
  prisma = require('@/lib/db').prisma;
} catch (error) {
  // Database not available, will use in-memory operations only
}

export interface ErrorNotification {
  id: string;
  type: 'SYSTEM_ERROR' | 'SECURITY_ALERT' | 'PERFORMANCE_ALERT' | 'SERVICE_OUTAGE';
  severity: ErrorSeverity;
  title: string;
  message: string;
  error: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  context: {
    requestId?: string;
    userId?: string;
    ip?: string;
    userAgent?: string;
    url?: string;
    method?: string;
    timestamp: string;
    environment: string;
  };
  metadata?: Record<string, any>;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: {
    errorCode?: string;
    severity?: ErrorSeverity;
    frequency?: {
      count: number;
      timeWindow: number; // minutes
    };
    pattern?: string;
  };
  actions: {
    notify: boolean;
    escalate: boolean;
    autoResolve: boolean;
    webhook?: string;
  };
  recipients: string[];
  enabled: boolean;
}

class ErrorNotificationService {
  private static instance: ErrorNotificationService;
  private alertRules: AlertRule[] = [];
  private errorHistory: Map<string, ErrorNotification[]> = new Map();
  private alertCooldowns: Map<string, number> = new Map();

  constructor() {
    this.initializeDefaultRules();
  }

  public static getInstance(): ErrorNotificationService {
    if (!ErrorNotificationService.instance) {
      ErrorNotificationService.instance = new ErrorNotificationService();
    }
    return ErrorNotificationService.instance;
  }

  private initializeDefaultRules(): void {
    this.alertRules = [
      {
        id: 'critical_errors',
        name: 'Critical System Errors',
        condition: {
          severity: ErrorSeverity.CRITICAL
        },
        actions: {
          notify: true,
          escalate: true,
          autoResolve: false
        },
        recipients: ['admin'],
        enabled: true
      },
      {
        id: 'database_errors',
        name: 'Database Connection Errors',
        condition: {
          errorCode: 'DATABASE_ERROR',
          frequency: {
            count: 3,
            timeWindow: 5
          }
        },
        actions: {
          notify: true,
          escalate: true,
          autoResolve: false,
          webhook: process.env.SLACK_WEBHOOK_URL
        },
        recipients: ['admin', 'devops'],
        enabled: true
      },
      {
        id: 'authentication_failures',
        name: 'Multiple Authentication Failures',
        condition: {
          errorCode: 'INVALID_CREDENTIALS',
          frequency: {
            count: 5,
            timeWindow: 10
          }
        },
        actions: {
          notify: true,
          escalate: false,
          autoResolve: true
        },
        recipients: ['security'],
        enabled: true
      },
      {
        id: 'rate_limit_exceeded',
        name: 'Rate Limit Exceeded',
        condition: {
          errorCode: 'RATE_LIMIT_EXCEEDED',
          frequency: {
            count: 10,
            timeWindow: 5
          }
        },
        actions: {
          notify: true,
          escalate: false,
          autoResolve: true
        },
        recipients: ['admin'],
        enabled: true
      },
      {
        id: 'file_upload_failures',
        name: 'File Upload Failures',
        condition: {
          errorCode: 'FILE_UPLOAD_FAILED',
          frequency: {
            count: 5,
            timeWindow: 15
          }
        },
        actions: {
          notify: true,
          escalate: false,
          autoResolve: false
        },
        recipients: ['admin'],
        enabled: true
      }
    ];
  }

  public async processError(
    error: Error,
    severity: ErrorSeverity,
    context: LogContext & {
      requestId?: string;
      userId?: string;
      ip?: string;
      userAgent?: string;
      url?: string;
      method?: string;
    }
  ): Promise<void> {
    try {
      // Create error notification
      const notification = this.createErrorNotification(error, severity, context);
      
      // Store error in history
      this.addToErrorHistory(notification);
      
      // Check alert rules
      const triggeredRules = this.checkAlertRules(notification);
      
      // Process triggered rules
      for (const rule of triggeredRules) {
        await this.processAlertRule(rule, notification);
      }
      
      // Log the error processing
      logger.debug('Error notification processed', {
        errorId: notification.id,
        severity,
        triggeredRules: triggeredRules.map(r => r.name),
        requestId: context.requestId
      });
      
    } catch (processingError) {
      logger.error('Failed to process error notification', {
        originalError: error.message,
        processingError: processingError instanceof Error ? processingError.message : 'Unknown error',
        requestId: context.requestId
      });
    }
  }

  private createErrorNotification(
    error: Error,
    severity: ErrorSeverity,
    context: LogContext & {
      requestId?: string;
      userId?: string;
      ip?: string;
      userAgent?: string;
      url?: string;
      method?: string;
    }
  ): ErrorNotification {
    const timestamp = new Date().toISOString();
    
    return {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: this.determineNotificationType(error, severity),
      severity,
      title: this.generateErrorTitle(error, severity),
      message: this.generateErrorMessage(error, context),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code
      },
      context: {
        requestId: context.requestId,
        userId: context.userId,
        ip: context.ip,
        userAgent: context.userAgent,
        url: context.url,
        method: context.method,
        timestamp,
        environment: process.env.NODE_ENV || 'development'
      },
      metadata: {
        ...context
      },
      resolved: false,
      createdAt: timestamp
    };
  }

  private determineNotificationType(error: Error, severity: ErrorSeverity): ErrorNotification['type'] {
    const errorCode = (error as any).code;
    
    if (errorCode === 'INVALID_CREDENTIALS' || errorCode === 'UNAUTHORIZED') {
      return 'SECURITY_ALERT';
    }
    
    if (errorCode === 'DATABASE_ERROR' || errorCode === 'EXTERNAL_SERVICE_ERROR') {
      return 'SERVICE_OUTAGE';
    }
    
    if (severity === ErrorSeverity.CRITICAL) {
      return 'SYSTEM_ERROR';
    }
    
    return 'SYSTEM_ERROR';
  }

  private generateErrorTitle(error: Error, severity: ErrorSeverity): string {
    const errorCode = (error as any).code;
    const severityText = severity.toUpperCase();
    
    if (errorCode) {
      return `${severityText}: ${errorCode.replace(/_/g, ' ')}`;
    }
    
    return `${severityText}: ${error.name}`;
  }

  private generateErrorMessage(
    error: Error,
    context: LogContext & {
      requestId?: string;
      userId?: string;
      ip?: string;
      userAgent?: string;
      url?: string;
      method?: string;
    }
  ): string {
    let message = `Error: ${error.message}`;
    
    if (context.url && context.method) {
      message += `\nEndpoint: ${context.method} ${context.url}`;
    }
    
    if (context.userId) {
      message += `\nUser: ${context.userId}`;
    }
    
    if (context.ip) {
      message += `\nIP: ${context.ip}`;
    }
    
    if (context.requestId) {
      message += `\nRequest ID: ${context.requestId}`;
    }
    
    return message;
  }

  private addToErrorHistory(notification: ErrorNotification): void {
    const errorCode = notification.error.code || 'UNKNOWN';
    
    if (!this.errorHistory.has(errorCode)) {
      this.errorHistory.set(errorCode, []);
    }
    
    const history = this.errorHistory.get(errorCode)!;
    history.push(notification);
    
    // Keep only last 100 errors per code
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
  }

  private checkAlertRules(notification: ErrorNotification): AlertRule[] {
    const triggeredRules: AlertRule[] = [];
    
    for (const rule of this.alertRules) {
      if (!rule.enabled) continue;
      
      // Check cooldown
      const cooldownKey = `${rule.id}_${notification.error.code}`;
      const lastAlert = this.alertCooldowns.get(cooldownKey);
      if (lastAlert && Date.now() - lastAlert < 300000) { // 5 minutes cooldown
        continue;
      }
      
      if (this.evaluateAlertRule(rule, notification)) {
        triggeredRules.push(rule);
        this.alertCooldowns.set(cooldownKey, Date.now());
      }
    }
    
    return triggeredRules;
  }

  private evaluateAlertRule(rule: AlertRule, notification: ErrorNotification): boolean {
    const { condition } = rule;
    
    // Check error code
    if (condition.errorCode && notification.error.code !== condition.errorCode) {
      return false;
    }
    
    // Check severity
    if (condition.severity && notification.severity !== condition.severity) {
      return false;
    }
    
    // Check frequency
    if (condition.frequency) {
      const errorCode = notification.error.code || 'UNKNOWN';
      const history = this.errorHistory.get(errorCode) || [];
      const timeWindow = condition.frequency.timeWindow * 60 * 1000; // Convert to ms
      const cutoff = Date.now() - timeWindow;
      
      const recentErrors = history.filter(error => 
        new Date(error.createdAt).getTime() > cutoff
      );
      
      if (recentErrors.length < condition.frequency.count) {
        return false;
      }
    }
    
    // Check pattern (if specified)
    if (condition.pattern) {
      const regex = new RegExp(condition.pattern, 'i');
      if (!regex.test(notification.error.message)) {
        return false;
      }
    }
    
    return true;
  }

  private async processAlertRule(rule: AlertRule, notification: ErrorNotification): Promise<void> {
    try {
      // Send notifications
      if (rule.actions.notify) {
        await this.sendNotifications(rule, notification);
      }
      
      // Escalate if needed
      if (rule.actions.escalate) {
        await this.escalateAlert(rule, notification);
      }
      
      // Call webhook if configured
      if (rule.actions.webhook) {
        await this.callWebhook(rule.actions.webhook, notification);
      }
      
      // Auto-resolve if configured
      if (rule.actions.autoResolve) {
        setTimeout(() => {
          this.resolveNotification(notification.id, 'system');
        }, 300000); // Auto-resolve after 5 minutes
      }
      
    } catch (error) {
      logger.error('Failed to process alert rule', {
        ruleName: rule.name,
        notificationId: notification.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async sendNotifications(rule: AlertRule, notification: ErrorNotification): Promise<void> {
    for (const recipient of rule.recipients) {
      try {
        if (recipient === 'admin') {
          await notificationService.notifyAdmins({
            type: 'SYSTEM_ERROR',
            title: notification.title,
            message: notification.message,
            data: {
              errorId: notification.id,
              severity: notification.severity,
              errorCode: notification.error.code,
              requestId: notification.context.requestId
            },
            priority: notification.severity === ErrorSeverity.CRITICAL ? 'HIGH' : 'MEDIUM'
          });
        } else {
          // Send to specific user groups
          await this.notifyUserGroup(recipient, notification);
        }
      } catch (error) {
        logger.error('Failed to send notification', {
          recipient,
          notificationId: notification.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  private async notifyUserGroup(group: string, notification: ErrorNotification): Promise<void> {
    if (!prisma) {
      logger.warn('Database not available, skipping user group notification', {
        group,
        notificationId: notification.id
      });
      return;
    }

    try {
      // Get users in the specified group
      const users = await prisma.user.findMany({
        where: {
          role: group.toUpperCase() as any
        },
        select: {
          id: true,
          email: true
        }
      });

      for (const user of users) {
        await notificationService.sendNotification({
          type: 'SYSTEM_ERROR',
          title: notification.title,
          message: notification.message,
          recipientId: user.id,
          data: {
            errorId: notification.id,
            severity: notification.severity
          },
          priority: notification.severity === ErrorSeverity.CRITICAL ? 'HIGH' : 'MEDIUM'
        });
      }
    } catch (error) {
      logger.error('Failed to notify user group', {
        group,
        notificationId: notification.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async escalateAlert(rule: AlertRule, notification: ErrorNotification): Promise<void> {
    // Escalate to higher-level administrators
    await notificationService.notifyAdmins({
      type: 'SYSTEM_ERROR',
      title: `ESCALATED: ${notification.title}`,
      message: `This alert has been escalated due to rule: ${rule.name}\n\n${notification.message}`,
      data: {
        errorId: notification.id,
        severity: notification.severity,
        escalated: true,
        ruleName: rule.name
      },
      priority: 'HIGH'
    });

    logger.warn('Alert escalated', {
      ruleName: rule.name,
      notificationId: notification.id,
      severity: notification.severity
    });
  }

  private async callWebhook(webhookUrl: string, notification: ErrorNotification): Promise<void> {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: `🚨 ${notification.title}`,
          attachments: [
            {
              color: this.getSeverityColor(notification.severity),
              fields: [
                {
                  title: 'Error',
                  value: notification.error.message,
                  short: false
                },
                {
                  title: 'Severity',
                  value: notification.severity,
                  short: true
                },
                {
                  title: 'Environment',
                  value: notification.context.environment,
                  short: true
                },
                {
                  title: 'Request ID',
                  value: notification.context.requestId || 'N/A',
                  short: true
                },
                {
                  title: 'Timestamp',
                  value: notification.context.timestamp,
                  short: true
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Webhook call failed: ${response.status}`);
      }

      logger.debug('Webhook called successfully', {
        webhookUrl: webhookUrl.replace(/\/[^\/]+$/, '/***'),
        notificationId: notification.id
      });

    } catch (error) {
      logger.error('Failed to call webhook', {
        webhookUrl: webhookUrl.replace(/\/[^\/]+$/, '/***'),
        notificationId: notification.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private getSeverityColor(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'danger';
      case ErrorSeverity.HIGH:
        return 'warning';
      case ErrorSeverity.MEDIUM:
        return 'good';
      case ErrorSeverity.LOW:
        return '#36a64f';
      default:
        return '#36a64f';
    }
  }

  public async resolveNotification(notificationId: string, resolvedBy: string): Promise<void> {
    // In a real implementation, you'd store notifications in the database
    logger.info('Error notification resolved', {
      notificationId,
      resolvedBy,
      resolvedAt: new Date().toISOString()
    });
  }

  public getErrorStatistics(): {
    totalErrors: number;
    errorsByCode: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    recentErrors: ErrorNotification[];
  } {
    const totalErrors = Array.from(this.errorHistory.values())
      .reduce((sum, errors) => sum + errors.length, 0);

    const errorsByCode: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};
    const recentErrors: ErrorNotification[] = [];

    for (const [code, errors] of this.errorHistory.entries()) {
      errorsByCode[code] = errors.length;
      
      for (const error of errors) {
        errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
        
        // Collect recent errors (last 24 hours)
        const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
        if (new Date(error.createdAt).getTime() > dayAgo) {
          recentErrors.push(error);
        }
      }
    }

    // Sort recent errors by timestamp
    recentErrors.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return {
      totalErrors,
      errorsByCode,
      errorsBySeverity,
      recentErrors: recentErrors.slice(0, 50) // Last 50 recent errors
    };
  }

  public addAlertRule(rule: Omit<AlertRule, 'id'>): string {
    const newRule: AlertRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    this.alertRules.push(newRule);
    
    logger.info('Alert rule added', {
      ruleId: newRule.id,
      ruleName: newRule.name
    });
    
    return newRule.id;
  }

  public updateAlertRule(ruleId: string, updates: Partial<AlertRule>): boolean {
    const ruleIndex = this.alertRules.findIndex(rule => rule.id === ruleId);
    
    if (ruleIndex === -1) {
      return false;
    }
    
    this.alertRules[ruleIndex] = {
      ...this.alertRules[ruleIndex],
      ...updates,
      id: ruleId // Ensure ID doesn't change
    };
    
    logger.info('Alert rule updated', {
      ruleId,
      updates: Object.keys(updates)
    });
    
    return true;
  }

  public deleteAlertRule(ruleId: string): boolean {
    const ruleIndex = this.alertRules.findIndex(rule => rule.id === ruleId);
    
    if (ruleIndex === -1) {
      return false;
    }
    
    const deletedRule = this.alertRules.splice(ruleIndex, 1)[0];
    
    logger.info('Alert rule deleted', {
      ruleId,
      ruleName: deletedRule.name
    });
    
    return true;
  }

  public getAlertRules(): AlertRule[] {
    return [...this.alertRules];
  }
}

export const errorNotificationService = ErrorNotificationService.getInstance();