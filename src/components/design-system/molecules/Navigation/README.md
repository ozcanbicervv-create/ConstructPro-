# Navigation Component

A modern, responsive navigation component with glassmorphism effects, collapsible sidebar functionality, and comprehensive accessibility support.

## Features

- **Modern Design**: Glassmorphism effects with backdrop blur and transparency
- **Responsive**: Adapts to different screen sizes with mobile-first approach
- **Collapsible**: Smooth animations for sidebar collapse/expand
- **Hierarchical**: Support for nested navigation items with expand/collapse
- **Accessible**: Full WCAG 2.1 AA compliance with keyboard navigation
- **Touch-Friendly**: Optimized for mobile interactions
- **Customizable**: Multiple variants and positioning options

## Usage

### Basic Navigation

```tsx
import { Navigation } from '@/components/design-system/molecules/Navigation';

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: <DashboardIcon />,
    active: true,
  },
  {
    id: 'projects',
    label: 'Projects',
    href: '/projects',
    icon: <ProjectsIcon />,
    badge: 5,
    children: [
      {
        id: 'active-projects',
        label: 'Active Projects',
        href: '/projects/active',
      },
      {
        id: 'completed-projects',
        label: 'Completed Projects',
        href: '/projects/completed',
      },
    ],
  },
];

function App() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Navigation
      items={navigationItems}
      collapsed={collapsed}
      onToggleCollapse={() => setCollapsed(!collapsed)}
      onItemClick={(item) => console.log('Clicked:', item)}
      variant="glass"
    />
  );
}
```

### Horizontal Navigation

```tsx
<Navigation
  items={navigationItems}
  position="top"
  variant="glass"
  onItemClick={handleNavigation}
/>
```

### Construction-Specific Navigation

```tsx
import { 
  BuildingIcon, 
  ToolsIcon, 
  ExcavatorIcon, 
  ProgressIcon 
} from '@/components/design-system/atoms/Icon/construction';

const constructionNavItems = [
  {
    id: 'projects',
    label: 'Projects',
    href: '/projects',
    icon: <BuildingIcon />,
    badge: 3,
  },
  {
    id: 'equipment',
    label: 'Equipment',
    href: '/equipment',
    icon: <ExcavatorIcon />,
    children: [
      {
        id: 'heavy-machinery',
        label: 'Heavy Machinery',
        href: '/equipment/heavy',
      },
      {
        id: 'tools',
        label: 'Tools',
        href: '/equipment/tools',
      },
    ],
  },
  {
    id: 'progress',
    label: 'Progress Tracking',
    href: '/progress',
    icon: <ProgressIcon />,
  },
];
```

## Props

### NavigationProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `NavigationItem[]` | - | Array of navigation items |
| `collapsed` | `boolean` | `false` | Whether the sidebar is collapsed |
| `onToggleCollapse` | `() => void` | - | Callback for collapse toggle |
| `onItemClick` | `(item: NavigationItem) => void` | - | Callback for item clicks |
| `className` | `string` | - | Additional CSS classes |
| `variant` | `'default' \| 'glass' \| 'solid'` | `'glass'` | Visual variant |
| `position` | `'left' \| 'top'` | `'left'` | Navigation position |

### NavigationItem

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique identifier |
| `label` | `string` | Display text |
| `href` | `string` | Navigation URL |
| `icon` | `ReactNode` | Optional icon |
| `badge` | `number \| string` | Optional badge content |
| `active` | `boolean` | Whether item is currently active |
| `children` | `NavigationItem[]` | Nested navigation items |
| `disabled` | `boolean` | Whether item is disabled |

## Variants

### Glass (Default)
Modern glassmorphism effect with backdrop blur and transparency.

```tsx
<Navigation variant="glass" items={items} />
```

### Solid
Traditional solid background with clean borders.

```tsx
<Navigation variant="solid" items={items} />
```

### Default
Subtle background with light transparency.

```tsx
<Navigation variant="default" items={items} />
```

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support with Tab, Enter, and Space
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Focus Management**: Clear focus indicators and logical tab order
- **High Contrast**: Supports high contrast mode
- **Reduced Motion**: Respects user's motion preferences

### ARIA Attributes

- `role="navigation"` on the main container
- `aria-label` for navigation context
- `aria-current="page"` for active items
- `aria-expanded` for expandable items
- `aria-disabled` for disabled items

## Animation Features

- **Smooth Transitions**: Framer Motion powered animations
- **Micro-interactions**: Hover and focus effects
- **Collapse Animation**: Smooth width transitions
- **Expand/Collapse**: Height animations for nested items
- **Performance Optimized**: GPU-accelerated transforms

## Mobile Optimization

- **Touch Targets**: Minimum 44px touch targets
- **Swipe Gestures**: Support for swipe interactions
- **Responsive Design**: Adapts to different screen sizes
- **Mobile Menu**: Collapsible mobile navigation
- **Performance**: Optimized for mobile devices

## Best Practices

### Construction Industry Usage

1. **Use Industry Icons**: Leverage construction-specific icons for better UX
2. **Badge Notifications**: Show counts for pending tasks, active projects
3. **Hierarchical Structure**: Organize by project phases or departments
4. **Status Indicators**: Use colors to indicate project status

### Performance

1. **Lazy Loading**: Load nested items only when expanded
2. **Virtualization**: For large navigation trees
3. **Memoization**: Prevent unnecessary re-renders
4. **Bundle Splitting**: Code split navigation components

### Accessibility

1. **Semantic HTML**: Use proper navigation landmarks
2. **Keyboard Support**: Ensure all interactions work with keyboard
3. **Screen Readers**: Test with screen reader software
4. **Color Contrast**: Maintain WCAG AA contrast ratios

## Examples

### Project Management Navigation

```tsx
const projectNavigation = [
  {
    id: 'overview',
    label: 'Project Overview',
    href: '/projects/overview',
    icon: <DashboardIcon />,
    active: true,
  },
  {
    id: 'planning',
    label: 'Planning',
    href: '/projects/planning',
    icon: <PlanningIcon />,
    children: [
      {
        id: 'blueprints',
        label: 'Blueprints',
        href: '/projects/planning/blueprints',
      },
      {
        id: 'timeline',
        label: 'Timeline',
        href: '/projects/planning/timeline',
      },
      {
        id: 'resources',
        label: 'Resources',
        href: '/projects/planning/resources',
      },
    ],
  },
  {
    id: 'execution',
    label: 'Execution',
    href: '/projects/execution',
    icon: <ExecutionIcon />,
    badge: 5,
    children: [
      {
        id: 'tasks',
        label: 'Tasks',
        href: '/projects/execution/tasks',
        badge: 12,
      },
      {
        id: 'materials',
        label: 'Materials',
        href: '/projects/execution/materials',
      },
      {
        id: 'quality',
        label: 'Quality Control',
        href: '/projects/execution/quality',
        badge: 2,
      },
    ],
  },
];
```

### Team Management Navigation

```tsx
const teamNavigation = [
  {
    id: 'team-overview',
    label: 'Team Overview',
    href: '/team',
    icon: <TeamIcon />,
  },
  {
    id: 'roles',
    label: 'Roles & Permissions',
    href: '/team/roles',
    icon: <RolesIcon />,
    children: [
      {
        id: 'project-managers',
        label: 'Project Managers',
        href: '/team/roles/pm',
      },
      {
        id: 'supervisors',
        label: 'Site Supervisors',
        href: '/team/roles/supervisors',
      },
      {
        id: 'workers',
        label: 'Construction Workers',
        href: '/team/roles/workers',
      },
    ],
  },
  {
    id: 'communication',
    label: 'Communication',
    href: '/team/communication',
    icon: <CommunicationIcon />,
    badge: 3,
  },
];
```