/**
 * Accessible Button Component
 * Enhanced button with comprehensive accessibility features
 */

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { useAccessibility } from "@/lib/accessibility";
import { cn } from "@/lib/utils";

const accessibleButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
      accessibility: {
        default: "",
        enhanced: "ring-2 ring-offset-2 ring-offset-background focus-visible:ring-4",
        high_contrast: "border-2 border-foreground bg-background text-foreground hover:bg-foreground hover:text-background",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      accessibility: "default",
    },
  }
);

export interface AccessibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof accessibleButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  description?: string;
  shortcut?: string;
  announceOnClick?: string;
}

const AccessibleButton = React.forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    loadingText = "Loading...",
    description,
    shortcut,
    announceOnClick,
    children,
    onClick,
    disabled,
    ...props 
  }, ref) => {
    const { preferences, screenReader } = useAccessibility();
    const [isPressed, setIsPressed] = React.useState(false);
    
    // Determine accessibility variant based on preferences
    const accessibilityVariant = React.useMemo(() => {
      if (preferences.theme === 'high-contrast') {return 'high_contrast';}
      if (preferences.focusIndicators) {return 'enhanced';}
      return 'default';
    }, [preferences.theme, preferences.focusIndicators]);

    const Comp = asChild ? Slot : "button";

    const handleClick = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) {return;}
      
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 150);
      
      // Announce action to screen readers
      if (announceOnClick) {
        screenReader.announce(announceOnClick);
      }
      
      // Add click delay if configured
      if (preferences.clickDelay > 0) {
        setTimeout(() => {
          onClick?.(e);
        }, preferences.clickDelay);
      } else {
        onClick?.(e);
      }
    }, [loading, disabled, announceOnClick, screenReader, preferences.clickDelay, onClick]);

    const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLButtonElement>) => {
      // Enhanced keyboard support
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick(e as any);
      }
      
      props.onKeyDown?.(e);
    }, [handleClick, props]);

    // Build ARIA attributes
    const ariaAttributes = React.useMemo(() => {
      const attrs: Record<string, any> = {
        'aria-disabled': loading || disabled,
        'aria-pressed': isPressed,
      };

      if (description) {
        attrs['aria-describedby'] = `${props.id || 'button'}-description`;
      }

      if (loading) {
        attrs['aria-busy'] = true;
        attrs['aria-live'] = 'polite';
      }

      return attrs;
    }, [loading, disabled, isPressed, description, props.id]);

    return (
      <div className="relative">
        <Comp
          className={cn(
            accessibleButtonVariants({ 
              variant, 
              size, 
              accessibility: accessibilityVariant 
            }), 
            loading && "cursor-not-allowed opacity-70",
            className
          )}
          ref={ref}
          disabled={loading || disabled}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          {...ariaAttributes}
          {...props}
        >
          {loading ? (
            <>
              <svg
                className="mr-2 h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="sr-only">{loadingText}</span>
              {loadingText}
            </>
          ) : (
            children
          )}
          
          {shortcut && (
            <kbd className="ml-2 hidden rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-muted-foreground sm:inline-block">
              {shortcut}
            </kbd>
          )}
        </Comp>
        
        {description && (
          <div
            id={`${props.id || 'button'}-description`}
            className="sr-only"
          >
            {description}
          </div>
        )}
      </div>
    );
  }
);

AccessibleButton.displayName = "AccessibleButton";

export { AccessibleButton, accessibleButtonVariants };