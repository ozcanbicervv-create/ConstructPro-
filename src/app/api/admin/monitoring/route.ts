import { NextRequest, NextResponse } from 'next/server';
import { withRequestCorrelation } from '@/middleware/correlation.middleware';
import { withErrorHandler } from '@/middleware/error-handler.middleware';
import { authMiddleware } from '@/middleware/auth.middleware';
import { apiMonitoringService } from '@/services/api-monitoring.service';
import { errorNotificationService } from '@/services/error-notification.service';
import { logger } from '@/lib/logger';
import { createError } from '@/middleware/error-handler.middleware';

async function GET(request: NextRequest) {
  // Check authentication and admin permissions
  const authResult = await authMiddleware(request);
  if (!authResult.success || !authResult.user) {
    throw createError.unauthorized('Authentication required');
  }

  if (authResult.user.role !== 'ADMIN') {
    throw createError.forbidden('Admin access required');
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'overview';
  const hours = parseInt(searchParams.get('hours') || '24');
  const limit = parseInt(searchParams.get('limit') || '10');

  let data: any;

  switch (type) {
    case 'overview':
      data = {
        systemMetrics: apiMonitoringService.getSystemMetrics(),
        healthStatus: await apiMonitoringService.getHealthStatus(),
        errorStatistics: errorNotificationService.getErrorStatistics(),
        topEndpoints: apiMonitoringService.getTopEndpoints(limit),
        slowestEndpoints: apiMonitoringService.getSlowestEndpoints(limit),
        errorProneEndpoints: apiMonitoringService.getErrorProneEndpoints(limit)
      };
      break;

    case 'metrics':
      data = {
        current: apiMonitoringService.getSystemMetrics(),
        historical: await apiMonitoringService.getHistoricalMetrics(hours)
      };
      break;

    case 'endpoints':
      const method = searchParams.get('method');
      const endpoint = searchParams.get('endpoint');
      data = {
        metrics: apiMonitoringService.getApiMetrics(method || undefined, endpoint || undefined)
      };
      break;

    case 'health':
      data = await apiMonitoringService.getHealthStatus();
      break;

    case 'errors':
      data = errorNotificationService.getErrorStatistics();
      break;

    case 'alerts':
      data = {
        rules: errorNotificationService.getAlertRules(),
        statistics: errorNotificationService.getErrorStatistics()
      };
      break;

    default:
      throw createError.badRequest(`Invalid monitoring type: ${type}`);
  }

  logger.info('Monitoring data accessed', {
    type,
    userId: authResult.user.id,
    dataSize: JSON.stringify(data).length
  });

  return NextResponse.json({
    success: true,
    data
  });
}

async function POST(request: NextRequest) {
  // Check authentication and admin permissions
  const authResult = await authMiddleware(request);
  if (!authResult.success || !authResult.user) {
    throw createError.unauthorized('Authentication required');
  }

  if (authResult.user.role !== 'ADMIN') {
    throw createError.forbidden('Admin access required');
  }

  const body = await request.json();
  const { action, ...params } = body;

  let result: any;

  switch (action) {
    case 'reset_metrics':
      apiMonitoringService.resetMetrics();
      result = { message: 'Metrics reset successfully' };
      logger.info('API metrics reset', { userId: authResult.user.id });
      break;

    case 'add_alert_rule':
      const ruleId = errorNotificationService.addAlertRule(params.rule);
      result = { ruleId, message: 'Alert rule added successfully' };
      logger.info('Alert rule added', { 
        ruleId, 
        ruleName: params.rule.name,
        userId: authResult.user.id 
      });
      break;

    case 'update_alert_rule':
      const updated = errorNotificationService.updateAlertRule(params.ruleId, params.updates);
      if (!updated) {
        throw createError.notFound('Alert rule');
      }
      result = { message: 'Alert rule updated successfully' };
      logger.info('Alert rule updated', { 
        ruleId: params.ruleId,
        userId: authResult.user.id 
      });
      break;

    case 'delete_alert_rule':
      const deleted = errorNotificationService.deleteAlertRule(params.ruleId);
      if (!deleted) {
        throw createError.notFound('Alert rule');
      }
      result = { message: 'Alert rule deleted successfully' };
      logger.info('Alert rule deleted', { 
        ruleId: params.ruleId,
        userId: authResult.user.id 
      });
      break;

    case 'resolve_notification':
      await errorNotificationService.resolveNotification(
        params.notificationId, 
        authResult.user.id
      );
      result = { message: 'Notification resolved successfully' };
      logger.info('Error notification resolved', { 
        notificationId: params.notificationId,
        userId: authResult.user.id 
      });
      break;

    default:
      throw createError.badRequest(`Invalid action: ${action}`);
  }

  return NextResponse.json({
    success: true,
    data: result
  });
}

// Apply middleware
const getHandler = withErrorHandler(withRequestCorrelation(GET));
const postHandler = withErrorHandler(withRequestCorrelation(POST));

export { getHandler as GET, postHandler as POST };