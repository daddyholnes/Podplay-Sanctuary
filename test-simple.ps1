# Simple PowerShell script to test the Mama Bear chat API

$testPayload = '{"message": "Can you show me your MCP marketplace capabilities?", "user_id": "nathan"}'
$uri = "http://localhost:5000/api/chat/mama-bear"

Write-Host "Testing Mama Bear Chat API..." -ForegroundColor Cyan
Write-Host "Endpoint: $uri" -ForegroundColor Yellow
Write-Host "Payload: $testPayload" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -Body $testPayload -ContentType "application/json"
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10
    
} catch {
    Write-Host "ERROR!" -ForegroundColor Red
    Write-Host "Error Details:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "Testing Health Endpoint..." -ForegroundColor Cyan

try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET
    Write-Host "Health Check: $($healthResponse.status)" -ForegroundColor Green
} catch {
    Write-Host "Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}
