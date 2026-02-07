// Socket.IO Client Manager
class SocketManager {
  constructor() {
    this.socket = null;
    this.token = null;
    this.currentScene = null;
    this.isConnected = false;
  }
  
  connect(token) {
    this.token = token;
    
    // Connect to server with authentication
    this.socket = io({
      auth: {
        token: this.token
      },
      transports: ['websocket', 'polling']
    });
    
    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Connected to server');
      this.isConnected = true;
    });
    
    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // Server disconnected, need to reconnect manually
        this.socket.connect();
      }
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
      if (error.message === 'Authentication error') {
        // Token invalid, redirect to login
        this.handleAuthError();
      }
    });
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }
  
  handleAuthError() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  }
  
  // Lobby events
  joinLobby() {
    this.socket.emit('join-lobby');
  }
  
  // Movement
  sendMove(x, y, facing) {
    if (window.DEBUG_MOVES) {
      console.log('➡️ send player-move', { x, y, facing });
    }
    this.socket.emit('player-move', { x, y, facing });
  }
  
  sendState(state) {
    this.socket.emit('player-state', { state });
  }
  
  // Room transitions
  enterLibrary() {
    this.socket.emit('enter-library');
  }
  
  exitLibrary() {
    this.socket.emit('exit-library');
  }
  
  // Chat
  sendChatMessage(message) {
    this.socket.emit('chat-message', { message });
  }
  
  // Private message
  sendPrivateMessage(to, message) {
    this.socket.emit('private-message', { to, message });
  }
  
  // Study
  studyTopic(topic) {
    this.socket.emit('study-topic', { topic });
  }
  
  // Quiz
  startQuiz() {
    this.socket.emit('start-quiz');
  }
  
  submitQuizAnswer(questionIndex, isCorrect, score) {
    this.socket.emit('quiz-answer', { questionIndex, isCorrect, score });
  }
  
  // Avatar
  changeAvatar(avatarConfig) {
    this.socket.emit('avatar-changed', { avatarConfig });
  }
  
  // Achievement
  earnAchievement(achievementId, achievementName) {
    this.socket.emit('achievement-earned', { achievementId, achievementName });
  }
  
  // Set current scene for event routing
  setScene(scene) {
    this.currentScene = scene;
  }
  
  // Register event listeners for a scene
  registerSceneListeners(scene) {
    // Remove all existing listeners first to prevent duplicates
    this.removeSceneListeners();
    
    this.setScene(scene);
    
    // Lobby events
    this.socket.on('lobby-state', (data) => {
      if (scene.onLobbyState) scene.onLobbyState(data);
    });
    
    this.socket.on('library-state', (data) => {
      if (scene.onLibraryState) scene.onLibraryState(data);
    });
    
    // Player events
    this.socket.on('player-joined', (player) => {
      if (scene.onPlayerJoined) scene.onPlayerJoined(player);
    });
    
    this.socket.on('player-left', (data) => {
      if (scene.onPlayerLeft) scene.onPlayerLeft(data);
    });
    
    this.socket.on('player-moved', (data) => {
      if (window.DEBUG_MOVES) {
        console.log('⬅️ recv player-moved', data);
      }
      if (scene.onPlayerMoved) scene.onPlayerMoved(data);
    });
    
    this.socket.on('player-state-changed', (data) => {
      if (scene.onPlayerStateChanged) scene.onPlayerStateChanged(data);
    });
    
    this.socket.on('player-avatar-changed', (data) => {
      if (scene.onPlayerAvatarChanged) scene.onPlayerAvatarChanged(data);
    });
    
    this.socket.on('player-studying', (data) => {
      if (scene.onPlayerStudying) scene.onPlayerStudying(data);
    });
    
    this.socket.on('player-quiz-progress', (data) => {
      if (scene.onPlayerQuizProgress) scene.onPlayerQuizProgress(data);
    });

    this.socket.on('player-level-updated', (data) => {
      if (scene.onPlayerLevelUpdated) scene.onPlayerLevelUpdated(data);
    });
    
    this.socket.on('player-achievement', (data) => {
      if (scene.onPlayerAchievement) scene.onPlayerAchievement(data);
      this.showNotification(`${data.username} earned: ${data.achievementName}`, 'achievement');
    });
    
    // Chat - only add message once through chatBox
    this.socket.on('chat-message', (data) => {
      if (scene.onChatMessage) scene.onChatMessage(data);
      // Only add to chatBox if it exists and hasn't been added already
      if (window.chatBox && window.chatBox.addMessage) {
        window.chatBox.addMessage(data);
      }
    });
    
    this.socket.on('private-message', (data) => {
      if (scene.onPrivateMessage) scene.onPrivateMessage(data);
      if (window.chatBox && window.chatBox.addMessage) {
        window.chatBox.addMessage(data);
      }
    });
  }
  
  // Remove scene listeners
  removeSceneListeners() {
    this.socket.off('lobby-state');
    this.socket.off('library-state');
    this.socket.off('player-joined');
    this.socket.off('player-left');
    this.socket.off('player-moved');
    this.socket.off('player-state-changed');
    this.socket.off('player-avatar-changed');
    this.socket.off('player-studying');
    this.socket.off('player-quiz-progress');
    this.socket.off('player-level-updated');
    this.socket.off('player-achievement');
    this.socket.off('chat-message');
    this.socket.off('private-message');
  }
  
  // Show notification
  showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    container.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }
}

// Global socket manager instance
const socketManager = new SocketManager();
