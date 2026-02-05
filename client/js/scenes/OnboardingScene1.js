// Onboarding Scene 1 - Welcome
class OnboardingScene1 extends Phaser.Scene {
  constructor() {
    super({ key: 'OnboardingScene1' });
  }
  
  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    this.cameras.main.fadeIn(500, 0, 0, 0);
    
    // Background
    const bg = this.add.image(0, 0, 'onboarding1-bg').setOrigin(0);
    bg.setDisplaySize(width, height);
    
    // Title
    this.add.text(width / 2, 40, 'Simulearntion', {
      fontSize: '36px',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Principal portrait
    const principal = this.add.image(140, height - 200, 'principal-avatar');
    principal.setScale(0.35);
    principal.setDepth(2);
    
    // Dialog box
    const dialogBox = this.add.rectangle(width / 2, height - 120, width - 80, 140, 0x000000, 0.7);
    dialogBox.setStrokeStyle(2, 0xffffff, 0.2);
    
    const dialogText = [
      'hey there, newcomer! welcome to Simulearntion!',
      "i'm principal racco.",
      'this world is all about learning, exploring, and leveling up your skills.',
      "before we begin, let me give you a quick tour of how the game works."
    ].join('\n');
    
    this.add.text(220, height - 180, dialogText, {
      fontSize: '16px',
      fill: '#ffffff',
      wordWrap: { width: width - 280 }
    }).setOrigin(0, 0);

    // Skip tour option (for returning players)
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
    
    const hint = this.add.text(width - 40, height - 40, 'click to continue', {
      fontSize: '12px',
      fill: '#cccccc'
    }).setOrigin(1, 1);
    this.tweens.add({
      targets: hint,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1
    });
    
    this.isTransitioning = false;
    const startNext = () => {
      if (this.isTransitioning) return;
      this.isTransitioning = true;
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(520, () => {
        this.scene.start('OnboardingScene2');
      });
    };
    
    this.input.once('pointerdown', startNext);
    this.time.delayedCall(6000, startNext);
  }
}
