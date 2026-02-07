// Simple on-screen D-pad for touch devices.
class TouchControls {
  constructor() {
    this.container = document.getElementById('touch-controls');
    if (!this.container) {
      this.container = this.createContainer();
    }

    this.activePointers = {
      left: new Set(),
      right: new Set(),
      up: new Set(),
      down: new Set()
    };

    this.state = { left: false, right: false, up: false, down: false };

    this.buttons = Array.from(this.container.querySelectorAll('.touch-btn'));
    this.buttons.forEach((btn) => this.bindButton(btn));

    this.coarseMedia = window.matchMedia('(pointer: coarse)');
    this.evaluateVisibility();
    if (this.coarseMedia.addEventListener) {
      this.coarseMedia.addEventListener('change', () => this.evaluateVisibility());
    }
    window.addEventListener('resize', () => this.evaluateVisibility());

    window.addEventListener('blur', () => this.reset());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') {
        this.reset();
      }
    });
  }

  createContainer() {
    const wrapper = document.createElement('div');
    wrapper.id = 'touch-controls';
    wrapper.className = 'touch-controls';
    wrapper.setAttribute('aria-hidden', 'true');
    wrapper.innerHTML = `
      <div class="touch-dpad">
        <button class="touch-btn touch-up" data-dir="up" aria-label="Move up">▲</button>
        <button class="touch-btn touch-left" data-dir="left" aria-label="Move left">◀</button>
        <button class="touch-btn touch-right" data-dir="right" aria-label="Move right">▶</button>
        <button class="touch-btn touch-down" data-dir="down" aria-label="Move down">▼</button>
      </div>
    `;
    document.body.appendChild(wrapper);
    return wrapper;
  }

  setVisible(visible) {
    if (!this.container) return;
    if (visible) {
      this.container.classList.add('active');
    } else {
      this.container.classList.remove('active');
      this.reset();
    }
  }

  evaluateVisibility() {
    const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
    const smallScreen = window.innerWidth <= 900;
    const shouldShow = this.coarseMedia.matches || hasTouch || smallScreen;
    this.setVisible(shouldShow);
  }

  bindButton(btn) {
    const dir = btn.getAttribute('data-dir');
    if (!dir || !this.activePointers[dir]) return;

    const onDown = (e) => {
      e.preventDefault();
      this.activePointers[dir].add(e.pointerId);
      btn.classList.add('active');
      this.refreshState(dir);
    };

    const onUp = (e) => {
      e.preventDefault();
      this.activePointers[dir].delete(e.pointerId);
      if (this.activePointers[dir].size === 0) {
        btn.classList.remove('active');
      }
      this.refreshState(dir);
    };

    btn.addEventListener('pointerdown', onDown);
    btn.addEventListener('pointerup', onUp);
    btn.addEventListener('pointercancel', onUp);
    btn.addEventListener('pointerleave', onUp);
  }

  refreshState(dir) {
    if (dir) {
      this.state[dir] = this.activePointers[dir].size > 0;
      return;
    }

    this.state.left = this.activePointers.left.size > 0;
    this.state.right = this.activePointers.right.size > 0;
    this.state.up = this.activePointers.up.size > 0;
    this.state.down = this.activePointers.down.size > 0;
  }

  reset() {
    Object.keys(this.activePointers).forEach((dir) => {
      this.activePointers[dir].clear();
    });
    this.state.left = false;
    this.state.right = false;
    this.state.up = false;
    this.state.down = false;
    this.buttons.forEach((btn) => btn.classList.remove('active'));
  }
}
