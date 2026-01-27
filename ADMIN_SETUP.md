# Admin Account Setup

## Default Admin Account

A default admin account has been created with the following credentials:

- **Username**: `admin`
- **Email**: `admin@gokgok.local`
- **Password**: `admin123`

⚠️ **IMPORTANT**: Change the password in production!

## Admin Features

Admin users have:
- ✅ All avatar accessories unlocked (no achievements required)
- ✅ Full access to all customization options
- ✅ All items available immediately

## Creating/Updating Admin Account

### Option 1: Run the Script (Recommended)

```bash
cd ~/JoshCapstoneV1/gokgok-multiplayer
docker compose exec app node scripts/create-admin.js
```

### Option 2: Manual Database Update

```bash
docker compose exec app npx prisma studio
```

Then update the user's `isAdmin` field to `true` in the Prisma Studio interface.

### Option 3: SQL Direct

```bash
docker compose exec postgres psql -U gokgok_user -d gokgok_db
```

```sql
UPDATE users SET is_admin = true WHERE username = 'admin';
```

## Database Migration

After adding the `isAdmin` field, run:

```bash
docker compose exec app npx prisma migrate dev --name add_admin_field
```

Or if in production:

```bash
docker compose exec app npx prisma migrate deploy
```

## Testing Admin Account

1. Login with username: `admin`, password: `admin123`
2. Go to Avatar Customization
3. All items should be unlocked (no 🔒 icons)
4. You can select any body/clothing and any accessory

## Security Notes

- Admin status is checked server-side
- Admin flag is included in JWT token
- All unlock checks respect admin status
- Change default password before production deployment
