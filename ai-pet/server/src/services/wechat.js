// src/services/wechat.js — 微信 API 封装
// 职责：code2Session、发订阅消息

const axios = require('axios')

const WX_BASE = 'https://api.weixin.qq.com'

/**
 * 用 wx.login code 换取 openId（+ sessionKey）
 * 文档：https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/user-login/code2Session.html
 * @param {string} code - 前端 wx.login() 返回的 code
 * @returns {{ openId: string, unionId?: string, sessionKey: string }}
 */
async function code2Session(code) {
  const { data } = await axios.get(`${WX_BASE}/sns/jscode2session`, {
    params: {
      appid:      process.env.WX_APP_ID,
      secret:     process.env.WX_APP_SECRET,
      js_code:    code,
      grant_type: 'authorization_code'
    },
    timeout: 10_000
  })

  if (data.errcode) {
    const err = new Error(`微信 code2Session 失败: ${data.errmsg}`)
    err.status = 502
    throw err
  }

  return {
    openId:     data.openid,
    unionId:    data.unionid || null,   // 未绑定开放平台时为空
    sessionKey: data.session_key
  }
}

/**
 * 获取小程序 access_token（简单版，生产建议用 Redis 缓存 + 自动刷新）
 * @returns {string}
 */
async function getAccessToken() {
  const { data } = await axios.get(`${WX_BASE}/cgi-bin/token`, {
    params: {
      grant_type: 'client_credential',
      appid:      process.env.WX_APP_ID,
      secret:     process.env.WX_APP_SECRET
    },
    timeout: 10_000
  })
  if (data.errcode) throw new Error(`获取 access_token 失败: ${data.errmsg}`)
  return data.access_token
}

/**
 * 发送微信订阅消息（宠物难过提醒）
 * 文档：https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/mp-message-management/subscribe-message/sendMessage.html
 * @param {{ openId: string, petName: string, happiness: number }} opts
 */
async function sendLowStatsNotify({ openId, petName, happiness }) {
  const token = await getAccessToken()
  const { data } = await axios.post(
    `${WX_BASE}/cgi-bin/message/subscribe/send?access_token=${token}`,
    {
      touser:           openId,
      template_id:      process.env.WX_NOTIFY_TPL_LOW_STATS,
      miniprogram_state: process.env.NODE_ENV === 'production' ? 'formal' : 'trial',
      // 模板变量（需与微信后台模板字段对应）
      data: {
        thing1:  { value: petName },               // 宠物名字
        number2: { value: String(happiness) },      // 当前快乐度
        thing3:  { value: '你的宠物想你了！快来陪它玩～' }
      }
    },
    { timeout: 10_000 }
  )

  // errcode 非 0 且非 43101（用户未订阅）时才抛出
  if (data.errcode && data.errcode !== 43101) {
    console.warn(`[wechat] 推送失败 openId=${openId} errcode=${data.errcode} errmsg=${data.errmsg}`)
  }
}

module.exports = { code2Session, sendLowStatsNotify }
