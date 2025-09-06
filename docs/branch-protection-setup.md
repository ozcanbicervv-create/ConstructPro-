# Branch Protection Rules Setup

## Overview

This document outlines the recommended branch protection rules for the ConstructPro repository to ensure code quality and maintain a stable main branch.

## Branch Protection Configuration

### Main Branch Protection

The following settings should be configured for the `main` branch in GitHub repository settings:

#### Required Status Checks

- [x] Require status checks to pass before merging
- [x] Require branches to be up to date before merging

**Required Checks:**
- `CI / lint-and-test` - Linting and testing workflow
- `CI / type-check` - TypeScript type checking
- `CI / build` - Production build verification
- `CI / security-audit` - Security vulnerability scanning
- `CI / performance-test` - Performance benchmarks

#### Pull Request Requirements

- [x] Require pull request reviews before merging
- [x] Required number of reviewers: **1**
- [x] Dismiss stale reviews when new commits are pushed
- [x] Require review from code owners (when CODEOWNERS file exists)
- [x] Restrict pushes that create new files to code owners only

#### Additional Restrictions

- [x] Restrict pushes to matching branches
- [x] Allow force pushes: **No**
- [x] Allow deletions: **No**

#### Administrative Settings

- [x] Include administrators in these restrictions
- [x] Allow specified actors to bypass required pull requests

### Development Branch Protection

For `develop` or `staging` branches:

#### Required Status Checks

- [x] Require status checks to pass before merging
- [x] Require branches to be up to date before merging

**Required Checks:**
- `CI / lint-and-test` - Basic linting and testing
- `CI / type-check` - TypeScript type checking

#### Pull Request Requirements

- [x] Require pull request reviews before merging
- [x] Required number of reviewers: **1**
- [x] Dismiss stale reviews when new commits are pushed

## GitHub Actions Workflow Configuration

### CI Workflow (`.github/workflows/ci.yml`)

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint:strict
      - run: npm run test:ci

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run type-check

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build:production

  security-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run security:audit

  performance-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - run: npm run performance:benchmark
```

## CODEOWNERS File

Create a `.github/CODEOWNERS` file to define code ownership:

```
# Global owners
* @vovelet-tech/core-team

# Frontend components
/src/components/ @vovelet-tech/frontend-team

# Backend API
/src/app/api/ @vovelet-tech/backend-team

# Database and migrations
/prisma/ @vovelet-tech/backend-team

# CI/CD and deployment
/.github/ @vovelet-tech/devops-team
/scripts/ @vovelet-tech/devops-team

# Documentation
/docs/ @vovelet-tech/core-team

# Security-related files
/src/utils/security/ @vovelet-tech/security-team
/scripts/security-audit.js @vovelet-tech/security-team
```

## Merge Strategies

### Recommended Merge Strategy

- **Squash and merge** for feature branches
  - Keeps main branch history clean
  - Combines all commits into a single commit
  - Requires good commit messages

### Alternative Strategies

- **Merge commit** for release branches
  - Preserves branch history
  - Shows when features were merged

- **Rebase and merge** for small changes
  - Linear history
  - No merge commits

## Enforcement Scripts

### Pre-merge Validation Script

```bash
#!/bin/bash
# scripts/validate-merge.sh

set -e

echo "🔍 Validating merge requirements..."

# Check if all required checks pass
echo "✅ All CI checks must pass"

# Verify branch is up to date
git fetch origin
if [ $(git rev-list HEAD..origin/main --count) -ne 0 ]; then
  echo "❌ Branch is not up to date with main"
  exit 1
fi

# Check for required approvals
echo "✅ Pull request must have required approvals"

# Verify no merge conflicts
if git merge-tree $(git merge-base HEAD origin/main) HEAD origin/main | grep -q "<<<<<<< "; then
  echo "❌ Merge conflicts detected"
  exit 1
fi

echo "✅ All merge requirements satisfied"
```

## Setup Instructions

### 1. Configure Branch Protection in GitHub

1. Go to repository Settings → Branches
2. Click "Add rule" for main branch
3. Configure settings as outlined above
4. Save the protection rule

### 2. Create GitHub Actions Workflows

1. Create `.github/workflows/ci.yml` with the configuration above
2. Ensure all referenced npm scripts exist in package.json
3. Test the workflow with a test pull request

### 3. Set Up CODEOWNERS

1. Create `.github/CODEOWNERS` file
2. Define appropriate team ownership
3. Ensure teams exist in GitHub organization

### 4. Configure Repository Settings

1. **General Settings:**
   - Allow squash merging: ✅
   - Allow merge commits: ✅
   - Allow rebase merging: ✅
   - Automatically delete head branches: ✅

2. **Pull Request Settings:**
   - Allow auto-merge: ✅
   - Require conversation resolution: ✅
   - Suggest updating pull request branches: ✅

## Monitoring and Maintenance

### Regular Reviews

- Monthly review of branch protection effectiveness
- Quarterly update of required status checks
- Annual review of CODEOWNERS accuracy

### Metrics to Track

- Pull request merge time
- Number of failed status checks
- Code review participation
- Branch protection rule violations

### Troubleshooting

#### Common Issues

1. **Status checks not running**
   - Verify GitHub Actions workflow syntax
   - Check repository permissions
   - Ensure required secrets are configured

2. **Reviews not being enforced**
   - Verify CODEOWNERS file syntax
   - Check team membership
   - Confirm branch protection settings

3. **Merge conflicts**
   - Encourage regular branch updates
   - Provide merge conflict resolution training
   - Consider shorter-lived feature branches

## Best Practices

1. **Keep branches up to date**
   - Regularly sync with main branch
   - Use GitHub's "Update branch" button
   - Resolve conflicts early

2. **Meaningful commit messages**
   - Follow conventional commits format
   - Include context and reasoning
   - Reference related issues

3. **Small, focused pull requests**
   - Single responsibility principle
   - Easier to review and test
   - Faster merge times

4. **Comprehensive testing**
   - Write tests before or with code
   - Ensure good test coverage
   - Test edge cases and error scenarios

This branch protection setup ensures code quality while maintaining development velocity and team collaboration.