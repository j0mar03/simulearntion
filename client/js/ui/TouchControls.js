// Simple on-screen D-pad for touch devices.
class TouchControls {
  constructor() {
    this.container = document.getElementById('touch-controls');
    if (!this.container) {
      this.container = this.createContainer();
    }

    this.state = {
      left: false,
      right: false,
      up: false,
      down: false,
      axisX: 0,
      axisY: 0,
      active: false
    };
    this.joystick = null;
    this.handle = null;
    this.activePointerId = null;
    this.origin = { x: 0, y: 0 };
    this.radius = 50;

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

    this.bindFloatingJoystick();
  }

  createContainer() {
    const wrapper = document.createElement('div');
    wrapper.id = 'touch-controls';
    wrapper.className = 'touch-controls';
    wrapper.setAttribute('aria-hidden', 'true');
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

  bindFloatingJoystick() {
    const onPointerDown = (e) => {
      if (this.activePointerId !== null) return;
      if (!this.container.classList.contains('active')) return;
      this.activePointerId = e.pointerId;
      this.state.active = true;

      this.joystick = document.createElement('div');
      this.joystick.className = 'touch-joystick';
      this.handle = document.createElement('div');
      this.handle.className = 'touch-joystick-handle';
      this.joystick.appendChild(this.handle);
      this.container.appendChild(this.joystick);

      this.origin = { x: e.clientX, y: e.clientY };
      this.joystick.style.left = `${this.origin.x - 60}px`;
      this.joystick.style.top = `${this.origin.y - 60}px`;
      this.radius = 50;
      this.updateAxis(0, 0);
    };

    const onPointerMove = (e) => {
      if (this.activePointerId !== e.pointerId) return;
      const dx = e.clientX - this.origin.x;
      const dy = e.clientY - this.origin.y;
      const dist = Math.hypot(dx, dy) || 1;
      const clamped = Math.min(dist, this.radius);
      const nx = (dx / dist) * (clamped / this.radius);
      const ny = (dy / dist) * (clamped / this.radius);
      this.updateAxis(nx, ny);
      if (this.handle) {
        this.handle.style.transform = `translate(${nx * this.radius}px, ${ny * this.radius}px) translate(-50%, -50%)`;
      }
    };

    const onPointerUp = (e) => {
      if (this.activePointerId !== e.pointerId) return;
      this.activePointerId = null;
      this.state.active = false;
      this.updateAxis(0, 0);
      if (this.joystick) {
        this.container.removeChild(this.joystick);
        this.joystick = null;
        this.handle = null;
      }
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  }

  updateAxis(nx, ny) {
    this.state.axisX = nx;
    this.state.axisY = ny;
    this.state.left = nx < -0.1;
    this.state.right = nx > 0.1;
    this.state.up = ny < -0.1;
    this.state.down = ny > 0.1;
  }

  reset() {
    this.state.left = false;
    this.state.right = false;
    this.state.up = false;
    this.state.down = false;
    this.state.axisX = 0;
    this.state.axisY = 0;
    this.state.active = false;
    if (this.joystick && this.container) {
      this.container.removeChild(this.joystick);
      this.joystick = null;
      this.handle = null;
    }
  }
}
