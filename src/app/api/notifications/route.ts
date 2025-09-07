import { NextRequest, NextResponse } from 'next/server';

import { authenticateRequest } from '@/middleware/auth.middleware';
import { NotificationType, NotificationPriority } from '@/types/realtime.types';
import { notificationService } from '@/utils/socket';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const notifications = await notificationService.getUserNotifications(
      authResult.user!.id,
      limit,
      unreadOnly
    );

    return NextResponse.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const body = await request.json();
    const { 
      userId, 
      type, 
      title, 
      message, 
      data, 
      priority = NotificationPriority.MEDIUM 
    } = body;

    // Validate required fields
    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, type, title, message' },
        { status: 400 }
      );
    }

    // Validate notification type
    if (!Object.values(NotificationType).includes(type)) {
      return NextResponse.json(
        { error: 'Invalid notification type' },
        { status: 400 }
      );
    }

    // Validate priority
    if (!Object.values(NotificationPriority).includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid notification priority' },
        { status: 400 }
      );
    }

    const notification = await notificationService.createNotification(
      userId,
      type,
      title,
      message,
      data,
      priority
    );

    return NextResponse.json({
      success: true,
      data: notification
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}