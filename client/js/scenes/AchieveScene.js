// Achievements Scene
class AchieveScene extends Phaser.Scene {
  constructor() {
    super({ key: 'AchieveScene' });
  }
  
  async create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Background - Use real achievement UI image from "Compilations of gokgok simulator 2000"
    const achieveBg = this.add.image(0, 0, 'achievement-bg').setOrigin(0);
    achieveBg.setDisplaySize(width, height);
    
    // Title
    this.add.text(width / 2, 30, 'Achievements & Unlocks', {
      fontSize: '32px',
      fill: '#ffffff',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setDepth(10);
    
    // Back button - using real asset
    const backBtn = this.add.image(50, 30, 'back-btn');
    backBtn.setScale(0.15); // Much smaller size
    backBtn.setInteractive({ useHandCursor: true });
    backBtn.setDepth(10);
    
    backBtn.on('pointerdown', () => {
      this.scene.start('LobbyScene');
    });
    
    // Check if user is admin
    const userData = this.game.userData || JSON.parse(localStorage.getItem('user') || '{}');
    this.isAdmin = userData.isAdmin || false;
    
    // Load achievements from server
    await this.loadAchievements();
    
    // Display achievements
    this.displayAchievements();
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
      const box = this.add.rectangle(xOffset + 150, yOffset, 280, 70,
        earned ? 0x90ee90 : 0xcccccc);
      
      // Icon
      const iconKey = earned ? achievement.icon : 'achievement-locked';
      const icon = this.add.image(xOffset + 30, yOffset, iconKey);
      icon.setScale(0.35);
      
      // Name
      const name = this.add.text(xOffset + 70, yOffset - 15, achievement.name, {
        fontSize: '16px',
        fill: earned ? '#000000' : '#666666',
        fontStyle: earned ? 'bold' : 'normal'
      });
      
      // Description
      const desc = this.add.text(xOffset + 70, yOffset + 10, achievement.desc, {
        fontSize: '12px',
        fill: earned ? '#333333' : '#888888'
      });

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

  async refreshAchievements() {
    const userData = this.game.userData || JSON.parse(localStorage.getItem('user') || '{}');
    this.isAdmin = userData.isAdmin || false;
    await this.loadAchievements();
    this.displayAchievements();
  }
}
