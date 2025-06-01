#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Generate comprehensive test summary and reports for Podplay Sanctuary

.DESCRIPTION
    This script analyzes test results, coverage data, and generates detailed reports
    for all types of tests in the Podplay Sanctuary application.

.PARAMETER OutputFormat
    The format for the output report (html, json, markdown, all)

.PARAMETER IncludeCoverage
    Whether to include coverage analysis in the report

.PARAMETER IncludePerformance
    Whether to include performance metrics in the report

.PARAMETER IncludeAccessibility
    Whether to include accessibility results in the report

.PARAMETER Open
    Whether to open the generated report automatically

.EXAMPLE
    .\generate-test-report.ps1 -OutputFormat html -IncludeCoverage -Open
    .\generate-test-report.ps1 -OutputFormat all -IncludeCoverage -IncludePerformance -IncludeAccessibility
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("html", "json", "markdown", "all")]
    [string]$OutputFormat = "html",
    
    [Parameter(Mandatory=$false)]
    [switch]$IncludeCoverage,
    
    [Parameter(Mandatory=$false)]
    [switch]$IncludePerformance,
    
    [Parameter(Mandatory=$false)]
    [switch]$IncludeAccessibility,
    
    [Parameter(Mandatory=$false)]
    [switch]$Open,
    
    [Parameter(Mandatory=$false)]
    [string]$OutputDir = "test-reports"
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Colors for output
$Green = "`e[32m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Cyan = "`e[36m"
$Reset = "`e[0m"

function Write-ColorOutput {
    param($Color, $Message)
    Write-Host "$Color$Message$Reset"
}

function Write-Info {
    param($Message)
    Write-ColorOutput $Cyan "ℹ️  $Message"
}

function Write-Success {
    param($Message)
    Write-ColorOutput $Green "✅ $Message"
}

# Ensure we're in the right directory
if (!(Test-Path "package.json")) {
    if (Test-Path "frontend/package.json") {
        Set-Location "frontend"
    } else {
        Write-Error "Could not find package.json"
        exit 1
    }
}

# Create output directory
if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
    Write-Info "Created output directory: $OutputDir"
}

# Generate timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$reportDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Initialize report data
$reportData = @{
    timestamp = $timestamp
    date = $reportDate
    project = "Podplay Sanctuary"
    version = "1.0.0"
    testResults = @{}
    coverage = @{}
    performance = @{}
    accessibility = @{}
    summary = @{}
}

# Function to parse Jest test results
function Get-TestResults {
    $testResults = @{
        unit = @{ passed = 0; failed = 0; total = 0; duration = 0 }
        integration = @{ passed = 0; failed = 0; total = 0; duration = 0 }
        e2e = @{ passed = 0; failed = 0; total = 0; duration = 0 }
        performance = @{ passed = 0; failed = 0; total = 0; duration = 0 }
        accessibility = @{ passed = 0; failed = 0; total = 0; duration = 0 }
    }
    
    # Check for Jest output files
    if (Test-Path "test-results.json") {
        $jestResults = Get-Content "test-results.json" | ConvertFrom-Json
        
        # Parse Jest results (this would need to be adapted based on actual Jest output format)
        foreach ($testSuite in $jestResults.testResults) {
            $suitePath = $testSuite.name
            $type = "unit" # Default
            
            if ($suitePath -match "integration") { $type = "integration" }
            elseif ($suitePath -match "e2e") { $type = "e2e" }
            elseif ($suitePath -match "performance") { $type = "performance" }
            elseif ($suitePath -match "accessibility") { $type = "accessibility" }
            
            $testResults[$type].total += $testSuite.numPassingTests + $testSuite.numFailingTests
            $testResults[$type].passed += $testSuite.numPassingTests
            $testResults[$type].failed += $testSuite.numFailingTests
            $testResults[$type].duration += $testSuite.perfStats.end - $testSuite.perfStats.start
        }
    }
    
    return $testResults
}

# Function to parse coverage data
function Get-CoverageData {
    $coverage = @{
        statements = @{ total = 0; covered = 0; percentage = 0 }
        branches = @{ total = 0; covered = 0; percentage = 0 }
        functions = @{ total = 0; covered = 0; percentage = 0 }
        lines = @{ total = 0; covered = 0; percentage = 0 }
        files = @()
    }
    
    if (Test-Path "coverage/coverage-summary.json") {
        $coverageData = Get-Content "coverage/coverage-summary.json" | ConvertFrom-Json
        
        $coverage.statements.total = $coverageData.total.statements.total
        $coverage.statements.covered = $coverageData.total.statements.covered
        $coverage.statements.percentage = $coverageData.total.statements.pct
        
        $coverage.branches.total = $coverageData.total.branches.total
        $coverage.branches.covered = $coverageData.total.branches.covered
        $coverage.branches.percentage = $coverageData.total.branches.pct
        
        $coverage.functions.total = $coverageData.total.functions.total
        $coverage.functions.covered = $coverageData.total.functions.covered
        $coverage.functions.percentage = $coverageData.total.functions.pct
        
        $coverage.lines.total = $coverageData.total.lines.total
        $coverage.lines.covered = $coverageData.total.lines.covered
        $coverage.lines.percentage = $coverageData.total.lines.pct
    }
    
    return $coverage
}

# Function to parse performance data
function Get-PerformanceData {
    $performance = @{
        coreWebVitals = @{}
        benchmarks = @()
        loadTimes = @{}
    }
    
    if (Test-Path "performance-results/performance-report.json") {
        $perfData = Get-Content "performance-results/performance-report.json" | ConvertFrom-Json
        $performance = $perfData
    }
    
    return $performance
}

# Function to parse accessibility data
function Get-AccessibilityData {
    $accessibility = @{
        violations = 0
        warnings = 0
        passes = 0
        compliance = @{
            level = "AA"
            percentage = 0
        }
        issues = @()
    }
    
    if (Test-Path "a11y-results/a11y-report.json") {
        $a11yData = Get-Content "a11y-results/a11y-report.json" | ConvertFrom-Json
        $accessibility = $a11yData
    }
    
    return $accessibility
}

# Generate HTML report
function Generate-HtmlReport {
    param($Data, $OutputPath)
    
    $html = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Report - $($Data.project)</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 20px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 { font-size: 2.5rem; margin-bottom: 10px; }
        .header p { font-size: 1.1rem; opacity: 0.9; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { 
            background: white;
            border-radius: 10px;
            padding: 25px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border-left: 4px solid #667eea;
        }
        .card h2 { color: #667eea; margin-bottom: 20px; }
        .metric { 
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .metric:last-child { border-bottom: none; }
        .metric-value { 
            font-weight: bold;
            font-size: 1.1rem;
        }
        .success { color: #10b981; }
        .warning { color: #f59e0b; }
        .error { color: #ef4444; }
        .progress-bar {
            width: 100%;
            height: 20px;
            background: #e5e7eb;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #10b981, #059669);
            transition: width 0.3s ease;
        }
        .summary {
            background: white;
            border-radius: 10px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .summary h2 { color: #667eea; margin-bottom: 20px; }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        .summary-item {
            text-align: center;
            padding: 20px;
            background: #f8fafc;
            border-radius: 8px;
        }
        .summary-number {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Test Report</h1>
            <p>$($Data.project) - Generated on $($Data.date)</p>
        </div>
        
        <div class="summary">
            <h2>📊 Test Summary</h2>
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-number success">$(($Data.testResults.unit.passed + $Data.testResults.integration.passed + $Data.testResults.e2e.passed))</div>
                    <div>Tests Passed</div>
                </div>
                <div class="summary-item">
                    <div class="summary-number error">$(($Data.testResults.unit.failed + $Data.testResults.integration.failed + $Data.testResults.e2e.failed))</div>
                    <div>Tests Failed</div>
                </div>
                <div class="summary-item">
                    <div class="summary-number">$($Data.coverage.lines.percentage)%</div>
                    <div>Code Coverage</div>
                </div>
                <div class="summary-item">
                    <div class="summary-number">$($Data.accessibility.violations)</div>
                    <div>A11y Violations</div>
                </div>
            </div>
        </div>
        
        <div class="grid">
            <div class="card">
                <h2>🧩 Unit Tests</h2>
                <div class="metric">
                    <span>Total Tests</span>
                    <span class="metric-value">$($Data.testResults.unit.total)</span>
                </div>
                <div class="metric">
                    <span>Passed</span>
                    <span class="metric-value success">$($Data.testResults.unit.passed)</span>
                </div>
                <div class="metric">
                    <span>Failed</span>
                    <span class="metric-value error">$($Data.testResults.unit.failed)</span>
                </div>
                <div class="metric">
                    <span>Duration</span>
                    <span class="metric-value">${($Data.testResults.unit.duration)}ms</span>
                </div>
            </div>
            
            <div class="card">
                <h2>🔗 Integration Tests</h2>
                <div class="metric">
                    <span>Total Tests</span>
                    <span class="metric-value">$($Data.testResults.integration.total)</span>
                </div>
                <div class="metric">
                    <span>Passed</span>
                    <span class="metric-value success">$($Data.testResults.integration.passed)</span>
                </div>
                <div class="metric">
                    <span>Failed</span>
                    <span class="metric-value error">$($Data.testResults.integration.failed)</span>
                </div>
                <div class="metric">
                    <span>Duration</span>
                    <span class="metric-value">${($Data.testResults.integration.duration)}ms</span>
                </div>
            </div>
            
            <div class="card">
                <h2>🎭 E2E Tests</h2>
                <div class="metric">
                    <span>Total Tests</span>
                    <span class="metric-value">$($Data.testResults.e2e.total)</span>
                </div>
                <div class="metric">
                    <span>Passed</span>
                    <span class="metric-value success">$($Data.testResults.e2e.passed)</span>
                </div>
                <div class="metric">
                    <span>Failed</span>
                    <span class="metric-value error">$($Data.testResults.e2e.failed)</span>
                </div>
                <div class="metric">
                    <span>Duration</span>
                    <span class="metric-value">${($Data.testResults.e2e.duration)}ms</span>
                </div>
            </div>
            
            <div class="card">
                <h2>📈 Code Coverage</h2>
                <div class="metric">
                    <span>Statements</span>
                    <span class="metric-value">$($Data.coverage.statements.percentage)%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: $($Data.coverage.statements.percentage)%"></div>
                </div>
                <div class="metric">
                    <span>Branches</span>
                    <span class="metric-value">$($Data.coverage.branches.percentage)%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: $($Data.coverage.branches.percentage)%"></div>
                </div>
                <div class="metric">
                    <span>Functions</span>
                    <span class="metric-value">$($Data.coverage.functions.percentage)%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: $($Data.coverage.functions.percentage)%"></div>
                </div>
                <div class="metric">
                    <span>Lines</span>
                    <span class="metric-value">$($Data.coverage.lines.percentage)%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: $($Data.coverage.lines.percentage)%"></div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>Generated by Podplay Sanctuary Test Suite - $($Data.timestamp)</p>
        </div>
    </div>
</body>
</html>
"@
    
    Set-Content -Path $OutputPath -Value $html -Encoding UTF8
}

# Main execution
Write-Info "Generating test report..."

# Collect data
Write-Info "Collecting test results..."
$reportData.testResults = Get-TestResults

if ($IncludeCoverage) {
    Write-Info "Collecting coverage data..."
    $reportData.coverage = Get-CoverageData
}

if ($IncludePerformance) {
    Write-Info "Collecting performance data..."
    $reportData.performance = Get-PerformanceData
}

if ($IncludeAccessibility) {
    Write-Info "Collecting accessibility data..."
    $reportData.accessibility = Get-AccessibilityData
}

# Generate reports
if ($OutputFormat -eq "html" -or $OutputFormat -eq "all") {
    $htmlPath = "$OutputDir/test-report-$timestamp.html"
    Generate-HtmlReport $reportData $htmlPath
    Write-Success "HTML report generated: $htmlPath"
    
    if ($Open) {
        Start-Process $htmlPath
    }
}

if ($OutputFormat -eq "json" -or $OutputFormat -eq "all") {
    $jsonPath = "$OutputDir/test-report-$timestamp.json"
    $reportData | ConvertTo-Json -Depth 10 | Set-Content -Path $jsonPath -Encoding UTF8
    Write-Success "JSON report generated: $jsonPath"
}

if ($OutputFormat -eq "markdown" -or $OutputFormat -eq "all") {
    $mdPath = "$OutputDir/test-report-$timestamp.md"
    $markdown = @"
# Test Report - $($reportData.project)

**Generated:** $($reportData.date)

## Summary

- **Total Tests:** $(($reportData.testResults.unit.total + $reportData.testResults.integration.total + $reportData.testResults.e2e.total))
- **Passed:** $(($reportData.testResults.unit.passed + $reportData.testResults.integration.passed + $reportData.testResults.e2e.passed))
- **Failed:** $(($reportData.testResults.unit.failed + $reportData.testResults.integration.failed + $reportData.testResults.e2e.failed))
- **Coverage:** $($reportData.coverage.lines.percentage)%

## Test Results

### Unit Tests
- Total: $($reportData.testResults.unit.total)
- Passed: $($reportData.testResults.unit.passed)
- Failed: $($reportData.testResults.unit.failed)
- Duration: $($reportData.testResults.unit.duration)ms

### Integration Tests
- Total: $($reportData.testResults.integration.total)
- Passed: $($reportData.testResults.integration.passed)
- Failed: $($reportData.testResults.integration.failed)
- Duration: $($reportData.testResults.integration.duration)ms

### E2E Tests
- Total: $($reportData.testResults.e2e.total)
- Passed: $($reportData.testResults.e2e.passed)
- Failed: $($reportData.testResults.e2e.failed)
- Duration: $($reportData.testResults.e2e.duration)ms

## Coverage Report

- **Statements:** $($reportData.coverage.statements.percentage)% ($($reportData.coverage.statements.covered)/$($reportData.coverage.statements.total))
- **Branches:** $($reportData.coverage.branches.percentage)% ($($reportData.coverage.branches.covered)/$($reportData.coverage.branches.total))
- **Functions:** $($reportData.coverage.functions.percentage)% ($($reportData.coverage.functions.covered)/$($reportData.coverage.functions.total))
- **Lines:** $($reportData.coverage.lines.percentage)% ($($reportData.coverage.lines.covered)/$($reportData.coverage.lines.total))

---
*Report generated by Podplay Sanctuary Test Suite*
"@
    
    Set-Content -Path $mdPath -Value $markdown -Encoding UTF8
    Write-Success "Markdown report generated: $mdPath"
}

Write-Success "Test report generation complete! 🎉"
