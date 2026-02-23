#!/bin/bash

# TikTok Video Generator - Setup Script

echo "🎵 TikTok Video Generator Setup"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js version: $(node -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✓ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "⚙️  Configuration"
echo "=================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "✓ .env file created"
fi

echo ""
echo "📝 Please configure your API keys in .env:"
echo "   - GEMINI_API_KEY: Get from https://makersuite.google.com/app/apikey"
echo "   - SORA_API_KEY: For future Sora API integration"
echo ""

echo "🚀 Ready to start!"
echo ""
echo "Development mode (with hot reload):"
echo "  npm run dev"
echo ""
echo "Production mode:"
echo "  npm start"
echo ""
echo "Build for macOS:"
echo "  npm run build-mac"
echo ""
echo "Build for Windows:"
echo "  npm run build-win"
echo ""
