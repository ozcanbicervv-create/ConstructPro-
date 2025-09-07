import { describe, it, expect } from '@jest/globals';
import { NextRequest } from 'next/server';
import { createValidationMiddleware, projectSchemas, taskSchemas, materialSchemas, userSchemas } from '@/middleware/validation.middleware';

describe('Validation Middleware', () => {
  describe('Project Validation', () => {
    it('should validate valid project creation data', async () => {
      const validData = {
        name: 'Test Project',
        description: 'A test project',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        budget: 100000,
        location: 'Test Location',
        priority: 'MEDIUM'
      };

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(validData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const middleware = createValidationMiddleware({
        body: projectSchemas.create
      });

      const result = await middleware(request);
      expect(result).toBeNull(); // No validation errors
    });

    it('should reject invalid project creation data', async () => {
      const invalidData = {
        name: 'A', // Too short
        budget: -100, // Negative
        startDate: 'invalid-date',
        location: '' // Empty
      };

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const middleware = createValidationMiddleware({
        body: projectSchemas.create
      });

      const result = await middleware(request);
      expect(result).not.toBeNull();
      
      const response = await result!.json();
      expect(response.error).toBe('VALIDATION_ERROR');
      expect(response.details.body).toBeDefined();
      expect(response.details.body.length).toBeGreaterThan(0);
    });

    it('should validate project query parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/projects?page=invalid&limit=200', {
        method: 'GET'
      });

      const middleware = createValidationMiddleware({
        query: projectSchemas.query
      });

      const result = await middleware(request);
      expect(result).not.toBeNull();
      
      const response = await result!.json();
      expect(response.error).toBe('VALIDATION_ERROR');
      expect(response.details.query).toBeDefined();
    });
  });

  describe('Task Validation', () => {
    it('should validate valid task creation data', async () => {
      const validData = {
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Task',
        description: 'A test task',
        priority: 'HIGH',
        estimatedHours: 8
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(validData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const middleware = createValidationMiddleware({
        body: taskSchemas.create
      });

      const result = await middleware(request);
      expect(result).toBeNull();
    });

    it('should reject invalid task creation data', async () => {
      const invalidData = {
        projectId: 'invalid-uuid',
        title: 'AB', // Too short
        estimatedHours: 2000 // Too high
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const middleware = createValidationMiddleware({
        body: taskSchemas.create
      });

      const result = await middleware(request);
      expect(result).not.toBeNull();
      
      const response = await result!.json();
      expect(response.error).toBe('VALIDATION_ERROR');
      expect(response.details.body).toContain('projectId: Invalid uuid');
    });
  });

  describe('Material Validation', () => {
    it('should validate valid material creation data', async () => {
      const validData = {
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Material',
        category: 'Construction',
        unit: 'kg',
        quantity: 100,
        unitPrice: 50
      };

      const request = new NextRequest('http://localhost:3000/api/materials', {
        method: 'POST',
        body: JSON.stringify(validData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const middleware = createValidationMiddleware({
        body: materialSchemas.create
      });

      const result = await middleware(request);
      expect(result).toBeNull();
    });

    it('should validate material comparison request', async () => {
      const validData = {
        materialIds: [
          '123e4567-e89b-12d3-a456-426614174000',
          '123e4567-e89b-12d3-a456-426614174001'
        ],
        criteria: ['price', 'quality']
      };

      const request = new NextRequest('http://localhost:3000/api/materials/compare', {
        method: 'POST',
        body: JSON.stringify(validData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const middleware = createValidationMiddleware({
        body: materialSchemas.compare
      });

      const result = await middleware(request);
      expect(result).toBeNull();
    });

    it('should reject invalid material comparison request', async () => {
      const invalidData = {
        materialIds: ['single-id'], // Need at least 2
        criteria: ['invalid-criteria']
      };

      const request = new NextRequest('http://localhost:3000/api/materials/compare', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const middleware = createValidationMiddleware({
        body: materialSchemas.compare
      });

      const result = await middleware(request);
      expect(result).not.toBeNull();
      
      const response = await result!.json();
      expect(response.error).toBe('VALIDATION_ERROR');
    });
  });

  describe('User Validation', () => {
    it('should validate valid user registration data', async () => {
      const validData = {
        email: 'test@example.com',
        password: 'securepassword123',
        firstName: 'John',
        lastName: 'Doe',
        title: 'Project Manager',
        company: 'Test Company'
      };

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(validData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const middleware = createValidationMiddleware({
        body: userSchemas.register
      });

      const result = await middleware(request);
      expect(result).toBeNull();
    });

    it('should reject invalid user registration data', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123', // Too short
        firstName: '', // Empty
        phone: '1234567890123456789012345' // Too long
      };

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const middleware = createValidationMiddleware({
        body: userSchemas.register
      });

      const result = await middleware(request);
      expect(result).not.toBeNull();
      
      const response = await result!.json();
      expect(response.error).toBe('VALIDATION_ERROR');
      expect(response.details.body).toContain('email: Invalid email');
    });

    it('should validate login request', async () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(validData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const middleware = createValidationMiddleware({
        body: userSchemas.login
      });

      const result = await middleware(request);
      expect(result).toBeNull();
    });
  });

  describe('Path Parameter Validation', () => {
    it('should validate UUID path parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/projects/invalid-uuid', {
        method: 'GET'
      });

      const middleware = createValidationMiddleware({
        params: {
          id: 'string().uuid()'
        }
      });

      const context = {
        params: { id: 'invalid-uuid' }
      };

      const result = await middleware(request, context);
      expect(result).not.toBeNull();
      
      const response = await result!.json();
      expect(response.error).toBe('VALIDATION_ERROR');
    });

    it('should accept valid UUID path parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/projects/123e4567-e89b-12d3-a456-426614174000', {
        method: 'GET'
      });

      const middleware = createValidationMiddleware({
        params: {
          id: 'string().uuid()'
        }
      });

      const context = {
        params: { id: '123e4567-e89b-12d3-a456-426614174000' }
      };

      const result = await middleware(request, context);
      expect(result).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const middleware = createValidationMiddleware({
        body: projectSchemas.create
      });

      const result = await middleware(request);
      expect(result).not.toBeNull();
      
      const response = await result!.json();
      expect(response.error).toBe('VALIDATION_ERROR');
    });

    it('should handle missing content type', async () => {
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' })
      });

      const middleware = createValidationMiddleware({
        body: projectSchemas.create
      });

      const result = await middleware(request);
      expect(result).not.toBeNull();
    });
  });
});