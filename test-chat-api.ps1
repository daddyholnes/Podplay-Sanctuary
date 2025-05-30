#!/usr/bin/env pwsh
# PowerShell script to test the Mama Bear chat API properly

# Test data
$testPayload = @{
    message = "Can you show me your MCP marketplace capabilities?"
    user_id = "nathan"
} | ConvertTo-Json

# API endpoint
$uri = "http://localhost:5000/api/chat/mama-bear"

# Headers
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "🧪 Testing Mama Bear Chat API..." -ForegroundColor Cyan
Write-Host "📍 Endpoint: $uri" -ForegroundColor Yellow
Write-Host "📦 Payload: $testPayload" -ForegroundColor Yellow
Write-Host ""

try {
    # Make the request using Invoke-RestMethod (PowerShell native)
    $response = Invoke-RestMethod -Uri $uri -Method POST -Body $testPayload -Headers $headers -ContentType "application/json"
    
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "📨 Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10 | Write-Host
    
} catch {
    Write-Host "❌ ERROR!" -ForegroundColor Red
    Write-Host "🔍 Error Details:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "📊 Status Code: $statusCode" -ForegroundColor Yellow
        
        # Try to get the response body
        try {
            $responseStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($responseStream)
            $responseBody = $reader.ReadToEnd()
            Write-Host "📝 Response Body: $responseBody" -ForegroundColor Red
        } catch {
            Write-Host "📝 Could not read response body" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "🔄 Testing alternative endpoints..." -ForegroundColor Cyan

# Test health endpoint
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET
    Write-Host "✅ Health Check: $($healthResponse.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test daily briefing
try {
    $briefingResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/chat/daily-briefing?user_id=nathan" -Method GET
    Write-Host "✅ Daily Briefing: Success" -ForegroundColor Green
} catch {
    Write-Host "❌ Daily Briefing Failed: $($_.Exception.Message)" -ForegroundColor Red
}
