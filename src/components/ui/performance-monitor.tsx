'use client';

import { Activity, Zap, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  PerformanceMonitor, 
  PerformanceMetric, 
  PERFORMANCE_THRESHOLDS,
  BundleAnalyzer 
} from '@/lib/performance';

interface PerformanceMonitorComponentProps {
  monitor: PerformanceMonitor;
  showDetails?: boolean;
}

export const PerformanceMonitorComponent: React.FC<PerformanceMonitorComponentProps> = ({
  monitor,
  showDetails = false,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [budgetStatus, setBudgetStatus] = useState<any[]>([]);
  const [bundleAnalysis, setBundleAnalysis] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(showDetails);

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(monitor.getMetrics());
      setBudgetStatus(monitor.getBudgetStatus());
    };

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);
    updateMetrics();

    return () => clearInterval(interval);
  }, [monitor]);

  useEffect(() => {
    // Analyze bundle size on component mount
    BundleAnalyzer.analyzeBundleSize().then(setBundleAnalysis);
  }, []);

  const getMetricColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'text-green-600 bg-green-100';
      case 'needs-improvement':
        return 'text-yellow-600 bg-yellow-100';
      case 'poor':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getMetricIcon = (rating: string) => {
    switch (rating) {
      case 'good':
        return <CheckCircle className="h-4 w-4" />;
      case 'needs-improvement':
        return <AlertTriangle className="h-4 w-4" />;
      case 'poor':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const formatMetricValue = (name: string, value: number) => {
    if (name === 'CLS') {
      return value.toFixed(3);
    }
    return `${Math.round(value)}ms`;
  };

  const getLatestMetrics = () => {
    const latestMetrics: { [key: string]: PerformanceMetric } = {};
    
    metrics.forEach(metric => {
      if (!latestMetrics[metric.name] || metric.timestamp > latestMetrics[metric.name].timestamp) {
        latestMetrics[metric.name] = metric;
      }
    });

    return Object.values(latestMetrics);
  };

  if (!isVisible && !showDetails) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        <Activity className="h-4 w-4 mr-2" />
        Performance
      </Button>
    );
  }

  return (
    <div className={`${showDetails ? '' : 'fixed bottom-4 right-4 z-50 w-96'}`}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Performance Monitor
            </CardTitle>
            {!showDetails && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
              >
                ×
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Core Web Vitals */}
          <div>
            <h4 className="font-medium mb-2">Core Web Vitals</h4>
            <div className="space-y-2">
              {getLatestMetrics().map(metric => (
                <div key={metric.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getMetricIcon(metric.rating)}
                    <span className="text-sm font-medium">{metric.name}</span>
                  </div>
                  <Badge className={getMetricColor(metric.rating)}>
                    {formatMetricValue(metric.name, metric.value)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Budget Status */}
          <div>
            <h4 className="font-medium mb-2">Budget Status</h4>
            <div className="space-y-2">
              {budgetStatus.map(budget => (
                <div key={budget.metric} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{budget.metric}</span>
                    <span className={budget.status === 'pass' ? 'text-green-600' : 'text-red-600'}>
                      {formatMetricValue(budget.metric, budget.current)} / {formatMetricValue(budget.metric, budget.budget)}
                    </span>
                  </div>
                  <Progress 
                    value={(budget.current / budget.budget) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Bundle Analysis */}
          {bundleAnalysis && (
            <div>
              <h4 className="font-medium mb-2">Bundle Analysis</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Total Size</span>
                  <Badge variant="outline">{bundleAnalysis.totalSize}KB</Badge>
                </div>
                <div className="space-y-1">
                  {bundleAnalysis.chunks.map((chunk: any) => (
                    <div key={chunk.name} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{chunk.name}</span>
                      <span>{chunk.size}KB</span>
                    </div>
                  ))}
                </div>
                {bundleAnalysis.recommendations.length > 0 && (
                  <div className="mt-2">
                    <h5 className="text-xs font-medium text-gray-700 mb-1">Recommendations</h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {bundleAnalysis.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <TrendingUp className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const data = {
                  metrics: metrics,
                  budgetStatus: budgetStatus,
                  bundleAnalysis: bundleAnalysis,
                  timestamp: Date.now(),
                };
                console.log('Performance Report:', data);
              }}
            >
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Performance dashboard component
export const PerformanceDashboard: React.FC = () => {
  const [monitor] = useState(() => new PerformanceMonitor());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Performance Dashboard</h2>
        <Badge variant="outline">Real-time Monitoring</Badge>
      </div>

      <PerformanceMonitorComponent monitor={monitor} showDetails />

      {/* Additional performance insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Loading Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>First Contentful Paint</span>
                <span className="font-medium">1.2s</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Largest Contentful Paint</span>
                <span className="font-medium">2.1s</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Time to Interactive</span>
                <span className="font-medium">3.4s</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resource Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>JavaScript</span>
                <span className="font-medium">245KB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>CSS</span>
                <span className="font-medium">32KB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Images</span>
                <span className="font-medium">156KB</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Cumulative Layout Shift</span>
                <span className="font-medium">0.08</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>First Input Delay</span>
                <span className="font-medium">45ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Interaction to Next Paint</span>
                <span className="font-medium">120ms</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};