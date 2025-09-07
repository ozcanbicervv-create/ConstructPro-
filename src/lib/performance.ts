/**
 * Performance monitoring and optimization utilities
 * Implements Core Web Vitals tracking and performance budgets
 */

// Dynamic import for web-vitals to avoid SSR issues
let webVitals: any = null;

async function loadWebVitals() {
  if (typeof window !== 'undefined' && !webVitals) {
    try {
      webVitals = await import('web-vitals');
    } catch (error) {
      console.warn('Failed to load web-vitals:', error);
    }
  }
  return webVitals;
}

// Performance thresholds based on Core Web Vitals
export const PERFORMANCE_THRESHOLDS = {
  // Largest Contentful Paint (LCP)
  LCP: {
    good: 2500,
    needsImprovement: 4000,
  },
  // First Input Delay (FID)
  FID: {
    good: 100,
    needsImprovement: 300,
  },
  // Cumulative Layout Shift (CLS)
  CLS: {
    good: 0.1,
    needsImprovement: 0.25,
  },
  // First Contentful Paint (FCP)
  FCP: {
    good: 1800,
    needsImprovement: 3000,
  },
  // Time to First Byte (TTFB)
  TTFB: {
    good: 800,
    needsImprovement: 1800,
  },
} as const;

// Performance metric types
export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  id: string;
  navigationType?: string;
}

// Performance budget configuration
export interface PerformanceBudget {
  maxBundleSize: number; // in KB
  maxImageSize: number; // in KB
  maxFontSize: number; // in KB
  maxCSSSize: number; // in KB
  maxJSSize: number; // in KB
  maxLCP: number; // in ms
  maxFID: number; // in ms
  maxCLS: number; // score
}

export const DEFAULT_PERFORMANCE_BUDGET: PerformanceBudget = {
  maxBundleSize: 500, // 500KB total bundle
  maxImageSize: 200, // 200KB per image
  maxFontSize: 100, // 100KB total fonts
  maxCSSSize: 50, // 50KB total CSS
  maxJSSize: 400, // 400KB total JS
  maxLCP: 2500, // 2.5s LCP
  maxFID: 100, // 100ms FID
  maxCLS: 0.1, // 0.1 CLS score
};

// Performance monitoring class
export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private budget: PerformanceBudget;
  private reportingEndpoint?: string;

  constructor(budget: PerformanceBudget = DEFAULT_PERFORMANCE_BUDGET, reportingEndpoint?: string) {
    this.budget = budget;
    this.reportingEndpoint = reportingEndpoint;
    this.initializeWebVitals();
  }

  private async initializeWebVitals() {
    // Only initialize on client-side
    if (typeof window === 'undefined') {return;}
    
    try {
      const vitals = await loadWebVitals();
      if (vitals) {
        // Track Core Web Vitals
        vitals.getCLS(this.handleMetric.bind(this));
        vitals.getFID(this.handleMetric.bind(this));
        vitals.getFCP(this.handleMetric.bind(this));
        vitals.getLCP(this.handleMetric.bind(this));
        vitals.getTTFB(this.handleMetric.bind(this));
      }
    } catch (error) {
      console.warn('Failed to initialize web vitals:', error);
    }
  }

  private handleMetric(metric: any) {
    const performanceMetric: PerformanceMetric = {
      name: metric.name,
      value: metric.value,
      rating: this.getRating(metric.name, metric.value),
      timestamp: Date.now(),
      id: metric.id,
      navigationType: metric.navigationType,
    };

    this.metrics.push(performanceMetric);
    this.reportMetric(performanceMetric);
    this.checkBudget(performanceMetric);
  }

  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = PERFORMANCE_THRESHOLDS[name as keyof typeof PERFORMANCE_THRESHOLDS];
    if (!thresholds) {return 'good';}

    if (value <= thresholds.good) {return 'good';}
    if (value <= thresholds.needsImprovement) {return 'needs-improvement';}
    return 'poor';
  }

  private async reportMetric(metric: PerformanceMetric) {
    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${metric.name}: ${metric.value}ms (${metric.rating})`);
    }

    // Send to analytics endpoint (only on client-side)
    if (this.reportingEndpoint && typeof window !== 'undefined') {
      try {
        await fetch(this.reportingEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            metric,
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: Date.now(),
          }),
        });
      } catch (error) {
        console.warn('Failed to report performance metric:', error);
      }
    }
  }

  private checkBudget(metric: PerformanceMetric) {
    let budgetExceeded = false;
    let budgetValue = 0;

    switch (metric.name) {
      case 'LCP':
        budgetValue = this.budget.maxLCP;
        budgetExceeded = metric.value > budgetValue;
        break;
      case 'FID':
        budgetValue = this.budget.maxFID;
        budgetExceeded = metric.value > budgetValue;
        break;
      case 'CLS':
        budgetValue = this.budget.maxCLS;
        budgetExceeded = metric.value > budgetValue;
        break;
    }

    if (budgetExceeded) {
      console.warn(
        `[Performance Budget] ${metric.name} exceeded budget: ${metric.value} > ${budgetValue}`
      );
      
      // Trigger alert or notification
      this.triggerBudgetAlert(metric, budgetValue);
    }
  }

  private triggerBudgetAlert(metric: PerformanceMetric, budgetValue: number) {
    // In production, this could trigger alerts to monitoring systems
    if (process.env.NODE_ENV === 'production') {
      // Send alert to monitoring service
      console.error(`Performance budget exceeded for ${metric.name}`);
    }
  }

  // Public methods
  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.name === name);
  }

  public getAverageMetric(name: string): number {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) {return 0;}
    return metrics.reduce((sum, metric) => sum + metric.value, 0) / metrics.length;
  }

  public getBudgetStatus(): { metric: string; current: number; budget: number; status: 'pass' | 'fail' }[] {
    return [
      {
        metric: 'LCP',
        current: this.getAverageMetric('LCP'),
        budget: this.budget.maxLCP,
        status: this.getAverageMetric('LCP') <= this.budget.maxLCP ? 'pass' : 'fail',
      },
      {
        metric: 'FID',
        current: this.getAverageMetric('FID'),
        budget: this.budget.maxFID,
        status: this.getAverageMetric('FID') <= this.budget.maxFID ? 'pass' : 'fail',
      },
      {
        metric: 'CLS',
        current: this.getAverageMetric('CLS'),
        budget: this.budget.maxCLS,
        status: this.getAverageMetric('CLS') <= this.budget.maxCLS ? 'pass' : 'fail',
      },
    ];
  }
}

// Resource loading optimization utilities
export class ResourceOptimizer {
  private static preloadedResources = new Set<string>();
  private static criticalResources = new Set<string>();

  // Preload critical resources
  static preloadResource(href: string, as: string, crossorigin?: string) {
    if (typeof window === 'undefined') {return;}
    if (this.preloadedResources.has(href)) {return;}

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (crossorigin) {link.crossOrigin = crossorigin;}

    document.head.appendChild(link);
    this.preloadedResources.add(href);
  }

  // Prefetch non-critical resources
  static prefetchResource(href: string) {
    if (typeof window === 'undefined') {return;}
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }

  // Mark resources as critical
  static markCritical(resource: string) {
    this.criticalResources.add(resource);
  }

  // Lazy load images with intersection observer
  static lazyLoadImages() {
    if (typeof window === 'undefined') {return;}
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.classList.remove('lazy');
              observer.unobserve(img);
            }
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  // Optimize font loading
  static optimizeFontLoading() {
    // Preload critical fonts
    const criticalFonts = [
      '/fonts/inter-var.woff2',
      '/fonts/poppins-var.woff2',
    ];

    criticalFonts.forEach(font => {
      this.preloadResource(font, 'font', 'anonymous');
    });
  }
}

// Bundle size analyzer
export class BundleAnalyzer {
  static async analyzeBundleSize(): Promise<{
    totalSize: number;
    chunks: { name: string; size: number }[];
    recommendations: string[];
  }> {
    const recommendations: string[] = [];
    
    // This would typically integrate with webpack-bundle-analyzer
    // For now, we'll provide a mock implementation
    const mockChunks = [
      { name: 'main', size: 250 },
      { name: 'vendors', size: 180 },
      { name: 'ui-components', size: 45 },
      { name: 'design-system', size: 35 },
      { name: 'utils', size: 25 },
    ];

    const totalSize = mockChunks.reduce((sum, chunk) => sum + chunk.size, 0);

    // Generate recommendations
    if (totalSize > DEFAULT_PERFORMANCE_BUDGET.maxBundleSize) {
      recommendations.push('Total bundle size exceeds budget. Consider code splitting.');
    }

    mockChunks.forEach(chunk => {
      if (chunk.size > 100) {
        recommendations.push(`${chunk.name} chunk is large (${chunk.size}KB). Consider splitting further.`);
      }
    });

    return {
      totalSize,
      chunks: mockChunks,
      recommendations,
    };
  }
}

// Initialize performance monitoring
export function initializePerformanceMonitoring(
  budget?: PerformanceBudget,
  reportingEndpoint?: string
): PerformanceMonitor {
  const monitor = new PerformanceMonitor(budget, reportingEndpoint);
  
  // Only initialize client-side features
  if (typeof window !== 'undefined') {
    // Initialize resource optimization
    ResourceOptimizer.optimizeFontLoading();
    
    // Set up lazy loading when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        ResourceOptimizer.lazyLoadImages();
      });
    } else {
      ResourceOptimizer.lazyLoadImages();
    }
  }

  return monitor;
}

// Export singleton instance (only initialize on client-side)
export const performanceMonitor = typeof window !== 'undefined' 
  ? initializePerformanceMonitoring() 
  : null;