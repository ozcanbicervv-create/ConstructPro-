/**
 * Responsive Utilities
 * 
 * Utilities for handling responsive design and breakpoints
 */

// === BREAKPOINT DEFINITIONS === //
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export type Breakpoint = keyof typeof breakpoints;

// === RESPONSIVE VALUE TYPE === //
export type ResponsiveValue<T> = {
  base?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
};

// === MEDIA QUERY UTILITIES === //

/**
 * Creates a media query string for a given breakpoint
 */
export function createMediaQuery(breakpoint: Breakpoint): string {
  return `(min-width: ${breakpoints[breakpoint]})`;
}

/**
 * Creates a max-width media query string for a given breakpoint
 */
export function createMaxMediaQuery(breakpoint: Breakpoint): string {
  const breakpointValues = Object.values(breakpoints);
  const currentIndex = Object.keys(breakpoints).indexOf(breakpoint);
  const maxWidth = breakpointValues[currentIndex];
  
  // Subtract 1px to avoid overlap
  const maxWidthValue = parseInt(maxWidth) - 1;
  return `(max-width: ${maxWidthValue}px)`;
}

/**
 * Creates a range media query between two breakpoints
 */
export function createRangeMediaQuery(
  minBreakpoint: Breakpoint,
  maxBreakpoint: Breakpoint
): string {
  return `(min-width: ${breakpoints[minBreakpoint]}) and (max-width: ${breakpoints[maxBreakpoint]})`;
}

// === RESPONSIVE HOOKS === //

/**
 * Hook to check if a breakpoint is active (client-side only)
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  if (typeof window === 'undefined') {return false;}
  
  const mediaQuery = window.matchMedia(createMediaQuery(breakpoint));
  return mediaQuery.matches;
}

/**
 * Hook to get the current active breakpoint
 */
export function useCurrentBreakpoint(): Breakpoint | null {
  if (typeof window === 'undefined') {return null;}
  
  const breakpointEntries = Object.entries(breakpoints).reverse();
  
  for (const [breakpoint, width] of breakpointEntries) {
    if (window.matchMedia(`(min-width: ${width})`).matches) {
      return breakpoint as Breakpoint;
    }
  }
  
  return null;
}

// === RESPONSIVE VALUE UTILITIES === //

/**
 * Resolves a responsive value to the appropriate value for the current breakpoint
 */
export function resolveResponsiveValue<T>(
  value: ResponsiveValue<T> | T,
  currentBreakpoint: Breakpoint = 'base'
): T | undefined {
  if (typeof value !== 'object' || value === null) {
    return value as T;
  }
  
  const responsiveValue = value as ResponsiveValue<T>;
  
  // Define breakpoint hierarchy
  const hierarchy: (keyof ResponsiveValue<T>)[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'base'];
  const currentIndex = hierarchy.indexOf(currentBreakpoint);
  
  // Look for the value starting from current breakpoint and going down the hierarchy
  for (let i = currentIndex; i < hierarchy.length; i++) {
    const breakpoint = hierarchy[i];
    if (responsiveValue[breakpoint] !== undefined) {
      return responsiveValue[breakpoint];
    }
  }
  
  return undefined;
}

/**
 * Creates responsive CSS classes from a responsive value
 */
export function createResponsiveClasses<T extends string>(
  value: ResponsiveValue<T> | T,
  classPrefix: string
): string {
  if (typeof value !== 'object' || value === null) {
    return `${classPrefix}-${value}`;
  }
  
  const responsiveValue = value as ResponsiveValue<T>;
  const classes: string[] = [];
  
  if (responsiveValue.base) {
    classes.push(`${classPrefix}-${responsiveValue.base}`);
  }
  
  if (responsiveValue.sm) {
    classes.push(`sm:${classPrefix}-${responsiveValue.sm}`);
  }
  
  if (responsiveValue.md) {
    classes.push(`md:${classPrefix}-${responsiveValue.md}`);
  }
  
  if (responsiveValue.lg) {
    classes.push(`lg:${classPrefix}-${responsiveValue.lg}`);
  }
  
  if (responsiveValue.xl) {
    classes.push(`xl:${classPrefix}-${responsiveValue.xl}`);
  }
  
  if (responsiveValue['2xl']) {
    classes.push(`2xl:${classPrefix}-${responsiveValue['2xl']}`);
  }
  
  return classes.join(' ');
}

// === CONTAINER UTILITIES === //

/**
 * Container max-width values for each breakpoint
 */
export const containerMaxWidths = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Creates container classes with responsive max-widths
 */
export function createContainerClasses(
  maxWidth: keyof typeof containerMaxWidths = '2xl'
): string {
  const classes = ['mx-auto', 'px-4', 'sm:px-6', 'lg:px-8'];
  
  switch (maxWidth) {
    case 'sm':
      classes.push('max-w-sm');
      break;
    case 'md':
      classes.push('max-w-md');
      break;
    case 'lg':
      classes.push('max-w-lg');
      break;
    case 'xl':
      classes.push('max-w-xl');
      break;
    case '2xl':
      classes.push('max-w-2xl');
      break;
  }
  
  return classes.join(' ');
}

// === GRID UTILITIES === //

/**
 * Creates responsive grid classes
 */
export function createGridClasses(
  columns: ResponsiveValue<number> | number,
  gap: ResponsiveValue<string> | string = '4'
): string {
  const classes: string[] = ['grid'];
  
  // Handle columns
  if (typeof columns === 'number') {
    classes.push(`grid-cols-${columns}`);
  } else {
    if (columns.base) {classes.push(`grid-cols-${columns.base}`);}
    if (columns.sm) {classes.push(`sm:grid-cols-${columns.sm}`);}
    if (columns.md) {classes.push(`md:grid-cols-${columns.md}`);}
    if (columns.lg) {classes.push(`lg:grid-cols-${columns.lg}`);}
    if (columns.xl) {classes.push(`xl:grid-cols-${columns.xl}`);}
    if (columns['2xl']) {classes.push(`2xl:grid-cols-${columns['2xl']}`);}
  }
  
  // Handle gap
  if (typeof gap === 'string') {
    classes.push(`gap-${gap}`);
  } else {
    if (gap.base) {classes.push(`gap-${gap.base}`);}
    if (gap.sm) {classes.push(`sm:gap-${gap.sm}`);}
    if (gap.md) {classes.push(`md:gap-${gap.md}`);}
    if (gap.lg) {classes.push(`lg:gap-${gap.lg}`);}
    if (gap.xl) {classes.push(`xl:gap-${gap.xl}`);}
    if (gap['2xl']) {classes.push(`2xl:gap-${gap['2xl']}`);}
  }
  
  return classes.join(' ');
}

// === FLEX UTILITIES === //

/**
 * Creates responsive flex classes
 */
export function createFlexClasses(
  direction: ResponsiveValue<'row' | 'col'> | 'row' | 'col' = 'row',
  justify: ResponsiveValue<string> | string = 'start',
  align: ResponsiveValue<string> | string = 'start',
  gap: ResponsiveValue<string> | string = '4'
): string {
  const classes: string[] = ['flex'];
  
  // Handle direction
  classes.push(...createResponsiveClasses(direction, 'flex').split(' '));
  
  // Handle justify
  classes.push(...createResponsiveClasses(justify, 'justify').split(' '));
  
  // Handle align
  classes.push(...createResponsiveClasses(align, 'items').split(' '));
  
  // Handle gap
  classes.push(...createResponsiveClasses(gap, 'gap').split(' '));
  
  return classes.filter(Boolean).join(' ');
}

// === SPACING UTILITIES === //

/**
 * Creates responsive spacing classes
 */
export function createSpacingClasses(
  property: 'p' | 'm' | 'px' | 'py' | 'pt' | 'pb' | 'pl' | 'pr' | 'mx' | 'my' | 'mt' | 'mb' | 'ml' | 'mr',
  value: ResponsiveValue<string> | string
): string {
  return createResponsiveClasses(value, property);
}

// === VISIBILITY UTILITIES === //

/**
 * Creates responsive visibility classes
 */
export function createVisibilityClasses(
  visibility: ResponsiveValue<'block' | 'hidden' | 'flex' | 'grid' | 'inline' | 'inline-block'>
): string {
  const classes: string[] = [];
  
  if (visibility.base) {classes.push(visibility.base);}
  if (visibility.sm) {classes.push(`sm:${visibility.sm}`);}
  if (visibility.md) {classes.push(`md:${visibility.md}`);}
  if (visibility.lg) {classes.push(`lg:${visibility.lg}`);}
  if (visibility.xl) {classes.push(`xl:${visibility.xl}`);}
  if (visibility['2xl']) {classes.push(`2xl:${visibility['2xl']}`);}
  
  return classes.join(' ');
}

// === DEVICE DETECTION === //

/**
 * Detects if the user is on a mobile device
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') {return false;}
  return window.innerWidth < parseInt(breakpoints.md);
}

/**
 * Detects if the user is on a tablet device
 */
export function isTablet(): boolean {
  if (typeof window === 'undefined') {return false;}
  const width = window.innerWidth;
  return width >= parseInt(breakpoints.md) && width < parseInt(breakpoints.lg);
}

/**
 * Detects if the user is on a desktop device
 */
export function isDesktop(): boolean {
  if (typeof window === 'undefined') {return false;}
  return window.innerWidth >= parseInt(breakpoints.lg);
}