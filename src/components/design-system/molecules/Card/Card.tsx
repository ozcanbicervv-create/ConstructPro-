'use client';

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  interactive?: boolean;
  className?: string;
  asChild?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  interactive = false,
  className,
  asChild = false,
  ...props
}, ref) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'glass':
        return 'bg-white/10 backdrop-blur-md border border-white/20 shadow-lg';
      case 'elevated':
        return 'bg-white dark:bg-gray-900 border-0 shadow-xl shadow-gray-900/10 dark:shadow-black/20';
      case 'outlined':
        return 'bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 shadow-none';
      case 'flat':
        return 'bg-gray-50 dark:bg-gray-800 border-0 shadow-none';
      default:
        return 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm';
    }
  };

  const getPaddingClasses = () => {
    switch (padding) {
      case 'none':
        return 'p-0';
      case 'sm':
        return 'p-3';
      case 'md':
        return 'p-4';
      case 'lg':
        return 'p-6';
      case 'xl':
        return 'p-8';
      default:
        return 'p-4';
    }
  };

  const getHoverClasses = () => {
    if (!hover && !interactive) return '';
    
    return cn(
      'transition-all duration-200 ease-in-out',
      'hover:shadow-lg hover:-translate-y-1',
      variant === 'glass' && 'hover:bg-white/15 hover:border-white/30',
      variant === 'elevated' && 'hover:shadow-2xl hover:shadow-gray-900/15',
      variant === 'outlined' && 'hover:border-gray-300 dark:hover:border-gray-700',
      variant === 'flat' && 'hover:bg-gray-100 dark:hover:bg-gray-700',
      variant === 'default' && 'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700'
    );
  };

  const getInteractiveClasses = () => {
    if (!interactive) return '';
    
    return cn(
      'cursor-pointer select-none',
      'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2',
      'active:scale-[0.98] active:shadow-sm',
      'dark:focus:ring-offset-gray-900'
    );
  };

  const cardClasses = cn(
    'rounded-xl overflow-hidden',
    getVariantClasses(),
    getPaddingClasses(),
    getHoverClasses(),
    getInteractiveClasses(),
    className
  );

  if (asChild) {
    return (
      <div ref={ref} className={cardClasses} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={cardClasses}
      initial={false}
      whileHover={hover || interactive ? { y: -2 } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Card.displayName = 'Card';

export default Card;