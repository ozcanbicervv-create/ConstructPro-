/**
 * Analytics and error tracking system
 * Implements comprehensive user behavior tracking and error monitoring
 */

// Analytics event types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
  page: string;
  userAgent: string;
}

// Error tracking types
export interface ErrorEvent {
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  timestamp: number;
  userId?: string;
  sessionId: string;
  page: string;
  userAgent: string;
  additionalData?: Record<string, any>;
}

// Performance tracking types
export interface PerformanceEvent {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  userId?: string;
  sessionId: string;
  page: string;
  userAgent: string;
  navigationType?: string;
}

// User session data
export interface UserSession {
  id: string;
  userId?: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  events: AnalyticsEvent[];
  errors: ErrorEvent[];
  performance: PerformanceEvent[];
  device: {
    type: 'mobile' | 'tablet' | 'desktop';
    os: string;
    browser: string;
    viewport: { width: number; height: number };
  };
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
}

// Analytics configuration
export interface AnalyticsConfig {
  apiEndpoint?: string;
  enableErrorTracking: boolean;
  enablePerformanceTracking: boolean;
  enableUserTracking: boolean;
  sampleRate: number; // 0-1, percentage of sessions to track
  enableDebugMode: boolean;
  enableOfflineQueue: boolean;
  maxQueueSize: number;
}

// Default analytics configuration
export const DEFAULT_ANALYTICS_CONFIG: AnalyticsConfig = {
  enableErrorTracking: true,
  enablePerformanceTracking: true,
  enableUserTracking: true,
  sampleRate: 1.0, // Track 100% of sessions in development
  enableDebugMode: process.env.NODE_ENV === 'development',
  enableOfflineQueue: true,
  maxQueueSize: 100,
};

// Analytics and error tracking class
export class Analytics {
  private config: AnalyticsConfig;
  private session: UserSession;
  private eventQueue: (AnalyticsEvent | ErrorEvent | PerformanceEvent)[] = [];
  private isOnline = true;
  private flushTimer?: NodeJS.Timeout;

  constructor(config: AnalyticsConfig = DEFAULT_ANALYTICS_CONFIG) {
    this.config = config;
    this.session = this.createSession();
    this.initialize();
  }

  private initialize(): void {
    // Set up error tracking
    if (this.config.enableErrorTracking) {
      this.setupErrorTracking();
    }

    // Set up performance tracking
    if (this.config.enablePerformanceTracking) {
      this.setupPerformanceTracking();
    }

    // Set up user interaction tracking
    if (this.config.enableUserTracking) {
      this.setupUserTracking();
    }

    // Set up offline/online detection
    if (this.config.enableOfflineQueue) {
      this.setupOfflineDetection();
    }

    // Set up periodic flushing
    this.setupPeriodicFlush();

    // Track page view
    this.trackPageView();
  }

  private createSession(): UserSession {
    const sessionId = this.generateSessionId();
    const device = this.detectDevice();

    return {
      id: sessionId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 0,
      events: [],
      errors: [],
      performance: [],
      device,
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private detectDevice(): UserSession['device'] {
    const userAgent = navigator.userAgent;
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Simple device detection
    let type: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (viewport.width <= 768) {
      type = 'mobile';
    } else if (viewport.width <= 1024) {
      type = 'tablet';
    }

    // Simple OS detection
    let os = 'Unknown';
    if (userAgent.includes('Windows')) {os = 'Windows';}
    else if (userAgent.includes('Mac')) {os = 'macOS';}
    else if (userAgent.includes('Linux')) {os = 'Linux';}
    else if (userAgent.includes('Android')) {os = 'Android';}
    else if (userAgent.includes('iOS')) {os = 'iOS';}

    // Simple browser detection
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) {browser = 'Chrome';}
    else if (userAgent.includes('Firefox')) {browser = 'Firefox';}
    else if (userAgent.includes('Safari')) {browser = 'Safari';}
    else if (userAgent.includes('Edge')) {browser = 'Edge';}

    return { type, os, browser, viewport };
  }

  private setupErrorTracking(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: Date.now(),
        sessionId: this.session.id,
        page: window.location.pathname,
        userAgent: navigator.userAgent,
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        timestamp: Date.now(),
        sessionId: this.session.id,
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        additionalData: { type: 'unhandledrejection' },
      });
    });

    // Console error tracking
    const originalConsoleError = console.error;
    console.error = (...args) => {
      this.trackError({
        message: args.join(' '),
        timestamp: Date.now(),
        sessionId: this.session.id,
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        additionalData: { type: 'console.error', args },
      });
      originalConsoleError.apply(console, args);
    };
  }

  private setupPerformanceTracking(): void {
    // Import web-vitals dynamically to avoid SSR issues
    if (typeof window !== 'undefined') {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(this.handlePerformanceMetric.bind(this));
        getFID(this.handlePerformanceMetric.bind(this));
        getFCP(this.handlePerformanceMetric.bind(this));
        getLCP(this.handlePerformanceMetric.bind(this));
        getTTFB(this.handlePerformanceMetric.bind(this));
      });
    }

    // Track navigation timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.trackPerformance({
            name: 'page-load-time',
            value: navigation.loadEventEnd - navigation.fetchStart,
            rating: 'good', // Would calculate based on thresholds
            timestamp: Date.now(),
            sessionId: this.session.id,
            page: window.location.pathname,
            userAgent: navigator.userAgent,
            navigationType: navigation.type,
          });
        }
      }, 0);
    });
  }

  private handlePerformanceMetric(metric: any): void {
    const rating = this.getPerformanceRating(metric.name, metric.value);
    
    this.trackPerformance({
      name: metric.name,
      value: metric.value,
      rating,
      timestamp: Date.now(),
      sessionId: this.session.id,
      page: window.location.pathname,
      userAgent: navigator.userAgent,
      navigationType: metric.navigationType,
    });
  }

  private getPerformanceRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, { good: number; needsImprovement: number }> = {
      LCP: { good: 2500, needsImprovement: 4000 },
      FID: { good: 100, needsImprovement: 300 },
      CLS: { good: 0.1, needsImprovement: 0.25 },
      FCP: { good: 1800, needsImprovement: 3000 },
      TTFB: { good: 800, needsImprovement: 1800 },
    };

    const threshold = thresholds[name];
    if (!threshold) {return 'good';}

    if (value <= threshold.good) {return 'good';}
    if (value <= threshold.needsImprovement) {return 'needs-improvement';}
    return 'poor';
  }

  private setupUserTracking(): void {
    // Track clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const text = target.textContent?.trim().substring(0, 100);
      
      this.trackEvent('click', {
        element: tagName,
        text,
        x: event.clientX,
        y: event.clientY,
      });
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      const formId = form.id || form.className || 'unknown';
      
      this.trackEvent('form_submit', {
        formId,
        action: form.action,
        method: form.method,
      });
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.trackEvent('visibility_change', {
        hidden: document.hidden,
      });
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', () => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        
        // Track milestone scroll depths
        if ([25, 50, 75, 90].includes(scrollDepth)) {
          this.trackEvent('scroll_depth', {
            depth: scrollDepth,
          });
        }
      }
    });
  }

  private setupOfflineDetection(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private setupPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      if (this.isOnline && this.eventQueue.length > 0) {
        this.flushQueue();
      }
    }, 30000); // Flush every 30 seconds
  }

  // Public methods
  public trackEvent(name: string, properties?: Record<string, any>): void {
    if (!this.shouldTrack()) {return;}

    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: Date.now(),
      sessionId: this.session.id,
      page: window.location.pathname,
      userAgent: navigator.userAgent,
    };

    this.session.events.push(event);
    this.addToQueue(event);
    this.updateLastActivity();

    if (this.config.enableDebugMode) {
      console.log('Analytics Event:', event);
    }
  }

  public trackError(error: Omit<ErrorEvent, 'sessionId' | 'page' | 'userAgent'>): void {
    if (!this.shouldTrack()) {return;}

    const errorEvent: ErrorEvent = {
      ...error,
      sessionId: this.session.id,
      page: window.location.pathname,
      userAgent: navigator.userAgent,
    };

    this.session.errors.push(errorEvent);
    this.addToQueue(errorEvent);
    this.updateLastActivity();

    if (this.config.enableDebugMode) {
      console.log('Error Event:', errorEvent);
    }
  }

  public trackPerformance(performance: Omit<PerformanceEvent, 'sessionId' | 'page' | 'userAgent'>): void {
    if (!this.shouldTrack()) {return;}

    const performanceEvent: PerformanceEvent = {
      ...performance,
      sessionId: this.session.id,
      page: window.location.pathname,
      userAgent: navigator.userAgent,
    };

    this.session.performance.push(performanceEvent);
    this.addToQueue(performanceEvent);
    this.updateLastActivity();

    if (this.config.enableDebugMode) {
      console.log('Performance Event:', performanceEvent);
    }
  }

  public trackPageView(page?: string): void {
    const currentPage = page || window.location.pathname;
    
    this.session.pageViews++;
    this.trackEvent('page_view', {
      page: currentPage,
      referrer: document.referrer,
      title: document.title,
    });
  }

  public setUserId(userId: string): void {
    this.session.userId = userId;
  }

  public getSession(): UserSession {
    return { ...this.session };
  }

  public flush(): Promise<void> {
    return this.flushQueue();
  }

  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushQueue();
  }

  // Private helper methods
  private shouldTrack(): boolean {
    return Math.random() < this.config.sampleRate;
  }

  private addToQueue(event: AnalyticsEvent | ErrorEvent | PerformanceEvent): void {
    this.eventQueue.push(event);
    
    // Limit queue size
    if (this.eventQueue.length > this.config.maxQueueSize) {
      this.eventQueue = this.eventQueue.slice(-this.config.maxQueueSize);
    }

    // Flush immediately if online and queue is getting full
    if (this.isOnline && this.eventQueue.length >= 10) {
      this.flushQueue();
    }
  }

  private updateLastActivity(): void {
    this.session.lastActivity = Date.now();
  }

  private async flushQueue(): Promise<void> {
    if (this.eventQueue.length === 0 || !this.config.apiEndpoint) {return;}

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session: this.session,
          events,
          timestamp: Date.now(),
        }),
      });

      if (this.config.enableDebugMode) {
        console.log(`Flushed ${events.length} events to analytics`);
      }
    } catch (error) {
      // Re-add events to queue if sending failed
      this.eventQueue.unshift(...events);
      
      if (this.config.enableDebugMode) {
        console.error('Failed to send analytics events:', error);
      }
    }
  }
}

// Global analytics instance
let analyticsInstance: Analytics | null = null;

// Initialize analytics
export function initializeAnalytics(config?: Partial<AnalyticsConfig>): Analytics {
  if (typeof window === 'undefined') {
    // Return mock instance for SSR
    return {} as Analytics;
  }

  if (!analyticsInstance) {
    const finalConfig = { ...DEFAULT_ANALYTICS_CONFIG, ...config };
    analyticsInstance = new Analytics(finalConfig);
  }

  return analyticsInstance;
}

// Convenience functions
export function trackEvent(name: string, properties?: Record<string, any>): void {
  analyticsInstance?.trackEvent(name, properties);
}

export function trackError(error: Error, additionalData?: Record<string, any>): void {
  analyticsInstance?.trackError({
    message: error.message,
    stack: error.stack,
    timestamp: Date.now(),
    additionalData,
  });
}

export function trackPageView(page?: string): void {
  analyticsInstance?.trackPageView(page);
}

export function setUserId(userId: string): void {
  analyticsInstance?.setUserId(userId);
}

// React hook for analytics
export function useAnalytics() {
  return {
    trackEvent,
    trackError,
    trackPageView,
    setUserId,
    analytics: analyticsInstance,
  };
}

// Export the analytics instance
export { analyticsInstance as analytics };