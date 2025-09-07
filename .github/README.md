# CI/CD Pipeline Documentation

This document describes the Continuous Integration and Continuous Deployment (CI/CD) pipeline for ConstructPro.

## Overview

Our CI/CD pipeline is built using GitHub Actions and consists of multiple workflows that ensure code quality, security, and reliable deployments.

## Workflows

### 1. Main CI/CD Pipeline (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Manual workflow dispatch

**Jobs:**
- **Quality Gates**: ESLint, Prettier, TypeScript checking
- **Test Suite**: Unit tests and coverage analysis
- **Security Scan**: Dependency auditing, Snyk scanning, CodeQL analysis
- **Build & Deploy Test**: Application building and deployment testing
- **Docker**: Container building and testing
- **Deploy Staging**: Automatic deployment to staging (develop branch)
- **Deploy Production**: Automatic deployment to production (main branch)
- **Notify**: Results notification and PR comments

### 2. Security Monitoring (`security-monitoring.yml`)

**Triggers:**
- Daily schedule (2 AM UTC)
- Changes to package.json/package-lock.json
- Manual workflow dispatch

**Jobs:**
- **Dependency Scan**: Daily vulnerability scanning
- **License Check**: License compliance verification
- **Dependency Update**: Automated dependency updates
- **Security Policy**: Security policy enforcement

### 3. Quality Gates (`quality-gates.yml`)

**Triggers:**
- Push to main/develop branches
- Pull requests
- Weekly schedule (Sundays 3 AM UTC)

**Jobs:**
- **Code Quality**: ESLint analysis and complexity checking
- **Coverage Analysis**: Test coverage with threshold enforcement
- **Performance Benchmark**: Lighthouse CI and bundle analysis
- **Documentation Quality**: README and API documentation checks

## Quality Standards

### Code Quality Requirements
- ✅ ESLint: No errors allowed, warnings reviewed
- ✅ TypeScript: Strict type checking enabled
- ✅ Prettier: Consistent code formatting enforced
- ✅ Test Coverage: Minimum 80% coverage required

### Security Requirements
- ✅ Dependency Audit: No high/critical vulnerabilities
- ✅ CodeQL Analysis: Static security analysis
- ✅ Snyk Scanning: Third-party security scanning
- ✅ License Compliance: Approved licenses only

### Performance Standards
- ✅ Lighthouse Performance: Score ≥ 80
- ✅ Lighthouse Accessibility: Score ≥ 90
- ✅ Bundle Size: Monitored for regressions
- ✅ Build Time: Optimized build processes

## Branch Strategy

```
main (production)
├── develop (staging)
│   ├── feature/feature-name
│   ├── bugfix/bug-description
│   └── hotfix/critical-fix
```

### Branch Protection Rules

**Main Branch:**
- Requires pull request reviews
- Requires status checks to pass
- Requires branches to be up to date
- Restricts pushes to admins only

**Develop Branch:**
- Requires status checks to pass
- Allows force pushes by admins
- Automatically deletes head branches

## Deployment Process

### Staging Deployment
1. Code pushed to `develop` branch
2. CI pipeline runs all quality gates
3. Automatic deployment to staging environment
4. Smoke tests executed
5. Notification sent on completion

### Production Deployment
1. Pull request from `develop` to `main`
2. Code review and approval required
3. Merge triggers production deployment
4. Full test suite execution
5. Blue-green deployment strategy
6. Health checks and monitoring

## Environment Variables

### Required Secrets
- `SNYK_TOKEN`: Snyk security scanning token
- `CODECOV_TOKEN`: Code coverage reporting token
- `LHCI_GITHUB_APP_TOKEN`: Lighthouse CI GitHub app token

### Environment-Specific Variables
- `DATABASE_URL`: Database connection string
- `NEXTAUTH_SECRET`: NextAuth.js secret key
- `NEXTAUTH_URL`: Application URL for authentication

## Monitoring and Alerts

### Automated Notifications
- ✅ PR comments with test results and coverage
- ✅ Security vulnerability alerts
- ✅ Deployment status notifications
- ✅ Quality gate failures

### Reporting
- 📊 Weekly quality reports
- 📈 Coverage trend analysis
- 🔍 Security scan summaries
- ⚡ Performance benchmarks

## Local Development

### Running CI Checks Locally

```bash
# Run all quality checks
npm run ci:quality

# Run tests with coverage
npm run ci:test

# Build application
npm run ci:build

# Security audit
npm run ci:security

# Performance analysis
npm run lighthouse
```

### Pre-commit Hooks

Husky is configured to run the following checks before each commit:
- ESLint on staged files
- Prettier formatting
- TypeScript type checking
- Unit tests for changed files

## Troubleshooting

### Common Issues

**Build Failures:**
1. Check TypeScript errors: `npm run type-check`
2. Fix linting issues: `npm run lint:fix`
3. Update dependencies: `npm update`

**Test Failures:**
1. Run tests locally: `npm run test`
2. Check coverage: `npm run test:coverage`
3. Update snapshots if needed: `npm run test -- -u`

**Security Issues:**
1. Run security audit: `npm audit`
2. Fix vulnerabilities: `npm audit fix`
3. Check for outdated packages: `npm outdated`

### Getting Help

- 📖 Check the [troubleshooting guide](../docs/troubleshooting.md)
- 🐛 Create an issue using the bug report template
- 💬 Ask questions in team discussions
- 📧 Contact the development team

## Continuous Improvement

The CI/CD pipeline is continuously improved based on:
- Team feedback and pain points
- Industry best practices
- Security recommendations
- Performance optimization opportunities

Regular reviews are conducted to ensure the pipeline remains efficient and effective.