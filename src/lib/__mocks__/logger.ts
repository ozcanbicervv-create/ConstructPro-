export const logger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  http: jest.fn(),
  debug: jest.fn(),
  logApiRequest: jest.fn(),
  logAuthentication: jest.fn(),
  logDatabaseOperation: jest.fn(),
  logBusinessEvent: jest.fn(),
  logSecurityEvent: jest.fn(),
  logPerformanceMetric: jest.fn()
};

export const generateRequestId = jest.fn(() => 'mock-request-id');
export const LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  HTTP: 'http',
  DEBUG: 'debug'
};

export class AppLogger {
  static getInstance() {
    return logger;
  }
}