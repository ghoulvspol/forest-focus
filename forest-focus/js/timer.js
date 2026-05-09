/**
 * Forest Focus - 专注计时器
 */
const FocusTimer = {
  state: {
    running: false,
    paused: false,
    totalSeconds: 0,
    remainingSeconds: 0,
    elapsedSeconds: 0,
    pauseStart: null,
    totalPausedMs: 0,
    seedId: 'cherry',
    promise: '',
    startTime: null,
    intervalId: null,
    awayTimeoutId: null,
    onTick: null,
    onComplete: null,
    onAway: null,
    onReturn: null,
  },

  start(minutes, seedId, promise, callbacks) {
    this.state = {
      running: true,
      paused: false,
      totalSeconds: minutes * 60,
      remainingSeconds: minutes * 60,
      elapsedSeconds: 0,
      pauseStart: null,
      totalPausedMs: 0,
      seedId,
      promise: promise || '',
      startTime: Date.now(),
      intervalId: null,
      awayTimeoutId: null,
      ...callbacks,
    };

    this._startInterval();
    this._startVisibilityListener();
  },

  _startInterval() {
    this.state.intervalId = setInterval(() => {
      if (this.state.paused) return;

      this.state.elapsedSeconds++;
      this.state.remainingSeconds--;

      if (this.state.onTick) {
        this.state.onTick({
          elapsed: this.state.elapsedSeconds,
          remaining: this.state.remainingSeconds,
          total: this.state.totalSeconds,
          progress: this.state.elapsedSeconds / this.state.totalSeconds,
        });
      }

      if (this.state.remainingSeconds <= 0) {
        this._complete();
      }
    }, 1000);
  },

  _startVisibilityListener() {
    this._visibilityHandler = () => {
      if (document.hidden) {
        this._onPageAway();
      } else {
        this._onPageReturn();
      }
    };
    document.addEventListener('visibilitychange', this._visibilityHandler);
  },

  _onPageAway() {
    if (!this.state.running || this.state.paused) return;
    this.state.pauseStart = Date.now();
    this.state.paused = true;

    // 5分钟自动结束
    this.state.awayTimeoutId = setTimeout(() => {
      if (this.state.paused && this.state.running) {
        this._complete();
      }
    }, 5 * 60 * 1000);

    if (this.state.onAway) this.state.onAway();
  },

  _onPageReturn() {
    if (!this.state.running || !this.state.paused) return;

    if (this.state.awayTimeoutId) {
      clearTimeout(this.state.awayTimeoutId);
      this.state.awayTimeoutId = null;
    }

    if (this.state.pauseStart) {
      this.state.totalPausedMs += Date.now() - this.state.pauseStart;
      this.state.pauseStart = null;
    }

    this.state.paused = false;
    if (this.state.onReturn) this.state.onReturn();
  },

  pause() {
    if (!this.state.running) return;
    this.state.paused = !this.state.paused;
    if (this.state.paused) {
      this.state.pauseStart = Date.now();
    } else if (this.state.pauseStart) {
      this.state.totalPausedMs += Date.now() - this.state.pauseStart;
      this.state.pauseStart = null;
    }
    return this.state.paused;
  },

  giveup() {
    if (this.state.elapsedSeconds < 60) {
      // 不到1分钟直接取消
      this._cleanup();
      return { cancelled: true };
    }
    this._complete();
  },

  _complete() {
    const actualMinutes = Math.floor(this.state.elapsedSeconds / 60);
    const duration = Math.max(1, actualMinutes);

    this._cleanup();

    if (this.state.onComplete) {
      this.state.onComplete({
        duration,
        seedId: this.state.seedId,
        promise: this.state.promise,
        completed: this.state.remainingSeconds <= 0,
        date: new Date().toISOString().slice(0, 10),
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      });
    }
  },

  _cleanup() {
    this.state.running = false;
    if (this.state.intervalId) {
      clearInterval(this.state.intervalId);
      this.state.intervalId = null;
    }
    if (this.state.awayTimeoutId) {
      clearTimeout(this.state.awayTimeoutId);
      this.state.awayTimeoutId = null;
    }
    if (this._visibilityHandler) {
      document.removeEventListener('visibilitychange', this._visibilityHandler);
      this._visibilityHandler = null;
    }
  },

  getProgress() {
    if (!this.state.running) return 0;
    return this.state.elapsedSeconds / this.state.totalSeconds;
  },

  getTreeSize() {
    const p = this.getProgress();
    if (p >= 0.9) return 'large';
    if (p >= 0.5) return 'medium';
    return 'small';
  },

  isRunning() { return this.state.running; },
  isPaused() { return this.state.paused; },
};
