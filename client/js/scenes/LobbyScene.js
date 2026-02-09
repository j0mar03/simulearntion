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

    // Profile button (top-left)
    const profileBtn = this.add.rectangle(70, 40, 110, 34, 0x2c3e50);
    profileBtn.setInteractive({ useHandCursor: true });
    this.add.text(70, 40, 'Profile', {
      fontSize: '14px',
      fill: '#ffffff'
    }).setOrigin(0.5).setDepth(11);
    profileBtn.setDepth(10);
    profileBtn.on('pointerdown', () => this.toggleProfilePanel());

    // Leaderboard button (next to profile)
    const leaderboardBtn = this.add.rectangle(190, 40, 120, 34, 0x6b21a8);
    leaderboardBtn.setInteractive({ useHandCursor: true });
    this.add.text(190, 40, 'Leaderboard', {
      fontSize: '14px',
      fill: '#ffffff'
    }).setOrigin(0.5).setDepth(11);
    leaderboardBtn.setDepth(10);
    leaderboardBtn.on('pointerdown', () => this.toggleLeaderboardPanel());
    
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

    // Tutorial button (replay onboarding)
    try {
      const tutorialBtn = this.add.rectangle(50, 300, 180, 40, 0x4a90e2);
      this.add.text(50, 300, '📘 Tutorial', {
        fontSize: '14px',
        fill: '#ffffff'
      }).setOrigin(0.5).setDepth(11);
      tutorialBtn.setInteractive({ useHandCursor: true });
      tutorialBtn.on('pointerdown', () => {
        try {
          this.scene.start('OnboardingScene1');
        } catch (error) {
          console.error('Error starting OnboardingScene1:', error);
        }
      });
      tutorialBtn.setDepth(10);
    } catch (error) {
      console.error('Error creating tutorial button:', error);
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

    // Chef Chiggy NPC (lecturer)
    this.chiggy = this.add.image(width * 0.7 - 96, 140, 'chiggy-avatar').setScale(0.12);
    this.chiggy.setDepth(9);
    this.add.text(width * 0.7 - 96, 95, 'Chef Chiggy', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      padding: { x: 6, y: 2 }
    }).setOrigin(0.5).setDepth(10);
    this.chiggy.setInteractive({ useHandCursor: true });
    this.chiggy.on('pointerdown', () => this.openChiggyDialog());
    this.chiggyDialogCooldown = 0;
    this.createChiggyDialog();
    // Enable physics so the player collides with Chiggy
    this.physics.add.existing(this.chiggy, true);
    const chiggyBodyW = this.chiggy.width * this.chiggy.scaleX * 0.6;
    const chiggyBodyH = this.chiggy.height * this.chiggy.scaleY * 0.6;
    this.chiggy.body.setSize(chiggyBodyW, chiggyBodyH, true);
    
    // Instructions
    this.add.text(width / 2, height - 30, 'Arrow Keys: Move | Walk to Library Door (top-right) | Press T to chat', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // Leaderboard panel
    this.createLeaderboardPanel();
    this.leaderboardPanel.setVisible(false);
    this.leaderboardTimer = this.time.addEvent({
      delay: 60000,
      loop: true,
      callback: () => this.refreshLeaderboard()
    });

    // Profile panel (hidden by default)
    this.createProfilePanel();
    
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
      const playerTitle = userData.currentTitle || userData.title || (window.DEFAULT_PLAYER_TITLE || 'Rookie');
      this.player = new Player(this, playerX, playerY, userData.username, userData.avatarConfig, playerTitle);
      
      if (!this.player || !this.player.sprite) {
        throw new Error('Player creation failed');
      }
      
      console.log('Player created successfully');
    } catch (error) {
      console.error('Error creating player:', error);
      // Create a minimal player as fallback
      try {
        const fallbackTitle = window.DEFAULT_PLAYER_TITLE || 'Rookie';
        this.player = new Player(this, 400, 300, 'Player', { body: 'u1', head: 'none' }, fallbackTitle);
      } catch (fallbackError) {
        console.error('Fallback player creation also failed:', fallbackError);
        // Don't create player - scene will still work for buttons
        this.player = null;
      }
    }

    // Collide player with Chiggy NPC
    if (this.player && this.player.sprite && this.chiggy && this.chiggy.body) {
      this.physics.add.collider(this.player.sprite, this.chiggy);
    }
    
    // Other players map
    this.otherPlayers = new Map();

    // Player interaction popup
    this.createPlayerPopup();
    
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

        // Chef Chiggy proximity check
        if (this.chiggyDialogCooldown > 0) {
          this.chiggyDialogCooldown -= delta;
        }
        const dist = Phaser.Math.Distance.Between(
          this.player.sprite.x,
          this.player.sprite.y,
          this.chiggy.x,
          this.chiggy.y
        );
        if (this.chiggyDialogVisible && dist > 110) {
          this.closeChiggyDialog();
        } else if (!this.chiggyDialogVisible && this.chiggyDialogCooldown <= 0 && dist <= 80) {
          this.openChiggyDialog();
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

  createPlayerPopup() {
    const width = this.cameras.main.width;
    this.playerPopup = this.add.container(width / 2, 120);
    this.playerPopup.setDepth(30);
    const bg = this.add.rectangle(0, 0, 220, 90, 0x000000, 0.75);
    bg.setStrokeStyle(2, 0xffffff, 0.2);
    this.playerPopupName = this.add.text(0, -20, 'Player', {
      fontSize: '14px',
      fill: '#ffffff'
    }).setOrigin(0.5);
    const msgBtn = this.add.rectangle(0, 20, 120, 30, 0x667eea);
    msgBtn.setInteractive({ useHandCursor: true });
    const msgText = this.add.text(0, 20, 'Message', {
      fontSize: '14px',
      fill: '#ffffff'
    }).setOrigin(0.5);
    const closeBtn = this.add.rectangle(90, -30, 20, 20, 0xff4444);
    closeBtn.setInteractive({ useHandCursor: true });
    const closeText = this.add.text(90, -30, 'X', {
      fontSize: '10px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    msgBtn.on('pointerdown', () => {
      if (window.chatBox && window.chatBox.input && this.playerPopupUser) {
        window.chatBox.input.value = `/pm ${this.playerPopupUser} `;
        window.chatBox.input.focus();
      }
      this.playerPopup.setVisible(false);
    });
    closeBtn.on('pointerdown', () => this.playerPopup.setVisible(false));

    this.playerPopup.add([bg, this.playerPopupName, msgBtn, msgText, closeBtn, closeText]);
    this.playerPopup.setVisible(false);
  }

  onOtherPlayerClicked(otherPlayer) {
    if (!otherPlayer || !otherPlayer.username) return;
    this.playerPopupUser = otherPlayer.username;
    this.playerPopupName.setText(otherPlayer.username);
    this.playerPopup.setVisible(true);
  }

  createProfilePanel() {
    const panelX = 170;
    const panelY = 150;
    this.profilePanel = this.add.container(panelX, panelY);
    this.profilePanel.setDepth(20);

    const panelBg = this.add.image(0, 0, 'profile-ui');
    panelBg.setScale(0.35);

    this.profileNameText = this.add.text(0, -106, 'Player', {
      fontSize: '14px',
      fill: '#1f2d3d'
    }).setOrigin(0.5);

    this.profileProgressText = this.add.text(0, -36, '', {
      fontSize: '13px',
      fill: '#1f2d3d'
    }).setOrigin(0.5);

    this.profileTopicHeaderText = this.add.text(0, 12, 'Topics: 0/0', {
      fontSize: '12px',
      fill: '#1f2d3d'
    }).setOrigin(0.5);

    const barWidth = 200;
    this.profileTopicBarBg = this.add.rectangle(0, 26, barWidth, 8, 0xcccccc);
    this.profileTopicBarBg.setOrigin(0.5);
    this.profileTopicBarFill = this.add.rectangle(-barWidth / 2, 26, 0, 8, 0x667eea);
    this.profileTopicBarFill.setOrigin(0, 0.5);

    this.profileTopicText = this.add.text(0, 46, 'Topics: 0/0', {
      fontSize: '12px',
      fill: '#1f2d3d',
      align: 'center',
      wordWrap: { width: 260 }
    }).setOrigin(0.5);

    this.profileAchievementIcon = this.add.image(100, -100, 'ach-trailblazer');
    this.profileAchievementIcon.setScale(0.1);
    this.profileAchievementIcon.setVisible(false);

    const closeBtn = this.add.rectangle(-120, 138, 24, 24, 0xff4444);
    closeBtn.setInteractive({ useHandCursor: true });
    const closeText = this.add.text(-120, 138, 'X', {
      fontSize: '12px',
      fill: '#ffffff'
    }).setOrigin(0.5);
    closeBtn.on('pointerdown', () => {
      this.profilePanel.setVisible(false);
    });

    this.profilePanel.add([
      panelBg,
      this.profileNameText,
      this.profileProgressText,
      this.profileTopicHeaderText,
      this.profileTopicBarBg,
      this.profileTopicBarFill,
      this.profileTopicText,
      this.profileAchievementIcon,
      closeBtn,
      closeText
    ]);
    this.profilePanel.setVisible(false);
  }

  async updateProfilePanel() {
    if (!this.profilePanel) return;
    const userData = this.game && this.game.userData ? this.game.userData : (JSON.parse(localStorage.getItem('user') || '{}'));
    const username = userData.username || 'Player';
    let latestScore = null;
    let latestTotal = null;
    let bestScore = null;
    let bestTotal = null;

    if (this.profileNameText) {
      this.profileNameText.setText(username);
    }
    if (this.profileProgressText) {
      this.profileProgressText.setText('');
    }

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch('/api/profile/quiz-history', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          const history = Array.isArray(data.history) ? data.history : [];
          history.forEach((session) => {
            const attempts = Array.isArray(session.quizAttempts) ? session.quizAttempts : [];
            if (attempts.length === 0) return;
            const correct = attempts.filter(a => a.isCorrect).length;
            const total = attempts.length;
            if (latestScore === null) {
              latestScore = correct;
              latestTotal = total;
            }
            if (bestScore === null || correct > bestScore) {
              bestScore = correct;
              bestTotal = total;
            }
          });
        }
      } catch (error) {
        console.warn('Failed to fetch quiz history:', error);
      }
    }

    if (this.profileProgressText) {
      this.profileProgressText.setText('');
    }

    // Topic progress (local stats)
    const topicStats = userData.quizTopicStats || {};
    const topics = (window.QUIZ_QUESTIONS || []).map(q => q.topic);
    const uniqueTopics = Array.from(new Set(topics));
    const totalTopics = uniqueTopics.length;
    let completedTopics = 0;
    const lines = [];
    uniqueTopics.forEach((topic) => {
      const stat = topicStats[topic];
      if (stat && stat.best >= (stat.total || 5)) {
        completedTopics += 1;
      }
      if (stat) {
        lines.push(`${topic}: L ${stat.latest}/${stat.total} | B ${stat.best}/${stat.total}`);
      } else {
        lines.push(`${topic}: L --/-- | B --/--`);
      }
    });

    if (this.profileTopicHeaderText) {
      this.profileTopicHeaderText.setText(`Topics: ${completedTopics}/${totalTopics}`);
    }
    if (this.profileTopicBarFill) {
      const ratio = totalTopics > 0 ? completedTopics / totalTopics : 0;
      this.profileTopicBarFill.setDisplaySize(200 * ratio, 8);
    }
    if (this.profileTopicText) {
      this.profileTopicText.setText(lines.join('\n'));
    }

    if (this.profileAchievementIcon) {
      let iconKey = null;
      const lastId = userData.lastAchievementId;
      if (lastId && window.ACHIEVEMENTS && window.ACHIEVEMENTS[lastId]) {
        iconKey = window.ACHIEVEMENTS[lastId].icon;
      } else if (Array.isArray(userData.achievements) && userData.achievements.includes('trailblazer')) {
        iconKey = 'ach-trailblazer';
      }
      if (iconKey && this.textures && this.textures.exists(iconKey)) {
        this.profileAchievementIcon.setTexture(iconKey);
        this.profileAchievementIcon.setVisible(true);
      } else {
        this.profileAchievementIcon.setVisible(false);
      }
    }
  }

  toggleProfilePanel() {
    if (!this.profilePanel) return;
    const nextVisible = !this.profilePanel.visible;
    this.profilePanel.setVisible(nextVisible);
    if (nextVisible) {
      this.updateProfilePanel();
    }
  }

  createLeaderboardPanel() {
    const width = this.cameras.main.width;
    const panelX = width - 170;
    const panelY = 160;
    this.leaderboardPanel = this.add.container(panelX, panelY);
    this.leaderboardPanel.setDepth(15);

    const bg = this.add.rectangle(0, 0, 300, 260, 0x000000, 0.65);
    bg.setStrokeStyle(2, 0xffffff, 0.15);
    const title = this.add.text(0, -110, 'Global Achievements', {
      fontSize: '16px',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    const subtitle = this.add.text(0, -90, 'All-time', {
      fontSize: '12px',
      fill: '#cbd5e1'
    }).setOrigin(0.5);

    const closeBtn = this.add.rectangle(130, -120, 22, 22, 0xff4444);
    closeBtn.setInteractive({ useHandCursor: true });
    const closeText = this.add.text(130, -120, 'X', {
      fontSize: '11px',
      fill: '#ffffff'
    }).setOrigin(0.5);
    closeBtn.on('pointerdown', () => this.leaderboardPanel.setVisible(false));

    this.leaderboardStatusText = this.add.text(0, -60, 'Loading...', {
      fontSize: '12px',
      fill: '#f8fafc'
    }).setOrigin(0.5);

    this.leaderboardEntryTexts = [];
    for (let i = 0; i < 8; i++) {
      const y = -35 + i * 24;
      const entry = this.add.text(-130, y, '', {
        fontSize: '12px',
        fill: '#ffffff'
      }).setOrigin(0, 0.5);
      this.leaderboardEntryTexts.push(entry);
    }

    this.leaderboardPanel.add([
      bg,
      title,
      subtitle,
      closeBtn,
      closeText,
      this.leaderboardStatusText,
      ...this.leaderboardEntryTexts
    ]);
  }

  toggleLeaderboardPanel() {
    if (!this.leaderboardPanel) return;
    const nextVisible = !this.leaderboardPanel.visible;
    this.leaderboardPanel.setVisible(nextVisible);
    if (nextVisible) {
      this.refreshLeaderboard();
    }
  }

  async refreshLeaderboard() {
    if (!this.leaderboardStatusText || !this.leaderboardEntryTexts) return;
    this.leaderboardStatusText.setText('Loading...');
    this.leaderboardEntryTexts.forEach(t => t.setText(''));
    try {
      const response = await fetch('/api/leaderboard/achievements?limit=8');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      const rows = Array.isArray(data.leaderboard) ? data.leaderboard : [];
      if (rows.length === 0) {
        this.leaderboardStatusText.setText('No data yet.');
        return;
      }
      this.leaderboardStatusText.setText('');
      rows.slice(0, 8).forEach((row, index) => {
        const rank = index + 1;
        const name = row.username || 'Unknown';
        const count = row.achievementCount || 0;
        const line = `${rank}. ${name} - ${count}`;
        if (this.leaderboardEntryTexts[index]) {
          this.leaderboardEntryTexts[index].setText(line);
        }
      });
    } catch (error) {
      console.warn('Failed to load leaderboard:', error);
      this.leaderboardStatusText.setText('Leaderboard unavailable');
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

  onPlayerLevelUpdated(data) {
    if (data.userId && this.player && this.game && this.game.userData && data.userId === this.game.userData.id) {
      if (this.player.setLevel) {
        this.player.setLevel(data.level);
      }
      return;
    }

    let otherPlayer = data.socketId ? this.otherPlayers.get(data.socketId) : null;
    if (!otherPlayer && data.userId) {
      for (const p of this.otherPlayers.values()) {
        if (p.userId === data.userId) {
          otherPlayer = p;
          break;
        }
      }
    }
    if (otherPlayer && otherPlayer.setLevel) {
      otherPlayer.setLevel(data.level);
    }
  }

  createChiggyDialog() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const dialogWidth = width - 80;
    const dialogHeight = 260;

    this.chiggyDialog = this.add.container(width / 2, height * 0.55);
    this.chiggyDialog.setDepth(20);

    const dialogBg = this.add.graphics();
    dialogBg.fillStyle(0x000000, 0.75);
    dialogBg.lineStyle(2, 0xffffff, 0.2);
    dialogBg.fillRoundedRect(-dialogWidth / 2, -dialogHeight / 2, dialogWidth, dialogHeight, 16);
    dialogBg.strokeRoundedRect(-dialogWidth / 2, -dialogHeight / 2, dialogWidth, dialogHeight, 16);
    const tailX = Phaser.Math.Clamp(this.chiggy.x - (width / 2), -dialogWidth / 2 + 60, dialogWidth / 2 - 60);
    dialogBg.fillTriangle(tailX - 40, -dialogHeight / 2 + 10, tailX, -dialogHeight / 2 - 22, tailX + 40, -dialogHeight / 2 + 10);
    dialogBg.strokeTriangle(tailX - 40, -dialogHeight / 2 + 10, tailX, -dialogHeight / 2 - 22, tailX + 40, -dialogHeight / 2 + 10);

    this.chiggyDialogTitle = this.add.text(0, -100, 'Chef Chiggy', {
      fontSize: '18px',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.chiggyDialogBody = this.add.text(0, -30, '', {
      fontSize: '16px',
      fontFamily: 'monospace',
      fill: '#ffffff',
      align: 'center',
      wordWrap: { width: dialogWidth - 120 }
    }).setOrigin(0.5);

    this.chiggyButtons = [];
    for (let i = 0; i < 6; i++) {
      const btn = this.add.rectangle(0, 0, 230, 40, 0x667eea);
      btn.setStrokeStyle(2, 0xffffff, 0.35);
      btn.setInteractive({ useHandCursor: true });
      const txt = this.add.text(0, 0, '', {
        fontSize: '14px',
        fill: '#ffffff',
        align: 'center',
        wordWrap: { width: 210, useAdvancedWrap: true }
      }).setOrigin(0.5);
      this.chiggyButtons.push({ btn, txt });
    }

    this.chiggyDialog.add([
      dialogBg,
      this.chiggyDialogTitle,
      this.chiggyDialogBody,
      ...this.chiggyButtons.flatMap(b => [b.btn, b.txt])
    ]);

    this.chiggyDialog.setVisible(false);
    this.chiggyDialogVisible = false;
  }

  openChiggyDialog() {
    if (!this.chiggyDialog || this.chiggyDialogVisible) return;
    this.chiggyDialogVisible = true;
    this.chiggyDialog.setVisible(true);
    this.showChiggyOptions();
  }

  closeChiggyDialog() {
    if (!this.chiggyDialog) return;
    this.chiggyDialogVisible = false;
    this.chiggyDialog.setVisible(false);
    this.chiggyDialogCooldown = 700;
    if (this.chiggyTextTimer) {
      this.chiggyTextTimer.remove(false);
      this.chiggyTextTimer = null;
    }
  }

  setChiggyButtons(defs) {
    const startY = 30;
    const stepY = 36;
    this.chiggyButtons.forEach((entry, index) => {
      if (defs[index]) {
        const def = defs[index];
        entry.btn.setVisible(true);
        entry.txt.setVisible(true);
        const y = startY + (index * stepY);
        entry.btn.setPosition(0, y);
        entry.txt.setPosition(0, y);
        entry.txt.setText(def.label);
        entry.btn.off('pointerdown');
        entry.btn.on('pointerdown', def.onClick);
      } else {
        entry.btn.setVisible(false);
        entry.txt.setVisible(false);
        entry.btn.off('pointerdown');
      }
    });
  }

  setChiggyButtonsGrid(defs) {
    const cols = 2;
    const startY = 20;
    const rowStep = 38;
    const colStep = 190;
    this.chiggyButtons.forEach((entry, index) => {
      if (defs[index]) {
        const def = defs[index];
        entry.btn.setVisible(true);
        entry.txt.setVisible(true);
        const row = Math.floor(index / cols);
        const col = index % cols;
        const x = col === 0 ? -colStep / 2 : colStep / 2;
        const y = startY + (row * rowStep);
        entry.btn.setPosition(x, y);
        entry.txt.setPosition(x, y);
        entry.txt.setText(def.label);
        entry.btn.off('pointerdown');
        entry.btn.on('pointerdown', def.onClick);
      } else {
        entry.btn.setVisible(false);
        entry.txt.setVisible(false);
        entry.btn.off('pointerdown');
      }
    });
  }

  showChiggyOptions() {
    this.chiggyDialogTitle.setText('Chef Chiggy');
    this.setChiggyBodyText(
      'Welcome to the Lobby, SimuLearner!\nHow may Chiggy help you?'
    );
    this.setChiggyButtons([
      { label: 'Fun Fact', onClick: () => this.showChiggyFunFactTopics() },
      { label: 'Just Curious', onClick: () => this.showChiggyJustCurious() },
      { label: 'Close', onClick: () => this.closeChiggyDialog() }
    ]);
  }

  showChiggyJustCurious() {
    this.chiggyDialogTitle.setText('Chef Chiggy');
    this.setChiggyBodyText(
      'This game, SimuLearntion, is developed to assess the depletion of attention span among learners.\n\n' +
      'This game soon will expand to cover more topics other than Physics!\n\n' +
      'The game will include more exciting features in the future!'
    );
    this.setChiggyButtons([
      { label: 'Back', onClick: () => this.showChiggyOptions() },
      { label: 'Close', onClick: () => this.closeChiggyDialog() }
    ]);
  }

  showChiggyFunFactTopics() {
    this.chiggyDialogTitle.setText('Fun Fact Topics');
    this.setChiggyBodyText('Pick a topic:');
    this.setChiggyButtonsGrid([
      { label: 'Electromagnetism', onClick: () => this.showChiggyFunFact('electromagnetism') },
      { label: 'Projectile Motion', onClick: () => this.showChiggyFunFact('projectile') },
      { label: 'Distance vs Displacement', onClick: () => this.showChiggyFunFact('distance') },
      { label: 'Speed vs Acceleration', onClick: () => this.showChiggyFunFact('speed') },
      { label: 'Quantum Mechanics', onClick: () => this.showChiggyFunFact('quantum') },
      { label: 'Back', onClick: () => this.showChiggyOptions() }
    ]);
  }
  
  showChiggyFunFact(topic) {
    const facts = {
      electromagnetism:
        'Magnets are like magic! Every single magnet, even the tiny one on your fridge, has two ends: a "hug" side and a "push" side. If you try to force two "push" sides together, they will wiggle and shove each other away!\n\n' +
        'Lightning is a giant, sparkly high-five! Way up in the sky, fluffy cloud friends rub together and get super tickly with static electricity—just like when you slide down a slide and your hair goes poof! The giant sparkle (lightning) is their way of saying "Ouch, too tickly!" and high-fiving the ground.\n\n' +
        'Light is a super-speedy dancer! Light is really, really shy. It\'s the fastest thing in the whole universe, and it always dances in a straight line. That\'s why you can\'t see around corners—the light doesn\'t know how to turn!',
      projectile:
        'When you throw your toy, gravity is playing catch! No matter how hard you throw a ball sideways, gravity is always pulling it straight down for a hug. That\'s why the ball makes a rainbow shape in the air before it plops on the ground.\n\n' +
        'A paper airplane and a rock fall at the same speed! If you drop a heavy rock and a crumbled paper ball from the same high place, they\'ll hit the ground at the same time! The air just likes to push on the flat paper airplane more to give it a ride.\n\n' +
        'To throw the farthest, aim for a flying kiss! If you want to throw something really, really far, don\'t throw it straight out or straight up. Throw it like you\'re blowing a kiss up to the sky! A nice, gentle upward angle makes it go the farthest.',
      distance:
        'Your toys know how far they\'ve wandered! If you push your toy car all around your room in a crazy path, the distance is how many inches its wheels rolled. The displacement is just how far it is from its starting point in a straight line, like a bird would fly.\n\n' +
        'You can walk a long way and end up right next to your start! If you run a big, giant circle around the playground, you walk a big distance. But your displacement is zero because you finished right where you started—no closer to the swings than when you began!\n\n' +
        'It\'s like a treasure map! The dotted path you follow around mountains and rivers is the distance. The big, straight "X marks the spot" line from "You Are Here" to the treasure is the displacement.',
      speed:
        'Speed is like a number on your scooter\'s magic meter. If the number says "5," you are zooming at that speed. Acceleration is what you feel when you push off the ground and that number gets bigger—your tummy feels funny because you\'re changing your speed!\n\n' +
        'You can go super fast with no acceleration! On a swing, when you\'re at the very bottom and whooshing past your parents, you are at your fastest speed. But for just a tiny moment, you are not speeding up or slowing down—your acceleration is zero!\n\n' +
        'Slowing down is just "backwards" acceleration! When you use the brakes on your bike, you are still accelerating! Your speed is changing, but it\'s getting smaller. So acceleration isn\'t just for speeding up, it\'s for any change in your zoom.',
      quantum:
        'Tiny particles can be in two places at once, like magic! It\'s like your toy car could be in your bedroom AND in the living room at the same time, and you only find out which room it\'s in when you go look for it. That\'s how tiny electrons play hide-and-seek!\n\n' +
        'Particles can walk through walls! It\'s called "quantum tunneling." Imagine you\'re rolling a ball at a big hill. The hill is a wall. In our big world, the ball would just bounce back. But in this tiny world, there\'s a super tiny chance the ball could just magically appear on the other side of the hill without going over!\n\n' +
        'Particles can be best friends forever, no matter what! If two tiny electrons become special friends (entangled), they become linked. If you make one electron spin to the left, its friend instantly spins to the right, even if it\'s on the other side of the universe! It\'s like having magical walkie-talkies that work faster than anything.'
    };

    this.chiggyDialogTitle.setText('Fun Fact');
    const raw = facts[topic] || '';
    this.chiggyFunFactPages = raw.split('\n\n').filter(Boolean);
    this.chiggyFunFactTopic = topic;
    this.showChiggyFunFactPage(0);
  }

  showChiggyFunFactPage(pageIndex) {
    const pages = Array.isArray(this.chiggyFunFactPages) ? this.chiggyFunFactPages : [];
    const total = pages.length;
    const index = Math.min(Math.max(pageIndex, 0), Math.max(total - 1, 0));
    this.chiggyFunFactIndex = index;

    const text = pages[index] || '';
    this.setChiggyBodyText(text);

    const buttons = [];
    if (index > 0) {
      buttons.push({ label: 'Previous', onClick: () => this.showChiggyFunFactPage(index - 1) });
    } else {
      buttons.push({ label: 'Previous', onClick: () => {} });
    }
    if (index < total - 1) {
      buttons.push({ label: 'Next', onClick: () => this.showChiggyFunFactPage(index + 1) });
    } else {
      buttons.push({ label: 'Next', onClick: () => {} });
    }
    buttons.push({ label: 'Topics', onClick: () => this.showChiggyFunFactTopics() });
    buttons.push({ label: 'Close', onClick: () => this.closeChiggyDialog() });

    this.setChiggyButtons(buttons);
  }

  setChiggyBodyText(text) {
    if (!this.chiggyDialogBody) return;
    if (this.chiggyTextTimer) {
      this.chiggyTextTimer.remove(false);
      this.chiggyTextTimer = null;
    }

    const fullText = String(text || '');
    let index = 0;
    this.chiggyDialogBody.setText('');

    this.chiggyTextTimer = this.time.addEvent({
      delay: 45,
      loop: true,
      callback: () => {
        if (index >= fullText.length) {
          if (this.chiggyTextTimer) {
            this.chiggyTextTimer.remove(false);
            this.chiggyTextTimer = null;
          }
          return;
        }
        this.chiggyDialogBody.setText(fullText.slice(0, index + 1));
        index += 1;
      }
    });
  }
  
  shutdown() {
    // Clean up
    if (this.player) {
      this.player.destroy();
    }
    this.otherPlayers.forEach(p => p.destroy());
    this.otherPlayers.clear();

    if (this.leaderboardTimer) {
      this.leaderboardTimer.remove(false);
      this.leaderboardTimer = null;
    }
    
    socketManager.removeSceneListeners();
  }
}
