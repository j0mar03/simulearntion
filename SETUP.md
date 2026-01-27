# GokGok Multiplayer - Setup Guide

Complete setup instructions for getting the multiplayer game running locally and on your VPS.

---

## Prerequisites

Before starting, ensure you have:

- **Node.js 18+** and npm
- **PostgreSQL 14+**
- **Git**
- (For VPS) Ubuntu/Debian server with root access

---

## Local Development Setup

### Step 1: Install PostgreSQL

#### On Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

#### On macOS:
```bash
brew install postgresql@14
brew services start postgresql@14
```

#### On Windows:
Download and install from: https://www.postgresql.org/download/windows/

### Step 2: Create Database

```bash
# Start PostgreSQL if not running
sudo service postgresql start

# Create database and user
sudo -u postgres psql <<EOF
CREATE DATABASE gokgok_db;
CREATE USER gokgok_user WITH PASSWORD 'gokgok2026';
GRANT ALL PRIVILEGES ON DATABASE gokgok_db TO gokgok_user;
\q
EOF
```

### Step 3: Install Project Dependencies

```bash
cd gokgok-multiplayer
npm install
```

### Step 4: Set Up Environment

The `.env` file is already configured for local development. If needed, edit:

```bash
nano .env
```

### Step 5: Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

### Step 6: (Optional) Migrate Existing Profiles

If you have existing player profiles from the Python version:

```bash
node scripts/migrate-profiles.js
```

### Step 7: Start Development Server

```bash
npm run dev
```

The game will be available at: **http://localhost:3000**

---

## Production VPS Deployment

### Step 1: Prepare VPS

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should be v18.x.x or higher
npm --version

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2 globally
sudo npm install -g pm2

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

### Step 2: Set Up Database on VPS

```bash
# Create database and user
sudo -u postgres psql <<EOF
CREATE DATABASE gokgok_db;
CREATE USER gokgok_user WITH PASSWORD 'your_secure_production_password';
GRANT ALL PRIVILEGES ON DATABASE gokgok_db TO gokgok_user;
ALTER DATABASE gokgok_db OWNER TO gokgok_user;
\q
EOF
```

### Step 3: Deploy Application

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/yourusername/gokgok-multiplayer.git gokgok
cd gokgok

# Install dependencies (production mode)
sudo npm install --production

# Set up environment
sudo cp .env.example .env
sudo nano .env
```

**Edit `.env` with production values:**

```env
DATABASE_URL="postgresql://gokgok_user:your_secure_production_password@localhost:5432/gokgok_db"
JWT_SECRET="generate-a-random-64-character-string-here"
JWT_EXPIRES_IN="24h"
PORT=3000
NODE_ENV="production"
CLIENT_URL="https://yourdomain.com"
```

```bash
# Run database migrations
sudo npx prisma migrate deploy
sudo npx prisma generate

# Set correct permissions
sudo chown -R www-data:www-data /var/www/gokgok
```

### Step 4: Configure Nginx

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/gokgok
```

**Paste this configuration:**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect to HTTPS (will be configured by Certbot)
    location / {
        root /var/www/gokgok/client;
        try_files $uri $uri/ /index.html;
    }
    
    # API endpoints
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Socket.IO WebSocket
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # Static assets
    location /shared {
        alias /var/www/gokgok/shared;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/gokgok /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 5: Set Up SSL (HTTPS)

```bash
# Get SSL certificate (follow prompts)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Step 6: Start Application with PM2

```bash
# Start the application
cd /var/www/gokgok
sudo pm2 start server/server.js --name gokgok-server

# Set up auto-restart on boot
sudo pm2 startup
sudo pm2 save

# Check status
sudo pm2 status
sudo pm2 logs gokgok-server
```

### Step 7: Configure Firewall

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Check status
sudo ufw status
```

---

## Database Backup (Production)

Create automated daily backups:

```bash
# Create backup script
sudo nano /usr/local/bin/backup-gokgok.sh
```

**Paste:**

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/gokgok"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
sudo -u postgres pg_dump gokgok_db > $BACKUP_DIR/gokgok_db_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "gokgok_db_*.sql" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-gokgok.sh

# Add to cron (daily at 2 AM)
sudo crontab -e
```

**Add line:**

```
0 2 * * * /usr/local/bin/backup-gokgok.sh >> /var/log/gokgok-backup.log 2>&1
```

---

## Testing the Deployment

1. **Check server is running:**
   ```bash
   sudo pm2 status
   ```

2. **Check logs:**
   ```bash
   sudo pm2 logs gokgok-server
   ```

3. **Test in browser:**
   - Open: https://yourdomain.com
   - Register a new account
   - Try all features: lobby, library, quiz, customization

4. **Test multiplayer:**
   - Open in multiple browsers/devices
   - Check if players see each other
   - Test chat functionality

---

## Monitoring & Maintenance

### View Logs

```bash
# Application logs
sudo pm2 logs gokgok-server

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Restart Services

```bash
# Restart application
sudo pm2 restart gokgok-server

# Restart Nginx
sudo systemctl restart nginx

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Update Application

```bash
cd /var/www/gokgok
sudo git pull
sudo npm install --production
sudo npx prisma migrate deploy
sudo pm2 restart gokgok-server
```

---

## Troubleshooting

### Issue: Cannot connect to database

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U gokgok_user -d gokgok_db -h localhost

# Check DATABASE_URL in .env
```

### Issue: Port 3000 already in use

```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill process (use PID from above)
sudo kill -9 <PID>

# Or change PORT in .env
```

### Issue: Socket.IO not connecting

- Check Nginx config includes `/socket.io` location
- Verify WebSocket upgrade headers are set
- Check firewall allows connections
- Test with: https://yourdomain.com/socket.io/socket.io.js

### Issue: Assets not loading

```bash
# Check file permissions
sudo chown -R www-data:www-data /var/www/gokgok

# Restart Nginx
sudo systemctl restart nginx
```

---

## Performance Optimization

### For 20 concurrent users:

**Recommended VPS specs:**
- 2 vCPU
- 2GB RAM
- 50GB SSD
- Ubuntu 22.04 LTS

**PostgreSQL tuning:**

```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
```

Add/modify:

```
max_connections = 50
shared_buffers = 512MB
effective_cache_size = 1GB
work_mem = 16MB
```

```bash
sudo systemctl restart postgresql
```

---

## Support

For issues:
1. Check logs: `sudo pm2 logs gokgok-server`
2. Check Nginx: `sudo nginx -t`
3. Check database: `sudo -u postgres psql gokgok_db`
4. Review this guide's troubleshooting section

---

**Deployment complete! Your multiplayer educational game is now live! 🚀**
