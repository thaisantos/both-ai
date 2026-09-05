@echo off
REM Both AI - v1 - Setup and Start Script (Windows)
REM Automatic installation and deployment

echo.
echo 🚀 Both AI v1 - Setup and Start Script
echo =======================================
echo.

REM Check if Node.js is installed
echo 📍 Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found. Please install Node.js ^>= 14.0.0
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js found: %NODE_VERSION%
echo.

REM Check if npm is installed
echo 📍 Checking npm installation...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm not found. Please install npm ^>= 6.0.0
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo ✅ npm found: %NPM_VERSION%
echo.

REM Clean previous installations
echo 🧹 Cleaning previous installations...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
echo ✅ Clean complete
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully
echo.

REM Create .env if not exists
echo ⚙️  Configuring environment...
if not exist .env (
    copy .env.example .env
    echo ✅ .env file created
) else (
    echo ✅ .env file already exists
)
echo.

REM Start the service
echo 🚀 Starting Both AI v1...
echo =======================================
echo ✅ Service starting on http://localhost:3000
echo 📊 Health Check: http://localhost:3000/health
echo 📡 API Status: http://localhost:3000/api/v1/status
echo =======================================
echo.

call npm start
pause
