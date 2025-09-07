import { createLogger, format, transports, Logger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

export interface LogContext {
  requestId?: string;
  userId?: string;
  projectId?: string;
  taskId?: string;
  materialId?: string;
  documentId?: string;
  action?: string;
  resource?: string;
  ip?: string;
  userAgent?: string;
  duration?: number;
  statusCode?: number;
  method?: string;
  url?: string;
  [key: string]: any;
}

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  DEBUG = 'debug'
}

class AppLogger {
  private logger: Logger;
  private static instance: AppLogger;

  constructor() {
    this.logger = this.createLogger();
  }

  public static getInstance(): AppLogger {
    if (!AppLogger.instance) {
      AppLogger.instance = new AppLogger();
    }
    return AppLogger.instance;
  }

  private createLogger(): Logger {
    const logDir = path.join(process.cwd(), 'logs');
    
    // Custom format for structured logging
    const customFormat = format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      format.errors({ stack: true }),
      format.json(),
      format.printf((info) => {
        const { timestamp, level, message, requestId, userId, ...meta } = info;
        
        const logEntry = {
          timestamp,
          level: level.toUpperCase(),
          message,
          ...(requestId && { requestId }),
          ...(userId && { userId }),
          ...meta
        };

        return JSON.stringify(logEntry);
      })
    );

    // Console format for development
    const consoleFormat = format.combine(
      format.colorize(),
      format.timestamp({ format: 'HH:mm:ss' }),
      format.printf((info) => {
        const { timestamp, level, message, requestId, userId, ...meta } = info;
        
        let logMessage = `${timestamp} [${level}]`;
        
        if (requestId) {
          logMessage += ` [${requestId}]`;
        }
        
        if (userId) {
          logMessage += ` [User:${userId}]`;
        }
        
        logMessage += `: ${message}`;
        
        if (Object.keys(meta).length > 0) {
          logMessage += ` ${JSON.stringify(meta)}`;
        }
        
        return logMessage;
      })
    );

    const loggerTransports: any[] = [];

    // Console transport for development
    if (process.env.NODE_ENV !== 'production') {
      loggerTransports.push(
        new transports.Console({
          format: consoleFormat,
          level: 'debug'
        })
      );
    }

    // File transports for production
    if (process.env.NODE_ENV === 'production') {
      // Error logs
      loggerTransports.push(
        new DailyRotateFile({
          filename: path.join(logDir, 'error-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          format: customFormat,
          maxSize: '20m',
          maxFiles: '14d',
          zippedArchive: true
        })
      );

      // Combined logs
      loggerTransports.push(
        new DailyRotateFile({
          filename: path.join(logDir, 'combined-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          format: customFormat,
          maxSize: '20m',
          maxFiles: '30d',
          zippedArchive: true
        })
      );

      // HTTP access logs
      loggerTransports.push(
        new DailyRotateFile({
          filename: path.join(logDir, 'access-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          level: 'http',
          format: customFormat,
          maxSize: '20m',
          maxFiles: '30d',
          zippedArchive: true
        })
      );
    }

    return createLogger({
      level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
      format: customFormat,
      transports: loggerTransports,
      exitOnError: false,
      silent: process.env.NODE_ENV === 'test'
    });
  }

  public error(message: string, context?: LogContext): void {
    this.logger.error(message, context);
  }

  public warn(message: string, context?: LogContext): void {
    this.logger.warn(message, context);
  }

  public info(message: string, context?: LogContext): void {
    this.logger.info(message, context);
  }

  public http(message: string, context?: LogContext): void {
    this.logger.http(message, context);
  }

  public debug(message: string, context?: LogContext): void {
    this.logger.debug(message, context);
  }

  // Specialized logging methods
  public logApiRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ): void {
    this.http(`${method} ${url} ${statusCode} - ${duration}ms`, {
      method,
      url,
      statusCode,
      duration,
      ...context
    });
  }

  public logAuthentication(
    action: string,
    userId?: string,
    success: boolean = true,
    context?: LogContext
  ): void {
    const level = success ? 'info' : 'warn';
    const message = `Authentication ${action} ${success ? 'successful' : 'failed'}`;
    
    this.logger.log(level, message, {
      action: `auth_${action}`,
      userId,
      success,
      ...context
    });
  }

  public logDatabaseOperation(
    operation: string,
    table: string,
    duration?: number,
    context?: LogContext
  ): void {
    this.debug(`Database ${operation} on ${table}${duration ? ` - ${duration}ms` : ''}`, {
      action: `db_${operation}`,
      table,
      duration,
      ...context
    });
  }

  public logBusinessEvent(
    event: string,
    resource: string,
    context?: LogContext
  ): void {
    this.info(`Business event: ${event} on ${resource}`, {
      action: event,
      resource,
      ...context
    });
  }

  public logSecurityEvent(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    context?: LogContext
  ): void {
    const level = severity === 'critical' || severity === 'high' ? 'error' : 'warn';
    
    this.logger.log(level, `Security event: ${event}`, {
      action: `security_${event}`,
      severity,
      ...context
    });
  }

  public logPerformanceMetric(
    metric: string,
    value: number,
    unit: string,
    context?: LogContext
  ): void {
    this.info(`Performance metric: ${metric} = ${value}${unit}`, {
      action: 'performance_metric',
      metric,
      value,
      unit,
      ...context
    });
  }
}

// Request correlation ID generator
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Create and export logger instance
export const logger = AppLogger.getInstance();

// Export types and utilities
export { AppLogger, LogLevel };