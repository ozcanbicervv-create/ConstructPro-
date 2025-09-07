import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { TaskAttachmentService } from '@/services/task-attachment.service';
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

// GET /api/tasks/[id]/attachments - Get task attachments
async function getTaskAttachments(
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

  const attachments = await TaskAttachmentService.getTaskAttachments(params.id, session.user.id);

  return NextResponse.json({
    success: true,
    data: attachments,
    message: 'Task attachments retrieved successfully'
  });
}

// POST /api/tasks/[id]/attachments - Upload file attachment to a task
async function createTaskAttachment(
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

  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return createErrorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'File is required',
      400
    );
  }

  const attachment = await TaskAttachmentService.createTaskAttachment(
    params.id, 
    file, 
    session.user.id
  );

  return NextResponse.json({
    success: true,
    data: attachment,
    message: 'File attached successfully'
  }, { status: 201 });
}

export const GET = withErrorHandling(getTaskAttachments);
export const POST = withErrorHandling(createTaskAttachment);