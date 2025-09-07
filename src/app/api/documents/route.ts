import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { documentService } from '@/services/document.service'
import { DocumentSearchFilters, DocumentType } from '@/types/document.types'

// Validation schema for search filters
const searchSchema = z.object({
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  folderId: z.string().optional(),
  type: z.nativeEnum(DocumentType).optional(),
  mimeType: z.string().optional(),
  tags: z.array(z.string()).optional(),
  uploadedBy: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const queryParams = {
      projectId: searchParams.get('projectId') || undefined,
      taskId: searchParams.get('taskId') || undefined,
      folderId: searchParams.get('folderId') || undefined,
      type: searchParams.get('type') || undefined,
      mimeType: searchParams.get('mimeType') || undefined,
      tags: searchParams.get('tags')?.split(',') || undefined,
      uploadedBy: searchParams.get('uploadedBy') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20')
    }

    // Validate query parameters
    const validatedParams = searchSchema.parse(queryParams)

    // Build search filters
    const filters: DocumentSearchFilters = {
      projectId: validatedParams.projectId,
      taskId: validatedParams.taskId,
      folderId: validatedParams.folderId,
      type: validatedParams.type,
      mimeType: validatedParams.mimeType,
      tags: validatedParams.tags,
      uploadedBy: validatedParams.uploadedBy,
      dateFrom: validatedParams.dateFrom ? new Date(validatedParams.dateFrom) : undefined,
      dateTo: validatedParams.dateTo ? new Date(validatedParams.dateTo) : undefined,
      search: validatedParams.search
    }

    // Search documents
    const result = await documentService.searchDocuments(
      filters,
      validatedParams.page,
      validatedParams.limit
    )

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('Document search error:', error)

    // Handle validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        code: 'SEARCH_FAILED'
      },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}