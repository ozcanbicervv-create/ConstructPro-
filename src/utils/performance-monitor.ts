/**
 * Performance monitoring utilities for tracking Core Web Vitals and custom metrics
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url?: string;
  userId?: string;
}

export interface WebVitalsMetric extends PerformanceMetric {
  id: string;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private isEnabled: boolean = true;
  private endpoint: string = '/api/metrics';

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeWebVitals();
      this.initializeNavigationTiming();
      this.initializeResourceTiming();
    }
  }

  /**
   * Initialize Web Vitals monitoring
   */
  private async initializeWebVitals() {
    try {
      const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');
      
      getCLS(this.handleWebVital.bind(this));
      getFID(this.handleWebVital.bind(this));
      getFCP(this.handleWebVital.bind(this));
      getLCP(this.handleWebVital.bind(this));
      getTTFB(this.handleWebVital.bind(this));
    } catch (error) {
      console.warn('Web Vitals library not available:', error);
    }
  }

  /**
   * Handle Web Vitals metrics
   */
  private handleWebVital(metric: any) {
    const webVitalMetric: WebVitalsMetric = {
      name: metric.name,
      value: metric.value,
      id: metric.id,
      delta: metric.delta,
      rating: metric.rating,
      timestamp: Date.now(),
      url: window.location.href,
    };

    this.recordMetric(webVitalMetric);
  }

  /**
   * Initialize Navigation Timing monitoring
   */
  private initializeNavigationTiming() {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.recordNavigationMetrics(navEntry);
          }
        }
      });

      observer.observe({ entryTypes: ['navigation'] });
    }
  }

  /**
   * Initialize Resource Timing monitoring
   */
  private initializeResourceTiming() {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            this.recordResourceMetrics(resourceEntry);
          }
        }
      });

      observer.observe({ entryTypes: ['resource'] });
    }
  }

  /**
   * Record navigation timing metrics
   */
  private recordNavigationMetrics(entry: PerformanceNavigationTiming) {
    const metrics = [
      { name: 'dns_lookup', value: entry.domainLookupEnd - entry.domainLookupStart },
      { name: 'tcp_connect', value: entry.connectEnd - entry.connectStart },
      { name: 'request_response', value: entry.responseEnd - entry.requestStart },
      { name: 'dom_parse', value: entry.domContentLoadedEventEnd - entry.responseEnd },
      { name: 'page_load', value: entry.loadEventEnd - entry.navigationStart },
    ];

    metrics.forEach(metric => {
      if (metric.value > 0) {
        this.recordMetric({
          ...metric,
          timestamp: Date.now(),
          url: window.location.href,
        });
      }
    });
  }

  /**
   * Record resource timing metrics
   */
  private recordResourceMetrics(entry: PerformanceResourceTiming) {
    // Only track significant resources (images, scripts, stylesheets)
    const resourceTypes = ['img', 'script', 'link', 'fetch', 'xmlhttprequest'];
    const initiatorType = entry.initiatorType;

    if (resourceTypes.includes(initiatorType)) {
      this.recordMetric({
        name: `resource_${initiatorType}`,
        value: entry.responseEnd - entry.startTime,
        timestamp: Date.now(),
        url: entry.name,
      });
    }
  }

  /**
   * Record a custom performance metric
   */
  recordMetric(metric: PerformanceMetric) {
    if (!this.isEnabled) return;

    this.metrics.push(metric);

    // Send metrics in batches to avoid overwhelming the server
    if (this.metrics.length >= 10) {
      this.sendMetrics();
    }
  }

  /**
   * Start timing a custom operation
   */
  startTiming(name: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      this.recordMetric({
        name: `custom_${name}`,
        value: endTime - startTime,
        timestamp: Date.now(),
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      });
    };
  }

  /**
   * Record memory usage metrics
   */
  recordMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.recordMetric({
        name: 'memory_used',
        value: memory.usedJSHeapSize,
        timestamp: Date.now(),
      });
      this.recordMetric({
        name: 'memory_total',
        value: memory.totalJSHeapSize,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Send metrics to the server
   */
  private async sendMetrics() {
    if (this.metrics.length === 0) return;

    const metricsToSend = [...this.metrics];
    this.metrics = [];

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ metrics: metricsToSend }),
      });
    } catch (error) {
      console.warn('Failed to send performance metrics:', error);
      // Re-add metrics to queue for retry
      this.metrics.unshift(...metricsToSend);
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics = [];
  }

  /**
   * Enable or disable monitoring
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  /**
   * Flush all pending metrics
   */
  async flush() {
    if (this.metrics.length > 0) {
      await this.sendMetrics();
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions for common performance measurements
export const measureAsync = async <T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> => {
  const endTiming = performanceMonitor.startTiming(name);
  try {
    const result = await fn();
    return result;
  } finally {
    endTiming();
  }
};

export const measureSync = <T>(name: string, fn: () => T): T => {
  const endTiming = performanceMonitor.startTiming(name);
  try {
    return fn();
  } finally {
    endTiming();
  }
};