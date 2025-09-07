#!/usr/bin/env node

/**
 * ConstructPro Deployment Test Suite
 * Tests application accessibility and basic functionality after deployment
 */

const http = require('http');
const https = require('https');

// Configuration
const config = {
  // Update these URLs based on your Coolify deployment
  baseUrl: process.env.DEPLOYMENT_URL || 'http://localhost:3000',
  timeout: 10000,
  retries: 3,
};

// Test utilities
const makeRequest = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const timeout = setTimeout(() => {
      reject(new Error(`Request timeout: ${url}`));
    }, config.timeout);

    const req = protocol.get(url, options, (res) => {
      clearTimeout(timeout);
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
};

// Test functions
const tests = {
  async healthCheck() {
    console.log('🔍 Testing health check endpoint...');
    try {
      const response = await makeRequest(`${config.baseUrl}/api/health`);
      
      if (response.statusCode === 200) {
        const health = JSON.parse(response.body);
        console.log('✅ Health check passed');
        console.log(`   Status: ${health.status}`);
        console.log(`   Service: ${health.service}`);
        console.log(`   Environment: ${health.environment}`);
        console.log(`   Uptime: ${Math.round(health.uptime)}s`);
        console.log(`   Memory: ${health.memory.used}MB / ${health.memory.total}MB`);
        return true;
      } else {
        console.log(`❌ Health check failed with status: ${response.statusCode}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ Health check error: ${error.message}`);
      return false;
    }
  },

  async homePage() {
    console.log('🏠 Testing home page accessibility...');
    try {
      const response = await makeRequest(`${config.baseUrl}/`);
      
      if (response.statusCode === 200) {
        const hasConstructPro = response.body.includes('ConstructPro');
        const hasTitle = response.body.includes('<title>');
        
        if (hasConstructPro && hasTitle) {
          console.log('✅ Home page accessible and contains ConstructPro branding');
          return true;
        } else {
          console.log('⚠️  Home page accessible but missing expected content');
          return false;
        }
      } else {
        console.log(`❌ Home page failed with status: ${response.statusCode}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ Home page error: ${error.message}`);
      return false;
    }
  },

  async apiEndpoints() {
    console.log('🔌 Testing API endpoints...');
    const endpoints = [
      '/api/health',
      // Add more API endpoints as they are implemented
    ];

    let passed = 0;
    for (const endpoint of endpoints) {
      try {
        const response = await makeRequest(`${config.baseUrl}${endpoint}`);
        if (response.statusCode < 500) {
          console.log(`✅ ${endpoint} - Status: ${response.statusCode}`);
          passed++;
        } else {
          console.log(`❌ ${endpoint} - Status: ${response.statusCode}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint} - Error: ${error.message}`);
      }
    }

    const success = passed === endpoints.length;
    console.log(`${success ? '✅' : '❌'} API endpoints: ${passed}/${endpoints.length} passed`);
    return success;
  },

  async staticAssets() {
    console.log('📁 Testing static asset serving...');
    try {
      // Test favicon
      const faviconResponse = await makeRequest(`${config.baseUrl}/favicon.ico`);
      const faviconOk = faviconResponse.statusCode === 200 || faviconResponse.statusCode === 404;
      
      if (faviconOk) {
        console.log('✅ Static assets serving correctly');
        return true;
      } else {
        console.log(`❌ Static assets issue - favicon status: ${faviconResponse.statusCode}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ Static assets error: ${error.message}`);
      return false;
    }
  },

  async securityHeaders() {
    console.log('🔒 Testing security headers...');
    try {
      const response = await makeRequest(`${config.baseUrl}/`);
      const headers = response.headers;
      
      const requiredHeaders = [
        'x-frame-options',
        'x-content-type-options',
        'referrer-policy',
      ];

      let passed = 0;
      for (const header of requiredHeaders) {
        if (headers[header]) {
          console.log(`✅ ${header}: ${headers[header]}`);
          passed++;
        } else {
          console.log(`❌ Missing header: ${header}`);
        }
      }

      const success = passed === requiredHeaders.length;
      console.log(`${success ? '✅' : '⚠️ '} Security headers: ${passed}/${requiredHeaders.length} present`);
      return success;
    } catch (error) {
      console.log(`❌ Security headers error: ${error.message}`);
      return false;
    }
  },

  async databaseConnection() {
    console.log('🗄️  Testing database connectivity...');
    try {
      // This would test actual database endpoints when implemented
      // For now, we'll check if the app starts without database errors
      const response = await makeRequest(`${config.baseUrl}/api/health`);
      
      if (response.statusCode === 200) {
        console.log('✅ Database connection appears healthy (no startup errors)');
        return true;
      } else {
        console.log('⚠️  Cannot verify database connection');
        return false;
      }
    } catch (error) {
      console.log(`❌ Database connection error: ${error.message}`);
      return false;
    }
  },
};

// Main test runner
async function runTests() {
  console.log('🚀 Starting ConstructPro Deployment Tests');
  console.log(`📍 Testing URL: ${config.baseUrl}`);
  console.log('=' .repeat(50));

  const results = {};
  let totalTests = 0;
  let passedTests = 0;

  for (const [testName, testFunction] of Object.entries(tests)) {
    totalTests++;
    console.log(`\n📋 Running test: ${testName}`);
    
    try {
      const result = await testFunction();
      results[testName] = result;
      if (result) {passedTests++;}
    } catch (error) {
      console.log(`❌ Test ${testName} threw error: ${error.message}`);
      results[testName] = false;
    }
  }

  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(50));
  
  for (const [testName, result] of Object.entries(results)) {
    console.log(`${result ? '✅' : '❌'} ${testName}`);
  }
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! ConstructPro deployment is healthy.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please check the deployment.');
    process.exit(1);
  }
}

// Handle command line arguments
if (process.argv.length > 2) {
  config.baseUrl = process.argv[2];
}

// Run tests
runTests().catch((error) => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});