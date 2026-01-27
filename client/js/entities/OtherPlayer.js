// Other Player Entity (Network Players)
class OtherPlayer {
  constructor(scene, playerData) {
    this.scene = scene;
    this.socketId = playerData.socketId;
    this.userId = playerData.userId;
    this.username = playerData.username;
    this.avatarConfig = playerData.avatarConfig || { body: 'u1', head: 'none' };
    
    // Get the correct animation key based on avatar configuration
    this.animKey = getAvatarAnimationKey(this.avatarConfig.body, this.avatarConfig.head);
    
    // Ensure texture exists, use fallback if not
    let textureKey = this.animKey;
    if (!scene.textures.exists(textureKey)) {
      textureKey = 'anim-base'; // Fallback
    }
    
    // Ensure position values are valid (default to center if missing)
    const startX = playerData.x !== undefined ? playerData.x : 400;
    const startY = playerData.y !== undefined ? playerData.y : 300;
    
    // Create sprite (will be used for animation)
    this.sprite = scene.add.sprite(startX, startY, textureKey);
    this.sprite.setScale(0.2); // Scale down from original size
    this.sprite.setAlpha(0.9); // Slightly transparent to differentiate from local player
    this.sprite.setVisible(true); // Ensure sprite is visible from start
    this.sprite.setActive(true); // Ensure sprite is active
    this.sprite.setFrame(0); // Set to first frame
    this.currentAnimation = null;
    this.loadingAnimation = false;
    
    // Update texture to correct one once it's available
    if (textureKey !== this.animKey && scene.textures.exists(this.animKey)) {
      this.sprite.setTexture(this.animKey, 0);
      this.sprite.setFrame(0);
    }
    
    // Ensure sprite shows first frame initially
    if (this.sprite.frame !== undefined) {
      this.sprite.setFrame(0);
    }
    
    // Load and play GIF animation
    this.loadAnimation();
    
    // Create name label
    this.nameText = scene.add.text(startX, startY - 60, playerData.username, {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 2 }
    });
    this.nameText.setOrigin(0.5);
    this.nameText.setDepth(1000); // Always on top
    
    // Target position for smooth movement - use actual position from server
    this.targetX = startX;
    this.targetY = startY;
    this.facing = playerData.facing || 'right';
    
    console.log(`Created OtherPlayer ${playerData.username} at (${startX}, ${startY})`);
  }
  
  async loadAnimation() {
    const frameRate = 24; // Faster animation speed (was 10, now 24 fps)
    
    // Determine if this is a single-frame animation based on known multi-frame animations
    // Multi-frame animations: base, cat, flower (have 10 extracted frames)
    // All others (halo, sunglasses, uniforms, cape, scarf, combined) are single-frame and should use GIF
    const multiFrameAnimations = ['anim-base', 'anim-cat', 'anim-flower'];
    const isSingleFrame = !multiFrameAnimations.includes(this.animKey);
    
    // Also check frameAnimator config if available (for more accurate detection)
    const frameConfig = frameAnimator?.frameConfigs.get(this.animKey);
    const configIsSingleFrame = frameConfig && frameConfig.frameCount === 1;
    const shouldUseGIF = isSingleFrame || configIsSingleFrame;
    
    // For single-frame animations, prefer GIF (which has multiple frames)
    // For multi-frame animations, prefer extracted frames
    if (shouldUseGIF) {
      // Try GIF first for single-frame configs
      if (gifAnimator) {
        try {
          const gifPath = gifAnimator.getGIFPath(this.animKey);
          console.log(`Attempting to load GIF animation: ${this.animKey} from ${gifPath}`);
          await gifAnimator.createAnimationFromGIF(this.animKey, gifPath, frameRate);
          await new Promise(resolve => setTimeout(resolve, 200)); // Give more time for extraction
          
          // Check if animation was actually created with multiple frames
          if (this.scene.anims.exists(this.animKey)) {
            const anim = this.scene.anims.get(this.animKey);
            if (anim.frames && anim.frames.length > 1) {
              this.currentAnimation = this.animKey;
              this.sprite.setVisible(true);
              this.sprite.setAlpha(0.9);
              console.log(`✅ Loaded GIF animation (${anim.frames.length} frames): ${this.animKey}`);
              return;
            } else {
              console.warn(`GIF animation ${this.animKey} only has ${anim.frames?.length || 0} frame(s), trying fallback`);
            }
          } else {
            console.warn(`GIF animation ${this.animKey} was not created, trying fallback`);
          }
        } catch (error) {
          console.error(`GIF animation failed for ${this.animKey}:`, error);
        }
      }
      
      // Fallback: Ensure texture is set even if animation fails
      // At least show the static GIF image
      if (this.scene.textures.exists(this.animKey)) {
        this.sprite.setTexture(this.animKey);
        this.sprite.setVisible(true);
        this.sprite.setAlpha(0.9);
        console.log(`✅ Set texture for ${this.animKey} (animation may not be playing)`);
      }
      
      // Try frame animator as last resort
      if (frameAnimator && frameAnimator.frameConfigs.has(this.animKey)) {
        try {
          await frameAnimator.createAnimationFromFrames(this.animKey, frameRate);
          if (this.scene.anims.exists(this.animKey)) {
            this.currentAnimation = this.animKey;
            this.sprite.setVisible(true);
            this.sprite.setAlpha(0.9);
            console.log(`✅ Loaded single-frame animation: ${this.animKey}`);
            return;
          }
        } catch (error) {
          console.warn('Single-frame animation failed:', error);
        }
      }
    } else {
      // For multi-frame animations, try Frame Animator first
      if (frameAnimator && frameAnimator.frameConfigs.has(this.animKey)) {
        try {
          await frameAnimator.createAnimationFromFrames(this.animKey, frameRate);
          if (this.scene.anims.exists(this.animKey)) {
            this.currentAnimation = this.animKey;
            this.sprite.setVisible(true);
            this.sprite.setAlpha(0.9);
            console.log(`✅ Loaded frame animation: ${this.animKey}`);
            return;
          }
        } catch (error) {
          console.warn('Frame animation failed, trying GIF:', error);
        }
      }
      
      // Try GIF Animator as fallback for multi-frame
      if (gifAnimator) {
        try {
          const gifPath = gifAnimator.getGIFPath(this.animKey);
          await gifAnimator.createAnimationFromGIF(this.animKey, gifPath, frameRate);
          await new Promise(resolve => setTimeout(resolve, 100));
          
          if (this.scene.anims.exists(this.animKey)) {
            this.currentAnimation = this.animKey;
            this.sprite.setVisible(true);
            this.sprite.setAlpha(0.9);
            console.log(`✅ Loaded GIF animation: ${this.animKey}`);
            return;
          }
        } catch (error) {
          console.warn('GIF animation failed:', error);
        }
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
    this.sprite.setVisible(true);
    this.sprite.setAlpha(0.9);
  }
  
  async updateAvatar(avatarConfig) {
    try {
      // Update avatar configuration and sprite
      this.avatarConfig = avatarConfig;
      this.animKey = getAvatarAnimationKey(avatarConfig.body, avatarConfig.head);
      
      const oldX = this.sprite.x;
      const oldY = this.sprite.y;
      const oldFlip = this.sprite.flipX;
      const oldNameText = this.nameText;
      
      // Stop current animation
      if (this.currentAnimation && this.sprite.anims.isPlaying) {
        this.sprite.anims.stop();
      }
      
      // Ensure texture exists before creating sprite
      let textureKey = this.animKey;
      if (!this.scene.textures.exists(textureKey)) {
        textureKey = 'anim-base'; // Fallback
      }
      
      // Replace sprite with new avatar
      this.sprite.destroy();
      
      // Create new sprite at same position
      if (this.scene.textures.exists(textureKey)) {
        this.sprite = this.scene.add.sprite(oldX, oldY, textureKey);
      } else {
        // Fallback to base
        this.sprite = this.scene.add.sprite(oldX, oldY, 'anim-base');
      }
      
      this.sprite.setScale(0.2);
      this.sprite.setAlpha(0.9);
      this.sprite.setFlipX(oldFlip);
      this.sprite.setVisible(true); // Ensure sprite is visible
      this.sprite.setActive(true); // Ensure sprite is active
      this.sprite.setFrame(0); // Set to first frame
      
      // Ensure physics body exists if needed
      if (!this.sprite.body) {
        this.scene.physics.add.existing(this.sprite);
      }
      
      // Recreate name label if it was destroyed
      if (!oldNameText || !oldNameText.active) {
        this.nameText = this.scene.add.text(oldX, oldY - 60, this.username, {
          fontSize: '14px',
          fill: '#ffffff',
          backgroundColor: '#000000',
          padding: { x: 5, y: 2 }
        });
        this.nameText.setOrigin(0.5);
        this.nameText.setDepth(1000);
      } else {
        this.nameText = oldNameText;
      }
      
      // Update to correct texture once available
      if (textureKey !== this.animKey && this.scene.textures.exists(this.animKey)) {
        this.sprite.setTexture(this.animKey, 0);
        this.sprite.setFrame(0);
      }
      
      // Load and play new animation
      await this.loadAnimation();
      
      console.log(`Updated avatar for ${this.username} to ${avatarConfig.body}/${avatarConfig.head}`);
    } catch (error) {
      console.error(`Error updating avatar for ${this.username}:`, error);
      // Ensure sprite is still visible even if update fails
      if (this.sprite) {
        this.sprite.setVisible(true);
        this.sprite.setActive(true);
      }
    }
  }
  
  update() {
    // Always ensure sprite exists and is visible
    if (!this.sprite) {
      console.warn(`Sprite missing for ${this.username}, recreating...`);
      // Try to recreate sprite
      const textureKey = this.scene.textures.exists(this.animKey) ? this.animKey : 'anim-base';
      this.sprite = this.scene.add.sprite(this.targetX, this.targetY, textureKey);
      this.sprite.setScale(0.2);
      this.sprite.setAlpha(0.9);
      this.sprite.setVisible(true);
      this.sprite.setActive(true);
      this.sprite.setFrame(0);
      return;
    }
    
    // Always ensure sprite is visible and active
    if (!this.sprite.visible) {
      this.sprite.setVisible(true);
      this.sprite.setAlpha(0.9);
    }
    if (!this.sprite.active) {
      this.sprite.setActive(true);
    }
    
    // Ensure sprite has a valid texture
    if (!this.sprite.texture || this.sprite.texture.key === '__MISSING') {
      if (this.scene.textures.exists(this.animKey)) {
        this.sprite.setTexture(this.animKey, 0);
        this.sprite.setFrame(0);
      } else if (this.scene.textures.exists('anim-base')) {
        this.sprite.setTexture('anim-base', 0);
        this.sprite.setFrame(0);
      }
      // Force visibility after texture update
      this.sprite.setVisible(true);
      this.sprite.setActive(true);
    }
    
    // Smooth movement towards target position
    const lerpFactor = 0.3; // Increased for more responsive movement
    const threshold = 1; // Distance threshold to consider "arrived"
    
    // Calculate distance to target
    const dx = this.targetX - this.sprite.x;
    const dy = this.targetY - this.sprite.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Move towards target
    if (distance > threshold) {
      // Use lerp for smooth movement
      this.sprite.x += dx * lerpFactor;
      this.sprite.y += dy * lerpFactor;
      
      // Snap to target if very close (prevents jitter)
      if (Math.abs(dx) < threshold) {
        this.sprite.x = this.targetX;
      }
      if (Math.abs(dy) < threshold) {
        this.sprite.y = this.targetY;
      }
    } else {
      // Already at target
      this.sprite.x = this.targetX;
      this.sprite.y = this.targetY;
    }
    
    const isMoving = distance > threshold;
    
    // Play animation when moving, show first frame when idle
    if (isMoving) {
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
      this.sprite.setAlpha(0.9);
    } else {
      // When idle, stop animation and show first frame of texture
      if (this.sprite.anims.isPlaying) {
        this.sprite.anims.stop();
      }
      
      // Always show the texture (first frame) when idle
      let textureToUse = null;
      if (this.scene.textures.exists(this.animKey)) {
        textureToUse = this.animKey;
      } else if (this.scene.textures.exists('anim-base')) {
        textureToUse = 'anim-base';
      }
      
      if (textureToUse) {
        // Set texture and ensure it shows the first frame
        this.sprite.setTexture(textureToUse, 0); // 0 = first frame
        // Ensure the sprite frame is set correctly
        if (this.sprite.frame) {
          this.sprite.setFrame(0);
        }
      }
      
      // Always ensure sprite is visible
      this.sprite.setVisible(true);
      this.sprite.setAlpha(0.9);
      
      // Force update to ensure sprite is rendered
      this.sprite.setActive(true);
    }
    
    // Update name label position to follow sprite
    if (this.nameText && this.sprite) {
      this.nameText.setPosition(this.sprite.x, this.sprite.y - 60);
      // Ensure name label is visible
      if (!this.nameText.visible) {
        this.nameText.setVisible(true);
      }
    }
  }
  
  setTargetPosition(x, y, facing) {
    // Ensure valid position values
    if (x !== undefined && !isNaN(x)) {
      this.targetX = x;
    }
    if (y !== undefined && !isNaN(y)) {
      this.targetY = y;
    }
    
    // Immediately update sprite position if it's far from target (teleport if too far)
    if (this.sprite) {
      const distance = Math.sqrt(
        Math.pow(this.sprite.x - this.targetX, 2) + 
        Math.pow(this.sprite.y - this.targetY, 2)
      );
      
      // If too far away (more than 200 pixels), teleport instead of lerping
      if (distance > 200) {
        this.sprite.x = this.targetX;
        this.sprite.y = this.targetY;
        if (this.nameText) {
          this.nameText.setPosition(this.targetX, this.targetY - 60);
        }
        console.log(`Teleported ${this.username} to (${this.targetX}, ${this.targetY}) - was too far`);
      }
    }
    
    // Update sprite facing if provided
    if (facing && this.sprite) {
      this.facing = facing;
      if (facing === 'left') {
        this.sprite.setFlipX(false);
      } else if (facing === 'right') {
        this.sprite.setFlipX(true);
      }
    }
  }
  
  setPosition(x, y) {
    this.sprite.setPosition(x, y);
    this.targetX = x;
    this.targetY = y;
    this.nameText.setPosition(x, y - 60);
  }
  
  destroy() {
    this.sprite.destroy();
    this.nameText.destroy();
  }
}
