# Development Setup Guide

This guide provides comprehensive instructions for setting up the ConstructPro development environment on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

- **Node.js** (version 18.0.0 or higher)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`
- **npm** (version 8.0.0 or higher)
  - Comes with Node.js
  - Verify installation: `npm --version`
- **Git** (latest version)
  - Download from [git-scm.com](https://git-scm.com/)
  - Verify installation: `git --version`

### Recommended Tools

- **Visual Studio Code** - Recommended IDE with excellent TypeScript support
- **Git GUI Client** - GitKraken, SourceTree, or GitHub Desktop
- **Database Browser** - DB Browser for SQLite (for viewing the development database)

## Project Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd constructpro

# Or if you're working with a fork
git clone <your-fork-url>
cd constructpro
git remote add upstream <original-repository-url>
```

### 2. Install Dependencies

```bash
# Install all project dependencies
npm install

# This will install both production and development dependencies
# including Next.js, TypeScript, Prisma, and all UI libraries
```

### 3. Environment Configuration

Create your local environment file:

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit the environment file with your local settings
```

Configure the following environment variables in `.env.local`:

```env
# Database
DATABASE_URL="file:./db/custom.db"

# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Optional: External API Keys
# Add any external service API keys here
```

### 4. Database Setup

ConstructPro uses Prisma with SQLite for development:

```bash
# Generate Prisma client
npm run db:generate

# Push the schema to create the database
npm run db:push

# Optional: Reset database if needed
npm run db:reset
```

The database file will be created at `db/custom.db`.

### 5. Start Development Server

```bash
# Start the development server with hot reload
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Development Workflow

### Code Quality Tools

The project includes several code quality tools that run automatically:

#### ESLint
- Lints TypeScript and React code
- Configured with Next.js and TypeScript rules
- Run manually: `npm run lint`
- Fix issues: `npm run lint:fix`

#### Prettier
- Formats code consistently
- Run manually: `npm run format`
- Check formatting: `npm run format:check`

#### TypeScript
- Type checking for all TypeScript files
- Run manually: `npm run type-check`

#### Husky Pre-commit Hooks
- Automatically runs linting and formatting on commit
- Prevents commits with linting errors
- Configured in `.husky/pre-commit`

### Testing

The project uses Jest and React Testing Library:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI (no watch mode)
npm run test:ci
```

### Database Operations

Common database operations during development:

```bash
# Generate Prisma client after schema changes
npm run db:generate

# Push schema changes to database
npm run db:push

# Create and run migrations
npm run db:migrate

# Reset database (removes all data)
npm run db:reset
```

## Project Structure

Understanding the project structure will help you navigate and contribute effectively:

```
constructpro/
├── .kiro/                  # Kiro AI assistant configuration
├── docs/                   # Project documentation (this directory)
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
├── src/                    # Source code
│   ├── app/               # Next.js App Router pages
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utilities and configurations
├── tests/                  # Test files
├── server.ts              # Custom server with Socket.IO
└── package.json           # Project configuration
```

### Key Directories

- **`src/app/`** - Next.js 15 App Router pages and API routes
- **`src/components/`** - Reusable React components, including shadcn/ui components
- **`src/lib/`** - Utility functions, database connection, and configurations
- **`src/hooks/`** - Custom React hooks for shared logic
- **`tests/`** - Unit tests, integration tests, and test utilities

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing code style enforced by Prettier
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Prefer functional components with hooks

### Component Development

- Use shadcn/ui components as the foundation
- Create reusable components in `src/components/ui/`
- Feature-specific components go in `src/components/`
- Use TypeScript interfaces for component props
- Implement proper error boundaries

### State Management

- Use Zustand for global state management
- Use TanStack Query for server state
- Use React Hook Form for form state
- Keep component state local when possible

### API Development

- API routes go in `src/app/api/`
- Use proper HTTP status codes
- Implement error handling
- Add input validation with Zod
- Document API endpoints

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process using port 3000
npx kill-port 3000

# Or use a different port
PORT=3001 npm run dev
```

#### Database Issues
```bash
# Reset database if corrupted
npm run db:reset

# Regenerate Prisma client
npm run db:generate
```

#### Node Modules Issues
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript Errors
```bash
# Run type checking
npm run type-check

# Restart TypeScript server in VS Code
# Command Palette > TypeScript: Restart TS Server
```

### Getting Help

1. Check the [troubleshooting guide](./troubleshooting.md)
2. Search existing GitHub issues
3. Create a new issue with detailed information
4. Ask questions in team chat or discussions

## Next Steps

After setting up your development environment:

1. Read the [Contributing Guide](./contributing.md)
2. Explore the [API Documentation](./api/)
3. Review the [Deployment Guide](./deployment.md)
4. Check out the project roadmap and open issues

## Performance Tips

### Development Server
- Use `npm run dev` for hot reload during development
- The custom server setup provides Socket.IO integration
- TypeScript compilation happens automatically

### Database Performance
- SQLite is used for development (fast and lightweight)
- Use database migrations for schema changes
- Consider using database seeding for test data

### Build Performance
- Next.js 15 provides optimized builds
- Use dynamic imports for code splitting
- Optimize images with Next.js Image component

---

For more detailed information, see the other documentation files in this directory.