# Card System

A comprehensive card system with multiple variants, specialized components for construction industry use cases, and full accessibility support.

## Features

- **Multiple Variants**: Glass, elevated, outlined, and flat styles
- **Micro-interactions**: Hover effects and smooth animations
- **Specialized Cards**: Project, task, material, and document cards
- **Accessible**: Full WCAG 2.1 AA compliance
- **Responsive**: Mobile-optimized design
- **Customizable**: Flexible padding, spacing, and styling options

## Core Components

### Card
The base card component with multiple variants and interaction states.

```tsx
import { Card } from '@/components/design-system/molecules/Card';

<Card variant="glass" hover interactive>
  Card content
</Card>
```

### CardHeader
Header section with optional divider.

```tsx
import { CardHeader } from '@/components/design-system/molecules/Card';

<CardHeader divider>
  Header content
</CardHeader>
```

### CardContent
Main content area with configurable padding.

```tsx
import { CardContent } from '@/components/design-system/molecules/Card';

<CardContent padding="lg">
  Main content
</CardContent>
```

### CardFooter
Footer section with flexible justification options.

```tsx
import { CardFooter } from '@/components/design-system/molecules/Card';

<CardFooter divider justify="between">
  <span>Left content</span>
  <span>Right content</span>
</CardFooter>
```

### CardTitle & CardDescription
Typography components optimized for card headers.

```tsx
import { CardTitle, CardDescription } from '@/components/design-system/molecules/Card';

<CardTitle size="lg">Card Title</CardTitle>
<CardDescription>Card description text</CardDescription>
```

## Specialized Cards

### ProjectCard
Displays construction project information with progress tracking, budget overview, and team details.

```tsx
import { ProjectCard } from '@/components/design-system/molecules/Card';

const projectData = {
  id: '1',
  name: 'Office Building Construction',
  description: 'Modern 10-story office building in downtown area',
  status: 'active',
  progress: 65,
  startDate: '2024-01-15',
  endDate: '2024-12-31',
  budget: 2500000,
  spent: 1625000,
  manager: {
    name: 'John Smith',
    avatar: '/avatars/john.jpg',
  },
  team: 25,
  location: 'Downtown District',
  priority: 'high',
};

<ProjectCard
  project={projectData}
  variant="glass"
  onSelect={(project) => console.log('Selected:', project)}
  onEdit={(project) => console.log('Edit:', project)}
  showActions
/>
```

### TaskCard
Displays construction tasks with assignee information, due dates, and completion status.

```tsx
import { TaskCard } from '@/components/design-system/molecules/Card';

const taskData = {
  id: '1',
  title: 'Foundation Inspection',
  description: 'Conduct thorough inspection of foundation work',
  status: 'in-progress',
  priority: 'high',
  assignee: {
    name: 'Mike Johnson',
    avatar: '/avatars/mike.jpg',
  },
  dueDate: '2024-02-15',
  project: 'Office Building Construction',
  tags: ['inspection', 'foundation', 'quality-control'],
  completed: false,
  subtasks: {
    total: 5,
    completed: 2,
  },
};

<TaskCard
  task={taskData}
  variant="elevated"
  onSelect={(task) => console.log('Selected:', task)}
  onToggleComplete={(task) => console.log('Toggle:', task)}
  compact={false}
/>
```

### MaterialCard
Displays construction materials with supplier information, pricing, and availability.

```tsx
import { MaterialCard } from '@/components/design-system/molecules/Card';

const materialData = {
  id: '1',
  name: 'High-Strength Concrete Mix',
  description: 'Premium concrete mix for structural applications',
  category: 'concrete',
  supplier: {
    name: 'BuildCorp Materials',
    rating: 4.8,
    verified: true,
  },
  price: {
    amount: 125.50,
    unit: 'cubic yard',
    currency: 'USD',
  },
  availability: 'in-stock',
  quantity: {
    available: 500,
    unit: 'cubic yards',
  },
  specifications: {
    grade: 'C30/37',
    dimensions: 'Ready-mix',
    weight: '2400 kg/m³',
  },
  certifications: ['ISO 9001', 'ASTM C94'],
  leadTime: 2,
  minOrder: 10,
};

<MaterialCard
  material={materialData}
  variant="outlined"
  onSelect={(material) => console.log('Selected:', material)}
  onCompare={(material) => console.log('Compare:', material)}
  onOrder={(material) => console.log('Order:', material)}
/>
```

### DocumentCard
Displays construction documents with version control, sharing status, and download tracking.

```tsx
import { DocumentCard } from '@/components/design-system/molecules/Card';

const documentData = {
  id: '1',
  name: 'Structural Blueprints v2.1',
  description: 'Updated structural drawings with latest revisions',
  type: 'blueprint',
  fileType: 'dwg',
  size: 15728640, // 15MB
  uploadedBy: {
    name: 'Sarah Wilson',
    avatar: '/avatars/sarah.jpg',
  },
  uploadedAt: '2024-01-20T10:30:00Z',
  lastModified: '2024-02-01T14:15:00Z',
  version: '2.1',
  status: 'approved',
  project: 'Office Building Construction',
  tags: ['structural', 'blueprints', 'approved'],
  isShared: true,
  downloadCount: 23,
};

<DocumentCard
  document={documentData}
  variant="default"
  onSelect={(doc) => console.log('Selected:', doc)}
  onDownload={(doc) => console.log('Download:', doc)}
  onShare={(doc) => console.log('Share:', doc)}
/>
```

## Variants

### Glass
Modern glassmorphism effect with backdrop blur and transparency.

```tsx
<Card variant="glass">
  Glass card with backdrop blur
</Card>
```

### Elevated
Clean card with prominent shadow for emphasis.

```tsx
<Card variant="elevated">
  Elevated card with shadow
</Card>
```

### Outlined
Minimal card with border and no shadow.

```tsx
<Card variant="outlined">
  Outlined card with border
</Card>
```

### Flat
Subtle background with no shadow or border.

```tsx
<Card variant="flat">
  Flat card with subtle background
</Card>
```

## Interactive States

### Hover Effects
Enable hover animations and visual feedback.

```tsx
<Card hover>
  Card with hover effects
</Card>
```

### Interactive Cards
Make cards clickable with proper focus states.

```tsx
<Card 
  interactive 
  onClick={() => console.log('Card clicked')}
  tabIndex={0}
>
  Interactive clickable card
</Card>
```

## Responsive Design

### Compact Mode
Specialized cards support compact mode for mobile or dense layouts.

```tsx
<TaskCard task={taskData} compact />
<MaterialCard material={materialData} compact />
<DocumentCard document={documentData} compact />
```

### Grid Layouts
Cards work seamlessly in responsive grid systems.

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {projects.map(project => (
    <ProjectCard key={project.id} project={project} />
  ))}
</div>
```

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support for interactive cards
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Focus Management**: Clear focus indicators and logical tab order
- **High Contrast**: Supports high contrast mode
- **Reduced Motion**: Respects user's motion preferences

### ARIA Attributes

```tsx
<Card 
  interactive
  role="button"
  tabIndex={0}
  aria-label="Project card for Office Building"
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Card content
</Card>
```

## Animation Features

- **Smooth Transitions**: Framer Motion powered animations
- **Micro-interactions**: Hover and focus effects
- **Scale Animations**: Subtle scale effects on interaction
- **Performance Optimized**: GPU-accelerated transforms

## Best Practices

### Construction Industry Usage

1. **Status Indicators**: Use consistent color coding for project/task status
2. **Progress Visualization**: Include progress bars for ongoing work
3. **Priority Flags**: Visual indicators for task/project priority
4. **Team Information**: Always show responsible team members
5. **Date Formatting**: Use relative dates for better UX

### Performance

1. **Lazy Loading**: Load card data as needed
2. **Virtualization**: For large lists of cards
3. **Image Optimization**: Optimize avatar and document thumbnails
4. **Memoization**: Prevent unnecessary re-renders

### UX Guidelines

1. **Consistent Actions**: Standardize card actions across types
2. **Visual Hierarchy**: Use typography and spacing effectively
3. **Loading States**: Show skeleton loaders while data loads
4. **Error States**: Handle and display errors gracefully

## Examples

### Project Dashboard Grid

```tsx
const ProjectDashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map(project => (
        <ProjectCard
          key={project.id}
          project={project}
          variant="glass"
          onSelect={handleProjectSelect}
          onEdit={handleProjectEdit}
        />
      ))}
    </div>
  );
};
```

### Task Board Column

```tsx
const TaskColumn = ({ tasks, status }) => {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900">{status}</h3>
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          variant="outlined"
          compact
          onSelect={handleTaskSelect}
          onToggleComplete={handleTaskToggle}
        />
      ))}
    </div>
  );
};
```

### Material Catalog

```tsx
const MaterialCatalog = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {materials.map(material => (
        <MaterialCard
          key={material.id}
          material={material}
          variant="elevated"
          onSelect={handleMaterialSelect}
          onCompare={handleMaterialCompare}
          onOrder={handleMaterialOrder}
        />
      ))}
    </div>
  );
};
```

### Document Library

```tsx
const DocumentLibrary = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  return (
    <div className={cn(
      viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
        : 'space-y-2'
    )}>
      {documents.map(document => (
        <DocumentCard
          key={document.id}
          document={document}
          variant={viewMode === 'grid' ? 'default' : 'outlined'}
          compact={viewMode === 'list'}
          onSelect={handleDocumentSelect}
          onDownload={handleDocumentDownload}
          onShare={handleDocumentShare}
        />
      ))}
    </div>
  );
};
```

## Styling

The card system uses Tailwind CSS classes and can be customized through:

```tsx
// Custom className
<Card className="my-custom-card">
  Content
</Card>

// CSS custom properties
.my-custom-card {
  --card-bg: rgba(255, 255, 255, 0.1);
  --card-border: rgba(255, 255, 255, 0.2);
  --card-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

## Integration with State Management

### With React Query

```tsx
const ProjectCards = () => {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  if (isLoading) {
    return <ProjectCardSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects?.map(project => (
        <ProjectCard
          key={project.id}
          project={project}
          onSelect={handleProjectSelect}
        />
      ))}
    </div>
  );
};
```

### With Zustand

```tsx
const useProjectStore = create((set) => ({
  selectedProject: null,
  setSelectedProject: (project) => set({ selectedProject: project }),
}));

const ProjectCard = ({ project }) => {
  const setSelectedProject = useProjectStore(state => state.setSelectedProject);
  
  return (
    <ProjectCard
      project={project}
      onSelect={setSelectedProject}
    />
  );
};
```