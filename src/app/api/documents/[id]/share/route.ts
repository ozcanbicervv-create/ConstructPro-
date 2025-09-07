import { NextRequest, NextResponse } from 'next/server'
import { documentService } from '@/services/document.service'
import { z } from 'zod'

interface RouteParams {
  params: {
    id: string
  }
}

// Validation schema for share link creation
const shareSchema = z.object({
  expiresAt: z.string().datetime().optional(),
  maxDownloads: z.number().min(1).optional(),
})

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const body = await request.json()
    const validatedData = shareSchema.parse(body)

    const shareLink = await documentService.createShareLink(
      params.id,
      'current-user-id', // TODO: Get from auth context
      validatedData.expiresAt ? new Date(validatedData.expiresAt) : undefined,
      validatedData.maxDownloads
    )

    return NextResponse.json({
      success: true,
      data: shareLink
    })

  } catch (error: any) {
    console.error('Create share link error:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors
        },
        { status: 400 }
      )
    }

    if (error.message === 'Document not found') {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    if (error.message === 'Insufficient permissions') {
      return NextResponse.json(
        { error: 'Insufficient permissions to share document' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        code: 'CREATE_SHARE_LINK_FAILED'
      },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const shareLinks = await documentService.getDocumentShareLinks(params.id)

    return NextResponse.json({
      success: true,
      data: shareLinks
    })

  } catch (error: any) {
    console.error('Get share links error:', error)

    if (error.message === 'Document not found') {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        code: 'GET_SHARE_LINKS_FAILED'
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