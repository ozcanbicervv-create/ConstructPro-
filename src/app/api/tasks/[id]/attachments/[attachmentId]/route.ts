import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { TaskAttachmentService } from '@/services/task-attachment.service';
import { 
  withErrorHandling, 
  ErrorCodes,
  createErrorResponse 
} from '@/utils/api-helpers';
import { readFile } from 'fs/promises';

interface RouteParams {
  params: {
    id: string;
    attachmentId: string;
  };
}

// GET /api/tasks/[id]/attachments/[attachmentId] - Download attachment file
async function downloadAttachment(
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

  const fileInfo = await TaskAttachmentService.getAttachmentFile(
    params.attachmentId, 
    session.user.id
  );

  if (!fileInfo) {
    return createErrorResponse(
      ErrorCodes.PROJECT_NOT_FOUND,
      'Attachment not found or access denied',
      404
    );
  }

  try {
    const fileBuffer = await readFile(fileInfo.filePath);
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': fileInfo.mimeType,
        'Content-Disposition': `attachment; filename="${fileInfo.fileName}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    return createErrorResponse(
      ErrorCodes.FILE_UPLOAD_FAILED,
      'File not found on server',
      404
    );
  }
}

// DELETE /api/tasks/[id]/attachments/[attachmentId] - Delete attachment
async function deleteAttachment(
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

  const success = await TaskAttachmentService.deleteTaskAttachment(
    params.attachmentId, 
    session.user.id
  );

  if (!success) {
    return createErrorResponse(
      ErrorCodes.PROJECT_NOT_FOUND,
      'Attachment not found or access denied',
      404
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Attachment deleted successfully'
  });
}

export const GET = withErrorHandling(downloadAttachment);
export const DELETE = withErrorHandling(deleteAttachment);