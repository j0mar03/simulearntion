// Profile Modal UI Component
class ProfileModal {
  constructor() {
    this.modal = document.getElementById('profile-modal');
    this.openBtn = document.getElementById('profile-open');
    this.closeBtn = document.getElementById('profile-close');
    this.usernameEl = document.getElementById('profile-username');
    this.achievementCountEl = document.getElementById('profile-achievement-count');
    this.currentTitleEl = document.getElementById('profile-current-title');
    this.titleSelect = document.getElementById('profile-title-select');

    if (!this.modal || !this.openBtn || !this.closeBtn) return;

    this.openBtn.addEventListener('click', () => this.open());
    this.closeBtn.addEventListener('click', () => this.close());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    if (this.titleSelect) {
      this.titleSelect.addEventListener('change', () => {
        const selected = this.titleSelect.value;
        if (selected) {
          this.setCurrentTitle(selected);
        }
      });
    }
  }

  getUserData() {
    const gameData = window.game && window.game.userData ? window.game.userData : null;
    if (gameData) return gameData;
    return JSON.parse(localStorage.getItem('user') || '{}');
  }

  persistUserData(userData) {
    if (window.game) {
      window.game.userData = userData;
    }
    localStorage.setItem('user', JSON.stringify(userData));
  }

  buildTitleList(earnedAchievements) {
    const fallbackTitle = window.DEFAULT_PLAYER_TITLE || 'Rookie';
    const titles = new Set([fallbackTitle]);
    const achievements = window.ACHIEVEMENTS || {};

    earnedAchievements.forEach((id) => {
      const achievement = achievements[id];
      if (achievement && achievement.title) {
        titles.add(achievement.title);
      }
    });

    return Array.from(titles);
  }

  async refresh() {
    const userData = this.getUserData();
    const username = userData.username || 'Player';
    this.usernameEl.textContent = username;

    const fallbackTitle = window.DEFAULT_PLAYER_TITLE || 'Rookie';
    const currentTitle = userData.currentTitle || userData.title || fallbackTitle;
    this.currentTitleEl.textContent = currentTitle;

    let earnedAchievements = Array.isArray(userData.achievements) ? userData.achievements : [];

    // Try to refresh achievements from server (non-blocking)
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch('/api/profile/achievements', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          earnedAchievements = (data.achievements || []).map(a => a.achievementId);
          userData.achievements = earnedAchievements;
          this.persistUserData(userData);
        }
      } catch (error) {
        console.warn('Failed to refresh achievements:', error);
      }
    }

    const totalAchievements = Object.keys(window.ACHIEVEMENTS || {}).length;
    this.achievementCountEl.textContent = `${earnedAchievements.length}/${totalAchievements}`;

    const titles = this.buildTitleList(earnedAchievements);
    if (this.titleSelect) {
      this.titleSelect.innerHTML = '';
      titles.forEach(title => {
        const option = document.createElement('option');
        option.value = title;
        option.textContent = title;
        if (title === currentTitle) option.selected = true;
        this.titleSelect.appendChild(option);
      });
    }

    if (!titles.includes(currentTitle)) {
      this.setCurrentTitle(titles[0] || fallbackTitle);
    }
  }

  setCurrentTitle(title) {
    const userData = this.getUserData();
    userData.currentTitle = title;
    this.currentTitleEl.textContent = title;
    this.persistUserData(userData);

    const scenes = window.game && window.game.scene ? window.game.scene.getScenes(true) : [];
    scenes.forEach(scene => {
      if (scene.player && scene.player.setTitle) {
        scene.player.setTitle(title);
      }
    });
  }

  open() {
    this.refresh();
    this.modal.classList.add('active');
  }

  close() {
    this.modal.classList.remove('active');
  }
}
