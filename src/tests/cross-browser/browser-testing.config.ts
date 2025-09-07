/**
 * Cross-browser testing configuration
 * Supports automated testing across different browsers and devices
 */

export interface BrowserConfig {
  name: string;
  version?: string;
  platform: string;
  viewport: {
    width: number;
    height: number;
  };
  userAgent?: string;
}

export const BROWSER_CONFIGS: BrowserConfig[] = [
  // Desktop Browsers
  {
    name: 'Chrome',
    version: 'latest',
    platform: 'Windows',
    viewport: { width: 1920, height: 1080 }
  },
  {
    name: 'Firefox',
    version: 'latest',
    platform: 'Windows',
    viewport: { width: 1920, height: 1080 }
  },
  {
    name: 'Safari',
    version: 'latest',
    platform: 'macOS',
    viewport: { width: 1920, height: 1080 }
  },
  {
    name: 'Edge',
    version: 'latest',
    platform: 'Windows',
    viewport: { width: 1920, height: 1080 }
  },
  
  // Mobile Browsers
  {
    name: 'Chrome Mobile',
    platform: 'Android',
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36'
  },
  {
    name: 'Safari Mobile',
    platform: 'iOS',
    viewport: { width: 375, height: 812 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
  },
  
  // Tablet Browsers
  {
    name: 'Chrome Tablet',
    platform: 'Android',
    viewport: { width: 768, height: 1024 }
  },
  {
    name: 'Safari Tablet',
    platform: 'iOS',
    viewport: { width: 768, height: 1024 }
  }
];

export const RESPONSIVE_BREAKPOINTS = {
  mobile: { width: 375, height: 667 },
  mobileLarge: { width: 414, height: 896 },
  tablet: { width: 768, height: 1024 },
  tabletLarge: { width: 1024, height: 768 },
  desktop: { width: 1280, height: 720 },
  desktopLarge: { width: 1920, height: 1080 },
  ultrawide: { width: 2560, height: 1440 }
};

export interface TestScenario {
  name: string;
  url: string;
  actions?: Array<{
    type: 'click' | 'scroll' | 'input' | 'hover' | 'wait';
    selector?: string;
    value?: string;
    duration?: number;
  }>;
  assertions: Array<{
    type: 'element' | 'text' | 'style' | 'performance';
    selector?: string;
    expected: any;
  }>;
}

export const CRITICAL_USER_JOURNEYS: TestScenario[] = [
  {
    name: 'Dashboard Load and Navigation',
    url: '/',
    actions: [
      { type: 'wait', duration: 2000 },
      { type: 'click', selector: '[data-testid="projects-nav"]' },
      { type: 'wait', duration: 1000 }
    ],
    assertions: [
      { type: 'element', selector: '[data-testid="dashboard-header"]', expected: 'visible' },
      { type: 'performance', expected: { lcp: 2500, fid: 100, cls: 0.1 } }
    ]
  },
  {
    name: 'Project Creation Flow',
    url: '/projects',
    actions: [
      { type: 'click', selector: '[data-testid="create-project-btn"]' },
      { type: 'input', selector: '[data-testid="project-name"]', value: 'Test Project' },
      { type: 'click', selector: '[data-testid="submit-project"]' }
    ],
    assertions: [
      { type: 'element', selector: '[data-testid="project-form"]', expected: 'visible' },
      { type: 'text', selector: '[data-testid="success-message"]', expected: 'Project created' }
    ]
  },
  {
    name: 'Material Comparison',
    url: '/materials',
    actions: [
      { type: 'click', selector: '[data-testid="compare-materials"]' },
      { type: 'scroll', selector: '[data-testid="comparison-table"]' }
    ],
    assertions: [
      { type: 'element', selector: '[data-testid="comparison-table"]', expected: 'visible' },
      { type: 'style', selector: '[data-testid="table-header"]', expected: { position: 'sticky' } }
    ]
  }
];