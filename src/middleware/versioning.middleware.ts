import { NextRequest, NextResponse } from 'next/server';

export interface VersionConfig {
  currentVersion: string;
  supportedVersions: string[];
  deprecatedVersions: string[];
  defaultVersion: string;
  versionHeader: string;
  versionParam: string;
}

export interface VersionedResponse {
  data: any;
  version: string;
  deprecated?: boolean;
  deprecationNotice?: string;
  upgradeUrl?: string;
}

const defaultVersionConfig: VersionConfig = {
  currentVersion: '1.0.0',
  supportedVersions: ['1.0.0', '0.9.0'],
  deprecatedVersions: ['0.9.0'],
  defaultVersion: '1.0.0',
  versionHeader: 'API-Version',
  versionParam: 'version'
};

export class ApiVersionManager {
  private config: VersionConfig;

  constructor(config: Partial<VersionConfig> = {}) {
    this.config = { ...defaultVersionConfig, ...config };
  }

  extractVersion(request: NextRequest): string {
    // Check header first
    const headerVersion = request.headers.get(this.config.versionHeader);
    if (headerVersion) {
      return headerVersion;
    }

    // Check query parameter
    const url = new URL(request.url);
    const paramVersion = url.searchParams.get(this.config.versionParam);
    if (paramVersion) {
      return paramVersion;
    }

    // Check Accept header for version
    const acceptHeader = request.headers.get('Accept');
    if (acceptHeader) {
      const versionMatch = acceptHeader.match(/application\/vnd\.constructpro\.v(\d+(?:\.\d+)*)\+json/);
      if (versionMatch) {
        return versionMatch[1];
      }
    }

    // Return default version
    return this.config.defaultVersion;
  }

  validateVersion(version: string): { valid: boolean; error?: string } {
    if (!this.config.supportedVersions.includes(version)) {
      return {
        valid: false,
        error: `Unsupported API version: ${version}. Supported versions: ${this.config.supportedVersions.join(', ')}`
      };
    }

    return { valid: true };
  }

  isDeprecated(version: string): boolean {
    return this.config.deprecatedVersions.includes(version);
  }

  createVersionedResponse(data: any, version: string): VersionedResponse {
    const response: VersionedResponse = {
      data,
      version
    };

    if (this.isDeprecated(version)) {
      response.deprecated = true;
      response.deprecationNotice = `API version ${version} is deprecated. Please upgrade to version ${this.config.currentVersion}.`;
      response.upgradeUrl = '/api/docs#migration';
    }

    return response;
  }

  transformDataForVersion(data: any, version: string, endpoint: string): any {
    // Apply version-specific transformations
    switch (version) {
      case '0.9.0':
        return this.transformToV09(data, endpoint);
      case '1.0.0':
      default:
        return data;
    }
  }

  private transformToV09(data: any, endpoint: string): any {
    // Transform data structure for v0.9.0 compatibility
    if (endpoint.includes('/projects')) {
      return this.transformProjectForV09(data);
    }
    if (endpoint.includes('/tasks')) {
      return this.transformTaskForV09(data);
    }
    if (endpoint.includes('/materials')) {
      return this.transformMaterialForV09(data);
    }
    return data;
  }

  private transformProjectForV09(data: any): any {
    if (Array.isArray(data)) {
      return data.map(project => this.transformSingleProjectForV09(project));
    }
    return this.transformSingleProjectForV09(data);
  }

  private transformSingleProjectForV09(project: any): any {
    if (!project) {return project;}

    return {
      ...project,
      // v0.9.0 used 'status_code' instead of 'status'
      status_code: project.status,
      // v0.9.0 used 'project_manager' instead of 'managerId'
      project_manager: project.managerId,
      // v0.9.0 didn't have priority field
      ...(project.priority && { priority_level: project.priority }),
      // Remove new fields not present in v0.9.0
      metadata: undefined
    };
  }

  private transformTaskForV09(data: any): any {
    if (Array.isArray(data)) {
      return data.map(task => this.transformSingleTaskForV09(task));
    }
    return this.transformSingleTaskForV09(data);
  }

  private transformSingleTaskForV09(task: any): any {
    if (!task) {return task;}

    return {
      ...task,
      // v0.9.0 used 'assigned_user' instead of 'assignedTo'
      assigned_user: task.assignedTo,
      // v0.9.0 used 'created_by_user' instead of 'createdBy'
      created_by_user: task.createdBy,
      // v0.9.0 used 'due_date' instead of 'dueDate'
      due_date: task.dueDate,
      // v0.9.0 used 'estimated_time' instead of 'estimatedHours'
      estimated_time: task.estimatedHours,
      // v0.9.0 used 'actual_time' instead of 'actualHours'
      actual_time: task.actualHours,
      // Remove new fields
      metadata: undefined
    };
  }

  private transformMaterialForV09(data: any): any {
    if (Array.isArray(data)) {
      return data.map(material => this.transformSingleMaterialForV09(material));
    }
    return this.transformSingleMaterialForV09(data);
  }

  private transformSingleMaterialForV09(material: any): any {
    if (!material) {return material;}

    return {
      ...material,
      // v0.9.0 used 'unit_cost' instead of 'unitPrice'
      unit_cost: material.unitPrice,
      // v0.9.0 used 'total_price' instead of 'totalCost'
      total_price: material.totalCost,
      // v0.9.0 used 'supplier' instead of 'supplierId'
      supplier: material.supplierId,
      // Remove new fields
      specifications: undefined
    };
  }
}

export function createVersioningMiddleware(config?: Partial<VersionConfig>) {
  const versionManager = new ApiVersionManager(config);

  return (request: NextRequest) => {
    const version = versionManager.extractVersion(request);
    const validation = versionManager.validateVersion(version);

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'UNSUPPORTED_VERSION',
          message: validation.error,
          supportedVersions: versionManager['config'].supportedVersions,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Add version info to request headers for downstream handlers
    const response = NextResponse.next();
    response.headers.set('X-API-Version', version);
    
    if (versionManager.isDeprecated(version)) {
      response.headers.set('X-API-Deprecated', 'true');
      response.headers.set(
        'X-API-Deprecation-Notice',
        `Version ${version} is deprecated. Upgrade to ${versionManager['config'].currentVersion}`
      );
    }

    return response;
  };
}

// Utility function to wrap API responses with version information
export function createVersionedApiResponse(
  data: any,
  request: NextRequest,
  endpoint: string,
  config?: Partial<VersionConfig>
): NextResponse {
  const versionManager = new ApiVersionManager(config);
  const version = versionManager.extractVersion(request);
  
  // Transform data for the requested version
  const transformedData = versionManager.transformDataForVersion(data, version, endpoint);
  
  // Create versioned response
  const versionedResponse = versionManager.createVersionedResponse(transformedData, version);
  
  const response = NextResponse.json(versionedResponse);
  
  // Add version headers
  response.headers.set('API-Version', version);
  response.headers.set('Content-Type', `application/vnd.constructpro.v${version}+json`);
  
  if (versionManager.isDeprecated(version)) {
    response.headers.set('Deprecation', 'true');
    response.headers.set('Sunset', new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()); // 6 months
    response.headers.set('Link', '</api/docs#migration>; rel="successor-version"');
  }
  
  return response;
}

// Migration guide data
export const migrationGuides = {
  'v0.9.0-to-v1.0.0': {
    title: 'Migration from v0.9.0 to v1.0.0',
    changes: [
      {
        type: 'field_rename',
        description: 'Project status field renamed',
        old: 'status_code',
        new: 'status'
      },
      {
        type: 'field_rename',
        description: 'Project manager field renamed',
        old: 'project_manager',
        new: 'managerId'
      },
      {
        type: 'field_rename',
        description: 'Task assignment field renamed',
        old: 'assigned_user',
        new: 'assignedTo'
      },
      {
        type: 'field_rename',
        description: 'Task creator field renamed',
        old: 'created_by_user',
        new: 'createdBy'
      },
      {
        type: 'field_rename',
        description: 'Material pricing fields renamed',
        old: 'unit_cost',
        new: 'unitPrice'
      },
      {
        type: 'field_addition',
        description: 'Added metadata field to projects and tasks',
        field: 'metadata'
      },
      {
        type: 'field_addition',
        description: 'Added specifications field to materials',
        field: 'specifications'
      }
    ],
    examples: {
      project: {
        v09: {
          id: 'uuid',
          name: 'Project Name',
          status_code: 'IN_PROGRESS',
          project_manager: 'manager-uuid'
        },
        v10: {
          id: 'uuid',
          name: 'Project Name',
          status: 'IN_PROGRESS',
          managerId: 'manager-uuid',
          metadata: {}
        }
      }
    }
  }
};

export default createVersioningMiddleware;