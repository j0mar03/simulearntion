// Main Phaser Game Configuration and Initialization

// Check for authentication on page load
window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (token && user) {
    // Auto-login if token exists
    verifyToken(token);
  } else {
    // Show login modal and hide loading screen after short delay
    setTimeout(() => {
      hideLoadingScreen();
      showAuthModal();
    }, 500); // Small delay for smooth transition
  }
  
  setupAuthHandlers();
});

// Phaser Game Configuration
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [
    BootScene,
    LoginScene,
    OnboardingScene1,
    OnboardingScene2,
    OnboardingScene3,
    OnboardingScene4,
    LobbyScene,
    LibraryScene,
    QuizScene,
    CustomScene,
    AchieveScene
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

let game;

// Initialize game after successful authentication
async function initializeGame() {
  try {
    hideAuthModal();
    hideLoadingScreen();
    
    // Fetch full profile with unlock status (non-blocking)
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Profile fetch failed');
      })
      .then(profileData => {
        // Update user data with unlock status and admin flag
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Merge all profile data
        userData.unlockedItems = profileData.unlockedItems || {};
        userData.isAdmin = profileData.isAdmin || false;
        
        // Ensure avatarConfig exists
        if (!userData.avatarConfig && profileData.avatarConfig) {
          userData.avatarConfig = profileData.avatarConfig;
        } else if (!userData.avatarConfig) {
          userData.avatarConfig = { body: 'u1', head: 'none' };
        }
        
        // Ensure username exists
        if (!userData.username && profileData.username) {
          userData.username = profileData.username;
        }
        
        // Ensure id exists
        if (!userData.id && profileData.id) {
          userData.id = profileData.id;
        }
        
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Update game userData if game exists (use setTimeout to avoid timing issues)
        setTimeout(() => {
          if (typeof game !== 'undefined' && game) {
            if (!game.userData) {
              game.userData = {};
            }
            // Merge all userData
            Object.assign(game.userData, userData);
            console.log('Updated game.userData:', game.userData);
          }
        }, 100);
      })
      .catch(error => {
        console.warn('Failed to fetch profile (non-critical):', error);
        // Continue anyway - use default unlock status
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        userData.unlockedItems = userData.unlockedItems || {};
        userData.isAdmin = userData.isAdmin || false;
        localStorage.setItem('user', JSON.stringify(userData));
      });
    }
    
    // Show game container
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) {
      console.error('Game container not found!');
      return;
    }
    gameContainer.classList.add('active');
    
    // Create Phaser game (only if not already created)
    if (!game) {
      console.log('Creating Phaser game...');
      game = new Phaser.Game(config);
      
      // Store user data globally for access in scenes
      let userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Ensure required fields exist
      if (!userData.avatarConfig) {
        userData.avatarConfig = { body: 'u1', head: 'none' };
      }
      if (!userData.username) {
        userData.username = 'Player';
      }
      if (!userData.unlockedItems) {
        userData.unlockedItems = {};
      }
      if (userData.isAdmin === undefined) {
        userData.isAdmin = false;
      }
      
      game.userData = userData;
      game.token = token;
      window.game = game;
      
      console.log('Phaser game created, userData:', userData);
    } else {
      // Update existing game's userData if needed
      if (!game.userData) {
        let userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (!userData.avatarConfig) {
          userData.avatarConfig = { body: 'u1', head: 'none' };
        }
        if (!userData.username) {
          userData.username = 'Player';
        }
        if (!userData.unlockedItems) {
          userData.unlockedItems = {};
        }
        game.userData = userData;
        console.log('Updated existing game.userData:', game.userData);
      }
      window.game = game;

      // If a game instance already exists, force the login/onboarding flow
      if (game.scene && !game.scene.isActive('LoginScene')) {
        game.scene.start('LoginScene');
      }
    }
    
    // Connect to socket
    if (token && typeof socketManager !== 'undefined') {
      socketManager.connect(token);
    }
    
    // Show chat and player list
    const chatContainer = document.getElementById('chat-container');
    const playersList = document.getElementById('players-list');
    if (chatContainer) chatContainer.style.display = 'block';
    if (playersList) playersList.style.display = 'block';
    
    // Initialize chat box (only create once)
    if (typeof ChatBox !== 'undefined' && !window.chatBox) {
      window.chatBox = new ChatBox();
    }
    if (typeof PlayerList !== 'undefined' && !window.playerList) {
      window.playerList = new PlayerList();
    }
    
    console.log('✅ Game initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing game:', error);
    showError('Failed to initialize game. Please refresh the page.');
  }
}

// Authentication functions
function showAuthModal() {
  document.getElementById('auth-modal').style.display = 'flex';
}

function hideAuthModal() {
  document.getElementById('auth-modal').style.display = 'none';
}

function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  loadingScreen.style.opacity = '0';
  setTimeout(() => {
    loadingScreen.style.display = 'none';
  }, 500);
}

function showError(message) {
  const errorDiv = document.getElementById('auth-error');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  
  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 5000);
}

function setupAuthHandlers() {
  // Switch between login and register
  document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-form').classList.remove('active');
    document.getElementById('register-form').classList.add('active');
  });
  
  document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('register-form').classList.remove('active');
    document.getElementById('login-form').classList.add('active');
  });
  
  // Login submit
  document.getElementById('login-submit').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Save token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Reset skip tour when a different user logs in
        const lastUserKey = localStorage.getItem('lastTourUser');
        const currentUserKey = data.user && (data.user.id || data.user.username || '');
        if (!lastUserKey || lastUserKey !== String(currentUserKey)) {
          localStorage.setItem('skipTour', 'false');
          localStorage.setItem('lastTourUser', String(currentUserKey));
        }
        
        // Initialize game
        initializeGame();
      } else {
        showError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      showError(`Network error: ${error.message || 'Cannot connect to server. Check if server is running.'}`);
    }
  });
  
  // Register submit
  document.getElementById('register-submit').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Save token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // New user should always see the tour
        const currentUserKey = data.user && (data.user.id || data.user.username || '');
        localStorage.setItem('skipTour', 'false');
        if (currentUserKey) {
          localStorage.setItem('lastTourUser', String(currentUserKey));
        }
        
        // Initialize game
        initializeGame();
      } else {
        showError(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Register error:', error);
      showError(`Network error: ${error.message || 'Cannot connect to server. Check if server is running.'}`);
    }
  });
}

async function verifyToken(token) {
  try {
    const response = await fetch('/api/auth/verify', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('user', JSON.stringify(data.user));
      initializeGame();
    } else {
      // Token invalid, show login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      showAuthModal();
      hideLoadingScreen();
    }
  } catch (error) {
    console.error('Token verification failed:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showAuthModal();
    hideLoadingScreen();
  }
}

// Logout function (can be called from game)
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Keep skipTour but clear lastTourUser to ensure new users see the tour
  localStorage.removeItem('lastTourUser');
  socketManager.disconnect();
  window.location.reload();
}

// Make logout available globally
window.logout = logout;
