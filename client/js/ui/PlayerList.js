// Player List UI Component
class PlayerList {
  constructor() {
    this.container = document.getElementById('players-list');
    this.countSpan = document.getElementById('player-count');
    this.contentDiv = document.getElementById('players-list-content');
    this.players = new Map();
    
    // Event delegation for player clicks
    this.contentDiv.addEventListener('click', (e) => {
      const item = e.target.closest('.player-item');
      if (!item) return;
      
      const playerId = item.dataset.playerId;
      const player = this.players.get(playerId);
      if (!player) return;
      
      try {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (player.userId && currentUser.id && player.userId === currentUser.id) {
          return;
        }
        if (window.chatBox && window.chatBox.input) {
          window.chatBox.input.value = `/pm ${player.username} `;
          window.chatBox.input.focus();
        }
      } catch (error) {
        console.error('Error starting private message:', error);
      }
    });
  }
  
  updatePlayers(players) {
    this.players.clear();
    this.contentDiv.innerHTML = '';
    
    players.forEach(player => {
      this.addPlayer(player);
    });
    
    this.updateCount();
  }
  
  addPlayer(player) {
    this.players.set(player.socketId || player.userId, player);
    
    const playerDiv = document.createElement('div');
    playerDiv.className = 'player-item';
    playerDiv.dataset.playerId = player.socketId || player.userId;
    
    const avatarIcon = document.createElement('div');
    avatarIcon.className = 'player-avatar-icon';
    
    const nameSpan = document.createElement('span');
    nameSpan.textContent = player.username;
    
    playerDiv.appendChild(avatarIcon);
    playerDiv.appendChild(nameSpan);
    
    this.contentDiv.appendChild(playerDiv);
    this.updateCount();
  }
  
  removePlayer(playerId) {
    this.players.delete(playerId);
    
    const playerDiv = this.contentDiv.querySelector(`[data-player-id="${playerId}"]`);
    if (playerDiv) {
      playerDiv.remove();
    }
    
    this.updateCount();
  }
  
  updateCount() {
    this.countSpan.textContent = this.players.size;
  }
  
  show() {
    this.container.style.display = 'block';
  }
  
  hide() {
    this.container.style.display = 'none';
  }
}
