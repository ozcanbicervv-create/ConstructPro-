// Project management type definitions

export interface Project {
  id: string;
  name: string;
  description: string;
  client: string;
  status: ProjectStatus;
  progress: number; // percentage 0-100
  timeline: ProjectTimeline;
  budget: ProjectBudget;
  team: ProjectTeamMember[];
  materials: Material[];
  tasks: Task[];
  documents: ProjectDocument[];
  location: ProjectLocation;
  priority: ProjectPriority;
  type: ProjectType;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
}

export type ProjectStatus = 
  | 'planning' 
  | 'in-progress' 
  | 'active'
  | 'on-hold' 
  | 'completed' 
  | 'cancelled'
  | 'archived';

export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

export type ProjectType = 
  | 'residential' 
  | 'commercial' 
  | 'industrial' 
  | 'infrastructure'
  | 'renovation'
  | 'maintenance';

export interface ProjectTimeline {
  startDate: Date;
  endDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  milestones: Milestone[];
  phases: ProjectPhase[];
  duration: number; // days
  workingDays: number;
  holidays: Date[];
}

export interface ProjectBudget {
  total: number;
  allocated: number;
  spent: number;
  remaining: number;
  currency: string;
  categories: BudgetCategory[];
  approvals: BudgetApproval[];
  changeOrders: ChangeOrder[];
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  committed: number;
  description?: string;
  subcategories: BudgetSubcategory[];
}

export interface BudgetSubcategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  description?: string;
}

export interface BudgetApproval {
  id: string;
  amount: number;
  approvedBy: string;
  approvedAt: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ChangeOrder {
  id: string;
  description: string;
  amount: number;
  requestedBy: string;
  requestedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  status: 'pending' | 'approved' | 'rejected';
  impact: {
    budget: number;
    timeline: number; // days
    scope: string;
  };
}

export interface ProjectTeamMember {
  id: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  role: string;
  permissions: string[];
  hourlyRate?: number;
  joinedAt: Date;
  leftAt?: Date;
  isActive: boolean;
  status: 'available' | 'busy' | 'offline' | 'on-leave';
  currentTask?: string;
  workload: number; // percentage
  totalHours: number;
}

export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  brand?: string;
  model?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  supplier?: Supplier;
  status: MaterialStatus;
  deliveryDate?: Date;
  actualDeliveryDate?: Date;
  location?: string;
  notes?: string;
  specifications: Record<string, any>;
  attachments: string[];
  projectId: string;
  orderedBy: string;
  receivedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type MaterialCategory = 
  | 'cement' 
  | 'steel' 
  | 'wood' 
  | 'paint' 
  | 'tiles' 
  | 'insulation' 
  | 'plumbing' 
  | 'electrical'
  | 'tools'
  | 'equipment'
  | 'other';

export type MaterialStatus = 
  | 'planned'
  | 'ordered' 
  | 'delivered' 
  | 'in-use' 
  | 'completed'
  | 'returned'
  | 'damaged';

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
  paymentTerms: string;
  deliveryTime: number; // days
}

export interface Task {
  id: string;
  title: string;
  description: string;
  project: string; // project name for display
  projectId: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string; // assignee name for display
  assignedTo: string[]; // user IDs
  dependencies: string[];
  startDate: Date;
  dueDate: Date;
  completedAt?: Date;
  estimatedHours: number;
  actualHours: number;
  progress: number; // percentage 0-100
  tags: string[];
  comments: TaskComment[];
  attachments: string[];
  subtasks: Subtask[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = 
  | 'todo' 
  | 'in-progress' 
  | 'review' 
  | 'completed' 
  | 'blocked'
  | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface TaskComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  attachments: string[];
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  assignedTo?: string;
  dueDate?: Date;
  createdAt: Date;
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: DocumentType;
  category: DocumentCategory;
  url: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
  version: number;
  tags: string[];
  description?: string;
  isPublic: boolean;
  accessLevel: 'public' | 'team' | 'managers' | 'admin';
  downloadCount: number;
  lastAccessedAt?: Date;
}

export type DocumentType = 
  | 'blueprint' 
  | 'contract' 
  | 'permit' 
  | 'photo' 
  | 'report' 
  | 'invoice'
  | 'specification'
  | 'drawing'
  | 'certificate'
  | 'other';

export type DocumentCategory = 
  | 'planning'
  | 'design'
  | 'legal'
  | 'financial'
  | 'safety'
  | 'quality'
  | 'progress'
  | 'communication';

export interface ProjectLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  siteArea?: number; // square meters
  buildingArea?: number; // square meters
  zoning?: string;
  accessibility: string[];
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  dueDate: Date;
  completedAt?: Date;
  status: MilestoneStatus;
  progress: number; // percentage 0-100
  dependencies: string[];
  deliverables: string[];
  criteria: string[];
  assignedTo: string[];
}

export type MilestoneStatus = 'pending' | 'in-progress' | 'completed' | 'overdue' | 'cancelled';

export interface ProjectPhase {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  status: ProjectStatus;
  progress: number; // percentage 0-100
  tasks: string[];
  milestones: string[];
  budget: number;
  spent: number;
  dependencies: string[];
  deliverables: string[];
}

// Project statistics and metrics
export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  totalBudget: number;
  totalSpent: number;
  averageProgress: number;
  overdueProjects: number;
  upcomingDeadlines: number;
}

// Project dashboard data
export interface ProjectDashboard {
  stats: ProjectStats;
  recentProjects: Project[];
  upcomingMilestones: Milestone[];
  overdueTasks: Task[];
  budgetAlerts: BudgetAlert[];
  teamWorkload: TeamWorkload[];
}

export interface BudgetAlert {
  projectId: string;
  projectName: string;
  type: 'over-budget' | 'approaching-limit' | 'change-order';
  severity: 'low' | 'medium' | 'high';
  message: string;
  amount: number;
  percentage: number;
}

export interface TeamWorkload {
  userId: string;
  userName: string;
  role: string;
  workload: number; // percentage
  activeTasks: number;
  overdueTasks: number;
  availability: 'available' | 'busy' | 'overloaded';
}