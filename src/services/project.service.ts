import { apiService } from './api.service';
import type { 
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectSearchRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskSearchRequest,
  CreateMaterialRequest,
  UpdateMaterialRequest,
  MaterialSearchRequest,
  MaterialComparisonRequest,
  MaterialComparisonResponse,
  FileUploadRequest,
  FileUploadResponse,
  BulkFileUploadRequest,
  BulkFileUploadResponse,
  PaginatedResponse,
  ApiResponse 
} from '@/types/api.types';
import type { 
  Project, 
  Task, 
  Material, 
  ProjectDocument,
  ProjectStats,
  ProjectDashboard,
  Milestone,
  ProjectPhase
} from '@/types/project.types';

/**
 * Project service for handling project management operations
 * Manages projects, tasks, materials, documents, and related functionality
 */
export class ProjectService {
  private readonly PROJECT_ENDPOINTS = {
    PROJECTS: '/api/projects',
    PROJECT_BY_ID: (id: string) => `/api/projects/${id}`,
    PROJECT_TASKS: (id: string) => `/api/projects/${id}/tasks`,
    PROJECT_MATERIALS: (id: string) => `/api/projects/${id}/materials`,
    PROJECT_DOCUMENTS: (id: string) => `/api/projects/${id}/documents`,
    PROJECT_TEAM: (id: string) => `/api/projects/${id}/team`,
    PROJECT_MILESTONES: (id: string) => `/api/projects/${id}/milestones`,
    PROJECT_PHASES: (id: string) => `/api/projects/${id}/phases`,
    PROJECT_STATS: (id: string) => `/api/projects/${id}/stats`,
    
    TASKS: '/api/tasks',
    TASK_BY_ID: (id: string) => `/api/tasks/${id}`,
    TASK_COMMENTS: (id: string) => `/api/tasks/${id}/comments`,
    TASK_ATTACHMENTS: (id: string) => `/api/tasks/${id}/attachments`,
    
    MATERIALS: '/api/materials',
    MATERIAL_BY_ID: (id: string) => `/api/materials/${id}`,
    MATERIAL_COMPARISON: '/api/materials/compare',
    
    DOCUMENTS: '/api/documents',
    DOCUMENT_BY_ID: (id: string) => `/api/documents/${id}`,
    DOCUMENT_UPLOAD: '/api/documents/upload',
    DOCUMENT_BULK_UPLOAD: '/api/documents/bulk-upload',
    
    DASHBOARD: '/api/dashboard',
    SEARCH: '/api/search',
  } as const;

  // Project Management Methods

  /**
   * Get all projects with optional filtering and pagination
   */
  async getProjects(searchParams?: ProjectSearchRequest): Promise<PaginatedResponse<Project>> {
    try {
      const response = await apiService.get<Project[]>(
        this.PROJECT_ENDPOINTS.PROJECTS,
        searchParams
      );

      return response as PaginatedResponse<Project>;
    } catch (error) {
      console.error('Get projects error:', error);
      throw error;
    }
  }

  /**
   * Get project by ID
   */
  async getProject(id: string): Promise<ApiResponse<Project>> {
    try {
      return await apiService.get<Project>(this.PROJECT_ENDPOINTS.PROJECT_BY_ID(id));
    } catch (error) {
      console.error('Get project error:', error);
      throw error;
    }
  }

  /**
   * Create new project
   */
  async createProject(projectData: CreateProjectRequest): Promise<ApiResponse<Project>> {
    try {
      return await apiService.post<Project>(
        this.PROJECT_ENDPOINTS.PROJECTS,
        projectData
      );
    } catch (error) {
      console.error('Create project error:', error);
      throw error;
    }
  }

  /**
   * Update existing project
   */
  async updateProject(id: string, projectData: UpdateProjectRequest): Promise<ApiResponse<Project>> {
    try {
      return await apiService.patch<Project>(
        this.PROJECT_ENDPOINTS.PROJECT_BY_ID(id),
        projectData
      );
    } catch (error) {
      console.error('Update project error:', error);
      throw error;
    }
  }

  /**
   * Delete project
   */
  async deleteProject(id: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.delete<void>(this.PROJECT_ENDPOINTS.PROJECT_BY_ID(id));
    } catch (error) {
      console.error('Delete project error:', error);
      throw error;
    }
  }

  /**
   * Get project statistics
   */
  async getProjectStats(id: string): Promise<ApiResponse<ProjectStats>> {
    try {
      return await apiService.get<ProjectStats>(this.PROJECT_ENDPOINTS.PROJECT_STATS(id));
    } catch (error) {
      console.error('Get project stats error:', error);
      throw error;
    }
  }

  // Task Management Methods

  /**
   * Get tasks with optional filtering
   */
  async getTasks(searchParams?: TaskSearchRequest): Promise<PaginatedResponse<Task>> {
    try {
      const response = await apiService.get<Task[]>(
        this.TASK_ENDPOINTS.TASKS,
        searchParams
      );

      return response as PaginatedResponse<Task>;
    } catch (error) {
      console.error('Get tasks error:', error);
      throw error;
    }
  }

  /**
   * Get project tasks
   */
  async getProjectTasks(projectId: string, searchParams?: TaskSearchRequest): Promise<PaginatedResponse<Task>> {
    try {
      const response = await apiService.get<Task[]>(
        this.PROJECT_ENDPOINTS.PROJECT_TASKS(projectId),
        searchParams
      );

      return response as PaginatedResponse<Task>;
    } catch (error) {
      console.error('Get project tasks error:', error);
      throw error;
    }
  }

  /**
   * Get task by ID
   */
  async getTask(id: string): Promise<ApiResponse<Task>> {
    try {
      return await apiService.get<Task>(this.TASK_ENDPOINTS.TASK_BY_ID(id));
    } catch (error) {
      console.error('Get task error:', error);
      throw error;
    }
  }

  /**
   * Create new task
   */
  async createTask(taskData: CreateTaskRequest): Promise<ApiResponse<Task>> {
    try {
      return await apiService.post<Task>(
        this.TASK_ENDPOINTS.TASKS,
        taskData
      );
    } catch (error) {
      console.error('Create task error:', error);
      throw error;
    }
  }

  /**
   * Update existing task
   */
  async updateTask(id: string, taskData: UpdateTaskRequest): Promise<ApiResponse<Task>> {
    try {
      return await apiService.patch<Task>(
        this.TASK_ENDPOINTS.TASK_BY_ID(id),
        taskData
      );
    } catch (error) {
      console.error('Update task error:', error);
      throw error;
    }
  }

  /**
   * Delete task
   */
  async deleteTask(id: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.delete<void>(this.TASK_ENDPOINTS.TASK_BY_ID(id));
    } catch (error) {
      console.error('Delete task error:', error);
      throw error;
    }
  }

  // Material Management Methods

  /**
   * Get materials with optional filtering
   */
  async getMaterials(searchParams?: MaterialSearchRequest): Promise<PaginatedResponse<Material>> {
    try {
      const response = await apiService.get<Material[]>(
        this.MATERIALS_ENDPOINTS.MATERIALS,
        searchParams
      );

      return response as PaginatedResponse<Material>;
    } catch (error) {
      console.error('Get materials error:', error);
      throw error;
    }
  }

  /**
   * Get project materials
   */
  async getProjectMaterials(projectId: string, searchParams?: MaterialSearchRequest): Promise<PaginatedResponse<Material>> {
    try {
      const response = await apiService.get<Material[]>(
        this.PROJECT_ENDPOINTS.PROJECT_MATERIALS(projectId),
        searchParams
      );

      return response as PaginatedResponse<Material>;
    } catch (error) {
      console.error('Get project materials error:', error);
      throw error;
    }
  }

  /**
   * Get material by ID
   */
  async getMaterial(id: string): Promise<ApiResponse<Material>> {
    try {
      return await apiService.get<Material>(this.MATERIALS_ENDPOINTS.MATERIAL_BY_ID(id));
    } catch (error) {
      console.error('Get material error:', error);
      throw error;
    }
  }

  /**
   * Create new material
   */
  async createMaterial(materialData: CreateMaterialRequest): Promise<ApiResponse<Material>> {
    try {
      return await apiService.post<Material>(
        this.MATERIALS_ENDPOINTS.MATERIALS,
        materialData
      );
    } catch (error) {
      console.error('Create material error:', error);
      throw error;
    }
  }

  /**
   * Update existing material
   */
  async updateMaterial(id: string, materialData: UpdateMaterialRequest): Promise<ApiResponse<Material>> {
    try {
      return await apiService.patch<Material>(
        this.MATERIALS_ENDPOINTS.MATERIAL_BY_ID(id),
        materialData
      );
    } catch (error) {
      console.error('Update material error:', error);
      throw error;
    }
  }

  /**
   * Delete material
   */
  async deleteMaterial(id: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.delete<void>(this.MATERIALS_ENDPOINTS.MATERIAL_BY_ID(id));
    } catch (error) {
      console.error('Delete material error:', error);
      throw error;
    }
  }

  /**
   * Compare materials from different suppliers
   */
  async compareMaterials(comparisonData: MaterialComparisonRequest): Promise<ApiResponse<MaterialComparisonResponse>> {
    try {
      return await apiService.post<MaterialComparisonResponse>(
        this.MATERIALS_ENDPOINTS.MATERIAL_COMPARISON,
        comparisonData
      );
    } catch (error) {
      console.error('Compare materials error:', error);
      throw error;
    }
  }

  // Document Management Methods

  /**
   * Get project documents
   */
  async getProjectDocuments(projectId: string): Promise<ApiResponse<ProjectDocument[]>> {
    try {
      return await apiService.get<ProjectDocument[]>(
        this.PROJECT_ENDPOINTS.PROJECT_DOCUMENTS(projectId)
      );
    } catch (error) {
      console.error('Get project documents error:', error);
      throw error;
    }
  }

  /**
   * Upload single document
   */
  async uploadDocument(
    file: File,
    uploadData: Omit<FileUploadRequest, 'file'>,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<FileUploadResponse>> {
    try {
      return await apiService.uploadFile<FileUploadResponse>(
        this.DOCUMENTS_ENDPOINTS.DOCUMENT_UPLOAD,
        file,
        uploadData,
        onProgress
      );
    } catch (error) {
      console.error('Upload document error:', error);
      throw error;
    }
  }

  /**
   * Upload multiple documents
   */
  async uploadDocuments(uploadData: BulkFileUploadRequest): Promise<ApiResponse<BulkFileUploadResponse>> {
    try {
      const formData = new FormData();
      
      uploadData.files.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
      });

      // Add other data
      Object.entries(uploadData).forEach(([key, value]) => {
        if (key !== 'files') {
          formData.append(key, String(value));
        }
      });

      return await apiService.post<BulkFileUploadResponse>(
        this.DOCUMENTS_ENDPOINTS.DOCUMENT_BULK_UPLOAD,
        formData
      );
    } catch (error) {
      console.error('Upload documents error:', error);
      throw error;
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(id: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.delete<void>(this.DOCUMENTS_ENDPOINTS.DOCUMENT_BY_ID(id));
    } catch (error) {
      console.error('Delete document error:', error);
      throw error;
    }
  }

  // Milestone and Phase Management

  /**
   * Get project milestones
   */
  async getProjectMilestones(projectId: string): Promise<ApiResponse<Milestone[]>> {
    try {
      return await apiService.get<Milestone[]>(
        this.PROJECT_ENDPOINTS.PROJECT_MILESTONES(projectId)
      );
    } catch (error) {
      console.error('Get project milestones error:', error);
      throw error;
    }
  }

  /**
   * Get project phases
   */
  async getProjectPhases(projectId: string): Promise<ApiResponse<ProjectPhase[]>> {
    try {
      return await apiService.get<ProjectPhase[]>(
        this.PROJECT_ENDPOINTS.PROJECT_PHASES(projectId)
      );
    } catch (error) {
      console.error('Get project phases error:', error);
      throw error;
    }
  }

  // Dashboard and Analytics

  /**
   * Get dashboard data
   */
  async getDashboard(): Promise<ApiResponse<ProjectDashboard>> {
    try {
      return await apiService.get<ProjectDashboard>(this.DASHBOARD_ENDPOINTS.DASHBOARD);
    } catch (error) {
      console.error('Get dashboard error:', error);
      throw error;
    }
  }

  /**
   * Search across projects, tasks, and materials
   */
  async search(query: string, filters?: Record<string, any>): Promise<ApiResponse<any>> {
    try {
      return await apiService.get<any>(this.SEARCH_ENDPOINTS.SEARCH, {
        query,
        ...filters,
      });
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  // Team Management

  /**
   * Get project team members
   */
  async getProjectTeam(projectId: string): Promise<ApiResponse<any[]>> {
    try {
      return await apiService.get<any[]>(
        this.PROJECT_ENDPOINTS.PROJECT_TEAM(projectId)
      );
    } catch (error) {
      console.error('Get project team error:', error);
      throw error;
    }
  }

  /**
   * Add team member to project
   */
  async addTeamMember(projectId: string, memberData: any): Promise<ApiResponse<any>> {
    try {
      return await apiService.post<any>(
        this.PROJECT_ENDPOINTS.PROJECT_TEAM(projectId),
        memberData
      );
    } catch (error) {
      console.error('Add team member error:', error);
      throw error;
    }
  }

  /**
   * Remove team member from project
   */
  async removeTeamMember(projectId: string, memberId: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.delete<void>(
        `${this.PROJECT_ENDPOINTS.PROJECT_TEAM(projectId)}/${memberId}`
      );
    } catch (error) {
      console.error('Remove team member error:', error);
      throw error;
    }
  }

  // Helper method aliases for backward compatibility
  private get TASK_ENDPOINTS() {
    return {
      TASKS: this.PROJECT_ENDPOINTS.TASKS,
      TASK_BY_ID: this.PROJECT_ENDPOINTS.TASK_BY_ID,
    };
  }

  private get MATERIALS_ENDPOINTS() {
    return {
      MATERIALS: this.PROJECT_ENDPOINTS.MATERIALS,
      MATERIAL_BY_ID: this.PROJECT_ENDPOINTS.MATERIAL_BY_ID,
      MATERIAL_COMPARISON: this.PROJECT_ENDPOINTS.MATERIAL_COMPARISON,
    };
  }

  private get DOCUMENTS_ENDPOINTS() {
    return {
      DOCUMENTS: this.PROJECT_ENDPOINTS.DOCUMENTS,
      DOCUMENT_BY_ID: this.PROJECT_ENDPOINTS.DOCUMENT_BY_ID,
      DOCUMENT_UPLOAD: this.PROJECT_ENDPOINTS.DOCUMENT_UPLOAD,
      DOCUMENT_BULK_UPLOAD: this.PROJECT_ENDPOINTS.DOCUMENT_BULK_UPLOAD,
    };
  }

  private get DASHBOARD_ENDPOINTS() {
    return {
      DASHBOARD: this.PROJECT_ENDPOINTS.DASHBOARD,
    };
  }

  private get SEARCH_ENDPOINTS() {
    return {
      SEARCH: this.PROJECT_ENDPOINTS.SEARCH,
    };
  }
}

// Create singleton instance
export const projectService = new ProjectService();