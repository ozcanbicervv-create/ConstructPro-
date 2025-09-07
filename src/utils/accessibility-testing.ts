/**
 * Accessibility Testing Utilities
 * Tools for testing and validating accessibility compliance
 */

export interface AccessibilityViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    target: string[];
    html: string;
    failureSummary: string;
  }>;
}

export interface AccessibilityTestResult {
  violations: AccessibilityViolation[];
  passes: Array<{ id: string; description: string }>;
  incomplete: Array<{ id: string; description: string }>;
  timestamp: string;
  url: string;
}

export class AccessibilityTester {
  private static instance: AccessibilityTester;
  
  public static getInstance(): AccessibilityTester {
    if (!AccessibilityTester.instance) {
      AccessibilityTester.instance = new AccessibilityTester();
    }
    return AccessibilityTester.instance;
  }

  /**
   * Test an element for accessibility violations
   */
  public async testElement(element: HTMLElement): Promise<AccessibilityTestResult> {
    const violations: AccessibilityViolation[] = [];
    const passes: Array<{ id: string; description: string }> = [];
    
    // Test for missing alt text
    const altTextResult = this.testAltText(element);
    if (altTextResult.violations.length > 0) {
      violations.push(...altTextResult.violations);
    } else {
      passes.push(altTextResult.pass);
    }

    // Test for proper heading hierarchy
    const headingResult = this.testHeadingHierarchy(element);
    if (headingResult.violations.length > 0) {
      violations.push(...headingResult.violations);
    } else {
      passes.push(headingResult.pass);
    }

    // Test for form labels
    const labelResult = this.testFormLabels(element);
    if (labelResult.violations.length > 0) {
      violations.push(...labelResult.violations);
    } else {
      passes.push(labelResult.pass);
    }

    // Test for color contrast
    const contrastResult = await this.testColorContrast(element);
    if (contrastResult.violations.length > 0) {
      violations.push(...contrastResult.violations);
    } else {
      passes.push(contrastResult.pass);
    }

    // Test for keyboard accessibility
    const keyboardResult = this.testKeyboardAccessibility(element);
    if (keyboardResult.violations.length > 0) {
      violations.push(...keyboardResult.violations);
    } else {
      passes.push(keyboardResult.pass);
    }

    // Test for ARIA attributes
    const ariaResult = this.testAriaAttributes(element);
    if (ariaResult.violations.length > 0) {
      violations.push(...ariaResult.violations);
    } else {
      passes.push(ariaResult.pass);
    }

    return {
      violations,
      passes,
      incomplete: [],
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };
  }

  /**
   * Test for missing alt text on images
   */
  private testAltText(element: HTMLElement) {
    const violations: AccessibilityViolation[] = [];
    const images = element.querySelectorAll('img');
    
    images.forEach((img, index) => {
      const hasAlt = img.hasAttribute('alt');
      const hasAriaLabel = img.hasAttribute('aria-label');
      const hasAriaLabelledby = img.hasAttribute('aria-labelledby');
      const isDecorative = img.getAttribute('role') === 'presentation' || img.getAttribute('alt') === '';
      
      if (!hasAlt && !hasAriaLabel && !hasAriaLabelledby && !isDecorative) {
        violations.push({
          id: 'image-alt',
          impact: 'critical',
          description: 'Images must have alternate text',
          help: 'All img elements must have an alt attribute',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/image-alt',
          nodes: [{
            target: [`img:nth-child(${index + 1})`],
            html: img.outerHTML,
            failureSummary: 'Fix this: Element does not have an alt attribute'
          }]
        });
      }
    });

    return {
      violations,
      pass: { id: 'image-alt', description: 'Images have alternate text' }
    };
  }

  /**
   * Test for proper heading hierarchy
   */
  private testHeadingHierarchy(element: HTMLElement) {
    const violations: AccessibilityViolation[] = [];
    const headings = Array.from(element.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    
    let lastLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      
      if (level > lastLevel + 1) {
        violations.push({
          id: 'heading-order',
          impact: 'moderate',
          description: 'Heading levels should only increase by one',
          help: 'Headings should not skip levels',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/heading-order',
          nodes: [{
            target: [`${heading.tagName.toLowerCase()}:nth-child(${index + 1})`],
            html: heading.outerHTML,
            failureSummary: `Fix this: Heading level ${level} follows heading level ${lastLevel}`
          }]
        });
      }
      
      lastLevel = level;
    });

    return {
      violations,
      pass: { id: 'heading-order', description: 'Heading levels are properly ordered' }
    };
  }

  /**
   * Test for form labels
   */
  private testFormLabels(element: HTMLElement) {
    const violations: AccessibilityViolation[] = [];
    const formControls = element.querySelectorAll('input:not([type="hidden"]), select, textarea');
    
    formControls.forEach((control, index) => {
      const hasLabel = this.hasLabel(control as HTMLElement);
      
      if (!hasLabel) {
        violations.push({
          id: 'label',
          impact: 'critical',
          description: 'Form elements must have labels',
          help: 'All form elements should have a programmatically associated label',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/label',
          nodes: [{
            target: [`${control.tagName.toLowerCase()}:nth-child(${index + 1})`],
            html: control.outerHTML,
            failureSummary: 'Fix this: Form element does not have an associated label'
          }]
        });
      }
    });

    return {
      violations,
      pass: { id: 'label', description: 'Form elements have associated labels' }
    };
  }

  /**
   * Test for color contrast
   */
  private async testColorContrast(element: HTMLElement): Promise<{
    violations: AccessibilityViolation[];
    pass: { id: string; description: string };
  }> {
    const violations: AccessibilityViolation[] = [];
    const textElements = element.querySelectorAll('*');
    
    for (const el of Array.from(textElements)) {
      const htmlEl = el as HTMLElement;
      const text = htmlEl.textContent?.trim();
      
      if (text && text.length > 0) {
        const styles = window.getComputedStyle(htmlEl);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        if (color && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
          const contrastRatio = this.calculateContrastRatio(color, backgroundColor);
          const fontSize = parseFloat(styles.fontSize);
          const fontWeight = styles.fontWeight;
          
          const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
          const requiredRatio = isLargeText ? 3 : 4.5;
          
          if (contrastRatio < requiredRatio) {
            violations.push({
              id: 'color-contrast',
              impact: 'serious',
              description: 'Elements must have sufficient color contrast',
              help: `Contrast ratio should be at least ${requiredRatio}:1`,
              helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/color-contrast',
              nodes: [{
                target: [this.getSelector(htmlEl)],
                html: htmlEl.outerHTML,
                failureSummary: `Fix this: Element has insufficient color contrast of ${contrastRatio.toFixed(2)}:1`
              }]
            });
          }
        }
      }
    }

    return {
      violations,
      pass: { id: 'color-contrast', description: 'Elements have sufficient color contrast' }
    };
  }

  /**
   * Test for keyboard accessibility
   */
  private testKeyboardAccessibility(element: HTMLElement) {
    const violations: AccessibilityViolation[] = [];
    const interactiveElements = element.querySelectorAll('button, a, input, select, textarea, [tabindex]');
    
    interactiveElements.forEach((el, index) => {
      const htmlEl = el as HTMLElement;
      const tabIndex = htmlEl.tabIndex;
      const isHidden = htmlEl.style.display === 'none' || htmlEl.hidden;
      
      // Check for positive tabindex (anti-pattern)
      if (tabIndex > 0) {
        violations.push({
          id: 'tabindex',
          impact: 'serious',
          description: 'Elements should not use positive tabindex values',
          help: 'Avoid positive tabindex values',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/tabindex',
          nodes: [{
            target: [this.getSelector(htmlEl)],
            html: htmlEl.outerHTML,
            failureSummary: `Fix this: Element has tabindex greater than 0`
          }]
        });
      }
      
      // Check for focusable elements that are hidden
      if (!isHidden && tabIndex === -1 && (htmlEl.tagName === 'BUTTON' || htmlEl.tagName === 'A')) {
        violations.push({
          id: 'focusable-content',
          impact: 'serious',
          description: 'Interactive elements should be focusable',
          help: 'Interactive elements should not have tabindex="-1"',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/focusable-content',
          nodes: [{
            target: [this.getSelector(htmlEl)],
            html: htmlEl.outerHTML,
            failureSummary: 'Fix this: Interactive element is not focusable'
          }]
        });
      }
    });

    return {
      violations,
      pass: { id: 'keyboard-accessibility', description: 'Elements are keyboard accessible' }
    };
  }

  /**
   * Test for ARIA attributes
   */
  private testAriaAttributes(element: HTMLElement) {
    const violations: AccessibilityViolation[] = [];
    const elementsWithAria = element.querySelectorAll('[aria-labelledby], [aria-describedby]');
    
    elementsWithAria.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const labelledBy = htmlEl.getAttribute('aria-labelledby');
      const describedBy = htmlEl.getAttribute('aria-describedby');
      
      // Check if referenced elements exist
      if (labelledBy) {
        const referencedElements = labelledBy.split(' ').every(id => document.getElementById(id));
        if (!referencedElements) {
          violations.push({
            id: 'aria-valid-attr-value',
            impact: 'critical',
            description: 'ARIA attributes must reference valid elements',
            help: 'aria-labelledby must reference existing elements',
            helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/aria-valid-attr-value',
            nodes: [{
              target: [this.getSelector(htmlEl)],
              html: htmlEl.outerHTML,
              failureSummary: 'Fix this: aria-labelledby references non-existent elements'
            }]
          });
        }
      }
      
      if (describedBy) {
        const referencedElements = describedBy.split(' ').every(id => document.getElementById(id));
        if (!referencedElements) {
          violations.push({
            id: 'aria-valid-attr-value',
            impact: 'critical',
            description: 'ARIA attributes must reference valid elements',
            help: 'aria-describedby must reference existing elements',
            helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/aria-valid-attr-value',
            nodes: [{
              target: [this.getSelector(htmlEl)],
              html: htmlEl.outerHTML,
              failureSummary: 'Fix this: aria-describedby references non-existent elements'
            }]
          });
        }
      }
    });

    return {
      violations,
      pass: { id: 'aria-attributes', description: 'ARIA attributes are valid' }
    };
  }

  /**
   * Check if an element has a proper label
   */
  private hasLabel(element: HTMLElement): boolean {
    // Check for aria-label
    if (element.hasAttribute('aria-label')) return true;
    
    // Check for aria-labelledby
    if (element.hasAttribute('aria-labelledby')) return true;
    
    // Check for associated label element
    const id = element.id;
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) return true;
    }
    
    // Check if wrapped in label
    const parentLabel = element.closest('label');
    if (parentLabel) return true;
    
    // Check for title attribute (not ideal but acceptable)
    if (element.hasAttribute('title')) return true;
    
    return false;
  }

  /**
   * Calculate color contrast ratio
   */
  private calculateContrastRatio(color1: string, color2: string): number {
    const getLuminance = (color: string): number => {
      const rgb = this.parseColor(color);
      const sRGB = rgb.map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    };

    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Parse color string to RGB values
   */
  private parseColor(color: string): number[] {
    const div = document.createElement('div');
    div.style.color = color;
    document.body.appendChild(div);
    const computedColor = window.getComputedStyle(div).color;
    document.body.removeChild(div);

    const match = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
    }
    return [0, 0, 0];
  }

  /**
   * Generate CSS selector for an element
   */
  private getSelector(element: HTMLElement): string {
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.className) {
      return `.${element.className.split(' ').join('.')}`;
    }
    
    return element.tagName.toLowerCase();
  }

  /**
   * Generate accessibility report
   */
  public generateReport(results: AccessibilityTestResult): string {
    let report = `# Accessibility Test Report\n\n`;
    report += `**Timestamp:** ${results.timestamp}\n`;
    report += `**URL:** ${results.url}\n\n`;

    if (results.violations.length === 0) {
      report += `✅ **No accessibility violations found!**\n\n`;
    } else {
      report += `❌ **${results.violations.length} accessibility violation(s) found:**\n\n`;
      
      results.violations.forEach((violation, index) => {
        report += `## ${index + 1}. ${violation.description}\n\n`;
        report += `**Impact:** ${violation.impact}\n`;
        report += `**Help:** ${violation.help}\n`;
        report += `**Learn more:** ${violation.helpUrl}\n\n`;
        
        violation.nodes.forEach((node, nodeIndex) => {
          report += `### Element ${nodeIndex + 1}\n`;
          report += `**Target:** ${node.target.join(', ')}\n`;
          report += `**Issue:** ${node.failureSummary}\n`;
          report += `**HTML:** \`${node.html}\`\n\n`;
        });
      });
    }

    if (results.passes.length > 0) {
      report += `## ✅ Passed Tests\n\n`;
      results.passes.forEach(pass => {
        report += `- ${pass.description}\n`;
      });
    }

    return report;
  }
}

// Export singleton instance
export const accessibilityTester = AccessibilityTester.getInstance();

// React hook for accessibility testing
export function useAccessibilityTesting() {
  const [isTestingEnabled, setIsTestingEnabled] = React.useState(false);
  const [testResults, setTestResults] = React.useState<AccessibilityTestResult | null>(null);

  const testElement = React.useCallback(async (element: HTMLElement) => {
    if (!isTestingEnabled) return;
    
    const results = await accessibilityTester.testElement(element);
    setTestResults(results);
    
    // Log violations to console in development
    if (process.env.NODE_ENV === 'development' && results.violations.length > 0) {
      console.group('🚨 Accessibility Violations');
      results.violations.forEach(violation => {
        console.error(`${violation.description} (${violation.impact})`, violation);
      });
      console.groupEnd();
    }
    
    return results;
  }, [isTestingEnabled]);

  const enableTesting = React.useCallback(() => {
    setIsTestingEnabled(true);
  }, []);

  const disableTesting = React.useCallback(() => {
    setIsTestingEnabled(false);
    setTestResults(null);
  }, []);

  return {
    isTestingEnabled,
    testResults,
    testElement,
    enableTesting,
    disableTesting,
    generateReport: (results: AccessibilityTestResult) => accessibilityTester.generateReport(results),
  };
}

// Import React for hooks
import React from 'react';