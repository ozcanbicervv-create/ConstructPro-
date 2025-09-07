import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth.middleware';
import { withSecurity } from '@/middleware/security.middleware';
import { getAuditLogger } from '@/utils/audit-logger';
import { validateQueryParams } from '@/utils/security/input-validation';
import { z } from 'zod';

// Query validation schema
const securitySummarySchema = z.object({
  days: z.coerce.number().min(1).max(365).default(30)
});

/**
 * GET /api/auth/security-summary - Get user's security summary
 */
export const GET = withSecurity(
  withAuth(async (req) => {
    try {
      const user = (req as any).user;
      const { searchParams } = new URL(req.url);
      
      const validation = validateQueryParams(searchParams, securitySummarySchema);
      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }

      const { days } = validation.data;
      const auditLogger = getAuditLogger();

      const summary = await auditLogger.getSecuritySummary(user.id, days);

      return NextResponse.json({
        success: true,
        data: {
          ...summary,
          period: {
            days,
            startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
            endDate: new Date()
          }
        }
      });

    } catch (error) {
      console.error('Failed to get security summary:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve security summary' },
        { status: 500 }
      );
    }
  }, {
    requireAuth: true
  }),
  {
    rateLimit: {
      windowMs: 60 * 1000,
      maxRequests: 20
    }
  }
);