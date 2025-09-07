import multer from 'multer'
import { NextRequest } from 'next/server'
import { fileStorageService } from '@/services/file-storage.service'

// Configure multer for memory storage
const storage = multer.memoryStorage()

// File filter function
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const config = fileStorageService.getConfig()
  
  // Check file size
  if (req.headers['content-length'] && 
      parseInt(req.headers['content-length']) > config.maxFileSize) {
    return cb(new Error(`File size exceeds maximum allowed size of ${config.maxFileSize} bytes`))
  }

  // Check mime type
  const isAllowed = config.allowedMimeTypes.some(allowed => {
    if (allowed.endsWith('*')) {
      const prefix = allowed.slice(0, -1)
      return file.mimetype.startsWith(prefix)
    }
    return file.mimetype === allowed
  })

  if (!isAllowed) {
    return cb(new Error(`File type ${file.mimetype} is not allowed`))
  }

  cb(null, true)
}

// Create multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: fileStorageService.getConfig().maxFileSize,
    files: 10, // Maximum 10 files per request
    fields: 20, // Maximum 20 non-file fields
    fieldSize: 1024 * 1024 // 1MB per field
  }
})

// Middleware for single file upload
export const uploadSingle = (fieldName: string = 'file') => {
  return upload.single(fieldName)
}

// Middleware for multiple file upload
export const uploadMultiple = (fieldName: string = 'files', maxCount: number = 10) => {
  return upload.array(fieldName, maxCount)
}

// Middleware for mixed file upload (multiple fields)
export const uploadFields = (fields: { name: string; maxCount?: number }[]) => {
  return upload.fields(fields)
}

// Error handler for multer errors
export const handleUploadError = (error: any) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return {
          code: 'FILE_TOO_LARGE',
          message: 'File size exceeds the maximum allowed limit',
          statusCode: 413
        }
      case 'LIMIT_FILE_COUNT':
        return {
          code: 'TOO_MANY_FILES',
          message: 'Too many files uploaded',
          statusCode: 400
        }
      case 'LIMIT_UNEXPECTED_FILE':
        return {
          code: 'UNEXPECTED_FILE',
          message: 'Unexpected file field',
          statusCode: 400
        }
      case 'LIMIT_FIELD_COUNT':
        return {
          code: 'TOO_MANY_FIELDS',
          message: 'Too many form fields',
          statusCode: 400
        }
      case 'LIMIT_FIELD_SIZE':
        return {
          code: 'FIELD_TOO_LARGE',
          message: 'Form field value too large',
          statusCode: 400
        }
      default:
        return {
          code: 'UPLOAD_ERROR',
          message: error.message || 'File upload error',
          statusCode: 400
        }
    }
  }

  // Handle custom file filter errors
  if (error.message) {
    return {
      code: 'INVALID_FILE',
      message: error.message,
      statusCode: 400
    }
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred during file upload',
    statusCode: 500
  }
}

// Utility function to validate file metadata
export const validateFileMetadata = (file: Express.Multer.File) => {
  const errors: string[] = []

  if (!file.originalname) {
    errors.push('File name is required')
  }

  if (!file.mimetype) {
    errors.push('File mime type is required')
  }

  if (!file.buffer || file.buffer.length === 0) {
    errors.push('File content is required')
  }

  // Check for potentially dangerous file names
  const dangerousPatterns = [
    /\.\./,  // Directory traversal
    /[<>:"|?*]/,  // Invalid filename characters
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i  // Windows reserved names
  ]

  if (dangerousPatterns.some(pattern => pattern.test(file.originalname))) {
    errors.push('File name contains invalid characters')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Utility function to extract metadata from file
export const extractFileMetadata = (file: Express.Multer.File) => {
  return {
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    encoding: file.encoding,
    fieldName: file.fieldname
  }
}

// Utility function to generate safe filename
export const generateSafeFilename = (originalName: string): string => {
  // Remove or replace dangerous characters
  const safeName = originalName
    .replace(/[<>:"|?*]/g, '_')
    .replace(/\.\./g, '_')
    .replace(/\s+/g, '_')
    .toLowerCase()

  // Get filename without extension for reserved name check
  const nameWithoutExt = safeName.split('.')[0]

  // Ensure filename is not empty and not a reserved name
  if (!safeName || /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i.test(nameWithoutExt)) {
    return `file_${Date.now()}`
  }

  return safeName
}