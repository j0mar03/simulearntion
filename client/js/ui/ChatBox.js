// Chat Box UI Component
class ChatBox {
  constructor() {
    this.container = document.getElementById('chat-container');
    this.messagesDiv = document.getElementById('chat-messages');
    this.input = document.getElementById('chat-input');
    this.replyIndicator = document.getElementById('chat-reply-indicator');
    this.maxMessages = 50;
    this.eventListenersSetup = false;
    this.replyTo = null;
    
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
        
        // Private message command: /pm username message OR /w username message
        const pmMatch = message.match(/^\/(pm|w)\s+(\S+)\s+(.+)$/i);
        if (pmMatch) {
          const to = pmMatch[2];
          const pmText = pmMatch[3];
          const now = Date.now();
          if (!this.lastMessageTime || (now - this.lastMessageTime) > 100) {
            this.lastMessageTime = now;
            socketManager.sendPrivateMessage(to, pmText);
            this.input.value = '';
            this.clearReplyTo();
          }
          return;
        }
        
        // Prevent sending duplicate messages rapidly
        const now = Date.now();
        if (!this.lastMessageTime || (now - this.lastMessageTime) > 100) {
          this.lastMessageTime = now;
          socketManager.sendChatMessage(message);
          this.input.value = '';
          this.clearReplyTo();
        }
      }
    };
    this.input.addEventListener('keydown', this.inputKeydownHandler);
    
    // Disable Phaser keyboard capture while typing to allow spaces
    this.inputFocusHandler = () => {
      try {
        if (window.game && window.game.input && window.game.input.keyboard) {
          window.game.input.keyboard.enabled = false;
          window.game.input.keyboard.preventDefault = false;
        }
      } catch (error) {
        console.warn('Unable to disable game keyboard capture:', error);
      }
    };
    
    this.inputBlurHandler = () => {
      try {
        if (window.game && window.game.input && window.game.input.keyboard) {
          window.game.input.keyboard.enabled = true;
          window.game.input.keyboard.preventDefault = true;
        }
      } catch (error) {
        console.warn('Unable to re-enable game keyboard capture:', error);
      }
    };
    
    this.input.addEventListener('focus', this.inputFocusHandler);
    this.input.addEventListener('blur', this.inputBlurHandler);
    
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
    if (this.inputFocusHandler) {
      this.input.removeEventListener('focus', this.inputFocusHandler);
    }
    if (this.inputBlurHandler) {
      this.input.removeEventListener('blur', this.inputBlurHandler);
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
    if (data.private) {
      if (data.system) {
        usernameSpan.textContent = 'System: ';
      } else if (data.fromUsername && data.toUsername) {
        usernameSpan.textContent = `(PM) ${data.fromUsername} → ${data.toUsername}: `;
      } else if (data.fromUsername) {
        usernameSpan.textContent = `(PM) ${data.fromUsername}: `;
      } else {
        usernameSpan.textContent = '(PM): ';
      }
    } else {
      usernameSpan.textContent = data.username + ': ';
    }
    
    const messageSpan = document.createElement('span');
    messageSpan.textContent = data.message;
    
    if (data.private) {
      messageDiv.classList.add('private-message');
    }
    messageDiv.appendChild(usernameSpan);
    messageDiv.appendChild(messageSpan);
    
    this.messagesDiv.appendChild(messageDiv);
    
    // Remove old messages if too many
    while (this.messagesDiv.children.length > this.maxMessages) {
      this.messagesDiv.removeChild(this.messagesDiv.firstChild);
    }
    
    // Auto-scroll to bottom
    this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;
    
    // Auto-prefill reply for incoming private messages (but don't override while typing)
    if (data && data.private && data.fromUsername) {
      const isFocused = document.activeElement === this.input;
      const hasTypedText = this.input.value && this.input.value.trim().length > 0;
      
      if (!isFocused || !hasTypedText) {
        this.input.value = `/pm ${data.fromUsername} `;
      }
      
      this.setReplyTo(data.fromUsername);
    }
  }
  
  setReplyTo(username) {
    this.replyTo = username;
    if (this.replyIndicator) {
      this.replyIndicator.textContent = `Replying to ${username}`;
      this.replyIndicator.style.display = 'block';
    }
  }
  
  clearReplyTo() {
    this.replyTo = null;
    if (this.replyIndicator) {
      this.replyIndicator.style.display = 'none';
      this.replyIndicator.textContent = '';
    }
  }
  
  show() {
    this.container.style.display = 'block';
  }
  
  hide() {
    this.container.style.display = 'none';
  }
}
