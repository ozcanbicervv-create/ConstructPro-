'use client';

import React, { forwardRef } from 'react';

import { cn } from '@/lib/utils';

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  divider?: boolean;
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(({
  children,
  className,
  divider = false,
  justify = 'end',
  ...props
}, ref) => {
  const getJustifyClasses = () => {
    switch (justify) {
      case 'start':
        return 'justify-start';
      case 'center':
        return 'justify-center';
      case 'end':
        return 'justify-end';
      case 'between':
        return 'justify-between';
      case 'around':
        return 'justify-around';
      default:
        return 'justify-end';
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center gap-2',
        getJustifyClasses(),
        divider && 'pt-4 border-t border-gray-200 dark:border-gray-800',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

CardFooter.displayName = 'CardFooter';

export default CardFooter;