import { NextRequest, NextResponse } from 'next/server'

import { uploadSingle, handleUploadError, validateFileMetadata } from '@/middleware/upload.middleware'
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
    const document = await documentService.getDocument(params.id)

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: document
    })

  } catch (error: any) {
    console.error('Get document error:', error)

    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        code: 'GET_DOCUMENT_FAILED'
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Parse multipart form data for new version upload
    const formData = await request.formData()
    
    // Extract file
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided for version update' },
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
      buffer,
      destination: '',
      filename: '',
      path: '',
      stream: null as any
    }

    // Validate file metadata
    const validation = validateFileMetadata(multerFile)
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Invalid file',
          details: validation.errors
        },
        { status: 400 }
      )
    }

    // Extract changelog
    const changelog = formData.get('changelog') as string

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
    console.error('Update document error:', error)

    // Handle multer errors
    const uploadError = handleUploadError(error)
    if (uploadError.statusCode !== 500) {
      return NextResponse.json(
        { error: uploadError.message, code: uploadError.code },
        { status: uploadError.statusCode }
      )
    }

    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        code: 'UPDATE_DOCUMENT_FAILED'
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
    await documentService.deleteDocument(params.id)

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    })

  } catch (error: any) {
    console.error('Delete document error:', error)

    if (error.message === 'Document not found') {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        code: 'DELETE_DOCUMENT_FAILED'
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
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}