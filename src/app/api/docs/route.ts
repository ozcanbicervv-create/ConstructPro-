import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * API Documentation Endpoint
 * Serves the OpenAPI specification in JSON format
 */
export async function GET(request: NextRequest) {
  try {
    // Read the OpenAPI JSON file (we'll convert YAML to JSON)
    const jsonPath = join(process.cwd(), 'docs', 'api', 'openapi.json');
    const jsonContent = readFileSync(jsonPath, 'utf8');
    
    // Parse JSON
    const openApiSpec = JSON.parse(jsonContent);
    
    // Add dynamic server URLs based on request
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    
    // Update servers in the spec
    if (openApiSpec && typeof openApiSpec === 'object' && 'servers' in openApiSpec) {
      const spec = openApiSpec as any;
      spec.servers = [
        {
          url: `${baseUrl}/api`,
          description: 'Current server'
        },
        ...(spec.servers || [])
      ];
    }
    
    return NextResponse.json(openApiSpec, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error('Error serving API documentation:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to load API documentation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * API Documentation Metadata
 * Returns basic information about the API documentation
 */
export async function HEAD(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Version': '1.0.0',
      'X-Documentation-Format': 'OpenAPI 3.0.3',
    },
  });
}