#!/bin/bash

# GokGok Multiplayer Docker Quick Start Script for WSL + Windows Docker

set -e

echo "🐳 GokGok Multiplayer - WSL + Windows Docker Setup"
echo "===================================================="
echo ""

# Check if running in WSL
if ! grep -qEi "(Microsoft|WSL)" /proc/version &> /dev/null; then
    echo "⚠️  This script is designed for WSL (Windows Subsystem for Linux)"
    echo "   If you're on native Linux, use ./docker-start.sh instead"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ Running in WSL"
echo ""

# Check if Docker Desktop is running (via Windows)
if ! docker ps &> /dev/null; then
    echo "❌ Cannot connect to Docker!"
    echo ""
    echo "Please make sure:"
    echo "  1. Docker Desktop is running in Windows"
    echo "  2. WSL integration is enabled in Docker Desktop:"
    echo "     Settings → Resources → WSL Integration"
    echo "  3. Your distro is enabled in the integration list"
    echo ""
    echo "Then try again or restart WSL:"
    echo "  In Windows PowerShell (Admin): wsl --shutdown"
    echo "  Then reopen WSL terminal"
    exit 1
fi

echo "✅ Docker is accessible from WSL"
echo "   Docker version: $(docker --version)"
echo "   Docker Compose: $(docker compose version)"
echo ""

# Check current directory is in WSL filesystem (not /mnt/c)
CURRENT_DIR=$(pwd)
if [[ $CURRENT_DIR == /mnt/* ]]; then
    echo "⚠️  WARNING: You're in the Windows filesystem (/mnt/c/...)"
    echo "   This will be MUCH slower than WSL filesystem!"
    echo ""
    echo "   Recommended: Move project to WSL filesystem"
    echo "   Example: /home/jomar/JoshCapstone/"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ Project is in WSL filesystem (good for performance!)"
    echo "   Location: $CURRENT_DIR"
fi

echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.docker .env
    
    # Generate secure JWT secret
    if command -v openssl &> /dev/null; then
        JWT_SECRET=$(openssl rand -hex 32)
        sed -i "s/generate-a-random-64-character-string-for-production-use-openssl-rand/$JWT_SECRET/" .env
        echo "✅ .env file created with random JWT secret"
    else
        echo "✅ .env file created (please set JWT_SECRET manually)"
    fi
    
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and set a secure POSTGRES_PASSWORD!"
    echo ""
    
    read -p "Press Enter to continue or Ctrl+C to exit and edit .env first..."
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🚀 Starting Docker services..."
echo ""

# Build and start services
docker compose up -d --build

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check service status
echo ""
echo "📊 Service Status:"
docker compose ps

# Get Windows IP for localhost info
echo ""
echo "✅ Setup complete!"
echo ""
echo "🎮 Access the game from Windows browser:"
echo "   http://localhost:3000"
echo "   http://127.0.0.1:3000"
echo ""
echo "📝 Useful commands (run in WSL terminal):"
echo "   View logs:       docker compose logs -f"
echo "   Stop services:   docker compose down"
echo "   Restart app:     docker compose restart app"
echo "   Database shell:  docker compose exec postgres psql -U gokgok_user -d gokgok_db"
echo ""
echo "📚 Full documentation:"
echo "   WSL Setup:       DOCKER_WSL_SETUP.md"
echo "   Quick Start:     DOCKER_QUICKSTART.md"
echo "   Complete Guide:  DOCKER_SETUP.md"
echo ""
echo "💡 Tip: You can edit files in Windows at:"
echo "   \\\\wsl\$\\Ubuntu\\home\\jomar\\JoshCapstone\\gokgok-multiplayer"
echo ""
