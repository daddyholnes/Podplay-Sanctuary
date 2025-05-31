#!/bin/bash
# Cleanup Script for Podplay Sanctuary (Unix/Linux/Mac)
# Removes build artifacts, node_modules, __pycache__, and temp files

echo "Cleaning up build artifacts and temp files..."

# Remove Python __pycache__
find . -type d -name "__pycache__" -exec rm -rf {} +

# Remove node_modules
find . -type d -name "node_modules" -exec rm -rf {} +

# Remove dist/build folders
find . -type d \( -name "dist" -o -name "build" \) -exec rm -rf {} +

echo "Cleanup complete."
