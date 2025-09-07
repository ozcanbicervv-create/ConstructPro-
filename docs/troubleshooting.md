# Troubleshooting Guide

This guide provides solutions to common issues you might encounter while developing, deploying, or using ConstructPro.

## Table of Contents

- [Development Issues](#development-issues)
- [Build and Deployment Issues](#build-and-deployment-issues)
- [Database Issues](#database-issues)
- [Authentication Issues](#authentication-issues)
- [Performance Issues](#performance-issues)
- [Socket.IO and Real-time Issues](#socketio-and-real-time-issues)
- [Environment and Configuration Issues](#environment-and-configuration-issues)
- [Testing Issues](#testing-issues)
- [Production Issues](#production-issues)

## Development Issues

### Port Already in Use

**Problem**: Development server fails to start with "Port 3000 is already in use" error.

**Solutions**:

```bash
# Option 1: Kill the process using port 3000
npx kill-port 3000

# Option 2: Find and kill the process manually
# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On macOS/Linux
lsof -ti:3000 | xargs kill -9

# Option 3: Use a different port
PORT=3001 npm run dev
```

### Hot Reload Not Working

**Problem**: Changes to code don't trigger automatic reload.

**Solutions**:

1. **Check file watchers**:
   ```bash
   # Increase file watcher limit (Linux/macOS)
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

2. **Restart development server**:
   ```bash
   # Stop the server (Ctrl+C) and restart
   npm run dev
   ```

3. **Clear Next.js cache**:
   ```bash
   rm -rf .next
   npm run dev
   ```

### TypeScript Errors

**Problem**: TypeScript compilation errors or type checking issues.

**Solutions**:

1. **Restart TypeScript server** (VS Code):
   - Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
   - Run "TypeScript: Restart TS Server"

2. **Check TypeScript configuration**:
   ```bash
   # Run type checking manually
   npm run type-check
   
   # Check for TypeScript errors
   npx tsc --noEmit
   ```

3. **Update TypeScript and dependencies**:
   ```bash
   npm update typescript @types/node @types/react @types/react-dom
   ```

### ESLint Errors

**Problem**: Linting errors preventing development or build.

**Solutions**:

1. **Fix automatically**:
   ```bash
   npm run lint:fix
   ```

2. **Check specific files**:
   ```bash
   npx eslint src/components/YourComponent.tsx
   ```

3. **Disable specific rules** (use sparingly):
   ```typescript
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   const unusedVariable = 'temporary';
   ```

### Import/Module Resolution Issues

**Problem**: Cannot resolve module imports or path aliases not working.

**Solutions**:

1. **Check path aliases in `tsconfig.json`**:
   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

2. **Restart development server**:
   ```bash
   npm run dev
   ```

3. **Clear module cache**:
   ```bash
   rm -rf node_modules/.cache
   npm run dev
   ```

## Build and Deployment Issues

### Build Failures

**Problem**: `npm run build` fails with various errors.

**Solutions**:

1. **Clear build cache**:
   ```bash
   rm -rf .next
   rm -rf node_modules/.cache
   npm run build
   ```

2. **Check for TypeScript errors**:
   ```bash
   npm run type-check
   ```

3. **Verify all dependencies are installed**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

4. **Check environment variables**:
   ```bash
   # Ensure all required environment variables are set
   cat .env.local
   ```

### Memory Issues During Build

**Problem**: Build process runs out of memory.

**Solutions**:

1. **Increase Node.js memory limit**:
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npm run build
   ```

2. **Add to package.json scripts**:
   ```json
   {
     "scripts": {
       "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
     }
   }
   ```

### Static Export Issues

**Problem**: Issues with static site generation or export.

**Solutions**:

1. **Check for dynamic imports**:
   ```typescript
   // Use dynamic imports for client-side only components
   const DynamicComponent = dynamic(() => import('./ClientComponent'), {
     ssr: false
   });
   ```

2. **Handle server-side rendering**:
   ```typescript
   // Check if running on client side
   if (typeof window !== 'undefined') {
     // Client-side only code
   }
   ```

## Database Issues

### Database Connection Errors

**Problem**: Cannot connect to database or Prisma client errors.

**Solutions**:

1. **Check DATABASE_URL**:
   ```bash
   # Verify environment variable is set
   echo $DATABASE_URL
   
   # For SQLite, ensure file path exists
   mkdir -p db
   ```

2. **Regenerate Prisma client**:
   ```bash
   npm run db:generate
   ```

3. **Reset database** (development only):
   ```bash
   npm run db:reset
   npm run db:push
   ```

### Migration Issues

**Problem**: Database migration failures or schema sync issues.

**Solutions**:

1. **Check migration status**:
   ```bash
   npx prisma migrate status
   ```

2. **Reset migrations** (development only):
   ```bash
   npx prisma migrate reset
   npx prisma db push
   ```

3. **Manual migration**:
   ```bash
   npx prisma migrate dev --name describe_your_changes
   ```

### Database Lock Issues (SQLite)

**Problem**: Database is locked or in use by another process.

**Solutions**:

1. **Stop all processes using the database**:
   ```bash
   # Stop development server
   # Close any database browsers
   ```

2. **Remove lock file**:
   ```bash
   rm db/custom.db-wal
   rm db/custom.db-shm
   ```

3. **Restart development server**:
   ```bash
   npm run dev
   ```

## Authentication Issues

### NextAuth.js Configuration

**Problem**: Authentication not working or session issues.

**Solutions**:

1. **Check environment variables**:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   ```

2. **Clear browser cookies and localStorage**:
   - Open browser developer tools
   - Clear all cookies for localhost:3000
   - Clear localStorage

3. **Check NextAuth.js configuration**:
   ```typescript
   // Ensure providers are properly configured
   export const authOptions: NextAuthOptions = {
     providers: [
       // Your providers
     ],
     secret: process.env.NEXTAUTH_SECRET,
   };
   ```

### Session Persistence Issues

**Problem**: User sessions not persisting or frequent logouts.

**Solutions**:

1. **Check session configuration**:
   ```typescript
   export const authOptions: NextAuthOptions = {
     session: {
       strategy: "jwt",
       maxAge: 30 * 24 * 60 * 60, // 30 days
     },
   };
   ```

2. **Verify database adapter**:
   ```typescript
   import { PrismaAdapter } from "@next-auth/prisma-adapter";
   
   export const authOptions: NextAuthOptions = {
     adapter: PrismaAdapter(prisma),
   };
   ```

## Performance Issues

### Slow Page Load Times

**Problem**: Pages take too long to load or render.

**Solutions**:

1. **Optimize images**:
   ```typescript
   import Image from 'next/image';
   
   // Use Next.js Image component
   <Image
     src="/image.jpg"
     alt="Description"
     width={500}
     height={300}
     priority // For above-the-fold images
   />
   ```

2. **Implement code splitting**:
   ```typescript
   import dynamic from 'next/dynamic';
   
   const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
     loading: () => <p>Loading...</p>,
   });
   ```

3. **Use React.memo for expensive components**:
   ```typescript
   const ExpensiveComponent = React.memo(({ data }) => {
     // Component implementation
   });
   ```

### Memory Leaks

**Problem**: Application memory usage increases over time.

**Solutions**:

1. **Clean up event listeners**:
   ```typescript
   useEffect(() => {
     const handleResize = () => {
       // Handle resize
     };
     
     window.addEventListener('resize', handleResize);
     
     return () => {
       window.removeEventListener('resize', handleResize);
     };
   }, []);
   ```

2. **Cancel async operations**:
   ```typescript
   useEffect(() => {
     const abortController = new AbortController();
     
     fetch('/api/data', { signal: abortController.signal })
       .then(response => response.json())
       .then(data => setData(data));
     
     return () => {
       abortController.abort();
     };
   }, []);
   ```

## Socket.IO and Real-time Issues

### Connection Issues

**Problem**: Socket.IO connections failing or not establishing.

**Solutions**:

1. **Check server configuration**:
   ```typescript
   // In server.ts
   const io = new Server(server, {
     cors: {
       origin: process.env.NODE_ENV === 'production' 
         ? 'https://yourdomain.com' 
         : 'http://localhost:3000',
       methods: ['GET', 'POST']
     }
   });
   ```

2. **Verify client connection**:
   ```typescript
   import { io } from 'socket.io-client';
   
   const socket = io(process.env.NODE_ENV === 'production' 
     ? 'https://yourdomain.com' 
     : 'http://localhost:3000'
   );
   
   socket.on('connect', () => {
     console.log('Connected to server');
   });
   
   socket.on('connect_error', (error) => {
     console.error('Connection error:', error);
   });
   ```

### Message Delivery Issues

**Problem**: Socket.IO messages not being delivered or received.

**Solutions**:

1. **Check event names**:
   ```typescript
   // Server
   socket.emit('project-update', data);
   
   // Client
   socket.on('project-update', (data) => {
     // Handle update
   });
   ```

2. **Verify room joining**:
   ```typescript
   // Server
   socket.join(`project-${projectId}`);
   io.to(`project-${projectId}`).emit('update', data);
   
   // Client
   socket.emit('join-project', projectId);
   ```

## Environment and Configuration Issues

### Environment Variables Not Loading

**Problem**: Environment variables are undefined or not loading.

**Solutions**:

1. **Check file naming**:
   - Development: `.env.local`
   - Production: `.env.production`
   - Never commit `.env.local` to git

2. **Verify variable names**:
   ```env
   # Public variables (accessible in browser)
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   
   # Private variables (server-side only)
   DATABASE_URL=file:./db/custom.db
   NEXTAUTH_SECRET=your-secret
   ```

3. **Restart development server**:
   ```bash
   # Environment changes require restart
   npm run dev
   ```

### Configuration File Issues

**Problem**: Configuration files not being recognized or causing errors.

**Solutions**:

1. **Validate JSON syntax**:
   ```bash
   # Check package.json
   npm run lint:package
   
   # Or use online JSON validator
   ```

2. **Check TypeScript configuration**:
   ```bash
   npx tsc --showConfig
   ```

3. **Verify Next.js configuration**:
   ```typescript
   // next.config.ts
   import type { NextConfig } from 'next';
   
   const nextConfig: NextConfig = {
     // Your configuration
   };
   
   export default nextConfig;
   ```

## Testing Issues

### Test Failures

**Problem**: Tests failing unexpectedly or not running.

**Solutions**:

1. **Clear Jest cache**:
   ```bash
   npx jest --clearCache
   npm test
   ```

2. **Check test environment**:
   ```javascript
   // jest.config.js
   module.exports = {
     testEnvironment: 'jsdom',
     setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
   };
   ```

3. **Mock external dependencies**:
   ```typescript
   // Mock Next.js router
   jest.mock('next/router', () => ({
     useRouter: () => ({
       push: jest.fn(),
       pathname: '/',
     }),
   }));
   ```

### Testing Library Issues

**Problem**: React Testing Library queries not working.

**Solutions**:

1. **Use proper queries**:
   ```typescript
   // Prefer accessible queries
   screen.getByRole('button', { name: /submit/i });
   screen.getByLabelText(/email address/i);
   screen.getByText(/welcome/i);
   ```

2. **Wait for async updates**:
   ```typescript
   import { waitFor } from '@testing-library/react';
   
   await waitFor(() => {
     expect(screen.getByText('Success')).toBeInTheDocument();
   });
   ```

## Production Issues

### Server Crashes

**Problem**: Application crashes in production.

**Solutions**:

1. **Check logs**:
   ```bash
   # PM2 logs
   pm2 logs constructpro
   
   # System logs
   sudo journalctl -u nginx -f
   ```

2. **Monitor memory usage**:
   ```bash
   # Check memory usage
   pm2 monit
   
   # Restart if needed
   pm2 restart constructpro
   ```

3. **Implement error boundaries**:
   ```typescript
   class ErrorBoundary extends React.Component {
     constructor(props) {
       super(props);
       this.state = { hasError: false };
     }
   
     static getDerivedStateFromError(error) {
       return { hasError: true };
     }
   
     componentDidCatch(error, errorInfo) {
       console.error('Error caught by boundary:', error, errorInfo);
     }
   
     render() {
       if (this.state.hasError) {
         return <h1>Something went wrong.</h1>;
       }
   
       return this.props.children;
     }
   }
   ```

### SSL Certificate Issues

**Problem**: HTTPS not working or certificate errors.

**Solutions**:

1. **Check certificate validity**:
   ```bash
   openssl x509 -in certificate.crt -text -noout
   ```

2. **Renew Let's Encrypt certificate**:
   ```bash
   sudo certbot renew
   sudo systemctl reload nginx
   ```

3. **Test SSL configuration**:
   ```bash
   # Test SSL setup
   curl -I https://yourdomain.com
   ```

### Database Performance Issues

**Problem**: Slow database queries or connection timeouts.

**Solutions**:

1. **Optimize queries**:
   ```typescript
   // Use select to limit fields
   const users = await prisma.user.findMany({
     select: {
       id: true,
       name: true,
       email: true,
     },
   });
   
   // Use include for relations
   const projects = await prisma.project.findMany({
     include: {
       users: true,
     },
   });
   ```

2. **Add database indexes**:
   ```prisma
   model User {
     id    String @id @default(cuid())
     email String @unique
     name  String
     
     @@index([email])
   }
   ```

3. **Configure connection pooling**:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/db?connection_limit=20&pool_timeout=20"
   ```

## Getting Additional Help

If you can't find a solution here:

1. **Search existing issues** on GitHub
2. **Check the logs** for detailed error messages
3. **Create a minimal reproduction** of the issue
4. **Ask for help** in GitHub discussions or issues
5. **Contact the maintainers** for critical production issues

## Reporting New Issues

When reporting issues, please include:

- **Environment details** (OS, Node.js version, browser)
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Error messages** and stack traces
- **Screenshots** if applicable
- **Minimal code example** that reproduces the issue

This helps us diagnose and fix issues more quickly.