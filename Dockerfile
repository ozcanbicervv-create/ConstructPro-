# Multi-stage build for ConstructPro Next.js Application
# Stage 1: Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies with fallback strategy
RUN if [ -f package-lock.json ]; then \
        echo "Using npm ci with package-lock.json" && \
        npm ci --only=production; \
    else \
        echo "No package-lock.json found, using npm install" && \
        npm install --only=production; \
    fi

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files for dev dependencies
COPY package.json package-lock.json* ./

# Install all dependencies (including dev dependencies for build)
RUN if [ -f package-lock.json ]; then \
        echo "Installing all dependencies with npm ci" && \
        npm ci; \
    else \
        echo "Installing all dependencies with npm install" && \
        npm install; \
    fi

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy server.ts and related files
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/src ./src

# Copy tsx and other necessary executables
COPY --from=builder /app/node_modules ./node_modules

# Set correct permissions
USER nextjs

# Expose port
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Start the application using tsx
CMD ["npx", "tsx", "server.ts"]