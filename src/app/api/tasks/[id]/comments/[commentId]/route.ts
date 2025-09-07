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
import { updateTaskCommentSchema } from '@/utils/validation-schemas';

interface RouteParams {
  params: {
    id: string;
    commentId: string;
  };
}

// PATCH /api/tasks/[id]/comments/[commentId] - Update a comment
async function updateTaskComment(
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
  const validatedData = validateRequest(updateTaskCommentSchema, body);

  const comment = await TaskCommentService.updateTaskComment(
    params.commentId, 
    validatedData.content, 
    session.user.id
  );

  if (!comment) {
    return createErrorResponse(
      ErrorCodes.PROJECT_NOT_FOUND,
      'Comment not found or access denied',
      404
    );
  }

  return NextResponse.json({
    success: true,
    data: comment,
    message: 'Comment updated successfully'
  });
}

// DELETE /api/tasks/[id]/comments/[commentId] - Delete a comment
async function deleteTaskComment(
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

  const success = await TaskCommentService.deleteTaskComment(
    params.commentId, 
    session.user.id
  );

  if (!success) {
    return createErrorResponse(
      ErrorCodes.PROJECT_NOT_FOUND,
      'Comment not found or access denied',
      404
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Comment deleted successfully'
  });
}

export const PATCH = withErrorHandling(updateTaskComment);
export const DELETE = withErrorHandling(deleteTaskComment);