@echo off
echo ==================================================
echo   ROADGUARD AI - Starting Full-Stack Platform
echo   "Detect Today. Predict Tomorrow. Protect Every Journey."
echo ==================================================

REM Start FastAPI Backend
start "ROADGUARD AI - Backend Server" cmd /k ".\backend\venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload"

REM Start Vite React Frontend
start "ROADGUARD AI - Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Servers launched!
echo - Web Dashboard:  http://localhost:5173
echo - Swagger API:    http://localhost:8000/docs
echo - Health Check:   http://localhost:8000/api/health
echo ==================================================
