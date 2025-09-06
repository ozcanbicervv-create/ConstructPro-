'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ErrorBoundary, FeatureErrorBoundary, useErrorHandler } from '@/components/error-boundary';
import { useNotifications } from '@/components/error-notification';
import { apiService } from '@/services/api.service';
import { ErrorHandler } from '@/utils/error-handler';
import { logger } from '@/utils/logger';
import { ApiErrorHandler } from '@/utils/api-error-handler';

/**
 * Example component demonstrating various error handling patterns
 */
export function ErrorHandlingExample() {
  const [loading, setLoading] = useState(false);
  const [testInput, setTestInput] = useState('');
  const { showError, showSuccess, showWarning, showInfo } = useNotifications();
  const { handleError } = useErrorHandler('ErrorHandlingExample');

  // Example 1: Manual error handling with notifications
  const handleManualError = () => {
    try {
      throw new Error('This is a manually triggered error for demonstration');
    } catch (error) {
      handleError(error as Error, { action: 'manual_error_test' });
      showError(error as Error, 'Manual Error Test');
    }
  };

  // Example 2: API error handling
  const handleApiError = async () => {
    setLoading(true);
    try {
      // This will likely fail and demonstrate API error handling
      const response = await apiService.get('/api/nonexistent-endpoint');
      
      if (!response.success) {
        showError(response.error?.message || 'API request failed');
      } else {
        showSuccess('API request succeeded');
      }
    } catch (error) {
      showError(error as Error, 'API Error Test');
    } finally {
      setLoading(false);
    }
  };

  // Example 3: Validation error
  const handleValidationError = () => {
    if (!testInput.trim()) {
      const validationError = ApiErrorHandler.createApiError(
        'Input field cannot be empty',
        400,
        'VALIDATION_ERROR'
      );
      showError(validationError);
      return;
    }

    showSuccess('Validation passed!');
  };

  // Example 4: Different notification types
  const showDifferentNotifications = () => {
    showInfo('This is an informational message');
    setTimeout(() => showWarning('This is a warning message'), 1000);
    setTimeout(() => showSuccess('This is a success message'), 2000);
    setTimeout(() => showError('This is an error message'), 3000);
  };

  // Example 5: Component that throws an error (for error boundary demo)
  const ErrorThrowingComponent = () => {
    const [shouldThrow, setShouldThrow] = useState(false);

    if (shouldThrow) {
      throw new Error('Component error for error boundary demonstration');
    }

    return (
      <div className="p-4 border rounded-lg">
        <p className="mb-2">This component can throw an error to test error boundaries.</p>
        <Button 
          onClick={() => setShouldThrow(true)}
          variant="destructive"
          size="sm"
        >
          Throw Error
        </Button>
      </div>
    );
  };

  // Example 6: Logging demonstration
  const demonstrateLogging = () => {
    logger.debug('Debug message', 'ErrorHandlingExample', { testData: 'debug' });
    logger.info('Info message', 'ErrorHandlingExample', { testData: 'info' });
    logger.warn('Warning message', 'ErrorHandlingExample', { testData: 'warning' });
    logger.error('Error message', 'ErrorHandlingExample', { testData: 'error' });
    
    // Log user action
    logger.logUserAction('demonstrate_logging', { component: 'ErrorHandlingExample' });
    
    // Log performance metric
    logger.logPerformance('demo_operation', 150, 'ms');

    showInfo('Check the browser console to see logged messages');
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Error Handling System Demo</h2>
        <p className="text-gray-600">
          This component demonstrates various error handling patterns and features.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Manual Error Handling */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Error Handling</CardTitle>
            <CardDescription>
              Demonstrates manual error handling with logging and notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleManualError} variant="outline">
              Trigger Manual Error
            </Button>
          </CardContent>
        </Card>

        {/* API Error Handling */}
        <Card>
          <CardHeader>
            <CardTitle>API Error Handling</CardTitle>
            <CardDescription>
              Demonstrates API error handling with retry logic and logging
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleApiError} 
              variant="outline"
              disabled={loading}
            >
              {loading ? 'Testing...' : 'Test API Error'}
            </Button>
          </CardContent>
        </Card>

        {/* Validation Error */}
        <Card>
          <CardHeader>
            <CardTitle>Validation Error</CardTitle>
            <CardDescription>
              Demonstrates validation error handling
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="test-input">Test Input</Label>
              <Input
                id="test-input"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Enter some text..."
              />
            </div>
            <Button onClick={handleValidationError} variant="outline">
              Validate Input
            </Button>
          </CardContent>
        </Card>

        {/* Notification Types */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Types</CardTitle>
            <CardDescription>
              Demonstrates different types of notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={showDifferentNotifications} variant="outline">
              Show All Notification Types
            </Button>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Error Boundary Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Error Boundary Demo</CardTitle>
          <CardDescription>
            Demonstrates React error boundaries for component-level error handling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FeatureErrorBoundary context="ErrorThrowingComponent">
            <ErrorThrowingComponent />
          </FeatureErrorBoundary>
        </CardContent>
      </Card>

      {/* Logging Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Logging System Demo</CardTitle>
          <CardDescription>
            Demonstrates structured logging with different levels and contexts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={demonstrateLogging} variant="outline">
            Demonstrate Logging
          </Button>
          <div className="text-sm text-gray-600">
            <p>This will log messages at different levels:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Debug message (only in development)</li>
              <li>Info message</li>
              <li>Warning message</li>
              <li>Error message</li>
              <li>User action log</li>
              <li>Performance metric</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Error Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Error Statistics</CardTitle>
          <CardDescription>
            View current error statistics and logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ErrorStatistics />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Component to display error statistics
 */
function ErrorStatistics() {
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);

  const refreshStats = () => {
    const errorStats = ErrorHandler.getErrorStats();
    const logStats = logger.getStats();
    const recentLogs = logger.getLogs({ limit: 5 });

    setStats({ errorStats, logStats });
    setLogs(recentLogs);
  };

  React.useEffect(() => {
    refreshStats();
  }, []);

  if (!stats) {
    return <div>Loading statistics...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Current Statistics</h4>
        <Button onClick={refreshStats} size="sm" variant="outline">
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-3 bg-gray-50 rounded-lg">
          <h5 className="font-medium mb-2">Error Handler Stats</h5>
          <div className="text-sm space-y-1">
            <p>Total Errors: {stats.errorStats.total}</p>
            <p>Recent Errors (1h): {stats.errorStats.recent}</p>
            <div>
              By Level:
              {Object.entries(stats.errorStats.byLevel).map(([level, count]) => (
                <div key={level} className="ml-2">
                  {level}: {count as number}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg">
          <h5 className="font-medium mb-2">Logger Stats</h5>
          <div className="text-sm space-y-1">
            <p>Total Logs: {stats.logStats.total}</p>
            <p>Recent Errors: {stats.logStats.recentErrors}</p>
            <div>
              By Level:
              {Object.entries(stats.logStats.byLevel).map(([level, count]) => (
                <div key={level} className="ml-2">
                  {level}: {count as number}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {logs.length > 0 && (
        <div>
          <h5 className="font-medium mb-2">Recent Logs</h5>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-xs p-2 bg-gray-100 rounded">
                <div className="flex justify-between">
                  <span className={`font-medium ${
                    log.level === 'error' ? 'text-red-600' :
                    log.level === 'warn' ? 'text-yellow-600' :
                    log.level === 'info' ? 'text-blue-600' :
                    'text-gray-600'
                  }`}>
                    {log.level.toUpperCase()}
                  </span>
                  <span className="text-gray-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="mt-1">{log.message}</div>
                {log.context && (
                  <div className="text-gray-500">Context: {log.context}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}