# Animation Setup Guide

## Overview
The game now supports **frame-based animations** using extracted PNG frames from your GIFs. This is more reliable than extracting frames at runtime.

## Option 1: Using Extracted Frame Images (Recommended)

### Step 1: Extract Frames from GIFs
Extract your GIF frames as individual PNG images. You can use:
- Online tools: https://ezgif.com/split
- ImageMagick: `convert animation.gif frame%d.png`
- Python PIL: See example below

### Step 2: Organize Frames
Create folders for each animation in `/client/assets/animations/`:

```
client/assets/animations/
├── base/
│   ├── frame0.png
│   ├── frame1.png
│   ├── frame2.png
│   └── ...
├── uniform1/
│   ├── frame0.png
│   ├── frame1.png
│   └── ...
└── ...
```

### Step 3: Register Animations
Edit `/client/js/scenes/BootScene.js` in the `create()` method:

```javascript
// Register animations with frame counts
frameAnimator.registerAnimation('anim-base', {
  framePath: '/assets/animations/base/frame',
  frameCount: 8  // Number of frames
});

frameAnimator.registerAnimation('anim-uniform1', {
  framePath: '/assets/animations/uniform1/frame',
  frameCount: 8
});

// Or specify individual frame paths
frameAnimator.registerAnimation('anim-cat', {
  frames: [
    '/assets/animations/cat/frame0.png',
    '/assets/animations/cat/frame1.png',
    '/assets/animations/cat/frame2.png',
    // ... etc
  ]
});
```

### Step 4: Rebuild Docker
```bash
docker compose build app
docker compose up -d
```

## Option 2: Python Script to Extract Frames

Create a script to extract frames from all your GIFs:

```python
from PIL import Image
import os

def extract_gif_frames(gif_path, output_dir):
    """Extract frames from a GIF file"""
    os.makedirs(output_dir, exist_ok=True)
    
    gif = Image.open(gif_path)
    frame_count = 0
    
    try:
        while True:
            frame = gif.copy()
            frame.save(f"{output_dir}/frame{frame_count}.png", "PNG")
            frame_count += 1
            gif.seek(gif.tell() + 1)
    except EOFError:
        pass
    
    print(f"Extracted {frame_count} frames from {gif_path}")
    return frame_count

# Extract all GIFs
animations_dir = "Compilations of gokgok simulator 2000/Animation"
output_base = "gokgok-multiplayer/client/assets/animations"

gif_files = [
    ("base.gif", "base"),
    ("uniform 1.gif", "uniform1"),
    ("uniform 2.gif", "uniform2"),
    ("cape.gif", "cape"),
    ("scarf.gif", "scarf"),
    ("cat.gif", "cat"),
    ("flower.gif", "flower"),
    ("halo.gif", "halo"),
    ("sungglasses.gif", "sunglasses"),
    # Add all combinations...
]

for gif_file, folder_name in gif_files:
    gif_path = os.path.join(animations_dir, gif_file)
    output_dir = os.path.join(output_base, folder_name)
    
    if os.path.exists(gif_path):
        extract_gif_frames(gif_path, output_dir)
```

## Option 3: Auto-Detection (Experimental)

The system can auto-detect frames by trying to load them sequentially:

```javascript
// In BootScene.create()
frameAnimator.autoDetectFrames('anim-base', '/assets/animations/base/frame', 20)
  .then(frameCount => {
    if (frameCount > 0) {
      console.log(`Auto-detected ${frameCount} frames for anim-base`);
    }
  });
```

## Animation Keys Reference

Map your GIF names to animation keys:

| GIF File | Animation Key | Folder Name |
|----------|---------------|-------------|
| base.gif | anim-base | base |
| uniform 1.gif | anim-uniform1 | uniform1 |
| uniform 2.gif | anim-uniform2 | uniform2 |
| cape.gif | anim-cape | cape |
| scarf.gif | anim-scarf | scarf |
| cat.gif | anim-cat | cat |
| flower.gif | anim-flower | flower |
| halo.gif | anim-halo | halo |
| sungglasses.gif | anim-sunglasses | sunglasses |
| uniform 1 with cat.gif | anim-uniform1-cat | uniform1-cat |
| ... | ... | ... |

## Testing

After setup:
1. Rebuild Docker: `docker compose build app && docker compose up -d`
2. Open browser console (F12)
3. Look for: `✅ Loaded frame animation: anim-base`
4. Move your character - animations should play!

## Troubleshooting

- **No animations playing**: Check browser console for errors
- **Frames not loading**: Verify file paths and frame counts
- **Wrong animation**: Check animation key matches folder name
- **Missing frames**: Ensure all frames are numbered sequentially (frame0.png, frame1.png, etc.)

## Current Status

The system will:
1. ✅ Try to load frame-based animations first (if registered)
2. ✅ Fall back to GIF extraction (if SuperGif works)
3. ✅ Fall back to single-frame animation (always works)

This ensures animations work even if frame extraction fails!
