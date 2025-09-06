// Global test setup file
import { expect, afterEach } from '@jest/globals';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';

// Extend Jest matchers with Testing Library matchers
expect.extend(matchers);

// Cleanup after each test case
afterEach(() => {
  cleanup();
});
