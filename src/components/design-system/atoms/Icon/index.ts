/**
 * Icon Atom Exports
 * 
 * Base Icon component and construction-specific icon library
 */

// Base Icon component
export { Icon } from './Icon';
export type { IconProps } from './Icon';

// Construction-specific icons
export * from './construction';

// Re-export construction icon utilities
export { 
  CONSTRUCTION_ICON_CATEGORIES,
  ALL_CONSTRUCTION_ICONS,
  type ConstructionIconName 
} from './construction';