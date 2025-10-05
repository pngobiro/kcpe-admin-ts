#!/bin/bash

# KCPE Admin Dashboard - Quick Start Script
# This script will set up and run your admin dashboard

set -e  # Exit on error

echo "🚀 KCPE Admin Dashboard - Quick Start"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found"
  echo "Please run this script from the kcpe-admin-ts directory"
  exit 1
fi

echo "📍 Current directory: $(pwd)"
echo ""

# Step 1: Install dependencies
echo "📦 Step 1/4: Installing dependencies..."
echo "This may take a few minutes..."
npm install
echo "✅ Dependencies installed!"
echo ""

# Step 2: Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
  echo "🔧 Step 2/4: Creating .env file..."
  cp .env.example .env
  echo "✅ .env file created!"
else
  echo "✅ Step 2/4: .env file already exists"
fi
echo ""

# Step 3: Check TypeScript compilation
echo "🔍 Step 3/4: Checking TypeScript..."
npx tsc --noEmit -p tsconfig.json 2>&1 | head -n 20 || true
echo "✅ TypeScript check complete"
echo ""

# Step 4: Start the development server
echo "🎉 Step 4/4: Starting development servers..."
echo ""
echo "╔════════════════════════════════════════╗"
echo "║  KCPE Admin Dashboard is starting...   ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "📡 Express API will run on: http://localhost:3000"
echo "🌐 React App will run on:   http://localhost:5173"
echo ""
echo "📝 Press Ctrl+C to stop the servers"
echo ""
echo "Opening in 3 seconds..."
sleep 3

# Open browser (works on most Linux systems)
if command -v xdg-open > /dev/null; then
  xdg-open http://localhost:5173 &
fi

# Start development servers
npm run dev
