import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { TaskService } from '@/services/task.service';
import { createTaskSchema, taskFiltersSchema } from '@/utils/validation-schemas';
import { 
  withErrorHandling, 
  validateRequest, 
  getPaginationParams,
  ErrorCodes,
  createErrorResponse 
} from '@/utils/api-helpers';

// POST /api/tasks - Create a new task
async function createTask(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return createErrorResponse(
      ErrorCodes.UNAUTHORIZED,
      'Authentication required',
      401
    );
  }

  const body = await request.json();
  const validatedData = validateRequest(createTaskSchema, body);

  const task = await TaskService.createTask(validatedData, session.user.id);

  return NextResponse.json({
    success: true,
    data: task,
    message: 'Task created successfully'
  }, { status: 201 });
}

// GET /api/tasks - Get tasks with filtering and pagination
async function getTasks(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return createErrorResponse(
      ErrorCodes.UNAUTHORIZED,
      'Authentication required',
      401
    );
  }

  const { searchParams } = new URL(request.url);
  
  // Parse filters
  const filters = validateRequest(taskFiltersSchema, {
    status: searchParams.get('status'),
    priority: searchParams.get('priority'),
    assignedTo: searchParams.get('assignedTo'),
    search: searchParams.get('search'),
    dueDateFrom: searchParams.get('dueDateFrom'),
    dueDateTo: searchParams.get('dueDateTo'),
  });

  // Parse pagination
  const pagination = getPaginationParams(searchParams);

  const result = await TaskService.getTasks(filters, pagination, session.user.id);

  return NextResponse.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
    message: 'Tasks retrieved successfully'
  });
}

export const POST = withErrorHandling(createTask);
export const GET = withErrorHandling(getTasks);