import { NextRequest, NextResponse } from 'next/server'
import { documentService } from '@/services/document.service'

interface RouteParams {
  params: {
    token: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const document = await documentService.getDocumentByShareToken(params.token)

    if (!document) {
      return NextResponse.json(
        { error: 'Invalid or expired share link' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: document
    })

  } catch (error: any) {
    console.error('Get shared document error:', error)

    if (error.message === 'Share link expired') {
      return NextResponse.json(
        { error: 'Share link has expired' },
        { status: 410 }
      )
    }

    if (error.message === 'Share link inactive') {
      return NextResponse.json(
        { error: 'Share link is no longer active' },
        { status: 410 }
      )
    }

    if (error.message === 'Download limit exceeded') {
      return NextResponse.json(
        { error: 'Download limit exceeded for this share link' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        code: 'GET_SHARED_DOCUMENT_FAILED'
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
    // This endpoint is for downloading the shared document
    const { buffer, mimeType, fileName } = await documentService.downloadSharedDocument(params.token)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': buffer.length.toString(),
      },
    })

  } catch (error: any) {
    console.error('Download shared document error:', error)

    if (error.message === 'Share link expired') {
      return NextResponse.json(
        { error: 'Share link has expired' },
        { status: 410 }
      )
    }

    if (error.message === 'Share link inactive') {
      return NextResponse.json(
        { error: 'Share link is no longer active' },
        { status: 410 }
      )
    }

    if (error.message === 'Download limit exceeded') {
      return NextResponse.json(
        { error: 'Download limit exceeded for this share link' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        code: 'DOWNLOAD_SHARED_DOCUMENT_FAILED'
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