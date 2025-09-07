# Security Middleware Documentation

## Overview

ConstructPro implements comprehensive security middleware to protect API endpoints from various threats including unauthorized access, rate limiting violations, input validation attacks, and more. This document outlines the available security features and how to implement them.

## Table of Contents

1. [Authentication Middleware](#authentication-middleware)
2. [Rate Limiting](#rate-limiting)
3. [Input Validation & Sanitization](#input-validation--sanitization)
4. [API Key Authentication](#api-key-authentication)
5. [Audit Logging](#audit-logging)
6. [Security Headers](#security-headers)
7. [Usage Examples](#usage-examples)
8. [Best Practices](#best-practices)

## Authentication Middleware

### `withAuth`

Provides JWT-based authentication with role-based access control.

```typescript
import { withAuth } from '@/middleware/auth.middleware';
import { UserRole } from '@prisma/client';

export const GET = withAuth(
  async (req) => {
    const user = req.user; // Available after authentication
    return NextResponse.json({ user: user.email });
  },
  {
    requireAuth: true,
    requiredRole: UserRole.PROJECT_MANAGER,
    requiredPermission: {
      resource: 'projects',
      action: 'read'
    }
  }
);
```

#### Options

- `requireAuth`: Boolean - Whether authentication is required
- `requiredRole`: UserRole - Minimum role required
- `requiredPermission`: Object - Specific permission required
  - `resource`: String - Resource name
  - `action`: String - Action name

### `withSecureAuth`

Combines authentication with comprehensive security features.

```typescript
import { withSecureAuth } from '@/middleware/security.middleware';

export const POST = withSecureAuth(
  async (req) => {
    // Your secure API logic
    return NextResponse.json({ success: true });
  },
  {
    requireAuth: true,
    requiredRole: UserRole.ADMIN,
    rateLimit: {
      windowMs: 60 * 1000,
      maxRequests: 10
    },
    validateInput: true,
    sanitizeInput: true
  }
);
```

## Rate Limiting

### Predefined Configurations

```typescript
import { RateLimitConfigs } from '@/utils/security/rate-limiting';

// Available configurations:
RateLimitConfigs.auth      // 5 requests per 15 minutes
RateLimitConfigs.api       // 100 requests per minute
RateLimitConfigs.upload    // 10 requests per minute
RateLimitConfigs.search    // 30 requests per minute
RateLimitConfigs.admin     // 20 requests per minute
```

### Custom Rate Limiting

```typescript
import { createRateLimit } from '@/utils/security/rate-limiting';

const customRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  skipSuccessfulRequests: true,
  keyGenerator: (request) => {
    // Custom key generation logic
    return request.headers.get('x-user-id') || 'anonymous';
  }
});

export const GET = async (req) => {
  return customRateLimit(req, async (req) => {
    // Your API logic
    return NextResponse.json({ success: true });
  });
};
```

### IP-based and User-based Rate Limiting

```typescript
import { createIPRateLimit, createUserRateLimit } from '@/utils/security/rate-limiting';

// IP-based limiting
const ipRateLimit = createIPRateLimit(50, 60 * 1000); // 50 requests per minute per IP

// User-based limiting
const userRateLimit = createUserRateLimit(200, 60 * 1000); // 200 requests per minute per user
```

## Input Validation & Sanitization

### Request Body Validation

```typescript
import { withInputValidation } from '@/middleware/security.middleware';
import { z } from 'zod';

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  budget: z.number().min(0).optional()
});

export const POST = withInputValidation(
  createProjectSchema,
  async (req, validatedData) => {
    // validatedData is type-safe and validated
    const { name, description, budget } = validatedData;
    
    // Create project logic
    return NextResponse.json({ success: true });
  }
);
```

### Query Parameter Validation

```typescript
import { withQueryValidation } from '@/middleware/security.middleware';

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional()
});

export const GET = withQueryValidation(
  querySchema,
  async (req, validatedParams) => {
    const { page, limit, status } = validatedParams;
    // Use validated parameters
    return NextResponse.json({ page, limit, status });
  }
);
```

### Input Sanitization

```typescript
import { sanitizeText, sanitizeHtml, sanitizeFilename } from '@/utils/security/input-validation';

// Sanitize plain text
const cleanText = sanitizeText(userInput);

// Sanitize HTML content
const cleanHtml = sanitizeHtml(htmlContent);

// Sanitize filename
const cleanFilename = sanitizeFilename(uploadedFilename);
```

## API Key Authentication

### Creating API Keys

```typescript
import { ApiKeyService } from '@/middleware/api-key.middleware';

// Create a new API key
const result = await ApiKeyService.createApiKey({
  name: 'Third-party Integration',
  permissions: ['projects:read', 'tasks:read'],
  type: 'USER',
  userId: 'user-id',
  expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
});

console.log('API Key:', result.key); // Only shown once
console.log('Key ID:', result.apiKey.id);
```

### Using API Key Authentication

```typescript
import { withApiKey } from '@/middleware/api-key.middleware';

export const GET = withApiKey(
  async (req) => {
    const apiKey = req.apiKey; // Available after authentication
    
    return NextResponse.json({
      keyName: apiKey.name,
      permissions: apiKey.permissions
    });
  },
  {
    requiredPermissions: ['projects:read'],
    allowUserKeys: true,
    allowSystemKeys: false
  }
);
```

### API Key Permissions

```typescript
import { ApiKeyPermissions } from '@/middleware/api-key.middleware';

// Available permissions:
ApiKeyPermissions['projects:read']    // Read project information
ApiKeyPermissions['projects:write']   // Create and update projects
ApiKeyPermissions['projects:delete']  // Delete projects
ApiKeyPermissions['tasks:read']       // Read task information
ApiKeyPermissions['tasks:write']      // Create and update tasks
ApiKeyPermissions['materials:read']   // Read material information
ApiKeyPermissions['documents:read']   // Read document information
ApiKeyPermissions['admin:*']          // Full administrative access
ApiKeyPermissions['*']                // Full access to all resources
```

### Managing API Keys

```typescript
// List user's API keys
const apiKeys = await ApiKeyService.listUserApiKeys('user-id');

// Get API key statistics
const stats = await ApiKeyService.getApiKeyStats('key-id');

// Revoke an API key
await ApiKeyService.revokeApiKey('key-id', 'revoked-by-user-id');
```

## Audit Logging

### Basic Audit Logging

```typescript
import { getAuditLogger } from '@/utils/audit-logger';

const auditLogger = getAuditLogger();

// Log authentication events
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
  { projectName: 'New Project' }
);

// Log security events
await auditLogger.logSecurity('RATE_LIMIT_EXCEEDED', 'user-id', {
  endpoint: '/api/projects',
  attempts: 101
});
```

### Automatic Audit Logging

```typescript
import { withAuditLogging } from '@/utils/audit-logger';

export const DELETE = withAuditLogging(
  async (req) => {
    // Your API logic
    return NextResponse.json({ success: true });
  },
  {
    resource: 'project',
    action: 'delete',
    logSuccess: true,
    logFailure: true
  }
);
```

### Audit Event Types

- **Authentication**: `LOGIN_SUCCESS`, `LOGIN_FAILURE`, `LOGOUT`, `PASSWORD_CHANGE`
- **MFA**: `MFA_ENABLED`, `MFA_DISABLED`, `MFA_VERIFICATION_SUCCESS`
- **Authorization**: `PERMISSION_GRANTED`, `PERMISSION_DENIED`, `ROLE_ASSIGNED`
- **Resources**: `RESOURCE_CREATED`, `RESOURCE_UPDATED`, `RESOURCE_DELETED`
- **Security**: `RATE_LIMIT_EXCEEDED`, `SUSPICIOUS_ACTIVITY`, `SECURITY_VIOLATION`
- **Sessions**: `SESSION_CREATED`, `SESSION_EXPIRED`, `SESSION_TERMINATED`

## Security Headers

The security middleware automatically applies the following headers:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` (production only)

## Usage Examples

### Complete Secure API Endpoint

```typescript
import { withSecureAuth } from '@/middleware/security.middleware';
import { withAuditLogging } from '@/utils/audit-logger';
import { z } from 'zod';

const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'COMPLETED']).optional()
});

export const PATCH = withAuditLogging(
  withSecureAuth(
    async (req) => {
      const user = req.user;
      const projectId = req.nextUrl.pathname.split('/').pop();
      
      // Update project logic
      
      return NextResponse.json({
        success: true,
        message: 'Project updated successfully'
      });
    },
    {
      requireAuth: true,
      requiredRole: UserRole.PROJECT_MANAGER,
      rateLimit: {
        windowMs: 60 * 1000,
        maxRequests: 30
      },
      validateInput: true,
      sanitizeInput: true
    }
  ),
  {
    resource: 'project',
    action: 'update',
    logSuccess: true,
    logFailure: true
  }
);
```

### File Upload with Security

```typescript
import { withAuth } from '@/middleware/auth.middleware';
import { createRateLimit, RateLimitConfigs } from '@/utils/security/rate-limiting';
import { sanitizeFilename } from '@/utils/security/input-validation';

const uploadRateLimit = createRateLimit(RateLimitConfigs.upload);

export const POST = async (req) => {
  return uploadRateLimit(req,
    withAuth(async (req) => {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        );
      }
      
      // Sanitize filename
      const cleanFilename = sanitizeFilename(file.name);
      
      // File upload logic
      
      return NextResponse.json({
        success: true,
        filename: cleanFilename
      });
    }, {
      requireAuth: true,
      requiredPermission: {
        resource: 'documents',
        action: 'create'
      }
    })
  );
};
```

## Best Practices

### 1. Layer Security Measures

Always combine multiple security measures:

```typescript
export const POST = withSecureAuth(
  async (req) => {
    // Your logic
  },
  {
    requireAuth: true,
    requiredRole: UserRole.PROJECT_MANAGER,
    rateLimit: RateLimitConfigs.api,
    validateInput: true,
    sanitizeInput: true,
    requireHttps: true
  }
);
```

### 2. Use Appropriate Rate Limits

- **Authentication endpoints**: Very strict (5 requests per 15 minutes)
- **General API**: Moderate (100 requests per minute)
- **File uploads**: Restricted (10 requests per minute)
- **Admin operations**: Limited (20 requests per minute)

### 3. Validate All Input

Always validate and sanitize user input:

```typescript
// Define schemas for all endpoints
const schema = z.object({
  // Define your validation rules
});

export const POST = withInputValidation(schema, async (req, data) => {
  // Use validated data
});
```

### 4. Log Security Events

Enable audit logging for sensitive operations:

```typescript
export const DELETE = withAuditLogging(
  async (req) => {
    // Deletion logic
  },
  {
    resource: 'project',
    action: 'delete',
    logSuccess: true,
    logFailure: true
  }
);
```

### 5. Use API Keys for Third-party Access

For external integrations, use API keys instead of user credentials:

```typescript
export const GET = withApiKey(
  async (req) => {
    // API logic
  },
  {
    requiredPermissions: ['projects:read'],
    allowUserKeys: true,
    allowSystemKeys: false
  }
);
```

### 6. Monitor and Alert

Implement monitoring for security events:

```typescript
// Get security summary
const summary = await auditLogger.getSecuritySummary('user-id', 30);

if (summary.suspiciousActivity) {
  // Send alert to administrators
}
```

## API Endpoints

### Authentication & Security

- `GET /api/auth/api-keys` - List user's API keys
- `POST /api/auth/api-keys` - Create new API key
- `GET /api/auth/api-keys/[keyId]` - Get API key details
- `DELETE /api/auth/api-keys/[keyId]` - Revoke API key
- `GET /api/auth/security-summary` - Get user's security summary

### Admin Endpoints

- `GET /api/admin/audit-logs` - Get audit logs (Admin only)

## Error Responses

### Rate Limiting

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 60
}
```

### Authentication

```json
{
  "error": "Authentication required"
}
```

### Authorization

```json
{
  "error": "Insufficient permissions"
}
```

### Validation

```json
{
  "error": "Validation failed",
  "details": "name: String must contain at least 1 character(s)"
}
```

## Configuration

### Environment Variables

```env
# JWT Secrets
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret

# CORS Configuration
ALLOWED_ORIGINS=https://constructpro.com,https://app.constructpro.com

# Security Settings
REQUIRE_HTTPS=true
ENABLE_AUDIT_LOGGING=true
```

### Rate Limiting Storage

For production, consider using Redis for rate limiting storage:

```typescript
// Configure Redis for rate limiting
const redis = new Redis(process.env.REDIS_URL);

// Use Redis-based rate limiting
const rateLimitStore = new RedisRateLimitStore(redis);
```

This comprehensive security middleware provides multiple layers of protection for your ConstructPro API endpoints while maintaining flexibility and ease of use.