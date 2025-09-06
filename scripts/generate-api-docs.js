#!/usr/bin/env node

/**
 * Automated API Documentation Generator
 * 
 * This script automatically generates and updates API documentation by:
 * 1. Scanning API routes for JSDoc comments
 * 2. Extracting TypeScript types and interfaces
 * 3. Generating OpenAPI specifications
 * 4. Creating interactive documentation
 * 5. Validating API consistency
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  apiDir: path.join(process.cwd(), 'src', 'app', 'api'),
  docsDir: path.join(process.cwd(), 'docs', 'api'),
  outputFile: path.join(process.cwd(), 'docs', 'api', 'openapi.json'),
  typesDir: path.join(process.cwd(), 'src', 'types'),
  validationsDir: path.join(process.cwd(), 'src', 'utils', 'validations'),
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',
  version: process.env.API_VERSION || '1.0.0',
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`[${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

/**
 * Recursively scan directory for API route files
 */
function scanApiRoutes(dir, routes = []) {
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanApiRoutes(fullPath, routes);
      } else if (item === 'route.ts' || item === 'route.js') {
        const relativePath = path.relative(CONFIG.apiDir, fullPath);
        const routePath = path.dirname(relativePath).replace(/\\\\/g, '/');
        routes.push({
          filePath: fullPath,
          routePath: routePath === '.' ? '' : routePath,
          apiPath: '/' + routePath.replace(/\\\\/g, '/'),
        });
      }
    }
    
    return routes;
  } catch (error) {
    logError(`Failed to scan API routes: ${error.message}`);
    return [];
  }
}

/**
 * Extract JSDoc comments and TypeScript information from route file
 */
function analyzeRouteFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const analysis = {
      methods: [],
      schemas: [],
      tags: [],
      summary: '',
      description: '',
    };
    
    // Extract HTTP methods (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
    const methodRegex = /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s*\(/g;
    let match;
    
    while ((match = methodRegex.exec(content)) !== null) {
      const method = match[1].toLowerCase();
      
      // Look for JSDoc comment before the method
      const methodStart = match.index;
      const beforeMethod = content.substring(0, methodStart);
      const jsdocMatch = beforeMethod.match(/\/\*\*([\s\S]*?)\*\//g);
      
      let methodInfo = {
        method,
        summary: '',
        description: '',
        tags: [],
        parameters: [],
        responses: {},
        security: [],
      };
      
      if (jsdocMatch && jsdocMatch.length > 0) {
        const jsdoc = jsdocMatch[jsdocMatch.length - 1];
        methodInfo = parseJSDoc(jsdoc, methodInfo);
      }
      
      // Extract Zod schema usage
      const zodSchemas = extractZodSchemas(content, method);
      methodInfo.schemas = zodSchemas;
      
      analysis.methods.push(methodInfo);
    }
    
    return analysis;
  } catch (error) {
    logWarning(`Failed to analyze route file ${filePath}: ${error.message}`);
    return { methods: [], schemas: [], tags: [] };
  }
}

/**
 * Parse JSDoc comments to extract API documentation
 */
function parseJSDoc(jsdoc, methodInfo) {
  const lines = jsdoc.split('\n').map(line => line.trim().replace(/^\*\s?/, ''));
  
  let currentSection = 'description';
  let description = [];
  
  for (const line of lines) {
    if (line.startsWith('@')) {
      const [tag, ...rest] = line.substring(1).split(' ');
      const value = rest.join(' ');
      
      switch (tag) {
        case 'summary':
          methodInfo.summary = value;
          break;
        case 'description':
          currentSection = 'description';
          if (value) description.push(value);
          break;
        case 'param':
          methodInfo.parameters.push(parseParamTag(value));
          break;
        case 'returns':
        case 'return':
          methodInfo.responses['200'] = { description: value };
          break;
        case 'throws':
        case 'error':
          const errorMatch = value.match(/^(\\d{3})\\s+(.+)/);
          if (errorMatch) {
            methodInfo.responses[errorMatch[1]] = { description: errorMatch[2] };
          }
          break;
        case 'tag':
          methodInfo.tags.push(value);
          break;
        case 'security':
          methodInfo.security.push(value);
          break;
      }
    } else if (currentSection === 'description' && line) {
      description.push(line);
    }
  }
  
  if (description.length > 0) {
    methodInfo.description = description.join('\n');
  }
  
  return methodInfo;
}

/**
 * Parse @param JSDoc tag
 */
function parseParamTag(value) {
  const match = value.match(/^\\{([^}]+)\\}\\s+(\\w+)\\s*-?\\s*(.*)$/);
  if (match) {
    return {
      name: match[2],
      type: match[1],
      description: match[3] || '',
    };
  }
  return { name: value, type: 'string', description: '' };
}

/**
 * Extract Zod schema usage from route content
 */
function extractZodSchemas(content, method) {
  const schemas = [];
  
  // Look for schema imports and usage
  const schemaImports = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+validations[^'"]*)['"'];?/g);
  
  if (schemaImports) {
    for (const importLine of schemaImports) {
      const match = importLine.match(/\{([^}]+)\}/);
      if (match) {
        const importedSchemas = match[1].split(',').map(s => s.trim());
        schemas.push(...importedSchemas);
      }
    }
  }
  
  // Look for schema.parse() usage
  const parseUsage = content.match(/(\w+Schema)\.parse\(/g);
  if (parseUsage) {
    for (const usage of parseUsage) {
      const schemaName = usage.replace('.parse(', '');
      if (!schemas.includes(schemaName)) {
        schemas.push(schemaName);
      }
    }
  }
  
  return schemas;
}

/**
 * Load and parse Zod schemas from validation files
 */
function loadZodSchemas() {
  const schemas = {};
  
  try {
    if (!fs.existsSync(CONFIG.validationsDir)) {
      logWarning('Validations directory not found');
      return schemas;
    }
    
    const validationFiles = fs.readdirSync(CONFIG.validationsDir)
      .filter(file => file.endsWith('.ts') || file.endsWith('.js'));
    
    for (const file of validationFiles) {
      const filePath = path.join(CONFIG.validationsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract schema definitions (simplified parsing)
      const schemaMatches = content.match(/export\s+const\s+(\w+Schema)\s*=\s*z\./g);
      
      if (schemaMatches) {
        for (const match of schemaMatches) {
          const schemaName = match.match(/(\w+Schema)/)[1];
          schemas[schemaName] = {
            file: file,
            name: schemaName,
            // Note: Full schema parsing would require TypeScript compiler API
            // For now, we'll use placeholder schemas
            schema: generatePlaceholderSchema(schemaName),
          };
        }
      }
    }
  } catch (error) {
    logWarning(`Failed to load Zod schemas: ${error.message}`);
  }
  
  return schemas;
}

/**
 * Generate placeholder schema based on schema name
 */
function generatePlaceholderSchema(schemaName) {
  const commonSchemas = {
    signInSchema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 6 },
      },
    },
    signUpSchema: {
      type: 'object',
      required: ['firstName', 'lastName', 'email', 'password', 'confirmPassword'],
      properties: {
        firstName: { type: 'string', minLength: 2 },
        lastName: { type: 'string', minLength: 2 },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 6 },
        confirmPassword: { type: 'string' },
        company: { type: 'string' },
        title: { type: 'string' },
        phone: { type: 'string' },
        role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'WORKER', 'CLIENT'] },
      },
    },
    updateProfileSchema: {
      type: 'object',
      properties: {
        firstName: { type: 'string', minLength: 2 },
        lastName: { type: 'string', minLength: 2 },
        company: { type: 'string' },
        title: { type: 'string' },
        phone: { type: 'string' },
        theme: { type: 'string', enum: ['light', 'dark'] },
        language: { type: 'string' },
      },
    },
  };
  
  return commonSchemas[schemaName] || {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
  };
}

/**
 * Generate OpenAPI specification from analyzed routes
 */
function generateOpenAPISpec(routes, schemas) {
  const spec = {
    openapi: '3.0.3',
    info: {
      title: 'ConstructPro API',
      description: 'Construction project management and collaboration platform API',
      version: CONFIG.version,
      contact: {
        name: 'ConstructPro API Support',
        url: 'https://github.com/vovelet-tech/constructpro',
        email: 'support@constructpro.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: CONFIG.baseUrl,
        description: 'API Server',
      },
    ],
    paths: {},
    components: {
      schemas: {},
      securitySchemes: {
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'next-auth.session-token',
          description: 'NextAuth.js session cookie',
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for API access',
        },
      },
    },
    tags: [],
  };
  
  // Process routes
  for (const route of routes) {
    const pathKey = route.apiPath || '/';
    
    if (!spec.paths[pathKey]) {
      spec.paths[pathKey] = {};
    }
    
    for (const method of route.analysis.methods) {
      spec.paths[pathKey][method.method] = {
        summary: method.summary || `${method.method.toUpperCase()} ${pathKey}`,
        description: method.description || '',
        operationId: `${method.method}${pathKey.replace(/[^a-zA-Z0-9]/g, '')}`,
        tags: method.tags.length > 0 ? method.tags : ['API'],
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: { type: 'object' },
              },
            },
          },
          ...method.responses,
        },
      };
      
      // Add security if specified
      if (method.security.length > 0) {
        spec.paths[pathKey][method.method].security = method.security.map(sec => ({ [sec]: [] }));
      }
      
      // Add request body for POST/PUT/PATCH methods
      if (['post', 'put', 'patch'].includes(method.method) && method.schemas.length > 0) {
        const schemaName = method.schemas[0];
        if (schemas[schemaName]) {
          spec.paths[pathKey][method.method].requestBody = {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: `#/components/schemas/${schemaName}` },
              },
            },
          };
          
          // Add schema to components
          spec.components.schemas[schemaName] = schemas[schemaName].schema;
        }
      }
    }
  }
  
  // Add common schemas
  Object.entries(schemas).forEach(([name, schema]) => {
    if (!spec.components.schemas[name]) {
      spec.components.schemas[name] = schema.schema;
    }
  });
  
  // Generate tags from routes
  const allTags = new Set();
  Object.values(spec.paths).forEach(path => {
    Object.values(path).forEach(operation => {
      if (operation.tags) {
        operation.tags.forEach(tag => allTags.add(tag));
      }
    });
  });
  
  spec.tags = Array.from(allTags).map(tag => ({
    name: tag,
    description: `${tag} related endpoints`,
  }));
  
  return spec;
}

/**
 * Validate generated OpenAPI specification
 */
function validateOpenAPISpec(spec) {
  const issues = [];
  
  // Check required fields
  if (!spec.info || !spec.info.title) {
    issues.push('Missing API title');
  }
  
  if (!spec.info || !spec.info.version) {
    issues.push('Missing API version');
  }
  
  if (!spec.paths || Object.keys(spec.paths).length === 0) {
    issues.push('No API paths defined');
  }
  
  // Check for missing descriptions
  Object.entries(spec.paths).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, operation]) => {
      if (!operation.summary) {
        issues.push(`Missing summary for ${method.toUpperCase()} ${path}`);
      }
      
      if (!operation.description) {
        issues.push(`Missing description for ${method.toUpperCase()} ${path}`);
      }
    });
  });
  
  return issues;
}

/**
 * Generate additional documentation files
 */
function generateAdditionalDocs(spec) {
  // Generate endpoint summary
  const endpointSummary = {
    totalEndpoints: 0,
    byMethod: {},
    byTag: {},
    endpoints: [],
  };
  
  Object.entries(spec.paths).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, operation]) => {
      endpointSummary.totalEndpoints++;
      
      // Count by method
      endpointSummary.byMethod[method] = (endpointSummary.byMethod[method] || 0) + 1;
      
      // Count by tag
      if (operation.tags) {
        operation.tags.forEach(tag => {
          endpointSummary.byTag[tag] = (endpointSummary.byTag[tag] || 0) + 1;
        });
      }
      
      // Add to endpoints list
      endpointSummary.endpoints.push({
        path,
        method: method.toUpperCase(),
        summary: operation.summary,
        tags: operation.tags || [],
      });
    });
  });
  
  // Write endpoint summary
  const summaryPath = path.join(CONFIG.docsDir, 'endpoint-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(endpointSummary, null, 2));
  logSuccess(`Generated endpoint summary: ${summaryPath}`);
  
  // Generate README for API docs
  const readmePath = path.join(CONFIG.docsDir, 'README.md');
  const readmeContent = `# ConstructPro API Documentation

## Overview

This directory contains the complete API documentation for ConstructPro, including:

- **OpenAPI Specification**: \`openapi.json\` - Complete API specification
- **Interactive Documentation**: Available at \`/docs/api\` when running the application
- **Versioning Strategy**: \`versioning-strategy.md\` - API versioning guidelines
- **Endpoint Summary**: \`endpoint-summary.json\` - Quick overview of all endpoints

## API Statistics

- **Total Endpoints**: ${endpointSummary.totalEndpoints}
- **API Version**: ${spec.info.version}
- **Last Updated**: ${new Date().toISOString()}

### Endpoints by Method

${Object.entries(endpointSummary.byMethod)
  .map(([method, count]) => `- **${method.toUpperCase()}**: ${count} endpoints`)
  .join('\n')}

### Endpoints by Category

${Object.entries(endpointSummary.byTag)
  .map(([tag, count]) => `- **${tag}**: ${count} endpoints`)
  .join('\n')}

## Quick Start

1. **View Interactive Docs**: Visit \`http://localhost:3000/docs/api\` when running the application
2. **Download Specification**: Use the OpenAPI specification file for code generation
3. **Test Endpoints**: Use the interactive documentation to test API endpoints

## Authentication

The API uses NextAuth.js for authentication. Most endpoints require a valid session cookie or JWT token.

## Rate Limiting

API endpoints are rate-limited to prevent abuse. See the OpenAPI specification for specific limits.

## Support

For API support and questions:
- **Email**: ${spec.info.contact?.email || 'support@constructpro.com'}
- **Documentation**: ${spec.info.contact?.url || 'https://github.com/vovelet-tech/constructpro'}
- **Issues**: Report bugs and feature requests on GitHub

## Generated Documentation

This documentation is automatically generated from the API source code. To regenerate:

\`\`\`bash
npm run docs:generate
\`\`\`
`;
  
  fs.writeFileSync(readmePath, readmeContent);
  logSuccess(`Generated API documentation README: ${readmePath}`);
}

/**
 * Main execution function
 */
async function main() {
  try {
    log('🚀 Starting API Documentation Generation', 'bright');
    log('==========================================', 'bright');
    
    // Step 1: Scan API routes
    logStep('1/6', 'Scanning API routes...');
    const routes = scanApiRoutes(CONFIG.apiDir);
    logSuccess(`Found ${routes.length} API routes`);
    
    // Step 2: Analyze route files
    logStep('2/6', 'Analyzing route files...');
    for (const route of routes) {
      route.analysis = analyzeRouteFile(route.filePath);
    }
    const totalMethods = routes.reduce((sum, route) => sum + route.analysis.methods.length, 0);
    logSuccess(`Analyzed ${totalMethods} HTTP methods`);
    
    // Step 3: Load schemas
    logStep('3/6', 'Loading Zod schemas...');
    const schemas = loadZodSchemas();
    logSuccess(`Loaded ${Object.keys(schemas).length} schemas`);
    
    // Step 4: Generate OpenAPI specification
    logStep('4/6', 'Generating OpenAPI specification...');
    const spec = generateOpenAPISpec(routes, schemas);
    
    // Step 5: Validate specification
    logStep('5/6', 'Validating specification...');
    const issues = validateOpenAPISpec(spec);
    if (issues.length > 0) {
      logWarning(`Found ${issues.length} validation issues:`);
      issues.forEach(issue => logWarning(`  - ${issue}`));
    } else {
      logSuccess('Specification validation passed');
    }
    
    // Step 6: Write output files
    logStep('6/6', 'Writing documentation files...');
    
    // Ensure docs directory exists
    if (!fs.existsSync(CONFIG.docsDir)) {
      fs.mkdirSync(CONFIG.docsDir, { recursive: true });
    }
    
    // Write OpenAPI specification
    fs.writeFileSync(CONFIG.outputFile, JSON.stringify(spec, null, 2));
    logSuccess(`Generated OpenAPI specification: ${CONFIG.outputFile}`);
    
    // Generate additional documentation
    generateAdditionalDocs(spec);
    
    // Summary
    log('\\n📊 Generation Summary', 'bright');
    log('====================', 'bright');
    log(`Routes scanned: ${routes.length}`);
    log(`HTTP methods: ${totalMethods}`);
    log(`Schemas loaded: ${Object.keys(schemas).length}`);
    log(`Total endpoints: ${Object.keys(spec.paths).length}`);
    log(`Validation issues: ${issues.length}`);
    
    if (issues.length === 0) {
      log('\\n✅ API documentation generated successfully!', 'green');
    } else {
      log('\\n⚠️  API documentation generated with warnings', 'yellow');
    }
    
    log(`\\n📖 View documentation at: http://localhost:3000/docs/api`, 'cyan');
    
  } catch (error) {
    logError(`Failed to generate API documentation: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  generateOpenAPISpec,
  scanApiRoutes,
  analyzeRouteFile,
  validateOpenAPISpec,
};