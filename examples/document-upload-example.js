/**
 * Document Upload Example
 * 
 * This example demonstrates how to use the document management API
 * to upload, search, and manage construction project documents.
 */

// Example: Upload a document using fetch API
async function uploadDocument(file, projectId, documentType) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('projectId', projectId)
  formData.append('type', documentType)
  formData.append('description', 'Uploaded via API example')

  try {
    const response = await fetch('/api/documents/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    console.log('Document uploaded successfully:', result.data)
    return result.data
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}

// Example: Search for documents
async function searchDocuments(filters = {}) {
  const params = new URLSearchParams()
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, value.toString())
    }
  })

  try {
    const response = await fetch(`/api/documents?${params}`)
    
    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`)
    }

    const result = await response.json()
    console.log('Documents found:', result.data)
    return result.data
  } catch (error) {
    console.error('Search error:', error)
    throw error
  }
}

// Example: Download a document
async function downloadDocument(documentId) {
  try {
    const response = await fetch(`/api/documents/${documentId}/download`)
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`)
    }

    // Get filename from Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition')
    const filename = contentDisposition
      ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
      : 'download'

    // Create blob and download
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    console.log('Document downloaded:', filename)
  } catch (error) {
    console.error('Download error:', error)
    throw error
  }
}

// Example: Delete a document
async function deleteDocument(documentId) {
  try {
    const response = await fetch(`/api/documents/${documentId}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`)
    }

    const result = await response.json()
    console.log('Document deleted successfully:', result.message)
    return result
  } catch (error) {
    console.error('Delete error:', error)
    throw error
  }
}

// Example: Upload a new version of an existing document
async function uploadDocumentVersion(documentId, file, changelog) {
  const formData = new FormData()
  formData.append('file', file)
  if (changelog) {
    formData.append('changelog', changelog)
  }

  try {
    const response = await fetch(`/api/documents/${documentId}`, {
      method: 'PUT',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Version upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    console.log('New version uploaded:', result.data)
    return result.data
  } catch (error) {
    console.error('Version upload error:', error)
    throw error
  }
}

// Example usage in a React component or vanilla JavaScript

// HTML file input handler
function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) {return}

  const projectId = 'proj-123' // Get from your application state
  const documentType = 'BLUEPRINT' // Determine based on file type or user selection

  uploadDocument(file, projectId, documentType)
    .then(document => {
      console.log('Upload successful:', document)
      // Update UI with new document
    })
    .catch(error => {
      console.error('Upload failed:', error)
      // Show error message to user
    })
}

// Search example
function searchProjectDocuments(projectId) {
  const filters = {
    projectId: projectId,
    type: 'BLUEPRINT',
    page: 1,
    limit: 10
  }

  searchDocuments(filters)
    .then(results => {
      console.log('Found documents:', results.documents)
      console.log('Total:', results.total)
      // Update UI with search results
    })
    .catch(error => {
      console.error('Search failed:', error)
    })
}

// Export functions for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    uploadDocument,
    searchDocuments,
    downloadDocument,
    deleteDocument,
    uploadDocumentVersion,
    handleFileUpload,
    searchProjectDocuments
  }
}

// Example HTML for file upload
const exampleHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Document Upload Example</title>
</head>
<body>
    <h1>Document Management Example</h1>
    
    <!-- File Upload Form -->
    <div>
        <h2>Upload Document</h2>
        <input type="file" id="fileInput" accept=".pdf,.dwg,.jpg,.png,.doc,.docx" />
        <select id="documentType">
            <option value="BLUEPRINT">Blueprint</option>
            <option value="SPECIFICATION">Specification</option>
            <option value="PHOTO">Photo</option>
            <option value="REPORT">Report</option>
            <option value="CONTRACT">Contract</option>
        </select>
        <button onclick="uploadSelectedFile()">Upload</button>
    </div>

    <!-- Search Documents -->
    <div>
        <h2>Search Documents</h2>
        <input type="text" id="searchInput" placeholder="Search documents..." />
        <button onclick="performSearch()">Search</button>
        <div id="searchResults"></div>
    </div>

    <script>
        function uploadSelectedFile() {
            const fileInput = document.getElementById('fileInput')
            const typeSelect = document.getElementById('documentType')
            
            if (fileInput.files.length === 0) {
                alert('Please select a file')
                return
            }

            const file = fileInput.files[0]
            const documentType = typeSelect.value
            const projectId = 'proj-123' // Replace with actual project ID

            uploadDocument(file, projectId, documentType)
                .then(result => {
                    alert('Upload successful!')
                    fileInput.value = ''
                })
                .catch(error => {
                    alert('Upload failed: ' + error.message)
                })
        }

        function performSearch() {
            const searchInput = document.getElementById('searchInput')
            const query = searchInput.value.trim()

            const filters = {
                search: query,
                projectId: 'proj-123' // Replace with actual project ID
            }

            searchDocuments(filters)
                .then(results => {
                    const resultsDiv = document.getElementById('searchResults')
                    resultsDiv.innerHTML = '<h3>Search Results:</h3>'
                    
                    results.documents.forEach(doc => {
                        const docDiv = document.createElement('div')
                        docDiv.innerHTML = \`
                            <p><strong>\${doc.name}</strong> (\${doc.type})</p>
                            <p>Size: \${(doc.fileSize / 1024).toFixed(2)} KB</p>
                            <button onclick="downloadDocument('\${doc.id}')">Download</button>
                            <button onclick="deleteDocument('\${doc.id}')">Delete</button>
                            <hr>
                        \`
                        resultsDiv.appendChild(docDiv)
                    })
                })
                .catch(error => {
                    alert('Search failed: ' + error.message)
                })
        }
    </script>
</body>
</html>
`

console.log('Document management example loaded. Use the functions above to interact with the API.')