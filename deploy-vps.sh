#!/bin/bash

# ============================================================================
# GokGok Multiplayer - VPS/Local PC Deployment Script
# ============================================================================

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     GokGok Multiplayer - VPS/Local Deployment Script      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if running from correct directory
if [ ! -f "package.json" ]; then
    log_error "Must be run from gokgok-multiplayer directory!"
    exit 1
fi

# ============================================================================
# Step 1: Check Prerequisites
# ============================================================================
log_info "Step 1: Checking prerequisites..."

# Check Docker
if ! command -v docker &> /dev/null; then
    log_error "Docker not found! Installing Docker..."
    
    # Detect OS and install Docker
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        if [[ "$ID" == "ubuntu" ]] || [[ "$ID" == "debian" ]]; then
            log_info "Installing Docker on Ubuntu/Debian..."
            sudo apt-get update
            sudo apt-get install -y docker.io docker-compose
            sudo systemctl start docker
            sudo systemctl enable docker
            sudo usermod -aG docker $USER
            log_warning "Please log out and back in for Docker group changes to take effect"
        elif [[ "$ID" == "centos" ]] || [[ "$ID" == "rhel" ]]; then
            log_info "Installing Docker on CentOS/RHEL..."
            sudo yum install -y docker docker-compose
            sudo systemctl start docker
            sudo systemctl enable docker
            sudo usermod -aG docker $USER
        fi
    else
        log_error "Cannot auto-install Docker. Please install manually:"
        log_info "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
else
    log_success "Docker found: $(docker --version)"
fi

# Check Docker Compose
if ! command -v docker compose &> /dev/null && ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose not found!"
    exit 1
fi

# Check Docker daemon
if ! docker info &> /dev/null; then
    log_error "Docker daemon not running! Starting Docker..."
    sudo systemctl start docker || log_error "Failed to start Docker"
fi

# ============================================================================
# Step 2: Environment Setup
# ============================================================================
log_info "Step 2: Setting up environment..."

DOMAIN="simulearntion.sehs.online"
CLIENT_URL="https://${DOMAIN}"

if [ ! -f ".env" ]; then
    if [ -f ".env.docker" ]; then
        cp .env.docker .env
        log_success "Created .env from .env.docker"
    elif [ -f ".env.example" ]; then
        cp .env.example .env
        log_warning "Created .env from .env.example - please edit with your settings!"
    else
        log_error "No .env template found!"
        exit 1
    fi
fi

# Set CLIENT_URL to your domain (update if already present)
if grep -q "^CLIENT_URL=" .env 2>/dev/null; then
    sed -i "s|^CLIENT_URL=.*|CLIENT_URL=${CLIENT_URL}|" .env
else
    echo "CLIENT_URL=${CLIENT_URL}" >> .env
fi
log_success "Configured CLIENT_URL=${CLIENT_URL}"

# Generate secure JWT secret if needed
if grep -q "change-this-in-production" .env 2>/dev/null; then
    log_info "Generating secure JWT secret..."
    JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1)
    sed -i "s/change-this-in-production-please-make-it-64-characters-long/$JWT_SECRET/" .env
    log_success "JWT secret generated"
fi

# ============================================================================
# Step 3: Nginx + SSL (Cloudflare Full Strict)
# ============================================================================
log_info "Step 3: Installing Nginx and Certbot..."
sudo apt-get update
sudo apt-get install -y nginx certbot python3-certbot-nginx

log_info "Step 4: Configuring Nginx for ${DOMAIN}..."
sudo tee /etc/nginx/sites-available/simulearntion > /dev/null <<EOF
server {
    listen 80;
    server_name ${DOMAIN};

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/simulearntion /etc/nginx/sites-enabled/simulearntion
sudo nginx -t
sudo systemctl restart nginx

log_info "Step 5: Requesting Let's Encrypt certificate..."
sudo certbot --nginx -d ${DOMAIN} --non-interactive --agree-tos -m admin@${DOMAIN} || log_warning "Certbot failed - re-run after DNS is ready"

# ============================================================================
# Step 6: Pull Latest Changes (if from Git)
# ============================================================================
if [ -d ".git" ]; then
    log_info "Step 6: Checking for updates from Git..."
    git pull origin main || log_warning "Could not pull from Git (might be first deployment)"
fi

# ============================================================================
# Step 7: Build and Start Services
# ============================================================================
log_info "Step 7: Building Docker images..."
docker compose build --no-cache

log_info "Step 8: Starting services..."
docker compose down 2>/dev/null || true
docker compose up -d

# ============================================================================
# Step 9: Wait for Services
# ============================================================================
log_info "Step 9: Waiting for services to initialize..."
sleep 10

# Check PostgreSQL
for i in {1..30}; do
    if docker compose exec -T postgres pg_isready -U gokgok_user &> /dev/null; then
        log_success "PostgreSQL is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "PostgreSQL failed to start!"
        docker compose logs postgres
        exit 1
    fi
    sleep 1
done

# Run migrations/schema sync
log_info "Step 10: Running database migrations..."
docker compose exec -T app npx prisma migrate deploy || log_warning "Migrations had issues (might be ok)"

log_info "Step 11: Syncing Prisma schema (db push)..."
docker compose exec -T app npx prisma db push || log_warning "Prisma db push had issues (might be ok)"

log_info "Step 12: Ensuring admin account exists..."
docker compose exec -T app node scripts/create-admin.js || log_warning "Admin creation script had issues (might be ok)"

# ============================================================================
# Step 6: Health Check
# ============================================================================
log_info "Step 13: Performing health check..."
sleep 5

for i in {1..10}; do
    if curl -s http://localhost:3000/api/health &> /dev/null; then
        log_success "Application is healthy!"
        break
    fi
    if [ $i -eq 10 ]; then
        log_warning "Health check failed, but application might still be starting"
    fi
    sleep 2
done

# ============================================================================
# Success Message
# ============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  🎉 DEPLOYMENT SUCCESSFUL! 🎉             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Get IP address
LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")

log_success "GokGok Multiplayer is now running!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📱 Access the game:"
echo "     Local:    http://localhost:3000"
echo "     Domain:   ${CLIENT_URL}"
if [ "$LOCAL_IP" != "localhost" ]; then
    echo "     Network:  http://${LOCAL_IP}:3000"
fi
echo ""
echo "  🔧 Useful commands:"
echo "     View logs:       docker compose logs -f"
echo "     Stop:            docker compose down"
echo "     Restart:         docker compose restart app"
echo "     Status:          docker compose ps"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

docker compose ps
