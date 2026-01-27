// Game Room Manager
// Manages players in different rooms (lobby, library)

class RoomManager {
  constructor() {
    this.rooms = {
      lobby: new Map(),
      library: new Map()
    };
  }
  
  /**
   * Add a player to a room
   * @param {string} roomName - Name of the room
   * @param {string} socketId - Socket ID of the player
   * @param {object} playerData - Player data (userId, username, avatarConfig, x, y, state)
   */
  addPlayer(roomName, socketId, playerData) {
    if (!this.rooms[roomName]) {
      this.rooms[roomName] = new Map();
    }
    
    this.rooms[roomName].set(socketId, {
      ...playerData,
      joinedAt: Date.now()
    });
  }
  
  /**
   * Remove a player from a room
   * @param {string} roomName - Name of the room
   * @param {string} socketId - Socket ID of the player
   */
  removePlayer(roomName, socketId) {
    if (this.rooms[roomName]) {
      this.rooms[roomName].delete(socketId);
    }
  }
  
  /**
   * Update player data in a room
   * @param {string} roomName - Name of the room
   * @param {string} socketId - Socket ID of the player
   * @param {object} updates - Data to update
   */
  updatePlayer(roomName, socketId, updates) {
    if (this.rooms[roomName] && this.rooms[roomName].has(socketId)) {
      const player = this.rooms[roomName].get(socketId);
      this.rooms[roomName].set(socketId, {
        ...player,
        ...updates
      });
    }
  }
  
  /**
   * Get all players in a room
   * @param {string} roomName - Name of the room
   * @returns {Array} Array of player objects
   */
  getPlayers(roomName) {
    if (!this.rooms[roomName]) {
      return [];
    }
    
    return Array.from(this.rooms[roomName].values());
  }
  
  /**
   * Get a specific player from a room
   * @param {string} roomName - Name of the room
   * @param {string} socketId - Socket ID of the player
   * @returns {object|null} Player object or null
   */
  getPlayer(roomName, socketId) {
    if (!this.rooms[roomName]) {
      return null;
    }
    
    return this.rooms[roomName].get(socketId) || null;
  }
  
  /**
   * Get the number of players in a room
   * @param {string} roomName - Name of the room
   * @returns {number} Number of players
   */
  getPlayerCount(roomName) {
    if (!this.rooms[roomName]) {
      return 0;
    }
    
    return this.rooms[roomName].size;
  }
  
  /**
   * Get all room stats
   * @returns {object} Room statistics
   */
  getRoomStats() {
    const stats = {};
    
    for (const [roomName, players] of Object.entries(this.rooms)) {
      stats[roomName] = {
        playerCount: players.size,
        players: Array.from(players.values()).map(p => ({
          username: p.username,
          userId: p.userId
        }))
      };
    }
    
    return stats;
  }
}

module.exports = RoomManager;
