#!/bin/bash

# ConstructPro Local Deployment Test Script
# Tests the application locally before Coolify deployment

set -e

echo "🚀 ConstructPro Local Deployment Test"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ "$2" = "success" ]; then
        echo -e "${GREEN}✅ $1${NC}"
    elif [ "$2" = "error" ]; then
        echo -e "${RED}❌ $1${NC}"
    else
        echo -e "${YELLOW}ℹ️  $1${NC}"
    fi
}

# Check if Node.js is installed
print_status "Checking Node.js installation..." "info"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status "Node.js version: $NODE_VERSION" "success"
else
    print_status "Node.js is not installed!" "error"
    exit 1
fi

# Check if npm is installed
print_status "Checking npm installation..." "info"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status "npm version: $NPM_VERSION" "success"
else
    print_status "npm is not installed!" "error"
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..." "info"
if npm install; then
    print_status "Dependencies installed successfully" "success"
else
    print_status "Failed to install dependencies" "error"
    exit 1
fi

# Generate Prisma client
print_status "Generating Prisma client..." "info"
if npx prisma generate; then
    print_status "Prisma client generated successfully" "success"
else
    print_status "Failed to generate Prisma client" "error"
    exit 1
fi

# Build the application
print_status "Building ConstructPro application..." "info"
if npm run build; then
    print_status "Application built successfully" "success"
else
    print_status "Build failed" "error"
    exit 1
fi

# Start the application in background
print_status "Starting application server..." "info"
npm run start &
SERVER_PID=$!

# Wait for server to start
sleep 10

# Test if server is running
print_status "Testing server accessibility..." "info"
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    print_status "Server is accessible" "success"
else
    print_status "Server is not accessible" "error"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Run deployment tests
print_status "Running deployment tests..." "info"
if node scripts/deployment-tests.js http://localhost:3000; then
    print_status "All deployment tests passed" "success"
else
    print_status "Some deployment tests failed" "error"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Clean up
print_status "Stopping test server..." "info"
kill $SERVER_PID 2>/dev/null || true
sleep 2

print_status "Local deployment test completed successfully!" "success"
echo ""
echo "🎉 ConstructPro is ready for Coolify deployment!"
echo ""
echo "Next steps:"
echo "1. Commit and push your changes to GitHub"
echo "2. Deploy using Coolify dashboard"
echo "3. Run: node scripts/deployment-tests.js <your-coolify-url>"