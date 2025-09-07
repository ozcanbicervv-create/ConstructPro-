import { NextRequest, NextResponse } from 'next/server';
import { presenceService } from '@/utils/socket';
import { authenticateRequest } from '@/middleware/auth.middleware';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const onlineUsers = presenceService.getOnlineUsers();

    return NextResponse.json({
      success: true,
      data: {
        onlineUsers,
        totalCount: onlineUsers.length
      }
    });
  } catch (error) {
    console.error('Error fetching online users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch online users' },
      { status: 500 }
    );
  }
}