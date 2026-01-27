# Troubleshooting Network Errors

## Issue: "Network error" when trying to login or register

### Step 1: Check if containers are running

```bash
docker compose ps
```

You should see both `gokgok-app` and `gokgok-postgres` with status "Up".

### Step 2: Check server logs

```bash
docker compose logs app --tail=50
```

Look for:
- Database connection errors
- Migration errors
- Prisma client errors
- Server startup errors

### Step 3: Check if database migration is needed

The `isAdmin` field was added to the schema. You need to:

1. **Create and run the migration:**
```bash
docker compose exec app npx prisma migrate dev --name add_admin_field
```

2. **If migration fails, regenerate Prisma client:**
```bash
docker compose exec app npx prisma generate
```

### Step 4: Rebuild Docker container (if needed)

If the schema changed, you need to rebuild:

```bash
docker compose down
docker compose build --no-cache app
docker compose up -d
```

### Step 5: Check database connection

```bash
docker compose exec app npx prisma db push
```

This will sync the schema without creating a migration.

### Step 6: Verify server is responding

Open in browser: `http://localhost:3000/api/health`

Should return:
```json
{
  "status": "OK",
  "timestamp": "...",
  "uptime": ...
}
```

### Step 7: Check browser console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to login/register
4. Look for error messages

Common errors:
- `Failed to fetch` - Server not running or CORS issue
- `500 Internal Server Error` - Server error (check server logs)
- `Network error` - Connection refused (server not running)

### Step 8: Check if port 3000 is available

```bash
netstat -tuln | grep 3000
# or
lsof -i :3000
```

If something else is using port 3000, either:
- Stop that service
- Change PORT in `.env` and docker-compose.yml

### Step 9: Restart everything

```bash
docker compose down
docker compose up -d
```

Wait 10-20 seconds for services to start, then check logs:
```bash
docker compose logs -f
```

### Step 10: Check Prisma schema sync

```bash
docker compose exec app npx prisma db pull
docker compose exec app npx prisma generate
```

## Common Issues

### Issue: "column users.is_admin does not exist"

**Solution:** Run migration:
```bash
docker compose exec app npx prisma migrate dev --name add_admin_field
```

### Issue: "Prisma Client has not been generated yet"

**Solution:** Generate Prisma client:
```bash
docker compose exec app npx prisma generate
```

### Issue: "Cannot connect to database"

**Solution:** Check database is running:
```bash
docker compose ps postgres
docker compose logs postgres
```

### Issue: Server crashes on startup

**Solution:** Check logs for specific error:
```bash
docker compose logs app
```

Common causes:
- Missing environment variables
- Database not ready
- Migration failed
- Prisma client outdated

## Quick Fix Script

Run this to fix most common issues:

```bash
cd ~/JoshCapstoneV1/gokgok-multiplayer

# Stop containers
docker compose down

# Rebuild with fresh Prisma client
docker compose build --no-cache app

# Start containers
docker compose up -d

# Wait for database
sleep 5

# Run migration
docker compose exec app npx prisma migrate dev --name add_admin_field

# Generate Prisma client
docker compose exec app npx prisma generate

# Check logs
docker compose logs -f app
```

## Still Not Working?

1. **Check all logs:**
```bash
docker compose logs
```

2. **Check if database is accessible:**
```bash
docker compose exec postgres psql -U gokgok_user -d gokgok_db -c "SELECT 1;"
```

3. **Verify .env file exists and has correct values:**
```bash
cat .env
```

4. **Check Docker network:**
```bash
docker network ls
docker network inspect gokgok-multiplayer_gokgok-network
```
