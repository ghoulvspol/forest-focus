/**
 * Forest Focus - 主应用（路由 + 状态管理 + 事件绑定）
 */
const App = {
  state: {
    currentPage: 'home',
    selectedDuration: 25,
    selectedSeed: 'cherry',
    lastResult: null,
  },

  init() {
    this._bindNavigation();
    this._bindHomePage();
    this._bindFocusPage();
    this._bindCompletePage();
    this._updateFreeCounter();
    this._renderSeeds();
    this._showPage('home');
  },

  // ========== 页面路由 ==========
  _showPage(name) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById('page' + name.charAt(0).toUpperCase() + name.slice(1));
    if (page) {
      page.classList.add('active');
      this.state.currentPage = name;
    }

    // 导航状态
    const back = document.getElementById('navBack');
    back.style.display = (name === 'home') ? 'none' : 'block';
  },

  _bindNavigation() {
    document.getElementById('navBack').addEventListener('click', () => {
      if (FocusTimer.isRunning()) {
        if (!confirm('正在专注中，确定要离开吗？')) return;
        FocusTimer.giveup();
      }
      this._showPage('home');
      this._updateFreeCounter();
    });

    document.getElementById('navForest').addEventListener('click', () => {
      if (FocusTimer.isRunning()) return;
      ForestPage.render();
      this._showPage('forest');
    });

    document.getElementById('navStats').addEventListener('click', () => {
      if (FocusTimer.isRunning()) return;
      StatsPage.render();
      this._showPage('stats');
    });
  },

  // ========== 首页 ==========
  _renderSeeds() {
    const grid = document.getElementById('seedGrid');
    grid.innerHTML = Storage.SEEDS.map(seed => `
      <div class="seed-card ${seed.id === this.state.selectedSeed ? 'active' : ''}" data-seed="${seed.id}">
        <div class="seed-emoji">${seed.emoji}</div>
        <div class="seed-name">${seed.name}</div>
        <div class="seed-desc">${seed.description}</div>
      </div>
    `).join('');

    grid.querySelectorAll('.seed-card').forEach(card => {
      card.addEventListener('click', () => {
        grid.querySelectorAll('.seed-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.state.selectedSeed = card.dataset.seed;
      });
    });
  },

  _bindHomePage() {
    // 时长选择
    document.getElementById('durationGrid').addEventListener('click', (e) => {
      const btn = e.target.closest('.duration-btn');
      if (!btn) return;
      document.querySelectorAll('.duration-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.state.selectedDuration = parseInt(btn.dataset.minutes);
    });

    // 开始按钮
    document.getElementById('startBtn').addEventListener('click', () => {
      const remaining = Storage.getRemainingFree();
      if (remaining <= 0) {
        alert('今日免费次数已用完，明天再来吧！\n\n（付费版可解锁无限专注）');
        return;
      }

      const promise = document.getElementById('promiseInput').value.trim();
      this._startFocus(this.state.selectedDuration, this.state.selectedSeed, promise);
    });
  },

  _updateFreeCounter() {
    const remaining = Storage.getRemainingFree();
    const el = document.getElementById('freeCounter');
    if (remaining > 0) {
      el.textContent = `今日剩余 ${remaining} 次免费专注`;
    } else {
      el.textContent = '今日免费次数已用完';
      el.style.color = '#e74c3c';
    }
  },

  // ========== 专注页 ==========
  _startFocus(minutes, seedId, promise) {
    this._showPage('focus');

    const canvas = document.getElementById('treeCanvas');
    const ctx = canvas.getContext('2d');
    const seed = Storage.getSeedById(seedId);

    // 显示承诺
    const promiseDisplay = document.getElementById('promiseDisplay');
    promiseDisplay.textContent = promise ? `🎯 ${promise}` : '';

    // 初始化显示
    document.getElementById('timerMinutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('timerSeconds').textContent = '00';
    document.getElementById('timerProgressBar').style.width = '0%';
    document.getElementById('waitingMsg').style.display = 'none';
    document.getElementById('pauseBtn').textContent = '暂停';

    // 绘制初始状态
    TreeRenderer.draw(ctx, 0, seed, canvas.width, canvas.height);

    // 开始计时
    FocusTimer.start(minutes, seedId, promise, {
      onTick: ({ elapsed, remaining, total, progress }) => {
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        document.getElementById('timerMinutes').textContent = String(mins).padStart(2, '0');
        document.getElementById('timerSeconds').textContent = String(secs).padStart(2, '0');
        document.getElementById('timerProgressBar').style.width = (progress * 100) + '%';

        // 生长动画
        TreeRenderer.draw(ctx, progress, seed, canvas.width, canvas.height);
      },
      onComplete: (result) => {
        this.state.lastResult = result;
        this._showComplete(result);
      },
      onAway: () => {
        document.getElementById('waitingMsg').style.display = 'block';
      },
      onReturn: () => {
        document.getElementById('waitingMsg').style.display = 'none';
      },
    });
  },

  _bindFocusPage() {
    document.getElementById('pauseBtn').addEventListener('click', () => {
      const paused = FocusTimer.pause();
      document.getElementById('pauseBtn').textContent = paused ? '继续' : '暂停';
    });

    document.getElementById('giveupBtn').addEventListener('click', () => {
      if (!confirm('确定要放弃本次专注吗？')) return;
      const result = FocusTimer.giveup();
      if (result && result.cancelled) {
        this._showPage('home');
      }
    });
  },

  // ========== 完成页 ==========
  _showComplete(result) {
    this._showPage('complete');

    const seed = Storage.getSeedById(result.seedId);
    const treeSize = result.duration >= 45 ? 'large' : result.duration >= 20 ? 'medium' : 'small';

    // 更新文字
    document.getElementById('completeTitle').textContent =
      result.completed ? '🌳 你的树长大了！' : '🌱 专注结束了';
    document.getElementById('completeDuration').textContent = result.duration;
    document.getElementById('completePromise').textContent =
      result.promise ? (result.completed ? '✅' : '⏳') : '-';

    // 绘制完成树
    const canvas = document.getElementById('completeTreeCanvas');
    const ctx = canvas.getContext('2d');
    TreeRenderer.drawMini(ctx, seed, 200, treeSize);
  },

  _bindCompletePage() {
    document.getElementById('saveForestBtn').addEventListener('click', () => {
      const result = this.state.lastResult;
      if (!result) return;

      // 保存到森林
      Storage.addTree({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        seedId: result.seedId,
        duration: result.duration,
        promise: result.promise,
        completed: result.completed,
        date: result.date,
        time: result.time,
      });

      // 增加每日使用次数
      Storage.incrementDailyUsage();

      // 跳转到森林
      ForestPage.render();
      this._showPage('forest');
    });

    document.getElementById('againBtn').addEventListener('click', () => {
      this._updateFreeCounter();
      this._showPage('home');
      document.getElementById('promiseInput').value = '';
    });

    document.getElementById('viewForestBtn').addEventListener('click', () => {
      ForestPage.render();
      this._showPage('forest');
    });
  },
};

// 启动
document.addEventListener('DOMContentLoaded', () => App.init());
