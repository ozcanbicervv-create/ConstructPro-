import { render, screen } from '@testing-library/react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '../card';

describe('Card Components', () => {
  describe('Card', () => {
    it('should render with default props', () => {
      render(<Card>Card content</Card>);
      
      const card = screen.getByText('Card content');
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute('data-slot', 'card');
    });

    it('should apply custom className', () => {
      render(<Card className="custom-card">Card content</Card>);
      
      const card = screen.getByText('Card content');
      expect(card).toHaveClass('custom-card');
    });

    it('should have default card styling', () => {
      render(<Card>Card content</Card>);
      
      const card = screen.getByText('Card content');
      expect(card).toHaveClass('bg-card', 'text-card-foreground', 'rounded-xl', 'border', 'shadow-sm');
    });
  });

  describe('CardHeader', () => {
    it('should render with default props', () => {
      render(<CardHeader>Header content</CardHeader>);
      
      const header = screen.getByText('Header content');
      expect(header).toBeInTheDocument();
      expect(header).toHaveAttribute('data-slot', 'card-header');
    });

    it('should apply custom className', () => {
      render(<CardHeader className="custom-header">Header content</CardHeader>);
      
      const header = screen.getByText('Header content');
      expect(header).toHaveClass('custom-header');
    });
  });

  describe('CardTitle', () => {
    it('should render with default props', () => {
      render(<CardTitle>Card Title</CardTitle>);
      
      const title = screen.getByText('Card Title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveAttribute('data-slot', 'card-title');
    });

    it('should have title styling', () => {
      render(<CardTitle>Card Title</CardTitle>);
      
      const title = screen.getByText('Card Title');
      expect(title).toHaveClass('leading-none', 'font-semibold');
    });
  });

  describe('CardDescription', () => {
    it('should render with default props', () => {
      render(<CardDescription>Card description</CardDescription>);
      
      const description = screen.getByText('Card description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveAttribute('data-slot', 'card-description');
    });

    it('should have description styling', () => {
      render(<CardDescription>Card description</CardDescription>);
      
      const description = screen.getByText('Card description');
      expect(description).toHaveClass('text-muted-foreground', 'text-sm');
    });
  });

  describe('CardAction', () => {
    it('should render with default props', () => {
      render(<CardAction>Action content</CardAction>);
      
      const action = screen.getByText('Action content');
      expect(action).toBeInTheDocument();
      expect(action).toHaveAttribute('data-slot', 'card-action');
    });

    it('should have action positioning', () => {
      render(<CardAction>Action content</CardAction>);
      
      const action = screen.getByText('Action content');
      expect(action).toHaveClass('col-start-2', 'row-span-2', 'justify-self-end');
    });
  });

  describe('CardContent', () => {
    it('should render with default props', () => {
      render(<CardContent>Content here</CardContent>);
      
      const content = screen.getByText('Content here');
      expect(content).toBeInTheDocument();
      expect(content).toHaveAttribute('data-slot', 'card-content');
    });

    it('should have content padding', () => {
      render(<CardContent>Content here</CardContent>);
      
      const content = screen.getByText('Content here');
      expect(content).toHaveClass('px-6');
    });
  });

  describe('CardFooter', () => {
    it('should render with default props', () => {
      render(<CardFooter>Footer content</CardFooter>);
      
      const footer = screen.getByText('Footer content');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveAttribute('data-slot', 'card-footer');
    });

    it('should have footer styling', () => {
      render(<CardFooter>Footer content</CardFooter>);
      
      const footer = screen.getByText('Footer content');
      expect(footer).toHaveClass('flex', 'items-center', 'px-6');
    });
  });

  describe('Complete Card Structure', () => {
    it('should render a complete card with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
            <CardDescription>This is a test card</CardDescription>
            <CardAction>
              <button>Action</button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p>This is the main content of the card.</p>
          </CardContent>
          <CardFooter>
            <button>Footer Button</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByText('This is a test card')).toBeInTheDocument();
      expect(screen.getByText('This is the main content of the card.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Footer Button' })).toBeInTheDocument();
    });

    it('should handle nested elements correctly', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>
              <span>Nested Title</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p>Nested paragraph</p>
              <ul>
                <li>List item 1</li>
                <li>List item 2</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      );

      expect(screen.getByText('Nested Title')).toBeInTheDocument();
      expect(screen.getByText('Nested paragraph')).toBeInTheDocument();
      expect(screen.getByText('List item 1')).toBeInTheDocument();
      expect(screen.getByText('List item 2')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should support ARIA attributes', () => {
      render(
        <Card role="article" aria-labelledby="card-title">
          <CardHeader>
            <CardTitle id="card-title">Accessible Card</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      );

      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-labelledby', 'card-title');
      
      const title = screen.getByText('Accessible Card');
      expect(title).toHaveAttribute('id', 'card-title');
    });
  });
});