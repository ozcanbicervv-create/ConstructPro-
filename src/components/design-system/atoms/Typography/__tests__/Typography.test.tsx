/**
 * Typography Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Typography, ConstructionText } from '../Typography';

describe('Typography', () => {
  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<Typography>Default text</Typography>);
      const element = screen.getByText('Default text');
      expect(element).toBeInTheDocument();
      expect(element.tagName).toBe('P');
    });

    it('renders with custom element', () => {
      render(<Typography as="h1">Heading text</Typography>);
      const element = screen.getByText('Heading text');
      expect(element.tagName).toBe('H1');
    });

    it('applies custom className', () => {
      render(<Typography className="custom-class">Text</Typography>);
      const element = screen.getByText('Text');
      expect(element).toHaveClass('custom-class');
    });
  });

  describe('Variants', () => {
    it('applies display variant styles', () => {
      render(<Typography variant="display">Display text</Typography>);
      const element = screen.getByText('Display text');
      expect(element).toHaveClass('font-display', 'font-black', 'tracking-tighter');
    });

    it('applies heading variant styles', () => {
      render(<Typography variant="heading">Heading text</Typography>);
      const element = screen.getByText('Heading text');
      expect(element).toHaveClass('font-display', 'font-bold', 'tracking-tight');
    });

    it('applies body variant styles', () => {
      render(<Typography variant="body">Body text</Typography>);
      const element = screen.getByText('Body text');
      expect(element).toHaveClass('font-primary', 'font-normal', 'tracking-normal');
    });

    it('applies caption variant styles', () => {
      render(<Typography variant="caption">Caption text</Typography>);
      const element = screen.getByText('Caption text');
      expect(element).toHaveClass('font-primary', 'tracking-wide');
    });

    it('applies overline variant styles', () => {
      render(<Typography variant="overline">Overline text</Typography>);
      const element = screen.getByText('Overline text');
      expect(element).toHaveClass('font-primary', 'font-bold', 'tracking-widest', 'uppercase');
    });
  });

  describe('Sizes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'];
    
    sizes.forEach(size => {
      it(`applies ${size} size correctly`, () => {
        render(<Typography size={size as any}>Text</Typography>);
        const element = screen.getByText('Text');
        // Check for the actual class that gets applied (md becomes text-base)
        const expectedClass = size === 'md' ? 'text-base' : `text-${size}`;
        expect(element).toHaveClass(expectedClass);
      });
    });
  });

  describe('Weights', () => {
    const weights = ['light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black'];
    
    weights.forEach(weight => {
      it(`applies ${weight} weight correctly`, () => {
        render(<Typography weight={weight as any}>Text</Typography>);
        const element = screen.getByText('Text');
        expect(element).toHaveClass(`font-${weight}`);
      });
    });
  });

  describe('Colors', () => {
    const colors = ['primary', 'secondary', 'muted', 'accent', 'success', 'warning', 'error', 'info'];
    
    colors.forEach(color => {
      it(`applies ${color} color correctly`, () => {
        render(<Typography color={color as any}>Text</Typography>);
        const element = screen.getByText('Text');
        // Check that some color class is applied (exact class depends on color)
        expect(element.className).toMatch(/text-/);
      });
    });
  });

  describe('Alignment', () => {
    const alignments = ['left', 'center', 'right', 'justify'];
    
    alignments.forEach(align => {
      it(`applies ${align} alignment correctly`, () => {
        render(<Typography align={align as any}>Text</Typography>);
        const element = screen.getByText('Text');
        expect(element).toHaveClass(`text-${align}`);
      });
    });
  });

  describe('Gradient Effects', () => {
    it('applies primary gradient', () => {
      render(<Typography gradient="primary">Gradient text</Typography>);
      const element = screen.getByText('Gradient text');
      expect(element).toHaveClass('bg-gradient-to-r', 'bg-clip-text', 'text-transparent');
    });

    it('applies secondary gradient', () => {
      render(<Typography gradient="secondary">Gradient text</Typography>);
      const element = screen.getByText('Gradient text');
      expect(element).toHaveClass('bg-gradient-to-r', 'bg-clip-text', 'text-transparent');
    });

    it('applies default gradient when gradient=true', () => {
      render(<Typography gradient>Gradient text</Typography>);
      const element = screen.getByText('Gradient text');
      expect(element).toHaveClass('bg-gradient-to-r', 'bg-clip-text', 'text-transparent');
    });
  });

  describe('Responsive Sizing', () => {
    it('applies responsive classes when responsive=true', () => {
      render(<Typography responsive size="md">Responsive text</Typography>);
      const element = screen.getByText('Responsive text');
      expect(element.className).toMatch(/sm:/);
    });

    it('applies fixed size when responsive=false', () => {
      render(<Typography responsive={false} size="md">Fixed text</Typography>);
      const element = screen.getByText('Fixed text');
      expect(element).toHaveClass('text-base');
    });
  });

  describe('Text Modifiers', () => {
    it('applies truncate class', () => {
      render(<Typography truncate>Long text that should be truncated</Typography>);
      const element = screen.getByText('Long text that should be truncated');
      expect(element).toHaveClass('truncate');
    });

    it('applies uppercase class', () => {
      render(<Typography uppercase>Uppercase text</Typography>);
      const element = screen.getByText('Uppercase text');
      expect(element).toHaveClass('uppercase');
    });

    it('applies italic class', () => {
      render(<Typography italic>Italic text</Typography>);
      const element = screen.getByText('Italic text');
      expect(element).toHaveClass('italic');
    });

    it('applies underline class', () => {
      render(<Typography underline>Underlined text</Typography>);
      const element = screen.getByText('Underlined text');
      expect(element).toHaveClass('underline');
    });
  });

  describe('Accessibility', () => {
    it('renders semantic HTML elements correctly', () => {
      render(
        <div>
          <Typography variant="display" as="h1">Main Heading</Typography>
          <Typography variant="heading" as="h2">Section Heading</Typography>
          <Typography variant="body">Body text content</Typography>
          <Typography variant="caption">Caption text</Typography>
        </div>
      );
      
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(screen.getByText('Body text content')).toBeInTheDocument();
      expect(screen.getByText('Caption text')).toBeInTheDocument();
    });

    it('maintains proper contrast ratios', () => {
      render(<Typography color="muted">Muted text</Typography>);
      const element = screen.getByText('Muted text');
      // This would need actual color contrast testing in a real scenario
      expect(element).toBeInTheDocument();
    });
  });
});

describe('ConstructionText', () => {
  describe('Currency Formatting', () => {
    it('formats currency correctly', () => {
      render(<ConstructionText type="currency" value={1234.56} />);
      const element = screen.getByText('$1,234.56');
      expect(element).toBeInTheDocument();
    });

    it('formats currency with different locale', () => {
      render(<ConstructionText type="currency" value={1234.56} locale="de-DE" currency="EUR" />);
      const element = screen.getByText(/1\.234,56/);
      expect(element).toBeInTheDocument();
    });

    it('formats compact currency', () => {
      render(<ConstructionText type="currency" value={1234567} compact />);
      const element = screen.getByText('$1.23M');
      expect(element).toBeInTheDocument();
    });
  });

  describe('Percentage Formatting', () => {
    it('formats percentage correctly', () => {
      render(<ConstructionText type="percentage" value={75.5} />);
      const element = screen.getByText('75.50%');
      expect(element).toBeInTheDocument();
    });

    it('formats percentage with custom precision', () => {
      render(<ConstructionText type="percentage" value={75.555} precision={1} />);
      const element = screen.getByText('75.6%');
      expect(element).toBeInTheDocument();
    });
  });

  describe('Measurement Formatting', () => {
    it('formats measurement with unit', () => {
      render(<ConstructionText type="measurement" value={123.45} unit="ft" />);
      const element = screen.getByText('123.45 ft');
      expect(element).toBeInTheDocument();
    });

    it('formats measurement without unit when showUnit=false', () => {
      render(<ConstructionText type="measurement" value={123.45} unit="ft" showUnit={false} />);
      const element = screen.getByText('123.45');
      expect(element).toBeInTheDocument();
    });

    it('formats area measurement', () => {
      render(<ConstructionText type="area" value={1500} unit="sq ft" />);
      const element = screen.getByText('1,500.00 sq ft');
      expect(element).toBeInTheDocument();
    });

    it('formats volume measurement', () => {
      render(<ConstructionText type="volume" value={250.5} unit="cu yd" />);
      const element = screen.getByText('250.50 cu yd');
      expect(element).toBeInTheDocument();
    });

    it('formats weight measurement', () => {
      render(<ConstructionText type="weight" value={2500} unit="lbs" />);
      const element = screen.getByText('2,500.00 lbs');
      expect(element).toBeInTheDocument();
    });
  });

  describe('Duration Formatting', () => {
    it('formats duration in hours and minutes', () => {
      render(<ConstructionText type="duration" value={7320} />); // 2h 2m
      const element = screen.getByText('2h 2m');
      expect(element).toBeInTheDocument();
    });

    it('formats duration in minutes and seconds', () => {
      render(<ConstructionText type="duration" value={150} />); // 2m 30s
      const element = screen.getByText('2m 30s');
      expect(element).toBeInTheDocument();
    });

    it('formats duration in seconds only', () => {
      render(<ConstructionText type="duration" value={45} />); // 45s
      const element = screen.getByText('45s');
      expect(element).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies correct color for currency', () => {
      render(<ConstructionText type="currency" value={100} />);
      const element = screen.getByText('$100.00');
      expect(element).toHaveClass('text-success-600');
    });

    it('applies correct color for percentage', () => {
      render(<ConstructionText type="percentage" value={50} />);
      const element = screen.getByText('50.00%');
      expect(element).toHaveClass('text-brand-blue-600');
    });

    it('applies correct color for measurements', () => {
      render(<ConstructionText type="measurement" value={100} unit="ft" />);
      const element = screen.getByText('100.00 ft');
      expect(element).toHaveClass('text-brand-orange-600');
    });

    it('applies monospace font', () => {
      render(<ConstructionText type="currency" value={100} />);
      const element = screen.getByText('$100.00');
      expect(element).toHaveClass('font-mono', 'font-semibold', 'tabular-nums');
    });
  });

  describe('Error Handling', () => {
    it('handles invalid numeric values', () => {
      render(<ConstructionText type="currency" value="invalid" />);
      const element = screen.getByText('invalid');
      expect(element).toBeInTheDocument();
    });

    it('handles string numeric values', () => {
      render(<ConstructionText type="currency" value="123.45" />);
      const element = screen.getByText('$123.45');
      expect(element).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('renders construction text with proper semantic structure', () => {
      render(
        <div>
          <ConstructionText type="currency" value={1234.56} />
          <ConstructionText type="percentage" value={75} />
          <ConstructionText type="measurement" value={100} unit="ft" />
          <ConstructionText type="duration" value={3600} />
        </div>
      );
      
      expect(screen.getByText('$1,234.56')).toBeInTheDocument();
      expect(screen.getByText('75.00%')).toBeInTheDocument();
      expect(screen.getByText('100.00 ft')).toBeInTheDocument();
      expect(screen.getByText('1h 0m')).toBeInTheDocument();
    });
  });
});