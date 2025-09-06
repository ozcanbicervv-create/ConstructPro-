# Scripts Reference

This document provides a comprehensive overview of all available npm scripts in the ConstructPro project.

## Development Scripts

### Core Development
- `npm run dev` - Start development server with hot reload
- `npm run dev:debug` - Start development server with Node.js inspector
- `npm run dev:turbo` - Start development server with Turbo mode (experimental)
- `npm run setup` - Automated development environment setup
- `npm run setup:clean` - Clean install and setup from scratch

### Building and Production
- `npm run build` - Build for production
- `npm run build:analyze` - Build with bundle analysis
- `npm run build:production` - Build with production environment variables
- `npm run start` - Start production server
- `npm run start:production` - Start production server with production environment
- `npm run preview` - Build and start production server locally

## Code Quality Scripts

### Linting and Formatting
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run lint:strict` - Run ESLint with zero warnings tolerance
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting without changes
- `npm run type-check` - Run TypeScript type checking
- `npm run type-check:watch` - Run TypeScript type checking in watch mode

### Testing Scripts
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:ci` - Run tests in CI mode (no watch, with coverage)
- `npm run test:unit` - Run only unit tests
- `npm run test:integration` - Run integration tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:e2e:local` - Run E2E tests against local server
- `npm run test:deployment` - Run deployment tests
- `npm run test:deployment:local` - Run deployment tests against local server
- `npm run test:health` - Run comprehensive health checks
- `npm run test:health:local` - Run health checks against local server
- `npm run test:security` - Run security audit
- `npm run test:performance` - Run performance tests
- `npm run test:all` - Run all test suites

## Database Scripts

### Core Database Operations
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:pull` - Pull schema from database
- `npm run db:migrate` - Run database migrations (development)
- `npm run db:migrate:deploy` - Deploy migrations (production)
- `npm run db:migrate:reset` - Reset all migrations
- `npm run db:migrate:status` - Check migration status
- `npm run db:reset` - Reset database (force)
- `npm run db:seed` - Seed database with initial data
- `npm run db:studio` - Open Prisma Studio
- `npm run db:validate` - Validate Prisma schema
- `npm run db:format` - Format Prisma schema

### Database Maintenance
- `npm run db:backup` - Create database backup
- `npm run db:restore` - Restore from backup (interactive)
- `npm run db:list-backups` - List available backups
- `npm run db:cleanup` - Cleanup old backups
- `npm run db:maintenance` - Show maintenance script help

## Deployment and CI Scripts

### Deployment Validation
- `npm run deploy:validate` - Comprehensive deployment validation
- `npm run deploy:test` - Test deployment locally
- `npm run deploy:staging` - Deploy to staging (placeholder)
- `npm run deploy:production` - Deploy to production (placeholder)

### CI/CD Scripts
- `npm run ci:install` - Install dependencies for CI
- `npm run ci:quality` - Run all quality checks
- `npm run ci:test` - Run tests for CI
- `npm run ci:build` - Build for CI
- `npm run ci:security` - Run security checks
- `npm run ci:performance` - Run performance checks
- `npm run ci:all` - Run complete CI pipeline

## Maintenance Scripts

### Cleanup and Maintenance
- `npm run clean` - Clean build artifacts
- `npm run clean:all` - Clean everything including node_modules
- `npm run reinstall` - Clean reinstall of dependencies
- `npm run logs:clear` - Clear log files
- `npm run cache:clear` - Clear build and module caches

### Dependency Management
- `npm run deps:check` - Check for outdated dependencies
- `npm run deps:update` - Update dependencies
- `npm run deps:audit` - Audit dependencies for vulnerabilities
- `npm run deps:audit:fix` - Fix dependency vulnerabilities
- `npm run maintenance:cleanup` - Run cleanup and audit fixes
- `npm run maintenance:update` - Update dependencies and fix issues

### Security
- `npm run security:scan` - Scan for security vulnerabilities
- `npm run security:fix` - Fix security vulnerabilities

## Docker Scripts

- `npm run docker:build` - Build Docker image
- `npm run docker:run` - Run Docker container
- `npm run docker:dev` - Start development environment with Docker Compose
- `npm run docker:down` - Stop Docker Compose services
- `npm run docker:logs` - View Docker Compose logs
- `npm run docker:clean` - Clean Docker system

## Release Scripts

- `npm run version:patch` - Bump patch version
- `npm run version:minor` - Bump minor version
- `npm run version:major` - Bump major version
- `npm run release:prepare` - Prepare for release (run all checks)
- `npm run release:patch` - Prepare and release patch version
- `npm run release:minor` - Prepare and release minor version
- `npm run release:major` - Prepare and release major version

## Git Hooks

The following scripts are automatically triggered by Git hooks:

- `npm run prepare` - Set up Husky Git hooks (runs after npm install)
- `npm run precommit` - Run before each commit (lint-staged)
- `npm run prepush` - Run before each push (type-check and unit tests)

## Performance and Analysis

- `npm run lighthouse` - Run Lighthouse performance audit
- `npm run bundle-analyze` - Analyze bundle size and composition

## Usage Examples

### Setting up development environment
```bash
npm run setup
```

### Running tests before commit
```bash
npm run ci:quality
npm run test:unit
```

### Preparing for deployment
```bash
npm run deploy:validate
```

### Database maintenance
```bash
npm run db:backup
npm run db:migrate
npm run db:seed
```

### Performance analysis
```bash
npm run build:analyze
npm run lighthouse
```

## Environment Variables

Some scripts respect the following environment variables:

- `NODE_ENV` - Set environment (development/production)
- `HEALTH_CHECK_URL` - URL for health checks
- `HEALTH_CHECK_TIMEOUT` - Timeout for health checks
- `HEALTH_CHECK_OUTPUT` - File to save health check results

## Cross-Platform Compatibility

All scripts are designed to work on Windows, macOS, and Linux. The project uses:

- `cross-env` for environment variables
- `rimraf` for file deletion
- Node.js scripts for complex operations

## Troubleshooting

### Common Issues

1. **Permission errors on Windows**: Run terminal as administrator
2. **Node version mismatch**: Use `.nvmrc` file with `nvm use`
3. **Database connection issues**: Check `.env` configuration
4. **Build failures**: Run `npm run clean` and try again

### Getting Help

- Run any script without arguments to see help (where available)
- Check the `scripts/` directory for script source code
- Refer to individual tool documentation (Jest, ESLint, Prettier, etc.)