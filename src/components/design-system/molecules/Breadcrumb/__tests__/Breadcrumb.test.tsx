import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import Breadcrumb, { BreadcrumbItem } from '../Breadcrumb';

expect.extend(toHaveNoViolations);

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

const mockBreadcrumbItems: BreadcrumbItem[] = [
  {
    id: 'projects',
    label: 'Projects',
    href: '/projects',
    icon: <span data-testid="projects-icon">🏗️</span>,
  },
  {
    id: 'project-1',
    label: 'Office Building Construction',
    href: '/projects/1',
  },
  {
    id: 'tasks',
    label: 'Tasks',
    href: '/projects/1/tasks',
  },
  {
    id: 'current-task',
    label: 'Foundation Work',
    current: true,
  },
];

describe('Breadcrumb', () => {
  const defaultProps = {
    items: mockBreadcrumbItems,
    onItemClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders breadcrumb items correctly', () => {
      render(<Breadcrumb {...defaultProps} />);
      
      expect(screen.getByText('Projects')).toBeInTheDocument();
      expect(screen.getByText('Office Building Construction')).toBeInTheDocument();
      expect(screen.getByText('Tasks')).toBeInTheDocument();
      expect(screen.getByText('Foundation Work')).toBeInTheDocument();
    });

    it('renders icons when provided', () => {
      render(<Breadcrumb {...defaultProps} />);
      
      expect(screen.getByTestId('projects-icon')).toBeInTheDocument();
    });

    it('shows current item correctly', () => {
      render(<Breadcrumb {...defaultProps} />);
      
      const currentItem = screen.getByText('Foundation Work');
      expect(currentItem).toHaveAttribute('aria-current', 'page');
    });

    it('renders separators between items', () => {
      render(<Breadcrumb {...defaultProps} />);
      
      // Should have 3 separators for 4 items
      const separators = screen.getAllByRole('img', { hidden: true });
      expect(separators).toHaveLength(3);
    });

    it('adds home item when showHome is true', () => {
      render(<Breadcrumb {...defaultProps} showHome />);
      
      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('does not add home item when showHome is false', () => {
      render(<Breadcrumb {...defaultProps} showHome={false} />);
      
      expect(screen.queryByText('Home')).not.toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('applies glass variant classes', () => {
      const { container } = render(<Breadcrumb {...defaultProps} variant="glass" />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('bg-white/10', 'backdrop-blur-md');
    });

    it('applies minimal variant classes', () => {
      const { container } = render(<Breadcrumb {...defaultProps} variant="minimal" />);
      const nav = container.querySelector('nav');
      expect(nav).not.toHaveClass('bg-gray-50');
    });

    it('applies default variant classes', () => {
      const { container } = render(<Breadcrumb {...defaultProps} variant="default" />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('bg-gray-50');
    });
  });

  describe('Overflow Handling', () => {
    const manyItems: BreadcrumbItem[] = [
      { id: '1', label: 'Level 1', href: '/1' },
      { id: '2', label: 'Level 2', href: '/2' },
      { id: '3', label: 'Level 3', href: '/3' },
      { id: '4', label: 'Level 4', href: '/4' },
      { id: '5', label: 'Level 5', href: '/5' },
      { id: '6', label: 'Level 6', href: '/6' },
      { id: '7', label: 'Level 7', href: '/7' },
      { id: '8', label: 'Current Level', current: true },
    ];

    it('shows ellipsis when items exceed maxItems', () => {
      render(<Breadcrumb items={manyItems} maxItems={5} />);
      
      expect(screen.getByText('...')).toBeInTheDocument();
      expect(screen.getByText('Level 1')).toBeInTheDocument(); // First item
      expect(screen.getByText('Level 7')).toBeInTheDocument(); // Last items
      expect(screen.getByText('Current Level')).toBeInTheDocument();
      expect(screen.queryByText('Level 3')).not.toBeInTheDocument(); // Hidden items
    });

    it('does not show ellipsis when items are within maxItems', () => {
      render(<Breadcrumb items={mockBreadcrumbItems} maxItems={5} />);
      
      expect(screen.queryByText('...')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onItemClick when clickable item is clicked', async () => {
      const user = userEvent.setup();
      render(<Breadcrumb {...defaultProps} />);
      
      const projectsButton = screen.getByRole('button', { name: /projects/i });
      await user.click(projectsButton);
      
      expect(defaultProps.onItemClick).toHaveBeenCalledWith(mockBreadcrumbItems[0]);
    });

    it('does not call onItemClick for current item', async () => {
      const user = userEvent.setup();
      render(<Breadcrumb {...defaultProps} />);
      
      const currentItem = screen.getByText('Foundation Work');
      await user.click(currentItem);
      
      expect(defaultProps.onItemClick).not.toHaveBeenCalled();
    });

    it('does not call onItemClick for disabled items', async () => {
      const disabledItems: BreadcrumbItem[] = [
        { id: '1', label: 'Disabled', href: '/disabled', disabled: true },
        { id: '2', label: 'Current', current: true },
      ];
      
      const user = userEvent.setup();
      render(<Breadcrumb items={disabledItems} onItemClick={defaultProps.onItemClick} />);
      
      const disabledItem = screen.getByText('Disabled');
      await user.click(disabledItem);
      
      expect(defaultProps.onItemClick).not.toHaveBeenCalled();
    });

    it('prevents default behavior on click', async () => {
      const user = userEvent.setup();
      render(<Breadcrumb {...defaultProps} />);
      
      const projectsButton = screen.getByRole('button', { name: /projects/i });
      const clickEvent = jest.fn();
      projectsButton.addEventListener('click', clickEvent);
      
      await user.click(projectsButton);
      
      expect(clickEvent).toHaveBeenCalled();
      expect(clickEvent.mock.calls[0][0].defaultPrevented).toBe(true);
    });
  });

  describe('Custom Separator', () => {
    it('renders custom separator', () => {
      const customSeparator = <span data-testid="custom-separator">→</span>;
      render(<Breadcrumb {...defaultProps} separator={customSeparator} />);
      
      expect(screen.getAllByTestId('custom-separator')).toHaveLength(3);
    });

    it('uses default separator when none provided', () => {
      render(<Breadcrumb {...defaultProps} />);
      
      // Default separator should be chevron-right icons
      const separators = screen.getAllByRole('img', { hidden: true });
      expect(separators).toHaveLength(3);
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<Breadcrumb {...defaultProps} />);
      
      const firstButton = screen.getByRole('button', { name: /projects/i });
      firstButton.focus();
      
      await user.keyboard('{Tab}');
      
      const secondButton = screen.getByRole('button', { name: /office building construction/i });
      expect(secondButton).toHaveFocus();
    });

    it('supports Enter key activation', async () => {
      const user = userEvent.setup();
      render(<Breadcrumb {...defaultProps} />);
      
      const projectsButton = screen.getByRole('button', { name: /projects/i });
      projectsButton.focus();
      
      await user.keyboard('{Enter}');
      
      expect(defaultProps.onItemClick).toHaveBeenCalledWith(mockBreadcrumbItems[0]);
    });

    it('supports Space key activation', async () => {
      const user = userEvent.setup();
      render(<Breadcrumb {...defaultProps} />);
      
      const projectsButton = screen.getByRole('button', { name: /projects/i });
      projectsButton.focus();
      
      await user.keyboard(' ');
      
      expect(defaultProps.onItemClick).toHaveBeenCalledWith(mockBreadcrumbItems[0]);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<Breadcrumb {...defaultProps} />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
      
      const currentItem = screen.getByText('Foundation Work');
      expect(currentItem).toHaveAttribute('aria-current', 'page');
    });

    it('has no accessibility violations', async () => {
      const { container } = render(<Breadcrumb {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides proper focus management', async () => {
      const user = userEvent.setup();
      render(<Breadcrumb {...defaultProps} />);
      
      const firstButton = screen.getByRole('button', { name: /projects/i });
      await user.tab();
      
      expect(firstButton).toHaveFocus();
    });

    it('marks separators as decorative', () => {
      render(<Breadcrumb {...defaultProps} />);
      
      const separators = screen.getAllByRole('img', { hidden: true });
      separators.forEach(separator => {
        expect(separator).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty items array', () => {
      render(<Breadcrumb items={[]} />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      expect(nav.querySelector('ol')).toBeEmptyDOMElement();
    });

    it('handles single item', () => {
      const singleItem: BreadcrumbItem[] = [
        { id: 'single', label: 'Single Item', current: true },
      ];
      
      render(<Breadcrumb items={singleItem} />);
      
      expect(screen.getByText('Single Item')).toBeInTheDocument();
      expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();
    });

    it('handles items without href', () => {
      const itemsWithoutHref: BreadcrumbItem[] = [
        { id: '1', label: 'No Link' },
        { id: '2', label: 'Current', current: true },
      ];
      
      render(<Breadcrumb items={itemsWithoutHref} />);
      
      expect(screen.getByText('No Link')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /no link/i })).not.toBeInTheDocument();
    });
  });
});