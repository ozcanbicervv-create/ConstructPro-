import { NextRequest, NextResponse } from 'next/server';
import { collaborativeEditingService } from '@/utils/socket';
import { authenticateRequest } from '@/middleware/auth.middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const documentId = params.id;
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    const activeEditors = collaborativeEditingService.getActiveEditors(documentId);

    return NextResponse.json({
      success: true,
      data: {
        documentId,
        activeEditors,
        editorCount: activeEditors.length
      }
    });
  } catch (error) {
    console.error('Error fetching active editors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active editors' },
      { status: 500 }
    );
  }
}