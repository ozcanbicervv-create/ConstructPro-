/**
 * Web Vitals monitoring component for tracking Core Web Vitals and UX metrics
 */

'use client';

import { useEffect, useRef } from 'react';

import { performanceMonitor } from '@/utils/performance-monitor';

interface WebVitalsMonitorProps {
  enableReporting?: boolean;
  sampleRate?: number;
  debug?: boolean;
}

export function WebVitalsMonitor({ 
  enableReporting = true, 
  sampleRate = 1,
  debug = false 
}: WebVitalsMonitorProps) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || !enableReporting) {return;}
    initialized.current = true;

    // Only monitor for a sample of users to reduce server load
    if (Math.random() > sampleRate) {return;}

    const initializeWebVitals = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const { getCLS, getFID, getFCP, getLCP, getTTFB, onINP } = await import('web-vitals');

        // Core Web Vitals
        getCLS((metric) => {
          reportWebVital(metric);
          if (debug) {console.log('CLS:', metric);}
        });

        getFID((metric) => {
          reportWebVital(metric);
          if (debug) {console.log('FID:', metric);}
        });

        getLCP((metric) => {
          reportWebVital(metric);
          if (debug) {console.log('LCP:', metric);}
        });

        // Additional metrics
        getFCP((metric) => {
          reportWebVital(metric);
          if (debug) {console.log('FCP:', metric);}
        });

        getTTFB((metric) => {
          reportWebVital(metric);
          if (debug) {console.log('TTFB:', metric);}
        });

        // Interaction to Next Paint (INP) - new Core Web Vital
        if (onINP) {
          onINP((metric) => {
            reportWebVital(metric);
            if (debug) {console.log('INP:', metric);}
          });
        }

        // Custom UX metrics
        initializeCustomMetrics();

      } catch (error) {
        console.warn('Web Vitals monitoring failed to initialize:', error);
      }
    };

    const reportWebVital = (metric: any) => {
      // Add user context
      const enhancedMetric = {
        ...metric,
        url: window.location.href,
        userAgent: navigator.userAgent,
        connectionType: getConnectionType(),
        deviceMemory: getDeviceMemory(),
        timestamp: Date.now(),
      };

      // Send to performance monitor
      performanceMonitor.recordMetric({
        name: `webvital_${metric.name.toLowerCase()}`,
        value: metric.value,
        timestamp: enhancedMetric.timestamp,
        url: enhancedMetric.url,
      });

      // Send to analytics if available
      if (typeof gtag !== 'undefined') {
        gtag('event', metric.name, {
          event_category: 'Web Vitals',
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          event_label: metric.id,
          non_interaction: true,
        });
      }
    };

    const initializeCustomMetrics = () => {
      // Time to Interactive (TTI) approximation
      measureTimeToInteractive();
      
      // First Input Delay for touch devices
      measureTouchResponsiveness();
      
      // Visual stability metrics
      measureVisualStability();
      
      // Resource loading metrics
      measureResourcePerformance();
    };

    const measureTimeToInteractive = () => {
      let isInteractive = false;
      const startTime = performance.now();

      const checkInteractivity = () => {
        if (isInteractive) {return;}

        // Simple heuristic: page is interactive when main thread is idle
        const now = performance.now();
        if (now - startTime > 5000) { // 5 second timeout
          isInteractive = true;
          performanceMonitor.recordMetric({
            name: 'time_to_interactive',
            value: now,
            timestamp: Date.now(),
            url: window.location.href,
          });
          return;
        }

        requestIdleCallback(() => {
          setTimeout(() => {
            if (!isInteractive) {
              isInteractive = true;
              performanceMonitor.recordMetric({
                name: 'time_to_interactive',
                value: performance.now(),
                timestamp: Date.now(),
                url: window.location.href,
              });
            }
          }, 50);
        });
      };

      // Check after DOM is loaded
      if (document.readyState === 'complete') {
        checkInteractivity();
      } else {
        window.addEventListener('load', checkInteractivity);
      }
    };

    const measureTouchResponsiveness = () => {
      let touchStartTime = 0;

      document.addEventListener('touchstart', () => {
        touchStartTime = performance.now();
      }, { passive: true });

      document.addEventListener('touchend', () => {
        if (touchStartTime > 0) {
          const touchDuration = performance.now() - touchStartTime;
          performanceMonitor.recordMetric({
            name: 'touch_responsiveness',
            value: touchDuration,
            timestamp: Date.now(),
            url: window.location.href,
          });
          touchStartTime = 0;
        }
      }, { passive: true });
    };

    const measureVisualStability = () => {
      let layoutShiftScore = 0;
      let visibilityChangeCount = 0;

      // Track layout shifts beyond CLS
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            layoutShiftScore += (entry as any).value;
          }
        }
      });

      observer.observe({ entryTypes: ['layout-shift'] });

      // Track visibility changes
      document.addEventListener('visibilitychange', () => {
        visibilityChangeCount++;
        if (visibilityChangeCount === 1) {
          // First visibility change - user likely switched tabs
          performanceMonitor.recordMetric({
            name: 'first_tab_switch',
            value: performance.now(),
            timestamp: Date.now(),
            url: window.location.href,
          });
        }
      });

      // Report accumulated layout shift after 30 seconds
      setTimeout(() => {
        performanceMonitor.recordMetric({
          name: 'cumulative_layout_shift_30s',
          value: layoutShiftScore,
          timestamp: Date.now(),
          url: window.location.href,
        });
      }, 30000);
    };

    const measureResourcePerformance = () => {
      // Monitor large resource loads
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resourceEntry = entry as PerformanceResourceTiming;
          
          // Track slow resources (>1s)
          if (resourceEntry.duration > 1000) {
            performanceMonitor.recordMetric({
              name: 'slow_resource',
              value: resourceEntry.duration,
              timestamp: Date.now(),
              url: resourceEntry.name,
            });
          }

          // Track large resources (>500KB)
          if (resourceEntry.transferSize > 500000) {
            performanceMonitor.recordMetric({
              name: 'large_resource',
              value: resourceEntry.transferSize,
              timestamp: Date.now(),
              url: resourceEntry.name,
            });
          }
        }
      });

      observer.observe({ entryTypes: ['resource'] });
    };

    initializeWebVitals();

    // Cleanup
    return () => {
      initialized.current = false;
    };
  }, [enableReporting, sampleRate, debug]);

  return null; // This component doesn't render anything
}

// Utility functions
function getConnectionType(): string {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return connection.effectiveType || connection.type || 'unknown';
  }
  return 'unknown';
}

function getDeviceMemory(): number {
  if ('deviceMemory' in navigator) {
    return (navigator as any).deviceMemory;
  }
  return 0;
}

// Hook for using Web Vitals in components
export function useWebVitals(callback?: (metric: any) => void) {
  useEffect(() => {
    if (!callback) {return;}

    const initWebVitals = async () => {
      try {
        const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');
        
        getCLS(callback);
        getFID(callback);
        getFCP(callback);
        getLCP(callback);
        getTTFB(callback);
      } catch (error) {
        console.warn('Failed to load web-vitals:', error);
      }
    };

    initWebVitals();
  }, [callback]);
}