import { NextRequest, NextResponse } from 'next/server';
import { z, ZodSchema, ZodError } from 'zod';

export interface ValidationConfig {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function createValidationMiddleware(config: ValidationConfig) {
  return async (request: NextRequest, context?: { params?: any }) => {
    try {
      const errors: Record<string, string[]> = {};

      // Validate request body
      if (config.body && request.method !== 'GET') {
        try {
          const body = await request.json();
          config.body.parse(body);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.body = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
          }
        }
      }

      // Validate query parameters
      if (config.query) {
        try {
          const url = new URL(request.url);
          const queryParams = Object.fromEntries(url.searchParams.entries());
          config.query.parse(queryParams);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.query = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
          }
        }
      }

      // Validate path parameters
      if (config.params && context?.params) {
        try {
          config.params.parse(context.params);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.params = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
          }
        }
      }

      // Return validation errors if any
      if (Object.keys(errors).length > 0) {
        return NextResponse.json(
          {
            error: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: errors,
            timestamp: new Date().toISOString()
          },
          { status: 400 }
        );
      }

      return null; // No validation errors
    } catch (error) {
      console.error('Validation middleware error:', error);
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Failed to validate request',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  };
}

// Common validation schemas
export const commonSchemas = {
  id: z.string().uuid('Invalid ID format'),
  pagination: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc')
  }),
  dateRange: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional()
  })
};

// Project validation schemas
export const projectSchemas = {
  create: z.object({
    name: z.string().min(3).max(100),
    description: z.string().optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    budget: z.number().min(0).max(10000000),
    location: z.string().min(1).max(200),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    metadata: z.record(z.any()).optional()
  }),
  update: z.object({
    name: z.string().min(3).max(100).optional(),
    description: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    budget: z.number().min(0).max(10000000).optional(),
    location: z.string().min(1).max(200).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    status: z.enum(['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
    metadata: z.record(z.any()).optional()
  }),
  query: z.object({
    ...commonSchemas.pagination.shape,
    status: z.string().optional(),
    priority: z.string().optional(),
    managerId: z.string().uuid().optional(),
    search: z.string().optional()
  })
};

// Task validation schemas
export const taskSchemas = {
  create: z.object({
    projectId: z.string().uuid(),
    title: z.string().min(3).max(200),
    description: z.string().optional(),
    assignedTo: z.string().uuid().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    dueDate: z.string().datetime().optional(),
    estimatedHours: z.number().min(0.5).max(1000).optional(),
    metadata: z.record(z.any()).optional()
  }),
  update: z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().optional(),
    assignedTo: z.string().uuid().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'BLOCKED']).optional(),
    dueDate: z.string().datetime().optional(),
    estimatedHours: z.number().min(0.5).max(1000).optional(),
    actualHours: z.number().min(0).max(1000).optional(),
    metadata: z.record(z.any()).optional()
  }),
  query: z.object({
    ...commonSchemas.pagination.shape,
    projectId: z.string().uuid().optional(),
    assignedTo: z.string().uuid().optional(),
    status: z.string().optional(),
    priority: z.string().optional(),
    search: z.string().optional()
  })
};

// Material validation schemas
export const materialSchemas = {
  create: z.object({
    projectId: z.string().uuid(),
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    category: z.string().min(1).max(50),
    unit: z.string().min(1).max(20),
    quantity: z.number().min(0),
    unitPrice: z.number().min(0),
    supplierId: z.string().uuid().optional(),
    specifications: z.record(z.any()).optional()
  }),
  update: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
    category: z.string().min(1).max(50).optional(),
    unit: z.string().min(1).max(20).optional(),
    quantity: z.number().min(0).optional(),
    unitPrice: z.number().min(0).optional(),
    supplierId: z.string().uuid().optional(),
    specifications: z.record(z.any()).optional()
  }),
  compare: z.object({
    materialIds: z.array(z.string().uuid()).min(2).max(10),
    criteria: z.array(z.enum(['price', 'quality', 'delivery', 'supplier_rating'])).optional()
  })
};

// User validation schemas
export const userSchemas = {
  register: z.object({
    email: z.string().email(),
    password: z.string().min(8).max(128),
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    title: z.string().max(100).optional(),
    company: z.string().max(100).optional(),
    phone: z.string().max(20).optional()
  }),
  login: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  }),
  updateProfile: z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    title: z.string().max(100).optional(),
    company: z.string().max(100).optional(),
    phone: z.string().max(20).optional(),
    preferences: z.record(z.any()).optional()
  })
};

// Document validation schemas
export const documentSchemas = {
  upload: z.object({
    projectId: z.string().uuid(),
    folderId: z.string().uuid().optional(),
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    category: z.string().min(1).max(50),
    tags: z.array(z.string()).optional()
  }),
  update: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    category: z.string().min(1).max(50).optional(),
    tags: z.array(z.string()).optional()
  })
};