# Design Document

## Overview

The rebranding design involves systematically replacing all Z.ai references with Vovelet-Tech and ConstructPro branding across the entire codebase. This transformation will convert a generic AI development scaffold into a construction industry-focused project management application.

## Architecture

The rebranding follows a file-by-file replacement strategy targeting:

1. **Package Configuration**: Update package.json with new project identity
2. **Application Metadata**: Modify Next.js metadata in layout.tsx for SEO and social sharing
3. **Documentation**: Complete README.md rewrite focusing on construction industry use case
4. **Dependency Cleanup**: Remove Z.ai specific packages that are no longer needed

## Components and Interfaces

### Package Configuration Component
- **File**: `package.json`
- **Changes**: 
  - Project name: `nextjs_tailwind_shadcn_ts` → `constructpro`
  - Remove `z-ai-web-dev-sdk` dependency
  - Update description to reflect construction project management purpose

### Application Metadata Component
- **File**: `src/app/layout.tsx`
- **Changes**:
  - Title: Reference ConstructPro instead of Z.ai Code Scaffold
  - Description: Focus on construction project management capabilities
  - Keywords: Replace AI development terms with construction industry terms
  - Authors: Change from "Z.ai Team" to "Vovelet-Tech"
  - OpenGraph metadata: Update URLs, site names, and descriptions
  - Twitter metadata: Align with new branding

### Documentation Component
- **File**: `README.md`
- **Changes**:
  - Complete rewrite with construction industry focus
  - Replace technology stack descriptions to emphasize construction use cases
  - Remove all Z.ai references and links
  - Update quick start instructions for ConstructPro
  - Modify project structure to reflect construction domain

## Data Models

### Branding Configuration
```typescript
interface BrandingConfig {
  companyName: "Vovelet-Tech"
  projectName: "ConstructPro"
  domain: "construction project management"
  description: "Construction project management and collaboration platform"
  keywords: ["construction", "project management", "collaboration", "Next.js", "TypeScript"]
}
```

### File Replacement Mapping
```typescript
interface ReplacementMap {
  "Z.ai": "ConstructPro"
  "z.ai": "constructpro"
  "chat.z.ai": "vovelet-tech.com"
  "Z.ai Team": "Vovelet-Tech"
  "AI-powered development": "Construction project management"
  "scaffold": "platform"
}
```

## Error Handling

### Missing File Handling
- Verify all target files exist before attempting modifications
- Log warnings for any files that cannot be found or modified
- Continue processing remaining files if individual files fail

### Dependency Removal Safety
- Check if z-ai-web-dev-sdk is actually used in the codebase before removal
- Ensure no import statements reference the removed package
- Update package-lock.json accordingly

### Content Validation
- Verify that all Z.ai references have been successfully replaced
- Ensure no broken links remain after URL updates
- Validate that new branding is consistent across all files

## Testing Strategy

### Manual Verification Tests
1. **Grep Search Validation**: Search entire codebase for remaining Z.ai references
2. **Package Installation Test**: Run `npm install` to ensure no dependency conflicts
3. **Application Start Test**: Verify the application starts successfully with new branding
4. **Metadata Verification**: Check browser title and meta tags display ConstructPro branding

### Content Review Tests
1. **README Readability**: Ensure README makes sense for construction industry context
2. **Consistency Check**: Verify all branding elements use consistent naming conventions
3. **Link Validation**: Confirm no broken or outdated links remain in documentation

### Build Verification
1. **Development Build**: Ensure `npm run dev` works with updated configuration
2. **Production Build**: Verify `npm run build` completes successfully
3. **Type Checking**: Confirm TypeScript compilation passes with changes