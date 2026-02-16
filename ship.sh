#!/bin/bash

# Flux Finance Deployment Script
# Usage: ./ship.sh "your commit message"

if [ -z "$1" ]
then
    echo "❌ Error: Please provide a commit message."
    echo "Usage: ./ship.sh \"your commit message\""
    exit 1
fi

echo "🚀 Starting deployment flow..."

# 0. Build & Test Check (Critical to prevent broken deployments)
echo "🔍 Running type check..."
npm run typecheck
if [ $? -ne 0 ]; then
    echo "❌ Error: Type check failed. Fix errors before shipping."
    exit 1
fi
echo "✅ Type check passed!"

echo "🧪 Running unit tests..."
npm test
if [ $? -ne 0 ]; then
    echo "❌ Error: Unit tests failed. Fix logic before shipping."
    exit 1
fi
echo "✅ Unit tests passed!"

echo "🎭 Running E2E tests..."
npm run test:e2e
if [ $? -ne 0 ]; then
    echo "❌ Error: E2E tests failed. Fix UI flows before shipping."
    exit 1
fi
echo "✅ E2E tests passed!"

# 1. Add changes
echo "📦 Staging changes..."
git add .

# 2. Commit
echo "💾 Committing: $1"
git commit -m "$1"

# 3. Push to GitHub (Vercel will auto-deploy)
echo "☁️ Pushing to GitHub..."
git push

echo "✅ Success! Your changes are being deployed to Vercel."
echo "🔗 View progress: https://vercel.com/kuldeep-daves-projects/flux-finance/deployments"
echo "🔗 Live site: https://flux-finance-zeta.vercel.app"
