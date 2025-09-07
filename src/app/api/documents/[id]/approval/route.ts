import { NextRequest, NextResponse } from 'next/server'
import { documentService } from '@/services/document.service'
import { ApprovalStatus } from '@/types/document.types'
import { z } from 'zod'

interface RouteParams {
  params: {
    id: string
  }
}

// Validation schema for approval actions
const approvalSchema = z.object({
  status: z.nativeEnum(ApprovalStatus),
  comments: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const body = await request.json()
    const validatedData = approvalSchema.parse(body)

    const result = await documentService.updateDocumentApproval(
      params.id,
      validatedData.status,
      'current-user-id', // TODO: Get from auth context
      validatedData.comments
    )

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('Update approval error:', error)

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
        { error: 'Insufficient permissions to approve document' },
        { status: 403 }
      )
    }

    if (error.message === 'Document does not require approval') {
      return NextResponse.json(
        { error: 'Document does not require approval' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        code: 'UPDATE_APPROVAL_FAILED'
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
    const approval = await documentService.getDocumentApproval(params.id)

    return NextResponse.json({
      success: true,
      data: approval
    })

  } catch (error: any) {
    console.error('Get approval error:', error)

    if (error.message === 'Document not found') {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        code: 'GET_APPROVAL_FAILED'
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