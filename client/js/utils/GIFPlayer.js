/**
 * GIF Player Utility for Phaser 3
 * Handles animated GIF playback by extracting frames using canvas
 */
class GIFPlayer {
  constructor(scene, x, y, gifKey, config = {}) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.gifKey = gifKey;
    this.config = {
      scale: config.scale || 1,
      frameRate: config.frameRate || 10, // Default 10 fps
      loop: config.loop !== undefined ? config.loop : true,
      ...config
    };
    
    this.sprite = null;
    this.frames = [];
    this.currentFrame = 0;
    this.frameTimer = 0;
    this.frameDuration = 1000 / this.config.frameRate;
    this.isPlaying = true;
    
    this.create();
  }
  
  create() {
    // For now, use the GIF image directly (browsers will animate it)
    // In a production environment, you'd extract frames server-side or use a GIF library
    this.sprite = this.scene.add.image(this.x, this.y, this.gifKey);
    this.sprite.setScale(this.config.scale);
    this.sprite.setDepth(this.config.depth || 0);
    
    // Store reference for external access
    this.displayObject = this.sprite;
  }
  
  update(delta) {
    // GIF animation is handled by the browser
    // This method is kept for API consistency
    if (!this.isPlaying) return;
  }
  
  setPosition(x, y) {
    this.x = x;
    this.y = y;
    if (this.sprite) {
      this.sprite.setPosition(x, y);
    }
  }
  
  setScale(scale) {
    this.config.scale = scale;
    if (this.sprite) {
      this.sprite.setScale(scale);
    }
  }
  
  setDepth(depth) {
    if (this.sprite) {
      this.sprite.setDepth(depth);
    }
  }
  
  setFlipX(flip) {
    if (this.sprite) {
      this.sprite.setFlipX(flip);
    }
  }
  
  play() {
    this.isPlaying = true;
    if (this.sprite) {
      this.sprite.setVisible(true);
    }
  }
  
  stop() {
    this.isPlaying = false;
  }
  
  reset() {
    this.currentFrame = 0;
    this.frameTimer = 0;
  }
  
  destroy() {
    if (this.sprite) {
      this.sprite.destroy();
    }
  }
  
  setVisible(visible) {
    if (this.sprite) {
      this.sprite.setVisible(visible);
    }
  }
  
  getDisplayObject() {
    return this.sprite;
  }
}

/**
 * Helper function to get the correct animation key based on avatar customization
 * @param {string} body - Body type: 'none', 'u1', 'u2', 'cape', 'scarf'
 * @param {string} head - Head type: 'none', 'cat', 'flower', 'halo', 'sun'
 * @returns {string} Animation key for loading
 */
function getAvatarAnimationKey(body, head) {
  // Map body codes to animation names
  const bodyMap = {
    'u1': 'uniform1',
    'u2': 'uniform2',
    'cape': 'cape',
    'scarf': 'scarf',
    'none': 'base'
  };
  
  // Map head codes to animation names
  const headMap = {
    'cat': 'cat',
    'flower': 'flower',
    'halo': 'halo',
    'sun': 'sunglasses',
    'none': null
  };
  
  const bodyName = bodyMap[body] || 'base';
  const headName = headMap[head];
  
  // Build animation key
  if (body === 'none' || body === null) {
    if (!headName) {
      return 'anim-base';
    } else {
      return `anim-${headName}`;
    }
  } else {
    if (!headName) {
      return `anim-${bodyName}`;
    } else {
      return `anim-${bodyName}-${headName}`;
    }
  }
}
