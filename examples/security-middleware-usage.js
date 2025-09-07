/**
 * Security Middleware Usage Examples for ConstructPro
 * 
 * This file demonstrates how to use the various security middleware
 * components in your API routes.
 */

// Example 1: Basic API route with authentication and rate limiting
import { UserRole } from '@prisma/client';

import { withSecureAuth } from '@/middleware/security.middleware';

export const GET = withSecureAuth(
  async (req) => {
    // Your API logic here
    const user = req.user; // Available due to authentication
    
    return NextResponse.json({
      message: 'Secure endpoint accessed',
      user: user.email
    });
  },
  {
    requireAuth: true,
    rateLimit: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100
    }
  }
);

// Example 2: Admin-only endpoint with strict rate limiting
export const POST = withSecureAuth(
  async (req) => {
    // Admin-only logic
    return NextResponse.json({ message: 'Admin action completed' });
  },
  {
    requireAuth: true,
    requiredRole: UserRole.ADMIN,
    rateLimit: {
      windowMs: 60 * 1000,
      maxRequests: 10 // Stricter limit for admin actions
    }
  }
);

// Example 3: API key authentication for third-party integrations
import { withApiKey, ApiKeyPermissions } from '@/middleware/api-key.middleware';

export const GET_API_KEY = withApiKey(
  async (req) => {
    const apiKey = req.apiKey; // Available due to API key auth
    
    return NextResponse.json({
      message: 'API key authenticated',
      keyName: apiKey.name,
      permissions: apiKey.permissions
    });
  },
  {
    requiredPermissions: ['projects:read'],
    allowUserKeys: true,
    allowSystemKeys: true
  }
);

// Example 4: Input validation with security middleware
import { withInputValidation } from '@/middleware/security.middleware';

import { z } from 'zod';

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  budget: z.number().min(0).optional()
});

export const POST_WITH_VALIDATION = withInputValidation(
  createProjectSchema,
  async (req, validatedData) => {
    // validatedData is type-safe and validated
    const { name, description, budget } = validatedData;
    
    // Create project logic here
    return NextResponse.json({
      message: 'Project created',
      project: { name, description, budget }
    });
  }
);

// Example 5: Combined authentication, authorization, and audit logging
import { withAuditLogging } from '@/utils/audit-logger';

export const DELETE = withAuditLogging(
  withSecureAuth(
    async (req) => {
      const user = req.user;
      const projectId = req.nextUrl.pathname.split('/').pop();
      
      // Delete project logic
      
      return NextResponse.json({
        message: 'Project deleted successfully'
      });
    },
    {
      requireAuth: true,
      requiredRole: UserRole.PROJECT_MANAGER,
      rateLimit: {
        windowMs: 60 * 1000,
        maxRequests: 5 // Very strict for delete operations
      }
    }
  ),
  {
    resource: 'project',
    action: 'delete',
    logSuccess: true,
    logFailure: true
  }
);

// Example 6: Query parameter validation
import { withQueryValidation } from '@/middleware/security.middleware';

const projectFiltersSchema = z.object({
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10)
});

export const GET_WITH_QUERY_VALIDATION = withQueryValidation(
  projectFiltersSchema,
  async (req, validatedParams) => {
    const { status, page, limit } = validatedParams;
    
    // Use validated query parameters
    return NextResponse.json({
      filters: { status, page, limit },
      message: 'Query parameters validated'
    });
  }
);

// Example 7: Custom security configuration
import { withSecurity } from '@/middleware/security.middleware';

export const CUSTOM_SECURITY = withSecurity(
  async (req) => {
    return NextResponse.json({ message: 'Custom security applied' });
  },
  {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 1000,
      skipSuccessfulRequests: true
    },
    validateInput: true,
    sanitizeInput: true,
    requireHttps: true,
    corsEnabled: true,
    allowedOrigins: ['https://constructpro.com', 'https://app.constructpro.com']
  }
);

// Example 8: File upload with security
import { withAuth } from '@/middleware/auth.middleware';
import { createRateLimit, RateLimitConfigs } from '@/utils/security/rate-limiting';

const uploadRateLimit = createRateLimit(RateLimitConfigs.upload);

export const POST_FILE_UPLOAD = async (req) => {
  return uploadRateLimit(req, 
    withAuth(async (req) => {
      // File upload logic with authentication
      return NextResponse.json({ message: 'File uploaded securely' });
    }, {
      requireAuth: true,
      requiredPermission: {
        resource: 'documents',
        action: 'create'
      }
    })
  );
};

// Example 9: API key management
export async function createApiKeyExample() {
  const { ApiKeyService } = await import('@/middleware/api-key.middleware');
  
  // Create a new API key
  const result = await ApiKeyService.createApiKey({
    name: 'Third-party Integration',
    permissions: ['projects:read', 'tasks:read', 'materials:read'],
    type: 'USER',
    userId: 'user-id-here',
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
  });
  
  console.log('API Key created:', result.key); // Only shown once
  console.log('API Key ID:', result.apiKey.id);
}

// Example 10: Audit logging
export async function auditLoggingExample() {
  const { getAuditLogger } = await import('@/utils/audit-logger');
  const auditLogger = getAuditLogger();
  
  // Log authentication event
  await auditLogger.logAuth('LOGIN_SUCCESS', 'user-id', {
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...'
  });
  
  // Log resource access
  await auditLogger.logResourceAccess(
    'RESOURCE_CREATED',
    'user-id',
    'project',
    'project-id',
    'create',
    'SUCCESS',
    { projectName: 'New Construction Project' }
  );
  
  // Log security event
  await auditLogger.logSecurity('RATE_LIMIT_EXCEEDED', 'user-id', {
    endpoint: '/api/projects',
    attempts: 101
  });
}

// Example 11: Rate limiting configurations
export const RATE_LIMIT_EXAMPLES = {
  // Authentication endpoints - very strict
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    skipSuccessfulRequests: true
  },
  
  // General API - moderate
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100
  },
  
  // File uploads - restricted
  upload: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10
  },
  
  // Search operations - moderate
  search: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30
  }
};

// Example 12: Permission checking
export async function checkPermissionsExample() {
  const { AuthService } = await import('@/services/auth.service');
  
  const hasPermission = AuthService.checkPermission(
    'PROJECT_MANAGER',
    'projects',
    'create'
  );
  
  console.log('Can create projects:', hasPermission);
}

export default {
  message: 'Security middleware examples for ConstructPro',
  examples: [
    'Basic authentication with rate limiting',
    'Admin-only endpoints',
    'API key authentication',
    'Input validation',
    'Audit logging',
    'Query parameter validation',
    'Custom security configuration',
    'File upload security',
    'API key management',
    'Permission checking'
  ]
};