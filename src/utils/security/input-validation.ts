import { z } from "zod";

/**
 * Input validation and sanitization utilities for ConstructPro
 * Provides comprehensive protection against XSS, injection attacks, and malformed data
 */

// Common validation patterns
export const ValidationPatterns = {
  // Alphanumeric with spaces and common punctuation
  safeText: /^[a-zA-Z0-9\s\-_.,!?()]+$/,
  // Email validation (more strict than basic regex)
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  // Phone number (international format)
  phone: /^\+?[1-9]\d{1,14}$/,
  // UUID format
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  // Safe filename (no path traversal)
  filename: /^[a-zA-Z0-9\-_. ]+$/,
  // URL validation
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
} as const;

// Base validation schemas
export const BaseSchemas = {
  id: z.string().uuid("Invalid ID format"),
  email: z.string().email("Invalid email format").max(254),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      "Password must contain uppercase, lowercase, number and special character"),
  safeString: z.string().max(1000).regex(ValidationPatterns.safeText, "Contains invalid characters"),
  url: z.string().url("Invalid URL format").max(2048),
  phone: z.string().regex(ValidationPatterns.phone, "Invalid phone number format").optional(),
} as const;

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/<[^>]*>/g, '') // Remove all HTML tags for safety
    .trim();
}

/**
 * Sanitizes plain text input
 */
export function sanitizeText(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
}

/**
 * Validates and sanitizes file names
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9\-_. ]/g, '') // Remove unsafe characters
    .replace(/\.{2,}/g, '.') // Prevent path traversal
    .replace(/^\.+/, '') // Remove leading dots
    .substring(0, 255); // Limit length
}

/**
 * Rate limiting validation schema
 */
export const RateLimitSchema = z.object({
  windowMs: z.number().min(1000).max(3600000), // 1 second to 1 hour
  maxRequests: z.number().min(1).max(10000),
  skipSuccessfulRequests: z.boolean().default(false),
  skipFailedRequests: z.boolean().default(false),
});

/**
 * API request validation schemas
 */
export const ApiSchemas = {
  // Pagination
  pagination: z.object({
    page: z.coerce.number().min(1).max(1000).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    sortBy: z.string().max(50).optional(),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
  }),

  // Search
  search: z.object({
    query: z.string().min(1).max(100),
    filters: z.record(z.string()).optional(),
  }),

  // File upload
  fileUpload: z.object({
    filename: z.string().regex(ValidationPatterns.filename),
    size: z.number().min(1).max(10 * 1024 * 1024), // 10MB max
    mimetype: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/),
  }),
} as const;

/**
 * Construction-specific validation schemas
 */
export const ConstructionSchemas = {
  project: z.object({
    name: BaseSchemas.safeString.min(1, "Project name is required"),
    description: z.string().max(5000).optional(),
    budget: z.number().min(0).max(1000000000).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    status: z.enum(['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']),
  }),

  material: z.object({
    name: BaseSchemas.safeString.min(1, "Material name is required"),
    category: BaseSchemas.safeString,
    unit: BaseSchemas.safeString,
    pricePerUnit: z.number().min(0).max(1000000),
    supplier: BaseSchemas.safeString.optional(),
    specifications: z.string().max(2000).optional(),
  }),

  task: z.object({
    title: BaseSchemas.safeString.min(1, "Task title is required"),
    description: z.string().max(2000).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']),
    dueDate: z.string().datetime().optional(),
    estimatedHours: z.number().min(0).max(1000).optional(),
  }),
} as const;

/**
 * Validates request body against schema with error handling
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    
    if (!result.success) {
      const errorMessage = result.error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      return { success: false, error: errorMessage };
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: 'Invalid JSON format' };
  }
}

/**
 * Validates query parameters against schema
 */
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } {
  try {
    const params = Object.fromEntries(searchParams.entries());
    const result = schema.safeParse(params);
    
    if (!result.success) {
      const errorMessage = result.error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      return { success: false, error: errorMessage };
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: 'Invalid query parameters' };
  }
}

export type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };