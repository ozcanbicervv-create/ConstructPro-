import { UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { withAuth } from '@/middleware/auth.middleware';
import { withSecurity } from '@/middleware/security.middleware';
import { getAuditLogger } from '@/utils/audit-logger';
import { validateQueryParams } from '@/utils/security/input-validation';

// Query validation schema
const auditLogFiltersSchema = z.object({
  userId: z.string().optional(),
  event: z.string().optional(),
  resource: z.string().optional(),
  result: z.enum(['SUCCESS', 'FAILURE', 'BLOCKED']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0)
});

/**
 * GET /api/admin/audit-logs - Get audit logs (Admin only)
 */
export const GET = withSecurity(
  withAuth(async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      
      const validation = validateQueryParams(searchParams, auditLogFiltersSchema);
      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }

      const filters = validation.data;
      const auditLogger = getAuditLogger();

      // Convert string dates to Date objects
      const queryFilters = {
        ...filters,
        startDate: filters.startDate ? new Date(filters.startDate) : undefined,
        endDate: filters.endDate ? new Date(filters.endDate) : undefined
      };

      const logs = await auditLogger.getLogs(queryFilters);

      return NextResponse.json({
        success: true,
        data: logs,
        pagination: {
          limit: filters.limit,
          offset: filters.offset,
          total: logs.length // In a real implementation, this would be a separate count query
        }
      });

    } catch (error) {
      console.error('Failed to retrieve audit logs:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve audit logs' },
        { status: 500 }
      );
    }
  }, {
    requireAuth: true,
    requiredRole: UserRole.ADMIN
  }),
  {
    rateLimit: {
      windowMs: 60 * 1000,
      maxRequests: 30
    }
  }
);