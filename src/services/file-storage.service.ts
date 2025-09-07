import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import mime from 'mime-types'
import { StorageProvider, StorageConfig } from '@/types/document.types'

export class FileStorageService {
  private config: StorageConfig

  constructor(config?: Partial<StorageConfig>) {
    this.config = {
      provider: StorageProvider.LOCAL,
      basePath: process.env.UPLOAD_PATH || './uploads',
      maxFileSize: 50 * 1024 * 1024, // 50MB
      allowedMimeTypes: [
        'image/*',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
        'application/zip',
        'application/x-zip-compressed',
        'application/dwg',
        'application/dxf'
      ],
      enableVirusScan: false,
      enableCompression: false,
      ...config
    }
  }

  /**
   * Store a file and return its metadata
   */
  async storeFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    options?: {
      projectId?: string
      taskId?: string
      folderId?: string
      preserveOriginalName?: boolean
    }
  ): Promise<{
    filePath: string
    fileName: string
    fileSize: number
    checksum: string
  }> {
    // Validate file type
    if (!this.isAllowedMimeType(mimeType)) {
      throw new Error(`File type ${mimeType} is not allowed`)
    }

    // Validate file size
    if (buffer.length > this.config.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.config.maxFileSize} bytes`)
    }

    // Generate file path and name
    const fileExtension = path.extname(originalName)
    const fileName = options?.preserveOriginalName 
      ? originalName 
      : `${crypto.randomUUID()}${fileExtension}`
    
    const relativePath = this.generateFilePath(fileName, options)
    const fullPath = path.join(this.config.basePath, relativePath)

    // Ensure directory exists
    await this.ensureDirectoryExists(path.dirname(fullPath))

    // Calculate checksum
    const checksum = crypto.createHash('sha256').update(buffer).digest('hex')

    // Store file based on provider
    switch (this.config.provider) {
      case StorageProvider.LOCAL:
        await this.storeFileLocally(fullPath, buffer)
        break
      case StorageProvider.AWS_S3:
        await this.storeFileS3(relativePath, buffer, mimeType)
        break
      default:
        throw new Error(`Storage provider ${this.config.provider} not implemented`)
    }

    return {
      filePath: relativePath,
      fileName,
      fileSize: buffer.length,
      checksum
    }
  }

  /**
   * Retrieve a file
   */
  async retrieveFile(filePath: string): Promise<{
    buffer: Buffer
    mimeType: string
  }> {
    const fullPath = path.join(this.config.basePath, filePath)
    
    try {
      const buffer = await fs.readFile(fullPath)
      const mimeType = mime.lookup(filePath) || 'application/octet-stream'
      
      return { buffer, mimeType }
    } catch (error) {
      throw new Error(`File not found: ${filePath}`)
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(this.config.basePath, filePath)
    
    try {
      await fs.unlink(fullPath)
    } catch (error) {
      // File might not exist, which is okay for delete operations
      console.warn(`Could not delete file: ${filePath}`, error)
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    const fullPath = path.join(this.config.basePath, filePath)
    
    try {
      await fs.access(fullPath)
      return true
    } catch {
      return false
    }
  }

  /**
   * Get file stats
   */
  async getFileStats(filePath: string): Promise<{
    size: number
    createdAt: Date
    modifiedAt: Date
  }> {
    const fullPath = path.join(this.config.basePath, filePath)
    
    try {
      const stats = await fs.stat(fullPath)
      return {
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
      }
    } catch (error) {
      throw new Error(`Could not get file stats: ${filePath}`)
    }
  }

  /**
   * Generate a unique file path
   */
  private generateFilePath(
    fileName: string,
    options?: {
      projectId?: string
      taskId?: string
      folderId?: string
    }
  ): string {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    let basePath = `${year}/${month}/${day}`

    if (options?.projectId) {
      basePath = `projects/${options.projectId}/${basePath}`
    } else if (options?.taskId) {
      basePath = `tasks/${options.taskId}/${basePath}`
    } else if (options?.folderId) {
      basePath = `folders/${options.folderId}/${basePath}`
    } else {
      basePath = `general/${basePath}`
    }

    return path.join(basePath, fileName)
  }

  /**
   * Ensure directory exists
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true })
    } catch (error) {
      throw new Error(`Could not create directory: ${dirPath}`)
    }
  }

  /**
   * Store file locally
   */
  private async storeFileLocally(fullPath: string, buffer: Buffer): Promise<void> {
    await fs.writeFile(fullPath, buffer)
  }

  /**
   * Store file in AWS S3 (placeholder for future implementation)
   */
  private async storeFileS3(
    filePath: string,
    buffer: Buffer,
    mimeType: string
  ): Promise<void> {
    // TODO: Implement S3 storage
    throw new Error('S3 storage not implemented yet')
  }

  /**
   * Check if mime type is allowed
   */
  private isAllowedMimeType(mimeType: string): boolean {
    return this.config.allowedMimeTypes.some(allowed => {
      if (allowed.endsWith('*')) {
        const prefix = allowed.slice(0, -1)
        return mimeType.startsWith(prefix)
      }
      return mimeType === allowed
    })
  }

  /**
   * Get storage configuration
   */
  getConfig(): StorageConfig {
    return { ...this.config }
  }

  /**
   * Update storage configuration
   */
  updateConfig(config: Partial<StorageConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

// Singleton instance
export const fileStorageService = new FileStorageService()