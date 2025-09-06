# Testing Infrastructure

## Overview

This document describes the comprehensive testing infrastructure setup for ConstructPro, including unit tests, component tests, and testing utilities.

## Test Configuration

### Jest Configuration
- **Main Config**: `jest.config.simple.js` - Simplified configuration using ts-jest
- **Test Environment**: jsdom for DOM testing
- **Setup File**: `jest.setup.simple.js` - Global test setup and mocks

### Coverage Thresholds
- **Global**: 60% branches, 70% functions/lines/statements
- **Services**: 80% branches, 90% functions/lines/statements  
- **Utils**: 80% branches, 90% functions/lines/statements

## Test Structure

### Unit Tests
- **Location**: `src/**/__tests__/` or `src/**/*.test.ts`
- **Utilities**: `src/utils/__tests__/`
- **Services**: `src/services/__tests__/`

### Component Tests
- **Location**: `src/components/**/__tests__/`
- **UI Components**: `src/components/ui/__tests__/`

### Test Utilities
- **Location**: `tests/utils/`
- **Test Utils**: Custom render function with providers
- **Mock Factories**: Data factories for consistent test data

### Mock Files
- **Location**: `tests/__mocks__/`
- **API Mocking**: MSW handlers (when available)
- **Service Mocks**: Axios, Socket.IO, NextAuth mocks
- **Data Factories**: User, Project, Task factories

## Available Scripts

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

## Test Categories

### 1. Utility Function Tests
- **cn utility**: Class name merging with Tailwind
- **auth utilities**: Authentication configuration
- **database utilities**: Prisma client setup

### 2. Service Layer Tests
- **API Service**: HTTP client with retry logic and error handling
- **Auth Service**: Authentication operations and token management
- **User Service**: User profile and management operations

### 3. UI Component Tests
- **Button Component**: Variants, sizes, interactions
- **Input Component**: Types, validation, events
- **Card Components**: Layout and composition

## Mock Factories

### User Factory
```typescript
createMockUser(overrides?: Partial<MockUser>): MockUser
createMockUsers(count: number): MockUser[]
```

### Project Factory
```typescript
createMockProject(overrides?: Partial<MockProject>): MockProject
createMockProjects(count: number): MockProject[]
```

### API Response Factory
```typescript
createMockApiResponse<T>(data: T, success?: boolean)
createMockError(message?: string, code?: number)
```

## Testing Best Practices

### 1. Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Mocking Strategy
- Mock external dependencies
- Use factories for consistent test data
- Reset mocks between tests

### 3. Component Testing
- Test user interactions
- Verify accessibility attributes
- Test different props and states

### 4. Service Testing
- Test success and error scenarios
- Verify API calls and parameters
- Test error handling and retries

## Current Test Status

### Implemented Tests
✅ Utility function tests (cn, basic math)
✅ UI component tests (Button, Input, Card)
✅ Service layer tests (API, Auth, User services)
✅ Mock factories and utilities
✅ Test configuration and setup

### Test Results Summary
- **Total Test Suites**: 9
- **Passing Tests**: Utility and component tests working
- **Issues**: Some service tests need mock refinement
- **Coverage**: Basic infrastructure in place

## Known Issues and Solutions

### 1. Service Test Mocking
**Issue**: localStorage and API service mocks need refinement
**Solution**: Enhanced mock setup in individual test files

### 2. API Service URL Building
**Issue**: Invalid base URL in test environment
**Solution**: Mock API_CONFIG constants in tests

### 3. MSW Integration
**Issue**: MSW compatibility issues in test environment
**Solution**: Fallback to simple fetch mocking for now

## Next Steps

1. **Refine Service Tests**: Fix localStorage and API mocking issues
2. **Add Integration Tests**: Test component-service interactions
3. **Enhance Coverage**: Add more edge cases and error scenarios
4. **Performance Tests**: Add performance benchmarking
5. **E2E Tests**: Setup Playwright for end-to-end testing

## Usage Examples

### Running Specific Tests
```bash
# Run utility tests only
npx jest --config jest.config.simple.js --testPathPatterns=utils

# Run component tests only
npx jest --config jest.config.simple.js --testPathPatterns=components

# Run service tests only
npx jest --config jest.config.simple.js --testPathPatterns=services
```

### Writing New Tests
```typescript
// Example component test
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});

// Example service test
import { myService } from '../my.service';

describe('MyService', () => {
  it('should handle API calls', async () => {
    const result = await myService.getData();
    expect(result.success).toBe(true);
  });
});
```