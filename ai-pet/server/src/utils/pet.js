// src/utils/pet.js — 服务端宠物状态工具（与 miniprogram/utils/pet.js 保持同步）

const STAT_MIN = 5
const STAT_MAX = 100

const DAILY_LIMITS = { feed: 3, pet_action: 5, play: 2 }

const INTERACT_DELTA = {
  feed:       { satiety: 15 },
  pet_action: { cleanliness: 10, happiness: 5 },
  play:       { happiness: 20 }
}

/** 安全解析 stats JSON，缺失字段用默认值兜底（CRITICAL 修复） */
function parseStats(raw) {
  const defaults = { satiety: 100, cleanliness: 100, happiness: 100 }
  let obj = {}
  try { obj = typeof raw === 'string' ? JSON.parse(raw) : (raw || {}) } catch {}
  return {
    satiety:     clamp(obj.satiety     ?? defaults.satiety,     STAT_MIN, STAT_MAX),
    cleanliness: clamp(obj.cleanliness ?? defaults.cleanliness, STAT_MIN, STAT_MAX),
    happiness:   clamp(obj.happiness   ?? defaults.happiness,   STAT_MIN, STAT_MAX)
  }
}

/** happiness → 情绪状态 */
function getMood(happiness) {
  if (happiness >= 60) return 'happy'
  if (happiness >= 30) return 'normal'
  return 'sad'
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, Number(v) || 0)) }

module.exports = { parseStats, getMood, DAILY_LIMITS, INTERACT_DELTA, STAT_MIN, STAT_MAX }
