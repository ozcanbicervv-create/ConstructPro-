import fs from 'fs/promises'
import path from 'path'

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'

import { documentService } from '@/services/document.service'
import { fileStorageService } from '@/services/file-storage.service'
import { DocumentType } from '@/types/document.types'

// Mock Prisma client
const mockPrismaInstance = {
  projectDocument: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
}

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrismaInstance)
}))

describe('Document Management System', () => {
  const testUploadPath = './test-uploads'
  
  beforeEach(async () => {
    // Create test upload directory
    try {
      await fs.mkdir(testUploadPath, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }
    
    // Configure file storage service for testing
    fileStorageService.updateConfig({
      basePath: testUploadPath,
      maxFileSize: 1024 * 1024, // 1MB for testing
      allowedMimeTypes: ['image/*', 'application/pdf', 'text/plain']
    })
  })

  afterEach(async () => {
    // Clean up test files
    try {
      await fs.rm(testUploadPath, { recursive: true, force: true })
    } catch (error) {
      // Directory might not exist
    }
  })

  describe('FileStorageService', () => {
    it('should store a file successfully', async () => {
      const testContent = Buffer.from('Test file content')
      const originalName = 'test.txt'
      const mimeType = 'text/plain'

      const result = await fileStorageService.storeFile(
        testContent,
        originalName,
        mimeType
      )

      expect(result.fileName).toBeDefined()
      expect(result.filePath).toBeDefined()
      expect(result.fileSize).toBe(testContent.length)
      expect(result.checksum).toBeDefined()

      // Verify file was actually stored
      const exists = await fileStorageService.fileExists(result.filePath)
      expect(exists).toBe(true)
    })

    it('should reject files that are too large', async () => {
      const largeContent = Buffer.alloc(2 * 1024 * 1024) // 2MB
      const originalName = 'large.txt'
      const mimeType = 'text/plain'

      await expect(
        fileStorageService.storeFile(largeContent, originalName, mimeType)
      ).rejects.toThrow('File size exceeds maximum allowed size')
    })

    it('should reject disallowed file types', async () => {
      const testContent = Buffer.from('Test content')
      const originalName = 'test.exe'
      const mimeType = 'application/x-executable'

      await expect(
        fileStorageService.storeFile(testContent, originalName, mimeType)
      ).rejects.toThrow('File type application/x-executable is not allowed')
    })

    it('should retrieve a stored file', async () => {
      const testContent = Buffer.from('Test file content')
      const originalName = 'test.txt'
      const mimeType = 'text/plain'

      const storeResult = await fileStorageService.storeFile(
        testContent,
        originalName,
        mimeType
      )

      const retrieveResult = await fileStorageService.retrieveFile(storeResult.filePath)

      expect(retrieveResult.buffer.equals(testContent)).toBe(true)
      expect(retrieveResult.mimeType).toBe(mimeType)
    })

    it('should delete a file', async () => {
      const testContent = Buffer.from('Test file content')
      const originalName = 'test.txt'
      const mimeType = 'text/plain'

      const storeResult = await fileStorageService.storeFile(
        testContent,
        originalName,
        mimeType
      )

      // Verify file exists
      let exists = await fileStorageService.fileExists(storeResult.filePath)
      expect(exists).toBe(true)

      // Delete file
      await fileStorageService.deleteFile(storeResult.filePath)

      // Verify file no longer exists
      exists = await fileStorageService.fileExists(storeResult.filePath)
      expect(exists).toBe(false)
    })

    it('should generate unique file paths', async () => {
      const testContent = Buffer.from('Test content')
      const originalName = 'test.txt'
      const mimeType = 'text/plain'

      const result1 = await fileStorageService.storeFile(
        testContent,
        originalName,
        mimeType
      )

      const result2 = await fileStorageService.storeFile(
        testContent,
        originalName,
        mimeType
      )

      expect(result1.filePath).not.toBe(result2.filePath)
    })

    it('should organize files by project', async () => {
      const testContent = Buffer.from('Test content')
      const originalName = 'test.txt'
      const mimeType = 'text/plain'
      const projectId = 'project-123'

      const result = await fileStorageService.storeFile(
        testContent,
        originalName,
        mimeType,
        { projectId }
      )

      expect(result.filePath).toContain(`projects${path.sep}${projectId}`)
    })
  })

  describe('DocumentService', () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test-document.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('Mock PDF content'),
      destination: '',
      filename: '',
      path: '',
      stream: null as any
    }

    it('should upload a document successfully', async () => {
      // Mock Prisma create method
      const mockDocument = {
        id: 'doc-123',
        name: 'test-document.pdf',
        description: null,
        filePath: 'projects/proj-123/2024/01/15/test-document.pdf',
        fileSize: 1024,
        mimeType: 'application/pdf',
        type: DocumentType.REPORT,
        version: '1.0',
        uploadedBy: 'user-123',
        projectId: 'proj-123',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockPrismaInstance.projectDocument.create.mockResolvedValue(mockDocument)

      const result = await documentService.uploadDocument({
        file: mockFile,
        projectId: 'proj-123',
        type: DocumentType.REPORT
      })

      expect(result.id).toBe('doc-123')
      expect(result.name).toBe('test-document.pdf')
      expect(result.type).toBe(DocumentType.REPORT)
      expect(result.version).toBe('1.0')
    })

    it('should determine document type from mime type', async () => {
      const imageFile = { ...mockFile, mimetype: 'image/jpeg', originalname: 'photo.jpg' }
      
      // Mock Prisma create method
      const mockDocument = {
        id: 'doc-124',
        name: 'photo.jpg',
        description: null,
        filePath: 'general/2024/01/15/photo.jpg',
        fileSize: 1024,
        mimeType: 'image/jpeg',
        type: DocumentType.PHOTO,
        version: '1.0',
        uploadedBy: 'user-123',
        projectId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockPrismaInstance.projectDocument.create.mockResolvedValue(mockDocument)

      const result = await documentService.uploadDocument({
        file: imageFile
      })

      expect(result.type).toBe(DocumentType.PHOTO)
    })

    it('should search documents with filters', async () => {
      const mockDocuments = [
        {
          id: 'doc-1',
          name: 'Blueprint 1',
          description: null,
          filePath: 'test/path1.pdf',
          fileSize: 1024,
          mimeType: 'application/pdf',
          type: DocumentType.BLUEPRINT,
          version: '1.0',
          uploadedBy: 'user-123',
          projectId: 'proj-123',
          createdAt: new Date(),
          updatedAt: new Date(),
          project: { id: 'proj-123', name: 'Test Project' }
        },
        {
          id: 'doc-2',
          name: 'Report 1',
          description: null,
          filePath: 'test/path2.pdf',
          fileSize: 2048,
          mimeType: 'application/pdf',
          type: DocumentType.REPORT,
          version: '1.0',
          uploadedBy: 'user-123',
          projectId: 'proj-123',
          createdAt: new Date(),
          updatedAt: new Date(),
          project: { id: 'proj-123', name: 'Test Project' }
        }
      ]

      mockPrismaInstance.projectDocument.findMany.mockResolvedValue(mockDocuments)
      mockPrismaInstance.projectDocument.count.mockResolvedValue(2)

      const result = await documentService.searchDocuments({
        projectId: 'proj-123',
        type: DocumentType.BLUEPRINT
      })

      expect(result.documents).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.page).toBe(1)
    })

    it('should handle document not found', async () => {
      mockPrismaInstance.projectDocument.findUnique.mockResolvedValue(null)

      const result = await documentService.getDocument('non-existent-id')
      expect(result).toBeNull()
    })

    it('should delete document and associated files', async () => {
      const mockDocument = {
        id: 'doc-123',
        filePath: 'test/path/document.pdf'
      }

      mockPrismaInstance.projectDocument.findUnique.mockResolvedValue(mockDocument)
      mockPrismaInstance.projectDocument.delete.mockResolvedValue(mockDocument)

      // Mock file storage service methods
      const deleteFileSpy = jest.spyOn(fileStorageService, 'deleteFile')
        .mockResolvedValue(undefined)

      await documentService.deleteDocument('doc-123')

      expect(deleteFileSpy).toHaveBeenCalledWith('test/path/document.pdf')
      expect(mockPrismaInstance.projectDocument.delete).toHaveBeenCalledWith({
        where: { id: 'doc-123' }
      })
    })
  })

  describe('File Upload Validation', () => {
    it('should validate file metadata correctly', async () => {
      const { validateFileMetadata } = await import('@/middleware/upload.middleware')
      
      const validFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'valid-document.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('content'),
        destination: '',
        filename: '',
        path: '',
        stream: null as any
      }

      const result = validateFileMetadata(validFile)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject files with dangerous names', async () => {
      const { validateFileMetadata } = await import('@/middleware/upload.middleware')
      
      const dangerousFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: '../../../etc/passwd',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 1024,
        buffer: Buffer.from('content'),
        destination: '',
        filename: '',
        path: '',
        stream: null as any
      }

      const result = validateFileMetadata(dangerousFile)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('File name contains invalid characters')
    })

    it('should generate safe filenames', async () => {
      const { generateSafeFilename } = await import('@/middleware/upload.middleware')
      
      expect(generateSafeFilename('normal-file.pdf')).toBe('normal-file.pdf')
      expect(generateSafeFilename('file with spaces.pdf')).toBe('file_with_spaces.pdf')
      expect(generateSafeFilename('file<>:|"?*.pdf')).toBe('file_______.pdf')
      expect(generateSafeFilename('CON.txt')).toMatch(/^file_\d+$/)
    })
  })
})