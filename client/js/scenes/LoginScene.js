// Login Scene - Transition/Splash Screen
class LoginScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoginScene' });
  }
  
  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Background
    this.add.rectangle(0, 0, width, height, 0x2d2d2d).setOrigin(0);
    
    // Title
    const title = this.add.text(width / 2, height / 2 - 100, 'SimuLearntion', {
      fontSize: '42px',
      fill: '#667eea',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    
    // Subtitle
    const subtitle = this.add.text(width / 2, height / 2 - 50, 'Grade 12 Physics - Multiplayer Edition', {
      fontSize: '20px',
      fill: '#ffffff'
    });
    subtitle.setOrigin(0.5);
    
    // User info
    const userData = this.game.userData;
    const welcomeText = this.add.text(width / 2, height / 2 + 20, `Welcome, ${userData.username}!`, {
      fontSize: '24px',
      fill: '#ffffff'
    });
    welcomeText.setOrigin(0.5);
    
    // Instructions
    const instructionsText = this.add.text(width / 2, height / 2 + 80, 'Choose how you want to start', {
      fontSize: '18px',
      fill: '#cccccc'
    });
    instructionsText.setOrigin(0.5);
    
    // Blink effect for instructions
    this.tweens.add({
      targets: instructionsText,
      alpha: 0.3,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
    
    const shouldSkipTour = localStorage.getItem('skipTour') === 'true';
    
    const makeButton = (x, y, label, onClick) => {
      const buttonBg = this.add.rectangle(x, y, 220, 48, 0x667eea, 0.95);
      buttonBg.setStrokeStyle(2, 0x3a4bbf, 1);
      buttonBg.setInteractive({ useHandCursor: true });
      
      const buttonText = this.add.text(x, y, label, {
        fontSize: '18px',
        fill: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      buttonBg.on('pointerover', () => buttonBg.setFillStyle(0x5a6fe0, 1));
      buttonBg.on('pointerout', () => buttonBg.setFillStyle(0x667eea, 0.95));
      buttonBg.on('pointerdown', onClick);
      
      return { buttonBg, buttonText };
    };
    
    const startTourLabel = shouldSkipTour ? 'Start Tour (Optional)' : 'Start Tour';
    makeButton(width / 2, height / 2 + 140, startTourLabel, () => {
      this.scene.start('OnboardingScene1');
    });
    
    makeButton(width / 2, height / 2 + 200, 'Enter Lobby', () => {
      this.scene.start('LobbyScene');
    });
  }
}
