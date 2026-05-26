@echo off
title Dhanti Masala Launcher
echo ===================================================
echo   Dhanti Masala - Next.js + Express Local Launcher
echo ===================================================
echo.

:: Ensure the public/uploads folder exists
if not exist "public\uploads" (
    echo Creating public/uploads folder...
    mkdir "public\uploads"
)

:: Install backend Node.js dependencies if needed
if not exist "backend\node_modules" (
    echo Installing backend Node.js dependencies...
    cd backend
    npm install
    cd ..
)

:: Start the Node.js Express backend
echo Launching Express backend (Port 8000)...
start "Dhanti Masala - Express Backend" cmd /k "cd backend && node server.js"

:: Start the Next.js frontend
echo Launching Next.js frontend (Port 3000)...
start "Dhanti Masala - Next.js Frontend" cmd /k "npm run dev"

echo.
echo ===================================================
echo   Express Backend URL : http://localhost:8000
echo   Next.js Frontend URL : http://localhost:3000
echo ===================================================
echo.
pause
