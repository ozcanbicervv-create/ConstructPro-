# Construction Icon Library

A comprehensive collection of SVG icons specifically designed for the construction industry, built with accessibility, performance, and developer experience in mind.

## Features

- ✅ **Construction-Specific**: Icons tailored for construction industry workflows
- ✅ **Accessibility First**: WCAG 2.1 AA compliant with proper ARIA labels
- ✅ **Multiple Sizes**: 7 size variants from `xs` to `3xl`
- ✅ **Color Variants**: 8 semantic color options
- ✅ **Animations**: 6 animation types including custom `wiggle` effect
- ✅ **TypeScript**: Full type safety with strict TypeScript support
- ✅ **Tree Shakeable**: Import only the icons you need
- ✅ **Consistent API**: Unified interface across all icons

## Quick Start

```tsx
import { HardHatIcon, SafetyIcon, CraneIcon } from '@/components/design-system/atoms/Icon';

function MyComponent() {
  return (
    <div>
      <HardHatIcon size="lg" color="primary" />
      <SafetyIcon size="md" color="success" animation="pulse" />
      <CraneIcon size="xl" color="warning" animation="wiggle" />
    </div>
  );
}
```

## Available Icons

### Safety Category
- **HardHatIcon** - Safety helmet for construction workers
- **SafetyIcon** - Safety shield with checkmark

### Equipment Category  
- **CraneIcon** - Tower crane for heavy lifting
- **ExcavatorIcon** - Heavy excavation machinery
- **ToolsIcon** - Construction tools and equipment

### Planning Category
- **BlueprintIcon** - Architectural plans and drawings
- **ProgressIcon** - Construction progress tracking

### Materials Category
- **MaterialsIcon** - Construction materials like bricks and cement

### Structures Category
- **BuildingIcon** - Building structures and architecture

## API Reference

### Base Icon Component

```tsx
interface IconProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'muted' | 'white';
  animation?: 'none' | 'spin' | 'pulse' | 'bounce' | 'ping' | 'wiggle';
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  role?: string;
  title?: string;
}
```

### Size Variants

| Size | Dimensions | Use Case |
|------|------------|----------|
| `xs` | 12px × 12px | Small inline icons |
| `sm` | 16px × 16px | Button icons, form elements |
| `md` | 20px × 20px | Default size, general use |
| `lg` | 24px × 24px | Navigation, headers |
| `xl` | 32px × 32px | Feature highlights |
| `2xl` | 40px × 40px | Dashboard widgets |
| `3xl` | 48px × 48px | Hero sections, landing pages |

### Color Variants

| Color | CSS Class | Use Case |
|-------|-----------|----------|
| `default` | `text-current` | Inherits parent color |
| `primary` | `text-blue-600` | Primary actions, branding |
| `secondary` | `text-gray-600` | Secondary information |
| `success` | `text-green-600` | Success states, completed tasks |
| `warning` | `text-yellow-600` | Warnings, caution |
| `danger` | `text-red-600` | Errors, dangerous actions |
| `muted` | `text-gray-400` | Disabled states, subtle info |
| `white` | `text-white` | Dark backgrounds |

### Animation Variants

| Animation | Effect | Use Case |
|-----------|--------|----------|
| `none` | No animation | Default state |
| `spin` | Continuous rotation | Loading states |
| `pulse` | Opacity fade in/out | Attention, notifications |
| `bounce` | Vertical bounce | Playful interactions |
| `ping` | Scale pulse | New notifications |
| `wiggle` | Gentle rotation | Interactive feedback |

## Usage Examples

### Basic Usage

```tsx
import { HardHatIcon } from '@/components/design-system/atoms/Icon';

<HardHatIcon />
```

### With Size and Color

```tsx
<SafetyIcon size="lg" color="success" />
```

### With Animation

```tsx
<CraneIcon size="xl" color="primary" animation="wiggle" />
```

### With Custom Styling

```tsx
<ProgressIcon 
  size="md" 
  color="primary"
  className="hover:text-blue-700 transition-colors"
/>
```

### Accessibility Enhanced

```tsx
<HardHatIcon 
  size="lg"
  color="warning"
  aria-label="Safety equipment required"
  aria-describedby="safety-description"
  title="Hard Hat Required"
/>
```

## Accessibility Features

### ARIA Support
All icons include proper ARIA attributes:
- `aria-label`: Descriptive text for screen readers
- `title`: Tooltip text for mouse users
- `role="img"`: Semantic role (customizable)

### Keyboard Navigation
Icons support keyboard navigation when used as interactive elements:

```tsx
<HardHatIcon 
  className="focus:outline-none focus:ring-2 focus:ring-blue-500"
  tabIndex={0}
/>
```

### High Contrast Support
Icons automatically adapt to high contrast modes and support custom color schemes.

## Programmatic Access

### Icon Categories

```tsx
import { CONSTRUCTION_ICON_CATEGORIES } from '@/components/design-system/atoms/Icon';

// Access icons by category
const safetyIcons = CONSTRUCTION_ICON_CATEGORIES.safety; // ['HardHatIcon', 'SafetyIcon']
const equipmentIcons = CONSTRUCTION_ICON_CATEGORIES.equipment; // ['CraneIcon', 'ExcavatorIcon', 'ToolsIcon']
```

### All Icons List

```tsx
import { ALL_CONSTRUCTION_ICONS } from '@/components/design-system/atoms/Icon';

// Get all available icon names
console.log(ALL_CONSTRUCTION_ICONS); 
// ['HardHatIcon', 'CraneIcon', 'BlueprintIcon', ...]
```

### Dynamic Icon Rendering

```tsx
import * as Icons from '@/components/design-system/atoms/Icon';

function DynamicIcon({ iconName, ...props }) {
  const IconComponent = Icons[iconName];
  return IconComponent ? <IconComponent {...props} /> : null;
}

<DynamicIcon iconName="HardHatIcon" size="lg" color="primary" />
```

## Performance Considerations

### Tree Shaking
Import only the icons you need to minimize bundle size:

```tsx
// ✅ Good - Only imports specific icons
import { HardHatIcon, SafetyIcon } from '@/components/design-system/atoms/Icon';

// ❌ Avoid - Imports entire library
import * as Icons from '@/components/design-system/atoms/Icon';
```

### SVG Optimization
All icons are optimized SVGs with:
- Minimal path data
- Consistent viewBox (24×24)
- Semantic stroke properties
- Optimized for compression

## Customization

### Custom Colors
Use Tailwind classes for custom colors:

```tsx
<HardHatIcon className="text-purple-600" />
```

### Custom Animations
Add custom animations via CSS classes:

```tsx
<CraneIcon className="hover:scale-110 transition-transform" />
```

### Responsive Sizing
Use responsive size classes:

```tsx
<SafetyIcon className="h-4 w-4 md:h-6 md:w-6 lg:h-8 lg:w-8" />
```

## Testing

The icon library includes comprehensive tests:

```bash
# Run icon tests
npm test -- --testPathPatterns="Icon"

# Run specific icon tests
npm test -- Icon.test.tsx
npm test -- construction-icons.test.tsx
```

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Contributing

When adding new construction icons:

1. Follow the existing naming convention (`[Name]Icon`)
2. Include proper accessibility attributes
3. Add to appropriate category in `CONSTRUCTION_ICON_CATEGORIES`
4. Update `ALL_CONSTRUCTION_ICONS` array
5. Write comprehensive tests
6. Update this README

## License

Part of the ConstructPro Design System. See project license for details.