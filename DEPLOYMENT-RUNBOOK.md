# ConstructPro Deployment Runbook

## Overview

This runbook provides step-by-step instructions for deploying ConstructPro to production using Coolify. It includes pre-deployment checks, deployment procedures, post-deployment validation, and troubleshooting guides.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Coolify Configuration](#coolify-configuration)
4. [Deployment Process](#deployment-process)
5. [Post-Deployment Validation](#post-deployment-validation)
6. [Monitoring Setup](#monitoring-setup)
7. [Troubleshooting](#troubleshooting)
8. [Rollback Procedures](#rollback-procedures)
9. [Maintenance Tasks](#maintenance-tasks)

## Pre-Deployment Checklist

### Code Readiness ✅
- [ ] All tests passing locally
- [ ] Code reviewed and approved
- [ ] Security audit completed
- [ ] Dependencies updated and audited
- [ ] Environment variables documented
- [ ] Database migrations prepared (if any)

### Infrastructure Readiness ✅
- [ ] Server provisioned (Ubuntu 22.04 LTS)
- [ ] Docker installed and configured
- [ ] Coolify installed and accessible
- [ ] Domain configured and DNS pointing to server
- [ ] SSL certificate ready (Let's Encrypt)
- [ ] Firewall configured (UFW)

### Validation Commands
```bash
# Run pre-deployment tests
npm run test:security
npm run build
npm run deploy:validate

# Test Docker build
docker build -t constructpro-test .
docker run --rm -p 3001:3000 constructpro-test &
sleep 30
curl -f http://localhost:3001/api/health
```

## Environment Setup

### Required Environment Variables

#### Production Environment (.env.production)
```env
# Application
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3000

# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Authentication
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars
NEXTAUTH_URL=https://constructpro.vovelet-tech.com

# Monitoring (Optional)
MONITORING_WEBHOOK_URL=https://your-monitoring-webhook
HEALTH_CHECK_ENABLED=true

# Security
RATE_LIMIT_ENABLED=true
BRUTE_FORCE_PROTECTION=true
```

#### Coolify Secrets Configuration
1. Navigate to your ConstructPro application in Coolify
2. Go to "Environment Variables"
3. Add each variable as a secret:
   - `DATABASE_URL` (Secret)
   - `NEXTAUTH_SECRET` (Secret)
   - `NEXTAUTH_URL` (Public)
   - `NODE_ENV=production` (Public)

### Database Setup

#### PostgreSQL Configuration
```sql
-- Create database and user
CREATE DATABASE constructpro_production;
CREATE USER constructpro_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE constructpro_production TO constructpro_user;

-- Grant schema permissions
\c constructpro_production
GRANT ALL ON SCHEMA public TO constructpro_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO constructpro_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO constructpro_user;
```

## Coolify Configuration

### Application Settings

#### Basic Configuration
```yaml
Name: constructpro
Repository: https://github.com/vovelet-tech/constructpro
Branch: main
Build Pack: Dockerfile
Port: 3000
```

#### Health Check Configuration
```yaml
Health Check:
  Enabled: true
  Path: /api/health
  Port: 3000
  Interval: 30s
  Timeout: 10s
  Retries: 3
  Start Period: 60s
```

#### Resource Limits
```yaml
Resources:
  Memory: 1GB
  CPU: 1 core
  Storage: 10GB
```

#### Domain Configuration
```yaml
Domains:
  - constructpro.vovelet-tech.com
  
SSL:
  Provider: Let's Encrypt
  Force HTTPS: true
```

### Network Configuration
```yaml
Networks:
  - constructpro-network

Ports:
  - 3000:3000

Restart Policy: unless-stopped
```

## Deployment Process

### Step 1: Prepare Repository
```bash
# Ensure main branch is up to date
git checkout main
git pull origin main

# Tag the release
git tag -a v1.0.0 -m "Production release v1.0.0"
git push origin v1.0.0
```

### Step 2: Configure Coolify Application

1. **Create New Application**
   - Go to Coolify dashboard
   - Click "New Application"
   - Select "Public Repository"
   - Enter repository URL: `https://github.com/vovelet-tech/constructpro`

2. **Configure Build Settings**
   - Build Pack: `Dockerfile`
   - Branch: `main`
   - Build Command: (leave empty, uses Dockerfile)
   - Start Command: (leave empty, uses Dockerfile CMD)

3. **Set Environment Variables**
   - Add all required environment variables
   - Mark sensitive variables as secrets

4. **Configure Domain**
   - Add domain: `constructpro.vovelet-tech.com`
   - Enable SSL with Let's Encrypt
   - Force HTTPS redirects

### Step 3: Initial Deployment

1. **Deploy Application**
   ```bash
   # In Coolify dashboard
   # Click "Deploy" button
   # Monitor build logs
   ```

2. **Monitor Build Process**
   - Watch build logs for errors
   - Verify all stages complete successfully
   - Check for any dependency issues

3. **Verify Container Start**
   - Ensure container starts without errors
   - Check health check status
   - Verify port binding

### Step 4: Database Migration (if needed)
```bash
# Connect to application container
docker exec -it <container_id> sh

# Run Prisma migrations
npx prisma migrate deploy
npx prisma generate

# Verify database connection
npx prisma db pull
```

## Post-Deployment Validation

### Automated Validation
```bash
# Run comprehensive E2E tests
node scripts/e2e-deployment-tests.js https://constructpro.vovelet-tech.com

# Test specific endpoints
curl -f https://constructpro.vovelet-tech.com/api/health
curl -f https://constructpro.vovelet-tech.com/api/monitoring/metrics
```

### Manual Validation Checklist

#### Application Functionality ✅
- [ ] Home page loads correctly
- [ ] Health check endpoint responds
- [ ] API endpoints functional
- [ ] Static assets loading
- [ ] Database connectivity working

#### Security Validation ✅
- [ ] HTTPS working with valid certificate
- [ ] Security headers present
- [ ] Rate limiting functional
- [ ] No sensitive data exposed in responses
- [ ] Authentication working (if implemented)

#### Performance Validation ✅
- [ ] Page load times < 2 seconds
- [ ] API response times < 500ms
- [ ] Memory usage within limits
- [ ] CPU usage normal
- [ ] No memory leaks detected

#### Monitoring Validation ✅
- [ ] Health checks passing in Coolify
- [ ] Monitoring endpoints accessible
- [ ] Logs being generated properly
- [ ] Alerts configured (if applicable)

## Monitoring Setup

### Coolify Monitoring

#### Application Metrics
- CPU usage monitoring
- Memory usage tracking
- Disk space monitoring
- Network traffic analysis

#### Health Check Configuration
```yaml
Health Check:
  URL: /api/health
  Expected Status: 200
  Timeout: 10s
  Interval: 30s
  Failure Threshold: 3
```

### External Monitoring (Optional)

#### Uptime Monitoring
```bash
# Example with UptimeRobot API
curl -X POST "https://api.uptimerobot.com/v2/newMonitor" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "api_key=YOUR_API_KEY&format=json&type=1&url=https://constructpro.vovelet-tech.com&friendly_name=ConstructPro"
```

#### Log Aggregation
- Configure log shipping to external service
- Set up log rotation
- Configure alert thresholds

## Troubleshooting

### Common Issues and Solutions

#### Build Failures

**Issue**: Docker build fails with dependency errors
```bash
# Solution: Clear Docker cache and rebuild
docker system prune -a
docker build --no-cache -t constructpro .
```

**Issue**: npm ci fails with package-lock.json errors
```bash
# Solution: Use alternative Dockerfile
cp Dockerfile.alternative Dockerfile
# Redeploy in Coolify
```

#### Runtime Issues

**Issue**: Application fails to start
```bash
# Check container logs
docker logs <container_id>

# Check environment variables
docker exec -it <container_id> env

# Verify database connection
docker exec -it <container_id> npx prisma db pull
```

**Issue**: Health check failures
```bash
# Test health check manually
curl -v https://constructpro.vovelet-tech.com/api/health

# Check application logs
docker logs <container_id> | grep -i error

# Verify port binding
docker port <container_id>
```

#### Performance Issues

**Issue**: High memory usage
```bash
# Check memory usage
docker stats <container_id>

# Analyze heap dump (if needed)
docker exec -it <container_id> node --inspect server.ts
```

**Issue**: Slow response times
```bash
# Check database performance
# Review query logs
# Analyze network latency
# Check resource limits
```

### Diagnostic Commands

```bash
# Application health
curl -s https://constructpro.vovelet-tech.com/api/health | jq

# System metrics
curl -s https://constructpro.vovelet-tech.com/api/monitoring/metrics | jq

# Container status
docker ps | grep constructpro
docker stats <container_id>

# Network connectivity
ping constructpro.vovelet-tech.com
nslookup constructpro.vovelet-tech.com

# SSL certificate
openssl s_client -connect constructpro.vovelet-tech.com:443 -servername constructpro.vovelet-tech.com
```

## Rollback Procedures

### Quick Rollback (Coolify)

1. **Via Coolify Dashboard**
   - Go to application deployments
   - Select previous successful deployment
   - Click "Redeploy"

2. **Via Git Tag**
   ```bash
   # Revert to previous tag
   git checkout v1.0.0-previous
   git push origin main --force
   # Trigger deployment in Coolify
   ```

### Database Rollback (if needed)
```bash
# Backup current database
pg_dump constructpro_production > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore previous backup
psql constructpro_production < backup_previous.sql

# Run any necessary migrations
npx prisma migrate deploy
```

### Emergency Procedures

#### Complete Service Outage
1. Check Coolify dashboard for application status
2. Verify server connectivity and resources
3. Check DNS resolution
4. Review recent deployments
5. Implement rollback if necessary
6. Notify stakeholders

#### Data Loss Prevention
1. Immediate database backup
2. Stop write operations if possible
3. Assess data integrity
4. Restore from backup if necessary
5. Investigate root cause

## Maintenance Tasks

### Regular Maintenance (Weekly)

```bash
# Update dependencies
npm audit fix
npm update

# Clean up Docker resources
docker system prune

# Check disk space
df -h

# Review logs for errors
docker logs <container_id> | grep -i error
```

### Security Updates (Monthly)

```bash
# Security audit
npm audit --audit-level moderate

# Update base images
docker pull node:18-alpine

# Review security headers
curl -I https://constructpro.vovelet-tech.com

# Check SSL certificate expiry
openssl s_client -connect constructpro.vovelet-tech.com:443 -servername constructpro.vovelet-tech.com 2>/dev/null | openssl x509 -noout -dates
```

### Performance Optimization (Quarterly)

```bash
# Analyze bundle size
npm run build
npx webpack-bundle-analyzer .next/static/chunks/*.js

# Database optimization
# Review slow queries
# Update indexes if needed
# Analyze query performance

# Review monitoring metrics
# Check for memory leaks
# Optimize resource usage
```

## Emergency Contacts

### Technical Contacts
- **System Administrator**: [Contact Information]
- **Development Team Lead**: [Contact Information]
- **Database Administrator**: [Contact Information]

### Service Providers
- **Coolify Support**: [Support Information]
- **Domain Registrar**: [Contact Information]
- **SSL Certificate Provider**: Let's Encrypt (Automatic)

### Escalation Procedures
1. **Level 1**: Development Team (Response: 1 hour)
2. **Level 2**: System Administrator (Response: 30 minutes)
3. **Level 3**: External Support (Response: 2 hours)

## Documentation Updates

This runbook should be updated whenever:
- New deployment procedures are implemented
- Configuration changes are made
- New monitoring tools are added
- Issues and solutions are discovered
- Contact information changes

**Last Updated**: [Current Date]
**Version**: 1.0.0
**Next Review**: [Date + 3 months]