// Lobby Scene - Multiplayer Lobby
class LobbyScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LobbyScene' });
  }
  
  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Background - Use real lobby image from "Compilations of gokgok simulator 2000"
    const lobbyBg = this.add.image(0, 0, 'lobby-bg').setOrigin(0);
    lobbyBg.setDisplaySize(width, height);
    
    // Title (optional - can be removed if background has title)
    this.add.text(width / 2, 30, 'Main Lobby', {
      fontSize: '32px',
      fill: '#ffffff',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setDepth(10);
    
    // Library door (top right) - using real position from original game
    const libraryDoorHitbox = this.add.rectangle(700, 100, 100, 100, 0x8B4513, 0);
    this.add.text(700, 40, '🚪 Library', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: { x: 5, y: 3 },
      align: 'center'
    }).setOrigin(0.5).setDepth(10);
    
    // Avatar customization button - using real asset (smaller)
    try {
      const avatarBtn = this.add.image(50, 150, 'avatar-btn');
      avatarBtn.setScale(0.15); // Much smaller size
      avatarBtn.setInteractive({ useHandCursor: true });
      avatarBtn.on('pointerdown', () => {
        try {
          // Save current player position before going to customization
          if (this.player && this.player.sprite) {
            const savedPosition = {
              x: this.player.sprite.x,
              y: this.player.sprite.y,
              facing: this.player.facing
            };
            // Store in game.userData so it persists across scenes
            if (this.game.userData) {
              this.game.userData.savedPosition = savedPosition;
            }
            // Also store in scene data as backup
            this.data.set('savedPosition', savedPosition);
            console.log('Saved player position before customization:', savedPosition);
          }
          this.scene.switch('CustomScene');
        } catch (error) {
          console.error('Error starting CustomScene:', error);
          // Fallback to start if switch fails
          this.scene.start('CustomScene');
        }
      });
      avatarBtn.setDepth(10);
    } catch (error) {
      console.error('Error creating avatar button:', error);
      // Create fallback button
      const avatarBtn = this.add.rectangle(50, 150, 180, 40, 0x4a90e2);
      this.add.text(50, 150, '👤 Customize', {
        fontSize: '14px',
        fill: '#ffffff'
      }).setOrigin(0.5).setDepth(11);
      avatarBtn.setInteractive({ useHandCursor: true });
      avatarBtn.on('pointerdown', () => {
        try {
          this.scene.start('CustomScene');
        } catch (error) {
          console.error('Error starting CustomScene:', error);
        }
      });
      avatarBtn.setDepth(10);
    }
    
    // Achievements button
    try {
      const achieveBtn = this.add.rectangle(50, 250, 180, 40, 0xf5576c);
      this.add.text(50, 250, '🏆 Achievements', {
        fontSize: '14px',
        fill: '#ffffff'
      }).setOrigin(0.5).setDepth(11);
      achieveBtn.setInteractive({ useHandCursor: true });
      achieveBtn.on('pointerdown', () => {
        try {
          this.scene.start('AchieveScene');
        } catch (error) {
          console.error('Error starting AchieveScene:', error);
        }
      });
      achieveBtn.setDepth(10);
    } catch (error) {
      console.error('Error creating achievements button:', error);
    }
    
    // Logout button
    const logoutBtn = this.add.rectangle(50, 350, 180, 40, 0xff4444);
    this.add.text(50, 350, '🚪 Logout', {
      fontSize: '14px',
      fill: '#ffffff'
    }).setOrigin(0.5).setDepth(11);
    logoutBtn.setInteractive({ useHandCursor: true });
    logoutBtn.on('pointerdown', () => {
      if (typeof window.logout === 'function') {
        window.logout();
      } else {
        // Fallback logout
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.socketManager) {
          window.socketManager.disconnect();
        }
        window.location.reload();
      }
    });
    logoutBtn.setDepth(10);
    
    // Instructions
    this.add.text(width / 2, height - 30, 'Arrow Keys: Move | Walk to Library Door (top-right) | Press T to chat', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
    
    // Create local player with proper error handling
    try {
      // Get userData with fallbacks
      let userData = this.game.userData;
      if (!userData) {
        // Try to get from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          userData = JSON.parse(storedUser);
          this.game.userData = userData;
        } else {
          // Create default userData
          userData = {
            username: 'Player',
            avatarConfig: { body: 'u1', head: 'none' },
            unlockedItems: {},
            isAdmin: false
          };
          this.game.userData = userData;
        }
      }
      
      // Ensure avatarConfig exists
      if (!userData.avatarConfig) {
        userData.avatarConfig = { body: 'u1', head: 'none' };
      }
      
      // Ensure username exists
      if (!userData.username) {
        userData.username = 'Player';
      }
      
      console.log('Creating player with userData:', userData);
      
      // Restore saved position if returning from customization, otherwise use default
      let playerX = 400;
      let playerY = 300;
      
      // Check if we have a saved position from before going to customization
      // Try game.userData first (more persistent)
      if (this.game.userData && this.game.userData.savedPosition) {
        playerX = this.game.userData.savedPosition.x;
        playerY = this.game.userData.savedPosition.y;
        console.log('Restoring player position from userData:', playerX, playerY);
        // Clear saved position after using it
        delete this.game.userData.savedPosition;
      }
      // Fallback to scene data
      else if (this.data.get('savedPosition')) {
        const savedPos = this.data.get('savedPosition');
        playerX = savedPos.x;
        playerY = savedPos.y;
        console.log('Restoring player position from scene data:', playerX, playerY);
        this.data.remove('savedPosition');
      }
      
      // Create player at saved position or default
      this.player = new Player(this, playerX, playerY, userData.username, userData.avatarConfig);
      
      if (!this.player || !this.player.sprite) {
        throw new Error('Player creation failed');
      }
      
      console.log('Player created successfully');
    } catch (error) {
      console.error('Error creating player:', error);
      // Create a minimal player as fallback
      try {
        this.player = new Player(this, 400, 300, 'Player', { body: 'u1', head: 'none' });
      } catch (fallbackError) {
        console.error('Fallback player creation also failed:', fallbackError);
        // Don't create player - scene will still work for buttons
        this.player = null;
      }
    }
    
    // Other players map
    this.otherPlayers = new Map();
    
    // Register socket listeners (with error handling)
    try {
      if (socketManager && socketManager.registerSceneListeners) {
        socketManager.registerSceneListeners(this);
      }
    } catch (error) {
      console.error('Error registering socket listeners:', error);
    }
    
    // Join lobby (with error handling)
    try {
      if (socketManager && socketManager.joinLobby) {
        socketManager.joinLobby();
      }
    } catch (error) {
      console.error('Error joining lobby:', error);
    }
    
    // Check for library door collision
    this.libraryDoorRect = { x: 660, y: 50, width: 80, height: 100 };
    this.doorCooldown = 0;
  }
  
  update(time, delta) {
    try {
      if (this.player && this.player.sprite) {
        this.player.update();
        
        // Check library door collision
        if (this.doorCooldown <= 0) {
          const px = this.player.sprite.x;
          const py = this.player.sprite.y;
          const door = this.libraryDoorRect;
          
          if (px > door.x && px < door.x + door.width &&
              py > door.y && py < door.y + door.height) {
            console.log('Entering library...');
            try {
              if (socketManager && socketManager.enterLibrary) {
                socketManager.enterLibrary();
              }
            } catch (error) {
              console.error('Error entering library:', error);
            }
            this.scene.start('LibraryScene');
            this.doorCooldown = 1000;
          }
        } else {
          this.doorCooldown -= delta;
        }
      }
      
      // Update other players
      this.otherPlayers.forEach(otherPlayer => {
        try {
          if (otherPlayer && otherPlayer.update) {
            otherPlayer.update();
          }
        } catch (error) {
          console.error('Error updating other player:', error);
        }
      });
    } catch (error) {
      console.error('Error in LobbyScene update:', error);
    }
  }
  
  // Socket event handlers
  onLobbyState(data) {
    console.log('Lobby state received:', data.players.length, 'players');
    
    // Clear existing other players
    this.otherPlayers.forEach(p => {
      try {
        p.destroy();
      } catch (error) {
        console.error('Error destroying other player:', error);
      }
    });
    this.otherPlayers.clear();
    
    // Create other players
    data.players.forEach(playerData => {
      if (playerData.userId !== this.game.userData.id) {
        try {
          const otherPlayer = new OtherPlayer(this, playerData);
          this.otherPlayers.set(playerData.socketId, otherPlayer);
          
          // Ensure sprite is visible and active
          if (otherPlayer.sprite) {
            otherPlayer.sprite.setVisible(true);
            otherPlayer.sprite.setActive(true);
            otherPlayer.sprite.setFrame(0);
          }
          
          console.log(`Created other player from lobby state: ${playerData.username}`);
        } catch (error) {
          console.error(`Error creating other player ${playerData.username}:`, error);
        }
      }
    });
    
    // Update player list UI
    if (window.playerList) {
      window.playerList.updatePlayers(data.players);
    }
  }
  
  onPlayerJoined(playerData) {
    console.log('Player joined:', playerData.username, playerData);
    
    if (playerData.userId !== this.game.userData.id) {
      // Check if player already exists (avoid duplicates)
      if (!this.otherPlayers.has(playerData.socketId)) {
        const otherPlayer = new OtherPlayer(this, playerData);
        this.otherPlayers.set(playerData.socketId, otherPlayer);
        
        // Ensure sprite is visible
        if (otherPlayer.sprite) {
          otherPlayer.sprite.setVisible(true);
          otherPlayer.sprite.setActive(true);
          otherPlayer.sprite.setFrame(0);
        }
        
        if (window.playerList) {
          window.playerList.addPlayer(playerData);
        }
        
        console.log(`Created other player: ${playerData.username} at (${playerData.x}, ${playerData.y})`);
      } else {
        console.log(`Player ${playerData.username} already exists, updating instead`);
        // Update existing player
        const existingPlayer = this.otherPlayers.get(playerData.socketId);
        if (existingPlayer && playerData.avatarConfig) {
          existingPlayer.updateAvatar(playerData.avatarConfig);
        }
      }
    }
  }
  
  onPlayerLeft(data) {
    console.log('Player left:', data.socketId);
    
    const otherPlayer = this.otherPlayers.get(data.socketId);
    if (otherPlayer) {
      otherPlayer.destroy();
      this.otherPlayers.delete(data.socketId);
    }
    
    if (window.playerList) {
      window.playerList.removePlayer(data.socketId);
    }
  }
  
  onPlayerMoved(data) {
    // Try to find player by socketId first
    let otherPlayer = this.otherPlayers.get(data.socketId);
    
    // If not found by socketId, try by userId
    if (!otherPlayer && data.userId) {
      for (const [socketId, player] of this.otherPlayers.entries()) {
        if (player.userId === data.userId) {
          otherPlayer = player;
          break;
        }
      }
    }
    
    if (otherPlayer) {
      // Ensure position values are valid
      if (data.x !== undefined && data.y !== undefined && 
          !isNaN(data.x) && !isNaN(data.y)) {
        otherPlayer.setTargetPosition(data.x, data.y, data.facing);
      }
    } else {
      // Try to create player if they don't exist (might have missed join event)
      if (data.userId && data.userId !== this.game.userData.id) {
        const playerData = {
          socketId: data.socketId,
          userId: data.userId,
          username: data.username,
          avatarConfig: { body: 'u1', head: 'none' }, // Default
          x: data.x !== undefined && !isNaN(data.x) ? data.x : 400,
          y: data.y !== undefined && !isNaN(data.y) ? data.y : 300,
          facing: data.facing || 'right'
        };
        try {
          const newPlayer = new OtherPlayer(this, playerData);
          this.otherPlayers.set(data.socketId || data.userId, newPlayer);
          
          // Ensure sprite is visible
          if (newPlayer.sprite) {
            newPlayer.sprite.setVisible(true);
            newPlayer.sprite.setActive(true);
            newPlayer.sprite.setFrame(0);
          }
        } catch (error) {
          console.error(`Error creating missing player:`, error);
        }
      }
    }
  }
  
  onPlayerAvatarChanged(data) {
    // Update other player's avatar
    console.log('Player changed avatar:', data.username, data.avatarConfig);
    
    const otherPlayer = this.otherPlayers.get(data.socketId);
    if (otherPlayer && data.avatarConfig) {
      // Update the other player's avatar
      otherPlayer.updateAvatar(data.avatarConfig);
    } else if (data.userId) {
      // Try to find by userId if socketId doesn't work
      for (const [socketId, player] of this.otherPlayers.entries()) {
        if (player.userId === data.userId && data.avatarConfig) {
          player.updateAvatar(data.avatarConfig);
          break;
        }
      }
    }
  }
  
  shutdown() {
    // Clean up
    if (this.player) {
      this.player.destroy();
    }
    this.otherPlayers.forEach(p => p.destroy());
    this.otherPlayers.clear();
    
    socketManager.removeSceneListeners();
  }
}
