import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { TaskCommentService } from '@/services/task-comment.service';
import { 
  withErrorHandling, 
  validateRequest,
  ErrorCodes,
  createErrorResponse 
} from '@/utils/api-helpers';
import { authOptions } from '@/utils/auth';
import { createTaskCommentSchema } from '@/utils/validation-schemas';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/tasks/[id]/comments - Get task comments with threading
async function getTaskComments(
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

  const comments = await TaskCommentService.getTaskComments(params.id, session.user.id);

  return NextResponse.json({
    success: true,
    data: comments,
    message: 'Task comments retrieved successfully'
  });
}

// POST /api/tasks/[id]/comments - Add a comment to a task
async function createTaskComment(
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
  const validatedData = validateRequest(createTaskCommentSchema, body);

  const comment = await TaskCommentService.createTaskComment(
    params.id, 
    validatedData, 
    session.user.id
  );

  return NextResponse.json({
    success: true,
    data: comment,
    message: 'Comment added successfully'
  }, { status: 201 });
}

export const GET = withErrorHandling(getTaskComments);
export const POST = withErrorHandling(createTaskComment);