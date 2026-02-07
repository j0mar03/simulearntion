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
    const dialogBox = this.add.graphics();
    dialogBox.setDepth(5);
    dialogBox.fillStyle(0x000000, 0.75);
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
      "hey. i'm sumi, your counselor. let’s build your avatar.",
      '',
      'start by choosing:',
      '• uniform / outfit',
      '• accessories',
      '• head items',
      '',
      'take your time. this is how everyone will see you in-game.'
    ].join('\n');
    
    const dialogTextObj = this.add.text(220, height - 195, '', {
      fontSize: '15px',
      fontFamily: 'monospace',
      fill: '#ffffff',
      wordWrap: { width: width - 270 }
    }).setOrigin(0, 0).setDepth(6);
    this.typeDialogText(dialogTextObj, dialogText);
    
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
      if (this.dialogTypeTimer) {
        this.dialogTypeTimer.remove(false);
        this.dialogTypeTimer = null;
      }
      this.scene.start('CustomScene');
    };
    
    btn.on('pointerdown', openEditor);
    this.input.keyboard.once('keydown-SPACE', openEditor);

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
        this.scene.start('OnboardingScene2');
      });
    });

    const nextBtn = this.add.rectangle(width - 80, height - 60, 120, 36, 0x667eea);
    nextBtn.setInteractive({ useHandCursor: true });
    this.add.text(width - 80, height - 60, 'Next', {
      fontSize: '14px',
      fill: '#ffffff'
    }).setOrigin(0.5);
    nextBtn.on('pointerdown', () => {
      if (this.game.userData) {
        this.game.userData.onboardingActive = true;
        this.game.userData.onboardingReturnScene = 'OnboardingScene4';
      }
      if (this.dialogTypeTimer) {
        this.dialogTypeTimer.remove(false);
        this.dialogTypeTimer = null;
      }
      this.scene.start('OnboardingScene4');
    });

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
