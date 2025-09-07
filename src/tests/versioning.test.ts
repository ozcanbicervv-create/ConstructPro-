import { describe, it, expect } from '@jest/globals';
import { NextRequest } from 'next/server';
import { ApiVersionManager, createVersioningMiddleware, createVersionedApiResponse } from '@/middleware/versioning.middleware';

describe('API Versioning', () => {
  describe('ApiVersionManager', () => {
    let versionManager: ApiVersionManager;

    beforeEach(() => {
      versionManager = new ApiVersionManager({
        currentVersion: '1.0.0',
        supportedVersions: ['1.0.0', '0.9.0'],
        deprecatedVersions: ['0.9.0'],
        defaultVersion: '1.0.0'
      });
    });

    describe('Version Extraction', () => {
      it('should extract version from header', async () => {
        const request = new NextRequest('http://localhost:3000/api/projects', {
          method: 'GET',
          headers: {
            'API-Version': '1.0.0'
          }
        });

        const version = versionManager.extractVersion(request);
        expect(version).toBe('1.0.0');
      });

      it('should extract version from query parameter', async () => {
        const request = new NextRequest('http://localhost:3000/api/projects?version=0.9.0', {
          method: 'GET'
        });

        const version = versionManager.extractVersion(request);
        expect(version).toBe('0.9.0');
      });

      it('should extract version from Accept header', async () => {
        const request = new NextRequest('http://localhost:3000/api/projects', {
          method: 'GET',
          headers: {
            'Accept': 'application/vnd.constructpro.v1.0.0+json'
          }
        });

        const version = versionManager.extractVersion(request);
        expect(version).toBe('1.0.0');
      });

      it('should return default version when no version specified', async () => {
        const request = new NextRequest('http://localhost:3000/api/projects', {
          method: 'GET'
        });

        const version = versionManager.extractVersion(request);
        expect(version).toBe('1.0.0');
      });

      it('should prioritize header over query parameter', async () => {
        const request = new NextRequest('http://localhost:3000/api/projects?version=0.9.0', {
          method: 'GET',
          headers: {
            'API-Version': '1.0.0'
          }
        });

        const version = versionManager.extractVersion(request);
        expect(version).toBe('1.0.0');
      });
    });

    describe('Version Validation', () => {
      it('should validate supported version', () => {
        const result = versionManager.validateVersion('1.0.0');
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should reject unsupported version', () => {
        const result = versionManager.validateVersion('2.0.0');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Unsupported API version');
      });

      it('should validate deprecated version', () => {
        const result = versionManager.validateVersion('0.9.0');
        expect(result.valid).toBe(true);
        expect(versionManager.isDeprecated('0.9.0')).toBe(true);
      });
    });

    describe('Data Transformation', () => {
      it('should transform project data for v0.9.0', () => {
        const projectData = {
          id: 'test-id',
          name: 'Test Project',
          status: 'IN_PROGRESS',
          managerId: 'manager-id',
          priority: 'HIGH',
          metadata: { key: 'value' }
        };

        const transformed = versionManager.transformDataForVersion(projectData, '0.9.0', '/projects');
        
        expect(transformed.status_code).toBe('IN_PROGRESS');
        expect(transformed.project_manager).toBe('manager-id');
        expect(transformed.priority_level).toBe('HIGH');
        expect(transformed.metadata).toBeUndefined();
        expect(transformed.status).toBe('IN_PROGRESS'); // Original field still present
      });

      it('should transform task data for v0.9.0', () => {
        const taskData = {
          id: 'task-id',
          title: 'Test Task',
          assignedTo: 'user-id',
          createdBy: 'creator-id',
          dueDate: '2024-12-31T23:59:59Z',
          estimatedHours: 8,
          actualHours: 6,
          metadata: { key: 'value' }
        };

        const transformed = versionManager.transformDataForVersion(taskData, '0.9.0', '/tasks');
        
        expect(transformed.assigned_user).toBe('user-id');
        expect(transformed.created_by_user).toBe('creator-id');
        expect(transformed.due_date).toBe('2024-12-31T23:59:59Z');
        expect(transformed.estimated_time).toBe(8);
        expect(transformed.actual_time).toBe(6);
        expect(transformed.metadata).toBeUndefined();
      });

      it('should transform material data for v0.9.0', () => {
        const materialData = {
          id: 'material-id',
          name: 'Test Material',
          unitPrice: 100,
          totalCost: 1000,
          supplierId: 'supplier-id',
          specifications: { spec: 'value' }
        };

        const transformed = versionManager.transformDataForVersion(materialData, '0.9.0', '/materials');
        
        expect(transformed.unit_cost).toBe(100);
        expect(transformed.total_price).toBe(1000);
        expect(transformed.supplier).toBe('supplier-id');
        expect(transformed.specifications).toBeUndefined();
      });

      it('should not transform data for v1.0.0', () => {
        const originalData = {
          id: 'test-id',
          name: 'Test Project',
          status: 'IN_PROGRESS'
        };

        const transformed = versionManager.transformDataForVersion(originalData, '1.0.0', '/projects');
        
        expect(transformed).toEqual(originalData);
      });

      it('should handle array data transformation', () => {
        const projectsData = [
          {
            id: 'project-1',
            status: 'IN_PROGRESS',
            managerId: 'manager-1'
          },
          {
            id: 'project-2',
            status: 'COMPLETED',
            managerId: 'manager-2'
          }
        ];

        const transformed = versionManager.transformDataForVersion(projectsData, '0.9.0', '/projects');
        
        expect(Array.isArray(transformed)).toBe(true);
        expect(transformed[0].status_code).toBe('IN_PROGRESS');
        expect(transformed[0].project_manager).toBe('manager-1');
        expect(transformed[1].status_code).toBe('COMPLETED');
        expect(transformed[1].project_manager).toBe('manager-2');
      });
    });

    describe('Versioned Response Creation', () => {
      it('should create response for current version', () => {
        const data = { id: 'test', name: 'Test' };
        const response = versionManager.createVersionedResponse(data, '1.0.0');
        
        expect(response.data).toEqual(data);
        expect(response.version).toBe('1.0.0');
        expect(response.deprecated).toBeUndefined();
      });

      it('should create response for deprecated version', () => {
        const data = { id: 'test', name: 'Test' };
        const response = versionManager.createVersionedResponse(data, '0.9.0');
        
        expect(response.data).toEqual(data);
        expect(response.version).toBe('0.9.0');
        expect(response.deprecated).toBe(true);
        expect(response.deprecationNotice).toContain('deprecated');
        expect(response.upgradeUrl).toBe('/api/docs#migration');
      });
    });
  });

  describe('Versioning Middleware', () => {
    it('should accept supported version', async () => {
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'GET',
        headers: {
          'API-Version': '1.0.0'
        }
      });

      const middleware = createVersioningMiddleware();
      const response = middleware(request);
      
      expect(response.headers.get('X-API-Version')).toBe('1.0.0');
      expect(response.headers.get('X-API-Deprecated')).toBeNull();
    });

    it('should handle deprecated version', async () => {
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'GET',
        headers: {
          'API-Version': '0.9.0'
        }
      });

      const middleware = createVersioningMiddleware();
      const response = middleware(request);
      
      expect(response.headers.get('X-API-Version')).toBe('0.9.0');
      expect(response.headers.get('X-API-Deprecated')).toBe('true');
      expect(response.headers.get('X-API-Deprecation-Notice')).toContain('deprecated');
    });

    it('should reject unsupported version', async () => {
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'GET',
        headers: {
          'API-Version': '2.0.0'
        }
      });

      const middleware = createVersioningMiddleware();
      const response = middleware(request);
      
      expect(response.status).toBe(400);
      
      const body = await response.json();
      expect(body.error).toBe('UNSUPPORTED_VERSION');
      expect(body.supportedVersions).toContain('1.0.0');
    });
  });

  describe('Versioned API Response', () => {
    it('should create versioned response with headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'GET',
        headers: {
          'API-Version': '1.0.0'
        }
      });

      const data = { id: 'test', name: 'Test Project' };
      const response = createVersionedApiResponse(data, request, '/projects');
      
      expect(response.headers.get('API-Version')).toBe('1.0.0');
      expect(response.headers.get('Content-Type')).toBe('application/vnd.constructpro.v1.0.0+json');
      
      const body = await response.json();
      expect(body.data).toEqual(data);
      expect(body.version).toBe('1.0.0');
    });

    it('should create versioned response for deprecated version', async () => {
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'GET',
        headers: {
          'API-Version': '0.9.0'
        }
      });

      const data = {
        id: 'test',
        name: 'Test Project',
        status: 'IN_PROGRESS',
        managerId: 'manager-id'
      };
      
      const response = createVersionedApiResponse(data, request, '/projects');
      
      expect(response.headers.get('API-Version')).toBe('0.9.0');
      expect(response.headers.get('Deprecation')).toBe('true');
      expect(response.headers.get('Sunset')).toBeDefined();
      expect(response.headers.get('Link')).toContain('successor-version');
      
      const body = await response.json();
      expect(body.data.status_code).toBe('IN_PROGRESS'); // Transformed for v0.9.0
      expect(body.data.project_manager).toBe('manager-id'); // Transformed for v0.9.0
      expect(body.deprecated).toBe(true);
    });
  });
});