// Onboarding Scene 3 - Avatar Setup
class OnboardingScene3 extends Phaser.Scene {
  constructor() {
    super({ key: 'OnboardingScene3' });
  }
  
  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    this.cameras.main.fadeIn(500, 0, 0, 0);
    
    // Background (hallway placeholder)
    const hallwayBg = this.add.image(0, 0, 'lobby-bg').setOrigin(0);
    hallwayBg.setDisplaySize(width, height);
    
    // Sumi portrait
    const sumi = this.add.image(140, height - 205, 'sumi-avatar');
    sumi.setScale(0.24);
    sumi.setDepth(1);
    
    // Dialog box
    const dialogBox = this.add.rectangle(width / 2, height - 120, width - 80, 140, 0x000000, 0.75);
    dialogBox.setStrokeStyle(2, 0xffffff, 0.2);
    dialogBox.setDepth(5);
    
    const dialogText = [
      "hey. i'm sumi, your counselor. let’s build your avatar.",
      '',
      'start by choosing:',
      '• uniform / outfit',
      '• accessories',
      '• head items',
      '',
      'take your time. this is how everyone will see you in-game.'
    ].join('\n');
    
    this.add.text(220, height - 195, dialogText, {
      fontSize: '15px',
      fill: '#ffffff',
      wordWrap: { width: width - 270 }
    }).setOrigin(0, 0).setDepth(6);
    
    // Simple highlight placeholders
    const highlight1 = this.add.rectangle(width - 180, 150, 220, 90);
    highlight1.setStrokeStyle(3, 0x9bdefa, 1);
    highlight1.setFillStyle(0x9bdefa, 0.08);
    
    const highlight2 = this.add.rectangle(width - 180, 280, 220, 90);
    highlight2.setStrokeStyle(3, 0x9bdefa, 1);
    highlight2.setFillStyle(0x9bdefa, 0.08);
    
    const highlight3 = this.add.rectangle(width - 180, 410, 220, 90);
    highlight3.setStrokeStyle(3, 0x9bdefa, 1);
    highlight3.setFillStyle(0x9bdefa, 0.08);
    
    this.tweens.add({
      targets: [highlight1, highlight2, highlight3],
      alpha: 0.3,
      duration: 900,
      yoyo: true,
      repeat: -1
    });
    
    // Open avatar editor button
    const btn = this.add.rectangle(width / 2, height - 260, 220, 44, 0x5bc0de);
    btn.setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height - 260, 'Open Avatar Editor', {
      fontSize: '16px',
      fill: '#0b2a3a'
    }).setOrigin(0.5);
    
    const openEditor = () => {
      if (this.game.userData) {
        this.game.userData.onboardingActive = true;
        this.game.userData.onboardingReturnScene = 'OnboardingScene4';
      }
      this.scene.start('CustomScene');
    };
    
    btn.on('pointerdown', openEditor);
    this.input.keyboard.once('keydown-SPACE', openEditor);

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
