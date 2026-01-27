# GokGok Multiplayer - Quick Start

Get the game running in 5 minutes!

---

## Prerequisites Check

```bash
# Check Node.js (need 18+)
node --version

# Check PostgreSQL
psql --version

# If missing, install from SETUP.md
```

---

## Quick Setup (Local)

### 1. Install Dependencies

```bash
cd /home/jomar/JoshCapstone/gokgok-multiplayer
npm install
```

### 2. Setup Database

```bash
# Create database (one-time)
sudo -u postgres psql -c "CREATE DATABASE gokgok_db;"
sudo -u postgres psql -c "CREATE USER gokgok_user WITH PASSWORD 'gokgok2026';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE gokgok_db TO gokgok_user;"

# Run migrations
npx prisma migrate dev
```

### 3. Start Server

```bash
npm run dev
```

Open: **http://localhost:3000**

---

## Quick Commands

```bash
# Development server (auto-reload)
npm run dev

# Production server
npm start

# View database in browser
npx prisma studio

# Migrate existing profiles
node scripts/migrate-profiles.js

# Check database
psql -U gokgok_user -d gokgok_db
```

---

## Test Accounts

Create test accounts through the game UI or:

```bash
# Register via API
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"student1","email":"student1@test.com","password":"test123"}'
```

---

## Quick Test Multiplayer

1. Open game in 2+ browser windows
2. Register different accounts in each
3. Walk around lobby - see each other!
4. Test chat with "T" key
5. Try library and quiz

---

## Troubleshooting

**Database error?**
```bash
# Check PostgreSQL running
sudo service postgresql status
sudo service postgresql start
```

**Port 3000 in use?**
```bash
# Find and kill process
sudo lsof -i :3000
sudo kill -9 <PID>
```

**Can't connect?**
- Check `.env` file exists
- Verify DATABASE_URL is correct
- Run `npx prisma generate`

---

## Files You Might Edit

- **`server/server.js`** - Main server config
- **`client/index.html`** - HTML structure
- **`client/css/style.css`** - Styling
- **`shared/constants.js`** - Quiz questions, game config
- **`.env`** - Database credentials

---

## For VPS Deployment

See **SETUP.md** for complete production deployment guide.

Quick summary:
1. Install Node.js + PostgreSQL + Nginx
2. Clone repo to `/var/www/gokgok`
3. Configure `.env` for production
4. Setup Nginx + SSL
5. Start with PM2

---

## Support

- **Full Documentation:** See README.md
- **Setup Guide:** See SETUP.md
- **Implementation Details:** See DEPLOYMENT_SUMMARY.md

---

**Have fun testing your multiplayer educational game! 🎮📚**
