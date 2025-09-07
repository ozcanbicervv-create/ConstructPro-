import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { TaskService } from '@/services/task.service';
import { 
  withErrorHandling, 
  ErrorCodes,
  createErrorResponse 
} from '@/utils/api-helpers';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/tasks/[id]/progress - Get task progress and metrics
async function getTaskProgress(
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

  const progress = await TaskService.getTaskProgress(params.id, session.user.id);

  if (!progress) {
    return createErrorResponse(
      ErrorCodes.PROJECT_NOT_FOUND,
      'Task not found or access denied',
      404
    );
  }

  return NextResponse.json({
    success: true,
    data: progress,
    message: 'Task progress retrieved successfully'
  });
}

export const GET = withErrorHandling(getTaskProgress);