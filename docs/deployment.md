# Deployment Guide

This guide covers all deployment options and configurations for ConstructPro, from development to production environments.

## Overview

ConstructPro supports multiple deployment strategies:

- **Development**: Local development with hot reload
- **Staging**: Production-like environment for testing
- **Production**: Optimized production deployment
- **Docker**: Containerized deployment for any environment

## Prerequisites

### General Requirements

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Database (SQLite for development, PostgreSQL/MySQL for production)
- SSL certificate for production (recommended)

### Production Requirements

- Server with at least 2GB RAM
- Domain name and DNS configuration
- SSL certificate (Let's Encrypt recommended)
- Process manager (PM2 recommended)
- Reverse proxy (Nginx recommended)

## Environment Configuration

### Environment Variables

Create appropriate environment files for each environment:

#### Development (`.env.local`)
```env
# Database
DATABASE_URL="file:./db/custom.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-key"

# Development flags
NODE_ENV="development"
```

#### Staging (`.env.staging`)
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/constructpro_staging"

# NextAuth.js
NEXTAUTH_URL="https://staging.constructpro.com"
NEXTAUTH_SECRET="staging-secret-key-change-this"

# Environment
NODE_ENV="production"
```

#### Production (`.env.production`)
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/constructpro_production"

# NextAuth.js
NEXTAUTH_URL="https://constructpro.com"
NEXTAUTH_SECRET="production-secret-key-very-secure"

# Environment
NODE_ENV="production"

# Optional: External Services
# Add your production API keys here
```

## Deployment Methods

### 1. Traditional Server Deployment

#### Step 1: Server Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js (using NodeSource repository)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

#### Step 2: Application Setup

```bash
# Clone the repository
git clone <repository-url> /var/www/constructpro
cd /var/www/constructpro

# Install dependencies
npm ci --only=production

# Set up environment
cp .env.example .env.production
# Edit .env.production with your production values

# Build the application
npm run build

# Set up database
npm run db:generate
npm run db:push
```

#### Step 3: Process Management with PM2

Create a PM2 ecosystem file (`ecosystem.config.js`):

```javascript
module.exports = {
  apps: [{
    name: 'constructpro',
    script: 'start.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

Start the application:

```bash
# Create logs directory
mkdir logs

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
```

#### Step 4: Nginx Configuration

Create Nginx configuration (`/etc/nginx/sites-available/constructpro`):

```nginx
server {
    listen 80;
    server_name constructpro.com www.constructpro.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name constructpro.com www.constructpro.com;

    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO support
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files caching
    location /_next/static {
        alias /var/www/constructpro/.next/static;
        expires 365d;
        access_log off;
    }

    location /public {
        alias /var/www/constructpro/public;
        expires 30d;
        access_log off;
    }
}
```

Enable the site:

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/constructpro /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 2. Docker Deployment

#### Dockerfile

The project includes a `Dockerfile` for containerized deployment:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Docker Compose

For development and staging environments:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/constructpro
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=your-secret-key
    depends_on:
      - db
    volumes:
      - ./db:/app/db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=constructpro
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

#### Docker Commands

```bash
# Build the image
docker build -t constructpro .

# Run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### 3. Cloud Platform Deployment

#### Vercel Deployment

ConstructPro is optimized for Vercel deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
```

#### Railway Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### DigitalOcean App Platform

Create `app.yaml`:

```yaml
name: constructpro
services:
- name: web
  source_dir: /
  github:
    repo: your-username/constructpro
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}
  - key: NEXTAUTH_SECRET
    value: ${NEXTAUTH_SECRET}
databases:
- name: db
  engine: PG
  version: "13"
```

## Database Setup

### PostgreSQL (Recommended for Production)

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE constructpro_production;
CREATE USER constructpro WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE constructpro_production TO constructpro;
\q

# Update DATABASE_URL in .env.production
DATABASE_URL="postgresql://constructpro:secure_password@localhost:5432/constructpro_production"

# Run migrations
npm run db:generate
npm run db:push
```

### MySQL Alternative

```bash
# Install MySQL
sudo apt install mysql-server

# Secure installation
sudo mysql_secure_installation

# Create database
sudo mysql
CREATE DATABASE constructpro_production;
CREATE USER 'constructpro'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON constructpro_production.* TO 'constructpro'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Update DATABASE_URL
DATABASE_URL="mysql://constructpro:secure_password@localhost:3306/constructpro_production"
```

## SSL Certificate Setup

### Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d constructpro.com -d www.constructpro.com

# Test automatic renewal
sudo certbot renew --dry-run
```

## Monitoring and Maintenance

### Health Checks

The application includes health check endpoints:

```bash
# Check application health
curl -f http://localhost:3000/api/health

# Automated health check script
npm run test:health
```

### Log Management

```bash
# View PM2 logs
pm2 logs constructpro

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Rotate logs
pm2 install pm2-logrotate
```

### Backup Strategy

```bash
# Database backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump constructpro_production > backup_$DATE.sql

# Automated backup with cron
0 2 * * * /path/to/backup-script.sh
```

## Performance Optimization

### Caching

- Enable Redis for session storage
- Configure CDN for static assets
- Implement application-level caching

### Database Optimization

- Set up connection pooling
- Configure database indexes
- Monitor query performance

### Server Optimization

- Configure Nginx caching
- Enable gzip compression
- Set up HTTP/2

## Security Considerations

### Server Security

```bash
# Update system regularly
sudo apt update && sudo apt upgrade

# Configure firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Disable root login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
sudo systemctl restart ssh
```

### Application Security

- Use strong secrets for NEXTAUTH_SECRET
- Enable HTTPS in production
- Configure security headers
- Regular dependency updates
- Input validation and sanitization

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear build cache
rm -rf .next
npm run build
```

#### Database Connection Issues
```bash
# Check database status
sudo systemctl status postgresql

# Test connection
npm run db:generate
```

#### PM2 Issues
```bash
# Restart application
pm2 restart constructpro

# View detailed logs
pm2 logs constructpro --lines 100
```

### Performance Issues

- Monitor server resources
- Check database query performance
- Analyze application logs
- Use performance monitoring tools

## Deployment Checklist

### Pre-deployment

- [ ] Environment variables configured
- [ ] Database setup completed
- [ ] SSL certificate installed
- [ ] Security headers configured
- [ ] Backup strategy implemented

### Post-deployment

- [ ] Health checks passing
- [ ] Monitoring configured
- [ ] Logs accessible
- [ ] Performance baseline established
- [ ] Security scan completed

---

For additional help, see the [troubleshooting guide](./troubleshooting.md) or contact the development team.