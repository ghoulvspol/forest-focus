// src/services/oss.js — 阿里云 OSS 文件存储
// 职责：上传原图、上传 AI 风格化结果

const OSS  = require('ali-oss')
const path = require('path')
const fs   = require('fs')

function getClient() {
  return new OSS({
    region:          process.env.OSS_REGION,
    bucket:          process.env.OSS_BUCKET,
    accessKeyId:     process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
    timeout:         30_000
  })
}

/**
 * 上传本地文件到 OSS
 * OSS key 规则：{userId}/{petId}/{filename}
 * @param {string} localPath   - 服务器本地文件路径
 * @param {string} ossKey      - OSS 对象路径，如 "42/88/original.jpg"
 * @returns {string}           - CDN 访问 URL
 */
async function uploadFile(localPath, ossKey) {
  const client = getClient()
  try {
    await client.put(ossKey, localPath)
    return `${process.env.OSS_CDN_BASE}/${ossKey}`
  } finally {
    // 上传完成后删除服务器临时文件（无论成功与否）
    try { fs.unlinkSync(localPath) } catch {}
  }
}

/**
 * 将 Buffer（AI 返回的图像数据）上传到 OSS
 * @param {Buffer} buffer
 * @param {string} ossKey
 * @returns {string} CDN URL
 */
async function uploadBuffer(buffer, ossKey) {
  const client = getClient()
  await client.put(ossKey, buffer)
  return `${process.env.OSS_CDN_BASE}/${ossKey}`
}

/**
 * 删除 OSS 对象（用于 AI 失败时清理已上传的原图）
 * @param {string} ossKey
 */
async function deleteFile(ossKey) {
  try {
    await getClient().delete(ossKey)
  } catch (err) {
    console.warn('[oss] 删除失败（可忽略）', ossKey, err.message)
  }
}

module.exports = { uploadFile, uploadBuffer, deleteFile }
