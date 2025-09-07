import { NextRequest, NextResponse } from 'next/server';

import { authenticateRequest } from '@/middleware/auth.middleware';
import { collaborativeEditingService } from '@/utils/socket';

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

    const lock = collaborativeEditingService.getDocumentLock(documentId);

    return NextResponse.json({
      success: true,
      data: {
        documentId,
        lock,
        isLocked: !!lock
      }
    });
  } catch (error) {
    console.error('Error fetching document lock:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document lock' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const body = await request.json();
    const { action, minutes } = body;

    if (action === 'extend') {
      const success = collaborativeEditingService.extendLock(
        authResult.user!.id,
        documentId,
        minutes || 30
      );

      if (!success) {
        return NextResponse.json(
          { error: 'Cannot extend lock - you do not own this document lock' },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Document lock extended successfully'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Supported actions: extend' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating document lock:', error);
    return NextResponse.json(
      { error: 'Failed to update document lock' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    // Only admins can force release locks
    if (authResult.user!.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const documentId = params.id;
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    const success = collaborativeEditingService.forceReleaseLock(
      documentId,
      authResult.user!.id
    );

    if (!success) {
      return NextResponse.json(
        { error: 'No lock found for this document' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Document lock released successfully'
    });
  } catch (error) {
    console.error('Error releasing document lock:', error);
    return NextResponse.json(
      { error: 'Failed to release document lock' },
      { status: 500 }
    );
  }
}