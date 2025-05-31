@echo off
echo 🐻 Building Podplay Sanctuary for Production...
echo.

cd frontend-new-2
echo Building frontend...
npm run build

echo.
echo Build complete! Check frontend-new-2/dist folder.
pause
