/**
 * Typography Atom Component
 * 
 * A modern typography component with bold styling, gradient effects, and construction-specific formatting
 */

import { motion } from 'framer-motion';
import React, { forwardRef } from 'react';

import { TypographyProps, ConstructionTextProps } from '../../types';
import { cn, createVariants } from '../../utils/classNames';

// Typography variant styles with modern bold styling
const typographyVariants = {
  variant: {
    display: 'font-display font-black tracking-tighter leading-none',
    heading: 'font-display font-bold tracking-tight leading-tight',
    body: 'font-primary font-normal tracking-normal leading-normal',
    caption: 'font-primary font-medium tracking-wide leading-snug text-sm',
    overline: 'font-primary font-bold tracking-widest uppercase leading-none text-xs',
  },
  size: {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
    '6xl': 'text-6xl',
    '7xl': 'text-7xl',
    '8xl': 'text-8xl',
    '9xl': 'text-9xl',
  },
  weight: {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
    black: 'font-black',
  },
  color: {
    primary: 'text-brand-gray-900 dark:text-brand-gray-100',
    secondary: 'text-brand-gray-700 dark:text-brand-gray-300',
    muted: 'text-brand-gray-500 dark:text-brand-gray-400',
    accent: 'text-brand-blue-600 dark:text-brand-blue-400',
    success: 'text-success-600 dark:text-success-400',
    warning: 'text-warning-600 dark:text-warning-400',
    error: 'text-red-600 dark:text-red-400',
    info: 'text-brand-blue-600 dark:text-brand-blue-400',
  },
  align: {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  },
  gradient: {
    primary: 'bg-gradient-to-r from-brand-blue-600 to-brand-blue-800 bg-clip-text text-transparent',
    secondary: 'bg-gradient-to-r from-brand-orange-600 to-brand-orange-800 bg-clip-text text-transparent',
    success: 'bg-gradient-to-r from-success-600 to-success-800 bg-clip-text text-transparent',
    brand: 'bg-gradient-to-r from-brand-blue-600 via-brand-orange-600 to-brand-blue-800 bg-clip-text text-transparent',
  },
};

// Responsive size mappings
const responsiveSizes = {
  xs: 'text-xs sm:text-sm',
  sm: 'text-sm sm:text-base',
  md: 'text-base sm:text-lg',
  lg: 'text-lg sm:text-xl',
  xl: 'text-xl sm:text-2xl',
  '2xl': 'text-xl sm:text-2xl md:text-3xl',
  '3xl': 'text-2xl sm:text-3xl md:text-4xl',
  '4xl': 'text-3xl sm:text-4xl md:text-5xl',
  '5xl': 'text-4xl sm:text-5xl md:text-6xl',
  '6xl': 'text-5xl sm:text-6xl md:text-7xl',
  '7xl': 'text-6xl sm:text-7xl md:text-8xl',
  '8xl': 'text-7xl sm:text-8xl md:text-9xl',
  '9xl': 'text-8xl sm:text-9xl',
};

const Typography = forwardRef<HTMLElement, TypographyProps>(
  (
    {
      className,
      variant = 'body',
      size = 'md',
      weight,
      color = 'primary',
      align = 'left',
      gradient = false,
      responsive = false,
      truncate = false,
      uppercase = false,
      italic = false,
      underline = false,
      as: Component = 'p',
      children,
      ...props
    },
    ref
  ) => {
    // Determine default weight based on variant
    const defaultWeight = weight || (
      variant === 'display' ? 'black' : 
      variant === 'heading' ? 'bold' : 
      variant === 'overline' ? 'bold' :
      'normal'
    );

    // Build class names
    const baseClasses = cn(
      'transition-all duration-300 ease-in-out-back',
      // Truncation
      truncate && 'truncate',
      // Text decorations
      uppercase && 'uppercase',
      italic && 'italic',
      underline && 'underline decoration-2 underline-offset-4',
      // Hover effects for interactive elements
      'hover:scale-[1.02] hover:transition-transform',
      className
    );

    // Apply gradient or regular color
    const colorClass = gradient && typeof gradient === 'string' 
      ? typographyVariants.gradient[gradient as keyof typeof typographyVariants.gradient]
      : gradient === true 
        ? typographyVariants.gradient.primary
        : typographyVariants.color[color];

    // Apply responsive or fixed size
    const sizeClass = responsive 
      ? responsiveSizes[size as keyof typeof responsiveSizes] || responsiveSizes.md
      : typographyVariants.size[size as keyof typeof typographyVariants.size];

    const variantClasses = cn(
      baseClasses,
      typographyVariants.variant[variant],
      sizeClass,
      typographyVariants.weight[defaultWeight],
      colorClass,
      typographyVariants.align[align]
    );

    const MotionComponent = motion.create(Component as any);

    return (
      <MotionComponent
        ref={ref}
        className={variantClasses}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.4, 
          ease: [0.4, 0, 0.2, 1],
          delay: 0.1 
        }}
        whileHover={gradient ? { 
          scale: 1.05,
          transition: { duration: 0.2 }
        } : undefined}
        {...props}
      >
        {children}
      </MotionComponent>
    );
  }
);

Typography.displayName = 'Typography';

// Construction-specific text formatting component
const ConstructionText = forwardRef<HTMLSpanElement, ConstructionTextProps>(
  (
    {
      className,
      type,
      value,
      unit,
      precision = 2,
      locale = 'en-US',
      currency = 'USD',
      showUnit = true,
      compact = false,
      children,
      ...props
    },
    ref
  ) => {
    const formatValue = (val: number | string, formatType: string): string => {
      const numValue = typeof val === 'string' ? parseFloat(val) : val;
      
      if (isNaN(numValue)) {return String(val);}

      switch (formatType) {
        case 'currency':
          return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
            minimumFractionDigits: precision,
            maximumFractionDigits: precision,
            notation: compact ? 'compact' : 'standard',
          }).format(numValue);

        case 'percentage':
          return new Intl.NumberFormat(locale, {
            style: 'percent',
            minimumFractionDigits: precision,
            maximumFractionDigits: precision,
          }).format(numValue / 100);

        case 'measurement':
        case 'area':
        case 'volume':
        case 'weight':
          const formattedNum = new Intl.NumberFormat(locale, {
            minimumFractionDigits: precision,
            maximumFractionDigits: precision,
            notation: compact ? 'compact' : 'standard',
          }).format(numValue);
          return showUnit && unit ? `${formattedNum} ${unit}` : formattedNum;

        case 'duration':
          // Format duration in hours, minutes, seconds
          const hours = Math.floor(numValue / 3600);
          const minutes = Math.floor((numValue % 3600) / 60);
          const seconds = numValue % 60;
          
          if (hours > 0) {
            return `${hours}h ${minutes}m`;
          } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
          } else {
            return `${seconds}s`;
          }

        default:
          return new Intl.NumberFormat(locale, {
            minimumFractionDigits: precision,
            maximumFractionDigits: precision,
          }).format(numValue);
      }
    };

    const getTypeColor = (formatType: string): string => {
      switch (formatType) {
        case 'currency':
          return 'text-success-600 dark:text-success-400';
        case 'percentage':
          return 'text-brand-blue-600 dark:text-brand-blue-400';
        case 'measurement':
        case 'area':
        case 'volume':
        case 'weight':
          return 'text-brand-orange-600 dark:text-brand-orange-400';
        case 'duration':
          return 'text-warning-600 dark:text-warning-400';
        default:
          return 'text-brand-gray-900 dark:text-brand-gray-100';
      }
    };

    const formattedValue = formatValue(value, type);
    const typeColor = getTypeColor(type);

    return (
      <motion.span
        ref={ref}
        className={cn(
          'font-mono font-semibold tabular-nums',
          typeColor,
          'transition-colors duration-200',
          className
        )}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        {...props}
      >
        {formattedValue}
        {children}
      </motion.span>
    );
  }
);

ConstructionText.displayName = 'ConstructionText';

export { Typography, ConstructionText };
export type { TypographyProps, ConstructionTextProps };