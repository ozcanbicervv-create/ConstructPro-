import { NextRequest, NextResponse } from 'next/server';

import { authenticateRequest } from '@/middleware/auth.middleware';
import { presenceService } from '@/utils/socket';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const userId = params.id;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const presence = presenceService.getUserPresence(userId);

    if (!presence) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        userId,
        ...presence
      }
    });
  } catch (error) {
    console.error('Error fetching user presence:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user presence' },
      { status: 500 }
    );
  }
}