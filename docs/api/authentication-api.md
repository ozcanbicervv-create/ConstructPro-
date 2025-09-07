# Authentication API Documentation

## Overview

The ConstructPro authentication system provides comprehensive security features including multi-factor authentication (MFA), role-based access control (RBAC), JWT token management, and session management specifically designed for construction project management workflows.

## Features

- **Multi-Factor Authentication (MFA)** with TOTP and backup codes
- **Role-Based Access Control (RBAC)** with construction-specific permissions
- **JWT Token Management** with access and refresh token rotation
- **Session Management** with automatic timeout and cleanup
- **Audit Logging** for all authentication events
- **Construction Industry Roles** (Admin, Project Manager, Site Supervisor, Worker, Client, Supplier)

## Authentication Endpoints

### POST /api/auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "company": "Construction Co",
  "title": "Site Manager",
  "phone": "+1234567890",
  "role": "PROJECT_MANAGER"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "PROJECT_MANAGER",
    "mfaEnabled": false
  },
  "accessToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

### POST /api/auth/login

Authenticate user with email/password and optional MFA.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "mfaCode": "123456"
}
```

**Response (Success):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "role": "PROJECT_MANAGER",
    "mfaEnabled": true
  },
  "accessToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

**Response (MFA Required):**
```json
{
  "message": "MFA code required",
  "requiresMFA": true
}
```

### POST /api/auth/refresh

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

**Response:**
```json
{
  "message": "Token refreshed successfully",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "role": "PROJECT_MANAGER"
  },
  "accessToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

### POST /api/auth/logout

Logout user and clear session.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

## Multi-Factor Authentication (MFA)

### POST /api/auth/mfa/setup

Setup MFA for authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "MFA setup initiated",
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCodeUrl": "otpauth://totp/ConstructPro:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=ConstructPro",
  "backupCodes": [
    "A1B2C3D4",
    "E5F6G7H8",
    "..."
  ]
}
```

### POST /api/auth/mfa/verify

Verify MFA code and complete setup.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "code": "123456"
}
```

**Response:**
```json
{
  "message": "MFA enabled successfully",
  "success": true
}
```

### POST /api/auth/mfa/disable

Disable MFA for authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "message": "MFA disabled successfully"
}
```

## Session Management

### GET /api/auth/session

Get current session status.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "authenticated": true,
  "session": {
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "role": "PROJECT_MANAGER"
    },
    "isActive": true,
    "lastActive": "2024-01-15T10:30:00Z"
  }
}
```

### POST /api/auth/session

Force logout user (Admin only).

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Request Body:**
```json
{
  "userId": "user-123"
}
```

**Response:**
```json
{
  "message": "User logged out successfully"
}
```

### PUT /api/auth/session

Get active sessions count (Admin only).

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Response:**
```json
{
  "activeSessionsCount": 25
}
```

## Permissions

### GET /api/auth/permissions

Get user permissions based on role.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "role": "PROJECT_MANAGER",
  "permissions": [
    {
      "resource": "projects",
      "actions": ["create", "read", "update", "manage"]
    },
    {
      "resource": "tasks",
      "actions": ["create", "read", "update", "delete", "assign"]
    },
    {
      "resource": "materials",
      "actions": ["create", "read", "update", "order"]
    }
  ]
}
```

## Role-Based Access Control (RBAC)

### Construction Industry Roles

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **ADMIN** | Full system access | All resources and actions |
| **PROJECT_MANAGER** | Manage projects and teams | Projects, tasks, materials, documents, team management |
| **SITE_SUPERVISOR** | Supervise on-site activities | Task management, team assignment, progress tracking |
| **WORKER** | Execute assigned tasks | Task updates, document viewing, progress reporting |
| **CLIENT** | View project progress | Read-only access to projects, tasks, documents |
| **SUPPLIER** | Manage materials and orders | Material management, order processing |

### Permission Resources

- **projects**: Project creation, management, and oversight
- **tasks**: Task assignment, tracking, and completion
- **materials**: Material procurement, inventory, and cost management
- **documents**: Document upload, approval, and sharing
- **team**: Team member management and role assignment
- **reports**: Report generation and data export
- **system**: System configuration and administration

### Permission Actions

- **create**: Create new resources
- **read**: View and access resources
- **update**: Modify existing resources
- **delete**: Remove resources
- **manage**: Full management capabilities
- **assign**: Assign resources to users
- **approve**: Approve documents or changes
- **share**: Share resources with others
- **export**: Export data and reports
- **configure**: System configuration
- **monitor**: System monitoring
- **backup**: Data backup operations
- **order**: Place and manage orders

## Authentication Middleware

### Usage in API Routes

```typescript
import { withAuth } from '@/middleware/auth.middleware';

// Require authentication
export const GET = withAuth(handler, { requireAuth: true });

// Require specific role
export const POST = withAuth(handler, { 
  requireAuth: true, 
  requiredRole: UserRole.PROJECT_MANAGER 
});

// Require specific permission
export const PUT = withAuth(handler, { 
  requireAuth: true,
  requiredPermission: {
    resource: 'projects',
    action: 'update'
  }
});
```

### RBAC Utility Functions

```typescript
import { RBAC } from '@/utils/rbac';

// Check specific permission
const canCreateProject = RBAC.hasPermission(userRole, 'projects', 'create');

// Check role hierarchy
const hasManagerLevel = RBAC.hasRoleLevel(userRole, UserRole.PROJECT_MANAGER);

// Get available actions
const actions = RBAC.getAvailableActions(userRole, 'tasks');
```

## Security Features

### JWT Token Configuration

- **Access Token**: 15 minutes expiry, RS256 algorithm
- **Refresh Token**: 7 days expiry, HTTP-only cookie
- **Token Rotation**: New refresh token issued on each refresh

### Session Management

- **Session Timeout**: 30 minutes of inactivity
- **Automatic Cleanup**: Inactive sessions cleaned every 5 minutes
- **Online Status**: Real-time user presence tracking

### Audit Logging

All authentication events are logged with:
- User ID and event type
- Timestamp and IP address
- User agent and metadata
- Success/failure status

### Rate Limiting

- **Login Attempts**: Limited per IP and user
- **API Requests**: Rate limited per user role
- **MFA Attempts**: Limited to prevent brute force

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_CREDENTIALS` | 401 | Invalid email or password |
| `TOKEN_EXPIRED` | 401 | Access token has expired |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required permissions |
| `MFA_REQUIRED` | 200 | MFA code required for login |
| `INVALID_MFA_CODE` | 400 | Invalid MFA verification code |
| `USER_NOT_FOUND` | 404 | User account not found |
| `SESSION_EXPIRED` | 401 | User session has expired |

## Environment Variables

```env
# JWT Configuration
JWT_ACCESS_SECRET="your-access-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"

# MFA Configuration
MFA_ISSUER="ConstructPro"
MFA_WINDOW=1

# Session Configuration
SESSION_TIMEOUT=1800000  # 30 minutes in milliseconds
```

## Best Practices

1. **Always use HTTPS** in production
2. **Store refresh tokens** in HTTP-only cookies
3. **Implement rate limiting** on authentication endpoints
4. **Log all authentication events** for audit trails
5. **Use strong JWT secrets** and rotate them regularly
6. **Implement proper session cleanup** to prevent memory leaks
7. **Validate permissions** on every protected endpoint
8. **Use MFA for sensitive operations** and privileged accounts