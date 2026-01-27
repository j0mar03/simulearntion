# 🚀 SimuLearntion - Quick Start

## One-Command Deployment

```bash
cd /home/jomar/JoshCapstoneV1/gokgok-multiplayer
./deploy.sh
```

**Then open:** `http://localhost:3000`

---

## Alternative: Manual 3-Step Deploy

```bash
# 1. Setup environment
cp .env.docker .env

# 2. Start Docker services
docker compose up -d

# 3. Open browser
# Visit: http://localhost:3000
```

---

## Verify Everything Works

```bash
# Check all assets are integrated
./verify-assets.sh

# View logs
docker compose logs -f

# Check status
docker compose ps
```

---

## Common Commands

### Start/Stop

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Restart application
docker compose restart app

# View logs
docker compose logs -f app
```

### Monitoring

```bash
# Check container status
docker compose ps

# View resource usage
docker stats

# Database access
docker compose exec postgres psql -U gokgok_user gokgok_db
```

### Maintenance

```bash
# Backup database
docker compose exec postgres pg_dump -U gokgok_user gokgok_db > backup.sql

# Restore database
docker compose exec -T postgres psql -U gokgok_user gokgok_db < backup.sql

# Clean rebuild
docker compose down --rmi all --volumes
docker compose build --no-cache
docker compose up -d
```

---

## What to Expect

1. **First Visit**: Register/Login screen
2. **Lobby**: See your character, walk around, see other players
3. **Avatar Button**: Customize appearance (real assets from original game)
4. **Library Door**: Walk to top-right corner to enter library
5. **Study/Quiz**: Access physics content and quizzes
6. **Achievements**: Track progress and earn badges

---

## Troubleshooting One-Liners

```bash
# Port 3000 in use?
sudo lsof -i :3000 && sudo kill -9 $(lsof -ti:3000)

# Assets missing?
./verify-assets.sh

# Database issues?
docker compose down && docker compose up -d

# Fresh start?
docker compose down --volumes && docker compose up -d
```

---

## Network Access (Share with Students)

```bash
# Find your server IP
hostname -I | awk '{print $1}'

# Share this URL with students on same network
# http://YOUR-IP:3000
```

---

## Full Documentation

- **Complete Guide**: `DEPLOYMENT_GUIDE.md`
- **Technical Details**: `README.md`
- **Docker Setup**: `DOCKER_QUICKSTART.md`
- **Manual Setup**: `SETUP.md`

---

## Support

**Issue?** Check logs first:
```bash
docker compose logs app
docker compose logs postgres
```

**Still stuck?** See `DEPLOYMENT_GUIDE.md` for detailed troubleshooting.

---

**Status**: ✅ All 59 assets integrated | ✅ Docker ready | ✅ Multiplayer working

**Ready to deploy!** 🎉
