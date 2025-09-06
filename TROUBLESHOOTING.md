# ConstructPro Troubleshooting Guide

## Quick Reference

### Emergency Commands
```bash
# Check application status
curl -f https://constructpro.vovelet-tech.com/api/health

# View container logs
docker logs $(docker ps -q --filter "name=constructpro")

# Restart application (Coolify)
# Go to Coolify dashboard → Application → Restart

# Check system resources
docker stats
df -h
free -h
```

### Common Issues Quick Fix

| Issue | Quick Fix |
|-------|-----------|
| 503 Service Unavailable | Check container status, restart if needed |
| Health check failing | Verify `/api/health` endpoint, check logs |
| Slow response times | Check memory/CPU usage, restart container |
| Build failures | Clear Docker cache, check dependencies |
| SSL certificate issues | Verify domain DNS, regenerate certificate |

## Deployment Issues

### Build Failures

#### Issue: Docker Build Fails
**Symptoms:**
- Build process stops with error
- "npm ci" command fails
- Dependency resolution errors

**Diagnosis:**
```bash
# Check build logs in Coolify
# Look for specific error messages

# Test build locally
docker build -t constructpro-test .

# Check package-lock.json integrity
npm ci --dry-run
```

**Solutions:**

1. **Package-lock.json Issues**
   ```bash
   # Use alternative Dockerfile
   cp Dockerfile.alternative Dockerfile
   git add Dockerfile
   git commit -m "Use alternative Dockerfile for npm install"
   git push origin main
   ```

2. **Dependency Conflicts**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Regenerate package-lock.json
   rm package-lock.json
   npm install
   git add package-lock.json
   git commit -m "Regenerate package-lock.json"
   git push origin main
   ```

3. **Docker Cache Issues**
   ```bash
   # In Coolify, enable "No Cache" build option
   # Or clear Docker cache on server
   docker system prune -a
   ```

#### Issue: Prisma Generation Fails
**Symptoms:**
- "prisma generate" command fails
- Database schema errors
- Missing Prisma client

**Solutions:**
```bash
# Check Prisma schema syntax
npx prisma validate

# Regenerate Prisma client
npx prisma generate

# Update Prisma schema if needed
npx prisma db pull
```

### Runtime Issues

#### Issue: Application Won't Start
**Symptoms:**
- Container exits immediately
- Health check fails
- Port binding errors

**Diagnosis:**
```bash
# Check container logs
docker logs <container_id>

# Check if port is available
netstat -tulpn | grep :3000

# Verify environment variables
docker exec -it <container_id> env | grep -E "(NODE_ENV|DATABASE_URL|PORT)"
```

**Solutions:**

1. **Environment Variable Issues**
   ```bash
   # Verify all required variables are set in Coolify
   # Check for typos in variable names
   # Ensure secrets are properly configured
   ```

2. **Database Connection Issues**
   ```bash
   # Test database connection
   docker exec -it <container_id> npx prisma db pull
   
   # Check DATABASE_URL format
   # postgresql://username:password@host:port/database
   ```

3. **Port Conflicts**
   ```bash
   # Check if port 3000 is in use
   sudo lsof -i :3000
   
   # Kill conflicting processes if needed
   sudo kill -9 <PID>
   ```

#### Issue: Health Check Failures
**Symptoms:**
- Coolify shows unhealthy status
- `/api/health` returns 503 or times out
- Container restarts frequently

**Diagnosis:**
```bash
# Test health check manually
curl -v https://constructpro.vovelet-tech.com/api/health

# Check response time
time curl https://constructpro.vovelet-tech.com/api/health

# Check container resources
docker stats <container_id>
```

**Solutions:**

1. **Database Connectivity**
   ```bash
   # Check database status
   docker exec -it <container_id> npx prisma db pull
   
   # Verify connection string
   echo $DATABASE_URL
   ```

2. **Memory Issues**
   ```bash
   # Increase memory limit in Coolify
   # Current: 1GB → Increase to 2GB
   
   # Check for memory leaks
   docker exec -it <container_id> node --inspect server.ts
   ```

3. **Timeout Issues**
   ```bash
   # Increase health check timeout in Coolify
   # Current: 10s → Increase to 30s
   
   # Optimize health check endpoint
   # Remove heavy operations from /api/health
   ```

## Performance Issues

### High Memory Usage
**Symptoms:**
- Memory usage > 80%
- Slow response times
- Container restarts due to OOM

**Diagnosis:**
```bash
# Monitor memory usage
docker stats <container_id>

# Check Node.js heap usage
curl https://constructpro.vovelet-tech.com/api/monitoring/metrics | jq '.memory'

# Analyze memory patterns
# Look for memory leaks in logs
```

**Solutions:**

1. **Increase Memory Limits**
   ```bash
   # In Coolify: Resources → Memory → 2GB
   ```

2. **Optimize Application**
   ```bash
   # Enable garbage collection logging
   NODE_OPTIONS="--max-old-space-size=1024" npm start
   
   # Review database queries for efficiency
   # Implement caching where appropriate
   ```

3. **Memory Leak Detection**
   ```bash
   # Use Node.js profiling
   node --inspect server.ts
   
   # Monitor heap snapshots
   # Review event listeners for leaks
   ```

### Slow Response Times
**Symptoms:**
- API responses > 2 seconds
- Page load times > 5 seconds
- Timeout errors

**Diagnosis:**
```bash
# Test response times
time curl https://constructpro.vovelet-tech.com/api/health

# Check system resources
top
htop

# Analyze network latency
ping constructpro.vovelet-tech.com
traceroute constructpro.vovelet-tech.com
```

**Solutions:**

1. **Database Optimization**
   ```sql
   -- Check slow queries
   SELECT query, mean_time, calls 
   FROM pg_stat_statements 
   ORDER BY mean_time DESC 
   LIMIT 10;
   
   -- Add indexes if needed
   CREATE INDEX idx_projects_status ON projects(status);
   ```

2. **Application Optimization**
   ```bash
   # Enable Next.js optimizations
   # Check next.config.ts settings
   
   # Implement caching
   # Use Redis for session storage
   ```

3. **Infrastructure Optimization**
   ```bash
   # Increase CPU allocation in Coolify
   # Consider CDN for static assets
   # Optimize Docker image size
   ```

## Security Issues

### SSL Certificate Problems
**Symptoms:**
- Browser security warnings
- Certificate expired errors
- HTTPS not working

**Diagnosis:**
```bash
# Check certificate status
openssl s_client -connect constructpro.vovelet-tech.com:443 -servername constructpro.vovelet-tech.com

# Check certificate expiry
echo | openssl s_client -connect constructpro.vovelet-tech.com:443 2>/dev/null | openssl x509 -noout -dates

# Verify DNS resolution
nslookup constructpro.vovelet-tech.com
```

**Solutions:**

1. **Regenerate Certificate**
   ```bash
   # In Coolify: Domain Settings → SSL → Regenerate
   # Wait for Let's Encrypt validation
   ```

2. **DNS Issues**
   ```bash
   # Verify A record points to correct IP
   dig constructpro.vovelet-tech.com
   
   # Check domain configuration
   # Ensure domain is properly configured in Coolify
   ```

3. **Firewall Issues**
   ```bash
   # Check if ports 80/443 are open
   sudo ufw status
   
   # Open ports if needed
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

### Rate Limiting Issues
**Symptoms:**
- 429 Too Many Requests errors
- Legitimate users blocked
- API calls failing

**Diagnosis:**
```bash
# Check rate limiting logs
docker logs <container_id> | grep "Rate limit"

# Test rate limits
for i in {1..20}; do curl https://constructpro.vovelet-tech.com/api/health; done
```

**Solutions:**

1. **Adjust Rate Limits**
   ```typescript
   // In src/middleware/security.ts
   const defaultSecurityConfig = {
     rateLimit: {
       windowMs: 60 * 1000, // Increase window
       maxRequests: 200, // Increase limit
     }
   };
   ```

2. **Whitelist IPs**
   ```typescript
   // Add trusted IPs to whitelist
   const trustedIPs = ['192.168.1.100', '10.0.0.50'];
   ```

## Database Issues

### Connection Failures
**Symptoms:**
- Database connection errors
- Prisma client errors
- Health check fails with DB error

**Diagnosis:**
```bash
# Test database connection
docker exec -it <container_id> npx prisma db pull

# Check connection string
echo $DATABASE_URL

# Test direct connection
psql $DATABASE_URL -c "SELECT 1;"
```

**Solutions:**

1. **Connection String Issues**
   ```bash
   # Verify format: postgresql://user:pass@host:port/db
   # Check for special characters in password
   # Ensure database exists
   ```

2. **Network Issues**
   ```bash
   # Test network connectivity
   telnet db-host 5432
   
   # Check firewall rules
   # Verify database server is running
   ```

3. **Authentication Issues**
   ```bash
   # Verify credentials
   # Check user permissions
   # Reset password if needed
   ```

### Migration Failures
**Symptoms:**
- Migration commands fail
- Schema out of sync
- Database structure errors

**Solutions:**
```bash
# Reset migrations (CAUTION: Data loss)
npx prisma migrate reset

# Deploy pending migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Verify schema
npx prisma db pull
```

## Network Issues

### DNS Resolution Problems
**Symptoms:**
- Domain not resolving
- Intermittent connectivity
- Wrong IP address returned

**Diagnosis:**
```bash
# Check DNS resolution
nslookup constructpro.vovelet-tech.com
dig constructpro.vovelet-tech.com

# Check from different locations
# Use online DNS checkers
```

**Solutions:**

1. **Update DNS Records**
   ```bash
   # Verify A record points to server IP
   # Check TTL settings
   # Wait for propagation (up to 48 hours)
   ```

2. **DNS Cache Issues**
   ```bash
   # Clear local DNS cache
   sudo systemctl flush-dns
   
   # Use different DNS servers for testing
   nslookup constructpro.vovelet-tech.com 8.8.8.8
   ```

### Firewall Issues
**Symptoms:**
- Connection timeouts
- Ports not accessible
- Services unreachable

**Diagnosis:**
```bash
# Check firewall status
sudo ufw status verbose

# Test port connectivity
telnet constructpro.vovelet-tech.com 443
nc -zv constructpro.vovelet-tech.com 443
```

**Solutions:**
```bash
# Open required ports
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 8000/tcp # Coolify

# Reload firewall
sudo ufw reload
```

## Monitoring and Logging

### Log Analysis
**Common Log Patterns:**

```bash
# Error patterns to look for
docker logs <container_id> | grep -i "error\|exception\|failed"

# Performance issues
docker logs <container_id> | grep -i "timeout\|slow\|memory"

# Security issues
docker logs <container_id> | grep -i "blocked\|rate limit\|unauthorized"
```

### Monitoring Endpoints
```bash
# Health check
curl https://constructpro.vovelet-tech.com/api/health | jq

# System metrics
curl https://constructpro.vovelet-tech.com/api/monitoring/metrics | jq

# Dashboard data
curl https://constructpro.vovelet-tech.com/api/monitoring/dashboard | jq
```

## Recovery Procedures

### Emergency Rollback
```bash
# Quick rollback in Coolify
# 1. Go to Deployments tab
# 2. Select previous successful deployment
# 3. Click "Redeploy"

# Git-based rollback
git revert HEAD
git push origin main
```

### Data Recovery
```bash
# Database backup
pg_dump $DATABASE_URL > emergency_backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql $DATABASE_URL < backup_file.sql
```

### Service Recovery
```bash
# Restart all services
docker restart <container_id>

# Full system restart (if needed)
sudo reboot

# Verify services after restart
curl https://constructpro.vovelet-tech.com/api/health
```

## Prevention Strategies

### Monitoring Setup
- Set up uptime monitoring
- Configure alert thresholds
- Implement log aggregation
- Regular health checks

### Backup Procedures
- Daily database backups
- Configuration backups
- Code repository backups
- Documentation updates

### Testing Procedures
- Pre-deployment testing
- Staging environment validation
- Load testing
- Security testing

## Getting Help

### Internal Resources
1. Check this troubleshooting guide
2. Review deployment runbook
3. Check application logs
4. Consult team members

### External Resources
1. Coolify documentation
2. Next.js troubleshooting guides
3. Docker documentation
4. PostgreSQL documentation

### Support Contacts
- **Development Team**: [Contact Information]
- **System Administrator**: [Contact Information]
- **Coolify Support**: [Support Information]

### Creating Support Tickets
Include the following information:
- Error messages and logs
- Steps to reproduce
- System information
- Recent changes made
- Impact assessment