# ConstructPro API Documentation

## Overview

This directory contains the complete API documentation for ConstructPro, including:

- **OpenAPI Specification**: `openapi.json` - Complete API specification
- **Interactive Documentation**: Available at `/docs/api` when running the application
- **Versioning Strategy**: `versioning-strategy.md` - API versioning guidelines
- **Endpoint Summary**: `endpoint-summary.json` - Quick overview of all endpoints

## API Statistics

- **Total Endpoints**: 11
- **API Version**: 1.0.0
- **Last Updated**: 2025-09-06T16:03:45.197Z

### Endpoints by Method

- **POST**: 1 endpoints
- **GET**: 5 endpoints
- **HEAD**: 2 endpoints
- **OPTIONS**: 2 endpoints
- **PATCH**: 1 endpoints

### Endpoints by Category

- **API**: 11 endpoints

## Quick Start

1. **View Interactive Docs**: Visit `http://localhost:3000/docs/api` when running the application
2. **Download Specification**: Use the OpenAPI specification file for code generation
3. **Test Endpoints**: Use the interactive documentation to test API endpoints

## Authentication

The API uses NextAuth.js for authentication. Most endpoints require a valid session cookie or JWT token.

## Rate Limiting

API endpoints are rate-limited to prevent abuse. See the OpenAPI specification for specific limits.

## Support

For API support and questions:
- **Email**: support@constructpro.com
- **Documentation**: https://github.com/vovelet-tech/constructpro
- **Issues**: Report bugs and feature requests on GitHub

## Generated Documentation

This documentation is automatically generated from the API source code. To regenerate:

```bash
npm run docs:generate
```
