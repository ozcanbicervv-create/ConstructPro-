#!/usr/bin/env node

/**
 * Application Health Check Script
 * Comprehensive health monitoring for the application
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const DEFAULT_URL = process.env.HEALTH_CHECK_URL || 'http://localhost:3000';
const TIMEOUT = parseInt(process.env.HEALTH_CHECK_TIMEOUT) || 10000;

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    const startTime = Date.now();
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data,
          responseTime
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(TIMEOUT, () => {
      req.destroy();
      reject(new Error(`Request timeout after ${TIMEOUT}ms`));
    });
  });
}

async function checkEndpoint(url, expectedStatus = 200, description = '') {
  try {
    console.log(`🔍 Checking ${description || url}...`);
    const response = await makeRequest(url);
    
    if (response.statusCode === expectedStatus) {
      console.log(`✅ ${description || url} - OK (${response.responseTime}ms)`);
      return { success: true, responseTime: response.responseTime, data: response.data };
    } else {
      console.error(`❌ ${description || url} - Expected ${expectedStatus}, got ${response.statusCode}`);
      return { success: false, error: `Unexpected status code: ${response.statusCode}` };
    }
  } catch (error) {
    console.error(`❌ ${description || url} - ${error.message}`);
    return { success: false, error: error.message };
  }
}

function checkFileSystem() {
  console.log('\n📁 Checking file system...');
  
  const criticalPaths = [
    { path: 'db/custom.db', description: 'Database file' },
    { path: '.env', description: 'Environment configuration' },
    { path: 'package.json', description: 'Package configuration' },
    { path: 'next.config.ts', description: 'Next.js configuration' },
  ];
  
  const results = [];
  
  criticalPaths.forEach(({ path: filePath, description }) => {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`✅ ${description} exists (${stats.size} bytes)`);
      results.push({ success: true, path: filePath });
    } else {
      console.error(`❌ ${description} missing: ${filePath}`);
      results.push({ success: false, path: filePath, error: 'File not found' });
    }
  });
  
  return results;
}

function checkEnvironment() {
  console.log('\n🌍 Checking environment variables...');
  
  const requiredEnvVars = [
    'NODE_ENV',
  ];
  
  const optionalEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ];
  
  const results = [];
  
  requiredEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar} is set`);
      results.push({ success: true, variable: envVar });
    } else {
      console.error(`❌ ${envVar} is not set`);
      results.push({ success: false, variable: envVar, error: 'Not set' });
    }
  });
  
  optionalEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar} is set (optional)`);
    } else {
      console.log(`⚠️  ${envVar} is not set (optional)`);
    }
  });
  
  return results;
}

async function performHealthCheck(baseUrl = DEFAULT_URL) {
  console.log(`🏥 Starting health check for ${baseUrl}...\n`);
  
  const results = {
    timestamp: new Date().toISOString(),
    baseUrl,
    checks: {}
  };
  
  // File system checks
  results.checks.filesystem = checkFileSystem();
  
  // Environment checks
  results.checks.environment = checkEnvironment();
  
  // HTTP endpoint checks
  console.log('\n🌐 Checking HTTP endpoints...');
  
  const endpoints = [
    { url: `${baseUrl}`, description: 'Home page' },
    { url: `${baseUrl}/api/health`, description: 'Health API endpoint' },
  ];
  
  results.checks.endpoints = [];
  
  for (const endpoint of endpoints) {
    const result = await checkEndpoint(endpoint.url, 200, endpoint.description);
    results.checks.endpoints.push({
      url: endpoint.url,
      description: endpoint.description,
      ...result
    });
  }
  
  // Summary
  console.log('\n📊 Health Check Summary:');
  
  const allChecks = [
    ...results.checks.filesystem,
    ...results.checks.environment,
    ...results.checks.endpoints
  ];
  
  const failed = allChecks.filter(check => !check.success);
  const total = allChecks.length;
  const passed = total - failed.length;
  
  console.log(`✅ Passed: ${passed}/${total}`);
  
  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.length}/${total}`);
    console.log('\nFailed checks:');
    failed.forEach((check, index) => {
      console.log(`${index + 1}. ${check.error || 'Unknown error'}`);
    });
    
    results.status = 'UNHEALTHY';
    results.exitCode = 1;
  } else {
    console.log('\n🎉 All health checks passed!');
    results.status = 'HEALTHY';
    results.exitCode = 0;
  }
  
  // Save results to file if requested
  if (process.env.HEALTH_CHECK_OUTPUT) {
    fs.writeFileSync(process.env.HEALTH_CHECK_OUTPUT, JSON.stringify(results, null, 2));
    console.log(`📄 Results saved to ${process.env.HEALTH_CHECK_OUTPUT}`);
  }
  
  return results;
}

// CLI interface
async function main() {
  const url = process.argv[2] || DEFAULT_URL;
  
  try {
    const results = await performHealthCheck(url);
    process.exit(results.exitCode);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { performHealthCheck };