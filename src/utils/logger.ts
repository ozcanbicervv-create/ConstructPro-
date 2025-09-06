/**
 * Structured Logging System
 * Provides consistent logging across the application with proper formatting and levels
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
  stack?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  maxStorageEntries: number;
  enableRemoteLogging: boolean;
  remoteEndpoint?: string;
}

class Logger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private sessionId: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: 'info',
      enableConsole: true,
      enableStorage: true,
      maxStorageEntries: 1000,
      enableRemoteLogging: false,
      ...config,
    };

    this.sessionId = this.generateSessionId();
    this.loadStoredLogs();
  }

  /**
   * Debug level logging
   */
  debug(message: string, context?: string, metadata?: Record<string, any>): void {
    this.log('debug', message, context, metadata);
  }

  /**
   * Info level logging
   */
  info(message: string, context?: string, metadata?: Record<string, any>): void {
    this.log('info', message, context, metadata);
  }

  /**
   * Warning level logging
   */
  warn(message: string, context?: string, metadata?: Record<string, any>): void {
    this.log('warn', message, context, metadata);
  }

  /**
   * Error level logging
   */
  error(message: string, context?: string, metadata?: Record<string, any>, error?: Error): void {
    this.log('error', message, context, {
      ...metadata,
      stack: error?.stack,
      errorName: error?.name,
    });
  }

  /**
   * Log API requests and responses
   */
  logApiCall(
    method: string,
    url: string,
    status: number,
    duration: number,
    metadata?: Record<string, any>
  ): void {
    const level: LogLevel = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';
    
    this.log(level, `API ${method} ${url}`, 'API', {
      method,
      url,
      status,
      duration,
      ...metadata,
    });
  }

  /**
   * Log user actions for analytics and debugging
   */
  logUserAction(action: string, metadata?: Record<string, any>): void {
    this.log('info', `User action: ${action}`, 'UserAction', metadata);
  }

  /**
   * Log performance metrics
   */
  logPerformance(metric: string, value: number, unit: string, metadata?: Record<string, any>): void {
    this.log('info', `Performance: ${metric}`, 'Performance', {
      metric,
      value,
      unit,
      ...metadata,
    });
  }

  /**
   * Get logs with optional filtering
   */
  getLogs(filter?: {
    level?: LogLevel;
    context?: string;
    since?: Date;
    limit?: number;
  }): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (filter?.level) {
      const levelPriority = { debug: 0, info: 1, warn: 2, error: 3 };
      const minPriority = levelPriority[filter.level];
      filteredLogs = filteredLogs.filter(log => levelPriority[log.level] >= minPriority);
    }

    if (filter?.context) {
      filteredLogs = filteredLogs.filter(log => log.context === filter.context);
    }

    if (filter?.since) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= filter.since!);
    }

    if (filter?.limit) {
      filteredLogs = filteredLogs.slice(-filter.limit);
    }

    return filteredLogs;
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
    this.saveLogsToStorage();
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Get logging statistics
   */
  getStats(): {
    total: number;
    byLevel: Record<LogLevel, number>;
    byContext: Record<string, number>;
    recentErrors: number;
  } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const byLevel = this.logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<LogLevel, number>);

    const byContext = this.logs.reduce((acc, log) => {
      const context = log.context || 'Unknown';
      acc[context] = (acc[context] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentErrors = this.logs.filter(
      log => log.level === 'error' && new Date(log.timestamp) > oneHourAgo
    ).length;

    return {
      total: this.logs.length,
      byLevel,
      byContext,
      recentErrors,
    };
  }

  private log(level: LogLevel, message: string, context?: string, metadata?: Record<string, any>): void {
    // Check if we should log this level
    const levelPriority = { debug: 0, info: 1, warn: 2, error: 3 };
    if (levelPriority[level] < levelPriority[this.config.level]) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      sessionId: this.sessionId,
      userId: this.getCurrentUserId(),
      metadata,
    };

    // Add to internal storage
    if (this.config.enableStorage) {
      this.logs.push(entry);
      
      // Maintain max storage limit
      if (this.logs.length > this.config.maxStorageEntries) {
        this.logs = this.logs.slice(-this.config.maxStorageEntries);
      }
      
      this.saveLogsToStorage();
    }

    // Console logging
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Remote logging
    if (this.config.enableRemoteLogging && this.config.remoteEndpoint) {
      this.sendToRemote(entry);
    }
  }

  private logToConsole(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
    const context = entry.context ? ` [${entry.context}]` : '';
    const message = `${prefix}${context} ${entry.message}`;

    switch (entry.level) {
      case 'debug':
        console.debug(message, entry.metadata);
        break;
      case 'info':
        console.info(message, entry.metadata);
        break;
      case 'warn':
        console.warn(message, entry.metadata);
        break;
      case 'error':
        console.error(message, entry.metadata);
        if (entry.stack) {
          console.error(entry.stack);
        }
        break;
    }
  }

  private async sendToRemote(entry: LogEntry): Promise<void> {
    try {
      if (!this.config.remoteEndpoint) return;

      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // Avoid infinite logging loop
      console.error('Failed to send log to remote endpoint:', error);
    }
  }

  private saveLogsToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const recentLogs = this.logs.slice(-100); // Store only recent logs
      localStorage.setItem('app_logs', JSON.stringify(recentLogs));
    } catch (error) {
      console.warn('Failed to save logs to localStorage:', error);
    }
  }

  private loadStoredLogs(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('app_logs');
      if (stored) {
        const logs = JSON.parse(stored) as LogEntry[];
        this.logs = logs;
      }
    } catch (error) {
      console.warn('Failed to load logs from localStorage:', error);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentUserId(): string | undefined {
    // In a real app, get this from your auth context/store
    if (typeof window === 'undefined') return undefined;
    
    try {
      // Example: get from localStorage, cookie, or auth context
      return localStorage.getItem('userId') || undefined;
    } catch {
      return undefined;
    }
  }
}

// Create singleton logger instance
export const logger = new Logger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  enableConsole: true,
  enableStorage: true,
  enableRemoteLogging: process.env.NODE_ENV === 'production',
  remoteEndpoint: process.env.NEXT_PUBLIC_LOGGING_ENDPOINT,
});

// Convenience functions for common logging patterns
export const logApiError = (error: Error, url: string, method: string) => {
  logger.error(`API Error: ${method} ${url}`, 'API', {
    url,
    method,
    errorMessage: error.message,
  }, error);
};

export const logUserAction = (action: string, metadata?: Record<string, any>) => {
  logger.logUserAction(action, metadata);
};

export const logPerformance = (metric: string, value: number, unit = 'ms') => {
  logger.logPerformance(metric, value, unit);
};

// Performance monitoring utilities
export const measurePerformance = <T>(
  fn: () => T,
  label: string,
  context?: string
): T => {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  
  logger.logPerformance(label, duration, 'ms', { context });
  
  return result;
};

export const measureAsyncPerformance = async <T>(
  fn: () => Promise<T>,
  label: string,
  context?: string
): Promise<T> => {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  
  logger.logPerformance(label, duration, 'ms', { context });
  
  return result;
};