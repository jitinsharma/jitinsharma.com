#!/bin/bash

# Deploy script for jitinsharma.com
# This script builds the site and deploys to jitinsharma.github.io

set -e  # Exit on any error

echo "🚀 Starting deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if git is clean (optional - uncomment if you want to enforce clean working directory)
# if [ -n "$(git status --porcelain)" ]; then
#     echo "❌ Error: Working directory is not clean. Please commit or stash your changes."
#     exit 1
# fi

# Build the site
echo "📦 Building site..."
bun run build

if [ ! -d "public" ]; then
    echo "❌ Error: Build failed - public directory not found."
    exit 1
fi

# Check if deployment repo exists
DEPLOY_REPO="../jitinsharma.github.io"
if [ ! -d "$DEPLOY_REPO" ]; then
    echo "📥 Cloning deployment repository..."
    cd ..
    git clone https://github.com/jitinsharma/jitinsharma.github.io.git
    cd jitinsharma.com
fi

# Clear deployment repo except CNAME
echo "🧹 Clearing deployment repository (preserving CNAME)..."
cd $DEPLOY_REPO
# Backup CNAME if it exists
if [ -f "CNAME" ]; then
    cp CNAME /tmp/CNAME.backup
fi
# Remove all files except .git directory
find . -not -path './.git*' -delete 2>/dev/null || true
# Restore CNAME if it existed
if [ -f "/tmp/CNAME.backup" ]; then
    mv /tmp/CNAME.backup CNAME
fi
cd - > /dev/null

# Copy files to deployment repo
echo "📁 Copying files to deployment repository..."
cp -r public/* $DEPLOY_REPO/

# Deploy
cd $DEPLOY_REPO
echo "📤 Deploying to GitHub Pages..."

# Add all files
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "✅ No changes to deploy."
    exit 0
fi

# Commit and push
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
git push origin master

echo "✅ Deployment complete!"
echo "🌐 Your site will be available at: https://jitinsharma.github.io"