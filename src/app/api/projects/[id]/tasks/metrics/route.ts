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

// GET /api/projects/[id]/tasks/metrics - Get project task metrics and statistics
async function getProjectTaskMetrics(
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

  const metrics = await TaskService.getProjectTaskMetrics(params.id, session.user.id);

  return NextResponse.json({
    success: true,
    data: metrics,
    message: 'Project task metrics retrieved successfully'
  });
}

export const GET = withErrorHandling(getProjectTaskMetrics);