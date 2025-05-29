#!/bin/bash

# Podplay Sanctuary Desktop App Launcher
# This script launches the Podplay Sanctuary Electron desktop application

set -e

echo "🎧 Podplay Sanctuary Desktop App Launcher"
echo "========================================="

# Check if we're in the correct directory
if [ ! -f "electron/package.json" ]; then
    echo "❌ Error: Please run this script from the Podplay Sanctuary root directory"
    exit 1
fi

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed. Please install Docker first."
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "❌ Error: Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Check if Electron dependencies are installed
if [ ! -d "electron/node_modules" ]; then
    echo "📦 Installing Electron dependencies..."
    cd electron
    npm install
    cd ..
fi

echo "🚀 Starting Podplay Sanctuary Desktop App..."

# Launch the Electron app
cd electron
npm start
