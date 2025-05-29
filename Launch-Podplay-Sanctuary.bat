@echo off
title Podplay Sanctuary - Desktop Launcher
echo.
echo ================================================
echo 🎧 PODPLAY SANCTUARY - LAUNCHING DESKTOP APP 🎧
echo ================================================
echo.

cd /d "c:\Users\woodyholne\Desktop\Podplay-Sanctuary\electron"

echo 🔧 Starting Podplay Sanctuary...
echo 📍 Location: %CD%
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Node.js is not installed or not in PATH
    echo 📥 Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

echo 🚀 Launching Podplay Sanctuary Desktop App...
echo.

:: Check if backend is running
curl -s http://localhost:5000/api/test > nul 2>&1
if errorlevel 1 (
    echo 🔄 Backend not detected. Starting backend server...
    start "Podplay Backend" cmd /c "cd /d "c:\Users\woodyholne\Desktop\Podplay-Sanctuary\backend" && python app.py"
    echo ⏳ Waiting for backend to start...
    timeout /t 5 /nobreak > nul
)

:: Check for debug mode flag
set DEBUG_MODE=0
if "%1"=="--debug" set DEBUG_MODE=1
if defined PODPLAY_DEBUG set DEBUG_MODE=1

if %DEBUG_MODE%==1 (
    echo 🔍 Starting in DEBUG MODE...
    set ELECTRON_ENABLE_LOGGING=true
    npm run dev
) else (
    npm start
)

if errorlevel 1 (
    echo.
    echo ❌ Failed to start Podplay Sanctuary
    echo 🔧 Try running: npm install
    echo.
    echo 🔍 For debug mode, run: %~nx0 --debug
    echo.
    pause
)
