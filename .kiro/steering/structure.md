# Project Structure & Organization

## Root Directory Structure

```
├── .kiro/                   # Kiro AI assistant configuration
│   ├── steering/           # AI guidance documents
│   └── specs/              # Feature specifications
├── db/                     # Database files (SQLite)
├── examples/               # Example implementations
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
├── src/                    # Source code
└── server.ts              # Custom server with Socket.IO
```

## Source Code Organization (`src/`)

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── admin-panel.tsx   # Admin interface
│   ├── ar-integration.tsx # AR features
│   ├── material-comparison.tsx # Material management
│   ├── professional-network.tsx # Networking features
│   ├── project-management.tsx # Project tools
│   ├── user-profile.tsx  # User management
│   └── verification-system.tsx # Quality assurance
├── hooks/                 # Custom React hooks
│   ├── use-mobile.ts     # Mobile detection
│   └── use-toast.ts      # Toast notifications
└── lib/                   # Utility functions
    ├── db.ts             # Database connection
    ├── socket.ts         # Socket.IO setup
    └── utils.ts          # General utilities
```

## Component Architecture

### UI Components (`src/components/ui/`)
- Built with shadcn/ui and Radix UI primitives
- Consistent styling with Tailwind CSS
- Accessible by default
- Reusable across the application

### Feature Components (`src/components/`)
- Domain-specific components for construction industry features
- Each component handles a specific business capability
- Follows React best practices with hooks and state management

### Custom Hooks (`src/hooks/`)
- Reusable logic extracted into custom hooks
- Mobile-first responsive design utilities
- UI interaction helpers (toasts, modals)

### Utilities (`src/lib/`)
- Database connection and configuration
- Socket.IO server setup for real-time features
- Common utility functions and helpers
- Type definitions and validation schemas

## File Naming Conventions

- **Components**: PascalCase for component files (`UserProfile.tsx`)
- **Hooks**: kebab-case with `use-` prefix (`use-mobile.ts`)
- **Utilities**: kebab-case (`utils.ts`, `db.ts`)
- **Pages**: kebab-case following Next.js App Router conventions
- **Types**: PascalCase with `.types.ts` suffix when separate

## Import Path Aliases

- `@/*` → `src/*` - Clean imports from source directory
- `@/components` → `src/components`
- `@/lib` → `src/lib`
- `@/hooks` → `src/hooks`

## Configuration Files

- `components.json` - shadcn/ui configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `next.config.ts` - Next.js configuration with custom server setup
- `tsconfig.json` - TypeScript configuration with path aliases
- `prisma/schema.prisma` - Database schema definition