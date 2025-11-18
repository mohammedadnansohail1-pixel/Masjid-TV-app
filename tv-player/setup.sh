#!/bin/bash

# Masjid TV Player Setup Script
# This script helps you set up the TV Player application

set -e

echo "======================================"
echo "  Masjid TV Player Setup"
echo "======================================"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed."
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "Error: Node.js version 18+ is required."
    echo "Current version: $(node -v)"
    exit 1
fi

echo "✓ Node.js $(node -v) detected"

# Check for npm
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed."
    exit 1
fi

echo "✓ npm $(npm -v) detected"
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "Error: Failed to install dependencies"
    exit 1
fi

echo "✓ Dependencies installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
    echo "Please edit .env file to configure your backend URL:"
    echo "  - VITE_API_URL: Your backend API URL"
    echo "  - VITE_WS_URL: Your WebSocket server URL"
    echo ""
else
    echo "✓ .env file already exists"
    echo ""
fi

# Display next steps
echo "======================================"
echo "  Setup Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Start the development server:"
echo "   npm run dev"
echo ""
echo "2. Open your browser to:"
echo "   http://localhost:5173"
echo ""
echo "3. For production build:"
echo "   npm run build"
echo "   npm run preview"
echo ""
echo "4. For Docker deployment:"
echo "   docker-compose up -d"
echo ""
echo "For more information, see README.md"
echo ""
