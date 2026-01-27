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
    const studyBtn = this.add.image(700, 50, 'study-btn');
    studyBtn.setScale(0.15); // Much smaller
    studyBtn.setInteractive({ useHandCursor: true });
    studyBtn.setDepth(10);
    
    this.studyMode = false;
    this.selectedTopic = null;
    
    studyBtn.on('pointerdown', () => {
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
    
    // Create local player
    const userData = this.game.userData;
    this.player = new Player(this, 250, 400, userData.username, userData.avatarConfig);
    
    // Other players map
    this.otherPlayers = new Map();
    
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
    }
    
    // Update other players
    this.otherPlayers.forEach(otherPlayer => {
      otherPlayer.update();
    });
  }
  
  showTopics() {
    if (this.topicUI) return;
    
    const width = this.cameras.main.width;
    const topics = Object.keys(PHYSICS_LESSONS);
    
    this.topicUI = this.add.container(width / 2, 200);
    
    // Background
    const bg = this.add.rectangle(0, 0, 400, 250, 0x000000, 0.8);
    this.topicUI.add(bg);
    
    // Title
    const title = this.add.text(0, -100, 'Select a Topic', {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);
    this.topicUI.add(title);
    
    // Topic buttons
    topics.forEach((topic, index) => {
      const btn = this.add.rectangle(0, -40 + index * 70, 300, 50, 0x667eea);
      btn.setInteractive({ useHandCursor: true });
      
      const text = this.add.text(0, -40 + index * 70, topic, {
        fontSize: '18px',
        fill: '#ffffff'
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
      fill: '#ffffff'
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
    const bg = this.add.rectangle(0, 0, 500, 350, 0x000000, 0.9);
    this.topicUI.add(bg);
    
    // Title
    const title = this.add.text(0, -150, topic, {
      fontSize: '28px',
      fill: '#667eea'
    }).setOrigin(0.5);
    this.topicUI.add(title);
    
    // Lessons
    lessons.forEach((lesson, index) => {
      const text = this.add.text(0, -80 + index * 60, lesson, {
        fontSize: '20px',
        fill: '#ffffff'
      }).setOrigin(0.5);
      this.topicUI.add(text);
    });
    
    // Back button
    const backBtn = this.add.rectangle(0, 150, 100, 40, 0x667eea);
    backBtn.setInteractive({ useHandCursor: true });
    const backText = this.add.text(0, 150, 'Back', {
      fontSize: '16px',
      fill: '#ffffff'
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
    const otherPlayer = this.otherPlayers.get(data.socketId);
    if (otherPlayer) {
      otherPlayer.setTargetPosition(data.x, data.y, data.facing);
    }
  }
  
  onPlayerStudying(data) {
    console.log(`${data.username} is studying ${data.topic}`);
    // Could show notification or update UI
  }
  
  shutdown() {
    this.hideTopicUI();
    if (this.player) {
      this.player.destroy();
    }
    this.otherPlayers.forEach(p => p.destroy());
    this.otherPlayers.clear();
    
    socketManager.removeSceneListeners();
  }
}
