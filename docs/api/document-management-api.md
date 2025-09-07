# Document Management API

## Overview

The Document Management API provides comprehensive functionality for handling construction project documents, including file uploads, version control, access permissions, sharing, and approval workflows.

## Base URL

```
/api/documents
```

## Authentication

All endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Document CRUD Operations

#### Upload Document

Upload a new document to the system.

```http
POST /api/documents/upload
Content-Type: multipart/form-data
```

**Form Data:**
- `file` (required): The file to upload
- `name` (optional): Custom name for the document
- `description` (optional): Document description
- `type` (optional): Document type (BLUEPRINT, SPECIFICATION, REPORT, PHOTO, CAD_FILE, OTHER)
- `projectId` (optional): Associated project ID
- `taskId` (optional): Associated task ID
- `folderId` (optional): Target folder ID
- `tags` (optional): Comma-separated tags

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "doc_123",
    "name": "Blueprint_v1.pdf",
    "filePath": "/uploads/projects/proj_123/Blueprint_v1.pdf",
    "fileSize": 2048576,
    "mimeType": "application/pdf",
    "type": "BLUEPRINT",
    "version": "1.0",
    "url": "/api/documents/download/uploads%2Fprojects%2Fproj_123%2FBlueprint_v1.pdf",
    "metadata": {
      "id": "doc_123",
      "name": "Blueprint_v1.pdf",
      "projectId": "proj_123",
      "uploadedBy": "user_123",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

#### Get Documents (Search & Filter)

Retrieve documents with filtering and search capabilities.

```http
GET /api/documents?projectId=proj_123&type=BLUEPRINT&search=foundation&page=1&limit=20
```

**Query Parameters:**
- `projectId` (optional): Filter by project
- `taskId` (optional): Filter by task
- `folderId` (optional): Filter by folder
- `type` (optional): Filter by document type
- `mimeType` (optional): Filter by MIME type
- `tags` (optional): Comma-separated tags to filter by
- `uploadedBy` (optional): Filter by uploader
- `dateFrom` (optional): Filter by creation date (ISO 8601)
- `dateTo` (optional): Filter by creation date (ISO 8601)
- `search` (optional): Search in name and description
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "doc_123",
        "name": "Foundation Blueprint.pdf",
        "description": "Foundation layout and specifications",
        "type": "BLUEPRINT",
        "fileSize": 2048576,
        "mimeType": "application/pdf",
        "version": "1.0",
        "projectId": "proj_123",
        "uploadedBy": "user_123",
        "createdAt": "2024-01-15T10:30:00Z",
        "url": "/api/documents/download/...",
        "project": {
          "id": "proj_123",
          "name": "Office Building Construction"
        }
      }
    ],
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

#### Get Document by ID

Retrieve a specific document's metadata.

```http
GET /api/documents/{documentId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "doc_123",
    "name": "Foundation Blueprint.pdf",
    "description": "Foundation layout and specifications",
    "type": "BLUEPRINT",
    "fileSize": 2048576,
    "mimeType": "application/pdf",
    "version": "1.0",
    "projectId": "proj_123",
    "uploadedBy": "user_123",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "url": "/api/documents/download/..."
  }
}
```

#### Update Document

Update document metadata.

```http
PATCH /api/documents/{documentId}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Foundation Blueprint.pdf",
  "description": "Updated foundation layout with revisions",
  "tags": ["foundation", "blueprint", "revised"]
}
```

#### Delete Document

Delete a document and all its versions.

```http
DELETE /api/documents/{documentId}
```

**Response:**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

### Advanced Search

#### Full-Text Search

Perform advanced full-text search across documents.

```http
GET /api/documents/search?query=foundation&searchContent=true&sortBy=relevance
```

**Query Parameters:**
- `query` (required): Search query
- `projectId` (optional): Filter by project
- `taskId` (optional): Filter by task
- `folderId` (optional): Filter by folder
- `type` (optional): Filter by document type
- `mimeType` (optional): Filter by MIME type
- `tags` (optional): Comma-separated tags
- `uploadedBy` (optional): Filter by uploader
- `dateFrom` (optional): Filter by date range
- `dateTo` (optional): Filter by date range
- `approvalStatus` (optional): Filter by approval status
- `searchContent` (optional): Search in file content (default: true)
- `searchMetadata` (optional): Search in metadata (default: true)
- `sortBy` (optional): Sort by relevance, date, name, size (default: relevance)
- `sortOrder` (optional): asc or desc (default: desc)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "documents": [...],
    "total": 15,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "searchTime": 45
  }
}
```

### Folder Management

#### Create Folder

Create a new document folder.

```http
POST /api/documents/folders
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Blueprints",
  "description": "All project blueprints",
  "projectId": "proj_123",
  "parentId": "folder_456"
}
```

#### Get Folder Contents

Get contents of a specific folder.

```http
GET /api/documents/folders/{folderId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "folder": {
      "id": "folder_123",
      "name": "Blueprints",
      "description": "All project blueprints"
    },
    "folders": [...],
    "documents": [...]
  }
}
```

### Permission Management

#### Grant Document Permission

Grant access permission to a user for a specific document.

```http
POST /api/documents/{documentId}/permissions
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user_456",
  "permission": "READ",
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

**Permission Types:**
- `READ`: Can view and download the document
- `WRITE`: Can modify document metadata
- `SHARE`: Can create share links
- `DELETE`: Can delete the document
- `APPROVE`: Can approve/reject the document

#### Get Document Permissions

Get all permissions for a document.

```http
GET /api/documents/{documentId}/permissions
```

#### Revoke Document Permission

Remove a specific permission from a user.

```http
DELETE /api/documents/{documentId}/permissions?userId=user_456&permission=READ
```

### Document Sharing

#### Create Share Link

Create a secure share link for external access.

```http
POST /api/documents/{documentId}/share
Content-Type: application/json
```

**Request Body:**
```json
{
  "expiresAt": "2024-12-31T23:59:59Z",
  "maxDownloads": 10
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "share_123",
    "token": "abc123def456...",
    "url": "/api/documents/shared/abc123def456...",
    "expiresAt": "2024-12-31T23:59:59Z",
    "maxDownloads": 10,
    "downloadCount": 0,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Get Share Links

Get all active share links for a document.

```http
GET /api/documents/{documentId}/share
```

#### Access Shared Document

Access a document via share link (no authentication required).

```http
GET /api/documents/shared/{token}
```

#### Download Shared Document

Download a document via share link.

```http
POST /api/documents/shared/{token}
```

### Document Approval Workflow

#### Update Approval Status

Approve or reject a document.

```http
POST /api/documents/{documentId}/approval
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "APPROVED",
  "comments": "Foundation design meets all requirements"
}
```

**Approval Status:**
- `PENDING`: Awaiting approval
- `APPROVED`: Document approved
- `REJECTED`: Document rejected
- `REVISION_REQUIRED`: Needs revision

#### Get Approval Status

Get current approval status of a document.

```http
GET /api/documents/{documentId}/approval
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "approval_123",
    "documentId": "doc_123",
    "status": "APPROVED",
    "reviewedBy": "user_456",
    "comments": "Foundation design meets all requirements",
    "reviewedAt": "2024-01-15T14:30:00Z"
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {...}
}
```

### Common Error Codes

- `DOCUMENT_NOT_FOUND`: Document does not exist
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `FILE_UPLOAD_FAILED`: File upload failed
- `INVALID_FILE_TYPE`: File type not allowed
- `FILE_TOO_LARGE`: File exceeds size limit
- `VALIDATION_ERROR`: Request validation failed
- `SHARE_LINK_EXPIRED`: Share link has expired
- `DOWNLOAD_LIMIT_EXCEEDED`: Share link download limit reached

## File Upload Limits

- Maximum file size: 50MB
- Allowed file types:
  - Images: jpg, jpeg, png, gif, bmp, webp
  - Documents: pdf, doc, docx, txt, rtf
  - CAD Files: dwg, dxf, step, iges
  - Archives: zip, rar, 7z
  - Spreadsheets: xls, xlsx, csv

## Rate Limiting

- 100 requests per 15-minute window per user
- File upload endpoints: 10 requests per minute
- Search endpoints: 30 requests per minute

## Examples

### Upload a Blueprint

```bash
curl -X POST \
  -H "Authorization: Bearer your_jwt_token" \
  -F "file=@blueprint.pdf" \
  -F "name=Foundation Blueprint" \
  -F "type=BLUEPRINT" \
  -F "projectId=proj_123" \
  -F "description=Foundation layout and specifications" \
  http://localhost:3000/api/documents/upload
```

### Search Documents

```bash
curl -X GET \
  -H "Authorization: Bearer your_jwt_token" \
  "http://localhost:3000/api/documents/search?query=foundation&type=BLUEPRINT&projectId=proj_123"
```

### Create Share Link

```bash
curl -X POST \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{"expiresAt":"2024-12-31T23:59:59Z","maxDownloads":5}' \
  http://localhost:3000/api/documents/doc_123/share
```