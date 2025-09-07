/**
 * Typography Utilities
 * 
 * Utilities for working with typography in the design system
 */

// === FONT DEFINITIONS === //
export const fonts = {
  primary: 'var(--font-primary)',
  display: 'var(--font-display)',
  mono: 'var(--font-mono)',
} as const;

// === FONT SIZE SCALE === //
export const fontSizes = {
  xs: 'var(--text-xs)',      // 12px
  sm: 'var(--text-sm)',      // 14px
  base: 'var(--text-base)',  // 16px
  lg: 'var(--text-lg)',      // 18px
  xl: 'var(--text-xl)',      // 20px
  '2xl': 'var(--text-2xl)',  // 24px
  '3xl': 'var(--text-3xl)',  // 30px
  '4xl': 'var(--text-4xl)',  // 36px
  '5xl': 'var(--text-5xl)',  // 48px
  '6xl': 'var(--text-6xl)',  // 60px
  '7xl': 'var(--text-7xl)',  // 72px
  '8xl': 'var(--text-8xl)',  // 96px
  '9xl': 'var(--text-9xl)',  // 128px
} as const;

// === FONT WEIGHTS === //
export const fontWeights = {
  thin: 'var(--font-thin)',
  extralight: 'var(--font-extralight)',
  light: 'var(--font-light)',
  normal: 'var(--font-normal)',
  medium: 'var(--font-medium)',
  semibold: 'var(--font-semibold)',
  bold: 'var(--font-bold)',
  extrabold: 'var(--font-extrabold)',
  black: 'var(--font-black)',
} as const;

// === LINE HEIGHTS === //
export const lineHeights = {
  none: 'var(--leading-none)',
  tight: 'var(--leading-tight)',
  snug: 'var(--leading-snug)',
  normal: 'var(--leading-normal)',
  relaxed: 'var(--leading-relaxed)',
  loose: 'var(--leading-loose)',
} as const;

// === LETTER SPACING === //
export const letterSpacing = {
  tighter: 'var(--tracking-tighter)',
  tight: 'var(--tracking-tight)',
  normal: 'var(--tracking-normal)',
  wide: 'var(--tracking-wide)',
  wider: 'var(--tracking-wider)',
  widest: 'var(--tracking-widest)',
} as const;

// === TYPOGRAPHY VARIANTS === //
export const typographyVariants = {
  // Display variants - for hero sections and major headings
  display: {
    '2xl': {
      fontSize: fontSizes['6xl'],
      fontWeight: fontWeights.extrabold,
      lineHeight: lineHeights.none,
      letterSpacing: letterSpacing.tight,
      fontFamily: fonts.display,
    },
    xl: {
      fontSize: fontSizes['5xl'],
      fontWeight: fontWeights.extrabold,
      lineHeight: lineHeights.none,
      letterSpacing: letterSpacing.tight,
      fontFamily: fonts.display,
    },
    lg: {
      fontSize: fontSizes['4xl'],
      fontWeight: fontWeights.bold,
      lineHeight: lineHeights.tight,
      letterSpacing: letterSpacing.tight,
      fontFamily: fonts.display,
    },
    md: {
      fontSize: fontSizes['3xl'],
      fontWeight: fontWeights.bold,
      lineHeight: lineHeights.tight,
      letterSpacing: letterSpacing.normal,
      fontFamily: fonts.display,
    },
    sm: {
      fontSize: fontSizes['2xl'],
      fontWeight: fontWeights.semibold,
      lineHeight: lineHeights.tight,
      letterSpacing: letterSpacing.normal,
      fontFamily: fonts.display,
    },
  },
  
  // Heading variants - for section headings
  heading: {
    '2xl': {
      fontSize: fontSizes['4xl'],
      fontWeight: fontWeights.bold,
      lineHeight: lineHeights.tight,
      letterSpacing: letterSpacing.tight,
      fontFamily: fonts.primary,
    },
    xl: {
      fontSize: fontSizes['3xl'],
      fontWeight: fontWeights.bold,
      lineHeight: lineHeights.tight,
      letterSpacing: letterSpacing.normal,
      fontFamily: fonts.primary,
    },
    lg: {
      fontSize: fontSizes['2xl'],
      fontWeight: fontWeights.semibold,
      lineHeight: lineHeights.tight,
      letterSpacing: letterSpacing.normal,
      fontFamily: fonts.primary,
    },
    md: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.semibold,
      lineHeight: lineHeights.snug,
      letterSpacing: letterSpacing.normal,
      fontFamily: fonts.primary,
    },
    sm: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.medium,
      lineHeight: lineHeights.snug,
      letterSpacing: letterSpacing.normal,
      fontFamily: fonts.primary,
    },
  },
  
  // Body variants - for main content
  body: {
    xl: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.relaxed,
      letterSpacing: letterSpacing.normal,
      fontFamily: fonts.primary,
    },
    lg: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.relaxed,
      letterSpacing: letterSpacing.normal,
      fontFamily: fonts.primary,
    },
    md: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
      fontFamily: fonts.primary,
    },
    sm: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
      fontFamily: fonts.primary,
    },
  },
  
  // Caption variants - for small text and labels
  caption: {
    lg: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      lineHeight: lineHeights.snug,
      letterSpacing: letterSpacing.normal,
      fontFamily: fonts.primary,
    },
    md: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.medium,
      lineHeight: lineHeights.snug,
      letterSpacing: letterSpacing.wide,
      fontFamily: fonts.primary,
    },
    sm: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.tight,
      letterSpacing: letterSpacing.wide,
      fontFamily: fonts.primary,
    },
  },
  
  // Overline variants - for labels and categories
  overline: {
    lg: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
      lineHeight: lineHeights.tight,
      letterSpacing: letterSpacing.wider,
      textTransform: 'uppercase' as const,
      fontFamily: fonts.primary,
    },
    md: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold,
      lineHeight: lineHeights.tight,
      letterSpacing: letterSpacing.widest,
      textTransform: 'uppercase' as const,
      fontFamily: fonts.primary,
    },
    sm: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.medium,
      lineHeight: lineHeights.tight,
      letterSpacing: letterSpacing.widest,
      textTransform: 'uppercase' as const,
      fontFamily: fonts.primary,
    },
  },
} as const;

// === UTILITY FUNCTIONS === //

/**
 * Gets typography styles for a specific variant and size
 */
export function getTypographyStyles(
  variant: keyof typeof typographyVariants,
  size: string
): Record<string, string | number> {
  const variantStyles = typographyVariants[variant] as any;
  const styles = variantStyles[size];
  
  if (!styles) {
    console.warn(`Typography variant "${variant}" with size "${size}" not found`);
    return typographyVariants.body.md;
  }
  
  return styles;
}

/**
 * Creates typography CSS classes
 */
export function createTypographyClasses(
  variant: keyof typeof typographyVariants,
  size: string,
  color?: string,
  align?: 'left' | 'center' | 'right' | 'justify'
): string {
  const classes: string[] = [];
  
  // Add variant and size classes
  classes.push(`text-${variant}-${size}`);
  
  // Add color class
  if (color) {
    classes.push(`text-${color}`);
  }
  
  // Add alignment class
  if (align) {
    classes.push(`text-${align}`);
  }
  
  return classes.join(' ');
}

/**
 * Calculates optimal line height for a given font size
 */
export function calculateLineHeight(fontSize: number): number {
  // Golden ratio-based line height calculation
  const ratio = 1.618;
  return Math.round((fontSize * ratio) * 100) / 100;
}

/**
 * Calculates optimal letter spacing for a given font size
 */
export function calculateLetterSpacing(fontSize: number): number {
  // Smaller fonts need more letter spacing, larger fonts need less
  if (fontSize <= 12) return 0.05;
  if (fontSize <= 16) return 0.025;
  if (fontSize <= 24) return 0;
  if (fontSize <= 36) return -0.025;
  return -0.05;
}

/**
 * Creates responsive typography classes
 */
export function createResponsiveTypography(
  baseVariant: keyof typeof typographyVariants,
  baseSize: string,
  responsiveSizes?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  }
): string {
  const classes: string[] = [];
  
  // Base typography
  classes.push(createTypographyClasses(baseVariant, baseSize));
  
  // Responsive typography
  if (responsiveSizes) {
    Object.entries(responsiveSizes).forEach(([breakpoint, size]) => {
      classes.push(`${breakpoint}:${createTypographyClasses(baseVariant, size)}`);
    });
  }
  
  return classes.join(' ');
}

// === CONSTRUCTION-SPECIFIC TYPOGRAPHY === //

/**
 * Typography presets for construction industry content
 */
export const constructionTypography = {
  // Project titles
  projectTitle: {
    variant: 'heading' as const,
    size: 'xl',
    weight: 'bold',
    color: 'brand-gray-900',
  },
  
  // Task titles
  taskTitle: {
    variant: 'heading' as const,
    size: 'md',
    weight: 'semibold',
    color: 'brand-gray-800',
  },
  
  // Material names
  materialName: {
    variant: 'body' as const,
    size: 'md',
    weight: 'medium',
    color: 'brand-gray-700',
  },
  
  // Status labels
  statusLabel: {
    variant: 'overline' as const,
    size: 'sm',
    weight: 'semibold',
    color: 'brand-gray-600',
  },
  
  // Metric values
  metricValue: {
    variant: 'display' as const,
    size: 'sm',
    weight: 'bold',
    color: 'brand-blue-600',
    fontFamily: fonts.mono,
  },
  
  // Metric labels
  metricLabel: {
    variant: 'caption' as const,
    size: 'md',
    weight: 'medium',
    color: 'brand-gray-500',
  },
  
  // Form labels
  formLabel: {
    variant: 'body' as const,
    size: 'sm',
    weight: 'medium',
    color: 'brand-gray-700',
  },
  
  // Helper text
  helperText: {
    variant: 'caption' as const,
    size: 'sm',
    weight: 'normal',
    color: 'brand-gray-500',
  },
  
  // Error text
  errorText: {
    variant: 'caption' as const,
    size: 'sm',
    weight: 'medium',
    color: 'error',
  },
} as const;

/**
 * Gets construction-specific typography styles
 */
export function getConstructionTypography(
  preset: keyof typeof constructionTypography
): Record<string, string> {
  const config = constructionTypography[preset];
  const styles = getTypographyStyles(config.variant, config.size);
  
  return {
    ...styles,
    fontWeight: fontWeights[config.weight as keyof typeof fontWeights] || config.weight,
    color: `var(--color-${config.color})`,
    ...(config.fontFamily && { fontFamily: config.fontFamily }),
  };
}

/**
 * Creates construction-specific typography classes
 */
export function createConstructionTypographyClasses(
  preset: keyof typeof constructionTypography
): string {
  const config = constructionTypography[preset];
  return createTypographyClasses(config.variant, config.size, config.color);
}

// === TEXT FORMATTING UTILITIES === //

/**
 * Formats currency values for construction costs
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formats percentage values for construction progress
 */
export function formatPercentage(
  value: number,
  decimals: number = 1
): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formats measurement values for construction
 */
export function formatMeasurement(
  value: number,
  unit: string,
  decimals: number = 2
): string {
  return `${value.toFixed(decimals)} ${unit}`;
}

/**
 * Formats date values for construction schedules
 */
export function formatDate(
  date: Date | string,
  format: 'short' | 'medium' | 'long' = 'medium',
  locale: string = 'en-US'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    medium: { month: 'long', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
  }[format];
  
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

/**
 * Truncates text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

/**
 * Capitalizes the first letter of each word
 */
export function titleCase(text: string): string {
  return text.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}