/**
 * Animation Frame Configuration
 * 
 * All animations are configured with extracted frames (10 frames each)
 */

// Animation frame configurations
// Format: 'animation-key': { framePath: '/path/to/frames', frameCount: number }
const ANIMATION_FRAMES = {
  // Base animations
  'anim-base': {
    framePath: '/assets/animations/base/frame',
    frameCount: 10
  },
  
  // Body animations
  'anim-uniform1': {
    framePath: '/assets/animations/uniform 1/frame',
    frameCount: 10  // Multi-frame walk cycle (frame0.png ... frame9.png)
  },
  'anim-uniform2': {
    framePath: '/assets/animations/uniform 2/frame',
    frameCount: 10  // Multi-frame walk cycle (frame0.png ... frame9.png)
  },
  'anim-cape': {
    framePath: '/assets/animations/cape/frame',
    frameCount: 10  // Multi-frame walk cycle (frame0.png ... frame9.png)
  },
  'anim-scarf': {
    framePath: '/assets/animations/scarf/frame',
    frameCount: 10  // Multi-frame walk cycle (frame0.png ... frame9.png)
  },
  
  // Head/Accessory animations
  'anim-cat': {
    framePath: '/assets/animations/cat/frame',
    frameCount: 10
  },
  'anim-flower': {
    framePath: '/assets/animations/flower/frame',
    frameCount: 10
  },
  'anim-halo': {
    framePath: '/assets/animations/halo/frame',
    frameCount: 10  // Multi-frame walk cycle (frame0.png ... frame9.png)
  },
  'anim-sunglasses': {
    framePath: '/assets/animations/sungglasses/frame',
    frameCount: 10  // Multi-frame walk cycle (frame0.png ... frame9.png)
  },
  
  // Combined animations (body + head)
  // All combined animations now use multi-frame exports
  'anim-uniform1-cat': {
    framePath: '/assets/animations/uniform 1 with cat/frame',
    frameCount: 10
  },
  'anim-uniform1-flower': {
    framePath: '/assets/animations/uniform 1 with flower/frame',
    frameCount: 10
  },
  'anim-uniform1-halo': {
    framePath: '/assets/animations/uniform 1 with halo/frame',
    frameCount: 10
  },
  'anim-uniform1-sunglasses': {
    framePath: '/assets/animations/uniform 1 with sungglasses/frame',
    frameCount: 10
  },
  
  'anim-uniform2-cat': {
    framePath: '/assets/animations/uniform 2 with cat/frame',
    frameCount: 10
  },
  'anim-uniform2-flower': {
    framePath: '/assets/animations/uniform 2 with flower/frame',
    frameCount: 10
  },
  'anim-uniform2-halo': {
    framePath: '/assets/animations/uniform 2 with halo/frame',
    frameCount: 10
  },
  'anim-uniform2-sunglasses': {
    framePath: '/assets/animations/uniform 2 with sungglasses/frame',
    frameCount: 10
  },
  
  'anim-cape-cat': {
    framePath: '/assets/animations/cape with cat/frame',
    frameCount: 10
  },
  'anim-cape-flower': {
    framePath: '/assets/animations/cape with flower/frame',
    frameCount: 10
  },
  'anim-cape-halo': {
    framePath: '/assets/animations/cape with halo/frame',
    frameCount: 10
  },
  'anim-cape-sunglasses': {
    framePath: '/assets/animations/cape with sungglasses/frame',
    frameCount: 10
  },
  
  'anim-scarf-cat': {
    framePath: '/assets/animations/scarf with cat/frame',
    frameCount: 10
  },
  'anim-scarf-flower': {
    framePath: '/assets/animations/scarf with flower/frame',
    frameCount: 10
  },
  'anim-scarf-halo': {
    framePath: '/assets/animations/scarf with halo/frame',
    frameCount: 10
  },
  'anim-scarf-sunglasses': {
    framePath: '/assets/animations/scarf with sungglasses/frame',
    frameCount: 10
  }
};

/**
 * Register all animations with Frame Animator
 */
function registerAnimations(frameAnimator) {
  if (!frameAnimator) {
    console.warn('Frame Animator not available');
    return;
  }
  
  Object.entries(ANIMATION_FRAMES).forEach(([animKey, config]) => {
    frameAnimator.registerAnimation(animKey, config);
    console.log(`✅ Registered animation: ${animKey} (${config.frameCount} frames)`);
  });
  
  console.log(`✅ Registered ${Object.keys(ANIMATION_FRAMES).length} animations`);
}
