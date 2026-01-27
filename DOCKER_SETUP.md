# Docker Deployment Guide

Complete guide for running GokGok Multiplayer with Docker.

---

## Prerequisites

- **Docker** 20.10+
- **Docker Compose** 2.0+

### Install Docker

#### Ubuntu/Debian:
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

#### macOS:
Download Docker Desktop from: https://www.docker.com/products/docker-desktop

#### Windows:
Download Docker Desktop from: https://www.docker.com/products/docker-desktop

---

## Quick Start

### 1. Configure Environment

```bash
cd /home/jomar/JoshCapstone/gokgok-multiplayer

# Copy environment template
cp .env.docker .env

# Edit configuration
nano .env
```

**Important: Change these values:**

```env
# Generate secure JWT secret (64+ characters)
JWT_SECRET=$(openssl rand -hex 32)

# Set strong database password
POSTGRES_PASSWORD=your_secure_password_here

# Set your domain (or use localhost for testing)
CLIENT_URL=http://localhost:3000
```

### 2. Build and Start

```bash
# Build and start all services
docker compose up -d

# View logs
docker compose logs -f

# Check status
docker compose ps
```

**Services will start:**
- PostgreSQL: `localhost:5432`
- Application: `localhost:3000`

### 3. Access the Game

Open browser: **http://localhost:3000**

---

## Docker Commands Reference

### Basic Operations

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# Restart services
docker compose restart

# View logs (all services)
docker compose logs -f

# View logs (specific service)
docker compose logs -f app
docker compose logs -f postgres

# Check service status
docker compose ps

# Execute command in container
docker compose exec app sh
docker compose exec postgres psql -U gokgok_user -d gokgok_db
```

### Database Operations

```bash
# Access PostgreSQL shell
docker compose exec postgres psql -U gokgok_user -d gokgok_db

# Run migrations
docker compose exec app npx prisma migrate deploy

# View database with Prisma Studio
docker compose exec app npx prisma studio
# Then open: http://localhost:5555

# Backup database
docker compose exec postgres pg_dump -U gokgok_user gokgok_db > backup.sql

# Restore database
docker compose exec -T postgres psql -U gokgok_user -d gokgok_db < backup.sql

# Reset database (WARNING: Deletes all data!)
docker compose down -v
docker compose up -d
```

### Application Operations

```bash
# View application logs
docker compose logs -f app

# Restart application only
docker compose restart app

# Rebuild application
docker compose up -d --build app

# Execute commands in app container
docker compose exec app node scripts/migrate-profiles.js
docker compose exec app npm run prisma:generate

# Access application shell
docker compose exec app sh
```

### Maintenance

```bash
# Update images
docker compose pull

# Rebuild everything
docker compose down
docker compose build --no-cache
docker compose up -d

# Clean up unused resources
docker system prune -a

# View disk usage
docker system df
```

---

## Development Mode

For development with hot-reload:

```bash
# Edit docker-compose.yml and uncomment volume mounts in 'app' service:
# volumes:
#   - ./server:/app/server
#   - ./client:/app/client
#   - ./shared:/app/shared

# Set NODE_ENV in .env
NODE_ENV=development

# Start with rebuild
docker compose up -d --build

# View live logs
docker compose logs -f app
```

---

## Production Deployment with Nginx

### 1. Enable Nginx Service

```bash
# Start with Nginx reverse proxy
docker compose --profile production up -d
```

### 2. Configure SSL (Production)

```bash
# Create SSL directory
mkdir -p nginx/ssl

# Option A: Self-signed certificate (testing only)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem

# Option B: Let's Encrypt (production)
# Use certbot on host machine, then copy certs:
sudo certbot certonly --standalone -d yourdomain.com
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem
sudo chown $USER:$USER nginx/ssl/*.pem
```

### 3. Update nginx.conf

Uncomment SSL lines in `nginx/nginx.conf`:

```nginx
listen 443 ssl http2;
ssl_certificate /etc/nginx/ssl/cert.pem;
ssl_certificate_key /etc/nginx/ssl/key.pem;
```

### 4. Restart Nginx

```bash
docker compose restart nginx
```

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `POSTGRES_DB` | Database name | `gokgok_db` |
| `POSTGRES_USER` | Database user | `gokgok_user` |
| `POSTGRES_PASSWORD` | Database password | `secure_pass_123` |
| `JWT_SECRET` | JWT signing key | 64-char random string |
| `PORT` | Application port | `3000` |
| `NODE_ENV` | Environment mode | `production` |
| `CLIENT_URL` | Frontend URL | `https://yourdomain.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_EXPIRES_IN` | Token expiration | `24h` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests | `100` |

---

## Networking

### Port Mapping

- **3000** - Application (HTTP)
- **5432** - PostgreSQL (if exposed)
- **80** - Nginx HTTP (with nginx profile)
- **443** - Nginx HTTPS (with nginx profile)

### Container Network

All services communicate via `gokgok-network` bridge network.

**Internal hostnames:**
- `postgres` - Database
- `app` - Node.js application
- `nginx` - Reverse proxy

---

## Data Persistence

### Volumes

Docker volumes persist data across container restarts:

| Volume | Purpose | Location |
|--------|---------|----------|
| `postgres_data` | Database files | `/var/lib/postgresql/data` |
| `analytics_data` | Session analytics | `/app/analytics_data` |
| `player_profiles` | User profiles | `/app/player_profiles` |

### Backup Volumes

```bash
# Backup all volumes
docker run --rm \
  -v gokgok-multiplayer_postgres_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/postgres_$(date +%Y%m%d).tar.gz -C /data .

# Restore volume
docker run --rm \
  -v gokgok-multiplayer_postgres_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar xzf /backup/postgres_20260124.tar.gz -C /data
```

---

## Monitoring

### Health Checks

```bash
# Check container health
docker compose ps

# Application health endpoint
curl http://localhost:3000/api/health

# Database health
docker compose exec postgres pg_isready -U gokgok_user
```

### Resource Usage

```bash
# View container stats
docker stats

# View specific container
docker stats gokgok-app

# Logs with timestamps
docker compose logs -f --timestamps app
```

### Performance Tuning

Edit `docker-compose.yml` to add resource limits:

```yaml
app:
  # ... other config ...
  deploy:
    resources:
      limits:
        cpus: '1.0'
        memory: 1G
      reservations:
        cpus: '0.5'
        memory: 512M
```

---

## Troubleshooting

### Container won't start

```bash
# Check logs
docker compose logs app

# Verify configuration
docker compose config

# Remove and recreate
docker compose down
docker compose up -d
```

### Database connection error

```bash
# Check postgres is running
docker compose ps postgres

# Test connection
docker compose exec postgres psql -U gokgok_user -d gokgok_db

# Check DATABASE_URL in .env
# Format: postgresql://user:password@postgres:5432/database
```

### Port already in use

```bash
# Find process using port 3000
sudo lsof -i :3000

# Change port in .env
PORT=3001

# Restart
docker compose down
docker compose up -d
```

### Migration issues

```bash
# Reset and migrate
docker compose exec app npx prisma migrate reset --force
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma generate
```

### Out of disk space

```bash
# Clean up Docker resources
docker system prune -a --volumes

# Remove old images
docker image prune -a

# Remove specific volume
docker volume rm gokgok-multiplayer_postgres_data
```

---

## Security Best Practices

### 1. Environment Security

```bash
# Never commit .env to git
echo ".env" >> .gitignore

# Use strong passwords
POSTGRES_PASSWORD=$(openssl rand -base64 32)

# Rotate JWT secret regularly
JWT_SECRET=$(openssl rand -hex 32)
```

### 2. Network Security

```bash
# Don't expose PostgreSQL port in production
# Comment out in docker-compose.yml:
# ports:
#   - "5432:5432"

# Use internal network only
# PostgreSQL accessible only from app container
```

### 3. Container Security

```bash
# Run as non-root (already configured in Dockerfile)
# Regular updates
docker compose pull
docker compose up -d

# Scan for vulnerabilities
docker scan gokgok-app
```

---

## Migration from Non-Docker Setup

If you have existing data:

```bash
# 1. Backup existing PostgreSQL
pg_dump -U gokgok_user gokgok_db > backup_before_docker.sql

# 2. Start Docker services
docker compose up -d

# 3. Import data
docker compose exec -T postgres psql -U gokgok_user -d gokgok_db < backup_before_docker.sql

# 4. Run migrations
docker compose exec app npx prisma migrate deploy

# 5. Verify data
docker compose exec app node scripts/migrate-profiles.js
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/gokgok
            git pull
            docker compose down
            docker compose up -d --build
```

---

## Performance Benchmarks

For 20 concurrent users:

**Recommended specs:**
- CPU: 2 vCPU
- RAM: 2GB (1GB app + 512MB postgres + 512MB system)
- Disk: 20GB SSD

**Expected resource usage:**
- App container: ~200-400MB RAM
- PostgreSQL: ~100-200MB RAM
- Response time: <100ms
- WebSocket latency: <50ms

---

## Quick Reference

```bash
# Start everything
docker compose up -d

# Stop everything
docker compose down

# View logs
docker compose logs -f

# Restart app
docker compose restart app

# Database backup
docker compose exec postgres pg_dump -U gokgok_user gokgok_db > backup.sql

# Run migrations
docker compose exec app npx prisma migrate deploy

# Access database
docker compose exec postgres psql -U gokgok_user -d gokgok_db

# Clean everything (WARNING: Deletes data!)
docker compose down -v && docker system prune -a
```

---

**Docker deployment complete! Your multiplayer game is containerized and ready! 🐳🚀**
