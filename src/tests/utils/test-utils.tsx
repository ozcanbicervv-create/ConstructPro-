/**
 * Comprehensive testing utilities for React components
 * Includes accessibility testing, visual regression testing, and performance testing
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ThemeProvider } from 'next-themes';
import React, { ReactElement } from 'react';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Test providers wrapper
interface TestProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
}

const TestProviders: React.FC<TestProvidersProps> = ({ 
  children, 
  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

export const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult & { user: ReturnType<typeof userEvent.setup> } => {
  const { queryClient, ...renderOptions } = options;
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestProviders queryClient={queryClient}>{children}</TestProviders>
  );

  const user = userEvent.setup();

  return {
    user,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

// Accessibility testing utilities
export const testAccessibility = async (container: HTMLElement): Promise<void> => {
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};

export const testKeyboardNavigation = async (
  container: HTMLElement,
  user: ReturnType<typeof userEvent.setup>
): Promise<void> => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  if (focusableElements.length === 0) {return;}

  // Test Tab navigation
  const firstElement = focusableElements[0] as HTMLElement;
  firstElement.focus();
  expect(document.activeElement).toBe(firstElement);

  // Navigate through all focusable elements
  for (let i = 1; i < focusableElements.length; i++) {
    await user.keyboard('{Tab}');
    expect(document.activeElement).toBe(focusableElements[i]);
  }

  // Test Shift+Tab navigation
  for (let i = focusableElements.length - 2; i >= 0; i--) {
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(document.activeElement).toBe(focusableElements[i]);
  }
};

export const testScreenReaderSupport = (container: HTMLElement): void => {
  // Check for proper ARIA labels
  const interactiveElements = container.querySelectorAll(
    'button, [role="button"], input, select, textarea, [role="textbox"]'
  );

  interactiveElements.forEach(element => {
    const hasLabel = 
      element.hasAttribute('aria-label') ||
      element.hasAttribute('aria-labelledby') ||
      element.querySelector('label') ||
      element.textContent?.trim();

    expect(hasLabel).toBeTruthy();
  });

  // Check for proper heading hierarchy
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let previousLevel = 0;

  headings.forEach(heading => {
    const level = parseInt(heading.tagName.charAt(1));
    expect(level).toBeLessThanOrEqual(previousLevel + 1);
    previousLevel = level;
  });
};

// Performance testing utilities
export const measureRenderTime = async (
  renderFn: () => RenderResult
): Promise<{ renderTime: number; result: RenderResult }> => {
  const startTime = performance.now();
  const result = renderFn();
  const endTime = performance.now();
  
  return {
    renderTime: endTime - startTime,
    result,
  };
};

export const testComponentPerformance = async (
  component: ReactElement,
  options: {
    maxRenderTime?: number;
    iterations?: number;
  } = {}
): Promise<{
  averageRenderTime: number;
  maxRenderTime: number;
  minRenderTime: number;
}> => {
  const { maxRenderTime = 100, iterations = 10 } = options;
  const renderTimes: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const { renderTime } = await measureRenderTime(() => 
      renderWithProviders(component)
    );
    renderTimes.push(renderTime);
  }

  const averageRenderTime = renderTimes.reduce((sum, time) => sum + time, 0) / iterations;
  const maxTime = Math.max(...renderTimes);
  const minTime = Math.min(...renderTimes);

  // Assert performance threshold
  expect(averageRenderTime).toBeLessThan(maxRenderTime);

  return {
    averageRenderTime,
    maxRenderTime: maxTime,
    minRenderTime: minTime,
  };
};

// Visual regression testing utilities
export const createSnapshot = (container: HTMLElement): string => {
  // Remove dynamic content that changes between runs
  const clone = container.cloneNode(true) as HTMLElement;
  
  // Remove timestamps, IDs, and other dynamic content
  clone.querySelectorAll('[data-testid*="timestamp"]').forEach(el => {
    el.textContent = 'TIMESTAMP_PLACEHOLDER';
  });
  
  clone.querySelectorAll('[id]').forEach(el => {
    el.removeAttribute('id');
  });

  return clone.innerHTML;
};

export const testVisualRegression = (container: HTMLElement, testName: string): void => {
  const snapshot = createSnapshot(container);
  expect(snapshot).toMatchSnapshot(`${testName}.html`);
};

// Form testing utilities
export const fillForm = async (
  user: ReturnType<typeof userEvent.setup>,
  formData: Record<string, string>
): Promise<void> => {
  for (const [name, value] of Object.entries(formData)) {
    const input = document.querySelector(`[name="${name}"]`) as HTMLInputElement;
    if (input) {
      await user.clear(input);
      await user.type(input, value);
    }
  }
};

export const testFormValidation = async (
  user: ReturnType<typeof userEvent.setup>,
  submitButton: HTMLElement,
  expectedErrors: string[]
): Promise<void> => {
  await user.click(submitButton);
  
  expectedErrors.forEach(error => {
    expect(document.body).toHaveTextContent(error);
  });
};

// API testing utilities
export const mockApiResponse = (
  url: string,
  response: any,
  status = 200
): jest.Mock => {
  return (global.fetch as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    })
  );
};

export const waitForApiCall = async (
  apiCall: () => Promise<any>,
  timeout = 5000
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`API call timed out after ${timeout}ms`));
    }, timeout);

    apiCall()
      .then(result => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch(error => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
};

// Component testing utilities
export const testComponentStates = async (
  component: ReactElement,
  states: Array<{
    name: string;
    props: Record<string, any>;
    assertions: (container: HTMLElement) => void;
  }>
): Promise<void> => {
  for (const state of states) {
    const { container } = renderWithProviders(
      React.cloneElement(component, state.props)
    );
    
    state.assertions(container);
    
    // Test accessibility for each state
    await testAccessibility(container);
  }
};

// Error boundary testing
export const TestErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const handleError = () => setHasError(true);
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return <div data-testid="error-boundary">Something went wrong</div>;
  }

  return <>{children}</>;
};

// Custom hooks testing utilities
export const renderHookWithProviders = <T,>(
  hook: () => T,
  options: CustomRenderOptions = {}
) => {
  const { queryClient, ...renderOptions } = options;
  
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestProviders queryClient={queryClient}>{children}</TestProviders>
  );

  return { wrapper, ...renderOptions };
};

// Export all utilities
export * from '@testing-library/react';
export { userEvent };
export { axe };

// Re-export with custom render as default
export { renderWithProviders as render };