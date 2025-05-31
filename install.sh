#!/bin/bash
# Master Install Script for Podplay Sanctuary (Unix/Linux/Mac)
# Installs backend, frontend, and electron dependencies

echo "Installing Python backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..

echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "Installing electron dependencies..."
cd electron
npm install
cd ..

echo "All dependencies installed. To start the app, see the README for run instructions."
