// src/app.js — Koa 应用入口
// 职责：注册中间件、挂载路由、启动服务

require('dotenv').config()
const Koa        = require('koa')
const Router     = require('@koa/router')
const cors       = require('@koa/cors')
const helmet     = require('koa-helmet')
const { koaBody } = require('koa-body')
const path       = require('path')

const errorMiddleware = require('./middleware/error')
const authRouter      = require('./routes/auth')
const petRouter       = require('./routes/pet')
const userRouter      = require('./routes/user')

const app = new Koa()

// ── 全局中间件（顺序有意义，勿随意调整）──────────────────
app.use(helmet())
app.use(cors({ origin: '*', credentials: true }))
app.use(errorMiddleware)                  // 最先，捕获所有下游错误
app.use(koaBody({
  multipart: true,                        // 支持文件上传（formData）
  formidable: {
    uploadDir: path.join(__dirname, '../tmp'),
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024,        // 最大 10MB（前端已校验，后端兜底）
  }
}))

// ── 路由 ─────────────────────────────────────────────────
const root = new Router({ prefix: '/api' })
root.use('/auth', authRouter.routes(), authRouter.allowedMethods())
root.use('/pet',  petRouter.routes(),  petRouter.allowedMethods())
root.use('/user', userRouter.routes(), userRouter.allowedMethods())

// 健康检查（部署平台 / 负载均衡探测用）
root.get('/health', ctx => { ctx.body = { ok: true } })

app.use(root.routes())
app.use(root.allowedMethods())

// ── 启动 ─────────────────────────────────────────────────
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`[server] running on http://localhost:${PORT}`)
  console.log(`[server] NODE_ENV=${process.env.NODE_ENV}`)
})

module.exports = app   // 方便测试 import
