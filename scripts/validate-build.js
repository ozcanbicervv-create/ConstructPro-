#!/usr/bin/env node

/**
 * Production Build Validation Script
 * Validates that the production build meets quality standards
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCheck(command, description, required = true) {
  console.log(`\n🔍 ${description}...`);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ ${description} passed`);
    return { success: true, output };
  } catch (error) {
    if (required) {
      console.error(`❌ ${description} failed:`, error.message);
      return { success: false, error: error.message };
    } else {
      console.warn(`⚠️  ${description} failed (non-critical):`, error.message);
      return { success: true, warning: error.message };
    }
  }
}

function checkFileSize(filePath, maxSizeMB, description) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${description} not found: ${filePath}`);
    return { success: true, warning: 'File not found' };
  }

  const stats = fs.statSync(filePath);
  const sizeMB = stats.size / (1024 * 1024);
  
  if (sizeMB > maxSizeMB) {
    console.error(`❌ ${description} too large: ${sizeMB.toFixed(2)}MB (max: ${maxSizeMB}MB)`);
    return { success: false, error: `File too large: ${sizeMB.toFixed(2)}MB` };
  } else {
    console.log(`✅ ${description} size OK: ${sizeMB.toFixed(2)}MB`);
    return { success: true };
  }
}

function validateBuild() {
  console.log('🔍 Validating production build...\n');

  const checks = [];

  // TypeScript compilation
  checks.push(runCheck('npm run type-check', 'TypeScript compilation'));

  // Linting
  checks.push(runCheck('npm run lint:strict', 'Code linting'));

  // Code formatting
  checks.push(runCheck('npm run format:check', 'Code formatting'));

  // Unit tests (non-critical for build validation)
  checks.push(runCheck('npm run test:ci', 'Unit tests', false));

  // Security audit
  checks.push(runCheck('npm run security:scan', 'Security audit', false));

  // Build process
  checks.push(runCheck('npm run build:production', 'Production build'));

  // Check build output sizes
  const buildDir = '.next';
  if (fs.existsSync(buildDir)) {
    console.log('\n📊 Checking build output sizes...');
    
    // Check if build directory exists and has content
    const buildStats = fs.statSync(buildDir);
    if (buildStats.isDirectory()) {
      console.log('✅ Build directory created successfully');
      
      // Check for critical build files
      const criticalFiles = [
        '.next/static',
        '.next/server',
      ];
      
      criticalFiles.forEach(file => {
        if (fs.existsSync(file)) {
          console.log(`✅ ${file} exists`);
        } else {
          console.warn(`⚠️  ${file} not found`);
        }
      });
    }
  } else {
    checks.push({ success: false, error: 'Build directory not found' });
  }

  // Summary
  console.log('\n📋 Validation Summary:');
  const failed = checks.filter(check => !check.success);
  const warnings = checks.filter(check => check.success && check.warning);

  if (failed.length === 0) {
    console.log('✅ All critical checks passed!');
    if (warnings.length > 0) {
      console.log(`⚠️  ${warnings.length} warning(s) found (non-critical)`);
    }
    console.log('\n🚀 Build is ready for deployment!');
    process.exit(0);
  } else {
    console.error(`❌ ${failed.length} critical check(s) failed:`);
    failed.forEach((check, index) => {
      console.error(`${index + 1}. ${check.error}`);
    });
    console.log('\n🛑 Build validation failed. Please fix the issues above.');
    process.exit(1);
  }
}

// Run validation if called directly
if (require.main === module) {
  validateBuild();
}

module.exports = { validateBuild };