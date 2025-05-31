@echo off
REM 🐻 PODPLAY SANCTUARY - ONE-COMMAND INSTALLER
REM Fixes all dependency conflicts and installs everything
REM Professional Grade Installation Script

echo.
echo 🐻 PODPLAY SANCTUARY - PROFESSIONAL INSTALLER
echo ════════════════════════════════════════════════
echo.

echo [1/5] Checking prerequisites...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install from https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js found: 
node --version

echo.
echo [2/5] Cleaning previous installations...
if exist node_modules rmdir /s /q node_modules 2>nul
if exist frontend\node_modules rmdir /s /q frontend\node_modules 2>nul  
if exist frontend-new-2\node_modules rmdir /s /q frontend-new-2\node_modules 2>nul
if exist package-lock.json del package-lock.json 2>nul
if exist frontend\package-lock.json del frontend\package-lock.json 2>nul
if exist frontend-new-2\package-lock.json del frontend-new-2\package-lock.json 2>nul

echo ✅ Cleanup completed

echo.
echo [3/5] Running bulletproof installer...
powershell -ExecutionPolicy Bypass -File INSTALL_BULLETPROOF.ps1

echo.
echo [4/5] Verifying installation...
if not exist frontend-new-2\node_modules (
    echo ❌ Frontend installation failed
    pause
    exit /b 1
)

echo ✅ Installation verified

echo.
echo [5/5] Creating shortcuts...
echo @echo off > start-dev-simple.bat
echo echo 🐻 Starting Podplay Sanctuary... >> start-dev-simple.bat
echo start /B cmd /c "cd backend && python app.py" >> start-dev-simple.bat
echo timeout /t 3 /nobreak ^>nul >> start-dev-simple.bat
echo cd frontend-new-2 >> start-dev-simple.bat
echo npm run dev >> start-dev-simple.bat

echo ✅ Shortcuts created

echo.
echo 🎉 INSTALLATION COMPLETE!
echo ════════════════════════════════════════════════
echo.
echo 📋 NEXT STEPS:
echo   1. Run "start-dev-simple.bat" to start development
echo   2. Open http://localhost:5173 in your browser  
echo   3. Configure API keys in frontend-new-2\.env.local
echo.
echo 🔧 TROUBLESHOOTING:
echo   - If issues persist, run INSTALL_BULLETPROOF.ps1 directly
echo   - Check DEPENDENCY_CONFLICTS_RESOLUTION.md for details
echo.
pause
