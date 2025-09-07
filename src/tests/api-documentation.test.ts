import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import swaggerSpec from '@/lib/swagger';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3002;

describe('API Documentation Tests', () => {
  let app: any;
  let server: any;

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
        console.log(`Documentation test server running on http://${hostname}:${port}`);
        resolve();
      });
    });
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

  describe('OpenAPI Specification', () => {
    it('should have valid OpenAPI 3.0.3 specification', () => {
      expect(swaggerSpec.openapi).toBe('3.0.3');
      expect(swaggerSpec.info).toBeDefined();
      expect(swaggerSpec.info.title).toBe('ConstructPro API');
      expect(swaggerSpec.info.version).toBe('1.0.0');
    });

    it('should have required API information', () => {
      expect(swaggerSpec.info.description).toBeDefined();
      expect(swaggerSpec.info.contact).toBeDefined();
      expect(swaggerSpec.info.license).toBeDefined();
      expect(swaggerSpec.servers).toBeDefined();
      expect(swaggerSpec.servers.length).toBeGreaterThan(0);
    });

    it('should have security schemes defined', () => {
      expect(swaggerSpec.components?.securitySchemes).toBeDefined();
      expect(swaggerSpec.components?.securitySchemes?.bearerAuth).toBeDefined();
      expect(swaggerSpec.components?.securitySchemes?.apiKey).toBeDefined();
    });

    it('should have comprehensive schemas', () => {
      const schemas = swaggerSpec.components?.schemas;
      expect(schemas).toBeDefined();
      
      // Check core schemas
      expect(schemas?.Error).toBeDefined();
      expect(schemas?.ValidationError).toBeDefined();
      expect(schemas?.Pagination).toBeDefined();
      
      // Check entity schemas
      expect(schemas?.Project).toBeDefined();
      expect(schemas?.Task).toBeDefined();
      expect(schemas?.Material).toBeDefined();
      expect(schemas?.User).toBeDefined();
      
      // Check request schemas
      expect(schemas?.CreateProjectRequest).toBeDefined();
      expect(schemas?.CreateTaskRequest).toBeDefined();
      expect(schemas?.CreateMaterialRequest).toBeDefined();
    });

    it('should have all major endpoints documented', () => {
      const paths = swaggerSpec.paths;
      expect(paths).toBeDefined();
      
      // Authentication endpoints
      expect(paths['/auth/login']).toBeDefined();
      expect(paths['/auth/register']).toBeDefined();
      
      // Project endpoints
      expect(paths['/projects']).toBeDefined();
      expect(paths['/projects/{id}']).toBeDefined();
      
      // Task endpoints
      expect(paths['/tasks']).toBeDefined();
      
      // Material endpoints
      expect(paths['/materials']).toBeDefined();
      expect(paths['/materials/compare']).toBeDefined();
    });

    it('should have proper HTTP methods for endpoints', () => {
      const projectsPath = swaggerSpec.paths['/projects'];
      expect(projectsPath?.get).toBeDefined();
      expect(projectsPath?.post).toBeDefined();
      
      const projectPath = swaggerSpec.paths['/projects/{id}'];
      expect(projectPath?.get).toBeDefined();
      expect(projectPath?.patch).toBeDefined();
      expect(projectPath?.delete).toBeDefined();
    });

    it('should have proper response schemas', () => {
      const loginEndpoint = swaggerSpec.paths['/auth/login']?.post;
      expect(loginEndpoint?.responses?.['200']).toBeDefined();
      expect(loginEndpoint?.responses?.['401']).toBeDefined();
      
      const projectsEndpoint = swaggerSpec.paths['/projects']?.get;
      expect(projectsEndpoint?.responses?.['200']).toBeDefined();
    });

    it('should have proper request body schemas', () => {
      const createProjectEndpoint = swaggerSpec.paths['/projects']?.post;
      expect(createProjectEndpoint?.requestBody).toBeDefined();
      expect(createProjectEndpoint?.requestBody?.required).toBe(true);
      
      const loginEndpoint = swaggerSpec.paths['/auth/login']?.post;
      expect(loginEndpoint?.requestBody).toBeDefined();
      expect(loginEndpoint?.requestBody?.required).toBe(true);
    });

    it('should have proper parameter definitions', () => {
      const projectsGetEndpoint = swaggerSpec.paths['/projects']?.get;
      expect(projectsGetEndpoint?.parameters).toBeDefined();
      
      const projectGetEndpoint = swaggerSpec.paths['/projects/{id}']?.get;
      expect(projectGetEndpoint?.parameters).toBeDefined();
      
      // Check for path parameter
      const pathParam = projectGetEndpoint?.parameters?.find(
        (p: any) => p.in === 'path' && p.name === 'id'
      );
      expect(pathParam).toBeDefined();
      expect(pathParam?.required).toBe(true);
    });

    it('should have security requirements for protected endpoints', () => {
      const projectsEndpoint = swaggerSpec.paths['/projects']?.get;
      expect(projectsEndpoint?.security).toBeDefined();
      expect(projectsEndpoint?.security?.[0]?.bearerAuth).toBeDefined();
    });

    it('should have proper tags for organization', () => {
      expect(swaggerSpec.tags).toBeDefined();
      expect(swaggerSpec.tags?.length).toBeGreaterThan(0);
      
      const tagNames = swaggerSpec.tags?.map(tag => tag.name);
      expect(tagNames).toContain('Authentication');
      expect(tagNames).toContain('Projects');
      expect(tagNames).toContain('Tasks');
      expect(tagNames).toContain('Materials');
    });
  });

  describe('Documentation Endpoints', () => {
    it('should serve OpenAPI JSON specification', async () => {
      const response = await request(server)
        .get('/api/docs?format=json');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.body.openapi).toBe('3.0.3');
      expect(response.body.info.title).toBe('ConstructPro API');
    });

    it('should serve HTML documentation page', async () => {
      const response = await request(server)
        .get('/api/docs');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/html');
      expect(response.text).toContain('ConstructPro API Documentation');
      expect(response.text).toContain('swagger-ui');
      expect(response.text).toContain('SwaggerUIBundle');
    });

    it('should include proper cache headers for documentation', async () => {
      const response = await request(server)
        .get('/api/docs');

      expect(response.status).toBe(200);
      expect(response.headers['cache-control']).toContain('public');
    });

    it('should serve migration guide', async () => {
      const response = await request(server)
        .get('/api/migration');

      expect(response.status).toBe(200);
      expect(response.body.availableMigrations).toBeDefined();
      expect(response.body.currentVersion).toBe('1.0.0');
      expect(response.body.supportedVersions).toContain('1.0.0');
      expect(response.body.deprecatedVersions).toContain('0.9.0');
    });

    it('should serve specific migration guide', async () => {
      const response = await request(server)
        .get('/api/migration?from=0.9.0&to=1.0.0');

      expect(response.status).toBe(200);
      expect(response.body.migration).toBeDefined();
      expect(response.body.migration.title).toContain('Migration from v0.9.0 to v1.0.0');
      expect(response.body.migration.changes).toBeDefined();
      expect(response.body.migration.examples).toBeDefined();
    });

    it('should return 404 for non-existent migration guide', async () => {
      const response = await request(server)
        .get('/api/migration?from=1.0.0&to=3.0.0');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('MIGRATION_NOT_FOUND');
      expect(response.body.availableMigrations).toBeDefined();
    });
  });

  describe('Schema Validation', () => {
    it('should have valid enum schemas', () => {
      const schemas = swaggerSpec.components?.schemas;
      
      const projectStatus = schemas?.ProjectStatus;
      expect(projectStatus?.type).toBe('string');
      expect(projectStatus?.enum).toContain('PLANNING');
      expect(projectStatus?.enum).toContain('IN_PROGRESS');
      expect(projectStatus?.enum).toContain('COMPLETED');
      
      const taskStatus = schemas?.TaskStatus;
      expect(taskStatus?.type).toBe('string');
      expect(taskStatus?.enum).toContain('TODO');
      expect(taskStatus?.enum).toContain('IN_PROGRESS');
      expect(taskStatus?.enum).toContain('COMPLETED');
    });

    it('should have proper validation constraints', () => {
      const schemas = swaggerSpec.components?.schemas;
      
      const createProjectRequest = schemas?.CreateProjectRequest;
      expect(createProjectRequest?.required).toContain('name');
      expect(createProjectRequest?.required).toContain('budget');
      
      const nameProperty = createProjectRequest?.properties?.name;
      expect(nameProperty?.minLength).toBe(3);
      expect(nameProperty?.maxLength).toBe(100);
      
      const budgetProperty = createProjectRequest?.properties?.budget;
      expect(budgetProperty?.minimum).toBe(0);
      expect(budgetProperty?.maximum).toBe(10000000);
    });

    it('should have proper format specifications', () => {
      const schemas = swaggerSpec.components?.schemas;
      
      const user = schemas?.User;
      const emailProperty = user?.properties?.email;
      expect(emailProperty?.format).toBe('email');
      
      const idProperty = user?.properties?.id;
      expect(idProperty?.format).toBe('uuid');
      
      const createdAtProperty = user?.properties?.createdAt;
      expect(createdAtProperty?.format).toBe('date-time');
    });

    it('should have proper reference schemas', () => {
      const schemas = swaggerSpec.components?.schemas;
      
      const projectDetailed = schemas?.ProjectDetailed;
      expect(projectDetailed?.allOf).toBeDefined();
      expect(projectDetailed?.allOf?.[0]?.$ref).toBe('#/components/schemas/Project');
      
      const authResponse = schemas?.AuthResponse;
      const userProperty = authResponse?.properties?.user;
      expect(userProperty?.$ref).toBe('#/components/schemas/User');
    });
  });

  describe('API Examples and Documentation Quality', () => {
    it('should have meaningful descriptions for endpoints', () => {
      const loginEndpoint = swaggerSpec.paths['/auth/login']?.post;
      expect(loginEndpoint?.summary).toBeDefined();
      expect(loginEndpoint?.description).toBeDefined();
      expect(loginEndpoint?.description).toContain('email');
      expect(loginEndpoint?.description).toContain('password');
      
      const projectsEndpoint = swaggerSpec.paths['/projects']?.get;
      expect(projectsEndpoint?.summary).toBeDefined();
      expect(projectsEndpoint?.description).toBeDefined();
      expect(projectsEndpoint?.description).toContain('paginated');
    });

    it('should have proper error response documentation', () => {
      const createProjectEndpoint = swaggerSpec.paths['/projects']?.post;
      expect(createProjectEndpoint?.responses?.['201']).toBeDefined();
      
      const loginEndpoint = swaggerSpec.paths['/auth/login']?.post;
      expect(loginEndpoint?.responses?.['401']).toBeDefined();
      expect(loginEndpoint?.responses?.['401']?.description).toContain('Invalid credentials');
    });

    it('should document all required fields properly', () => {
      const schemas = swaggerSpec.components?.schemas;
      
      const createTaskRequest = schemas?.CreateTaskRequest;
      expect(createTaskRequest?.required).toContain('projectId');
      expect(createTaskRequest?.required).toContain('title');
      
      const createMaterialRequest = schemas?.CreateMaterialRequest;
      expect(createMaterialRequest?.required).toContain('projectId');
      expect(createMaterialRequest?.required).toContain('name');
      expect(createMaterialRequest?.required).toContain('quantity');
    });

    it('should have consistent response structure', () => {
      const schemas = swaggerSpec.components?.schemas;
      
      // All error responses should have consistent structure
      const error = schemas?.Error;
      expect(error?.required).toContain('error');
      expect(error?.required).toContain('message');
      expect(error?.required).toContain('timestamp');
      
      const validationError = schemas?.ValidationError;
      expect(validationError?.required).toContain('error');
      expect(validationError?.required).toContain('message');
      expect(validationError?.required).toContain('details');
    });
  });
});