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
    frameCount: 1  // Only has frame.png (single frame) - will use GIF
  },
  'anim-uniform2': {
    framePath: '/assets/animations/uniform 2/frame',
    frameCount: 1  // Only has frame.png (single frame) - will use GIF
  },
  'anim-cape': {
    framePath: '/assets/animations/cape/frame',
    frameCount: 1  // Only has frame.png (single frame) - will use GIF
  },
  'anim-scarf': {
    framePath: '/assets/animations/scarf/frame',
    frameCount: 1  // Only has frame.png (single frame) - will use GIF
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
    frameCount: 1  // Only has frame.png (single frame)
  },
  'anim-sunglasses': {
    framePath: '/assets/animations/sungglasses/frame',
    frameCount: 1  // Only has frame.png (single frame)
  },
  
  // Combined animations (body + head)
  // Note: Most combined animations only have frame.png (single frame)
  'anim-uniform1-cat': {
    framePath: '/assets/animations/uniform 1 with cat/frame',
    frameCount: 1  // Only has frame.png
  },
  'anim-uniform1-flower': {
    framePath: '/assets/animations/uniform 1 with flower/frame',
    frameCount: 1  // Only has frame.png
  },
  'anim-uniform1-halo': {
    framePath: '/assets/animations/uniform 1 with halo/frame',
    frameCount: 1  // Only has frame.png
  },
  'anim-uniform1-sunglasses': {
    framePath: '/assets/animations/uniform 1 with sungglasses/frame',
    frameCount: 1  // Only has frame.png
  },
  
  'anim-uniform2-cat': {
    framePath: '/assets/animations/uniform 2 with cat/frame',
    frameCount: 1  // Only has frame.png
  },
  'anim-uniform2-flower': {
    framePath: '/assets/animations/uniform 2 with flower/frame',
    frameCount: 1  // Only has frame.png
  },
  'anim-uniform2-halo': {
    framePath: '/assets/animations/uniform 2 with halo/frame',
    frameCount: 1  // Only has frame.png
  },
  'anim-uniform2-sunglasses': {
    framePath: '/assets/animations/uniform 2 with sungglasses/frame',
    frameCount: 1  // Only has frame.png
  },
  
  'anim-cape-cat': {
    framePath: '/assets/animations/cape with cat/frame',
    frameCount: 1  // Only has frame.png
  },
  'anim-cape-flower': {
    framePath: '/assets/animations/cape with flower/frame',
    frameCount: 1  // Only has frame.png
  },
  'anim-cape-halo': {
    framePath: '/assets/animations/cape with halo/frame',
    frameCount: 1  // Only has frame.png
  },
  'anim-cape-sunglasses': {
    framePath: '/assets/animations/cape with sungglasses/frame',
    frameCount: 1  // Only has frame.png
  },
  
  'anim-scarf-cat': {
    framePath: '/assets/animations/scarf with cat/frame',
    frameCount: 1  // Only has frame.png
  },
  'anim-scarf-flower': {
    framePath: '/assets/animations/scarf with flower/frame',
    frameCount: 1  // Only has frame.png
  },
  'anim-scarf-halo': {
    framePath: '/assets/animations/scarf with halo/frame',
    frameCount: 1  // Only has frame.png
  },
  'anim-scarf-sunglasses': {
    framePath: '/assets/animations/scarf with sungglasses/frame',
    frameCount: 1  // Only has frame.png
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
