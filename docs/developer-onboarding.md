# Developer Onboarding Guide

Welcome to the ConstructPro development team! This guide will help you get up and running with our codebase and development workflow.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Project Overview](#project-overview)
4. [Development Workflow](#development-workflow)
5. [Code Standards](#code-standards)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Resources](#resources)
9. [Onboarding Checklist](#onboarding-checklist)

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

- **Node.js** (v18.17.0 or higher)
- **npm** (v9.0.0 or higher)
- **Git** (latest version)
- **VS Code** (recommended IDE)

### Recommended VS Code Extensions

- TypeScript and JavaScript Language Features
- ESLint
- Prettier - Code formatter
- Tailwind CSS IntelliSense
- GitLens
- Thunder Client (for API testing)
- Prisma (for database schema)

### System Requirements

- **OS**: Windows 10+, macOS 10.15+, or Ubuntu 18.04+
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 5GB free space for dependencies and build files

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/vovelet-tech/constructpro.git
cd constructpro
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Edit the environment file with your settings
# Required variables:
# - DATABASE_URL
# - NEXTAUTH_SECRET
# - NEXTAUTH_URL
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database with initial data
npm run db:seed
```

### 5. Verify Installation

```bash
# Run development server
npm run dev

# In another terminal, run tests
npm test

# Check linting
npm run lint

# Verify build
npm run build
```

Visit `http://localhost:3000` to see the application running.

## Project Overview

### Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API routes, Custom Express server
- **Database**: Prisma ORM with SQLite (dev) / PostgreSQL (prod)
- **Real-time**: Socket.IO
- **Authentication**: NextAuth.js
- **Testing**: Jest, React Testing Library
- **Deployment**: Docker, CI/CD with GitHub Actions

### Project Structure

```
constructpro/
├── .github/          # GitHub workflows and templates
├── .husky/           # Git hooks
├── .kiro/            # Kiro AI configuration
├── docs/             # Documentation
├── prisma/           # Database schema and migrations
├── public/           # Static assets
├── scripts/          # Build and deployment scripts
├── src/              # Source code
│   ├── app/          # Next.js App Router
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   ├── services/     # Business logic services
│   ├── types/        # TypeScript type definitions
│   └── utils/        # Utility functions
├── tests/            # Test files
└── server.ts         # Custom server with Socket.IO
```

### Key Features

- **Project Management**: Construction project tracking and management
- **Team Collaboration**: Real-time communication and coordination
- **Material Management**: Material comparison and procurement tools
- **Professional Network**: Industry professional networking
- **Verification System**: Quality assurance workflows
- **AR Integration**: Augmented reality visualization
- **Admin Panel**: Administrative controls and oversight

## Development Workflow

### Git Workflow

We use a feature branch workflow:

1. **Create a feature branch** from `develop`
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Commit your changes** using conventional commits
   ```bash
   git add .
   git commit -m "feat: add user authentication system"
   ```

4. **Push your branch** and create a pull request
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request** using our PR template

6. **Address review feedback** and merge when approved

### Branch Naming Conventions

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/updates

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes

## Code Standards

### TypeScript Guidelines

- Use strict TypeScript configuration
- Define interfaces for all data structures
- Use proper type annotations
- Avoid `any` type unless absolutely necessary
- Use utility types when appropriate

### React Best Practices

- Use functional components with hooks
- Implement proper error boundaries
- Use React.memo for performance optimization
- Follow the single responsibility principle
- Keep components small and focused

### Styling Guidelines

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use shadcn/ui components when possible
- Maintain consistent spacing and typography
- Use CSS variables for theme customization

### Code Organization

- Group related functionality together
- Use barrel exports (index.ts files)
- Keep file names descriptive and consistent
- Separate concerns (UI, logic, data)
- Use proper folder structure

## Testing

### Testing Strategy

We follow the testing pyramid:

- **Unit Tests (70%)**: Test individual functions and components
- **Integration Tests (20%)**: Test component interactions
- **E2E Tests (10%)**: Test complete user workflows

### Writing Tests

```typescript
// Example unit test
import { render, screen } from '@testing-library/react';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  it('displays user information correctly', () => {
    const user = { name: 'John Doe', email: 'john@example.com' };
    render(<UserProfile user={user} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test UserProfile.test.tsx
```

## Deployment

### Development Environment

```bash
# Start development server
npm run dev

# Start with debugging
npm run dev:debug
```

### Production Build

```bash
# Build for production
npm run build:production

# Start production server
npm run start:production
```

### Docker Deployment

```bash
# Build Docker image
npm run docker:build

# Run Docker container
npm run docker:run
```

## Resources

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

### Internal Resources

- [API Documentation](./api/)
- [Architecture Overview](./architecture.md)
- [Code Review Guidelines](./code-review-guidelines.md)
- [Security Guidelines](./security.md)
- [Troubleshooting Guide](./troubleshooting.md)

### Team Communication

- **Slack**: #constructpro-dev channel
- **GitHub Discussions**: For technical discussions
- **Weekly Standups**: Mondays at 9:00 AM
- **Code Reviews**: Daily review sessions

## Onboarding Checklist

### Week 1: Environment Setup

- [ ] **Day 1-2: Initial Setup**
  - [ ] Clone repository and set up development environment
  - [ ] Install required software and VS Code extensions
  - [ ] Configure environment variables
  - [ ] Run application locally and verify everything works
  - [ ] Join team communication channels

- [ ] **Day 3-4: Codebase Exploration**
  - [ ] Read project documentation thoroughly
  - [ ] Explore project structure and key components
  - [ ] Run tests and understand testing setup
  - [ ] Review recent pull requests to understand code style
  - [ ] Set up debugging environment

- [ ] **Day 5: First Contribution**
  - [ ] Pick a "good first issue" from GitHub issues
  - [ ] Create feature branch and make changes
  - [ ] Write tests for your changes
  - [ ] Submit your first pull request
  - [ ] Participate in code review process

### Week 2: Deep Dive

- [ ] **Understanding the Domain**
  - [ ] Learn about construction industry workflows
  - [ ] Understand user personas and use cases
  - [ ] Review user feedback and feature requests
  - [ ] Explore the admin panel and all features

- [ ] **Technical Deep Dive**
  - [ ] Understand database schema and relationships
  - [ ] Learn about real-time features with Socket.IO
  - [ ] Explore authentication and authorization system
  - [ ] Review security implementations
  - [ ] Understand deployment and CI/CD pipeline

- [ ] **Team Integration**
  - [ ] Attend team meetings and standups
  - [ ] Pair program with senior developers
  - [ ] Review and provide feedback on pull requests
  - [ ] Contribute to technical discussions

### Week 3-4: Independent Contributions

- [ ] **Feature Development**
  - [ ] Take ownership of a medium-sized feature
  - [ ] Write comprehensive tests
  - [ ] Update documentation as needed
  - [ ] Participate in feature planning discussions

- [ ] **Code Quality**
  - [ ] Contribute to code review process
  - [ ] Suggest improvements to development workflow
  - [ ] Help with bug fixes and maintenance tasks
  - [ ] Mentor newer team members

### Ongoing Responsibilities

- [ ] **Daily Tasks**
  - [ ] Check and respond to pull request reviews
  - [ ] Update progress on assigned tasks
  - [ ] Participate in daily standups
  - [ ] Keep local environment up to date

- [ ] **Weekly Tasks**
  - [ ] Review team retrospective notes
  - [ ] Update documentation for completed features
  - [ ] Participate in planning meetings
  - [ ] Share knowledge with team members

- [ ] **Monthly Tasks**
  - [ ] Review and update dependencies
  - [ ] Contribute to architecture discussions
  - [ ] Provide feedback on development processes
  - [ ] Participate in team retrospectives

## Getting Help

### When You're Stuck

1. **Check Documentation**: Start with our internal docs and external resources
2. **Search Issues**: Look for similar problems in GitHub issues
3. **Ask the Team**: Use Slack for quick questions
4. **Pair Programming**: Schedule time with senior developers
5. **Create Discussion**: Use GitHub Discussions for complex topics

### Common Issues and Solutions

#### Development Server Won't Start

```bash
# Clear cache and reinstall
npm run clean:all
npm install
npm run dev
```

#### Database Issues

```bash
# Reset database
npm run db:reset
npm run db:seed
```

#### Build Failures

```bash
# Check TypeScript errors
npm run type-check

# Check linting issues
npm run lint:fix
```

#### Test Failures

```bash
# Run tests with verbose output
npm test -- --verbose

# Update snapshots if needed
npm test -- --updateSnapshot
```

## Welcome to the Team!

We're excited to have you join the ConstructPro development team. Don't hesitate to ask questions, share ideas, and contribute to making our platform better. Remember, everyone was new once, and we're here to support your growth and success.

Happy coding! 🚀