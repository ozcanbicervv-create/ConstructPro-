'use client';

import { 
  Activity, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Eye,
  Users,
  Server,
  Smartphone,
  Monitor,
  Globe
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PerformanceDashboard } from '@/components/ui/performance-monitor';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock performance data - in production this would come from real monitoring
const mockPerformanceData = {
  coreWebVitals: {
    lcp: { value: 2.1, threshold: 2.5, status: 'good' },
    fid: { value: 45, threshold: 100, status: 'good' },
    cls: { value: 0.08, threshold: 0.1, status: 'good' },
    fcp: { value: 1.2, threshold: 1.8, status: 'good' },
    ttfb: { value: 650, threshold: 800, status: 'good' },
  },
  realUserMetrics: {
    pageViews: 15420,
    uniqueUsers: 3240,
    bounceRate: 23.5,
    avgSessionDuration: 245,
    conversionRate: 4.2,
  },
  technicalMetrics: {
    bundleSize: 245,
    jsSize: 180,
    cssSize: 32,
    imageSize: 156,
    cacheHitRate: 94.2,
    errorRate: 0.3,
  },
  deviceBreakdown: {
    mobile: 65,
    tablet: 20,
    desktop: 15,
  },
  geographicData: [
    { country: 'United States', users: 1240, avgLcp: 2.1 },
    { country: 'Canada', users: 890, avgLcp: 1.9 },
    { country: 'United Kingdom', users: 650, avgLcp: 2.3 },
    { country: 'Australia', users: 460, avgLcp: 2.8 },
  ],
  trends: {
    lcp: [2.3, 2.2, 2.1, 2.0, 2.1, 2.1, 2.1],
    fid: [52, 48, 45, 43, 45, 44, 45],
    cls: [0.12, 0.10, 0.09, 0.08, 0.08, 0.08, 0.08],
    pageViews: [12000, 13500, 14200, 15000, 15420, 15800, 16200],
  },
};

export default function PerformancePage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [realTimeData, setRealTimeData] = useState(mockPerformanceData);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        ...prev,
        realUserMetrics: {
          ...prev.realUserMetrics,
          pageViews: prev.realUserMetrics.pageViews + Math.floor(Math.random() * 10),
          uniqueUsers: prev.realUserMetrics.uniqueUsers + Math.floor(Math.random() * 3),
        },
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
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

  const formatMetricValue = (metric: string, value: number) => {
    switch (metric) {
      case 'cls':
        return value.toFixed(3);
      case 'lcp':
      case 'fcp':
        return `${value.toFixed(1)}s`;
      case 'fid':
      case 'ttfb':
        return `${Math.round(value)}ms`;
      default:
        return value.toString();
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Monitoring</h1>
          <p className="text-gray-600 mt-2">
            Real-time performance metrics and Core Web Vitals monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Activity className="h-3 w-3 mr-1" />
            Live Monitoring
          </Badge>
          <Button variant="outline" size="sm">
            Export Report
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex space-x-2">
        {['1h', '24h', '7d', '30d'].map(range => (
          <Button
            key={range}
            variant={selectedTimeRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTimeRange(range)}
          >
            {range}
          </Button>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="core-vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="user-experience">User Experience</TabsTrigger>
          <TabsTrigger value="technical">Technical Metrics</TabsTrigger>
          <TabsTrigger value="real-time">Real-time</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Core Metrics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(realTimeData.coreWebVitals).map(([key, metric]) => (
              <Card key={key}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 uppercase">
                        {key.toUpperCase()}
                      </p>
                      <p className="text-2xl font-bold">
                        {formatMetricValue(key, metric.value)}
                      </p>
                    </div>
                    <Badge className={getStatusColor(metric.status)}>
                      {getStatusIcon(metric.status)}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <Progress 
                      value={(metric.value / metric.threshold) * 100} 
                      className="h-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Threshold: {formatMetricValue(key, metric.threshold)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* User Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Page Views</p>
                    <p className="text-2xl font-bold">{realTimeData.realUserMetrics.pageViews.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Unique Users</p>
                    <p className="text-2xl font-bold">{realTimeData.realUserMetrics.uniqueUsers.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-600">Bounce Rate</p>
                    <p className="text-2xl font-bold">{realTimeData.realUserMetrics.bounceRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">Avg Session</p>
                    <p className="text-2xl font-bold">{Math.floor(realTimeData.realUserMetrics.avgSessionDuration / 60)}m</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Device Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Device Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-4 w-4" />
                    <span>Mobile</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={realTimeData.deviceBreakdown.mobile} className="w-24 h-2" />
                    <span className="text-sm font-medium">{realTimeData.deviceBreakdown.mobile}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Monitor className="h-4 w-4" />
                    <span>Desktop</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={realTimeData.deviceBreakdown.desktop} className="w-24 h-2" />
                    <span className="text-sm font-medium">{realTimeData.deviceBreakdown.desktop}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Monitor className="h-4 w-4" />
                    <span>Tablet</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={realTimeData.deviceBreakdown.tablet} className="w-24 h-2" />
                    <span className="text-sm font-medium">{realTimeData.deviceBreakdown.tablet}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Core Web Vitals Tab */}
        <TabsContent value="core-vitals" className="space-y-6">
          <PerformanceDashboard />
        </TabsContent>

        {/* User Experience Tab */}
        <TabsContent value="user-experience" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Geographic Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Geographic Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {realTimeData.geographicData.map(country => (
                    <div key={country.country} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{country.country}</p>
                        <p className="text-sm text-gray-600">{country.users} users</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{country.avgLcp}s</p>
                        <p className="text-sm text-gray-600">Avg LCP</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* User Journey Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>User Journey Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Conversion Rate</span>
                    <span className="font-medium">{realTimeData.realUserMetrics.conversionRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bounce Rate</span>
                    <span className="font-medium">{realTimeData.realUserMetrics.bounceRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pages per Session</span>
                    <span className="font-medium">3.2</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Return Visitor Rate</span>
                    <span className="font-medium">42%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Technical Metrics Tab */}
        <TabsContent value="technical" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Bundle Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Bundle Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Size</span>
                    <span className="font-medium">{realTimeData.technicalMetrics.bundleSize}KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>JavaScript</span>
                    <span className="font-medium">{realTimeData.technicalMetrics.jsSize}KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CSS</span>
                    <span className="font-medium">{realTimeData.technicalMetrics.cssSize}KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Images</span>
                    <span className="font-medium">{realTimeData.technicalMetrics.imageSize}KB</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Server Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="h-5 w-5 mr-2" />
                  Server Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Cache Hit Rate</span>
                    <span className="font-medium">{realTimeData.technicalMetrics.cacheHitRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Error Rate</span>
                    <span className="font-medium">{realTimeData.technicalMetrics.errorRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uptime</span>
                    <span className="font-medium">99.9%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Response Time</span>
                    <span className="font-medium">120ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Budget */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Bundle Size</span>
                      <span className="text-sm">{realTimeData.technicalMetrics.bundleSize}/500KB</span>
                    </div>
                    <Progress value={(realTimeData.technicalMetrics.bundleSize / 500) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">LCP Budget</span>
                      <span className="text-sm">{realTimeData.coreWebVitals.lcp.value}/2.5s</span>
                    </div>
                    <Progress value={(realTimeData.coreWebVitals.lcp.value / 2.5) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">FID Budget</span>
                      <span className="text-sm">{realTimeData.coreWebVitals.fid.value}/100ms</span>
                    </div>
                    <Progress value={(realTimeData.coreWebVitals.fid.value / 100) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Real-time Tab */}
        <TabsContent value="real-time" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Live Metrics
                  <Badge variant="outline" className="ml-2 bg-green-50 text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    Live
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Active Users</span>
                    <span className="text-2xl font-bold text-green-600">127</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Page Views (last hour)</span>
                    <span className="text-2xl font-bold">1,240</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Avg Load Time</span>
                    <span className="text-2xl font-bold">1.8s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Error Rate</span>
                    <span className="text-2xl font-bold text-red-600">0.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">LCP Threshold Exceeded</p>
                      <p className="text-sm text-yellow-600">Mobile users experiencing 3.2s LCP</p>
                      <p className="text-xs text-yellow-500">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">Performance Improved</p>
                      <p className="text-sm text-green-600">Bundle size reduced by 15%</p>
                      <p className="text-xs text-green-500">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}