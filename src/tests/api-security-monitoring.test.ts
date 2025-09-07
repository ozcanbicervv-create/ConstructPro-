import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3001;

describe('API Security and Monitoring Integration Tests', () => {
  let app: any;
  let server: any;
  let authToken: string;
  let apiKey: string;

  beforeAll(async () => {
    app = next({ dev, hostname, port });
    const handle = app.getRequestHandler();
    await app.prepare();

    server = createServer(async (req, res) => {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    });

    await new Promise<void>((resolve) => {
      server.listen(port, () => {
        console.log(`Test server running on http://${hostname}:${port}`);
        resolve();
      });
    });

    // Setup test authentication
    const loginResponse = await request(server)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'testpassword123'
      });

    if (loginResponse.status === 200) {
      authToken = loginResponse.body.accessToken;
    }

    // Setup test API key
    const apiKeyResponse = await request(server)
      .post('/api/auth/api-keys')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test API Key',
        permissions: ['read', 'write']
      });

    if (apiKeyResponse.status === 201) {
      apiKey = apiKeyResponse.body.key;
    }
  });

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    }
    if (app) {
      await app.close();
    }
  });

  describe('Input Validation', () => {
    it('should validate project creation request', async () => {
      const response = await request(server)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'A', // Too short
          budget: -100, // Negative
          startDate: 'invalid-date'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.details).toBeDefined();
      expect(response.body.details.body).toContain('name: String must contain at least 3 character(s)');
    });

    it('should validate task creation request', async () => {
      const response = await request(server)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: 'invalid-uuid',
          title: 'AB', // Too short
          estimatedHours: 2000 // Too high
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.details.body).toContain('projectId: Invalid uuid');
    });

    it('should validate material creation request', async () => {
      const response = await request(server)
        .post('/api/materials')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: 'valid-uuid-here',
          name: '', // Empty
          quantity: -5, // Negative
          unitPrice: -10 // Negative
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });

    it('should validate query parameters', async () => {
      const response = await request(server)
        .get('/api/projects?page=invalid&limit=200') // Invalid page, limit too high
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });
  });

  describe('Security Headers', () => {
    it('should include security headers in responses', async () => {
      const response = await request(server)
        .get('/api/projects')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(response.headers['x-dns-prefetch-control']).toBe('off');
    });

    it('should handle CORS preflight requests', async () => {
      const response = await request(server)
        .options('/api/projects')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type, Authorization');

      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
      expect(response.headers['access-control-allow-methods']).toContain('POST');
      expect(response.headers['access-control-allow-headers']).toContain('Authorization');
    });

    it('should include CSP headers', async () => {
      const response = await request(server)
        .get('/api/docs')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.headers['content-security-policy'] || response.headers['content-security-policy-report-only']).toBeDefined();
    });
  });

  describe('API Versioning', () => {
    it('should handle version in header', async () => {
      const response = await request(server)
        .get('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .set('API-Version', '1.0.0');

      expect(response.status).toBe(200);
      expect(response.headers['x-api-version']).toBe('1.0.0');
    });

    it('should handle version in query parameter', async () => {
      const response = await request(server)
        .get('/api/projects?version=1.0.0')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['x-api-version']).toBe('1.0.0');
    });

    it('should handle deprecated version', async () => {
      const response = await request(server)
        .get('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .set('API-Version', '0.9.0');

      expect(response.status).toBe(200);
      expect(response.headers['x-api-deprecated']).toBe('true');
      expect(response.headers['x-api-deprecation-notice']).toContain('deprecated');
    });

    it('should reject unsupported version', async () => {
      const response = await request(server)
        .get('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .set('API-Version', '2.0.0');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('UNSUPPORTED_VERSION');
    });

    it('should transform data for v0.9.0', async () => {
      // First create a project
      const createResponse = await request(server)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Project',
          description: 'Test Description',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          budget: 100000,
          location: 'Test Location'
        });

      expect(createResponse.status).toBe(201);

      // Get project with v0.9.0 format
      const response = await request(server)
        .get(`/api/projects/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('API-Version', '0.9.0');

      expect(response.status).toBe(200);
      expect(response.body.data.status_code).toBeDefined(); // v0.9.0 format
      expect(response.body.data.project_manager).toBeDefined(); // v0.9.0 format
      expect(response.body.data.status).toBeUndefined(); // v1.0.0 format should not exist
    });
  });

  describe('API Documentation', () => {
    it('should serve OpenAPI JSON specification', async () => {
      const response = await request(server)
        .get('/api/docs?format=json');

      expect(response.status).toBe(200);
      expect(response.body.openapi).toBe('3.0.3');
      expect(response.body.info.title).toBe('ConstructPro API');
      expect(response.body.paths).toBeDefined();
      expect(response.body.components.schemas).toBeDefined();
    });

    it('should serve HTML documentation', async () => {
      const response = await request(server)
        .get('/api/docs');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/html');
      expect(response.text).toContain('ConstructPro API Documentation');
      expect(response.text).toContain('swagger-ui');
    });

    it('should serve migration guide', async () => {
      const response = await request(server)
        .get('/api/migration');

      expect(response.status).toBe(200);
      expect(response.body.availableMigrations).toBeDefined();
      expect(response.body.currentVersion).toBe('1.0.0');
    });

    it('should serve specific migration guide', async () => {
      const response = await request(server)
        .get('/api/migration?from=0.9.0&to=1.0.0');

      expect(response.status).toBe(200);
      expect(response.body.migration).toBeDefined();
      expect(response.body.migration.title).toContain('Migration from v0.9.0 to v1.0.0');
    });
  });

  describe('Authentication and Authorization', () => {
    it('should require authentication for protected endpoints', async () => {
      const response = await request(server)
        .get('/api/projects');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('UNAUTHORIZED');
    });

    it('should accept valid JWT token', async () => {
      const response = await request(server)
        .get('/api/projects')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    it('should accept valid API key', async () => {
      if (apiKey) {
        const response = await request(server)
          .get('/api/projects')
          .set('X-API-Key', apiKey);

        expect(response.status).toBe(200);
      }
    });

    it('should reject invalid JWT token', async () => {
      const response = await request(server)
        .get('/api/projects')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    it('should reject invalid API key', async () => {
      const response = await request(server)
        .get('/api/projects')
        .set('X-API-Key', 'invalid-key');

      expect(response.status).toBe(401);
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting', async () => {
      const requests = [];
      
      // Make multiple requests quickly
      for (let i = 0; i < 150; i++) {
        requests.push(
          request(server)
            .get('/api/projects')
            .set('Authorization', `Bearer ${authToken}`)
        );
      }

      const responses = await Promise.all(requests);
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
      expect(rateLimitedResponses[0].body.error).toBe('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors consistently', async () => {
      const response = await request(server)
        .get('/api/projects/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
      expect(response.body.message).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
    });

    it('should handle validation errors consistently', async () => {
      const response = await request(server)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'A' // Too short
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.details).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
    });

    it('should include correlation ID in error responses', async () => {
      const correlationId = 'test-correlation-id';
      
      const response = await request(server)
        .get('/api/projects/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Correlation-ID', correlationId);

      expect(response.status).toBe(404);
      expect(response.body.requestId || response.headers['x-correlation-id']).toBeDefined();
    });
  });

  describe('Performance and Monitoring', () => {
    it('should include performance headers', async () => {
      const response = await request(server)
        .get('/api/projects')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['x-response-time']).toBeDefined();
    });

    it('should serve health check endpoint', async () => {
      const response = await request(server)
        .get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
    });

    it('should serve status endpoint', async () => {
      const response = await request(server)
        .get('/api/status');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('operational');
      expect(response.body.version).toBeDefined();
    });
  });

  describe('Complete Workflow Tests', () => {
    it('should complete full project workflow', async () => {
      // Create project
      const projectResponse = await request(server)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Integration Test Project',
          description: 'Test project for integration testing',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          budget: 100000,
          location: 'Test Location'
        });

      expect(projectResponse.status).toBe(201);
      const projectId = projectResponse.body.id;

      // Create task
      const taskResponse = await request(server)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId,
          title: 'Integration Test Task',
          description: 'Test task for integration testing',
          priority: 'MEDIUM',
          estimatedHours: 8
        });

      expect(taskResponse.status).toBe(201);
      const taskId = taskResponse.body.id;

      // Create material
      const materialResponse = await request(server)
        .post('/api/materials')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId,
          name: 'Test Material',
          category: 'Construction',
          unit: 'kg',
          quantity: 100,
          unitPrice: 50
        });

      expect(materialResponse.status).toBe(201);

      // Get project with relations
      const projectDetailResponse = await request(server)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(projectDetailResponse.status).toBe(200);
      expect(projectDetailResponse.body.tasks).toBeDefined();
      expect(projectDetailResponse.body.materials).toBeDefined();

      // Update task status
      const taskUpdateResponse = await request(server)
        .patch(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'IN_PROGRESS'
        });

      expect(taskUpdateResponse.status).toBe(200);
      expect(taskUpdateResponse.body.status).toBe('IN_PROGRESS');

      // Get project stats
      const statsResponse = await request(server)
        .get(`/api/projects/${projectId}/stats`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(statsResponse.status).toBe(200);
      expect(statsResponse.body.taskStats).toBeDefined();
      expect(statsResponse.body.materialStats).toBeDefined();
    });

    it('should handle material comparison workflow', async () => {
      // Create project first
      const projectResponse = await request(server)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Material Test Project',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          budget: 50000,
          location: 'Test Location'
        });

      const projectId = projectResponse.body.id;

      // Create multiple materials
      const material1Response = await request(server)
        .post('/api/materials')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId,
          name: 'Concrete Mix A',
          category: 'Concrete',
          unit: 'm3',
          quantity: 10,
          unitPrice: 150
        });

      const material2Response = await request(server)
        .post('/api/materials')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId,
          name: 'Concrete Mix B',
          category: 'Concrete',
          unit: 'm3',
          quantity: 10,
          unitPrice: 140
        });

      // Compare materials
      const compareResponse = await request(server)
        .post('/api/materials/compare')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          materialIds: [material1Response.body.id, material2Response.body.id],
          criteria: ['price', 'quality']
        });

      expect(compareResponse.status).toBe(200);
      expect(compareResponse.body.comparison).toBeDefined();
      expect(compareResponse.body.materials).toHaveLength(2);
    });
  });
});