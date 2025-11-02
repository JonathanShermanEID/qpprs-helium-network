#!/bin/bash
# Vercel Deployment Script
# Author: Jonathan Sherman - Monaco Edition

set -e

echo "🚀 Deploying to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Build the project
echo "Building project..."
pnpm run build

# Deploy to Vercel
echo "Deploying..."
vercel --prod

echo "✅ Deployment complete!"
