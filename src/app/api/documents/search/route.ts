import { NextRequest, NextResponse } from 'next/server'
import { documentService } from '@/services/document.service'
import { DocumentType } from '@/types/document.types'
import { z } from 'zod'

// Validation schema for advanced search
const searchSchema = z.object({
  query: z.string().min(1),
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  folderId: z.string().optional(),
  type: z.nativeEnum(DocumentType).optional(),
  mimeType: z.string().optional(),
  tags: z.array(z.string()).optional(),
  uploadedBy: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  approvalStatus: z.string().optional(),
  searchContent: z.boolean().default(true),
  searchMetadata: z.boolean().default(true),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['relevance', 'date', 'name', 'size']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const queryParams = {
      query: searchParams.get('query') || '',
      projectId: searchParams.get('projectId') || undefined,
      taskId: searchParams.get('taskId') || undefined,
      folderId: searchParams.get('folderId') || undefined,
      type: searchParams.get('type') || undefined,
      mimeType: searchParams.get('mimeType') || undefined,
      tags: searchParams.get('tags')?.split(',') || undefined,
      uploadedBy: searchParams.get('uploadedBy') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      approvalStatus: searchParams.get('approvalStatus') || undefined,
      searchContent: searchParams.get('searchContent') === 'true',
      searchMetadata: searchParams.get('searchMetadata') !== 'false',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      sortBy: searchParams.get('sortBy') || 'relevance',
      sortOrder: searchParams.get('sortOrder') || 'desc'
    }

    // Validate query parameters
    const validatedParams = searchSchema.parse(queryParams)

    // Perform full-text search
    const result = await documentService.fullTextSearch(
      validatedParams.query,
      {
        projectId: validatedParams.projectId,
        taskId: validatedParams.taskId,
        folderId: validatedParams.folderId,
        type: validatedParams.type,
        mimeType: validatedParams.mimeType,
        tags: validatedParams.tags,
        uploadedBy: validatedParams.uploadedBy,
        dateFrom: validatedParams.dateFrom ? new Date(validatedParams.dateFrom) : undefined,
        dateTo: validatedParams.dateTo ? new Date(validatedParams.dateTo) : undefined,
        approvalStatus: validatedParams.approvalStatus,
        searchContent: validatedParams.searchContent,
        searchMetadata: validatedParams.searchMetadata,
        sortBy: validatedParams.sortBy,
        sortOrder: validatedParams.sortOrder
      },
      validatedParams.page,
      validatedParams.limit
    )

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('Full-text search error:', error)

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