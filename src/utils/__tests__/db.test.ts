import { PrismaClient } from '@prisma/client';

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
}));

const MockedPrismaClient = PrismaClient as jest.MockedClass<typeof PrismaClient>;

describe('Database Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear the global prisma instance
    delete (globalThis as any).prisma;
  });

  it('should create a new PrismaClient instance', () => {
    // Import after clearing mocks to get fresh instance
    const { prisma } = require('../db');
    
    expect(MockedPrismaClient).toHaveBeenCalledWith({
      log: ['query'],
    });
    expect(prisma).toBeDefined();
  });

  it('should reuse existing global prisma instance in development', () => {
    // Set up global instance
    const mockPrismaInstance = new MockedPrismaClient();
    (globalThis as any).prisma = mockPrismaInstance;
    
    // Clear the module cache to force re-import
    jest.resetModules();
    
    const { prisma } = require('../db');
    
    expect(prisma).toBe(mockPrismaInstance);
  });

  it('should set global prisma instance in non-production environment', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    // Clear module cache and re-import
    jest.resetModules();
    const { prisma } = require('../db');
    
    expect((globalThis as any).prisma).toBe(prisma);
    
    // Restore original environment
    process.env.NODE_ENV = originalEnv;
  });

  it('should not set global prisma instance in production environment', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    // Clear module cache and re-import
    jest.resetModules();
    require('../db');
    
    expect((globalThis as any).prisma).toBeUndefined();
    
    // Restore original environment
    process.env.NODE_ENV = originalEnv;
  });
});