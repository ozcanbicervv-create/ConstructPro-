/**
 * Performance testing utilities for development and testing
 */

import { performanceMonitor, measureAsync, measureSync } from './performance-monitor';

export interface PerformanceTestResult {
  name: string;
  duration: number;
  iterations: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  standardDeviation: number;
}

export class PerformanceTester {
  private results: PerformanceTestResult[] = [];

  /**
   * Run a performance test with multiple iterations
   */
  async runTest<T>(
    name: string,
    testFn: () => Promise<T> | T,
    iterations: number = 10
  ): Promise<PerformanceTestResult> {
    const durations: number[] = [];
    
    console.log(`🧪 Running performance test: ${name} (${iterations} iterations)`);
    
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      try {
        if (testFn.constructor.name === 'AsyncFunction') {
          await (testFn as () => Promise<T>)();
        } else {
          (testFn as () => T)();
        }
      } catch (error) {
        console.warn(`Test iteration ${i + 1} failed:`, error);
        continue;
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      durations.push(duration);
      
      // Small delay between iterations to avoid overwhelming the system
      if (i < iterations - 1) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    if (durations.length === 0) {
      throw new Error(`All test iterations failed for: ${name}`);
    }

    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    const averageDuration = totalDuration / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    
    // Calculate standard deviation
    const variance = durations.reduce((sum, d) => sum + Math.pow(d - averageDuration, 2), 0) / durations.length;
    const standardDeviation = Math.sqrt(variance);

    const result: PerformanceTestResult = {
      name,
      duration: totalDuration,
      iterations: durations.length,
      averageDuration,
      minDuration,
      maxDuration,
      standardDeviation,
    };

    this.results.push(result);
    
    console.log(`✅ Test completed: ${name}`);
    console.log(`   Average: ${averageDuration.toFixed(2)}ms`);
    console.log(`   Min: ${minDuration.toFixed(2)}ms, Max: ${maxDuration.toFixed(2)}ms`);
    console.log(`   Std Dev: ${standardDeviation.toFixed(2)}ms`);
    
    return result;
  }

  /**
   * Run a benchmark comparing multiple functions
   */
  async runBenchmark<T>(
    name: string,
    tests: Record<string, () => Promise<T> | T>,
    iterations: number = 100
  ): Promise<Record<string, PerformanceTestResult>> {
    console.log(`🏁 Running benchmark: ${name}`);
    
    const results: Record<string, PerformanceTestResult> = {};
    
    for (const [testName, testFn] of Object.entries(tests)) {
      results[testName] = await this.runTest(`${name} - ${testName}`, testFn, iterations);
    }
    
    // Sort results by average duration
    const sortedResults = Object.entries(results)
      .sort(([, a], [, b]) => a.averageDuration - b.averageDuration);
    
    console.log(`\n📊 Benchmark Results for: ${name}`);
    console.log('─'.repeat(60));
    
    sortedResults.forEach(([testName, result], index) => {
      const fastest = sortedResults[0][1];
      const ratio = result.averageDuration / fastest.averageDuration;
      const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
      
      console.log(`${emoji} ${testName.padEnd(20)} ${result.averageDuration.toFixed(2)}ms (${ratio.toFixed(2)}x)`);
    });
    
    return results;
  }

  /**
   * Test component rendering performance
   */
  async testComponentRender(
    componentName: string,
    renderFn: () => void,
    iterations: number = 50
  ): Promise<PerformanceTestResult> {
    return this.runTest(`Component Render: ${componentName}`, renderFn, iterations);
  }

  /**
   * Test API call performance
   */
  async testApiCall(
    endpoint: string,
    requestFn: () => Promise<any>,
    iterations: number = 10
  ): Promise<PerformanceTestResult> {
    return this.runTest(`API Call: ${endpoint}`, requestFn, iterations);
  }

  /**
   * Test database query performance
   */
  async testDatabaseQuery(
    queryName: string,
    queryFn: () => Promise<any>,
    iterations: number = 20
  ): Promise<PerformanceTestResult> {
    return this.runTest(`Database Query: ${queryName}`, queryFn, iterations);
  }

  /**
   * Get all test results
   */
  getResults(): PerformanceTestResult[] {
    return [...this.results];
  }

  /**
   * Clear all test results
   */
  clearResults(): void {
    this.results = [];
  }

  /**
   * Export results to JSON
   */
  exportResults(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
      results: this.results,
    }, null, 2);
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    if (this.results.length === 0) {
      return 'No performance test results available.';
    }

    let report = '# Performance Test Report\n\n';
    report += `**Generated:** ${new Date().toISOString()}\n`;
    report += `**Total Tests:** ${this.results.length}\n\n`;

    // Group results by category
    const categories: Record<string, PerformanceTestResult[]> = {};
    
    this.results.forEach(result => {
      const category = result.name.split(':')[0] || 'General';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(result);
    });

    Object.entries(categories).forEach(([category, results]) => {
      report += `## ${category}\n\n`;
      report += '| Test | Avg (ms) | Min (ms) | Max (ms) | Std Dev | Iterations |\n';
      report += '|------|----------|----------|----------|---------|------------|\n';
      
      results.forEach(result => {
        const testName = result.name.replace(`${category}: `, '').replace(`${category} - `, '');
        report += `| ${testName} | ${result.averageDuration.toFixed(2)} | ${result.minDuration.toFixed(2)} | ${result.maxDuration.toFixed(2)} | ${result.standardDeviation.toFixed(2)} | ${result.iterations} |\n`;
      });
      
      report += '\n';
    });

    // Performance insights
    report += '## Performance Insights\n\n';
    
    const slowTests = this.results.filter(r => r.averageDuration > 100);
    if (slowTests.length > 0) {
      report += '### ⚠️ Slow Operations (>100ms)\n\n';
      slowTests.forEach(test => {
        report += `- **${test.name}**: ${test.averageDuration.toFixed(2)}ms average\n`;
      });
      report += '\n';
    }

    const inconsistentTests = this.results.filter(r => r.standardDeviation > r.averageDuration * 0.5);
    if (inconsistentTests.length > 0) {
      report += '### 📊 Inconsistent Performance\n\n';
      inconsistentTests.forEach(test => {
        report += `- **${test.name}**: High variance (σ=${test.standardDeviation.toFixed(2)}ms)\n`;
      });
      report += '\n';
    }

    const fastTests = this.results.filter(r => r.averageDuration < 10);
    if (fastTests.length > 0) {
      report += '### ✅ Fast Operations (<10ms)\n\n';
      fastTests.forEach(test => {
        report += `- **${test.name}**: ${test.averageDuration.toFixed(2)}ms average\n`;
      });
    }

    return report;
  }
}

// Singleton instance for global use
export const performanceTester = new PerformanceTester();

// Utility functions for common performance tests
export const testFunction = async <T>(
  name: string,
  fn: () => Promise<T> | T,
  iterations: number = 10
): Promise<PerformanceTestResult> => {
  return performanceTester.runTest(name, fn, iterations);
};

export const benchmarkFunctions = async <T>(
  name: string,
  functions: Record<string, () => Promise<T> | T>,
  iterations: number = 100
): Promise<Record<string, PerformanceTestResult>> => {
  return performanceTester.runBenchmark(name, functions, iterations);
};

// React component testing helpers
export const withPerformanceTest = <P extends object>(
  Component: React.ComponentType<P>,
  testName?: string
) => {
  const WrappedComponent = (props: P) => {
    const endTiming = performanceMonitor.startTiming(
      testName || `component_${Component.displayName || Component.name}`
    );
    
    React.useEffect(() => {
      return endTiming;
    });
    
    return React.createElement(Component, props);
  };
  
  WrappedComponent.displayName = `withPerformanceTest(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};