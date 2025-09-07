/**
 * Comprehensive test suite for Input component
 * Tests functionality, accessibility, validation, and performance
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { 
  renderWithProviders, 
  testAccessibility, 
  testKeyboardNavigation,
  testComponentPerformance,
  testVisualRegression,
  fillForm,
  testFormValidation
} from '@/tests/utils/test-utils';
import { Input } from '../input';

describe('Input Component', () => {
  // Basic functionality tests
  describe('Basic Functionality', () => {
    it('renders with default props', () => {
      renderWithProviders(<Input />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveClass('flex', 'h-10', 'w-full');
    });

    it('handles value changes', async () => {
      const handleChange = jest.fn();
      const { user } = renderWithProviders(
        <Input onChange={handleChange} />
      );
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'test value');
      
      expect(handleChange).toHaveBeenCalled();
      expect(input).toHaveValue('test value');
    });

    it('handles controlled input', () => {
      const { rerender } = renderWithProviders(
        <Input value="initial" onChange={() => {}} />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('initial');
      
      rerender(<Input value="updated" onChange={() => {}} />);
      expect(input).toHaveValue('updated');
    });

    it('is disabled when disabled prop is true', () => {
      renderWithProviders(<Input disabled />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('is readonly when readOnly prop is true', () => {
      renderWithProviders(<Input readOnly />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });
  });

  // Input types tests
  describe('Input Types', () => {
    const inputTypes = [
      'text',
      'email',
      'password',
      'number',
      'tel',
      'url',
      'search',
    ];

    inputTypes.forEach(type => {
      it(`renders ${type} input correctly`, () => {
        renderWithProviders(<Input type={type as any} />);
        
        const input = screen.getByRole(
          type === 'email' ? 'textbox' : 
          type === 'password' ? 'textbox' :
          type === 'number' ? 'spinbutton' :
          'textbox'
        );
        expect(input).toHaveAttribute('type', type);
      });
    });
  });

  // Placeholder and labels
  describe('Labels and Placeholders', () => {
    it('displays placeholder text', () => {
      renderWithProviders(<Input placeholder="Enter text here" />);
      
      const input = screen.getByPlaceholderText('Enter text here');
      expect(input).toBeInTheDocument();
    });

    it('works with labels', () => {
      renderWithProviders(
        <div>
          <label htmlFor="test-input">Test Label</label>
          <Input id="test-input" />
        </div>
      );
      
      const input = screen.getByLabelText('Test Label');
      expect(input).toBeInTheDocument();
    });

    it('supports aria-label', () => {
      renderWithProviders(<Input aria-label="Custom input label" />);
      
      const input = screen.getByLabelText('Custom input label');
      expect(input).toBeInTheDocument();
    });
  });

  // Validation tests
  describe('Validation', () => {
    it('shows required validation', async () => {
      const { user } = renderWithProviders(
        <form>
          <Input required />
          <button type="submit">Submit</button>
        </form>
      );
      
      const input = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /submit/i });
      
      expect(input).toHaveAttribute('required');
      
      await user.click(submitButton);
      expect(input).toBeInvalid();
    });

    it('validates email format', async () => {
      const { user } = renderWithProviders(
        <Input type="email" value="invalid-email" onChange={() => {}} />
      );
      
      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.tab(); // Trigger validation
      
      expect(input).toBeInvalid();
    });

    it('validates number input', async () => {
      const { user } = renderWithProviders(
        <Input type="number" min="0" max="100" />
      );
      
      const input = screen.getByRole('spinbutton');
      await user.type(input, '150');
      await user.tab();
      
      expect(input).toBeInvalid();
    });

    it('validates pattern matching', async () => {
      const { user } = renderWithProviders(
        <Input pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" title="Phone number format: 123-456-7890" />
      );
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'invalid-pattern');
      await user.tab();
      
      expect(input).toBeInvalid();
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('meets WCAG accessibility guidelines', async () => {
      const { container } = renderWithProviders(
        <div>
          <label htmlFor="accessible-input">Accessible Input</label>
          <Input id="accessible-input" />
        </div>
      );
      await testAccessibility(container);
    });

    it('supports keyboard navigation', async () => {
      const { container, user } = renderWithProviders(
        <div>
          <Input placeholder="First input" />
          <Input placeholder="Second input" />
          <Input placeholder="Third input" />
        </div>
      );
      
      await testKeyboardNavigation(container, user);
    });

    it('has proper ARIA attributes for validation', () => {
      renderWithProviders(
        <Input 
          aria-invalid="true" 
          aria-describedby="error-message"
          required
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', 'error-message');
      expect(input).toHaveAttribute('required');
    });

    it('supports screen reader descriptions', () => {
      renderWithProviders(
        <div>
          <Input aria-describedby="help-text" />
          <div id="help-text">This is help text for the input</div>
        </div>
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'help-text');
    });
  });

  // Performance tests
  describe('Performance', () => {
    it('renders within performance budget', async () => {
      const component = <Input placeholder="Performance test" />;
      
      const { averageRenderTime } = await testComponentPerformance(component, {
        maxRenderTime: 30, // 30ms max render time
        iterations: 5,
      });
      
      expect(averageRenderTime).toBeLessThan(30);
    });

    it('handles rapid typing without performance issues', async () => {
      const handleChange = jest.fn();
      const { user } = renderWithProviders(
        <Input onChange={handleChange} />
      );
      
      const input = screen.getByRole('textbox');
      const startTime = performance.now();
      
      // Simulate rapid typing
      await user.type(input, 'rapid typing test with many characters');
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(2000); // Should complete within 2 seconds
      expect(handleChange).toHaveBeenCalled();
    });
  });

  // Visual regression tests
  describe('Visual Regression', () => {
    it('matches snapshot for default input', () => {
      const { container } = renderWithProviders(<Input placeholder="Default input" />);
      testVisualRegression(container, 'input-default');
    });

    it('matches snapshot for disabled input', () => {
      const { container } = renderWithProviders(<Input disabled placeholder="Disabled input" />);
      testVisualRegression(container, 'input-disabled');
    });

    it('matches snapshot for invalid input', () => {
      const { container } = renderWithProviders(
        <Input aria-invalid="true" placeholder="Invalid input" />
      );
      testVisualRegression(container, 'input-invalid');
    });

    it('matches snapshot for different input types', () => {
      const { container } = renderWithProviders(
        <div>
          <Input type="text" placeholder="Text input" />
          <Input type="email" placeholder="Email input" />
          <Input type="password" placeholder="Password input" />
          <Input type="number" placeholder="Number input" />
        </div>
      );
      testVisualRegression(container, 'input-types');
    });
  });

  // Form integration tests
  describe('Form Integration', () => {
    it('works with form submission', async () => {
      const handleSubmit = jest.fn(e => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        return formData.get('test-input');
      });
      
      const { user } = renderWithProviders(
        <form onSubmit={handleSubmit}>
          <Input name="test-input" />
          <button type="submit">Submit</button>
        </form>
      );
      
      const input = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /submit/i });
      
      await user.type(input, 'test value');
      await user.click(submitButton);
      
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('works with form validation', async () => {
      const { user } = renderWithProviders(
        <form>
          <Input required name="required-field" />
          <button type="submit">Submit</button>
        </form>
      );
      
      const submitButton = screen.getByRole('button', { name: /submit/i });
      
      await testFormValidation(user, submitButton, ['This field is required']);
    });

    it('handles form reset', async () => {
      const { user } = renderWithProviders(
        <form>
          <Input defaultValue="initial value" />
          <button type="reset">Reset</button>
        </form>
      );
      
      const input = screen.getByRole('textbox');
      const resetButton = screen.getByRole('button', { name: /reset/i });
      
      await user.clear(input);
      await user.type(input, 'changed value');
      expect(input).toHaveValue('changed value');
      
      await user.click(resetButton);
      expect(input).toHaveValue('initial value');
    });
  });

  // Error handling tests
  describe('Error Handling', () => {
    it('handles invalid type gracefully', () => {
      // @ts-expect-error Testing invalid prop
      renderWithProviders(<Input type="invalid-type" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('handles null/undefined values gracefully', () => {
      renderWithProviders(<Input value={undefined} onChange={() => {}} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('');
    });
  });

  // Custom props tests
  describe('Custom Props', () => {
    it('forwards custom props to input element', () => {
      renderWithProviders(
        <Input 
          data-testid="custom-input" 
          autoComplete="email"
          maxLength={50}
        />
      );
      
      const input = screen.getByTestId('custom-input');
      expect(input).toHaveAttribute('autocomplete', 'email');
      expect(input).toHaveAttribute('maxlength', '50');
    });

    it('applies custom className', () => {
      renderWithProviders(<Input className="custom-input-class" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-input-class');
    });

    it('supports ref forwarding', () => {
      const ref = React.createRef<HTMLInputElement>();
      renderWithProviders(<Input ref={ref} />);
      
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });

  // Focus and blur tests
  describe('Focus and Blur', () => {
    it('handles focus events', async () => {
      const handleFocus = jest.fn();
      const { user } = renderWithProviders(<Input onFocus={handleFocus} />);
      
      const input = screen.getByRole('textbox');
      await user.click(input);
      
      expect(handleFocus).toHaveBeenCalledTimes(1);
      expect(input).toHaveFocus();
    });

    it('handles blur events', async () => {
      const handleBlur = jest.fn();
      const { user } = renderWithProviders(<Input onBlur={handleBlur} />);
      
      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.tab();
      
      expect(handleBlur).toHaveBeenCalledTimes(1);
      expect(input).not.toHaveFocus();
    });
  });
});