// Player Entity (Local Player)
class Player {
  constructor(scene, x, y, username, avatarConfig, title) {
    this.scene = scene;
    this.username = username || 'Player';
    const fallbackTitle = window.DEFAULT_PLAYER_TITLE || 'Rookie';
    this.title = title || (scene && scene.game && scene.game.userData && scene.game.userData.currentTitle) || fallbackTitle;
    
    // Ensure avatarConfig is valid
    if (!avatarConfig || typeof avatarConfig !== 'object') {
      avatarConfig = { body: 'u1', head: 'none' };
    }
    if (!avatarConfig.body) avatarConfig.body = 'u1';
    if (!avatarConfig.head) avatarConfig.head = 'none';
    
    this.avatarConfig = avatarConfig;
    
    try {
      // Get the correct animation key based on avatar configuration
      this.animKey = getAvatarAnimationKey(this.avatarConfig.body, this.avatarConfig.head);
      
      // Ensure texture exists, use fallback if not
      let textureKey = this.animKey;
      if (!scene.textures.exists(textureKey)) {
        // Fallback to base texture if current one doesn't exist
        textureKey = 'anim-base';
        if (!scene.textures.exists(textureKey)) {
          console.warn(`Texture ${this.animKey} not found, sprite may not display`);
        }
      }
      
      // Create sprite - use image first to ensure it displays immediately
      // Check if texture exists, if not wait a frame and try again
      if (scene.textures.exists(textureKey)) {
        this.sprite = scene.add.sprite(x, y, textureKey);
      } else {
        // Create with a placeholder that definitely exists, then update
        const placeholderKey = scene.textures.exists('anim-base') ? 'anim-base' : textureKey;
        this.sprite = scene.add.sprite(x, y, placeholderKey);
        
        // Try to update to correct texture after a short delay
        scene.time.delayedCall(100, () => {
          if (scene.textures.exists(this.animKey)) {
            this.sprite.setTexture(this.animKey);
          }
        });
      }
      
      this.sprite.setScale(0.2); // Scale down from original size (60x100 target)
      this.sprite.setVisible(true); // Ensure sprite is visible from start
      this.sprite.setAlpha(1.0); // Ensure fully opaque
      this.sprite.setActive(true); // Ensure sprite is active
      this.sprite.setFrame(0); // Set to first frame
      scene.physics.add.existing(this.sprite);
      this.sprite.body.setCollideWorldBounds(true);
      this.sprite.body.setSize(60, 100); // Set physics body size
      
      // Force texture update if needed
      if (this.sprite.texture && this.sprite.texture.key === '__MISSING') {
        if (scene.textures.exists(this.animKey)) {
          this.sprite.setTexture(this.animKey, 0);
          this.sprite.setFrame(0);
        } else if (scene.textures.exists('anim-base')) {
          this.sprite.setTexture('anim-base', 0);
          this.sprite.setFrame(0);
        }
      }
      
      // Ensure sprite shows first frame initially
      if (this.sprite.frame !== undefined) {
        this.sprite.setFrame(0);
      }
      
      // Create name label
      this.nameText = scene.add.text(x, y - 70, this.username, {
        fontSize: '14px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 5, y: 2 }
      });
      this.nameText.setOrigin(0.5);
      this.nameText.setDepth(1000); // Always on top
      
      // Create title label
      this.titleText = scene.add.text(x, y - 52, this.title, {
        fontSize: '12px',
        fill: '#ffd700',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: { x: 4, y: 1 }
      });
      this.titleText.setOrigin(0.5);
      this.titleText.setDepth(1000);
      
    // Movement properties
    this.speed = 160;
    this.facing = 'right';
    this.isMoving = false;
    this.currentAnimation = null;
    this.loadingAnimation = false;
    
    // Network movement tracking (avoid per-frame spam)
    this.lastSentX = x;
    this.lastSentY = y;
    this.lastSentFacing = this.facing;
    this.lastSentAt = 0;
      
      // Input
      try {
        this.cursors = scene.input.keyboard.createCursorKeys();
      } catch (error) {
        console.error('Error creating cursors:', error);
        this.cursors = null;
      }
      
      // Load and play GIF animation
      try {
        this.loadAnimation();
      } catch (error) {
        console.error('Error loading animation:', error);
        // Continue without animation
      }
    } catch (error) {
      console.error('Error in Player constructor:', error);
      // Set minimal properties to prevent further errors
      this.sprite = null;
      this.cursors = null;
      this.nameText = null;
      this.titleText = null;
      // Don't throw - allow scene to continue
    }
  }
  
  async loadAnimation() {
    const frameRate = 24; // Faster animation speed (was 10, now 24 fps)
    
    // Always prefer frame-based animations when available, then fall back to GIF.
    if (frameAnimator && frameAnimator.frameConfigs.has(this.animKey)) {
      try {
        await frameAnimator.createAnimationFromFrames(this.animKey, frameRate);
        if (this.scene.anims.exists(this.animKey)) {
          this.currentAnimation = this.animKey;
          
          // Set a visible static frame for idle state (before movement).
          const anim = this.scene.anims.get(this.animKey);
          if (anim && anim.frames && anim.frames.length > 0) {
            const firstFrame = anim.frames[0];
            const textureKey = firstFrame.key || firstFrame.textureKey;
            if (textureKey && this.scene.textures.exists(textureKey)) {
              this.sprite.setTexture(textureKey, 0);
            }
          }
          
          this.sprite.setVisible(true);
          this.sprite.setAlpha(1.0);
          console.log(`✅ Loaded frame animation: ${this.animKey}`);
          return;
        }
      } catch (error) {
        console.warn('Frame animation failed, trying GIF:', error);
      }
    }
    
    // Fallback: try GIF-based animation
    if (gifAnimator) {
      try {
        const gifPath = gifAnimator.getGIFPath(this.animKey);
        console.log(`Attempting to load GIF animation: ${this.animKey} from ${gifPath}`);
        await gifAnimator.createAnimationFromGIF(this.animKey, gifPath, frameRate);
        await new Promise(resolve => setTimeout(resolve, 200));
        
        if (this.scene.anims.exists(this.animKey)) {
          const anim = this.scene.anims.get(this.animKey);
          if (anim.frames && anim.frames.length > 1) {
            this.currentAnimation = this.animKey;
            this.sprite.setVisible(true);
            this.sprite.setAlpha(1.0);
            console.log(`✅ Loaded GIF animation (${anim.frames.length} frames): ${this.animKey}`);
            return;
          }
        }
      } catch (error) {
        console.error(`GIF animation failed for ${this.animKey}:`, error);
      }
    }
    
    // Final fallback: single frame animation
    if (!this.scene.anims.exists(this.animKey)) {
      this.scene.anims.create({
        key: this.animKey,
        frames: [{ key: this.animKey, frame: 0 }],
        frameRate: frameRate,
        repeat: -1
      });
    }
    this.currentAnimation = this.animKey;
    // Ensure sprite is visible with correct texture
    this.sprite.setVisible(true);
    this.sprite.setAlpha(1.0);
    if (this.scene.textures.exists(this.animKey)) {
      this.sprite.setTexture(this.animKey);
    }
    // Ensure sprite is visible with correct texture
    this.sprite.setVisible(true);
    this.sprite.setAlpha(1.0);
    console.log(`Created fallback animation: ${this.animKey}`);
  }
  
  async updateAvatar(avatarConfig) {
    // Update avatar configuration and sprite
    this.avatarConfig = avatarConfig;
    this.animKey = getAvatarAnimationKey(avatarConfig.body, avatarConfig.head);
    
    const oldX = this.sprite.x;
    const oldY = this.sprite.y;
    const oldFlip = this.sprite.flipX;
    
    // Stop current animation
    if (this.currentAnimation) {
      this.sprite.stop();
    }
    
    // Ensure texture exists before creating sprite
    let textureKey = this.animKey;
    if (!this.scene.textures.exists(textureKey)) {
      textureKey = this.scene.textures.exists('anim-base') ? 'anim-base' : textureKey;
    }
    
    // Replace sprite with new avatar
    this.sprite.destroy();
    
    // Create sprite with existing texture
    if (this.scene.textures.exists(textureKey)) {
      this.sprite = this.scene.add.sprite(oldX, oldY, textureKey);
    } else {
      // Fallback: create with base texture
      const placeholderKey = this.scene.textures.exists('anim-base') ? 'anim-base' : textureKey;
      this.sprite = this.scene.add.sprite(oldX, oldY, placeholderKey);
      
      // Try to update to correct texture after a short delay
      this.scene.time.delayedCall(100, () => {
        if (this.scene.textures.exists(this.animKey)) {
          this.sprite.setTexture(this.animKey);
        }
      });
    }
    
    this.sprite.setScale(0.2);
    this.sprite.setFlipX(oldFlip);
    this.sprite.setVisible(true); // Ensure sprite is visible
    this.sprite.setAlpha(1.0); // Ensure fully opaque
    this.scene.physics.add.existing(this.sprite);
    this.sprite.body.setCollideWorldBounds(true);
    this.sprite.body.setSize(60, 100);
    
    // Force texture update if needed
    if (this.sprite.texture && this.sprite.texture.key === '__MISSING') {
      if (this.scene.textures.exists(this.animKey)) {
        this.sprite.setTexture(this.animKey);
      } else if (this.scene.textures.exists('anim-base')) {
        this.sprite.setTexture('anim-base');
      }
    }
    
    // Load and play new animation
    await this.loadAnimation();
  }
  
  update() {
    // Always ensure sprite is visible and active
    if (!this.sprite.visible) {
      this.sprite.setVisible(true);
      this.sprite.setAlpha(1.0);
    }
    if (!this.sprite.active) {
      this.sprite.setActive(true);
    }
    
    // Ensure sprite has a valid texture
    if (!this.sprite.texture || this.sprite.texture.key === '__MISSING') {
      // Prefer a frame from the current animation if available
      if (this.currentAnimation && this.scene.anims.exists(this.currentAnimation)) {
        const anim = this.scene.anims.get(this.currentAnimation);
        if (anim && anim.frames && anim.frames.length > 0) {
          const firstFrame = anim.frames[0];
          const textureKey = firstFrame.key || firstFrame.textureKey;
          if (textureKey && this.scene.textures.exists(textureKey)) {
            this.sprite.setTexture(textureKey, 0);
          }
        }
      } else if (this.scene.textures.exists(this.animKey)) {
        this.sprite.setTexture(this.animKey, 0);
        this.sprite.setFrame(0);
      } else if (this.scene.textures.exists('anim-base')) {
        this.sprite.setTexture('anim-base', 0);
        this.sprite.setFrame(0);
      }
    }
    
    // Reset velocity
    this.sprite.body.setVelocity(0);
    this.isMoving = false;
    
    // Movement
    const touchState = (window.touchControls && window.touchControls.state) ? window.touchControls.state : null;
    const leftDown = (this.cursors && this.cursors.left && this.cursors.left.isDown) || (touchState && touchState.left);
    const rightDown = (this.cursors && this.cursors.right && this.cursors.right.isDown) || (touchState && touchState.right);
    const upDown = (this.cursors && this.cursors.up && this.cursors.up.isDown) || (touchState && touchState.up);
    const downDown = (this.cursors && this.cursors.down && this.cursors.down.isDown) || (touchState && touchState.down);

    const touchActive = touchState && touchState.active;
    if (touchActive) {
      const vx = touchState.axisX * this.speed;
      const vy = touchState.axisY * this.speed;
      this.sprite.body.setVelocity(vx, vy);
      if (Math.abs(vx) > 1) {
        this.facing = vx < 0 ? 'left' : 'right';
        this.sprite.setFlipX(vx > 0);
      }
      if (Math.abs(vx) > 1 || Math.abs(vy) > 1) {
        this.isMoving = true;
      }
    } else {
      if (leftDown) {
        this.sprite.body.setVelocityX(-this.speed);
        this.facing = 'left';
        this.isMoving = true;
        this.sprite.setFlipX(false); // Facing left
      } else if (rightDown) {
        this.sprite.body.setVelocityX(this.speed);
        this.facing = 'right';
        this.isMoving = true;
        this.sprite.setFlipX(true); // Facing right
      }
      
      if (upDown) {
        this.sprite.body.setVelocityY(-this.speed);
        this.isMoving = true;
      } else if (downDown) {
        this.sprite.body.setVelocityY(this.speed);
        this.isMoving = true;
      }
    }
    
    // Play animation when moving, show first frame when idle
    if (this.isMoving) {
      // Try to play animation - check multiple options
      let animationPlayed = false;
      
      // First try the current animation key
      if (this.scene.anims.exists(this.animKey)) {
        if (!this.sprite.anims.isPlaying || this.sprite.anims.currentAnim.key !== this.animKey) {
          this.sprite.play(this.animKey);
          animationPlayed = true;
        } else {
          animationPlayed = true;
        }
      }
      // Try currentAnimation if animKey didn't work
      else if (this.currentAnimation && this.scene.anims.exists(this.currentAnimation)) {
        if (!this.sprite.anims.isPlaying || this.sprite.anims.currentAnim.key !== this.currentAnimation) {
          this.sprite.play(this.currentAnimation);
          animationPlayed = true;
        } else {
          animationPlayed = true;
        }
      }
      // If no animation exists, try to create/load it
      else {
        // Try to load animation again if it doesn't exist
        if (!this.loadingAnimation) {
          this.loadingAnimation = true;
          this.loadAnimation().then(() => {
            this.loadingAnimation = false;
            if (this.scene.anims.exists(this.animKey)) {
              this.sprite.play(this.animKey);
            }
          }).catch(() => {
            this.loadingAnimation = false;
          });
        }
        // While loading, at least show the texture
        if (this.scene.textures.exists(this.animKey)) {
          this.sprite.setTexture(this.animKey);
        }
      }
      
      // Ensure sprite is visible when moving
      this.sprite.setVisible(true);
      this.sprite.setAlpha(1.0);
    } else {
      // When idle, stop animation but keep the last visible frame.
      if (this.sprite.anims.isPlaying) {
        this.sprite.anims.stop();
      }
      
      // Ensure sprite is visible and opaque
      this.sprite.setVisible(true);
      this.sprite.setAlpha(1.0);
      
      // Force update to ensure sprite is rendered
      this.sprite.setActive(true);
    }
    
    // Update name label position
    this.nameText.setPosition(this.sprite.x, this.sprite.y - 70);
    if (this.titleText) {
      this.titleText.setPosition(this.sprite.x, this.sprite.y - 52);
    }
    
    // Send position to server if moved (track last sent, not same-frame position)
    const dx = this.sprite.x - this.lastSentX;
    const dy = this.sprite.y - this.lastSentY;
    const movedEnough = Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5;
    const facingChanged = this.facing !== this.lastSentFacing;
    const now = this.scene && this.scene.time ? this.scene.time.now : Date.now();
    const timeSinceLast = now - this.lastSentAt;
    
    if ((movedEnough || facingChanged) && timeSinceLast > 50) {
      socketManager.sendMove(this.sprite.x, this.sprite.y, this.facing);
      this.lastSentX = this.sprite.x;
      this.lastSentY = this.sprite.y;
      this.lastSentFacing = this.facing;
      this.lastSentAt = now;
    }
  }
  
  setPosition(x, y) {
    this.sprite.setPosition(x, y);
    this.nameText.setPosition(x, y - 70);
    if (this.titleText) {
      this.titleText.setPosition(x, y - 52);
    }
  }
  
  setTitle(title) {
    if (!title) return;
    this.title = title;
    if (this.titleText) {
      this.titleText.setText(title);
    }
  }
  
  destroy() {
    this.sprite.destroy();
    this.nameText.destroy();
    if (this.titleText) {
      this.titleText.destroy();
    }
  }
}
