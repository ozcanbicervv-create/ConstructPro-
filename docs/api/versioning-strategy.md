# API Versioning Strategy

## Overview

ConstructPro API follows semantic versioning principles to ensure backward compatibility and smooth evolution of the API. This document outlines our versioning strategy, migration guidelines, and best practices.

## Versioning Scheme

### Version Format

We use semantic versioning (SemVer) with the format: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes that require client updates
- **MINOR**: New features that are backward compatible
- **PATCH**: Bug fixes and minor improvements

### Current Version

- **API Version**: 1.0.0
- **Specification**: OpenAPI 3.0.3
- **Release Date**: January 2024

## Versioning Methods

### 1. URL Path Versioning (Primary)

```
https://api.constructpro.com/v1/users/profile
https://api.constructpro.com/v2/users/profile
```

**Advantages:**
- Clear and explicit
- Easy to cache
- Simple routing

**Implementation:**
```typescript
// Next.js App Router structure
src/app/api/v1/users/profile/route.ts
src/app/api/v2/users/profile/route.ts
```

### 2. Header Versioning (Alternative)

```http
GET /api/users/profile
Accept: application/vnd.constructpro.v1+json
```

**Usage:** For clients that cannot modify URLs

### 3. Query Parameter Versioning (Fallback)

```
https://api.constructpro.com/api/users/profile?version=1
```

**Usage:** For simple integrations and testing

## Version Lifecycle

### 1. Development Phase
- **Duration**: 2-4 weeks
- **Status**: Alpha/Beta
- **Access**: Internal testing only
- **Documentation**: Draft specifications

### 2. Release Candidate
- **Duration**: 1-2 weeks
- **Status**: RC (Release Candidate)
- **Access**: Selected partners and beta testers
- **Documentation**: Complete but subject to minor changes

### 3. Stable Release
- **Duration**: 12-18 months minimum
- **Status**: Stable
- **Access**: Public availability
- **Documentation**: Complete and finalized

### 4. Deprecation
- **Duration**: 6-12 months notice
- **Status**: Deprecated
- **Access**: Available but not recommended
- **Documentation**: Migration guides provided

### 5. End of Life
- **Status**: Removed
- **Access**: No longer available
- **Documentation**: Archived

## Breaking Changes Policy

### What Constitutes a Breaking Change

1. **Removing endpoints or fields**
2. **Changing field types or formats**
3. **Modifying required fields**
4. **Changing authentication methods**
5. **Altering error response formats**
6. **Modifying HTTP status codes**

### Non-Breaking Changes

1. **Adding new endpoints**
2. **Adding optional fields**
3. **Adding new enum values**
4. **Improving error messages**
5. **Performance optimizations**
6. **Bug fixes**

## Migration Guidelines

### For API Consumers

#### 1. Version Detection
```typescript
// Check API version support
const response = await fetch('/api/version');
const { supportedVersions, currentVersion, deprecatedVersions } = await response.json();
```

#### 2. Graceful Degradation
```typescript
// Try latest version first, fallback to older versions
async function apiCall(endpoint: string, data: any) {
  try {
    return await fetch(`/api/v2/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    // Fallback to v1 if v2 fails
    return await fetch(`/api/v1/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

#### 3. Version Pinning
```typescript
// Pin to specific version for stability
const API_VERSION = 'v1';
const baseURL = `/api/${API_VERSION}`;
```

### For API Providers

#### 1. Backward Compatibility
```typescript
// Support multiple versions simultaneously
// src/app/api/v1/users/profile/route.ts
export async function GET(request: NextRequest) {
  // V1 implementation
  return NextResponse.json(transformToV1Format(userData));
}

// src/app/api/v2/users/profile/route.ts
export async function GET(request: NextRequest) {
  // V2 implementation with new features
  return NextResponse.json(transformToV2Format(userData));
}
```

#### 2. Shared Business Logic
```typescript
// src/services/user.service.ts
export class UserService {
  static async getUserProfile(userId: string) {
    // Core business logic shared across versions
    return await prisma.user.findUnique({ where: { id: userId } });
  }
}

// Version-specific transformers
// src/transformers/v1/user.transformer.ts
export function transformUserToV1(user: User): UserV1 {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    // V1 specific format
  };
}
```

## Version Documentation

### 1. Changelog Format

```markdown
## [2.0.0] - 2024-06-01

### Added
- New project management endpoints
- Enhanced authentication with MFA support
- Real-time notifications via WebSocket

### Changed
- User profile structure (BREAKING)
- Error response format standardization (BREAKING)

### Deprecated
- Legacy authentication endpoints (use /auth/v2/)

### Removed
- Deprecated material endpoints from v1.5

### Fixed
- Memory leak in health check endpoint
- Timezone handling in date fields
```

### 2. Migration Guides

Each major version includes:
- **Breaking changes summary**
- **Step-by-step migration instructions**
- **Code examples (before/after)**
- **Timeline and deadlines**
- **Support contact information**

### 3. API Documentation Versioning

```
docs/
├── api/
│   ├── v1/
│   │   ├── openapi.json
│   │   ├── endpoints/
│   │   └── examples/
│   ├── v2/
│   │   ├── openapi.json
│   │   ├── endpoints/
│   │   └── examples/
│   └── migration/
│       ├── v1-to-v2.md
│       └── v2-to-v3.md
```

## Implementation Examples

### 1. Version Middleware

```typescript
// src/middleware/version.middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function versionMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Extract version from URL path
  const versionMatch = pathname.match(/^\/api\/v(\d+)\//);
  const version = versionMatch ? parseInt(versionMatch[1]) : 1;
  
  // Validate version support
  const supportedVersions = [1, 2];
  if (!supportedVersions.includes(version)) {
    return NextResponse.json(
      { 
        error: 'Unsupported API version',
        supportedVersions,
        requestedVersion: version
      },
      { status: 400 }
    );
  }
  
  // Add version to request headers
  const response = NextResponse.next();
  response.headers.set('X-API-Version', version.toString());
  
  return response;
}
```

### 2. Version Detection Endpoint

```typescript
// src/app/api/version/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    currentVersion: '1.0.0',
    supportedVersions: ['1.0.0'],
    deprecatedVersions: [],
    latestVersion: '1.0.0',
    versioningScheme: 'semantic',
    endpoints: {
      v1: '/api/v1',
    },
    deprecationPolicy: {
      noticeMinimum: '6 months',
      supportDuration: '12 months'
    },
    contact: {
      support: 'api-support@constructpro.com',
      documentation: 'https://docs.constructpro.com/api'
    }
  });
}
```

### 3. Deprecation Headers

```typescript
// Add deprecation warnings to responses
export async function GET(request: NextRequest) {
  const response = NextResponse.json(data);
  
  // Add deprecation warning for v1
  if (request.nextUrl.pathname.includes('/v1/')) {
    response.headers.set('Deprecation', 'true');
    response.headers.set('Sunset', '2024-12-31T23:59:59Z');
    response.headers.set('Link', '</api/v2/migration>; rel="successor-version"');
  }
  
  return response;
}
```

## Monitoring and Analytics

### 1. Version Usage Tracking

```typescript
// Track API version usage
export async function trackVersionUsage(version: string, endpoint: string) {
  await analytics.track('api_version_usage', {
    version,
    endpoint,
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get('user-agent'),
  });
}
```

### 2. Deprecation Metrics

- **Version adoption rates**
- **Migration progress tracking**
- **Error rates by version**
- **Performance metrics comparison**

## Best Practices

### For API Consumers

1. **Always specify version explicitly**
2. **Monitor deprecation headers**
3. **Test against new versions early**
4. **Implement graceful fallbacks**
5. **Subscribe to API announcements**

### For API Providers

1. **Maintain backward compatibility within major versions**
2. **Provide clear migration paths**
3. **Give adequate deprecation notice**
4. **Document all breaking changes**
5. **Support multiple versions simultaneously**

## Communication Strategy

### 1. Announcement Channels

- **Email notifications** to registered developers
- **API response headers** for deprecation warnings
- **Documentation updates** with migration guides
- **GitHub releases** with detailed changelogs
- **Developer newsletter** with version updates

### 2. Timeline Communication

```
New Version Release Timeline:
├── T-8 weeks: Alpha release announcement
├── T-6 weeks: Beta release with documentation
├── T-4 weeks: Release candidate available
├── T-2 weeks: Final testing and feedback
├── T-0 weeks: Stable release
├── T+26 weeks: Previous version deprecation notice
└── T+52 weeks: Previous version end-of-life
```

## Conclusion

This versioning strategy ensures that ConstructPro API can evolve while maintaining stability and providing clear migration paths for consumers. Regular review and updates of this strategy will help adapt to changing requirements and industry best practices.