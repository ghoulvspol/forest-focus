// app.js — 全局应用入口
// 职责：微信登录、全局状态（当前用户 + 宠物）、API baseURL

App({
  globalData: {
    user: null,       // { id, openId, nickname, avatarUrl, notifyEnabled }
    pet: null,        // { id, name, species, stats, imageStatus, stylizedImageUrl, ... }
    loginFailed: false,
    apiBase: 'http://localhost:3000'  // 开发环境；真机调试改为本机局域网 IP，如 http://192.168.x.x:3000
  },

  onLaunch() {
    this._login()
  },

  // ────────────────────────────────────────────────────
  // 微信登录流程：
  //
  //   wx.login() → code
  //       ↓
  //   POST /api/auth/login { code }
  //       ↓
  //   服务端：code2Session → openId → JWT token
  //       ↓
  //   存 token 到 storage，拉取用户信息
  //       ↓
  //   有宠物 → 拉取宠物数据存 globalData.pet
  //   无宠物 → 跳转 upload 页
  // ────────────────────────────────────────────────────
  async _login() {
    try {
      const { request } = require('./utils/api')
      const { code } = await this._wxLogin()
      const { token, user } = await request({
        url: '/api/auth/login',
        method: 'POST',
        data: { code }
      })
      wx.setStorageSync('token', token)
      this.globalData.user = user

      // 尝试拉取宠物数据
      try {
        const pet = await request({ url: '/api/pet/mine' })
        this.globalData.pet = pet
      } catch (e) {
        // 404 = 用户还没有宠物，属于正常情况
        if (e.statusCode !== 404) throw e
      }

    } catch (err) {
      console.error('[app] 登录失败', JSON.stringify(err))
      this.globalData.loginFailed = true
      wx.showToast({ title: '登录失败，请重试', icon: 'error' })
    }
  },

  // 封装 wx.login 为 Promise
  _wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: resolve,
        fail: reject
      })
    })
  },

  // 供页面调用：确保登录完成后再执行回调
  // 用法：app.ensureLogin().then(() => { ... }).catch(() => { ... })
  ensureLogin() {
    return new Promise((resolve, reject) => {
      if (this.globalData.user) { resolve(); return }
      if (this.globalData.loginFailed) { reject(new Error('登录失败')); return }

      let elapsed = 0
      const timer = setInterval(() => {
        elapsed += 100
        if (this.globalData.user) {
          clearInterval(timer)
          resolve()
        } else if (this.globalData.loginFailed || elapsed > 10000) {
          clearInterval(timer)
          reject(new Error(elapsed > 10000 ? '登录超时' : '登录失败'))
        }
      }, 100)
    })
  }
})
