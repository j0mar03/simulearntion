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
    const principal = this.add.image(140, height - 210, 'principal-avatar');
    principal.setScale(0.24);
    principal.setDepth(1);
    
    // Dialog box (speech balloon)
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
      'hey there, newcomer! welcome to Simulearntion!',
      "i'm principal racco.",
      'this world is all about learning, exploring, and leveling up your skills.',
      "before we begin, let me give you a quick tour of how the game works."
    ].join('\n');
    
    const dialogTextObj = this.add.text(220, height - 180, '', {
      fontSize: '16px',
      fontFamily: 'monospace',
      fill: '#ffffff',
      wordWrap: { width: width - 280 }
    }).setOrigin(0, 0).setDepth(6);
    this.typeDialogText(dialogTextObj, dialogText);

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
      if (this.dialogTypeTimer) {
        this.dialogTypeTimer.remove(false);
        this.dialogTypeTimer = null;
      }
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
      if (this.dialogTypeTimer) {
        this.dialogTypeTimer.remove(false);
        this.dialogTypeTimer = null;
      }
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(520, () => {
        this.scene.start('OnboardingScene2');
      });
    };

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
