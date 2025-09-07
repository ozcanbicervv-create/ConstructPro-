'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { PerformanceMonitor, initializePerformanceMonitoring } from '@/lib/performance';
import { initializeCodeSplitting } from '@/lib/code-splitting';
import { initializeAnalytics } from '@/lib/analytics';
import { initializePerformanceBudgets, PerformanceBudgetMonitor } from '@/lib/performance-budgets';
import { PerformanceMonitorComponent } from '@/components/ui/performance-monitor';

interface PerformanceContextType {
  monitor: PerformanceMonitor | null;
  budgetMonitor: PerformanceBudgetMonitor | null;
  isMonitoring: boolean;
  toggleMonitoring: () => void;
}

const PerformanceContext = createContext<PerformanceContextType>({
  monitor: null,
  budgetMonitor: null,
  isMonitoring: false,
  toggleMonitoring: () => {},
});

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};

interface PerformanceProviderProps {
  children: React.ReactNode;
}

const PerformanceProvider: React.FC<PerformanceProviderProps> = ({ children }) => {
  const [monitor, setMonitor] = useState<PerformanceMonitor | null>(null);
  const [budgetMonitor, setBudgetMonitor] = useState<PerformanceBudgetMonitor | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    // Initialize performance monitoring only in production or when explicitly enabled
    const shouldMonitor = 
      process.env.NODE_ENV === 'production' || 
      process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true';

    if (shouldMonitor) {
      // Initialize performance monitoring
      const performanceMonitor = initializePerformanceMonitoring(
        undefined, // Use default budget
        process.env.NEXT_PUBLIC_PERFORMANCE_ENDPOINT // Optional reporting endpoint
      );
      
      // Initialize performance budgets
      const performanceBudgetMonitor = initializePerformanceBudgets(
        undefined, // Use default budgets
        {
          enabled: true,
          channels: ['console', 'notification'],
          cooldownPeriod: 5,
        }
      );

      // Initialize analytics
      initializeAnalytics({
        apiEndpoint: process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT,
        enableErrorTracking: true,
        enablePerformanceTracking: true,
        enableUserTracking: true,
        sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev
      });

      // Initialize code splitting optimizations
      initializeCodeSplitting();

      // Connect performance monitor to budget monitor
      const originalHandleMetric = performanceMonitor.handleMetric;
      if (originalHandleMetric) {
        performanceMonitor.handleMetric = function(metric: any) {
          // Call original handler
          originalHandleMetric.call(this, metric);
          
          // Check against performance budgets
          performanceBudgetMonitor.checkMetric(metric.name, metric.value, {
            navigationType: metric.navigationType,
            id: metric.id,
          });
        };
      }
      
      setMonitor(performanceMonitor);
      setBudgetMonitor(performanceBudgetMonitor);
      setIsMonitoring(true);
    }
  }, []);

  const toggleMonitoring = () => {
    setIsMonitoring(prev => !prev);
  };

  const value: PerformanceContextType = {
    monitor,
    budgetMonitor,
    isMonitoring,
    toggleMonitoring,
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
      {/* Show performance monitor in development or when monitoring is enabled */}
      {monitor && isMonitoring && process.env.NODE_ENV === 'development' && (
        <PerformanceMonitorComponent monitor={monitor} />
      )}
    </PerformanceContext.Provider>
  );
};

export default PerformanceProvider;
export { PerformanceProvider };