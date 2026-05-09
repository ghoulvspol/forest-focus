// cron/decay.js — 每小时宠物状态衰减
// 运行方式：node cron/decay.js
// 建议用阿里云定时任务 / Linux crontab 每小时调用：
//   0 * * * * cd /app && node cron/decay.js >> /var/log/pet-decay.log 2>&1
//
// 衰减规则：
//   每次运行将所有宠物的三个属性各 -3，最低不低于 5
//   同时检查 happiness < 30 的宠物，推送微信订阅消息（24h 内不重复推送）
//
// TODO 1 扩展注：用户量超 10w 时，将全量更新改为分批处理：
//   WHERE id > lastProcessedId LIMIT 1000，循环直到处理完毕

require('dotenv').config({ path: require('path').join(__dirname, '../.env') })

const { PrismaClient } = require('@prisma/client')
const { sendLowStatsNotify } = require('../src/services/wechat')
const { parseStats, getMood } = require('../src/utils/pet')

const prisma = new PrismaClient()

const DECAY_AMOUNT = 3
const STAT_MIN     = 5
const SAD_THRESHOLD = 30

async function run() {
  const startAt = Date.now()
  console.log(`[decay] 开始 ${new Date().toISOString()}`)

  // ── 1. 批量衰减 ────────────────────────────────────────
  // 用 MySQL JSON_SET + GREATEST 实现原子更新，无需逐行加载
  const decayResult = await prisma.$executeRaw`
    UPDATE pets
    SET stats = JSON_SET(
      stats,
      '$.satiety',
        GREATEST(${STAT_MIN}, CAST(JSON_EXTRACT(stats, '$.satiety')     AS UNSIGNED) - ${DECAY_AMOUNT}),
      '$.cleanliness',
        GREATEST(${STAT_MIN}, CAST(JSON_EXTRACT(stats, '$.cleanliness') AS UNSIGNED) - ${DECAY_AMOUNT}),
      '$.happiness',
        GREATEST(${STAT_MIN}, CAST(JSON_EXTRACT(stats, '$.happiness')   AS UNSIGNED) - ${DECAY_AMOUNT})
    ),
    last_cron_at = NOW()
  `
  console.log(`[decay] 更新了 ${decayResult} 只宠物`)

  // ── 2. 查找需要推送的宠物（happiness < 30，24h 内未推过）──
  const cutoff24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const sadPets = await prisma.pet.findMany({
    where: {
      imageStatus: 'done',   // 只推送已完成初始化的宠物
      user: { notifyEnabled: true }
    },
    include: { user: true }
  })

  let pushCount = 0
  for (const pet of sadPets) {
    const stats = parseStats(pet.stats)
    if (getMood(stats.happiness) !== 'sad') continue

    // 检查 24 小时内是否已推送过
    const recentLog = await prisma.notifyLog.findFirst({
      where: {
        petId:      pet.id,
        notifyType: 'low_stats',
        sentAt:     { gte: cutoff24h }
      }
    })
    if (recentLog) continue

    // 推送
    try {
      await sendLowStatsNotify({
        openId:    pet.user.openId,
        petName:   pet.name,
        happiness: stats.happiness
      })
      await prisma.notifyLog.create({
        data: {
          userId:        pet.userId,
          petId:         pet.id,
          notifyType:    'low_stats',
          statsSnapshot: stats
        }
      })
      pushCount++
    } catch (err) {
      // 单条推送失败不影响整体，记录日志继续
      console.warn(`[decay] 推送失败 petId=${pet.id}`, err.message)
    }
  }

  const elapsed = Date.now() - startAt
  console.log(`[decay] 完成，推送 ${pushCount} 条，耗时 ${elapsed}ms`)
}

run()
  .catch(err => {
    console.error('[decay] 执行失败', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
