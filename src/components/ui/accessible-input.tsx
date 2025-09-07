/**
 * Accessible Input Component
 * Enhanced input with comprehensive accessibility features
 */

import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import * as React from "react";

import { useAccessibility } from "@/lib/accessibility";
import { cn } from "@/lib/utils";


const accessibleInputVariants = cva(
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "",
        filled: "bg-muted border-0",
        glass: "bg-background/50 backdrop-blur-sm border-white/20",
      },
      state: {
        default: "",
        error: "border-destructive focus-visible:ring-destructive",
        success: "border-green-500 focus-visible:ring-green-500",
        warning: "border-yellow-500 focus-visible:ring-yellow-500",
      },
      accessibility: {
        default: "",
        enhanced: "focus-visible:ring-4 focus-visible:ring-offset-4",
        high_contrast: "border-2 border-foreground bg-background text-foreground",
      }
    },
    defaultVariants: {
      variant: "default",
      state: "default",
      accessibility: "default",
    },
  }
);

export interface AccessibleInputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof accessibleInputVariants> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  warning?: string;
  showPasswordToggle?: boolean;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
  characterCount?: boolean;
  maxLength?: number;
  announceChanges?: boolean;
}

const AccessibleInput = React.forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({
    className,
    variant,
    state,
    type = "text",
    label,
    description,
    error,
    success,
    warning,
    showPasswordToggle = false,
    icon,
    suffix,
    characterCount = false,
    maxLength,
    announceChanges = false,
    id,
    value,
    onChange,
    ...props
  }, ref) => {
    const { preferences, screenReader } = useAccessibility();
    const [showPassword, setShowPassword] = React.useState(false);
    const [charCount, setCharCount] = React.useState(0);
    const inputId = id || React.useId();
    const descriptionId = `${inputId}-description`;
    const errorId = `${inputId}-error`;
    const successId = `${inputId}-success`;
    const warningId = `${inputId}-warning`;

    // Determine accessibility variant based on preferences
    const accessibilityVariant = React.useMemo(() => {
      if (preferences.theme === 'high-contrast') {return 'high_contrast';}
      if (preferences.focusIndicators) {return 'enhanced';}
      return 'default';
    }, [preferences.theme, preferences.focusIndicators]);

    // Determine input state
    const inputState = React.useMemo(() => {
      if (error) {return 'error';}
      if (success) {return 'success';}
      if (warning) {return 'warning';}
      return 'default';
    }, [error, success, warning]);

    const inputType = showPasswordToggle && showPassword ? 'text' : type;

    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setCharCount(newValue.length);
      
      // Announce changes for screen readers if enabled
      if (announceChanges && newValue !== value) {
        const announcement = `Input changed to: ${newValue}`;
        screenReader.announce(announcement, 'polite');
      }
      
      onChange?.(e);
    }, [announceChanges, value, onChange, screenReader]);

    const togglePasswordVisibility = React.useCallback(() => {
      setShowPassword(prev => {
        const newState = !prev;
        screenReader.announce(
          newState ? 'Password visible' : 'Password hidden',
          'polite'
        );
        return newState;
      });
    }, [screenReader]);

    // Build ARIA attributes
    const ariaAttributes = React.useMemo(() => {
      const attrs: Record<string, any> = {};
      const describedBy: string[] = [];

      if (description) {describedBy.push(descriptionId);}
      if (error) {describedBy.push(errorId);}
      if (success) {describedBy.push(successId);}
      if (warning) {describedBy.push(warningId);}

      if (describedBy.length > 0) {
        attrs['aria-describedby'] = describedBy.join(' ');
      }

      if (error) {
        attrs['aria-invalid'] = true;
      }

      if (props.required) {
        attrs['aria-required'] = true;
      }

      return attrs;
    }, [description, error, success, warning, descriptionId, errorId, successId, warningId, props.required]);

    React.useEffect(() => {
      if (typeof value === 'string') {
        setCharCount(value.length);
      }
    }, [value]);

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
            {props.required && (
              <span className="ml-1 text-destructive" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}

          <input
            type={inputType}
            className={cn(
              accessibleInputVariants({
                variant,
                state: inputState,
                accessibility: accessibilityVariant,
              }),
              icon && "pl-10",
              (showPasswordToggle || suffix) && "pr-10",
              className
            )}
            ref={ref}
            id={inputId}
            value={value}
            onChange={handleChange}
            maxLength={maxLength}
            {...ariaAttributes}
            {...props}
          />

          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={0}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}

          {suffix && !showPasswordToggle && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {suffix}
            </div>
          )}

          {/* State indicators */}
          {error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive">
              <AlertCircle className="h-4 w-4" />
            </div>
          )}
          {success && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
              <CheckCircle className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Description */}
        {description && (
          <p
            id={descriptionId}
            className="text-sm text-muted-foreground"
          >
            {description}
          </p>
        )}

        {/* Error message */}
        {error && (
          <p
            id={errorId}
            className="text-sm text-destructive flex items-center gap-1"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}

        {/* Success message */}
        {success && (
          <p
            id={successId}
            className="text-sm text-green-600 flex items-center gap-1"
            role="status"
            aria-live="polite"
          >
            <CheckCircle className="h-3 w-3" />
            {success}
          </p>
        )}

        {/* Warning message */}
        {warning && (
          <p
            id={warningId}
            className="text-sm text-yellow-600 flex items-center gap-1"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="h-3 w-3" />
            {warning}
          </p>
        )}

        {/* Character count */}
        {characterCount && maxLength && (
          <div className="flex justify-end">
            <span
              className={cn(
                "text-xs text-muted-foreground",
                charCount > maxLength * 0.9 && "text-yellow-600",
                charCount >= maxLength && "text-destructive"
              )}
              aria-live="polite"
              aria-label={`${charCount} of ${maxLength} characters used`}
            >
              {charCount}/{maxLength}
            </span>
          </div>
        )}
      </div>
    );
  }
);

AccessibleInput.displayName = "AccessibleInput";

export { AccessibleInput, accessibleInputVariants };