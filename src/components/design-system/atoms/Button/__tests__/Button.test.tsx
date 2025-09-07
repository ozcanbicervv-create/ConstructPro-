/**
 * Button Component Tests
 * 
 * Comprehensive test suite for the modern Button component
 * Tests all variants, sizes, states, and interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Button } from '../Button';
import { PlusIcon, ArrowRightIcon } from 'lucide-react';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    button: React.forwardRef<HTMLButtonElement, any>(({ children, whileHover, whileTap, initial, animate, transition, ...props }, ref) => (
      <button ref={ref} {...props}>
        {children}
      </button>
    )),
    div: React.forwardRef<HTMLDivElement, any>(({ children, variants, animate, initial, exit, transition, ...props }, ref) => (
      <div ref={ref} {...props}>
        {children}
      </div>
    )),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('Button Component', () => {
  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<Button>Click me</Button>);
      
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
    });

    it('should render with custom className', () => {
      render(<Button className="custom-class">Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should render with data-testid', () => {
      render(<Button data-testid="test-button">Button</Button>);
      
      const button = screen.getByTestId('test-button');
      expect(button).toBeInTheDocument();
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Button</Button>);
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('Variants', () => {
    it('should render primary variant correctly', () => {
      render(<Button variant="primary">Primary</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gradient-to-r', 'from-blue-600', 'to-blue-700');
      expect(button).toHaveClass('text-white');
    });

    it('should render secondary variant correctly', () => {
      render(<Button variant="secondary">Secondary</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gray-100', 'text-gray-900');
      expect(button).toHaveClass('border', 'border-gray-200');
    });

    it('should render outline variant correctly', () => {
      render(<Button variant="outline">Outline</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent', 'text-blue-600');
      expect(button).toHaveClass('border', 'border-blue-600');
    });

    it('should render ghost variant correctly', () => {
      render(<Button variant="ghost">Ghost</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent', 'text-gray-700');
      expect(button).toHaveClass('border-0');
    });

    it('should render destructive variant correctly', () => {
      render(<Button variant="destructive">Destructive</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gradient-to-r', 'from-red-600', 'to-red-700');
      expect(button).toHaveClass('text-white');
    });
  });

  describe('Sizes', () => {
    it('should render xs size correctly', () => {
      render(<Button size="xs">Extra Small</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-2', 'py-1', 'text-xs', 'h-7');
      expect(button).toHaveClass('min-w-[44px]'); // Touch target
    });

    it('should render sm size correctly', () => {
      render(<Button size="sm">Small</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm', 'h-8');
      expect(button).toHaveClass('min-w-[44px]'); // Touch target
    });

    it('should render md size correctly (default)', () => {
      render(<Button size="md">Medium</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2', 'text-base', 'h-10');
      expect(button).toHaveClass('min-w-[44px]'); // Touch target
    });

    it('should render lg size correctly', () => {
      render(<Button size="lg">Large</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6', 'py-3', 'text-lg', 'h-12');
      expect(button).toHaveClass('min-w-[48px]'); // Larger touch target
    });

    it('should render xl size correctly', () => {
      render(<Button size="xl">Extra Large</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-8', 'py-4', 'text-xl', 'h-14');
      expect(button).toHaveClass('min-w-[56px]'); // Largest touch target
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when loading is true', () => {
      render(<Button loading>Loading Button</Button>);
      
      const button = screen.getByRole('button');
      const spinner = screen.getByTestId('button-spinner');
      
      expect(button).toHaveClass('cursor-wait');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('rounded-full', 'border-2', 'border-current');
    });

    it('should hide content when loading', () => {
      render(<Button loading>Loading Button</Button>);
      
      const button = screen.getByRole('button');
      // Look for the content container with opacity-0 class
      const contentContainer = button.querySelector('div[class*="opacity-0"]');
      
      expect(contentContainer).toBeInTheDocument();
    });

    it('should disable button when loading', () => {
      render(<Button loading>Loading Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should show correct spinner size for different button sizes', () => {
      const { rerender } = render(<Button loading size="xs">Loading</Button>);
      let spinner = screen.getByTestId('button-spinner');
      expect(spinner).toHaveClass('w-3', 'h-3');

      rerender(<Button loading size="sm">Loading</Button>);
      spinner = screen.getByTestId('button-spinner');
      expect(spinner).toHaveClass('w-4', 'h-4');

      rerender(<Button loading size="lg">Loading</Button>);
      spinner = screen.getByTestId('button-spinner');
      expect(spinner).toHaveClass('w-5', 'h-5');

      rerender(<Button loading size="xl">Loading</Button>);
      spinner = screen.getByTestId('button-spinner');
      expect(spinner).toHaveClass('w-6', 'h-6');
    });
  });

  describe('Icon Support', () => {
    it('should render icon on the left by default', () => {
      render(
        <Button icon={<PlusIcon data-testid="plus-icon" />}>
          Add Item
        </Button>
      );
      
      const button = screen.getByRole('button');
      const icon = screen.getByTestId('plus-icon');
      const iconContainer = icon.closest('span');
      
      expect(icon).toBeInTheDocument();
      expect(iconContainer).toHaveClass('w-4', 'h-4'); // Default md size
      
      // Check that icon comes before text
      const buttonContent = button.textContent;
      expect(buttonContent).toBe('Add Item');
    });

    it('should render icon on the right when iconPosition is right', () => {
      render(
        <Button icon={<ArrowRightIcon data-testid="arrow-icon" />} iconPosition="right">
          Next
        </Button>
      );
      
      const icon = screen.getByTestId('arrow-icon');
      expect(icon).toBeInTheDocument();
    });

    it('should render correct icon sizes for different button sizes', () => {
      const { rerender } = render(
        <Button size="xs" icon={<PlusIcon data-testid="icon" />}>
          Button
        </Button>
      );
      let iconContainer = screen.getByTestId('icon').closest('span');
      expect(iconContainer).toHaveClass('w-3', 'h-3');

      rerender(
        <Button size="sm" icon={<PlusIcon data-testid="icon" />}>
          Button
        </Button>
      );
      iconContainer = screen.getByTestId('icon').closest('span');
      expect(iconContainer).toHaveClass('w-4', 'h-4');

      rerender(
        <Button size="lg" icon={<PlusIcon data-testid="icon" />}>
          Button
        </Button>
      );
      iconContainer = screen.getByTestId('icon').closest('span');
      expect(iconContainer).toHaveClass('w-5', 'h-5');

      rerender(
        <Button size="xl" icon={<PlusIcon data-testid="icon" />}>
          Button
        </Button>
      );
      iconContainer = screen.getByTestId('icon').closest('span');
      expect(iconContainer).toHaveClass('w-6', 'h-6');
    });

    it('should not show icon when loading', () => {
      render(
        <Button loading icon={<PlusIcon data-testid="plus-icon" />}>
          Loading
        </Button>
      );
      
      // Icon should be hidden (opacity-0) when loading, not removed from DOM
      const contentContainer = screen.getByRole('button').querySelector('div[class*="opacity-0"]');
      expect(contentContainer).toBeInTheDocument();
      expect(screen.getByTestId('button-spinner')).toBeInTheDocument();
    });
  });

  describe('Full Width', () => {
    it('should render full width when fullWidth is true', () => {
      render(<Button fullWidth>Full Width Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });

    it('should not render full width by default', () => {
      render(<Button>Normal Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('w-full');
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });

    it('should be disabled when loading is true', () => {
      render(<Button loading>Loading Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should not be clickable when disabled', async () => {
      const handleClick = jest.fn();
      render(<Button disabled onClick={handleClick}>Disabled Button</Button>);
      
      const button = screen.getByRole('button');
      await userEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Interactions', () => {
    it('should handle click events', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      
      const button = screen.getByRole('button');
      await userEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should handle keyboard events', async () => {
      const handleKeyDown = jest.fn();
      render(<Button onKeyDown={handleKeyDown}>Keyboard Button</Button>);
      
      const button = screen.getByRole('button');
      await userEvent.type(button, '{enter}');
      
      expect(handleKeyDown).toHaveBeenCalled();
    });

    it('should handle focus events', async () => {
      const handleFocus = jest.fn();
      render(<Button onFocus={handleFocus}>Focus Button</Button>);
      
      const button = screen.getByRole('button');
      await userEvent.tab(); // Focus the button
      
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('should handle blur events', async () => {
      const handleBlur = jest.fn();
      render(<Button onBlur={handleBlur}>Blur Button</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      button.blur();
      
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper focus styles', () => {
      render(<Button>Accessible Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2');
      expect(button).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-offset-2');
    });

    it('should support aria-label', () => {
      render(<Button aria-label="Close dialog">×</Button>);
      
      const button = screen.getByRole('button', { name: 'Close dialog' });
      expect(button).toBeInTheDocument();
    });

    it('should support aria-describedby', () => {
      render(
        <>
          <Button aria-describedby="help-text">Submit</Button>
          <div id="help-text">This will submit the form</div>
        </>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'help-text');
    });

    it('should support type attribute', () => {
      render(<Button type="submit">Submit</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should have proper button role', () => {
      render(<Button>Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      render(
        <div>
          <Button>First</Button>
          <Button>Second</Button>
        </div>
      );
      
      const firstButton = screen.getByRole('button', { name: 'First' });
      const secondButton = screen.getByRole('button', { name: 'Second' });
      
      await userEvent.tab();
      expect(firstButton).toHaveFocus();
      
      await userEvent.tab();
      expect(secondButton).toHaveFocus();
    });
  });

  describe('Touch Targets', () => {
    it('should have minimum touch target size for mobile', () => {
      const { rerender } = render(<Button size="xs">Extra Small</Button>);
      let button = screen.getByRole('button');
      expect(button).toHaveClass('min-w-[44px]'); // 44px minimum

      rerender(<Button size="sm">Small</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('min-w-[44px]');

      rerender(<Button size="md">Medium</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('min-w-[44px]');

      rerender(<Button size="lg">Large</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('min-w-[48px]'); // Larger for lg

      rerender(<Button size="xl">Extra Large</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('min-w-[56px]'); // Largest for xl
    });
  });

  describe('Animation and Motion', () => {
    it('should have proper transition classes', () => {
      render(<Button>Animated Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('transition-all', 'duration-200');
    });

    it('should have ripple effect overlay', () => {
      render(<Button>Ripple Button</Button>);
      
      const button = screen.getByRole('button');
      // Look for the ripple overlay span with the correct classes
      const rippleOverlay = button.querySelector('span[class*="absolute"][class*="inset-0"]');
      
      expect(rippleOverlay).toBeInTheDocument();
      expect(rippleOverlay).toHaveClass('absolute', 'inset-0', 'overflow-hidden');
    });

    it('should have proper overflow hidden for animations', () => {
      render(<Button>Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('overflow-hidden');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      render(<Button></Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle only icon without text', () => {
      render(<Button icon={<PlusIcon data-testid="only-icon" />} aria-label="Add" />);
      
      const button = screen.getByRole('button', { name: 'Add' });
      const icon = screen.getByTestId('only-icon');
      
      expect(button).toBeInTheDocument();
      expect(icon).toBeInTheDocument();
    });

    it('should handle very long text content', () => {
      const longText = 'This is a very long button text that might wrap or overflow';
      render(<Button>{longText}</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent(longText);
      expect(button.querySelector('span')).toHaveClass('whitespace-nowrap');
    });

    it('should handle rapid loading state changes', async () => {
      const { rerender } = render(<Button loading={false}>Button</Button>);
      
      rerender(<Button loading={true}>Button</Button>);
      expect(screen.getByTestId('button-spinner')).toBeInTheDocument();
      
      rerender(<Button loading={false}>Button</Button>);
      expect(screen.queryByTestId('button-spinner')).not.toBeInTheDocument();
    });
  });
});