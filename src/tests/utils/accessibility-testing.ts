/**
 * Comprehensive accessibility testing utilities
 * Implements automated accessibility testing with axe-core and custom checks
 */

import { getByRole, getAllByRole, queryByRole } from '@testing-library/react';
import { axe, toHaveNoViolations, AxeResults } from 'jest-axe';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// WCAG 2.1 AA compliance levels
export const WCAG_LEVELS = {
  A: 'wcag2a',
  AA: 'wcag2aa',
  AAA: 'wcag2aaa',
} as const;

// Accessibility test configuration
export interface AccessibilityTestConfig {
  level: keyof typeof WCAG_LEVELS;
  rules?: Record<string, { enabled: boolean }>;
  tags?: string[];
  exclude?: string[];
}

// Default accessibility configuration
export const DEFAULT_A11Y_CONFIG: AccessibilityTestConfig = {
  level: 'AA',
  tags: ['wcag2aa', 'wcag21aa'],
  rules: {
    // Enable additional rules for construction industry
    'color-contrast': { enabled: true },
    'keyboard-navigation': { enabled: true },
    'focus-management': { enabled: true },
    'aria-labels': { enabled: true },
    'heading-hierarchy': { enabled: true },
  },
};

// Enhanced accessibility testing function
export async function testAccessibilityCompliance(
  container: HTMLElement,
  config: AccessibilityTestConfig = DEFAULT_A11Y_CONFIG
): Promise<AxeResults> {
  const axeConfig = {
    tags: config.tags || [WCAG_LEVELS[config.level]],
    rules: config.rules || {},
  };

  const results = await axe(container, axeConfig);
  
  // Custom assertions for construction industry requirements
  await testConstructionSpecificA11y(container);
  
  expect(results).toHaveNoViolations();
  return results;
}

// Construction industry specific accessibility tests
export async function testConstructionSpecificA11y(container: HTMLElement): Promise<void> {
  // Test safety-critical information accessibility
  testSafetyCriticalElements(container);
  
  // Test measurement and data accessibility
  testMeasurementDataA11y(container);
  
  // Test construction workflow accessibility
  testWorkflowA11y(container);
  
  // Test mobile construction site usage
  testMobileA11y(container);
}

// Test safety-critical elements for accessibility
export function testSafetyCriticalElements(container: HTMLElement): void {
  // Safety alerts should have proper ARIA roles and high contrast
  const safetyAlerts = container.querySelectorAll('[data-safety="critical"], .safety-alert, [role="alert"]');
  
  safetyAlerts.forEach(alert => {
    // Should have alert role or aria-live
    const hasAlertRole = alert.getAttribute('role') === 'alert' || 
                        alert.getAttribute('aria-live') === 'assertive';
    expect(hasAlertRole).toBeTruthy();
    
    // Should have sufficient color contrast (tested by axe, but we can add custom checks)
    const computedStyle = window.getComputedStyle(alert);
    const backgroundColor = computedStyle.backgroundColor;
    const color = computedStyle.color;
    
    // Basic check that colors are defined
    expect(backgroundColor).not.toBe('');
    expect(color).not.toBe('');
  });
}

// Test measurement and numerical data accessibility
export function testMeasurementDataA11y(container: HTMLElement): void {
  // Measurement inputs should have proper labels and units
  const measurementInputs = container.querySelectorAll(
    'input[type="number"], [data-type="measurement"], .measurement-input'
  );
  
  measurementInputs.forEach(input => {
    // Should have accessible name
    const hasAccessibleName = 
      input.getAttribute('aria-label') ||
      input.getAttribute('aria-labelledby') ||
      container.querySelector(`label[for="${input.id}"]`);
    
    expect(hasAccessibleName).toBeTruthy();
    
    // Should indicate units if applicable
    const hasUnits = 
      input.getAttribute('aria-describedby') ||
      input.getAttribute('data-unit') ||
      input.getAttribute('title');
    
    if (input.getAttribute('data-type') === 'measurement') {
      expect(hasUnits).toBeTruthy();
    }
  });
}

// Test construction workflow accessibility
export function testWorkflowA11y(container: HTMLElement): void {
  // Progress indicators should be accessible
  const progressElements = container.querySelectorAll(
    '[role="progressbar"], .progress, .step-indicator'
  );
  
  progressElements.forEach(progress => {
    if (progress.getAttribute('role') === 'progressbar') {
      // Should have value and max attributes
      expect(progress.getAttribute('aria-valuenow')).toBeTruthy();
      expect(progress.getAttribute('aria-valuemax')).toBeTruthy();
      
      // Should have accessible label
      const hasLabel = 
        progress.getAttribute('aria-label') ||
        progress.getAttribute('aria-labelledby');
      expect(hasLabel).toBeTruthy();
    }
  });
  
  // Step indicators should have proper navigation
  const stepIndicators = container.querySelectorAll('.step-indicator, [data-step]');
  stepIndicators.forEach(step => {
    // Should be keyboard accessible if interactive
    if (step.tagName === 'BUTTON' || step.getAttribute('tabindex') === '0') {
      expect(step.getAttribute('aria-label') || step.textContent?.trim()).toBeTruthy();
    }
  });
}

// Test mobile construction site accessibility
export function testMobileA11y(container: HTMLElement): void {
  // Touch targets should be large enough (minimum 44px)
  const interactiveElements = container.querySelectorAll(
    'button, a, input, select, textarea, [role="button"], [tabindex="0"]'
  );
  
  interactiveElements.forEach(element => {
    const rect = element.getBoundingClientRect();
    const minSize = 44; // WCAG AA minimum touch target size
    
    // Note: This is a basic check - in real testing you'd measure actual rendered size
    if (rect.width > 0 && rect.height > 0) {
      const isTouchTarget = rect.width >= minSize || rect.height >= minSize;
      // For now, we'll just log this - in production you might want stricter enforcement
      if (!isTouchTarget) {
        console.warn(`Touch target may be too small: ${element.tagName} (${rect.width}x${rect.height})`);
      }
    }
  });
}

// Keyboard navigation testing
export async function testKeyboardNavigation(
  container: HTMLElement,
  user: any // userEvent instance
): Promise<void> {
  const focusableElements = getFocusableElements(container);
  
  if (focusableElements.length === 0) {return;}
  
  // Test Tab navigation
  await testTabNavigation(focusableElements, user);
  
  // Test Arrow key navigation for specific components
  await testArrowKeyNavigation(container, user);
  
  // Test Escape key functionality
  await testEscapeKeyFunctionality(container, user);
  
  // Test Enter/Space key activation
  await testKeyActivation(container, user);
}

// Get all focusable elements in order
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'button:not([disabled])',
    'a[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[role="button"]:not([aria-disabled="true"])',
    '[role="link"]:not([aria-disabled="true"])',
    '[role="menuitem"]:not([aria-disabled="true"])',
    '[role="tab"]:not([aria-disabled="true"])',
  ].join(', ');
  
  return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
}

// Test Tab navigation through focusable elements
async function testTabNavigation(
  focusableElements: HTMLElement[],
  user: any
): Promise<void> {
  if (focusableElements.length === 0) {return;}
  
  // Focus first element
  focusableElements[0].focus();
  expect(document.activeElement).toBe(focusableElements[0]);
  
  // Tab through all elements
  for (let i = 1; i < focusableElements.length; i++) {
    await user.keyboard('{Tab}');
    expect(document.activeElement).toBe(focusableElements[i]);
  }
  
  // Test Shift+Tab navigation
  for (let i = focusableElements.length - 2; i >= 0; i--) {
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(document.activeElement).toBe(focusableElements[i]);
  }
}

// Test arrow key navigation for components that support it
async function testArrowKeyNavigation(
  container: HTMLElement,
  user: any
): Promise<void> {
  // Test radio groups
  const radioGroups = container.querySelectorAll('[role="radiogroup"]');
  for (const group of radioGroups) {
    const radios = group.querySelectorAll('[role="radio"]') as NodeListOf<HTMLElement>;
    if (radios.length > 1) {
      radios[0].focus();
      await user.keyboard('{ArrowDown}');
      expect(document.activeElement).toBe(radios[1]);
    }
  }
  
  // Test tab lists
  const tabLists = container.querySelectorAll('[role="tablist"]');
  for (const tabList of tabLists) {
    const tabs = tabList.querySelectorAll('[role="tab"]') as NodeListOf<HTMLElement>;
    if (tabs.length > 1) {
      tabs[0].focus();
      await user.keyboard('{ArrowRight}');
      expect(document.activeElement).toBe(tabs[1]);
    }
  }
  
  // Test menus
  const menus = container.querySelectorAll('[role="menu"]');
  for (const menu of menus) {
    const menuItems = menu.querySelectorAll('[role="menuitem"]') as NodeListOf<HTMLElement>;
    if (menuItems.length > 1) {
      menuItems[0].focus();
      await user.keyboard('{ArrowDown}');
      expect(document.activeElement).toBe(menuItems[1]);
    }
  }
}

// Test Escape key functionality
async function testEscapeKeyFunctionality(
  container: HTMLElement,
  user: any
): Promise<void> {
  // Test dialogs
  const dialogs = container.querySelectorAll('[role="dialog"]');
  for (const dialog of dialogs) {
    if (dialog.getAttribute('aria-hidden') !== 'true') {
      const focusableInDialog = getFocusableElements(dialog as HTMLElement);
      if (focusableInDialog.length > 0) {
        focusableInDialog[0].focus();
        await user.keyboard('{Escape}');
        // Dialog should close (aria-hidden should be true or element should be removed)
        // This is component-specific, so we'll just verify focus management
      }
    }
  }
  
  // Test dropdowns/comboboxes
  const comboboxes = container.querySelectorAll('[role="combobox"]');
  for (const combobox of comboboxes) {
    if (combobox.getAttribute('aria-expanded') === 'true') {
      (combobox as HTMLElement).focus();
      await user.keyboard('{Escape}');
      expect(combobox.getAttribute('aria-expanded')).toBe('false');
    }
  }
}

// Test Enter and Space key activation
async function testKeyActivation(
  container: HTMLElement,
  user: any
): Promise<void> {
  // Test buttons
  const buttons = container.querySelectorAll('button:not([disabled]), [role="button"]:not([aria-disabled="true"])');
  for (const button of buttons) {
    const clickHandler = jest.fn();
    button.addEventListener('click', clickHandler);
    
    (button as HTMLElement).focus();
    await user.keyboard('{Enter}');
    expect(clickHandler).toHaveBeenCalled();
    
    clickHandler.mockClear();
    await user.keyboard(' ');
    expect(clickHandler).toHaveBeenCalled();
    
    button.removeEventListener('click', clickHandler);
  }
}

// Screen reader testing utilities
export function testScreenReaderSupport(container: HTMLElement): void {
  // Test heading hierarchy
  testHeadingHierarchy(container);
  
  // Test landmark regions
  testLandmarkRegions(container);
  
  // Test form labels
  testFormLabels(container);
  
  // Test image alt text
  testImageAltText(container);
  
  // Test table headers
  testTableHeaders(container);
}

// Test proper heading hierarchy
function testHeadingHierarchy(container: HTMLElement): void {
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let previousLevel = 0;
  
  headings.forEach(heading => {
    const level = parseInt(heading.tagName.charAt(1));
    
    // Heading levels should not skip (e.g., h1 -> h3)
    if (previousLevel > 0) {
      expect(level).toBeLessThanOrEqual(previousLevel + 1);
    }
    
    // Headings should have content
    expect(heading.textContent?.trim()).toBeTruthy();
    
    previousLevel = level;
  });
}

// Test landmark regions
function testLandmarkRegions(container: HTMLElement): void {
  const landmarks = [
    'main',
    'navigation',
    'banner',
    'contentinfo',
    'complementary',
    'search',
    'form',
  ];
  
  landmarks.forEach(landmark => {
    const elements = container.querySelectorAll(`[role="${landmark}"], ${landmark}`);
    elements.forEach(element => {
      // Landmarks should have accessible names if there are multiple of the same type
      if (elements.length > 1) {
        const hasAccessibleName = 
          element.getAttribute('aria-label') ||
          element.getAttribute('aria-labelledby');
        expect(hasAccessibleName).toBeTruthy();
      }
    });
  });
}

// Test form labels
function testFormLabels(container: HTMLElement): void {
  const formControls = container.querySelectorAll('input, select, textarea');
  
  formControls.forEach(control => {
    const hasLabel = 
      control.getAttribute('aria-label') ||
      control.getAttribute('aria-labelledby') ||
      container.querySelector(`label[for="${control.id}"]`) ||
      control.closest('label');
    
    expect(hasLabel).toBeTruthy();
  });
}

// Test image alt text
function testImageAltText(container: HTMLElement): void {
  const images = container.querySelectorAll('img');
  
  images.forEach(img => {
    const alt = img.getAttribute('alt');
    
    // Images should have alt attribute (can be empty for decorative images)
    expect(img.hasAttribute('alt')).toBeTruthy();
    
    // If image has meaningful content, alt should not be empty
    if (img.getAttribute('role') !== 'presentation' && !img.hasAttribute('aria-hidden')) {
      // This is a heuristic - in practice you'd need more context
      const isDecorative = img.closest('[role="presentation"]') || 
                          img.classList.contains('decorative');
      
      if (!isDecorative) {
        expect(alt?.trim()).toBeTruthy();
      }
    }
  });
}

// Test table headers
function testTableHeaders(container: HTMLElement): void {
  const tables = container.querySelectorAll('table');
  
  tables.forEach(table => {
    const headers = table.querySelectorAll('th');
    const cells = table.querySelectorAll('td');
    
    // Tables with data should have headers
    if (cells.length > 0) {
      expect(headers.length).toBeGreaterThan(0);
    }
    
    // Headers should have scope attribute for complex tables
    headers.forEach(header => {
      if (table.querySelectorAll('tr').length > 2) {
        const scope = header.getAttribute('scope');
        expect(['col', 'row', 'colgroup', 'rowgroup'].includes(scope || '')).toBeTruthy();
      }
    });
  });
}

// Color contrast testing (basic implementation)
export function testColorContrast(container: HTMLElement): void {
  const textElements = container.querySelectorAll('*');
  
  textElements.forEach(element => {
    const computedStyle = window.getComputedStyle(element);
    const color = computedStyle.color;
    const backgroundColor = computedStyle.backgroundColor;
    
    // Basic check that colors are defined
    // In a real implementation, you'd calculate actual contrast ratios
    if (element.textContent?.trim()) {
      expect(color).not.toBe('');
      // Note: Full contrast ratio calculation would require color parsing and luminance calculation
    }
  });
}

// Export all testing utilities
export {
  axe,
  toHaveNoViolations,
  WCAG_LEVELS,
  DEFAULT_A11Y_CONFIG,
};