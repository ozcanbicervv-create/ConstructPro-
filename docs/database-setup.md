# Database Setup Guide

This guide covers the database setup and migration infrastructure for ConstructPro, including both SQLite (development) and PostgreSQL (production) configurations.

## Overview

ConstructPro supports both SQLite and PostgreSQL databases:
- **SQLite**: Recommended for local development and testing
- **PostgreSQL**: Recommended for production deployments

## Quick Start

### Using SQLite (Development)

1. **Install dependencies** (already done if you ran `npm install`):
   ```bash
   npm install
   ```

2. **Setup database**:
   ```bash
   npm run db:push
   npm run db:seed
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

### Using PostgreSQL (Production)

1. **Install PostgreSQL** (if not already installed):
   - Windows: Download from https://www.postgresql.org/download/windows/
   - macOS: `brew install postgresql`
   - Ubuntu/Debian: `sudo apt-get install postgresql postgresql-contrib`

2. **Setup PostgreSQL database**:
   ```bash
   npm run db:setup-postgresql
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

## Database Schema

### Enhanced Models

The database includes comprehensive construction industry models:

#### Core Models
- **User**: Enhanced with construction roles, MFA support, and preferences
- **Project**: Complete project management with status, priority, budget tracking
- **Task**: Task management with assignments, time tracking, and progress monitoring
- **Material**: Material management with supplier information and cost tracking

#### Supporting Models
- **ProjectMember**: Team member assignments with roles
- **ProjectDocument**: Document management with versioning
- **Milestone**: Project milestone tracking
- **ProjectPhase**: Project phase management
- **TaskComment**: Task collaboration and communication
- **TaskAttachment**: File attachments for tasks
- **MaterialSupplier**: Supplier information and ratings
- **MaterialOrder**: Material ordering and tracking

### User Roles

The system supports the following user roles:
- `ADMIN`: System administrators
- `PROJECT_MANAGER`: Project managers
- `SITE_SUPERVISOR`: Site supervisors
- `WORKER`: Construction workers
- `CLIENT`: Project clients
- `SUPPLIER`: Material suppliers

## Database Commands

### Basic Operations

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push

# Run database migrations
npm run db:migrate

# Reset database (WARNING: Deletes all data)
npm run db:reset

# Seed database with sample data
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio
```

### Backup and Restore

```bash
# Create a backup
npm run db:backup

# List available backups
npm run db:list-backups

# Restore from backup
npm run db:restore <backup-file>

# Clean up old backups (keeps latest 5)
npm run db:cleanup
```

### PostgreSQL Setup

```bash
# Setup PostgreSQL database and user
npm run db:setup-postgresql

# Migrate data from SQLite to PostgreSQL
npm run db:migrate-to-postgresql
```

## Environment Configuration

### SQLite Configuration (.env)

```env
# SQLite (Development)
DATABASE_URL="file:./dev.db"

# Connection settings
DB_CONNECTION_LIMIT=10
DB_ACQUIRE_TIMEOUT=60000
DB_TIMEOUT=60000
DB_RELEASE_TIMEOUT=60000
```

### PostgreSQL Configuration (.env)

```env
# PostgreSQL (Production)
DATABASE_URL="postgresql://username:password@localhost:5432/constructpro"

# Connection pool settings
DB_CONNECTION_LIMIT=20
DB_ACQUIRE_TIMEOUT=60000
DB_TIMEOUT=60000
DB_RELEASE_TIMEOUT=60000
```

## Migration from SQLite to PostgreSQL

To migrate from SQLite to PostgreSQL:

1. **Backup your current SQLite database**:
   ```bash
   npm run db:backup
   ```

2. **Setup PostgreSQL**:
   ```bash
   npm run db:setup-postgresql
   ```

3. **Update Prisma schema** to use PostgreSQL:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

4. **Run migration script**:
   ```bash
   npm run db:migrate-to-postgresql
   ```

5. **Update environment variables** to use PostgreSQL URL

## Sample Data

The seed script creates comprehensive sample data including:

### Users (7 total)
- **Admin**: admin@constructpro.com
- **Project Manager**: manager@constructpro.com  
- **Site Supervisor**: supervisor@constructpro.com
- **Workers**: worker1@constructpro.com, worker2@constructpro.com
- **Client**: client@constructpro.com
- **Supplier**: supplier@constructpro.com

**Default Password**: `password123`

### Projects (2 total)
- **Downtown Office Complex**: 15-story office building ($15M budget)
- **Residential Housing Development**: 50 single-family homes ($25M budget)

### Additional Data
- 7 project team members
- 4 project phases
- 3 milestones
- 3 tasks with comments
- 3 materials with supplier information
- 3 material orders
- 4 project documents

## Database Connection

The application uses Prisma ORM with connection pooling:

```typescript
// src/utils/db.ts
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" 
    ? ["query", "info", "warn", "error"] 
    : ["error"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
```

### Connection Pool Configuration

- **Development**: 10 connections max
- **Production**: 20 connections max
- **Acquire Timeout**: 60 seconds
- **Release Timeout**: 60 seconds

## Troubleshooting

### Common Issues

1. **Permission errors on Windows**:
   - Run terminal as administrator
   - Check antivirus software isn't blocking file operations

2. **PostgreSQL connection issues**:
   - Verify PostgreSQL service is running
   - Check firewall settings
   - Verify credentials and database exists

3. **Schema validation errors**:
   - Run `npx prisma validate` to check schema
   - Ensure DATABASE_URL matches provider in schema

4. **Migration conflicts**:
   - Reset database: `npm run db:reset`
   - Push schema: `npm run db:push`
   - Re-seed: `npm run db:seed`

### Getting Help

- Check Prisma documentation: https://www.prisma.io/docs
- Review application logs for detailed error messages
- Use Prisma Studio to inspect database: `npm run db:studio`

## Security Considerations

### Production Deployment

1. **Use strong database passwords**
2. **Enable SSL/TLS connections**
3. **Restrict database access by IP**
4. **Regular backups**
5. **Monitor connection pools**
6. **Use environment variables for credentials**

### Development

1. **Never commit .env files with real credentials**
2. **Use different databases for development/testing/production**
3. **Regular schema validation**
4. **Backup before major changes**

## Performance Optimization

### Indexing

The schema includes strategic indexes on:
- User email (unique)
- Project manager ID and status
- Task project ID, assignee, and status
- Material project ID and category
- Document project ID and type

### Query Optimization

- Use `select` to limit returned fields
- Implement pagination for large datasets
- Use `include` strategically for relations
- Consider read replicas for reporting queries

### Connection Pooling

- Monitor connection usage
- Adjust pool size based on load
- Use connection timeouts appropriately
- Consider connection multiplexing for high concurrency