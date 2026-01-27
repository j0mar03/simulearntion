# Fix: Column `users.is_admin` does not exist

## Quick Fix (Development)

Run this command to sync the schema directly:

```bash
docker compose exec app npx prisma db push
docker compose exec app npx prisma generate
docker compose restart app
```

This will:
1. Add the `is_admin` column to the database
2. Regenerate Prisma client
3. Restart the server

## Proper Fix (Production)

Create and apply a migration:

```bash
# 1. Create the migration
docker compose exec app npx prisma migrate dev --name add_admin_field

# 2. If that fails, try this:
docker compose exec app npx prisma migrate dev --create-only --name add_admin_field
docker compose exec app npx prisma migrate deploy

# 3. Regenerate Prisma client
docker compose exec app npx prisma generate

# 4. Restart
docker compose restart app
```

## Alternative: Manual SQL

If migrations are not working, you can add the column manually:

```bash
docker compose exec postgres psql -U gokgok_user -d gokgok_db
```

Then run:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
```

Exit with `\q`, then:
```bash
docker compose exec app npx prisma generate
docker compose restart app
```
