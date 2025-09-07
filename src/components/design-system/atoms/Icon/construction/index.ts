/**
 * Construction Industry Icon Library
 * 
 * A comprehensive collection of SVG icons specifically designed for
 * the construction industry, including safety, equipment, materials,
 * and progress tracking icons.
 */

export { HardHatIcon } from './HardHatIcon';
export { CraneIcon } from './CraneIcon';
export { BlueprintIcon } from './BlueprintIcon';
export { MaterialsIcon } from './MaterialsIcon';
export { SafetyIcon } from './SafetyIcon';
export { ProgressIcon } from './ProgressIcon';
export { ExcavatorIcon } from './ExcavatorIcon';
export { ToolsIcon } from './ToolsIcon';
export { BuildingIcon } from './BuildingIcon';

// Type exports for all construction icons
export type { HardHatIconProps } from './HardHatIcon';
export type { CraneIconProps } from './CraneIcon';
export type { BlueprintIconProps } from './BlueprintIcon';
export type { MaterialsIconProps } from './MaterialsIcon';
export type { SafetyIconProps } from './SafetyIcon';
export type { ProgressIconProps } from './ProgressIcon';
export type { ExcavatorIconProps } from './ExcavatorIcon';
export type { ToolsIconProps } from './ToolsIcon';
export type { BuildingIconProps } from './BuildingIcon';

/**
 * Construction Icon Categories
 * 
 * Organized by functional categories for easy discovery
 */
export const CONSTRUCTION_ICON_CATEGORIES = {
  safety: ['HardHatIcon', 'SafetyIcon'],
  equipment: ['CraneIcon', 'ExcavatorIcon', 'ToolsIcon'],
  planning: ['BlueprintIcon', 'ProgressIcon'],
  materials: ['MaterialsIcon'],
  structures: ['BuildingIcon'],
} as const;

/**
 * All construction icons for programmatic access
 */
export const ALL_CONSTRUCTION_ICONS = [
  'HardHatIcon',
  'CraneIcon', 
  'BlueprintIcon',
  'MaterialsIcon',
  'SafetyIcon',
  'ProgressIcon',
  'ExcavatorIcon',
  'ToolsIcon',
  'BuildingIcon',
] as const;

export type ConstructionIconName = typeof ALL_CONSTRUCTION_ICONS[number];