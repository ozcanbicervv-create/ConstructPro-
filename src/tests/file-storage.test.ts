import fs from 'fs/promises'
import path from 'path'

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'

import { validateFileMetadata, generateSafeFilename } from '@/middleware/upload.middleware'
import { fileStorageService } from '@/services/file-storage.service'

describe('File Storage System', () => {
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

  describe('File Upload Validation', () => {
    it('should validate file metadata correctly', () => {
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

    it('should reject files with dangerous names', () => {
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

    it('should generate safe filenames', () => {
      expect(generateSafeFilename('normal-file.pdf')).toBe('normal-file.pdf')
      expect(generateSafeFilename('file with spaces.pdf')).toBe('file_with_spaces.pdf')
      expect(generateSafeFilename('file<>:|"?*.pdf')).toBe('file_______.pdf')
      expect(generateSafeFilename('CON.txt')).toMatch(/^file_\d+$/)
    })
  })
})