/**
 * Centralized Error Handler
 * Provides consistent error handling, logging, and user-friendly error messages
 */

export interface ErrorMetadata {
  userId?: string;
  context: string;
  timestamp: Date;
  userAgent?: string;
  url?: string;
  additionalData?: Record<string, any>;
}

export interface ErrorLog {
  id: string;
  level: 'error' | 'warn' | 'info';
  message: string;
  stack?: string;
  metadata: ErrorMetadata;
}

export class ErrorHandler {
  private static logs: ErrorLog[] = [];
  private static maxLogs = 1000;

  /**
   * Handle errors with logging and user notification
   */
  static handle(error: Error, context: string, metadata?: Partial<ErrorMetadata>): void {
    const errorMetadata: ErrorMetadata = {
      context,
      timestamp: new Date(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      ...metadata,
    };

    this.logError(error, errorMetadata);
    
    // In development, also log to console
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${context}]`, error);
    }
  }

  /**
   * Log error with structured metadata
   */
  static logError(error: Error, metadata: ErrorMetadata): void {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      level: 'error',
      message: error.message,
      stack: error.stack,
      metadata,
    };

    this.addLog(errorLog);
    
    // Send to external logging service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalLogger(errorLog);
    }
  }

  /**
   * Log warning messages
   */
  static logWarning(message: string, context: string, additionalData?: Record<string, any>): void {
    const warningLog: ErrorLog = {
      id: this.generateId(),
      level: 'warn',
      message,
      metadata: {
        context,
        timestamp: new Date(),
        additionalData,
      },
    };

    this.addLog(warningLog);
  }

  /**
   * Log info messages
   */
  static logInfo(message: string, context: string, additionalData?: Record<string, any>): void {
    const infoLog: ErrorLog = {
      id: this.generateId(),
      level: 'info',
      message,
      metadata: {
        context,
        timestamp: new Date(),
        additionalData,
      },
    };

    this.addLog(infoLog);
  }

  /**
   * Create user-friendly error messages
   */
  static createUserFriendlyMessage(error: Error): string {
    // Network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }

    // Authentication errors
    if (error.message.includes('unauthorized') || error.message.includes('401')) {
      return 'Your session has expired. Please log in again.';
    }

    // Validation errors
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return 'Please check your input and try again.';
    }

    // Permission errors
    if (error.message.includes('forbidden') || error.message.includes('403')) {
      return 'You do not have permission to perform this action.';
    }

    // Server errors
    if (error.message.includes('500') || error.message.includes('server')) {
      return 'Something went wrong on our end. Please try again later.';
    }

    // Default fallback
    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Get recent error logs
   */
  static getLogs(limit = 50): ErrorLog[] {
    return this.logs.slice(-limit);
  }

  /**
   * Clear error logs
   */
  static clearLogs(): void {
    this.logs = [];
  }

  /**
   * Get error statistics
   */
  static getErrorStats(): { total: number; byLevel: Record<string, number>; recent: number } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const recent = this.logs.filter(log => log.metadata.timestamp > oneHourAgo).length;
    const byLevel = this.logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: this.logs.length,
      byLevel,
      recent,
    };
  }

  private static addLog(log: ErrorLog): void {
    this.logs.push(log);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private static async sendToExternalLogger(errorLog: ErrorLog): Promise<void> {
    try {
      // In a real application, you would send to services like:
      // - Sentry
      // - LogRocket
      // - DataDog
      // - Custom logging endpoint
      
      // Example implementation:
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorLog),
      // });
      
      console.log('Would send to external logger:', errorLog);
    } catch (error) {
      console.error('Failed to send log to external service:', error);
    }
  }
}

/**
 * Utility function for async error handling
 */
export const handleAsyncError = async <T>(
  asyncFn: () => Promise<T>,
  context: string,
  fallbackValue?: T
): Promise<T | undefined> => {
  try {
    return await asyncFn();
  } catch (error) {
    ErrorHandler.handle(error as Error, context);
    return fallbackValue;
  }
};

/**
 * Decorator for automatic error handling in class methods
 */
export function HandleErrors(context: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = function (...args: any[]) {
      try {
        const result = method.apply(this, args);
        
        // Handle async methods
        if (result && typeof result.catch === 'function') {
          return result.catch((error: Error) => {
            ErrorHandler.handle(error, `${target.constructor.name}.${propertyName} - ${context}`);
            throw error;
          });
        }
        
        return result;
      } catch (error) {
        ErrorHandler.handle(error as Error, `${target.constructor.name}.${propertyName} - ${context}`);
        throw error;
      }
    };
  };
}