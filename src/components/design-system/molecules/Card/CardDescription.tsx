'use client';

import React, { forwardRef } from 'react';

import { cn } from '@/lib/utils';

import { Typography } from '../../atoms/Typography';

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(({
  children,
  className,
  size = 'sm',
  ...props
}, ref) => {
  const getVariant = () => {
    switch (size) {
      case 'md':
        return 'body';
      default:
        return 'body-sm';
    }
  };

  return (
    <Typography
      ref={ref}
      as="p"
      variant={getVariant()}
      className={cn(
        'text-gray-600 dark:text-gray-400',
        className
      )}
      {...props}
    >
      {children}
    </Typography>
  );
});

CardDescription.displayName = 'CardDescription';

export default CardDescription;