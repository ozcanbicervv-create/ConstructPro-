/**
 * Class Name Utilities
 * 
 * Utilities for combining and managing CSS class names
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names with proper Tailwind CSS merging
 * 
 * @param inputs - Class names to combine
 * @returns Combined and merged class names
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Creates variant-based class names
 * 
 * @param base - Base class names
 * @param variants - Variant configurations
 * @param props - Component props
 * @returns Combined class names based on variants
 */
export function createVariants<T extends Record<string, any>>(
  base: string,
  variants: Record<keyof T, Record<string, string>>,
  props: T
): string {
  const variantClasses = Object.entries(variants).map(([key, variantMap]) => {
    const value = props[key as keyof T];
    return variantMap[value as string] || '';
  });

  return cn(base, ...variantClasses);
}

/**
 * Creates responsive class names
 * 
 * @param value - Responsive value object
 * @param prefix - Class prefix
 * @returns Responsive class names
 */
export function createResponsiveClasses<T extends string>(
  value: {
    base?: T;
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
    '2xl'?: T;
  },
  prefix: string
): string {
  const classes: string[] = [];

  if (value.base) classes.push(`${prefix}-${value.base}`);
  if (value.sm) classes.push(`sm:${prefix}-${value.sm}`);
  if (value.md) classes.push(`md:${prefix}-${value.md}`);
  if (value.lg) classes.push(`lg:${prefix}-${value.lg}`);
  if (value.xl) classes.push(`xl:${prefix}-${value.xl}`);
  if (value['2xl']) classes.push(`2xl:${prefix}-${value['2xl']}`);

  return classes.join(' ');
}

/**
 * Creates conditional class names
 * 
 * @param condition - Condition to check
 * @param trueClasses - Classes to apply when true
 * @param falseClasses - Classes to apply when false
 * @returns Conditional class names
 */
export function conditionalClasses(
  condition: boolean,
  trueClasses: string,
  falseClasses: string = ''
): string {
  return condition ? trueClasses : falseClasses;
}

/**
 * Creates state-based class names
 * 
 * @param states - State object
 * @param stateClasses - Class mappings for states
 * @returns State-based class names
 */
export function createStateClasses(
  states: Record<string, boolean>,
  stateClasses: Record<string, string>
): string {
  const classes = Object.entries(states)
    .filter(([, isActive]) => isActive)
    .map(([state]) => stateClasses[state] || '')
    .filter(Boolean);

  return classes.join(' ');
}

/**
 * Creates size-based class names
 * 
 * @param size - Size value
 * @param sizeMap - Size to class mapping
 * @returns Size-based class names
 */
export function createSizeClasses(
  size: string,
  sizeMap: Record<string, string>
): string {
  return sizeMap[size] || sizeMap.md || '';
}

/**
 * Creates color-based class names
 * 
 * @param color - Color value
 * @param type - Type of color class (bg, text, border, etc.)
 * @returns Color-based class names
 */
export function createColorClasses(
  color: string,
  type: 'bg' | 'text' | 'border' | 'ring' = 'bg'
): string {
  const colorMap: Record<string, string> = {
    primary: 'brand-blue-600',
    secondary: 'brand-orange-600',
    success: 'success-600',
    warning: 'warning-600',
    error: 'red-600',
    info: 'brand-blue-500',
    muted: 'brand-gray-400',
  };

  const mappedColor = colorMap[color] || color;
  return `${type}-${mappedColor}`;
}

/**
 * Creates animation class names
 * 
 * @param animation - Animation name
 * @param duration - Animation duration
 * @param delay - Animation delay
 * @returns Animation class names
 */
export function createAnimationClasses(
  animation: string,
  duration?: string,
  delay?: string
): string {
  const classes = [`animate-${animation}`];
  
  if (duration) classes.push(`duration-${duration}`);
  if (delay) classes.push(`delay-${delay}`);
  
  return classes.join(' ');
}