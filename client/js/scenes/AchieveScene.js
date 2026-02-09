// Achievements Scene
class AchieveScene extends Phaser.Scene {
  constructor() {
    super({ key: 'AchieveScene' });
  }
  
  async create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Background - Use real achievement UI image from "Compilations of gokgok simulator 2000"
    this.achieveBg = this.add.image(width / 2, height / 2, 'achievement-bg').setOrigin(0.5);
    this.achieveBg.setDisplaySize(width * 0.92, height * 0.92);
    this.achieveBg.setDepth(0);
    
    // Title
    this.titleText = this.add.text(width / 2, 30, 'Achievements & Unlocks', {
      fontSize: '32px',
      fill: '#ffffff',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setDepth(10);
    
    // Back button - using real asset
    this.backBtn = this.add.image(50, 30, 'back-btn');
    this.backBtn.setScale(0.15); // Much smaller size
    this.backBtn.setInteractive({ useHandCursor: true });
    this.backBtn.setDepth(10);
    
    this.backBtn.on('pointerdown', () => {
      this.scene.stop('AchieveScene');
      this.scene.start('LobbyScene');
    });
    
    // Check if user is admin
    const userData = this.game.userData || JSON.parse(localStorage.getItem('user') || '{}');
    this.isAdmin = userData.isAdmin || false;
    
    // Load achievements from server
    await this.loadAchievements();
    
    // Display achievements
    this.displayAchievements();

    if (!this._eventsBound) {
      this._eventsBound = true;
      this.events.on('wake', () => {
        this.refreshAchievements();
      });
      this.events.on('resume', () => {
        this.refreshAchievements();
      });
      this.events.on('shutdown', () => {
        if (this.achievementsContainer) {
          this.achievementsContainer.destroy(true);
          this.achievementsContainer = null;
        }
      });
    }
  }
  
  async loadAchievements() {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('/api/profile/achievements', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.earnedAchievements = data.achievements.map(a => a.achievementId);
      } else {
        this.earnedAchievements = [];
      }
    } catch (error) {
      console.error('Failed to load achievements:', error);
      this.earnedAchievements = [];
    }
  }
  
  displayAchievements() {
    const width = this.cameras.main.width;
    if (!this.achievementsContainer) {
      this.achievementsContainer = this.add.container(0, 0);
    } else {
      this.achievementsContainer.removeAll(true);
    }
    this.achievementsContainer.setDepth(5);
    this.achievementsContainer.setVisible(true);

    const allAchievements = window.ACHIEVEMENTS || {};
    
    // Summary
    // Admin users have all achievements unlocked
    const earnedCount = this.isAdmin ? Object.keys(allAchievements).length : this.earnedAchievements.length;
    const totalCount = Object.keys(allAchievements).length;
    
    const summaryText = this.add.text(width / 2, 80, `Earned: ${earnedCount}/${totalCount}${this.isAdmin ? ' (Admin)' : ''}`, {
      fontSize: '20px',
      fill: '#00aa00'
    }).setOrigin(0.5);
    this.achievementsContainer.add(summaryText);
    
    // Display achievements in grid
    let yOffset = 130;
    let xOffset = 50;
    let column = 0;
    
    Object.entries(allAchievements).forEach(([id, achievement]) => {
      // Admin users have all achievements unlocked
      const earned = this.isAdmin || this.earnedAchievements.includes(id);
      
      // Achievement box
      const box = this.add.rectangle(xOffset + 150, yOffset, 280, 80,
        earned ? 0x90ee90 : 0xcccccc);
      
      // Icon
      let iconKey = achievement.icon;
      if (!this.textures.exists(iconKey)) {
        iconKey = 'achievement-locked';
      }
      const icon = this.add.image(xOffset + 30, yOffset, iconKey);
      icon.setScale(0.1);
      if (!earned) {
        icon.setAlpha(0.35);
      }
      
      // Name
      const name = this.add.text(xOffset + 70, yOffset - 18, achievement.name, {
        fontSize: '16px',
        fill: earned ? '#000000' : '#666666',
        fontStyle: earned ? 'bold' : 'normal',
        wordWrap: { width: 190 }
      });
      
      // Description
      const desc = this.add.text(xOffset + 70, yOffset + 12, achievement.desc, {
        fontSize: '11px',
        fill: earned ? '#333333' : '#888888',
        wordWrap: { width: 190 }
      });

      if (earned && achievement.title) {
        box.setInteractive({ useHandCursor: true });
        icon.setInteractive({ useHandCursor: true });
        const applyTitle = () => this.setPlayerTitle(achievement.title);
        box.on('pointerdown', applyTitle);
        icon.on('pointerdown', applyTitle);
      }

      this.achievementsContainer.add([box, icon, name, desc]);
      
      // Move to next position
      column++;
      if (column >= 2) {
        column = 0;
        xOffset = 50;
        yOffset += 90;
      } else {
        xOffset = 400;
      }
    });
  }

  setPlayerTitle(title) {
    if (!title) return;
    const userData = this.game.userData || JSON.parse(localStorage.getItem('user') || '{}');
    userData.currentTitle = title;
    this.game.userData = userData;
    localStorage.setItem('user', JSON.stringify(userData));

    const scenes = this.game && this.game.scene ? this.game.scene.getScenes(true) : [];
    scenes.forEach(scene => {
      if (scene.player && scene.player.setTitle) {
        scene.player.setTitle(title);
      }
    });

    if (window.socketManager && window.socketManager.showNotification) {
      window.socketManager.showNotification(`Title set to: ${title}`, 'achievement');
    }
  }

  async refreshAchievements() {
    const userData = this.game.userData || JSON.parse(localStorage.getItem('user') || '{}');
    this.isAdmin = userData.isAdmin || false;
    await this.loadAchievements();
    this.displayAchievements();
  }
}
