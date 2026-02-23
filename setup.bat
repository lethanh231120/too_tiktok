@echo off
REM TikTok Video Generator - Setup Script for Windows

echo.
echo 🎵 TikTok Video Generator Setup
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✓ Node.js version: %NODE_VERSION%
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✓ Dependencies installed successfully
echo.

REM Check if .env exists
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo ✓ .env file created
)

echo.
echo ⚙️  Configuration
echo ====================
echo.
echo 📝 Please configure your API keys in .env:
echo    - GEMINI_API_KEY: Get from https://makersuite.google.com/app/apikey
echo    - SORA_API_KEY: For future Sora API integration
echo.

echo 🚀 Ready to start!
echo.
echo Development mode (with hot reload):
echo   npm run dev
echo.
echo Production mode:
echo   npm start
echo.
echo Build for macOS:
echo   npm run build-mac
echo.
echo Build for Windows:
echo   npm run build-win
echo.
pause
