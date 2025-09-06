#!/usr/bin/env node

/**
 * Performance benchmarking and regression testing script
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

class PerformanceBenchmark {
  constructor() {
    this.outputDir = path.join(process.cwd(), 'performance-reports');
    this.baselineFile = path.join(this.outputDir, 'baseline.json');
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async runLighthouseAudit(url = 'http://localhost:3000') {
    console.log(`🔍 Running Lighthouse audit on ${url}...`);

    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      
      // Set viewport for consistent testing
      await page.setViewport({ width: 1200, height: 800 });

      // Navigate to the page
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Run Lighthouse audit
      const lighthouse = require('lighthouse');
      const { lhr } = await lighthouse(url, {
        port: new URL(browser.wsEndpoint()).port,
        output: 'json',
        logLevel: 'info',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      });

      await browser.close();

      return this.processLighthouseResults(lhr);
    } catch (error) {
      console.error('❌ Lighthouse audit failed:', error.message);
      throw error;
    }
  }

  processLighthouseResults(lhr) {
    const metrics = {
      timestamp: new Date().toISOString(),
      url: lhr.finalUrl,
      scores: {
        performance: Math.round(lhr.categories.performance.score * 100),
        accessibility: Math.round(lhr.categories.accessibility.score * 100),
        bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
        seo: Math.round(lhr.categories.seo.score * 100),
      },
      metrics: {
        firstContentfulPaint: lhr.audits['first-contentful-paint'].numericValue,
        largestContentfulPaint: lhr.audits['largest-contentful-paint'].numericValue,
        firstInputDelay: lhr.audits['max-potential-fid']?.numericValue || 0,
        cumulativeLayoutShift: lhr.audits['cumulative-layout-shift'].numericValue,
        speedIndex: lhr.audits['speed-index'].numericValue,
        totalBlockingTime: lhr.audits['total-blocking-time'].numericValue,
      },
      opportunities: lhr.audits['unused-javascript']?.details?.items?.length || 0,
      diagnostics: {
        unusedJavaScript: lhr.audits['unused-javascript']?.numericValue || 0,
        unusedCSS: lhr.audits['unused-css-rules']?.numericValue || 0,
        renderBlockingResources: lhr.audits['render-blocking-resources']?.details?.items?.length || 0,
      }
    };

    return metrics;
  }

  async runCustomBenchmarks(url = 'http://localhost:3000') {
    console.log('🚀 Running custom performance benchmarks...');

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    const benchmarks = {
      timestamp: new Date().toISOString(),
      pageLoad: await this.benchmarkPageLoad(page, url),
      interactivity: await this.benchmarkInteractivity(page, url),
      memoryUsage: await this.benchmarkMemoryUsage(page, url),
    };

    await browser.close();
    return benchmarks;
  }

  async benchmarkPageLoad(page, url) {
    const startTime = Date.now();
    
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    const loadTime = Date.now() - startTime;
    
    // Get performance metrics from the page
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        loadComplete: navigation.loadEventEnd - navigation.navigationStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      };
    });

    return {
      totalLoadTime: loadTime,
      ...metrics
    };
  }

  async benchmarkInteractivity(page, url) {
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Test button click responsiveness
    const buttonClickTime = await page.evaluate(() => {
      return new Promise((resolve) => {
        const button = document.querySelector('button');
        if (!button) {
          resolve(0);
          return;
        }

        const startTime = performance.now();
        button.addEventListener('click', () => {
          const endTime = performance.now();
          resolve(endTime - startTime);
        }, { once: true });

        button.click();
      });
    });

    // Test scroll performance
    const scrollPerformance = await page.evaluate(() => {
      return new Promise((resolve) => {
        let frameCount = 0;
        const startTime = performance.now();
        
        const measureFrames = () => {
          frameCount++;
          if (frameCount < 60) {
            requestAnimationFrame(measureFrames);
          } else {
            const endTime = performance.now();
            const fps = 60000 / (endTime - startTime);
            resolve(fps);
          }
        };

        // Start scrolling
        window.scrollTo(0, 1000);
        requestAnimationFrame(measureFrames);
      });
    });

    return {
      buttonResponseTime: buttonClickTime,
      scrollFPS: scrollPerformance,
    };
  }

  async benchmarkMemoryUsage(page, url) {
    await page.goto(url, { waitUntil: 'networkidle2' });

    const memoryInfo = await page.evaluate(() => {
      if ('memory' in performance) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        };
      }
      return null;
    });

    return memoryInfo;
  }

  async compareWithBaseline(currentResults) {
    if (!fs.existsSync(this.baselineFile)) {
      console.log('ℹ️  No baseline found. Setting current results as baseline.');
      fs.writeFileSync(this.baselineFile, JSON.stringify(currentResults, null, 2));
      return null;
    }

    const baseline = JSON.parse(fs.readFileSync(this.baselineFile, 'utf8'));
    
    const comparison = {
      timestamp: new Date().toISOString(),
      regressions: [],
      improvements: [],
      summary: {
        performanceScore: {
          current: currentResults.lighthouse?.scores?.performance || 0,
          baseline: baseline.lighthouse?.scores?.performance || 0,
          change: (currentResults.lighthouse?.scores?.performance || 0) - (baseline.lighthouse?.scores?.performance || 0)
        }
      }
    };

    // Compare Lighthouse scores
    if (currentResults.lighthouse && baseline.lighthouse) {
      Object.keys(currentResults.lighthouse.scores).forEach(category => {
        const current = currentResults.lighthouse.scores[category];
        const baselineScore = baseline.lighthouse.scores[category];
        const change = current - baselineScore;

        if (change < -5) { // 5 point regression threshold
          comparison.regressions.push({
            type: 'lighthouse-score',
            category,
            current,
            baseline: baselineScore,
            change
          });
        } else if (change > 5) {
          comparison.improvements.push({
            type: 'lighthouse-score',
            category,
            current,
            baseline: baselineScore,
            change
          });
        }
      });

      // Compare Core Web Vitals
      const vitals = ['firstContentfulPaint', 'largestContentfulPaint', 'cumulativeLayoutShift'];
      vitals.forEach(vital => {
        const current = currentResults.lighthouse.metrics[vital];
        const baselineValue = baseline.lighthouse.metrics[vital];
        const changePercent = ((current - baselineValue) / baselineValue) * 100;

        if (changePercent > 10) { // 10% regression threshold
          comparison.regressions.push({
            type: 'core-web-vital',
            metric: vital,
            current,
            baseline: baselineValue,
            changePercent: Math.round(changePercent)
          });
        } else if (changePercent < -10) {
          comparison.improvements.push({
            type: 'core-web-vital',
            metric: vital,
            current,
            baseline: baselineValue,
            changePercent: Math.round(changePercent)
          });
        }
      });
    }

    return comparison;
  }

  generateReport(results, comparison) {
    const reportPath = path.join(this.outputDir, `performance-report-${Date.now()}.json`);
    const report = {
      results,
      comparison,
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate human-readable report
    this.generateHumanReadableReport(report);

    console.log(`📊 Performance report saved to: ${reportPath}`);
    return reportPath;
  }

  generateHumanReadableReport(report) {
    let output = `# Performance Benchmark Report\n\n`;
    output += `**Generated:** ${report.timestamp}\n\n`;

    if (report.results.lighthouse) {
      output += `## Lighthouse Scores\n\n`;
      Object.entries(report.results.lighthouse.scores).forEach(([category, score]) => {
        const emoji = score >= 90 ? '🟢' : score >= 50 ? '🟡' : '🔴';
        output += `- **${category}**: ${score}/100 ${emoji}\n`;
      });

      output += `\n## Core Web Vitals\n\n`;
      const metrics = report.results.lighthouse.metrics;
      output += `- **First Contentful Paint**: ${Math.round(metrics.firstContentfulPaint)}ms\n`;
      output += `- **Largest Contentful Paint**: ${Math.round(metrics.largestContentfulPaint)}ms\n`;
      output += `- **Cumulative Layout Shift**: ${metrics.cumulativeLayoutShift.toFixed(3)}\n`;
      output += `- **Total Blocking Time**: ${Math.round(metrics.totalBlockingTime)}ms\n`;
    }

    if (report.comparison) {
      output += `\n## Comparison with Baseline\n\n`;
      
      if (report.comparison.regressions.length > 0) {
        output += `### ⚠️ Regressions Detected\n\n`;
        report.comparison.regressions.forEach(regression => {
          output += `- **${regression.type}** (${regression.category || regression.metric}): `;
          output += `${regression.change || regression.changePercent}${regression.changePercent ? '%' : ''} worse\n`;
        });
      }

      if (report.comparison.improvements.length > 0) {
        output += `\n### ✅ Improvements\n\n`;
        report.comparison.improvements.forEach(improvement => {
          output += `- **${improvement.type}** (${improvement.category || improvement.metric}): `;
          output += `${Math.abs(improvement.change || improvement.changePercent)}${improvement.changePercent ? '%' : ''} better\n`;
        });
      }

      if (report.comparison.regressions.length === 0 && report.comparison.improvements.length === 0) {
        output += `✅ No significant changes detected\n`;
      }
    }

    const readableReportPath = path.join(this.outputDir, 'latest-report.md');
    fs.writeFileSync(readableReportPath, output);
  }
}

// CLI interface
async function main() {
  const benchmark = new PerformanceBenchmark();
  const command = process.argv[2];
  const url = process.argv[3] || 'http://localhost:3000';

  try {
    switch (command) {
      case 'lighthouse':
        const lighthouseResults = await benchmark.runLighthouseAudit(url);
        console.log('Lighthouse Results:', lighthouseResults);
        break;
        
      case 'custom':
        const customResults = await benchmark.runCustomBenchmarks(url);
        console.log('Custom Benchmark Results:', customResults);
        break;
        
      case 'full':
        console.log('🚀 Running full performance benchmark suite...');
        const results = {
          lighthouse: await benchmark.runLighthouseAudit(url),
          custom: await benchmark.runCustomBenchmarks(url)
        };
        
        const comparison = await benchmark.compareWithBaseline(results);
        const reportPath = benchmark.generateReport(results, comparison);
        
        if (comparison && comparison.regressions.length > 0) {
          console.log('⚠️  Performance regressions detected!');
          process.exit(1);
        } else {
          console.log('✅ Performance benchmarks passed');
        }
        break;
        
      case 'baseline':
        const baselineResults = {
          lighthouse: await benchmark.runLighthouseAudit(url),
          custom: await benchmark.runCustomBenchmarks(url)
        };
        fs.writeFileSync(benchmark.baselineFile, JSON.stringify(baselineResults, null, 2));
        console.log('✅ Performance baseline updated');
        break;
        
      default:
        console.log('Usage: node scripts/performance-benchmark.js [lighthouse|custom|full|baseline] [url]');
        console.log('  lighthouse - Run Lighthouse audit only');
        console.log('  custom     - Run custom benchmarks only');
        console.log('  full       - Run complete benchmark suite');
        console.log('  baseline   - Set current performance as baseline');
    }
  } catch (error) {
    console.error('❌ Performance benchmark failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { PerformanceBenchmark };