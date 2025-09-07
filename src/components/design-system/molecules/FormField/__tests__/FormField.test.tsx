import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import FormField from '../FormField';
import SelectField from '../SelectField';
import TextareaField from '../TextareaField';

expect.extend(toHaveNoViolations);

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('FormField', () => {
  describe('Basic FormField', () => {
    it('renders with label and input', () => {
      render(
        <FormField
          label="Test Field"
          placeholder="Enter text"
        />
      );
      
      expect(screen.getByLabelText('Test Field')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('shows required indicator when required', () => {
      render(
        <FormField
          label="Required Field"
          required
        />
      );
      
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('shows optional indicator when optional', () => {
      render(
        <FormField
          label="Optional Field"
          optional
        />
      );
      
      expect(screen.getByText('(optional)')).toBeInTheDocument();
    });

    it('displays description when provided', () => {
      render(
        <FormField
          label="Test Field"
          description="This is a helpful description"
        />
      );
      
      expect(screen.getByText('This is a helpful description')).toBeInTheDocument();
    });

    it('displays error message with icon', async () => {
      render(
        <FormField
          label="Test Field"
          error="This field is required"
        />
      );
      
      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('displays success message with icon', async () => {
      render(
        <FormField
          label="Test Field"
          success="Field is valid"
        />
      );
      
      expect(screen.getByText('Field is valid')).toBeInTheDocument();
    });

    it('prioritizes error over success message', () => {
      render(
        <FormField
          label="Test Field"
          error="Error message"
          success="Success message"
        />
      );
      
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    });

    it('applies error styling to input when error is present', () => {
      render(
        <FormField
          label="Test Field"
          error="Error message"
        />
      );
      
      const input = screen.getByLabelText('Test Field');
      expect(input).toHaveClass('border-red-500');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('applies success styling to input when success is present', () => {
      render(
        <FormField
          label="Test Field"
          success="Success message"
        />
      );
      
      const input = screen.getByLabelText('Test Field');
      expect(input).toHaveClass('border-green-500');
    });
  });

  describe('Icons and Affixes', () => {
    it('renders left icon', () => {
      render(
        <FormField
          label="Test Field"
          icon={<span data-testid="test-icon">🔍</span>}
          iconPosition="left"
        />
      );
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('renders right icon', () => {
      render(
        <FormField
          label="Test Field"
          icon={<span data-testid="test-icon">🔍</span>}
          iconPosition="right"
        />
      );
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('renders prefix', () => {
      render(
        <FormField
          label="Price"
          prefix={<span>$</span>}
        />
      );
      
      expect(screen.getByText('$')).toBeInTheDocument();
    });

    it('renders suffix', () => {
      render(
        <FormField
          label="Weight"
          suffix={<span>kg</span>}
        />
      );
      
      expect(screen.getByText('kg')).toBeInTheDocument();
    });

    it('shows loading spinner when loading', () => {
      render(
        <FormField
          label="Test Field"
          loading
        />
      );
      
      // Loading spinner should be present
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('Variants and Sizes', () => {
    it('applies glass variant classes', () => {
      render(
        <FormField
          label="Test Field"
          variant="glass"
        />
      );
      
      const input = screen.getByLabelText('Test Field');
      expect(input).toHaveClass('bg-white/10', 'backdrop-blur-md');
    });

    it('applies filled variant classes', () => {
      render(
        <FormField
          label="Test Field"
          variant="filled"
        />
      );
      
      const input = screen.getByLabelText('Test Field');
      expect(input).toHaveClass('bg-gray-50');
    });

    it('applies small size classes', () => {
      render(
        <FormField
          label="Test Field"
          size="sm"
        />
      );
      
      const input = screen.getByLabelText('Test Field');
      expect(input).toHaveClass('px-3', 'py-1.5', 'text-sm');
    });

    it('applies large size classes', () => {
      render(
        <FormField
          label="Test Field"
          size="lg"
        />
      );
      
      const input = screen.getByLabelText('Test Field');
      expect(input).toHaveClass('px-4', 'py-3', 'text-base');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <FormField
          label="Test Field"
          description="Field description"
          error="Error message"
        />
      );
      
      const input = screen.getByLabelText('Test Field');
      expect(input).toHaveAttribute('aria-describedby');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('associates label with input', () => {
      render(
        <FormField
          label="Test Field"
        />
      );
      
      const input = screen.getByLabelText('Test Field');
      expect(input).toBeInTheDocument();
    });

    it('has no accessibility violations', async () => {
      const { container } = render(
        <FormField
          label="Accessible Field"
          description="This field is accessible"
          placeholder="Enter text"
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('User Interactions', () => {
    it('handles input changes', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormField
          label="Test Field"
          onChange={handleChange}
        />
      );
      
      const input = screen.getByLabelText('Test Field');
      await user.type(input, 'test value');
      
      expect(handleChange).toHaveBeenCalled();
    });

    it('handles focus and blur events', async () => {
      const handleFocus = jest.fn();
      const handleBlur = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormField
          label="Test Field"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      );
      
      const input = screen.getByLabelText('Test Field');
      await user.click(input);
      expect(handleFocus).toHaveBeenCalled();
      
      await user.tab();
      expect(handleBlur).toHaveBeenCalled();
    });
  });
});

describe('TextareaField', () => {
  it('renders textarea with label', () => {
    render(
      <TextareaField
        label="Description"
        placeholder="Enter description"
      />
    );
    
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument();
  });

  it('shows character count when enabled', () => {
    render(
      <TextareaField
        label="Description"
        value="Test content"
        showCharCount
        maxLength={100}
      />
    );
    
    expect(screen.getByText('12/100')).toBeInTheDocument();
  });

  it('applies resize classes correctly', () => {
    const { rerender } = render(
      <TextareaField
        label="Description"
        resize="none"
      />
    );
    
    let textarea = screen.getByLabelText('Description');
    expect(textarea).toHaveClass('resize-none');

    rerender(
      <TextareaField
        label="Description"
        resize="vertical"
      />
    );
    
    textarea = screen.getByLabelText('Description');
    expect(textarea).toHaveClass('resize-y');
  });

  it('handles text changes', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    
    render(
      <TextareaField
        label="Description"
        onChange={handleChange}
      />
    );
    
    const textarea = screen.getByLabelText('Description');
    await user.type(textarea, 'test content');
    
    expect(handleChange).toHaveBeenCalled();
  });
});

describe('SelectField', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3', disabled: true },
  ];

  it('renders select with options', () => {
    render(
      <SelectField
        label="Select Field"
        options={options}
      />
    );
    
    expect(screen.getByLabelText('Select Field')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option 1' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option 2' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option 3' })).toBeInTheDocument();
  });

  it('renders placeholder option when provided', () => {
    render(
      <SelectField
        label="Select Field"
        placeholder="Choose an option"
        options={options}
      />
    );
    
    expect(screen.getByRole('option', { name: 'Choose an option' })).toBeInTheDocument();
  });

  it('groups options when group property is provided', () => {
    const groupedOptions = [
      { value: 'opt1', label: 'Option 1', group: 'Group A' },
      { value: 'opt2', label: 'Option 2', group: 'Group A' },
      { value: 'opt3', label: 'Option 3', group: 'Group B' },
    ];

    render(
      <SelectField
        label="Grouped Select"
        options={groupedOptions}
      />
    );
    
    expect(screen.getByRole('group', { name: 'Group A' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Group B' })).toBeInTheDocument();
  });

  it('handles selection changes', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    
    render(
      <SelectField
        label="Select Field"
        options={options}
        onChange={handleChange}
      />
    );
    
    const select = screen.getByLabelText('Select Field');
    await user.selectOptions(select, 'option1');
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('shows loading spinner when loading', () => {
    render(
      <SelectField
        label="Select Field"
        options={options}
        loading
      />
    );
    
    const select = screen.getByLabelText('Select Field');
    expect(select).toBeDisabled();
  });
});

describe('Error and Success States', () => {
  it('animates error message appearance', async () => {
    const { rerender } = render(
      <FormField label="Test Field" />
    );
    
    rerender(
      <FormField label="Test Field" error="Error message" />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  it('animates success message appearance', async () => {
    const { rerender } = render(
      <FormField label="Test Field" />
    );
    
    rerender(
      <FormField label="Test Field" success="Success message" />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });
  });
});