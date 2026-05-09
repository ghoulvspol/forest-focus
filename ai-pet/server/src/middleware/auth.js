// src/middleware/auth.js — JWT 鉴权中间件
// 用法：router.get('/xxx', auth, handler)

const jwt = require('jsonwebtoken')

module.exports = async function auth(ctx, next) {
  const header = ctx.headers.authorization || ''
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) ctx.throw(401, '未登录，请先授权')

  try {
    ctx.state.user = jwt.verify(token, process.env.JWT_SECRET)
  } catch (err) {
    ctx.throw(401, err.name === 'TokenExpiredError' ? '登录已过期，请重新授权' : '无效 token')
  }

  await next()
}
