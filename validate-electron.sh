#!/bin/bash

# Electron App Validation Script
# Tests the Electron application configuration without requiring a display

echo "🔍 Podplay Sanctuary Electron App Validation"
echo "============================================"

cd /workspaces/Podplay-Sanctuary/electron

# Check if package.json exists and is valid
echo "📋 Checking package.json..."
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found"
    exit 1
fi

# Validate JSON syntax
if ! node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))"; then
    echo "❌ package.json has invalid JSON syntax"
    exit 1
fi

echo "✅ package.json is valid"

# Check if main.js exists
echo "📋 Checking main.js..."
if [ ! -f "main.js" ]; then
    echo "❌ main.js not found"
    exit 1
fi

# Check if preload.js exists
echo "📋 Checking preload.js..."
if [ ! -f "preload.js" ]; then
    echo "❌ preload.js not found"
    exit 1
fi

# Check if loading.html exists
echo "📋 Checking loading.html..."
if [ ! -f "loading.html" ]; then
    echo "❌ loading.html not found"
    exit 1
fi

# Check if node_modules exists
echo "📋 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules not found. Run 'npm install' first."
    exit 1
fi

# Check if electron is installed
if [ ! -f "node_modules/.bin/electron" ]; then
    echo "❌ Electron not found in node_modules"
    exit 1
fi

echo "✅ All required files present"

# Validate main.js syntax
echo "📋 Validating main.js syntax..."
if ! node -c main.js; then
    echo "❌ main.js has syntax errors"
    exit 1
fi

echo "✅ main.js syntax is valid"

# Validate preload.js syntax
echo "📋 Validating preload.js syntax..."
if ! node -c preload.js; then
    echo "❌ preload.js has syntax errors"
    exit 1
fi

echo "✅ preload.js syntax is valid"

# Check for required Docker files in parent directory
echo "📋 Checking Docker configuration..."
cd ..
if [ ! -f "docker-compose.dev.yml" ]; then
    echo "❌ docker-compose.dev.yml not found in parent directory"
    exit 1
fi

echo "✅ Docker configuration found"

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "⚠️  Warning: Docker not found. The app will need Docker to run."
else
    echo "✅ Docker is available"
fi

# Check if curl is available (used for service checking)
if ! command -v curl &> /dev/null; then
    echo "⚠️  Warning: curl not found. Service health checks may fail."
else
    echo "✅ curl is available"
fi

echo ""
echo "🎉 Validation complete! The Electron app is properly configured."
echo ""
echo "To run the app:"
echo "  ./start-desktop.sh"
echo ""
echo "Or manually:"
echo "  cd electron && npm start"
