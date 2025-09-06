#!/usr/bin/env node

/**
 * Environment Check Script
 * Validates that the development environment meets requirements
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function checkCommand(command, name, required = true) {
  try {
    const version = execSync(command, { encoding: 'utf8', stdio: 'pipe' }).trim();
    console.log(`✅ ${name}: ${version}`);
    return true;
  } catch (error) {
    if (required) {
      console.error(`❌ ${name}: Not found or not working`);
      return false;
    } else {
      console.warn(`⚠️  ${name}: Not found (optional)`);
      return true;
    }
  }
}

function checkFile(filePath, name, required = true) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${name}: Found`);
    return true;
  } else {
    if (required) {
      console.error(`❌ ${name}: Missing`);
      return false;
    } else {
      console.warn(`⚠️  ${name}: Missing (optional)`);
      return true;
    }
  }
}

function checkNodeVersion() {
  try {
    const version = process.version;
    const major = parseInt(version.slice(1).split('.')[0]);
    
    if (major >= 18) {
      console.log(`✅ Node.js version: ${version} (>= 18.0.0)`);
      return true;
    } else {
      console.error(`❌ Node.js version: ${version} (requires >= 18.0.0)`);
      return false;
    }
  } catch (error) {
    console.error('❌ Node.js version check failed');
    return false;
  }
}

function main() {
  console.log('🔍 Checking development environment...\n');
  
  const checks = [];
  
  // Node.js version check
  checks.push(checkNodeVersion());
  
  // Required tools
  checks.push(checkCommand('npm --version', 'npm'));
  checks.push(checkCommand('npx --version', 'npx'));
  
  // Optional tools
  checkCommand('git --version', 'Git', false);
  checkCommand('docker --version', 'Docker', false);
  
  // Required files
  checks.push(checkFile('package.json', 'package.json'));
  checks.push(checkFile('tsconfig.json', 'TypeScript config'));
  checks.push(checkFile('next.config.ts', 'Next.js config'));
  
  // Optional files
  checkFile('.env', 'Environment file', false);
  checkFile('.nvmrc', 'Node version file', false);
  
  // Database
  checkFile('prisma/schema.prisma', 'Prisma schema', false);
  checkFile('db/custom.db', 'Database file', false);
  
  console.log('\n📊 Environment Check Summary:');
  
  const failed = checks.filter(check => !check);
  const passed = checks.filter(check => check);
  
  console.log(`✅ Passed: ${passed.length}/${checks.length}`);
  
  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.length}/${checks.length}`);
    console.log('\n🛠️  Please fix the failed checks above before continuing.');
    process.exit(1);
  } else {
    console.log('\n🎉 Environment check passed! You\'re ready to develop.');
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };