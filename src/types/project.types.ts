// Project management type definitions
import { User, ProjectMember } from './user.types';

export interface Project {
  id: string;
  name: string;
  description?: string;
  managerId: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: Date;
  endDate: Date;
  budget?: number;
  location?: string;
  metadata?: any;
  manager?: User;
  tasks?: Task[];
  materials?: Material[];
  documents?: ProjectDocument[];
  members?: ProjectMember[];
  milestones?: Milestone[];
  phases?: ProjectPhase[];
  createdAt: Date;
  updatedAt: Date;
}

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum ProjectPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

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
  projectId: string;
  name: string;
  description?: string;
  category?: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  supplierId?: string;
  specifications?: any;
  project?: Project;
  supplier?: MaterialSupplier;
  orders?: MaterialOrder[];
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
  projectId: string;
  assignedTo?: string;
  createdBy: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  metadata?: any;
  project?: Project;
  assignee?: User;
  creator?: User;
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  task?: Task;
  user?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  name: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  task?: Task;
  createdAt: Date;
}

export interface MaterialSupplier {
  id: string;
  name: string;
  contactInfo?: any;
  rating?: number;
  materials?: Material[];
  orders?: MaterialOrder[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MaterialOrder {
  id: string;
  materialId: string;
  supplierId: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  status: OrderStatus;
  orderDate: Date;
  material?: Material;
  supplier?: MaterialSupplier;
  createdAt: Date;
  updatedAt: Date;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
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
  projectId: string;
  name: string;
  description?: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  type: DocumentType;
  version: string;
  uploadedBy: string;
  project?: Project;
  createdAt: Date;
  updatedAt: Date;
}

export enum DocumentType {
  BLUEPRINT = 'BLUEPRINT',
  SPECIFICATION = 'SPECIFICATION',
  CONTRACT = 'CONTRACT',
  PHOTO = 'PHOTO',
  REPORT = 'REPORT',
  OTHER = 'OTHER'
}

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
  projectId: string;
  name: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  completedAt?: Date;
  project?: Project;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectPhase {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status: PhaseStatus;
  order: number;
  project?: Project;
  createdAt: Date;
  updatedAt: Date;
}

export enum PhaseStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DELAYED = 'DELAYED'
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