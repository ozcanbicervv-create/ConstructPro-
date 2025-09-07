/**
 * Comprehensive test suite for Button component
 * Tests functionality, accessibility, performance, and visual regression
 */

import { screen, waitFor } from '@testing-library/react';
import { Loader2, Plus } from 'lucide-react';
import React from 'react';

import { 
  renderWithProviders, 
  testAccessibility, 
  testKeyboardNavigation,
  testComponentPerformance,
  testVisualRegression,
  testComponentStates
} from '@/tests/utils/test-utils';

import { Button } from '../button';


describe('Button Component', () => {
  // Basic functionality tests
  describe('Basic Functionality', () => {
    it('renders with default props', () => {
      renderWithProviders(<Button>Click me</Button>);
      
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('handles click events', async () => {
      const handleClick = jest.fn();
      const { user } = renderWithProviders(
        <Button onClick={handleClick}>Click me</Button>
      );
      
      const button = screen.getByRole('button', { name: /click me/i });
      await user.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('is disabled when disabled prop is true', () => {
      renderWithProviders(<Button disabled>Disabled</Button>);
      
      const button = screen.getByRole('button', { name: /disabled/i });
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('shows loading state correctly', () => {
      renderWithProviders(
        <Button loading>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Loading');
    });
  });

  // Variant tests
  describe('Variants', () => {
    const variants = [
      { variant: 'default' as const, expectedClasses: ['bg-primary'] },
      { variant: 'destructive' as const, expectedClasses: ['bg-destructive'] },
      { variant: 'outline' as const, expectedClasses: ['border', 'border-input'] },
      { variant: 'secondary' as const, expectedClasses: ['bg-secondary'] },
      { variant: 'ghost' as const, expectedClasses: ['hover:bg-accent'] },
      { variant: 'link' as const, expectedClasses: ['text-primary'] },
    ];

    variants.forEach(({ variant, expectedClasses }) => {
      it(`renders ${variant} variant correctly`, () => {
        renderWithProviders(<Button variant={variant}>Button</Button>);
        
        const button = screen.getByRole('button');
        expectedClasses.forEach(className => {
          expect(button).toHaveClass(className);
        });
      });
    });
  });

  // Size tests
  describe('Sizes', () => {
    const sizes = [
      { size: 'default' as const, expectedClasses: ['h-10', 'px-4', 'py-2'] },
      { size: 'sm' as const, expectedClasses: ['h-9', 'px-3'] },
      { size: 'lg' as const, expectedClasses: ['h-11', 'px-8'] },
      { size: 'icon' as const, expectedClasses: ['h-10', 'w-10'] },
    ];

    sizes.forEach(({ size, expectedClasses }) => {
      it(`renders ${size} size correctly`, () => {
        renderWithProviders(<Button size={size}>Button</Button>);
        
        const button = screen.getByRole('button');
        expectedClasses.forEach(className => {
          expect(button).toHaveClass(className);
        });
      });
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('meets WCAG accessibility guidelines', async () => {
      const { container } = renderWithProviders(<Button>Accessible Button</Button>);
      await testAccessibility(container);
    });

    it('supports keyboard navigation', async () => {
      const { container, user } = renderWithProviders(
        <div>
          <Button>First</Button>
          <Button>Second</Button>
          <Button>Third</Button>
        </div>
      );
      
      await testKeyboardNavigation(container, user);
    });

    it('has proper ARIA attributes when disabled', () => {
      renderWithProviders(<Button disabled>Disabled Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toBeDisabled();
    });

    it('has proper ARIA attributes when loading', () => {
      renderWithProviders(<Button loading>Loading Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toBeDisabled();
    });

    it('supports custom ARIA labels', () => {
      renderWithProviders(
        <Button aria-label="Custom label">
          <Plus />
        </Button>
      );
      
      const button = screen.getByRole('button', { name: /custom label/i });
      expect(button).toBeInTheDocument();
    });
  });

  // Performance tests
  describe('Performance', () => {
    it('renders within performance budget', async () => {
      const component = <Button>Performance Test</Button>;
      
      const { averageRenderTime } = await testComponentPerformance(component, {
        maxRenderTime: 50, // 50ms max render time
        iterations: 5,
      });
      
      expect(averageRenderTime).toBeLessThan(50);
    });

    it('handles rapid clicks without performance degradation', async () => {
      const handleClick = jest.fn();
      const { user } = renderWithProviders(
        <Button onClick={handleClick}>Rapid Click Test</Button>
      );
      
      const button = screen.getByRole('button');
      const startTime = performance.now();
      
      // Simulate rapid clicks
      for (let i = 0; i < 10; i++) {
        await user.click(button);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(handleClick).toHaveBeenCalledTimes(10);
      expect(totalTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  // Visual regression tests
  describe('Visual Regression', () => {
    it('matches snapshot for default variant', () => {
      const { container } = renderWithProviders(<Button>Default Button</Button>);
      testVisualRegression(container, 'button-default');
    });

    it('matches snapshot for all variants', () => {
      const { container } = renderWithProviders(
        <div>
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      );
      testVisualRegression(container, 'button-all-variants');
    });

    it('matches snapshot for disabled state', () => {
      const { container } = renderWithProviders(<Button disabled>Disabled</Button>);
      testVisualRegression(container, 'button-disabled');
    });

    it('matches snapshot for loading state', () => {
      const { container } = renderWithProviders(
        <Button loading>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading
        </Button>
      );
      testVisualRegression(container, 'button-loading');
    });
  });

  // Integration tests
  describe('Integration', () => {
    it('works with form submission', async () => {
      const handleSubmit = jest.fn(e => e.preventDefault());
      const { user } = renderWithProviders(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit</Button>
        </form>
      );
      
      const button = screen.getByRole('button', { name: /submit/i });
      await user.click(button);
      
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('works as a link when asChild is used', () => {
      renderWithProviders(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );
      
      const link = screen.getByRole('link', { name: /link button/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });
  });

  // Component state testing
  describe('Component States', () => {
    it('handles all component states correctly', async () => {
      const states = [
        {
          name: 'default',
          props: {},
          assertions: (container: HTMLElement) => {
            const button = container.querySelector('button');
            expect(button).toHaveClass('bg-primary');
          },
        },
        {
          name: 'disabled',
          props: { disabled: true },
          assertions: (container: HTMLElement) => {
            const button = container.querySelector('button');
            expect(button).toBeDisabled();
          },
        },
        {
          name: 'loading',
          props: { loading: true },
          assertions: (container: HTMLElement) => {
            const button = container.querySelector('button');
            expect(button).toBeDisabled();
          },
        },
      ];

      await testComponentStates(<Button>Test</Button>, states);
    });
  });

  // Error handling tests
  describe('Error Handling', () => {
    it('handles missing children gracefully', () => {
      renderWithProviders(<Button />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('handles invalid variant gracefully', () => {
      // @ts-expect-error Testing invalid prop
      renderWithProviders(<Button variant="invalid">Invalid</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  // Custom props tests
  describe('Custom Props', () => {
    it('forwards custom props to button element', () => {
      renderWithProviders(
        <Button data-testid="custom-button" title="Custom title">
          Custom
        </Button>
      );
      
      const button = screen.getByTestId('custom-button');
      expect(button).toHaveAttribute('title', 'Custom title');
    });

    it('applies custom className', () => {
      renderWithProviders(<Button className="custom-class">Custom</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });
});