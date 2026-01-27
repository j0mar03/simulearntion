# Docker Setup for WSL + Windows

Complete guide for running GokGok Multiplayer in WSL with Docker Desktop on Windows.

---

## Prerequisites

### 1. Install Docker Desktop for Windows

Download from: https://www.docker.com/products/docker-desktop

**Important:** Install Docker Desktop on Windows, NOT in WSL.

### 2. Enable WSL2 Integration

After installing Docker Desktop:

1. Open **Docker Desktop**
2. Go to **Settings** → **General**
3. ✅ Check **"Use the WSL 2 based engine"**
4. Click **Apply & Restart**

5. Go to **Settings** → **Resources** → **WSL Integration**
6. ✅ Enable **"Enable integration with my default WSL distro"**
7. ✅ Enable integration for your specific distro (e.g., Ubuntu)
8. Click **Apply & Restart**

### 3. Verify Docker in WSL

Open your WSL terminal (Ubuntu) and verify:

```bash
# Check Docker is accessible
docker --version
docker compose version

# Test Docker works
docker run hello-world

# Should see: "Hello from Docker!"
```

If you get errors, restart Docker Desktop and WSL:

```bash
# In Windows PowerShell (as Administrator)
wsl --shutdown

# Then restart Docker Desktop and open WSL again
```

---

## Quick Start (WSL)

### From Your WSL Terminal

```bash
# 1. Navigate to project
cd /home/jomar/JoshCapstone/gokgok-multiplayer

# 2. Check Docker is running
docker ps

# 3. Setup and start
./docker-start.sh

# OR manual:
cp .env.docker .env
docker compose up -d
```

**Open in Windows browser:** http://localhost:3000

---

## Important WSL Considerations

### File System Performance

**⚠️ CRITICAL:** Keep your project in the WSL filesystem, NOT Windows filesystem!

**Good (Fast):**
```bash
/home/jomar/JoshCapstone/gokgok-multiplayer  ✅
```

**Bad (Slow):**
```bash
/mnt/c/Users/Jomar/Projects/gokgok-multiplayer  ❌
```

**Why?** Docker with WSL filesystem is 10x faster than accessing `/mnt/c/`.

Your current location is correct: `/home/jomar/JoshCapstone/` ✅

### Accessing from Windows

You can access WSL files from Windows Explorer:

```
\\wsl$\Ubuntu\home\jomar\JoshCapstone\gokgok-multiplayer
```

Or type in File Explorer address bar:
```
\\wsl$
```

---

## Configuration

### Environment Setup

```bash
cd /home/jomar/JoshCapstone/gokgok-multiplayer

# Copy environment template
cp .env.docker .env

# Edit with nano (in WSL)
nano .env

# Or edit with Windows editor
# In Windows: \\wsl$\Ubuntu\home\jomar\JoshCapstone\gokgok-multiplayer\.env
```

**Update these values:**

```env
# Strong password
POSTGRES_PASSWORD=your_secure_password_here

# Generate JWT secret
JWT_SECRET=$(openssl rand -hex 32)

# Client URL (use localhost)
CLIENT_URL=http://localhost:3000
```

To generate a secure JWT secret in WSL:

```bash
openssl rand -hex 32
```

---

## Starting the Application

### Option 1: Quick Start Script

```bash
cd /home/jomar/JoshCapstone/gokgok-multiplayer
./docker-start.sh
```

### Option 2: Manual Commands

```bash
# Make sure you're in the project directory
cd /home/jomar/JoshCapstone/gokgok-multiplayer

# Start services
docker compose up -d

# View logs
docker compose logs -f

# Check status
docker compose ps
```

### Option 3: Development Mode (Hot-reload)

```bash
docker compose -f docker-compose.dev.yml up
```

---

## Accessing the Application

### From Windows Browser

Open any browser in Windows:
- http://localhost:3000
- http://127.0.0.1:3000

### From WSL Browser (if installed)

```bash
# If you have a browser in WSL
firefox http://localhost:3000 &
```

### Test Multiplayer

Open **multiple browser tabs** in Windows to test multiplayer:
1. Tab 1: Register as "player1"
2. Tab 2: Register as "player2"
3. Both should see each other in the lobby!

---

## Common Commands (WSL)

### Docker Management

```bash
# Check Docker is running
docker ps

# Start services
docker compose up -d

# Stop services
docker compose down

# View logs (all services)
docker compose logs -f

# View logs (app only)
docker compose logs -f app

# Restart application
docker compose restart app

# Check service status
docker compose ps
```

### Database Access

```bash
# PostgreSQL shell
docker compose exec postgres psql -U gokgok_user -d gokgok_db

# Common SQL commands:
\dt          # List tables
\d users     # Describe users table
SELECT * FROM users;
\q           # Quit

# Backup database
docker compose exec postgres pg_dump -U gokgok_user gokgok_db > backup.sql

# Restore database
docker compose exec -T postgres psql -U gokgok_user -d gokgok_db < backup.sql
```

### Application Commands

```bash
# Run migrations
docker compose exec app npx prisma migrate deploy

# Open Prisma Studio (database GUI)
docker compose exec app npx prisma studio
# Then open in Windows: http://localhost:5555

# Access app container shell
docker compose exec app sh

# View app logs live
docker compose logs -f app
```

---

## Troubleshooting WSL + Docker

### "Cannot connect to Docker daemon"

**Solution:**

1. Make sure Docker Desktop is running in Windows
2. Check WSL integration is enabled in Docker Desktop settings
3. Restart WSL:

```bash
# In Windows PowerShell (Administrator)
wsl --shutdown

# Wait 10 seconds, then open WSL again
```

### "docker: command not found"

**Solution:**

Docker Desktop WSL integration might not be enabled.

1. Open Docker Desktop
2. Settings → Resources → WSL Integration
3. Enable for your distro
4. Restart Docker Desktop
5. Close and reopen WSL terminal

### Port 3000 already in use

**Check what's using the port in Windows:**

```powershell
# In Windows PowerShell
netstat -ano | findstr :3000
```

**Change port in WSL:**

```bash
# Edit .env
nano .env

# Change:
PORT=3001

# Restart
docker compose down
docker compose up -d
```

### Slow performance

**Make sure you're in WSL filesystem, NOT /mnt/c/**

```bash
# Check current path
pwd

# Should be:
/home/jomar/JoshCapstone/gokgok-multiplayer  ✅

# NOT:
/mnt/c/Users/...  ❌
```

### Docker Desktop not starting

1. Restart Docker Desktop
2. Disable and re-enable WSL integration
3. Update Docker Desktop to latest version
4. Restart Windows if needed

### "No space left on device"

Docker might be using too much disk:

```bash
# Clean up Docker resources
docker system prune -a

# In Docker Desktop: Settings → Resources → Disk image size
# Increase if needed
```

---

## WSL-Specific Tips

### 1. File Editing

**Option A: Edit in WSL with nano/vim**
```bash
nano .env
```

**Option B: Edit with Windows apps**

Access from Windows Explorer:
```
\\wsl$\Ubuntu\home\jomar\JoshCapstone\gokgok-multiplayer
```

Edit with VS Code, Notepad++, etc.

### 2. Keep Docker Desktop Running

Docker Desktop must be running in Windows for Docker commands to work in WSL.

**Check in Windows taskbar:** Look for Docker icon 🐳

### 3. WSL Restart

If Docker stops working:

```bash
# In Windows PowerShell (Administrator)
wsl --shutdown

# Wait 10 seconds
# Open WSL terminal again
```

### 4. Resource Limits

Docker Desktop settings affect WSL performance:

1. Open Docker Desktop
2. Settings → Resources
3. Adjust:
   - **CPUs:** 2-4 (for 20 players)
   - **Memory:** 4GB minimum
   - **Swap:** 1GB
   - **Disk:** 20GB+

### 5. Networking

**WSL and Windows share the same network!**

- Services on `localhost:3000` in WSL
- Accessible as `localhost:3000` in Windows
- Perfect for testing in Windows browsers

---

## Development Workflow

### Typical WSL Development Flow

```bash
# 1. Start Docker Desktop in Windows (if not running)

# 2. In WSL terminal
cd /home/jomar/JoshCapstone/gokgok-multiplayer

# 3. Start services
docker compose up -d

# 4. View logs in WSL
docker compose logs -f app

# 5. Open browser in Windows
# Visit: http://localhost:3000

# 6. Edit code in Windows
# Use VS Code, editor of choice
# Files at: \\wsl$\Ubuntu\home\jomar\JoshCapstone\...

# 7. For hot-reload (development mode)
docker compose -f docker-compose.dev.yml up

# 8. When done
docker compose down
```

---

## VPS Deployment from WSL

When ready to deploy to your VPS:

### Option 1: From WSL Terminal

```bash
# SSH from WSL to your VPS
ssh user@your-vps-ip

# On VPS:
curl -fsSL https://get.docker.com | sh
git clone <your-repo> /var/www/gokgok
cd /var/www/gokgok
cp .env.docker .env
nano .env  # Configure
docker compose up -d
```

### Option 2: Use Git

```bash
# In WSL, push to GitHub
git add .
git commit -m "Add Docker configuration"
git push

# On VPS, pull changes
ssh user@your-vps-ip
cd /var/www/gokgok
git pull
docker compose up -d
```

---

## Backup and Data Management

### Backup Database (from WSL)

```bash
# Create backup
docker compose exec postgres pg_dump -U gokgok_user gokgok_db > backup_$(date +%Y%m%d).sql

# Backups are saved in WSL filesystem
ls -lh backup_*.sql

# Copy to Windows (if needed)
# File accessible at: \\wsl$\Ubuntu\home\jomar\JoshCapstone\gokgok-multiplayer\
```

### Restore Database

```bash
docker compose exec -T postgres psql -U gokgok_user -d gokgok_db < backup_20260124.sql
```

---

## Performance Tips

### 1. Keep Project in WSL

✅ **Do:** `/home/jomar/JoshCapstone/`  
❌ **Don't:** `/mnt/c/Users/Jomar/`

### 2. Allocate Enough Resources

Docker Desktop Settings:
- CPUs: 2+ cores
- Memory: 4GB+
- Disk: 20GB+

### 3. Use Development Mode for Coding

```bash
# Hot-reload when editing code
docker compose -f docker-compose.dev.yml up
```

### 4. Clean Up Regularly

```bash
# Remove old containers and images
docker system prune -a

# Free up disk space
docker volume prune
```

---

## Quick Reference

### Essential Commands

```bash
# Start
docker compose up -d

# Stop
docker compose down

# Logs
docker compose logs -f

# Status
docker compose ps

# Restart
docker compose restart app

# Database
docker compose exec postgres psql -U gokgok_user -d gokgok_db

# Clean restart (deletes data!)
docker compose down -v
docker compose up -d
```

### Check Everything is Working

```bash
# 1. Docker is accessible
docker ps

# 2. Services are running
docker compose ps

# 3. App is responding
curl http://localhost:3000/api/health

# 4. Database is accessible
docker compose exec postgres pg_isready

# 5. Logs look good
docker compose logs app | tail -n 20
```

---

## Additional Resources

- **Docker Desktop for Windows:** https://docs.docker.com/desktop/wsl/
- **WSL Documentation:** https://learn.microsoft.com/en-us/windows/wsl/
- **Docker in WSL2:** https://docs.docker.com/desktop/windows/wsl/

---

## Summary: Your Setup

**You have:**
- ✅ WSL2 on Windows
- ✅ Docker Desktop on Windows (with WSL integration)
- ✅ Project in WSL filesystem (`/home/jomar/JoshCapstone/`)

**This means:**
- ✅ Run Docker commands in WSL terminal
- ✅ Access application in Windows browser (localhost:3000)
- ✅ Edit files with Windows editors (\\wsl$\...)
- ✅ Fast performance (WSL filesystem)
- ✅ Easy deployment to VPS (same Docker setup)

**Everything is correctly configured! 🎉**

---

**WSL + Docker Desktop setup complete! Your multiplayer game works seamlessly between Windows and WSL! 🐳🪟🐧**
