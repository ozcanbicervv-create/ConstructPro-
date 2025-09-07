import { PrismaClient } from '@prisma/client'
import { fileStorageService } from './file-storage.service'
import {
  DocumentMetadata,
  DocumentVersion,
  DocumentFolder,
  FileUploadRequest,
  FileUploadResponse,
  DocumentSearchFilters,
  DocumentType,
  DocumentPermission,
  DocumentAccessControl,
  DocumentShareLink,
  ApprovalStatus,
  DocumentApproval
} from '@/types/document.types'
import crypto from 'crypto'
import path from 'path'

const prisma = new PrismaClient()

export class DocumentService {
  /**
   * Upload a new document
   */
  async uploadDocument(request: FileUploadRequest): Promise<FileUploadResponse> {
    const { file, name, description, type, projectId, taskId, folderId, tags } = request

    // Store file
    const storageResult = await fileStorageService.storeFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      { projectId, taskId, folderId }
    )

    // Determine document type if not provided
    const documentType = type || this.determineDocumentType(file.mimetype, file.originalname)

    // Create document record
    const document = await prisma.projectDocument.create({
      data: {
        name: name || file.originalname,
        description,
        filePath: storageResult.filePath,
        fileSize: storageResult.fileSize,
        mimeType: file.mimetype,
        type: documentType,
        version: '1.0',
        uploadedBy: 'current-user-id', // TODO: Get from auth context
        projectId: projectId || undefined,
        // Note: taskId and folderId would need to be added to schema
      }
    })

    // Create initial version record
    await this.createDocumentVersion(document.id, {
      version: '1.0',
      filePath: storageResult.filePath,
      fileSize: storageResult.fileSize,
      uploadedBy: 'current-user-id', // TODO: Get from auth context
      changelog: 'Initial upload'
    })

    return {
      id: document.id,
      name: document.name,
      filePath: document.filePath,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
      type: document.type as DocumentType,
      version: document.version,
      url: this.generateFileUrl(document.filePath),
      metadata: this.mapToDocumentMetadata(document)
    }
  }

  /**
   * Upload a new version of an existing document
   */
  async uploadDocumentVersion(
    documentId: string,
    file: Express.Multer.File,
    changelog?: string
  ): Promise<FileUploadResponse> {
    // Get existing document
    const existingDocument = await prisma.projectDocument.findUnique({
      where: { id: documentId }
    })

    if (!existingDocument) {
      throw new Error('Document not found')
    }

    // Store new file
    const storageResult = await fileStorageService.storeFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      { projectId: existingDocument.projectId || undefined }
    )

    // Generate new version number
    const versions = await this.getDocumentVersions(documentId)
    const newVersion = this.generateNextVersion(versions.map(v => v.version))

    // Update document with new version
    const updatedDocument = await prisma.projectDocument.update({
      where: { id: documentId },
      data: {
        filePath: storageResult.filePath,
        fileSize: storageResult.fileSize,
        mimeType: file.mimetype,
        version: newVersion,
        updatedAt: new Date()
      }
    })

    // Create version record
    await this.createDocumentVersion(documentId, {
      version: newVersion,
      filePath: storageResult.filePath,
      fileSize: storageResult.fileSize,
      uploadedBy: 'current-user-id', // TODO: Get from auth context
      changelog: changelog || `Version ${newVersion}`
    })

    return {
      id: updatedDocument.id,
      name: updatedDocument.name,
      filePath: updatedDocument.filePath,
      fileSize: updatedDocument.fileSize,
      mimeType: updatedDocument.mimeType,
      type: updatedDocument.type as DocumentType,
      version: updatedDocument.version,
      url: this.generateFileUrl(updatedDocument.filePath),
      metadata: this.mapToDocumentMetadata(updatedDocument)
    }
  }

  /**
   * Get document by ID
   */
  async getDocument(id: string): Promise<DocumentMetadata | null> {
    const document = await prisma.projectDocument.findUnique({
      where: { id },
      include: {
        project: {
          select: { id: true, name: true }
        }
      }
    })

    if (!document) {
      return null
    }

    return this.mapToDocumentMetadata(document)
  }

  /**
   * Search documents with filters
   */
  async searchDocuments(
    filters: DocumentSearchFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    documents: DocumentMetadata[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const where: any = {}

    if (filters.projectId) {
      where.projectId = filters.projectId
    }

    if (filters.type) {
      where.type = filters.type
    }

    if (filters.mimeType) {
      where.mimeType = { contains: filters.mimeType }
    }

    if (filters.uploadedBy) {
      where.uploadedBy = filters.uploadedBy
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {}
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo
      }
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    const [documents, total] = await Promise.all([
      prisma.projectDocument.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          project: {
            select: { id: true, name: true }
          }
        }
      }),
      prisma.projectDocument.count({ where })
    ])

    return {
      documents: documents.map(doc => this.mapToDocumentMetadata(doc)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(id: string): Promise<void> {
    const document = await prisma.projectDocument.findUnique({
      where: { id }
    })

    if (!document) {
      throw new Error('Document not found')
    }

    // Delete file from storage
    await fileStorageService.deleteFile(document.filePath)

    // Delete all versions from storage
    const versions = await this.getDocumentVersions(id)
    for (const version of versions) {
      await fileStorageService.deleteFile(version.filePath)
    }

    // Delete document record (this will cascade delete versions)
    await prisma.projectDocument.delete({
      where: { id }
    })
  }

  /**
   * Get document versions
   */
  async getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
    // Note: This would require a DocumentVersion model in the schema
    // For now, returning empty array as placeholder
    return []
  }

  /**
   * Download document
   */
  async downloadDocument(id: string): Promise<{
    buffer: Buffer
    mimeType: string
    fileName: string
  }> {
    const document = await prisma.projectDocument.findUnique({
      where: { id }
    })

    if (!document) {
      throw new Error('Document not found')
    }

    const { buffer, mimeType } = await fileStorageService.retrieveFile(document.filePath)

    return {
      buffer,
      mimeType,
      fileName: document.name
    }
  }

  /**
   * Create folder
   */
  async createFolder(
    name: string,
    projectId?: string,
    parentId?: string,
    description?: string
  ): Promise<DocumentFolder> {
    // Note: This would require a DocumentFolder model in the schema
    // For now, throwing error as placeholder
    throw new Error('Folder functionality requires schema update')
  }

  /**
   * Get folder contents
   */
  async getFolderContents(folderId: string): Promise<{
    folders: DocumentFolder[]
    documents: DocumentMetadata[]
  }> {
    // Note: This would require folder models in the schema
    // For now, returning empty results
    return {
      folders: [],
      documents: []
    }
  }

  /**
   * Move document to folder
   */
  async moveDocumentToFolder(documentId: string, folderId?: string): Promise<void> {
    // Note: This would require folderId field in document schema
    throw new Error('Folder functionality requires schema update')
  }

  /**
   * Generate file URL for download
   */
  private generateFileUrl(filePath: string): string {
    return `/api/documents/download/${encodeURIComponent(filePath)}`
  }

  /**
   * Determine document type from mime type and filename
   */
  private determineDocumentType(mimeType: string, filename: string): DocumentType {
    const extension = path.extname(filename).toLowerCase()

    if (mimeType.startsWith('image/')) {
      return DocumentType.PHOTO
    }

    if (mimeType === 'application/pdf') {
      return DocumentType.REPORT
    }

    if (extension === '.dwg' || extension === '.dxf') {
      return DocumentType.CAD_FILE
    }

    if (extension === '.doc' || extension === '.docx') {
      return DocumentType.SPECIFICATION
    }

    return DocumentType.OTHER
  }

  /**
   * Create document version record
   */
  private async createDocumentVersion(
    documentId: string,
    versionData: {
      version: string
      filePath: string
      fileSize: number
      uploadedBy: string
      changelog?: string
    }
  ): Promise<void> {
    // Note: This would require a DocumentVersion model in the schema
    // For now, this is a placeholder
    console.log('Creating document version:', { documentId, ...versionData })
  }

  /**
   * Generate next version number
   */
  private generateNextVersion(existingVersions: string[]): string {
    if (existingVersions.length === 0) {
      return '1.0'
    }

    const versions = existingVersions
      .map(v => {
        const parts = v.split('.')
        return {
          major: parseInt(parts[0]) || 1,
          minor: parseInt(parts[1]) || 0
        }
      })
      .sort((a, b) => {
        if (a.major !== b.major) return b.major - a.major
        return b.minor - a.minor
      })

    const latest = versions[0]
    return `${latest.major}.${latest.minor + 1}`
  }

  /**
   * Create secure share link for document
   */
  async createShareLink(
    documentId: string,
    createdBy: string,
    expiresAt?: Date,
    maxDownloads?: number
  ): Promise<DocumentShareLink> {
    // Check if document exists and user has share permission
    const document = await this.getDocument(documentId)
    if (!document) {
      throw new Error('Document not found')
    }

    // TODO: Check user permissions
    // const hasPermission = await this.checkDocumentPermission(documentId, createdBy, DocumentPermission.SHARE)
    // if (!hasPermission) {
    //   throw new Error('Insufficient permissions')
    // }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex')
    
    // Create share link record (would need ShareLink model in schema)
    const shareLink: DocumentShareLink = {
      id: crypto.randomUUID(),
      documentId,
      token,
      createdBy,
      expiresAt,
      maxDownloads,
      downloadCount: 0,
      isActive: true,
      createdAt: new Date(),
      url: `/api/documents/shared/${token}`
    }

    // TODO: Store in database when ShareLink model is added to schema
    console.log('Creating share link:', shareLink)

    return shareLink
  }

  /**
   * Get document share links
   */
  async getDocumentShareLinks(documentId: string): Promise<DocumentShareLink[]> {
    // TODO: Implement when ShareLink model is added to schema
    console.log('Getting share links for document:', documentId)
    return []
  }

  /**
   * Grant document permission to user
   */
  async grantDocumentPermission(
    documentId: string,
    userId: string,
    permission: DocumentPermission,
    grantedBy: string,
    expiresAt?: Date
  ): Promise<void> {
    // Check if document exists
    const document = await this.getDocument(documentId)
    if (!document) {
      throw new Error('Document not found')
    }

    // TODO: Check if user exists
    // TODO: Check if granter has permission to grant access
    // TODO: Store permission in database when DocumentAccessControl model is added

    console.log('Granting document permission:', {
      documentId,
      userId,
      permission,
      grantedBy,
      expiresAt
    })
  }

  /**
   * Revoke document permission from user
   */
  async revokeDocumentPermission(
    documentId: string,
    userId: string,
    permission: DocumentPermission,
    revokedBy: string
  ): Promise<void> {
    // Check if document exists
    const document = await this.getDocument(documentId)
    if (!document) {
      throw new Error('Document not found')
    }

    // TODO: Check if permission exists
    // TODO: Check if revoker has permission to revoke access
    // TODO: Remove permission from database

    console.log('Revoking document permission:', {
      documentId,
      userId,
      permission,
      revokedBy
    })
  }

  /**
   * Get document permissions
   */
  async getDocumentPermissions(documentId: string): Promise<DocumentAccessControl[]> {
    // Check if document exists
    const document = await this.getDocument(documentId)
    if (!document) {
      throw new Error('Document not found')
    }

    // TODO: Implement when DocumentAccessControl model is added to schema
    console.log('Getting permissions for document:', documentId)
    return []
  }

  /**
   * Update document approval status
   */
  async updateDocumentApproval(
    documentId: string,
    status: ApprovalStatus,
    reviewedBy: string,
    comments?: string
  ): Promise<DocumentApproval> {
    // Check if document exists
    const document = await this.getDocument(documentId)
    if (!document) {
      throw new Error('Document not found')
    }

    // TODO: Check if user has approval permissions
    // TODO: Check if document requires approval

    const approval: DocumentApproval = {
      id: crypto.randomUUID(),
      documentId,
      status,
      reviewedBy,
      comments,
      reviewedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // TODO: Store in database when DocumentApproval model is added to schema
    console.log('Updating document approval:', approval)

    return approval
  }

  /**
   * Get document approval status
   */
  async getDocumentApproval(documentId: string): Promise<DocumentApproval | null> {
    // Check if document exists
    const document = await this.getDocument(documentId)
    if (!document) {
      throw new Error('Document not found')
    }

    // TODO: Implement when DocumentApproval model is added to schema
    console.log('Getting approval for document:', documentId)
    return null
  }

  /**
   * Full-text search in documents
   */
  async fullTextSearch(
    query: string,
    filters: {
      projectId?: string
      taskId?: string
      folderId?: string
      type?: DocumentType
      mimeType?: string
      tags?: string[]
      uploadedBy?: string
      dateFrom?: Date
      dateTo?: Date
      approvalStatus?: string
      searchContent?: boolean
      searchMetadata?: boolean
      sortBy?: string
      sortOrder?: string
    },
    page: number = 1,
    limit: number = 20
  ): Promise<{
    documents: DocumentMetadata[]
    total: number
    page: number
    limit: number
    totalPages: number
    searchTime: number
  }> {
    const startTime = Date.now()

    // Build search conditions
    const where: any = {}

    if (filters.projectId) {
      where.projectId = filters.projectId
    }

    if (filters.type) {
      where.type = filters.type
    }

    if (filters.mimeType) {
      where.mimeType = { contains: filters.mimeType }
    }

    if (filters.uploadedBy) {
      where.uploadedBy = filters.uploadedBy
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {}
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo
      }
    }

    // Full-text search conditions
    if (query) {
      const searchConditions = []

      if (filters.searchMetadata !== false) {
        searchConditions.push(
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        )
      }

      // TODO: Implement content search when full-text search is available
      if (filters.searchContent) {
        // This would require extracting text content from files
        console.log('Content search not yet implemented for query:', query)
      }

      if (searchConditions.length > 0) {
        where.OR = searchConditions
      }
    }

    // Build order by
    let orderBy: any = { createdAt: 'desc' }
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'name':
          orderBy = { name: filters.sortOrder || 'asc' }
          break
        case 'date':
          orderBy = { createdAt: filters.sortOrder || 'desc' }
          break
        case 'size':
          orderBy = { fileSize: filters.sortOrder || 'desc' }
          break
        case 'relevance':
        default:
          orderBy = { createdAt: 'desc' }
          break
      }
    }

    const [documents, total] = await Promise.all([
      prisma.projectDocument.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          project: {
            select: { id: true, name: true }
          }
        }
      }),
      prisma.projectDocument.count({ where })
    ])

    const searchTime = Date.now() - startTime

    return {
      documents: documents.map(doc => this.mapToDocumentMetadata(doc)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      searchTime
    }
  }

  /**
   * Get document by share token
   */
  async getDocumentByShareToken(token: string): Promise<DocumentMetadata | null> {
    // TODO: Implement when ShareLink model is added to schema
    // For now, this is a placeholder that would:
    // 1. Find share link by token
    // 2. Check if link is active and not expired
    // 3. Check download limits
    // 4. Return document metadata

    console.log('Getting document by share token:', token)
    
    // Placeholder validation
    if (!token || token.length < 32) {
      throw new Error('Invalid share token')
    }

    // TODO: Replace with actual database lookup
    // const shareLink = await prisma.shareLink.findUnique({
    //   where: { token },
    //   include: { document: true }
    // })

    // if (!shareLink) {
    //   return null
    // }

    // if (!shareLink.isActive) {
    //   throw new Error('Share link inactive')
    // }

    // if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
    //   throw new Error('Share link expired')
    // }

    // if (shareLink.maxDownloads && shareLink.downloadCount >= shareLink.maxDownloads) {
    //   throw new Error('Download limit exceeded')
    // }

    // return this.mapToDocumentMetadata(shareLink.document)

    return null
  }

  /**
   * Download document via share token
   */
  async downloadSharedDocument(token: string): Promise<{
    buffer: Buffer
    mimeType: string
    fileName: string
  }> {
    // Get document via share token
    const document = await this.getDocumentByShareToken(token)
    
    if (!document) {
      throw new Error('Invalid or expired share link')
    }

    // TODO: Increment download count in share link
    // await prisma.shareLink.update({
    //   where: { token },
    //   data: { downloadCount: { increment: 1 } }
    // })

    // Download the actual file
    return await this.downloadDocument(document.id)
  }

  /**
   * Check document permission for user
   */
  async checkDocumentPermission(
    documentId: string,
    userId: string,
    permission: DocumentPermission
  ): Promise<boolean> {
    // Check if document exists
    const document = await this.getDocument(documentId)
    if (!document) {
      return false
    }

    // Check if user is the uploader (has all permissions)
    if (document.uploadedBy === userId) {
      return true
    }

    // TODO: Check explicit permissions when DocumentAccessControl model is added
    // const accessControl = await prisma.documentAccessControl.findFirst({
    //   where: {
    //     documentId,
    //     userId,
    //     permission,
    //     isActive: true,
    //     OR: [
    //       { expiresAt: null },
    //       { expiresAt: { gt: new Date() } }
    //     ]
    //   }
    // })

    // return !!accessControl

    // For now, return false as placeholder
    console.log('Checking document permission:', { documentId, userId, permission })
    return false
  }

  /**
   * Map database document to DocumentMetadata
   */
  private mapToDocumentMetadata(document: any): DocumentMetadata {
    return {
      id: document.id,
      name: document.name,
      description: document.description,
      filePath: document.filePath,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
      type: document.type as DocumentType,
      version: document.version,
      projectId: document.projectId,
      uploadedBy: document.uploadedBy,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      url: this.generateFileUrl(document.filePath),
      project: document.project ? {
        id: document.project.id,
        name: document.project.name
      } : undefined
    }
  }
}

export const documentService = new DocumentService()