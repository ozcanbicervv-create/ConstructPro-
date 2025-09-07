import { NextRequest, NextResponse } from 'next/server';
import { ProjectService } from '@/services/project.service';
import { 
  withErrorHandling, 
  requireAuth, 
  validateRequest, 
  getPaginationParams,
  createErrorResponse,
  ErrorCodes 
} from '@/utils/api-helpers';
import { 
  createProjectSchema, 
  projectFiltersSchema,
  CreateProjectRequest,
  ProjectFilters 
} from '@/utils/validation-schemas';

/**
 * GET /api/projects
 * Retrieve projects with filtering, pagination, and search
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const session = await requireAuth(request);
  const { searchParams } = new URL(request.url);
  
  // Parse pagination parameters
  const pagination = getPaginationParams(searchParams);
  
  // Parse and validate filters
  const filterParams: Record<string, any> = {};
  
  // Extract filter parameters from search params
  const filterKeys = [
    'status', 'priority', 'managerId', 'search', 
    'startDateFrom', 'startDateTo', 'endDateFrom', 'endDateTo',
    'budgetMin', 'budgetMax', 'location'
  ];
  
  filterKeys.forEach(key => {
    const value = searchParams.get(key);
    if (value !== null) {
      if (key === 'budgetMin' || key === 'budgetMax') {
        filterParams[key] = parseFloat(value);
      } else {
        filterParams[key] = value;
      }
    }
  });
  
  const filters: ProjectFilters = validateRequest(projectFiltersSchema, filterParams);
  
  // Get projects - filter by user access if not admin
  const userId = session.user.role === 'ADMIN' ? undefined : session.user.id;
  const result = await ProjectService.getProjects(filters, pagination, userId);
  
  return NextResponse.json(result);
});

/**
 * POST /api/projects
 * Create a new project
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await requireAuth(request);
  
  // Check if user can create projects
  const allowedRoles = ['ADMIN', 'PROJECT_MANAGER'];
  if (!allowedRoles.includes(session.user.role || '')) {
    return createErrorResponse(
      ErrorCodes.INSUFFICIENT_PERMISSIONS,
      'Only administrators and project managers can create projects',
      403
    );
  }
  
  const body = await request.json();
  const data: CreateProjectRequest = validateRequest(createProjectSchema, body);
  
  // Create the project with the current user as manager
  const project = await ProjectService.createProject(data, session.user.id);
  
  return NextResponse.json(project, { status: 201 });
});