'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';
import { cn } from '@/lib/utils';

// Consistent spacing system
export const spacing = {
  xs: 'space-y-2',
  sm: 'space-y-4',
  md: 'space-y-6',
  lg: 'space-y-8',
  xl: 'space-y-12',
} as const;

export const padding = {
  xs: 'p-2',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-12',
} as const;

export const margin = {
  xs: 'm-2',
  sm: 'm-4',
  md: 'm-6',
  lg: 'm-8',
  xl: 'm-12',
} as const;

// Page container with consistent layout
interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: keyof typeof padding;
}

export function PageContainer({ 
  children, 
  className, 
  maxWidth = 'full',
  padding: paddingSize = 'md'
}: PageContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeInUp}
      className={cn(
        'mx-auto w-full',
        maxWidthClasses[maxWidth],
        padding[paddingSize],
        className
      )}
    >
      {children}
    </motion.div>
  );
}

// Section with consistent spacing and typography
interface SectionProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  spacing?: keyof typeof spacing;
  headerAction?: ReactNode;
}

export function Section({ 
  children, 
  title, 
  subtitle, 
  className, 
  spacing: spacingSize = 'md',
  headerAction
}: SectionProps) {
  return (
    <motion.section
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={cn('w-full', spacing[spacingSize], className)}
    >
      {(title || subtitle || headerAction) && (
        <motion.div 
          variants={staggerItem}
          className="flex items-start justify-between mb-6"
        >
          <div>
            {title && (
              <motion.h2 
                variants={staggerItem}
                className="text-2xl font-bold text-gray-900 mb-2"
              >
                {title}
              </motion.h2>
            )}
            {subtitle && (
              <motion.p 
                variants={staggerItem}
                className="text-gray-600"
              >
                {subtitle}
              </motion.p>
            )}
          </div>
          {headerAction && (
            <motion.div variants={staggerItem}>
              {headerAction}
            </motion.div>
          )}
        </motion.div>
      )}
      <motion.div variants={staggerItem}>
        {children}
      </motion.div>
    </motion.section>
  );
}

// Grid system with consistent spacing
interface GridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  responsive?: boolean;
}

export function Grid({ 
  children, 
  cols = 1, 
  gap = 'md', 
  className,
  responsive = true 
}: GridProps) {
  const colClasses = {
    1: 'grid-cols-1',
    2: responsive ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2',
    3: responsive ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-3',
    4: responsive ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-4',
    6: responsive ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6' : 'grid-cols-6',
    12: 'grid-cols-12',
  };

  const gapClasses = {
    xs: 'gap-2',
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12',
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={cn(
        'grid',
        colClasses[cols],
        gapClasses[gap],
        className
      )}
    >
      {Array.isArray(children) 
        ? children.map((child, index) => (
            <motion.div key={index} variants={staggerItem}>
              {child}
            </motion.div>
          ))
        : <motion.div variants={staggerItem}>{children}</motion.div>
      }
    </motion.div>
  );
}

// Flex layouts with consistent spacing
interface FlexProps {
  children: ReactNode;
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: keyof typeof spacing;
  wrap?: boolean;
  className?: string;
}

export function Flex({ 
  children, 
  direction = 'row', 
  align = 'start',
  justify = 'start',
  gap = 'md',
  wrap = false,
  className 
}: FlexProps) {
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  const gapClasses = {
    xs: direction === 'row' ? 'space-x-2' : 'space-y-2',
    sm: direction === 'row' ? 'space-x-4' : 'space-y-4',
    md: direction === 'row' ? 'space-x-6' : 'space-y-6',
    lg: direction === 'row' ? 'space-x-8' : 'space-y-8',
    xl: direction === 'row' ? 'space-x-12' : 'space-y-12',
  };

  return (
    <div
      className={cn(
        'flex',
        directionClasses[direction],
        alignClasses[align],
        justifyClasses[justify],
        gapClasses[gap],
        wrap && 'flex-wrap',
        className
      )}
    >
      {children}
    </div>
  );
}

// Card with consistent styling and spacing
interface CardProps {
  children: ReactNode;
  padding?: keyof typeof padding;
  className?: string;
  variant?: 'default' | 'outlined' | 'elevated' | 'glass';
  interactive?: boolean;
}

export function Card({ 
  children, 
  padding: paddingSize = 'md', 
  className,
  variant = 'default',
  interactive = false
}: CardProps) {
  const variantClasses = {
    default: 'bg-white border border-gray-200',
    outlined: 'bg-white border-2 border-gray-300',
    elevated: 'bg-white shadow-lg border border-gray-100',
    glass: 'bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl',
  };

  return (
    <motion.div
      className={cn(
        'rounded-lg',
        variantClasses[variant],
        padding[paddingSize],
        interactive && 'cursor-pointer transition-all duration-200 hover:shadow-md',
        className
      )}
      whileHover={interactive ? { y: -2 } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
    >
      {children}
    </motion.div>
  );
}

// Typography components with consistent hierarchy
interface HeadingProps {
  children: ReactNode;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  gradient?: boolean;
}

export function Heading({ children, level, className, gradient = false }: HeadingProps) {
  const Component = `h${level}` as keyof JSX.IntrinsicElements;
  
  const levelClasses = {
    1: 'text-4xl font-bold',
    2: 'text-3xl font-bold',
    3: 'text-2xl font-semibold',
    4: 'text-xl font-semibold',
    5: 'text-lg font-medium',
    6: 'text-base font-medium',
  };

  const gradientClass = gradient 
    ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
    : 'text-gray-900';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Component
        className={cn(
          levelClasses[level],
          gradientClass,
          className
        )}
      >
        {children}
      </Component>
    </motion.div>
  );
}

// Text component with consistent styling
interface TextProps {
  children: ReactNode;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error';
  className?: string;
}

export function Text({ 
  children, 
  size = 'base', 
  weight = 'normal',
  color = 'primary',
  className 
}: TextProps) {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const colorClasses = {
    primary: 'text-gray-900',
    secondary: 'text-gray-700',
    muted: 'text-gray-500',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
  };

  return (
    <p
      className={cn(
        sizeClasses[size],
        weightClasses[weight],
        colorClasses[color],
        className
      )}
    >
      {children}
    </p>
  );
}