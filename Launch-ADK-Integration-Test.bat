@echo off
REM ADK Workflow Integration - Quick Test Launcher
REM This script helps you quickly test the ADK integration

echo.
echo ==========================================
echo 🚀 ADK Workflow Integration Test Launcher
echo ==========================================
echo.

echo 📁 Current directory: %CD%
echo 🐍 Python version:
python --version
echo.

echo 🔧 Choose an option:
echo   1. Start Legacy App (app-beta.py) with ADK integration
echo   2. Start Factory App (app_new.py) with ADK integration  
echo   3. Run integration test suite (Python)
echo   4. Run integration test suite (PowerShell)
echo   5. Check ADK agent status only
echo   6. View integration documentation
echo.

set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" (
    echo.
    echo 🚀 Starting Legacy App with ADK integration...
    echo 🌐 Server will be available at: http://localhost:5000
    echo 🔗 ADK endpoints: /api/adk/*
    echo.
    cd backend
    python app-beta.py
)

if "%choice%"=="2" (
    echo.
    echo 🏗️ Starting Factory App with ADK integration...
    echo 🌐 Server will be available at: http://localhost:5000
    echo 🔗 ADK endpoints: /api/adk-workflows/*
    echo.
    cd backend
    python app_new.py
)

if "%choice%"=="3" (
    echo.
    echo 🧪 Running Python integration test suite...
    echo 📋 This will test both legacy and factory endpoints
    echo.
    python test_adk_integration.py
)

if "%choice%"=="4" (
    echo.
    echo 🧪 Running PowerShell integration test suite...
    echo 📋 This will test the legacy app endpoints
    echo.
    powershell -ExecutionPolicy Bypass -File test-adk-integration.ps1
)

if "%choice%"=="5" (
    echo.
    echo 🔍 Checking ADK agent status...
    cd backend
    python -c "from adk_mama_bear import ADKMamaBearAgent; agent = ADKMamaBearAgent(); print('✅ ADK agent initialized successfully'); print(f'🤖 Current model: {getattr(agent, \"current_model\", \"Not set\")}'); print(f'📊 Available models: {getattr(agent, \"available_models\", [])}');"
)

if "%choice%"=="6" (
    echo.
    echo 📚 Opening integration documentation...
    if exist "ADK_WORKFLOW_INTEGRATION_COMPLETE.md" (
        notepad ADK_WORKFLOW_INTEGRATION_COMPLETE.md
    ) else (
        echo ❌ Documentation file not found: ADK_WORKFLOW_INTEGRATION_COMPLETE.md
    )
)

if not "%choice%"=="1" if not "%choice%"=="2" if not "%choice%"=="3" if not "%choice%"=="4" if not "%choice%"=="5" if not "%choice%"=="6" (
    echo.
    echo ❌ Invalid choice. Please run the script again and choose 1-6.
)

echo.
echo 🔧 Press any key to exit...
pause >nul
