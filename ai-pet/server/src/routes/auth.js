// src/routes/auth.js — 微信登录
// POST /api/auth/login

const Router = require('@koa/router')
const jwt    = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const { code2Session }  = require('../services/wechat')

const router = new Router()
const prisma = new PrismaClient()

/**
 * POST /api/auth/login
 * body: { code: string }
 * 返回: { token, user }
 *
 * 流程：
 *   code → code2Session → openId
 *   openId 存在 → 查用户 → 更新
 *   OpenId 不存在 → 创建新用户
 *   签发 JWT → 返回
 */
router.post('/login', async ctx => {
  const { code } = ctx.request.body
  if (!code) ctx.throw(400, '缺少 code 参数')

  const { openId, unionId } = await code2Session(code)

  // upsert：用 openId 查找或创建用户
  const user = await prisma.user.upsert({
    where:  { openId },
    update: { ...(unionId ? { unionId } : {}) },
    create: { openId, unionId }
  })

  const token = jwt.sign(
    { userId: user.id, openId: user.openId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  )

  ctx.body = {
    ok: true,
    token,
    user: {
      id:            user.id,
      openId:        user.openId,
      nickname:      user.nickname,
      avatarUrl:     user.avatarUrl,
      notifyEnabled: user.notifyEnabled
    }
  }
})

module.exports = router
