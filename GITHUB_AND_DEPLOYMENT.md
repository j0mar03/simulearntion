# GitHub Upload & Deployment Guide

This guide will help you upload your project to GitHub and deploy it to a VPS or local PC.

---

## 📋 Table of Contents

1. [Pre-Upload Checklist](#pre-upload-checklist)
2. [Uploading to GitHub](#uploading-to-github)
3. [Deployment Script](#deployment-script)
4. [Deploying to VPS](#deploying-to-vps)
5. [Deploying to Local PC](#deploying-to-local-pc)
6. [Post-Deployment](#post-deployment)
7. [Troubleshooting](#troubleshooting)

---

## 🔍 Pre-Upload Checklist

Before uploading to GitHub, ensure you've completed these steps:

### 1. Clean Up Files
```bash
# Remove unnecessary files
find . -name "*.Identifier" -type f -delete
find . -name "Zone.Identifier" -type f -delete
find . -name ".DS_Store" -type f -delete
```

### 2. Verify .gitignore
Make sure your `.gitignore` includes:
- `.env` (environment variables)
- `node_modules/`
- `*.log`
- OS-specific files
- IDE files

### 3. Check Sensitive Data
**IMPORTANT:** Never commit:
- `.env` files with real credentials
- Database passwords
- JWT secrets
- API keys

### 4. Prepare Environment Templates
Ensure `.env.example` or `.env.docker` exists with placeholder values.

---

## 📤 Uploading to GitHub

### Step 1: Initialize Git Repository (if not already done)

```bash
cd /home/jomar/JoshCapstoneV1/gokgok-multiplayer

# Check if git is initialized
if [ ! -d ".git" ]; then
    git init
    echo "Git repository initialized"
fi
```

### Step 2: Create .gitignore (if missing)

The `.gitignore` should already exist, but verify it includes:
```
node_modules/
.env
*.log
.DS_Store
*.Identifier
Zone.Identifier
dist/
build/
.vscode/
.idea/
```

### Step 3: Stage and Commit Files

```bash
# Add all files (respecting .gitignore)
git add .

# Create initial commit
git commit -m "Initial commit: GokGok Multiplayer Game

- Complete multiplayer game implementation
- Docker-based deployment
- PostgreSQL database
- Socket.io real-time communication
- User authentication and profiles
- Achievement system
- Analytics tracking"

# Or if you want to be more selective:
# git add client/ server/ shared/ prisma/ docker-compose.yml Dockerfile package.json README.md
# git commit -m "Initial commit"
```

### Step 4: Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click **"New repository"** (or the **+** icon)
3. Repository name: `gokgok-multiplayer` (or your preferred name)
4. Description: "SimuLearntion - Multiplayer Web-based Educational Game"
5. Choose **Public** or **Private**
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click **"Create repository"**

### Step 5: Connect and Push to GitHub

```bash
# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/gokgok-multiplayer.git

# Or if using SSH:
# git remote add origin git@github.com:YOUR_USERNAME/gokgok-multiplayer.git

# Verify remote
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 6: Verify Upload

1. Visit your repository on GitHub
2. Verify all files are present
3. Check that `.env` is NOT visible (should be ignored)

---

## 🚀 Deployment Script

A comprehensive deployment script is already available at `deploy.sh`. However, here's an enhanced version for VPS deployment:

### Quick Deploy Script for VPS/Local PC

Create this script as `deploy-vps.sh`:

```bash
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

# Generate secure JWT secret if needed
if grep -q "change-this-in-production" .env 2>/dev/null; then
    log_info "Generating secure JWT secret..."
    JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1)
    sed -i "s/change-this-in-production-please-make-it-64-characters-long/$JWT_SECRET/" .env
    log_success "JWT secret generated"
fi

# ============================================================================
# Step 3: Pull Latest Changes (if from Git)
# ============================================================================
if [ -d ".git" ]; then
    log_info "Step 3: Checking for updates from Git..."
    git pull origin main || log_warning "Could not pull from Git (might be first deployment)"
fi

# ============================================================================
# Step 4: Build and Start Services
# ============================================================================
log_info "Step 4: Building Docker images..."
docker compose build --no-cache

log_info "Step 5: Starting services..."
docker compose down 2>/dev/null || true
docker compose up -d

# ============================================================================
# Step 5: Wait for Services
# ============================================================================
log_info "Step 6: Waiting for services to initialize..."
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

# Run migrations
log_info "Step 7: Running database migrations..."
docker compose exec -T app npx prisma migrate deploy || log_warning "Migrations had issues (might be ok)"

# ============================================================================
# Step 6: Health Check
# ============================================================================
log_info "Step 8: Performing health check..."
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
```

Make it executable:
```bash
chmod +x deploy-vps.sh
```

---

## 🌐 Deploying to VPS

### Prerequisites for VPS

1. **VPS with:**
   - Ubuntu 20.04+ / Debian 11+ / CentOS 8+
   - At least 2GB RAM
   - 10GB+ disk space
   - Root or sudo access

2. **Required Software:**
   - Docker & Docker Compose
   - Git (to clone repository)
   - curl (for health checks)

### Step-by-Step VPS Deployment

#### Option A: Clone from GitHub

```bash
# 1. SSH into your VPS
ssh user@your-vps-ip

# 2. Install Git (if not installed)
sudo apt-get update
sudo apt-get install -y git curl

# 3. Clone repository
git clone https://github.com/YOUR_USERNAME/gokgok-multiplayer.git
cd gokgok-multiplayer

# 4. Run deployment script
chmod +x deploy-vps.sh
./deploy-vps.sh
```

#### Option B: Upload via SCP

```bash
# From your local machine
cd /home/jomar/JoshCapstoneV1
scp -r gokgok-multiplayer user@your-vps-ip:/home/user/

# Then SSH and deploy
ssh user@your-vps-ip
cd gokgok-multiplayer
chmod +x deploy-vps.sh
./deploy-vps.sh
```

#### Option C: Use Existing deploy.sh

```bash
# If you already have the project on VPS
cd gokgok-multiplayer
chmod +x deploy.sh
./deploy.sh
```

### VPS Firewall Configuration

```bash
# Allow HTTP/HTTPS (if using nginx)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow application port (if not using nginx)
sudo ufw allow 3000/tcp

# Enable firewall
sudo ufw enable
```

### VPS Domain Setup (Optional)

If you have a domain name:

1. **Point DNS to VPS IP:**
   - A record: `yourdomain.com` → VPS_IP
   - A record: `www.yourdomain.com` → VPS_IP

2. **Update .env:**
   ```env
   CLIENT_URL=http://yourdomain.com
   ```

3. **Configure Nginx (if using):**
   - Update `nginx/nginx.conf` with your domain
   - Enable SSL with Let's Encrypt (recommended)

---

## 💻 Deploying to Local PC

### Windows

1. **Install Docker Desktop:**
   - Download from: https://www.docker.com/products/docker-desktop
   - Install and restart

2. **Clone or Copy Project:**
   ```powershell
   # Using Git Bash or WSL
   git clone https://github.com/YOUR_USERNAME/gokgok-multiplayer.git
   cd gokgok-multiplayer
   ```

3. **Run Deployment:**
   ```bash
   # In Git Bash or WSL
   chmod +x deploy.sh
   ./deploy.sh
   ```

### Linux (Local)

```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/gokgok-multiplayer.git
cd gokgok-multiplayer

# 2. Install Docker (if not installed)
sudo apt-get update
sudo apt-get install -y docker.io docker-compose
sudo systemctl start docker
sudo usermod -aG docker $USER
# Log out and back in

# 3. Deploy
chmod +x deploy.sh
./deploy.sh
```

### macOS

```bash
# 1. Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop

# 2. Clone repository
git clone https://github.com/YOUR_USERNAME/gokgok-multiplayer.git
cd gokgok-multiplayer

# 3. Deploy
chmod +x deploy.sh
./deploy.sh
```

---

## ✅ Post-Deployment

### 1. Verify Deployment

```bash
# Check container status
docker compose ps

# Check logs
docker compose logs -f

# Test health endpoint
curl http://localhost:3000/api/health
```

### 2. Create Admin User (Optional)

```bash
docker compose exec app npm run create-admin
```

### 3. Access the Game

- Open browser: `http://localhost:3000`
- Or on network: `http://YOUR_IP:3000`

### 4. Monitor Resources

```bash
# Container stats
docker stats

# Disk usage
docker system df

# Logs
docker compose logs -f app
```

---

## 🔧 Troubleshooting

### Issue: Docker not found
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# Log out and back in
```

### Issue: Port 3000 already in use
```bash
# Find what's using the port
sudo lsof -i :3000
# Or change port in docker-compose.yml and .env
```

### Issue: Database connection failed
```bash
# Check PostgreSQL logs
docker compose logs postgres

# Verify DATABASE_URL in .env matches docker-compose.yml
```

### Issue: Permission denied
```bash
# Fix Docker permissions
sudo usermod -aG docker $USER
# Log out and back in
```

### Issue: Out of disk space
```bash
# Clean up Docker
docker system prune -a --volumes
```

### Issue: Can't access from network
```bash
# Check firewall
sudo ufw status
sudo ufw allow 3000/tcp

# Check if service is bound to 0.0.0.0 (not just localhost)
# In docker-compose.yml, ports should be "3000:3000"
```

---

## 📝 Quick Reference

### Common Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Restart app
docker compose restart app

# Rebuild after code changes
docker compose build --no-cache app
docker compose up -d

# Database backup
docker compose exec postgres pg_dump -U gokgok_user gokgok_db > backup.sql

# Database restore
docker compose exec -T postgres psql -U gokgok_user gokgok_db < backup.sql

# Access database shell
docker compose exec postgres psql -U gokgok_user -d gokgok_db
```

### Environment Variables

Key variables in `.env`:
- `POSTGRES_PASSWORD` - Database password
- `JWT_SECRET` - Authentication secret (must be secure!)
- `NODE_ENV` - `production` or `development`
- `PORT` - Application port (default: 3000)
- `CLIENT_URL` - Frontend URL

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Generate secure JWT_SECRET (64+ characters)
- [ ] Set NODE_ENV=production
- [ ] Configure firewall rules
- [ ] Use HTTPS (SSL/TLS)
- [ ] Enable rate limiting
- [ ] Regular database backups
- [ ] Monitor logs for suspicious activity
- [ ] Keep Docker and dependencies updated

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Socket.io Documentation](https://socket.io/docs/)

---

## 🆘 Support

If you encounter issues:

1. Check logs: `docker compose logs -f`
2. Verify environment: `docker compose ps`
3. Check health: `curl http://localhost:3000/api/health`
4. Review this guide's troubleshooting section
5. Check GitHub issues (if applicable)

---

**Happy Deploying! 🚀**
