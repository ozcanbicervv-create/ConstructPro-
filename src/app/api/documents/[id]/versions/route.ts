import { NextRequest, NextResponse } from 'next/server'

import { uploadMiddleware } from '@/middleware/upload.middleware'
import { documentService } from '@/services/document.service'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const versions = await documentService.getDocumentVersions(params.id)

    return NextResponse.json({
      success: true,
      data: versions
    })

  } catch (error: any) {
    console.error('Get document versions error:', error)

    if (error.message === 'Document not found') {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        code: 'GET_VERSIONS_FAILED'
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const changelog = formData.get('changelog') as string

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      )
    }

    // Convert File to Express.Multer.File format
    const buffer = Buffer.from(await file.arrayBuffer())
    const multerFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: file.name,
      encoding: '7bit',
      mimetype: file.type,
      size: file.size,
      buffer: buffer,
      destination: '',
      filename: '',
      path: '',
      stream: null as any
    }

    // Validate file
    const validation = uploadMiddleware.validateFileMetadata(multerFile)
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'File validation failed',
          details: validation.errors
        },
        { status: 400 }
      )
    }

    // Upload new version
    const result = await documentService.uploadDocumentVersion(
      params.id,
      multerFile,
      changelog
    )

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('Upload document version error:', error)

    if (error.message === 'Document not found') {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    if (error.message === 'Insufficient permissions') {
      return NextResponse.json(
        { error: 'Insufficient permissions to upload new version' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        code: 'UPLOAD_VERSION_FAILED'
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