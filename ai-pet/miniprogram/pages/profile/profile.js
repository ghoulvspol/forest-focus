// pages/profile/profile.js
const app = getApp()
const { request } = require('../../utils/api')

Page({
  data: {
    user: null,
    pet: null,
    notifyEnabled: false
  },

  onShow() {
    app.ensureLogin().then(() => {
      this.setData({
        user: app.globalData.user,
        pet:  app.globalData.pet,
        notifyEnabled: app.globalData.user?.notifyEnabled || false
      })
    })
  },

  async toggleNotify() {
    const newVal = !this.data.notifyEnabled

    // 开启时需要申请微信订阅消息权限
    if (newVal) {
      try {
        await this._requestSubscribe()
      } catch {
        // 用户拒绝授权，不更新状态
        return
      }
    }

    try {
      await request({
        url: '/api/user/notify',
        method: 'PUT',
        data: { enabled: newVal }
      })
      this.setData({ notifyEnabled: newVal })
      if (app.globalData.user) {
        app.globalData.user.notifyEnabled = newVal
      }
      wx.showToast({ title: newVal ? '提醒已开启' : '提醒已关闭', icon: 'success' })
    } catch {
      wx.showToast({ title: '设置失败，请重试', icon: 'error' })
    }
  },

  _requestSubscribe() {
    return new Promise((resolve, reject) => {
      wx.requestSubscribeMessage({
        tmplIds: ['YOUR_TEMPLATE_ID'],  // TODO: 替换为微信后台申请的模板 ID
        success(res) {
          if (res['YOUR_TEMPLATE_ID'] === 'accept') {
            resolve()
          } else {
            wx.showToast({ title: '需要授权才能开启提醒', icon: 'none' })
            reject()
          }
        },
        fail: reject
      })
    })
  },

  goUpload() {
    wx.navigateTo({ url: '/pages/upload/upload' })
  }
})
