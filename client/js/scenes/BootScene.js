// Boot Scene - Asset Loading
class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }
  
  preload() {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
    
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: {
        font: '20px Arial',
        fill: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5);
    
    const percentText = this.make.text({
      x: width / 2,
      y: height / 2,
      text: '0%',
      style: {
        font: '18px Arial',
        fill: '#ffffff'
      }
    });
    percentText.setOrigin(0.5);
    
    // Update loading bar
    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0x667eea, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
      percentText.setText(parseInt(value * 100) + '%');
    });
    
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });
    
    // ===== LOAD ALL GAME ASSETS FROM "Compilations of gokgok simulator 2000" =====
    
    // --- BACKGROUND IMAGES ---
    this.load.image('lobby-bg', '/assets/images/Lobby.png');
    this.load.image('library-bg', '/assets/images/Library.png');
    this.load.image('quiz-bg', '/assets/images/Game 2 UI Layout.png');
    this.load.image('customization-bg', '/assets/images/Avatar Customization.png');
    this.load.image('achievement-bg', '/assets/images/achievementUI.png');
    this.load.image('garden-bg', '/assets/images/Gardenv1.jpg');
    this.load.image('onboarding1-bg', '/assets/images/onboardingscene1.png');

    // --- CHARACTER PORTRAITS ---
    this.load.image('principal-avatar', '/assets/npc icons/principal_racco_default.png');
    this.load.image('sumi-avatar', '/assets/npc icons/councilor_sumi_default.png');
    
    // --- UI BUTTONS ---
    this.load.image('back-btn', '/assets/images/back button.png');
    this.load.image('exit-btn', '/assets/images/exit button.png');
    
    // --- LOBBY UI ---
    this.load.image('profile-ui', '/assets/ui/lobby/profile ui.png');
    this.load.image('username-ui', '/assets/ui/lobby/username ui.png');
    this.load.image('avatar-btn', '/assets/ui/lobby/avatar button.png');
    
    // --- LIBRARY UI ---
    this.load.image('study-btn', '/assets/ui/library ui/study button.png');
    this.load.image('file-upload-btn', '/assets/ui/library ui/file upload button.png');
    
    // --- AVATAR CUSTOMIZATION UI ---
    this.load.image('uniform1-select', '/assets/ui/avatar ui/uniform1 select.png');
    this.load.image('uniform2-select', '/assets/ui/avatar ui/uniform2 select.png');
    this.load.image('cape-select', '/assets/ui/avatar ui/cape select.png');
    this.load.image('scarf-select', '/assets/ui/avatar ui/scarf select.png');
    this.load.image('cat-btn', '/assets/ui/avatar ui/cat button.png');
    this.load.image('flower-select', '/assets/ui/avatar ui/flower select.png');
    this.load.image('halo-select', '/assets/ui/avatar ui/halo select.png');
    this.load.image('sunglasses-btn', '/assets/ui/avatar ui/sunglasses button.png');
    this.load.image('remove-accessory', '/assets/ui/avatar ui/remove accessory button.png');
    this.load.image('locker-ui', '/assets/ui/avatar ui/locker ui.png');
    
    // --- AVATAR STATIC IMAGES (for preview) ---
    this.load.image('avatar-base', '/assets/avatar/base/base.png');
    this.load.image('avatar-uniform1', '/assets/avatar/body/uniform 1.png');
    this.load.image('avatar-uniform2', '/assets/avatar/body/uniform 2.png');
    this.load.image('avatar-cape', '/assets/avatar/body/cape.png');
    this.load.image('avatar-scarf', '/assets/avatar/body/scarf.png');
    this.load.image('avatar-cat', '/assets/avatar/head/cat.png');
    this.load.image('avatar-flower', '/assets/avatar/head/flower.png');
    this.load.image('avatar-halo', '/assets/avatar/head/halo.png');
    this.load.image('avatar-sunglasses', '/assets/avatar/head/sunglasses.png');
    
    // --- ANIMATED SPRITES (GIF converted to spritesheet-like) ---
    // Load base animations
    this.load.image('anim-base', '/assets/animations/base.gif');
    this.load.image('anim-cat', '/assets/animations/cat.gif');
    this.load.image('anim-flower', '/assets/animations/flower.gif');
    this.load.image('anim-halo', '/assets/animations/halo.gif');
    this.load.image('anim-sunglasses', '/assets/animations/sungglasses.gif');
    
    // Body animations
    this.load.image('anim-uniform1', '/assets/animations/uniform 1.gif');
    this.load.image('anim-uniform2', '/assets/animations/uniform 2.gif');
    this.load.image('anim-cape', '/assets/animations/cape.gif');
    this.load.image('anim-scarf', '/assets/animations/scarf.gif');
    
    // Combined animations (body + head)
    this.load.image('anim-uniform1-cat', '/assets/animations/uniform 1 with cat.gif');
    this.load.image('anim-uniform1-flower', '/assets/animations/uniform 1 with flower.gif');
    this.load.image('anim-uniform1-halo', '/assets/animations/uniform 1 with halo.gif');
    this.load.image('anim-uniform1-sunglasses', '/assets/animations/uniform 1 with sungglasses.gif');
    
    this.load.image('anim-uniform2-cat', '/assets/animations/uniform 2 with cat.gif');
    this.load.image('anim-uniform2-flower', '/assets/animations/uniform 2 with flower.gif');
    this.load.image('anim-uniform2-halo', '/assets/animations/uniform 2 with halo.gif');
    this.load.image('anim-uniform2-sunglasses', '/assets/animations/uniform 2 with sungglasses.gif');
    
    this.load.image('anim-cape-cat', '/assets/animations/cape with cat.gif');
    this.load.image('anim-cape-flower', '/assets/animations/cape with flower.gif');
    this.load.image('anim-cape-halo', '/assets/animations/cape with halo.gif');
    this.load.image('anim-cape-sunglasses', '/assets/animations/cape with sungglasses.gif');
    
    this.load.image('anim-scarf-cat', '/assets/animations/scarf with cat.gif');
    this.load.image('anim-scarf-flower', '/assets/animations/scarf with flower.gif');
    this.load.image('anim-scarf-halo', '/assets/animations/scarf with halo.gif');
    this.load.image('anim-scarf-sunglasses', '/assets/animations/scarf with sungglasses.gif');
    
    console.log('✅ All SimuLearntion assets loaded from "Compilations" folder');
  }
  
  create() {
    console.log('✅ BootScene create() called');
    
    // Initialize GIF Animator
    if (typeof GIFAnimator !== 'undefined') {
      gifAnimator = new GIFAnimator(this);
      console.log('✅ GIF Animator initialized');
    } else {
      console.warn('⚠️ GIFAnimator not defined');
    }
    
    // Initialize Frame Animator
    if (typeof FrameAnimator !== 'undefined') {
      frameAnimator = new FrameAnimator(this);
      console.log('✅ Frame Animator initialized');
      
      // Register animations from config file
      if (typeof registerAnimations === 'function') {
        registerAnimations(frameAnimator);
        console.log('✅ Animations registered');
      } else {
        console.warn('⚠️ registerAnimations function not found');
      }
    } else {
      console.warn('⚠️ FrameAnimator not defined');
    }
    
    // Proceed to LoginScene (which will then go to Lobby)
    console.log('🚀 Starting LoginScene...');
    this.scene.start('LoginScene');
  }
}
