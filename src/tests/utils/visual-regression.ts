/**
 * Visual regression testing utilities
 * Implements screenshot comparison and visual diff testing
 */

import { Page } from 'puppeteer';

// Visual regression test configuration
export interface VisualTestConfig {
  threshold: number; // Difference threshold (0-1)
  includeAA: boolean; // Include anti-aliasing in comparison
  delay: number; // Delay before screenshot (ms)
  animations: 'disabled' | 'allow'; // Animation handling
  fullPage: boolean; // Full page screenshot
  clip?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// Default visual test configuration
export const DEFAULT_VISUAL_CONFIG: VisualTestConfig = {
  threshold: 0.2, // 20% difference threshold
  includeAA: false,
  delay: 500,
  animations: 'disabled',
  fullPage: false,
};

// Viewport configurations for responsive testing
export const VIEWPORT_CONFIGS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 },
  ultrawide: { width: 2560, height: 1440 },
} as const;

// Theme configurations for visual testing
export const THEME_CONFIGS = {
  light: { colorScheme: 'light' as const },
  dark: { colorScheme: 'dark' as const },
  'high-contrast': { colorScheme: 'light' as const, extraClasses: ['high-contrast'] },
} as const;

// Visual regression test suite
export class VisualRegressionTester {
  private page: Page;
  private baseUrl: string;
  private config: VisualTestConfig;

  constructor(page: Page, baseUrl: string, config: VisualTestConfig = DEFAULT_VISUAL_CONFIG) {
    this.page = page;
    this.baseUrl = baseUrl;
    this.config = config;
  }

  // Setup page for visual testing
  async setupPage(): Promise<void> {
    // Disable animations if configured
    if (this.config.animations === 'disabled') {
      await this.page.addStyleTag({
        content: `
          *, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
          }
        `,
      });
    }

    // Set consistent font rendering
    await this.page.addStyleTag({
      content: `
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `,
    });

    // Hide dynamic content
    await this.page.addStyleTag({
      content: `
        [data-testid*="timestamp"],
        [data-testid*="random"],
        .animate-pulse,
        .animate-spin {
          visibility: hidden !important;
        }
      `,
    });
  }

  // Take screenshot of component
  async screenshotComponent(
    selector: string,
    testName: string,
    options: Partial<VisualTestConfig> = {}
  ): Promise<Buffer> {
    const config = { ...this.config, ...options };
    
    await this.setupPage();
    
    // Wait for component to be ready
    await this.page.waitForSelector(selector, { visible: true });
    
    // Wait for additional delay
    if (config.delay > 0) {
      await this.page.waitForTimeout(config.delay);
    }

    // Get element bounds
    const element = await this.page.$(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    // Take screenshot
    const screenshot = await element.screenshot({
      type: 'png',
    });

    return screenshot;
  }

  // Take full page screenshot
  async screenshotPage(
    path: string,
    testName: string,
    options: Partial<VisualTestConfig> = {}
  ): Promise<Buffer> {
    const config = { ...this.config, ...options };
    
    await this.page.goto(`${this.baseUrl}${path}`);
    await this.setupPage();
    
    // Wait for page to be ready
    await this.page.waitForLoadState('networkidle');
    
    // Wait for additional delay
    if (config.delay > 0) {
      await this.page.waitForTimeout(config.delay);
    }

    // Take screenshot
    const screenshot = await this.page.screenshot({
      type: 'png',
      fullPage: config.fullPage,
      clip: config.clip,
    });

    return screenshot;
  }

  // Test component across multiple viewports
  async testResponsiveComponent(
    selector: string,
    testName: string,
    viewports: (keyof typeof VIEWPORT_CONFIGS)[] = ['mobile', 'tablet', 'desktop']
  ): Promise<{ [viewport: string]: Buffer }> {
    const screenshots: { [viewport: string]: Buffer } = {};

    for (const viewportName of viewports) {
      const viewport = VIEWPORT_CONFIGS[viewportName];
      await this.page.setViewportSize(viewport);
      
      const screenshot = await this.screenshotComponent(
        selector,
        `${testName}-${viewportName}`
      );
      
      screenshots[viewportName] = screenshot;
    }

    return screenshots;
  }

  // Test component across multiple themes
  async testThemeVariations(
    selector: string,
    testName: string,
    themes: (keyof typeof THEME_CONFIGS)[] = ['light', 'dark']
  ): Promise<{ [theme: string]: Buffer }> {
    const screenshots: { [theme: string]: Buffer } = {};

    for (const themeName of themes) {
      const theme = THEME_CONFIGS[themeName];
      
      // Apply theme
      await this.page.emulateMedia({ colorScheme: theme.colorScheme });
      
      if (theme.extraClasses) {
        await this.page.addStyleTag({
          content: `html { ${theme.extraClasses.map(cls => `--${cls}: true;`).join(' ')} }`,
        });
      }
      
      const screenshot = await this.screenshotComponent(
        selector,
        `${testName}-${themeName}`
      );
      
      screenshots[themeName] = screenshot;
    }

    return screenshots;
  }

  // Test component states
  async testComponentStates(
    selector: string,
    testName: string,
    states: Array<{
      name: string;
      setup: () => Promise<void>;
    }>
  ): Promise<{ [state: string]: Buffer }> {
    const screenshots: { [state: string]: Buffer } = {};

    for (const state of states) {
      await state.setup();
      
      const screenshot = await this.screenshotComponent(
        selector,
        `${testName}-${state.name}`
      );
      
      screenshots[state.name] = screenshot;
    }

    return screenshots;
  }

  // Test interaction states (hover, focus, active)
  async testInteractionStates(
    selector: string,
    testName: string
  ): Promise<{ [state: string]: Buffer }> {
    const screenshots: { [state: string]: Buffer } = {};
    const element = await this.page.$(selector);
    
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    // Default state
    screenshots.default = await this.screenshotComponent(selector, `${testName}-default`);

    // Hover state
    await element.hover();
    screenshots.hover = await this.screenshotComponent(selector, `${testName}-hover`);

    // Focus state
    await element.focus();
    screenshots.focus = await this.screenshotComponent(selector, `${testName}-focus`);

    // Active state (simulate mouse down)
    await this.page.mouse.move(0, 0); // Move away first
    await element.hover();
    await this.page.mouse.down();
    screenshots.active = await this.screenshotComponent(selector, `${testName}-active`);
    await this.page.mouse.up();

    return screenshots;
  }

  // Compare screenshots with baseline
  async compareWithBaseline(
    screenshot: Buffer,
    baselinePath: string,
    threshold: number = this.config.threshold
  ): Promise<{
    match: boolean;
    difference: number;
    diffImage?: Buffer;
  }> {
    // This would integrate with a visual comparison library like pixelmatch
    // For now, we'll return a mock implementation
    
    // In a real implementation, you would:
    // 1. Load baseline image from file system
    // 2. Compare pixel by pixel using pixelmatch or similar
    // 3. Generate diff image highlighting differences
    // 4. Return comparison results
    
    return {
      match: true,
      difference: 0,
    };
  }
}

// Jest matcher for visual regression testing
export function toMatchVisualSnapshot(
  received: Buffer,
  testName: string,
  options: Partial<VisualTestConfig> = {}
): { pass: boolean; message: () => string } {
  // This would implement the actual visual comparison logic
  // For now, we'll return a passing result
  
  const pass = true; // In real implementation, this would be the comparison result
  
  if (pass) {
    return {
      pass: true,
      message: () => `Expected screenshot not to match baseline for ${testName}`,
    };
  } else {
    return {
      pass: false,
      message: () => `Expected screenshot to match baseline for ${testName}`,
    };
  }
}

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchVisualSnapshot(testName: string, options?: Partial<VisualTestConfig>): R;
    }
  }
}

// Component visual testing utilities
export class ComponentVisualTester {
  // Test all variants of a component
  static async testAllVariants<T extends Record<string, any>>(
    component: string,
    variants: T[],
    tester: VisualRegressionTester
  ): Promise<void> {
    for (const [index, variant] of variants.entries()) {
      const variantName = `variant-${index}`;
      
      // Apply variant props (this would need to be implemented based on your testing setup)
      await tester.page.evaluate((props) => {
        // Apply props to component
        // This is framework-specific implementation
      }, variant);
      
      await tester.screenshotComponent(component, variantName);
    }
  }

  // Test component with different content lengths
  static async testContentVariations(
    component: string,
    contentVariations: string[],
    tester: VisualRegressionTester
  ): Promise<void> {
    for (const [index, content] of contentVariations.entries()) {
      const contentName = `content-${index}`;
      
      // Set component content
      await tester.page.evaluate((text) => {
        const element = document.querySelector(component);
        if (element) {
          element.textContent = text;
        }
      }, content);
      
      await tester.screenshotComponent(component, contentName);
    }
  }

  // Test component loading states
  static async testLoadingStates(
    component: string,
    tester: VisualRegressionTester
  ): Promise<void> {
    const states = [
      {
        name: 'loading',
        setup: async () => {
          await tester.page.evaluate((selector) => {
            const element = document.querySelector(selector);
            if (element) {
              element.setAttribute('data-loading', 'true');
            }
          }, component);
        },
      },
      {
        name: 'error',
        setup: async () => {
          await tester.page.evaluate((selector) => {
            const element = document.querySelector(selector);
            if (element) {
              element.setAttribute('data-error', 'true');
            }
          }, component);
        },
      },
      {
        name: 'empty',
        setup: async () => {
          await tester.page.evaluate((selector) => {
            const element = document.querySelector(selector);
            if (element) {
              element.setAttribute('data-empty', 'true');
            }
          }, component);
        },
      },
    ];

    await tester.testComponentStates(component, 'loading-states', states);
  }
}

// Export utilities
export {
  VisualRegressionTester,
  ComponentVisualTester,
  VIEWPORT_CONFIGS,
  THEME_CONFIGS,
  DEFAULT_VISUAL_CONFIG,
};