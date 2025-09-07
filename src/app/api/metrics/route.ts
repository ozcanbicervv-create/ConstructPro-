import { NextRequest, NextResponse } from 'next/server';

import { logger } from '@/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const { metrics } = await request.json();

    if (!Array.isArray(metrics)) {
      return NextResponse.json(
        { error: 'Invalid metrics format' },
        { status: 400 }
      );
    }

    // Log metrics for analysis (in production, you might want to send to a monitoring service)
    metrics.forEach((metric: any) => {
      logger.info('Performance metric recorded', {
        name: metric.name,
        value: metric.value,
        timestamp: metric.timestamp,
        url: metric.url,
        userId: metric.userId,
        rating: metric.rating,
      });
    });

    // In a real application, you would store these metrics in a database
    // or send them to a monitoring service like DataDog, New Relic, etc.
    
    return NextResponse.json({ success: true, count: metrics.length });
  } catch (error) {
    logger.error('Failed to process performance metrics', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}