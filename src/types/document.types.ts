export interface DocumentMetadata {
  id: string
  name: string
  originalName: string
  description?: string
  filePath: string
  fileSize: number
  mimeType: string
  type: DocumentType
  version: string
  uploadedBy: string
  projectId?: string
  taskId?: string
  folderId?: string
  tags?: string[]
  checksum?: string
  isPublic: boolean
  requiresApproval: boolean
  approvalStatus: ApprovalStatus
  approvedBy?: string
  approvedAt?: Date
  searchContent?: string
  createdAt: Date
  updatedAt: Date
}

export interface DocumentVersion {
  id: string
  documentId: string
  version: string
  filePath: string
  fileSize: number
  uploadedBy: string
  changelog?: string
  createdAt: Date
}

export interface DocumentFolder {
  id: string
  name: string
  description?: string
  parentId?: string
  projectId?: string
  path: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface FileUploadRequest {
  file: Express.Multer.File
  name?: string
  description?: string
  type?: DocumentType
  projectId?: string
  taskId?: string
  folderId?: string
  tags?: string[]
}

export interface FileUploadResponse {
  id: string
  name: string
  filePath: string
  fileSize: number
  mimeType: string
  type: DocumentType
  version: string
  url: string
  metadata: DocumentMetadata
}

export interface DocumentSearchFilters {
  projectId?: string
  taskId?: string
  folderId?: string
  type?: DocumentType
  mimeType?: string
  tags?: string[]
  uploadedBy?: string
  dateFrom?: Date
  dateTo?: Date
  search?: string
}

export interface DocumentAccessControl {
  documentId: string
  userId: string
  permissions: DocumentPermission[]
  grantedBy: string
  grantedAt: Date
  expiresAt?: Date
}

export enum DocumentType {
  BLUEPRINT = 'BLUEPRINT',
  SPECIFICATION = 'SPECIFICATION',
  CONTRACT = 'CONTRACT',
  PHOTO = 'PHOTO',
  REPORT = 'REPORT',
  CAD_FILE = 'CAD_FILE',
  DRAWING = 'DRAWING',
  INVOICE = 'INVOICE',
  CERTIFICATE = 'CERTIFICATE',
  PERMIT = 'PERMIT',
  INSPECTION_REPORT = 'INSPECTION_REPORT',
  SAFETY_DOCUMENT = 'SAFETY_DOCUMENT',
  OTHER = 'OTHER'
}

export enum DocumentPermission {
  READ = 'read',
  write = 'write',
  delete = 'delete',
  share = 'share',
  admin = 'admin'
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REQUIRES_CHANGES = 'REQUIRES_CHANGES'
}

export interface DocumentShareLink {
  id: string
  documentId: string
  token: string
  createdBy: string
  expiresAt?: Date
  maxDownloads?: number
  downloadCount: number
  isActive: boolean
  createdAt: Date
}

export interface DocumentApproval {
  documentId: string
  status: ApprovalStatus
  approvedBy?: string
  approvedAt?: Date
  comments?: string
}

export enum StorageProvider {
  LOCAL = 'LOCAL',
  AWS_S3 = 'AWS_S3',
  AZURE_BLOB = 'AZURE_BLOB',
  GOOGLE_CLOUD = 'GOOGLE_CLOUD'
}

export interface StorageConfig {
  provider: StorageProvider
  basePath: string
  maxFileSize: number
  allowedMimeTypes: string[]
  enableVirusScan: boolean
  enableCompression: boolean
  retentionDays?: number
}