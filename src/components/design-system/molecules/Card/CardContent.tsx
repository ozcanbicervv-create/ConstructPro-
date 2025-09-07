'use client';

import React, { forwardRef } from 'react';

import { cn } from '@/lib/utils';

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(({
  children,
  className,
  padding = 'none',
  ...props
}, ref) => {
  const getPaddingClasses = () => {
    switch (padding) {
      case 'sm':
        return 'pt-2';
      case 'md':
        return 'pt-4';
      case 'lg':
        return 'pt-6';
      default:
        return '';
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        getPaddingClasses(),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

CardContent.displayName = 'CardContent';

export default CardContent;