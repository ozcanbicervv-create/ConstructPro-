'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Typography } from '../../atoms/Typography';

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'sm' | 'md' | 'lg';
}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(({
  children,
  className,
  as = 'h3',
  size = 'md',
  ...props
}, ref) => {
  const getVariant = () => {
    switch (size) {
      case 'sm':
        return 'heading-sm';
      case 'lg':
        return 'heading-lg';
      default:
        return 'heading-md';
    }
  };

  return (
    <Typography
      ref={ref}
      as={as}
      variant={getVariant()}
      className={cn(
        'font-semibold leading-none tracking-tight text-gray-900 dark:text-white',
        className
      )}
      {...props}
    >
      {children}
    </Typography>
  );
});

CardTitle.displayName = 'CardTitle';

export default CardTitle;