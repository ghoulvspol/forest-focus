// src/routes/user.js — 用户设置
// PUT /api/user/notify  开关微信订阅消息提醒

const Router = require('@koa/router')
const { PrismaClient } = require('@prisma/client')
const auth   = require('../middleware/auth')

const router = new Router()
const prisma = new PrismaClient()

// PUT /api/user/notify
// body: { enabled: boolean }
router.put('/notify', auth, async ctx => {
  const { enabled } = ctx.request.body
  if (typeof enabled !== 'boolean') ctx.throw(400, 'enabled 必须为 boolean')

  await prisma.user.update({
    where: { id: ctx.state.user.userId },
    data:  { notifyEnabled: enabled }
  })

  ctx.body = { ok: true }
})

module.exports = router
