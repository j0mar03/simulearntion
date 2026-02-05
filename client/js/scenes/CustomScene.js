// Avatar Customization Scene
class CustomScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CustomScene' });
  }
  
  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Background - Use real customization image from "Compilations of gokgok simulator 2000"
    const customBg = this.add.image(0, 0, 'customization-bg').setOrigin(0);
    customBg.setDisplaySize(width, height);
    
    // Title
    this.add.text(width / 2, 30, 'Avatar Customization', {
      fontSize: '32px',
      fill: '#ffffff',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setDepth(10);
    
    // Back button - using real asset
    const backBtn = this.add.image(50, 30, 'back-btn');
    backBtn.setScale(0.15); // Much smaller size
    backBtn.setInteractive({ useHandCursor: true });
    backBtn.setDepth(10);
    
    backBtn.on('pointerdown', () => {
      this.saveAndExit();
    });
    
    // Current avatar config
    const userData = this.game.userData;
    this.currentBody = userData.avatarConfig.body || 'u1';
    this.currentHead = userData.avatarConfig.head || 'none';
    this.unlockedItems = userData.unlockedItems || {};
    this.isAdmin = userData.isAdmin || false;
    
    // Preview area
    this.add.text(150, 80, 'PREVIEW:', {
      fontSize: '18px',
      fill: '#000000'
    });
    
    // Preview sprite - using actual avatar images
    this.updatePreview();
    
    // Current selection display
    this.bodyText = this.add.text(150, 400, `Body: ${this.currentBody.toUpperCase()}`, {
      fontSize: '16px',
      fill: '#000000'
    });
    
    this.headText = this.add.text(150, 430, `Head: ${this.currentHead.toUpperCase()}`, {
      fontSize: '16px',
      fill: '#000000'
    });
    
    // Body/Clothes section
    this.add.text(450, 80, 'BODY/CLOTHES', {
      fontSize: '20px',
      fill: '#000000',
      fontStyle: 'bold'
    });
    
    // Load unlock status and create buttons
    this.loadUnlockStatus();
    
    // Instructions
    this.add.text(width / 2, height - 30, 'Click items to customize | Changes visible to others immediately', {
      fontSize: '14px',
      fill: '#000000',
      backgroundColor: '#ffffff',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
  }
  
  async loadUnlockStatus() {
    // Fetch unlock status from server
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.unlockedItems = data.unlockedItems || {};
        this.isAdmin = data.isAdmin || false;
        
        // Update userData
        if (this.game.userData) {
          this.game.userData.unlockedItems = this.unlockedItems;
          this.game.userData.isAdmin = this.isAdmin;
        }
      }
    } catch (error) {
      console.error('Failed to load unlock status:', error);
    }
    
    // Create buttons with unlock status
    this.createBodyButtons();
    this.createHeadButtons();
  }
  
  createBodyButtons() {
    const bodyItems = [
      { id: 'u1', name: 'Uniform 1', key: 'avatar-uniform1', x: 450, y: 130 },
      { id: 'u2', name: 'Uniform 2', key: 'avatar-uniform2', x: 550, y: 130 },
      { id: 'cape', name: 'Cape', key: 'avatar-cape', x: 450, y: 220 },
      { id: 'scarf', name: 'Scarf', key: 'avatar-scarf', x: 550, y: 220 },
      { id: 'none', name: 'Remove', key: null, x: 500, y: 310 }
    ];
    
    bodyItems.forEach(item => {
      // Check if item is unlocked (admin has all unlocked)
      const isUnlocked = this.isAdmin || this.unlockedItems[item.id] !== false;
      
      const btn = this.add.rectangle(item.x, item.y, 80, 70, 
        isUnlocked ? 0xcccccc : 0x888888);
      btn.setInteractive({ useHandCursor: isUnlocked });
      
      // Add icon image if available (except for 'none')
      if (item.key && item.id !== 'none') {
        const icon = this.add.image(item.x, item.y - 10, item.key);
        icon.setScale(0.12); // Much smaller icon size
        icon.setDepth(11);
      }
      
      const text = this.add.text(item.x, item.y + 25, item.name, {
        fontSize: '12px',
        fill: '#000000',
        align: 'center'
      }).setOrigin(0.5);
      
      if (!isUnlocked) {
        const lock = this.add.text(item.x, item.y - 20, '🔒', {
          fontSize: '16px'
        }).setOrigin(0.5).setDepth(12);
      }
      
      if (isUnlocked) {
        btn.on('pointerdown', () => {
          this.selectBody(item.id);
        });
      }
    });
  }
  
  createHeadButtons() {
    const headItems = [
      { id: 'cat', name: 'Cat', key: 'avatar-cat', x: 650, y: 130 },
      { id: 'flower', name: 'Flower', key: 'avatar-flower', x: 650, y: 230 },
      { id: 'halo', name: 'Halo', key: 'avatar-halo', x: 650, y: 330 },
      { id: 'sun', name: 'Sunglasses', key: 'avatar-sunglasses', x: 650, y: 430 },
      { id: 'none', name: 'Remove', key: null, x: 650, y: 530 }
    ];
    
    headItems.forEach(item => {
      // Check if item is unlocked (admin has all unlocked)
      const isUnlocked = this.isAdmin || this.unlockedItems[item.id] !== false;
      
      const btn = this.add.rectangle(item.x, item.y, 100, 80,
        isUnlocked ? 0xffc0cb : 0x888888);
      btn.setInteractive({ useHandCursor: isUnlocked });
      
      // Add icon image if available (except for 'none')
      if (item.key && item.id !== 'none') {
        const icon = this.add.image(item.x, item.y - 15, item.key);
        icon.setScale(0.12); // Much smaller icon size
        icon.setDepth(11);
      }
      
      const text = this.add.text(item.x, item.y + 25, item.name, {
        fontSize: '12px',
        fill: '#000000',
        align: 'center'
      }).setOrigin(0.5);
      
      if (!isUnlocked) {
        const lock = this.add.text(item.x, item.y - 25, '🔒', {
          fontSize: '16px'
        }).setOrigin(0.5).setDepth(12);
      }
      
      if (isUnlocked) {
        btn.on('pointerdown', () => {
          this.selectHead(item.id);
        });
      }
    });
  }
  
  selectBody(bodyId) {
    try {
      this.currentBody = bodyId;
      this.bodyText.setText(`Body: ${this.currentBody.toUpperCase()}`);
      this.updatePreview();
      
      // Notify server of change (non-blocking)
      this.notifyAvatarChange();
    } catch (error) {
      console.error('Error selecting body:', error);
    }
  }
  
  selectHead(headId) {
    try {
      this.currentHead = headId;
      this.headText.setText(`Head: ${this.currentHead.toUpperCase()}`);
      this.updatePreview();
      
      // Notify server of change (non-blocking)
      this.notifyAvatarChange();
    } catch (error) {
      console.error('Error selecting head:', error);
    }
  }
  
  notifyAvatarChange() {
    try {
      const avatarConfig = {
        body: this.currentBody,
        head: this.currentHead
      };
      
      // Use setTimeout to make this non-blocking
      if (socketManager && socketManager.changeAvatar) {
        socketManager.changeAvatar(avatarConfig);
      }
    } catch (error) {
      console.error('Error notifying avatar change:', error);
      // Don't let socket errors break the scene
    }
  }
  
  updatePreview() {
    try {
      // Clear old preview sprites if they exist
      if (this.previewBase) {
        this.previewBase.destroy();
        this.previewBase = null;
      }
      if (this.previewBody) {
        this.previewBody.destroy();
        this.previewBody = null;
      }
      if (this.previewHead) {
        this.previewHead.destroy();
        this.previewHead = null;
      }
      
      // Create layered preview using static avatar images
      const previewX = 150;
      const previewY = 250;
      const previewScale = 0.15; // Much smaller to match game scale
      
      // Always show base character (with error handling)
      if (this.textures.exists('avatar-base')) {
        this.previewBase = this.add.image(previewX, previewY, 'avatar-base');
        this.previewBase.setScale(previewScale);
        this.previewBase.setDepth(20);
      } else {
        console.warn('avatar-base texture not found');
      }
      
      // Add body layer if not 'none'
      if (this.currentBody !== 'none') {
        // Map body IDs to image keys
        const bodyKeyMap = {
          'u1': 'avatar-uniform1',
          'u2': 'avatar-uniform2',
          'cape': 'avatar-cape',
          'scarf': 'avatar-scarf'
        };
        const bodyKey = bodyKeyMap[this.currentBody] || `avatar-${this.currentBody}`;
        
        // Check if texture exists before creating image
        if (this.textures.exists(bodyKey)) {
          this.previewBody = this.add.image(previewX, previewY, bodyKey);
          this.previewBody.setScale(previewScale);
          this.previewBody.setDepth(21);
        } else {
          console.warn(`Body texture ${bodyKey} not found`);
        }
      }
      
      // Add head layer if not 'none'
      if (this.currentHead !== 'none') {
        // Map head IDs to image keys
        const headKeyMap = {
          'cat': 'avatar-cat',
          'flower': 'avatar-flower',
          'halo': 'avatar-halo',
          'sun': 'avatar-sunglasses'
        };
        const headKey = headKeyMap[this.currentHead] || `avatar-${this.currentHead}`;
        
        // Check if texture exists before creating image
        if (this.textures.exists(headKey)) {
          this.previewHead = this.add.image(previewX, previewY, headKey);
          this.previewHead.setScale(previewScale);
          this.previewHead.setDepth(22);
        } else {
          console.warn(`Head texture ${headKey} not found`);
        }
      }
    } catch (error) {
      console.error('Error updating preview:', error);
      // Don't let preview errors break the scene
    }
  }
  
  async saveAndExit() {
    try {
      const avatarConfig = {
        body: this.currentBody,
        head: this.currentHead
      };
      
      // Save to server (non-blocking - don't wait if it fails)
      const token = localStorage.getItem('token');
      
      try {
        const response = await fetch('/api/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ avatarConfig })
        });
        
        if (response.ok) {
          // Update local storage
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          userData.avatarConfig = avatarConfig;
          localStorage.setItem('user', JSON.stringify(userData));
          if (this.game.userData) {
            this.game.userData.avatarConfig = avatarConfig;
          }
          
          console.log('Avatar saved successfully');
        }
      } catch (error) {
        console.error('Failed to save avatar:', error);
        // Continue anyway - don't block exit
      }
      
      // Clean up preview sprites before leaving
      if (this.previewBase) {
        this.previewBase.destroy();
        this.previewBase = null;
      }
      if (this.previewBody) {
        this.previewBody.destroy();
        this.previewBody = null;
      }
      if (this.previewHead) {
        this.previewHead.destroy();
        this.previewHead = null;
      }
      
      // Return to onboarding (if active) or lobby
      const onboardingReturn = this.game.userData && this.game.userData.onboardingReturnScene;
      if (onboardingReturn) {
        this.game.userData.onboardingReturnScene = null;
        this.scene.start(onboardingReturn);
      } else {
        // Return to lobby - position will be restored from saved position in game.userData
        this.scene.start('LobbyScene');
      }
    } catch (error) {
      console.error('Error in saveAndExit:', error);
      // Force return to lobby even if there's an error
      this.scene.start('LobbyScene');
    }
  }
  
  shutdown() {
    // Clean up preview sprites
    if (this.previewBase) {
      this.previewBase.destroy();
      this.previewBase = null;
    }
    if (this.previewBody) {
      this.previewBody.destroy();
      this.previewBody = null;
    }
    if (this.previewHead) {
      this.previewHead.destroy();
      this.previewHead = null;
    }
    
    // Clear references
    this.bodyText = null;
    this.headText = null;
    this.unlockedItems = null;
  }
}
