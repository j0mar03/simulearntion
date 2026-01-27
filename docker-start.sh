#!/bin/bash

# GokGok Multiplayer Docker Quick Start Script

set -e

echo "🐳 GokGok Multiplayer - Docker Setup"
echo "===================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo "   Install from: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed!"
    echo "   Install from: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker installed: $(docker --version)"
echo "✅ Docker Compose installed: $(docker compose version)"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.docker .env
    
    # Generate secure JWT secret
    JWT_SECRET=$(openssl rand -hex 32)
    sed -i "s/generate-a-random-64-character-string-for-production-use-openssl-rand/$JWT_SECRET/" .env
    
    echo "✅ .env file created with random JWT secret"
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

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎮 Access the game at: http://localhost:3000"
echo ""
echo "📝 Useful commands:"
echo "   View logs:       docker compose logs -f"
echo "   Stop services:   docker compose down"
echo "   Restart app:     docker compose restart app"
echo "   View database:   docker compose exec postgres psql -U gokgok_user -d gokgok_db"
echo ""
echo "📚 Full documentation: See DOCKER_SETUP.md"
echo ""
