# Technology Stack & Development Guide

## Core Framework
- **Next.js 15** with App Router - React framework for production
- **TypeScript 5** - Type-safe development with strict configuration
- **Node.js** - Runtime environment

## Frontend Stack
- **React 19** - UI library with latest features
- **Tailwind CSS 4** - Utility-first styling with custom configuration
- **shadcn/ui** - Component library built on Radix UI primitives
- **Framer Motion** - Animation and motion library
- **Lucide React** - Icon library

## Backend & Database
- **Prisma ORM** - Database toolkit with SQLite (development)
- **Custom Express-like server** - Custom server.ts with Socket.IO integration
- **Socket.IO** - Real-time bidirectional communication
- **NextAuth.js** - Authentication solution

## State Management & Data
- **Zustand** - Lightweight state management
- **TanStack Query** - Server state management and caching
- **React Hook Form + Zod** - Form handling with validation
- **Axios** - HTTP client

## UI & Interaction Libraries
- **DND Kit** - Drag and drop functionality
- **TanStack Table** - Data table management
- **Recharts** - Chart and data visualization
- **React Resizable Panels** - Resizable layout components

## Development Tools
- **ESLint** - Code linting (build errors ignored for rapid development)
- **TypeScript** - Configured with path aliases (@/* → ./src/*)
- **Nodemon + TSX** - Development server with hot reload

## Common Commands

### Development
```bash
npm run dev          # Start development server with nodemon
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database Operations
```bash
npm run db:push      # Push schema changes to database
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:reset     # Reset database
```

## Project Configuration Notes

- **Hot Reload**: Handled by nodemon, not Next.js webpack HMR
- **Build Tolerance**: TypeScript and ESLint errors ignored during builds for rapid iteration
- **Custom Server**: Uses server.ts for Socket.IO integration
- **Database**: SQLite for development, easily configurable for production databases
- **Styling**: New York style shadcn/ui components with neutral base color
- **Path Aliases**: @/* maps to src/* for clean imports