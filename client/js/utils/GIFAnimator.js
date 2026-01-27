/**
 * GIF Animator Utility for Phaser 3
 * Creates sprite sheet animations from GIF files
 * Uses a simpler approach that works reliably
 */
class GIFAnimator {
  constructor(scene) {
    this.scene = scene;
    this.animationCache = new Map(); // Cache for loaded animations
    this.loadingPromises = new Map(); // Track loading promises to avoid duplicates
  }

  /**
   * Load GIF and create Phaser animation
   * @param {string} animKey - Animation key (should match texture key from BootScene)
   * @param {string} gifPath - Path to the GIF file
   * @param {number} frameRate - Frame rate (default 10 fps)
   * @returns {Promise<string>} Animation key when ready
   */
  async createAnimationFromGIF(animKey, gifPath, frameRate = 10) {
    // Check if already cached
    if (this.animationCache.has(animKey)) {
      return animKey;
    }

    // Check if already loading
    if (this.loadingPromises.has(animKey)) {
      return this.loadingPromises.get(animKey);
    }

    // Start loading
    const promise = this.loadGIFAndCreateAnimation(animKey, gifPath, frameRate);
    this.loadingPromises.set(animKey, promise);

    try {
      await promise;
      this.animationCache.set(animKey, true);
      return animKey;
    } catch (error) {
      console.error(`Error loading animation ${animKey}:`, error);
      // Create simple animation as fallback
      this.createSimpleAnimation(animKey, frameRate);
      this.animationCache.set(animKey, true);
      return animKey;
    } finally {
      this.loadingPromises.delete(animKey);
    }
  }

  /**
   * Load GIF and try to extract frames
   */
  async loadGIFAndCreateAnimation(animKey, gifPath, frameRate) {
    return new Promise((resolve, reject) => {
      // Check if SuperGif is available
      if (typeof SuperGif === 'undefined') {
        console.warn(`SuperGif not available for ${animKey}, using simple animation`);
        this.createSimpleAnimation(animKey, frameRate);
        resolve(animKey);
        return;
      }

      // Create an img element
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        console.log(`GIF loaded for ${animKey}, extracting frames...`);
        try {
          this.extractFramesWithSuperGif(img, animKey, frameRate)
            .then(() => {
              console.log(`✅ Successfully extracted frames for ${animKey}`);
              resolve(animKey);
            })
            .catch((err) => {
              console.error(`❌ Frame extraction failed for ${animKey}:`, err);
              console.warn(`Falling back to simple animation for ${animKey}`);
              this.createSimpleAnimation(animKey, frameRate);
              resolve(animKey);
            });
        } catch (error) {
          console.error(`❌ Error with SuperGif for ${animKey}:`, error);
          console.warn(`Falling back to simple animation for ${animKey}`);
          this.createSimpleAnimation(animKey, frameRate);
          resolve(animKey);
        }
      };
      
      img.onerror = () => {
        console.error(`❌ Failed to load GIF: ${gifPath} for ${animKey}`);
        console.warn(`Using simple animation fallback for ${animKey}`);
        this.createSimpleAnimation(animKey, frameRate);
        resolve(animKey);
      };
      
      console.log(`Loading GIF: ${gifPath} for ${animKey}`);
      img.src = gifPath;
    });
  }

  /**
   * Extract frames using SuperGif
   */
  async extractFramesWithSuperGif(img, animKey, frameRate) {
    return new Promise((resolve, reject) => {
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = img.width + 'px';
      container.style.height = img.height + 'px';
      document.body.appendChild(container);
      
      const gifImg = img.cloneNode();
      container.appendChild(gifImg);
      
      const superGif = new SuperGif({ gif: gifImg });
      
      superGif.load(() => {
        try {
          const numFrames = superGif.get_length();
          console.log(`SuperGif loaded for ${animKey}, found ${numFrames} frames`);
          
          if (numFrames <= 1) {
            console.warn(`GIF ${animKey} has only ${numFrames} frame(s), cannot animate`);
            document.body.removeChild(container);
            reject(new Error(`GIF has only ${numFrames} frame(s)`));
            return;
          }
          
          const frames = [];
          const framePromises = [];
          
          // Extract all frames
          // Calculate frame duration based on frameRate (default 100ms per frame for 10fps)
          const frameDuration = 1000 / frameRate;
          
          for (let i = 0; i < numFrames; i++) {
            const framePromise = new Promise((frameResolve) => {
              setTimeout(() => {
                superGif.move_to(i);
                
                setTimeout(() => {
                  const canvas = document.createElement('canvas');
                  canvas.width = img.width;
                  canvas.height = img.height;
                  const ctx = canvas.getContext('2d');
                  ctx.drawImage(gifImg, 0, 0);
                  
                  const textureKey = `${animKey}-frame-${i}`;
                  if (!this.scene.textures.exists(textureKey)) {
                    this.scene.textures.addCanvas(textureKey, canvas);
                  }
                  
                  frames.push({
                    key: textureKey,
                    frame: 0,
                    duration: frameDuration
                  });
                  
                  frameResolve();
                }, 100); // Wait for frame to render
              }, i * 150);
            });
            
            framePromises.push(framePromise);
          }
          
          // Wait for all frames
          Promise.all(framePromises).then(() => {
            if (frames.length > 0 && !this.scene.anims.exists(animKey)) {
              this.scene.anims.create({
                key: animKey,
                frames: frames,
                frameRate: frameRate,
                repeat: -1
              });
              console.log(`✅ Created animation ${animKey} with ${frames.length} frames`);
            } else if (frames.length === 0) {
              console.error(`❌ No frames extracted for ${animKey}`);
            } else {
              console.log(`Animation ${animKey} already exists`);
            }
            
            document.body.removeChild(container);
            resolve();
          }).catch((err) => {
            console.error(`Error extracting frames for ${animKey}:`, err);
            document.body.removeChild(container);
            reject(err);
          });
        } catch (error) {
          console.error(`Error in SuperGif load callback for ${animKey}:`, error);
          document.body.removeChild(container);
          reject(error);
        }
      });
      
      // Add error handler for SuperGif
      superGif.onError = (error) => {
        console.error(`SuperGif error for ${animKey}:`, error);
        document.body.removeChild(container);
        reject(error);
      };
    });
  }

  /**
   * Create simple single-frame animation (fallback)
   * This ensures the animation exists even if frame extraction fails
   */
  createSimpleAnimation(animKey, frameRate) {
    // Check if texture exists (loaded in BootScene)
    if (this.scene.textures.exists(animKey)) {
      if (!this.scene.anims.exists(animKey)) {
        this.scene.anims.create({
          key: animKey,
          frames: [{ key: animKey, frame: 0 }],
          frameRate: frameRate,
          repeat: -1
        });
        console.log(`Created simple animation ${animKey}`);
      }
    } else {
      console.warn(`Texture ${animKey} not found`);
    }
  }

  /**
   * Get GIF path from animation key
   */
  getGIFPath(animKey) {
    const keyMap = {
      'anim-base': '/assets/animations/base.gif',
      'anim-cat': '/assets/animations/cat.gif',
      'anim-flower': '/assets/animations/flower.gif',
      'anim-halo': '/assets/animations/halo.gif',
      'anim-sunglasses': '/assets/animations/sungglasses.gif',
      'anim-uniform1': '/assets/animations/uniform 1.gif',
      'anim-uniform2': '/assets/animations/uniform 2.gif',
      'anim-cape': '/assets/animations/cape.gif',
      'anim-scarf': '/assets/animations/scarf.gif',
      'anim-uniform1-cat': '/assets/animations/uniform 1 with cat.gif',
      'anim-uniform1-flower': '/assets/animations/uniform 1 with flower.gif',
      'anim-uniform1-halo': '/assets/animations/uniform 1 with halo.gif',
      'anim-uniform1-sunglasses': '/assets/animations/uniform 1 with sungglasses.gif',
      'anim-uniform2-cat': '/assets/animations/uniform 2 with cat.gif',
      'anim-uniform2-flower': '/assets/animations/uniform 2 with flower.gif',
      'anim-uniform2-halo': '/assets/animations/uniform 2 with halo.gif',
      'anim-uniform2-sunglasses': '/assets/animations/uniform 2 with sungglasses.gif',
      'anim-cape-cat': '/assets/animations/cape with cat.gif',
      'anim-cape-flower': '/assets/animations/cape with flower.gif',
      'anim-cape-halo': '/assets/animations/cape with halo.gif',
      'anim-cape-sunglasses': '/assets/animations/cape with sungglasses.gif',
      'anim-scarf-cat': '/assets/animations/scarf with cat.gif',
      'anim-scarf-flower': '/assets/animations/scarf with flower.gif',
      'anim-scarf-halo': '/assets/animations/scarf with halo.gif',
      'anim-scarf-sunglasses': '/assets/animations/scarf with sungglasses.gif'
    };
    return keyMap[animKey] || '/assets/animations/base.gif';
  }
}

// Global instance (will be initialized in BootScene)
let gifAnimator = null;
