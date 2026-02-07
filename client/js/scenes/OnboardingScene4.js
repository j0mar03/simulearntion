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
      "and that’s it! you’re officially part of the school!",
      "your journey starts now. learn, grow, and most importantly — have fun.",
      "alright, player — let’s get started!"
    ].join('\n');
    
    const dialogTextObj = this.add.text(200, height - 185, '', {
      fontSize: '16px',
      fontFamily: 'monospace',
      fill: '#ffffff',
      wordWrap: { width: width - 260 }
    }).setOrigin(0, 0).setDepth(6);
    this.typeDialogText(dialogTextObj, dialogText);
    
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
      if (this.dialogTypeTimer) {
        this.dialogTypeTimer.remove(false);
        this.dialogTypeTimer = null;
      }
      this.scene.start('LobbyScene');
    };
    
    startBtn.on('pointerdown', startGame);
    this.input.keyboard.once('keydown-SPACE', startGame);

    const prevBtn = this.add.rectangle(80, height - 60, 120, 36, 0x667eea);
    prevBtn.setInteractive({ useHandCursor: true });
    this.add.text(80, height - 60, 'Previous', {
      fontSize: '14px',
      fill: '#ffffff'
    }).setOrigin(0.5);
    prevBtn.on('pointerdown', () => {
      if (this.dialogTypeTimer) {
        this.dialogTypeTimer.remove(false);
        this.dialogTypeTimer = null;
      }
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(520, () => {
        this.scene.start('OnboardingScene3');
      });
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
