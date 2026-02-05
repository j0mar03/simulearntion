// Onboarding Scene 2 - Garden Tour
class OnboardingScene2 extends Phaser.Scene {
  constructor() {
    super({ key: 'OnboardingScene2' });
  }
  
  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    this.cameras.main.fadeIn(500, 0, 0, 0);
    
    // Background
    const gardenBg = this.add.image(0, 0, 'garden-bg').setOrigin(0);
    gardenBg.setDisplaySize(width, height);
    
    // Principal portrait
    const principal = this.add.image(110, height - 190, 'principal-avatar');
    principal.setScale(0.32);
    principal.setDepth(2);
    
    // Dialog box
    const dialogBox = this.add.rectangle(width / 2, height - 120, width - 80, 140, 0x000000, 0.7);
    dialogBox.setStrokeStyle(2, 0xffffff, 0.2);
    
    const dialogText = [
      "here's the basics:",
      '• mr principal’s tour',
      '• game mechanics',
      '• account and avatar management',
      '',
      "you’ll see quests on your dashboard, progress bars on your profile,",
      "and mini-games scattered throughout the map. don’t worry —",
      "i’ll pop in whenever you need help."
    ].join('\n');
    
    this.add.text(210, height - 195, dialogText, {
      fontSize: '15px',
      fill: '#ffffff',
      wordWrap: { width: width - 260 }
    }).setOrigin(0, 0);
    
    // UI highlight boxes
    const highlights = [
      { x: 140, y: 120, w: 220, h: 90, label: 'quests' },
      { x: width - 160, y: 110, w: 220, h: 90, label: 'profile progress' },
      { x: width - 170, y: height - 220, w: 240, h: 120, label: 'mini-games' }
    ];
    
    this.highlightBoxes = highlights.map((h) => {
      const box = this.add.rectangle(h.x, h.y, h.w, h.h);
      box.setStrokeStyle(3, 0xffd166, 1);
      box.setFillStyle(0xffd166, 0.08);
      box.setVisible(false);
      
      const label = this.add.text(h.x, h.y - h.h / 2 - 16, h.label, {
        fontSize: '14px',
        fill: '#ffd166',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: { x: 6, y: 3 }
      }).setOrigin(0.5);
      label.setVisible(false);
      
      return { box, label };
    });
    
    const showHighlight = (index) => {
      this.highlightBoxes.forEach((h, i) => {
        const visible = i === index;
        h.box.setVisible(visible);
        h.label.setVisible(visible);
        if (visible) {
          h.box.setAlpha(1);
          this.tweens.add({
            targets: h.box,
            alpha: 0.2,
            duration: 700,
            yoyo: true,
            repeat: 2
          });
        }
      });
    };
    
    // Sequence highlights
    showHighlight(0);
    this.time.delayedCall(2200, () => showHighlight(1));
    this.time.delayedCall(4400, () => showHighlight(2));
    
    // Continue
    this.isTransitioning = false;
    const startNext = () => {
      if (this.isTransitioning) return;
      this.isTransitioning = true;
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(520, () => {
        this.scene.start('OnboardingScene3');
      });
    };
    
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
    
    this.input.once('pointerdown', startNext);
    this.time.delayedCall(7000, startNext);
  }
}
