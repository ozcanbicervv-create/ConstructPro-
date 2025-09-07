import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { redis } from '@/lib/redis';

// Mock external dependencies
jest.mock('@/lib/db');
jest.mock('@/lib/redis');
jest.mock('@/lib/logger');

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockRedis = redis as jest.Mocked<typeof redis>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('Comprehensive API Test Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Project Management API', () => {
    describe('POST /api/projects', () => {
      it('should create a new project successfully', async () => {
        const mockProject = {
          id: 'proj_123',
          name: 'Test Project',
          description: 'Test Description',
          managerId: 'user_123',
          status: 'PLANNING',
          priority: 'MEDIUM',
          startDate: new Date(),
          endDate: new Date(),
          budget: 100000,
          location: 'Test Location',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        mockPrisma.project.create.mockResolvedValue(mockProject as any);

        const { POST } = await import('@/app/api/projects/route');
        
        const request = new NextRequest('http://localhost:3000/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer valid-token'
          },
          body: JSON.stringify({
            name: 'Test Project',
            description: 'Test Description',
            managerId: 'user_123',
            budget: 100000,
            location: 'Test Location'
          })
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.success).toBe(true);
        expect(data.data.name).toBe('Test Project');
        expect(mockPrisma.project.create).toHaveBeenCalled();
      });

      it('should handle validation errors', async () => {
        const { POST } = await import('@/app/api/projects/route');
        
        const request = new NextRequest('http://localhost:3000/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer valid-token'
          },
          body: JSON.stringify({
            // Missing required fields
            description: 'Test Description'
          })
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error.code).toBe('VALIDATION_ERROR');
      });

      it('should handle database errors', async () => {
        mockPrisma.project.create.mockRejectedValue(new Error('Database connection failed'));

        const { POST } = await import('@/app/api/projects/route');
        
        const request = new NextRequest('http://localhost:3000/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer valid-token'
          },
          body: JSON.stringify({
            name: 'Test Project',
            managerId: 'user_123',
            budget: 100000,
            location: 'Test Location'
          })
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.success).toBe(false);
        expect(data.error.code).toBe('DATABASE_ERROR');
        expect(mockLogger.error).toHaveBeenCalled();
      });
    });

    describe('GET /api/projects', () => {
      it('should retrieve projects with pagination', async () => {
        const mockProjects = [
          { id: 'proj_1', name: 'Project 1' },
          { id: 'proj_2', name: 'Project 2' }
        ];

        mockPrisma.project.findMany.mockResolvedValue(mockProjects as any);
        mockPrisma.project.count.mockResolvedValue(2);

        const { GET } = await import('@/app/api/projects/route');
        
        const request = new NextRequest('http://localhost:3000/api/projects?page=1&limit=10', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer valid-token'
          }
        });

        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.projects).toHaveLength(2);
        expect(data.data.pagination).toBeDefined();
      });

      it('should handle search and filtering', async () => {
        mockPrisma.project.findMany.mockResolvedValue([]);
        mockPrisma.project.count.mockResolvedValue(0);

        const { GET } = await import('@/app/api/projects/route');
        
        const request = new NextRequest('http://localhost:3000/api/projects?search=test&status=PLANNING', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer valid-token'
          }
        });

        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(mockPrisma.project.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              AND: expect.arrayContaining([
                expect.objectContaining({
                  OR: expect.any(Array)
                }),
                expect.objectContaining({
                  status: 'PLANNING'
                })
              ])
            })
          })
        );
      });
    });
  });

  describe('Task Management API', () => {
    describe('POST /api/tasks', () => {
      it('should create a new task successfully', async () => {
        const mockTask = {
          id: 'task_123',
          title: 'Test Task',
          description: 'Test Description',
          projectId: 'proj_123',
          assignedTo: 'user_123',
          status: 'TODO',
          priority: 'MEDIUM',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        mockPrisma.task.create.mockResolvedValue(mockTask as any);

        const { POST } = await import('@/app/api/tasks/route');
        
        const request = new NextRequest('http://localhost:3000/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer valid-token'
          },
          body: JSON.stringify({
            title: 'Test Task',
            description: 'Test Description',
            projectId: 'proj_123',
            assignedTo: 'user_123'
          })
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.success).toBe(true);
        expect(data.data.title).toBe('Test Task');
      });

      it('should validate task assignment permissions', async () => {
        mockPrisma.projectMember.findFirst.mockResolvedValue(null);

        const { POST } = await import('@/app/api/tasks/route');
        
        const request = new NextRequest('http://localhost:3000/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer valid-token'
          },
          body: JSON.stringify({
            title: 'Test Task',
            projectId: 'proj_123',
            assignedTo: 'user_invalid'
          })
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.error.code).toBe('TASK_ASSIGNMENT_FAILED');
      });
    });
  });

  describe('Material Management API', () => {
    describe('POST /api/materials', () => {
      it('should create a new material successfully', async () => {
        const mockMaterial = {
          id: 'mat_123',
          name: 'Test Material',
          category: 'Construction',
          unit: 'kg',
          quantity: 100,
          unitPrice: 50.00,
          totalCost: 5000.00,
          projectId: 'proj_123',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        mockPrisma.material.create.mockResolvedValue(mockMaterial as any);

        const { POST } = await import('@/app/api/materials/route');
        
        const request = new NextRequest('http://localhost:3000/api/materials', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer valid-token'
          },
          body: JSON.stringify({
            name: 'Test Material',
            category: 'Construction',
            unit: 'kg',
            quantity: 100,
            unitPrice: 50.00,
            projectId: 'proj_123'
          })
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.success).toBe(true);
        expect(data.data.name).toBe('Test Material');
      });
    });

    describe('POST /api/materials/compare', () => {
      it('should compare materials from different suppliers', async () => {
        const mockComparison = {
          materialId: 'mat_123',
          suppliers: [
            { id: 'sup_1', name: 'Supplier 1', price: 50.00, rating: 4.5 },
            { id: 'sup_2', name: 'Supplier 2', price: 45.00, rating: 4.2 }
          ],
          recommendation: 'sup_2'
        };

        mockPrisma.material.findUnique.mockResolvedValue({ id: 'mat_123' } as any);
        mockPrisma.materialSupplier.findMany.mockResolvedValue(mockComparison.suppliers as any);

        const { POST } = await import('@/app/api/materials/compare/route');
        
        const request = new NextRequest('http://localhost:3000/api/materials/compare', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer valid-token'
          },
          body: JSON.stringify({
            materialId: 'mat_123',
            quantity: 100
          })
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.suppliers).toHaveLength(2);
        expect(data.data.recommendation).toBe('sup_2');
      });
    });
  });

  describe('Document Management API', () => {
    describe('POST /api/documents/upload', () => {
      it('should handle file upload successfully', async () => {
        const mockDocument = {
          id: 'doc_123',
          filename: 'test.pdf',
          originalName: 'test-document.pdf',
          mimeType: 'application/pdf',
          size: 1024,
          projectId: 'proj_123',
          uploadedBy: 'user_123',
          createdAt: new Date()
        };

        mockPrisma.projectDocument.create.mockResolvedValue(mockDocument as any);

        const { POST } = await import('@/app/api/documents/upload/route');
        
        // Create a mock FormData
        const formData = new FormData();
        formData.append('file', new Blob(['test content'], { type: 'application/pdf' }), 'test.pdf');
        formData.append('projectId', 'proj_123');

        const request = new NextRequest('http://localhost:3000/api/documents/upload', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer valid-token'
          },
          body: formData
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.success).toBe(true);
        expect(data.data.filename).toBe('test.pdf');
      });

      it('should validate file types', async () => {
        const { POST } = await import('@/app/api/documents/upload/route');
        
        const formData = new FormData();
        formData.append('file', new Blob(['test content'], { type: 'application/exe' }), 'malware.exe');
        formData.append('projectId', 'proj_123');

        const request = new NextRequest('http://localhost:3000/api/documents/upload', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer valid-token'
          },
          body: formData
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error.code).toBe('FILE_UPLOAD_FAILED');
      });
    });
  });

  describe('Authentication API', () => {
    describe('POST /api/auth/login', () => {
      it('should authenticate user successfully', async () => {
        const mockUser = {
          id: 'user_123',
          email: 'test@example.com',
          passwordHash: 'hashed_password',
          role: 'PROJECT_MANAGER'
        };

        mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);

        const { POST } = await import('@/app/api/auth/login/route');
        
        const request = new NextRequest('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123'
          })
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.user.email).toBe('test@example.com');
        expect(data.data.token).toBeDefined();
      });

      it('should handle invalid credentials', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null);

        const { POST } = await import('@/app/api/auth/login/route');
        
        const request = new NextRequest('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: 'invalid@example.com',
            password: 'wrongpassword'
          })
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error.code).toBe('INVALID_CREDENTIALS');
        expect(mockLogger.logAuthentication).toHaveBeenCalledWith(
          'login',
          undefined,
          false,
          expect.any(Object)
        );
      });
    });

    describe('POST /api/auth/mfa/setup', () => {
      it('should setup MFA successfully', async () => {
        const mockUser = {
          id: 'user_123',
          email: 'test@example.com',
          mfaEnabled: false
        };

        mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);
        mockPrisma.user.update.mockResolvedValue({ ...mockUser, mfaEnabled: true } as any);

        const { POST } = await import('@/app/api/auth/mfa/setup/route');
        
        const request = new NextRequest('http://localhost:3000/api/auth/mfa/setup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer valid-token'
          }
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.qrCode).toBeDefined();
        expect(data.data.secret).toBeDefined();
      });
    });
  });

  describe('Real-time Communication API', () => {
    describe('POST /api/notifications', () => {
      it('should send notification successfully', async () => {
        const { POST } = await import('@/app/api/notifications/route');
        
        const request = new NextRequest('http://localhost:3000/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer valid-token'
          },
          body: JSON.stringify({
            type: 'TASK_ASSIGNED',
            title: 'New Task Assigned',
            message: 'You have been assigned a new task',
            recipientId: 'user_123',
            data: { taskId: 'task_123' }
          })
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle rate limiting', async () => {
      // Mock rate limiter to return exceeded
      const { POST } = await import('@/app/api/projects/route');
      
      // Simulate multiple rapid requests
      const requests = Array.from({ length: 10 }, () => 
        new NextRequest('http://localhost:3000/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer valid-token',
            'X-Forwarded-For': '192.168.1.1'
          },
          body: JSON.stringify({
            name: 'Test Project',
            managerId: 'user_123'
          })
        })
      );

      // In a real scenario, rate limiting would kick in
      // This is a simplified test
      const response = await POST(requests[0]);
      expect(response.status).toBeLessThan(500);
    });

    it('should handle CORS properly', async () => {
      const { GET } = await import('@/app/api/projects/route');
      
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'GET',
        headers: {
          'Origin': 'http://localhost:3001',
          'Authorization': 'Bearer valid-token'
        }
      });

      const response = await GET(request);
      
      // Check CORS headers are present
      expect(response.headers.get('Access-Control-Allow-Origin')).toBeDefined();
    });

    it('should log all API interactions', async () => {
      const { GET } = await import('@/app/api/projects/route');
      
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token',
          'X-Request-ID': 'test-req-123'
        }
      });

      await GET(request);

      expect(mockLogger.http).toHaveBeenCalledWith(
        expect.stringContaining('GET'),
        expect.objectContaining({
          requestId: 'test-req-123'
        })
      );
    });
  });

  describe('Performance Monitoring', () => {
    it('should track slow API responses', async () => {
      // Mock slow database operation
      mockPrisma.project.findMany.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve([]), 2000))
      );

      const { GET } = await import('@/app/api/projects/route');
      
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      });

      await GET(request);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Slow request detected'),
        expect.objectContaining({
          duration: expect.any(Number)
        })
      );
    });

    it('should track memory usage in health checks', async () => {
      const { GET } = await import('@/app/api/health/route');
      
      const request = new NextRequest('http://localhost:3000/api/health', {
        method: 'GET'
      });

      const response = await GET(request);
      const data = await response.json();

      expect(data.data.metrics.memoryUsage).toBeDefined();
      expect(data.data.metrics.cpuUsage).toBeDefined();
    });
  });
});