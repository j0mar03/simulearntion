// Socket.IO Event Handler for Multiplayer
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const RoomManager = require('./utils/room-manager');
const AchievementManager = require('./utils/achievement-manager');

const prisma = new PrismaClient();
const roomManager = new RoomManager();
const achievementManager = new AchievementManager(prisma);

function initializeSocketHandler(io) {
  // Middleware to verify JWT token
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Attach user info to socket
      socket.userId = decoded.userId;
      socket.username = decoded.username;
      
      // Load user data
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          username: true,
          avatarConfig: true,
          currentStreak: true
        }
      });
      
      socket.userData = user;
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });
  
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.username} (ID: ${socket.userId})`);
    
    // Join lobby by default
    socket.on('join-lobby', async () => {
      try {
        // Validate and sanitize avatar config
        let avatarConfig = socket.userData.avatarConfig || { body: 'u1', head: 'none' };
        
        // Get user with achievements and admin status for validation
        const user = await prisma.user.findUnique({
          where: { id: socket.userId },
          select: {
            id: true,
            isAdmin: true,
            achievements: {
              select: {
                achievementId: true
              }
            }
          }
        });
        
        if (user) {
          // Validate avatar config
          const body = avatarConfig.body || 'u1';
          const head = avatarConfig.head || 'none';
          
          const bodyUnlocked = achievementManager.isItemUnlocked(body, user.achievements, user.isAdmin);
          const headUnlocked = achievementManager.isItemUnlocked(head, user.achievements, user.isAdmin);
          
          // Reset to defaults if using locked items
          if (!bodyUnlocked) {
            avatarConfig.body = 'u1';
          }
          if (!headUnlocked) {
            avatarConfig.head = 'none';
          }
          
          // Update database if config was changed
          if (avatarConfig.body !== body || avatarConfig.head !== head) {
            await prisma.user.update({
              where: { id: socket.userId },
              data: { avatarConfig }
            });
            socket.userData.avatarConfig = avatarConfig;
          }
        }
        
        const player = {
          socketId: socket.id,
          userId: socket.userId,
          username: socket.username,
          avatarConfig: avatarConfig,
          x: 400,
          y: 300,
          state: 'idle'
        };
        
        roomManager.addPlayer('lobby', socket.id, player);
        socket.join('lobby');
        socket.currentRoom = 'lobby';
        
        // Send current players list to the new player
        const players = roomManager.getPlayers('lobby');
        socket.emit('lobby-state', { players });
        
        // Notify others in lobby
        socket.to('lobby').emit('player-joined', player);
        
        console.log(`👥 ${socket.username} joined lobby`);
      } catch (error) {
        console.error(`Error joining lobby for ${socket.username}:`, error);
        // Still allow join with default avatar
        const player = {
          socketId: socket.id,
          userId: socket.userId,
          username: socket.username,
          avatarConfig: { body: 'u1', head: 'none' },
          x: 400,
          y: 300,
          state: 'idle'
        };
        roomManager.addPlayer('lobby', socket.id, player);
        socket.join('lobby');
        socket.currentRoom = 'lobby';
      }
    });
    
    // Player movement
    socket.on('player-move', (data) => {
      const { x, y, facing } = data;
      
      if (socket.currentRoom) {
        roomManager.updatePlayer(socket.currentRoom, socket.id, { x, y, facing });
        
        // Broadcast to others in the same room
        socket.to(socket.currentRoom).emit('player-moved', {
          socketId: socket.id,
          userId: socket.userId,
          username: socket.username,
          x,
          y,
          facing
        });
      }
    });
    
    // Player state change (animation)
    socket.on('player-state', (data) => {
      const { state } = data;
      
      if (socket.currentRoom) {
        roomManager.updatePlayer(socket.currentRoom, socket.id, { state });
        
        socket.to(socket.currentRoom).emit('player-state-changed', {
          socketId: socket.id,
          userId: socket.userId,
          state
        });
      }
    });
    
    // Enter library
    socket.on('enter-library', async () => {
      if (socket.currentRoom === 'lobby') {
        try {
          // Validate and sanitize avatar config before entering library
          let avatarConfig = socket.userData.avatarConfig || { body: 'u1', head: 'none' };
          
          // Get user with achievements and admin status for validation
          const user = await prisma.user.findUnique({
            where: { id: socket.userId },
            select: {
              id: true,
              isAdmin: true,
              achievements: {
                select: {
                  achievementId: true
                }
              }
            }
          });
          
          if (user) {
            // Validate avatar config
            const body = avatarConfig.body || 'u1';
            const head = avatarConfig.head || 'none';
            
            const bodyUnlocked = achievementManager.isItemUnlocked(body, user.achievements, user.isAdmin);
            const headUnlocked = achievementManager.isItemUnlocked(head, user.achievements, user.isAdmin);
            
            // Reset to defaults if using locked items
            if (!bodyUnlocked) {
              avatarConfig.body = 'u1';
            }
            if (!headUnlocked) {
              avatarConfig.head = 'none';
            }
          }
          
          // Remove from lobby
          roomManager.removePlayer('lobby', socket.id);
          socket.leave('lobby');
          socket.to('lobby').emit('player-left', { socketId: socket.id });
          
          // Add to library
          const player = {
            socketId: socket.id,
            userId: socket.userId,
            username: socket.username,
            avatarConfig: avatarConfig,
            x: 250,
            y: 400,
            state: 'idle'
          };
          
          roomManager.addPlayer('library', socket.id, player);
          socket.join('library');
          socket.currentRoom = 'library';
          
          // Send library state
          const players = roomManager.getPlayers('library');
          socket.emit('library-state', { players });
          
          // Notify others in library
          socket.to('library').emit('player-joined', player);
          
          console.log(`📚 ${socket.username} entered library`);
        } catch (error) {
          console.error(`Error entering library for ${socket.username}:`, error);
          // Still allow entry with default avatar
          roomManager.removePlayer('lobby', socket.id);
          socket.leave('lobby');
          socket.to('lobby').emit('player-left', { socketId: socket.id });
          
          const player = {
            socketId: socket.id,
            userId: socket.userId,
            username: socket.username,
            avatarConfig: { body: 'u1', head: 'none' },
            x: 250,
            y: 400,
            state: 'idle'
          };
          roomManager.addPlayer('library', socket.id, player);
          socket.join('library');
          socket.currentRoom = 'library';
        }
      }
    });
    
    // Exit library (back to lobby)
    socket.on('exit-library', () => {
      if (socket.currentRoom === 'library') {
        // Remove from library
        roomManager.removePlayer('library', socket.id);
        socket.leave('library');
        socket.to('library').emit('player-left', { socketId: socket.id });
        
        // Add back to lobby
        const player = {
          socketId: socket.id,
          userId: socket.userId,
          username: socket.username,
          avatarConfig: socket.userData.avatarConfig,
          x: 480,
          y: 220,
          state: 'idle'
        };
        
        roomManager.addPlayer('lobby', socket.id, player);
        socket.join('lobby');
        socket.currentRoom = 'lobby';
        
        const players = roomManager.getPlayers('lobby');
        socket.emit('lobby-state', { players });
        
        socket.to('lobby').emit('player-joined', player);
        
        console.log(`🚪 ${socket.username} returned to lobby`);
      }
    });
    
    // Chat message
    socket.on('chat-message', (data) => {
      const { message } = data;
      
      if (socket.currentRoom && message && message.trim().length > 0) {
        const chatMessage = {
          userId: socket.userId,
          username: socket.username,
          message: message.trim().substring(0, 200), // Limit message length
          timestamp: Date.now()
        };
        
        // Broadcast to everyone in the room including sender
        io.to(socket.currentRoom).emit('chat-message', chatMessage);
        
        console.log(`💬 ${socket.username}: ${message.substring(0, 50)}`);
      }
    });
    
    // Topic selection in library
    socket.on('study-topic', (data) => {
      const { topic } = data;
      
      if (socket.currentRoom === 'library') {
        roomManager.updatePlayer('library', socket.id, { studyingTopic: topic });
        
        // Broadcast to others
        socket.to('library').emit('player-studying', {
          socketId: socket.id,
          username: socket.username,
          topic
        });
        
        console.log(`📖 ${socket.username} studying ${topic}`);
      }
    });
    
    // Start quiz
    socket.on('start-quiz', () => {
      // Quiz is individual, no room change needed
      // Just notify for potential leaderboard updates
      console.log(`❓ ${socket.username} started quiz`);
    });
    
    // Quiz answer submitted (for real-time leaderboard)
    socket.on('quiz-answer', (data) => {
      const { questionIndex, isCorrect, score } = data;
      
      // Broadcast to all for live leaderboard updates
      io.emit('player-quiz-progress', {
        userId: socket.userId,
        username: socket.username,
        score,
        timestamp: Date.now()
      });
    });
    
    // Avatar customization changed
    socket.on('avatar-changed', async (data) => {
      const { avatarConfig } = data;
      
      // Validate avatarConfig structure
      if (!avatarConfig || typeof avatarConfig !== 'object') {
        console.warn(`Invalid avatar config from ${socket.username}`);
        return;
      }
      
      try {
        // Get user with achievements and admin status for validation
        const user = await prisma.user.findUnique({
          where: { id: socket.userId },
          select: {
            id: true,
            isAdmin: true,
            achievements: {
              select: {
                achievementId: true
              }
            }
          }
        });
        
        if (!user) {
          console.warn(`User not found for avatar change: ${socket.userId}`);
          return;
        }
        
        // Validate that user has access to the items they're trying to use
        const body = avatarConfig.body || 'u1';
        const head = avatarConfig.head || 'none';
        
        // Check body item unlock status
        const bodyUnlocked = achievementManager.isItemUnlocked(body, user.achievements, user.isAdmin);
        if (!bodyUnlocked) {
          console.warn(`User ${socket.username} tried to use locked body item: ${body}`);
          // Revert to default if trying to use locked item
          avatarConfig.body = 'u1';
        }
        
        // Check head item unlock status
        const headUnlocked = achievementManager.isItemUnlocked(head, user.achievements, user.isAdmin);
        if (!headUnlocked) {
          console.warn(`User ${socket.username} tried to use locked head item: ${head}`);
          // Revert to default if trying to use locked item
          avatarConfig.head = 'none';
        }
        
        // Update user's avatar config in database
        await prisma.user.update({
          where: { id: socket.userId },
          data: { avatarConfig }
        });
        
        // Update socket userData with validated config
        socket.userData.avatarConfig = avatarConfig;
        
        if (socket.currentRoom) {
          roomManager.updatePlayer(socket.currentRoom, socket.id, { avatarConfig });
          
          // Broadcast to others in the room
          socket.to(socket.currentRoom).emit('player-avatar-changed', {
            socketId: socket.id,
            userId: socket.userId,
            avatarConfig
          });
          
          console.log(`🎨 ${socket.username} changed avatar to ${body}/${head}`);
        }
      } catch (error) {
        console.error(`Error validating avatar change for ${socket.username}:`, error);
        // Don't update avatar if validation fails
      }
    });
    
    // Achievement earned
    socket.on('achievement-earned', (data) => {
      const { achievementId, achievementName } = data;
      
      // Broadcast to all players for notification
      io.emit('player-achievement', {
        userId: socket.userId,
        username: socket.username,
        achievementId,
        achievementName,
        timestamp: Date.now()
      });
      
      console.log(`🏆 ${socket.username} earned: ${achievementName}`);
    });
    
    // Disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.username}`);
      
      if (socket.currentRoom) {
        roomManager.removePlayer(socket.currentRoom, socket.id);
        socket.to(socket.currentRoom).emit('player-left', { 
          socketId: socket.id,
          userId: socket.userId,
          username: socket.username
        });
      }
    });
  });
  
  console.log('🎮 Socket.IO multiplayer handler initialized');
}

module.exports = initializeSocketHandler;
