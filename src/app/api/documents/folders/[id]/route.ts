import { NextRequest, NextResponse } from 'next/server'

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
    const contents = await documentService.getFolderContents(params.id)

    return NextResponse.json({
      success: true,
      data: contents
    })

  } catch (error: any) {
    console.error('Get folder contents error:', error)

    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        code: 'GET_FOLDER_CONTENTS_FAILED'
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