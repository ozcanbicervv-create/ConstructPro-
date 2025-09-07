import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Card from '../Card';
import CardHeader from '../CardHeader';
import CardContent from '../CardContent';
import CardFooter from '../CardFooter';
import CardTitle from '../CardTitle';
import CardDescription from '../CardDescription';

expect.extend(toHaveNoViolations);

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('Card', () => {
  describe('Basic Card', () => {
    it('renders children correctly', () => {
      render(
        <Card>
          <div>Card content</div>
        </Card>
      );
      
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('applies variant classes correctly', () => {
      const { rerender, container } = render(
        <Card variant="glass">Content</Card>
      );
      
      let card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-white/10', 'backdrop-blur-md');

      rerender(<Card variant="elevated">Content</Card>);
      card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-white', 'shadow-xl');

      rerender(<Card variant="outlined">Content</Card>);
      card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('border-2', 'border-gray-200');

      rerender(<Card variant="flat">Content</Card>);
      card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-gray-50', 'shadow-none');
    });

    it('applies padding classes correctly', () => {
      const { rerender, container } = render(
        <Card padding="none">Content</Card>
      );
      
      let card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-0');

      rerender(<Card padding="sm">Content</Card>);
      card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-3');

      rerender(<Card padding="lg">Content</Card>);
      card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-6');
    });

    it('applies hover effects when hover prop is true', () => {
      const { container } = render(
        <Card hover>Content</Card>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('transition-all', 'duration-200');
    });

    it('applies interactive styles when interactive prop is true', () => {
      const { container } = render(
        <Card interactive>Content</Card>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('cursor-pointer', 'select-none');
    });

    it('handles click events when interactive', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      
      render(
        <Card interactive onClick={handleClick}>
          Content
        </Card>
      );
      
      const card = screen.getByText('Content').parentElement;
      await user.click(card!);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('supports keyboard interaction when interactive', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      
      render(
        <Card interactive onClick={handleClick} tabIndex={0}>
          Content
        </Card>
      );
      
      const card = screen.getByText('Content').parentElement;
      card!.focus();
      await user.keyboard('{Enter}');
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('CardHeader', () => {
    it('renders children correctly', () => {
      render(
        <CardHeader>
          <div>Header content</div>
        </CardHeader>
      );
      
      expect(screen.getByText('Header content')).toBeInTheDocument();
    });

    it('applies divider when divider prop is true', () => {
      const { container } = render(
        <CardHeader divider>
          Header content
        </CardHeader>
      );
      
      const header = container.firstChild as HTMLElement;
      expect(header).toHaveClass('pb-4', 'border-b');
    });
  });

  describe('CardContent', () => {
    it('renders children correctly', () => {
      render(
        <CardContent>
          <div>Content</div>
        </CardContent>
      );
      
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('applies padding classes correctly', () => {
      const { rerender, container } = render(
        <CardContent padding="sm">Content</CardContent>
      );
      
      let content = container.firstChild as HTMLElement;
      expect(content).toHaveClass('pt-2');

      rerender(<CardContent padding="lg">Content</CardContent>);
      content = container.firstChild as HTMLElement;
      expect(content).toHaveClass('pt-6');
    });
  });

  describe('CardFooter', () => {
    it('renders children correctly', () => {
      render(
        <CardFooter>
          <div>Footer content</div>
        </CardFooter>
      );
      
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });

    it('applies divider when divider prop is true', () => {
      const { container } = render(
        <CardFooter divider>
          Footer content
        </CardFooter>
      );
      
      const footer = container.firstChild as HTMLElement;
      expect(footer).toHaveClass('pt-4', 'border-t');
    });

    it('applies justify classes correctly', () => {
      const { rerender, container } = render(
        <CardFooter justify="start">Content</CardFooter>
      );
      
      let footer = container.firstChild as HTMLElement;
      expect(footer).toHaveClass('justify-start');

      rerender(<CardFooter justify="center">Content</CardFooter>);
      footer = container.firstChild as HTMLElement;
      expect(footer).toHaveClass('justify-center');

      rerender(<CardFooter justify="between">Content</CardFooter>);
      footer = container.firstChild as HTMLElement;
      expect(footer).toHaveClass('justify-between');
    });
  });

  describe('CardTitle', () => {
    it('renders children correctly', () => {
      render(
        <CardTitle>Title text</CardTitle>
      );
      
      expect(screen.getByText('Title text')).toBeInTheDocument();
    });

    it('renders with correct heading element', () => {
      render(
        <CardTitle as="h2">Title text</CardTitle>
      );
      
      const title = screen.getByRole('heading', { level: 2 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Title text');
    });

    it('applies size classes correctly', () => {
      const { rerender } = render(
        <CardTitle size="sm">Title</CardTitle>
      );
      
      let title = screen.getByText('Title');
      expect(title).toHaveClass('text-sm');

      rerender(<CardTitle size="lg">Title</CardTitle>);
      title = screen.getByText('Title');
      expect(title).toHaveClass('text-lg');
    });
  });

  describe('CardDescription', () => {
    it('renders children correctly', () => {
      render(
        <CardDescription>Description text</CardDescription>
      );
      
      expect(screen.getByText('Description text')).toBeInTheDocument();
    });

    it('applies size classes correctly', () => {
      const { rerender } = render(
        <CardDescription size="sm">Description</CardDescription>
      );
      
      let description = screen.getByText('Description');
      expect(description).toHaveClass('text-sm');

      rerender(<CardDescription size="md">Description</CardDescription>);
      description = screen.getByText('Description');
      expect(description).toHaveClass('text-base');
    });
  });

  describe('Complete Card Example', () => {
    it('renders a complete card with all components', () => {
      render(
        <Card variant="glass" hover>
          <CardHeader divider>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description</CardDescription>
          </CardHeader>
          <CardContent padding="md">
            <p>Card content goes here</p>
          </CardContent>
          <CardFooter divider justify="between">
            <span>Footer left</span>
            <span>Footer right</span>
          </CardFooter>
        </Card>
      );
      
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card description')).toBeInTheDocument();
      expect(screen.getByText('Card content goes here')).toBeInTheDocument();
      expect(screen.getByText('Footer left')).toBeInTheDocument();
      expect(screen.getByText('Footer right')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Accessible Card</CardTitle>
            <CardDescription>This card is accessible</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Content</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('supports keyboard navigation when interactive', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      
      render(
        <Card interactive onClick={handleClick} tabIndex={0}>
          Interactive Card
        </Card>
      );
      
      const card = screen.getByText('Interactive Card').parentElement;
      
      // Focus the card
      card!.focus();
      expect(card).toHaveFocus();
      
      // Activate with Enter
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      // Activate with Space
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it('provides proper focus indicators', () => {
      const { container } = render(
        <Card interactive tabIndex={0}>
          Focusable Card
        </Card>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('focus:outline-none', 'focus:ring-2');
    });
  });

  describe('Custom Props', () => {
    it('forwards custom props to the underlying element', () => {
      render(
        <Card data-testid="custom-card" aria-label="Custom card">
          Content
        </Card>
      );
      
      const card = screen.getByTestId('custom-card');
      expect(card).toHaveAttribute('aria-label', 'Custom card');
    });

    it('merges custom className with default classes', () => {
      const { container } = render(
        <Card className="custom-class">
          Content
        </Card>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-class', 'rounded-xl');
    });
  });
});