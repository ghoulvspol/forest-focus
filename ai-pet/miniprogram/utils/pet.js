// utils/pet.js — 宠物状态工具函数
// 职责：stats 读取/校验、情绪判断、衰减量展示

// stats 字段的合法键及默认值
// 读取时如果 JSON 缺少某字段，用默认值兜底（CRITICAL 缺口修复）
const STATS_DEFAULTS = {
  satiety:     100,
  cleanliness: 100,
  happiness:   100
}

const STAT_MIN = 5
const STAT_MAX = 100

/**
 * 安全读取 stats，缺失字段用默认值兜底
 * 防止 JSON 损坏导致前端崩溃
 * @param {object|string} raw - pets.stats 字段（可能是对象或字符串）
 * @returns {{ satiety: number, cleanliness: number, happiness: number }}
 */
function parseStats(raw) {
  let obj = {}
  try {
    obj = typeof raw === 'string' ? JSON.parse(raw) : (raw || {})
  } catch {
    console.warn('[pet] stats 解析失败，使用默认值', raw)
  }

  return {
    satiety:     clamp(obj.satiety     ?? STATS_DEFAULTS.satiety,     STAT_MIN, STAT_MAX),
    cleanliness: clamp(obj.cleanliness ?? STATS_DEFAULTS.cleanliness, STAT_MIN, STAT_MAX),
    happiness:   clamp(obj.happiness   ?? STATS_DEFAULTS.happiness,   STAT_MIN, STAT_MAX)
  }
}

/**
 * 根据 happiness 判断宠物情绪状态
 * happy  : happiness >= 60   → 开心
 * normal : happiness 30-59   → 一般
 * sad    : happiness < 30    → 难过（触发推送阈值）
 * @param {number} happiness
 * @returns {'happy'|'normal'|'sad'}
 */
function getMood(happiness) {
  if (happiness >= 60) return 'happy'
  if (happiness >= 30) return 'normal'
  return 'sad'
}

/** 情绪对应的 emoji */
const MOOD_EMOJI = {
  happy:  '😊',
  normal: '😐',
  sad:    '😢'
}

/** 情绪对应的描述文案 */
const MOOD_TEXT = {
  happy:  '心情很好～',
  normal: '有点无聊...',
  sad:    '好难受，快来陪我！'
}

/**
 * 将 stats 转换为进度条宽度百分比字符串（用于 wxss width 绑定）
 * @param {number} value - 0-100
 * @returns {string} e.g. "80%"
 */
function statToWidth(value) {
  return `${Math.round(clamp(value, STAT_MIN, STAT_MAX))}%`
}

/**
 * 每日互动上限配置
 * 超过上限后前端禁用对应按钮
 */
const DAILY_LIMITS = {
  feed:       3,   // 喂食 3 次/天
  pet_action: 5,   // 抚摸 5 次/天
  play:       2    // 玩耍 2 次/天
}

/**
 * 每次互动对 stats 的提升量
 */
const INTERACT_DELTA = {
  feed:       { satiety: 15 },
  pet_action: { cleanliness: 10, happiness: 5 },
  play:       { happiness: 20 }
}

/** 互动按钮展示配置 */
const INTERACT_CONFIG = [
  {
    type:  'feed',
    label: '喂食',
    emoji: '🍖',
    color: '#FFB347'
  },
  {
    type:  'pet_action',
    label: '抚摸',
    emoji: '🤲',
    color: '#FF8FAB'
  },
  {
    type:  'play',
    label: '玩耍',
    emoji: '🎾',
    color: '#74C0FC'
  }
]

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, Number(val) || 0))
}

module.exports = {
  parseStats,
  getMood,
  MOOD_EMOJI,
  MOOD_TEXT,
  statToWidth,
  DAILY_LIMITS,
  INTERACT_DELTA,
  INTERACT_CONFIG
}
