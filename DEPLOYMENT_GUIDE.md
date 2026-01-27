# SimuLearntion - Complete Web Deployment Guide

## 🎯 Overview

This guide covers the **complete deployment** of SimuLearntion as a web-based multiplayer application using Docker. All assets from "Compilations of gokgok simulator 2000" are integrated and ready for deployment.

---

## ✅ What's Included

### All Game Elements from Original Python Version:
- ✅ **All Backgrounds**: Lobby, Library, Quiz, Customization, Achievements
- ✅ **All Avatars**: Base character + all body/head customization options
- ✅ **All Animations**: 17 GIF animations for character movement
- ✅ **All UI Elements**: Buttons, panels, icons from original game
- ✅ **All Physics Content**: 26 quiz questions, study topics, formulas
- ✅ **Achievement System**: Badges, unlockables, leaderboards
- ✅ **Analytics Tracking**: Comprehensive learning metrics

### New Multiplayer Features:
- 🌐 **Real-time Multiplayer**: See other players in lobby and library
- 💬 **Live Chat System**: Communicate with classmates
- 🔒 **User Authentication**: Secure JWT-based login
- 📊 **Database Persistence**: PostgreSQL for profiles and analytics
- 🐳 **Docker Support**: One-command deployment
- 🔄 **Live Avatar Updates**: See other players' customizations instantly

---

## 🚀 Quick Start (Docker - Recommended)

### Prerequisites
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- 4GB RAM minimum
- 2GB free disk space

### For WSL Users (Windows Subsystem for Linux)

```bash
# Navigate to project
cd /home/jomar/JoshCapstoneV1/gokgok-multiplayer

# Quick start script
chmod +x docker-start-wsl.sh
./docker-start-wsl.sh

# OR manually:
cp .env.docker .env
docker compose up -d
```

**Open in browser:** `http://localhost:3000`

### For Native Linux/Mac Users

```bash
# Navigate to project
cd /home/jomar/JoshCapstoneV1/gokgok-multiplayer

# Quick start script
chmod +x docker-start.sh
./docker-start.sh

# OR manually:
cp .env.docker .env
docker compose up -d
```

**Open in browser:** `http://localhost:3000`

---

## 📦 What Happens During Deployment

### Step 1: Asset Loading (Automatic)
All assets from "Compilations of gokgok simulator 2000" are served:
- **Images**: `/client/assets/images/` (backgrounds, UI)
- **Animations**: `/client/assets/animations/` (character GIFs)
- **Avatars**: `/client/assets/avatar/` (customization sprites)
- **UI**: `/client/assets/ui/` (buttons, icons)

### Step 2: Database Setup (Automatic)
PostgreSQL container starts and creates:
- User accounts table
- Session analytics table
- Quiz attempts tracking
- Achievement progress
- Leaderboard data

### Step 3: Application Start (Automatic)
Node.js server starts with:
- Express.js API (port 3000)
- Socket.IO multiplayer (WebSocket)
- Static file serving (game assets)
- JWT authentication

### Step 4: Game Ready!
- Login/Register on first visit
- Join multiplayer lobby
- See other online players
- Customize avatar (real-time updates)
- Study physics topics
- Take quizzes
- Earn achievements
- Climb leaderboards

---

## 🔧 Manual Deployment (Without Docker)

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- PostgreSQL 14+ ([Download](https://www.postgresql.org/))

### Step 1: Database Setup

```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres psql
CREATE DATABASE gokgok_db;
CREATE USER gokgok_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE gokgok_db TO gokgok_user;
\q
```

### Step 2: Application Setup

```bash
# Navigate to project
cd /home/jomar/JoshCapstoneV1/gokgok-multiplayer

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env  # Edit with your database credentials

# Run database migrations
npx prisma migrate deploy
npx prisma generate

# Start application
npm start
```

**Open in browser:** `http://localhost:3000`

---

## 🌐 Production Deployment (VPS/Cloud)

### Option 1: Docker on VPS (Easiest)

```bash
# On your VPS (Ubuntu 20.04+)
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Clone repository
git clone <your-repo-url> /var/www/gokgok
cd /var/www/gokgok/gokgok-multiplayer

# Configure environment
cp .env.docker .env
nano .env  # Change passwords and JWT_SECRET

# Start application
docker compose up -d

# View logs
docker compose logs -f
```

### Option 2: PM2 + Nginx (Traditional)

```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql

# Install PM2
sudo npm install -g pm2

# Setup database (see Step 1 above)

# Clone and setup
git clone <your-repo> /var/www/gokgok
cd /var/www/gokgok/gokgok-multiplayer
npm install --production
npx prisma migrate deploy

# Start with PM2
pm2 start server/server.js --name gokgok-server
pm2 startup
pm2 save
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Serve static files (game assets)
    location / {
        root /var/www/gokgok/gokgok-multiplayer/client;
        try_files $uri $uri/ /index.html;
    }
    
    # API endpoints
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Socket.IO WebSocket
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # Game assets
    location /assets {
        root /var/www/gokgok/gokgok-multiplayer/client;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal (automatic)
sudo certbot renew --dry-run
```

---

## 🔍 Verification & Testing

### 1. Check Docker Containers

```bash
# View running containers
docker compose ps

# Should show:
# - gokgok-postgres (healthy)
# - gokgok-app (running)

# Check logs
docker compose logs app
docker compose logs postgres
```

### 2. Test Database Connection

```bash
# Connect to database
docker compose exec postgres psql -U gokgok_user -d gokgok_db

# List tables
\dt

# Exit
\q
```

### 3. Test Application Endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# Should return:
# {"status":"OK","timestamp":"...","uptime":...}
```

### 4. Test Game in Browser

1. Open `http://localhost:3000`
2. Register new account
3. Login successfully
4. See lobby with your character
5. Walk around using arrow keys
6. Click Avatar button - see real customization UI
7. Change body/head - see preview update
8. Return to lobby - character should show changes
9. Walk to library door (top-right)
10. Enter library - see library background
11. Walk to quiz door (bottom-right)
12. Take quiz - see quiz background and questions
13. Check achievements - see real achievement UI

---

## 📊 Monitoring & Maintenance

### View Logs

```bash
# Application logs
docker compose logs -f app

# Database logs
docker compose logs -f postgres

# All logs
docker compose logs -f
```

### Database Backup

```bash
# Create backup
docker compose exec postgres pg_dump -U gokgok_user gokgok_db > backup.sql

# Restore backup
docker compose exec -T postgres psql -U gokgok_user gokgok_db < backup.sql
```

### Update Application

```bash
# Pull latest changes
git pull

# Rebuild containers
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Performance Monitoring

```bash
# Check resource usage
docker stats

# Check application with PM2 (if using manual deployment)
pm2 monit
pm2 logs gokgok-server
```

---

## 🐛 Troubleshooting

### Issue: Port 3000 Already in Use

```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>

# Or change port in .env
PORT=8080
```

### Issue: Assets Not Loading

```bash
# Check if assets directory exists
ls -la client/assets/

# Should show:
# - images/
# - animations/
# - avatar/
# - ui/

# Check Docker volume mounts
docker compose exec app ls -la /app/client/assets/
```

### Issue: Database Connection Failed

```bash
# Check PostgreSQL container
docker compose ps postgres

# Check database logs
docker compose logs postgres

# Verify DATABASE_URL in .env
echo $DATABASE_URL
```

### Issue: Players Not Appearing in Multiplayer

```bash
# Check Socket.IO connection in browser console
# Should see: "Connected to multiplayer server"

# Check server logs for WebSocket connections
docker compose logs app | grep socket
```

---

## 📈 Performance Optimization

### Production Settings

```env
# .env for production
NODE_ENV=production
PORT=3000

# Database connection pool
DATABASE_URL="postgresql://user:pass@postgres:5432/gokgok_db?connection_limit=10"

# JWT settings (longer expiry for production)
JWT_EXPIRES_IN=7d

# Enable compression
ENABLE_COMPRESSION=true
```

### Asset Optimization

```bash
# Optimize images (optional)
npm install -g imagemin-cli

# Compress PNG images
imagemin client/assets/**/*.png --out-dir=client/assets-optimized/

# Compress GIF animations (careful - may affect animation quality)
# Use tools like gifsicle for size reduction
```

### Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_quiz_attempts_session ON quiz_attempts(session_id);
```

---

## 🎓 Student/Teacher Access

### For Students

1. Visit: `http://your-server-ip:3000` or `https://yourdomain.com`
2. Click "Register" to create account
3. Login and start learning!

### For Teachers (Analytics Access)

```bash
# Export all session data to CSV
docker compose exec postgres psql -U gokgok_user gokgok_db \
  -c "COPY (SELECT * FROM sessions) TO STDOUT CSV HEADER" > sessions.csv

# Export quiz performance
docker compose exec postgres psql -U gokgok_user gokgok_db \
  -c "COPY (SELECT * FROM quiz_attempts) TO STDOUT CSV HEADER" > quiz_data.csv

# View leaderboard
curl http://localhost:3000/api/leaderboard/quiz
```

---

## 📞 Support & Documentation

- **Project Structure**: See `README.md`
- **API Documentation**: See `API_DOCS.md` (if available)
- **Docker Guide**: See `DOCKER_QUICKSTART.md`
- **Development**: See `SETUP.md`

---

## ✨ Summary

You now have a **fully-functional web-based multiplayer educational game** with:

- ✅ All original game assets integrated
- ✅ Real-time multiplayer with WebSocket
- ✅ Database persistence for profiles and analytics
- ✅ Docker deployment for easy scaling
- ✅ Production-ready configuration
- ✅ Comprehensive monitoring and logging

**The game is ready for classroom deployment!** 🎉

Students can now:
- Study Grade 12 Physics topics together
- Compete on leaderboards
- Customize avatars
- Earn achievements
- Take quizzes
- See real-time engagement analytics

---

**Good luck with your research project!** 🚀📚
