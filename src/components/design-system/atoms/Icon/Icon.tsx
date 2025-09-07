import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const iconVariants = cva(
  'inline-flex items-center justify-center transition-all duration-200',
  {
    variants: {
      size: {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
        xl: 'h-8 w-8',
        '2xl': 'h-10 w-10',
        '3xl': 'h-12 w-12',
      },
      color: {
        default: 'text-current',
        primary: 'text-blue-600',
        secondary: 'text-gray-600',
        success: 'text-green-600',
        warning: 'text-yellow-600',
        danger: 'text-red-600',
        muted: 'text-gray-400',
        white: 'text-white',
      },
      animation: {
        none: '',
        spin: 'animate-spin',
        pulse: 'animate-pulse',
        bounce: 'animate-bounce',
        ping: 'animate-ping',
        wiggle: 'animate-[wiggle_1s_ease-in-out_infinite]',
      },
    },
    defaultVariants: {
      size: 'md',
      color: 'default',
      animation: 'none',
    },
  }
);

export interface IconProps extends VariantProps<typeof iconVariants> {
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  role?: string;
  title?: string;
}

export const Icon = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ 
    children, 
    className, 
    size, 
    color, 
    animation,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    role = 'img',
    title,
    ...props 
  }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(iconVariants({ size, color, animation }), className)}
        role={role}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        title={title}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Icon.displayName = 'Icon';