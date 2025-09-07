/**
 * Performance dashboard component for visualizing performance metrics
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { performanceMonitor, PerformanceMetric } from '@/utils/performance-monitor';
import { useWebVitals } from '@/components/web-vitals-monitor';
import { Activity, Zap, Clock, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  threshold: { good: number; poor: number };
}

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [webVitals, setWebVitals] = useState<WebVitalMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Web Vitals thresholds (in milliseconds, except CLS which is unitless)
  const webVitalsThresholds = {
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    TTFB: { good: 800, poor: 1800 },
    INP: { good: 200, poor: 500 },
  };

  useWebVitals((metric) => {
    const threshold = webVitalsThresholds[metric.name as keyof typeof webVitalsThresholds];
    if (threshold) {
      const webVital: WebVitalMetric = {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        threshold,
      };

      setWebVitals(prev => {
        const existing = prev.findIndex(v => v.name === metric.name);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = webVital;
          return updated;
        }
        return [...prev, webVital];
      });
    }
  });

  useEffect(() => {
    const loadMetrics = () => {
      const currentMetrics = performanceMonitor.getMetrics();
      setMetrics(currentMetrics);
      setIsLoading(false);
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const getMetricsByType = (type: string) => {
    return metrics.filter(m => m.name.includes(type));
  };

  const getAverageMetric = (metricName: string) => {
    const filtered = metrics.filter(m => m.name === metricName);
    if (filtered.length === 0) return 0;
    return filtered.reduce((sum, m) => sum + m.value, 0) / filtered.length;
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-600';
      case 'needs-improvement': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'needs-improvement': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'poor': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatValue = (name: string, value: number) => {
    if (name === 'CLS') {
      return value.toFixed(3);
    }
    return `${Math.round(value)}ms`;
  };

  const getProgressValue = (name: string, value: number, threshold: { good: number; poor: number }) => {
    if (name === 'CLS') {
      // For CLS, lower is better
      if (value <= threshold.good) return 100;
      if (value >= threshold.poor) return 0;
      return Math.max(0, 100 - ((value - threshold.good) / (threshold.poor - threshold.good)) * 100);
    } else {
      // For timing metrics, lower is better
      if (value <= threshold.good) return 100;
      if (value >= threshold.poor) return 0;
      return Math.max(0, 100 - ((value - threshold.good) / (threshold.poor - threshold.good)) * 100);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Dashboard
          </CardTitle>
          <CardDescription>Loading performance metrics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Dashboard
          </CardTitle>
          <CardDescription>
            Real-time performance metrics and Core Web Vitals
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="web-vitals" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="web-vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="custom">Custom Metrics</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
        </TabsList>

        <TabsContent value="web-vitals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {webVitals.map((vital) => (
              <Card key={vital.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    {vital.name}
                    {getRatingIcon(vital.rating)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">
                        {formatValue(vital.name, vital.value)}
                      </span>
                      <Badge variant={vital.rating === 'good' ? 'default' : 'destructive'}>
                        {vital.rating}
                      </Badge>
                    </div>
                    <Progress 
                      value={getProgressValue(vital.name, vital.value, vital.threshold)} 
                      className="h-2"
                    />
                    <div className="text-xs text-gray-500">
                      Good: ≤{formatValue(vital.name, vital.threshold.good)} | 
                      Poor: ≥{formatValue(vital.name, vital.threshold.poor)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {webVitals.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No Web Vitals data available yet.</p>
                  <p className="text-sm">Interact with the page to generate metrics.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Page Load Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(getAverageMetric('page_load'))}ms
                </div>
                <p className="text-xs text-gray-500">Average load time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  DNS Lookup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(getAverageMetric('dns_lookup'))}ms
                </div>
                <p className="text-xs text-gray-500">Average DNS resolution</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Time to Interactive
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(getAverageMetric('time_to_interactive'))}ms
                </div>
                <p className="text-xs text-gray-500">Estimated TTI</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Resource Loading</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Images</span>
                    <span>{getMetricsByType('resource_img').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Scripts</span>
                    <span>{getMetricsByType('resource_script').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stylesheets</span>
                    <span>{getMetricsByType('resource_link').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>XHR/Fetch</span>
                    <span>{getMetricsByType('resource_fetch').length + getMetricsByType('resource_xmlhttprequest').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Performance Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Slow Resources (&gt;1s)</span>
                    <span className="text-red-600">{getMetricsByType('slow_resource').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Large Resources (&gt;500KB)</span>
                    <span className="text-yellow-600">{getMetricsByType('large_resource').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="memory" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Memory Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Used Heap</span>
                    <span>{Math.round(getAverageMetric('memory_used') / 1024 / 1024)}MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Heap</span>
                    <span>{Math.round(getAverageMetric('memory_total') / 1024 / 1024)}MB</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Total metrics collected: {metrics.length}
              </p>
              <p className="text-xs text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                performanceMonitor.clearMetrics();
                setMetrics([]);
                setWebVitals([]);
              }}
            >
              Clear Metrics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}