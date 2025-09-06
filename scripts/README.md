# Scripts Directory

This directory contains utility scripts for the ConstructPro project. These scripts automate common development, maintenance, and deployment tasks.

## Available Scripts

### 🚀 Development Setup
- **`setup-dev.js`** - Automated development environment setup
- **`check-environment.js`** - Validate development environment requirements

### 🏥 Health & Monitoring
- **`health-check.js`** - Comprehensive application health monitoring
- **`validate-build.js`** - Production build validation and quality checks

### 🗄️ Database Management
- **`maintenance.js`** - Database backup, restore, and maintenance operations

## Usage

All scripts can be run directly with Node.js or through npm scripts:

```bash
# Direct execution
node scripts/setup-dev.js

# Through npm scripts (recommended)
npm run setup
npm run check:env
npm run test:health
npm run deploy:validate
npm run db:maintenance
```

## Script Details

### setup-dev.js
Automates the complete development environment setup process:
- Checks system requirements (Node.js, npm)
- Verifies environment files
- Installs dependencies
- Sets up database
- Configures Git hooks
- Runs initial validation checks

**Usage:**
```bash
npm run setup
```

### check-environment.js
Validates that the development environment meets all requirements:
- Node.js version compatibility
- Required tools availability
- Essential files presence
- Database connectivity

**Usage:**
```bash
npm run check:env
```

### health-check.js
Performs comprehensive health monitoring:
- File system checks
- Environment variable validation
- HTTP endpoint testing
- Response time monitoring
- Detailed reporting

**Usage:**
```bash
npm run test:health
npm run test:health:local
```

**Environment Variables:**
- `HEALTH_CHECK_URL` - Target URL (default: http://localhost:3000)
- `HEALTH_CHECK_TIMEOUT` - Request timeout in ms (default: 10000)
- `HEALTH_CHECK_OUTPUT` - Output file for results (optional)

### validate-build.js
Validates production builds for deployment readiness:
- TypeScript compilation
- Code linting and formatting
- Unit test execution
- Security audit
- Build process validation
- Bundle size analysis

**Usage:**
```bash
npm run deploy:validate
```

### maintenance.js
Database maintenance and backup operations:
- Create database backups
- Restore from backups
- List available backups
- Cleanup old backups
- Database reset with backup

**Usage:**
```bash
npm run db:maintenance          # Show help
npm run db:backup              # Create backup
npm run db:restore             # Restore (interactive)
npm run db:list-backups        # List backups
npm run db:cleanup             # Cleanup old backups
```

## Cross-Platform Compatibility

All scripts are designed to work on:
- ✅ Windows
- ✅ macOS  
- ✅ Linux

The scripts use Node.js built-in modules and cross-platform packages to ensure compatibility.

## Error Handling

Scripts implement comprehensive error handling:
- Graceful failure with meaningful error messages
- Non-zero exit codes for CI/CD integration
- Detailed logging for troubleshooting
- Rollback capabilities where applicable

## Contributing

When adding new scripts:

1. Follow the existing naming convention
2. Include comprehensive error handling
3. Add usage documentation
4. Ensure cross-platform compatibility
5. Add corresponding npm scripts in package.json
6. Update this README

## Security Considerations

- Scripts validate input parameters
- Sensitive operations require confirmation
- Backup operations preserve data integrity
- No hardcoded credentials or secrets
- Audit logs for critical operations

## Troubleshooting

### Common Issues

**Permission Errors (Windows)**
```bash
# Run as administrator or adjust execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Node.js Version Issues**
```bash
# Use .nvmrc file
nvm use
```

**Database Connection Issues**
```bash
# Check environment configuration
npm run check:env
```

### Getting Help

Each script provides help when run without arguments or with invalid parameters:

```bash
node scripts/maintenance.js     # Shows usage help
node scripts/health-check.js    # Shows default behavior
```

## Integration with CI/CD

Scripts are designed for CI/CD integration:

- Exit codes indicate success/failure
- JSON output available for parsing
- Environment variable configuration
- Non-interactive modes available

Example CI usage:
```yaml
- name: Validate Build
  run: npm run deploy:validate

- name: Health Check
  run: npm run test:health
  env:
    HEALTH_CHECK_URL: ${{ env.STAGING_URL }}
```