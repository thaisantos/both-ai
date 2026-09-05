#!/bin/bash

# Both AI - v1 - Setup and Start Script
# Automatic installation and deployment

set -e  # Exit on error

echo "🚀 Both AI v1 - Setup and Start Script"
echo "======================================="
echo ""

# Check if Node.js is installed
echo "📍 Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js >= 14.0.0"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js found: $NODE_VERSION"
echo ""

# Check if npm is installed
echo "📍 Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm >= 6.0.0"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo "✅ npm found: $NPM_VERSION"
echo ""

# Clean previous installations
echo "🧹 Cleaning previous installations..."
rm -rf node_modules package-lock.json 2>/dev/null || true
echo "✅ Clean complete"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo ""

# Create .env if not exists
echo "⚙️  Configuring environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi
echo ""

# Run tests
echo "🧪 Running tests..."
npm test --if-present || true
echo ""

# Start the service
echo "🚀 Starting Both AI v1..."
echo "======================================="
echo "✅ Service starting on http://localhost:3000"
echo "📊 Health Check: http://localhost:3000/health"
echo "📡 API Status: http://localhost:3000/api/v1/status"
echo "======================================="
echo ""

npm start
