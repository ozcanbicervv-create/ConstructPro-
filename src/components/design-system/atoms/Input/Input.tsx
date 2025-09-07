/**
 * Input Atom Component
 * 
 * A foundational input component with modern styling and validation
 */

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn, createVariants } from '../../utils/classNames';
import { InputProps } from '../../types';

// Input variant styles
const inputVariants = {
  variant: {
    default: 'bg-white border border-brand-gray-300 focus:border-brand-blue-500 focus:ring-brand-blue-500',
    filled: 'bg-brand-gray-50 border border-transparent focus:bg-white focus:border-brand-blue-500 focus:ring-brand-blue-500',
    glass: 'bg-white/80 backdrop-blur-sm border border-brand-gray-200/50 focus:border-brand-blue-500 focus:ring-brand-blue-500',
  },
  size: {
    xs: 'px-2 py-1 text-xs h-6',
    sm: 'px-3 py-1.5 text-sm h-8',
    md: 'px-4 py-2 text-base h-10',
    lg: 'px-4 py-3 text-lg h-12',
    xl: 'px-6 py-4 text-xl h-14',
  },
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      error,
      helper,
      icon,
      iconPosition = 'left',
      label,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = cn(
      // Base styles
      'w-full rounded-lg transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-1',
      'placeholder:text-brand-gray-400',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      
      // Error state
      error && 'border-error focus:border-error focus:ring-error',
      
      className
    );

    const variantClasses = createVariants(baseClasses, inputVariants, {
      variant,
      size,
    });

    const iconElement = icon && (
      <span className={cn(
        'absolute flex items-center justify-center text-brand-gray-400',
        iconPosition === 'left' ? 'left-3' : 'right-3',
        size === 'xs' && 'w-3 h-3',
        size === 'sm' && 'w-4 h-4',
        size === 'md' && 'w-4 h-4',
        size === 'lg' && 'w-5 h-5',
        size === 'xl' && 'w-6 h-6'
      )}>
        {icon}
      </span>
    );

    const inputElement = (
      <motion.input
        ref={ref}
        className={cn(
          variantClasses,
          icon && iconPosition === 'left' && 'pl-10',
          icon && iconPosition === 'right' && 'pr-10'
        )}
        disabled={disabled}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        {...props}
      />
    );

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <motion.label
            className="block text-sm font-medium text-brand-gray-700 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            {label}
          </motion.label>
        )}
        
        {/* Input container */}
        <div className="relative">
          {inputElement}
          {iconElement}
        </div>
        
        {/* Helper text or error */}
        {(helper || error) && (
          <motion.p
            className={cn(
              'mt-2 text-sm',
              error ? 'text-error' : 'text-brand-gray-500'
            )}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            {error || helper}
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };