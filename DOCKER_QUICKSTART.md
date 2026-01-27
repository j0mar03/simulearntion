# Docker Quick Start (1 Minute Setup!)

Get GokGok Multiplayer running with Docker in under 1 minute!

---

## Prerequisites

### WSL + Windows Docker Desktop Users

**You're here!** → See `DOCKER_WSL_SETUP.md` for complete WSL guide.

**Quick version:**
1. Install Docker Desktop for Windows
2. Enable WSL integration in Docker Desktop settings
3. Use `./docker-start-wsl.sh` script below

---

### Native Linux Users

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

### macOS Users

Download Docker Desktop from: https://www.docker.com/products/docker-desktop

---

## Quick Start (3 Commands!)

### For WSL + Windows Docker:

```bash
cd /home/jomar/JoshCapstone/gokgok-multiplayer

# Option 1: Use WSL quick start script
./docker-start-wsl.sh

# Option 2: Manual commands
cp .env.docker .env
docker compose up -d
```

**That's it! 🎉**

Open in **Windows browser**: **http://localhost:3000**

---

### For Native Linux/macOS:

```bash
cd /home/jomar/JoshCapstone/gokgok-multiplayer

# Option 1: Use quick start script
./docker-start.sh

# Option 2: Manual commands
cp .env.docker .env
docker compose up -d
```

**That's it! 🎉**

Open: **http://localhost:3000**

---

## What Just Happened?

Docker automatically:
1. ✅ Created PostgreSQL database
2. ✅ Set up the database schema
3. ✅ Started the Node.js application
4. ✅ Connected everything together

---

## Common Commands

```bash
# View what's running
docker compose ps

# View live logs
docker compose logs -f

# Stop everything
docker compose down

# Restart application
docker compose restart app

# Clean restart (deletes data!)
docker compose down -v
docker compose up -d
```

---

## Access Database

```bash
# PostgreSQL shell
docker compose exec postgres psql -U gokgok_user -d gokgok_db

# View database in browser
docker compose exec app npx prisma studio
# Then open: http://localhost:5555
```

---

## Development Mode (Hot-Reload)

```bash
# Use development config
docker compose -f docker-compose.dev.yml up

# Code changes auto-reload!
```

---

## Backup Database

```bash
# Create backup
docker compose exec postgres pg_dump -U gokgok_user gokgok_db > backup.sql

# Restore backup
docker compose exec -T postgres psql -U gokgok_user -d gokgok_db < backup.sql
```

---

## Production Deployment

### On Your VPS:

```bash
# 1. Install Docker
curl -fsSL https://get.docker.com | sh

# 2. Clone repository
git clone <your-repo> /var/www/gokgok
cd /var/www/gokgok

# 3. Configure
cp .env.docker .env
nano .env  # Edit POSTGRES_PASSWORD and JWT_SECRET

# 4. Start
docker compose up -d

# 5. (Optional) Enable Nginx for SSL
docker compose --profile production up -d
```

---

## Troubleshooting

**Port 3000 already in use?**
```bash
# Change port in .env
PORT=3001

# Restart
docker compose down && docker compose up -d
```

**Database connection error?**
```bash
# Check postgres is running
docker compose ps postgres

# View postgres logs
docker compose logs postgres
```

**Want to start fresh?**
```bash
# Delete everything and start over
docker compose down -v
docker compose up -d
```

---

## Resource Usage

For 20 concurrent players:
- **CPU:** 2 cores
- **RAM:** 2GB total
  - App: ~400MB
  - PostgreSQL: ~200MB
  - System: ~1.4GB

---

## Next Steps

- **Full Documentation:** See `DOCKER_SETUP.md`
- **Test Multiplayer:** Open in 2+ browsers
- **Monitor:** `docker compose logs -f app`
- **Deploy to VPS:** Follow production steps above

---

## Why Docker?

✅ **Easy Setup** - No manual PostgreSQL installation  
✅ **Consistent** - Works the same everywhere  
✅ **Isolated** - Won't conflict with other apps  
✅ **Portable** - Move between dev/production easily  
✅ **Scalable** - Easy to add more services  

---

**Docker setup complete! Your multiplayer game is containerized! 🐳🎮**
