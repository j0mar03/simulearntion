# 🚀 SimuLearntion - Deployment Checklist

## Pre-Deployment Verification

### ✅ System Requirements
- [ ] Docker installed and running
  ```bash
  docker --version
  docker compose version
  ```
- [ ] At least 4GB RAM available
- [ ] At least 2GB disk space free
- [ ] Port 3000 available (or change in .env)

### ✅ Assets Verification
- [ ] Run asset verification script
  ```bash
  ./verify-assets.sh
  ```
- [ ] Confirm: **61/61 checks passed**
- [ ] Confirm: **33 PNG images**
- [ ] Confirm: **26 GIF animations**

### ✅ Configuration Files
- [ ] `.env` file exists (or will be created by deploy.sh)
- [ ] `docker-compose.yml` present
- [ ] `Dockerfile` present
- [ ] `package.json` present

---

## Deployment Steps

### Option A: Automated Deployment (Recommended)
- [ ] Navigate to directory
  ```bash
  cd /home/jomar/JoshCapstoneV1/gokgok-multiplayer
  ```
- [ ] Run deployment script
  ```bash
  ./deploy.sh
  ```
- [ ] Wait for completion (3-5 minutes)
- [ ] Confirm success message appears

### Option B: Manual Docker Deployment
- [ ] Navigate to directory
- [ ] Copy environment file
  ```bash
  cp .env.docker .env
  ```
- [ ] Start services
  ```bash
  docker compose up -d
  ```
- [ ] Wait for services to start (1-2 minutes)

---

## Post-Deployment Checks

### ✅ Service Status
- [ ] Check container status
  ```bash
  docker compose ps
  ```
- [ ] Confirm PostgreSQL is "Up (healthy)"
- [ ] Confirm App is "Up"

### ✅ Health Check
- [ ] Test health endpoint
  ```bash
  curl http://localhost:3000/api/health
  ```
- [ ] Should return: `{"status":"OK",...}`

### ✅ Browser Access
- [ ] Open browser to `http://localhost:3000`
- [ ] Login/Register page loads
- [ ] Can create new account
- [ ] Can login successfully

### ✅ Game Functionality
- [ ] **Lobby Scene**
  - [ ] Background image loads (Lobby.png)
  - [ ] Character appears (animated GIF)
  - [ ] Can move with arrow keys
  - [ ] Avatar button visible (real button image)
  - [ ] Achievements button works

- [ ] **Avatar Customization**
  - [ ] Background loads (Avatar Customization.png)
  - [ ] Preview shows character
  - [ ] Can click uniform buttons
  - [ ] Can click head accessory buttons
  - [ ] Preview updates when selecting items
  - [ ] Changes save when returning to lobby

- [ ] **Library Scene**
  - [ ] Walk to top-right door in lobby
  - [ ] Library background loads
  - [ ] Study button works (real button image)
  - [ ] Can select physics topics
  - [ ] Content displays correctly
  - [ ] Can exit back to lobby

- [ ] **Quiz System**
  - [ ] Walk to bottom-right in library
  - [ ] Quiz background loads
  - [ ] Questions display
  - [ ] Can select answers with arrow keys
  - [ ] Can submit with Enter
  - [ ] Score tracks correctly
  - [ ] Can complete full quiz

- [ ] **Achievements**
  - [ ] Click achievements button in lobby
  - [ ] Achievement background loads
  - [ ] Achievements display
  - [ ] Back button works

### ✅ Multiplayer Features
- [ ] Open second browser/incognito window
- [ ] Login with different account
- [ ] **In Lobby:**
  - [ ] Can see other player's character
  - [ ] Other player moves in real-time
  - [ ] Avatar changes reflect on other player's screen
- [ ] **Chat System:**
  - [ ] Press T to open chat
  - [ ] Can send message
  - [ ] Message appears in other window

### ✅ Database Verification
- [ ] Check database connection
  ```bash
  docker compose exec postgres psql -U gokgok_user gokgok_db -c "\dt"
  ```
- [ ] Tables exist: users, sessions, quiz_attempts, etc.

---

## Network Deployment (Optional)

### ✅ For Classroom/Network Access
- [ ] Find server IP address
  ```bash
  hostname -I | awk '{print $1}'
  ```
- [ ] Test access from another device on same network
  ```
  http://SERVER-IP:3000
  ```
- [ ] Confirm students can access
- [ ] Test with multiple concurrent users

---

## Troubleshooting Checklist

### Issue: Port 3000 Already in Use
- [ ] Check what's using port
  ```bash
  sudo lsof -i :3000
  ```
- [ ] Kill process or change PORT in .env

### Issue: Assets Not Loading
- [ ] Verify assets exist
  ```bash
  ./verify-assets.sh
  ```
- [ ] Check browser console (F12) for errors
- [ ] Verify Docker volume mounts
  ```bash
  docker compose exec app ls -la /app/client/assets/
  ```

### Issue: Database Connection Failed
- [ ] Check PostgreSQL logs
  ```bash
  docker compose logs postgres
  ```
- [ ] Verify DATABASE_URL in .env
- [ ] Restart PostgreSQL
  ```bash
  docker compose restart postgres
  ```

### Issue: Players Not Appearing
- [ ] Check Socket.IO logs
  ```bash
  docker compose logs app | grep socket
  ```
- [ ] Check browser console for WebSocket connection
- [ ] Verify CORS settings in server.js

### Issue: Animation/Images Not Loading
- [ ] Open browser console (F12) → Network tab
- [ ] Refresh page
- [ ] Check for 404 errors on asset files
- [ ] Verify asset paths in BootScene.js match file structure

---

## Maintenance Checklist

### Daily (If Running in Production)
- [ ] Check service status: `docker compose ps`
- [ ] Monitor disk space: `df -h`
- [ ] Check logs for errors: `docker compose logs --tail=100 app`

### Weekly
- [ ] Backup database
  ```bash
  docker compose exec postgres pg_dump -U gokgok_user gokgok_db > backup_$(date +%Y%m%d).sql
  ```
- [ ] Review analytics data
- [ ] Check for Docker updates: `docker compose pull`

### Monthly
- [ ] Update dependencies
  ```bash
  docker compose down
  docker compose build --no-cache
  docker compose up -d
  ```
- [ ] Archive old analytics data
- [ ] Review and clean up user accounts if needed

---

## Success Criteria

All items below should be ✅:

### Essential Features
- ✅ Game loads in browser
- ✅ All backgrounds display correctly
- ✅ Characters animate (GIFs working)
- ✅ Can create account and login
- ✅ Can customize avatar
- ✅ Can study physics topics
- ✅ Can take quizzes
- ✅ Can earn achievements
- ✅ Data persists across sessions

### Multiplayer Features
- ✅ Can see other players
- ✅ Real-time movement sync
- ✅ Chat works
- ✅ Leaderboards update
- ✅ Avatar changes broadcast

### Technical
- ✅ Docker containers running
- ✅ Database connected
- ✅ No console errors
- ✅ Assets load correctly
- ✅ API endpoints respond

---

## Final Verification Command

Run this to generate a complete status report:

```bash
#!/bin/bash
echo "=== GokGok Deployment Status ==="
echo ""
echo "1. Assets:"
./verify-assets.sh | grep "Total Checks:"
echo ""
echo "2. Docker:"
docker compose ps
echo ""
echo "3. Health:"
curl -s http://localhost:3000/api/health | python3 -m json.tool
echo ""
echo "4. Database:"
docker compose exec postgres psql -U gokgok_user gokgok_db -c "SELECT COUNT(*) as user_count FROM users;"
echo ""
echo "✅ Deployment verification complete!"
```

---

## 📋 Sign-Off

Once all checklist items are complete:

- **Date Deployed**: _______________
- **Deployed By**: _______________
- **Server IP**: _______________
- **Number of Students Expected**: _______________
- **All Checks Passed**: [ ] Yes  [ ] No

**Notes:**
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________

---

## 🎓 Ready for Students!

When all items above are checked:
1. Share URL with students: `http://YOUR-IP:3000`
2. Provide quick instructions:
   - Register with username/email/password
   - Login
   - Use arrow keys to move
   - Press T to chat
   - Walk to doors to navigate
   - Click buttons to interact
3. Monitor first session for any issues
4. Collect feedback

**The game is ready when this checklist is complete!** ✅

---

For issues, refer to:
- `DEPLOYMENT_GUIDE.md` - Detailed troubleshooting
- `QUICK_START.md` - Common commands
- Server logs: `docker compose logs -f`
