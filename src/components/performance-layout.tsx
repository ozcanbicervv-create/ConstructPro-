/**
 * Performance-optimized layout component with lazy loading and code splitting
 */

'use client';

import { useEffect, useState, memo } from 'react';

import { preloadCriticalComponents } from '@/components/lazy-components';
import { performanceMonitor } from '@/utils/performance-monitor';

interface PerformanceLayoutProps {
  children: React.ReactNode;
  enableMonitoring?: boolean;
}

const PerformanceLayout = memo(({ 
  children, 
  enableMonitoring = true 
}: PerformanceLayoutProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    if (enableMonitoring) {
      // Initialize performance monitoring
      performanceMonitor.setEnabled(true);
      
      // Record memory usage periodically
      const memoryInterval = setInterval(() => {
        performanceMonitor.recordMemoryUsage();
      }, 30000); // Every 30 seconds

      // Preload critical components
      preloadCriticalComponents();

      // Flush metrics before page unload
      const handleBeforeUnload = () => {
        performanceMonitor.flush();
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        clearInterval(memoryInterval);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        performanceMonitor.flush();
      };
    }
  }, [enableMonitoring]);

  // Prevent hydration mismatch by only rendering client-side content after mount
  if (!isClient) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
});

PerformanceLayout.displayName = 'PerformanceLayout';

export { PerformanceLayout };