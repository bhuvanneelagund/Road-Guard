# ROADGUARD AI - PowerShell One-Click Launch Script
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  ROADGUARD AI - Intelligent Road Monitoring Platform" -ForegroundColor White
Write-Host "  'Detect Today. Predict Tomorrow. Protect Every Journey.'" -ForegroundColor DarkCyan
Write-Host "==================================================" -ForegroundColor Cyan

# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Starting ROADGUARD AI Backend...'; .\backend\venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload"

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Starting ROADGUARD AI Frontend...'; Set-Location frontend; npm run dev"

Write-Host "`nRoadGuard AI Services have been launched in separate sessions:" -ForegroundColor Green
Write-Host "  -> Web Dashboard:  http://localhost:5173" -ForegroundColor White
Write-Host "  -> Backend API:    http://localhost:8000/docs" -ForegroundColor White
Write-Host "  -> Health Status:  http://localhost:8000/api/health" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Cyan
