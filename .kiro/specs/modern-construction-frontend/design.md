# Design Document

## Overview

ConstructPro frontend will be built as a modern, responsive web application using Next.js 15 with React 19, featuring a professional American-style yellow-black color scheme optimized for the construction industry. The design emphasizes clean, intuitive interfaces with real-time collaboration capabilities, comprehensive project management tools, and seamless integration of AR features.

The architecture follows modern React patterns with component-based design, utilizing shadcn/ui for consistent UI components, Tailwind CSS for styling, and Socket.IO for real-time features. The design prioritizes performance, accessibility, and mobile-first responsive design principles.

## Architecture

### Frontend Architecture Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
├─────────────────────────────────────────────────────────────┤
│  React 19 Components │ shadcn/ui │ Tailwind CSS │ Framer Motion │
├─────────────────────────────────────────────────────────────┤
│                    Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Next.js 15 App Router │ Zustand State │ TanStack Query │ Socket.IO │
├─────────────────────────────────────────────────────────────┤
│                    Integration Layer                        │
├─────────────────────────────────────────────────────────────┤
│  API Routes │ WebSocket Handlers │ Auth Middleware │ File Upload │
├─────────────────────────────────────────────────────────────┤
│                    Infrastructure Layer                     │
├─────────────────────────────────────────────────────────────┤
│  Custom Server.ts │ Prisma ORM │ SQLite/PostgreSQL │ Socket.IO Server │
└─────────────────────────────────────────────────────────────┘
```

### Design System Architecture

```
Design System
├── Color Palette (Yellow-Black Construction Theme)
├── Typography (Professional Construction Industry)
├── Component Library (shadcn/ui + Custom Components)
├── Layout System (Grid + Flexbox)
├── Animation System (Framer Motion)
└── Responsive Breakpoints (Mobile-First)
```

## Components and Interfaces

### 1. Color Palette & Theme System

**Primary Color Palette:**
```css
/* Construction Yellow Variants */
--construction-yellow-50: #fffbeb
--construction-yellow-100: #fef3c7
--construction-yellow-400: #fbbf24  /* Primary Yellow */
--construction-yellow-500: #f59e0b  /* Accent Yellow */
--construction-yellow-600: #d97706  /* Dark Yellow */

/* Professional Black/Gray Variants */
--construction-black-50: #f9fafb
--construction-black-100: #f3f4f6
--construction-black-800: #1f2937   /* Primary Dark */
--construction-black-900: #111827   /* Deep Black */
--construction-black-950: #030712   /* Absolute Black */

/* Status Colors */
--success-green: #10b981
--warning-orange: #f59e0b
--error-red: #ef4444
--info-blue: #3b82f6
```

**Theme Configuration:**
```typescript
const constructionTheme = {
  colors: {
    primary: {
      50: 'hsl(48, 100%, 96%)',
      400: 'hsl(43, 96%, 56%)',  // Main Yellow
      500: 'hsl(38, 92%, 50%)',  // Accent Yellow
    },
    secondary: {
      800: 'hsl(217, 33%, 17%)', // Primary Dark
      900: 'hsl(224, 71%, 4%)',  // Deep Black
    }
  }
}
```

### 2. Layout System

**Main Application Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│                    Header Navigation                        │
│  [Logo] [Search] [Notifications] [User Menu]              │
├─────────────────────────────────────────────────────────────┤
│ Sidebar │                Main Content Area                  │
│         │                                                  │
│ [Nav]   │  ┌─────────────────────────────────────────────┐ │
│ [Menu]  │  │            Page Content                     │ │
│ [Items] │  │                                             │ │
│         │  │  [Cards/Tables/Forms/Charts]                │ │
│         │  │                                             │ │
│         │  └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Footer (Optional)                        │
└─────────────────────────────────────────────────────────────┘
```

**Responsive Breakpoints:**
- Mobile: 320px - 768px (Collapsible sidebar)
- Tablet: 768px - 1024px (Condensed sidebar)
- Desktop: 1024px+ (Full sidebar)

### 3. Navigation Components

**Sidebar Navigation Structure:**
```typescript
interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: number;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard'
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: FolderOpen,
    href: '/projects',
    children: [
      { id: 'active', label: 'Active Projects', icon: Play, href: '/projects/active' },
      { id: 'completed', label: 'Completed', icon: CheckCircle, href: '/projects/completed' }
    ]
  },
  {
    id: 'materials',
    label: 'Materials',
    icon: Package,
    href: '/materials'
  },
  {
    id: 'team',
    label: 'Team',
    icon: Users,
    href: '/team'
  },
  {
    id: 'ar-tools',
    label: 'AR Tools',
    icon: Cube,
    href: '/ar-tools'
  }
];
```

### 4. Dashboard Components

**Dashboard Layout:**
```typescript
interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'list' | 'progress';
  size: 'sm' | 'md' | 'lg' | 'xl';
  data: any;
}

const dashboardWidgets: DashboardWidget[] = [
  {
    id: 'active-projects',
    title: 'Active Projects',
    type: 'metric',
    size: 'sm',
    data: { value: 12, change: '+2', trend: 'up' }
  },
  {
    id: 'project-progress',
    title: 'Project Progress',
    type: 'chart',
    size: 'lg',
    data: { chartType: 'progress-ring', projects: [...] }
  }
];
```

**Key Dashboard Widgets:**
- Project Status Overview (Progress rings)
- Team Activity Feed (Real-time updates)
- Material Alerts (Low inventory warnings)
- Upcoming Deadlines (Timeline view)
- Weather Integration (Construction-specific)
- Budget Tracking (Financial metrics)

### 5. Project Management Interface

**Project Card Component:**
```typescript
interface ProjectCard {
  id: string;
  name: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed';
  progress: number;
  deadline: Date;
  team: TeamMember[];
  budget: {
    allocated: number;
    spent: number;
    remaining: number;
  };
  priority: 'low' | 'medium' | 'high' | 'critical';
}
```

**Project Detail Views:**
- Gantt Chart Timeline (Interactive scheduling)
- Kanban Board (Task management)
- Resource Allocation (Team and material assignment)
- Progress Tracking (Milestone completion)
- Document Management (Plans, permits, reports)

### 6. Real-Time Collaboration System

**Socket.IO Integration Architecture:**
```typescript
// Client-side Socket Manager
class SocketManager {
  private socket: Socket;
  
  constructor() {
    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);
    this.setupEventHandlers();
  }
  
  setupEventHandlers() {
    this.socket.on('project-update', this.handleProjectUpdate);
    this.socket.on('team-message', this.handleTeamMessage);
    this.socket.on('material-alert', this.handleMaterialAlert);
  }
  
  joinProjectRoom(projectId: string) {
    this.socket.emit('join-project', projectId);
  }
}
```

**Real-Time Features:**
- Live project updates
- Team chat and messaging
- Collaborative document editing
- Real-time notifications
- Presence indicators
- Activity feeds

### 7. Material Management Interface

**Material Comparison Component:**
```typescript
interface Material {
  id: string;
  name: string;
  category: string;
  specifications: Record<string, any>;
  pricing: {
    unitPrice: number;
    bulkPrice?: number;
    currency: string;
  };
  supplier: Supplier;
  availability: {
    inStock: number;
    leadTime: number;
    minimumOrder: number;
  };
  ratings: {
    quality: number;
    delivery: number;
    service: number;
  };
}
```

**Material Management Features:**
- Advanced search and filtering
- Side-by-side comparison tables
- Inventory tracking with alerts
- Supplier management
- Purchase order generation
- Cost analysis and reporting

### 8. AR Integration Interface

**AR Component Architecture:**
```typescript
interface ARViewer {
  modelUrl: string;
  projectId: string;
  annotations: ARAnnotation[];
  viewMode: '2d' | '3d' | 'ar';
  controls: {
    zoom: boolean;
    rotate: boolean;
    measure: boolean;
    annotate: boolean;
  };
}

interface ARAnnotation {
  id: string;
  position: [number, number, number];
  content: string;
  type: 'note' | 'measurement' | 'issue' | 'approval';
  author: string;
  timestamp: Date;
}
```

**AR Features:**
- 3D model viewer (Three.js/React Three Fiber)
- AR session launcher (WebXR API)
- Annotation system
- Measurement tools
- Collaborative AR sessions
- Mobile AR support

## Data Models

### 1. User and Authentication

```typescript
interface User {
  id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    title: string;
    company: string;
    phone?: string;
  };
  role: 'admin' | 'manager' | 'worker' | 'client';
  permissions: Permission[];
  preferences: {
    theme: 'light' | 'dark';
    notifications: NotificationSettings;
    language: string;
  };
  lastActive: Date;
  isOnline: boolean;
}
```

### 2. Project Data Structure

```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  timeline: {
    startDate: Date;
    endDate: Date;
    milestones: Milestone[];
  };
  team: ProjectTeamMember[];
  budget: ProjectBudget;
  location: {
    address: string;
    coordinates: [number, number];
  };
  documents: Document[];
  materials: MaterialRequirement[];
  tasks: Task[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
  };
}
```

### 3. Real-Time State Management

```typescript
// Zustand Store Structure
interface AppState {
  // User State
  user: User | null;
  isAuthenticated: boolean;
  
  // Project State
  currentProject: Project | null;
  projects: Project[];
  
  // Real-Time State
  onlineUsers: User[];
  notifications: Notification[];
  
  // UI State
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  
  // Actions
  setUser: (user: User) => void;
  setCurrentProject: (project: Project) => void;
  addNotification: (notification: Notification) => void;
  toggleSidebar: () => void;
}
```

## Error Handling

### 1. Error Boundary System

```typescript
class ConstructionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    // Log to monitoring service
    console.error('Construction App Error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### 2. API Error Handling

```typescript
// Centralized error handling for API calls
const apiErrorHandler = {
  handleError: (error: AxiosError) => {
    switch (error.response?.status) {
      case 401:
        // Redirect to login
        router.push('/login');
        break;
      case 403:
        toast.error('Access denied');
        break;
      case 500:
        toast.error('Server error. Please try again.');
        break;
      default:
        toast.error('An unexpected error occurred');
    }
  }
};
```

### 3. Form Validation

```typescript
// Zod schemas for form validation
const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  budget: z.number().positive('Budget must be positive'),
});

type ProjectFormData = z.infer<typeof projectSchema>;
```

## Testing Strategy

### 1. Component Testing

```typescript
// Jest + React Testing Library
describe('ProjectCard Component', () => {
  it('displays project information correctly', () => {
    const mockProject = createMockProject();
    render(<ProjectCard project={mockProject} />);
    
    expect(screen.getByText(mockProject.name)).toBeInTheDocument();
    expect(screen.getByText(`${mockProject.progress}%`)).toBeInTheDocument();
  });
  
  it('handles status updates', async () => {
    const mockProject = createMockProject();
    const onStatusChange = jest.fn();
    
    render(<ProjectCard project={mockProject} onStatusChange={onStatusChange} />);
    
    const statusButton = screen.getByRole('button', { name: /change status/i });
    fireEvent.click(statusButton);
    
    await waitFor(() => {
      expect(onStatusChange).toHaveBeenCalled();
    });
  });
});
```

### 2. Integration Testing

```typescript
// Testing real-time features
describe('Real-time Collaboration', () => {
  it('receives project updates via Socket.IO', async () => {
    const { socket } = renderWithSocket(<ProjectDashboard />);
    
    // Simulate server update
    socket.emit('project-update', {
      projectId: 'test-project',
      update: { progress: 75 }
    });
    
    await waitFor(() => {
      expect(screen.getByText('75%')).toBeInTheDocument();
    });
  });
});
```

### 3. E2E Testing

```typescript
// Playwright E2E tests
test('complete project workflow', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Create new project
  await page.click('[data-testid="new-project-button"]');
  await page.fill('[data-testid="project-name"]', 'Test Construction Project');
  await page.click('[data-testid="save-project"]');
  
  // Verify project appears in dashboard
  await expect(page.locator('[data-testid="project-card"]')).toContainText('Test Construction Project');
});
```

### 4. Performance Testing

```typescript
// Performance monitoring
const performanceMetrics = {
  measurePageLoad: () => {
    const navigation = performance.getEntriesByType('navigation')[0];
    return {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    };
  },
  
  measureComponentRender: (componentName: string) => {
    performance.mark(`${componentName}-start`);
    // Component render
    performance.mark(`${componentName}-end`);
    performance.measure(componentName, `${componentName}-start`, `${componentName}-end`);
  }
};
```

## Implementation Phases

### Phase 1: Core Infrastructure
- Next.js 15 setup with TypeScript
- shadcn/ui integration and theming
- Authentication system
- Basic routing and layout

### Phase 2: Design System
- Color palette implementation
- Component library setup
- Responsive layout system
- Animation framework

### Phase 3: Core Features
- Dashboard implementation
- Project management interface
- User management system
- Basic real-time features

### Phase 4: Advanced Features
- Material management system
- AR integration
- Professional networking
- Verification system

### Phase 5: Optimization
- Performance optimization
- Accessibility improvements
- Mobile optimization
- Testing coverage

This design provides a comprehensive foundation for building a modern, professional construction management platform with all the required features while maintaining high performance and user experience standards.