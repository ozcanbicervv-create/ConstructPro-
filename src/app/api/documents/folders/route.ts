import { NextRequest, NextResponse } from 'next/server'
import { documentService } from '@/services/document.service'
import { z } from 'zod'

// Validation schema for folder creation
const createFolderSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  projectId: z.string().optional(),
  parentId: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request data
    const validatedData = createFolderSchema.parse(body)

    // Create folder
    const folder = await documentService.createFolder(
      validatedData.name,
      validatedData.projectId,
      validatedData.parentId,
      validatedData.description
    )

    return NextResponse.json({
      success: true,
      data: folder
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create folder error:', error)

    // Handle validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { 
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        code: 'CREATE_FOLDER_FAILED'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const parentId = searchParams.get('parentId')

    // For now, return empty array since folder functionality requires schema update
    return NextResponse.json({
      success: true,
      data: {
        folders: [],
        documents: []
      }
    })

  } catch (error: any) {
    console.error('Get folders error:', error)

    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        code: 'GET_FOLDERS_FAILED'
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}