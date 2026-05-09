// src/routes/pet.js — 宠物相关接口
//
// GET  /api/pet/mine             查询当前用户的宠物
// POST /api/pet/generate-styles  上传照片 + AI 风格化（同步，CRITICAL 修复含超时处理）
// POST /api/pet/create           用选定风格创建宠物
// POST /api/pet/interact         互动（喂食/抚摸/玩耍）
// POST /api/pet/retry-generate   重试 AI 风格化

const Router  = require('@koa/router')
const path    = require('path')
const { PrismaClient } = require('@prisma/client')
const auth    = require('../middleware/auth')
const { uploadFile, uploadBuffer, deleteFile } = require('../services/oss')
const { generateStyles }  = require('../services/ai')
const { parseStats, DAILY_LIMITS, INTERACT_DELTA } = require('../utils/pet')


const router = new Router()
const prisma = new PrismaClient()

// ─── 查询当前用户的宠物 ───────────────────────────────────
// GET /api/pet/mine
// 返回宠物信息 + 今日各互动次数（前端用来判断按钮是否禁用）
router.get('/mine', auth, async ctx => {
  const pet = await prisma.pet.findUnique({
    where: { userId: ctx.state.user.userId }
  })
  if (!pet) ctx.throw(404, '还没有宠物')

  const todayCounts = await _getTodayCounts(pet.id)
  ctx.body = { ok: true, ...formatPet(pet), todayCounts }
})

// ─── 上传照片 + AI 风格化 ────────────────────────────────
// POST /api/pet/generate-styles
// 请求：multipart/form-data，字段 photo(file) + species(string)
// 返回：{ styleOptions: [{ style, label, url }] }
//
// CRITICAL 修复：
//   1. OSS 上传失败时不进入 AI 调用（事务保证）
//   2. AI 超时时清理已上传的 OSS 原图，返回明确错误
router.post('/generate-styles', auth, async ctx => {
  const file    = ctx.request.files?.photo
  const species = ctx.request.body?.species || 'cat'

  if (!file) ctx.throw(400, '请上传照片')

  // 文件类型校验（后端兜底，前端已校验）
  const ext = path.extname(file.originalFilename || file.newFilename || '').toLowerCase()
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
    ctx.throw(400, '只支持 JPG / PNG / WEBP 格式')
  }

  const userId  = ctx.state.user.userId
  const ossKey  = `${userId}/tmp/original${ext}`
  let originalUrl = null

  // Step 1：上传原图到 OSS
  try {
    originalUrl = await uploadFile(file.filepath, ossKey)
  } catch (err) {
    ctx.throw(502, `图片上传失败，请重试（${err.message}）`)
  }

  // Step 2：调用 AI 风格化（同步，约 15-30 秒）
  // AI 失败时清理 OSS 原图（CRITICAL 修复）
  let styleOptions
  try {
    styleOptions = await generateStyles(originalUrl, species)
  } catch (err) {
    await deleteFile(ossKey)   // 清理 OSS，避免孤儿文件
    const isTimeout = err.message?.includes('超时')
    ctx.throw(isTimeout ? 408 : 502, err.message || 'AI 生成失败，请重试')
  }

  // 将风格化图片上传到 OSS（永久存储，tmp 目录的只是原图中转）
  const uploadedStyles = await Promise.all(
    styleOptions.map(async ({ style, label, url: aiUrl }) => {
      const buf     = await _downloadBuffer(aiUrl)
      const permKey = `${userId}/styles/${style}.jpg`
      const permUrl = await uploadBuffer(buf, permKey)
      return { style, label, url: permUrl }
    })
  )

  ctx.body = { ok: true, styleOptions: uploadedStyles, originalUrl }
})

// ─── 创建宠物 ────────────────────────────────────────────
// POST /api/pet/create
// body: { name, species, style }
// 注：originalUrl 从 generate-styles 结果中由前端传回（简化流程）
router.post('/create', auth, async ctx => {
  const { name, species, style, originalUrl } = ctx.request.body
  if (!name?.trim()) ctx.throw(400, '请填写宠物名字')
  if (!style)        ctx.throw(400, '请选择造型风格')

  const userId = ctx.state.user.userId

  // 幂等：已有宠物则不允许重复创建（MVP：一人一宠）
  const existing = await prisma.pet.findUnique({ where: { userId } })
  if (existing) ctx.throw(409, '已有数字宠物，不能重复创建')

  // 根据 style 反查已上传的 OSS URL
  const stylizedUrl = `${process.env.OSS_CDN_BASE}/${userId}/styles/${style}.jpg`

  const pet = await prisma.pet.create({
    data: {
      userId,
      name:             name.trim(),
      species:          species || 'cat',
      originalImageUrl: originalUrl || '',
      stylizedImageUrl: stylizedUrl,
      imageStyle:       style,
      imageStatus:      'done'
    }
  })

  ctx.status = 201
  ctx.body   = { ok: true, ...formatPet(pet), todayCounts: {} }
})

// ─── 互动 ────────────────────────────────────────────────
// POST /api/pet/interact
// body: { type: 'feed' | 'pet_action' | 'play' }
//
// 返回：{ stats: newStats, todayCounts }
router.post('/interact', auth, async ctx => {
  const { type } = ctx.request.body
  if (!INTERACT_DELTA[type]) ctx.throw(400, `无效互动类型: ${type}`)

  const userId = ctx.state.user.userId
  const pet    = await prisma.pet.findUnique({ where: { userId } })
  if (!pet) ctx.throw(404, '找不到宠物')

  const today        = _todayDate()
  const todayCounts  = await _getTodayCounts(pet.id)
  const currentCount = todayCounts[type] || 0
  const limit        = DAILY_LIMITS[type]

  if (currentCount >= limit) {
    ctx.throw(429, `今日 ${type} 互动次数已达上限（${limit} 次）`)
  }

  // 计算新 stats
  const stats    = parseStats(pet.stats)
  const delta    = INTERACT_DELTA[type]
  const newStats = {}
  for (const key of ['satiety', 'cleanliness', 'happiness']) {
    newStats[key] = Math.min(100, stats[key] + (delta[key] || 0))
  }

  // 事务：同时更新 pet.stats 和 daily_interactions
  await prisma.$transaction([
    prisma.pet.update({
      where: { id: pet.id },
      data:  { stats: newStats, updatedAt: new Date() }
    }),
    prisma.dailyInteraction.upsert({
      where: {
        petId_interactionType_interactionDate: {
          petId:           pet.id,
          interactionType: type,
          interactionDate: today
        }
      },
      update: {
        count:            { increment: 1 },
        statsDelta:       delta,
        lastInteractedAt: new Date()
      },
      create: {
        petId:           pet.id,
        interactionType: type,
        interactionDate: today,
        count:           1,
        statsDelta:      delta
      }
    })
  ])

  const newCounts = { ...todayCounts, [type]: currentCount + 1 }
  ctx.body = { ok: true, stats: newStats, todayCounts: newCounts }
})

// ─── 重试 AI 生成 ─────────────────────────────────────────
// POST /api/pet/retry-generate
// body: { petId }
router.post('/retry-generate', auth, async ctx => {
  const pet = await prisma.pet.findFirst({
    where: { id: Number(ctx.request.body.petId), userId: ctx.state.user.userId }
  })
  if (!pet) ctx.throw(404, '找不到宠物')
  if (!['failed', 'pending'].includes(pet.imageStatus)) {
    ctx.throw(409, '当前状态无需重试')
  }
  if (!pet.originalImageUrl) ctx.throw(400, '缺少原图，请重新上传')

  await prisma.pet.update({
    where: { id: pet.id },
    data:  { imageStatus: 'pending' }
  })

  // 异步执行（不阻塞响应）
  _doRetryGenerate(pet).catch(err =>
    console.error(`[pet] retry-generate 失败 petId=${pet.id}`, err)
  )

  ctx.body = { ok: true, message: '已开始重新生成' }
})

// ─── 内部工具函数 ─────────────────────────────────────────

async function _doRetryGenerate(pet) {
  await prisma.pet.update({ where: { id: pet.id }, data: { imageStatus: 'processing' } })
  try {
    const styles = await generateStyles(pet.originalImageUrl, pet.species)
    // 上传第一张作为默认，保留选择的风格
    const chosen = styles.find(s => s.style === pet.imageStyle) || styles[0]
    const buf = await _downloadBuffer(chosen.url)
    const ossKey = `${pet.userId}/styles/${pet.imageStyle || 'cartoon'}.jpg`
    const url = await uploadBuffer(buf, ossKey)
    await prisma.pet.update({
      where: { id: pet.id },
      data:  { stylizedImageUrl: url, imageStatus: 'done', imageUpdatedAt: new Date() }
    })
  } catch {
    await prisma.pet.update({ where: { id: pet.id }, data: { imageStatus: 'failed' } })
  }
}

/** 查询今日各互动类型次数，返回 { feed: 2, pet_action: 1, play: 0 } */
async function _getTodayCounts(petId) {
  const today = _todayDate()
  const rows  = await prisma.dailyInteraction.findMany({
    where: { petId, interactionDate: today }
  })
  return Object.fromEntries(rows.map(r => [r.interactionType, r.count]))
}

/** 今天 00:00:00 UTC+8 的 Date 对象（存 DATE 字段用） */
function _todayDate() {
  const now = new Date()
  // 北京时间日期
  const cst = new Date(now.getTime() + 8 * 60 * 60 * 1000)
  return new Date(`${cst.toISOString().slice(0, 10)}T00:00:00.000Z`)
}

/** 下载远程图片为 Buffer（用于将 AI 结果搬运到 OSS）*/
async function _downloadBuffer(url) {
  const axios = require('axios')
  const { data } = await axios.get(url, { responseType: 'arraybuffer', timeout: 20_000 })
  return Buffer.from(data)
}

/** Prisma Pet 对象转前端格式 */
function formatPet(pet) {
  return {
    id:               pet.id,
    name:             pet.name,
    species:          pet.species,
    originalImageUrl: pet.originalImageUrl,
    stylizedImageUrl: pet.stylizedImageUrl,
    imageStyle:       pet.imageStyle,
    imageStatus:      pet.imageStatus,
    stats:            pet.stats,
    createdAt:        pet.createdAt
  }
}

module.exports = router
