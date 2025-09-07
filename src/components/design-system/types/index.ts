/**
 * Design System Types
 * 
 * Centralized type definitions for the entire design system
 */

import { ReactNode, HTMLAttributes, ButtonHTMLAttributes, InputHTMLAttributes } from 'react';

// === BASE TYPES === //
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type Status = 'success' | 'warning' | 'error' | 'info';
export type Theme = 'light' | 'dark' | 'system';

// === COMPONENT PROPS === //
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  'data-testid'?: string;
}

export interface ButtonProps extends BaseComponentProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export interface InputProps extends BaseComponentProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'filled' | 'glass';
  size?: Size;
  error?: string;
  helper?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  label?: string;
}

export interface CardProps extends BaseComponentProps, HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  interactive?: boolean;
}

export interface TypographyProps extends BaseComponentProps {
  variant?: 'display' | 'heading' | 'body' | 'caption' | 'overline';
  size?: Size | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  color?: 'primary' | 'secondary' | 'muted' | 'accent' | 'success' | 'warning' | 'error' | 'info';
  align?: 'left' | 'center' | 'right' | 'justify';
  gradient?: boolean | 'primary' | 'secondary' | 'success' | 'brand';
  responsive?: boolean;
  truncate?: boolean;
  uppercase?: boolean;
  italic?: boolean;
  underline?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

// Construction-specific text formatting types
export interface ConstructionTextProps extends BaseComponentProps {
  type: 'measurement' | 'currency' | 'percentage' | 'area' | 'volume' | 'weight' | 'duration';
  value: number | string;
  unit?: string;
  precision?: number;
  locale?: string;
  currency?: string;
  showUnit?: boolean;
  compact?: boolean;
}

// === CONSTRUCTION-SPECIFIC TYPES === //
export interface ProjectStatus {
  id: string;
  name: string;
  color: string;
  icon: ReactNode;
}

export interface TaskPriority {
  level: 'low' | 'medium' | 'high' | 'critical';
  color: string;
  label: string;
}

export interface MaterialCategory {
  id: string;
  name: string;
  icon: ReactNode;
  color: string;
}

export interface MetricData {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  format?: 'currency' | 'percentage' | 'number' | 'text';
}

// === ANIMATION TYPES === //
export interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: string;
  repeat?: boolean;
}

export interface MotionProps {
  initial?: object;
  animate?: object;
  exit?: object;
  transition?: AnimationConfig;
  whileHover?: object;
  whileTap?: object;
}

// === LAYOUT TYPES === //
export interface LayoutProps extends BaseComponentProps {
  sidebar?: boolean;
  sidebarCollapsed?: boolean;
  header?: boolean;
  footer?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export interface GridProps extends BaseComponentProps {
  columns?: number | 'auto';
  gap?: Size;
  responsive?: boolean;
}

// === FORM TYPES === //
export interface FormFieldProps extends BaseComponentProps {
  label?: string;
  error?: string;
  helper?: string;
  required?: boolean;
  disabled?: boolean;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

// === DATA TYPES === //
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => ReactNode;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

// === RESPONSIVE TYPES === //
export interface Breakpoints {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface ResponsiveValue<T> {
  base?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}

// === ACCESSIBILITY TYPES === //
export interface A11yProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  role?: string;
  tabIndex?: number;
}

// === THEME TYPES === //
export interface ThemeConfig {
  colors: Record<string, string>;
  fonts: Record<string, string>;
  spacing: Record<string, string>;
  shadows: Record<string, string>;
  radii: Record<string, string>;
  transitions: Record<string, string>;
}