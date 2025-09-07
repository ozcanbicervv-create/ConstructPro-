/**
 * Spacing Utilities
 * 
 * Utilities for consistent spacing throughout the design system
 */

// === SPACING SCALE === //
export const spacing = {
  0: 'var(--space-0)',
  px: 'var(--space-px)',
  0.5: 'var(--space-0-5)',
  1: 'var(--space-1)',
  1.5: 'var(--space-1-5)',
  2: 'var(--space-2)',
  2.5: 'var(--space-2-5)',
  3: 'var(--space-3)',
  3.5: 'var(--space-3-5)',
  4: 'var(--space-4)',
  5: 'var(--space-5)',
  6: 'var(--space-6)',
  7: 'var(--space-7)',
  8: 'var(--space-8)',
  9: 'var(--space-9)',
  10: 'var(--space-10)',
  11: 'var(--space-11)',
  12: 'var(--space-12)',
  14: 'var(--space-14)',
  16: 'var(--space-16)',
  20: 'var(--space-20)',
  24: 'var(--space-24)',
  28: 'var(--space-28)',
  32: 'var(--space-32)',
  36: 'var(--space-36)',
  40: 'var(--space-40)',
  44: 'var(--space-44)',
  48: 'var(--space-48)',
  52: 'var(--space-52)',
  56: 'var(--space-56)',
  60: 'var(--space-60)',
  64: 'var(--space-64)',
  72: 'var(--space-72)',
  80: 'var(--space-80)',
  96: 'var(--space-96)',
} as const;

export type SpacingValue = keyof typeof spacing;

// === SPACING PRESETS === //

/**
 * Component spacing presets for consistent layouts
 */
export const spacingPresets = {
  // Container spacing
  container: {
    padding: {
      mobile: spacing[4],
      tablet: spacing[6],
      desktop: spacing[8],
    },
    maxWidth: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
  
  // Card spacing
  card: {
    padding: {
      xs: spacing[3],
      sm: spacing[4],
      md: spacing[6],
      lg: spacing[8],
    },
    gap: {
      xs: spacing[2],
      sm: spacing[3],
      md: spacing[4],
      lg: spacing[6],
    },
  },
  
  // Form spacing
  form: {
    fieldGap: spacing[4],
    labelGap: spacing[2],
    groupGap: spacing[6],
    sectionGap: spacing[8],
  },
  
  // Navigation spacing
  navigation: {
    itemPadding: {
      horizontal: spacing[3],
      vertical: spacing[2],
    },
    itemGap: spacing[1],
    sectionGap: spacing[6],
  },
  
  // Grid spacing
  grid: {
    gap: {
      xs: spacing[2],
      sm: spacing[3],
      md: spacing[4],
      lg: spacing[6],
      xl: spacing[8],
    },
  },
  
  // Button spacing
  button: {
    padding: {
      xs: { horizontal: spacing[2], vertical: spacing[1] },
      sm: { horizontal: spacing[3], vertical: spacing[1.5] },
      md: { horizontal: spacing[4], vertical: spacing[2] },
      lg: { horizontal: spacing[6], vertical: spacing[3] },
      xl: { horizontal: spacing[8], vertical: spacing[4] },
    },
    gap: spacing[2],
  },
  
  // Modal spacing
  modal: {
    padding: spacing[6],
    gap: spacing[4],
    backdrop: spacing[4],
  },
} as const;

// === UTILITY FUNCTIONS === //

/**
 * Gets a spacing value from the spacing scale
 */
export function getSpacing(value: SpacingValue): string {
  return spacing[value];
}

/**
 * Creates margin classes
 */
export function createMarginClasses(
  top?: SpacingValue,
  right?: SpacingValue,
  bottom?: SpacingValue,
  left?: SpacingValue
): string {
  const classes: string[] = [];
  
  if (top !== undefined) classes.push(`mt-${top}`);
  if (right !== undefined) classes.push(`mr-${right}`);
  if (bottom !== undefined) classes.push(`mb-${bottom}`);
  if (left !== undefined) classes.push(`ml-${left}`);
  
  return classes.join(' ');
}

/**
 * Creates padding classes
 */
export function createPaddingClasses(
  top?: SpacingValue,
  right?: SpacingValue,
  bottom?: SpacingValue,
  left?: SpacingValue
): string {
  const classes: string[] = [];
  
  if (top !== undefined) classes.push(`pt-${top}`);
  if (right !== undefined) classes.push(`pr-${right}`);
  if (bottom !== undefined) classes.push(`pb-${bottom}`);
  if (left !== undefined) classes.push(`pl-${left}`);
  
  return classes.join(' ');
}

/**
 * Creates uniform margin classes
 */
export function createUniformMargin(value: SpacingValue): string {
  return `m-${value}`;
}

/**
 * Creates uniform padding classes
 */
export function createUniformPadding(value: SpacingValue): string {
  return `p-${value}`;
}

/**
 * Creates horizontal margin classes
 */
export function createHorizontalMargin(value: SpacingValue): string {
  return `mx-${value}`;
}

/**
 * Creates vertical margin classes
 */
export function createVerticalMargin(value: SpacingValue): string {
  return `my-${value}`;
}

/**
 * Creates horizontal padding classes
 */
export function createHorizontalPadding(value: SpacingValue): string {
  return `px-${value}`;
}

/**
 * Creates vertical padding classes
 */
export function createVerticalPadding(value: SpacingValue): string {
  return `py-${value}`;
}

/**
 * Creates gap classes for flexbox and grid
 */
export function createGapClasses(
  gap?: SpacingValue,
  rowGap?: SpacingValue,
  columnGap?: SpacingValue
): string {
  const classes: string[] = [];
  
  if (gap !== undefined) classes.push(`gap-${gap}`);
  if (rowGap !== undefined) classes.push(`gap-y-${rowGap}`);
  if (columnGap !== undefined) classes.push(`gap-x-${columnGap}`);
  
  return classes.join(' ');
}

/**
 * Creates space-between classes for flex layouts
 */
export function createSpaceBetween(value: SpacingValue): string {
  return `space-x-${value}`;
}

/**
 * Creates space-between classes for vertical flex layouts
 */
export function createVerticalSpaceBetween(value: SpacingValue): string {
  return `space-y-${value}`;
}

// === RESPONSIVE SPACING === //

/**
 * Creates responsive margin classes
 */
export function createResponsiveMargin(
  values: {
    base?: SpacingValue;
    sm?: SpacingValue;
    md?: SpacingValue;
    lg?: SpacingValue;
    xl?: SpacingValue;
    '2xl'?: SpacingValue;
  },
  direction?: 't' | 'r' | 'b' | 'l' | 'x' | 'y'
): string {
  const classes: string[] = [];
  const prefix = direction ? `m${direction}` : 'm';
  
  if (values.base !== undefined) classes.push(`${prefix}-${values.base}`);
  if (values.sm !== undefined) classes.push(`sm:${prefix}-${values.sm}`);
  if (values.md !== undefined) classes.push(`md:${prefix}-${values.md}`);
  if (values.lg !== undefined) classes.push(`lg:${prefix}-${values.lg}`);
  if (values.xl !== undefined) classes.push(`xl:${prefix}-${values.xl}`);
  if (values['2xl'] !== undefined) classes.push(`2xl:${prefix}-${values['2xl']}`);
  
  return classes.join(' ');
}

/**
 * Creates responsive padding classes
 */
export function createResponsivePadding(
  values: {
    base?: SpacingValue;
    sm?: SpacingValue;
    md?: SpacingValue;
    lg?: SpacingValue;
    xl?: SpacingValue;
    '2xl'?: SpacingValue;
  },
  direction?: 't' | 'r' | 'b' | 'l' | 'x' | 'y'
): string {
  const classes: string[] = [];
  const prefix = direction ? `p${direction}` : 'p';
  
  if (values.base !== undefined) classes.push(`${prefix}-${values.base}`);
  if (values.sm !== undefined) classes.push(`sm:${prefix}-${values.sm}`);
  if (values.md !== undefined) classes.push(`md:${prefix}-${values.md}`);
  if (values.lg !== undefined) classes.push(`lg:${prefix}-${values.lg}`);
  if (values.xl !== undefined) classes.push(`xl:${prefix}-${values.xl}`);
  if (values['2xl'] !== undefined) classes.push(`2xl:${prefix}-${values['2xl']}`);
  
  return classes.join(' ');
}

/**
 * Creates responsive gap classes
 */
export function createResponsiveGap(
  values: {
    base?: SpacingValue;
    sm?: SpacingValue;
    md?: SpacingValue;
    lg?: SpacingValue;
    xl?: SpacingValue;
    '2xl'?: SpacingValue;
  },
  direction?: 'x' | 'y'
): string {
  const classes: string[] = [];
  const prefix = direction ? `gap-${direction}` : 'gap';
  
  if (values.base !== undefined) classes.push(`${prefix}-${values.base}`);
  if (values.sm !== undefined) classes.push(`sm:${prefix}-${values.sm}`);
  if (values.md !== undefined) classes.push(`md:${prefix}-${values.md}`);
  if (values.lg !== undefined) classes.push(`lg:${prefix}-${values.lg}`);
  if (values.xl !== undefined) classes.push(`xl:${prefix}-${values.xl}`);
  if (values['2xl'] !== undefined) classes.push(`2xl:${prefix}-${values['2xl']}`);
  
  return classes.join(' ');
}

// === CONSTRUCTION-SPECIFIC SPACING === //

/**
 * Spacing presets for construction industry components
 */
export const constructionSpacing = {
  // Project card spacing
  projectCard: {
    padding: spacingPresets.card.padding.md,
    gap: spacingPresets.card.gap.md,
    margin: spacing[4],
  },
  
  // Task item spacing
  taskItem: {
    padding: spacingPresets.card.padding.sm,
    gap: spacingPresets.card.gap.sm,
    margin: spacing[2],
  },
  
  // Material card spacing
  materialCard: {
    padding: spacingPresets.card.padding.md,
    gap: spacingPresets.card.gap.sm,
    margin: spacing[3],
  },
  
  // Dashboard widget spacing
  dashboardWidget: {
    padding: spacingPresets.card.padding.lg,
    gap: spacingPresets.card.gap.lg,
    margin: spacing[6],
  },
  
  // Form section spacing
  formSection: {
    padding: spacingPresets.form.sectionGap,
    gap: spacingPresets.form.fieldGap,
    margin: spacingPresets.form.groupGap,
  },
  
  // Navigation spacing
  sidebarNavigation: {
    padding: spacingPresets.navigation.itemPadding,
    gap: spacingPresets.navigation.itemGap,
    sectionGap: spacingPresets.navigation.sectionGap,
  },
} as const;

/**
 * Gets construction-specific spacing values
 */
export function getConstructionSpacing(
  component: keyof typeof constructionSpacing,
  property: 'padding' | 'gap' | 'margin'
): string {
  const componentSpacing = constructionSpacing[component];
  return componentSpacing[property] || spacing[4];
}

/**
 * Creates construction component spacing classes
 */
export function createConstructionSpacingClasses(
  component: keyof typeof constructionSpacing
): string {
  const componentSpacing = constructionSpacing[component];
  const classes: string[] = [];
  
  // Add padding classes
  if (typeof componentSpacing.padding === 'object') {
    classes.push(createHorizontalPadding(componentSpacing.padding.horizontal as SpacingValue));
    classes.push(createVerticalPadding(componentSpacing.padding.vertical as SpacingValue));
  } else {
    classes.push(createUniformPadding(componentSpacing.padding as SpacingValue));
  }
  
  // Add gap classes
  classes.push(createGapClasses(componentSpacing.gap as SpacingValue));
  
  // Add margin classes
  classes.push(createUniformMargin(componentSpacing.margin as SpacingValue));
  
  return classes.join(' ');
}

// === LAYOUT UTILITIES === //

/**
 * Creates container classes with responsive padding
 */
export function createContainerSpacing(
  maxWidth: 'sm' | 'md' | 'lg' | 'xl' | '2xl' = '2xl'
): string {
  const classes = [
    'mx-auto',
    `max-w-${maxWidth}`,
    createResponsivePadding({
      base: 4,
      sm: 6,
      lg: 8,
    }, 'x'),
  ];
  
  return classes.join(' ');
}

/**
 * Creates section spacing classes
 */
export function createSectionSpacing(
  size: 'sm' | 'md' | 'lg' = 'md'
): string {
  const spacingMap = {
    sm: { base: 8, md: 12 },
    md: { base: 12, md: 16 },
    lg: { base: 16, md: 20 },
  };
  
  return createResponsivePadding(spacingMap[size], 'y');
}

/**
 * Creates stack spacing classes for vertical layouts
 */
export function createStackSpacing(
  gap: SpacingValue = 4
): string {
  return createVerticalSpaceBetween(gap);
}

/**
 * Creates inline spacing classes for horizontal layouts
 */
export function createInlineSpacing(
  gap: SpacingValue = 4
): string {
  return createSpaceBetween(gap);
}