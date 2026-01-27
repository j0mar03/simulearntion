#!/bin/bash

# ============================================================================
# SimuLearntion - Automated Web Deployment Script
# ============================================================================
# This script automates the complete deployment process for the web-based
# multiplayer version with all assets from "Compilations of gokgok simulator 2000"
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Banner
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║          SimuLearntion - Web Deployment           ║"
echo "║                  Multiplayer Edition                       ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if running in correct directory
if [ ! -f "package.json" ]; then
    log_error "Must be run from gokgok-multiplayer directory!"
    exit 1
fi

log_info "Starting deployment process..."

# ============================================================================
# Step 1: Check Prerequisites
# ============================================================================
log_info "Step 1: Checking prerequisites..."

# Check for Docker
if command -v docker &> /dev/null; then
    log_success "Docker found: $(docker --version)"
else
    log_error "Docker not found! Please install Docker first."
    log_info "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check for Docker Compose
if command -v docker compose &> /dev/null; then
    log_success "Docker Compose found"
elif command -v docker-compose &> /dev/null; then
    log_success "Docker Compose found (legacy version)"
else
    log_error "Docker Compose not found!"
    exit 1
fi

# Check Docker daemon
if ! docker info &> /dev/null; then
    log_error "Docker daemon not running! Please start Docker."
    exit 1
fi

# ============================================================================
# Step 2: Verify Assets
# ============================================================================
log_info "Step 2: Verifying game assets..."

ASSETS_OK=true

# Check main asset directories
if [ ! -d "client/assets/images" ]; then
    log_warning "Images directory missing"
    ASSETS_OK=false
fi

if [ ! -d "client/assets/animations" ]; then
    log_warning "Animations directory missing"
    ASSETS_OK=false
fi

if [ ! -d "client/assets/avatar" ]; then
    log_warning "Avatar directory missing"
    ASSETS_OK=false
fi

if [ ! -d "client/assets/ui" ]; then
    log_warning "UI directory missing"
    ASSETS_OK=false
fi

# Check for key asset files
REQUIRED_IMAGES=(
    "client/assets/images/Lobby.png"
    "client/assets/images/Library.png"
    "client/assets/images/Game 2 UI Layout.png"
    "client/assets/images/Avatar Customization.png"
    "client/assets/images/achievementUI.png"
)

for img in "${REQUIRED_IMAGES[@]}"; do
    if [ ! -f "$img" ]; then
        log_warning "Missing: $img"
        ASSETS_OK=false
    fi
done

if [ "$ASSETS_OK" = false ]; then
    log_error "Some assets are missing!"
    log_info "Assets should be copied from 'Compilations of gokgok simulator 2000'"
    echo ""
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Deployment cancelled."
        exit 1
    fi
else
    log_success "All required assets present"
fi

# Count assets
IMG_COUNT=$(find client/assets/images -name "*.png" 2>/dev/null | wc -l)
GIF_COUNT=$(find client/assets/animations -name "*.gif" 2>/dev/null | wc -l)
log_info "Found $IMG_COUNT images and $GIF_COUNT animations"

# ============================================================================
# Step 3: Environment Configuration
# ============================================================================
log_info "Step 3: Configuring environment..."

if [ ! -f ".env" ]; then
    if [ -f ".env.docker" ]; then
        log_info "Creating .env from .env.docker template"
        cp .env.docker .env
        log_success ".env file created"
    elif [ -f ".env.example" ]; then
        log_info "Creating .env from .env.example template"
        cp .env.example .env
        log_warning "Please edit .env file with your settings!"
        log_info "Opening .env for editing..."
        sleep 2
        ${EDITOR:-nano} .env
    else
        log_error "No .env template found!"
        exit 1
    fi
else
    log_success ".env file already exists"
fi

# Generate random JWT secret if not set
if grep -q "change-this-in-production" .env 2>/dev/null; then
    log_info "Generating secure JWT secret..."
    JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1)
    sed -i "s/change-this-in-production-please-make-it-64-characters-long/$JWT_SECRET/" .env
    log_success "JWT secret generated"
fi

# ============================================================================
# Step 4: Clean Up Previous Deployment
# ============================================================================
log_info "Step 4: Cleaning up previous deployment..."

# Stop existing containers
if docker compose ps | grep -q "Up"; then
    log_info "Stopping existing containers..."
    docker compose down
    log_success "Containers stopped"
else
    log_info "No running containers found"
fi

# Optional: Remove old images
echo ""
read -p "Remove old Docker images? (clean rebuild) (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "Removing old images..."
    docker compose down --rmi all --volumes || true
    log_success "Old images removed"
fi

# ============================================================================
# Step 5: Build Docker Images
# ============================================================================
log_info "Step 5: Building Docker images..."

log_info "This may take several minutes on first build..."
if docker compose build --no-cache; then
    log_success "Docker images built successfully"
else
    log_error "Docker build failed!"
    exit 1
fi

# ============================================================================
# Step 6: Start Services
# ============================================================================
log_info "Step 6: Starting services..."

if docker compose up -d; then
    log_success "Services started"
else
    log_error "Failed to start services!"
    exit 1
fi

# Wait for services to be ready
log_info "Waiting for services to initialize..."
sleep 5

# Check if containers are running
POSTGRES_STATUS=$(docker compose ps postgres | grep -c "Up" || echo "0")
APP_STATUS=$(docker compose ps app | grep -c "Up" || echo "0")

if [ "$POSTGRES_STATUS" -eq "0" ]; then
    log_error "PostgreSQL container failed to start!"
    docker compose logs postgres
    exit 1
else
    log_success "PostgreSQL is running"
fi

if [ "$APP_STATUS" -eq "0" ]; then
    log_error "Application container failed to start!"
    docker compose logs app
    exit 1
else
    log_success "Application is running"
fi

# ============================================================================
# Step 7: Database Initialization
# ============================================================================
log_info "Step 7: Initializing database..."

# Wait for PostgreSQL to be ready
log_info "Waiting for PostgreSQL to accept connections..."
for i in {1..30}; do
    if docker compose exec -T postgres pg_isready -U gokgok_user &> /dev/null; then
        log_success "PostgreSQL is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "PostgreSQL failed to become ready!"
        exit 1
    fi
    sleep 1
    echo -n "."
done
echo ""

# Run database migrations
log_info "Running database migrations..."
if docker compose exec -T app npx prisma migrate deploy; then
    log_success "Database migrations completed"
else
    log_warning "Database migrations had issues (might be ok if already applied)"
fi

# ============================================================================
# Step 8: Health Check
# ============================================================================
log_info "Step 8: Performing health check..."

sleep 3

# Check application health endpoint
for i in {1..10}; do
    if curl -s http://localhost:3000/api/health &> /dev/null; then
        log_success "Application health check passed"
        break
    fi
    if [ $i -eq 10 ]; then
        log_warning "Health check failed, but application might still be starting"
    fi
    sleep 1
done

# ============================================================================
# Step 9: Display Status
# ============================================================================
log_info "Step 9: Deployment complete!"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║                  🎉 DEPLOYMENT SUCCESSFUL! 🎉             ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

log_success "SimuLearntion is now running!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📱 Access the game:"
echo "     Local:    http://localhost:3000"
echo "     Network:  http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "  🔧 Useful commands:"
echo "     View logs:       docker compose logs -f"
echo "     Stop services:   docker compose down"
echo "     Restart app:     docker compose restart app"
echo "     Database backup: docker compose exec postgres pg_dump -U gokgok_user gokgok_db > backup.sql"
echo ""
echo "  📊 Monitor:"
echo "     Container stats: docker stats"
echo "     Service status:  docker compose ps"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Show running containers
log_info "Running containers:"
docker compose ps

echo ""
log_info "To view live logs, run: docker compose logs -f"
echo ""

# ============================================================================
# Optional: Open browser
# ============================================================================
read -p "Open game in browser? (Y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    log_info "Opening browser..."
    # Detect OS and open browser
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open http://localhost:3000 2>/dev/null || log_info "Please open http://localhost:3000 manually"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        open http://localhost:3000
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        start http://localhost:3000
    else
        log_info "Please open http://localhost:3000 in your browser"
    fi
fi

log_success "Deployment script completed successfully!"
exit 0
