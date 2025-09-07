# Contributing Guide

Thank you for your interest in contributing to ConstructPro! This guide will help you understand our development process and how to contribute effectively.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Documentation](#documentation)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please read and follow our code of conduct:

- Be respectful and inclusive in all interactions
- Focus on constructive feedback and collaboration
- Help create a positive learning environment
- Report any unacceptable behavior to the maintainers

## Getting Started

### Prerequisites

Before contributing, make sure you have:

1. Read the [Development Setup Guide](./development-setup.md)
2. Set up your local development environment
3. Familiarized yourself with the project structure
4. Reviewed existing issues and pull requests

### First-Time Contributors

If you're new to the project:

1. Look for issues labeled `good first issue` or `help wanted`
2. Start with documentation improvements or small bug fixes
3. Ask questions in issues or discussions if you need clarification
4. Join our community channels for support

## Development Workflow

### Branch Strategy

We use a Git flow-based branching strategy:

```
main (production)
├── develop (integration)
│   ├── feature/user-authentication
│   ├── feature/project-dashboard
│   ├── bugfix/socket-connection
│   └── hotfix/security-patch
```

### Branch Naming Convention

- **Feature branches**: `feature/short-description`
- **Bug fixes**: `bugfix/short-description`
- **Hotfixes**: `hotfix/short-description`
- **Documentation**: `docs/short-description`
- **Refactoring**: `refactor/short-description`

### Workflow Steps

1. **Fork and Clone**
   ```bash
   # Fork the repository on GitHub
   git clone https://github.com/your-username/constructpro.git
   cd constructpro
   git remote add upstream https://github.com/original-repo/constructpro.git
   ```

2. **Create Feature Branch**
   ```bash
   # Update your fork
   git checkout develop
   git pull upstream develop
   
   # Create feature branch
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Write code following our coding standards
   - Add tests for new functionality
   - Update documentation as needed
   - Commit changes with descriptive messages

4. **Test Your Changes**
   ```bash
   # Run all tests
   npm test
   
   # Run linting
   npm run lint
   
   # Check TypeScript
   npm run type-check
   
   # Test build
   npm run build
   ```

5. **Submit Pull Request**
   - Push your branch to your fork
   - Create a pull request to the `develop` branch
   - Fill out the pull request template
   - Wait for review and address feedback

## Coding Standards

### TypeScript Guidelines

- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid `any` type unless absolutely necessary
- Use strict TypeScript configuration

```typescript
// Good: Proper interface definition
interface ProjectData {
  id: string;
  name: string;
  status: ProjectStatus;
  createdAt: Date;
}

// Good: Proper function typing
function createProject(data: ProjectData): Promise<Project> {
  // Implementation
}

// Avoid: Using any
function processData(data: any): any {
  // This should be avoided
}
```

### React Component Guidelines

- Use functional components with hooks
- Implement proper prop types with TypeScript
- Use meaningful component and prop names
- Keep components focused and reusable

```typescript
// Good: Well-typed functional component
interface ProjectCardProps {
  project: Project;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  return (
    <div className="project-card">
      {/* Component implementation */}
    </div>
  );
}
```

### Styling Guidelines

- Use Tailwind CSS for styling
- Follow the existing design system
- Use shadcn/ui components when possible
- Maintain responsive design principles

```tsx
// Good: Tailwind classes with responsive design
<div className="flex flex-col md:flex-row gap-4 p-6 bg-white rounded-lg shadow-md">
  <div className="flex-1">
    <h3 className="text-lg font-semibold text-gray-900">
      {project.name}
    </h3>
  </div>
</div>
```

### Code Organization

- Keep files focused and single-purpose
- Use barrel exports for clean imports
- Follow the established directory structure
- Group related functionality together

```typescript
// Good: Barrel export in index.ts
export { ProjectCard } from './ProjectCard';
export { ProjectList } from './ProjectList';
export { ProjectForm } from './ProjectForm';
export type { ProjectCardProps, ProjectListProps } from './types';
```

## Testing Guidelines

### Testing Strategy

We follow a testing pyramid approach:

1. **Unit Tests (70%)** - Test individual functions and components
2. **Integration Tests (20%)** - Test component interactions
3. **E2E Tests (10%)** - Test complete user workflows

### Writing Tests

#### Component Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectCard } from './ProjectCard';

describe('ProjectCard', () => {
  const mockProject = {
    id: '1',
    name: 'Test Project',
    status: 'active',
    createdAt: new Date(),
  };

  it('renders project information correctly', () => {
    render(
      <ProjectCard 
        project={mockProject} 
        onEdit={jest.fn()} 
        onDelete={jest.fn()} 
      />
    );
    
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    render(
      <ProjectCard 
        project={mockProject} 
        onEdit={mockOnEdit} 
        onDelete={jest.fn()} 
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(mockOnEdit).toHaveBeenCalledWith('1');
  });
});
```

#### API Tests

```typescript
import { createProject } from './project.service';

describe('Project Service', () => {
  it('creates a project successfully', async () => {
    const projectData = {
      name: 'New Project',
      description: 'Test description',
    };

    const result = await createProject(projectData);
    
    expect(result).toHaveProperty('id');
    expect(result.name).toBe('New Project');
  });
});
```

### Test Coverage

- Maintain minimum 80% code coverage
- Focus on critical business logic
- Test error scenarios and edge cases
- Mock external dependencies appropriately

## Pull Request Process

### Before Submitting

1. **Self-Review**
   - Review your own code changes
   - Test functionality manually
   - Check for console errors or warnings
   - Verify responsive design

2. **Automated Checks**
   - All tests must pass
   - Linting must pass without errors
   - TypeScript compilation must succeed
   - Build must complete successfully

### Pull Request Template

When creating a pull request, include:

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] All existing tests pass

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors or warnings
```

### Review Process

1. **Automated Checks** - CI/CD pipeline runs automatically
2. **Code Review** - At least one maintainer reviews the code
3. **Testing** - Reviewers may test functionality manually
4. **Approval** - Changes are approved and merged

### Addressing Feedback

- Respond to all review comments
- Make requested changes promptly
- Ask for clarification if feedback is unclear
- Re-request review after making changes

## Issue Guidelines

### Reporting Bugs

Use the bug report template:

```markdown
## Bug Description
A clear description of what the bug is.

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Environment
- OS: [e.g. Windows 10, macOS 12.0]
- Browser: [e.g. Chrome 96, Firefox 95]
- Node.js version: [e.g. 18.0.0]

## Additional Context
Add any other context about the problem here.
```

### Feature Requests

Use the feature request template:

```markdown
## Feature Description
A clear description of the feature you'd like to see.

## Problem Statement
What problem does this feature solve?

## Proposed Solution
How would you like this feature to work?

## Alternatives Considered
Any alternative solutions you've considered.

## Additional Context
Any other context or screenshots about the feature request.
```

### Issue Labels

We use labels to categorize issues:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority: high` - High priority issue
- `status: in progress` - Currently being worked on

## Documentation

### Documentation Standards

- Write clear, concise documentation
- Include code examples where helpful
- Keep documentation up to date with code changes
- Use proper markdown formatting

### Types of Documentation

1. **Code Comments** - Explain complex logic
2. **README Updates** - Keep project overview current
3. **API Documentation** - Document all API endpoints
4. **User Guides** - Help users understand features
5. **Developer Guides** - Help developers contribute

### Documentation Structure

```markdown
# Title

Brief description of what this document covers.

## Prerequisites
What users need before following this guide.

## Step-by-Step Instructions
1. First step with code example
2. Second step with explanation
3. Continue...

## Examples
Practical examples of usage.

## Troubleshooting
Common issues and solutions.

## Related Resources
Links to related documentation.
```

## Community Guidelines

### Communication

- Use GitHub issues for bug reports and feature requests
- Use GitHub discussions for questions and general discussion
- Be patient and respectful in all interactions
- Help others when you can

### Recognition

We recognize contributors through:

- Contributor list in README
- Release notes acknowledgments
- Community highlights
- Maintainer nominations for active contributors

## Getting Help

If you need help:

1. Check existing documentation
2. Search existing issues and discussions
3. Ask questions in GitHub discussions
4. Contact maintainers directly for sensitive issues

## Release Process

### Version Numbering

We follow semantic versioning (SemVer):

- **Major** (1.0.0) - Breaking changes
- **Minor** (0.1.0) - New features, backward compatible
- **Patch** (0.0.1) - Bug fixes, backward compatible

### Release Schedule

- **Major releases** - Quarterly or as needed
- **Minor releases** - Monthly or as needed
- **Patch releases** - As needed for critical fixes

Thank you for contributing to ConstructPro! Your contributions help make construction project management better for everyone.