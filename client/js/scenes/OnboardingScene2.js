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
    const principal = this.add.image(110, height - 205, 'principal-avatar');
    principal.setScale(0.23);
    principal.setDepth(1);
    
    // Dialog box
    const dialogBox = this.add.graphics();
    dialogBox.setDepth(5);
    dialogBox.fillStyle(0x000000, 0.7);
    dialogBox.lineStyle(2, 0xffffff, 0.2);
    const dialogWidth = width - 80;
    const dialogHeight = 140;
    const dialogX = width / 2;
    const dialogY = height - 120;
    dialogBox.fillRoundedRect(dialogX - dialogWidth / 2, dialogY - dialogHeight / 2, dialogWidth, dialogHeight, 16);
    dialogBox.strokeRoundedRect(dialogX - dialogWidth / 2, dialogY - dialogHeight / 2, dialogWidth, dialogHeight, 16);
    const tailY = dialogY + 20;
    dialogBox.fillTriangle(dialogX - dialogWidth / 2 + 10, tailY - 20,
      dialogX - dialogWidth / 2 - 30, tailY,
      dialogX - dialogWidth / 2 + 10, tailY + 20);
    dialogBox.strokeTriangle(dialogX - dialogWidth / 2 + 10, tailY - 20,
      dialogX - dialogWidth / 2 - 30, tailY,
      dialogX - dialogWidth / 2 + 10, tailY + 20);
    
    const dialogText = [
      "here's the basics:",
      '• mr principal’s tour',
      '• game mechanics',
      '• account and avatar management',
      '',
      "you’ll see quests on your dashboard, progress bars on your profile,",
      "and mini-quiz in the library scene! don’t worry —",
      "i’ll pop in whenever you need help."
    ].join('\n');
    
    const dialogTextObj = this.add.text(210, height - 195, '', {
      fontSize: '15px',
      fontFamily: 'monospace',
      fill: '#ffffff',
      wordWrap: { width: width - 260 }
    }).setOrigin(0, 0).setDepth(6);
    this.typeDialogText(dialogTextObj, dialogText);
    
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
      if (this.dialogTypeTimer) {
        this.dialogTypeTimer.remove(false);
        this.dialogTypeTimer = null;
      }
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
      if (this.dialogTypeTimer) {
        this.dialogTypeTimer.remove(false);
        this.dialogTypeTimer = null;
      }
      this.scene.start('LobbyScene');
    });
    
    const prevBtn = this.add.rectangle(80, height - 60, 120, 36, 0x667eea);
    prevBtn.setInteractive({ useHandCursor: true });
    this.add.text(80, height - 60, 'Previous', {
      fontSize: '14px',
      fill: '#ffffff'
    }).setOrigin(0.5);
    prevBtn.on('pointerdown', () => {
      if (this.isTransitioning) return;
      this.isTransitioning = true;
      if (this.dialogTypeTimer) {
        this.dialogTypeTimer.remove(false);
        this.dialogTypeTimer = null;
      }
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(520, () => {
        this.scene.start('OnboardingScene1');
      });
    });

    const nextBtn = this.add.rectangle(width - 80, height - 60, 120, 36, 0x667eea);
    nextBtn.setInteractive({ useHandCursor: true });
    this.add.text(width - 80, height - 60, 'Next', {
      fontSize: '14px',
      fill: '#ffffff'
    }).setOrigin(0.5);
    nextBtn.on('pointerdown', startNext);
  }

  typeDialogText(target, text) {
    if (!target) return;
    if (this.dialogTypeTimer) {
      this.dialogTypeTimer.remove(false);
      this.dialogTypeTimer = null;
    }
    const fullText = String(text || '');
    let index = 0;
    target.setText('');
    this.dialogTypeTimer = this.time.addEvent({
      delay: 45,
      loop: true,
      callback: () => {
        if (index >= fullText.length) {
          if (this.dialogTypeTimer) {
            this.dialogTypeTimer.remove(false);
            this.dialogTypeTimer = null;
          }
          return;
        }
        target.setText(fullText.slice(0, index + 1));
        index += 1;
      }
    });
  }
}
