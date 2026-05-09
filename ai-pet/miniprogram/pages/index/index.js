// pages/index/index.js — 宠物主界面
const app = getApp()
const { request } = require('../../utils/api')
const { parseStats, getMood, MOOD_EMOJI, MOOD_TEXT, statToWidth, INTERACT_CONFIG, DAILY_LIMITS } = require('../../utils/pet')

Page({
  data: {
    loading: true,
    pet: null,
    stats: { satiety: 0, cleanliness: 0, happiness: 0 },
    // 进度条宽度
    satietyWidth:     '0%',
    cleanlinessWidth: '0%',
    happinessWidth:   '0%',
    // 情绪
    mood:      'happy',
    moodEmoji: '😊',
    moodText:  '心情很好～',
    // 互动按钮状态（含今日次数 + 是否禁用）
    interactButtons: [],
    // 防止快速重复点击（按 type 记录请求中状态）
    _pendingInteract: {}
  },

  onLoad() {
    app.ensureLogin()
      .then(() => this._loadPet())
      .catch(err => {
        console.error('[index] 登录失败', err.message)
        this.setData({ loading: false })
        wx.showToast({ title: err.message || '登录失败，请重启', icon: 'error' })
      })
  },

  onShow() {
    // 每次切回主页刷新宠物状态（Cron 可能已衰减）
    if (!this.data.loading && this.data.pet) {
      this._loadPet()
    }
  },

  // ─── 数据加载 ────────────────────────────────────────────
  async _loadPet() {
    this.setData({ loading: true })
    try {
      const pet = await request({ url: '/api/pet/mine' })
      app.globalData.pet = pet
      this._applyPetData(pet)
    } catch (e) {
      if (e.statusCode === 404) {
        // 还没有宠物，展示引导
        this.setData({ pet: null, loading: false })
      } else {
        wx.showToast({ title: '加载失败，请重试', icon: 'error' })
        this.setData({ loading: false })
      }
    }
  },

  _applyPetData(pet) {
    const stats = parseStats(pet.stats)
    const mood  = getMood(stats.happiness)

    // 构建互动按钮数据（含今日次数）
    const todayCounts = pet.todayCounts || {}   // 后端返回当日各互动次数
    const interactButtons = INTERACT_CONFIG.map(cfg => ({
      ...cfg,
      todayCount: todayCounts[cfg.type] || 0,
      limit:      DAILY_LIMITS[cfg.type],
      disabled:   (todayCounts[cfg.type] || 0) >= DAILY_LIMITS[cfg.type]
    }))

    this.setData({
      loading: false,
      pet,
      stats,
      satietyWidth:     statToWidth(stats.satiety),
      cleanlinessWidth: statToWidth(stats.cleanliness),
      happinessWidth:   statToWidth(stats.happiness),
      mood,
      moodEmoji: MOOD_EMOJI[mood],
      moodText:  MOOD_TEXT[mood],
      interactButtons
    })
  },

  // ─── 互动 ────────────────────────────────────────────────
  async onInteract(e) {
    const type = e.currentTarget.dataset.type
    const btn = this.data.interactButtons.find(b => b.type === type)

    // 已达上限或正在请求中，直接忽略
    if (btn?.disabled || this.data._pendingInteract[type]) return

    // 前端立即禁用按钮（Issue 6 修复）
    this._setPendingInteract(type, true)

    try {
      const { stats: newStats, todayCounts } = await request({
        url: '/api/pet/interact',
        method: 'POST',
        data: { type, petId: this.data.pet.id }
      })

      // 更新状态
      const updatedPet = { ...this.data.pet, stats: newStats, todayCounts }
      this._applyPetData(updatedPet)

      wx.showToast({ title: `${btn.emoji} 互动成功！`, icon: 'none', duration: 1200 })
    } catch (err) {
      wx.showToast({ title: err.message || '互动失败', icon: 'error' })
      this._setPendingInteract(type, false)
    }
  },

  _setPendingInteract(type, pending) {
    const _pendingInteract = { ...this.data._pendingInteract, [type]: pending }
    this.setData({ _pendingInteract })

    // 若按钮是禁用状态，不需要手动解除（禁用由 todayCount 驱动）
    // 若只是临时 pending（网络错误），自动 3 秒后解除
    if (pending) {
      setTimeout(() => {
        const current = this.data._pendingInteract
        if (current[type]) {
          this.setData({ _pendingInteract: { ...current, [type]: false } })
        }
      }, 3000)
    }
  },

  // ─── AI 生成失败重试 ─────────────────────────────────────
  async retryAiGenerate(e) {
    e.stopPropagation()
    try {
      await request({
        url: '/api/pet/retry-generate',
        method: 'POST',
        data: { petId: this.data.pet.id }
      })
      wx.showToast({ title: '已重新生成，请稍候', icon: 'none' })
      // 3 秒后刷新
      setTimeout(() => this._loadPet(), 3000)
    } catch {
      wx.showToast({ title: '重试失败，请稍后再试', icon: 'error' })
    }
  },

  // ─── 跳转 ────────────────────────────────────────────────
  goUpload() {
    wx.navigateTo({ url: '/pages/upload/upload' })
  },

  onAvatarTap() {
    // 预留：点击头像可查看全屏宠物 / 动画
  }
})
