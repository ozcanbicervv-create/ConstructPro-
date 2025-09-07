import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { z } from 'zod';

// Error response types
export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
  timestamp: string;
  requestId?: string;
}

export enum ErrorCodes {
  // Authentication Errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  UNAUTHORIZED = 'UNAUTHORIZED',
  
  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Business Logic Errors
  PROJECT_NOT_FOUND = 'PROJECT_NOT_FOUND',
  TASK_ASSIGNMENT_FAILED = 'TASK_ASSIGNMENT_FAILED',
  MATERIAL_OUT_OF_STOCK = 'MATERIAL_OUT_OF_STOCK',
  
  // System Errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  FILE_UPLOAD_FAILED = 'FILE_UPLOAD_FAILED',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
}

// Create standardized error response
export function createErrorResponse(
  code: ErrorCodes,
  message: string,
  statusCode: number,
  details?: any
): NextResponse {
  const error: ApiError = {
    code,
    message,
    statusCode,
    details,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json({ error }, { status: statusCode });
}

// Authentication middleware
export async function requireAuth(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  
  return session;
}

// Role-based authorization
export function requireRole(userRole: string, requiredRoles: string[]) {
  if (!requiredRoles.includes(userRole)) {
    throw new Error('Insufficient permissions');
  }
}

// Validation helper
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.issues.map((e: any) => e.message).join(', ')}`);
    }
    throw error;
  }
}

// Pagination helper
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export function getPaginationParams(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
}

// Pagination response wrapper
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

// Request handler wrapper with error handling
export function withErrorHandling(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error('API Error:', error);
      
      if (error instanceof Error) {
        if (error.message === 'Unauthorized') {
          return createErrorResponse(
            ErrorCodes.UNAUTHORIZED,
            'Authentication required',
            401
          );
        }
        
        if (error.message === 'Insufficient permissions') {
          return createErrorResponse(
            ErrorCodes.INSUFFICIENT_PERMISSIONS,
            'Insufficient permissions for this operation',
            403
          );
        }
        
        if (error.message.startsWith('Validation failed:')) {
          return createErrorResponse(
            ErrorCodes.VALIDATION_ERROR,
            error.message,
            400
          );
        }
      }
      
      return createErrorResponse(
        ErrorCodes.INTERNAL_SERVER_ERROR,
        'Internal server error',
        500,
        process.env.NODE_ENV === 'development' ? error : undefined
      );
    }
  };
}