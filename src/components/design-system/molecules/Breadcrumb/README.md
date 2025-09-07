# Breadcrumb Component

A modern breadcrumb navigation component with construction project hierarchy support, glassmorphism effects, and comprehensive accessibility features.

## Features

- **Construction Hierarchy**: Optimized for construction project navigation
- **Modern Design**: Glassmorphism and minimal variants
- **Overflow Handling**: Intelligent truncation for long paths
- **Accessible**: Full WCAG 2.1 AA compliance
- **Customizable**: Multiple variants and separators
- **Responsive**: Mobile-optimized design

## Usage

### Basic Breadcrumb

```tsx
import { Breadcrumb } from '@/components/design-system/molecules/Breadcrumb';

const breadcrumbItems = [
  {
    id: 'projects',
    label: 'Projects',
    href: '/projects',
    icon: <ProjectsIcon />,
  },
  {
    id: 'project-1',
    label: 'Office Building Construction',
    href: '/projects/1',
  },
  {
    id: 'tasks',
    label: 'Tasks',
    href: '/projects/1/tasks',
  },
  {
    id: 'current-task',
    label: 'Foundation Work',
    current: true,
  },
];

function App() {
  return (
    <Breadcrumb
      items={breadcrumbItems}
      onItemClick={(item) => console.log('Navigate to:', item)}
      variant="glass"
      showHome
    />
  );
}
```

### Construction Project Hierarchy

```tsx
import { 
  BuildingIcon, 
  ToolsIcon, 
  ProgressIcon 
} from '@/components/design-system/atoms/Icon/construction';

const constructionBreadcrumb = [
  {
    id: 'projects',
    label: 'Projects',
    href: '/projects',
    icon: <BuildingIcon />,
  },
  {
    id: 'residential-complex',
    label: 'Residential Complex A',
    href: '/projects/residential-complex-a',
  },
  {
    id: 'phase-2',
    label: 'Phase 2',
    href: '/projects/residential-complex-a/phase-2',
  },
  {
    id: 'building-b',
    label: 'Building B',
    href: '/projects/residential-complex-a/phase-2/building-b',
  },
  {
    id: 'floor-3',
    label: 'Floor 3',
    href: '/projects/residential-complex-a/phase-2/building-b/floor-3',
  },
  {
    id: 'electrical-work',
    label: 'Electrical Installation',
    current: true,
  },
];

<Breadcrumb
  items={constructionBreadcrumb}
  variant="glass"
  maxItems={4}
  onItemClick={handleNavigation}
/>
```

### Material Management Breadcrumb

```tsx
const materialsBreadcrumb = [
  {
    id: 'materials',
    label: 'Materials',
    href: '/materials',
    icon: <MaterialsIcon />,
  },
  {
    id: 'concrete',
    label: 'Concrete & Cement',
    href: '/materials/concrete',
  },
  {
    id: 'ready-mix',
    label: 'Ready-Mix Concrete',
    href: '/materials/concrete/ready-mix',
  },
  {
    id: 'supplier-comparison',
    label: 'Supplier Comparison',
    current: true,
  },
];
```

## Props

### BreadcrumbProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `BreadcrumbItem[]` | - | Array of breadcrumb items |
| `onItemClick` | `(item: BreadcrumbItem) => void` | - | Callback for item clicks |
| `separator` | `ReactNode` | `<ChevronRight />` | Custom separator element |
| `className` | `string` | - | Additional CSS classes |
| `variant` | `'default' \| 'glass' \| 'minimal'` | `'default'` | Visual variant |
| `showHome` | `boolean` | `true` | Whether to show home item |
| `maxItems` | `number` | `5` | Maximum items before truncation |

### BreadcrumbItem

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique identifier |
| `label` | `string` | Display text |
| `href` | `string` | Optional navigation URL |
| `icon` | `ReactNode` | Optional icon |
| `current` | `boolean` | Whether item is current page |
| `disabled` | `boolean` | Whether item is disabled |

## Variants

### Default
Clean background with subtle styling.

```tsx
<Breadcrumb variant="default" items={items} />
```

### Glass
Modern glassmorphism effect with backdrop blur.

```tsx
<Breadcrumb variant="glass" items={items} />
```

### Minimal
No background, minimal styling.

```tsx
<Breadcrumb variant="minimal" items={items} />
```

## Overflow Handling

When the breadcrumb path exceeds `maxItems`, the component intelligently truncates the middle items:

```tsx
// Long path: Home > Projects > Complex A > Phase 2 > Building B > Floor 3 > Current
// Becomes: Home > ... > Building B > Floor 3 > Current

<Breadcrumb
  items={longPath}
  maxItems={5}
  showHome
/>
```

## Custom Separators

```tsx
// Arrow separator
<Breadcrumb
  items={items}
  separator={<span>→</span>}
/>

// Slash separator
<Breadcrumb
  items={items}
  separator={<span>/</span>}
/>

// Custom icon separator
<Breadcrumb
  items={items}
  separator={<Icon name="chevron-right" size="xs" />}
/>
```

## Accessibility Features

- **Semantic HTML**: Uses `<nav>` and `<ol>` elements
- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard support
- **Current Page**: `aria-current="page"` for current item
- **Focus Management**: Clear focus indicators

### ARIA Attributes

- `role="navigation"` with `aria-label="Breadcrumb"`
- `aria-current="page"` for current item
- `aria-hidden="true"` for decorative separators

## Construction Industry Examples

### Project Phase Navigation

```tsx
const phaseNavigation = [
  {
    id: 'projects',
    label: 'Projects',
    href: '/projects',
    icon: <BuildingIcon />,
  },
  {
    id: 'commercial-plaza',
    label: 'Commercial Plaza Development',
    href: '/projects/commercial-plaza',
  },
  {
    id: 'pre-construction',
    label: 'Pre-Construction',
    href: '/projects/commercial-plaza/pre-construction',
  },
  {
    id: 'site-preparation',
    label: 'Site Preparation',
    href: '/projects/commercial-plaza/pre-construction/site-prep',
  },
  {
    id: 'soil-testing',
    label: 'Soil Testing Results',
    current: true,
  },
];
```

### Quality Control Navigation

```tsx
const qualityNavigation = [
  {
    id: 'quality',
    label: 'Quality Control',
    href: '/quality',
    icon: <QualityIcon />,
  },
  {
    id: 'inspections',
    label: 'Inspections',
    href: '/quality/inspections',
  },
  {
    id: 'structural',
    label: 'Structural Inspections',
    href: '/quality/inspections/structural',
  },
  {
    id: 'foundation-inspection',
    label: 'Foundation Inspection Report',
    current: true,
  },
];
```

### Material Procurement Navigation

```tsx
const procurementNavigation = [
  {
    id: 'procurement',
    label: 'Procurement',
    href: '/procurement',
    icon: <ProcurementIcon />,
  },
  {
    id: 'steel',
    label: 'Steel & Rebar',
    href: '/procurement/steel',
  },
  {
    id: 'structural-steel',
    label: 'Structural Steel',
    href: '/procurement/steel/structural',
  },
  {
    id: 'vendor-quotes',
    label: 'Vendor Quotes Comparison',
    current: true,
  },
];
```

## Best Practices

### Construction Projects

1. **Hierarchical Structure**: Follow project → phase → area → task hierarchy
2. **Meaningful Labels**: Use descriptive names that reflect construction terminology
3. **Status Indicators**: Consider adding status icons for different phases
4. **Mobile Optimization**: Ensure readability on mobile devices

### Performance

1. **Lazy Loading**: Load breadcrumb data as needed
2. **Memoization**: Prevent unnecessary re-renders
3. **Efficient Updates**: Update only when path changes

### UX Guidelines

1. **Clear Hierarchy**: Make the navigation path obvious
2. **Clickable Items**: Ensure non-current items are clearly clickable
3. **Visual Feedback**: Provide hover and focus states
4. **Consistent Styling**: Match the overall application design

## Styling

The component uses Tailwind CSS classes and can be customized through:

```tsx
// Custom className
<Breadcrumb
  items={items}
  className="my-custom-breadcrumb"
/>

// CSS custom properties
.my-custom-breadcrumb {
  --breadcrumb-bg: rgba(255, 255, 255, 0.1);
  --breadcrumb-text: #374151;
  --breadcrumb-separator: #9CA3AF;
}
```

## Integration with Routing

### Next.js Integration

```tsx
import { useRouter } from 'next/router';
import { Breadcrumb } from '@/components/design-system/molecules/Breadcrumb';

function ProjectBreadcrumb() {
  const router = useRouter();
  
  const handleItemClick = (item: BreadcrumbItem) => {
    if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <Breadcrumb
      items={breadcrumbItems}
      onItemClick={handleItemClick}
    />
  );
}
```

### React Router Integration

```tsx
import { useNavigate } from 'react-router-dom';

function ProjectBreadcrumb() {
  const navigate = useNavigate();
  
  const handleItemClick = (item: BreadcrumbItem) => {
    if (item.href) {
      navigate(item.href);
    }
  };

  return (
    <Breadcrumb
      items={breadcrumbItems}
      onItemClick={handleItemClick}
    />
  );
}
```