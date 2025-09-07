import { NextRequest, NextResponse } from 'next/server';

import { migrationGuides } from '@/middleware/versioning.middleware';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    // If specific migration requested
    if (from && to) {
      const migrationKey = `v${from}-to-v${to}`;
      const guide = migrationGuides[migrationKey as keyof typeof migrationGuides];
      
      if (!guide) {
        return NextResponse.json(
          {
            error: 'MIGRATION_NOT_FOUND',
            message: `Migration guide from ${from} to ${to} not found`,
            availableMigrations: Object.keys(migrationGuides),
            timestamp: new Date().toISOString()
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        migration: guide,
        from,
        to,
        timestamp: new Date().toISOString()
      });
    }

    // Return all available migration guides
    return NextResponse.json({
      availableMigrations: migrationGuides,
      currentVersion: '1.0.0',
      supportedVersions: ['1.0.0', '0.9.0'],
      deprecatedVersions: ['0.9.0'],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error serving migration guide:', error);
    return NextResponse.json(
      {
        error: 'MIGRATION_ERROR',
        message: 'Failed to serve migration guide',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}