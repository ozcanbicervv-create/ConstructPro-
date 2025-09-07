import { z } from 'zod';
import { ProjectStatus, ProjectPriority, TaskStatus, TaskPriority } from '@prisma/client';

// Project validation schemas
export const createProjectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters').max(100, 'Project name must be less than 100 characters'),
  description: z.string().optional(),
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format'),
  budget: z.number().min(0, 'Budget must be positive').optional(),
  location: z.string().optional(),
  priority: z.nativeEnum(ProjectPriority).default(ProjectPriority.MEDIUM),
  metadata: z.record(z.any()).optional(),
}).refine(data => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return endDate > startDate;
}, {
  message: 'End date must be after start date',
  path: ['endDate']
});

export const updateProjectSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  priority: z.nativeEnum(ProjectPriority).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  budget: z.number().min(0).optional(),
  location: z.string().optional(),
  metadata: z.record(z.any()).optional(),
}).refine(data => {
  if (data.startDate && data.endDate) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    return endDate > startDate;
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['endDate']
});

// Project query filters
export const projectFiltersSchema = z.object({
  status: z.nativeEnum(ProjectStatus).optional(),
  priority: z.nativeEnum(ProjectPriority).optional(),
  managerId: z.string().optional(),
  search: z.string().optional(),
  startDateFrom: z.string().datetime().optional(),
  startDateTo: z.string().datetime().optional(),
  endDateFrom: z.string().datetime().optional(),
  endDateTo: z.string().datetime().optional(),
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
  location: z.string().optional(),
});

// Task query filters
export const taskFiltersSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'BLOCKED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assignedTo: z.string().optional(),
  search: z.string().optional(),
  dueDateFrom: z.string().datetime().optional(),
  dueDateTo: z.string().datetime().optional(),
});

// Material query filters
export const materialFiltersSchema = z.object({
  category: z.string().optional(),
  supplierId: z.string().optional(),
  search: z.string().optional(),
  minCost: z.string().transform(val => parseFloat(val)).optional(),
  maxCost: z.string().transform(val => parseFloat(val)).optional(),
  minQuantity: z.string().transform(val => parseFloat(val)).optional(),
  maxQuantity: z.string().transform(val => parseFloat(val)).optional(),
});

// Document query filters
export const documentFiltersSchema = z.object({
  type: z.enum(['BLUEPRINT', 'SPECIFICATION', 'CONTRACT', 'PHOTO', 'REPORT', 'OTHER']).optional(),
  search: z.string().optional(),
  mimeType: z.string().optional(),
  uploadedBy: z.string().optional(),
  minSize: z.string().transform(val => parseInt(val)).optional(),
  maxSize: z.string().transform(val => parseInt(val)).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

// Team query filters
export const teamFiltersSchema = z.object({
  role: z.enum(['OWNER', 'MANAGER', 'SUPERVISOR', 'MEMBER', 'VIEWER']).optional(),
  userRole: z.enum(['ADMIN', 'PROJECT_MANAGER', 'SITE_SUPERVISOR', 'WORKER', 'CLIENT', 'SUPPLIER']).optional(),
  search: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional(),
});

// Task validation schemas
export const createTaskSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  title: z.string().min(3, 'Task title must be at least 3 characters').max(200, 'Task title must be less than 200 characters'),
  description: z.string().optional(),
  assignedTo: z.string().optional(),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  dueDate: z.string().datetime().optional(),
  estimatedHours: z.number().min(0.5, 'Estimated hours must be at least 0.5').max(1000, 'Estimated hours cannot exceed 1000').optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().optional(),
  assignedTo: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.string().datetime().optional(),
  estimatedHours: z.number().min(0.5).max(1000).optional(),
  actualHours: z.number().min(0).max(1000).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Task comment validation schemas
export const createTaskCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(2000, 'Comment must be less than 2000 characters'),
});

export const updateTaskCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(2000, 'Comment must be less than 2000 characters'),
});

// Material validation schemas
export const createMaterialSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  name: z.string().min(1, 'Material name is required').max(200, 'Material name must be less than 200 characters'),
  description: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().min(1, 'Unit is required').max(50, 'Unit must be less than 50 characters'),
  quantity: z.number().min(0, 'Quantity must be positive'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  supplierId: z.string().optional(),
  specifications: z.record(z.string(), z.any()).optional(),
});

export const updateMaterialSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().min(1).max(50).optional(),
  quantity: z.number().min(0).optional(),
  unitPrice: z.number().min(0).optional(),
  supplierId: z.string().optional(),
  specifications: z.record(z.string(), z.any()).optional(),
});

// Material comparison schema
export const materialCompareSchema = z.object({
  materialName: z.string().min(1, 'Material name is required'),
  category: z.string().optional(),
  quantity: z.number().min(0, 'Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  specifications: z.record(z.any()).optional(),
  supplierIds: z.array(z.string()).optional(),
});

// Material order schemas
export const createMaterialOrderSchema = z.object({
  materialId: z.string().min(1, 'Material ID is required'),
  supplierId: z.string().min(1, 'Supplier ID is required'),
  quantity: z.number().min(0, 'Quantity must be positive'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  expectedDeliveryDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const updateMaterialOrderSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  quantity: z.number().min(0).optional(),
  unitPrice: z.number().min(0).optional(),
  expectedDeliveryDate: z.string().datetime().optional(),
  actualDeliveryDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

// Supplier filters schema
export const supplierFiltersSchema = z.object({
  search: z.string().optional(),
  minRating: z.string().transform(val => parseFloat(val)).optional(),
  category: z.string().optional(),
  location: z.string().optional(),
});

// Order filters schema
export const orderFiltersSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  supplierId: z.string().optional(),
  materialId: z.string().optional(),
  projectId: z.string().optional(),
  search: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export type CreateProjectRequest = z.infer<typeof createProjectSchema>;
export type UpdateProjectRequest = z.infer<typeof updateProjectSchema>;
export type CreateTaskRequest = z.infer<typeof createTaskSchema>;
export type UpdateTaskRequest = z.infer<typeof updateTaskSchema>;
export type CreateTaskCommentRequest = z.infer<typeof createTaskCommentSchema>;
export type UpdateTaskCommentRequest = z.infer<typeof updateTaskCommentSchema>;
export type CreateMaterialRequest = z.infer<typeof createMaterialSchema>;
export type UpdateMaterialRequest = z.infer<typeof updateMaterialSchema>;
export type MaterialCompareRequest = z.infer<typeof materialCompareSchema>;
export type CreateMaterialOrderRequest = z.infer<typeof createMaterialOrderSchema>;
export type UpdateMaterialOrderRequest = z.infer<typeof updateMaterialOrderSchema>;
export type ProjectFilters = z.infer<typeof projectFiltersSchema>;
export type TaskFilters = z.infer<typeof taskFiltersSchema>;
export type MaterialFilters = z.infer<typeof materialFiltersSchema>;
export type DocumentFilters = z.infer<typeof documentFiltersSchema>;
export type TeamFilters = z.infer<typeof teamFiltersSchema>;
export type SupplierFilters = z.infer<typeof supplierFiltersSchema>;
export type OrderFilters = z.infer<typeof orderFiltersSchema>;