# WSL + Windows Docker - Super Quick Start! ⚡

For users running WSL with Docker Desktop on Windows.

---

## 🎯 One-Time Setup (5 Minutes)

### 1. Install Docker Desktop on Windows

Download: https://www.docker.com/products/docker-desktop

### 2. Enable WSL Integration

In Docker Desktop:
1. **Settings** → **General**
2. ✅ **"Use the WSL 2 based engine"**
3. **Settings** → **Resources** → **WSL Integration**
4. ✅ **"Enable integration with my default WSL distro"**
5. ✅ Enable your Ubuntu/distro
6. **Apply & Restart**

### 3. Verify in WSL

```bash
docker --version
docker compose version
docker ps  # Should work without errors
```

**If errors:** Restart Docker Desktop in Windows, then restart WSL:
```powershell
# In Windows PowerShell (Admin)
wsl --shutdown
```

---

## 🚀 Start the Game (2 Commands)

```bash
# In WSL terminal
cd /home/jomar/JoshCapstone/gokgok-multiplayer
./docker-start-wsl.sh
```

**That's it!** 🎉

---

## 🎮 Play the Game

Open in **Windows browser**:
- http://localhost:3000

Test multiplayer: Open multiple tabs!

---

## 📝 Common Commands (WSL Terminal)

```bash
# View logs
docker compose logs -f

# Stop everything
docker compose down

# Restart app
docker compose restart app

# Fresh start
docker compose down -v
docker compose up -d
```

---

## 🔧 Troubleshooting

### "Cannot connect to Docker daemon"

1. Is Docker Desktop running in Windows? (Check taskbar 🐳)
2. Is WSL integration enabled? (Docker Desktop settings)
3. Restart WSL:
   ```powershell
   # In Windows PowerShell (Admin)
   wsl --shutdown
   # Wait 10 seconds, reopen WSL
   ```

### Port 3000 in use

```bash
# Change port in .env
nano .env
# Set: PORT=3001

docker compose down
docker compose up -d
```

### Slow performance

Make sure you're in WSL filesystem:
```bash
pwd
# Should be: /home/jomar/... ✅
# NOT: /mnt/c/... ❌
```

---

## 💡 Tips

### Edit Files in Windows

Your WSL files are accessible in Windows at:
```
\\wsl$\Ubuntu\home\jomar\JoshCapstone\gokgok-multiplayer
```

Open with VS Code, Notepad++, etc.

### Development Mode (Hot-reload)

```bash
docker compose -f docker-compose.dev.yml up
```

Code changes will auto-reload!

### Backup Database

```bash
docker compose exec postgres pg_dump -U gokgok_user gokgok_db > backup.sql
```

---

## 📚 Full Documentation

- **WSL-specific guide:** `DOCKER_WSL_SETUP.md`
- **Complete Docker guide:** `DOCKER_SETUP.md`
- **General quick start:** `DOCKER_QUICKSTART.md`

---

## ✅ Your Setup

**What you have:**
- ✅ WSL2 on Windows
- ✅ Docker Desktop on Windows
- ✅ Project in WSL: `/home/jomar/JoshCapstone/gokgok-multiplayer`

**How it works:**
- Run commands in **WSL terminal**
- Docker runs in **Windows**
- Access game in **Windows browser**
- Edit files with **Windows apps** (via `\\wsl$\`)

**Perfect for development and testing! 🎯**

---

**WSL + Docker setup complete! Your multiplayer game is ready! 🐳🪟🎮**
