#!/usr/bin/env node

/**
 * Test script for API documentation endpoints
 */

const fs = require('fs');
const path = require('path');

function testOpenAPISpec() {
  console.log('🧪 Testing OpenAPI Specification...');
  
  try {
    // Test if the OpenAPI spec file exists and is valid JSON
    const specPath = path.join(process.cwd(), 'docs', 'api', 'openapi.json');
    
    if (!fs.existsSync(specPath)) {
      throw new Error('OpenAPI specification file not found');
    }
    
    const specContent = fs.readFileSync(specPath, 'utf8');
    const spec = JSON.parse(specContent);
    
    // Validate basic OpenAPI structure
    if (!spec.openapi) {
      throw new Error('Missing openapi version');
    }
    
    if (!spec.info || !spec.info.title || !spec.info.version) {
      throw new Error('Missing required info fields');
    }
    
    if (!spec.paths || Object.keys(spec.paths).length === 0) {
      throw new Error('No API paths defined');
    }
    
    console.log('✅ OpenAPI specification is valid');
    console.log(`   - Version: ${spec.openapi}`);
    console.log(`   - Title: ${spec.info.title}`);
    console.log(`   - API Version: ${spec.info.version}`);
    console.log(`   - Endpoints: ${Object.keys(spec.paths).length}`);
    
    return true;
  } catch (error) {
    console.error('❌ OpenAPI specification test failed:', error.message);
    return false;
  }
}

function testEndpointSummary() {
  console.log('\\n🧪 Testing Endpoint Summary...');
  
  try {
    const summaryPath = path.join(process.cwd(), 'docs', 'api', 'endpoint-summary.json');
    
    if (!fs.existsSync(summaryPath)) {
      throw new Error('Endpoint summary file not found');
    }
    
    const summaryContent = fs.readFileSync(summaryPath, 'utf8');
    const summary = JSON.parse(summaryContent);
    
    if (!summary.totalEndpoints || !summary.endpoints) {
      throw new Error('Invalid endpoint summary structure');
    }
    
    console.log('✅ Endpoint summary is valid');
    console.log(`   - Total endpoints: ${summary.totalEndpoints}`);
    console.log(`   - Methods: ${Object.keys(summary.byMethod).join(', ')}`);
    console.log(`   - Tags: ${Object.keys(summary.byTag).join(', ')}`);
    
    return true;
  } catch (error) {
    console.error('❌ Endpoint summary test failed:', error.message);
    return false;
  }
}

function testDocumentationFiles() {
  console.log('\\n🧪 Testing Documentation Files...');
  
  const requiredFiles = [
    'docs/api/README.md',
    'docs/api/versioning-strategy.md',
    'docs/api/openapi.yaml',
  ];
  
  let allExist = true;
  
  for (const file of requiredFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.error(`❌ ${file} missing`);
      allExist = false;
    }
  }
  
  return allExist;
}

function testAPIRouteFiles() {
  console.log('\\n🧪 Testing API Route Files...');
  
  const apiDir = path.join(process.cwd(), 'src', 'app', 'api');
  
  if (!fs.existsSync(apiDir)) {
    console.error('❌ API directory not found');
    return false;
  }
  
  // Check for docs endpoint
  const docsRoute = path.join(apiDir, 'docs', 'route.ts');
  if (fs.existsSync(docsRoute)) {
    console.log('✅ API docs endpoint exists');
  } else {
    console.error('❌ API docs endpoint missing');
    return false;
  }
  
  // Check for health endpoint
  const healthRoute = path.join(apiDir, 'health', 'route.ts');
  if (fs.existsSync(healthRoute)) {
    console.log('✅ Health check endpoint exists');
  } else {
    console.error('❌ Health check endpoint missing');
    return false;
  }
  
  return true;
}

function main() {
  console.log('🚀 API Documentation Test Suite');
  console.log('================================\\n');
  
  const tests = [
    testOpenAPISpec,
    testEndpointSummary,
    testDocumentationFiles,
    testAPIRouteFiles,
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    if (test()) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('\\n📊 Test Results');
  console.log('================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / tests.length) * 100)}%`);
  
  if (failed === 0) {
    console.log('\\n🎉 All tests passed! API documentation is ready.');
    process.exit(0);
  } else {
    console.log('\\n⚠️  Some tests failed. Please check the issues above.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}