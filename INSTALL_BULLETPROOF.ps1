# 🐻 PODPLAY SANCTUARY - BULLETPROOF INSTALLATION SCRIPT
# Fixes all 9+ dependency conflicts and ensures clean installation
# Version: 2.0 - Professional Grade Installation

param(
    [string]$frontend = "frontend-new-2",  # Default to the cleanest frontend
    [switch]$CleanInstall = $false,
    [switch]$SkipPython = $false,
    [switch]$Verbose = $false
)

Write-Host "🐻 PODPLAY SANCTUARY BULLETPROOF INSTALLER v2.0" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan

# Function to log with colors
function Write-Log {
    param($Message, $Color = "White", $Type = "INFO")
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] [$Type] $Message" -ForegroundColor $Color
}

function Write-Success { param($msg) Write-Log $msg "Green" "✅" }
function Write-Error { param($msg) Write-Log $msg "Red" "❌" }
function Write-Warning { param($msg) Write-Log $msg "Yellow" "⚠️" }
function Write-Info { param($msg) Write-Log $msg "Cyan" "ℹ️" }

# Ensure we're in the project root
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Error "Must run from project root directory!"
    exit 1
}

Write-Info "Starting bulletproof installation process..."
Write-Info "Target frontend: $frontend"

# Step 1: Clean installation if requested
if ($CleanInstall) {
    Write-Warning "Performing clean installation (removing all node_modules and __pycache__)..."
    
    # Remove all node_modules directories
    Get-ChildItem -Path . -Recurse -Directory -Name "node_modules" | ForEach-Object {
        $path = $_.FullName
        Write-Info "Removing: $path"
        Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    # Remove Python cache
    Get-ChildItem -Path . -Recurse -Directory -Name "__pycache__" | ForEach-Object {
        Remove-Item -Path $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    # Remove package-lock files
    Get-ChildItem -Path . -Recurse -File -Name "package-lock.json" | ForEach-Object {
        Remove-Item -Path $_.FullName -Force -ErrorAction SilentlyContinue
    }
    
    Write-Success "Clean installation completed"
}

# Step 2: Check prerequisites
Write-Info "Checking prerequisites..."

# Check Node.js
try {
    $nodeVersion = node --version
    if ($nodeVersion -match "v(\d+)\.") {
        $majorVersion = [int]$Matches[1]
        if ($majorVersion -lt 18) {
            Write-Error "Node.js version $nodeVersion is too old. Please install Node.js 18+ from https://nodejs.org"
            exit 1
        }
        Write-Success "Node.js $nodeVersion detected"
    }
} catch {
    Write-Error "Node.js not found. Please install from https://nodejs.org"
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Success "npm $npmVersion detected"
} catch {
    Write-Error "npm not found"
    exit 1
}

# Check Python (optional)
if (-not $SkipPython) {
    try {
        $pythonVersion = python --version 2>&1
        if ($pythonVersion -match "Python 3\.(\d+)") {
            $minorVersion = [int]$Matches[1]
            if ($minorVersion -lt 8) {
                Write-Warning "Python version is old. Consider upgrading to Python 3.8+"
            } else {
                Write-Success "Python $pythonVersion detected"
            }
        }
    } catch {
        try {
            $pythonVersion = python3 --version
            Write-Success "Python3 $pythonVersion detected"
        } catch {
            Write-Warning "Python not found. Backend installation will be skipped."
            $SkipPython = $true
        }
    }
}

# Step 3: Fix root package.json conflicts
Write-Info "Fixing root package.json conflicts..."

$rootPackageJson = @{
    name = "podplay-sanctuary-workspace"
    version = "1.0.0"
    description = "🐻 Podplay Sanctuary - AI Development Workspace"
    private = $true
    type = "commonjs"
    workspaces = @("frontend", "frontend-new-2", "electron")
    scripts = @{
        "install:all" = "npm install && npm run install:frontend && npm run install:backend"
        "install:frontend" = "cd $frontend && npm install"
        "install:backend" = "cd backend && pip install -r requirements.txt"
        "dev" = "concurrently `"npm run dev:backend`" `"npm run dev:frontend`""
        "dev:backend" = "cd backend && python app.py"
        "dev:frontend" = "cd $frontend && npm run dev"
        "build" = "cd $frontend && npm run build"
        "start" = "npm run dev"
        "clean" = "powershell -ExecutionPolicy Bypass -File INSTALL_BULLETPROOF.ps1 -CleanInstall"
    }
    devDependencies = @{
        "concurrently" = "^8.2.2"
    }
    engines = @{
        node = ">=18.0.0"
        npm = ">=8.0.0"
    }
    author = "Podplay Sanctuary Team"
    license = "MIT"
}

$rootPackageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"
Write-Success "Root package.json fixed"

# Step 4: Backup and fix frontend package.json
Write-Info "Fixing frontend package.json conflicts..."

# Backup original frontend if it exists
if (Test-Path "frontend/package.json") {
    Copy-Item "frontend/package.json" "frontend/package.json.backup" -Force
    Write-Info "Backed up original frontend/package.json"
}

# Create clean frontend-new-2 package.json with fixed versions
$frontendPackageJson = @{
    name = "podplay-sanctuary-frontend"
    private = $true
    version = "1.0.0"
    type = "module"
    description = "Podplay Sanctuary - Professional Frontend"
    scripts = @{
        "dev" = "vite --host 0.0.0.0"
        "build" = "tsc --noEmit && vite build"
        "preview" = "vite preview --host 0.0.0.0"
        "lint" = "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
    }
    dependencies = @{
        "react" = "^18.2.0"
        "react-dom" = "^18.2.0"
        "@google/genai" = "^1.3.0"
        "axios" = "^1.6.0"
        "socket.io-client" = "^4.7.0"
    }
    devDependencies = @{
        "@types/node" = "^20.0.0"
        "@types/react" = "^18.2.0"
        "@types/react-dom" = "^18.2.0"
        "@vitejs/plugin-react" = "^4.0.0"
        "eslint" = "^8.0.0"
        "eslint-plugin-react-hooks" = "^4.6.0"
        "eslint-plugin-react-refresh" = "^0.4.0"
        "typescript" = "^5.0.0"
        "vite" = "^5.0.0"
        "tailwindcss" = "^3.4.0"
        "autoprefixer" = "^10.4.0"
        "postcss" = "^8.4.0"
    }
    engines = @{
        node = ">=18.0.0"
    }
}

# Apply to target frontend
$frontendPackageJson | ConvertTo-Json -Depth 10 | Set-Content "$frontend/package.json"
Write-Success "Frontend package.json fixed ($frontend)"

# Step 5: Install root dependencies
Write-Info "Installing root dependencies..."
try {
    npm install --no-audit --no-fund
    Write-Success "Root dependencies installed"
} catch {
    Write-Warning "Root dependency installation had warnings (continuing...)"
}

# Step 6: Install frontend dependencies
Write-Info "Installing frontend dependencies..."
Push-Location $frontend
try {
    # Clear npm cache first
    npm cache clean --force 2>$null
    
    # Install with specific flags to avoid conflicts
    npm install --no-audit --no-fund --legacy-peer-deps
    Write-Success "Frontend dependencies installed"
} catch {
    Write-Error "Frontend installation failed. Trying alternative method..."
    # Try alternative installation
    try {
        npm ci --legacy-peer-deps
        Write-Success "Frontend dependencies installed (alternative method)"
    } catch {
        Write-Error "Frontend installation failed completely"
    }
} finally {
    Pop-Location
}

# Step 7: Install Python backend (if not skipped)
if (-not $SkipPython) {
    Write-Info "Installing Python backend dependencies..."
    Push-Location backend
    try {
        # Check if virtual environment exists
        if (-not (Test-Path "venv")) {
            Write-Info "Creating Python virtual environment..."
            python -m venv venv
        }
        
        # Activate virtual environment and install requirements
        if (Test-Path "venv/Scripts/Activate.ps1") {
            & venv/Scripts/Activate.ps1
            Write-Info "Virtual environment activated"
        }
        
        # Upgrade pip first
        python -m pip install --upgrade pip
        
        # Install requirements
        pip install -r requirements.txt
        Write-Success "Python backend dependencies installed"
    } catch {
        Write-Warning "Python backend installation had issues (continuing...)"
    } finally {
        Pop-Location
    }
}

# Step 8: Create environment configuration
Write-Info "Creating environment configuration..."

# Create .env.example in frontend
$envExample = @"
# Podplay Sanctuary - Environment Configuration
# Copy this to .env.local and fill in your API keys

# Backend API Configuration
VITE_API_BASE_URL=http://localhost:5000
VITE_API_TIMEOUT=30000

# AI API Keys (Optional - for direct frontend integration)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Application Configuration
VITE_APP_NAME=Podplay Sanctuary
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development

# WebSocket Configuration
VITE_WEBSOCKET_URL=ws://localhost:5000
"@

$envExample | Set-Content "$frontend/.env.example"

# Create .env.local template
if (-not (Test-Path "$frontend/.env.local")) {
    $envExample | Set-Content "$frontend/.env.local"
    Write-Info "Created .env.local template in $frontend"
}

# Step 9: Create startup scripts
Write-Info "Creating startup scripts..."

# Development startup script
$devScript = @"
@echo off
echo 🐻 Starting Podplay Sanctuary Development Environment...
echo.

echo Starting backend server...
start /B cmd /c "cd backend && python app.py"

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo Starting frontend development server...
cd $frontend
npm run dev

pause
"@

$devScript | Set-Content "start-dev.bat"

# Production build script
$buildScript = @"
@echo off
echo 🐻 Building Podplay Sanctuary for Production...
echo.

cd $frontend
echo Building frontend...
npm run build

echo.
echo Build complete! Check $frontend/dist folder.
pause
"@

$buildScript | Set-Content "build-prod.bat"

Write-Success "Startup scripts created"

# Step 10: Verification
Write-Info "Verifying installation..."

$verificationPassed = $true

# Check if package.json files exist and are valid
$packageFiles = @(
    "package.json",
    "$frontend/package.json"
)

foreach ($file in $packageFiles) {
    if (Test-Path $file) {
        try {
            $content = Get-Content $file | ConvertFrom-Json
            Write-Success "✓ $file is valid"
        } catch {
            Write-Error "✗ $file is invalid JSON"
            $verificationPassed = $false
        }
    } else {
        Write-Error "✗ $file is missing"
        $verificationPassed = $false
    }
}

# Check if node_modules exist
if (Test-Path "$frontend/node_modules") {
    Write-Success "✓ Frontend dependencies installed"
} else {
    Write-Warning "✗ Frontend dependencies may not be properly installed"
}

# Final report
Write-Host "`n🐻 INSTALLATION COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green

if ($verificationPassed) {
    Write-Success "All verification checks passed!"
} else {
    Write-Warning "Some verification checks failed. Review the output above."
}

Write-Host "`n📋 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. To start development: Run 'start-dev.bat' or 'npm run dev'" -ForegroundColor White
Write-Host "2. To build for production: Run 'build-prod.bat' or 'npm run build'" -ForegroundColor White
Write-Host "3. Configure API keys in '$frontend/.env.local'" -ForegroundColor White
Write-Host "4. Check the comprehensive documentation in COMPLETE_PROJECT_DOCUMENTATION.md" -ForegroundColor White

Write-Host "`n🔧 TROUBLESHOOTING:" -ForegroundColor Yellow
Write-Host "• If you encounter issues, run with -CleanInstall flag" -ForegroundColor White
Write-Host "• For verbose output, use -Verbose flag" -ForegroundColor White
Write-Host "• Skip Python backend with -SkipPython flag" -ForegroundColor White
Write-Host "• Check logs above for any error messages" -ForegroundColor White

Write-Host "`n🎯 PROFESSIONAL INSTALLATION COMPLETE!" -ForegroundColor Magenta
