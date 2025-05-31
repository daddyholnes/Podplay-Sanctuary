@echo off
echo 🐻 Starting Podplay Sanctuary Development Environment...
echo.

echo Starting backend server...
start /B cmd /c "cd backend && python app.py"

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo Starting frontend development server...
cd frontend-new-2
npm run dev

pause
