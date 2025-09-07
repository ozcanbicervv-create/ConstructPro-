/**
 * Performance budgets and automated alerting system
 * Implements performance thresholds and real-time monitoring
 */

// Performance budget types
export interface PerformanceBudget {
  name: string;
  description: string;
  thresholds: {
    good: number;
    warning: number;
    critical: number;
  };
  unit: string;
  category: 'loading' | 'interactivity' | 'visual-stability' | 'resource' | 'custom';
}

// Alert configuration
export interface AlertConfig {
  enabled: boolean;
  channels: ('console' | 'notification' | 'webhook' | 'email')[];
  webhookUrl?: string;
  emailRecipients?: string[];
  cooldownPeriod: number; // Minutes between alerts for same metric
}

// Performance violation
export interface PerformanceViolation {
  budgetName: string;
  currentValue: number;
  threshold: number;
  severity: 'warning' | 'critical';
  timestamp: number;
  page: string;
  userAgent: string;
  additionalData?: Record<string, any>;
}

// Default performance budgets for construction industry
export const DEFAULT_PERFORMANCE_BUDGETS: PerformanceBudget[] = [
  // Core Web Vitals
  {
    name: 'LCP',
    description: 'Largest Contentful Paint - Critical for project dashboard loading',
    thresholds: { good: 2500, warning: 3500, critical: 4000 },
    unit: 'ms',
    category: 'loading',
  },
  {
    name: 'FID',
    description: 'First Input Delay - Important for mobile construction site usage',
    thresholds: { good: 100, warning: 200, critical: 300 },
    unit: 'ms',
    category: 'interactivity',
  },
  {
    name: 'CLS',
    description: 'Cumulative Layout Shift - Critical for data accuracy',
    thresholds: { good: 0.1, warning: 0.2, critical: 0.25 },
    unit: 'score',
    category: 'visual-stability',
  },
  {
    name: 'FCP',
    description: 'First Contentful Paint - User perception of loading speed',
    thresholds: { good: 1800, warning: 2500, critical: 3000 },
    unit: 'ms',
    category: 'loading',
  },
  {
    name: 'TTFB',
    description: 'Time to First Byte - Server response performance',
    thresholds: { good: 800, warning: 1200, critical: 1800 },
    unit: 'ms',
    category: 'loading',
  },

  // Resource budgets
  {
    name: 'total-bundle-size',
    description: 'Total JavaScript bundle size',
    thresholds: { good: 500, warning: 750, critical: 1000 },
    unit: 'KB',
    category: 'resource',
  },
  {
    name: 'main-thread-blocking',
    description: 'Main thread blocking time',
    thresholds: { good: 200, warning: 400, critical: 600 },
    unit: 'ms',
    category: 'interactivity',
  },
  {
    name: 'image-size',
    description: 'Total image payload size',
    thresholds: { good: 1000, warning: 1500, critical: 2000 },
    unit: 'KB',
    category: 'resource',
  },

  // Construction-specific budgets
  {
    name: 'project-dashboard-load',
    description: 'Project dashboard complete load time',
    thresholds: { good: 3000, warning: 5000, critical: 7000 },
    unit: 'ms',
    category: 'custom',
  },
  {
    name: 'material-search-response',
    description: 'Material search response time',
    thresholds: { good: 500, warning: 1000, critical: 2000 },
    unit: 'ms',
    category: 'custom',
  },
  {
    name: 'document-upload-time',
    description: 'Document upload processing time',
    thresholds: { good: 2000, warning: 5000, critical: 10000 },
    unit: 'ms',
    category: 'custom',
  },
];

// Performance budget monitor
export class PerformanceBudgetMonitor {
  private budgets: Map<string, PerformanceBudget> = new Map();
  private alertConfig: AlertConfig;
  private violations: PerformanceViolation[] = [];
  private alertCooldowns: Map<string, number> = new Map();
  private observers: ((violation: PerformanceViolation) => void)[] = [];

  constructor(
    budgets: PerformanceBudget[] = DEFAULT_PERFORMANCE_BUDGETS,
    alertConfig: AlertConfig = {
      enabled: true,
      channels: ['console', 'notification'],
      cooldownPeriod: 5, // 5 minutes
    }
  ) {
    budgets.forEach(budget => {
      this.budgets.set(budget.name, budget);
    });
    this.alertConfig = alertConfig;
  }

  // Add or update a performance budget
  public setBudget(budget: PerformanceBudget): void {
    this.budgets.set(budget.name, budget);
  }

  // Remove a performance budget
  public removeBudget(name: string): void {
    this.budgets.delete(name);
  }

  // Check a metric against its budget
  public checkMetric(name: string, value: number, additionalData?: Record<string, any>): void {
    const budget = this.budgets.get(name);
    if (!budget) return;

    const violation = this.evaluateMetric(budget, value, additionalData);
    if (violation) {
      this.handleViolation(violation);
    }
  }

  // Evaluate if a metric violates its budget
  private evaluateMetric(
    budget: PerformanceBudget,
    value: number,
    additionalData?: Record<string, any>
  ): PerformanceViolation | null {
    let severity: 'warning' | 'critical' | null = null;
    let threshold: number;

    if (value >= budget.thresholds.critical) {
      severity = 'critical';
      threshold = budget.thresholds.critical;
    } else if (value >= budget.thresholds.warning) {
      severity = 'warning';
      threshold = budget.thresholds.warning;
    }

    if (!severity) return null;

    return {
      budgetName: budget.name,
      currentValue: value,
      threshold,
      severity,
      timestamp: Date.now(),
      page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      additionalData,
    };
  }

  // Handle a performance violation
  private handleViolation(violation: PerformanceViolation): void {
    // Check cooldown period
    const cooldownKey = `${violation.budgetName}-${violation.severity}`;
    const lastAlert = this.alertCooldowns.get(cooldownKey) || 0;
    const cooldownPeriod = this.alertConfig.cooldownPeriod * 60 * 1000; // Convert to ms

    if (Date.now() - lastAlert < cooldownPeriod) {
      return; // Still in cooldown period
    }

    // Record violation
    this.violations.push(violation);
    this.alertCooldowns.set(cooldownKey, Date.now());

    // Trigger alerts
    if (this.alertConfig.enabled) {
      this.triggerAlerts(violation);
    }

    // Notify observers
    this.observers.forEach(observer => observer(violation));
  }

  // Trigger alerts through configured channels
  private async triggerAlerts(violation: PerformanceViolation): Promise<void> {
    const budget = this.budgets.get(violation.budgetName);
    if (!budget) return;

    const message = this.formatAlertMessage(violation, budget);

    for (const channel of this.alertConfig.channels) {
      try {
        switch (channel) {
          case 'console':
            this.sendConsoleAlert(violation, message);
            break;
          case 'notification':
            await this.sendBrowserNotification(violation, message);
            break;
          case 'webhook':
            await this.sendWebhookAlert(violation, message);
            break;
          case 'email':
            await this.sendEmailAlert(violation, message);
            break;
        }
      } catch (error) {
        console.error(`Failed to send alert via ${channel}:`, error);
      }
    }
  }

  // Format alert message
  private formatAlertMessage(violation: PerformanceViolation, budget: PerformanceBudget): string {
    const percentage = ((violation.currentValue / violation.threshold) * 100).toFixed(1);
    return `🚨 Performance Budget Violation: ${budget.name} (${budget.description}) exceeded ${violation.severity} threshold. Current: ${violation.currentValue}${budget.unit} (${percentage}% of threshold)`;
  }

  // Send console alert
  private sendConsoleAlert(violation: PerformanceViolation, message: string): void {
    const style = violation.severity === 'critical' 
      ? 'color: red; font-weight: bold;'
      : 'color: orange; font-weight: bold;';
    
    console.warn(`%c${message}`, style);
    console.table({
      Budget: violation.budgetName,
      'Current Value': `${violation.currentValue}`,
      'Threshold': `${violation.threshold}`,
      'Severity': violation.severity,
      'Page': violation.page,
      'Timestamp': new Date(violation.timestamp).toISOString(),
    });
  }

  // Send browser notification
  private async sendBrowserNotification(violation: PerformanceViolation, message: string): Promise<void> {
    if (!('Notification' in window)) return;

    // Request permission if needed
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    if (Notification.permission === 'granted') {
      new Notification('Performance Budget Violation', {
        body: message,
        icon: violation.severity === 'critical' ? '🚨' : '⚠️',
        tag: `performance-${violation.budgetName}`,
      });
    }
  }

  // Send webhook alert
  private async sendWebhookAlert(violation: PerformanceViolation, message: string): Promise<void> {
    if (!this.alertConfig.webhookUrl) return;

    const payload = {
      type: 'performance_violation',
      violation,
      message,
      timestamp: Date.now(),
    };

    await fetch(this.alertConfig.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }

  // Send email alert
  private async sendEmailAlert(violation: PerformanceViolation, message: string): Promise<void> {
    if (!this.alertConfig.emailRecipients?.length) return;

    // This would integrate with your email service
    const emailPayload = {
      to: this.alertConfig.emailRecipients,
      subject: `Performance Alert: ${violation.budgetName} Budget Violation`,
      body: message,
      violation,
    };

    // Send to email service endpoint
    await fetch('/api/send-alert-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });
  }

  // Public methods
  public getBudgets(): PerformanceBudget[] {
    return Array.from(this.budgets.values());
  }

  public getBudget(name: string): PerformanceBudget | undefined {
    return this.budgets.get(name);
  }

  public getViolations(limit?: number): PerformanceViolation[] {
    const violations = [...this.violations].sort((a, b) => b.timestamp - a.timestamp);
    return limit ? violations.slice(0, limit) : violations;
  }

  public getViolationsByBudget(budgetName: string): PerformanceViolation[] {
    return this.violations.filter(v => v.budgetName === budgetName);
  }

  public clearViolations(): void {
    this.violations = [];
  }

  public subscribe(observer: (violation: PerformanceViolation) => void): () => void {
    this.observers.push(observer);
    return () => {
      const index = this.observers.indexOf(observer);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  public updateAlertConfig(config: Partial<AlertConfig>): void {
    this.alertConfig = { ...this.alertConfig, ...config };
  }

  // Generate performance report
  public generateReport(): {
    summary: {
      totalBudgets: number;
      totalViolations: number;
      criticalViolations: number;
      warningViolations: number;
    };
    budgetStatus: Array<{
      name: string;
      status: 'healthy' | 'warning' | 'critical';
      recentViolations: number;
    }>;
    recentViolations: PerformanceViolation[];
  } {
    const recentViolations = this.getViolations(10);
    const criticalViolations = this.violations.filter(v => v.severity === 'critical').length;
    const warningViolations = this.violations.filter(v => v.severity === 'warning').length;

    const budgetStatus = Array.from(this.budgets.values()).map(budget => {
      const violations = this.getViolationsByBudget(budget.name);
      const recentViolations = violations.filter(v => 
        Date.now() - v.timestamp < 24 * 60 * 60 * 1000 // Last 24 hours
      ).length;

      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (violations.some(v => v.severity === 'critical' && Date.now() - v.timestamp < 60 * 60 * 1000)) {
        status = 'critical';
      } else if (violations.some(v => v.severity === 'warning' && Date.now() - v.timestamp < 60 * 60 * 1000)) {
        status = 'warning';
      }

      return {
        name: budget.name,
        status,
        recentViolations,
      };
    });

    return {
      summary: {
        totalBudgets: this.budgets.size,
        totalViolations: this.violations.length,
        criticalViolations,
        warningViolations,
      },
      budgetStatus,
      recentViolations,
    };
  }
}

// Global performance budget monitor
let budgetMonitor: PerformanceBudgetMonitor | null = null;

// Initialize performance budget monitoring
export function initializePerformanceBudgets(
  budgets?: PerformanceBudget[],
  alertConfig?: AlertConfig
): PerformanceBudgetMonitor {
  if (!budgetMonitor) {
    budgetMonitor = new PerformanceBudgetMonitor(budgets, alertConfig);
  }
  return budgetMonitor;
}

// Convenience functions
export function checkPerformanceBudget(name: string, value: number, additionalData?: Record<string, any>): void {
  budgetMonitor?.checkMetric(name, value, additionalData);
}

export function getPerformanceBudgets(): PerformanceBudget[] {
  return budgetMonitor?.getBudgets() || [];
}

export function getPerformanceViolations(limit?: number): PerformanceViolation[] {
  return budgetMonitor?.getViolations(limit) || [];
}

// React hook for performance budgets
export function usePerformanceBudgets() {
  return {
    checkBudget: checkPerformanceBudget,
    getBudgets: getPerformanceBudgets,
    getViolations: getPerformanceViolations,
    monitor: budgetMonitor,
  };
}

// Export singleton instance and types
export {
  budgetMonitor,
  type PerformanceBudget,
  type AlertConfig,
  type PerformanceViolation,
};