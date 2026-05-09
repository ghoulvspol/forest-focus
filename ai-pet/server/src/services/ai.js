// src/services/ai.js — 通义万相 AI 图像风格化
// 文档：https://help.aliyun.com/zh/dashscope/developer-reference/tongyi-wanxiang
//
// 流程：
//   原图 URL（OSS）→ DashScope API → 等待任务完成 → 返回风格化图 URL
//
// 注：通义万相是异步任务模式（提交 → 轮询），这里封装为同步感知接口
//     适合 MVP（用户数少，并发低）。TODO 1：用户量大时改为真正的异步队列

const axios = require('axios')

const DASHSCOPE_BASE = 'https://dashscope.aliyuncs.com/api/v1'
const POLL_INTERVAL  = 3000    // 3 秒轮询一次
const POLL_TIMEOUT   = 90_000  // 90 秒（768px 图生成更慢）

// ─── 风格预设 ────────────────────────────────────────────
// 中英双语 prompt：通义万相中文模型对中文 prompt 响应更好
// 关键词策略：风格词 + 质量词 + 背景词 + 物种词由调用处追加
// 风格参考：超萌真实感（蓬松毛发+圆眼睛+笑脸+纯白背景）
// 参见用户提供的参考图：fluffy Pomeranian hyper-cute photo style
const STYLE_PRESETS = [
  {
    style: 'fluffy',
    label: '超萌写真',
    prompt: [
      // 核心：极蓬松+圆滚滚+大圆眼+笑脸，对标参考图风格
      '极其蓬松毛茸茸的圆球形宠物，超可爱大圆黑眼睛，开心微笑嘴巴微张，',
      '身体圆润饱满像棉花球，毛发雪白蓬松立体，治愈系超萌写真风格，',
      '纯白色干净背景，专业摄影棚光线，超高清细节，',
      'ultra fluffy round cotton ball shaped cute pet, big round black eyes, happy smiling open mouth, ',
      'extremely puffy white fur with 3D texture, adorable chubby body, pure white studio background, ',
      'professional pet photography, hyperrealistic cute, high quality, 8K detail'
    ].join('')
  },
  {
    style: 'cartoon',
    label: 'Q版卡通',
    prompt: [
      '日系Q版卡通萌宠，超大圆眼睛闪亮水汪汪，圆润胖乎乎的身体，',
      '毛茸茸蓬松可爱，温暖奶油色调，开心表情，纯白背景，',
      '精致卡通插画风，Line Friends风格，高质量，',
      'Japanese chibi kawaii cartoon cute pet, huge sparkling round eyes, chubby fluffy round body, ',
      'cream pastel colors, happy expression, pure white background, Line Friends style, ',
      'high quality cartoon illustration, masterpiece'
    ].join('')
  },
  {
    style: 'plush',
    label: '毛绒玩具',
    prompt: [
      '毛绒玩具风格萌宠，像极了真实的毛绒公仔，超蓬松柔软的毛发，',
      '圆润立体造型，大大的圆眼睛，粉嫩温柔配色，奶油白色调，',
      '纯白背景，3D渲染质感，精致细腻，',
      'plush toy style cute pet, soft fluffy stuffed animal look, round 3D form, ',
      'big round button eyes, cream white and pink tones, pure white background, ',
      '3D render quality, ultra detailed, adorable kawaii plushie'
    ].join('')
  }
]

/**
 * 对一张宠物图片生成三种风格的数字分身
 * @param {string} imageUrl  - OSS 原图 URL（需公网可访问）
 * @param {string} species   - 'cat' | 'dog' | 'other'
 * @returns {Array<{ style, label, url }>}  三种风格结果
 */
async function generateStyles(imageUrl, species) {
  // 中文物种词让模型更好理解主体
  const speciesZh = species === 'cat' ? '猫咪' : species === 'dog' ? '狗狗' : '小动物'
  const speciesEn = species === 'cat' ? 'cat' : species === 'dog' ? 'dog' : 'animal'

  // 串行提交三种风格任务（避免触发 DashScope 并发限流）
  const tasks = []
  for (const preset of STYLE_PRESETS) {
    const prompt = `${speciesZh}，${preset.prompt}, ${speciesEn}`
    tasks.push(await _submitTask(imageUrl, prompt))
    await _sleep(600)  // 每次提交间隔 600ms
  }

  // 轮询等待所有任务完成
  const results = await Promise.all(
    tasks.map((taskId, i) => _pollTask(taskId, STYLE_PRESETS[i]))
  )

  return results  // [{ style, label, url }, ...]
}

/**
 * 提交风格化任务，返回 task_id
 * 模型：wanx2.1-imageedit，function: stylization_all
 */
async function _submitTask(imageUrl, prompt) {
  const { data } = await axios.post(
    `${DASHSCOPE_BASE}/services/aigc/image2image/image-synthesis`,
    {
      model: 'wanx2.1-imageedit',
      input: {
        function:       'stylization_all',
        base_image_url: imageUrl,
        prompt
      },
      parameters: { n: 1, size: '768*768' }
    },
    {
      headers: {
        Authorization:       `Bearer ${process.env.DASHSCOPE_API_KEY}`,
        'X-DashScope-Async': 'enable'
      },
      timeout: 15_000
    }
  )

  if (!data.output?.task_id) {
    throw new Error(`AI 任务提交失败: ${data.message || JSON.stringify(data)}`)
  }
  return data.output.task_id
}

/**
 * 轮询任务状态直到完成或超时
 */
async function _pollTask(taskId, preset) {
  const deadline = Date.now() + POLL_TIMEOUT

  while (Date.now() < deadline) {
    await _sleep(POLL_INTERVAL)

    const { data } = await axios.get(
      `${DASHSCOPE_BASE}/tasks/${taskId}`,
      {
        headers: { Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}` },
        timeout: 10_000
      }
    )

    const status = data.output?.task_status
    if (status === 'SUCCEEDED') {
      const url = data.output?.results?.[0]?.url
      if (!url) throw new Error(`AI 任务完成但无图片 URL (taskId=${taskId})`)
      return { style: preset.style, label: preset.label, url }
    }
    if (status === 'FAILED') {
      throw new Error(`AI 任务失败 (taskId=${taskId}): ${data.output?.message}`)
    }
    // PENDING / RUNNING → 继续轮询
  }

  throw new Error(`AI 任务超时 (taskId=${taskId})`)
}

function _sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = { generateStyles, STYLE_PRESETS }
