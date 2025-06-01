#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Comprehensive test runner script for Podplay Sanctuary

.DESCRIPTION
    This script provides a unified interface for running different types of tests
    in the Podplay Sanctuary frontend application.

.PARAMETER TestType
    The type of test to run (unit, integration, e2e, performance, accessibility, all)

.PARAMETER Environment
    The environment to run tests in (local, ci, production)

.PARAMETER Coverage
    Whether to generate coverage reports

.PARAMETER Watch
    Whether to run tests in watch mode

.PARAMETER UpdateSnapshots
    Whether to update test snapshots

.PARAMETER Verbose
    Whether to run tests in verbose mode

.EXAMPLE
    .\run-tests.ps1 -TestType unit -Coverage
    .\run-tests.ps1 -TestType all -Environment ci
    .\run-tests.ps1 -TestType e2e -Watch
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("unit", "integration", "e2e", "performance", "accessibility", "all")]
    [string]$TestType = "unit",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("local", "ci", "production")]
    [string]$Environment = "local",
    
    [Parameter(Mandatory=$false)]
    [switch]$Coverage,
    
    [Parameter(Mandatory=$false)]
    [switch]$Watch,
    
    [Parameter(Mandatory=$false)]
    [switch]$UpdateSnapshots,
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose,
    
    [Parameter(Mandatory=$false)]
    [switch]$Debug,
    
    [Parameter(Mandatory=$false)]
    [string]$Browser = "chromium",
    
    [Parameter(Mandatory=$false)]
    [int]$Workers = 4,
    
    [Parameter(Mandatory=$false)]
    [switch]$Headless = $true
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Colors for output
$Red = "`e[31m"
$Green = "`e[32m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Magenta = "`e[35m"
$Cyan = "`e[36m"
$Reset = "`e[0m"

function Write-ColorOutput {
    param($Color, $Message)
    Write-Host "$Color$Message$Reset"
}

function Write-Header {
    param($Title)
    Write-Host ""
    Write-ColorOutput $Blue "=================================="
    Write-ColorOutput $Blue "  $Title"
    Write-ColorOutput $Blue "=================================="
    Write-Host ""
}

function Write-Success {
    param($Message)
    Write-ColorOutput $Green "✅ $Message"
}

function Write-Error {
    param($Message)
    Write-ColorOutput $Red "❌ $Message"
}

function Write-Warning {
    param($Message)
    Write-ColorOutput $Yellow "⚠️  $Message"
}

function Write-Info {
    param($Message)
    Write-ColorOutput $Cyan "ℹ️  $Message"
}

# Check if we're in the frontend directory
if (!(Test-Path "package.json")) {
    if (Test-Path "frontend/package.json") {
        Set-Location "frontend"
        Write-Info "Switched to frontend directory"
    } else {
        Write-Error "Could not find package.json. Please run from the frontend directory or project root."
        exit 1
    }
}

# Set environment variables based on environment
switch ($Environment) {
    "local" {
        $env:NODE_ENV = "test"
        if (Test-Path ".env.test.local") {
            Write-Info "Loading local test environment variables"
            Get-Content ".env.test.local" | ForEach-Object {
                if ($_ -match "^([^#][^=]+)=(.*)$") {
                    [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2])
                }
            }
        }
    }
    "ci" {
        $env:NODE_ENV = "test"
        $env:CI = "true"
        if (Test-Path ".env.test") {
            Write-Info "Loading CI test environment variables"
            Get-Content ".env.test" | ForEach-Object {
                if ($_ -match "^([^#][^=]+)=(.*)$") {
                    [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2])
                }
            }
        }
    }
    "production" {
        $env:NODE_ENV = "test"
        $env:PRODUCTION_TEST = "true"
    }
}

# Build Jest command
function Build-JestCommand {
    param($Type)
    
    $jestArgs = @()
    
    # Add test path pattern based on type
    switch ($Type) {
        "unit" {
            $jestArgs += "--testPathPattern=src/__tests__/utils"
            Write-Info "Running unit tests for utility functions"
        }
        "integration" {
            $jestArgs += "--testPathPattern=src/__tests__/integration"
            Write-Info "Running integration tests"
        }
        "e2e" {
            $jestArgs += "--testPathPattern=src/__tests__/e2e"
            Write-Info "Running end-to-end tests"
        }
        "performance" {
            $jestArgs += "--testNamePattern='performance|benchmark'"
            Write-Info "Running performance tests"
        }
        "accessibility" {
            $jestArgs += "--testNamePattern='accessibility|a11y'"
            Write-Info "Running accessibility tests"
        }
        "all" {
            Write-Info "Running all tests"
        }
    }
    
    # Add coverage if requested
    if ($Coverage) {
        $jestArgs += "--coverage"
        Write-Info "Coverage reporting enabled"
    }
    
    # Add watch mode if requested
    if ($Watch -and $Environment -eq "local") {
        $jestArgs += "--watch"
        Write-Info "Watch mode enabled"
    }
    
    # Add update snapshots if requested
    if ($UpdateSnapshots) {
        $jestArgs += "--updateSnapshot"
        Write-Info "Snapshot updates enabled"
    }
    
    # Add verbose if requested
    if ($Verbose) {
        $jestArgs += "--verbose"
        Write-Info "Verbose mode enabled"
    }
    
    # Add debug options
    if ($Debug) {
        $jestArgs += "--runInBand"
        $jestArgs += "--no-cache"
        Write-Info "Debug mode enabled"
    }
    
    # CI specific options
    if ($Environment -eq "ci") {
        $jestArgs += "--ci"
        $jestArgs += "--watchAll=false"
        $jestArgs += "--maxWorkers=$Workers"
    }
    
    return $jestArgs -join " "
}

# Pre-test checks
Write-Header "Pre-Test Setup"

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Info "Installing dependencies..."
    npm ci
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install dependencies"
        exit 1
    }
    Write-Success "Dependencies installed"
}

# Clear Jest cache if in debug mode
if ($Debug) {
    Write-Info "Clearing Jest cache..."
    npm run test:clear-cache
}

# Type check before running tests
if ($Environment -ne "local" -or $TestType -eq "all") {
    Write-Info "Running TypeScript type check..."
    npx tsc --noEmit
    if ($LASTEXITCODE -ne 0) {
        Write-Error "TypeScript type check failed"
        exit 1
    }
    Write-Success "TypeScript type check passed"
}

# Main test execution
Write-Header "Running Tests"

$jestCommand = Build-JestCommand $TestType
$fullCommand = "npx jest $jestCommand"

Write-Info "Executing: $fullCommand"
Write-Host ""

# Execute the tests
Invoke-Expression $fullCommand
$testExitCode = $LASTEXITCODE

# Post-test reporting
Write-Header "Test Results"

if ($testExitCode -eq 0) {
    Write-Success "All tests passed! 🎉"
    
    # Generate additional reports if coverage was enabled
    if ($Coverage) {
        Write-Info "Generating coverage reports..."
        
        if (Test-Path "coverage/lcov-report/index.html") {
            Write-Success "Coverage report generated at: coverage/lcov-report/index.html"
            
            if ($Environment -eq "local") {
                $openCoverage = Read-Host "Open coverage report in browser? (y/N)"
                if ($openCoverage -eq "y" -or $openCoverage -eq "Y") {
                    Start-Process "coverage/lcov-report/index.html"
                }
            }
        }
    }
    
    # Performance test summary
    if ($TestType -eq "performance" -or $TestType -eq "all") {
        if (Test-Path "performance-results") {
            Write-Success "Performance results saved to: performance-results/"
        }
    }
    
    # Accessibility test summary
    if ($TestType -eq "accessibility" -or $TestType -eq "all") {
        if (Test-Path "a11y-results") {
            Write-Success "Accessibility results saved to: a11y-results/"
        }
    }
    
} else {
    Write-Error "Tests failed! Exit code: $testExitCode"
    
    # Provide helpful debugging information
    Write-Host ""
    Write-Warning "Debugging tips:"
    Write-Host "  • Run with -Debug flag for more detailed output"
    Write-Host "  • Run with -Verbose flag for detailed test output"
    Write-Host "  • Check specific test files for detailed error messages"
    Write-Host "  • Use -Watch flag for continuous testing during development"
    
    if ($Environment -eq "local") {
        $runDebug = Read-Host "Run tests in debug mode? (y/N)"
        if ($runDebug -eq "y" -or $runDebug -eq "Y") {
            Write-Info "Re-running in debug mode..."
            & $MyInvocation.MyCommand.Path -TestType $TestType -Environment $Environment -Debug -Verbose
        }
    }
}

Write-Header "Test Execution Complete"
exit $testExitCode
