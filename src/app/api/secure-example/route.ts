import { NextRequest, NextResponse } from "next/server";
import { validateRequestBody, ApiSchemas, sanitizeText } from "@/utils/security/input-validation";
import { applyRateLimit, RateLimitConfigs } from "@/utils/security/rate-limiting";
import { requireAuth } from "@/utils/security/jwt";
import { applyApiSecurityHeaders } from "@/utils/security/headers";
import { z } from "zod";

/**
 * Example secure API route demonstrating security best practices
 * This route shows how to implement:
 * - Input validation and sanitization
 * - Rate limiting
 * - Authentication and authorization
 * - Security headers
 * - Error handling
 */

// Request validation schema
const ExampleRequestSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  category: z.enum(['PROJECT', 'MATERIAL', 'TASK']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
});

type ExampleRequest = z.infer<typeof ExampleRequestSchema>;

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    return await applyRateLimit(
      request,
      RateLimitConfigs.api,
      async (req) => {
        // Validate authentication
        const authResult = await requireAuth(req, undefined, ['create:example']);
        if (!authResult.success) {
          const response = NextResponse.json(
            { error: authResult.error },
            { status: 401 }
          );
          return applyApiSecurityHeaders(response);
        }

        // Validate request body
        const validation = await validateRequestBody(req, ExampleRequestSchema);
        if (!validation.success) {
          const response = NextResponse.json(
            { error: 'Validation failed', details: validation.error },
            { status: 400 }
          );
          return applyApiSecurityHeaders(response);
        }

        const data = validation.data;

        // Sanitize input data
        const sanitizedData = {
          title: sanitizeText(data.title),
          description: data.description ? sanitizeText(data.description) : undefined,
          category: data.category,
          priority: data.priority,
          userId: authResult.user.userId,
        };

        // Simulate database operation
        const result = {
          id: crypto.randomUUID(),
          ...sanitizedData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Return success response with security headers
        const response = NextResponse.json(result, { status: 201 });
        return applyApiSecurityHeaders(response);
      }
    );
  } catch (error) {
    console.error('API Error:', error);
    
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return applyApiSecurityHeaders(response);
  }
}

export async function GET(request: NextRequest) {
  try {
    return await applyRateLimit(
      request,
      RateLimitConfigs.api,
      async (req) => {
        // Validate authentication
        const authResult = await requireAuth(req);
        if (!authResult.success) {
          const response = NextResponse.json(
            { error: authResult.error },
            { status: 401 }
          );
          return applyApiSecurityHeaders(response);
        }

        // Validate query parameters
        const { searchParams } = new URL(req.url);
        const paginationValidation = ApiSchemas.pagination.safeParse({
          page: searchParams.get('page'),
          limit: searchParams.get('limit'),
          sortBy: searchParams.get('sortBy'),
          sortOrder: searchParams.get('sortOrder'),
        });

        if (!paginationValidation.success) {
          const response = NextResponse.json(
            { error: 'Invalid query parameters' },
            { status: 400 }
          );
          return applyApiSecurityHeaders(response);
        }

        const { page, limit, sortBy, sortOrder } = paginationValidation.data;

        // Simulate database query with pagination
        const mockData = Array.from({ length: limit }, (_, i) => ({
          id: crypto.randomUUID(),
          title: `Example Item ${(page - 1) * limit + i + 1}`,
          description: 'This is a mock example item',
          category: 'PROJECT',
          priority: 'MEDIUM',
          userId: authResult.user.userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        const result = {
          data: mockData,
          pagination: {
            page,
            limit,
            total: 100, // Mock total
            pages: Math.ceil(100 / limit),
          },
          meta: {
            sortBy,
            sortOrder,
            timestamp: new Date().toISOString(),
          },
        };

        const response = NextResponse.json(result);
        return applyApiSecurityHeaders(response);
      }
    );
  } catch (error) {
    console.error('API Error:', error);
    
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return applyApiSecurityHeaders(response);
  }
}

export async function PUT(request: NextRequest) {
  try {
    return await applyRateLimit(
      request,
      RateLimitConfigs.api,
      async (req) => {
        // Validate authentication with specific permissions
        const authResult = await requireAuth(req, undefined, ['update:example']);
        if (!authResult.success) {
          const response = NextResponse.json(
            { error: authResult.error },
            { status: 401 }
          );
          return applyApiSecurityHeaders(response);
        }

        // Extract and validate ID from URL
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        
        if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
          const response = NextResponse.json(
            { error: 'Invalid ID format' },
            { status: 400 }
          );
          return applyApiSecurityHeaders(response);
        }

        // Validate request body
        const validation = await validateRequestBody(req, ExampleRequestSchema.partial());
        if (!validation.success) {
          const response = NextResponse.json(
            { error: 'Validation failed', details: validation.error },
            { status: 400 }
          );
          return applyApiSecurityHeaders(response);
        }

        const data = validation.data;

        // Sanitize input data
        const sanitizedData: Partial<ExampleRequest> = {};
        if (data.title) sanitizedData.title = sanitizeText(data.title);
        if (data.description) sanitizedData.description = sanitizeText(data.description);
        if (data.category) sanitizedData.category = data.category;
        if (data.priority) sanitizedData.priority = data.priority;

        // Simulate database update
        const result = {
          id,
          ...sanitizedData,
          userId: authResult.user.userId,
          updatedAt: new Date().toISOString(),
        };

        const response = NextResponse.json(result);
        return applyApiSecurityHeaders(response);
      }
    );
  } catch (error) {
    console.error('API Error:', error);
    
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return applyApiSecurityHeaders(response);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    return await applyRateLimit(
      request,
      RateLimitConfigs.api,
      async (req) => {
        // Validate authentication with admin role or delete permission
        const authResult = await requireAuth(req, 'ADMIN', ['delete:example']);
        if (!authResult.success) {
          const response = NextResponse.json(
            { error: authResult.error },
            { status: 401 }
          );
          return applyApiSecurityHeaders(response);
        }

        // Extract and validate ID from URL
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        
        if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
          const response = NextResponse.json(
            { error: 'Invalid ID format' },
            { status: 400 }
          );
          return applyApiSecurityHeaders(response);
        }

        // Simulate database deletion
        const result = {
          id,
          deleted: true,
          deletedAt: new Date().toISOString(),
          deletedBy: authResult.user.userId,
        };

        const response = NextResponse.json(result);
        return applyApiSecurityHeaders(response);
      }
    );
  } catch (error) {
    console.error('API Error:', error);
    
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return applyApiSecurityHeaders(response);
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  return applyApiSecurityHeaders(response);
}