import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  HardHatIcon,
  CraneIcon,
  BlueprintIcon,
  MaterialsIcon,
  SafetyIcon,
  ProgressIcon,
  ExcavatorIcon,
  ToolsIcon,
  BuildingIcon,
  CONSTRUCTION_ICON_CATEGORIES,
  ALL_CONSTRUCTION_ICONS,
} from '../construction';

describe('Construction Icons', () => {
  describe('HardHatIcon', () => {
    it('renders with correct accessibility attributes', () => {
      render(<HardHatIcon />);
      
      const icon = screen.getByRole('img');
      expect(icon).toHaveAttribute('aria-label', 'Hard hat safety helmet');
      expect(icon).toHaveAttribute('title', 'Hard Hat');
    });

    it('renders SVG content', () => {
      render(<HardHatIcon />);
      
      const svg = screen.getByRole('img').querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('applies size variants correctly', () => {
      render(<HardHatIcon size="lg" />);
      expect(screen.getByRole('img')).toHaveClass('h-6', 'w-6');
    });
  });

  describe('CraneIcon', () => {
    it('renders with correct accessibility attributes', () => {
      render(<CraneIcon />);
      
      const icon = screen.getByRole('img');
      expect(icon).toHaveAttribute('aria-label', 'Construction crane');
      expect(icon).toHaveAttribute('title', 'Construction Crane');
    });

    it('supports animation', () => {
      render(<CraneIcon animation="wiggle" />);
      expect(screen.getByRole('img')).toHaveClass('animate-[wiggle_1s_ease-in-out_infinite]');
    });
  });

  describe('BlueprintIcon', () => {
    it('renders with correct accessibility attributes', () => {
      render(<BlueprintIcon />);
      
      const icon = screen.getByRole('img');
      expect(icon).toHaveAttribute('aria-label', 'Construction blueprint or architectural plan');
      expect(icon).toHaveAttribute('title', 'Blueprint');
    });

    it('supports color variants', () => {
      render(<BlueprintIcon color="primary" />);
      expect(screen.getByRole('img')).toHaveClass('text-blue-600');
    });
  });

  describe('MaterialsIcon', () => {
    it('renders with correct accessibility attributes', () => {
      render(<MaterialsIcon />);
      
      const icon = screen.getByRole('img');
      expect(icon).toHaveAttribute('aria-label', 'Construction materials including bricks and cement');
      expect(icon).toHaveAttribute('title', 'Construction Materials');
    });
  });

  describe('SafetyIcon', () => {
    it('renders with correct accessibility attributes', () => {
      render(<SafetyIcon />);
      
      const icon = screen.getByRole('img');
      expect(icon).toHaveAttribute('aria-label', 'Construction safety shield with checkmark');
      expect(icon).toHaveAttribute('title', 'Safety');
    });

    it('supports success color for safety indication', () => {
      render(<SafetyIcon color="success" />);
      expect(screen.getByRole('img')).toHaveClass('text-green-600');
    });
  });

  describe('ProgressIcon', () => {
    it('renders with correct accessibility attributes', () => {
      render(<ProgressIcon />);
      
      const icon = screen.getByRole('img');
      expect(icon).toHaveAttribute('aria-label', 'Construction progress with building phases');
      expect(icon).toHaveAttribute('title', 'Construction Progress');
    });

    it('supports pulse animation for progress indication', () => {
      render(<ProgressIcon animation="pulse" />);
      expect(screen.getByRole('img')).toHaveClass('animate-pulse');
    });
  });

  describe('ExcavatorIcon', () => {
    it('renders with correct accessibility attributes', () => {
      render(<ExcavatorIcon />);
      
      const icon = screen.getByRole('img');
      expect(icon).toHaveAttribute('aria-label', 'Construction excavator heavy machinery');
      expect(icon).toHaveAttribute('title', 'Excavator');
    });
  });

  describe('ToolsIcon', () => {
    it('renders with correct accessibility attributes', () => {
      render(<ToolsIcon />);
      
      const icon = screen.getByRole('img');
      expect(icon).toHaveAttribute('aria-label', 'Construction tools including hammer and wrench');
      expect(icon).toHaveAttribute('title', 'Construction Tools');
    });
  });

  describe('BuildingIcon', () => {
    it('renders with correct accessibility attributes', () => {
      render(<BuildingIcon />);
      
      const icon = screen.getByRole('img');
      expect(icon).toHaveAttribute('aria-label', 'Construction building or structure');
      expect(icon).toHaveAttribute('title', 'Building');
    });
  });

  describe('Icon Categories', () => {
    it('has correct safety category icons', () => {
      expect(CONSTRUCTION_ICON_CATEGORIES.safety).toEqual(['HardHatIcon', 'SafetyIcon']);
    });

    it('has correct equipment category icons', () => {
      expect(CONSTRUCTION_ICON_CATEGORIES.equipment).toEqual(['CraneIcon', 'ExcavatorIcon', 'ToolsIcon']);
    });

    it('has correct planning category icons', () => {
      expect(CONSTRUCTION_ICON_CATEGORIES.planning).toEqual(['BlueprintIcon', 'ProgressIcon']);
    });

    it('has correct materials category icons', () => {
      expect(CONSTRUCTION_ICON_CATEGORIES.materials).toEqual(['MaterialsIcon']);
    });

    it('has correct structures category icons', () => {
      expect(CONSTRUCTION_ICON_CATEGORIES.structures).toEqual(['BuildingIcon']);
    });
  });

  describe('All Icons List', () => {
    it('contains all construction icons', () => {
      expect(ALL_CONSTRUCTION_ICONS).toHaveLength(9);
      expect(ALL_CONSTRUCTION_ICONS).toContain('HardHatIcon');
      expect(ALL_CONSTRUCTION_ICONS).toContain('CraneIcon');
      expect(ALL_CONSTRUCTION_ICONS).toContain('BlueprintIcon');
      expect(ALL_CONSTRUCTION_ICONS).toContain('MaterialsIcon');
      expect(ALL_CONSTRUCTION_ICONS).toContain('SafetyIcon');
      expect(ALL_CONSTRUCTION_ICONS).toContain('ProgressIcon');
      expect(ALL_CONSTRUCTION_ICONS).toContain('ExcavatorIcon');
      expect(ALL_CONSTRUCTION_ICONS).toContain('ToolsIcon');
      expect(ALL_CONSTRUCTION_ICONS).toContain('BuildingIcon');
    });
  });

  describe('Accessibility Compliance', () => {
    const icons = [
      { component: HardHatIcon, name: 'HardHatIcon' },
      { component: CraneIcon, name: 'CraneIcon' },
      { component: BlueprintIcon, name: 'BlueprintIcon' },
      { component: MaterialsIcon, name: 'MaterialsIcon' },
      { component: SafetyIcon, name: 'SafetyIcon' },
      { component: ProgressIcon, name: 'ProgressIcon' },
      { component: ExcavatorIcon, name: 'ExcavatorIcon' },
      { component: ToolsIcon, name: 'ToolsIcon' },
      { component: BuildingIcon, name: 'BuildingIcon' },
    ];

    icons.forEach(({ component: IconComponent, name }) => {
      it(`${name} has proper ARIA attributes`, () => {
        render(<IconComponent />);
        
        const icon = screen.getByRole('img');
        expect(icon).toHaveAttribute('aria-label');
        expect(icon).toHaveAttribute('title');
        
        const ariaLabel = icon.getAttribute('aria-label');
        const title = icon.getAttribute('title');
        
        expect(ariaLabel).toBeTruthy();
        expect(title).toBeTruthy();
        expect(ariaLabel?.length).toBeGreaterThan(0);
        expect(title?.length).toBeGreaterThan(0);
      });

      it(`${name} has proper SVG structure`, () => {
        render(<IconComponent />);
        
        const svg = screen.getByRole('img').querySelector('svg');
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveAttribute('viewBox');
        expect(svg).toHaveClass('h-full', 'w-full');
      });
    });
  });

  describe('Interactive Features', () => {
    it('supports hover effects through className', () => {
      render(<HardHatIcon className="hover:text-blue-500" />);
      expect(screen.getByRole('img')).toHaveClass('hover:text-blue-500');
    });

    it('supports focus states for keyboard navigation', () => {
      render(<SafetyIcon className="focus:outline-none focus:ring-2" />);
      expect(screen.getByRole('img')).toHaveClass('focus:outline-none', 'focus:ring-2');
    });

    it('supports custom event handlers through props spreading', () => {
      const handleClick = jest.fn();
      render(
        <div onClick={handleClick}>
          <CraneIcon />
        </div>
      );
      
      screen.getByRole('img').closest('div')?.click();
      expect(handleClick).toHaveBeenCalled();
    });
  });
});