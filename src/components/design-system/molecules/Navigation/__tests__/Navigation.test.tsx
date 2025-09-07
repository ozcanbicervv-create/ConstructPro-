import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import Navigation, { NavigationItem } from '../Navigation';

expect.extend(toHaveNoViolations);

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

const mockNavigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: <span data-testid="dashboard-icon">📊</span>,
    active: true,
  },
  {
    id: 'projects',
    label: 'Projects',
    href: '/projects',
    icon: <span data-testid="projects-icon">🏗️</span>,
    badge: 5,
    children: [
      {
        id: 'active-projects',
        label: 'Active Projects',
        href: '/projects/active',
      },
      {
        id: 'completed-projects',
        label: 'Completed Projects',
        href: '/projects/completed',
      },
    ],
  },
  {
    id: 'tasks',
    label: 'Tasks',
    href: '/tasks',
    icon: <span data-testid="tasks-icon">✅</span>,
    badge: 12,
  },
  {
    id: 'disabled-item',
    label: 'Disabled Item',
    href: '/disabled',
    disabled: true,
  },
];

describe('Navigation', () => {
  const defaultProps = {
    items: mockNavigationItems,
    onItemClick: jest.fn(),
    onToggleCollapse: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders navigation items correctly', () => {
      render(<Navigation {...defaultProps} />);
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Projects')).toBeInTheDocument();
      expect(screen.getByText('Tasks')).toBeInTheDocument();
      expect(screen.getByText('Disabled Item')).toBeInTheDocument();
    });

    it('renders icons when provided', () => {
      render(<Navigation {...defaultProps} />);
      
      expect(screen.getByTestId('dashboard-icon')).toBeInTheDocument();
      expect(screen.getByTestId('projects-icon')).toBeInTheDocument();
      expect(screen.getByTestId('tasks-icon')).toBeInTheDocument();
    });

    it('renders badges when provided', () => {
      render(<Navigation {...defaultProps} />);
      
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
    });

    it('shows active state correctly', () => {
      render(<Navigation {...defaultProps} />);
      
      const dashboardButton = screen.getByRole('button', { name: /dashboard/i });
      expect(dashboardButton).toHaveAttribute('aria-current', 'page');
    });

    it('shows disabled state correctly', () => {
      render(<Navigation {...defaultProps} />);
      
      const disabledButton = screen.getByRole('button', { name: /disabled item/i });
      expect(disabledButton).toBeDisabled();
    });
  });

  describe('Variants', () => {
    it('applies glass variant classes', () => {
      const { container } = render(<Navigation {...defaultProps} variant="glass" />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('bg-white/10', 'backdrop-blur-md');
    });

    it('applies solid variant classes', () => {
      const { container } = render(<Navigation {...defaultProps} variant="solid" />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('bg-white', 'dark:bg-gray-900');
    });

    it('applies default variant classes', () => {
      const { container } = render(<Navigation {...defaultProps} variant="default" />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('bg-gray-50/80', 'backdrop-blur-sm');
    });
  });

  describe('Collapsed State', () => {
    it('shows collapsed navigation correctly', () => {
      render(<Navigation {...defaultProps} collapsed />);
      
      // Should not show labels in collapsed state
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
      expect(screen.queryByText('Projects')).not.toBeInTheDocument();
    });

    it('shows tooltips on hover in collapsed state', async () => {
      const user = userEvent.setup();
      render(<Navigation {...defaultProps} collapsed />);
      
      const dashboardButton = screen.getByRole('button', { name: /dashboard/i });
      await user.hover(dashboardButton);
      
      // Tooltip should appear
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });
    });

    it('calls onToggleCollapse when toggle button is clicked', async () => {
      const user = userEvent.setup();
      render(<Navigation {...defaultProps} />);
      
      const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i });
      await user.click(toggleButton);
      
      expect(defaultProps.onToggleCollapse).toHaveBeenCalledTimes(1);
    });
  });

  describe('Top Position', () => {
    it('renders horizontal navigation for top position', () => {
      const { container } = render(<Navigation {...defaultProps} position="top" />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('flex-row');
    });

    it('shows mobile toggle button in top position', () => {
      render(<Navigation {...defaultProps} position="top" />);
      
      const toggleButton = screen.getByRole('button', { name: /toggle navigation menu/i });
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onItemClick when navigation item is clicked', async () => {
      const user = userEvent.setup();
      render(<Navigation {...defaultProps} />);
      
      const dashboardButton = screen.getByRole('button', { name: /dashboard/i });
      await user.click(dashboardButton);
      
      expect(defaultProps.onItemClick).toHaveBeenCalledWith(mockNavigationItems[0]);
    });

    it('expands/collapses items with children', async () => {
      const user = userEvent.setup();
      render(<Navigation {...defaultProps} />);
      
      const projectsButton = screen.getByRole('button', { name: /projects/i });
      expect(projectsButton).toHaveAttribute('aria-expanded', 'false');
      
      await user.click(projectsButton);
      
      expect(projectsButton).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('Active Projects')).toBeInTheDocument();
      expect(screen.getByText('Completed Projects')).toBeInTheDocument();
    });

    it('does not call onItemClick for disabled items', async () => {
      const user = userEvent.setup();
      render(<Navigation {...defaultProps} />);
      
      const disabledButton = screen.getByRole('button', { name: /disabled item/i });
      await user.click(disabledButton);
      
      expect(defaultProps.onItemClick).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<Navigation {...defaultProps} />);
      
      const dashboardButton = screen.getByRole('button', { name: /dashboard/i });
      dashboardButton.focus();
      
      await user.keyboard('{Tab}');
      
      const projectsButton = screen.getByRole('button', { name: /projects/i });
      expect(projectsButton).toHaveFocus();
    });

    it('supports Enter key activation', async () => {
      const user = userEvent.setup();
      render(<Navigation {...defaultProps} />);
      
      const dashboardButton = screen.getByRole('button', { name: /dashboard/i });
      dashboardButton.focus();
      
      await user.keyboard('{Enter}');
      
      expect(defaultProps.onItemClick).toHaveBeenCalledWith(mockNavigationItems[0]);
    });

    it('supports Space key activation', async () => {
      const user = userEvent.setup();
      render(<Navigation {...defaultProps} />);
      
      const dashboardButton = screen.getByRole('button', { name: /dashboard/i });
      dashboardButton.focus();
      
      await user.keyboard(' ');
      
      expect(defaultProps.onItemClick).toHaveBeenCalledWith(mockNavigationItems[0]);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<Navigation {...defaultProps} />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Sidebar navigation');
      
      const activeItem = screen.getByRole('button', { name: /dashboard/i });
      expect(activeItem).toHaveAttribute('aria-current', 'page');
      
      const expandableItem = screen.getByRole('button', { name: /projects/i });
      expect(expandableItem).toHaveAttribute('aria-expanded', 'false');
    });

    it('has no accessibility violations', async () => {
      const { container } = render(<Navigation {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides proper focus management', async () => {
      const user = userEvent.setup();
      render(<Navigation {...defaultProps} />);
      
      const firstButton = screen.getByRole('button', { name: /dashboard/i });
      await user.tab();
      
      expect(firstButton).toHaveFocus();
    });
  });

  describe('Responsive Behavior', () => {
    beforeEach(() => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });

    it('detects mobile viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      });

      render(<Navigation {...defaultProps} />);
      
      // Should render mobile-optimized navigation
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('handles window resize events', () => {
      render(<Navigation {...defaultProps} />);
      
      // Simulate window resize
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      });
      
      fireEvent(window, new Event('resize'));
      
      // Component should adapt to new viewport size
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });
});