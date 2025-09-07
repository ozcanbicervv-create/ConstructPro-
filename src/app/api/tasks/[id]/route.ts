import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { TaskService } from '@/services/task.service';
import { updateTaskSchema } from '@/utils/validation-schemas';
import { 
  withErrorHandling, 
  validateRequest,
  ErrorCodes,
  createErrorResponse 
} from '@/utils/api-helpers';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/tasks/[id] - Get a specific task
async function getTask(
  request: NextRequest, 
  { params }: RouteParams
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return createErrorResponse(
      ErrorCodes.UNAUTHORIZED,
      'Authentication required',
      401
    );
  }

  const task = await TaskService.getTaskById(params.id, session.user.id);

  if (!task) {
    return createErrorResponse(
      ErrorCodes.PROJECT_NOT_FOUND,
      'Task not found or access denied',
      404
    );
  }

  return NextResponse.json({
    success: true,
    data: task,
    message: 'Task retrieved successfully'
  });
}

// PATCH /api/tasks/[id] - Update a task
async function updateTask(
  request: NextRequest, 
  { params }: RouteParams
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return createErrorResponse(
      ErrorCodes.UNAUTHORIZED,
      'Authentication required',
      401
    );
  }

  const body = await request.json();
  const validatedData = validateRequest(updateTaskSchema, body);

  const task = await TaskService.updateTask(params.id, validatedData, session.user.id);

  if (!task) {
    return createErrorResponse(
      ErrorCodes.PROJECT_NOT_FOUND,
      'Task not found or access denied',
      404
    );
  }

  return NextResponse.json({
    success: true,
    data: task,
    message: 'Task updated successfully'
  });
}

// DELETE /api/tasks/[id] - Delete a task
async function deleteTask(
  request: NextRequest, 
  { params }: RouteParams
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return createErrorResponse(
      ErrorCodes.UNAUTHORIZED,
      'Authentication required',
      401
    );
  }

  const success = await TaskService.deleteTask(params.id, session.user.id);

  if (!success) {
    return createErrorResponse(
      ErrorCodes.PROJECT_NOT_FOUND,
      'Task not found or access denied',
      404
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Task deleted successfully'
  });
}

export const GET = withErrorHandling(getTask);
export const PATCH = withErrorHandling(updateTask);
export const DELETE = withErrorHandling(deleteTask);