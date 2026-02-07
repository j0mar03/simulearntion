// Main Express Server for SimuLearntion Multiplayer
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const analyticsRoutes = require('./routes/analytics');
const leaderboardRoutes = require('./routes/leaderboard');
const quizRoutes = require('./routes/quiz');

// Import socket handler
const initializeSocketHandler = require('./socket-handler');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:8080',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development, enable in production
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:8080',
  credentials: true
}));

// Serve constants.js directly WITHOUT any middleware (BEFORE compression!)
const fs = require('fs');
app.get('/shared/constants.js', (req, res) => {
  const filePath = path.join(__dirname, '../shared/constants.js');
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error loading constants.js:', err);
      res.status(500).send('Error loading constants');
    } else {
      res.send(data);
    }
  });
});

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (client)
app.use(express.static(path.join(__dirname, '../client')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/quiz', quizRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Initialize Socket.IO handlers
initializeSocketHandler(io);

// Catch-all route - serve index.html for client-side routing
// IMPORTANT: This must come AFTER all static files and API routes
app.get('*', (req, res) => {
  // Only serve index.html for HTML requests, not for static assets
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, '../client/index.html'));
  } else {
    res.status(404).send('Not found');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 SimuLearntion Multiplayer Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:8080'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };
