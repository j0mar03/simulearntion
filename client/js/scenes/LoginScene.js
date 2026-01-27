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
    const instructionsText = this.add.text(width / 2, height / 2 + 80, 'Press SPACE to enter the lobby', {
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
    
    // Space key to start
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('LobbyScene');
    });
    
    // Auto-start after 3 seconds
    this.time.delayedCall(3000, () => {
      if (this.scene.isActive()) {
        this.scene.start('LobbyScene');
      }
    });
  }
}
