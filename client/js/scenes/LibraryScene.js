// Library Scene - Physics Library with Multiplayer
class LibraryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LibraryScene' });
  }
  
  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Background - Use real library image from "Compilations of gokgok simulator 2000"
    const libraryBg = this.add.image(0, 0, 'library-bg').setOrigin(0);
    libraryBg.setDisplaySize(width, height);
    
    // Title
    this.add.text(width / 2, 30, 'Physics Library', {
      fontSize: '32px',
      fill: '#ffffff',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setDepth(10);

    // Leaderboard button (top-left)
    const leaderboardBtn = this.add.rectangle(90, 40, 120, 34, 0x6b21a8);
    leaderboardBtn.setInteractive({ useHandCursor: true });
    this.add.text(90, 40, 'Leaderboard', {
      fontSize: '14px',
      fill: '#ffffff'
    }).setOrigin(0.5).setDepth(11);
    leaderboardBtn.setDepth(10);
    leaderboardBtn.on('pointerdown', () => this.toggleLeaderboardPanel());
    
    // Exit door (bottom left) - semi-transparent overlay
    const exitDoor = this.add.rectangle(100, 550, 150, 75, 0x00aa00, 0.3);
    exitDoor.setDepth(5);
    this.add.text(100, 550, '🚪 Exit to Lobby', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: 'rgba(0, 150, 0, 0.8)',
      padding: { x: 5, y: 3 }
    }).setOrigin(0.5).setDepth(10);
    
    // Quiz door (bottom right)
    const quizDoor = this.add.rectangle(675, 550, 150, 75, 0xaa00aa, 0.3);
    quizDoor.setDepth(5);
    this.add.text(675, 550, '📝 Start Quiz', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: 'rgba(150, 0, 150, 0.8)',
      padding: { x: 5, y: 3 }
    }).setOrigin(0.5).setDepth(10);
    
    // Study button - using real asset (smaller and repositioned)
    this.studyBtn = this.add.image(700, 50, 'study-btn');
    this.studyBtn.setScale(0.15); // Much smaller
    this.studyBtn.setInteractive({ useHandCursor: true });
    this.studyBtn.setDepth(10);
    
    this.studyMode = false;
    this.selectedTopic = null;
    
    this.studyBtn.on('pointerdown', () => {
      this.showTopics();
    });
    
    // Instructions
    this.instructionsText = this.add.text(width / 2, height - 30, 
      'Arrow Keys: Move | Walk to Exit (green) or Quiz (purple) | Click Study', {
      fontSize: '12px',
      fill: '#000000',
      backgroundColor: '#ffffff',
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

    // Ms. Parro NPC (lecturer)
    this.parro = this.add.image(150, 220, 'paru-avatar').setScale(0.12);
    this.parro.setDepth(9);
    this.add.text(150, 160, 'Ms. Parro', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      padding: { x: 6, y: 2 }
    }).setOrigin(0.5).setDepth(10);
    this.parro.setInteractive({ useHandCursor: true });
    this.parro.on('pointerdown', () => this.openParroDialog());
    this.parroDialogCooldown = 0;
    this.createParroDialog();
    // Enable physics so the player collides with Paru
    this.physics.add.existing(this.parro, true);
    const parroBodyW = this.parro.width * this.parro.scaleX * 0.6;
    const parroBodyH = this.parro.height * this.parro.scaleY * 0.6;
    this.parro.body.setSize(parroBodyW, parroBodyH, true);
    
    // Create local player
    const userData = this.game.userData;
    const playerTitle = userData.currentTitle || userData.title || (window.DEFAULT_PLAYER_TITLE || 'Rookie');
    this.player = new Player(this, 250, 400, userData.username, userData.avatarConfig, playerTitle);
    if (this.player && this.player.sprite && this.parro && this.parro.body) {
      this.physics.add.collider(this.player.sprite, this.parro);
    }
    
    // Other players map
    this.otherPlayers = new Map();

    // Player interaction popup
    this.createPlayerPopup();
    
    // Register socket listeners
    socketManager.registerSceneListeners(this);
    
    // Door collision rects
    this.exitDoorRect = { x: 25, y: 500, width: 150, height: 75 };
    this.quizDoorRect = { x: 600, y: 500, width: 150, height: 75 };
    this.doorCooldown = 0;
    
    // Topic UI elements (hidden initially)
    this.topicUI = null;
  }
  
  update(time, delta) {
    if (this.player) {
      this.player.update();
      
      // Check door collisions
      if (this.doorCooldown <= 0) {
        const px = this.player.sprite.x;
        const py = this.player.sprite.y;
        
        // Exit door
        const exitDoor = this.exitDoorRect;
        if (px > exitDoor.x && px < exitDoor.x + exitDoor.width &&
            py > exitDoor.y && py < exitDoor.y + exitDoor.height) {
          console.log('Leaving library...');
          socketManager.exitLibrary();
          this.scene.start('LobbyScene');
          this.doorCooldown = 1000;
        }
        
        // Quiz door
        const quizDoor = this.quizDoorRect;
        if (px > quizDoor.x && px < quizDoor.x + quizDoor.width &&
            py > quizDoor.y && py < quizDoor.y + quizDoor.height) {
          console.log('Starting quiz...');
          socketManager.startQuiz();
          this.scene.start('QuizScene');
          this.doorCooldown = 1000;
        }
      } else {
        this.doorCooldown -= delta;
      }

      // Ms. Parro proximity check
      if (this.parroDialogCooldown > 0) {
        this.parroDialogCooldown -= delta;
      }
      const dist = Phaser.Math.Distance.Between(
        this.player.sprite.x,
        this.player.sprite.y,
        this.parro.x,
        this.parro.y
      );
      if (this.parroDialogVisible && dist > 110) {
        this.closeParroDialog();
      } else if (!this.parroDialogVisible && this.parroDialogCooldown <= 0 && dist <= 80) {
        this.openParroDialog();
      }
    }
    
    // Update other players
    this.otherPlayers.forEach(otherPlayer => {
      otherPlayer.update();
    });
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

  createLeaderboardPanel() {
    const panelX = 170;
    const panelY = 140;
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
  
  showTopics() {
    if (this.topicUI) return;
    
    const width = this.cameras.main.width;
    const topics = Object.keys(PHYSICS_LESSONS);
    
    this.topicUI = this.add.container(width / 2, 200);
    
    // Background
    const bg = this.add.image(0, 0, 'library-topic-ui').setOrigin(0.5);
    bg.setDisplaySize(520, 325);
    this.topicUI.add(bg);
    
    // Title
    const title = this.add.text(0, -100, 'Select a Topic', {
      fontSize: '24px',
      fill: '#2b1b12'
    }).setOrigin(0.5);
    this.topicUI.add(title);
    
    // Topic buttons
    topics.forEach((topic, index) => {
      const btn = this.add.rectangle(0, -40 + index * 70, 300, 50, 0x667eea);
      btn.setInteractive({ useHandCursor: true });
      
      const text = this.add.text(0, -40 + index * 70, topic, {
        fontSize: '18px',
        fill: '#2b1b12'
      }).setOrigin(0.5);
      
      btn.on('pointerdown', () => {
        this.showLessons(topic);
        socketManager.studyTopic(topic);
      });
      
      this.topicUI.add(btn);
      this.topicUI.add(text);
    });
    
    // Close button
    const closeBtn = this.add.rectangle(0, 100, 100, 40, 0xff0000);
    closeBtn.setInteractive({ useHandCursor: true });
    const closeText = this.add.text(0, 100, 'Close', {
      fontSize: '16px',
      fill: '#2b1b12'
    }).setOrigin(0.5);
    
    closeBtn.on('pointerdown', () => {
      this.hideTopicUI();
    });
    
    this.topicUI.add(closeBtn);
    this.topicUI.add(closeText);
  }
  
  showLessons(topic) {
    if (this.topicUI) {
      this.topicUI.destroy();
      this.topicUI = null;
    }
    
    const width = this.cameras.main.width;
    const lessons = PHYSICS_LESSONS[topic];
    
    this.topicUI = this.add.container(width / 2, 250);
    
    // Background
    const bg = this.add.image(0, 0, 'library-topic-ui').setOrigin(0.5);
    bg.setDisplaySize(520, 325);
    this.topicUI.add(bg);
    
    // Title
    const title = this.add.text(0, -150, topic, {
      fontSize: '28px',
      fill: '#2b1b12'
    }).setOrigin(0.5);
    this.topicUI.add(title);
    
    // Lessons
    lessons.forEach((lesson, index) => {
      const text = this.add.text(0, -80 + index * 60, lesson, {
        fontSize: '20px',
        fill: '#2b1b12'
      }).setOrigin(0.5);
      this.topicUI.add(text);
    });
    
    // Back button
    const backBtn = this.add.rectangle(0, 150, 100, 40, 0x667eea);
    backBtn.setInteractive({ useHandCursor: true });
    const backText = this.add.text(0, 150, 'Back', {
      fontSize: '16px',
      fill: '#2b1b12'
    }).setOrigin(0.5);
    
    backBtn.on('pointerdown', () => {
      this.hideTopicUI();
      this.showTopics();
    });
    
    this.topicUI.add(backBtn);
    this.topicUI.add(backText);
  }
  
  hideTopicUI() {
    if (this.topicUI) {
      this.topicUI.destroy();
      this.topicUI = null;
    }
  }
  
  // Socket event handlers
  onLibraryState(data) {
    console.log('Library state received:', data.players.length, 'players');
    
    this.otherPlayers.forEach(p => p.destroy());
    this.otherPlayers.clear();
    
    data.players.forEach(playerData => {
      if (playerData.userId !== this.game.userData.id) {
        const otherPlayer = new OtherPlayer(this, playerData);
        this.otherPlayers.set(playerData.socketId, otherPlayer);
      }
    });
    
    if (window.playerList) {
      window.playerList.updatePlayers(data.players);
    }
  }
  
  onPlayerJoined(playerData) {
    if (playerData.userId !== this.game.userData.id) {
      const otherPlayer = new OtherPlayer(this, playerData);
      this.otherPlayers.set(playerData.socketId, otherPlayer);
      
      if (window.playerList) {
        window.playerList.addPlayer(playerData);
      }
    }
  }
  
  onPlayerLeft(data) {
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
      otherPlayer.setTargetPosition(data.x, data.y, data.facing);
    } else if (data.userId && data.userId !== this.game.userData.id) {
      // Create player if we missed join event
      const playerData = {
        socketId: data.socketId,
        userId: data.userId,
        username: data.username,
        avatarConfig: { body: 'u1', head: 'none' },
        x: data.x !== undefined && !isNaN(data.x) ? data.x : 250,
        y: data.y !== undefined && !isNaN(data.y) ? data.y : 400,
        facing: data.facing || 'right'
      };
      
      try {
        const newPlayer = new OtherPlayer(this, playerData);
        this.otherPlayers.set(data.socketId || data.userId, newPlayer);
      } catch (error) {
        console.error('Error creating missing player in library:', error);
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
  
  onPlayerStudying(data) {
    console.log(`${data.username} is studying ${data.topic}`);
    // Could show notification or update UI
  }

  createParroDialog() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const dialogWidth = width - 80;
    const dialogHeight = 200;

    this.parroDialog = this.add.container(width / 2, height - 140);
    this.parroDialog.setDepth(20);

    const dialogBg = this.add.graphics();
    dialogBg.fillStyle(0x000000, 0.75);
    dialogBg.lineStyle(2, 0xffffff, 0.2);
    dialogBg.fillRoundedRect(-dialogWidth / 2, -dialogHeight / 2, dialogWidth, dialogHeight, 16);
    dialogBg.strokeRoundedRect(-dialogWidth / 2, -dialogHeight / 2, dialogWidth, dialogHeight, 16);
    const tailX = Phaser.Math.Clamp(this.parro.x - (width / 2), -dialogWidth / 2 + 60, dialogWidth / 2 - 60);
    dialogBg.fillTriangle(tailX - 40, -dialogHeight / 2 + 10, tailX, -dialogHeight / 2 - 22, tailX + 40, -dialogHeight / 2 + 10);
    dialogBg.strokeTriangle(tailX - 40, -dialogHeight / 2 + 10, tailX, -dialogHeight / 2 - 22, tailX + 40, -dialogHeight / 2 + 10);

    this.parroDialogTitle = this.add.text(0, -60, 'Parro', {
      fontSize: '18px',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.parroDialogBody = this.add.text(0, 0,
      'Welcome to the Library, SimuLearner!\nHere, you can access the learning materials that are essential for your study!',
      {
        fontSize: '16px',
        fontFamily: 'monospace',
        fill: '#ffffff',
        align: 'center',
        wordWrap: { width: dialogWidth - 120 }
      }
    ).setOrigin(0.5);

    const closeBtn = this.add.rectangle(0, 60, 120, 34, 0x667eea);
    closeBtn.setInteractive({ useHandCursor: true });
    const closeText = this.add.text(0, 60, 'Close', {
      fontSize: '14px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    closeBtn.on('pointerdown', () => this.closeParroDialog());

    this.parroDialog.add([dialogBg, this.parroDialogTitle, this.parroDialogBody, closeBtn, closeText]);
    this.parroDialog.setVisible(false);
    this.parroDialogVisible = false;
  }

  openParroDialog() {
    if (!this.parroDialog || this.parroDialogVisible) return;
    this.parroDialogVisible = true;
    this.parroDialog.setVisible(true);
    this.setParroBodyText(
      'Welcome to the Library, SimuLearner!\nHere, you can access the learning materials that are essential for your study!'
    );
  }

  closeParroDialog() {
    if (!this.parroDialog) return;
    this.parroDialogVisible = false;
    this.parroDialog.setVisible(false);
    this.parroDialogCooldown = 700;
    if (this.parroTextTimer) {
      this.parroTextTimer.remove(false);
      this.parroTextTimer = null;
    }
  }

  setParroBodyText(text) {
    if (!this.parroDialogBody) return;
    if (this.parroTextTimer) {
      this.parroTextTimer.remove(false);
      this.parroTextTimer = null;
    }

    const fullText = String(text || '');
    let index = 0;
    this.parroDialogBody.setText('');

    this.parroTextTimer = this.time.addEvent({
      delay: 45,
      loop: true,
      callback: () => {
        if (index >= fullText.length) {
          if (this.parroTextTimer) {
            this.parroTextTimer.remove(false);
            this.parroTextTimer = null;
          }
          return;
        }
        this.parroDialogBody.setText(fullText.slice(0, index + 1));
        index += 1;
      }
    });
  }
  
  shutdown() {
    this.hideTopicUI();
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
