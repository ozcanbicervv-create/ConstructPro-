// Simple test script to verify the project relationship endpoints
const baseUrl = 'http://localhost:3000/api';

async function testEndpoints() {
  console.log('Testing project relationship endpoints...');
  
  // Note: These tests would need proper authentication in a real scenario
  const projectId = 'test-project-id';
  
  const endpoints = [
    `/projects/${projectId}/tasks`,
    `/projects/${projectId}/materials`, 
    `/projects/${projectId}/documents`,
    `/projects/${projectId}/team`,
    `/projects/${projectId}/stats`
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint}...`);
      const response = await fetch(`${baseUrl}${endpoint}`);
      console.log(`${endpoint}: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.error(`Error testing ${endpoint}:`, error.message);
    }
  }
}

// Uncomment to run tests
// testEndpoints();

console.log('Test script created. Run with authentication to test endpoints.');