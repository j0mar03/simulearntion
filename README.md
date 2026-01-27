# SimuLearntion - Multiplayer Edition

**SimuLearntion: Development of an Interactive Classroom Simulation to Enhance Student Engagement**

Web-based multiplayer educational game for Grade 12 Physics with real-time player interaction, gamification, and comprehensive analytics.

---

## Features

- **Multiplayer Lobby & Library** - See other students in real-time
- **User Authentication** - Secure JWT-based login system
- **Physics Quiz System** - 26 comprehensive questions
- **Avatar Customization** - Unlock items through achievements
- **Achievement System** - Earn badges for learning milestones
- **Real-Time Leaderboards** - Compare scores with classmates
- **Analytics Tracking** - Comprehensive engagement metrics for research
- **Responsive Design** - Works on desktop and tablets

---

## Quick Start

### Option 1: Docker (Recommended - 1 Minute Setup!)

**Prerequisites:** Docker & Docker Compose

#### For WSL + Windows Docker Desktop Users:

```bash
# 1. Navigate to project
cd gokgok-multiplayer

# 2. WSL-specific quick start
./docker-start-wsl.sh

# OR manual commands:
cp .env.docker .env
docker compose up -d
```

**Done!** Open in Windows browser: `http://localhost:3000`

See `DOCKER_WSL_SETUP.md` for WSL-specific guide.

#### For Native Linux/macOS:

```bash
# 1. Navigate to project
cd gokgok-multiplayer

# 2. Quick start script
./docker-start.sh

# OR manual commands:
cp .env.docker .env
docker compose up -d
```

**Done!** Open `http://localhost:3000`

See `DOCKER_QUICKSTART.md` for details.

---

### Option 2: Manual Setup

**Prerequisites:** Node.js 18+, PostgreSQL 14+

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd gokgok-multiplayer

# 2. Install dependencies
npm install

# 3. Set up PostgreSQL database
sudo -u postgres createdb gokgok_db
sudo -u postgres createuser gokgok_user -P

# 4. Configure environment
cp .env.example .env
# Edit .env with your database credentials

# 5. Run database migrations
npx prisma migrate dev
npx prisma generate

# 6. (Optional) Migrate existing player profiles
node scripts/migrate-profiles.js

# 7. Start the server
npm run dev
```

Server will run on `http://localhost:3000`

See `SETUP.md` for detailed manual setup.

---

## Project Structure

```
gokgok-multiplayer/
├── server/              # Backend (Node.js + Express + Socket.IO)
│   ├── server.js       # Main server file
│   ├── socket-handler.js  # Real-time multiplayer logic
│   ├── routes/         # API endpoints
│   ├── middleware/     # Authentication & validation
│   └── utils/          # Analytics, achievements, room manager
├── client/             # Frontend (Phaser.js game)
│   ├── index.html     # Entry point
│   ├── css/           # Styles
│   ├── js/            # Game logic
│   │   ├── scenes/   # Game scenes (lobby, library, quiz, etc.)
│   │   ├── entities/ # Player entities
│   │   ├── network/  # Socket.IO client
│   │   └── ui/       # UI components
│   └── assets/        # Images, sprites, audio
├── shared/            # Shared constants (quiz questions, etc.)
├── prisma/            # Database schema
└── scripts/           # Utility scripts

```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/verify` - Verify token validity

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile (avatar)
- `GET /api/profile/quiz-history` - Get quiz history
- `GET /api/profile/achievements` - Get earned achievements

### Analytics
- `POST /api/analytics` - Submit session data
- `GET /api/analytics/summary` - Get analytics summary

### Leaderboards
- `GET /api/leaderboard/quiz` - Top quiz performers
- `GET /api/leaderboard/engagement` - Top engagement scores
- `GET /api/leaderboard/achievements` - Most achievements

---

## Socket.IO Events

### Client → Server
- `join-lobby` - Enter main lobby
- `player-move` - Update player position
- `player-state` - Update animation state
- `enter-library` - Enter library room
- `exit-library` - Return to lobby
- `chat-message` - Send chat message
- `study-topic` - Select topic to study
- `start-quiz` - Begin quiz
- `quiz-answer` - Submit quiz answer
- `avatar-changed` - Update avatar
- `achievement-earned` - Achievement unlocked

### Server → Client
- `lobby-state` - Current lobby players
- `library-state` - Current library players
- `player-joined` - New player entered room
- `player-left` - Player left room
- `player-moved` - Player position update
- `player-state-changed` - Player animation update
- `player-avatar-changed` - Player changed avatar
- `player-studying` - Player studying topic
- `player-quiz-progress` - Live quiz updates
- `player-achievement` - Player earned achievement
- `chat-message` - Chat message received

---

## Database Schema

- **users** - User accounts and profiles
- **sessions** - Play sessions with analytics
- **quiz_attempts** - Individual quiz answers
- **achievements** - Earned achievements
- **state_transitions** - Navigation tracking
- **topics_studied** - Studied topics log

---

## Development

### With Docker

```bash
# Start development environment (hot-reload)
docker compose -f docker-compose.dev.yml up

# View logs
docker compose logs -f app

# Run migrations
docker compose exec app npx prisma migrate dev

# Access database
docker compose exec postgres psql -U gokgok_user -d gokgok_db
```

### Without Docker

```bash
# Run in development mode with auto-reload
npm run dev

# Run database migrations
npm run migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Generate Prisma client after schema changes
npm run prisma:generate
```

### Docker Commands

```bash
# Start all services
npm run docker:up

# Stop all services
npm run docker:down

# View logs
npm run docker:logs

# Rebuild containers
npm run docker:build

# Restart application
npm run docker:restart
```

---

## Deployment

### Option 1: Docker on VPS (Recommended)

**Easiest production deployment:**

```bash
# On your VPS
curl -fsSL https://get.docker.com | sh

# Clone and configure
git clone <your-repo> /var/www/gokgok
cd /var/www/gokgok
cp .env.docker .env
nano .env  # Set secure passwords

# Start with one command
docker compose up -d

# (Optional) Enable Nginx + SSL
docker compose --profile production up -d
```

See `DOCKER_SETUP.md` for complete Docker deployment guide.

---

### Option 2: Manual VPS Deployment

### 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2 globally
sudo npm install -g pm2
```

### 2. Database Setup

```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE gokgok_db;
CREATE USER gokgok_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE gokgok_db TO gokgok_user;
\q
```

### 3. Clone and Configure

```bash
# Clone repository
cd /var/www
git clone <your-repo-url> gokgok
cd gokgok

# Install dependencies
npm install --production

# Set up environment
cp .env.example .env
nano .env  # Edit with production values

# Run migrations
npx prisma migrate deploy
```

### 4. Configure Nginx

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/gokgok
```

```nginx
server {
    server_name yourdomain.com;
    
    location / {
        root /var/www/gokgok/client;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/gokgok /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. SSL Certificate

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com
```

### 6. Start with PM2

```bash
# Start application
pm2 start server/server.js --name gokgok-server

# Set up auto-restart on boot
pm2 startup
pm2 save

# Monitor
pm2 logs gokgok-server
pm2 monit
```

---

## Research Data

All analytics data is stored in PostgreSQL and can be exported for statistical analysis:

```bash
# Export analytics to CSV
psql gokgok_db -c "COPY (SELECT * FROM sessions) TO STDOUT WITH CSV HEADER" > sessions.csv
psql gokgok_db -c "COPY (SELECT * FROM quiz_attempts) TO STDOUT WITH CSV HEADER" > quiz_attempts.csv
```

---

## Support

For issues or questions:
1. Check server logs: `pm2 logs gokgok-server`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Review database: `npm run prisma:studio`

---

## Contributors

- Jian Carlo E. Amper
- Raylee Emeerson O. Bastian
- Manuelle V. Cruz
- Tetsumi Joshua C. Ruiz

**Research Adviser:** Ms. Michelle Coleen L. Magalong

---

## License

Educational research project - Sta. Elena High School

---

**Good luck with your research! 🚀📚**
