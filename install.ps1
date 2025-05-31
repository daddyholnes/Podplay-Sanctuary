# Master Install Script for Podplay Sanctuary (Windows PowerShell)
# Installs backend, frontend, and electron dependencies

Write-Host "Installing Python backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..

Write-Host "Installing frontend dependencies..."
cd frontend
npm install
cd ..

Write-Host "Installing electron dependencies..."
cd electron
npm install
cd ..

Write-Host "All dependencies installed. To start the app, see the README for run instructions."
