import { NextRequest, NextResponse } from 'next/server'
import { documentService } from '@/services/document.service'
import { uploadSingle, handleUploadError, validateFileMetadata } from '@/middleware/upload.middleware'
import { DocumentType } from '@/types/document.types'
import { z } from 'zod'

// Validation schema for upload request
const uploadSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  type: z.nativeEnum(DocumentType).optional(),
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  folderId: z.string().optional(),
  tags: z.array(z.string()).optional()
})

// Helper function to parse multipart form data
async function parseMultipartForm(request: NextRequest): Promise<{
  file: Express.Multer.File | null
  fields: Record<string, string>
}> {
  return new Promise((resolve, reject) => {
    const multerMiddleware = uploadSingle('file')
    
    // Convert NextRequest to Express-like request
    const req = {
      headers: Object.fromEntries(request.headers.entries()),
      method: request.method,
      url: request.url,
      body: request.body
    } as any

    const res = {
      status: () => res,
      json: () => res,
      end: () => res
    } as any

    multerMiddleware(req, res, (error: any) => {
      if (error) {
        reject(error)
        return
      }

      const file = req.file || null
      const fields: Record<string, string> = {}

      // Extract other form fields
      if (req.body) {
        Object.keys(req.body).forEach(key => {
          if (key !== 'file') {
            fields[key] = req.body[key]
          }
        })
      }

      resolve({ file, fields })
    })
  })
}

export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await request.formData()
    
    // Extract file
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
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

    // Extract and validate other form fields
    const fields = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      type: formData.get('type') as string,
      projectId: formData.get('projectId') as string,
      taskId: formData.get('taskId') as string,
      folderId: formData.get('folderId') as string,
      tags: formData.get('tags') as string
    }

    // Parse tags if provided
    let parsedTags: string[] | undefined
    if (fields.tags) {
      try {
        parsedTags = JSON.parse(fields.tags)
      } catch {
        parsedTags = fields.tags.split(',').map(tag => tag.trim())
      }
    }

    // Validate request data
    const validatedData = uploadSchema.parse({
      name: fields.name || undefined,
      description: fields.description || undefined,
      type: fields.type || undefined,
      projectId: fields.projectId || undefined,
      taskId: fields.taskId || undefined,
      folderId: fields.folderId || undefined,
      tags: parsedTags
    })

    // Upload document
    const result = await documentService.uploadDocument({
      file: multerFile,
      ...validatedData
    })

    return NextResponse.json({
      success: true,
      data: result
    }, { status: 201 })

  } catch (error: any) {
    console.error('Document upload error:', error)

    // Handle multer errors
    const uploadError = handleUploadError(error)
    if (uploadError.statusCode !== 500) {
      return NextResponse.json(
        { error: uploadError.message, code: uploadError.code },
        { status: uploadError.statusCode }
      )
    }

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

    // Handle other errors
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        code: 'UPLOAD_FAILED'
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}