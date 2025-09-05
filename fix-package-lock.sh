#!/bin/bash

# Script to fix package-lock.json issues
echo "Checking package-lock.json integrity..."

# Check if package-lock.json exists
if [ ! -f "package-lock.json" ]; then
    echo "package-lock.json not found. Generating new one..."
    npm install
    echo "New package-lock.json generated."
else
    echo "package-lock.json exists. Verifying integrity..."
    
    # Try npm ci first
    if npm ci --dry-run > /dev/null 2>&1; then
        echo "package-lock.json is valid for npm ci"
    else
        echo "package-lock.json has issues. Regenerating..."
        rm package-lock.json
        npm install
        echo "package-lock.json regenerated."
    fi
fi

echo "Package lock fix completed."