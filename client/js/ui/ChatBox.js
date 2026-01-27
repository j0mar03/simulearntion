// Chat Box UI Component
class ChatBox {
  constructor() {
    this.container = document.getElementById('chat-container');
    this.messagesDiv = document.getElementById('chat-messages');
    this.input = document.getElementById('chat-input');
    this.maxMessages = 50;
    this.eventListenersSetup = false;
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Prevent duplicate event listeners
    if (this.eventListenersSetup) {
      return;
    }
    
    // Send message on Enter
    this.inputKeydownHandler = (e) => {
      if (e.key === 'Enter' && this.input.value.trim()) {
        const message = this.input.value.trim();
        // Prevent sending duplicate messages rapidly
        const now = Date.now();
        if (!this.lastMessageTime || (now - this.lastMessageTime) > 100) {
          this.lastMessageTime = now;
          socketManager.sendChatMessage(message);
          this.input.value = '';
        }
      }
    };
    this.input.addEventListener('keydown', this.inputKeydownHandler);
    
    // Focus on chat when pressing T or /
    this.documentKeydownHandler = (e) => {
      if ((e.key === 't' || e.key === 'T' || e.key === '/') && 
          document.activeElement !== this.input) {
        e.preventDefault();
        this.input.focus();
      }
      
      // Unfocus on Escape
      if (e.key === 'Escape' && document.activeElement === this.input) {
        this.input.blur();
      }
    };
    document.addEventListener('keydown', this.documentKeydownHandler);
    
    this.eventListenersSetup = true;
  }
  
  destroy() {
    // Remove event listeners
    if (this.inputKeydownHandler) {
      this.input.removeEventListener('keydown', this.inputKeydownHandler);
    }
    if (this.documentKeydownHandler) {
      document.removeEventListener('keydown', this.documentKeydownHandler);
    }
    this.eventListenersSetup = false;
  }
  
  addMessage(data) {
    // Prevent duplicate messages by checking the last message
    const lastMessage = this.messagesDiv.lastElementChild;
    if (lastMessage) {
      const lastUsername = lastMessage.querySelector('.username')?.textContent;
      const lastMessageText = lastMessage.querySelector('span:last-child')?.textContent;
      
      // Check if this is a duplicate (same username and message)
      if (lastUsername === (data.username + ': ') && lastMessageText === data.message) {
        // Check timestamp if available to prevent rapid duplicates
        const timeDiff = data.timestamp ? (Date.now() - data.timestamp) : 0;
        if (timeDiff < 100) { // Less than 100ms difference = likely duplicate
          console.log('Duplicate message prevented:', data.message);
          return;
        }
      }
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';
    messageDiv.dataset.timestamp = data.timestamp || Date.now();
    
    const usernameSpan = document.createElement('span');
    usernameSpan.className = 'username';
    usernameSpan.textContent = data.username + ': ';
    
    const messageSpan = document.createElement('span');
    messageSpan.textContent = data.message;
    
    messageDiv.appendChild(usernameSpan);
    messageDiv.appendChild(messageSpan);
    
    this.messagesDiv.appendChild(messageDiv);
    
    // Remove old messages if too many
    while (this.messagesDiv.children.length > this.maxMessages) {
      this.messagesDiv.removeChild(this.messagesDiv.firstChild);
    }
    
    // Auto-scroll to bottom
    this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;
  }
  
  show() {
    this.container.style.display = 'block';
  }
  
  hide() {
    this.container.style.display = 'none';
  }
}
