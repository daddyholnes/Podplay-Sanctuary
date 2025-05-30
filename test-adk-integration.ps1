# ADK Workflow Integration Test Script
# PowerShell script for testing the ADK workflow endpoints

Write-Host "🚀 ADK Workflow Integration Test" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

$baseUrl = "http://localhost:5000"
$headers = @{ "Content-Type" = "application/json" }

# Function to test GET endpoint
function Test-GetEndpoint {
    param($url, $name)
    Write-Host "🧪 Testing: $name" -ForegroundColor Cyan
    Write-Host "   URL: $url" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method GET -Headers $headers -TimeoutSec 10
        Write-Host "   ✅ Success" -ForegroundColor Green
        Write-Host "   Response: $($response | ConvertTo-Json -Depth 2 -Compress)" -ForegroundColor Gray
        return $response
    }
    catch {
        if ($_.Exception.Response.StatusCode) {
            Write-Host "   ❌ HTTP $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        } else {
            Write-Host "   ❌ Connection failed - server not running?" -ForegroundColor Red
        }
        return $null
    }
    Write-Host ""
}

# Function to test POST endpoint  
function Test-PostEndpoint {
    param($url, $data, $name)
    Write-Host "🧪 Testing: $name (POST)" -ForegroundColor Cyan
    Write-Host "   URL: $url" -ForegroundColor Gray
    Write-Host "   Data: $($data | ConvertTo-Json -Compress)" -ForegroundColor Gray
    
    try {
        $jsonData = $data | ConvertTo-Json -Depth 3
        $response = Invoke-RestMethod -Uri $url -Method POST -Body $jsonData -Headers $headers -TimeoutSec 10
        Write-Host "   ✅ Success" -ForegroundColor Green
        Write-Host "   Response: $($response | ConvertTo-Json -Depth 2 -Compress)" -ForegroundColor Gray
        return $response
    }
    catch {
        if ($_.Exception.Response.StatusCode) {
            Write-Host "   ❌ HTTP $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        } else {
            Write-Host "   ❌ Connection failed - server not running?" -ForegroundColor Red
        }
        return $null
    }
    Write-Host ""
}

# Test basic server health
Write-Host "📊 Testing Basic Server Health" -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Yellow
Test-GetEndpoint "$baseUrl/" "Root endpoint"

# Test ADK workflow endpoints
Write-Host "🤖 Testing ADK Workflow Endpoints" -ForegroundColor Yellow  
Write-Host "----------------------------------" -ForegroundColor Yellow

Test-GetEndpoint "$baseUrl/api/adk/workflows" "Get workflows"
Test-GetEndpoint "$baseUrl/api/adk/models/status" "Models status" 
Test-GetEndpoint "$baseUrl/api/adk/system/health" "System health"
Test-GetEndpoint "$baseUrl/api/adk/system/capabilities" "System capabilities"

# Test workflow creation
Write-Host "📝 Testing Workflow Creation" -ForegroundColor Yellow
Write-Host "-----------------------------" -ForegroundColor Yellow

$workflowData = @{
    name = "PowerShell Test Workflow"
    description = "Test workflow created from PowerShell"
    models = @("claude-3.5-sonnet", "gpt-4o")
    steps = @("research", "analysis", "synthesis")
}

$createResult = Test-PostEndpoint "$baseUrl/api/adk/workflows/create" $workflowData "Create workflow"

# Test workflow execution
Write-Host "▶️ Testing Workflow Execution" -ForegroundColor Yellow
Write-Host "------------------------------" -ForegroundColor Yellow

$executionData = @{
    workflow_type = "research-analysis"
    task = "Research PowerShell automation best practices for AI workflows"
    models = @("claude-3.5-sonnet")
}

$executeResult = Test-PostEndpoint "$baseUrl/api/adk/workflows/execute" $executionData "Execute workflow"

# Test execution status if we got an execution ID
if ($executeResult -and $executeResult.execution_id) {
    Write-Host "⏳ Waiting 3 seconds for execution to start..." -ForegroundColor Gray
    Start-Sleep -Seconds 3
    
    $executionId = $executeResult.execution_id
    Test-GetEndpoint "$baseUrl/api/adk/workflows/execution/$executionId" "Execution status"
}

# Test model switching
Write-Host "🔄 Testing Model Switching" -ForegroundColor Yellow
Write-Host "---------------------------" -ForegroundColor Yellow

$switchData = @{
    model = "gpt-4o"
}

Test-PostEndpoint "$baseUrl/api/adk/models/switch" $switchData "Switch model"

# Summary
Write-Host ""
Write-Host "🏁 Test Complete!" -ForegroundColor Green
Write-Host "=================" -ForegroundColor Green
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "   - Tested basic server connectivity"
Write-Host "   - Tested ADK workflow endpoints"  
Write-Host "   - Tested workflow creation and execution"
Write-Host "   - Tested model switching capabilities"
Write-Host ""
Write-Host "💡 To start the server:" -ForegroundColor Yellow
Write-Host "   cd backend && python app-beta.py"
Write-Host ""
Write-Host "📚 For more details, see: ADK_WORKFLOW_INTEGRATION_COMPLETE.md" -ForegroundColor Cyan
