import { OpenAPIV3 } from 'openapi-types';

export const swaggerSpec: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'ConstructPro API',
    version: '1.0.0',
    description: 'Comprehensive construction project management API',
    contact: {
      name: 'Vovelet-Tech',
      email: 'support@vovelet-tech.com',
      url: 'https://vovelet-tech.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: process.env.API_BASE_URL || 'http://localhost:3000/api',
      description: 'Development server'
    },
    {
      url: 'https://api.constructpro.com',
      description: 'Production server'
    }
  ],
  paths: {
    // Authentication endpoints
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'User login',
        description: 'Authenticate user with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' }
              }
            }
          },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'User registration',
        description: 'Register a new user account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Registration successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' }
              }
            }
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ValidationError' }
              }
            }
          }
        }
      }
    },
    // Project endpoints
    '/projects': {
      get: {
        tags: ['Projects'],
        summary: 'List projects',
        description: 'Get a paginated list of projects with filtering options',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1, default: 1 }
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 }
          },
          {
            name: 'status',
            in: 'query',
            schema: { $ref: '#/components/schemas/ProjectStatus' }
          },
          {
            name: 'priority',
            in: 'query',
            schema: { $ref: '#/components/schemas/Priority' }
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Projects retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Project' }
                    },
                    pagination: { $ref: '#/components/schemas/Pagination' }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Projects'],
        summary: 'Create project',
        description: 'Create a new construction project',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateProjectRequest' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Project created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Project' }
              }
            }
          }
        }
      }
    },
    '/projects/{id}': {
      get: {
        tags: ['Projects'],
        summary: 'Get project',
        description: 'Get detailed information about a specific project',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        responses: {
          '200': {
            description: 'Project retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ProjectDetailed' }
              }
            }
          },
          '404': {
            description: 'Project not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      },
      patch: {
        tags: ['Projects'],
        summary: 'Update project',
        description: 'Update project information',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateProjectRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Project updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Project' }
              }
            }
          }
        }
      },
      delete: {
        tags: ['Projects'],
        summary: 'Delete project',
        description: 'Delete a project and all associated data',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        responses: {
          '204': {
            description: 'Project deleted successfully'
          }
        }
      }
    },
    // Task endpoints
    '/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'List tasks',
        description: 'Get a paginated list of tasks with filtering options',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'projectId',
            in: 'query',
            schema: { type: 'string', format: 'uuid' }
          },
          {
            name: 'assignedTo',
            in: 'query',
            schema: { type: 'string', format: 'uuid' }
          },
          {
            name: 'status',
            in: 'query',
            schema: { $ref: '#/components/schemas/TaskStatus' }
          }
        ],
        responses: {
          '200': {
            description: 'Tasks retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Task' }
                    },
                    pagination: { $ref: '#/components/schemas/Pagination' }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Tasks'],
        summary: 'Create task',
        description: 'Create a new task within a project',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateTaskRequest' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Task created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Task' }
              }
            }
          }
        }
      }
    },
    // Material endpoints
    '/materials': {
      get: {
        tags: ['Materials'],
        summary: 'List materials',
        description: 'Get a paginated list of materials with filtering options',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Materials retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Material' }
                    },
                    pagination: { $ref: '#/components/schemas/Pagination' }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Materials'],
        summary: 'Create material',
        description: 'Add a new material to a project',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateMaterialRequest' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Material created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Material' }
              }
            }
          }
        }
      }
    },
    '/materials/compare': {
      post: {
        tags: ['Materials'],
        summary: 'Compare materials',
        description: 'Compare materials from different suppliers',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MaterialCompareRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Material comparison completed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MaterialComparison' }
              }
            }
          }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      },
      apiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key'
      }
    },
    schemas: {
      // Common schemas
      Error: {
        type: 'object',
        required: ['error', 'message', 'timestamp'],
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
          requestId: { type: 'string' }
        }
      },
      ValidationError: {
        type: 'object',
        required: ['error', 'message', 'details', 'timestamp'],
        properties: {
          error: { type: 'string', example: 'VALIDATION_ERROR' },
          message: { type: 'string' },
          details: {
            type: 'object',
            additionalProperties: {
              type: 'array',
              items: { type: 'string' }
            }
          },
          timestamp: { type: 'string', format: 'date-time' }
        }
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1 },
          limit: { type: 'integer', minimum: 1 },
          total: { type: 'integer', minimum: 0 },
          totalPages: { type: 'integer', minimum: 0 }
        }
      },
      // Enum schemas
      ProjectStatus: {
        type: 'string',
        enum: ['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']
      },
      TaskStatus: {
        type: 'string',
        enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'BLOCKED']
      },
      Priority: {
        type: 'string',
        enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
      },
      UserRole: {
        type: 'string',
        enum: ['ADMIN', 'PROJECT_MANAGER', 'SITE_SUPERVISOR', 'WORKER', 'CLIENT', 'SUPPLIER']
      },
      // Authentication schemas
      AuthResponse: {
        type: 'object',
        required: ['user', 'accessToken', 'refreshToken'],
        properties: {
          user: { $ref: '#/components/schemas/User' },
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
          expiresIn: { type: 'integer' }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8, maxLength: 128 },
          firstName: { type: 'string', maxLength: 50 },
          lastName: { type: 'string', maxLength: 50 },
          title: { type: 'string', maxLength: 100 },
          company: { type: 'string', maxLength: 100 },
          phone: { type: 'string', maxLength: 20 }
        }
      },
      // User schemas
      User: {
        type: 'object',
        required: ['id', 'email', 'role', 'createdAt'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          title: { type: 'string' },
          company: { type: 'string' },
          phone: { type: 'string' },
          role: { $ref: '#/components/schemas/UserRole' },
          isOnline: { type: 'boolean' },
          lastActive: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      // Project schemas
      Project: {
        type: 'object',
        required: ['id', 'name', 'managerId', 'status', 'createdAt'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string' },
          managerId: { type: 'string', format: 'uuid' },
          status: { $ref: '#/components/schemas/ProjectStatus' },
          priority: { $ref: '#/components/schemas/Priority' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          budget: { type: 'number', minimum: 0 },
          location: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      ProjectDetailed: {
        allOf: [
          { $ref: '#/components/schemas/Project' },
          {
            type: 'object',
            properties: {
              manager: { $ref: '#/components/schemas/User' },
              tasks: {
                type: 'array',
                items: { $ref: '#/components/schemas/Task' }
              },
              materials: {
                type: 'array',
                items: { $ref: '#/components/schemas/Material' }
              },
              team: {
                type: 'array',
                items: { $ref: '#/components/schemas/ProjectMember' }
              }
            }
          }
        ]
      },
      CreateProjectRequest: {
        type: 'object',
        required: ['name', 'startDate', 'endDate', 'budget', 'location'],
        properties: {
          name: { type: 'string', minLength: 3, maxLength: 100 },
          description: { type: 'string' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          budget: { type: 'number', minimum: 0, maximum: 10000000 },
          location: { type: 'string', minLength: 1, maxLength: 200 },
          priority: { $ref: '#/components/schemas/Priority' }
        }
      },
      UpdateProjectRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 3, maxLength: 100 },
          description: { type: 'string' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          budget: { type: 'number', minimum: 0, maximum: 10000000 },
          location: { type: 'string', minLength: 1, maxLength: 200 },
          priority: { $ref: '#/components/schemas/Priority' },
          status: { $ref: '#/components/schemas/ProjectStatus' }
        }
      },
      // Task schemas
      Task: {
        type: 'object',
        required: ['id', 'projectId', 'title', 'status', 'createdAt'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          projectId: { type: 'string', format: 'uuid' },
          assignedTo: { type: 'string', format: 'uuid' },
          createdBy: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string' },
          status: { $ref: '#/components/schemas/TaskStatus' },
          priority: { $ref: '#/components/schemas/Priority' },
          dueDate: { type: 'string', format: 'date-time' },
          estimatedHours: { type: 'number', minimum: 0 },
          actualHours: { type: 'number', minimum: 0 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      CreateTaskRequest: {
        type: 'object',
        required: ['projectId', 'title'],
        properties: {
          projectId: { type: 'string', format: 'uuid' },
          title: { type: 'string', minLength: 3, maxLength: 200 },
          description: { type: 'string' },
          assignedTo: { type: 'string', format: 'uuid' },
          priority: { $ref: '#/components/schemas/Priority' },
          dueDate: { type: 'string', format: 'date-time' },
          estimatedHours: { type: 'number', minimum: 0.5, maximum: 1000 }
        }
      },
      // Material schemas
      Material: {
        type: 'object',
        required: ['id', 'projectId', 'name', 'category', 'unit', 'quantity', 'unitPrice'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          projectId: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string' },
          unit: { type: 'string' },
          quantity: { type: 'number', minimum: 0 },
          unitPrice: { type: 'number', minimum: 0 },
          totalCost: { type: 'number', minimum: 0 },
          supplierId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      CreateMaterialRequest: {
        type: 'object',
        required: ['projectId', 'name', 'category', 'unit', 'quantity', 'unitPrice'],
        properties: {
          projectId: { type: 'string', format: 'uuid' },
          name: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string' },
          category: { type: 'string', minLength: 1, maxLength: 50 },
          unit: { type: 'string', minLength: 1, maxLength: 20 },
          quantity: { type: 'number', minimum: 0 },
          unitPrice: { type: 'number', minimum: 0 },
          supplierId: { type: 'string', format: 'uuid' }
        }
      },
      MaterialCompareRequest: {
        type: 'object',
        required: ['materialIds'],
        properties: {
          materialIds: {
            type: 'array',
            items: { type: 'string', format: 'uuid' },
            minItems: 2,
            maxItems: 10
          },
          criteria: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['price', 'quality', 'delivery', 'supplier_rating']
            }
          }
        }
      },
      MaterialComparison: {
        type: 'object',
        properties: {
          materials: {
            type: 'array',
            items: { $ref: '#/components/schemas/Material' }
          },
          comparison: {
            type: 'object',
            properties: {
              bestPrice: { type: 'string', format: 'uuid' },
              bestQuality: { type: 'string', format: 'uuid' },
              bestDelivery: { type: 'string', format: 'uuid' },
              recommended: { type: 'string', format: 'uuid' }
            }
          }
        }
      },
      // Project member schema
      ProjectMember: {
        type: 'object',
        required: ['userId', 'projectId', 'role'],
        properties: {
          userId: { type: 'string', format: 'uuid' },
          projectId: { type: 'string', format: 'uuid' },
          role: {
            type: 'string',
            enum: ['MANAGER', 'SUPERVISOR', 'WORKER', 'OBSERVER']
          },
          user: { $ref: '#/components/schemas/User' }
        }
      }
    }
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization'
    },
    {
      name: 'Projects',
      description: 'Construction project management'
    },
    {
      name: 'Tasks',
      description: 'Task management within projects'
    },
    {
      name: 'Materials',
      description: 'Material management and procurement'
    },
    {
      name: 'Documents',
      description: 'Document and file management'
    },
    {
      name: 'Users',
      description: 'User management and profiles'
    }
  ]
};

export default swaggerSpec;