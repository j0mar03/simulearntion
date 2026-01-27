# Avatar Visibility Fix & Admin Account Setup

## Issues Fixed

1. ✅ **Avatar visibility** - Sprite now always visible from start
2. ✅ **Admin account system** - Default admin with all accessories unlocked
3. ✅ **Unlock status** - CustomScene now checks server for unlock status

## Changes Made

### 1. Database Schema
- Added `isAdmin` field to User model
- Migration needed: `npx prisma migrate dev --name add_admin_field`

### 2. Server Updates
- Updated `achievement-manager.js` to check admin status
- Updated `profile.js` to return unlock status and admin flag
- Updated `auth.js` to include admin flag in responses

### 3. Client Updates
- Updated `Player.js` to ensure sprite is always visible
- Updated `CustomScene.js` to fetch unlock status from server
- Updated `main.js` to load unlock status on login

### 4. Admin Script
- Created `scripts/create-admin.js` to create default admin

## Setup Instructions

### Step 1: Run Database Migration

```bash
cd ~/JoshCapstoneV1/gokgok-multiplayer
docker compose exec app npx prisma migrate dev --name add_admin_field
```

### Step 2: Create Admin Account

```bash
docker compose exec app node scripts/create-admin.js
```

Or manually:
```bash
docker compose exec app npm run create-admin
```

### Step 3: Rebuild Docker

```bash
docker compose down
docker compose build --no-cache app
docker compose up -d
```

### Step 4: Test

1. Login with: `admin` / `admin123`
2. Avatar should be visible immediately
3. All accessories should be unlocked (no 🔒 icons)

## Default Admin Credentials

- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Change password in production!**

## Avatar Visibility Fixes

The sprite now:
- ✅ Checks if texture exists before creating sprite
- ✅ Uses placeholder texture if needed
- ✅ Updates to correct texture once available
- ✅ Always visible (`setVisible(true)`)
- ✅ Always opaque (`setAlpha(1.0)`)
- ✅ Checks visibility every frame in `update()`

## Troubleshooting

If avatar still not visible:
1. Check browser console (F12) for errors
2. Verify textures are loaded: `console.log(scene.textures.list)`
3. Check if `anim-base` texture exists
4. Verify sprite is created: `console.log(player.sprite)`
