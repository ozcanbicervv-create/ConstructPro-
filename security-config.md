# ConstructPro Security Configuration

## Security Headers Implementation

### Current Security Headers (in next.config.ts)
```typescript
// Security headers for production
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
      ],
    },
  ];
}
```

## Container Security Best Practices

### Dockerfile Security Measures ✅
- ✅ Non-root user (nodejs/nextjs)
- ✅ Alpine Linux base (minimal attack surface)
- ✅ Multi-stage build (reduces final image size)
- ✅ Specific Node.js version (18-alpine)
- ✅ No unnecessary packages in production image

### Additional Security Recommendations
```dockerfile
# Add to Dockerfile for enhanced security
USER nextjs
EXPOSE 3000
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Remove package managers from production image
RUN rm -rf /usr/local/lib/node_modules/npm
```

## Environment Variables Security

### Sensitive Data Management
```env
# Production environment variables (store in Coolify secrets)
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com

# Non-sensitive configuration
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### Environment Variable Validation
```typescript
// Add to src/lib/env-validation.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

## Network Security

### Coolify Network Configuration
```yaml
# Coolify network settings
networks:
  - constructpro-network
    
security_opt:
  - no-new-privileges:true
  
read_only: false  # Next.js needs write access for .next directory
tmpfs:
  - /tmp
  - /var/tmp
```

### Firewall Rules (UFW)
```bash
# Allow only necessary ports
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 8000/tcp  # Coolify dashboard
ufw deny 3000/tcp   # Block direct access to app (use reverse proxy)
```

## SSL/TLS Configuration

### Coolify SSL Setup
1. **Automatic SSL**: Enable Let's Encrypt in Coolify
2. **Custom Domain**: Configure your domain in Coolify
3. **SSL Redirect**: Force HTTPS redirects
4. **HSTS**: Enabled via security headers

### SSL Verification Commands
```bash
# Test SSL configuration
curl -I https://your-domain.com
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Check SSL rating
curl -s "https://api.ssllabs.com/api/v3/analyze?host=your-domain.com"
```

## Database Security

### Prisma Security Configuration
```typescript
// prisma/schema.prisma security considerations
generator client {
  provider = "prisma-client-js"
  // Enable query logging in development only
  log = ["query", "info", "warn", "error"]
}

datasource db {
  provider = "postgresql"  // More secure than SQLite for production
  url      = env("DATABASE_URL")
}
```

### Database Connection Security
```typescript
// src/lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

## API Security

### Rate Limiting
```typescript
// src/middleware/rate-limit.ts
import { NextRequest } from 'next/server';

const rateLimitMap = new Map();

export function rateLimit(limit: number = 100, windowMs: number = 60000) {
  return (req: NextRequest) => {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, []);
    }
    
    const requests = rateLimitMap.get(ip);
    const validRequests = requests.filter((time: number) => time > windowStart);
    
    if (validRequests.length >= limit) {
      return false; // Rate limit exceeded
    }
    
    validRequests.push(now);
    rateLimitMap.set(ip, validRequests);
    return true;
  };
}
```

### Input Validation
```typescript
// Use Zod for all API input validation
import { z } from 'zod';

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  // Add more validation rules
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createProjectSchema.parse(body);
    // Process validated data
  } catch (error) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
}
```

## Authentication Security

### NextAuth.js Security Configuration
```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';

export const authOptions = {
  providers: [
    // Configure secure providers
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add security checks
      return token;
    },
    async session({ session, token }) {
      // Add security checks
      return session;
    },
  },
};
```

## Monitoring and Logging Security

### Secure Logging Configuration
```typescript
// src/lib/logger.ts
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      meta: sanitizeLogData(meta),
    }));
  },
  error: (message: string, error?: Error) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      error: error?.message,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    }));
  },
};

function sanitizeLogData(data: any): any {
  // Remove sensitive information from logs
  if (typeof data === 'object' && data !== null) {
    const sanitized = { ...data };
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.secret;
    return sanitized;
  }
  return data;
}
```

## Security Checklist

### Pre-deployment Security Audit ✅
- [x] Security headers implemented
- [x] Non-root container user
- [x] Environment variables secured
- [x] Input validation with Zod
- [x] Health check endpoints secured
- [x] Monitoring without sensitive data exposure
- [x] SSL/TLS configuration ready
- [x] Database connection secured
- [x] Rate limiting prepared
- [x] Error handling without information leakage

### Production Security Monitoring
- [ ] Set up security monitoring alerts
- [ ] Configure log aggregation
- [ ] Implement intrusion detection
- [ ] Set up vulnerability scanning
- [ ] Configure backup encryption

## Incident Response Plan

### Security Incident Response
1. **Detection**: Monitor logs and alerts
2. **Assessment**: Evaluate severity and impact
3. **Containment**: Isolate affected systems
4. **Eradication**: Remove threats and vulnerabilities
5. **Recovery**: Restore services safely
6. **Lessons Learned**: Update security measures

### Emergency Contacts
- System Administrator: [Contact Info]
- Security Team: [Contact Info]
- Coolify Support: [Contact Info]

## Compliance Considerations

### Data Protection
- Implement GDPR compliance measures
- Configure data retention policies
- Set up data encryption at rest and in transit
- Implement user consent management

### Security Standards
- Follow OWASP Top 10 guidelines
- Implement security by design principles
- Regular security assessments
- Keep dependencies updated