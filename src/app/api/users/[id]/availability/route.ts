import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { TaskService } from '@/services/task.service';
import { 
  withErrorHandling, 
  ErrorCodes,
  createErrorResponse 
} from '@/utils/api-helpers';
import { authOptions } from '@/utils/auth';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/users/[id]/availability - Check user availability for task assignment
async function getUserAvailability(
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

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const availability = await TaskService.checkUserAvailability(
    params.id,
    startDate ? new Date(startDate) : undefined,
    endDate ? new Date(endDate) : undefined
  );

  return NextResponse.json({
    success: true,
    data: availability,
    message: 'User availability retrieved successfully'
  });
}

export const GET = withErrorHandling(getUserAvailability);