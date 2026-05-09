// pages/upload/upload.js — 照片上传 + AI 风格化
// CRITICAL 修复：AI 超时处理、OSS 失败回滚（由后端事务保证）

const { uploadFile, request } = require('../../utils/api')
const app = getApp()

// loading 文案轮播（让等待不枯燥）
const LOADING_TEXTS = [
  '正在上传照片...',
  '正在分析宠物特征...',
  '施展魔法变身中 ✨',
  '快好了，再等一下～'
]

Page({
  data: {
    step: 1,
    previewUrl:    '',   // 本地临时路径
    uploadError:   '',
    uploading:     false,
    uploadStatus:  LOADING_TEXTS[0],
    speciesOptions: ['猫咪', '狗狗', '其他'],
    speciesIndex:   0,
    styleOptions:  [],   // [{ style, label, url }] 由后端返回
    selectedStyle: '',
    confirmedStyleUrl: '',
    petName:  '',
    creating: false
  },

  // ─── Step 1：选择照片 ──────────────────────────────────
  choosePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const file = res.tempFiles[0]
        // 文件大小校验：最大 10MB
        if (file.size > 10 * 1024 * 1024) {
          wx.showToast({ title: '照片不能超过 10MB', icon: 'error' })
          return
        }
        this.setData({ previewUrl: file.tempFilePath, uploadError: '' })
      }
    })
  },

  onSpeciesChange(e) {
    this.setData({ speciesIndex: Number(e.detail.value) })
  },

  // ─── Step 1 → Step 2：上传 + AI 生成 ──────────────────
  async uploadAndGenerate() {
    if (!this.data.previewUrl || this.data.uploading) return
    this.setData({ uploading: true, uploadError: '', uploadStatus: LOADING_TEXTS[0] })

    // 启动 loading 文案轮播
    const textTimer = this._startLoadingText()

    try {
      const species = ['cat', 'dog', 'other'][this.data.speciesIndex]

      // 上传原图 + 触发 AI 风格化（同步，后端完成后返回风格列表）
      // 超时 60 秒（wx.request 默认值），超时后 catch 分支处理
      const { styleOptions } = await uploadFile(
        this.data.previewUrl,
        `/api/pet/generate-styles?species=${species}`
      )

      clearInterval(textTimer)
      this.setData({
        uploading: false,
        step: 2,
        styleOptions
      })

    } catch (err) {
      clearInterval(textTimer)
      // CRITICAL 修复：区分超时和其他错误，给用户明确提示和重试入口
      const msg = err.statusCode === 408
        ? 'AI 生成超时，网络可能较慢，请重试'
        : (err.message || 'AI 生成失败，请重试')
      this.setData({ uploading: false, uploadError: msg, uploadStatus: LOADING_TEXTS[0] })
    }
  },

  _startLoadingText() {
    let idx = 0
    return setInterval(() => {
      idx = (idx + 1) % LOADING_TEXTS.length
      this.setData({ uploadStatus: LOADING_TEXTS[idx] })
    }, 4000)
  },

  // ─── Step 2：选择风格 ──────────────────────────────────
  selectStyle(e) {
    this.setData({ selectedStyle: e.currentTarget.dataset.style })
  },

  confirmStyle() {
    if (!this.data.selectedStyle) return
    const chosen = this.data.styleOptions.find(s => s.style === this.data.selectedStyle)
    this.setData({ step: 3, confirmedStyleUrl: chosen?.url || '' })
  },

  // ─── Step 3：起名 + 创建宠物 ──────────────────────────
  onNameInput(e) {
    this.setData({ petName: e.detail.value })
  },

  async createPet() {
    const name = this.data.petName.trim()
    if (!name || this.data.creating) return

    this.setData({ creating: true })
    try {
      const pet = await request({
        url: '/api/pet/create',
        method: 'POST',
        data: {
          name,
          species: ['cat', 'dog', 'other'][this.data.speciesIndex],
          style: this.data.selectedStyle
        }
      })

      app.globalData.pet = pet
      wx.showToast({ title: `${name} 创建成功！`, icon: 'success' })

      // 返回主页
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' })
      }, 1200)

    } catch (err) {
      wx.showToast({ title: err.message || '创建失败，请重试', icon: 'error' })
      this.setData({ creating: false })
    }
  }
})
