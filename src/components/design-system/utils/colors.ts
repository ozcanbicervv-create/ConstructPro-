/**
 * Color Utilities
 * 
 * Utilities for working with colors in the design system
 */

// === COLOR PALETTE === //
export const colors = {
  // Brand Colors
  brand: {
    blue: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
    orange: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
      950: '#431407',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712',
    },
  },
  
  // Semantic Colors
  semantic: {
    success: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
      950: '#022c22',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a',
    },
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
  },
} as const;

// === COLOR UTILITIES === //

/**
 * Gets a color value from the color palette
 */
export function getColor(
  category: keyof typeof colors,
  color: string,
  shade = 500
): string {
  const colorCategory = colors[category] as any;
  const colorObject = colorCategory[color];
  
  if (!colorObject) {
    console.warn(`Color "${color}" not found in category "${category}"`);
    return '#000000';
  }
  
  const colorValue = colorObject[shade];
  if (!colorValue) {
    console.warn(`Shade "${shade}" not found for color "${color}" in category "${category}"`);
    return colorObject[500] || '#000000';
  }
  
  return colorValue;
}

/**
 * Converts hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Converts RGB values to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Converts hex color to HSL values
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(hex);
  if (!rgb) {return null;}
  
  const { r, g, b } = rgb;
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Lightens a hex color by a percentage
 */
export function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) {return hex;}
  
  const { r, g, b } = rgb;
  const amount = Math.round(2.55 * percent);
  
  const newR = Math.min(255, r + amount);
  const newG = Math.min(255, g + amount);
  const newB = Math.min(255, b + amount);
  
  return rgbToHex(newR, newG, newB);
}

/**
 * Darkens a hex color by a percentage
 */
export function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) {return hex;}
  
  const { r, g, b } = rgb;
  const amount = Math.round(2.55 * percent);
  
  const newR = Math.max(0, r - amount);
  const newG = Math.max(0, g - amount);
  const newB = Math.max(0, b - amount);
  
  return rgbToHex(newR, newG, newB);
}

/**
 * Adds alpha transparency to a hex color
 */
export function addAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) {return hex;}
  
  const { r, g, b } = rgb;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Gets the contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (hex: string): number => {
    const rgb = hexToRgb(hex);
    if (!rgb) {return 0;}
    
    const { r, g, b } = rgb;
    const [rNorm, gNorm, bNorm] = [r, g, b].map((c) => {
      const normalized = c / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rNorm + 0.7152 * gNorm + 0.0722 * bNorm;
  };
  
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Checks if a color meets WCAG contrast requirements
 */
export function meetsContrastRequirement(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Generates a color palette from a base color
 */
export function generateColorPalette(baseColor: string): Record<number, string> {
  const palette: Record<number, string> = {};
  
  // Generate lighter shades
  palette[50] = lightenColor(baseColor, 45);
  palette[100] = lightenColor(baseColor, 40);
  palette[200] = lightenColor(baseColor, 30);
  palette[300] = lightenColor(baseColor, 20);
  palette[400] = lightenColor(baseColor, 10);
  
  // Base color
  palette[500] = baseColor;
  
  // Generate darker shades
  palette[600] = darkenColor(baseColor, 10);
  palette[700] = darkenColor(baseColor, 20);
  palette[800] = darkenColor(baseColor, 30);
  palette[900] = darkenColor(baseColor, 40);
  palette[950] = darkenColor(baseColor, 50);
  
  return palette;
}

// === CONSTRUCTION-SPECIFIC COLOR UTILITIES === //

/**
 * Construction project status colors
 */
export const statusColors = {
  planning: colors.brand.blue[500],
  'in-progress': colors.brand.orange[500],
  'on-hold': colors.semantic.warning[500],
  completed: colors.semantic.success[500],
  delayed: colors.semantic.error[500],
  cancelled: colors.brand.gray[500],
} as const;

/**
 * Construction material category colors
 */
export const materialColors = {
  concrete: '#6b7280',
  steel: '#374151',
  wood: '#92400e',
  electrical: '#d97706',
  plumbing: '#2563eb',
  hvac: '#059669',
  roofing: '#7c2d12',
  insulation: '#f59e0b',
} as const;

/**
 * Construction priority colors
 */
export const priorityColors = {
  low: colors.semantic.success[500],
  medium: colors.semantic.warning[500],
  high: colors.brand.orange[500],
  critical: colors.semantic.error[500],
} as const;

/**
 * Gets a status color
 */
export function getStatusColor(status: keyof typeof statusColors): string {
  return statusColors[status] || colors.brand.gray[500];
}

/**
 * Gets a material category color
 */
export function getMaterialColor(material: keyof typeof materialColors): string {
  return materialColors[material] || colors.brand.gray[500];
}

/**
 * Gets a priority color
 */
export function getPriorityColor(priority: keyof typeof priorityColors): string {
  return priorityColors[priority] || colors.brand.gray[500];
}

/**
 * Creates a gradient from two colors
 */
export function createGradient(
  color1: string,
  color2: string,
  direction = '135deg'
): string {
  return `linear-gradient(${direction}, ${color1} 0%, ${color2} 100%)`;
}

/**
 * Creates a glassmorphism background
 */
export function createGlassmorphism(
  baseColor = '#ffffff',
  opacity = 0.1
): string {
  return addAlpha(baseColor, opacity);
}