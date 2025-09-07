import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { documentService } from '@/services/document.service'
import { DocumentPermission } from '@/types/document.types'

interface RouteParams {
  params: {
    id: string
  }
}

// Validation schema for permission management
const permissionSchema = z.object({
  userId: z.string(),
  permission: z.nativeEnum(DocumentPermission),
  expiresAt: z.string().datetime().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const body = await request.json()
    const validatedData = permissionSchema.parse(body)

    await documentService.grantDocumentPermission(
      params.id,
      validatedData.userId,
      validatedData.permission,
      'current-user-id', // TODO: Get from auth context
      validatedData.expiresAt ? new Date(validatedData.expiresAt) : undefined
    )

    return NextResponse.json({
      success: true,
      message: 'Permission granted successfully'
    })

  } catch (error: any) {
    console.error('Grant permission error:', error)

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

    if (error.message === 'User not found') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (error.message === 'Insufficient permissions') {
      return NextResponse.json(
        { error: 'Insufficient permissions to manage document access' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        code: 'GRANT_PERMISSION_FAILED'
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
    const permissions = await documentService.getDocumentPermissions(params.id)

    return NextResponse.json({
      success: true,
      data: permissions
    })

  } catch (error: any) {
    console.error('Get permissions error:', error)

    if (error.message === 'Document not found') {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        code: 'GET_PERMISSIONS_FAILED'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const permission = searchParams.get('permission') as DocumentPermission

    if (!userId || !permission) {
      return NextResponse.json(
        { error: 'userId and permission are required' },
        { status: 400 }
      )
    }

    await documentService.revokeDocumentPermission(
      params.id,
      userId,
      permission,
      'current-user-id' // TODO: Get from auth context
    )

    return NextResponse.json({
      success: true,
      message: 'Permission revoked successfully'
    })

  } catch (error: any) {
    console.error('Revoke permission error:', error)

    if (error.message === 'Document not found') {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    if (error.message === 'Permission not found') {
      return NextResponse.json(
        { error: 'Permission not found' },
        { status: 404 }
      )
    }

    if (error.message === 'Insufficient permissions') {
      return NextResponse.json(
        { error: 'Insufficient permissions to manage document access' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        code: 'REVOKE_PERMISSION_FAILED'
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
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}