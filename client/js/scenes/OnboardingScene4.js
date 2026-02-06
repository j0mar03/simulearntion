// Onboarding Scene 4 - Ready to Start
class OnboardingScene4 extends Phaser.Scene {
  constructor() {
    super({ key: 'OnboardingScene4' });
  }
  
  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    this.cameras.main.fadeIn(500, 0, 0, 0);
    
    // Background
    const bg = this.add.image(0, 0, 'lobby-bg').setOrigin(0);
    bg.setDisplaySize(width, height);
    
    // Portraits
    const principal = this.add.image(120, height - 210, 'principal-avatar');
    principal.setScale(0.22);
    principal.setDepth(1);
    
    const sumi = this.add.image(width - 120, height - 210, 'sumi-avatar');
    sumi.setScale(0.22);
    sumi.setDepth(1);
    
    // Dialog box
    const dialogBox = this.add.rectangle(width / 2, height - 120, width - 80, 140, 0x000000, 0.75);
    dialogBox.setStrokeStyle(2, 0xffffff, 0.2);
    dialogBox.setDepth(5);
    
    const dialogText = [
      "and that’s it! you’re officially part of the school!",
      "your journey starts now. learn, grow, and most importantly — have fun.",
      "alright, player — let’s get started!"
    ].join('\n');
    
    this.add.text(200, height - 185, dialogText, {
      fontSize: '16px',
      fill: '#ffffff',
      wordWrap: { width: width - 260 }
    }).setOrigin(0, 0).setDepth(6);
    
    // Start Game button
    const startBtn = this.add.rectangle(width / 2, height - 260, 180, 48, 0x00c853);
    startBtn.setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height - 260, 'Start Game', {
      fontSize: '18px',
      fill: '#0b2a3a'
    }).setOrigin(0.5);
    
    const startGame = () => {
      if (this.game.userData) {
        this.game.userData.onboardingActive = false;
        this.game.userData.onboardingReturnScene = null;
      }
      this.scene.start('LobbyScene');
    };
    
    startBtn.on('pointerdown', startGame);
    this.input.keyboard.once('keydown-SPACE', startGame);

    const skipText = this.add.text(width - 40, 24, 'Skip Tour', {
      fontSize: '14px',
      fill: '#cccccc',
      backgroundColor: 'rgba(0,0,0,0.4)',
      padding: { x: 8, y: 4 }
    }).setOrigin(1, 0);
    skipText.setInteractive({ useHandCursor: true });
    skipText.on('pointerdown', () => {
      localStorage.setItem('skipTour', 'true');
      this.scene.start('LobbyScene');
    });
  }
}
