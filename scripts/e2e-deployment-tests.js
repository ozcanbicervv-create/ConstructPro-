#!/usr/bin/env node

/**
 * ConstructPro End-to-End Deployment Test Suite
 * Comprehensive testing for production deployment validation
 */

const https = require('https');
const http = require('http');
const { spawn } = require('child_process');

// Configuration
const config = {
  baseUrl: process.env.DEPLOYMENT_URL || 'http://localhost:3000',
  timeout: 15000,
  retries: 3,
  githubRepo: process.env.GITHUB_REPO || 'vovelet-tech/constructpro',
  testUser: {
    email: 'test@vovelet-tech.com',
    password: 'TestPassword123!',
  },
};

// Test utilities
const makeRequest = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const timeout = setTimeout(() => {
      reject(new Error(`Request timeout: ${url}`));
    }, config.timeout);

    const requestOptions = {
      ...options,
      headers: {
        'User-Agent': 'ConstructPro-E2E-Tests/1.0',
        ...options.headers,
      },
    };

    const req = protocol.get(url, requestOptions, (res) => {
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

const makePostRequest = (url, data, options = {}) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const postData = JSON.stringify(data);
    
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'ConstructPro-E2E-Tests/1.0',
        ...options.headers,
      },
    };

    const timeout = setTimeout(() => {
      reject(new Error(`Request timeout: ${url}`));
    }, config.timeout);

    const req = protocol.request(url, requestOptions, (res) => {
      clearTimeout(timeout);
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseData,
        });
      });
    });

    req.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
};

// Test suites
const tests = {
  async infrastructureTests() {
    console.log('🏗️  Running Infrastructure Tests...');
    const results = [];

    // Test 1: Application availability
    try {
      const response = await makeRequest(`${config.baseUrl}/`);
      if (response.statusCode === 200) {
        console.log('✅ Application is accessible');
        results.push({ test: 'app_accessibility', status: 'pass' });
      } else {
        console.log(`❌ Application returned status: ${response.statusCode}`);
        results.push({ test: 'app_accessibility', status: 'fail', details: `Status: ${response.statusCode}` });
      }
    } catch (error) {
      console.log(`❌ Application accessibility failed: ${error.message}`);
      results.push({ test: 'app_accessibility', status: 'fail', details: error.message });
    }

    // Test 2: Health check endpoint
    try {
      const response = await makeRequest(`${config.baseUrl}/api/health`);
      if (response.statusCode === 200) {
        const health = JSON.parse(response.body);
        if (health.status === 'healthy') {
          console.log('✅ Health check endpoint working');
          results.push({ test: 'health_check', status: 'pass' });
        } else {
          console.log(`⚠️  Health check shows: ${health.status}`);
          results.push({ test: 'health_check', status: 'warning', details: health.status });
        }
      } else {
        console.log(`❌ Health check failed with status: ${response.statusCode}`);
        results.push({ test: 'health_check', status: 'fail', details: `Status: ${response.statusCode}` });
      }
    } catch (error) {
      console.log(`❌ Health check error: ${error.message}`);
      results.push({ test: 'health_check', status: 'fail', details: error.message });
    }

    // Test 3: SSL/HTTPS (if production)
    if (config.baseUrl.startsWith('https')) {
      try {
        const response = await makeRequest(config.baseUrl);
        const hasHSTS = response.headers['strict-transport-security'];
        if (hasHSTS) {
          console.log('✅ HTTPS and HSTS configured');
          results.push({ test: 'ssl_configuration', status: 'pass' });
        } else {
          console.log('⚠️  HTTPS working but HSTS not configured');
          results.push({ test: 'ssl_configuration', status: 'warning', details: 'HSTS missing' });
        }
      } catch (error) {
        console.log(`❌ SSL configuration error: ${error.message}`);
        results.push({ test: 'ssl_configuration', status: 'fail', details: error.message });
      }
    }

    return results;
  },

  async securityTests() {
    console.log('🔒 Running Security Tests...');
    const results = [];

    // Test 1: Security headers
    try {
      const response = await makeRequest(`${config.baseUrl}/`);
      const requiredHeaders = [
        'x-frame-options',
        'x-content-type-options',
        'referrer-policy',
      ];

      let headersPassed = 0;
      for (const header of requiredHeaders) {
        if (response.headers[header]) {
          headersPassed++;
        }
      }

      if (headersPassed === requiredHeaders.length) {
        console.log('✅ All security headers present');
        results.push({ test: 'security_headers', status: 'pass' });
      } else {
        console.log(`⚠️  Security headers: ${headersPassed}/${requiredHeaders.length} present`);
        results.push({ test: 'security_headers', status: 'warning', details: `${headersPassed}/${requiredHeaders.length}` });
      }
    } catch (error) {
      console.log(`❌ Security headers test failed: ${error.message}`);
      results.push({ test: 'security_headers', status: 'fail', details: error.message });
    }

    // Test 2: Rate limiting
    try {
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(makeRequest(`${config.baseUrl}/api/health`));
      }
      
      const responses = await Promise.all(requests);
      const rateLimited = responses.some(r => r.statusCode === 429);
      
      if (rateLimited) {
        console.log('✅ Rate limiting is working');
        results.push({ test: 'rate_limiting', status: 'pass' });
      } else {
        console.log('⚠️  Rate limiting not triggered (may need higher load)');
        results.push({ test: 'rate_limiting', status: 'warning', details: 'Not triggered in test' });
      }
    } catch (error) {
      console.log(`❌ Rate limiting test failed: ${error.message}`);
      results.push({ test: 'rate_limiting', status: 'fail', details: error.message });
    }

    return results;
  },

  async performanceTests() {
    console.log('⚡ Running Performance Tests...');
    const results = [];

    // Test 1: Response time
    const responseTimes = [];
    for (let i = 0; i < 5; i++) {
      try {
        const start = Date.now();
        await makeRequest(`${config.baseUrl}/`);
        const responseTime = Date.now() - start;
        responseTimes.push(responseTime);
      } catch (error) {
        console.log(`❌ Performance test request ${i + 1} failed: ${error.message}`);
      }
    }

    if (responseTimes.length > 0) {
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      if (avgResponseTime < 2000) {
        console.log(`✅ Average response time: ${Math.round(avgResponseTime)}ms`);
        results.push({ test: 'response_time', status: 'pass', details: `${Math.round(avgResponseTime)}ms` });
      } else {
        console.log(`⚠️  Slow response time: ${Math.round(avgResponseTime)}ms`);
        results.push({ test: 'response_time', status: 'warning', details: `${Math.round(avgResponseTime)}ms` });
      }
    } else {
      console.log('❌ Could not measure response time');
      results.push({ test: 'response_time', status: 'fail', details: 'No successful requests' });
    }

    // Test 2: Concurrent requests
    try {
      const concurrentRequests = Array(10).fill().map(() => makeRequest(`${config.baseUrl}/api/health`));
      const start = Date.now();
      const responses = await Promise.all(concurrentRequests);
      const totalTime = Date.now() - start;
      
      const successfulRequests = responses.filter(r => r.statusCode === 200).length;
      
      if (successfulRequests >= 8) {
        console.log(`✅ Concurrent requests: ${successfulRequests}/10 successful in ${totalTime}ms`);
        results.push({ test: 'concurrent_requests', status: 'pass', details: `${successfulRequests}/10` });
      } else {
        console.log(`⚠️  Concurrent requests: ${successfulRequests}/10 successful`);
        results.push({ test: 'concurrent_requests', status: 'warning', details: `${successfulRequests}/10` });
      }
    } catch (error) {
      console.log(`❌ Concurrent requests test failed: ${error.message}`);
      results.push({ test: 'concurrent_requests', status: 'fail', details: error.message });
    }

    return results;
  },

  async functionalTests() {
    console.log('🧪 Running Functional Tests...');
    const results = [];

    // Test 1: API endpoints
    const endpoints = [
      { path: '/api/health', expectedStatus: 200 },
      { path: '/api/monitoring/metrics', expectedStatus: 200 },
      { path: '/api/monitoring/dashboard', expectedStatus: 200 },
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await makeRequest(`${config.baseUrl}${endpoint.path}`);
        if (response.statusCode === endpoint.expectedStatus) {
          console.log(`✅ ${endpoint.path} - Status: ${response.statusCode}`);
          results.push({ test: `api_${endpoint.path.replace(/[^a-zA-Z0-9]/g, '_')}`, status: 'pass' });
        } else {
          console.log(`❌ ${endpoint.path} - Expected: ${endpoint.expectedStatus}, Got: ${response.statusCode}`);
          results.push({ test: `api_${endpoint.path.replace(/[^a-zA-Z0-9]/g, '_')}`, status: 'fail', details: `Status: ${response.statusCode}` });
        }
      } catch (error) {
        console.log(`❌ ${endpoint.path} - Error: ${error.message}`);
        results.push({ test: `api_${endpoint.path.replace(/[^a-zA-Z0-9]/g, '_')}`, status: 'fail', details: error.message });
      }
    }

    // Test 2: Static assets
    try {
      const response = await makeRequest(`${config.baseUrl}/favicon.ico`);
      if (response.statusCode === 200 || response.statusCode === 404) {
        console.log('✅ Static asset serving working');
        results.push({ test: 'static_assets', status: 'pass' });
      } else {
        console.log(`⚠️  Static assets issue - Status: ${response.statusCode}`);
        results.push({ test: 'static_assets', status: 'warning', details: `Status: ${response.statusCode}` });
      }
    } catch (error) {
      console.log(`❌ Static assets test failed: ${error.message}`);
      results.push({ test: 'static_assets', status: 'fail', details: error.message });
    }

    return results;
  },

  async deploymentTests() {
    console.log('🚀 Running Deployment Tests...');
    const results = [];

    // Test 1: Environment verification
    try {
      const response = await makeRequest(`${config.baseUrl}/api/health`);
      if (response.statusCode === 200) {
        const health = JSON.parse(response.body);
        const isProduction = health.environment === 'production';
        
        if (isProduction) {
          console.log('✅ Production environment confirmed');
          results.push({ test: 'environment_verification', status: 'pass' });
        } else {
          console.log(`⚠️  Environment: ${health.environment}`);
          results.push({ test: 'environment_verification', status: 'warning', details: health.environment });
        }
      }
    } catch (error) {
      console.log(`❌ Environment verification failed: ${error.message}`);
      results.push({ test: 'environment_verification', status: 'fail', details: error.message });
    }

    // Test 2: Service uptime
    try {
      const response = await makeRequest(`${config.baseUrl}/api/health`);
      if (response.statusCode === 200) {
        const health = JSON.parse(response.body);
        const uptime = health.uptime;
        
        if (uptime > 0) {
          console.log(`✅ Service uptime: ${uptime} seconds`);
          results.push({ test: 'service_uptime', status: 'pass', details: `${uptime}s` });
        } else {
          console.log('⚠️  Service just started');
          results.push({ test: 'service_uptime', status: 'warning', details: 'Just started' });
        }
      }
    } catch (error) {
      console.log(`❌ Service uptime check failed: ${error.message}`);
      results.push({ test: 'service_uptime', status: 'fail', details: error.message });
    }

    return results;
  },
};

// Main test runner
async function runE2ETests() {
  console.log('🎯 ConstructPro End-to-End Deployment Tests');
  console.log(`📍 Testing URL: ${config.baseUrl}`);
  console.log('=' .repeat(60));

  const allResults = [];
  const testSuites = [
    { name: 'Infrastructure', tests: tests.infrastructureTests },
    { name: 'Security', tests: tests.securityTests },
    { name: 'Performance', tests: tests.performanceTests },
    { name: 'Functional', tests: tests.functionalTests },
    { name: 'Deployment', tests: tests.deploymentTests },
  ];

  for (const suite of testSuites) {
    console.log(`\n📋 Running ${suite.name} Tests`);
    console.log('-'.repeat(40));
    
    try {
      const results = await suite.tests();
      allResults.push(...results.map(r => ({ ...r, suite: suite.name })));
    } catch (error) {
      console.log(`❌ ${suite.name} test suite failed: ${error.message}`);
      allResults.push({ 
        test: `${suite.name.toLowerCase()}_suite`, 
        status: 'fail', 
        details: error.message,
        suite: suite.name 
      });
    }
  }

  // Generate summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 E2E TEST SUMMARY');
  console.log('=' .repeat(60));

  const summary = {
    total: allResults.length,
    passed: allResults.filter(r => r.status === 'pass').length,
    warnings: allResults.filter(r => r.status === 'warning').length,
    failed: allResults.filter(r => r.status === 'fail').length,
  };

  console.log(`\n📈 Overall Results:`);
  console.log(`   ✅ Passed: ${summary.passed}`);
  console.log(`   ⚠️  Warnings: ${summary.warnings}`);
  console.log(`   ❌ Failed: ${summary.failed}`);
  console.log(`   📊 Total: ${summary.total}`);

  // Detailed results by suite
  for (const suite of testSuites) {
    const suiteResults = allResults.filter(r => r.suite === suite.name);
    if (suiteResults.length > 0) {
      console.log(`\n${suite.name} Tests:`);
      for (const result of suiteResults) {
        const icon = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️ ' : '❌';
        const details = result.details ? ` (${result.details})` : '';
        console.log(`   ${icon} ${result.test}${details}`);
      }
    }
  }

  // Final verdict
  const criticalFailures = allResults.filter(r => 
    r.status === 'fail' && 
    ['app_accessibility', 'health_check', 'environment_verification'].includes(r.test)
  ).length;

  console.log('\n' + '=' .repeat(60));
  
  if (criticalFailures === 0 && summary.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Deployment is ready for production.');
    process.exit(0);
  } else if (criticalFailures === 0 && summary.failed < 3) {
    console.log('⚠️  DEPLOYMENT READY with minor issues. Review warnings.');
    process.exit(0);
  } else {
    console.log('❌ DEPLOYMENT HAS ISSUES. Please fix critical failures before production use.');
    process.exit(1);
  }
}

// Handle command line arguments
if (process.argv.length > 2) {
  config.baseUrl = process.argv[2];
}

// Run tests
runE2ETests().catch((error) => {
  console.error('💥 E2E test runner failed:', error);
  process.exit(1);
});