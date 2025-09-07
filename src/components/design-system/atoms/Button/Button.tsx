/**
 * Button Atom Component
 * 
 * A modern button component with comprehensive variants, animations, and accessibility features
 * Supports primary, secondary, outline, ghost, and destructive variants
 * Includes proper touch targets for mobile and micro-animations
 */

import { motion, AnimatePresence } from 'framer-motion';
import React, { forwardRef } from 'react';

import { ButtonProps } from '../../types';
import { cn } from '../../utils/classNames';

// Enhanced motion props with micro-animations
const buttonMotionProps = {
  whileHover: { 
    scale: 1.02,
    transition: { duration: 0.15, ease: "easeOut" }
  },
  whileTap: { 
    scale: 0.98,
    transition: { duration: 0.1, ease: "easeInOut" }
  },
  initial: { opacity: 0, y: 2 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2, ease: "easeOut" },
};

// Loading spinner animation
const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// Ripple effect animation
const rippleVariants = {
  initial: { scale: 0, opacity: 0.5 },
  animate: { scale: 4, opacity: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      children,
      disabled,
      'data-testid': testId,
      ...props
    },
    ref
  ) => {
    // Base classes with comprehensive styling
    const baseClasses = cn(
      // Core layout and typography
      'inline-flex items-center justify-center gap-2',
      'font-medium rounded-lg transition-all duration-200',
      'relative overflow-hidden select-none',
      
      // Focus and accessibility
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'focus-visible:ring-2 focus-visible:ring-offset-2',
      
      // Disabled states
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
      'disabled:shadow-none disabled:transform-none',
      
      // Loading state
      loading && 'cursor-wait',
      
      // Full width
      fullWidth && 'w-full',
      
      // Variant-specific styles
      variant === 'primary' && [
        'bg-gradient-to-r from-blue-600 to-blue-700',
        'text-white shadow-md hover:shadow-lg',
        'hover:from-blue-700 hover:to-blue-800',
        'focus:ring-blue-500 focus-visible:ring-blue-500',
        'active:from-blue-800 active:to-blue-900',
        'border-0'
      ],
      variant === 'secondary' && [
        'bg-gray-100 text-gray-900 border border-gray-200',
        'hover:bg-gray-200 hover:border-gray-300',
        'focus:ring-gray-500 focus-visible:ring-gray-500',
        'active:bg-gray-300',
        'shadow-sm hover:shadow-md'
      ],
      variant === 'outline' && [
        'bg-transparent text-blue-600 border border-blue-600',
        'hover:bg-blue-50 hover:border-blue-700',
        'focus:ring-blue-500 focus-visible:ring-blue-500',
        'active:bg-blue-100',
        'shadow-sm hover:shadow-md'
      ],
      variant === 'ghost' && [
        'bg-transparent text-gray-700 border-0',
        'hover:bg-gray-100 hover:text-gray-900',
        'focus:ring-gray-500 focus-visible:ring-gray-500',
        'active:bg-gray-200'
      ],
      variant === 'destructive' && [
        'bg-gradient-to-r from-red-600 to-red-700',
        'text-white shadow-md hover:shadow-lg',
        'hover:from-red-700 hover:to-red-800',
        'focus:ring-red-500 focus-visible:ring-red-500',
        'active:from-red-800 active:to-red-900',
        'border-0'
      ],
      
      // Size-specific styles with proper touch targets
      size === 'xs' && 'px-2 py-1 text-xs h-7 min-w-[44px]', // 44px minimum for touch
      size === 'sm' && 'px-3 py-1.5 text-sm h-8 min-w-[44px]',
      size === 'md' && 'px-4 py-2 text-base h-10 min-w-[44px]',
      size === 'lg' && 'px-6 py-3 text-lg h-12 min-w-[48px]',
      size === 'xl' && 'px-8 py-4 text-xl h-14 min-w-[56px]',
      
      className
    );

    // Icon sizing based on button size
    const getIconSize = () => {
      switch (size) {
        case 'xs': return 'w-3 h-3';
        case 'sm': return 'w-4 h-4';
        case 'md': return 'w-4 h-4';
        case 'lg': return 'w-5 h-5';
        case 'xl': return 'w-6 h-6';
        default: return 'w-4 h-4';
      }
    };

    const iconElement = icon && (
      <span className={cn('flex items-center justify-center shrink-0', getIconSize())}>
        {icon}
      </span>
    );

    const loadingSpinner = (
      <motion.div
        className={cn(
          'rounded-full border-2 border-current border-t-transparent shrink-0',
          getIconSize()
        )}
        variants={spinnerVariants}
        animate="animate"
        data-testid="button-spinner"
      />
    );

    return (
      <motion.button
        ref={ref}
        className={baseClasses}
        disabled={disabled || loading}
        data-testid={testId}
        {...buttonMotionProps}
        {...props}
      >
        {/* Loading state */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center"
            >
              {loadingSpinner}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Content container */}
        <motion.div
          className={cn(
            'flex items-center justify-center gap-2',
            loading && 'opacity-0'
          )}
          animate={{ opacity: loading ? 0 : 1 }}
          transition={{ duration: 0.15 }}
        >
          {/* Icon - left position */}
          {icon && iconPosition === 'left' && iconElement}
          
          {/* Button text content */}
          {children && (
            <span className="flex items-center justify-center whitespace-nowrap">
              {children}
            </span>
          )}
          
          {/* Icon - right position */}
          {icon && iconPosition === 'right' && iconElement}
        </motion.div>
        
        {/* Enhanced ripple effect overlay */}
        <span className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
          <span className={cn(
            'absolute inset-0 transition-opacity duration-200',
            variant === 'primary' && 'bg-white opacity-0 hover:opacity-10',
            variant === 'secondary' && 'bg-gray-900 opacity-0 hover:opacity-5',
            variant === 'outline' && 'bg-blue-600 opacity-0 hover:opacity-5',
            variant === 'ghost' && 'bg-gray-900 opacity-0 hover:opacity-5',
            variant === 'destructive' && 'bg-white opacity-0 hover:opacity-10'
          )} />
        </span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };