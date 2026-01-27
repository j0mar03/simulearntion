/**
 * Frame-based Animation Loader for Phaser 3
 * Loads animations from individual frame images or sprite sheets
 * 
 * Frame Structure Options:
 * 1. Individual frames: /assets/animations/base/frame0.png, frame1.png, etc.
 * 2. Sprite sheet: /assets/animations/base.png (with JSON atlas)
 * 3. Fallback: Uses existing GIF images
 */
class FrameAnimator {
  constructor(scene) {
    this.scene = scene;
    this.animationCache = new Map();
    this.frameConfigs = new Map(); // Store frame configurations
  }

  /**
   * Register frame configuration for an animation
   * @param {string} animKey - Animation key (e.g., 'anim-base')
   * @param {Object} config - Configuration object
   *   - frames: Array of frame paths or frame count
   *   - frameRate: Frames per second (default: 10)
   *   - framePath: Base path for frames (e.g., '/assets/animations/base/frame')
   *   - frameCount: Number of frames (if using numbered frames)
   */
  registerAnimation(animKey, config) {
    this.frameConfigs.set(animKey, config);
  }

  /**
   * Create animation from frame images
   * @param {string} animKey - Animation key
   * @param {number} frameRate - Frame rate (default: 10)
   * @returns {Promise<string>} Animation key when ready
   */
  async createAnimationFromFrames(animKey, frameRate = 10) {
    // Check cache
    if (this.animationCache.has(animKey)) {
      return animKey;
    }

    const config = this.frameConfigs.get(animKey);
    
    if (!config) {
      console.warn(`No frame config for ${animKey}, using fallback`);
      return this.createFallbackAnimation(animKey, frameRate);
    }

    try {
      const frames = [];
      
      if (config.frames && Array.isArray(config.frames)) {
        // Load individual frame images
        for (let i = 0; i < config.frames.length; i++) {
          const framePath = config.frames[i];
          const frameKey = `${animKey}-frame-${i}`;
          
          // Load frame if not already loaded
          if (!this.scene.textures.exists(frameKey)) {
            await this.loadFrameImage(framePath, frameKey);
          }
          
          frames.push({
            key: frameKey,
            frame: 0,
            duration: 1000 / frameRate
          });
        }
      } else if (config.framePath && config.frameCount) {
        // Handle single frame (frame.png) or multiple frames (frame0.png, frame1.png, etc.)
        if (config.frameCount === 1) {
          // Single frame: try frame.png
          const singleFramePath = config.framePath + '.png';
          const frameKey = `${animKey}-frame-0`;
          
          try {
            if (!this.scene.textures.exists(frameKey)) {
              await this.loadFrameImage(singleFramePath, frameKey);
            }
            frames.push({
              key: frameKey,
              frame: 0,
              duration: 1000 / frameRate
            });
          } catch (error) {
            console.warn(`Failed to load single frame: ${singleFramePath}`);
            throw error;
          }
        } else {
          // Multiple frames: load frame0.png, frame1.png, etc.
          for (let i = 0; i < config.frameCount; i++) {
            const framePath = `${config.framePath}${i}.png`;
            const frameKey = `${animKey}-frame-${i}`;
            
            try {
              if (!this.scene.textures.exists(frameKey)) {
                await this.loadFrameImage(framePath, frameKey);
              }
              frames.push({
                key: frameKey,
                frame: 0,
                duration: 1000 / frameRate
              });
            } catch (error) {
              console.warn(`Failed to load frame ${i}: ${framePath}`);
              // Stop if we can't load frames
              if (i === 0) throw error;
              break;
            }
          }
        }
      }

      if (frames.length > 0) {
        // Create Phaser animation
        if (!this.scene.anims.exists(animKey)) {
          // Update existing animation frameRate if it exists, otherwise create new
          if (this.scene.anims.exists(animKey)) {
            const anim = this.scene.anims.get(animKey);
            anim.frameRate = frameRate;
          } else {
            this.scene.anims.create({
              key: animKey,
              frames: frames,
              frameRate: frameRate,
              repeat: -1
            });
          }
          console.log(`✅ Created animation ${animKey} with ${frames.length} frames at ${frameRate} fps`);
        }
        
        this.animationCache.set(animKey, true);
        return animKey;
      } else {
        return this.createFallbackAnimation(animKey, frameRate);
      }
    } catch (error) {
      console.error(`Error creating animation ${animKey}:`, error);
      return this.createFallbackAnimation(animKey, frameRate);
    }
  }

  /**
   * Load a single frame image using Image element and create texture
   */
  loadFrameImage(framePath, frameKey) {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (this.scene.textures.exists(frameKey)) {
        resolve();
        return;
      }

      // Create image element to load the frame
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          // Create canvas from image
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          // Add as Phaser texture
          this.scene.textures.addCanvas(frameKey, canvas);
          resolve();
        } catch (error) {
          console.error(`Error creating texture from ${framePath}:`, error);
          reject(error);
        }
      };
      
      img.onerror = () => {
        console.warn(`Failed to load frame: ${framePath}`);
        reject(new Error(`Failed to load ${framePath}`));
      };
      
      img.src = framePath;
    });
  }

  /**
   * Create fallback animation using existing GIF texture
   */
  createFallbackAnimation(animKey, frameRate) {
    if (this.scene.textures.exists(animKey)) {
      if (!this.scene.anims.exists(animKey)) {
        this.scene.anims.create({
          key: animKey,
          frames: [{ key: animKey, frame: 0 }],
          frameRate: frameRate,
          repeat: -1
        });
        console.log(`Created fallback animation ${animKey}`);
      }
      this.animationCache.set(animKey, true);
    }
    return animKey;
  }

  /**
   * Auto-detect frames from a directory
   * Tries to load frames sequentially until one fails
   */
  async autoDetectFrames(animKey, basePath, maxFrames = 20) {
    const frames = [];
    
    for (let i = 0; i < maxFrames; i++) {
      const framePath = `${basePath}${i}.png`;
      const frameKey = `${animKey}-frame-${i}`;
      
      try {
        // Try to load the frame
        await this.loadFrameImage(framePath, frameKey);
        frames.push({
          key: frameKey,
          frame: 0,
          duration: 100
        });
      } catch (error) {
        // Stop when we can't load more frames
        break;
      }
    }
    
    if (frames.length > 0) {
      this.registerAnimation(animKey, { frames: frames.map(f => f.key) });
      return frames.length;
    }
    
    return 0;
  }
}

// Global instance
let frameAnimator = null;
