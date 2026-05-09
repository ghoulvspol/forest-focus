// src/middleware/error.js — 全局错误处理中间件
// 统一响应格式：{ ok: false, message, code }

module.exports = async function errorMiddleware(ctx, next) {
  try {
    await next()
  } catch (err) {
    const status  = err.status || err.statusCode || 500
    const message = err.message || '服务器内部错误'

    ctx.status = status
    ctx.body   = { ok: false, message, code: err.code || status }

    // 5xx 错误打印堆栈，方便排查（生产环境可接 Sentry）
    if (status >= 500) {
      console.error('[error]', err)
    }
  }
}
