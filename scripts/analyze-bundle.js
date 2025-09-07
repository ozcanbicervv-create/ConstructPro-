#!/usr/bin/env node

/**
 * Bundle analysis script for performance optimization
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class BundleAnalyzer {
  constructor() {
    this.outputDir = path.join(process.cwd(), 'bundle-analysis');
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async analyzeBundleSize() {
    console.log('🔍 Analyzing bundle size...');
    
    try {
      // Build the application first
      console.log('Building application...');
      execSync('npm run build', { stdio: 'inherit' });

      // Analyze the bundle
      const nextDir = path.join(process.cwd(), '.next');
      const buildManifest = path.join(nextDir, 'build-manifest.json');
      
      if (fs.existsSync(buildManifest)) {
        const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'));
        this.generateBundleReport(manifest);
      }

      // Generate detailed analysis with webpack-bundle-analyzer if available
      try {
        execSync('npx webpack-bundle-analyzer .next/static/chunks/*.js --mode static --report bundle-analysis/bundle-report.html', 
          { stdio: 'inherit' });
        console.log('📊 Detailed bundle analysis saved to bundle-analysis/bundle-report.html');
      } catch (error) {
        console.log('ℹ️  Install webpack-bundle-analyzer for detailed analysis: npm install --save-dev webpack-bundle-analyzer');
      }

    } catch (error) {
      console.error('❌ Bundle analysis failed:', error.message);
      process.exit(1);
    }
  }

  generateBundleReport(manifest) {
    const report = {
      timestamp: new Date().toISOString(),
      pages: {},
      totalSize: 0,
      recommendations: []
    };

    // Analyze each page
    Object.entries(manifest.pages).forEach(([page, files]) => {
      const pageSize = this.calculatePageSize(files);
      report.pages[page] = {
        files: files,
        totalSize: pageSize,
        sizeFormatted: this.formatBytes(pageSize)
      };
      report.totalSize += pageSize;
    });

    report.totalSizeFormatted = this.formatBytes(report.totalSize);
    report.recommendations = this.generateRecommendations(report);

    // Save report
    const reportPath = path.join(this.outputDir, 'bundle-analysis.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate human-readable report
    this.generateHumanReadableReport(report);

    console.log('📈 Bundle analysis complete!');
    console.log(`📁 Reports saved to: ${this.outputDir}`);
  }

  calculatePageSize(files) {
    let totalSize = 0;
    
    files.forEach(file => {
      const filePath = path.join(process.cwd(), '.next', file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
      }
    });

    return totalSize;
  }

  generateRecommendations(report) {
    const recommendations = [];
    const largePagesThreshold = 500 * 1024; // 500KB

    // Check for large pages
    Object.entries(report.pages).forEach(([page, data]) => {
      if (data.totalSize > largePagesThreshold) {
        recommendations.push({
          type: 'large-page',
          page: page,
          size: data.sizeFormatted,
          suggestion: 'Consider code splitting or lazy loading for this page'
        });
      }
    });

    // Check total bundle size
    if (report.totalSize > 2 * 1024 * 1024) { // 2MB
      recommendations.push({
        type: 'large-bundle',
        size: report.totalSizeFormatted,
        suggestion: 'Total bundle size is large. Consider implementing more aggressive code splitting'
      });
    }

    return recommendations;
  }

  generateHumanReadableReport(report) {
    let output = `# Bundle Analysis Report\n\n`;
    output += `**Generated:** ${report.timestamp}\n`;
    output += `**Total Bundle Size:** ${report.totalSizeFormatted}\n\n`;

    output += `## Page Sizes\n\n`;
    Object.entries(report.pages)
      .sort(([,a], [,b]) => b.totalSize - a.totalSize)
      .forEach(([page, data]) => {
        output += `- **${page}**: ${data.sizeFormatted}\n`;
      });

    if (report.recommendations.length > 0) {
      output += `\n## Recommendations\n\n`;
      report.recommendations.forEach((rec, index) => {
        output += `${index + 1}. **${rec.type}**: ${rec.suggestion}\n`;
        if (rec.page) {output += `   - Page: ${rec.page}\n`;}
        if (rec.size) {output += `   - Size: ${rec.size}\n`;}
        output += '\n';
      });
    }

    const reportPath = path.join(this.outputDir, 'bundle-report.md');
    fs.writeFileSync(reportPath, output);
  }

  formatBytes(bytes) {
    if (bytes === 0) {return '0 Bytes';}
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async compareWithBaseline() {
    const baselinePath = path.join(this.outputDir, 'baseline.json');
    const currentPath = path.join(this.outputDir, 'bundle-analysis.json');

    if (!fs.existsSync(baselinePath) || !fs.existsSync(currentPath)) {
      console.log('ℹ️  No baseline found. Current analysis will be used as baseline.');
      if (fs.existsSync(currentPath)) {
        fs.copyFileSync(currentPath, baselinePath);
      }
      return;
    }

    const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
    const current = JSON.parse(fs.readFileSync(currentPath, 'utf8'));

    const comparison = {
      timestamp: new Date().toISOString(),
      totalSizeDiff: current.totalSize - baseline.totalSize,
      totalSizeDiffFormatted: this.formatBytes(Math.abs(current.totalSize - baseline.totalSize)),
      isRegression: current.totalSize > baseline.totalSize * 1.1, // 10% increase threshold
      pageComparisons: {}
    };

    // Compare individual pages
    Object.keys(current.pages).forEach(page => {
      const currentSize = current.pages[page]?.totalSize || 0;
      const baselineSize = baseline.pages[page]?.totalSize || 0;
      const diff = currentSize - baselineSize;

      comparison.pageComparisons[page] = {
        currentSize: this.formatBytes(currentSize),
        baselineSize: this.formatBytes(baselineSize),
        diff: this.formatBytes(Math.abs(diff)),
        isRegression: diff > baselineSize * 0.1 // 10% increase threshold
      };
    });

    // Save comparison
    const comparisonPath = path.join(this.outputDir, 'bundle-comparison.json');
    fs.writeFileSync(comparisonPath, JSON.stringify(comparison, null, 2));

    // Log results
    console.log('\n📊 Bundle Size Comparison:');
    console.log(`Total size change: ${comparison.totalSizeDiffFormatted} ${comparison.totalSizeDiff > 0 ? '📈' : '📉'}`);
    
    if (comparison.isRegression) {
      console.log('⚠️  Bundle size regression detected!');
      process.exit(1);
    } else {
      console.log('✅ Bundle size within acceptable limits');
    }
  }
}

// CLI interface
async function main() {
  const analyzer = new BundleAnalyzer();
  const command = process.argv[2];

  switch (command) {
    case 'analyze':
      await analyzer.analyzeBundleSize();
      break;
    case 'compare':
      await analyzer.analyzeBundleSize();
      await analyzer.compareWithBaseline();
      break;
    case 'baseline':
      await analyzer.analyzeBundleSize();
      const currentPath = path.join(analyzer.outputDir, 'bundle-analysis.json');
      const baselinePath = path.join(analyzer.outputDir, 'baseline.json');
      if (fs.existsSync(currentPath)) {
        fs.copyFileSync(currentPath, baselinePath);
        console.log('✅ Baseline updated');
      }
      break;
    default:
      console.log('Usage: node scripts/analyze-bundle.js [analyze|compare|baseline]');
      console.log('  analyze  - Analyze current bundle size');
      console.log('  compare  - Analyze and compare with baseline');
      console.log('  baseline - Set current analysis as baseline');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { BundleAnalyzer };